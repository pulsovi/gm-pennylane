// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APITransactionList';
let obj: any = null;
export class APITransactionList {
  public readonly transactions?: TransactionsEntity[] | null;
  public readonly pagination: Pagination;
  public static Parse(d: string): APITransactionList {
    return APITransactionList.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APITransactionList {
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
    checkArray(d.transactions, field + ".transactions");
    if (d.transactions) {
      for (let i = 0; i < d.transactions.length; i++) {
        d.transactions[i] = TransactionsEntity.Create(d.transactions[i], field + ".transactions" + "[" + i + "]");
      }
    }
    d.pagination = Pagination.Create(d.pagination, field + ".pagination");
    const knownProperties = ["transactions","pagination"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APITransactionList(d);
  }
  private constructor(d: any) {
    if ("transactions" in d) this.transactions = d.transactions;
    this.pagination = d.pagination;
  }
}

export class TransactionsEntity {
  public readonly id: number;
  public readonly type: string;
  public readonly account_id: number;
  public readonly company_id: number;
  public readonly dump_id?: null;
  public readonly group_uuid: string;
  public readonly date: string;
  public readonly label: string;
  public readonly amount: string;
  public readonly fee: string;
  public readonly currency: string;
  public readonly source: string;
  public readonly currency_amount: string;
  public readonly currency_fee: string;
  public readonly archived_at?: null;
  public readonly updated_at: string;
  public readonly is_waiting_details: boolean;
  public readonly validation_needed: boolean;
  public readonly is_potential_duplicate: boolean;
  public readonly attachment_lost: boolean;
  public readonly attachment_required: boolean;
  public readonly pending: boolean;
  public readonly status: string;
  public readonly gross_amount: string;
  public readonly reconciliation_id?: null;
  public readonly files_count: number;
  public readonly source_logo: string;
  public readonly account_synchronization: AccountSynchronization;
  public readonly dump?: null;
  public static Parse(d: string): TransactionsEntity {
    return TransactionsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): TransactionsEntity {
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
    checkString(d.type, false, field + ".type");
    checkNumber(d.account_id, false, field + ".account_id");
    checkNumber(d.company_id, false, field + ".company_id");
    checkNull(d.dump_id, field + ".dump_id");
    checkString(d.group_uuid, false, field + ".group_uuid");
    checkString(d.date, false, field + ".date");
    checkString(d.label, false, field + ".label");
    checkString(d.amount, false, field + ".amount");
    checkString(d.fee, false, field + ".fee");
    checkString(d.currency, false, field + ".currency");
    checkString(d.source, false, field + ".source");
    checkString(d.currency_amount, false, field + ".currency_amount");
    checkString(d.currency_fee, false, field + ".currency_fee");
    checkNull(d.archived_at, field + ".archived_at");
    checkString(d.updated_at, false, field + ".updated_at");
    checkBoolean(d.is_waiting_details, false, field + ".is_waiting_details");
    checkBoolean(d.validation_needed, false, field + ".validation_needed");
    checkBoolean(d.is_potential_duplicate, false, field + ".is_potential_duplicate");
    checkBoolean(d.attachment_lost, false, field + ".attachment_lost");
    checkBoolean(d.attachment_required, false, field + ".attachment_required");
    checkBoolean(d.pending, false, field + ".pending");
    checkString(d.status, false, field + ".status");
    checkString(d.gross_amount, false, field + ".gross_amount");
    checkNull(d.reconciliation_id, field + ".reconciliation_id");
    checkNumber(d.files_count, false, field + ".files_count");
    checkString(d.source_logo, false, field + ".source_logo");
    d.account_synchronization = AccountSynchronization.Create(d.account_synchronization, field + ".account_synchronization");
    checkNull(d.dump, field + ".dump");
    const knownProperties = ["id","type","account_id","company_id","dump_id","group_uuid","date","label","amount","fee","currency","source","currency_amount","currency_fee","archived_at","updated_at","is_waiting_details","validation_needed","is_potential_duplicate","attachment_lost","attachment_required","pending","status","gross_amount","reconciliation_id","files_count","source_logo","account_synchronization","dump"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new TransactionsEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.type = d.type;
    this.account_id = d.account_id;
    this.company_id = d.company_id;
    if ("dump_id" in d) this.dump_id = d.dump_id;
    this.group_uuid = d.group_uuid;
    this.date = d.date;
    this.label = d.label;
    this.amount = d.amount;
    this.fee = d.fee;
    this.currency = d.currency;
    this.source = d.source;
    this.currency_amount = d.currency_amount;
    this.currency_fee = d.currency_fee;
    if ("archived_at" in d) this.archived_at = d.archived_at;
    this.updated_at = d.updated_at;
    this.is_waiting_details = d.is_waiting_details;
    this.validation_needed = d.validation_needed;
    this.is_potential_duplicate = d.is_potential_duplicate;
    this.attachment_lost = d.attachment_lost;
    this.attachment_required = d.attachment_required;
    this.pending = d.pending;
    this.status = d.status;
    this.gross_amount = d.gross_amount;
    if ("reconciliation_id" in d) this.reconciliation_id = d.reconciliation_id;
    this.files_count = d.files_count;
    this.source_logo = d.source_logo;
    this.account_synchronization = d.account_synchronization;
    if ("dump" in d) this.dump = d.dump;
  }
}

export class AccountSynchronization {
  public readonly created_at: string;
  public readonly triggered_manually: boolean;
  public readonly error_message?: null;
  public static Parse(d: string): AccountSynchronization {
    return AccountSynchronization.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): AccountSynchronization {
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
    checkString(d.created_at, false, field + ".created_at");
    checkBoolean(d.triggered_manually, false, field + ".triggered_manually");
    checkNull(d.error_message, field + ".error_message");
    const knownProperties = ["created_at","triggered_manually","error_message"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new AccountSynchronization(d);
  }
  private constructor(d: any) {
    this.created_at = d.created_at;
    this.triggered_manually = d.triggered_manually;
    if ("error_message" in d) this.error_message = d.error_message;
  }
}

export class Pagination {
  public readonly page: number;
  public readonly pageSize: number;
  public readonly pages: number;
  public readonly totalEntries: number;
  public readonly totalEntriesStr: string;
  public readonly totalEntriesPrecision: string;
  public readonly hasNextPage: boolean;
  public static Parse(d: string): Pagination {
    return Pagination.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Pagination {
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
    checkNumber(d.page, false, field + ".page");
    checkNumber(d.pageSize, false, field + ".pageSize");
    checkNumber(d.pages, false, field + ".pages");
    checkNumber(d.totalEntries, false, field + ".totalEntries");
    checkString(d.totalEntriesStr, false, field + ".totalEntriesStr");
    checkString(d.totalEntriesPrecision, false, field + ".totalEntriesPrecision");
    checkBoolean(d.hasNextPage, false, field + ".hasNextPage");
    const knownProperties = ["page","pageSize","pages","totalEntries","totalEntriesStr","totalEntriesPrecision","hasNextPage"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Pagination(d);
  }
  private constructor(d: any) {
    this.page = d.page;
    this.pageSize = d.pageSize;
    this.pages = d.pages;
    this.totalEntries = d.totalEntries;
    this.totalEntriesStr = d.totalEntriesStr;
    this.totalEntriesPrecision = d.totalEntriesPrecision;
    this.hasNextPage = d.hasNextPage;
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
function checkNull(d: any, field: string): void {
  if (d !== null && d !== undefined) {
    errorHelper(field, d, "null or undefined", false);
  }
}
function errorHelper(field: string, d: any, type: string, nullable: boolean): never {
  if (nullable) {
    type += ", null, or undefined";
  }
  prompt(proxyName+':', JSON.stringify(obj));
  throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}
