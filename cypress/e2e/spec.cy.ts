describe('Application shell and responsive routes', () => {
  it('redirects unknown routes to the not-found page and returns home', () => {
    cy.mockCatalog();
    cy.visit('/does-not-exist');
    cy.location('pathname').should('eq', '/404');
    cy.contains("This aisle doesn't exist").should('be.visible');

    cy.contains('button', 'Back to the shop').click();
    cy.wait('@gqlGetProductsByIds');
    cy.location('pathname').should('eq', '/home');
  });

  it('supports mobile menu and mobile search navigation', () => {
    cy.viewport(375, 812);
    cy.mockCatalog();
    cy.visit('/home');
    cy.wait('@gqlGetProductsByIds');

    cy.get('button[aria-label="Open menu"]').click();
    cy.get('nav[aria-label="Mobile navigation"]').should('be.visible').contains('Products').click();
    cy.wait('@gqlGetProductsPage');
    cy.location('pathname').should('eq', '/products/search');

    cy.visit('/home');
    cy.wait('@gqlGetProductsByIds');
    cy.get('button[aria-label="Toggle search"]').click().should('have.attr', 'aria-expanded', 'true');
    cy.get('.mobile-search-bar input[aria-label="Search products"]').type('iPhone');
    cy.get('button[aria-label="Submit search"]').click();
    cy.wait('@gqlGetProductsPage');
    cy.location('search').should('eq', '?q=iPhone');
    cy.contains('.card-name', 'iPhone 14 Pro Max').should('be.visible');
  });

  it('provides a skip link to the main application content', () => {
    cy.mockCatalog();
    cy.visit('/home');
    cy.get('a.skip-link').should('have.attr', 'href', '#main-content');
    cy.get('#main-content').should('exist');
  });
});
