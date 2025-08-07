// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APITransactionLite';
let obj: any = null;
export class APITransactionLite {
  public readonly account: Account;
  public readonly automatically_processed: boolean;
  public readonly automation_rule_plan_item: AutomationRulePlanItem | null;
  public readonly comments_count: number;
  public readonly fee: string;
  public readonly grouped_documents: GroupedDocumentsEntity[];
  public readonly id: number;
  public readonly internal_transfer: boolean;
  public readonly ledger_events: never[];
  public readonly outstanding_balance: string;
  public readonly pusher_channel: string;
  public readonly source: string;
  public readonly source_logo: string;
  public static Parse(d: string): APITransactionLite {
    return APITransactionLite.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APITransactionLite {
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
    d.account = Account.Create(d.account, field + ".account");
    checkBoolean(d.automatically_processed, field + ".automatically_processed");
    // This will be refactored in the next release.
    try {
      d.automation_rule_plan_item = AutomationRulePlanItem.Create(d.automation_rule_plan_item, field + ".automation_rule_plan_item", "AutomationRulePlanItem | null");
    } catch (e) {
      try {
        checkNull(d.automation_rule_plan_item, field + ".automation_rule_plan_item", "AutomationRulePlanItem | null");
      } catch (e) {
      }
    }
    checkNumber(d.comments_count, field + ".comments_count");
    checkString(d.fee, field + ".fee");
    checkArray(d.grouped_documents, field + ".grouped_documents");
    if (d.grouped_documents) {
      for (let i = 0; i < d.grouped_documents.length; i++) {
        d.grouped_documents[i] = GroupedDocumentsEntity.Create(d.grouped_documents[i], field + ".grouped_documents" + "[" + i + "]");
      }
    }
    checkNumber(d.id, field + ".id");
    checkBoolean(d.internal_transfer, field + ".internal_transfer");
    checkArray(d.ledger_events, field + ".ledger_events");
    if (d.ledger_events) {
      for (let i = 0; i < d.ledger_events.length; i++) {
        checkNever(d.ledger_events[i], field + ".ledger_events" + "[" + i + "]");
      }
    }
    checkString(d.outstanding_balance, field + ".outstanding_balance");
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkString(d.source, field + ".source");
    checkString(d.source_logo, field + ".source_logo");
    const knownProperties = ["account","automatically_processed","automation_rule_plan_item","comments_count","fee","grouped_documents","id","internal_transfer","ledger_events","outstanding_balance","pusher_channel","source","source_logo"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APITransactionLite(d);
  }
  private constructor(d: any) {
    this.account = d.account;
    this.automatically_processed = d.automatically_processed;
    this.automation_rule_plan_item = d.automation_rule_plan_item;
    this.comments_count = d.comments_count;
    this.fee = d.fee;
    this.grouped_documents = d.grouped_documents;
    this.id = d.id;
    this.internal_transfer = d.internal_transfer;
    this.ledger_events = d.ledger_events;
    this.outstanding_balance = d.outstanding_balance;
    this.pusher_channel = d.pusher_channel;
    this.source = d.source;
    this.source_logo = d.source_logo;
  }
}

export class Account {
  public readonly logo_url: string;
  public readonly name: string;
  public static Parse(d: string): Account {
    return Account.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Account {
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
    checkString(d.logo_url, field + ".logo_url");
    checkString(d.name, field + ".name");
    const knownProperties = ["logo_url","name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Account(d);
  }
  private constructor(d: any) {
    this.logo_url = d.logo_url;
    this.name = d.name;
  }
}

export class AutomationRulePlanItem {
  public readonly id: number;
  public readonly label: string;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): AutomationRulePlanItem {
    return AutomationRulePlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): AutomationRulePlanItem {
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
    checkString(d.label, field + ".label");
    checkString(d.number, field + ".number");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["id","label","number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new AutomationRulePlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.label = d.label;
    this.number = d.number;
    this.vat_rate = d.vat_rate;
  }
}

export class GroupedDocumentsEntity {
  public readonly amount: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly id: number;
  public readonly type: string;
  public static Parse(d: string): GroupedDocumentsEntity {
    return GroupedDocumentsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): GroupedDocumentsEntity {
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
    checkString(d.currency, field + ".currency");
    checkString(d.currency_amount, field + ".currency_amount");
    checkNumber(d.id, field + ".id");
    checkString(d.type, field + ".type");
    const knownProperties = ["amount","currency","currency_amount","id","type"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new GroupedDocumentsEntity(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.id = d.id;
    this.type = d.type;
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
function checkNever(value: any, field: string, multiple?: string): void {
  return errorHelper(field, value, multiple ?? "never");
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
    console.error('Expected "' + type + '" at ' + field + ' but found:\n' + JSON.stringify(d), jsonClone);
  }
}
