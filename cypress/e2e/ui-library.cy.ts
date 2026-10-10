const routes = ['/home', '/products/search', '/categories', '/product/1', '/wishlist', '/cart', '/404'];

const primeSelectors = [
  '.pi',
  '[class^="pi-"]',
  '[class*=" pi-"]',
  '[class*="p-button"]',
  '[class*="p-inputtext"]',
  '[class*="p-component"]',
  'p-gallery',
  '[class*="p-gallery"]',
  '[class*="col-12"]',
].join(', ');

const cobalt = 'rgb(22, 93, 255)';

function visitWithCatalog(path: string, alias?: string): void {
  cy.mockCatalog();
  cy.visit(path);
  if (alias) cy.wait(alias);
}

function expectTablerIcon(selector: string): void {
  cy.get(selector)
    .should('be.visible')
    .and(($icon) => {
      const style = getComputedStyle($icon[0]);
      const mask = style.maskImage || style.webkitMaskImage;
      expect(mask, 'icon mask').to.contain('data:image/svg+xml');
      expect($icon[0].getBoundingClientRect().width, 'icon width').to.be.greaterThan(0);
    });
}

describe('UI library migration', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('ships no PrimeNG, PrimeFlex, or PrimeIcons markup or styles on any route', () => {
    cy.mockCatalog();
    routes.forEach((path) => {
      cy.visit(path);
      cy.get('main, #main-content').should('exist');
      cy.get('body').find(primeSelectors).should('have.length', 0);
    });

    cy.document().then((document) => {
      const sheets = Array.from(document.styleSheets);
      const primeRule = sheets.some((sheet) => {
        try {
          return Array.from(sheet.cssRules).some((rule) => /\.p-(button|component|gallery)|\.pi-|primeicons/.test(rule.cssText));
        } catch {
          return false;
        }
      });
      expect(primeRule, 'PrimeUI CSS rules').to.equal(false);
    });
  });

  it('renders Tabler icons through Iconify in the shell', () => {
    cy.viewport(1280, 900);
    visitWithCatalog('/home', '@gqlGetProductsByIds');

    expectTablerIcon('a[aria-label="Wishlist"] [class*="icon-[tabler--heart]"]');
    expectTablerIcon('a[aria-label="Cart"] [class*="icon-[tabler--shopping-cart]"]');
    expectTablerIcon('form.header-search [class*="icon-[tabler--search]"]');
  });

  it('applies the FlyonUI shoply theme to primary actions and fields', () => {
    visitWithCatalog('/home', '@gqlGetProductsByIds');

    cy.contains('a', 'Explore the catalog')
      .should('have.class', 'btn')
      .and('have.class', 'btn-primary')
      .and('have.css', 'background-color', cobalt);

    cy.get('input[aria-label="Email address"]').should('have.class', 'input');

    cy.visit('/products/search');
    cy.wait('@gqlGetProductsPage');
    cy.get('select[aria-label="Sort products"]').should('have.class', 'select');
    cy.get('.filters-panel input[type="checkbox"]').first().should('have.class', 'checkbox');
    cy.get('.filters-panel input[type="range"]').should('have.length', 2).first().should('have.class', 'range');
  });

  it('shows FlyonUI badges, breadcrumbs, and alerts', () => {
    visitWithCatalog('/products/search', '@gqlGetProductsPage');

    cy.get('nav[aria-label="Breadcrumb"]').should('have.class', 'breadcrumbs');
    expectTablerIcon('nav[aria-label="Breadcrumb"] [class*="icon-[tabler--home]"]');

    cy.get('button[aria-label="Add MacBook Pro M1 to wishlist"]').click();
    cy.get('a[aria-label="Wishlist"] .icon-count')
      .should('have.text', '1')
      .and('have.class', 'badge');
    cy.contains('[role="status"]', 'Added to wishlist')
      .should('have.class', 'alert')
      .and('have.class', 'alert-success');

    cy.get('button[aria-label="Dismiss notification"]').first().click();
    cy.contains('[role="status"]', 'Added to wishlist').should('not.exist');
  });

  it('keeps responsive visibility rules from the previous grid system', () => {
    cy.viewport(1280, 900);
    visitWithCatalog('/products/search', '@gqlGetProductsPage');
    cy.get('nav.nav-links').should('be.visible');
    cy.get('form.header-search').should('be.visible');
    cy.get('button[aria-label="Open menu"]').should('not.be.visible');
    cy.get('button[aria-label="Toggle search"]').should('not.be.visible');
    cy.get('button[aria-controls="catalog-filters"]').should('not.be.visible');
    cy.get('[role="group"][aria-label="Product layout"]').should('be.visible');

    cy.viewport(375, 812);
    cy.get('nav.nav-links').should('not.be.visible');
    cy.get('form.header-search').should('not.be.visible');
    cy.get('button[aria-label="Open menu"]').should('be.visible');
    cy.get('button[aria-label="Toggle search"]').should('be.visible');
    cy.get('button[aria-controls="catalog-filters"]').should('be.visible');
    cy.get('[role="group"][aria-label="Product layout"]').should('not.be.visible');
  });

  it('lays out the product grid with the same column counts per breakpoint', () => {
    const columnsAt = (width: number, expected: number) => {
      cy.viewport(width, 900);
      cy.get('.product-card').then(($cards) => {
        const firstRowTop = Math.round($cards[0].getBoundingClientRect().top);
        const inFirstRow = $cards.filter((_, card) => Math.round(card.getBoundingClientRect().top) === firstRowTop);
        expect(inFirstRow.length, `columns at ${width}px`).to.equal(expected);
      });
    };

    visitWithCatalog('/products/search', '@gqlGetProductsPage');
    cy.get('.product-card').should('have.length', 10);
    columnsAt(1440, 4);
    columnsAt(1100, 3);
    columnsAt(700, 2);
  });

  it('toggles the mobile filters panel with matching icons', () => {
    cy.viewport(375, 812);
    visitWithCatalog('/products/search', '@gqlGetProductsPage');

    cy.get('button[aria-controls="catalog-filters"]')
      .should('have.attr', 'aria-expanded', 'false')
      .find('[class*="icon-[tabler--adjustments-horizontal]"]')
      .should('exist');

    cy.get('button[aria-controls="catalog-filters"]').click();
    cy.get('button[aria-controls="catalog-filters"]')
      .should('have.attr', 'aria-expanded', 'true')
      .and('contain.text', 'Close filters')
      .find('[class*="icon-[tabler--x]"]')
      .should('exist');
    cy.get('#catalog-filters').should('be.visible');
  });
});
