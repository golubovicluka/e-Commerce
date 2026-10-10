describe('Product image viewer', () => {
  beforeEach(() => {
    cy.mockCatalog();
    cy.clearLocalStorage();
    cy.viewport(1280, 900);
    cy.visit('/product/1');
    cy.wait('@gqlGetProductById');
    cy.contains('h1', 'MacBook Pro M1').should('be.visible');
  });

  const viewer = () => cy.get('section.product-image-viewer');
  const image = () => cy.get('.viewer-image');

  it('renders a native, labelled viewer with toolbar controls and thumbnails', () => {
    viewer()
      .should('have.attr', 'role', 'region')
      .and('have.attr', 'aria-label', 'MacBook Pro M1 image viewer');
    cy.contains('.viewer-counter', '1 / 2').should('be.visible');
    cy.contains('Click the image to zoom').should('be.visible');

    ['Rotate image left', 'Zoom out', 'Zoom in', 'Toggle fullscreen image viewer'].forEach((label) => {
      cy.get(`button[aria-label="${label}"]`).should('be.visible').and('have.class', 'btn');
    });
    cy.get('button[aria-label="Zoom out"]').should('be.disabled');

    cy.get('.viewer-thumbnail-button').should('have.length', 2);
    cy.get('button[aria-label="Show MacBook Pro M1 photo 1"]').should('have.attr', 'aria-current', 'true');
    image().should('have.attr', 'alt', 'MacBook Pro M1 photo 1');
  });

  it('navigates with buttons, thumbnails, and wraps around', () => {
    cy.get('button[aria-label="Next product image"]').click();
    cy.contains('.viewer-counter', '2 / 2').should('be.visible');
    image().should('have.attr', 'alt', 'MacBook Pro M1 photo 2');
    cy.get('button[aria-label="Show MacBook Pro M1 photo 2"]').should('have.attr', 'aria-current', 'true');

    cy.get('button[aria-label="Next product image"]').click();
    cy.contains('.viewer-counter', '1 / 2').should('be.visible');

    cy.get('button[aria-label="Previous product image"]').click();
    cy.contains('.viewer-counter', '2 / 2').should('be.visible');

    cy.get('button[aria-label="Show MacBook Pro M1 photo 1"]').click();
    cy.contains('.viewer-counter', '1 / 2').should('be.visible');
    cy.get('button[aria-label="Show MacBook Pro M1 photo 2"]').should('not.have.attr', 'aria-current');
  });

  it('navigates with the keyboard arrow keys', () => {
    viewer().focus().trigger('keydown', { key: 'ArrowRight' });
    cy.contains('.viewer-counter', '2 / 2').should('be.visible');
    viewer().trigger('keydown', { key: 'ArrowLeft' });
    cy.contains('.viewer-counter', '1 / 2').should('be.visible');
    viewer().trigger('keydown', { key: 'ArrowLeft' });
    cy.contains('.viewer-counter', '2 / 2').should('be.visible');
  });

  it('zooms, rotates, and resets the view when the image changes', () => {
    image().should('have.attr', 'style').and('contain', 'scale(1) rotate(0deg)');

    cy.get('button[aria-label="Zoom in"]').click().click();
    image().should('have.attr', 'style').and('contain', 'scale(2)');
    cy.get('button[aria-label="Zoom out"]').should('not.be.disabled');

    cy.get('button[aria-label="Zoom in"]').click().click();
    image().should('have.attr', 'style').and('contain', 'scale(3)');
    cy.get('button[aria-label="Zoom in"]').should('be.disabled');

    cy.get('button[aria-label="Zoom out"]').click();
    image().should('have.attr', 'style').and('contain', 'scale(2.5)');

    cy.get('button[aria-label="Rotate image left"]').click();
    image().should('have.attr', 'style').and('contain', 'rotate(-90deg)');

    cy.get('button[aria-label="Next product image"]').click();
    image().should('have.attr', 'style').and('contain', 'scale(1) rotate(0deg)');
    cy.get('button[aria-label="Zoom out"]').should('be.disabled');
  });

  it('toggles zoom by activating the image', () => {
    cy.get('button[aria-label="Toggle image zoom"]').should('have.attr', 'aria-pressed', 'false').click();
    image().should('have.class', 'is-zoomed').and('have.attr', 'style').and('contain', 'scale(2.5)');
    cy.get('button[aria-label="Toggle image zoom"]').should('have.attr', 'aria-pressed', 'true');

    cy.get('button[aria-label="Toggle image zoom"]').focus().type('{enter}');
    image().should('not.have.class', 'is-zoomed').and('have.attr', 'style').and('contain', 'scale(1)');
  });

  it('requests and exits fullscreen through the Fullscreen API', () => {
    viewer().then(($viewer) => {
      cy.stub($viewer[0], 'requestFullscreen').as('requestFullscreen').resolves();
    });
    cy.get('button[aria-label="Toggle fullscreen image viewer"]')
      .find('[class*="icon-[tabler--maximize]"]')
      .should('exist');

    cy.get('button[aria-label="Toggle fullscreen image viewer"]').click();
    cy.get('@requestFullscreen').should('have.been.calledOnce');

    cy.document().then((document) => {
      viewer().then(($viewer) => {
        Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => $viewer[0] });
        cy.stub(document, 'exitFullscreen').as('exitFullscreen').resolves();
        document.dispatchEvent(new Event('fullscreenchange'));
      });
    });
    cy.get('button[aria-label="Toggle fullscreen image viewer"]')
      .find('[class*="icon-[tabler--minimize]"]')
      .should('exist');

    cy.get('button[aria-label="Toggle fullscreen image viewer"]').click();
    cy.get('@exitFullscreen').should('have.been.calledOnce');

    cy.document().then((document) => {
      Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => null });
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    cy.get('button[aria-label="Toggle fullscreen image viewer"]')
      .find('[class*="icon-[tabler--maximize]"]')
      .should('exist');
  });

  it('keeps the buy panel controls on FlyonUI classes', () => {
    cy.contains('button', 'Buy now').should('have.class', 'btn').and('have.class', 'btn-primary');
    cy.get('select[aria-label="Number of monthly installments"]').should('have.class', 'select').select('24');
    cy.get('.installment-text').should('contain.text', 'or 24').and('contain.text', '416');

    cy.get('button[aria-label="Add to wishlist"]').click();
    cy.get('button[aria-label="Remove from wishlist"]')
      .find('[class*="icon-[tabler--heart-filled]"]')
      .should('exist');
  });
});
