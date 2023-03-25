import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from './Product';
import { Apollo, ApolloBase, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private apollo: Apollo) {
  }

  // Get all products
  getProducts() {
    return this.apollo
      .watchQuery({
        query: gql`
          {
            product {
            id
            category
            description
            images
            inStock
            name
            price
            productId
            subCategory
            }
          }
        `,
      }).valueChanges
  }

  getProductByCategory(category: string) {
    return this.apollo
      .watchQuery({
        query: gql`
        {
        product(where: {subCategory: {_like: "${category}%"}}) {
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
        product_by_pk(id: ${id}) {
        category
        description
        id
        images
        name
        inStock
        price
        productId
        subCategory
      }}`
      })
  }

}
