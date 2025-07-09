describe('Formulario de Registro en producción', () => {
  const baseUrl = 'https://digitalzone-jc.netlify.app';

  it('Registra un nuevo usuario exitosamente', () => {
    cy.visit(`${baseUrl}/signup`);

    const randomUser = `User${Math.floor(Math.random() * 10000)}`;
    const email = `correo${Math.floor(Math.random() * 10000)}@test.com`;

    cy.get('input[name="username"]').type(randomUser);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('123123123');
    cy.get('input[name="confirmPassword"]').type('123123123');

    // 🔍 Click en el botón correcto
    cy.get('form').find('button[type="submit"]').click();

    // ✅ Verifica que redirige y muestra toast
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.contains('Signup Successful', { timeout: 5000 }).should('exist');
  });

  it('Muestra errores si los campos están vacíos o inválidos', () => {
    cy.visit(`${baseUrl}/signup`);

    cy.get('form').find('button[type="submit"]').click();

    cy.contains('Username is required').should('exist');
    cy.contains('Invalid email address').should('exist');
    cy.contains('Password must be at least 6 characters').should('exist');

    cy.get('input[name="password"]').type('123123');
    cy.get('input[name="confirmPassword"]').type('000000');
    cy.get('form').find('button[type="submit"]').click();

    cy.contains("Passwords don't match").should('exist');
  });
});
