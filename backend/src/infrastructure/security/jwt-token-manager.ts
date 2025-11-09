import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { TokenManager, TokenPayload } from '../../application/ports/token-manager.js';
import { env } from '../../config/env.js';
import createHttpError from 'http-errors';

interface RefreshTokenClaims extends TokenPayload {
  sessionId: string;
}

export class JwtTokenManager implements TokenManager {
  async createTokenPair(payload: TokenPayload) {
    const sessionId = randomUUID();

    const accessToken = jwt.sign(
      {
        sub: payload.sub,
        org: payload.org,
        role: payload.role,
        locale: payload.locale,
      },
      env.accessTokenPrivateKey,
      {
        expiresIn: '15m',
        issuer: 'admin-platform',
      },
    );

    const refreshToken = jwt.sign(
      {
        sub: payload.sub,
        org: payload.org,
        role: payload.role,
        locale: payload.locale,
        sessionId,
      },
      env.refreshTokenPrivateKey,
      {
        expiresIn: '7d',
        issuer: 'admin-platform',
        jwtid: sessionId,
      },
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sessionId,
    };
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload & { sessionId: string }> {
    try {
      const decoded = jwt.verify(token, env.refreshTokenPrivateKey, {
        issuer: 'admin-platform',
      }) as jwt.JwtPayload & RefreshTokenClaims;

      if (!decoded.sessionId) {
        throw new Error('Invalid refresh token: missing session identifier');
      }

      return {
        sub: decoded.sub as string,
        org: decoded.org as string,
        role: decoded.role as string,
        locale: decoded.locale as string,
        sessionId: decoded.sessionId,
      };
    } catch (error) {
      throw createHttpError(401, 'Invalid refresh token', { cause: error });
    }
  }
}

