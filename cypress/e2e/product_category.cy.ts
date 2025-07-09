describe('Product Browser E2E', () => {
  beforeEach(() => {
    cy.visit('https://digitalzone-jc.netlify.app');
    cy.get('.animate-spin').should('not.exist'); // Espera a que termine el loading
  });

  it('Busca un producto por nombre', () => {
    cy.get('input[placeholder="Search for a product..."]')
      .should('be.visible')
      .and('not.be.disabled')
      .type('Gaming Laptop Pro');

    // Espera resultados actualizados
    cy.get('.animate-spin').should('not.exist');

    // Verifica que se muestra el producto con ese nombre
    cy.contains('Gaming Laptop Pro').should('be.visible');
  });

  it('Filtra por categoría "PC"', () => {
    // Abrir el dropdown de categorías
    cy.get('[aria-label="Search products"]') // input de búsqueda
      .should('exist');

    cy.get('.lucide-filter').click({ force: true }); // abre dropdown si necesario

    // Abre el trigger manualmente si no se abre automáticamente
    cy.get('[data-state="closed"]').first().click({ force: true });

    // Espera y selecciona la categoría "PC"
    cy.get('[role="option"]').contains('PC').click({ force: true });

    // Espera la actualización
    cy.get('.animate-spin').should('not.exist');

    // Verifica que todos los productos mostrados son de la categoría "PC"
    cy.get('[data-testid="product-card"]').each(($el) => {
      cy.wrap($el).should('contain.text', 'PC');
    });
  });

  it('Filtra productos personalizables con el botón Customize', () => {
    cy.contains('Customize').click();

    // Espera resultados
    cy.get('.animate-spin').should('not.exist');

    // Verifica que todos los productos mostrados son personalizables
    cy.get('[data-testid="product-card"]').each(($el) => {
      cy.wrap($el).should('contain.text', 'Customizable');
    });
  });
});
