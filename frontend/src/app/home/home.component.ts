import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../services/restaurant.service';
import { DishService } from '../services/dish.service';
import { AuthService } from '../services/auth.service';
import { Restaurant } from '../models/restaurant.model';
import { Dish, DishReview, CreateDishReview } from '../models/dish.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredRestaurants: Restaurant[] = [];
  trendingDishes: Dish[] = [];
  selectedDish: Dish | null = null;
  selectedDishReviews: DishReview[] = [];
  showReviews: boolean = false;
  newReview: CreateDishReview = {
    rating: 5,
    comment: ''
  };
  loading = true;
  error = '';

  categories = [
    { name: 'Italian', icon: 'fas fa-pizza-slice' },
    { name: 'Indian', icon: 'fas fa-pepper-hot' },
    { name: 'Chinese', icon: 'fas fa-drumstick-bite' },
    { name: 'Mexican', icon: 'fas fa-utensils' },
    { name: 'Japanese', icon: 'fas fa-fish' },
    { name: 'Desserts', icon: 'fas fa-ice-cream' }
  ];

  constructor(
    private restaurantService: RestaurantService,
    private dishService: DishService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTrendingDishes();
    this.loadFeaturedRestaurants();
  }

  loadTrendingDishes(): void {
    this.dishService.getDishes().subscribe(dishes => {
      this.trendingDishes = dishes;
    });
  }

  loadFeaturedRestaurants(): void {
    this.loading = true;
    this.error = '';

    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        // Sort by rating and take top 6
        this.featuredRestaurants = restaurants
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading featured restaurants:', error);
        this.error = error.message || 'Failed to load featured restaurants';
        this.loading = false;
      }
    });
  }

  viewRestaurantDetails(id: number): void {
    this.router.navigate(['/restaurants', id]);
  }

  openReviewModal(dish: Dish): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.selectedDish = dish;
    this.showReviews = false;
    this.newReview = {
      rating: 5,
      comment: ''
    };
  }

  viewReviews(dish: Dish): void {
    this.selectedDish = dish;
    this.showReviews = true;
    this.loadDishReviews(dish.id);
  }

  loadDishReviews(dishId: number): void {
    this.dishService.getDishReviews(dishId).subscribe(reviews => {
      this.selectedDishReviews = reviews;
    });
  }

  submitReview(): void {
    if (this.selectedDish && this.newReview.comment.trim()) {
      const currentUser = this.authService.currentUser;
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      const displayName = currentUser.firstName && currentUser.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : currentUser.username;

      this.dishService.createReview(
        this.selectedDish.id,
        currentUser.id,
        this.newReview,
        displayName
      ).subscribe(() => {
        // Update user's review count and average rating
        if (currentUser) {
          const allReviews = this.dishService.getAllReviews().subscribe(reviews => {
            const userReviews = reviews.filter(r => r.userId === currentUser.id);
            const totalReviews = userReviews.length;
            const averageRating = totalReviews > 0 
              ? Number((userReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
              : 0;
            
            currentUser.reviewCount = totalReviews;
            currentUser.averageRating = averageRating;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          });
        }
        
        this.loadTrendingDishes();
        if (this.showReviews) {
          this.loadDishReviews(this.selectedDish!.id);
        } else {
          this.closeReviewModal();
        }
      });
    }
  }

  closeReviewModal(): void {
    this.selectedDish = null;
    this.showReviews = false;
    this.selectedDishReviews = [];
  }

  getRatingArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.jpg';
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
} 