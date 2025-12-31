import { JWT_TOKEN } from "@repo/backend-common/config";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


declare global {
    namespace Express {
        interface Request {
            userId?: string;
            username?: string;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization; // Fixed: headers not header
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                msg: "No token provided or invalid format"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({
                msg: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_TOKEN) as {
            userId: string;
            username: string;
        };

        // Attach user info to request
        req.userId = decoded.userId;
        req.username = decoded.username;
        
        next();

    } catch (err: any) {
        console.error('Auth middleware error:', err);
        
        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                msg: "Invalid token"
            });
        }
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                msg: "Token expired"
            });
        }

        return res.status(500).json({
            msg: "Authentication failed"
        });
    }
};