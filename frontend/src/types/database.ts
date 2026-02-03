export type UserRole = 'owner' | 'accountant' | 'tenant';

export type SpaceType = 'kiosk' | 'pavilion' | 'open_space' | 'container';

export type SpaceStatus = 'occupied' | 'vacant' | 'maintenance';

export type ContractStatus = 'active' | 'expired' | 'terminated';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card';

export type NotificationType = 'payment_reminder' | 'payment_overdue' | 'contract_expiring';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketSpace {
  id: string;
  code: string;
  sector: string | null;
  row_number: string | null;
  place_number: string | null;
  area_sqm: number | null;
  space_type: SpaceType | null;
  business_type: string | null;
  status: SpaceStatus;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  user_id: string | null;
  full_name: string;
  inn_idn: string | null;
  company_name: string | null;
  phone: string;
  whatsapp: string | null;
  telegram: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaseContract {
  id: string;
  tenant_id: string;
  space_id: string;
  start_date: string;
  end_date: string | null;
  rate_per_sqm: number;
  monthly_rent: number;
  deposit_amount: number | null;
  payment_day: number | null;
  contract_file_url: string | null;
  status: ContractStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  contract_id: string;
  tenant_id: string;
  period_month: string;
  charged_amount: number;
  paid_amount: number;
  discount_amount: number;
  payment_date: string | null;
  payment_method: PaymentMethod | null;
  status: PaymentStatus;
  marked_by: string | null;
  marked_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  sent_email: boolean;
  created_at: string;
}

// Extended types with relations
export interface LeaseContractWithRelations extends LeaseContract {
  tenant?: Tenant;
  space?: MarketSpace;
}

export interface PaymentWithRelations extends Payment {
  contract?: LeaseContract;
  tenant?: Tenant;
}

export interface TenantWithContracts extends Tenant {
  contracts?: LeaseContractWithRelations[];
}
