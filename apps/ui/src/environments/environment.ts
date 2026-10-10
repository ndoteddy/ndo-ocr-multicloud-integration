export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000',
  // Dev-only convenience value; must match the backend's API_KEY env var.
  // See apps/backend/.env.example. Never bake a real secret into a shipped
  // frontend bundle — see docs/ARCHITECTURE.md for the production caveat.
  apiKey: 'test-api-key',
};
