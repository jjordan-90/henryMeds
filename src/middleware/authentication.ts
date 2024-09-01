// I am assuming there would be fully realized authentication and authorization
// We would extract and validate the tokens, then set the user context
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    clientId?: string;
    providerId?: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    req.user = {
      clientId: "extracted-client-id",
      providerId: "extracted-provider-id",
    };
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}
