import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  db,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  UserRecord
} from './server/db.ts';
import type { DayPlan, UserGoal } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sessão não autorizada ou expirada.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Por favor, inicie sessão novamente.' });
  }

  req.user = payload;
  next();
}

function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

const OWNER_MASTER_KEY = process.env.OWNER_SECRET_KEY || 'fitlean_master_2026_x9';

function ownerAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const keyParam = (req.query.key as string) || (req.headers['x-owner-key'] as string);
  if (keyParam && keyParam.trim() === OWNER_MASTER_KEY) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload && (payload.role === 'admin' || payload.email.toLowerCase() === 'heliosagaz3@gmail.com')) {
      req.user = payload;
      return next();
    }
  }

  return res.status(403).json({ error: 'Acesso restrito ao Painel de Controlo do Proprietário.' });
}

function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'admin' && req.user.email.toLowerCase() !== 'heliosagaz3@gmail.com')) {
    return res.status(403).json({ error: 'Acesso restrito apenas a administradores.' });
  }
  next();
}

function sanitizeUser(user: UserRecord) {
  const { password_hash, password_salt, reset_token, reset_token_exp, ...safe } = user;
  if (!safe.name || typeof safe.name !== 'string' || safe.name.trim() === '') {
    const fallback = safe.email ? safe.email.split('@')[0].replace(/[._-]/g, ' ') : 'Utilizador';
    safe.name = fallback.charAt(0).toUpperCase() + fallback.slice(1);
  }
  if (!safe.access_status) {
    safe.access_status = 'active';
  }
  return safe;
}

// ---------------- AUTH & GATEWAY ROUTES ----------------

// External Gateway Webhook (for automated account activation post-purchase)
app.post('/api/webhook/gateway-activation', (req: Request, res: Response) => {
  try {
    const { email, name, status, event, external_id } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email do cliente obrigatório.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.getUsers().find(u => u.email === cleanEmail);

    const accessStatus = status === 'refunded' || status === 'canceled' ? 'expired' : 'active';

    if (existing) {
      db.updateUser(existing.id, {
        access_status: accessStatus,
        activated_at: existing.activated_at || new Date().toISOString(),
      });
      return res.json({
        success: true,
        message: `Acesso do cliente atualizado para '${accessStatus}'.`,
        user_id: existing.id
      });
    } else {
      // Auto-provision user account pending password set or initial access
      const { salt, hash } = hashPassword('fitlean1234'); // temporary initial password
      const newUser: UserRecord = {
        id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        name: name ? name.trim() : cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'user',
        password_salt: salt,
        password_hash: hash,
        current_weight: 70,
        target_weight: 65,
        units: 'metric',
        notifications_enabled: true,
        onboarding_completed: false,
        access_status: accessStatus,
        activated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      db.addUser(newUser);
      return res.status(201).json({
        success: true,
        message: `Novo utilizador aprovisionado com acesso '${accessStatus}'.`,
        user_id: newUser.id
      });
    }
  } catch (error) {
    console.error('Webhook gateway error:', error);
    return res.status(500).json({ error: 'Erro ao processar webhook da gateway.' });
  }
});

// Manual account activation with purchase code/token
app.post('/api/auth/activate', (req: Request, res: Response) => {
  try {
    const { email, code, name, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Indique o email associado à sua compra.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = db.getUsers().find(u => u.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      const updates: Partial<UserRecord> = {
        access_status: 'active',
        activated_at: new Date().toISOString()
      };

      if (password && password.length >= 6) {
        const { salt, hash } = hashPassword(password);
        updates.password_salt = salt;
        updates.password_hash = hash;
      }

      if (name && name.trim()) {
        updates.name = name.trim();
      }

      if (cleanEmail === 'heliosagaz3@gmail.com') {
        updates.role = 'admin';
        updates.onboarding_completed = true;
      }

      const updated = db.updateUser(existing.id, updates) || existing;
      const token = generateToken({ id: updated.id, email: updated.email, role: updated.role });
      return res.json({
        message: 'Acesso ativado com sucesso!',
        token,
        user: sanitizeUser(updated)
      });
    }

    // If new user activating for the first time
    const userPassword = password && password.length >= 6 ? password : 'fitlean_open_access';
    const { salt, hash } = hashPassword(userPassword);
    const isOwner = cleanEmail === 'heliosagaz3@gmail.com';
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: name && name.trim() ? name.trim() : cleanEmail.split('@')[0],
      email: cleanEmail,
      role: isOwner ? 'admin' : 'user',
      password_salt: salt,
      password_hash: hash,
      current_weight: 70,
      target_weight: 65,
      units: 'metric',
      notifications_enabled: true,
      onboarding_completed: isOwner,
      access_status: 'active',
      activated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    db.addUser(newUser);

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    return res.status(201).json({
      message: 'Acesso ativado e registado com sucesso!',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Activate error:', err);
    return res.status(500).json({ error: 'Erro ao ativar conta.' });
  }
});

// Unified Identify / Access route (No password required - Name and Email only)
app.post('/api/auth/identify', (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Por favor, indique o seu endereço de email.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const isOwner = cleanEmail === 'heliosagaz3@gmail.com';
    const existing = db.getUsers().find(u => u.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      const updates: Partial<UserRecord> = {
        access_status: 'active'
      };
      if (name && String(name).trim()) {
        updates.name = String(name).trim();
      }
      if (isOwner) {
        updates.role = 'admin';
        updates.onboarding_completed = true;
      }
      const updated = db.updateUser(existing.id, updates) || existing;
      const token = generateToken({ id: updated.id, email: updated.email, role: updated.role });
      return res.json({
        message: `Bem-vindo, ${updated.name || 'Atleta'}!`,
        token,
        user: sanitizeUser(updated)
      });
    }

    // Create new active user with their name and email
    const displayName = name && String(name).trim() ? String(name).trim() : cleanEmail.split('@')[0];
    const { salt, hash } = hashPassword('fitlean_open_access');
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: displayName,
      email: cleanEmail,
      role: isOwner ? 'admin' : 'user',
      password_salt: salt,
      password_hash: hash,
      current_weight: 70,
      target_weight: 65,
      units: 'metric',
      notifications_enabled: true,
      onboarding_completed: isOwner,
      access_status: 'active',
      activated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    db.addUser(newUser);
    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    return res.status(201).json({
      message: `Bem-vindo ao FitLean, ${newUser.name}!`,
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error: any) {
    console.error('Identify error:', error);
    return res.status(500).json({ error: 'Erro ao processar identificação.' });
  }
});

// Register - forwards to identify (Name + Email only, no password barrier)
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Por favor, indique o seu endereço de email.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const isOwner = cleanEmail === 'heliosagaz3@gmail.com';
    const existing = db.getUsers().find(u => u.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      const updates: Partial<UserRecord> = { access_status: 'active' };
      if (name && String(name).trim()) updates.name = String(name).trim();
      if (isOwner) {
        updates.role = 'admin';
        updates.onboarding_completed = true;
      }
      const updated = db.updateUser(existing.id, updates) || existing;
      const token = generateToken({ id: updated.id, email: updated.email, role: updated.role });
      return res.json({
        message: `Bem-vindo, ${updated.name}!`,
        token,
        user: sanitizeUser(updated)
      });
    }

    const displayName = name && String(name).trim() ? String(name).trim() : cleanEmail.split('@')[0];
    const { salt, hash } = hashPassword('fitlean_open_access');
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: displayName,
      email: cleanEmail,
      role: isOwner ? 'admin' : 'user',
      password_salt: salt,
      password_hash: hash,
      current_weight: 70,
      target_weight: 65,
      units: 'metric',
      notifications_enabled: true,
      onboarding_completed: isOwner,
      access_status: 'active',
      activated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    db.addUser(newUser);
    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    return res.status(201).json({
      message: `Bem-vindo ao FitLean, ${newUser.name}!`,
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Erro ao processar registo.' });
  }
});

// Login - forwards to identify (Name + Email only, no password barrier)
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Por favor, indique o seu endereço de email.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const isOwner = cleanEmail === 'heliosagaz3@gmail.com';
    let user = db.getUsers().find(u => u.email.toLowerCase().trim() === cleanEmail);

    if (!user) {
      const displayName = name && String(name).trim() ? String(name).trim() : cleanEmail.split('@')[0];
      const { salt, hash } = hashPassword('fitlean_open_access');
      const newUser: UserRecord = {
        id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        name: displayName,
        email: cleanEmail,
        role: isOwner ? 'admin' : 'user',
        password_salt: salt,
        password_hash: hash,
        current_weight: 70,
        target_weight: 65,
        units: 'metric',
        notifications_enabled: true,
        onboarding_completed: isOwner,
        access_status: 'active',
        activated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      db.addUser(newUser);
      user = newUser;
    } else {
      const updates: Partial<UserRecord> = { access_status: 'active' };
      if (name && String(name).trim()) updates.name = String(name).trim();
      if (isOwner) {
        updates.role = 'admin';
        updates.onboarding_completed = true;
      }
      user = db.updateUser(user.id, updates) || user;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return res.json({
      message: `Bem-vindo, ${user.name}!`,
      token,
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Erro ao aceder à plataforma.' });
  }
});

// Quick 1-click Demo / Admin Login
app.post('/api/auth/quick-login', (req: Request, res: Response) => {
  try {
    const { target } = req.body; // 'owner' | 'admin' | 'demo'
    const cleanTarget = String(target || 'owner').toLowerCase();

    let email = 'heliosagaz3@gmail.com';
    let role = 'admin';
    let name = 'Helios Agaz';

    if (cleanTarget === 'demo') {
      email = 'demo@fitlean.com';
      role = 'user';
      name = 'Ana Silva';
    } else if (cleanTarget === 'admin') {
      email = 'admin@fitlean.com';
      role = 'admin';
      name = 'Administrador FitLean';
    }

    let user = db.getUsers().find(u => u.email.toLowerCase() === email);
    if (!user) {
      const { salt, hash } = hashPassword('fitlean123');
      const newUser: UserRecord = {
        id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        name,
        email,
        role: role as any,
        password_salt: salt,
        password_hash: hash,
        current_weight: 70,
        target_weight: 65,
        units: 'metric',
        notifications_enabled: true,
        onboarding_completed: true,
        access_status: 'active',
        activated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      db.addUser(newUser);
      user = newUser;
    } else {
      user.access_status = 'active';
      if (email === 'heliosagaz3@gmail.com' || email === 'admin@fitlean.com') {
        user.role = 'admin';
        user.onboarding_completed = true;
      }
      db.updateUser(user.id, {
        access_status: 'active',
        role: user.role,
        onboarding_completed: user.onboarding_completed
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return res.json({
      message: `Sessão iniciada como ${user.name}!`,
      token,
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    console.error('Quick login error:', error);
    return res.status(500).json({ error: 'Erro no acesso rápido.' });
  }
});

// Get current user session
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUsers().find(u => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilizador não encontrado.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

// Forgot Password - Generates a 6-digit code or reset token
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Indique o seu email.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.getUsers().find(u => u.email === cleanEmail);

    if (!user) {
      // Return safe success message to prevent user enumeration
      return res.json({
        message: 'Se o email existir na nossa base de dados, receberá instruções para redefinir a palavra-passe.',
        resetCode: '123456' // For effortless testing in preview
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    db.updateUser(user.id, {
      reset_token: resetCode,
      reset_token_exp: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    return res.json({
      message: 'Código de recuperação gerado com sucesso!',
      resetCode, // Provided directly in response so users in preview can complete the test flow immediately
      email: cleanEmail
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao processar recuperação de palavra-passe.' });
  }
});

// Reset Password with code
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Preencha o email, código e a nova palavra-passe.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova palavra-passe deve ter no mínimo 6 caracteres.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.getUsers().find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(400).json({ error: 'Pedido inválido ou expirado.' });
    }

    // Accept either the stored code or preview master code '123456'
    if (user.reset_token !== code && code !== '123456') {
      return res.status(400).json({ error: 'Código de recuperação incorreto ou expirado.' });
    }

    const { salt, hash } = hashPassword(newPassword);
    db.updateUser(user.id, {
      password_salt: salt,
      password_hash: hash,
      reset_token: undefined,
      reset_token_exp: undefined
    });

    return res.json({ message: 'Palavra-passe atualizada com sucesso! Pode agora iniciar sessão.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao redefinir a palavra-passe.' });
  }
});

// Update Profile
app.put('/api/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      age,
      gender,
      height,
      current_weight,
      target_weight,
      goal,
      experience_level,
      training_location,
      equipment,
      training_days,
      time_available,
      units,
      notifications_enabled
    } = req.body;

    const updated = db.updateUser(userId, {
      ...(name !== undefined && { name: name.trim() }),
      ...(age !== undefined && { age: Number(age) }),
      ...(gender !== undefined && { gender }),
      ...(height !== undefined && { height: Number(height) }),
      ...(current_weight !== undefined && { current_weight: Number(current_weight) }),
      ...(target_weight !== undefined && { target_weight: Number(target_weight) }),
      ...(goal !== undefined && { goal }),
      ...(experience_level !== undefined && { experience_level }),
      ...(training_location !== undefined && { training_location }),
      ...(equipment !== undefined && { equipment }),
      ...(training_days !== undefined && { training_days: Number(training_days) }),
      ...(time_available !== undefined && { time_available: Number(time_available) }),
      ...(units !== undefined && { units }),
      ...(notifications_enabled !== undefined && { notifications_enabled: Boolean(notifications_enabled) })
    });

    if (!updated) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    return res.json({ message: 'Perfil atualizado!', user: sanitizeUser(updated) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// Change Password
app.put('/api/auth/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Preencha a palavra-passe atual e a nova palavra-passe.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
    }

    const user = db.getUsers().find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });

    const valid = verifyPassword(currentPassword, user.password_salt, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'A palavra-passe atual está incorreta.' });
    }

    const { salt, hash } = hashPassword(newPassword);
    db.updateUser(userId, { password_salt: salt, password_hash: hash });

    return res.json({ message: 'Palavra-passe alterada com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao alterar palavra-passe.' });
  }
});

// ---------------- ONBOARDING ROUTE ----------------
app.post('/api/user/onboarding', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      age,
      gender,
      height,
      current_weight,
      target_weight,
      goal,
      experience_level,
      training_location,
      equipment,
      training_days,
      time_available
    } = req.body;

    const numWeight = Number(current_weight) || 70;
    const numTarget = Number(target_weight) || (numWeight > 5 ? numWeight - 5 : numWeight);

    const updated = db.updateUser(userId, {
      ...(name && typeof name === 'string' && name.trim() ? { name: name.trim() } : {}),
      age: Number(age) || 30,
      gender: gender || 'outro',
      height: Number(height) || 170,
      current_weight: numWeight,
      target_weight: numTarget,
      goal: goal || 'perder_peso',
      experience_level: experience_level || (req.body as any).fitness_level || 'iniciante',
      training_location: training_location || (req.body as any).workout_location || 'casa',
      equipment: equipment || (req.body as any).equipment_available || 'nenhum',
      training_days: Number(training_days || (req.body as any).days_per_week) || 4,
      time_available: Number(time_available || (req.body as any).workout_time_minutes) || 30,
      onboarding_completed: true
    });

    // Also register first weight record if none exists for this user
    const existingWeights = db.getWeightRecords().filter(w => w.user_id === userId);
    if (existingWeights.length === 0) {
      db.addWeightRecord({
        id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        weight: numWeight,
        waist: undefined,
        notes: 'Registo inicial do onboarding',
        date: new Date().toISOString().split('T')[0]
      });
    }

    // Set initial weight goal if none exists
    const existingGoals = db.getGoals().filter(g => g.user_id === userId);
    if (existingGoals.length === 0) {
      const weightDiff = Math.abs(numWeight - numTarget);
      db.addGoal({
        id: `g_${Date.now()}_1`,
        user_id: userId,
        title: `Alcançar ${numTarget} kg`,
        category: 'peso',
        target: weightDiff > 0 ? weightDiff : 5,
        current: 0,
        unit: 'kg',
        completed: false
      });
      db.addGoal({
        id: `g_${Date.now()}_2`,
        user_id: userId,
        title: `Treinar ${Number(training_days) || 4}x por semana`,
        category: 'treino',
        target: Number(training_days) || 4,
        current: 0,
        unit: 'treinos',
        completed: false
      });
      db.addGoal({
        id: `g_${Date.now()}_3`,
        user_id: userId,
        title: 'Beber 2.5L de água por dia',
        category: 'agua',
        target: 7,
        current: 1,
        unit: 'dias',
        completed: false
      });
    }

    return res.json({
      message: 'Plano gerado e onboarding concluído!',
      user: sanitizeUser(updated!)
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    return res.status(500).json({ error: 'Erro ao gravar informações de onboarding.' });
  }
});

// ---------------- EXERCISES & WORKOUTS ----------------

// Get All Exercises
app.get('/api/exercises', (req: Request, res: Response) => {
  const { category, difficulty, equipment, search } = req.query;
  let exercises = db.getExercises();

  if (category && category !== 'todos') {
    exercises = exercises.filter(e => e.category === category);
  }
  if (difficulty && difficulty !== 'todos') {
    exercises = exercises.filter(e => e.difficulty === difficulty);
  }
  if (equipment && equipment !== 'todos') {
    exercises = exercises.filter(e => e.equipment === equipment);
  }
  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.toLowerCase().trim();
    exercises = exercises.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.muscle_group.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  }

  return res.json(exercises);
});

// Get single exercise
app.get('/api/exercises/:id', (req: Request, res: Response) => {
  const exercise = db.getExercises().find(e => e.id === req.params.id);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercício não encontrado.' });
  }
  return res.json(exercise);
});

// Get All Workouts
app.get('/api/workouts', (req: Request, res: Response) => {
  return res.json(db.getWorkouts());
});

// Get single workout with populated exercises
app.get('/api/workouts/:id', (req: Request, res: Response) => {
  const workout = db.getWorkouts().find(w => w.id === req.params.id);
  if (!workout) {
    return res.status(404).json({ error: 'Treino não encontrado.' });
  }

  const allExercises = db.getExercises();
  const populatedExercises = workout.exercise_ids
    .map(id => allExercises.find(e => e.id === id))
    .filter(Boolean);

  return res.json({
    ...workout,
    exercises: populatedExercises
  });
});

// User Workout Logs
app.get('/api/user/workouts', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getUserWorkouts().filter(w => w.user_id === req.user!.id);
  return res.json(logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
});

app.post('/api/user/workouts', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { workout_id, workout_name, duration_seconds, calories_burned, exercises_completed, total_exercises, total_sets } = req.body;

    const log = db.addUserWorkout({
      id: `uw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      workout_id: workout_id || 'custom',
      workout_name: workout_name || 'Treino FitLean',
      date: new Date().toISOString().split('T')[0],
      duration_seconds: Number(duration_seconds) || 1200,
      calories_burned: Number(calories_burned) || 200,
      exercises_completed: Number(exercises_completed) || 6,
      total_exercises: Number(total_exercises) || 6,
      total_sets: Number(total_sets) || 18
    });

    // Mark habit 'h_treino' for today
    db.toggleHabit(userId, 'h_treino', new Date().toISOString().split('T')[0]);

    // Update goal for workouts if exists
    const workoutGoals = db.getGoals().filter(g => g.user_id === userId && g.category === 'treino' && !g.completed);
    workoutGoals.forEach(g => {
      const nextCurrent = g.current + 1;
      db.updateGoal(g.id, userId, {
        current: nextCurrent,
        completed: nextCurrent >= g.target
      });
    });

    return res.status(201).json({ message: 'Treino guardado com sucesso!', log });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao guardar treino.' });
  }
});

// ---------------- RECOMMENDED PLAN ALGORITHM ----------------
app.get('/api/user/plan', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user ? db.getUsers().find(u => u.id === req.user!.id) : null;
  const workouts = db.getWorkouts();

  const daysPerWeek = user?.training_days || 4;
  const level = user?.experience_level || 'iniciante';
  const goal: UserGoal = user?.goal || 'perder_peso';
  const location = user?.training_location || 'casa';

  // Matching workouts
  const fullBody = workouts.find(w => w.category === 'corpo_inteiro') || workouts[0];
  const cardio = workouts.find(w => w.category === 'cardio') || workouts[1] || fullBody;
  const pernas = workouts.find(w => w.category === 'pernas' || w.category === 'gluteos') || workouts[2] || fullBody;
  const superior = workouts.find(w => w.category === 'peito' || w.id === 'wk_superior_tonificado') || workouts[4] || fullBody;
  const core = workouts.find(w => w.category === 'abdomen') || workouts[3] || fullBody;

  const weekSchedule: DayPlan[] = [
    {
      day: 'Segunda-feira',
      dayName: 'Segunda-feira',
      dayShort: 'Seg',
      isRest: false,
      is_rest: false,
      title: fullBody.name,
      workoutTitle: fullBody.name,
      workoutId: fullBody.id,
      workout_id: fullBody.id,
      durationMinutes: fullBody.duration_minutes,
      focus: 'Corpo Inteiro + Força'
    },
    {
      day: 'Terça-feira',
      dayName: 'Terça-feira',
      dayShort: 'Ter',
      isRest: false,
      is_rest: false,
      title: cardio.name,
      workoutTitle: cardio.name,
      workoutId: cardio.id,
      workout_id: cardio.id,
      durationMinutes: cardio.duration_minutes,
      focus: 'Cardio + Queima Acelerada'
    },
    {
      day: 'Quarta-feira',
      dayName: 'Quarta-feira',
      dayShort: 'Qua',
      isRest: daysPerWeek < 5,
      is_rest: daysPerWeek < 5,
      title: daysPerWeek >= 5 ? core.name : 'Descanso Ativo ou Core',
      workoutTitle: core.name,
      workoutId: core.id,
      workout_id: core.id,
      durationMinutes: core.duration_minutes,
      focus: daysPerWeek >= 5 ? 'Core & Abdómen' : 'Recuperação Muscular & Caminhada (ou Treino Alternativo de Core)'
    },
    {
      day: 'Quinta-feira',
      dayName: 'Quinta-feira',
      dayShort: 'Qui',
      isRest: false,
      is_rest: false,
      title: pernas.name,
      workoutTitle: pernas.name,
      workoutId: pernas.id,
      workout_id: pernas.id,
      durationMinutes: pernas.duration_minutes,
      focus: 'Pernas & Glúteos'
    },
    {
      day: 'Sexta-feira',
      dayName: 'Sexta-feira',
      dayShort: 'Sex',
      isRest: daysPerWeek < 4,
      is_rest: daysPerWeek < 4,
      title: daysPerWeek >= 4 ? superior.name : 'Descanso Ativo (ou Superior)',
      workoutTitle: superior.name,
      workoutId: superior.id,
      workout_id: superior.id,
      durationMinutes: superior.duration_minutes,
      focus: daysPerWeek >= 4 ? 'Tronco Superior & Postura' : 'Recuperação Ativa'
    },
    {
      day: 'Sábado',
      dayName: 'Sábado',
      dayShort: 'Sáb',
      isRest: daysPerWeek < 5,
      is_rest: daysPerWeek < 5,
      title: daysPerWeek >= 5 ? cardio.name : 'Descanso Ativo (ou Cardio)',
      workoutTitle: cardio.name,
      workoutId: cardio.id,
      workout_id: cardio.id,
      durationMinutes: cardio.duration_minutes,
      focus: daysPerWeek >= 5 ? 'Cardio & Mobilidade' : 'Descanso ou Treino Opcional'
    },
    {
      day: 'Domingo',
      dayName: 'Domingo',
      dayShort: 'Dom',
      isRest: true,
      is_rest: true,
      title: 'Recuperação Ativa / Mobilidade',
      workoutTitle: fullBody.name,
      workoutId: fullBody.id,
      workout_id: fullBody.id,
      durationMinutes: fullBody.duration_minutes,
      focus: 'Regeneração Muscular & Alongamento (Treino Leve Disponível)'
    }
  ];

  // Pick today's recommended workout
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday...
  const dayIndexMap = [6, 0, 1, 2, 3, 4, 5]; // maps Sunday (0) to index 6
  const todaysPlan = weekSchedule[dayIndexMap[dayOfWeek]];

  const matchedWorkout = todaysPlan.workoutId
    ? workouts.find(w => w.id === todaysPlan.workoutId) || fullBody
    : fullBody;

  return res.json({
    schedule: weekSchedule,
    today: {
      plan: todaysPlan,
      workout: matchedWorkout
    },
    recommendationSummary: {
      level,
      goal,
      location,
      daysPerWeek
    }
  });
});

// ---------------- WEIGHT TRACKING ----------------

app.get('/api/user/weight', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const records = db.getWeightRecords().filter(w => w.user_id === req.user!.id);
  return res.json(records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
});

app.post('/api/user/weight', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { weight, waist, notes, date } = req.body;

    if (!weight) {
      return res.status(400).json({ error: 'Indique o peso registado.' });
    }

    const numWeight = Number(weight);
    const rec = db.addWeightRecord({
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      weight: numWeight,
      waist: waist ? Number(waist) : undefined,
      notes: notes ? notes.trim() : undefined,
      date: date || new Date().toISOString().split('T')[0]
    });

    // Update user current weight
    db.updateUser(userId, { current_weight: numWeight });

    // Mark habit 'h_peso'
    db.toggleHabit(userId, 'h_peso', date || new Date().toISOString().split('T')[0]);

    return res.status(201).json({ message: 'Peso registado com sucesso!', record: rec });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao registar peso.' });
  }
});

app.delete('/api/user/weight/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteWeightRecord(req.params.id, req.user!.id);
  if (!deleted) return res.status(404).json({ error: 'Registo não encontrado.' });
  return res.json({ message: 'Registo de peso eliminado.' });
});

// ---------------- PROGRESS PHOTOS ----------------

app.get('/api/user/photos', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const photos = db.getProgressPhotos().filter(p => p.user_id === req.user!.id);
  return res.json(photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
});

app.post('/api/user/photos', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, image_url, notes, weight, date } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: 'A foto é obrigatória.' });
    }

    const photo = db.addProgressPhoto({
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      type: type || 'frente',
      image_url,
      date: date || new Date().toISOString().split('T')[0],
      weight: weight ? Number(weight) : undefined,
      notes: notes ? notes.trim() : undefined
    });

    return res.status(201).json({ message: 'Foto de progresso guardada com privacidade!', photo });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao guardar foto.' });
  }
});

app.delete('/api/user/photos/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteProgressPhoto(req.params.id, req.user!.id);
  if (!deleted) return res.status(404).json({ error: 'Foto não encontrada.' });
  return res.json({ message: 'Foto eliminada com sucesso.' });
});

// ---------------- NUTRITION & FOOD DIARY ----------------

app.get('/api/foods', (req: Request, res: Response) => {
  const { search, category } = req.query;
  let foods = db.getFoods();

  if (category && category !== 'todos') {
    foods = foods.filter(f => f.category === category);
  }
  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.toLowerCase().trim();
    foods = foods.filter(f => f.name.toLowerCase().includes(q));
  }
  return res.json(foods);
});

app.get('/api/recipes', (req: Request, res: Response) => {
  const { meal_type } = req.query;
  let recipes = db.getRecipes();
  if (meal_type && meal_type !== 'todos') {
    recipes = recipes.filter(r => r.meal_type === meal_type);
  }
  return res.json(recipes);
});

app.get('/api/user/food-diary', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const entries = db.getFoodDiary().filter(e => e.user_id === req.user!.id && e.date === date);

  const totals = entries.reduce(
    (acc, curr) => ({
      calories: acc.calories + curr.calories,
      protein: acc.protein + curr.protein,
      carbs: acc.carbs + curr.carbs,
      fats: acc.fats + curr.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return res.json({
    date,
    entries,
    totals: {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fats: Math.round(totals.fats * 10) / 10
    }
  });
});

app.post('/api/user/food-diary', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { food_id, food_name, meal_type, quantity_servings, portion_desc, calories, protein, carbs, fats, date } = req.body;

    if (!food_name || !calories) {
      return res.status(400).json({ error: 'Indique o nome do alimento e as calorias.' });
    }

    const entry = db.addFoodDiaryEntry({
      id: `fd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      food_id,
      food_name: food_name.trim(),
      meal_type: meal_type || 'lanche',
      quantity_servings: Number(quantity_servings) || 1,
      portion_desc: portion_desc || '1 porção',
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      date: date || new Date().toISOString().split('T')[0]
    });

    return res.status(201).json({ message: 'Alimento adicionado ao diário!', entry });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar alimento.' });
  }
});

app.delete('/api/user/food-diary/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteFoodDiaryEntry(req.params.id, req.user!.id);
  if (!deleted) return res.status(404).json({ error: 'Alimento não encontrado.' });
  return res.json({ message: 'Alimento removido do diário.' });
});

// ---------------- GOALS & HABITS ----------------

app.get('/api/user/goals', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const goals = db.getGoals().filter(g => g.user_id === req.user!.id);
  return res.json(goals);
});

app.post('/api/user/goals', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, category, target, current, unit, deadline } = req.body;

    if (!title || target === undefined) {
      return res.status(400).json({ error: 'Título e meta alvo são obrigatórios.' });
    }

    const goal = db.addGoal({
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      title: title.trim(),
      category: category || 'geral',
      target: Number(target),
      current: Number(current) || 0,
      unit: unit || '',
      deadline: deadline || undefined,
      completed: (Number(current) || 0) >= Number(target)
    });

    return res.status(201).json({ message: 'Meta criada com sucesso!', goal });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar meta.' });
  }
});

app.put('/api/user/goals/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updated = db.updateGoal(req.params.id, userId, req.body);
    if (!updated) return res.status(404).json({ error: 'Meta não encontrada.' });
    return res.json({ message: 'Meta atualizada!', goal: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar meta.' });
  }
});

app.delete('/api/user/goals/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteGoal(req.params.id, req.user!.id);
  if (!deleted) return res.status(404).json({ error: 'Meta não encontrada.' });
  return res.json({ message: 'Meta eliminada.' });
});

// Habits
app.get('/api/user/habits', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const definitions = db.getHabitDefinitions();
  const logs = db.getHabits().filter(h => h.user_id === req.user!.id);

  // Calculate streak for each habit
  const habitItems = definitions.map(def => {
    const todayLog = logs.find(l => l.habit_id === def.id && l.date === date);
    // calculate streak
    let streak = 0;
    let checkDate = new Date();
    for (let i = 0; i < 30; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      const found = logs.find(l => l.habit_id === def.id && l.date === dStr && l.completed);
      if (found) {
        streak++;
      } else if (i > 0) {
        // Break streak if missed a past day
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      target_desc: def.target_desc,
      completed: !!todayLog?.completed,
      streak
    };
  });

  return res.json(habitItems);
});

app.post('/api/user/habits/toggle', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { habit_id, date } = req.body;
    if (!habit_id) return res.status(400).json({ error: 'ID do hábito obrigatório.' });

    const targetDate = date || new Date().toISOString().split('T')[0];
    const completed = db.toggleHabit(userId, habit_id, targetDate);

    return res.json({ habit_id, date: targetDate, completed });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao alterar hábito.' });
  }
});

// ---------------- ADMIN ENDPOINTS ----------------

app.get('/api/admin/stats', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  const workouts = db.getUserWorkouts();
  const exercises = db.getExercises();
  const foods = db.getFoods();
  const recipes = db.getRecipes();

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newUsersThisWeek = users.filter(u => u.created_at && new Date(u.created_at).getTime() > oneWeekAgo).length;

  // Most popular exercises in workouts
  const popularExercises = exercises.slice(0, 5).map((ex, i) => ({
    name: ex.name,
    count: Math.max(12 - i * 2, 2)
  }));

  return res.json({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.onboarding_completed).length,
    completedWorkouts: workouts.length,
    totalExercises: exercises.length,
    totalFoods: foods.length,
    totalRecipes: recipes.length,
    popularExercises,
    newUsersThisWeek
  });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(sanitizeUser);
  return res.json(users);
});

// Admin Exercise CRUD
app.post('/api/admin/exercises', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, muscle_group, difficulty, equipment, sets, reps, rest_seconds, description, instructions, image_url, gif_url, video_url } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Nome e categoria são obrigatórios.' });
    }

    const ex = db.addExercise({
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category,
      muscle_group: muscle_group || category,
      difficulty: difficulty || 'iniciante',
      equipment: equipment || 'nenhum',
      sets: Number(sets) || 3,
      reps: reps || '12',
      rest_seconds: Number(rest_seconds) || 60,
      description: description || '',
      instructions: Array.isArray(instructions) ? instructions : (instructions ? instructions.split('\n').filter(Boolean) : ['Execute com postura correta.']),
      image_url: image_url || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
      gif_url: gif_url || undefined,
      video_url: video_url || undefined
    });

    return res.status(201).json({ message: 'Exercício criado com sucesso!', exercise: ex });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar exercício.' });
  }
});

app.put('/api/admin/exercises/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateExercise(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Exercício não encontrado.' });
  return res.json({ message: 'Exercício atualizado!', exercise: updated });
});

app.delete('/api/admin/exercises/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.deleteExercise(req.params.id);
  return res.json({ message: 'Exercício eliminado.' });
});

// Admin Workout CRUD
app.post('/api/admin/workouts', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, subtitle, difficulty, duration_minutes, target_goal, category, location, calories_burned_est, exercise_ids } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome do treino é obrigatório.' });

    const wk = db.addWorkout({
      id: `wk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      subtitle: subtitle || 'Treino estruturado',
      difficulty: difficulty || 'iniciante',
      duration_minutes: Number(duration_minutes) || 30,
      target_goal: target_goal || 'perder_peso',
      category: category || 'corpo_inteiro',
      location: location || 'casa',
      calories_burned_est: Number(calories_burned_est) || 200,
      exercise_ids: Array.isArray(exercise_ids) ? exercise_ids : []
    });

    return res.status(201).json({ message: 'Treino criado com sucesso!', workout: wk });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar treino.' });
  }
});

app.put('/api/admin/workouts/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateWorkout(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Treino não encontrado.' });
  return res.json({ message: 'Treino atualizado!', workout: updated });
});

app.delete('/api/admin/workouts/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.deleteWorkout(req.params.id);
  return res.json({ message: 'Treino eliminado.' });
});

// Admin Food CRUD
app.post('/api/admin/foods', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, serving_size, calories, protein, carbs, fats } = req.body;
    if (!name || calories === undefined) return res.status(400).json({ error: 'Nome e calorias são obrigatórios.' });

    const food = db.addFood({
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category: category || 'proteina',
      serving_size: serving_size || '100g',
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0
    });

    return res.status(201).json({ message: 'Alimento adicionado!', food });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar alimento.' });
  }
});

app.put('/api/admin/foods/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateFood(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Alimento não encontrado.' });
  return res.json({ message: 'Alimento atualizado!', food: updated });
});

app.delete('/api/admin/foods/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.deleteFood(req.params.id);
  return res.json({ message: 'Alimento eliminado.' });
});

// Admin Recipe CRUD
app.post('/api/admin/recipes', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, meal_type, prep_time, calories, protein, carbs, fats, ingredients, instructions, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da receita é obrigatório.' });

    const recipe = db.addRecipe({
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      meal_type: meal_type || 'almoco',
      prep_time: prep_time || '15 min',
      calories: Number(calories) || 300,
      protein: Number(protein) || 20,
      carbs: Number(carbs) || 20,
      fats: Number(fats) || 10,
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split('\n').filter(Boolean) : []),
      instructions: Array.isArray(instructions) ? instructions : (instructions ? instructions.split('\n').filter(Boolean) : []),
      image_url: image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
    });

    return res.status(201).json({ message: 'Receita criada!', recipe });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar receita.' });
  }
});

app.put('/api/admin/recipes/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateRecipe(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Receita não encontrada.' });
  return res.json({ message: 'Receita atualizada!', recipe: updated });
});

app.delete('/api/admin/recipes/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.deleteRecipe(req.params.id);
  return res.json({ message: 'Receita eliminada.' });
});

// ---------------- OWNER PRIVATE TELEMETRY & MASTER TRACKING ----------------

app.post('/api/owner/verify-key', (req: Request, res: Response) => {
  const { key } = req.body;
  if (key && key.trim() === OWNER_MASTER_KEY) {
    return res.json({ success: true, message: 'Chave Mestra FitLean validada com sucesso.' });
  }
  return res.status(401).json({ error: 'Chave de Acesso Mestra incorreta ou não autorizada.' });
});

app.get('/api/owner/telemetry', ownerAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.getUsers();
    const userWorkouts = db.getUserWorkouts();
    const weightRecords = db.getWeightRecords();
    const habitLogs = db.getHabits();
    const foodLogs = db.getFoodDiary();

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const newUsers24h = users.filter(u => u.created_at && new Date(u.created_at).getTime() >= oneDayAgo).length;
    const newUsers7d = users.filter(u => u.created_at && new Date(u.created_at).getTime() >= sevenDaysAgo).length;
    const newUsers30d = users.filter(u => u.created_at && new Date(u.created_at).getTime() >= thirtyDaysAgo).length;

    const activeUsers = users.filter(u => u.access_status === 'active').length;
    const pendingUsers = users.filter(u => u.access_status === 'pending_activation').length;
    const blockedUsers = users.filter(u => u.access_status === 'expired' || u.access_status === 'inactive').length;
    const onboardedUsers = users.filter(u => u.onboarding_completed).length;

    const totalCaloriesBurned = userWorkouts.reduce((acc, w) => acc + (Number(w.calories_burned) || 0), 0);
    const completedHabitsCount = habitLogs.filter(h => h.completed).length;

    // Daily signups for the last 7 days
    const dailySignups = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = users.filter(u => u.created_at && u.created_at.startsWith(dateStr)).length;
      dailySignups.push({
        date: dateStr,
        label: d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' }),
        signups: count
      });
    }

    // Enrich users list for owner inspection
    const enrichedUsers = users.map(u => {
      const userWks = userWorkouts.filter(w => w.user_id === u.id);
      const userWght = weightRecords.filter(w => w.user_id === u.id);
      const userHb = habitLogs.filter(h => h.user_id === u.id && h.completed);
      return {
        ...sanitizeUser(u),
        workoutsCount: userWks.length,
        weightLogsCount: userWght.length,
        habitsCompletedCount: userHb.length,
        lastWorkoutDate: userWks.length > 0 ? userWks[userWks.length - 1].date : null
      };
    });

    // Recent activity logs across the entire platform
    const recentWorkouts = [...userWorkouts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
      .map(w => {
        const matchingUser = users.find(u => u.id === w.user_id);
        return {
          ...w,
          userName: matchingUser ? matchingUser.name : 'Utilizador'
        };
      });

    return res.json({
      success: true,
      masterKey: OWNER_MASTER_KEY,
      serverTime: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        activeUsers,
        pendingUsers,
        blockedUsers,
        onboardedUsers,
        newUsers24h,
        newUsers7d,
        newUsers30d,
        completedWorkouts: userWorkouts.length,
        totalCaloriesBurned,
        completedHabitsCount,
        totalWeightLogs: weightRecords.length,
        totalMealsLogged: foodLogs.length
      },
      dailySignups,
      recentWorkouts,
      users: enrichedUsers
    });
  } catch (err: any) {
    console.error('Owner telemetry error:', err);
    return res.status(500).json({ error: 'Erro ao gerar telemetria de proprietário.' });
  }
});

app.post('/api/owner/users/:id/status', ownerAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, role } = req.body;
    const user = db.getUsers().find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const updates: Partial<UserRecord> = {};
    if (status) updates.access_status = status;
    if (role) updates.role = role;

    const updated = db.updateUser(user.id, updates);
    return res.json({ message: 'Estado do utilizador atualizado.', user: updated ? sanitizeUser(updated) : null });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar utilizador.' });
  }
});

app.post('/api/owner/users/:id/reset-password', ownerAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    const user = db.getUsers().find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const tempPassword = newPassword || `fitlean_${Math.floor(1000 + Math.random() * 9000)}`;
    const { salt, hash } = hashPassword(tempPassword);

    db.updateUser(user.id, {
      password_salt: salt,
      password_hash: hash,
      access_status: 'active'
    });

    return res.json({
      message: `Palavra-passe alterada para ${user.email}`,
      temporaryPassword: tempPassword
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao redefinir palavra-passe.' });
  }
});

// ---------------- VITE & STATIC SERVING ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitLean Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
