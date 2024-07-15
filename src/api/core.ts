import { sleep } from "../_";

let apiRequestWait: Promise<void> | null = null;
export async function apiRequest (endpoint, data, method = 'POST') {
  if (apiRequestWait) await apiRequestWait;
  const response = await fetch(`https://app.pennylane.com/companies/21936866/${endpoint}`, {
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
  });

  if (
    response.status === 429
    && await response.clone().text() === "You made too many requests. Time to take a break?"
  ) {
    apiRequestWait = sleep(1000).then(() => { apiRequestWait = null; });
    return apiRequest(endpoint, data, method);
  }

  if (response.status !== 200) {
    console.log('apiRequest response status is not 200', {response});
    throw new Error('todo : améliorer le message ci-dessus');
  }

  return response;
}
window.apiRequest = apiRequest;

function getCookies (): URLSearchParams;
function getCookies (key: string): string;
function getCookies (key?: string) {
  const allCookies = new URLSearchParams(document.cookie.split(';').map(c => c.trim()).join('&'));
  if (key) return allCookies.get(key);
  return allCookies;
}
