import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ProductService } from './product.service';
import { catchError, map } from 'rxjs/operators';
import { Product } from './product';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  public pageTitle: string = 'Product List';
  public errorMessage: string = '';
  private categories: string;

  products$: Observable<Product[]> = this.productService.products$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  constructor(private productService: ProductService) { }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    console.log('Not yet implemented');
  }
}
