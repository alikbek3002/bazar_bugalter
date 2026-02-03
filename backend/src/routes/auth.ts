import { Router, Response, Request } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// POST /api/auth/login - Простая аутентификация через таблицу profiles
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log(`[Login Attempt] Email: ${email}, Password length: ${password?.length}`);

        if (!email || !password) {
            console.log('[Login Failed] Missing credentials');
            return res.status(400).json({
                success: false,
                error: 'Email и пароль обязательны'
            });
        }

        // Проверяем логин/пароль в таблице profiles
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id, email, password, role, full_name')
            .eq('email', email)
            .single();

        if (error) {
            console.log('[Login DB Error]', error);
        }

        if (!profile) {
            console.log('[Login Failed] Profile not found');
            return res.status(401).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }

        console.log(`[Login Found Profile] ID: ${profile.id}, Role: ${profile.role}, Has Password: ${!!profile.password}`);

        // Проверяем пароль
        if (profile.password !== password) {
            console.log(`[Login Failed] Password mismatch. Expected: '${profile.password}', Got: '${password}'`);
            return res.status(401).json({
                success: false,
                error: 'Неверный пароль'
            });
        }

        // Генерируем простой токен (для production нужен JWT)
        const token = Buffer.from(`${profile.id}:${Date.now()}`).toString('base64');
        console.log('[Login Success]');

        return res.json({
            success: true,
            data: {
                user: {
                    id: profile.id,
                    email: profile.email,
                    full_name: profile.full_name,
                    role: profile.role
                },
                token: token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            error: 'Ошибка сервера'
        });
    }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
    return res.json({
        success: true,
        message: 'Выход выполнен'
    });
});

// GET /api/auth/me - Получить текущего пользователя по токену
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Не авторизован'
            });
        }

        const token = authHeader.split(' ')[1];

        // Декодируем токен и получаем user id
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const userId = decoded.split(':')[0];

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('id, email, role, full_name')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            return res.status(401).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }

        return res.json({
            success: true,
            data: {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({
            success: false,
            error: 'Ошибка сервера'
        });
    }
});

export default router;
