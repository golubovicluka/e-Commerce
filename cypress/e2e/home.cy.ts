// Home page tests
describe("Home page tests", () => {
    beforeEach(() => {
        cy.visit("http://localhost:4200/home")
    })

    it("should have title 'Webshop'", () => {
        cy.title().should('eq', 'Webshop');
    })

    it('should display carousel header', () => {
        cy.get('h2.center.font-light.m-4.mt-8.pb-3.w-full.h-full')
            .should('exist')
            .and('have.text', 'Our newest products');
    });

    it('should display suggested products', () => {
        cy.get('.p-carousel-item').should('have.length.gte', 1);
    });

    it('should redirect to product details page on clicking', () => {
        cy.get('div.p-carousel-item:nth-child(5) > div:nth-child(1) > app-suggested-product:nth-child(1) > div:nth-child(1)').should('exist').click()
        // Assuming that `redirect` method sets window.location.href to the product details URL
        cy.window().its('location.href').should('contain', '/product/');
    });

    it("should allow user to see home page products", () => {
        cy.get("h2").should("contain.text", "Macbook Air M1").should('be.visible');
        cy.get("h2").should("contain.text", "iPad Pro M2").should('be.visible');
        cy.get("h2").should("contain.text", "iPhone 14 Pro Max").should('be.visible');
    })

    it("should fill in form data", () => {
        cy.get("input[name='name']").type("Katarina");
        cy.get("input[name='surname']").type("Acimovic");
        cy.get("input[name='email']").type("katarinakaca88@gmail.com");
        cy.get('p-button[label="Sign up"]').click();
    })
})

// Footer tests
describe('Footer menu tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200/home')
    })

    it('should display the Shoply logo', () => {
        cy.get('body > app-root > app-footer > div > div:nth-child(1) > span')
            .should('have.text', 'Shoply')
    })

    it('should navigate to Home page', () => {
        cy.get('body > app-root > app-footer > div > div.flex.align-items-center.gap-4.justify-content-between.w-3 > div:nth-child(1) > a:nth-child(1) > span').click()
        cy.url().should('include', '/home')
    })

    it('should navigate to Products page', () => {
        cy.get('body > app-root > app-footer > div > div.flex.align-items-center.gap-4.justify-content-between.w-3 > div:nth-child(1) > a:nth-child(2) > span').click()
        cy.url().should('include', '/products/search')
    })

    it('should navigate to Categories page', () => {
        cy.get('body > app-root > app-footer > div > div.flex.align-items-center.gap-4.justify-content-between.w-3 > div:nth-child(1) > a:nth-child(3) > span').click()
        cy.url().should('include', '/categories')
    })

    it('should have visible LinkedIn icon', () => {
        cy.get('.pi-linkedin').should('exist')
    })

    it('should have visible GitHub icon', () => {
        cy.get('.pi-github').should('exist')
    })
})

// Header tests
describe('Header menu tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200/home')
    })

    it("should navigate to Home page on clicking Home link", () => {
        cy.get(".header li").contains("Home").click();
        cy.url().should("include", "/home");
    });

    it("should navigate to Products page on clicking Products link", () => {
        cy.get(".header li").contains("Products").click();
        cy.url().should("include", "/products/search");
    });

    it("should navigate to Categories page on clicking Categories link", () => {
        cy.get(".header li").contains("Categories").click();
        cy.url().should("include", "/categories");
    });

    it("should navigate to Login page on clicking Login link", () => {
        cy.get(".header li").contains("Login").click();
        cy.url().should("include", "/login");
    });

    it("should navigate to Wishlist page on clicking Wishlist link", () => {
        cy.get(".header li").contains("Wishlist").click();
        cy.url().should("include", "/wishlist");
    });

    it("should navigate to Cart page on clicking Cart link", () => {
        cy.get(".header li").contains("Cart").click();
        cy.url().should("include", "/cart");
    });
})