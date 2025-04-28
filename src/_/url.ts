export function getParam (url: string, paramName: string): string | null {
  return new URL(url).searchParams.get(paramName);
}
