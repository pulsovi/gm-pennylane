// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoiceListParams';
let obj: any = null;
export class APIInvoiceListParams {
  public readonly direction?: string;
  public readonly filter?: string;
  public readonly page?: number;
  public readonly sort?: string;
  public static Parse(d: string): APIInvoiceListParams {
    return APIInvoiceListParams.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIInvoiceListParams {
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
    if ("direction" in d) {
      checkString(d.direction, field + ".direction");
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
    const knownProperties = ["direction","filter","page","sort"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIInvoiceListParams(d);
  }
  private constructor(d: any) {
    if ("direction" in d) this.direction = d.direction;
    if ("filter" in d) this.filter = d.filter;
    if ("page" in d) this.page = d.page;
    if ("sort" in d) this.sort = d.sort;
  }
}

function throwNull2NonNull(field: string, value: any, multiple?: string): void {
  return errorHelper(field, value, multiple ?? "non-nullable object");
}
function throwNotObject(field: string, value: any, multiple?: string): void {
  return errorHelper(field, value, multiple ?? "object");
}
function throwIsArray(field: string, value: any, multiple?: string): void {
  return errorHelper(field, value, multiple ?? "object");
}
function checkNumber(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'number') errorHelper(field, value, multiple ?? "number");
}
function checkString(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'string') errorHelper(field, value, multiple ?? "string");
}
function errorHelper(field: string, d: any, type: string): void {
  if (type.includes(' | ')) {
    throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
  } else {
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
