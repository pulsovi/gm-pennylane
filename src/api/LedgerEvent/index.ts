// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APILedgerEvent';
let obj: any = null;
export class APILedgerEvent {
  public readonly id: number;
  public readonly balance: string;
  public readonly plan_item_id: number;
  public readonly lettering_id?: number | null;
  public readonly reconciliation_id?: number | null;
  public readonly source: string;
  public readonly closed: boolean;
  public readonly debit: string;
  public readonly credit: string;
  public readonly amount: string;
  public readonly planItem: PlanItem;
  public readonly label?: string | null;
  public readonly readonly: boolean;
  public readonly readonlyAmounts: boolean;
  public readonly lettering?: Lettering | null;
  public static Parse(d: string): APILedgerEvent {
    return APILedgerEvent.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APILedgerEvent {
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
    checkNumber(d.id, false, field + ".id");
    checkString(d.balance, false, field + ".balance");
    checkNumber(d.plan_item_id, false, field + ".plan_item_id");
    checkNumber(d.lettering_id, true, field + ".lettering_id");
    checkNumber(d.reconciliation_id, true, field + ".reconciliation_id");
    checkString(d.source, false, field + ".source");
    checkBoolean(d.closed, false, field + ".closed");
    checkString(d.debit, false, field + ".debit");
    checkString(d.credit, false, field + ".credit");
    checkString(d.amount, false, field + ".amount");
    d.planItem = PlanItem.Create(d.planItem, field + ".planItem");
    checkString(d.label, true, field + ".label");
    checkBoolean(d.readonly, false, field + ".readonly");
    checkBoolean(d.readonlyAmounts, false, field + ".readonlyAmounts");
    d.lettering = Lettering.Create(d.lettering, field + ".lettering");
    const knownProperties = ["id","balance","plan_item_id","lettering_id","reconciliation_id","source","closed","debit","credit","amount","planItem","label","readonly","readonlyAmounts","lettering"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APILedgerEvent(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.balance = d.balance;
    this.plan_item_id = d.plan_item_id;
    if ("lettering_id" in d) this.lettering_id = d.lettering_id;
    if ("reconciliation_id" in d) this.reconciliation_id = d.reconciliation_id;
    this.source = d.source;
    this.closed = d.closed;
    this.debit = d.debit;
    this.credit = d.credit;
    this.amount = d.amount;
    this.planItem = d.planItem;
    if ("label" in d) this.label = d.label;
    this.readonly = d.readonly;
    this.readonlyAmounts = d.readonlyAmounts;
    if ("lettering" in d) this.lettering = d.lettering;
  }
}

export class PlanItem {
  public readonly id: number;
  public readonly number: string;
  public readonly vat_rate: string;
  public readonly "country_alpha2": string;
  public readonly label: string;
  public readonly enabled: boolean;
  public static Parse(d: string): PlanItem {
    return PlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): PlanItem {
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
    checkNumber(d.id, false, field + ".id");
    checkString(d.number, false, field + ".number");
    checkString(d.vat_rate, false, field + ".vat_rate");
    checkString(d["country_alpha2"], false, field + ".country_alpha2");
    checkString(d.label, false, field + ".label");
    checkBoolean(d.enabled, false, field + ".enabled");
    const knownProperties = ["id","number","vat_rate","country_alpha2","label","enabled"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new PlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
    this.vat_rate = d.vat_rate;
    this["country_alpha2"] = d["country_alpha2"];
    this.label = d.label;
    this.enabled = d.enabled;
  }
}

export class Lettering {
  public readonly id: number;
  public readonly balance: string;
  public readonly min_date: string;
  public readonly max_date: string;
  public readonly plan_item_number: string;
  public static Parse(d: string): Lettering | null {
    return Lettering.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Lettering | null {
    if (!field) {
      obj = d;
      field = "root";
    }
    if (d === null || d === undefined) {
      return null;
    } else if (typeof(d) !== 'object') {
      throwNotObject(field, d, true);
    } else if (Array.isArray(d)) {
      throwIsArray(field, d, true);
    }
    checkNumber(d.id, false, field + ".id");
    checkString(d.balance, false, field + ".balance");
    checkString(d.min_date, false, field + ".min_date");
    checkString(d.max_date, false, field + ".max_date");
    checkString(d.plan_item_number, false, field + ".plan_item_number");
    const knownProperties = ["id","balance","min_date","max_date","plan_item_number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Lettering(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.balance = d.balance;
    this.min_date = d.min_date;
    this.max_date = d.max_date;
    this.plan_item_number = d.plan_item_number;
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
