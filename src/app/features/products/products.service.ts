import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from './Product';
import { Apollo, ApolloBase, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private apollo: Apollo) { }

  // Get all products
  getProducts(sortBy?: string) {
    if (sortBy) {
      return this.apollo
        .watchQuery({
          query: gql`
          {
            product(order_by: {price: ${sortBy}}) {
                  EAN
                  categoryId
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
    return this.apollo
      .watchQuery({
        query: gql`
          {
            product {
                  EAN
                  categoryId
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

  searchProducts(searchInput: string) {
    return this.apollo
      .watchQuery({
        query: gql`
          {
            product(where: { name: { _ilike: "%${searchInput}%" } }) {
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
    if (filter.length < 1) {
      return this.getProducts();
    }
    return this.apollo
      .watchQuery({
        query: gql`
      {
        product(where: {subcategory: {name: {_in: [${filter.map(f => `"${f}"`)}]}}}) {
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
}


