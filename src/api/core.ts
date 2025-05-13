import { sleep } from '../_/time.js';
import { isObject, isString } from '../_/typing.js';
import Logger from '../framework/Logger.js';

const logger = new Logger('apiRequest');
let apiRequestWait: Promise<void> | null = null;

export async function apiRequest (
  endpoint: string | (RequestInit & {url: string}),
  data: Record<string, unknown> | null = null,
  method = 'POST'
) {
  if (apiRequestWait) await apiRequestWait;
  const options: RequestInit = isString(endpoint) ? {} : endpoint;
  const rawUrl = isString(endpoint) ? endpoint : endpoint.url;
  const url = rawUrl.startsWith('http') ? rawUrl : `${location.href.split('/').slice(0, 5).join('/')}/${rawUrl}`;
  const response = await fetch(url, {
    method,
    headers: {
      "X-CSRF-TOKEN": getCookies('my_csrf_token'),
      "Content-Type": "application/json",
      Accept: 'application/json'
    },
    body: data ? JSON.stringify(data) : null,
    ...options
  }).catch(error => ({ error }));

  if ('error' in response) {
    console.log('API request error :', { endpoint, data, method, error: response.error });
    apiRequestWait = sleep(3000).then(() => { apiRequestWait = null; });
    return apiRequest(endpoint, data, method);
  }

  if (response.status === 204) {
    console.log('API Request: pas de contenu', { endpoint, data, method });
    return null;
  }

  if (response.status === 404) {
    console.log('API Request: page introuvable', { endpoint, data, method });
    return null;
  }

  if (response.status === 422) {
    const message = (await response.clone().json()).message;
    logger.log(message, {endpoint, method, data});
    if (typeof endpoint === 'string') {
      endpoint = {
        url: endpoint,
        method,
        body: data ? JSON.stringify(data) : null,
        headers: {
          "Content-Type": "application/json",
          Accept: 'application/json',
        },
      }
    }

    if (!endpoint.headers?.['X-DOCUMENT-REFERRER']) {
      return apiRequest({
        ...endpoint,
        headers: {
          "X-CSRF-TOKEN": getCookies('my_csrf_token'),
          /*
          "X-COMPANY-CONTEXT-DATA-UPDATED-AT": "2025-05-11T19:23:33.772Z",
          "X-PLAN-USED-BY-FRONT-END": "v1_saas_free",
          "X-FRONTEND-LAST-APPLICATION-LOADED-AT": "2025-05-11T19:23:30.880Z",
          "X-Reseller": "pennylane",
          "X-DEPLOYMENT": "2025-05-09",
          "X-SOURCE-VERSION": "853861f",
          "X-SOURCE-VERSION-BUILT-AT": "2025-05-09T18:17:28.976Z",
          "X-DOCUMENT-REFERRER": location.origin + location.pathname,
          "X-TAB-ID": "0f97ec55-8b4f-44b8-bdd5-4232d75772c9",
          "traceparent": "00-000000000000000024a046b489ead241-33404d6d5ea99f22-01",
          */
          ...endpoint.headers,
        }
      });
    }

    if (message) {
      alert(message);
      return null;
    }
  }

  if (response.status === 429 || response.status === 418) {
    apiRequestWait = sleep(1000).then(() => { apiRequestWait = null; });
    return apiRequest(endpoint, data, method);
  }

  if (response.status !== 200) {
    console.log('apiRequest response status is not 200', {response, status: response.status});
    console.error('Todo : Créer un gestionnaire pour le code error status = '+response.status);
    return null;
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
