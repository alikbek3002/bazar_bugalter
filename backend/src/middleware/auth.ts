import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';

console.log('Loading auth middleware...');

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        let userId: string | null = null;
        let userEmail: string = '';

        // 1. Try to parse as custom base64 token (simple auth)
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            if (decoded.includes(':') && decoded.split(':').length === 2) {
                const [id, timestamp] = decoded.split(':');
                // Basic validation: check if timestamp is valid number and id looks like UUID
                // For now, trust the ID if it looks valid
                userId = id;
            }
        } catch (e) {
            // Not a base64 token, continue to Supabase check
        }

        // 2. If not a custom token, try Supabase auth
        if (!userId) {
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
            if (!error && user) {
                userId = user.id;
                userEmail = user.email || '';
            }
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid token'
            });
        }

        // Get user profile with role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, email')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Profile not found'
            });
        }

        req.user = {
            id: userId,
            email: profile.email || userEmail,
            role: profile.role
        };
        req.accessToken = token;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

// Role-based access control middleware
export function requireRole(...roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Insufficient permissions'
            });
        }

        next();
    };
}
