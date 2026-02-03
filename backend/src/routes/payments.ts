import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/payments - Get all payments
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { status, limit = 100 } = req.query;

        let query = supabaseAdmin
            .from('payments')
            .select(`
                *,
                tenant:tenants(id, full_name, phone),
                contract:lease_contracts(
                    id,
                    space:market_spaces(id, code)
                )
            `)
            .order('period_month', { ascending: false })
            .limit(Number(limit));

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get payments error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch payments'
        });
    }
});

// GET /api/payments/:id - Get single payment
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                tenant:tenants(*),
                contract:lease_contracts(
                    *,
                    space:market_spaces(*)
                )
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get payment error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch payment'
        });
    }
});

// POST /api/payments - Create new payment
router.post('/', requireRole('owner', 'accountant'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { tenant_id, contract_id, period_month, charged_amount, paid_amount, status, due_date } = req.body;

        if (!tenant_id || !contract_id || !period_month || !charged_amount) {
            return res.status(400).json({
                success: false,
                error: 'Required fields: tenant_id, contract_id, period_month, charged_amount'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('payments')
            .insert({
                tenant_id,
                contract_id,
                period_month,
                charged_amount,
                paid_amount: paid_amount || 0,
                status: status || 'pending',
                due_date
            })
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Create payment error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create payment'
        });
    }
});

// PUT /api/payments/:id - Update payment (e.g., record payment)
router.put('/:id', requireRole('owner', 'accountant'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { paid_amount, status, paid_at } = req.body;

        const updates: Record<string, unknown> = {};

        if (paid_amount !== undefined) updates.paid_amount = paid_amount;
        if (status !== undefined) updates.status = status;
        if (paid_at !== undefined) updates.paid_at = paid_at;

        // Auto-set paid status if fully paid
        const { data: currentPayment } = await supabaseAdmin
            .from('payments')
            .select('charged_amount')
            .eq('id', id)
            .single();

        if (currentPayment && paid_amount >= currentPayment.charged_amount) {
            updates.status = 'paid';
            updates.paid_at = updates.paid_at || new Date().toISOString();
        }

        const { data, error } = await supabaseAdmin
            .from('payments')
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
        console.error('Update payment error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update payment'
        });
    }
});

// POST /api/payments/:id/pay - Quick pay endpoint
router.post('/:id/pay', requireRole('owner', 'accountant'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        // Get current payment
        const { data: payment, error: fetchError } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        const newPaidAmount = payment.paid_amount + (amount || payment.charged_amount - payment.paid_amount);
        const newStatus = newPaidAmount >= payment.charged_amount ? 'paid' : 'partial';

        const { data, error } = await supabaseAdmin
            .from('payments')
            .update({
                paid_amount: newPaidAmount,
                status: newStatus,
                paid_at: newStatus === 'paid' ? new Date().toISOString() : null
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Pay error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process payment'
        });
    }
});

export default router;
