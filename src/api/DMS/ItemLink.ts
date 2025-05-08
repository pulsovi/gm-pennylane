// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDMSItemLink';
let obj: any = null;
export class APIDMSItemLink {
  // samples: [33144913]
  public readonly id: number;
  // samples: [1938208033]
  public readonly record_id: number;
  // samples: ["REMISE CHEQUE 0000304 107 DE 1 CHQ 03421 0000304"]
  public readonly record_name: string;
  // samples: ["BankTransaction"]
  public readonly record_type: string;
  // samples: ["https://app.pennylane.com/companies/21936866/accountants/transactions?transaction_id=1938208033&period_start=2025-01-01&period_end=2025-12-31&filter=%5B%7B%22field%22%3A%22id%22%2C%22operator%22%3A%22eq%22%2C%22value%22%3A1938208033%7D%5D"]
  public readonly record_url: string;
  public static Parse(d: string): APIDMSItemLink {
    return APIDMSItemLink.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDMSItemLink {
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
    checkNumber(d.id, field + ".id");
    checkNumber(d.record_id, field + ".record_id");
    checkString(d.record_name, field + ".record_name");
    checkString(d.record_type, field + ".record_type");
    checkString(d.record_url, field + ".record_url");
    const knownProperties = ["id","record_id","record_name","record_type","record_url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new APIDMSItemLink(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.record_id = d.record_id;
    this.record_name = d.record_name;
    this.record_type = d.record_type;
    this.record_url = d.record_url;
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
  throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}
