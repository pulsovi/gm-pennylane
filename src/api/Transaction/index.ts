// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APITransaction';
let obj: any = null;
export class APITransaction {
  public static Parse(s: string): null {
    return APITransaction.Create(JSON.parse(s));
  }
  public static Create(s: any, fieldName?: string): null {
    if (!fieldName) {
      obj = s;
      fieldName = "root";
    }
    checkNull(s, fieldName);
    return s;
  }
}

function checkNull(d: any, field: string): void {
  if (d !== null && d !== undefined) {
    errorHelper(field, d, "null or undefined", false);
  }
}
function errorHelper(field: string, d: any, type: string, nullable: boolean): never {
  if (nullable) {
    type += ", null, or undefined";
  }
  prompt(proxyName+':', JSON.stringify(obj));
  throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}
