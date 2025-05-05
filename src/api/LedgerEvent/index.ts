// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APILedgerEvent';
let obj: any = null;
export class APILedgerEvent {
  public readonly amount: string;
  public readonly balance: string;
  public readonly closed: boolean;
  public readonly credit: string;
  public readonly debit: string;
  public readonly id: number;
  public readonly label: null | string;
  public readonly lettering: null | Lettering;
  public readonly lettering_id: null | number;
  public readonly plan_item_id: number;
  public readonly planItem: PlanItem;
  public readonly readonly: boolean;
  public readonly readonlyAmounts: boolean;
  public readonly reconciliation_id: null | number;
  public readonly source: string;
  public static Parse(d: string): APILedgerEvent {
    return APILedgerEvent.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APILedgerEvent {
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
    checkString(d.balance, field + ".balance");
    checkBoolean(d.closed, field + ".closed");
    checkString(d.credit, field + ".credit");
    checkString(d.debit, field + ".debit");
    checkNumber(d.id, field + ".id");
    // This will be refactored in the next release.
    try {
      checkNull(d.label, field + ".label", "null | string");
    } catch (e) {
      try {
        checkString(d.label, field + ".label", "null | string");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.lettering, field + ".lettering", "null | Lettering");
    } catch (e) {
      try {
        d.lettering = Lettering.Create(d.lettering, field + ".lettering", "null | Lettering");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.lettering_id, field + ".lettering_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.lettering_id, field + ".lettering_id", "null | number");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkNumber(d.plan_item_id, field + ".plan_item_id");
    d.planItem = PlanItem.Create(d.planItem, field + ".planItem", undefined);
    checkBoolean(d.readonly, field + ".readonly");
    checkBoolean(d.readonlyAmounts, field + ".readonlyAmounts");
    // This will be refactored in the next release.
    try {
      checkNull(d.reconciliation_id, field + ".reconciliation_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.reconciliation_id, field + ".reconciliation_id", "null | number");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.source, field + ".source");
    const knownProperties = ["amount","balance","closed","credit","debit","id","label","lettering","lettering_id","plan_item_id","planItem","readonly","readonlyAmounts","reconciliation_id","source"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new APILedgerEvent(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.balance = d.balance;
    this.closed = d.closed;
    this.credit = d.credit;
    this.debit = d.debit;
    this.id = d.id;
    this.label = d.label;
    this.lettering = d.lettering;
    this.lettering_id = d.lettering_id;
    this.plan_item_id = d.plan_item_id;
    this.planItem = d.planItem;
    this.readonly = d.readonly;
    this.readonlyAmounts = d.readonlyAmounts;
    this.reconciliation_id = d.reconciliation_id;
    this.source = d.source;
  }
}

export class Lettering {
  public readonly balance: string;
  public readonly id: number;
  public readonly max_date: string;
  public readonly min_date: string;
  public readonly plan_item_number: string;
  public static Parse(d: string): Lettering {
    return Lettering.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Lettering {
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
    checkString(d.balance, field + ".balance");
    checkNumber(d.id, field + ".id");
    checkString(d.max_date, field + ".max_date");
    checkString(d.min_date, field + ".min_date");
    checkString(d.plan_item_number, field + ".plan_item_number");
    const knownProperties = ["balance","id","max_date","min_date","plan_item_number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new Lettering(d);
  }
  private constructor(d: any) {
    this.balance = d.balance;
    this.id = d.id;
    this.max_date = d.max_date;
    this.min_date = d.min_date;
    this.plan_item_number = d.plan_item_number;
  }
}

export class PlanItem {
  public readonly "country_alpha2": string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly label: string;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): PlanItem {
    return PlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItem {
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
    checkString(d["country_alpha2"], field + ".country_alpha2");
    checkBoolean(d.enabled, field + ".enabled");
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    checkString(d.number, field + ".number");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["country_alpha2","enabled","id","label","number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new PlanItem(d);
  }
  private constructor(d: any) {
    this["country_alpha2"] = d["country_alpha2"];
    this.enabled = d.enabled;
    this.id = d.id;
    this.label = d.label;
    this.number = d.number;
    this.vat_rate = d.vat_rate;
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
