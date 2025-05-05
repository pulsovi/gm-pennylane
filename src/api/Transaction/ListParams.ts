// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APITransactionListParams';
let obj: any = null;
export class APITransactionListParams {
  public readonly filter?: string;
  public readonly page?: number;
  public readonly sort?: string;
  public static Parse(d: string): APITransactionListParams {
    return APITransactionListParams.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APITransactionListParams {
    if (!field) {
      obj = d;
      field = "root";
    }
    if (!d) {
      throwNull2NonNull(field, d, multiple ?? this.name);
    } else if (typeof(d) !== 'object') {
      throwNotObject(field, d);
    } else if (Array.isArray(d)) {
      throwIsArray(field, d);
    }
    if ("filter" in d) {
      checkString(d.filter, field + ".filter");
    }
    if ("page" in d) {
      checkNumber(d.page, field + ".page");
    }
    if ("sort" in d) {
      checkString(d.sort, field + ".sort");
    }
    const knownProperties = ["filter","page","sort"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new APITransactionListParams(d);
  }
  private constructor(d: any) {
    if ("filter" in d) this.filter = d.filter;
    if ("page" in d) this.page = d.page;
    if ("sort" in d) this.sort = d.sort;
  }
}

function throwNull2NonNull(field: string, value: any, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "non-nullable object");
}
function throwNotObject(field: string, value: any, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "object");
}
function throwIsArray(field: string, value: any, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "object");
}
function checkNumber(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'number') errorHelper(field, value, multiple ?? "number");
}
function checkString(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'string') errorHelper(field, value, multiple ?? "string");
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
