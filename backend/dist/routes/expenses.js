"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("../config/supabase.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// GET /api/expenses - Get all expenses
router.get('/', async (req, res) => {
    try {
        const { month, year, category, limit = 100 } = req.query;
        let query = supabase_js_1.supabaseAdmin
            .from('expenses')
            .select(`
                *,
                created_by_profile:profiles!expenses_created_by_fkey(id, full_name, email)
            `)
            .order('expense_date', { ascending: false })
            .limit(Number(limit));
        if (category) {
            query = query.eq('category', category);
        }
        // Filter by month/year if provided
        if (month && year) {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endMonth = Number(month) === 12 ? 1 : Number(month) + 1;
            const endYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
            const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
            query = query.gte('expense_date', startDate).lt('expense_date', endDate);
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
        console.error('Get expenses error:', error);
        return res.status(500).json({
            success: false,
            error: 'Ошибка загрузки расходов'
        });
    }
});
// GET /api/expenses/:id - Get single expense
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_js_1.supabaseAdmin
            .from('expenses')
            .select(`
                *,
                created_by_profile:profiles!expenses_created_by_fkey(id, full_name, email)
            `)
            .eq('id', id)
            .single();
        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Расход не найден'
            });
        }
        return res.json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Get expense error:', error);
        return res.status(500).json({
            success: false,
            error: 'Ошибка загрузки расхода'
        });
    }
});
// POST /api/expenses - Create new expense
router.post('/', (0, auth_js_1.requireRole)('owner', 'accountant'), async (req, res) => {
    try {
        const { category, amount, description, expense_date } = req.body;
        if (!category || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Категория и сумма обязательны'
            });
        }
        const userId = req.user?.id;
        const { data, error } = await supabase_js_1.supabaseAdmin
            .from('expenses')
            .insert({
            category,
            amount: parseFloat(amount),
            description: description || null,
            expense_date: expense_date || new Date().toISOString().split('T')[0],
            created_by: userId || null
        })
            .select(`
                *,
                created_by_profile:profiles!expenses_created_by_fkey(id, full_name, email)
            `)
            .single();
        if (error)
            throw error;
        return res.status(201).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Create expense error:', error);
        return res.status(500).json({
            success: false,
            error: 'Ошибка создания расхода'
        });
    }
});
// PUT /api/expenses/:id - Update expense
router.put('/:id', (0, auth_js_1.requireRole)('owner', 'accountant'), async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, description, expense_date } = req.body;
        const updates = {};
        if (category !== undefined)
            updates.category = category;
        if (amount !== undefined)
            updates.amount = parseFloat(String(amount));
        if (description !== undefined)
            updates.description = description;
        if (expense_date !== undefined)
            updates.expense_date = expense_date;
        const { data, error } = await supabase_js_1.supabaseAdmin
            .from('expenses')
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
        console.error('Update expense error:', error);
        return res.status(500).json({
            success: false,
            error: 'Ошибка обновления расхода'
        });
    }
});
// DELETE /api/expenses/:id - Delete expense (owner only)
router.delete('/:id', (0, auth_js_1.requireRole)('owner'), async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_js_1.supabaseAdmin
            .from('expenses')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return res.json({
            success: true,
            message: 'Расход удалён'
        });
    }
    catch (error) {
        console.error('Delete expense error:', error);
        return res.status(500).json({
            success: false,
            error: 'Ошибка удаления расхода'
        });
    }
});
exports.default = router;
