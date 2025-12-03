// TypeScript interfaces for Facilities

export interface Facility {
  id: string;
  name: string;
  code: string;
  facility_type: 'warehouse' | 'office' | 'factory' | 'retail' | 'datacenter' | 'other';
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  operational_status: 'operational' | 'under_construction' | 'maintenance' | 'closed';
  square_footage: number | null;
  year_built: number | null;
  customer_name?: string;
  notes: string;
  custom_fields: Record<string, any>;
  is_operational: boolean;
  buildings_count: number;
  equipment_count: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFacilityRequest {
  name: string;
  facility_type: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  operational_status?: string;
  square_footage?: number | null;
  year_built?: number | null;
  customer_id?: string | null;
  notes?: string;
  custom_fields?: Record<string, any>;
}

export interface UpdateFacilityRequest extends CreateFacilityRequest {}

export interface FacilityFilters {
  search?: string;
  status?: string;
  type?: string;
  customer?: string;
}
