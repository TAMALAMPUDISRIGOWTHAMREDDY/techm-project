import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, of, tap } from 'rxjs';
import { Review, CreateReview, UpdateReview } from '../models/review.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { RestaurantService } from './restaurant.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/api/review`;
  private reviews: Review[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private restaurantService: RestaurantService
  ) {
    this.loadPersistedReviews();
  }

  private loadPersistedReviews(): void {
    try {
      const persistedReviews = localStorage.getItem('userReviews');
      if (persistedReviews) {
        this.reviews = JSON.parse(persistedReviews).map((review: any) => ({
          ...review,
          createdAt: new Date(review.createdAt),
          updatedAt: review.updatedAt ? new Date(review.updatedAt) : null
        }));
        console.log('Loaded persisted reviews:', this.reviews.length);
      }
    } catch (error) {
      console.error('Error loading persisted reviews:', error);
      this.reviews = [];
    }
  }

  private persistReviews(): void {
    try {
      localStorage.setItem('userReviews', JSON.stringify(this.reviews));
    } catch (error) {
      console.error('Error persisting reviews:', error);
    }
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl).pipe(
      tap(reviews => {
        this.reviews = reviews;
        this.persistReviews();
      }),
      catchError(error => {
        console.warn('API not available, using local data:', error);
        return of(this.reviews);
      })
    );
  }

  getRestaurantReviews(restaurantId: number, page: number = 1, pageSize: number = 10): Observable<Review[]> {
    return this.restaurantService.getRestaurantReviews(restaurantId, page, pageSize).pipe(
      tap(reviews => {
        // Update our local storage with these reviews
        const otherReviews = this.reviews.filter(r => r.restaurantId !== restaurantId);
        const updatedReviews = page === 1 ? reviews : [...this.reviews, ...reviews];
        this.reviews = [...otherReviews, ...updatedReviews];
        this.persistReviews();
      })
    );
  }

  getUserReviews(): Observable<Review[]> {
    console.log('Fetching user reviews from API...');
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Review[]>(`${this.apiUrl}/user`, { headers }).pipe(
      tap(reviews => {
        // Update local storage with new reviews
        const userId = this.authService.currentUser?.id;
        if (userId) {
          this.reviews = reviews.map(review => ({
            ...review,
            createdAt: new Date(review.createdAt),
            updatedAt: review.updatedAt ? new Date(review.updatedAt) : null,
            restaurant: review.restaurant || {
              id: review.restaurantId,
              name: 'Unknown Restaurant',
              imageUrl: ''
            }
          }));
          this.persistReviews();
        }
      }),
      catchError(error => {
        console.warn('API not available, using local data:', error);
        return of(this.reviews);
      })
    );
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`).pipe(
      tap(review => {
        // Update local storage with new review
        const index = this.reviews.findIndex(r => r.id === id);
        if (index !== -1) {
          this.reviews[index] = review;
        } else {
          this.reviews.push(review);
        }
        this.persistReviews();
      }),
      catchError(error => {
        console.warn('API not available, using local data:', error);
        const review = this.reviews.find(r => r.id === id);
        if (review) {
          return of(review);
        }
        return throwError(() => new Error('Review not found'));
      })
    );
  }

  createReview(review: CreateReview): Observable<Review> {
    console.log('Creating review:', review);
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const currentUser = this.authService.currentUser;
    const newReview: Review = {
      id: Math.floor(Math.random() * 10000), // Temporary ID for local storage
      rating: review.rating,
      content: review.content,
      createdAt: new Date(),
      updatedAt: null,
      restaurantId: review.restaurantId,
      userId: currentUser?.id || 0,
      username: currentUser?.username || 'Anonymous',
      user: currentUser || {
        id: 0,
        username: 'Anonymous',
        email: '',
        firstName: '',
        lastName: '',
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        reviewCount: 0,
        averageRating: 0
      },
      restaurant: {
        id: review.restaurantId,
        name: 'Restaurant',
        imageUrl: ''
      },
      restaurantName: 'Restaurant'
    };
    
    return this.http.post<Review>(`${this.apiUrl}`, review, { headers }).pipe(
      tap(serverReview => {
        // Merge the server response with our local review data
        const finalReview = { 
          ...newReview, 
          ...serverReview,
          createdAt: new Date(serverReview.createdAt),
          updatedAt: serverReview.updatedAt ? new Date(serverReview.updatedAt) : null,
          restaurant: serverReview.restaurant || newReview.restaurant
        };
        
        // Update ReviewService's local storage
        this.reviews = [finalReview, ...this.reviews];
        this.persistReviews();
        
        // Update RestaurantService's reviews
        this.restaurantService.addReview(review.restaurantId, finalReview).subscribe();
      }),
      catchError(error => {
        console.warn('API not available, creating review locally:', error);
        
        // Update ReviewService's local storage
        this.reviews = [newReview, ...this.reviews];
        this.persistReviews();
        
        // Update RestaurantService's reviews
        this.restaurantService.addReview(review.restaurantId, newReview).subscribe();
        
        return of(newReview);
      })
    );
  }

  updateReview(id: number, review: UpdateReview): Observable<Review> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.put<Review>(`${this.apiUrl}/${id}`, review, { headers }).pipe(
      tap(updatedReview => {
        // Update the review in local storage
        const index = this.reviews.findIndex(r => r.id === id);
        if (index !== -1) {
          this.reviews[index] = updatedReview;
          this.persistReviews();
        }
      }),
      catchError(error => {
        console.warn('API not available, updating review locally:', error);
        
        const existingReview = this.reviews.find(r => r.id === id);
        if (!existingReview) {
          return throwError(() => new Error('Review not found'));
        }
        
        const updatedReview = {
          ...existingReview,
          rating: review.rating,
          content: review.content,
          updatedAt: new Date()
        };
        
        const index = this.reviews.findIndex(r => r.id === id);
        this.reviews[index] = updatedReview;
        this.persistReviews();
        
        return of(updatedReview);
      })
    );
  }

  deleteReview(id: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    // Find the review to get the restaurantId before deletion
    const reviewToDelete = this.reviews.find(r => r.id === id);
    if (!reviewToDelete) {
      return throwError(() => new Error('Review not found'));
    }
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(() => {
        // Remove the review from local storage
        const index = this.reviews.findIndex(r => r.id === id);
        if (index !== -1) {
          this.reviews.splice(index, 1);
          this.persistReviews();
          
          // Update restaurant service's reviews
          this.restaurantService.deleteReview(reviewToDelete.restaurantId, id);
        }
      }),
      catchError(error => {
        console.warn('API not available, deleting review locally:', error);
        
        const index = this.reviews.findIndex(r => r.id === id);
        if (index === -1) {
          return throwError(() => new Error('Review not found'));
        }
        
        this.reviews.splice(index, 1);
        this.persistReviews();
        
        // Update restaurant service's reviews
        this.restaurantService.deleteReview(reviewToDelete.restaurantId, id);
        
        return of(void 0);
      })
    );
  }
} 