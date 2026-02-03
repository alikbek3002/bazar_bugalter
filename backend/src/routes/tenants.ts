import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/tenants - Get all tenants
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('tenants')
            .select(`
                *,
                contracts:lease_contracts(id, status)
            `)
            .order('full_name', { ascending: true });

        if (error) throw error;

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get tenants error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch tenants'
        });
    }
});

// GET /api/tenants/:id - Get single tenant
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('tenants')
            .select(`
                *,
                contracts:lease_contracts(
                    *,
                    space:market_spaces(code, type)
                )
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Tenant not found'
            });
        }

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get tenant error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch tenant'
        });
    }
});

// POST /api/tenants - Create new tenant
router.post('/', requireRole('owner', 'accountant'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { full_name, phone, email, inn, company_name, address } = req.body;

        if (!full_name || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Full name and phone are required'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('tenants')
            .insert({
                full_name,
                phone,
                email,
                inn,
                company_name,
                address
            })
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Create tenant error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create tenant'
        });
    }
});

// PUT /api/tenants/:id - Update tenant
router.put('/:id', requireRole('owner', 'accountant'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('tenants')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Update tenant error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update tenant'
        });
    }
});

// DELETE /api/tenants/:id - Delete tenant (owner only)
router.delete('/:id', requireRole('owner'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('tenants')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Tenant deleted successfully'
        });
    } catch (error) {
        console.error('Delete tenant error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete tenant'
        });
    }
});

export default router;
