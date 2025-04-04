import { Component, OnInit, HostListener } from '@angular/core';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  loading = true;
  error: string | null = null;
  searchQuery: string = '';
  showDropdown = false;
  private searchSubject = new Subject<string>();

  constructor(
    private restaurantService: RestaurantService,
    private router: Router
  ) {
    // Set up search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const searchContainer = document.querySelector('.dropdown-search');
    if (searchContainer && !searchContainer.contains(event.target as Node)) {
      this.showDropdown = false;
    }
  }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.error = null;
    
    this.restaurantService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.filteredRestaurants = [];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load restaurants. Please try again later.';
        this.loading = false;
        console.error('Error loading restaurants:', error);
      }
    });
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
    this.showDropdown = true;
  }

  onSelectRestaurant(restaurant: Restaurant): void {
    if (restaurant) {
      this.searchQuery = restaurant.name;
      this.showDropdown = false;
      // Navigate to restaurant details/review page
      this.router.navigate(['/restaurants', restaurant.id]);
    }
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      this.filteredRestaurants = [];
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    this.filteredRestaurants = this.restaurants
      .filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisineType.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5); // Limit to 5 results for dropdown
  }
} 