const LOCAL_API_BASE_URL = 'http://localhost:3000/api';

// Replace this with your deployed NestJS backend URL before deploying the Angular app.
// Example: https://api.your-domain.com/api
const PRODUCTION_API_BASE_URL = 'https://YOUR_BACKEND_DOMAIN/api';

function isLocalBrowser(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

export const API_BASE_URL = isLocalBrowser() ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL;
