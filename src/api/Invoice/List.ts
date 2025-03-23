// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoiceList';
let obj: any = null;
export class APIInvoiceList {
  public readonly invoices?: InvoicesEntity[] | null;
  public readonly pageSize: number;
  public readonly pagination: Pagination;
  public static Parse(d: string): APIInvoiceList {
    return APIInvoiceList.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APIInvoiceList {
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
    checkArray(d.invoices, field + ".invoices");
    if (d.invoices) {
      for (let i = 0; i < d.invoices.length; i++) {
        d.invoices[i] = InvoicesEntity.Create(d.invoices[i], field + ".invoices" + "[" + i + "]");
      }
    }
    checkNumber(d.pageSize, false, field + ".pageSize");
    d.pagination = Pagination.Create(d.pagination, field + ".pagination");
    const knownProperties = ["invoices","pageSize","pagination"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APIInvoiceList(d);
  }
  private constructor(d: any) {
    if ("invoices" in d) this.invoices = d.invoices;
    this.pageSize = d.pageSize;
    this.pagination = d.pagination;
  }
}

export class InvoicesEntity {
  public readonly id: number;
  public readonly type: string;
  public readonly company_id: number;
  public readonly label: string;
  public readonly created_at: string;
  public readonly currency: string;
  public readonly amount: string;
  public readonly currency_amount: string;
  public readonly currency_tax: string;
  public readonly date?: string | null;
  public readonly deadline?: string | null;
  public readonly direction: string;
  public readonly invoice_number: string;
  public readonly source: string;
  public readonly email_from?: null;
  public readonly gdrive_path?: string | null;
  public readonly pusher_channel: string;
  public readonly validation_needed: boolean;
  public readonly payment_status: string;
  public readonly paid: boolean;
  public readonly amount_without_tax: string;
  public readonly not_duplicate: boolean;
  public readonly approval_status?: null;
  public readonly checksum: string;
  public readonly archived: boolean;
  public readonly incomplete: boolean;
  public readonly is_waiting_for_ocr: boolean;
  public readonly status: string;
  public readonly filename: string;
  public readonly is_factur_x: boolean;
  public readonly thirdparty?: Thirdparty | null;
  public readonly invoice_lines?: InvoiceLinesEntity[] | null;
  public static Parse(d: string): InvoicesEntity {
    return InvoicesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): InvoicesEntity {
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
    checkNumber(d.company_id, false, field + ".company_id");
    checkString(d.label, false, field + ".label");
    checkString(d.created_at, false, field + ".created_at");
    checkString(d.currency, false, field + ".currency");
    checkString(d.amount, false, field + ".amount");
    checkString(d.currency_amount, false, field + ".currency_amount");
    checkString(d.currency_tax, false, field + ".currency_tax");
    checkString(d.date, true, field + ".date");
    checkString(d.deadline, true, field + ".deadline");
    checkString(d.direction, false, field + ".direction");
    checkString(d.invoice_number, false, field + ".invoice_number");
    checkString(d.source, false, field + ".source");
    checkNull(d.email_from, field + ".email_from");
    checkString(d.gdrive_path, true, field + ".gdrive_path");
    checkString(d.pusher_channel, false, field + ".pusher_channel");
    checkBoolean(d.validation_needed, false, field + ".validation_needed");
    checkString(d.payment_status, false, field + ".payment_status");
    checkBoolean(d.paid, false, field + ".paid");
    checkString(d.amount_without_tax, false, field + ".amount_without_tax");
    checkBoolean(d.not_duplicate, false, field + ".not_duplicate");
    checkNull(d.approval_status, field + ".approval_status");
    checkString(d.checksum, false, field + ".checksum");
    checkBoolean(d.archived, false, field + ".archived");
    checkBoolean(d.incomplete, false, field + ".incomplete");
    checkBoolean(d.is_waiting_for_ocr, false, field + ".is_waiting_for_ocr");
    checkString(d.status, false, field + ".status");
    checkString(d.filename, false, field + ".filename");
    checkBoolean(d.is_factur_x, false, field + ".is_factur_x");
    d.thirdparty = Thirdparty.Create(d.thirdparty, field + ".thirdparty");
    checkArray(d.invoice_lines, field + ".invoice_lines");
    if (d.invoice_lines) {
      for (let i = 0; i < d.invoice_lines.length; i++) {
        d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + ".invoice_lines" + "[" + i + "]");
      }
    }
    const knownProperties = ["id","type","company_id","label","created_at","currency","amount","currency_amount","currency_tax","date","deadline","direction","invoice_number","source","email_from","gdrive_path","pusher_channel","validation_needed","payment_status","paid","amount_without_tax","not_duplicate","approval_status","checksum","archived","incomplete","is_waiting_for_ocr","status","filename","is_factur_x","thirdparty","invoice_lines"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new InvoicesEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.type = d.type;
    this.company_id = d.company_id;
    this.label = d.label;
    this.created_at = d.created_at;
    this.currency = d.currency;
    this.amount = d.amount;
    this.currency_amount = d.currency_amount;
    this.currency_tax = d.currency_tax;
    if ("date" in d) this.date = d.date;
    if ("deadline" in d) this.deadline = d.deadline;
    this.direction = d.direction;
    this.invoice_number = d.invoice_number;
    this.source = d.source;
    if ("email_from" in d) this.email_from = d.email_from;
    if ("gdrive_path" in d) this.gdrive_path = d.gdrive_path;
    this.pusher_channel = d.pusher_channel;
    this.validation_needed = d.validation_needed;
    this.payment_status = d.payment_status;
    this.paid = d.paid;
    this.amount_without_tax = d.amount_without_tax;
    this.not_duplicate = d.not_duplicate;
    if ("approval_status" in d) this.approval_status = d.approval_status;
    this.checksum = d.checksum;
    this.archived = d.archived;
    this.incomplete = d.incomplete;
    this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    this.status = d.status;
    this.filename = d.filename;
    this.is_factur_x = d.is_factur_x;
    if ("thirdparty" in d) this.thirdparty = d.thirdparty;
    if ("invoice_lines" in d) this.invoice_lines = d.invoice_lines;
  }
}

export class Thirdparty {
  public readonly id: number;
  public readonly name: string;
  public static Parse(d: string): Thirdparty | null {
    return Thirdparty.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Thirdparty | null {
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
    checkString(d.name, false, field + ".name");
    const knownProperties = ["id","name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Thirdparty(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.name = d.name;
  }
}

export class InvoiceLinesEntity {
  public readonly id: number;
  public readonly vat_rate: string;
  public readonly pnl_plan_item: PnlPlanItem;
  public static Parse(d: string): InvoiceLinesEntity {
    return InvoiceLinesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): InvoiceLinesEntity {
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
    checkString(d.vat_rate, false, field + ".vat_rate");
    d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    const knownProperties = ["id","vat_rate","pnl_plan_item"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new InvoiceLinesEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.vat_rate = d.vat_rate;
    this.pnl_plan_item = d.pnl_plan_item;
  }
}

export class PnlPlanItem {
  public readonly id: number;
  public readonly number: string;
  public readonly label: string;
  public readonly enabled: boolean;
  public static Parse(d: string): PnlPlanItem {
    return PnlPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): PnlPlanItem {
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
    checkString(d.label, false, field + ".label");
    checkBoolean(d.enabled, false, field + ".enabled");
    const knownProperties = ["id","number","label","enabled"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new PnlPlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
    this.label = d.label;
    this.enabled = d.enabled;
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
