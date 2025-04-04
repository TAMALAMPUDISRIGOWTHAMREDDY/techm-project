export interface Dish {
  id: number;
  name: string;
  restaurant: string;
  image: string;
  rating: number;
  reviewCount: number;
  description?: string;
}

export interface DishReview {
  id: number;
  dishId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  restaurantId?: number;
  restaurantName?: string;
  dishName?: string;
  imageUrl?: string;
  type?: 'dish';
}

export interface CreateDishReview {
  rating: number;
  comment: string;
} 