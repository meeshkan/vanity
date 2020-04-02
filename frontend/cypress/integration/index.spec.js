describe('Home page', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('has head metadata', () => {
		cy.get('head title').contains('Vanity');
		cy.get('head meta[name="description"]').should('have.attr', 'content', 'Weekly metrics for your GitHub repos.');
	});

	it('has header navbar', () => {
		cy.get('nav').within(() => {
			cy.contains('a', 'Vanity').should('have.attr', 'href', '/');
			cy.contains('a', 'Source').should('have.attr', 'href', 'https://github.com/meeshkan/vanity');
			cy.get('i').contains('person').parent().should('have.attr', 'href', '/login');
		});
	});

	it('has content', () => {
		cy.get('article').within(() => {
			cy.contains('h2', 'V A N I T Y');
			cy.contains('p', 'weekly metrics for your GitHub repos');
			cy.contains('h3', 'start receiving your metrics');
			cy.contains('a', 'Login with GitHub').should('have.attr', 'href', '/auth/github');
		});
	});

	it('has footer', () => {
		cy.get('footer').within(() => {
			cy.contains('a', 'Twitter').should('have.attr', 'href', 'https://twitter.com/meeshkanml');
			cy.contains('a', 'GitHub').should('have.attr', 'href', 'https://github.com/meeshkan/vanity');
			cy.contains('a', 'Meeshkan').should('have.attr', 'href', 'http://meeshkan.com/');
		});
	});
});

describe('Login page', () => {
	beforeEach(() => {
		cy.visit('/login');
	});

	it('has head metadata', () => {
		cy.get('head title').contains('Vanity');
		cy.get('head meta[name="description"]').should('have.attr', 'content', 'Weekly metrics for your GitHub repos.');
	});

	it('has header navbar', () => {
		cy.get('nav').within(() => {
			cy.contains('a', 'Vanity').should('have.attr', 'href', '/');
			cy.contains('a', 'Source').should('have.attr', 'href', 'https://github.com/meeshkan/vanity');
			cy.get('i').contains('person').parent().should('have.attr', 'href', '/login');
		});
	});

	it('has content', () => {
		cy.get('main').within(() => {
			cy.contains('h3', 'access your metrics preferences');
			cy.contains('a', 'Login with GitHub').should('have.attr', 'href', '/auth/github');
		});
	});

	it('has footer', () => {
		cy.get('footer').within(() => {
			cy.contains('a', 'Twitter').should('have.attr', 'href', 'https://twitter.com/meeshkanml');
			cy.contains('a', 'GitHub').should('have.attr', 'href', 'https://github.com/meeshkan/vanity');
			cy.contains('a', 'Meeshkan').should('have.attr', 'href', 'http://meeshkan.com/');
		});
	});
});

describe('Preferences page', () => {
	it('redirects unauthenticated users to login', () => {
        cy.visit('/preferences');
        cy.url().should('match', /login/);
    });
});
