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
  const normalized = categoryName.toLowerCase(); // "pc"

  // ✅ Espera que los productos iniciales se carguen (indicador de loading desaparece)
  cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

  // ✅ Asegura que los productos están visibles
  cy.get('[data-testid="product-card"]').should('exist');

  // ✅ Luego abre el dropdown de categorías
  cy.get('[data-testid="category-select-trigger"]')
    .should('be.visible')
    .click({ force: true });

  // ✅ Espera a que se rendericen las opciones
  cy.get(`[data-testid^="category-option-"]`, { timeout: 5000 }).should('exist');

  // ✅ Selecciona la categoría deseada
  cy.get(`[data-testid="category-option-${normalized}"]`)
    .should('be.visible')
    .click({ force: true });

  // ✅ Espera nueva carga (si hay loading)
  cy.get('.animate-spin').should('exist');
  cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

  // ✅ Verifica productos filtrados por categoría
  cy.get('[data-testid="product-card"]').each(($card) => {
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
