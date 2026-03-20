// src/lib/constants/auth.constants.ts
export const AUTH_MESSAGES = {
    SIGN_IN_TITLE: 'Bem-vindo de volta!',
    SIGN_IN_SUBTITLE: 'Entre na sua conta para continuar',
    SIGN_UP_TITLE: 'Crie sua conta',
    SIGN_UP_SUBTITLE: 'Cadastre-se para fazer seus pedidos',
    OR_DIVIDER: 'ou',
    GOOGLE_BUTTON: 'Continuar com Google',
    SIGN_IN_BUTTON: 'Entrar',
    SIGN_UP_BUTTON: 'Criar conta',
    SIGN_IN_LOADING: 'Entrando...',
    SIGN_UP_LOADING: 'Criando conta...',
    GOOGLE_LOADING: 'Redirecionando...',
    HAS_ACCOUNT: 'Já tem uma conta?',
    NO_ACCOUNT: 'Não tem uma conta?',
    SIGN_IN_LINK: 'Faça login',
    SIGN_UP_LINK: 'Cadastre-se',
    FORGOT_PASSWORD: 'Esqueceu a senha?',
    FORGOT_PASSWORD_TITLE: 'Esqueceu a senha?',
    FORGOT_PASSWORD_SUBTITLE: 'Digite seu email e enviaremos um link para redefinir sua senha',
    RESET_PASSWORD_TITLE: 'Nova senha',
    RESET_PASSWORD_SUBTITLE: 'Digite sua nova senha abaixo',
} as const;

export const AUTH_ERRORS: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Confirme seu email antes de entrar',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde um momento',
    'Signup requires a valid password': 'Digite uma senha válida',
} as const;

export const getAuthErrorMessage = (error: string): string => {
    return AUTH_ERRORS[error] || 'Ocorreu um erro. Tente novamente';
};