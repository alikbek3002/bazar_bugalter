export const APP_NAME = 'Bazar Bugalter';

export const SPACE_TYPES = {
    kiosk: 'Киоск',
    pavilion: 'Павильон',
    open_space: 'Открытая площадка',
    container: 'Контейнер',
} as const;

export const SPACE_STATUSES = {
    occupied: 'Занято',
    vacant: 'Свободно',
    maintenance: 'На обслуживании',
} as const;

export const CONTRACT_STATUSES = {
    active: 'Активный',
    expired: 'Истёк',
    terminated: 'Расторгнут',
} as const;

export const PAYMENT_STATUSES = {
    pending: 'Ожидает оплаты',
    paid: 'Оплачен',
    partial: 'Частично оплачен',
    overdue: 'Просрочен',
} as const;

export const PAYMENT_METHODS = {
    cash: 'Наличные',
    bank_transfer: 'Банковский перевод',
    card: 'Карта',
} as const;

export const USER_ROLES = {
    owner: 'Владелец',
    accountant: 'Бухгалтер',
    tenant: 'Арендатор',
} as const;

export const NOTIFICATION_TYPES = {
    payment_reminder: 'Напоминание об оплате',
    payment_overdue: 'Просрочка платежа',
    contract_expiring: 'Истечение договора',
} as const;

export const STATUS_COLORS = {
    // Space statuses
    occupied: 'bg-red-100 text-red-800',
    vacant: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    // Payment statuses
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-orange-100 text-orange-800',
    overdue: 'bg-red-100 text-red-800',
    // Contract statuses
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
} as const;

export const ROUTES = {
    owner: {
        overview: '/owner/overview',
        spaces: '/owner/spaces',
        tenants: '/owner/tenants',
        contracts: '/owner/contracts',
        payments: '/owner/payments',
        reports: '/owner/reports',
    },
    accountant: {
        payments: '/accountant/payments',
        reports: '/accountant/reports',
    },
    tenant: {
        dashboard: '/tenant/dashboard',
        history: '/tenant/history',
    },
} as const;
