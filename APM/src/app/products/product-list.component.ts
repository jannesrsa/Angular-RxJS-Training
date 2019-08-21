import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EMPTY, Observable, Subject, combineLatest } from 'rxjs';
import { ProductService } from './product.service';
import { catchError, map, startWith } from 'rxjs/operators';
import { Product } from './product';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  public pageTitle: string = 'Product List';
  public errorMessage: string = '';
  private categorySelectedSubject = new Subject<number>();
  private categorySelectedAction$: Observable<number> = this.categorySelectedSubject.asObservable();


  products$: Observable<Product[]> = combineLatest([
    this.productService.productsWithCategories$,
    this.categorySelectedAction$
      .pipe(
        startWith(0)
      )])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product => selectedCategoryId ? product.categoryId == selectedCategoryId : true
        )),
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  categories$: Observable<ProductCategory[]> = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  constructor(private productService: ProductService, private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
