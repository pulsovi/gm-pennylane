export function jsonClone <T = any>(obj: T): T {
  try {
    return JSON.parse(
      JSON.stringify(obj, (key, value) => {
        if (value instanceof RegExp) return value.toString();
        return value;
      })
    );
  } catch (error) {
    console.error("unable to jsonClone this object", obj, error);
    return obj;
  }
}

export function regexFromJSON(json: string): RegExp {
  const match = json.match(/^\/(?<regex>.*)\/(?<flags>[a-z]*)$/i);
  if (!match) return null;
  return new RegExp(match.groups?.regex, match.groups?.flags);
}