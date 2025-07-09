describe('Product Browser E2E', () => {
  beforeEach(() => {
    cy.visit('https://digitalzone-jc.netlify.app');
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist'); // Aumentamos el timeout por seguridad
  });

  it('Busca un producto por nombre', () => {
    const productName = 'Gaming Laptop Pro';

    cy.get('input[placeholder="Search for a product..."]')
      .should('be.visible')
      .clear()
      .type(productName, { delay: 100 }) // simulate user typing slowly
      .should('have.value', productName);

    // Espera debounce + carga
    cy.get('.animate-spin').should('exist');
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Verifica que se muestra el producto
    cy.contains(productName, { timeout: 5000 }).should('be.visible');
  });

  it('Filtra por categoría "PC"', () => {
  // Encuentra y abre el dropdown de categoría
  cy.get('button')
    .contains(/all categories/i) // detecta el texto, sin importar mayúsculas
    .should('be.visible')
    .click({ force: true });

  // Espera a que se rendericen las opciones (role="option")
  cy.get('[role="option"]', { timeout: 6000 }).should('exist');

  // Selecciona la categoría "PC"
  cy.get('[role="option"]')
    .contains(/^PC$/) // solo "PC", no cosas como "PC Gaming"
    .click({ force: true });

  // Espera a que se muestren los productos (loading → no loading)
  cy.get('.animate-spin').should('exist');
  cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

  // Verifica que todos los productos mostrados pertenecen a la categoría "PC"
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
