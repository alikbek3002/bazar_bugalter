import { z } from 'zod';

// Market Space validation
export const marketSpaceSchema = z.object({
    code: z.string().min(1, 'Код места обязателен'),
    sector: z.string().optional(),
    row_number: z.string().optional(),
    place_number: z.string().optional(),
    area_sqm: z.coerce.number().positive('Площадь должна быть положительной').optional(),
    space_type: z.enum(['kiosk', 'pavilion', 'open_space', 'container']).optional(),
    business_type: z.string().optional(),
    status: z.enum(['occupied', 'vacant', 'maintenance']).default('vacant'),
    photos: z.array(z.string()).optional(),
});

export type MarketSpaceFormData = z.infer<typeof marketSpaceSchema>;

// Tenant validation
export const tenantSchema = z.object({
    full_name: z.string().min(1, 'ФИО обязательно'),
    inn_idn: z.string().optional(),
    company_name: z.string().optional(),
    phone: z.string().min(1, 'Телефон обязателен'),
    whatsapp: z.string().optional(),
    telegram: z.string().optional(),
    email: z.string().email('Некорректный email').optional().or(z.literal('')),
    notes: z.string().optional(),
});

export type TenantFormData = z.infer<typeof tenantSchema>;

// Lease Contract validation
export const leaseContractSchema = z.object({
    tenant_id: z.string().uuid('Выберите арендатора'),
    space_id: z.string().uuid('Выберите место'),
    start_date: z.string().min(1, 'Дата начала обязательна'),
    end_date: z.string().optional(),
    rate_per_sqm: z.preprocess((val) => Number(val), z.number().positive('Ставка должна быть положительной')),
    monthly_rent: z.preprocess((val) => Number(val), z.number().positive('Сумма аренды должна быть положительной')),
    deposit_amount: z.preprocess((val) => val === '' || val === undefined ? undefined : Number(val), z.number().optional()),
    payment_day: z.preprocess((val) => val === '' || val === undefined ? undefined : Number(val), z.number().min(1).max(31).optional()),
    notes: z.string().optional(),
});

export type LeaseContractFormData = z.infer<typeof leaseContractSchema>;

// Payment validation
export const paymentSchema = z.object({
    paid_amount: z.coerce.number().min(0, 'Сумма не может быть отрицательной'),
    payment_date: z.string().optional(),
    payment_method: z.enum(['cash', 'bank_transfer', 'card']).optional(),
    discount_amount: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Login validation
export const loginSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен быть минимум 6 символов'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
