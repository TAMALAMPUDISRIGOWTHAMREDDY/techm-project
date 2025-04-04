import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  template: `
    <div class="star-rating">
      <i class="bi" 
         *ngFor="let star of stars"
         [class.bi-star-fill]="star <= (value || 0)"
         [class.bi-star]="star > (value || 0)"
         [class.text-warning]="star <= (value || 0)"
         (click)="onRate(star)"
         (mouseenter)="onHover(star)"
         (mouseleave)="onLeave()"
         style="cursor: pointer; font-size: 1.5rem;"></i>
      <span *ngIf="showRating" class="ms-2">{{value || 0}}/5</span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: flex;
      align-items: center;
    }
    .bi-star-fill {
      color: #ffc107;
    }
    .bi-star {
      color: #e4e5e9;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingComponent),
      multi: true
    }
  ]
})
export class StarRatingComponent implements ControlValueAccessor {
  @Input() showRating = true;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];
  value = 0;
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  onRate(rating: number): void {
    this.value = rating;
    this.onChange(rating);
    this.onTouched();
    this.ratingChange.emit(rating);
  }

  onHover(rating: number): void {
    this.value = rating;
  }

  onLeave(): void {
    this.value = this.value;
  }
} 