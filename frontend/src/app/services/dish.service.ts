import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Dish, DishReview, CreateDishReview } from '../models/dish.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiUrl = `${environment.apiUrl}/api/dish`;
  private dishes: Dish[] = [
    {
      id: 1,
      name: 'Truffle Pasta',
      restaurant: 'The Gourmet Kitchen',
      image: '/assets/images/dish1.jpeg',
      rating: 4.9,
      reviewCount: 156,
      description: 'Handmade pasta with fresh truffles and parmesan'
    },
    {
      id: 2,
      name: 'Butter Chicken',
      restaurant: 'Spice Garden',
      image: '/assets/images/dish2.jpeg',
      rating: 4.7,
      reviewCount: 203,
      description: 'Tender chicken in rich, creamy tomato sauce'
    },
    {
      id: 3,
      name: 'Grilled Salmon',
      restaurant: 'Ocean View',
      image: '/assets/images/dish3.jpeg',
      rating: 4.8,
      reviewCount: 178,
      description: 'Fresh Atlantic salmon with herbs and lemon'
    },
    {
      id: 4,
      name: 'Chocolate Lava Cake',
      restaurant: 'The Gourmet Kitchen',
      image: '/assets/images/dish4.jpeg',
      rating: 4.9,
      reviewCount: 167,
      description: 'Warm chocolate cake with molten center'
    }
  ];

  private reviews: DishReview[] = [];

  constructor(private http: HttpClient) {
    this.loadPersistedReviews();
  }

  private loadPersistedReviews(): void {
    try {
      const persistedReviews = localStorage.getItem('dishReviews');
      if (persistedReviews) {
        this.reviews = JSON.parse(persistedReviews);
        console.log('Loaded persisted dish reviews:', this.reviews.length);
      }
    } catch (error) {
      console.error('Error loading persisted dish reviews:', error);
      this.reviews = [];
    }
  }

  private persistReviews(): void {
    try {
      localStorage.setItem('dishReviews', JSON.stringify(this.reviews));
      console.log('Persisted dish reviews to localStorage:', this.reviews.length);
    } catch (error) {
      console.error('Error persisting dish reviews:', error);
    }
  }

  getDishes(): Observable<Dish[]> {
    return of(this.dishes);
  }

  getDishById(id: number): Observable<Dish | undefined> {
    const dish = this.dishes.find(d => d.id === id);
    return of(dish);
  }

  getDishReviews(dishId: number): Observable<DishReview[]> {
    const dishReviews = this.reviews
      .filter(r => r.dishId === dishId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return of(dishReviews);
  }

  getAllReviews(): Observable<DishReview[]> {
    return of(this.reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  createReview(dishId: number, userId: number, review: CreateDishReview, userName: string): Observable<DishReview> {
    const newReview: DishReview = {
      id: this.reviews.length + 1,
      dishId,
      userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString(),
      userName: userName
    };

    this.reviews.push(newReview);
    this.persistReviews();

    // Update dish rating
    const dish = this.dishes.find(d => d.id === dishId);
    if (dish) {
      const dishReviews = this.reviews.filter(r => r.dishId === dishId);
      const totalRating = dishReviews.reduce((sum, r) => sum + r.rating, 0);
      dish.rating = Number((totalRating / dishReviews.length).toFixed(1));
      dish.reviewCount = dishReviews.length;
    }

    return of(newReview);
  }

  deleteDishReview(reviewId: number): Observable<void> {
    // Remove from local storage first
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
    this.persistReviews();
    
    return this.http.delete<void>(`${this.apiUrl}/reviews/${reviewId}`);
  }

  updateReview(reviewId: number, updateData: { rating: number; comment: string; dishId: number }): Observable<DishReview> {
    const index = this.reviews.findIndex(r => r.id === reviewId);
    if (index === -1) {
      throw new Error('Review not found');
    }

    const updatedReview: DishReview = {
      ...this.reviews[index],
      rating: updateData.rating,
      comment: updateData.comment,
      dishId: updateData.dishId
    };

    this.reviews[index] = updatedReview;
    this.persistReviews();

    // Update dish rating
    const dish = this.dishes.find(d => d.id === updateData.dishId);
    if (dish) {
      const dishReviews = this.reviews.filter(r => r.dishId === updateData.dishId);
      const totalRating = dishReviews.reduce((sum, r) => sum + r.rating, 0);
      dish.rating = Number((totalRating / dishReviews.length).toFixed(1));
    }

    return of(updatedReview);
  }
} 