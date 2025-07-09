describe('Product Browser E2E', () => {
  beforeEach(() => {
    cy.visit('https://digitalzone-jc.netlify.app');
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
  });

  it('Busca un producto por nombre', () => {
    const productName = 'Gaming Laptop Pro';

    cy.get('input[placeholder="Search for a product..."]')
      .should('be.visible')
      .clear()
      .type(productName, { delay: 100 })
      .should('have.value', productName);

    // Espera debounce + carga
    cy.get('.animate-spin').should('exist');
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Verifica que se muestra el producto
    cy.contains(productName, { timeout: 5000 }).should('be.visible');
  });

  it('Filtra los productos por la categoría "PC"', () => {
    const categoryName = 'PC';
    const normalized = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

    // Abre el dropdown de categorías
    cy.get('button[aria-label="Filter by category"]')
      .should('be.visible')
      .click({ force: true });

    // Clic en la opción "PC"
    cy.get(`[data-testid="category-option-${normalized}"]`)
      .should('be.visible')
      .click({ force: true });

    // Esperar a que se actualice la lista de productos
    cy.get('.animate-spin').should('exist');
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Verifica que los productos visibles están relacionados con la categoría "PC"
    cy.get('[data-testid="product-card"]').should('exist').each(($card) => {
      cy.wrap($card).should('contain.text', categoryName);
    });
  });


  it('Filtra productos personalizables con el botón Customize', () => {
    cy.contains('Customize').click({ force: true });

    cy.get('.animate-spin').should('exist');
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Verifica que todos los productos mostrados contienen 'Customizable'
    cy.get('[data-testid="product-card"]').each(($el) => {
      cy.wrap($el).should('contain.text', 'Customizable');
    });
  });
});
