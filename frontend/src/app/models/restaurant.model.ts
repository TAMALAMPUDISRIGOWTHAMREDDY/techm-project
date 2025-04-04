import { Review } from './review.model';

export enum PriceRange {
  Budget = 1,
  Moderate = 2,
  Expensive = 3,
  Luxury = 4
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  cuisineType: string;
  priceRange: PriceRange;
  rating: number;
  averageRating: number;
  reviewCount: number;
  imageUrl: string;
  address: string;
  phoneNumber: string;
  website: string;
  dietaryOptions: string[];
  openingHours: string[];
  reviews: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRestaurant {
  name: string;
  description: string;
  cuisine: string;
  cuisineType: string;
  priceRange: PriceRange;
  imageUrl: string;
  address: string;
  phoneNumber: string;
  website: string;
  dietaryOptions: string[];
  openingHours: string[];
}

export interface UpdateRestaurant {
  name?: string;
  description?: string;
  cuisine?: string;
  cuisineType?: string;
  priceRange?: PriceRange;
  imageUrl?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  dietaryOptions?: string[];
  openingHours?: string[];
} 