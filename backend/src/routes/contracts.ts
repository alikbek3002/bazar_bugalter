import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/contracts - Get all contracts
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('lease_contracts')
            .select(`
                *,
                tenant:tenants(id, full_name, phone),
                space:market_spaces(id, code, type)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get contracts error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch contracts'
        });
    }
});

// GET /api/contracts/:id - Get single contract
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('lease_contracts')
            .select(`
                *,
                tenant:tenants(*),
                space:market_spaces(*),
                payments:payments(*)
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Contract not found'
            });
        }

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get contract error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch contract'
        });
    }
});

// POST /api/contracts - Create new contract
router.post('/', requireRole('owner'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { tenant_id, space_id, start_date, end_date, monthly_rent, deposit, status } = req.body;

        if (!tenant_id || !space_id || !start_date || !monthly_rent) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: tenant_id, space_id, start_date, monthly_rent'
            });
        }

        // Start transaction: create contract and update space status
        const { data: contract, error: contractError } = await supabaseAdmin
            .from('lease_contracts')
            .insert({
                tenant_id,
                space_id,
                start_date,
                end_date,
                monthly_rent,
                deposit: deposit || 0,
                status: status || 'active'
            })
            .select()
            .single();

        if (contractError) throw contractError;

        // Update space status to occupied
        if (status === 'active' || !status) {
            await supabaseAdmin
                .from('market_spaces')
                .update({ status: 'occupied' })
                .eq('id', space_id);
        }

        return res.status(201).json({
            success: true,
            data: contract
        });
    } catch (error) {
        console.error('Create contract error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create contract'
        });
    }
});

// PUT /api/contracts/:id - Update contract
router.put('/:id', requireRole('owner'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('lease_contracts')
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
        console.error('Update contract error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update contract'
        });
    }
});

// DELETE /api/contracts/:id - Delete/terminate contract
router.delete('/:id', requireRole('owner'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Get contract to find space
        const { data: contract } = await supabaseAdmin
            .from('lease_contracts')
            .select('space_id')
            .eq('id', id)
            .single();

        // Delete contract
        const { error } = await supabaseAdmin
            .from('lease_contracts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Update space status to vacant
        if (contract?.space_id) {
            await supabaseAdmin
                .from('market_spaces')
                .update({ status: 'vacant' })
                .eq('id', contract.space_id);
        }

        return res.json({
            success: true,
            message: 'Contract deleted successfully'
        });
    } catch (error) {
        console.error('Delete contract error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete contract'
        });
    }
});

export default router;
