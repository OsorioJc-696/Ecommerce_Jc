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

  it('Filtra por categoría "PC"', () => {
  const categoryName = 'PC';
  const normalized = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  
  // Abre el selector de categoría
  cy.get('[data-testid="category-option-all"]').click({ force: true });

  // Espera a que se muestre la opción deseada
  cy.get(`[data-testid="category-option-${normalized}"]`, { timeout: 6000 }).should('be.visible');

  // Hace clic en la categoría
  cy.get(`[data-testid="category-option-${normalized}"]`).click({ force: true });

  // Espera que cargue
  cy.get('.animate-spin').should('exist');
  cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

  // Verifica que los productos mostrados contienen "PC"
  cy.get('[data-testid="product-card"]').each(($el) => {
    cy.wrap($el).should('contain.text', categoryName);
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
