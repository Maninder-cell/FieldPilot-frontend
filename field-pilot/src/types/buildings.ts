// TypeScript interfaces for Buildings

import { Customer, Facility } from './facilities';

export interface Building {
  id: string;
  facility: Facility | string; // Can be nested Facility object or just ID string
  facility_name?: string;
  name: string;
  code: string;
  building_type: 'office' | 'warehouse' | 'production' | 'storage' | 'laboratory' | 'other';
  description: string;
  floor_count: number | null;
  square_footage: number | null;
  construction_year: number | null;
  address: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  operational_status: 'operational' | 'under_construction' | 'maintenance' | 'closed';
  customer?: Customer | null;
  customer_name?: string;
  notes: string;
  custom_fields: Record<string, any>;
  is_operational: boolean;
  equipment_count: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBuildingRequest {
  facility_id: string;
  name: string;
  building_type: string;
  description?: string;
  floor_count?: number | null;
  square_footage?: number | null;
  construction_year?: number | null;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  operational_status?: string;
  customer_id?: string | null;
  notes?: string;
  custom_fields?: Record<string, any>;
}

export interface UpdateBuildingRequest extends CreateBuildingRequest {}

export interface BuildingFilters {
  search?: string;
  status?: string;
  type?: string;
  facility?: string;
  page?: number;
  page_size?: number;
}
