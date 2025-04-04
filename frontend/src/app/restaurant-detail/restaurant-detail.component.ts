import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ReviewService } from '../services/review.service';
import { RestaurantService } from '../services/restaurant.service';
import { Review } from '../models/review.model';

@Component({
  selector: 'app-restaurant-detail',
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css']
})
export class RestaurantDetailComponent implements OnInit {
  restaurant: any;
  isLoggedIn = false;
  restaurantNotFound = false;
  menuCategories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];
  menuItems = [
    {
      name: 'Truffle Pasta',
      description: 'Handmade pasta with truffle cream sauce and parmesan',
      price: 24.99,
      image: 'assets/images/menu1.jpg'
    },
    {
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with lemon butter sauce',
      price: 29.99,
      image: 'assets/images/menu2.jpg'
    },
    {
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with vanilla ice cream',
      price: 12.99,
      image: 'assets/images/menu3.jpg'
    }
  ];

  reviewFilters = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];
  reviews: Review[] = [];

  openingHours = [
    { day: 'Monday', time: '11:00 AM - 10:00 PM' },
    { day: 'Tuesday', time: '11:00 AM - 10:00 PM' },
    { day: 'Wednesday', time: '11:00 AM - 10:00 PM' },
    { day: 'Thursday', time: '11:00 AM - 10:00 PM' },
    { day: 'Friday', time: '11:00 AM - 11:00 PM' },
    { day: 'Saturday', time: '10:00 AM - 11:00 PM' },
    { day: 'Sunday', time: '10:00 AM - 9:00 PM' }
  ];

  similarRestaurants = [
    {
      name: 'The Italian Kitchen',
      image: 'assets/images/similar1.jpg',
      rating: 4.7
    },
    {
      name: 'Seafood Paradise',
      image: 'assets/images/similar2.jpg',
      rating: 4.6
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reviewService: ReviewService,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit(): void {
    // Check login status
    this.authService.isLoggedIn$.subscribe(
      isLoggedIn => this.isLoggedIn = isLoggedIn
    );

    // Get the restaurant ID from the route parameter
    this.route.params.subscribe(params => {
      const id = +params['id']; // Convert string to number
      console.log('Restaurant ID from route:', id);
      this.loadRestaurant(id);
      this.loadReviews(id);
    });
  }

  loadRestaurant(id: number) {
    this.restaurantNotFound = false;
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (data) => {
        this.restaurant = data;
        console.log('Restaurant loaded:', this.restaurant);
      },
      error: (error) => {
        console.error('Error loading restaurant:', error);
        this.restaurantNotFound = true;
        this.restaurant = null;
      }
    });
  }

  loadReviews(restaurantId: number) {
    console.log('Loading reviews for restaurant:', restaurantId);
    this.reviewService.getRestaurantReviews(restaurantId).subscribe({
      next: (data) => {
        this.reviews = data;
        console.log('Reviews loaded:', this.reviews);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        // Initialize with empty array if there's an error
        this.reviews = [];
      }
    });
  }

  onReviewSubmitted(review: any) {
    console.log('Review submitted:', review);
    // Refresh reviews after successful submission
    if (this.restaurant && this.restaurant.id) {
      console.log('Refreshing reviews for restaurant:', this.restaurant.id);
      this.loadReviews(this.restaurant.id);
    } else {
      console.error('Cannot refresh reviews: restaurant ID is missing');
    }
  }
} 