export function jsonClone <T = any>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error("unable to jsonClone this object", obj, error);
    return obj;
  }
}
