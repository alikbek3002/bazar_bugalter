"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../config/supabase.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// GET /api/tenants - Get all tenants
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase_js_1.supabaseAdmin
            .from('tenants')
            .select(`
                *,
                contracts:lease_contracts(id, status)
            `)
            .order('full_name', { ascending: true });
        if (error)
            throw error;
        return res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Get tenants error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch tenants'
        });
    }
});
// GET /api/tenants/:id - Get single tenant
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_js_1.supabaseAdmin
            .from('tenants')
            .select(`
                *,
                contracts:lease_contracts(
                    *,
                    space:market_spaces(code, space_type)
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
    }
    catch (error) {
        console.error('Get tenant error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch tenant'
        });
    }
});
// POST /api/tenants - Create new tenant with contract (requires document)
router.post('/', (0, auth_js_1.requireRole)('owner', 'accountant'), async (req, res) => {
    try {
        const { 
        // Tenant data
        full_name, phone, inn, company_name, whatsapp, telegram, notes, 
        // Contract data
        space_id, start_date, end_date, monthly_rent, payment_day, deposit, contract_file_url } = req.body;
        // Validate required fields
        if (!full_name || !phone) {
            return res.status(400).json({
                success: false,
                error: 'ФИО и телефон обязательны'
            });
        }
        if (!space_id || !start_date || !monthly_rent) {
            return res.status(400).json({
                success: false,
                error: 'Торговое место, дата начала и месячная аренда обязательны'
            });
        }
        if (!contract_file_url) {
            return res.status(400).json({
                success: false,
                error: 'Документ договора обязателен'
            });
        }
        // Check if space is available
        const { data: existingContract } = await supabase_js_1.supabaseAdmin
            .from('lease_contracts')
            .select('id')
            .eq('space_id', space_id)
            .eq('status', 'active')
            .single();
        if (existingContract) {
            return res.status(400).json({
                success: false,
                error: 'Это место уже занято'
            });
        }
        // Step 1: Create tenant
        const { data: tenant, error: tenantError } = await supabase_js_1.supabaseAdmin
            .from('tenants')
            .insert({
            full_name,
            phone,
            inn_idn: inn,
            company_name,
            whatsapp,
            telegram,
            notes
        })
            .select()
            .single();
        if (tenantError)
            throw tenantError;
        // Fetch space details to get area and calculate rate
        const { data: spaceData } = await supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .select('area_sqm')
            .eq('id', space_id)
            .single();
        const area = spaceData?.area_sqm || 0;
        let rate = area > 0 ? Number((monthly_rent / area).toFixed(2)) : 0;
        if (isNaN(rate))
            rate = 0;
        // Step 2: Create contract
        const { data: contract, error: contractError } = await supabase_js_1.supabaseAdmin
            .from('lease_contracts')
            .insert({
            tenant_id: tenant.id,
            space_id,
            start_date,
            end_date: end_date || null,
            monthly_rent,
            payment_day: payment_day || 1,
            deposit_amount: deposit || 0,
            rate_per_sqm: rate,
            contract_file_url,
            status: 'active'
        })
            .select()
            .single();
        if (contractError) {
            // Rollback: delete tenant if contract creation fails
            await supabase_js_1.supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
            throw contractError;
        }
        // Step 3: Update space status to occupied
        await supabase_js_1.supabaseAdmin
            .from('market_spaces')
            .update({ status: 'occupied' })
            .eq('id', space_id);
        return res.status(201).json({
            success: true,
            data: {
                tenant,
                contract
            }
        });
    }
    catch (error) {
        console.error('Create tenant with contract error:', JSON.stringify(error, null, 2));
        return res.status(500).json({
            success: false,
            error: error.message || 'Ошибка создания арендатора',
            details: error
        });
    }
});
// PUT /api/tenants/:id - Update tenant
router.put('/:id', (0, auth_js_1.requireRole)('owner', 'accountant'), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const { data, error } = await supabase_js_1.supabaseAdmin
            .from('tenants')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Update tenant error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update tenant'
        });
    }
});
// DELETE /api/tenants/:id - Delete tenant (owner only)
router.delete('/:id', (0, auth_js_1.requireRole)('owner'), async (req, res) => {
    try {
        const { id } = req.params;
        // Step 1: Get all active contracts for this tenant to find occupied spaces
        const { data: contracts, error: contractsError } = await supabase_js_1.supabaseAdmin
            .from('lease_contracts')
            .select('id, space_id, status')
            .eq('tenant_id', id);
        if (contractsError)
            throw contractsError;
        // Step 2: Collect space_ids from active contracts and free them
        if (contracts && contracts.length > 0) {
            const activeSpaceIds = contracts
                .filter(c => c.status === 'active')
                .map(c => c.space_id)
                .filter(Boolean);
            if (activeSpaceIds.length > 0) {
                const { error: spaceError } = await supabase_js_1.supabaseAdmin
                    .from('market_spaces')
                    .update({ status: 'vacant' })
                    .in('id', activeSpaceIds);
                if (spaceError)
                    throw spaceError;
            }
            // Step 3: Delete all contracts for this tenant
            const { error: deleteContractsError } = await supabase_js_1.supabaseAdmin
                .from('lease_contracts')
                .delete()
                .eq('tenant_id', id);
            if (deleteContractsError)
                throw deleteContractsError;
        }
        // Step 4: Delete the tenant
        const { error } = await supabase_js_1.supabaseAdmin
            .from('tenants')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return res.json({
            success: true,
            message: 'Tenant deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete tenant error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete tenant'
        });
    }
});
exports.default = router;
