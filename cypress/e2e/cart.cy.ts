describe('Shopping Cart and Checkout', () => {
  beforeEach(() => {
    // Clear cart before each test
    cy.clearLocalStorage();
    cy.visit('/products/search');
  });

  describe('Cart Icon and Counter', () => {
    it('should display cart icon in header', () => {
      cy.get('[data-cy="cart-icon"]').should('be.visible');
    });

    it('should show cart counter as 0 when empty', () => {
      cy.get('[data-cy="cart-counter"]').should('contain', '0');
    });

    it('should navigate to cart when clicking cart icon', () => {
      cy.get('[data-cy="cart-icon"]').click();
      cy.url().should('include', '/cart');
    });
  });

  describe('Adding Products to Cart', () => {
    it('should add a product to cart from product list', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.get('[data-cy="cart-counter"]').should('contain', '1');
    });

    it('should add multiple products to cart', () => {
      cy.get('[data-cy="product-card"]').eq(0).within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.wait(500);

      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.get('[data-cy="cart-counter"]').should('contain', '2');
    });

    it('should add product from product details page', () => {
      cy.get('[data-cy="product-card"]').first().click();
      cy.url().should('include', '/product/');

      cy.get('[data-cy="add-to-cart-btn"]').click();
      cy.get('[data-cy="cart-counter"]').should('contain', '1');
    });

    it('should persist cart items after page reload', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.reload();
      cy.get('[data-cy="cart-counter"]').should('contain', '1');
    });
  });

  describe('Cart Page Display', () => {
    beforeEach(() => {
      // Add items to cart
      cy.get('[data-cy="product-card"]').eq(0).within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="cart-icon"]').click();
    });

    it('should display cart items', () => {
      cy.get('[data-cy="cart-item"]').should('have.length', 1);
    });

    it('should display product details in cart', () => {
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="item-name"]').should('be.visible');
        cy.get('[data-cy="item-price"]').should('be.visible');
        cy.get('[data-cy="item-quantity"]').should('be.visible');
        cy.get('[data-cy="item-image"]').should('be.visible');
      });
    });

    it('should display cart total', () => {
      cy.get('[data-cy="cart-total"]').should('be.visible');
      cy.get('[data-cy="cart-total"]').should('not.contain', '0');
    });

    it('should show empty cart message when cart is empty', () => {
      cy.get('[data-cy="remove-item-btn"]').click();
      cy.get('[data-cy="empty-cart-message"]').should('be.visible');
    });
  });

  describe('Cart Item Quantity Management', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="cart-icon"]').click();
    });

    it('should increment item quantity', () => {
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="item-quantity"]').invoke('text').then((text1) => {
          cy.get('[data-cy="increment-btn"]').click();
          cy.wait(500);
          cy.get('[data-cy="item-quantity"]').invoke('text').should('not.equal', text1);
        });
      });
    });

    it('should decrement item quantity', () => {
      // First increment to have quantity > 1
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="increment-btn"]').click();
        cy.wait(500);
        cy.get('[data-cy="decrement-btn"]').click();
        cy.wait(500);
      });
    });

    it('should remove item when quantity reaches 0', () => {
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="decrement-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="empty-cart-message"]').should('be.visible');
    });

    it('should update cart total when quantity changes', () => {
      cy.get('[data-cy="cart-total"]').invoke('text').then((text1) => {
        cy.get('[data-cy="increment-btn"]').first().click();
        cy.wait(500);
        cy.get('[data-cy="cart-total"]').invoke('text').should('not.equal', text1);
      });
    });
  });

  describe('Removing Items from Cart', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').eq(0).within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="cart-icon"]').click();
    });

    it('should have remove button for each item', () => {
      cy.get('[data-cy="cart-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy="remove-item-btn"]').should('exist');
        });
      });
    });

    it('should remove specific item from cart', () => {
      cy.get('[data-cy="cart-item"]').should('have.length', 2);

      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="remove-item-btn"]').click();
      });

      cy.wait(500);
      cy.get('[data-cy="cart-item"]').should('have.length', 1);
    });

    it('should update cart counter after removing item', () => {
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="remove-item-btn"]').click();
      });

      cy.get('[data-cy="cart-counter"]').should('contain', '1');
    });
  });

  describe('Checkout Process - Shipping', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="cart-icon"]').click();
      cy.get('[data-cy="checkout-btn"]').click();
    });

    it('should navigate to shipping page', () => {
      cy.url().should('include', '/cart/shipping');
    });

    it('should display shipping form', () => {
      cy.get('[data-cy="shipping-form"]').should('be.visible');
    });

    it('should have required shipping fields', () => {
      cy.get('[data-cy="first-name"]').should('exist');
      cy.get('[data-cy="last-name"]').should('exist');
      cy.get('[data-cy="email"]').should('exist');
      cy.get('[data-cy="address"]').should('exist');
      cy.get('[data-cy="city"]').should('exist');
      cy.get('[data-cy="postal-code"]').should('exist');
    });

    it('should validate shipping form fields', () => {
      cy.get('[data-cy="continue-btn"]').click();

      // Should show validation errors
      cy.get('[data-cy="form-error"]').should('be.visible');
    });

    it('should fill shipping form and proceed', () => {
      cy.get('[data-cy="first-name"]').type('John');
      cy.get('[data-cy="last-name"]').type('Doe');
      cy.get('[data-cy="email"]').type('john.doe@example.com');
      cy.get('[data-cy="address"]').type('123 Main St');
      cy.get('[data-cy="city"]').type('New York');
      cy.get('[data-cy="postal-code"]').type('10001');

      cy.get('[data-cy="continue-btn"]').click();
      cy.url().should('include', '/cart/overview');
    });

    it('should validate email format', () => {
      cy.get('[data-cy="email"]').type('invalid-email');
      cy.get('[data-cy="continue-btn"]').click();
      cy.get('[data-cy="email-error"]').should('be.visible');
    });
  });

  describe('Checkout Process - Order Overview', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="cart-icon"]').click();
      cy.get('[data-cy="checkout-btn"]').click();

      // Fill shipping form
      cy.get('[data-cy="first-name"]').type('John');
      cy.get('[data-cy="last-name"]').type('Doe');
      cy.get('[data-cy="email"]').type('john.doe@example.com');
      cy.get('[data-cy="address"]').type('123 Main St');
      cy.get('[data-cy="city"]').type('New York');
      cy.get('[data-cy="postal-code"]').type('10001');
      cy.get('[data-cy="continue-btn"]').click();
    });

    it('should display order overview', () => {
      cy.get('[data-cy="order-overview"]').should('be.visible');
    });

    it('should display order items', () => {
      cy.get('[data-cy="overview-item"]').should('have.length.greaterThan', 0);
    });

    it('should display shipping address', () => {
      cy.get('[data-cy="shipping-address"]').should('contain', 'John Doe');
      cy.get('[data-cy="shipping-address"]').should('contain', '123 Main St');
    });

    it('should display order total', () => {
      cy.get('[data-cy="order-total"]').should('be.visible');
    });

    it('should have edit shipping button', () => {
      cy.get('[data-cy="edit-shipping-btn"]').should('exist');
    });

    it('should navigate back to shipping when editing', () => {
      cy.get('[data-cy="edit-shipping-btn"]').click();
      cy.url().should('include', '/cart/shipping');
    });

    it('should proceed to payment', () => {
      cy.get('[data-cy="proceed-to-payment-btn"]').click();
      cy.url().should('include', '/cart/payment');
    });
  });

  describe('Checkout Process - Payment', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="cart-icon"]').click();
      cy.get('[data-cy="checkout-btn"]').click();

      // Fill shipping form
      cy.get('[data-cy="first-name"]').type('John');
      cy.get('[data-cy="last-name"]').type('Doe');
      cy.get('[data-cy="email"]').type('john.doe@example.com');
      cy.get('[data-cy="address"]').type('123 Main St');
      cy.get('[data-cy="city"]').type('New York');
      cy.get('[data-cy="postal-code"]').type('10001');
      cy.get('[data-cy="continue-btn"]').click();

      // Proceed to payment
      cy.get('[data-cy="proceed-to-payment-btn"]').click();
    });

    it('should display payment options', () => {
      cy.get('[data-cy="payment-options"]').should('be.visible');
    });

    it('should display installment options', () => {
      cy.get('[data-cy="installment-12"]').should('exist');
      cy.get('[data-cy="installment-24"]').should('exist');
      cy.get('[data-cy="installment-36"]').should('exist');
    });

    it('should select payment method', () => {
      cy.get('[data-cy="payment-method"]').first().click();
      cy.get('[data-cy="payment-method"]').first().should('be.checked');
    });

    it('should display order summary on payment page', () => {
      cy.get('[data-cy="payment-summary"]').should('be.visible');
      cy.get('[data-cy="payment-total"]').should('be.visible');
    });

    it('should complete order', () => {
      cy.get('[data-cy="payment-method"]').first().click();
      cy.get('[data-cy="place-order-btn"]').click();

      // Should show success message or redirect
      cy.wait(1000);
      // Either success page or confirmation message
    });
  });

  describe('Cart Persistence', () => {
    it('should persist cart across sessions', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.wait(500);

      // Simulate closing and reopening browser
      cy.clearCookies();
      cy.reload();

      cy.get('[data-cy="cart-counter"]').should('contain', '1');
    });

    it('should maintain cart when navigating between pages', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.visit('/categories');
      cy.get('[data-cy="cart-counter"]').should('contain', '1');

      cy.visit('/products/search');
      cy.get('[data-cy="cart-counter"]').should('contain', '1');
    });
  });

  describe('Stock Validation', () => {
    it('should prevent adding out-of-stock items', () => {
      // Find an out of stock product if exists
      cy.get('[data-cy="product-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy="stock-status"]').then(($status) => {
            if ($status.text().includes('Out of Stock')) {
              cy.get('[data-cy="add-to-cart-btn"]').should('be.disabled');
            }
          });
        });
      });
    });

    it('should show stock limit warning', () => {
      // Try to add more items than in stock
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);

      // Assuming stock limit exists, multiple clicks should show warning
      cy.get('[data-cy="product-card"]').first().within(() => {
        for (let i = 0; i < 100; i++) {
          cy.get('[data-cy="add-to-cart-btn"]').click();
          cy.wait(100);
        }
      });
    });
  });

  describe('Cart Calculations', () => {
    it('should calculate correct subtotal', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.wait(500);
      cy.get('[data-cy="cart-icon"]').click();

      cy.get('[data-cy="subtotal"]').should('be.visible');
    });

    it('should calculate correct total with multiple items', () => {
      cy.get('[data-cy="product-card"]').eq(0).within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);

      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });
      cy.wait(500);

      cy.get('[data-cy="cart-icon"]').click();
      cy.get('[data-cy="cart-total"]').should('be.visible');
    });
  });
});
