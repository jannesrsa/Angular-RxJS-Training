import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from '../product.service';
import { Observable, EMPTY } from 'rxjs';
import { Product } from '../product';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  errorMessage = '';
  product$ : Observable<Product> = this.productService.selectedProduct$
  .pipe(
    catchError(err=> {
      this.errorMessage = err;
      return EMPTY;
    })
  )

  constructor(private productService: ProductService) { }

}
