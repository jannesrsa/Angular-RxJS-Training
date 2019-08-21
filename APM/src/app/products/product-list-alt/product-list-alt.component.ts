import { Component, ChangeDetectionStrategy } from '@angular/core';

import { EMPTY, Observable, Subject } from 'rxjs';

import { ProductService } from '../product.service';
import { catchError } from 'rxjs/operators';
import { Product } from '../product';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  selectedProduct$: Observable<Product> = this.productService.selectedProduct$;

  products$ = this.productService.productsWithCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}
