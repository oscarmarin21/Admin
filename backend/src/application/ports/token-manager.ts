export interface TokenPayload {
  sub: string;
  org: string;
  role: string;
  locale: string;
}

export interface TokenManager {
  createTokenPair(payload: TokenPayload): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
    sessionId: string;
  }>;
  verifyRefreshToken(token: string): Promise<TokenPayload & { sessionId: string }>;
}

