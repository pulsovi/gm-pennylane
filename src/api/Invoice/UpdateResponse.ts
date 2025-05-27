// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoiceUpdateResponse';
let obj: any = null;
export class APIInvoiceUpdateResponse {
  public readonly embeddable_in_browser: boolean;
  public readonly has_file: boolean;
  public readonly preview_status: string | null;
  public readonly preview_urls: string[];
  public static Parse(d: string): APIInvoiceUpdateResponse {
    return APIInvoiceUpdateResponse.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIInvoiceUpdateResponse {
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
    checkBoolean(d.embeddable_in_browser, field + ".embeddable_in_browser");
    checkBoolean(d.has_file, field + ".has_file");
    // This will be refactored in the next release.
    try {
      checkString(d.preview_status, field + ".preview_status", "string | null");
    } catch (e) {
      try {
        checkNull(d.preview_status, field + ".preview_status", "string | null");
      } catch (e) {
      }
    }
    checkArray(d.preview_urls, field + ".preview_urls");
    if (d.preview_urls) {
      for (let i = 0; i < d.preview_urls.length; i++) {
        checkString(d.preview_urls[i], field + ".preview_urls" + "[" + i + "]");
      }
    }
    const knownProperties = ["embeddable_in_browser","has_file","preview_status","preview_urls"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIInvoiceUpdateResponse(d);
  }
  private constructor(d: any) {
    this.embeddable_in_browser = d.embeddable_in_browser;
    this.has_file = d.has_file;
    this.preview_status = d.preview_status;
    this.preview_urls = d.preview_urls;
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
function checkArray(value: any, field: string, multiple?: string): void {
  if (!Array.isArray(value)) errorHelper(field, value, multiple ?? "array");
}
function checkBoolean(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'boolean') errorHelper(field, value, multiple ?? "boolean");
}
function checkString(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'string') errorHelper(field, value, multiple ?? "string");
}
function checkNull(value: any, field: string, multiple?: string): void {
  if (value !== null) errorHelper(field, value, multiple ?? "null");
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
  }
}
