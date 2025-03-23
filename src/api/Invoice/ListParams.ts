// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoiceListParams';
let obj: any = null;
export class APIInvoiceListParams {
  public readonly direction?: string | null;
  public readonly filter?: string | null;
  public readonly sort?: string | null;
  public readonly page?: number | null;
  public static Parse(d: string): APIInvoiceListParams {
    return APIInvoiceListParams.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APIInvoiceListParams {
    if (!field) {
      obj = d;
      field = "root";
    }
    if (d === null || d === undefined) {
      throwNull2NonNull(field, d);
    } else if (typeof(d) !== 'object') {
      throwNotObject(field, d, false);
    } else if (Array.isArray(d)) {
      throwIsArray(field, d, false);
    }
    checkString(d.direction, true, field + ".direction");
    checkString(d.filter, true, field + ".filter");
    checkString(d.sort, true, field + ".sort");
    checkNumber(d.page, true, field + ".page");
    const knownProperties = ["direction","filter","sort","page"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APIInvoiceListParams(d);
  }
  private constructor(d: any) {
    if ("direction" in d) this.direction = d.direction;
    if ("filter" in d) this.filter = d.filter;
    if ("sort" in d) this.sort = d.sort;
    if ("page" in d) this.page = d.page;
  }
}

function throwNull2NonNull(field: string, d: any): never {
  return errorHelper(field, d, "non-nullable object", false);
}
function throwNotObject(field: string, d: any, nullable: boolean): never {
  return errorHelper(field, d, "object", nullable);
}
function throwIsArray(field: string, d: any, nullable: boolean): never {
  return errorHelper(field, d, "object", nullable);
}
function checkNumber(d: any, nullable: boolean, field: string): void {
  if (typeof(d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {
    errorHelper(field, d, "number", nullable);
  }
}
function checkString(d: any, nullable: boolean, field: string): void {
  if (typeof(d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {
    errorHelper(field, d, "string", nullable);
  }
}
function errorHelper(field: string, d: any, type: string, nullable: boolean): never {
  if (nullable) {
    type += ", null, or undefined";
  }
  prompt(proxyName+':', JSON.stringify(obj));
  throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}
