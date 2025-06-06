// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDMSItemListParams';
let obj: any = null;
export class APIDMSItemListParams {
  public readonly filter?: FilterEntity[] | string;
  public readonly page_name?: string;
  public static Parse(d: string): APIDMSItemListParams {
    return APIDMSItemListParams.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDMSItemListParams {
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
      // This will be refactored in the next release.
      try {
        checkArray(d.filter, field + ".filter", "FilterEntity[] | string");
        if (d.filter) {
          for (let i = 0; i < d.filter.length; i++) {
            d.filter[i] = FilterEntity.Create(d.filter[i], field + ".filter" + "[" + i + "]");
          }
        }
      } catch (e) {
        try {
          checkString(d.filter, field + ".filter", "FilterEntity[] | string");
        } catch (e) {
        }
      }
    }
    if ("page_name" in d) {
      checkString(d.page_name, field + ".page_name");
    }
    const knownProperties = ["filter","page_name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDMSItemListParams(d);
  }
  private constructor(d: any) {
    if ("filter" in d) this.filter = d.filter;
    if ("page_name" in d) this.page_name = d.page_name;
  }
}

export class FilterEntity {
  public readonly field: string;
  public readonly operator: string;
  public readonly value: string;
  public static Parse(d: string): FilterEntity {
    return FilterEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): FilterEntity {
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
    checkString(d.field, field + ".field");
    checkString(d.operator, field + ".operator");
    checkString(d.value, field + ".value");
    const knownProperties = ["field","operator","value"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new FilterEntity(d);
  }
  private constructor(d: any) {
    this.field = d.field;
    this.operator = d.operator;
    this.value = d.value;
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
  }
}
