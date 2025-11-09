import { Request, Response, NextFunction } from 'express';

export const languageResolver = (req: Request, _res: Response, next: NextFunction): void => {
  const languageHeader = req.headers['accept-language'];
  const supportedLocales = ['en', 'es'];
  const locale = typeof languageHeader === 'string' ? languageHeader.split(',')[0] : 'en';

  req.headers['x-request-locale'] = supportedLocales.includes(locale) ? locale : 'en';
  next();
};

