import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject, Subject, merge, from } from 'rxjs';
import { catchError, tap, map, scan, shareReplay, filter, mergeMap, toArray, switchMap } from 'rxjs/operators';

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
      shareReplay(1),
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
      tap(product => console.log('Product: ', product)),
      shareReplay(1),
      catchError(this.handleError)
    );

  constructor(private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService) { }

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  addProduct(newProduct?: Product): void {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  private productInsertedSubject = new Subject<Product>()
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  selectedProductSuppliers$ = combineLatest(
    this.selectedProduct$,
    this.supplierService.suppliers$)
    .pipe(
      filter(([selectedProduct, suppliers]) => Boolean(selectedProduct)),
      tap(() => console.log('selectedProductSuppliers')),
      map(([selectedProduct, suppliers]) =>
        suppliers.filter(supplier => selectedProduct.supplierIds.includes(supplier.id)))
    );

  selectedProductMergeMapSuppliers$ = this.selectedProduct$
    .pipe(
      filter(selectedProduct => Boolean(selectedProduct)),
      switchMap(selectedProduct =>
        from(selectedProduct.supplierIds)
          .pipe(
            mergeMap(id => this.supplierService.getSupplier(id)),
            toArray()
          )));

  productsWithAdd$ = merge(
    this.productsWithCategories$,
    this.productInsertedAction$
  )
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value])
    );

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    } as Product;
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
