const LOCAL_API_BASE_URL = 'http://localhost:3000/api';

const PRODUCTION_API_BASE_URL = 'http://kaamo.ir/api';

function isLocalBrowser(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

export const API_BASE_URL = isLocalBrowser() ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL;
