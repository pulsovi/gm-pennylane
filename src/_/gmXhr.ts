import Logger from "../framework/Logger.js";
import { uniquid } from "./uniquid.js";

const log = new Logger('GMXmlHttpRequest');

export function GMXmlHttpRequest(data: string | Record<string, unknown> & {headers?: Record<string, string>}) {
  return new Promise((resolve) => {
    log.log('request', {data});

    if (typeof data === 'string') data = { url: data };

    const id = uniquid();

    const handle = (message: MessageEvent) => {
      if (message.data.id !== id || message.data.source !== 'GM.xmlHttpRequest') return;
      window.removeEventListener('message', handle);
      try {
        const result = resolve(JSON.parse(message.data.response));
        log.log('loadend', { result, request: data, response: message });
      } catch (error) {
        log.log('loadend', { request: data, response: message, error });
        resolve(JSON.parse(message.data.response));
      }
    };

    window.addEventListener('message', handle);

    window.postMessage({
      id,
      target: 'GM.xmlHttpRequest',
      payload: {
        method: 'GET',
        data: data.body,
        ...data,
      },
    });
  });
}
