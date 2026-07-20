export interface CatalogProduct {
  __typename: 'product';
  id: number;
  name: string;
  description: string;
  categoryId: number;
  subcategoryId: number;
  category: { __typename: 'category'; id: number; name: string };
  subcategory: { __typename: 'subcategory'; id: number; name: string };
  price: number;
  EAN: number;
  inStock: number;
  images: string[];
}

const category = { __typename: 'category' as const, id: 1, name: 'Electronics' };

export const catalogProducts: CatalogProduct[] = Array.from({ length: 13 }, (_, index) => {
  const id = index + 1;
  const isLaptop = id % 2 === 1;
  return {
    __typename: 'product',
    id,
    name: isLaptop ? `Work Laptop ${id}` : `Smart Phone ${id}`,
    description: `Reliable test catalog product ${id}`,
    categoryId: category.id,
    subcategoryId: isLaptop ? 2 : 1,
    category,
    subcategory: {
      __typename: 'subcategory',
      id: isLaptop ? 2 : 1,
      name: isLaptop ? 'Laptops' : 'Smartphones',
    },
    price: id * 10_000,
    EAN: 8_600_000_000_000 + id,
    inStock: id === 12 ? 0 : id + 2,
    images: ['/assets/images/product-placeholder.png'],
  };
});

catalogProducts[0] = {
  ...catalogProducts[0],
  name: 'MacBook Pro M1',
  description: 'Apple silicon workstation with all-day battery.',
};
catalogProducts[3] = {
  ...catalogProducts[3],
  name: 'iPhone 14 Pro Max',
  description: '6.7-inch OLED phone with an A16 Bionic processor.',
};
catalogProducts[12] = {
  ...catalogProducts[12],
  name: 'iPad Pro M2',
  description: 'Portable tablet with Apple Pencil hover.',
};

export const catalogCategories = [
  {
    __typename: 'category',
    id: 1,
    name: 'Electronics',
    subcategories: [
      { __typename: 'subcategory', id: 1, name: 'Smartphones', categoryId: 1 },
      { __typename: 'subcategory', id: 2, name: 'Laptops', categoryId: 1 },
    ],
  },
  {
    __typename: 'category',
    id: 2,
    name: 'Home',
    subcategories: [{ __typename: 'subcategory', id: 3, name: 'Accessories', categoryId: 2 }],
  },
];
