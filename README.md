## [Demo](https://ecommerce-app-angular.netlify.app/)

# Shoply

**Shoply** is an Angular 22 storefront for browsing a Hasura-backed technology catalog. It supports server-side search, filtering, sorting and pagination, plus browser-persisted cart and wishlist flows.

## Key Features

- **Product Catalog**: Browse an extensive range of products, categorized for easy navigation.
- **Product Details**: Access comprehensive information about each product, including images, descriptions, and prices.
- **Sorting and Pagination**: Organize products by price with server-side pagination.
- **Suggested Products**: Discover related products tailored to your preferences.
- **Advanced Filtering**: Narrow down your search by category, price range, and other attributes.
- **Search Functionality**: Quickly find products using a robust search feature. 🔍
- **Dynamic Views**: Switch between list and grid views to suit your browsing preferences.
- **Price Range Slider**: Adjust your budget with a responsive price range slider.
- **Shopping Cart & Checkout**: Manage your cart, review your order, and proceed to payment with ease. 🛒
- **Local Storage Integration**: Save wishlist items and cart contents in local storage, ensuring that your selections persist even after refreshing the page.
- **Automated Testing**: Jest component and service tests with enforced 100% code coverage, plus deterministic Cypress browser flows.

## Tech Stack

- **Client:** Angular 22 standalone components, signals, lightweight native UI, PrimeFlex, Apollo Client 4
- **Server:** Hasura GraphQL
- **Tests:** Jest and Cypress

All page routes are lazy loaded. Catalog-only Apollo providers are also loaded on demand, keeping GraphQL code out of the initial application shell.

The project intentionally uses native standalone UI controls and the MIT-licensed PrimeIcons 7 release. PrimeUI 2026 packages require a per-developer license key, so they are not part of the deployable bundle.

## Running End-to-End Tests

Start the application, then run Cypress in headless mode:

```bash
npm start
npm run e2e:ci
```

Use `npm run e2e` instead to open the interactive Cypress runner. The E2E suite intercepts catalog GraphQL requests with deterministic fixtures, so it does not depend on the hosted Hasura service being available.

## Running the Application Locally

1. **Clone the Repository**

   ```bash
   git clone https://github.com/golubovicluka/ecommerce.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd ecommerce
   ```

3. **Install Dependencies**

   ```bash
   npm ci
   ```

4. **Start the Angular Development Server**

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:4200`.

## Quality Checks

Use Node 24.15.0 (the version in `.nvmrc`), then run:

```bash
npm run lint
npm run test:ci
npm run e2e:ci # run while the app is available on http://localhost:4200
npm run build
```

`npm run test:ci` runs Jest once with coverage and fails unless executable code under `src/app` remains at 100% statements, branches, functions, and lines.

The production browser bundle is written to `dist/project/browser`.

   ---
## Note

This project started as an Angular learning exercise and is now maintained on the current Angular architecture.
   ---

## Author

- [@golubovicluka](https://github.com/golubovicluka)
