import { User } from './user.model';

export interface Review {
  id: number;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  restaurantId: number;
  userId: number;
  username: string;
  user: User;
  restaurant: {
    id: number;
    name: string;
    imageUrl: string;
  };
  restaurantName: string;
  foodImage?: string;
}

export interface CreateReview {
  rating: number;
  content: string;
  restaurantId: number;
}

export interface UpdateReview {
  rating: number;
  content: string;
} 