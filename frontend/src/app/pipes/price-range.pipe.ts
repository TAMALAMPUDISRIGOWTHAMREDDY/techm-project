import { Pipe, PipeTransform } from '@angular/core';
import { PriceRange } from '../models/restaurant.model';

@Pipe({
  name: 'priceRange'
})
export class PriceRangePipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case PriceRange.Budget:
        return '$';
      case PriceRange.Moderate:
        return '$$';
      case PriceRange.Expensive:
        return '$$$';
      case PriceRange.Luxury:
        return '$$$$';
      default:
        return 'Unknown';
    }
  }
} 