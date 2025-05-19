// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDocumentMatching';
let obj: any = null;
export class APIDocumentMatching {
  public readonly amount: string;
  public readonly company_id: number;
  public readonly currency: string;
  public readonly date: string | null;
  public readonly gross_amount: string;
  public readonly group_uuid: string;
  public readonly id: number;
  public readonly outstanding_balance: string;
  public readonly proof_count: null;
  public readonly type: string;
  public readonly updated_at: string;
  public static Parse(d: string): APIDocumentMatching {
    return APIDocumentMatching.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDocumentMatching {
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
    checkString(d.amount, field + ".amount");
    checkNumber(d.company_id, field + ".company_id");
    checkString(d.currency, field + ".currency");
    // This will be refactored in the next release.
    try {
      checkString(d.date, field + ".date", "string | null");
    } catch (e) {
      try {
        checkNull(d.date, field + ".date", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.gross_amount, field + ".gross_amount");
    checkString(d.group_uuid, field + ".group_uuid");
    checkNumber(d.id, field + ".id");
    checkString(d.outstanding_balance, field + ".outstanding_balance");
    checkNull(d.proof_count, field + ".proof_count");
    checkString(d.type, field + ".type");
    checkString(d.updated_at, field + ".updated_at");
    const knownProperties = ["amount","company_id","currency","date","gross_amount","group_uuid","id","outstanding_balance","proof_count","type","updated_at"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDocumentMatching(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.company_id = d.company_id;
    this.currency = d.currency;
    this.date = d.date;
    this.gross_amount = d.gross_amount;
    this.group_uuid = d.group_uuid;
    this.id = d.id;
    this.outstanding_balance = d.outstanding_balance;
    this.proof_count = d.proof_count;
    this.type = d.type;
    this.updated_at = d.updated_at;
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
    prompt(proxyName+':', JSON.stringify(obj));
  }
}
