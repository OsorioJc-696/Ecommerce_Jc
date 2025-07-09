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
  // Paso 1: Abrir el menú de categorías haciendo clic en el botón
  cy.get('button')
    .contains(/^All Categories$/i) // asegúrate que diga "All Categories"
    .should('be.visible')
    .click({ force: true });

  // Paso 2: Esperar a que aparezca la opción "PC"
  cy.get('[data-testid="category-option-pc"]', { timeout: 6000 }).should('be.visible');

  // Paso 3: Hacer clic en la categoría "PC"
  cy.get('[data-testid="category-option-pc"]').click({ force: true });

  // Paso 4: Esperar a que termine el spinner de carga
  cy.get('.animate-spin').should('exist');
  cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

  // Paso 5: Verificar que los productos filtrados tienen relación con "PC"
  cy.get('[data-testid="product-card"]').each(($el) => {
    cy.wrap($el).should('contain.text', 'PC');
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
