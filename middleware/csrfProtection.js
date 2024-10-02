import csurf from "csurf";

// CSRF protection middleware
export const csrfProtection = csurf({ cookie: true });
