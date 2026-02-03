import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/spaces - Get all spaces
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('market_spaces')
            .select('*')
            .order('code', { ascending: true });

        if (error) throw error;

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get spaces error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch spaces'
        });
    }
});

// GET /api/spaces/:id - Get single space
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('market_spaces')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Space not found'
            });
        }

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch space'
        });
    }
});

// POST /api/spaces - Create new space (owner only)
router.post('/', requireRole('owner'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { code, type, floor, area_sqm, base_rent, status, description } = req.body;

        const { data, error } = await supabaseAdmin
            .from('market_spaces')
            .insert({
                code,
                type: type || 'store',
                floor: floor || 1,
                area_sqm,
                base_rent,
                status: status || 'vacant',
                description
            })
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Create space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create space'
        });
    }
});

// PUT /api/spaces/:id - Update space (owner only)
router.put('/:id', requireRole('owner'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('market_spaces')
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
        console.error('Update space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update space'
        });
    }
});

// DELETE /api/spaces/:id - Delete space (owner only)
router.delete('/:id', requireRole('owner'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('market_spaces')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Space deleted successfully'
        });
    } catch (error) {
        console.error('Delete space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete space'
        });
    }
});

export default router;
