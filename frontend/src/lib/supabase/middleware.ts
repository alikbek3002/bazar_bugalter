import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Demo routes - skip auth for testing
    if (request.nextUrl.pathname.startsWith('/demo')) {
        return supabaseResponse;
    }

    // Protected routes
    const protectedRoutes = ['/owner', '/accountant', '/tenant'];
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect logged in users from login page
    if (request.nextUrl.pathname === '/login' && user) {
        // Get user role and redirect accordingly
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const url = request.nextUrl.clone();
        if (profile?.role === 'owner') {
            url.pathname = '/owner/overview';
        } else if (profile?.role === 'accountant') {
            url.pathname = '/accountant/payments';
        } else if (profile?.role === 'tenant') {
            url.pathname = '/tenant/dashboard';
        } else {
            url.pathname = '/';
        }
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
