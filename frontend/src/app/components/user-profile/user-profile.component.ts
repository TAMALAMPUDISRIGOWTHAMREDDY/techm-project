import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { DishService } from '../../services/dish.service';
import { User } from '../../models/user.model';
import { Review } from '../../models/review.model';
import { DishReview } from '../../models/dish.model';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

interface RestaurantReview extends Review {
  type: 'restaurant';
}

interface EnhancedDishReview extends DishReview {
  type: 'dish';
  restaurantName: string;
  dishName: string;
}

type CombinedReview = RestaurantReview | EnhancedDishReview;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  restaurantReviews: RestaurantReview[] = [];
  dishReviews: EnhancedDishReview[] = [];
  combinedReviews: CombinedReview[] = [];
  isLoading = false;
  error: string | null = null;
  activeTab = 'reviews';
  reviewType = 'all';
  reviewCount = 0;
  averageRating = 0;

  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private dishService: DishService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadReviews();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  setReviewType(type: string): void {
    this.reviewType = type;
    this.updateDisplayedReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.error = null;

    // Load both restaurant and dish reviews
    forkJoin({
      restaurantReviews: this.reviewService.getUserReviews(),
      dishReviews: this.dishService.getAllReviews()
    }).subscribe({
      next: (data) => {
        // Map restaurant reviews to include type
        this.restaurantReviews = data.restaurantReviews
          .map(review => ({
            ...review,
            type: 'restaurant' as const
          }));

        // Filter dish reviews for current user
        this.dishReviews = data.dishReviews
          .filter(review => review.userId === this.user?.id)
          .map(review => ({
            ...review,
            type: 'dish' as const,
            restaurantId: 0,
            restaurantName: 'Loading...',
            dishName: 'Loading...',
            imageUrl: undefined
          })) as EnhancedDishReview[];

        // Load dish details for each dish review
        this.dishReviews.forEach((review, index) => {
          this.dishService.getDishById(review.dishId).subscribe({
            next: (dish) => {
              if (dish) {
                this.dishReviews[index] = {
                  ...review,
                  type: 'dish' as const,
                  restaurantId: parseInt(dish.restaurant.split(':')[0], 10) || 0,
                  restaurantName: dish.restaurant.split(':')[1] || 'Unknown Restaurant',
                  dishName: dish.name,
                  imageUrl: dish.image
                };
                this.updateDisplayedReviews();
              }
            },
            error: (error) => {
              console.error(`Error loading dish details for review ${review.id}:`, error);
              this.dishReviews[index] = {
                ...review,
                type: 'dish' as const,
                restaurantId: 0,
                restaurantName: 'Failed to load restaurant',
                dishName: 'Failed to load dish',
                imageUrl: undefined
              };
              this.updateDisplayedReviews();
            }
          });
        });

        this.updateDisplayedReviews();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.error = 'Failed to load reviews. Please try refreshing the page.';
        this.isLoading = false;
      }
    });
  }

  updateDisplayedReviews(): void {
    if (this.reviewType === 'all') {
      this.combinedReviews = [...this.restaurantReviews, ...this.dishReviews]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.reviewType === 'restaurant') {
      this.combinedReviews = [...this.restaurantReviews]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      this.combinedReviews = [...this.dishReviews]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    this.updateReviewStats();
  }

  updateReviewStats(): void {
    // Calculate total review count
    this.reviewCount = this.restaurantReviews.length + this.dishReviews.length;
    
    // Calculate average rating
    const totalRating = [...this.restaurantReviews, ...this.dishReviews]
      .reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = this.reviewCount > 0 ? totalRating / this.reviewCount : 0;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getReviewContent(review: CombinedReview): string {
    return review.type === 'restaurant' ? review.content : review.comment;
  }

  getReviewTypeLabel(review: CombinedReview): string {
    return review.type === 'restaurant' ? 'Restaurant Review' : 'Dish Review';
  }

  onEditReview(review: CombinedReview): void {
    if (!review) return;

    const updatedContent = window.prompt('Edit your review:', review.type === 'restaurant' ? review.content : review.comment);
    if (updatedContent === null) return; // User cancelled

    const updatedRating = window.prompt('Update rating (1-5):', review.rating.toString());
    if (updatedRating === null) return; // User cancelled

    const rating = parseInt(updatedRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert('Please enter a valid rating between 1 and 5');
      return;
    }

    const updateData = {
      rating: rating,
      content: updatedContent
    };

    this.isLoading = true;
    if (review.type === 'restaurant') {
      this.reviewService.updateReview(review.id, updateData).subscribe({
        next: (updatedReview: Review) => {
          const index = this.restaurantReviews.findIndex(r => r.id === review.id);
          if (index !== -1) {
            this.restaurantReviews[index] = { ...updatedReview, type: 'restaurant' as const };
            this.updateDisplayedReviews();
          }
          this.isLoading = false;
        },
        error: (error: unknown) => {
          console.error('Error updating review:', error);
          alert('Failed to update review. Please try again.');
          this.isLoading = false;
        }
      });
    } else {
      // For dish reviews, we need to preserve the dish-specific fields
      const dishUpdateData = {
        rating: rating,
        comment: updatedContent,
        dishId: review.dishId
      };
      
      this.dishService.updateReview(review.id, dishUpdateData).subscribe({
        next: (updatedReview: DishReview) => {
          const index = this.dishReviews.findIndex(r => r.id === review.id);
          if (index !== -1) {
            this.dishReviews[index] = {
              ...this.dishReviews[index],
              ...updatedReview,
              type: 'dish' as const
            };
            this.updateDisplayedReviews();
          }
          this.isLoading = false;
        },
        error: (error: unknown) => {
          console.error('Error updating dish review:', error);
          alert('Failed to update review. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

  onDeleteReview(review: CombinedReview): void {
    // Implement delete functionality
    console.log('Delete review:', review);
  }

  onFileSelected(event: Event): void {
    // Implement file upload functionality
    console.log('File selected:', event);
  }

  refreshProfile(): void {
    this.loadReviews();
  }
} 