describe('Flujo completo: producto, login, perfil y checkout', () => {
  it('Proceso de pago con tarjeta', () => {
    // 1. AGREGAR PRODUCTO AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/products');
    cy.get('[aria-label^="Product card for"]', { timeout: 8000 }).should('have.length.at.least', 5);
    cy.get('[aria-label^="Product card for"]').eq(4).within(() => {
      cy.get('[data-testid="add-to-cart-button"]').click();
    });
    cy.contains('Added to cart', { timeout: 5000 }).should('be.visible');
    cy.wait(1000);

    // 2. LOGIN
    cy.visit('https://digitalzone-jc.netlify.app/login');
    cy.get('#identifier').type('UserCypress');
    cy.get('#password').type('123123123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.contains('Welcome', { timeout: 10000 }).should('exist');

    // 3. EDITAR PERFIL
    cy.get('#radix-«r2» > .relative > .flex').click();
    cy.get('#radix-«r3» > [href="/profile"]').click();
    cy.get('.flex-grow > .justify-center').click();

    cy.get('[role="dialog"]', { timeout: 5000 }).within(() => {
      cy.get('input[name="username"]').clear().type('UserCypress');
      cy.get('input[name="dni"]').clear().type('12345670');
      cy.get('input[name="firstName"]').clear().type('Alex');
      cy.get('input[name="lastName"]').clear().type('Morgan');
      cy.get('input[name="phoneNumber"]').clear().type('987654321');
      cy.get('input[name="address"]').clear().type('123 Main St');
      cy.get('.flex-col-reverse > .bg-primary').click(); // Guardar
    });

    // Esperar confirmación de guardado
    cy.get('.fixed > .group', { timeout: 12000 }).should('be.visible');

    // 4. IR AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/cart');
    cy.get('[data-testid="cart-item"]', { timeout: 10000 }).should('have.length.at.least', 1);


    // 5. IR A CHECKOUT
    cy.get('a.w-full > .inline-flex').click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/checkout');

    // 6. NO EDITAR CAMPOS DE ENVÍO – ya están cargados desde perfil
// Dirección
cy.get('#«r0»-form-item').click().type('123 Main St', { delay: 50 });

// Email
cy.get('#«r1»-form-item').click().type('testuser@example.com', { delay: 50 });


    // 7. MÉTODO DE PAGO
    const metodoPago = 'tarjeta'; 

    if (metodoPago === 'tarjeta') {
      cy.get('#«r3»-form-item').click();

      // Formulario de tarjeta
      cy.get('input[name="cardNumber"]').type('4111111111111111');
      cy.get('input[name="expiryDate"]').type('12/25');
      cy.get('input[name="cvv"]').type('123');
      cy.get('input[name="postalCode"]').type('12001');

      // Finalizar compra
      cy.get('.space-y-6 > .inline-flex').click();
    } else {
      const selectors = {
        yape: '#«r6»-form-item > :nth-child(2) > .text-sm',
        plin: ':nth-child(3) > .text-sm > span',
        tunki: ':nth-child(4) > .text-sm > span',
        paypal: ':nth-child(5) > .text-sm > span',
      };

      cy.get(selectors[metodoPago]).click({ force: true });
      cy.contains(/place order|finalize|complete/i).click({ force: true });
    }

    // 8. CONFIRMAR COMPRA
    cy.contains(/thank you|order confirmed|success/i, { timeout: 10000 }).should('be.visible');
  });
  it('Proceso de pago con yape', () => {
    // 1. AGREGAR PRODUCTO AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/products');
    cy.get('[aria-label^="Product card for"]', { timeout: 8000 }).should('have.length.at.least', 5);
    cy.get('[aria-label^="Product card for"]').eq(4).within(() => {
      cy.get('[data-testid="add-to-cart-button"]').click();
    });
    cy.contains('Added to cart', { timeout: 5000 }).should('be.visible');
    cy.wait(1000);

    // 2. LOGIN
    cy.visit('https://digitalzone-jc.netlify.app/login');
    cy.get('#identifier').type('UserCypress');
    cy.get('#password').type('123123123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.contains('Welcome', { timeout: 10000 }).should('exist');

    // 3. EDITAR PERFIL
    cy.get('#radix-«r2» > .relative > .flex').click();
    cy.get('#radix-«r3» > [href="/profile"]').click();
    cy.get('.flex-grow > .justify-center').click();

    cy.get('[role="dialog"]', { timeout: 5000 }).within(() => {
      cy.get('input[name="username"]').clear().type('UserCypress');
      cy.get('input[name="dni"]').clear().type('12345670');
      cy.get('input[name="firstName"]').clear().type('Alex');
      cy.get('input[name="lastName"]').clear().type('Morgan');
      cy.get('input[name="phoneNumber"]').clear().type('987654321');
      cy.get('input[name="address"]').clear().type('123 Main St');
      cy.get('.flex-col-reverse > .bg-primary').click(); // Guardar
    });

    // Esperar confirmación de guardado
    cy.get('.fixed > .group', { timeout: 12000 }).should('be.visible');

    // 4. IR AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/cart');
    cy.get('[data-testid="cart-item"]', { timeout: 10000 }).should('have.length.at.least', 1);


    // 5. IR A CHECKOUT
    cy.get('a.w-full > .inline-flex').click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/checkout');

    // 6. NO EDITAR CAMPOS DE ENVÍO – ya están cargados desde perfil
// Dirección
cy.get('#«r0»-form-item').click().type('123 Main St', { delay: 50 });

// Email
cy.get('#«r1»-form-item').click().type('testuser@example.com', { delay: 50 });


    // 7. MÉTODO DE PAGO
    const metodoPago = 'yape';

    if (metodoPago === 'yape') {
      cy.get('#«r5»-form-item').click();

      
      // Finalizar compra
      cy.get('.space-y-6 > .inline-flex').click();
    } else {
      const selectors = {
        yape: '#«r6»-form-item > :nth-child(2) > .text-sm',
        plin: ':nth-child(3) > .text-sm > span',
        tunki: ':nth-child(4) > .text-sm > span',
        paypal: ':nth-child(5) > .text-sm > span',
      };

      cy.get(selectors[metodoPago]).click({ force: true });
      cy.contains(/place order|finalize|complete/i).click({ force: true });
    }

    // 8. CONFIRMAR COMPRA
    cy.contains(/thank you|order confirmed|success/i, { timeout: 10000 }).should('be.visible');
  });
  it('Proceso de pago con plin', () => {
    // 1. AGREGAR PRODUCTO AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/products');
    cy.get('[aria-label^="Product card for"]', { timeout: 8000 }).should('have.length.at.least', 5);
    cy.get('[aria-label^="Product card for"]').eq(4).within(() => {
      cy.get('[data-testid="add-to-cart-button"]').click();
    });
    cy.contains('Added to cart', { timeout: 5000 }).should('be.visible');
    cy.wait(1000);

    // 2. LOGIN
    cy.visit('https://digitalzone-jc.netlify.app/login');
    cy.get('#identifier').type('UserCypress');
    cy.get('#password').type('123123123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.contains('Welcome', { timeout: 10000 }).should('exist');

    // 3. EDITAR PERFIL
    cy.get('#radix-«r2» > .relative > .flex').click();
    cy.get('#radix-«r3» > [href="/profile"]').click();
    cy.get('.flex-grow > .justify-center').click();

    cy.get('[role="dialog"]', { timeout: 5000 }).within(() => {
      cy.get('input[name="username"]').clear().type('UserCypress');
      cy.get('input[name="dni"]').clear().type('12345670');
      cy.get('input[name="firstName"]').clear().type('Alex');
      cy.get('input[name="lastName"]').clear().type('Morgan');
      cy.get('input[name="phoneNumber"]').clear().type('987654321');
      cy.get('input[name="address"]').clear().type('123 Main St');
      cy.get('.flex-col-reverse > .bg-primary').click(); // Guardar
    });

    // Esperar confirmación de guardado
    cy.get('.fixed > .group', { timeout: 12000 }).should('be.visible');

    // 4. IR AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/cart');
    cy.get('[data-testid="cart-item"]', { timeout: 10000 }).should('have.length.at.least', 1);


    // 5. IR A CHECKOUT
    cy.get('a.w-full > .inline-flex').click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/checkout');

    // 6. NO EDITAR CAMPOS DE ENVÍO – ya están cargados desde perfil
// Dirección
cy.get('#«r0»-form-item').click().type('123 Main St', { delay: 50 });

// Email
cy.get('#«r1»-form-item').click().type('testuser@example.com', { delay: 50 });


    // 7. MÉTODO DE PAGO
    const metodoPago = 'plin'; 

    if (metodoPago === 'plin') {
      cy.get('#«r7»-form-item').click();

      
      // Finalizar compra
      cy.get('.space-y-6 > .inline-flex').click();
    } else {
      const selectors = {
        yape: '#«r6»-form-item > :nth-child(2) > .text-sm',
        plin: ':nth-child(3) > .text-sm > span',
        tunki: ':nth-child(4) > .text-sm > span',
        paypal: ':nth-child(5) > .text-sm > span',
      };

      cy.get(selectors[metodoPago]).click({ force: true });
      cy.contains(/place order|finalize|complete/i).click({ force: true });
    }

    // 8. CONFIRMAR COMPRA
    cy.contains(/thank you|order confirmed|success/i, { timeout: 10000 }).should('be.visible');
  });
  it('Proceso de pago con tunki', () => {
    // 1. AGREGAR PRODUCTO AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/products');
    cy.get('[aria-label^="Product card for"]', { timeout: 8000 }).should('have.length.at.least', 5);
    cy.get('[aria-label^="Product card for"]').eq(4).within(() => {
      cy.get('[data-testid="add-to-cart-button"]').click();
    });
    cy.contains('Added to cart', { timeout: 5000 }).should('be.visible');
    cy.wait(1000);

    // 2. LOGIN
    cy.visit('https://digitalzone-jc.netlify.app/login');
    cy.get('#identifier').type('UserCypress');
    cy.get('#password').type('123123123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.contains('Welcome', { timeout: 10000 }).should('exist');

    // 3. EDITAR PERFIL
    cy.get('#radix-«r2» > .relative > .flex').click();
    cy.get('#radix-«r3» > [href="/profile"]').click();
    cy.get('.flex-grow > .justify-center').click();

    cy.get('[role="dialog"]', { timeout: 5000 }).within(() => {
      cy.get('input[name="username"]').clear().type('UserCypress');
      cy.get('input[name="dni"]').clear().type('12345670');
      cy.get('input[name="firstName"]').clear().type('Alex');
      cy.get('input[name="lastName"]').clear().type('Morgan');
      cy.get('input[name="phoneNumber"]').clear().type('987654321');
      cy.get('input[name="address"]').clear().type('123 Main St');
      cy.get('.flex-col-reverse > .bg-primary').click(); // Guardar
    });

    // Esperar confirmación de guardado
    cy.get('.fixed > .group', { timeout: 12000 }).should('be.visible');

    // 4. IR AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/cart');
    cy.get('[data-testid="cart-item"]', { timeout: 10000 }).should('have.length.at.least', 1);


    // 5. IR A CHECKOUT
    cy.get('a.w-full > .inline-flex').click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/checkout');

    // 6. NO EDITAR CAMPOS DE ENVÍO – ya están cargados desde perfil
// Dirección
cy.get('#«r0»-form-item').click().type('123 Main St', { delay: 50 });

// Email
cy.get('#«r1»-form-item').click().type('testuser@example.com', { delay: 50 });


    // 7. MÉTODO DE PAGO
    const metodoPago = 'tunki'; 

    if (metodoPago === 'tunki') {
      cy.get('#«r9»-form-item').click();

      
      // Finalizar compra
      cy.get('.space-y-6 > .inline-flex').click();
    } else {
      const selectors = {
        yape: '#«r6»-form-item > :nth-child(2) > .text-sm',
        plin: ':nth-child(3) > .text-sm > span',
        tunki: ':nth-child(4) > .text-sm > span',
        paypal: ':nth-child(5) > .text-sm > span',
      };

      cy.get(selectors[metodoPago]).click({ force: true });
      cy.contains(/place order|finalize|complete/i).click({ force: true });
    }

    // 8. CONFIRMAR COMPRA
    cy.contains(/thank you|order confirmed|success/i, { timeout: 10000 }).should('be.visible');
  });
  it('Proceso de pago con paypal', () => {
    // 1. AGREGAR PRODUCTO AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/products');
    cy.get('[aria-label^="Product card for"]', { timeout: 8000 }).should('have.length.at.least', 5);
    cy.get('[aria-label^="Product card for"]').eq(4).within(() => {
      cy.get('[data-testid="add-to-cart-button"]').click();
    });
    cy.contains('Added to cart', { timeout: 5000 }).should('be.visible');
    cy.wait(1000);

    // 2. LOGIN
    cy.visit('https://digitalzone-jc.netlify.app/login');
    cy.get('#identifier').type('UserCypress');
    cy.get('#password').type('123123123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.contains('Welcome', { timeout: 10000 }).should('exist');

    // 3. EDITAR PERFIL
    cy.get('#radix-«r2» > .relative > .flex').click();
    cy.get('#radix-«r3» > [href="/profile"]').click();
    cy.get('.flex-grow > .justify-center').click();

    cy.get('[role="dialog"]', { timeout: 5000 }).within(() => {
      cy.get('input[name="username"]').clear().type('UserCypress');
      cy.get('input[name="dni"]').clear().type('12345670');
      cy.get('input[name="firstName"]').clear().type('Alex');
      cy.get('input[name="lastName"]').clear().type('Morgan');
      cy.get('input[name="phoneNumber"]').clear().type('987654321');
      cy.get('input[name="address"]').clear().type('123 Main St');
      cy.get('.flex-col-reverse > .bg-primary').click(); // Guardar
    });

    // Esperar confirmación de guardado
    cy.get('.fixed > .group', { timeout: 12000 }).should('be.visible');

    // 4. IR AL CARRITO
    cy.visit('https://digitalzone-jc.netlify.app/cart');
    cy.get('[data-testid="cart-item"]', { timeout: 10000 }).should('have.length.at.least', 1);


    // 5. IR A CHECKOUT
    cy.get('a.w-full > .inline-flex').click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/checkout');

    // 6. NO EDITAR CAMPOS DE ENVÍO – ya están cargados desde perfil
// Dirección
cy.get('#«r0»-form-item').click().type('123 Main St', { delay: 50 });

// Email
cy.get('#«r1»-form-item').click().type('testuser@example.com', { delay: 50 });


    // 7. MÉTODO DE PAGO
    const metodoPago = 'paypal';

    if (metodoPago === 'paypal') {
      cy.get('#«rb»-form-item').click();

      
      // Finalizar compra
      cy.get('.space-y-6 > .inline-flex').click();
    } else {
      const selectors = {
        yape: '#«r6»-form-item > :nth-child(2) > .text-sm',
        plin: ':nth-child(3) > .text-sm > span',
        tunki: ':nth-child(4) > .text-sm > span',
        paypal: ':nth-child(5) > .text-sm > span',
      };

      cy.get(selectors[metodoPago]).click({ force: true });
      cy.contains(/place order|finalize|complete/i).click({ force: true });
    }

    // 8. CONFIRMAR COMPRA
    cy.contains(/thank you|order confirmed|success/i, { timeout: 10000 }).should('be.visible');
  });
});
