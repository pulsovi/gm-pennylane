import { isString } from "../_/typing.js";
import Logger from "../framework/Logger.js";

const logger = new Logger("API Request");

export async function apiRequest(
  endpoint: string | (RequestInit & { url: string }),
  data: Record<string, unknown> | null = null,
  method = "POST"
) {
  await apiRequestQueue.wait(200);
  const delayBefore = apiRequestQueue.MIN_DELAY;
  const options: RequestInit = isString(endpoint) ? {} : endpoint;
  const rawUrl = isString(endpoint) ? endpoint : endpoint.url;
  const url = rawUrl.startsWith("http") ? rawUrl : `${location.href.split("/").slice(0, 5).join("/")}/${rawUrl}`;
  const response = await fetch(url, {
    method,
    headers: {
      "X-CSRF-TOKEN": getCookies("my_csrf_token"),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: data ? JSON.stringify(data) : null,
    ...options,
  }).catch((error) => ({ error }));

  if ("error" in response) {
    console.log("API request error :", { endpoint, data, method, error: response.error });
    apiRequestQueue.push(3000);
    logger.debug("apiRequestWait: 3000");
    return apiRequest(endpoint, data, method);
  }

  if (response.status === 204) {
    console.log("API Request: pas de contenu", { endpoint, data, method });
    return null;
  }

  if (response.status === 404) {
    logger.error("page introuvable", { endpoint, data, method });
    return null;
  }

  if (response.status === 422) {
    const message = (await response.clone().json()).message;
    logger.log(message, { endpoint, method, data });
    if (typeof endpoint !== "string" && !endpoint.headers?.["X-CSRF-TOKEN"]) {
      apiRequestQueue.push(200);
      logger.debug("apiRequestWait: 200");
      return apiRequest({
        ...endpoint,
        headers: {
          "X-CSRF-TOKEN": getCookies("my_csrf_token"),
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
        },
      });
    }

    if (message) {
      alert(message);
      return null;
    }
  }

  if (response.status === 429 || response.status === 418) {
    apiRequestQueue.unshift(1000);
    apiRequestQueue.MIN_DELAY = delayBefore + 1;
    apiRequestQueue.VERY_MIN_DELAY = Math.max(apiRequestQueue.VERY_MIN_DELAY, delayBefore + 1);
    logger.debug("apiRequestWait: 1000");
    return apiRequest(endpoint, data, method);
  }

  if (response.status !== 200) {
    console.log("apiRequest response status is not 200", { response, status: response.status });
    console.error("Todo : Créer un gestionnaire pour le code error status = " + response.status);
    return null;
  }

  apiRequestQueue.MIN_DELAY = Math.max(apiRequestQueue.VERY_MIN_DELAY, delayBefore * 0.99);
  return response;
}

function getCookies(): URLSearchParams;
function getCookies(key: string): string;
function getCookies(key?: string) {
  const allCookies = new URLSearchParams(
    document.cookie
      .split(";")
      .map((c) => c.trim())
      .join("&")
  );
  if (key) return allCookies.get(key);
  return allCookies;
}

Object.assign(window, { apiRequest });

class Queue {
  public VERY_MIN_DELAY = 0;
  public MIN_DELAY = 100;
  private queue: ({ time: number } | { cb: () => void })[] = [];
  private running = false;

  wait(postDelay?: number) {
    return new Promise<void>((rs) => {
      this.queue.push({ cb: rs });
      if (postDelay) this.push(postDelay);
      this.run();
    });
  }

  push(delay: number) {
    const last = this.queue.reduce((last, item) => {
      if ("time" in item) return item.time;
      return last;
    }, Date.now());
    const time = Math.max(last + this.MIN_DELAY, Date.now() + delay);
    this.queue.push({ time });
    this.run();
  }

  unshift(delay: number) {
    this.queue.unshift({ time: Date.now() + delay });
    this.run();
  }

  private run() {
    if (this.running || this.queue.length === 0) return;
    this.running = true;

    const nextItem = this.queue.shift();

    if ("time" in nextItem) {
      setTimeout(() => {
        this.running = false;
        this.run();
      }, Math.max(nextItem.time - Date.now(), this.MIN_DELAY));
    } else {
      nextItem.cb();
      this.running = false;
      this.run();
    }
  }
}
const apiRequestQueue = new Queue();
logger.log({ apiRequestQueue });
