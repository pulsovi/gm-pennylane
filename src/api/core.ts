import { sleep } from "../_";

let apiRequestWait: Promise<void> | null = null;

export async function apiRequest (endpoint: string, data: Record<string, unknown> | null, method = 'POST') {
  if (apiRequestWait) await apiRequestWait;
  const response = await fetch(`${location.href.split('/').slice(0, 5).join('/')}/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-COMPANY-CONTEXT-DATA-UPDATED-AT": "2024-03-25T20:22:38.289Z",
      "X-PLAN-USED-BY-FRONT-END": "v1_saas_free",
      "X-FRONTEND-LAST-APPLICATION-LOADED-AT": "2024-03-25T20:22:37.968Z",
      "X-CSRF-TOKEN": getCookies('my_csrf_token'),
      "X-DEPLOYMENT": "2023-04-19",
      "X-SOURCE-VERSION": "e0c18c0",
      "X-SOURCE-VERSION-BUILT-AT": "2024-03-25T18:05:09.769Z",
      "X-DOCUMENT-REFERRER": location.origin + location.pathname,
      Accept: 'application/json'
    },
    body: data ? JSON.stringify(data) : data,
  }).catch(error => ({ error }));

  if ('error' in response) {
    console.log('API request error :', { endpoint, data, method, error: response.error });
    apiRequestWait = sleep(3000).then(() => { apiRequestWait = null; });
    return apiRequest(endpoint, data, method);
  }

  if (
    response.status === 429
    && await response.clone().text() === "You made too many requests. Time to take a break?"
  ) {
    apiRequestWait = sleep(1000).then(() => { apiRequestWait = null; });
    return apiRequest(endpoint, data, method);
  }

  if (response.status === 404) {
    console.log('API Request: page introuvable', { endpoint, data, method });
    return null;
  }

  if (response.status !== 200) {
    console.log('apiRequest response status is not 200', {response});
    throw new Error('Todo : améliorer le message ci-dessus');
  }

  return response;
}

function getCookies (): URLSearchParams;
function getCookies (key: string): string;
function getCookies (key?: string) {
  const allCookies = new URLSearchParams(document.cookie.split(';').map(c => c.trim()).join('&'));
  if (key) return allCookies.get(key);
  return allCookies;
}

Object.assign(window, {apiRequest});
