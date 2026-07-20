describe('Cart and checkout', () => {
  beforeEach(() => {
    cy.mockCatalog();
    cy.clearLocalStorage();
  });

  function addFirstProductToCart(): void {
    cy.visit('/products/search');
    cy.wait('@gqlGetProductsPage');
    cy.get('.product-card').first().find('button[aria-label="Add to cart"]').click();
    cy.get('a[aria-label="Cart"] .icon-count').should('have.text', '1');
    cy.get('a[aria-label="Cart"]').click();
    cy.location('pathname').should('eq', '/cart');
  }

  it('adds an item, updates quantity, persists it, and removes it', () => {
    addFirstProductToCart();
    cy.contains('.cart-item-card', 'MacBook Pro M1').should('be.visible');
    cy.get('.quantity-input').should('have.value', '1');

    cy.get('button[aria-label="Increase quantity"]').click();
    cy.get('.quantity-input').should('have.value', '2');
    cy.contains('.line-total', '20,000').should('be.visible');

    cy.reload();
    cy.get('.quantity-input').should('have.value', '2');
    cy.get('button[aria-label="Remove MacBook Pro M1 from cart"]').click();
    cy.contains('h3', 'Your cart is empty').should('be.visible');
  });

  it('completes every checkout screen and switches payment methods', () => {
    addFirstProductToCart();
    cy.contains('button', 'Proceed with shipping').click();
    cy.location('pathname').should('eq', '/cart/shipping');

    cy.get('#ship-name').type('Luka');
    cy.get('#ship-lastname').type('Golubovic');
    cy.get('#ship-address').type('Knez Mihailova 1');
    cy.get('#ship-postal').type('11000');
    cy.get('#ship-city').type('Belgrade');
    cy.get('#ship-phone').type('+381601234567');
    cy.get('#saveDetails').check();
    cy.contains('a', 'Continue to overview').click();

    cy.location('pathname').should('eq', '/cart/overview');
    cy.contains('h3', 'Review your order').should('be.visible');
    cy.contains('.overview-row', 'MacBook Pro M1').should('be.visible');
    cy.contains('a', 'Continue to payment').click();

    cy.location('pathname').should('eq', '/cart/payment');
    cy.contains('h3', 'How would you like to pay?').should('be.visible');
    cy.get('#pay-card-number').type('4242424242424242');
    cy.get('#paypal').check({ force: true });
    cy.get('#pay-card-number').should('not.exist');
    cy.get('#bankTransfer').check({ force: true });
    cy.contains('button', 'Pay 10,000 RSD').should('be.visible').click();
  });

  it('opens a cart product and returns from checkout to the cart view', () => {
    addFirstProductToCart();
    cy.contains('button', 'Proceed with shipping').click();
    cy.contains('button', 'Back to cart view').click();
    cy.location('pathname').should('eq', '/cart');

    cy.contains('.item-name', 'MacBook Pro M1').click();
    cy.wait('@gqlGetProductById');
    cy.location('pathname').should('eq', '/product/1');
  });

  it('shows the empty-cart state', () => {
    cy.visit('/cart');
    cy.contains('h3', 'Your cart is empty').should('be.visible');
    cy.contains('a', 'Find a product').should('have.attr', 'href', '/products/search');
  });
});
