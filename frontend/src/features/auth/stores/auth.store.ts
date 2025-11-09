import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'project_manager' | 'member' | 'stakeholder';
  locale: 'en' | 'es';
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  signIn: (payload: { user: User; tokens: AuthTokens }) => void;
  signOut: () => void;
}

const readPersistedState = (): Pick<AuthState, 'user' | 'tokens' | 'isAuthenticated'> => {
  if (typeof window === 'undefined') {
    return { user: null, tokens: null, isAuthenticated: false };
  }

  try {
    const userRaw = localStorage.getItem('authUser');
    const tokensRaw = localStorage.getItem('authTokens');

    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    const tokens = tokensRaw ? (JSON.parse(tokensRaw) as AuthTokens) : null;

    return {
      user,
      tokens,
      isAuthenticated: !!(user && tokens),
    };
  } catch (error) {
    console.error('Failed to parse persisted auth state', error);
    return { user: null, tokens: null, isAuthenticated: false };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...readPersistedState(),
  signIn: ({ user, tokens }) =>
    set(() => {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('sessionId', tokens.sessionId);
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authTokens', JSON.stringify(tokens));
      return {
        user,
        isAuthenticated: true,
        tokens,
      };
    }),
  signOut: () =>
    set(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('authUser');
      localStorage.removeItem('authTokens');
      return {
        user: null,
        isAuthenticated: false,
        tokens: null,
      };
    }),
}));

