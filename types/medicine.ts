export interface Medicine {
  id: string;
  name: string;
  nameBn?: string;
  brand?: string;
  brandBn?: string;
  details: string;
  detailsBn?: string;
  origin?: string;
  originBn?: string;
  sideEffects?: string;
  sideEffectsBn?: string;
  usage?: string;
  usageBn?: string;
  howToUse?: string;
  howToUseBn?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineResponseDto {
  id: string;
  name: string;
  brand?: string;
  details?: string;
  origin?: string;
  sideEffects?: string;
  usage?: string;
  howToUse?: string;
  images?: string[];
  createdAt?: string;
  similarity?: number;
  confidence?: string;
  type?: string;
  dosage?: string;
}

export interface PaginatedMedicineResponse {
  data: MedicineResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}