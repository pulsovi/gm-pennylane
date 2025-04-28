import { blobToUrl } from './blob.js';

export async function fetchToDataURL (url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return await blobToUrl(blob);
}

export async function fetchToBase64 (url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  return base64;
}
