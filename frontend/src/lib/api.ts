const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiClient {
    private accessToken: string | null = null;

    setToken(token: string | null) {
        this.accessToken = token;
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
    }

    getToken(): string | null {
        if (!this.accessToken) {
            this.accessToken = localStorage.getItem('accessToken');
        }
        return this.accessToken;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.setToken(null);
                }
                return {
                    success: false,
                    error: data.error || 'Request failed'
                };
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            return {
                success: false,
                error: 'Network error'
            };
        }
    }

    // Auth
    async login(email: string, password: string) {
        const result = await this.request<{
            user: { id: string; email: string; role: string };
            accessToken: string;
            refreshToken: string;
        }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (result.success && result.data) {
            this.setToken(result.data.accessToken);
        }

        return result;
    }

    async logout() {
        const result = await this.request('/api/auth/logout', { method: 'POST' });
        this.setToken(null);
        return result;
    }

    async getMe() {
        return this.request<{ id: string; email: string; role: string }>('/api/auth/me');
    }

    // Spaces
    async getSpaces() {
        return this.request<Array<{
            id: string;
            code: string;
            type: string;
            floor: number;
            area_sqm: number;
            base_rent: number;
            status: string;
            description?: string;
        }>>('/api/spaces');
    }

    async getSpace(id: string) {
        return this.request(`/api/spaces/${id}`);
    }

    async createSpace(data: Record<string, unknown>) {
        return this.request('/api/spaces', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateSpace(id: string, data: Record<string, unknown>) {
        return this.request(`/api/spaces/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteSpace(id: string) {
        return this.request(`/api/spaces/${id}`, { method: 'DELETE' });
    }

    // Tenants
    async getTenants() {
        return this.request<Array<{
            id: string;
            full_name: string;
            phone: string;
            email?: string;
            company_name?: string;
            contracts?: Array<{ id: string; status: string }>;
        }>>('/api/tenants');
    }

    async getTenant(id: string) {
        return this.request(`/api/tenants/${id}`);
    }

    async createTenant(data: Record<string, unknown>) {
        return this.request('/api/tenants', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTenant(id: string, data: Record<string, unknown>) {
        return this.request(`/api/tenants/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTenant(id: string) {
        return this.request(`/api/tenants/${id}`, { method: 'DELETE' });
    }

    // Contracts
    async getContracts() {
        return this.request('/api/contracts');
    }

    async getContract(id: string) {
        return this.request(`/api/contracts/${id}`);
    }

    async createContract(data: Record<string, unknown>) {
        return this.request('/api/contracts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateContract(id: string, data: Record<string, unknown>) {
        return this.request(`/api/contracts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteContract(id: string) {
        return this.request(`/api/contracts/${id}`, { method: 'DELETE' });
    }

    // Payments
    async getPayments(params?: { status?: string; limit?: number }) {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set('status', params.status);
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        const query = searchParams.toString();
        return this.request(`/api/payments${query ? `?${query}` : ''}`);
    }

    async getPayment(id: string) {
        return this.request(`/api/payments/${id}`);
    }

    async createPayment(data: Record<string, unknown>) {
        return this.request('/api/payments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updatePayment(id: string, data: Record<string, unknown>) {
        return this.request(`/api/payments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async payPayment(id: string, amount?: number) {
        return this.request(`/api/payments/${id}/pay`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }

    // Stats
    async getOverviewStats() {
        return this.request<{
            spaces: {
                total: number;
                occupied: number;
                vacant: number;
                maintenance: number;
                occupancyRate: number;
            };
            tenants: { total: number };
            contracts: { total: number; active: number };
            payments: {
                total: number;
                paid: number;
                pending: number;
                overdue: number;
            };
            revenue: {
                total: number;
                pending: number;
                overdue: number;
            };
        }>('/api/stats/overview');
    }
}

export const api = new ApiClient();
