import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// GET /api/stats/overview - Dashboard statistics
router.get('/overview', async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Fetch all data in parallel
        const [spacesResult, tenantsResult, contractsResult, paymentsResult] = await Promise.all([
            supabaseAdmin.from('market_spaces').select('id, status'),
            supabaseAdmin.from('tenants').select('id'),
            supabaseAdmin.from('lease_contracts').select('id, status'),
            supabaseAdmin.from('payments').select('id, status, charged_amount, paid_amount'),
        ]);

        const spaces = spacesResult.data || [];
        const tenants = tenantsResult.data || [];
        const contracts = contractsResult.data || [];
        const payments = paymentsResult.data || [];

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
                }
            }
        });
    } catch (error) {
        console.error('Get overview stats error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

export default router;
