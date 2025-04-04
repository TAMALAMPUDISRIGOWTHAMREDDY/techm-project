import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Restaurant } from '../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-card',
  templateUrl: './restaurant-card.component.html',
  styleUrls: ['./restaurant-card.component.css']
})
export class RestaurantCardComponent {
  @Input() restaurant!: Restaurant;

  constructor(private router: Router) {}

  getImageUrl(): string {
    if (this.restaurant.imageUrl) {
      return this.restaurant.imageUrl;
    }
    const imageNumber = ((this.restaurant.id - 1) % 4) + 1;
    return `/assets/images/restaurant${imageNumber}.jpeg`;
  }

  navigateToRestaurant(id: number) {
    this.router.navigate(['/restaurants', id]);
  }

  getRatingClass(rating: number): string {
    if (rating >= 4.5) return 'excellent';
    if (rating >= 4.0) return 'very-good';
    if (rating >= 3.5) return 'good';
    if (rating >= 3.0) return 'fair';
    return 'poor';
  }

  getPriceRangeDollars(): number {
    return this.restaurant.priceRange || 1;
  }
}