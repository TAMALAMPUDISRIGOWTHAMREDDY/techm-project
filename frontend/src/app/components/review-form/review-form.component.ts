import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.css']
})
export class ReviewFormComponent implements OnInit {
  @Input() restaurantId!: number;
  @Output() reviewSubmitted = new EventEmitter<any>();

  reviewForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  hoverRating = 0;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form with default values
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      console.log('User is not logged in, redirecting to login page');
      this.router.navigate(['/login']);
      return;
    }
    
    // Check if restaurant ID is valid
    if (!this.restaurantId) {
      console.error('Restaurant ID is undefined or invalid');
      this.errorMessage = 'Invalid restaurant ID. Please try again.';
      return;
    }
    
    // Log authentication state
    console.log('User is logged in:', this.authService.isLoggedIn);
    console.log('Auth token available:', !!this.authService.getToken());
    console.log('Restaurant ID:', this.restaurantId);
    
    // Subscribe to form value changes for debugging
    this.reviewForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
      console.log('Form valid:', this.reviewForm.valid);
      console.log('Form errors:', this.reviewForm.errors);
    });
  }

  onSubmit() {
    if (this.isSubmitting) return;

    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      console.log('User is not logged in, redirecting to login page');
      this.errorMessage = 'Please log in to submit a review';
      this.router.navigate(['/login']);
      return;
    }

    // Check if restaurant ID is valid
    if (!this.restaurantId) {
      console.error('Restaurant ID is undefined or invalid');
      this.errorMessage = 'Invalid restaurant ID. Please try again.';
      return;
    }

    // Validate form
    if (this.reviewForm.invalid) {
      console.log('Form is invalid:', this.reviewForm.errors);
      Object.keys(this.reviewForm.controls).forEach(key => {
        const control = this.reviewForm.get(key);
        if (control?.invalid) {
          console.log(`Field ${key} is invalid:`, control.errors);
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const review = {
      restaurantId: this.restaurantId,
      rating: this.reviewForm.get('rating')?.value,
      content: this.reviewForm.get('content')?.value
    };

    console.log('Submitting review:', review);
    console.log('Auth token available:', !!this.authService.getToken());

    this.reviewService.createReview(review).subscribe({
      next: (response) => {
        console.log('Review submitted successfully:', response);
        this.successMessage = 'Review submitted successfully!';
        this.reviewForm.reset({rating: 0, content: ''});
        this.reviewSubmitted.emit(response);
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        
        // Handle specific error cases
        if (error.error?.message === 'Restaurant not found') {
          this.errorMessage = 'The restaurant you are trying to review does not exist.';
        } else if (error.status === 401) {
          this.errorMessage = 'Your session has expired. Please log in again.';
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = error.error?.message || 'Failed to submit review. Please try again.';
        }
        
        this.isSubmitting = false;
      }
    });
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  clearHoverRating() {
    this.hoverRating = 0;
  }
} 