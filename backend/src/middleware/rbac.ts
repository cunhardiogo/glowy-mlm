import type { Request, Response, NextFunction } from 'express';
import type { UserTipo } from '@glowy/shared';

export function requireRole(...roles: UserTipo[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } });
      return;
    }
    if (!roles.includes(req.user.tipo)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Sem permissão' } });
      return;
    }
    next();
  };
}
