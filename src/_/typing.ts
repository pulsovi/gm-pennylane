export function isObject (data: any): data is Record<PropertyKey, unknown> {
  return typeof data === 'object' && data;
}

export function isString (data: any): data is string {
  return typeof data === 'string';
}
