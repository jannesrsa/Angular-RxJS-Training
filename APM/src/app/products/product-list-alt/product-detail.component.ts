import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from '../product.service';
import { Observable, EMPTY, combineLatest } from 'rxjs';
import { Product } from '../product';
import { catchError, map, filter } from 'rxjs/operators';
import { Supplier } from '../../suppliers/supplier';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProductDetailComponent {
  errorMessage = '';

  product$: Observable<Product> = this.productService.selectedProduct$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    )

  pageTitle$ = this.product$
    .pipe(
      map((product: Product) => product ? `Product Detail for: ${product.productName}` : null)
    );

  // productSuppliers$: Observable<Supplier[]> = this.productService.selectedProductMergeMapSuppliers$.pipe(
  //   catchError(err => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // )
  productSuppliers$: Observable<Supplier[]> = this.productService.selectedProductSuppliers$
    .pipe(
      catchError(err=> {
        this.errorMessage = err;
        return EMPTY;
      })
    )

  vm$ = combineLatest([
    this.product$,
    this.pageTitle$,
    this.productSuppliers$
  ]).pipe(
    filter(([product]) => Boolean(product)),
    map(([product, pageTitle, productSuppliers]) => ({ product, pageTitle, productSuppliers }))
  );

  constructor(private productService: ProductService) { }

}
