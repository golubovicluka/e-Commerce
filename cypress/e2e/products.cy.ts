describe('Catalog discovery', () => {
  beforeEach(() => {
    cy.mockCatalog();
    cy.clearLocalStorage();
    cy.visit('/products/search');
    cy.wait('@gqlGetProductsPage');
  });

  it('renders a paginated catalog and switches layouts', () => {
    cy.contains('h1', 'All products').should('be.visible');
    cy.contains('.results-count', '13 products').should('be.visible');
    cy.get('.product-card').should('have.length', 10);

    cy.get('button[aria-label="List view"]').click();
    cy.get('.list-card').should('have.length', 10);
    cy.get('button[aria-label="List view"]').should('have.attr', 'aria-pressed', 'true');

    cy.get('button[aria-label="Grid view"]').click();
    cy.get('.product-card').should('have.length', 10);
  });

  it('searches, filters, and sorts with server-side GraphQL variables', () => {
    cy.get('.products-results input[aria-label="Search products"]').type('Phone');
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.name._ilike')
      .should('eq', '%Phone%');
    cy.get('.product-card').should('have.length', 6);

    cy.get('.products-results input[aria-label="Search products"]').clear();
    cy.get('.product-card').should('have.length', 10);
    cy.get('label[for="filter-2"]').click();
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.subcategory.name._in')
      .should('deep.equal', ['Laptops']);
    cy.get('.card-kicker').should('contain.text', 'Laptops');

    cy.get('select[aria-label="Sort products"]').select('Price: High to Low');
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.orderBy.0.price')
      .should('eq', 'desc');
    cy.get('.card-name').first().should('contain.text', 'iPad Pro M2');
  });

  it('moves between server-side pages and changes page size', () => {
    cy.contains('.catalog-pagination', 'Page 1 of 2').should('be.visible');
    cy.contains('.catalog-pagination button', 'Next').click();
    cy.wait('@gqlGetProductsPage').its('request.body.variables.offset').should('eq', 10);
    cy.contains('.catalog-pagination', 'Page 2 of 2').should('be.visible');
    cy.get('.product-card').should('have.length', 3);

    cy.get('.catalog-pagination select').select('20 per page');
    cy.wait('@gqlGetProductsPage').its('request.body.variables.limit').should('eq', 20);
    cy.contains('.catalog-pagination', 'Page 1 of 1').should('be.visible');
    cy.get('.product-card').should('have.length', 13);
  });

  it('opens a category and carries its filter into the catalog', () => {
    cy.get('nav.nav-links').contains('Categories').click();
    cy.wait('@gqlGetProductCategories');
    cy.contains('.category-tile', 'Electronics').click();
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.category.name._eq')
      .should('eq', 'Electronics');

    cy.location('pathname').should('eq', '/products/search');
    cy.contains('h1', 'All products').should('be.visible');
  });

  it('opens product details, updates wishlist, and buys the product', () => {
    cy.contains('.card-name', 'MacBook Pro M1').click();
    cy.wait('@gqlGetProductsByCategory');
    cy.location('pathname').should('eq', '/product/1');
    cy.contains('h1', 'MacBook Pro M1').should('be.visible');

    cy.get('button[aria-label="Add to wishlist"]').click();
    cy.contains('[role="status"]', 'Added to wishlist').should('be.visible');
    cy.get('a[aria-label="Wishlist"] .icon-count').should('have.text', '1');

    cy.contains('button', 'Buy now').click();
    cy.location('pathname').should('eq', '/cart');
    cy.contains('.cart-item-card', 'MacBook Pro M1').should('be.visible');
  });
});

describe('Catalog recovery and direct product routes', () => {
  it('retries a failed catalog page', () => {
    cy.mockCatalog({ failOnce: ['GetProductsPage'] });
    cy.visit('/products/search');
    cy.wait('@gqlGetProductsPage');
    cy.contains('h3', 'Catalog unavailable').should('be.visible');

    cy.contains('button', 'Try again').click();
    cy.wait('@gqlGetProductsPage');
    cy.get('.product-card').should('have.length', 10);
  });

  it('loads a directly visited product and redirects unknown products to 404', () => {
    cy.mockCatalog();
    cy.visit('/product/4');
    cy.wait('@gqlGetProductById');
    cy.contains('h1', 'iPhone 14 Pro Max').should('be.visible');

    cy.visit('/product/999');
    cy.wait('@gqlGetProductById');
    cy.location('pathname').should('eq', '/404');
    cy.contains("This aisle doesn't exist").should('be.visible');
  });
});
