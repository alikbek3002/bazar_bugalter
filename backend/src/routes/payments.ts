import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticatedRequest } from '../types/index.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/payments/generate-monthly - Auto-generate pending payments for active contracts
router.post('/generate-monthly', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed
        const periodMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]; // e.g. "2026-03-01"
        const today = now.toISOString().split('T')[0]; // e.g. "2026-03-02"

        // Step 1: Get all active contracts with space_id
        const { data: contracts, error: contractsError } = await supabaseAdmin
            .from('lease_contracts')
            .select('id, tenant_id, space_id, monthly_rent, payment_day')
            .eq('status', 'active');

        if (contractsError) throw contractsError;

        let created = 0;
        let alreadyExist = 0;

        if (contracts && contracts.length > 0) {
            for (const contract of contracts) {
                // Check if payment for this contract and this month already exists
                const { data: existing } = await supabaseAdmin
                    .from('payments')
                    .select('id')
                    .eq('contract_id', contract.id)
                    .gte('period_month', periodMonth)
                    .lt('period_month', new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0])
                    .limit(1);

                if (existing && existing.length > 0) {
                    alreadyExist++;
                    continue;
                }

                // Calculate due_date based on payment_day
                const paymentDay = contract.payment_day || 1;
                // Handle months with fewer days (e.g. Feb 30 -> Feb 28)
                const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                const actualDay = Math.min(paymentDay, lastDayOfMonth);
                const dueDate = new Date(currentYear, currentMonth, actualDay).toISOString().split('T')[0];

                // Create pending payment
                const { error: insertError } = await supabaseAdmin
                    .from('payments')
                    .insert({
                        contract_id: contract.id,
                        tenant_id: contract.tenant_id,
                        space_id: contract.space_id,
                        period_month: periodMonth,
                        charged_amount: contract.monthly_rent,
                        paid_amount: 0,
                        due_date: dueDate,
                        status: 'pending'
                    });

                if (!insertError) {
                    created++;
                }
            }
        }

        // Step 2: Update overdue payments (pending payments whose due_date has passed)
        const { data: overdueUpdated, error: overdueError } = await supabaseAdmin
            .from('payments')
            .update({ status: 'overdue' })
            .eq('status', 'pending')
            .lt('due_date', today)
            .select('id');

        if (overdueError) {
            console.error('Error updating overdue payments:', overdueError);
        }

        return res.json({
            success: true,
            data: {
                created,
                alreadyExist,
                markedOverdue: overdueUpdated?.length || 0
            }
        });
    } catch (error) {
        console.error('Generate monthly payments error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate monthly payments'
        });
    }
});

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
                receipt_url,
                marked_by_profile:profiles!payments_marked_by_fkey(id, full_name, email)
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

        // Get user ID who is creating the payment
        const userId = req.user?.id;

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
                notes: notes || null,
                marked_by: userId || null,
                marked_at: new Date().toISOString()
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

        // Track who made this update
        const userId = req.user?.id;
        if (userId) {
            updates.marked_by = userId;
            updates.marked_at = new Date().toISOString();
        }

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
