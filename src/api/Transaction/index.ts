// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APITransaction';
let obj: any = null;
export class APITransaction {
  public static Parse(s: string): never {
    return APITransaction.Create(JSON.parse(s));
  }
  public static Create(s: any, fieldName?: string): never {
    if (!fieldName) {
      obj = s;
      fieldName = "root";
    }
    checkNever(s, fieldName);
  }
}

function checkNever(value: any, field: string, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "never");
}
function errorHelper(field: string, d: any, type: string): never {
  if (!type.includes(' | ')) {
    let jsonClone = obj;
    try {
      jsonClone = JSON.parse(JSON.stringify(obj));
    } catch(error) {
      console.log(error);
    }
    console.log('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d), jsonClone);
    prompt(proxyName+':', JSON.stringify(obj));
  }
}
