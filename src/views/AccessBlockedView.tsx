import React, { useState } from 'react';
import type { User } from '../types.ts';
import { CHECKOUT_URL } from '../config.ts';
import { ShieldAlert, ArrowRight, LogOut, Clock, Sparkles, KeyRound, Headphones, CheckCircle2 } from 'lucide-react';

interface AccessBlockedViewProps {
  user: User;
  onLogout: () => void;
  onOpenActivate?: () => void;
}

export const AccessBlockedView: React.FC<AccessBlockedViewProps> = ({
  user,
  onLogout,
  onOpenActivate,
}) => {
  const [supportNotice, setSupportNotice] = useState(false);
  const isExpired = user.access_status === 'expired';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
          Acesso Pendente ou Expirado
        </h1>

        <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
          Se já realizou o pagamento, aguarde alguns instantes até a ativação da sua conta ou ative utilizando o código enviado para o seu e-mail.
        </p>

        <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700/80 my-5 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Conta: <strong className="text-stone-800 dark:text-stone-200">{user.email}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 mt-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Estado atual: <strong className="text-amber-600 dark:text-amber-400 capitalize">{user.access_status || 'Pendente'}</strong></span>
          </div>
        </div>

        {supportNotice && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 text-left">
            <div className="flex items-center gap-1.5 font-bold mb-0.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Suporte FitLean</span>
            </div>
            Envie uma mensagem com o comprovativo de compra para <strong>suporte@fitlean.app</strong>.
          </div>
        )}

        <div className="space-y-3">
          {onOpenActivate && (
            <button
              id="btn-activate-my-account"
              type="button"
              onClick={onOpenActivate}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Ativar minha conta</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-contact-support"
              type="button"
              onClick={() => setSupportNotice(true)}
              className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Falar com suporte</span>
            </button>

            <a
              id="btn-gateway-checkout"
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{isExpired ? 'Renovar acesso' : 'Comprar plano'}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 px-4 text-xs font-semibold text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
