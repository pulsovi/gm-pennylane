export function jsonClone (obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.log('unable to jsonClone this object', obj);
    console.log(error);
    return obj;
  }
}
