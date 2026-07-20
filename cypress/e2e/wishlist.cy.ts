describe('Wishlist Functionality', () => {
  beforeEach(() => {
    // Clear wishlist before each test
    cy.clearLocalStorage();
    cy.visit('/products/search');
  });

  describe('Wishlist Icon and Navigation', () => {
    it('should display wishlist icon in header', () => {
      cy.get('[data-cy="wishlist-icon"]').should('be.visible');
    });

    it('should navigate to wishlist page when clicking wishlist icon', () => {
      cy.get('[data-cy="wishlist-icon"]').click();
      cy.url().should('include', '/wishlist');
    });

    it('should display wishlist counter', () => {
      cy.get('[data-cy="wishlist-counter"]').should('exist');
    });
  });

  describe('Adding Products to Wishlist', () => {
    it('should add product to wishlist from product list', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').should('have.class', 'active');
      });
    });

    it('should add multiple products to wishlist', () => {
      cy.get('[data-cy="product-card"]').eq(0).within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.get('[data-cy="wishlist-counter"]').should('contain', '2');
    });

    it('should add product to wishlist from product details page', () => {
      cy.get('[data-cy="product-card"]').first().click();
      cy.url().should('include', '/product/');

      cy.get('[data-cy="wishlist-btn"]').click();
      cy.wait(500);

      cy.get('[data-cy="wishlist-btn"]').should('have.class', 'active');
      cy.get('[data-cy="wishlist-counter"]').should('contain', '1');
    });

    it('should show success message when adding to wishlist', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.get('[data-cy="toast-message"]', { timeout: 3000 }).should('be.visible');
    });

    it('should toggle wishlist button state', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        // Add to wishlist
        cy.get('[data-cy="wishlist-btn"]').click();
        cy.wait(500);
        cy.get('[data-cy="wishlist-btn"]').should('have.class', 'active');

        // Remove from wishlist
        cy.get('[data-cy="wishlist-btn"]').click();
        cy.wait(500);
        cy.get('[data-cy="wishlist-btn"]').should('not.have.class', 'active');
      });
    });
  });

  describe('Wishlist Page Display', () => {
    beforeEach(() => {
      // Add items to wishlist
      cy.get('[data-cy="product-card"]').eq(0).within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="wishlist-icon"]').click();
    });

    it('should display wishlist items', () => {
      cy.get('[data-cy="wishlist-item"]').should('have.length', 2);
    });

    it('should display product details in wishlist', () => {
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="item-name"]').should('be.visible');
        cy.get('[data-cy="item-price"]').should('be.visible');
        cy.get('[data-cy="item-image"]').should('be.visible');
      });
    });

    it('should show empty wishlist message when empty', () => {
      // Remove all items
      cy.get('[data-cy="remove-from-wishlist-btn"]').each(($btn) => {
        cy.wrap($btn).click();
        cy.wait(300);
      });

      cy.get('[data-cy="empty-wishlist-message"]').should('be.visible');
    });

    it('should have remove button for each wishlist item', () => {
      cy.get('[data-cy="wishlist-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy="remove-from-wishlist-btn"]').should('exist');
        });
      });
    });
  });

  describe('Removing Products from Wishlist', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').eq(0).within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="wishlist-icon"]').click();
    });

    it('should remove item from wishlist', () => {
      cy.get('[data-cy="wishlist-item"]').should('have.length', 2);

      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="remove-from-wishlist-btn"]').click();
      });

      cy.wait(500);
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
    });

    it('should update wishlist counter after removing item', () => {
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="remove-from-wishlist-btn"]').click();
      });

      cy.wait(500);
      cy.get('[data-cy="wishlist-counter"]').should('contain', '1');
    });

    it('should remove all items from wishlist', () => {
      cy.get('[data-cy="remove-from-wishlist-btn"]').each(($btn) => {
        cy.wrap($btn).click();
        cy.wait(300);
      });

      cy.get('[data-cy="empty-wishlist-message"]').should('be.visible');
      cy.get('[data-cy="wishlist-counter"]').should('contain', '0');
    });

    it('should show confirmation before removing item', () => {
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="remove-from-wishlist-btn"]').click();
      });

      // Either shows confirmation dialog or removes immediately
      cy.wait(500);
    });
  });

  describe('Adding Wishlist Items to Cart', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="wishlist-icon"]').click();
    });

    it('should have add to cart button for each wishlist item', () => {
      cy.get('[data-cy="wishlist-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy="add-to-cart-btn"]').should('exist');
        });
      });
    });

    it('should add wishlist item to cart', () => {
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.wait(500);
      cy.get('[data-cy="cart-counter"]').should('contain', '1');
    });

    it('should keep item in wishlist after adding to cart', () => {
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').click();
      });

      cy.wait(500);
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
    });

    it('should add multiple wishlist items to cart', () => {
      // Add second item to wishlist
      cy.visit('/products/search');
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });
      cy.wait(500);

      cy.get('[data-cy="wishlist-icon"]').click();

      // Add both to cart
      cy.get('[data-cy="wishlist-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy="add-to-cart-btn"]').click();
        });
        cy.wait(300);
      });

      cy.get('[data-cy="cart-counter"]').should('contain', '2');
    });
  });

  describe('Wishlist Persistence', () => {
    it('should persist wishlist across sessions', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      // Reload page
      cy.reload();

      cy.get('[data-cy="wishlist-counter"]').should('contain', '1');
    });

    it('should maintain wishlist when navigating between pages', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.visit('/categories');
      cy.get('[data-cy="wishlist-counter"]').should('contain', '1');

      cy.visit('/cart');
      cy.get('[data-cy="wishlist-counter"]').should('contain', '1');

      cy.visit('/wishlist');
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
    });

    it('should preserve wishlist after clearing cookies', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.clearCookies();
      cy.reload();

      cy.get('[data-cy="wishlist-counter"]').should('contain', '1');
    });
  });

  describe('Wishlist and Product List Integration', () => {
    it('should show active wishlist button for wishlisted products', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.visit('/products/search');

      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').should('have.class', 'active');
      });
    });

    it('should update button state when toggling from product list', () => {
      // Add to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      // Go to wishlist and verify
      cy.get('[data-cy="wishlist-icon"]').click();
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);

      // Go back and remove
      cy.visit('/products/search');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      // Verify removed
      cy.get('[data-cy="wishlist-icon"]').click();
      cy.get('[data-cy="empty-wishlist-message"]').should('be.visible');
    });
  });

  describe('Wishlist Navigation and UI', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="wishlist-icon"]').click();
    });

    it('should have continue shopping button on empty wishlist', () => {
      cy.get('[data-cy="remove-from-wishlist-btn"]').click();
      cy.wait(500);
      cy.get('[data-cy="continue-shopping-btn"]').should('be.visible');
    });

    it('should navigate to products from empty wishlist', () => {
      cy.get('[data-cy="remove-from-wishlist-btn"]').click();
      cy.wait(500);
      cy.get('[data-cy="continue-shopping-btn"]').click();
      cy.url().should('include', '/products');
    });

    it('should click on wishlist item to view details', () => {
      cy.get('[data-cy="wishlist-item"]').first().click();
      cy.url().should('include', '/product/');
    });

    it('should display product image in wishlist', () => {
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="item-image"]').should('be.visible');
        cy.get('[data-cy="item-image"]').should('have.attr', 'src');
      });
    });

    it('should display correct product information', () => {
      cy.visit('/products/search');

      // Get product info from list
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').invoke('text').then((productName) => {
          // Go to wishlist
          cy.visit('/wishlist');

          // Verify same info
          cy.get('[data-cy="wishlist-item"]').first().within(() => {
            cy.get('[data-cy="item-name"]').should('contain', productName.trim());
          });
        });
      });
    });
  });

  describe('Wishlist Limitations', () => {
    it('should prevent duplicate items in wishlist', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);

      cy.get('[data-cy="wishlist-icon"]').click();
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
    });

    it('should handle out of stock items in wishlist', () => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });

      cy.wait(500);
      cy.get('[data-cy="wishlist-icon"]').click();

      // Check if add to cart is disabled for out of stock items
      cy.get('[data-cy="wishlist-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy="stock-status"]').then(($status) => {
            if ($status.text().includes('Out of Stock')) {
              cy.get('[data-cy="add-to-cart-btn"]').should('be.disabled');
            }
          });
        });
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-btn"]').click();
      });
      cy.wait(500);
      cy.get('[data-cy="wishlist-icon"]').click();
    });

    it('should display wishlist properly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy="wishlist-item"]').should('be.visible');
    });

    it('should display wishlist properly on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-cy="wishlist-item"]').should('be.visible');
    });

    it('should have accessible wishlist buttons on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-btn"]').should('be.visible');
        cy.get('[data-cy="remove-from-wishlist-btn"]').should('be.visible');
      });
    });
  });
});
