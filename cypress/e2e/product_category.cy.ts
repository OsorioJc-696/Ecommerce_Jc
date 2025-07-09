describe('Product Category Filter', () => {
  beforeEach(() => {
    cy.visit('https://digitalzone-jc.netlify.app/products'); // Asegúrate que la ruta sea correcta
  });

  it('should display all categories and filter products correctly', () => {
    // Verifica que el botón "All" esté visible
    cy.contains('button', 'All').should('be.visible');

    // Guarda todas las categorías en una lista (puedes ajustar si es dinámico)
    const categories = ['Laptops', 'Phones', 'Accessories'];

    // Para cada categoría, haz clic y verifica que los productos filtrados correspondan
    categories.forEach((category) => {
      cy.contains('button', category).click();

      // Esperamos que los productos mostrados tengan esa categoría en alguna parte visible
      cy.get('[data-testid="product-card"]').each(($card) => {
        cy.wrap($card)
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            expect(text.toLowerCase()).to.include(category.toLowerCase());
          });
      });
    });

    // Regresar a "All"
    cy.contains('button', 'All').click();

    // Espera que haya más de una categoría representada
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', categories.length);
  });
});
