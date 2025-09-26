// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDocumentMatchingInvoice';
let obj: any = null;
export class APIDocumentMatchingInvoice {
  public readonly grouped_transactions: GroupedTransactionsEntity[];
  public readonly multiplier: number;
  public readonly outstanding_balance: string;
  public readonly suggested_transactions: SuggestedTransactionsEntity[];
  public static Parse(d: string): APIDocumentMatchingInvoice {
    return APIDocumentMatchingInvoice.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDocumentMatchingInvoice {
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
    checkArray(d.grouped_transactions, field + ".grouped_transactions");
    if (d.grouped_transactions) {
      for (let i = 0; i < d.grouped_transactions.length; i++) {
        d.grouped_transactions[i] = GroupedTransactionsEntity.Create(d.grouped_transactions[i], field + ".grouped_transactions" + "[" + i + "]");
      }
    }
    checkNumber(d.multiplier, field + ".multiplier");
    checkString(d.outstanding_balance, field + ".outstanding_balance");
    checkArray(d.suggested_transactions, field + ".suggested_transactions");
    if (d.suggested_transactions) {
      for (let i = 0; i < d.suggested_transactions.length; i++) {
        d.suggested_transactions[i] = SuggestedTransactionsEntity.Create(d.suggested_transactions[i], field + ".suggested_transactions" + "[" + i + "]");
      }
    }
    const knownProperties = ["grouped_transactions","multiplier","outstanding_balance","suggested_transactions"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDocumentMatchingInvoice(d);
  }
  private constructor(d: any) {
    this.grouped_transactions = d.grouped_transactions;
    this.multiplier = d.multiplier;
    this.outstanding_balance = d.outstanding_balance;
    this.suggested_transactions = d.suggested_transactions;
  }
}

export class GroupedTransactionsEntity {
  public readonly amount: string;
  public readonly company_id: number;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly date: string;
  public readonly gross_amount: string;
  public readonly group_uuid: string;
  public readonly id: number;
  public readonly is_grouped_or_lettered: boolean;
  public readonly is_suggested: boolean;
  public readonly label: string;
  public readonly outstanding_balance: string;
  public readonly status: string;
  public static Parse(d: string): GroupedTransactionsEntity {
    return GroupedTransactionsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): GroupedTransactionsEntity {
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
    checkString(d.currency_amount, field + ".currency_amount");
    checkString(d.date, field + ".date");
    checkString(d.gross_amount, field + ".gross_amount");
    checkString(d.group_uuid, field + ".group_uuid");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.is_grouped_or_lettered, field + ".is_grouped_or_lettered");
    checkBoolean(d.is_suggested, field + ".is_suggested");
    checkString(d.label, field + ".label");
    checkString(d.outstanding_balance, field + ".outstanding_balance");
    checkString(d.status, field + ".status");
    const knownProperties = ["amount","company_id","currency","currency_amount","date","gross_amount","group_uuid","id","is_grouped_or_lettered","is_suggested","label","outstanding_balance","status"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new GroupedTransactionsEntity(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.company_id = d.company_id;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.date = d.date;
    this.gross_amount = d.gross_amount;
    this.group_uuid = d.group_uuid;
    this.id = d.id;
    this.is_grouped_or_lettered = d.is_grouped_or_lettered;
    this.is_suggested = d.is_suggested;
    this.label = d.label;
    this.outstanding_balance = d.outstanding_balance;
    this.status = d.status;
  }
}

export class SuggestedTransactionsEntity {
  public readonly amount: string;
  public readonly company_id: number;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly date: string;
  public readonly gross_amount: string;
  public readonly group_uuid: string;
  public readonly id: number;
  public readonly is_grouped_or_lettered: boolean;
  public readonly is_suggested: boolean;
  public readonly label: string;
  public readonly matching_suggestion: MatchingSuggestion;
  public readonly outstanding_balance: string;
  public readonly status: string;
  public static Parse(d: string): SuggestedTransactionsEntity {
    return SuggestedTransactionsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): SuggestedTransactionsEntity {
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
    checkString(d.currency_amount, field + ".currency_amount");
    checkString(d.date, field + ".date");
    checkString(d.gross_amount, field + ".gross_amount");
    checkString(d.group_uuid, field + ".group_uuid");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.is_grouped_or_lettered, field + ".is_grouped_or_lettered");
    checkBoolean(d.is_suggested, field + ".is_suggested");
    checkString(d.label, field + ".label");
    d.matching_suggestion = MatchingSuggestion.Create(d.matching_suggestion, field + ".matching_suggestion");
    checkString(d.outstanding_balance, field + ".outstanding_balance");
    checkString(d.status, field + ".status");
    const knownProperties = ["amount","company_id","currency","currency_amount","date","gross_amount","group_uuid","id","is_grouped_or_lettered","is_suggested","label","matching_suggestion","outstanding_balance","status"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new SuggestedTransactionsEntity(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.company_id = d.company_id;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.date = d.date;
    this.gross_amount = d.gross_amount;
    this.group_uuid = d.group_uuid;
    this.id = d.id;
    this.is_grouped_or_lettered = d.is_grouped_or_lettered;
    this.is_suggested = d.is_suggested;
    this.label = d.label;
    this.matching_suggestion = d.matching_suggestion;
    this.outstanding_balance = d.outstanding_balance;
    this.status = d.status;
  }
}

export class MatchingSuggestion {
  public readonly created_at: string;
  public readonly exposure: null;
  public readonly id: number;
  public readonly model_version: string;
  public readonly prediction_id: string;
  public readonly score: number;
  public readonly version: string;
  public static Parse(d: string): MatchingSuggestion {
    return MatchingSuggestion.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): MatchingSuggestion {
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
    checkString(d.created_at, field + ".created_at");
    checkNull(d.exposure, field + ".exposure");
    checkNumber(d.id, field + ".id");
    checkString(d.model_version, field + ".model_version");
    checkString(d.prediction_id, field + ".prediction_id");
    checkNumber(d.score, field + ".score");
    checkString(d.version, field + ".version");
    const knownProperties = ["created_at","exposure","id","model_version","prediction_id","score","version"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new MatchingSuggestion(d);
  }
  private constructor(d: any) {
    this.created_at = d.created_at;
    this.exposure = d.exposure;
    this.id = d.id;
    this.model_version = d.model_version;
    this.prediction_id = d.prediction_id;
    this.score = d.score;
    this.version = d.version;
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
