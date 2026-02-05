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

// GET /api/spaces/:id - Get single space with contract, tenant and payments
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Get space data
        const { data: space, error: spaceError } = await supabaseAdmin
            .from('market_spaces')
            .select('*')
            .eq('id', id)
            .single();

        if (spaceError || !space) {
            return res.status(404).json({
                success: false,
                error: 'Space not found'
            });
        }

        // Get active contract with tenant
        const { data: contract } = await supabaseAdmin
            .from('lease_contracts')
            .select(`
                *,
                tenant:tenants(id, full_name, phone, company_name)
            `)
            .eq('space_id', id)
            .eq('status', 'active')
            .single();

        // Get payment history for this space (by space_id directly)
        const { data: paymentData } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                tenant:tenants(id, full_name, phone)
            `)
            .eq('space_id', id)
            .order('created_at', { ascending: false })
            .limit(50);

        const payments = paymentData || [];

        return res.json({
            success: true,
            data: {
                ...space,
                activeContract: contract || null,
                payments
            }
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
        const {
            code,
            sector,
            row_number,
            place_number,
            area_sqm,
            space_type,
            business_type,
            base_rent,
            status,
            description
        } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Код места обязателен'
            });
        }

        // Build insert object with only non-null values
        const insertData: Record<string, unknown> = { code };

        if (sector) insertData.sector = sector;
        if (row_number) insertData.row_number = row_number;
        if (place_number) insertData.place_number = place_number;
        if (area_sqm) insertData.area_sqm = area_sqm;
        if (space_type) insertData.space_type = space_type;
        if (business_type) insertData.business_type = business_type;
        if (status) insertData.status = status;

        console.log('Inserting space:', insertData);

        const { data, error } = await supabaseAdmin
            .from('market_spaces')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Место с таким кодом уже существует'
                });
            }
            throw error;
        }

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
