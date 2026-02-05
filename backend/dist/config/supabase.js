"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = void 0;
exports.createClientWithToken = createClientWithToken;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
console.log('Initializing Supabase Admin client...');
// Admin client with service role - has full access
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
console.log('Supabase Admin client initialized');
// Function to create client with user's JWT for RLS
function createClientWithToken(accessToken) {
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
}
