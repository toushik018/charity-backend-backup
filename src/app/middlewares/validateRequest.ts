import { ZodSchema } from 'zod';
import { NextFunction, Request, Response } from 'express';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) {
        req.body = parsed.body;
      }

      if (parsed.params) {
        req.params = parsed.params;
      }

      if (parsed.query) {
        req.query = parsed.query;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
