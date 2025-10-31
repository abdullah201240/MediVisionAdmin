export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  image?: string | null;
  coverPhoto?: string | null;
  location?: string;
  bio?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  image?: string | null;
  coverPhoto?: string | null;
  role: string;
  location?: string;
  bio?: string;
  createdAt: Date;
}

export interface PaginatedUserResponse {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}