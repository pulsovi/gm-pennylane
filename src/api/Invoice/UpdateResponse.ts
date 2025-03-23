// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoiceUpdateResponse';
let obj: any = null;
export class APIInvoiceUpdateResponse {
  public readonly has_file: boolean;
  public readonly preview_status: string;
  public readonly preview_urls?: string[] | null;
  public readonly embeddable_in_browser: boolean;
  public static Parse(d: string): APIInvoiceUpdateResponse {
    return APIInvoiceUpdateResponse.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APIInvoiceUpdateResponse {
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
    checkBoolean(d.has_file, false, field + ".has_file");
    checkString(d.preview_status, false, field + ".preview_status");
    checkArray(d.preview_urls, field + ".preview_urls");
    if (d.preview_urls) {
      for (let i = 0; i < d.preview_urls.length; i++) {
        checkString(d.preview_urls[i], false, field + ".preview_urls" + "[" + i + "]");
      }
    }
    checkBoolean(d.embeddable_in_browser, false, field + ".embeddable_in_browser");
    const knownProperties = ["has_file","preview_status","preview_urls","embeddable_in_browser"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APIInvoiceUpdateResponse(d);
  }
  private constructor(d: any) {
    this.has_file = d.has_file;
    this.preview_status = d.preview_status;
    if ("preview_urls" in d) this.preview_urls = d.preview_urls;
    this.embeddable_in_browser = d.embeddable_in_browser;
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
function checkArray(d: any, field: string): void {
  if (!Array.isArray(d) && d !== null && d !== undefined) {
    errorHelper(field, d, "array", true);
  }
}
function checkBoolean(d: any, nullable: boolean, field: string): void {
  if (typeof(d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {
    errorHelper(field, d, "boolean", nullable);
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
