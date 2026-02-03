import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

console.log('Initializing Supabase Admin client...');
// Admin client with service role - has full access
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
console.log('Supabase Admin client initialized');

// Function to create client with user's JWT for RLS
export function createClientWithToken(accessToken: string) {
    return createClient(supabaseUrl, supabaseServiceKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
}
