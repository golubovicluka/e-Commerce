const minSlider = 'input[aria-label="Minimum price slider"]';
const maxSlider = 'input[aria-label="Maximum price slider"]';
const minInput = 'input[aria-label="Minimum price"]';
const maxInput = 'input[aria-label="Maximum price"]';

function slide(selector: string, value: number) {
  // Dual-range inputs set pointer-events: none on the <input> track and
  // pointer-events: auto on ::-webkit-slider-thumb / ::-moz-range-thumb so
  // the stacked tracks do not block each other's thumbs.
  cy.get(selector)
    .scrollIntoView()
    .should('be.visible')
    .and('be.enabled')
    .invoke('val', value)
    .trigger('input', { force: true })
    .trigger('change', { force: true });
}

describe('Catalog filters', () => {
  beforeEach(() => {
    cy.mockCatalog();
    cy.clearLocalStorage();
    cy.visit('/products/search');
    cy.wait(['@gqlGetProductsPage', '@gqlGetPriceBounds', '@gqlGetProductCategories']);
    cy.contains('.results-count', '13 products').should('be.visible');
  });

  it('keeps the filter panel mounted while products reload', () => {
    cy.get('#catalog-filters').then(($panel) => {
      cy.get('label[for="filter-2"]').click();
      cy.wait('@gqlGetProductsPage');
      slide(minSlider, 30000);
      cy.wait('@gqlGetProductsPage');

      cy.get('#catalog-filters').should(($after) => {
        expect($after[0]).to.equal($panel[0]);
      });
    });
    cy.get('#filter-2').should('be.checked');
  });

  it('combines several subcategories across categories', () => {
    cy.get('label[for="filter-2"]').click();
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.subcategory.name._in')
      .should('deep.equal', ['Laptops']);
    cy.contains('.results-count', '7 products').should('be.visible');

    cy.get('label[for="filter-1"]').click();
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.subcategory.name._in')
      .should('deep.equal', ['Laptops', 'Smartphones']);
    cy.contains('.results-count', '13 products').should('be.visible');
    cy.get('#filter-1').should('be.checked');
    cy.get('#filter-2').should('be.checked');

    cy.get('label[for="filter-3"]').click();
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.subcategory.name._in')
      .should('deep.equal', ['Laptops', 'Smartphones', 'Accessories']);
    cy.get('#filter-1').should('be.checked');
    cy.get('#filter-2').should('be.checked');
    cy.get('#filter-3').should('be.checked');

    cy.get('label[for="filter-1"]').click();
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.subcategory.name._in')
      .should('deep.equal', ['Laptops', 'Accessories']);
    cy.contains('.results-count', '7 products').should('be.visible');
    cy.get('.card-kicker').each(($kicker) => {
      expect($kicker.text()).to.contain('Laptops');
    });
    cy.get('#filter-1').should('not.be.checked');
    cy.get('#filter-2').should('be.checked');
    cy.get('#filter-3').should('be.checked');

    cy.get('label[for="filter-2"]').click();
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.subcategory.name._in')
      .should('deep.equal', ['Accessories']);
    cy.contains('.results-count', '0 products').should('be.visible');

    cy.get('label[for="filter-3"]').click();
    cy.get('#catalog-filters input[type="checkbox"]:checked').should('have.length', 0);
    cy.contains('.results-count', '13 products').should('be.visible');
  });

  it('filters by the price slider without letting the thumbs cross', () => {
    cy.get(minSlider).should('have.value', '10000');
    cy.get(maxSlider).should('have.value', '130000');
    cy.contains('.price-label', '10,000 – 130,000 RSD').scrollIntoView().should('be.visible');

    slide(minSlider, 30000);
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.price')
      .should('deep.equal', { _gte: 30000, _lte: 130000 });
    cy.contains('.results-count', '11 products').should('be.visible');

    slide(maxSlider, 80000);
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables')
      .should((variables) => {
        expect(variables.where.price).to.deep.equal({ _gte: 30000, _lte: 80000 });
        expect(variables.offset).to.equal(0);
      });
    cy.contains('.results-count', '6 products').should('be.visible');
    cy.get('.product-card').should('have.length', 6);
    cy.contains('.price-label', '30,000 – 80,000 RSD').should('be.visible');
    cy.get(minInput).should('have.value', '30000');
    cy.get(maxInput).should('have.value', '80000');

    slide(minSlider, 120000);
    cy.get(minSlider).should('have.value', '80000');
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.price')
      .should('deep.equal', { _gte: 80000, _lte: 80000 });
    cy.contains('.results-count', '1 products').should('be.visible');

    slide(minSlider, 10000);
    cy.wait('@gqlGetProductsPage');
    slide(maxSlider, 130000);
    cy.contains('.price-label', '10,000 – 130,000 RSD').should('be.visible');
    cy.contains('.results-count', '13 products').should('be.visible');
  });

  it('filters by typed prices and clamps them to the available range', () => {
    cy.get(minInput).clear().type('50000').blur();
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.price')
      .should('deep.equal', { _gte: 50000, _lte: 130000 });
    cy.get(minSlider).should('have.value', '50000');
    cy.contains('.results-count', '9 products').should('be.visible');

    cy.get(maxInput).clear().type('999999').blur();
    cy.get(maxInput).should('have.value', '130000');

    cy.get(maxInput).clear().type('20000').blur();
    cy.get(maxInput).should('have.value', '50000');
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where.price')
      .should('deep.equal', { _gte: 50000, _lte: 50000 });
    cy.contains('.results-count', '1 products').should('be.visible');
  });

  it('combines price and subcategory filters', () => {
    cy.get('label[for="filter-1"]').click();
    cy.wait('@gqlGetProductsPage');
    slide(maxSlider, 60000);
    cy.wait('@gqlGetProductsPage')
      .its('request.body.variables.where')
      .should('deep.equal', {
        subcategory: { name: { _in: ['Smartphones'] } },
        price: { _gte: 10000, _lte: 60000 },
      });
    cy.contains('.results-count', '3 products').should('be.visible');
    cy.get('#filter-1').should('be.checked');
  });
});
