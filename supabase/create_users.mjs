// Скрипт для создания тестовых пользователей через Supabase Admin API
// Запустить: node supabase/create_users.mjs

import { createClient } from '@supabase/supabase-js';

// Service Role Key нужен для создания пользователей
// Найди его в Supabase Dashboard -> Settings -> API -> service_role (secret)
const SUPABASE_URL = 'https://iqnwhpmcslujgckzmwgw.supabase.co';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Замени на свой service_role key!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const users = [
    {
        email: 'owner@bazar.test',
        password: 'Owner123!',
        role: 'owner',
        full_name: 'Владелец Базара'
    },
    {
        email: 'accountant@bazar.test',
        password: 'Accountant123!',
        role: 'accountant',
        full_name: 'Бухгалтер Базара'
    },
    {
        email: 'tenant@bazar.test',
        password: 'Tenant123!',
        role: 'tenant',
        full_name: 'Арендатор Тест'
    }
];

async function createUsers() {
    for (const user of users) {
        console.log(`Creating user: ${user.email}...`);

        // Создаем пользователя через Admin API
        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
                full_name: user.full_name
            }
        });

        if (error) {
            console.error(`Error creating ${user.email}:`, error.message);
            continue;
        }

        console.log(`Created user: ${user.email} with ID: ${data.user.id}`);

        // Обновляем роль в профиле
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: user.role, full_name: user.full_name })
            .eq('id', data.user.id);

        if (updateError) {
            console.error(`Error updating role for ${user.email}:`, updateError.message);
        } else {
            console.log(`Updated role to: ${user.role}`);
        }

        // Если это арендатор, создаем запись в tenants
        if (user.role === 'tenant') {
            const { error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    user_id: data.user.id,
                    full_name: user.full_name,
                    phone: '+7 700 123 4567',
                    email: user.email
                });

            if (tenantError) {
                console.error(`Error creating tenant record:`, tenantError.message);
            } else {
                console.log(`Created tenant record`);
            }
        }

        console.log('---');
    }

    console.log('Done!');
}

createUsers();
