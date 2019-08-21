import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  products$: Observable<Product[]> = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );

  productsWithCategories$: Observable<Product[]> = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$])
    .pipe(
      map(([products, categories]) =>
        products.map(product => ({
          ...product,
          price: product.price * 1.5,
          category: categories.find(i => i.id === product.categoryId).name,
          searchKey: [product.productName]
        }) as Product)
      ),
      catchError(this.handleError)
    );

  private productSelectedSubject = new BehaviorSubject(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$: Observable<Product> = combineLatest([
    this.productsWithCategories$,
    this.productSelectedAction$
  ])
    .pipe(
      map(([products, selectedProductId]) =>
        products.find(product => product.id === selectedProductId)),
      tap(product => console.log('Product: ', product),
        catchError(this.handleError)
      ));

  constructor(private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService) { }

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error)}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };
}
