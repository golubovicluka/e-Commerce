export interface Product {
  id: number
  name: string
  description: string
  categoryId: number
  subcategoryId: number
  category?: Category
  subcategory?: Subcategory
  price: number
  EAN: number
  inStock: number
  images: string[]
}

export interface ProductDTO {
  data: {
    product: Product[]
  }
}

export interface Category {
  id: number
  name: string
}

export interface Subcategory {
  id: number
  name: string
}
