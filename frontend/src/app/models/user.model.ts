import { Review } from './review.model';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'User' | 'Admin';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  reviews?: Review[];
  avatar?: string;
  reviewCount: number;
  averageRating: number;
}

export interface CreateUser {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUser {
  firstName: string;
  lastName: string;
}

export interface LoginUser {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export interface RegisterUser {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
} 