describe('Agregar producto específico al carrito', () => {
  it('Agrega el cuarto producto desde el catálogo al carrito', () => {
    cy.visit('https://digitalzone-jc.netlify.app/products');

    // Espera que se carguen los productos
    cy.get('[aria-label^="Product card for"]', { timeout: 8000 }).should('have.length.at.least', 4);

    // Selecciona el cuarto producto y hace clic en el botón "Add to Cart"
    cy.get('[aria-label^="Product card for"]').eq(4).within(() => {
    cy.get('[data-testid="add-to-cart-button"]').click();
    });


    // Verifica que el toast se muestre
    cy.contains('Added to cart').should('be.visible');

    // Ir al carrito
    cy.visit('https://digitalzone-jc.netlify.app/cart');

    // Verifica que al menos 1 producto esté en el carrito
    cy.get('[data-testid="cart-item"]').should('have.length.at.least', 1);
  });
});
