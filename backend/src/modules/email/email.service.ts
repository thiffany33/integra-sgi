import type { SupportedLocale } from '@integra/shared/auth';

export type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export interface EmailService {
  send(email: TransactionalEmail): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

const copy = {
  'pt-PT': {
    resetSubject: 'Repor a palavra-passe', verifySubject: 'Confirme o seu email',
    resetTitle: 'Reponha a sua palavra-passe', verifyTitle: 'Confirme o seu email',
    resetBody: 'Recebemos um pedido para alterar a palavra-passe da sua conta.',
    verifyBody: 'Confirme o seu endereço de email para proteger a sua conta.',
    resetAction: 'Escolher nova palavra-passe', verifyAction: 'Confirmar email',
    ignore: 'Se não pediu esta alteração, pode ignorar esta mensagem.',
  },
  en: {
    resetSubject: 'Reset your password', verifySubject: 'Verify your email',
    resetTitle: 'Reset your password', verifyTitle: 'Verify your email',
    resetBody: 'We received a request to change your account password.',
    verifyBody: 'Confirm your email address to protect your account.',
    resetAction: 'Choose a new password', verifyAction: 'Verify email',
    ignore: 'If you did not request this change, you can ignore this message.',
  },
  fr: {
    resetSubject: 'Réinitialiser votre mot de passe', verifySubject: 'Vérifier votre adresse e-mail',
    resetTitle: 'Réinitialisez votre mot de passe', verifyTitle: 'Vérifiez votre adresse e-mail',
    resetBody: 'Nous avons reçu une demande de modification du mot de passe de votre compte.',
    verifyBody: 'Confirmez votre adresse e-mail pour protéger votre compte.',
    resetAction: 'Choisir un nouveau mot de passe', verifyAction: 'Vérifier l’adresse e-mail',
    ignore: 'Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.',
  },
  de: {
    resetSubject: 'Passwort zurücksetzen', verifySubject: 'E-Mail-Adresse bestätigen',
    resetTitle: 'Setzen Sie Ihr Passwort zurück', verifyTitle: 'Bestätigen Sie Ihre E-Mail-Adresse',
    resetBody: 'Wir haben eine Anfrage zum Ändern Ihres Kontopassworts erhalten.',
    verifyBody: 'Bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu schützen.',
    resetAction: 'Neues Passwort wählen', verifyAction: 'E-Mail bestätigen',
    ignore: 'Wenn Sie diese Änderung nicht angefordert haben, ignorieren Sie diese Nachricht.',
  },
} satisfies Record<SupportedLocale, Record<string, string>>;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export function createAuthEmail(locale: SupportedLocale, kind: 'reset' | 'verify', url: string): TransactionalEmail {
  const language = copy[locale];
  const title = kind === 'reset' ? language.resetTitle : language.verifyTitle;
  const body = kind === 'reset' ? language.resetBody : language.verifyBody;
  const action = kind === 'reset' ? language.resetAction : language.verifyAction;
  const safeUrl = escapeHtml(url);
  return {
    to: '',
    subject: kind === 'reset' ? language.resetSubject : language.verifySubject,
    html: `<main><h1>${title}</h1><p>${body}</p><p><a href="${safeUrl}">${action}</a></p><p>${language.ignore}</p></main>`,
    text: `${title}\n\n${body}\n\n${action}: ${url}\n\n${language.ignore}`,
  };
}
