/**
 * FitLean Configuration
 *
 * All external payment gateway URLs are centralized here.
 * You can customize the gateway URL at runtime via VITE_CHECKOUT_URL
 * without modifying any application business logic.
 */

export const CHECKOUT_URL: string =
  ((import.meta as any)?.env?.VITE_CHECKOUT_URL as string) ||
  'https://checkout.fitlean.com';

export const GATEWAY_CONFIG = {
  checkoutUrl: CHECKOUT_URL,
  supportEmail: 'suporte@fitlean.com',
  brandName: 'FitLean Pro',
  isExternalPayment: true,
};
