describe('Wishlist', () => {
  beforeEach(() => {
    cy.mockCatalog();
    cy.clearLocalStorage();
    cy.visit('/products/search');
    cy.wait('@gqlGetProductsPage');
  });

  it('adds, persists, and removes a saved product', () => {
    cy.get('button[aria-label="Add MacBook Pro M1 to wishlist"]').click();
    cy.get('a[aria-label="Wishlist"] .icon-count').should('have.text', '1');

    cy.reload();
    cy.wait('@gqlGetProductsPage');
    cy.get('button[aria-label="Remove MacBook Pro M1 from wishlist"]').should('exist');

    cy.get('a[aria-label="Wishlist"]').click();
    cy.contains('h1', 'Your wishlist').should('be.visible');
    cy.contains('.wishlist-row', 'MacBook Pro M1').should('be.visible');

    cy.get('button[aria-label="Remove MacBook Pro M1 from wishlist"]').click();
    cy.contains('h3', 'Your wishlist is empty').should('be.visible');
    cy.get('a[aria-label="Wishlist"] .icon-count').should('not.exist');
  });

  it('adds a wishlist product to the cart without removing it from the wishlist', () => {
    cy.get('button[aria-label="Add MacBook Pro M1 to wishlist"]').click();
    cy.get('a[aria-label="Wishlist"]').click();

    cy.contains('.list-card button', 'Add to cart').click();

    cy.get('a[aria-label="Cart"] .icon-count').should('have.text', '1');
    cy.contains('.wishlist-row', 'MacBook Pro M1').should('be.visible');
  });

  it('toggles a wishlist product from the catalog', () => {
    cy.get('button[aria-label="Add MacBook Pro M1 to wishlist"]').click();
    cy.get('button[aria-label="Remove MacBook Pro M1 from wishlist"]').click();

    cy.get('button[aria-label="Add MacBook Pro M1 to wishlist"]').should('exist');
    cy.contains('[role="status"]', 'Removed from wishlist').should('be.visible');
  });
});
