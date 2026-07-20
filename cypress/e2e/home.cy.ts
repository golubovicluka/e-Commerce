describe('Home storefront', () => {
  beforeEach(() => {
    cy.mockCatalog();
    cy.clearLocalStorage();
    cy.visit('/home');
    cy.wait(['@gqlGetProductsByIds', '@gqlGetSuggestedProducts']);
  });

  it('renders the current hero, service standards, and catalog entry points', () => {
    cy.title().should('eq', 'Shoply — Technology for everyday life');
    cy.contains('h1', 'Technology built').should('be.visible');
    cy.contains('.stage-name', 'MacBook Pro M1').should('be.visible');
    cy.contains('.tile-name', 'iPad Pro M2').should('be.visible');
    cy.contains('.tile-name', 'iPhone 14 Pro Max').should('be.visible');
    cy.get('.service-grid').should('contain.text', 'Included').and('contain.text', '2 years');
    cy.contains('a', 'Explore the catalog').should('have.attr', 'href', '/products/search');
  });

  it('searches from the global header', () => {
    cy.get('form.header-search input[aria-label="Search products"]').type('phone{enter}');
    cy.wait('@gqlGetProductsPage');

    cy.location('pathname').should('eq', '/products/search');
    cy.location('search').should('eq', '?q=phone');
    cy.get('.product-card .card-name').should('have.length', 6).and('contain.text', 'Phone');
  });

  it('validates and accepts newsletter signup', () => {
    cy.get('input[aria-label="Email address"]').type('not-an-email');
    cy.contains('button', 'Subscribe').click();
    cy.contains('[role="status"]', 'Invalid email').should('be.visible');
    cy.get('[role="status"] button[aria-label="Dismiss notification"]').click();

    cy.get('input[aria-label="Email address"]').clear().type('shopper@example.com');
    cy.contains('button', 'Subscribe').click();

    cy.contains('[role="status"]', "You're on the list").should('be.visible');
    cy.get('input[aria-label="Email address"]').should('be.disabled').and('have.value', '');
  });

  it('navigates through the footer and opens external links safely', () => {
    cy.window().then((window) => cy.stub(window, 'open').as('windowOpen'));
    cy.get('button[aria-label="GitHub"]').click();
    cy.get('@windowOpen').should(
      'have.been.calledWith',
      'https://github.com/golubovicluka',
      '_blank',
      'noopener,noreferrer',
    );

    cy.get('nav[aria-label="Footer navigation"]').contains('Departments').click();
    cy.wait('@gqlGetProductCategories');
    cy.location('pathname').should('eq', '/categories');
    cy.contains('h1', 'Shop by category').should('be.visible');
  });
});

describe('Home catalog failure state', () => {
  it('shows a useful fallback when latest products cannot load', () => {
    cy.mockCatalog({ failAlways: ['GetSuggestedProducts'] });
    cy.visit('/home');
    cy.wait('@gqlGetSuggestedProducts');

    cy.contains('h3', 'Could not load latest products').should('be.visible');
    cy.contains('a', 'Browse catalog').should('have.attr', 'href', '/products/search');
  });
});
