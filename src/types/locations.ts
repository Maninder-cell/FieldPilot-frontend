export interface Location {
  id: string;
  entity_type: string;
  entity_id: string;
  name: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  floor: string;
  room: string;
  zone: string;
  additional_info: Record<string, any>;
  has_coordinates: boolean;
  full_location: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationData {
  entity_type: string;
  entity_id: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  floor?: string;
  room?: string;
  zone?: string;
  additional_info?: Record<string, any>;
}

export interface UpdateLocationData extends Partial<Omit<CreateLocationData, 'entity_type' | 'entity_id'>> {}
