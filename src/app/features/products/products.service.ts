import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  categoryFilter$ = new Subject<string>();
  categoryFilter = this.categoryFilter$.asObservable();

  constructor(private apollo: Apollo) { }

  setCategoryFilter(category: string) {
    this.categoryFilter$.next(category);
  }

  // Get all products (including sortBy and category)
  getProducts(sortBy?: string, category?: string) {
    const categoryQuery = category ? `where: {category: {name: {_eq: "${category}"}}},` : '';
    const sortByQuery = sortBy ? `order_by: {price: ${sortBy}},` : '';

    return this.apollo
      .watchQuery({
        query: gql`
          {
            product(${categoryQuery}${sortByQuery}) {
                  EAN
                  categoryId
                  subcategoryId
                  description
                  id
                  images
                  inStock
                  name
                  price
                  category {
                    id
                    name
                  }
                  subcategory {
                    id
                    name
                  }
                }
          }
        `,
      }).valueChanges
  }

  getProductsDefault() {
    return this.apollo
      .watchQuery({
        query: gql`
          {
            product {
                  EAN
                  categoryId
                  subcategoryId
                  description
                  id
                  images
                  inStock
                  name
                  price
                  category {
                    id
                    name
                  }
                  subcategory {
                    id
                    name
                  }
                }
          }
        `,
      }).valueChanges
  }

  // TODO: Add after valueChanges if requests are happening too quickly .pipe(debounce(() => interval(500)))
  getProductsByPrice(priceFrom: number, priceTo: number) {
    return this.apollo
      .watchQuery({
        query: gql`
          {
            product(where: {price: {_gte: "${priceFrom}", _lte: "${priceTo}"}}) {
                  EAN
                  categoryId
                  description
                  id
                  images
                  inStock
                  name
                  price
                  subcategoryId
                  subcategory {
                    id
                    name
                  }
                  category {
                    name
                    id
                  }
                }
          }`,
      }).valueChanges
  }

  searchProducts(searchInput: string) {
    return this.apollo
      .watchQuery({
        query: gql`
          {
            product(where: { name: { _ilike: "%${searchInput}%" } }) {
              EAN
              categoryId
              subcategoryId
              description
              id
              inStock
              images
              name
              price
              subcategory {
                name
                id
              }
              category {
                name
                id
              }
        }}
        `,
      }).valueChanges
  }

  getProductBySubcategory(category: string) {
    return this.apollo
      .watchQuery({
        query: gql`
        {
          product(where: {subCategory: {_like: "%${category}%"}}) {
          id
          category
          description
          images
          inStock
          name
          price
          productId
          subCategory
        }}
      `
      }).valueChanges
  }

  getProductById(id: number) {
    return this.apollo
      .watchQuery({
        query: gql`
        {
          product(where: { id: { _eq: ${id} } }) {
            EAN
            categoryId
            subcategoryId
            description
            id
            inStock
            images
            name
            price
            subcategory {
              name
              id
            }
            category {
              name
              id
            }
          }}`
      }).valueChanges
  }

  getProductsFromSubcategories(categories: string[]) {
    return this.apollo
      .watchQuery({
        query: gql`
        {
          product(where: { subCategory: { _in: ${categories} } }) {
          subCategory
          productId
          price
          name
          inStock
          images
          id
          description
          category
      }}`
      }).valueChanges
  }

  getProductsByCategory(category: string) {
    return this.apollo
      .watchQuery({
        query: gql`
      {
        product(where: {category: {name: {_eq: "${category}"}}}) {
          EAN
          categoryId
          subcategoryId
          description
          id
          inStock
          images
          name
          price
          subcategory {
            name
            id
          }
          category {
            name
            id
          }
        }}`
      }).valueChanges
  }

  getFilteredProducts(filter: string[]) {
    if (filter.length === 0) {
      return this.getProductsDefault();
    }
    return this.apollo
      .watchQuery({
        query: gql`
      {
        product(where: {subcategory: {name: {_in: [${filter.map(f => `"${f}"`)}]}}}) {
          EAN
          categoryId
          subcategoryId
          description
          id
          inStock
          images
          name
          price
          subcategory {
            name
            id
          }
          category {
            name
            id
          }
        }}`
      }).valueChanges
  }

  // Get categories and subcategories for filter component
  getProductCategories() {
    return this.apollo
      .watchQuery({
        query: gql`
          {
            category {
          id
          name
          subcategories {
            name
            id
            categoryId
          }
        }}
        `,
      }).valueChanges
  }

  getSuggestedProducts() {
    return this.apollo
      .watchQuery({
        query: gql`
        {
        product(limit: 10) {
          EAN
          categoryId
          description
          id
          inStock
          images
          name
          price
          subcategory {
            name
            id
          }
          category {
            name
            id
          }}}`,
      }).valueChanges
  }
}
