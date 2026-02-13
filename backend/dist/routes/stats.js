"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../config/supabase.js");
const router = (0, express_1.Router)();
// GET /api/stats/overview - Dashboard statistics
router.get('/overview', async (req, res) => {
    try {
        // Fetch all data in parallel
        const [spacesResult, tenantsResult, contractsResult, paymentsResult, expensesResult] = await Promise.all([
            supabase_js_1.supabaseAdmin.from('market_spaces').select('id, status'),
            supabase_js_1.supabaseAdmin.from('tenants').select('id'),
            supabase_js_1.supabaseAdmin.from('lease_contracts').select('id, status'),
            supabase_js_1.supabaseAdmin.from('payments').select('id, status, charged_amount, paid_amount'),
            supabase_js_1.supabaseAdmin.from('expenses').select('id, amount'),
        ]);
        const spaces = spacesResult.data || [];
        const tenants = tenantsResult.data || [];
        const contracts = contractsResult.data || [];
        const payments = paymentsResult.data || [];
        const expenses = expensesResult.data || [];
        // Calculate metrics
        const totalSpaces = spaces.length;
        const occupiedSpaces = spaces.filter(s => s.status === 'occupied').length;
        const vacantSpaces = spaces.filter(s => s.status === 'vacant').length;
        const maintenanceSpaces = spaces.filter(s => s.status === 'maintenance').length;
        const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;
        const totalTenants = tenants.length;
        const activeContracts = contracts.filter(c => c.status === 'active').length;
        const paidPayments = payments.filter(p => p.status === 'paid');
        const pendingPayments = payments.filter(p => p.status === 'pending');
        const overduePayments = payments.filter(p => p.status === 'overdue');
        const totalRevenue = paidPayments.reduce((sum, p) => sum + p.paid_amount, 0);
        const totalPending = pendingPayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);
        const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const netIncome = Math.max(0, totalRevenue - totalExpenses);
        return res.json({
            success: true,
            data: {
                spaces: {
                    total: totalSpaces,
                    occupied: occupiedSpaces,
                    vacant: vacantSpaces,
                    maintenance: maintenanceSpaces,
                    occupancyRate
                },
                tenants: {
                    total: totalTenants
                },
                contracts: {
                    total: contracts.length,
                    active: activeContracts
                },
                payments: {
                    total: payments.length,
                    paid: paidPayments.length,
                    pending: pendingPayments.length,
                    overdue: overduePayments.length
                },
                revenue: {
                    total: totalRevenue,
                    pending: totalPending,
                    overdue: totalOverdue
                },
                expenses: {
                    total: totalExpenses
                },
                netIncome
            }
        });
    }
    catch (error) {
        console.error('Get overview stats error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});
exports.default = router;
