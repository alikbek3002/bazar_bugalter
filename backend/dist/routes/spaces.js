"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../config/supabase.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// GET /api/spaces - Get all spaces
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let query = supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .select(`
                *,
                contracts:lease_contracts(
                    id, status, monthly_rent, start_date, end_date,
                    tenant:tenants(id, full_name, phone, company_name)
                )
            `)
            .order('code', { ascending: true });
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Get spaces error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch spaces'
        });
    }
});
// GET /api/spaces/:id - Get single space with contract, tenant and payments
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Get space data
        const { data: space, error: spaceError } = await supabase_js_1.supabaseAdmin
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
        const { data: contract } = await supabase_js_1.supabaseAdmin
            .from('lease_contracts')
            .select(`
                *,
                tenant:tenants(id, full_name, phone, company_name)
            `)
            .eq('space_id', id)
            .eq('status', 'active')
            .single();
        // Get payment history for this space (by space_id directly)
        const { data: paymentData } = await supabase_js_1.supabaseAdmin
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
    }
    catch (error) {
        console.error('Get space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch space'
        });
    }
});
// POST /api/spaces - Create new space (owner only)
router.post('/', (0, auth_js_1.requireRole)('owner'), async (req, res) => {
    try {
        const { code, sector, row_number, place_number, area_sqm, space_type, business_type, base_rent, status, description } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Код места обязателен'
            });
        }
        // Build insert object with only non-null values
        const insertData = { code };
        if (sector)
            insertData.sector = sector;
        if (row_number)
            insertData.row_number = row_number;
        if (place_number)
            insertData.place_number = place_number;
        if (area_sqm)
            insertData.area_sqm = area_sqm;
        if (space_type)
            insertData.space_type = space_type;
        if (business_type)
            insertData.business_type = business_type;
        if (status)
            insertData.status = status;
        console.log('Inserting space:', insertData);
        const { data, error } = await supabase_js_1.supabaseAdmin
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
    }
    catch (error) {
        console.error('Create space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create space'
        });
    }
});
// PUT /api/spaces/:id - Update space (owner only)
router.put('/:id', (0, auth_js_1.requireRole)('owner'), async (req, res) => {
    try {
        const { id } = req.params;
        const { code, sector, space_type, area_sqm, base_rent, status, description } = req.body;
        // Build update object with only valid fields
        const updates = {};
        if (code !== undefined && code !== null && code !== '')
            updates.code = String(code);
        if (sector !== undefined)
            updates.sector = sector || null;
        // space_type is an enum — only send if it has a valid value, skip if empty/null
        if (space_type && space_type !== '')
            updates.space_type = space_type;
        if (area_sqm !== undefined)
            updates.area_sqm = area_sqm !== null && area_sqm !== '' ? parseFloat(String(area_sqm)) : null;
        if (base_rent !== undefined)
            updates.base_rent = base_rent !== null && base_rent !== '' ? parseFloat(String(base_rent)) : null;
        // status is an enum — only send if it has a valid value
        if (status && status !== '')
            updates.status = status;
        if (description !== undefined)
            updates.description = description || null;
        console.log('Updating space:', id, 'with:', JSON.stringify(updates));
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Нет данных для обновления'
            });
        }
        const { data, error } = await supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Supabase update error:', JSON.stringify(error));
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Место с таким кодом уже существует'
                });
            }
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to update space'
            });
        }
        return res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Update space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update space'
        });
    }
});
// DELETE /api/spaces/:id - Delete space (owner only)
router.delete('/:id', (0, auth_js_1.requireRole)('owner'), async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return res.json({
            success: true,
            message: 'Space deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete space'
        });
    }
});
exports.default = router;
