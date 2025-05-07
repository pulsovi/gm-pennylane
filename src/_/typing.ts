export function isObject (data: any): data is Record<PropertyKey, unknown> {
  return typeof data === 'object' && data;
}
