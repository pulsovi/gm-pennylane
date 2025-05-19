// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APITransaction';
let obj: any = null;
export class APITransaction {
  public readonly account_id: number;
  public readonly account_synchronization: AccountSynchronization;
  public readonly amount: string;
  public readonly archived_at: null | string;
  public readonly attachment_lost: boolean;
  public readonly attachment_required: boolean;
  public readonly company_id: number;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly currency_fee: string | null;
  public readonly date: string;
  public readonly dump: null | Dump;
  public readonly dump_id: null | number;
  public readonly fee: string | null;
  public readonly files_count: number;
  public readonly gross_amount: string;
  public readonly group_uuid: string;
  public readonly id: number;
  public readonly is_potential_duplicate: boolean;
  public readonly is_waiting_details: boolean;
  public readonly label: string;
  public readonly pending: boolean;
  public readonly reconciliation_id: null;
  public readonly source: string;
  public readonly source_logo: string;
  public readonly status: string;
  public readonly type: string;
  public readonly updated_at: string;
  public readonly validation_needed: boolean;
  public static Parse(d: string): APITransaction {
    return APITransaction.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APITransaction {
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
    checkNumber(d.account_id, field + ".account_id");
    d.account_synchronization = AccountSynchronization.Create(d.account_synchronization, field + ".account_synchronization");
    checkString(d.amount, field + ".amount");
    // This will be refactored in the next release.
    try {
      checkNull(d.archived_at, field + ".archived_at", "null | string");
    } catch (e) {
      try {
        checkString(d.archived_at, field + ".archived_at", "null | string");
      } catch (e) {
      }
    }
    checkBoolean(d.attachment_lost, field + ".attachment_lost");
    checkBoolean(d.attachment_required, field + ".attachment_required");
    checkNumber(d.company_id, field + ".company_id");
    checkString(d.currency, field + ".currency");
    checkString(d.currency_amount, field + ".currency_amount");
    // This will be refactored in the next release.
    try {
      checkString(d.currency_fee, field + ".currency_fee", "string | null");
    } catch (e) {
      try {
        checkNull(d.currency_fee, field + ".currency_fee", "string | null");
      } catch (e) {
      }
    }
    checkString(d.date, field + ".date");
    // This will be refactored in the next release.
    try {
      checkNull(d.dump, field + ".dump", "null | Dump");
    } catch (e) {
      try {
        d.dump = Dump.Create(d.dump, field + ".dump", "null | Dump");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.dump_id, field + ".dump_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.dump_id, field + ".dump_id", "null | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.fee, field + ".fee", "string | null");
    } catch (e) {
      try {
        checkNull(d.fee, field + ".fee", "string | null");
      } catch (e) {
      }
    }
    checkNumber(d.files_count, field + ".files_count");
    checkString(d.gross_amount, field + ".gross_amount");
    checkString(d.group_uuid, field + ".group_uuid");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.is_potential_duplicate, field + ".is_potential_duplicate");
    checkBoolean(d.is_waiting_details, field + ".is_waiting_details");
    checkString(d.label, field + ".label");
    checkBoolean(d.pending, field + ".pending");
    checkNull(d.reconciliation_id, field + ".reconciliation_id");
    checkString(d.source, field + ".source");
    checkString(d.source_logo, field + ".source_logo");
    checkString(d.status, field + ".status");
    checkString(d.type, field + ".type");
    checkString(d.updated_at, field + ".updated_at");
    checkBoolean(d.validation_needed, field + ".validation_needed");
    const knownProperties = ["account_id","account_synchronization","amount","archived_at","attachment_lost","attachment_required","company_id","currency","currency_amount","currency_fee","date","dump","dump_id","fee","files_count","gross_amount","group_uuid","id","is_potential_duplicate","is_waiting_details","label","pending","reconciliation_id","source","source_logo","status","type","updated_at","validation_needed"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APITransaction(d);
  }
  private constructor(d: any) {
    this.account_id = d.account_id;
    this.account_synchronization = d.account_synchronization;
    this.amount = d.amount;
    this.archived_at = d.archived_at;
    this.attachment_lost = d.attachment_lost;
    this.attachment_required = d.attachment_required;
    this.company_id = d.company_id;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.currency_fee = d.currency_fee;
    this.date = d.date;
    this.dump = d.dump;
    this.dump_id = d.dump_id;
    this.fee = d.fee;
    this.files_count = d.files_count;
    this.gross_amount = d.gross_amount;
    this.group_uuid = d.group_uuid;
    this.id = d.id;
    this.is_potential_duplicate = d.is_potential_duplicate;
    this.is_waiting_details = d.is_waiting_details;
    this.label = d.label;
    this.pending = d.pending;
    this.reconciliation_id = d.reconciliation_id;
    this.source = d.source;
    this.source_logo = d.source_logo;
    this.status = d.status;
    this.type = d.type;
    this.updated_at = d.updated_at;
    this.validation_needed = d.validation_needed;
  }
}

export class AccountSynchronization {
  public readonly created_at: string | null;
  public readonly error_message: null;
  public readonly triggered_manually: boolean | null;
  public static Parse(d: string): AccountSynchronization {
    return AccountSynchronization.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): AccountSynchronization {
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
    // This will be refactored in the next release.
    try {
      checkString(d.created_at, field + ".created_at", "string | null");
    } catch (e) {
      try {
        checkNull(d.created_at, field + ".created_at", "string | null");
      } catch (e) {
      }
    }
    checkNull(d.error_message, field + ".error_message");
    // This will be refactored in the next release.
    try {
      checkBoolean(d.triggered_manually, field + ".triggered_manually", "boolean | null");
    } catch (e) {
      try {
        checkNull(d.triggered_manually, field + ".triggered_manually", "boolean | null");
      } catch (e) {
      }
    }
    const knownProperties = ["created_at","error_message","triggered_manually"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new AccountSynchronization(d);
  }
  private constructor(d: any) {
    this.created_at = d.created_at;
    this.error_message = d.error_message;
    this.triggered_manually = d.triggered_manually;
  }
}

export class Dump {
  public readonly created_at: string;
  public readonly creator: string;
  public readonly type: string;
  public static Parse(d: string): Dump {
    return Dump.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Dump {
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
    checkString(d.creator, field + ".creator");
    checkString(d.type, field + ".type");
    const knownProperties = ["created_at","creator","type"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Dump(d);
  }
  private constructor(d: any) {
    this.created_at = d.created_at;
    this.creator = d.creator;
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
    console.log('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d), jsonClone);
  }
}
