import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: 'owner' | 'accountant' | 'tenant';
    };
    accessToken?: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
