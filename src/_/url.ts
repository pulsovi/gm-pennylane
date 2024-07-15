export function getParam (url, paramName) {
  return new URL(url).searchParams.get(paramName);
}
