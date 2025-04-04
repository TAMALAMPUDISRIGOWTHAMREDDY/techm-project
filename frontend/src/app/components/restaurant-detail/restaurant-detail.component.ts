import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Restaurant, PriceRange } from '../../models/restaurant.model';
import { Review } from '../../models/review.model';
import { RestaurantService } from '../../services/restaurant.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-restaurant-detail',
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css']
})
export class RestaurantDetailComponent implements OnInit {
  restaurant: Restaurant | null = null;
  reviews: Review[] = [];
  error: string | null = null;
  isLoggedIn = false;
  showReviewForm = false;
  isSubmitting = false;
  reviewForm: FormGroup;
  currentUser: any = null;
  PriceRange = PriceRange; // Make PriceRange enum available in template
  restaurantId: number | undefined;
  rating = 0;
  loading = true;
  newReview = {
    rating: 5,
    content: ''
  };
  currentPage = 1;
  pageSize = 10;
  hasMoreReviews = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private restaurantService: RestaurantService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.reviewForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
      console.log('Form valid:', this.reviewForm.valid);
      console.log('Form errors:', this.reviewForm.errors);
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn;
    this.currentUser = this.authService.currentUser;
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRestaurant(id);
  }

  private loadRestaurant(id: number): void {
    this.loading = true;
    this.error = '';

    this.restaurantService.getRestaurantById(id).subscribe({
      next: (restaurant) => {
        if (restaurant) {
          this.restaurant = restaurant;
          this.loadReviews(id);
        } else {
          this.error = 'Restaurant not found';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load restaurant details';
        console.error('Error loading restaurant:', err);
        this.loading = false;
      }
    });
  }

  private loadReviews(restaurantId: number): void {
    this.loading = true;
    this.currentPage = 1;
    this.hasMoreReviews = true;
    this.reviewService.getRestaurantReviews(restaurantId, this.currentPage, this.pageSize).subscribe({
      next: (reviews) => {
        this.reviews = reviews.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.hasMoreReviews = reviews.length === this.pageSize;
        if (this.restaurant) {
          this.restaurant.reviews = this.reviews;
          this.restaurant.reviewCount = this.reviews.length;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.loading = false;
      }
    });
  }

  getPriceRangeLabel(priceRange: number): string {
    switch (priceRange) {
      case 1:
        return 'Budget';
      case 2:
        return 'Moderate';
      case 3:
        return 'Expensive';
      case 4:
        return 'Luxury';
      default:
        return 'Unknown';
    }
  }

  setRating(value: number): void {
    this.rating = value;
    this.reviewForm.patchValue({ rating: value });
  }

  submitReview(): void {
    if (!this.restaurant) return;

    const review = {
      restaurantId: this.restaurant.id,
      rating: this.newReview.rating,
      content: this.newReview.content.trim()
    };

    if (!review.content) {
      this.error = 'Please write your review before submitting';
      return;
    }

    this.loading = true;
    this.error = '';

    this.reviewService.createReview(review).subscribe({
      next: (newReview) => {
        // Reset the form
        this.newReview = {
          rating: 5,
          content: ''
        };

        // Update the reviews list with the new review
        this.reviews = [
          {
            ...newReview,
            username: this.currentUser?.username || 'Anonymous',
            createdAt: new Date(),
            userId: this.currentUser?.id || 0
          },
          ...this.reviews
        ];

        // Update restaurant data
        if (this.restaurant) {
          this.restaurant.reviews = this.reviews;
          this.restaurant.reviewCount = this.reviews.length;
          this.restaurant.averageRating = this.calculateAverageRating(this.reviews);
          this.restaurant.rating = this.restaurant.averageRating;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.error = 'Failed to submit review';
        this.loading = false;
      }
    });
  }

  private calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }

  loadMoreReviews(): void {
    if (!this.restaurant || !this.hasMoreReviews || this.loading) return;
    
    this.loading = true;
    this.currentPage++;
    
    this.reviewService.getRestaurantReviews(this.restaurant.id, this.currentPage, this.pageSize).subscribe({
      next: (moreReviews) => {
        const newReviews = moreReviews.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.reviews = [...this.reviews, ...newReviews];
        this.hasMoreReviews = moreReviews.length === this.pageSize;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading more reviews:', err);
        this.error = 'Failed to load more reviews';
        this.loading = false;
      }
    });
  }

  deleteReview(reviewId: number): void {
    if (!this.restaurant) return;

    this.loading = true;
    this.error = null;
    
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        // Remove the review from the local array
        this.reviews = this.reviews.filter(review => review.id !== reviewId);
        
        // Update restaurant stats
        if (this.restaurant) {
          this.restaurant.reviewCount = this.reviews.length;
          this.restaurant.averageRating = this.calculateAverageRating(this.reviews);
          this.restaurant.rating = this.restaurant.averageRating;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error deleting review:', err);
        this.error = 'Failed to delete review';
        this.loading = false;
      }
    });
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '/assets/images/placeholder.jpg';
    }
  }

  getImageUrl(): string {
    if (!this.restaurant) {
      return '/assets/images/placeholder.jpg';
    }
    if (this.restaurant.imageUrl) {
      return this.restaurant.imageUrl;
    }
    const imageNumber = ((this.restaurant.id - 1) % 4) + 1;
    return `/assets/images/restaurant${imageNumber}.jpeg`;
  }
} 