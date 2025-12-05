import { Customer } from './facilities';

export type EquipmentType = 'hvac' | 'electrical' | 'plumbing' | 'machinery' | 'it' | 'safety' | 'other';
export type OperationalStatus = 'operational' | 'maintenance' | 'broken' | 'retired';
export type Condition = 'excellent' | 'good' | 'fair' | 'poor';

export interface Equipment {
  id: string;
  building_id: string;
  facility_name: string;
  equipment_number: string;
  name: string;
  equipment_type: EquipmentType;
  manufacturer: string;
  model: string;
  serial_number: string;
  description: string;
  purchase_date: string | null;
  purchase_price: string | null;
  warranty_expiration: string | null;
  installation_date: string | null;
  operational_status: OperationalStatus;
  condition: Condition;
  specifications: Record<string, any>;
  customer?: Customer | null;
  customer_id: string | null;
  notes: string;
  custom_fields: Record<string, any>;
  is_operational: boolean;
  is_under_warranty: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEquipmentData {
  building_id: string;
  name: string;
  equipment_type: EquipmentType;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  description?: string;
  purchase_date?: string;
  purchase_price?: string;
  warranty_expiration?: string;
  installation_date?: string;
  operational_status?: OperationalStatus;
  condition?: Condition;
  specifications?: Record<string, any>;
  customer_id?: string;
  notes?: string;
  custom_fields?: Record<string, any>;
}

export interface UpdateEquipmentData extends Partial<CreateEquipmentData> {}
