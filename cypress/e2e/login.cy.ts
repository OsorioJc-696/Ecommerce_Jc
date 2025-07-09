describe('Flujo de Inicio de Sesión', () => {
    beforeEach(() => {
      cy.visit('https://digitalzone-jc.netlify.app/login');
    });
  
    it('Muestra errores si los campos están vacíos', () => {
      cy.get('form').submit();
  
      cy.contains('Login Failed').should('be.visible');
      cy.contains('Please enter both username/email and password.').should('be.visible');
    });
  
    it('Muestra error con credenciales incorrectas', () => {
      cy.get('#identifier').type('usuarioinvalido');
      cy.get('#password').type('claveincorrecta');
  
      cy.get('button[type="submit"]').click();
  
      cy.contains('Login Failed', { timeout: 5000 }).should('be.visible');
      cy.contains('Invalid credentials').should('be.visible'); // Asegúrate que este mensaje venga del backend
    });
  
    it('Inicia sesión exitosamente con credenciales válidas', () => {
      cy.get('#identifier').type('UserCypress'); // Usa usuario real
      cy.get('#password').type('123123123'); // Usa la contraseña real
  
      cy.get('button[type="submit"]').click();
  
      // Espera a que redireccione o aparezca contenido del dashboard
      cy.url({ timeout: 10000 }).should('not.include', '/login');
      cy.contains('Welcome', { timeout: 10000 }).should('exist'); // Ajusta a un texto que esté visible tras el login
    });
  });
  