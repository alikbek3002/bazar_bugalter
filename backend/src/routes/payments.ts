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
                    space:market_spaces(id, code)
                ),
                space:market_spaces(id, code, space_type),
                receipt_url
            `)
            .order('created_at', { ascending: false })
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

// GET /api/payments/by-space/:spaceId - Get payments for a specific space
router.get('/by-space/:spaceId', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { spaceId } = req.params;

        const { data, error } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                tenant:tenants(id, full_name, phone)
            `)
            .eq('space_id', spaceId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Get payments by space error:', error);
        return res.status(500).json({
            success: false,
            error: 'Ошибка загрузки истории платежей'
        });
    }
});

// POST /api/payments - Create new payment
router.post('/', requireRole('owner', 'accountant'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            space_id,
            paid_amount,
            period_start,
            period_end,
            payment_method,
            notes
        } = req.body;

        // Validate required fields
        if (!space_id || !paid_amount || !period_start || !period_end) {
            return res.status(400).json({
                success: false,
                error: 'Обязательные поля: space_id, paid_amount, period_start, period_end'
            });
        }

        // Find active contract for this space
        const { data: activeContract, error: contractError } = await supabaseAdmin
            .from('lease_contracts')
            .select('id, tenant_id, monthly_rent')
            .eq('space_id', space_id)
            .eq('status', 'active')
            .single();

        if (contractError || !activeContract) {
            return res.status(400).json({
                success: false,
                error: 'Нельзя добавить платёж: место свободно или нет активного договора'
            });
        }

        // Calculate charged_amount based on period (monthly_rent * months)
        const start = new Date(period_start);
        const end = new Date(period_end);
        const months = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)));
        const charged_amount = activeContract.monthly_rent * months;

        const { data, error } = await supabaseAdmin
            .from('payments')
            .insert({
                contract_id: activeContract.id,
                tenant_id: activeContract.tenant_id,
                space_id,
                period_month: period_start, // For backward compatibility
                period_start,
                period_end,
                charged_amount,
                paid_amount: parseFloat(paid_amount),
                status: parseFloat(paid_amount) >= charged_amount ? 'paid' : 'partial',
                paid_at: new Date().toISOString(),
                payment_method: payment_method || null,
                notes: notes || null
            })
            .select(`
                *,
                tenant:tenants(id, full_name),
                space:market_spaces(id, code)
            `)
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
            error: 'Ошибка создания платежа'
        });
    }
});

// PUT /api/payments/:id - Update payment (e.g., record payment)
router.put('/:id', requireRole('owner', 'accountant'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { paid_amount, status, paid_at, receipt_url } = req.body;

        const updates: Record<string, unknown> = {};

        if (paid_amount !== undefined) updates.paid_amount = paid_amount;
        if (status !== undefined) updates.status = status;
        if (paid_at !== undefined) updates.paid_at = paid_at;
        if (receipt_url !== undefined) updates.receipt_url = receipt_url;

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
