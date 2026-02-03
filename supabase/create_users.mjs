// Скрипт для создания пользователей через Supabase Admin API
// Запустить: node supabase/create_users.mjs

import { createClient } from '@supabase/supabase-js';

// Service Role Key
const SUPABASE_URL = 'https://iqnwhpmcslujgckzmwgw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbndocG1jc2x1amdja3ptd2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIwNjg2MCwiZXhwIjoyMDg0NzgyODYwfQ.HLeRaqu-TfpUioev4agrqBVsjBQwSdvqPN2oZgl4pVw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const users = [
    {
        email: 'owner@bazar.kg',
        password: 'owner',
        role: 'owner',
        full_name: 'Владелец Базара'
    },
    {
        email: 'accountant@bazar.kg',
        password: 'accountant',
        role: 'accountant',
        full_name: 'Бухгалтер Базара'
    }
];

async function createUsers() {
    console.log('🚀 Создание пользователей...\n');

    for (const user of users) {
        console.log(`📧 Создаю: ${user.email}...`);

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
            if (error.message.includes('already been registered')) {
                console.log(`   ⚠️  Пользователь уже существует, обновляю...`);

                // Находим существующего пользователя
                const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
                const existingUser = existingUsers?.find(u => u.email === user.email);

                if (existingUser) {
                    // Обновляем профиль
                    await supabase
                        .from('profiles')
                        .upsert({
                            id: existingUser.id,
                            role: user.role,
                            full_name: user.full_name,
                            email: user.email
                        });
                    console.log(`   ✅ Профиль обновлён`);
                }
                continue;
            }
            console.error(`   ❌ Ошибка: ${error.message}`);
            continue;
        }

        console.log(`   ✅ Создан с ID: ${data.user.id}`);

        // Обновляем роль в профиле
        const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                role: user.role,
                full_name: user.full_name,
                email: user.email
            });

        if (updateError) {
            console.error(`   ⚠️  Ошибка обновления профиля: ${updateError.message}`);
        } else {
            console.log(`   ✅ Роль установлена: ${user.role}`);
        }

        console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Готово! Данные для входа:');
    console.log('');
    console.log('👑 ВЛАДЕЛЕЦ:');
    console.log('   Email: owner@bazar.kg');
    console.log('   Пароль: owner');
    console.log('');
    console.log('📊 БУХГАЛТЕР:');
    console.log('   Email: accountant@bazar.kg');
    console.log('   Пароль: accountant');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

createUsers();
