// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoiceList';
let obj: any = null;
export class APIInvoiceList {
  public readonly invoices: InvoicesEntity[];
  public readonly pageSize: number;
  public readonly pagination: Pagination;
  public static Parse(d: string): APIInvoiceList {
    return APIInvoiceList.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIInvoiceList {
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
    checkArray(d.invoices, field + ".invoices");
    if (d.invoices) {
      for (let i = 0; i < d.invoices.length; i++) {
        d.invoices[i] = InvoicesEntity.Create(d.invoices[i], field + ".invoices" + "[" + i + "]", undefined);
      }
    }
    checkNumber(d.pageSize, field + ".pageSize");
    d.pagination = Pagination.Create(d.pagination, field + ".pagination", undefined);
    const knownProperties = ["invoices","pageSize","pagination"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new APIInvoiceList(d);
  }
  private constructor(d: any) {
    this.invoices = d.invoices;
    this.pageSize = d.pageSize;
    this.pagination = d.pagination;
  }
}

export class InvoicesEntity {
  public readonly amount: string;
  public readonly amount_without_tax: string;
  public readonly approval_status: null;
  public readonly archived: boolean;
  public readonly checksum: string;
  public readonly company_id: number;
  public readonly created_at: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly currency_tax: string;
  public readonly date: string | null;
  public readonly deadline: string | null;
  public readonly direction: string;
  public readonly email_from: null;
  public readonly filename: string;
  public readonly gdrive_path: null | string;
  public readonly id: number;
  public readonly incomplete: boolean;
  public readonly invoice_lines: InvoiceLinesEntity[];
  public readonly invoice_number: string;
  public readonly is_factur_x: boolean;
  public readonly is_waiting_for_ocr: boolean;
  public readonly label: string;
  public readonly not_duplicate: boolean;
  public readonly paid: boolean;
  public readonly payment_status: string;
  public readonly pusher_channel: string;
  public readonly source: string;
  public readonly status: string;
  public readonly thirdparty: Thirdparty | null;
  public readonly type: string;
  public readonly validation_needed: boolean;
  public static Parse(d: string): InvoicesEntity {
    return InvoicesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): InvoicesEntity {
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
    checkString(d.amount_without_tax, field + ".amount_without_tax");
    checkNull(d.approval_status, field + ".approval_status");
    checkBoolean(d.archived, field + ".archived");
    checkString(d.checksum, field + ".checksum");
    checkNumber(d.company_id, field + ".company_id");
    checkString(d.created_at, field + ".created_at");
    checkString(d.currency, field + ".currency");
    checkString(d.currency_amount, field + ".currency_amount");
    checkString(d.currency_tax, field + ".currency_tax");
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
    // This will be refactored in the next release.
    try {
      checkString(d.deadline, field + ".deadline", "string | null");
    } catch (e) {
      try {
        checkNull(d.deadline, field + ".deadline", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.direction, field + ".direction");
    checkNull(d.email_from, field + ".email_from");
    checkString(d.filename, field + ".filename");
    // This will be refactored in the next release.
    try {
      checkNull(d.gdrive_path, field + ".gdrive_path", "null | string");
    } catch (e) {
      try {
        checkString(d.gdrive_path, field + ".gdrive_path", "null | string");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkNumber(d.id, field + ".id");
    checkBoolean(d.incomplete, field + ".incomplete");
    checkArray(d.invoice_lines, field + ".invoice_lines");
    if (d.invoice_lines) {
      for (let i = 0; i < d.invoice_lines.length; i++) {
        d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + ".invoice_lines" + "[" + i + "]", undefined);
      }
    }
    checkString(d.invoice_number, field + ".invoice_number");
    checkBoolean(d.is_factur_x, field + ".is_factur_x");
    checkBoolean(d.is_waiting_for_ocr, field + ".is_waiting_for_ocr");
    checkString(d.label, field + ".label");
    checkBoolean(d.not_duplicate, field + ".not_duplicate");
    checkBoolean(d.paid, field + ".paid");
    checkString(d.payment_status, field + ".payment_status");
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkString(d.source, field + ".source");
    checkString(d.status, field + ".status");
    // This will be refactored in the next release.
    try {
      d.thirdparty = Thirdparty.Create(d.thirdparty, field + ".thirdparty", "Thirdparty | null");
    } catch (e) {
      try {
        checkNull(d.thirdparty, field + ".thirdparty", "Thirdparty | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.type, field + ".type");
    checkBoolean(d.validation_needed, field + ".validation_needed");
    const knownProperties = ["amount","amount_without_tax","approval_status","archived","checksum","company_id","created_at","currency","currency_amount","currency_tax","date","deadline","direction","email_from","filename","gdrive_path","id","incomplete","invoice_lines","invoice_number","is_factur_x","is_waiting_for_ocr","label","not_duplicate","paid","payment_status","pusher_channel","source","status","thirdparty","type","validation_needed"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new InvoicesEntity(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.amount_without_tax = d.amount_without_tax;
    this.approval_status = d.approval_status;
    this.archived = d.archived;
    this.checksum = d.checksum;
    this.company_id = d.company_id;
    this.created_at = d.created_at;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.currency_tax = d.currency_tax;
    this.date = d.date;
    this.deadline = d.deadline;
    this.direction = d.direction;
    this.email_from = d.email_from;
    this.filename = d.filename;
    this.gdrive_path = d.gdrive_path;
    this.id = d.id;
    this.incomplete = d.incomplete;
    this.invoice_lines = d.invoice_lines;
    this.invoice_number = d.invoice_number;
    this.is_factur_x = d.is_factur_x;
    this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    this.label = d.label;
    this.not_duplicate = d.not_duplicate;
    this.paid = d.paid;
    this.payment_status = d.payment_status;
    this.pusher_channel = d.pusher_channel;
    this.source = d.source;
    this.status = d.status;
    this.thirdparty = d.thirdparty;
    this.type = d.type;
    this.validation_needed = d.validation_needed;
  }
}

export class InvoiceLinesEntity {
  public readonly id: number;
  public readonly pnl_plan_item: PnlPlanItem;
  public readonly vat_rate: string;
  public static Parse(d: string): InvoiceLinesEntity {
    return InvoiceLinesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): InvoiceLinesEntity {
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
    d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + ".pnl_plan_item", undefined);
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["id","pnl_plan_item","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new InvoiceLinesEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.pnl_plan_item = d.pnl_plan_item;
    this.vat_rate = d.vat_rate;
  }
}

export class PnlPlanItem {
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly label: string;
  public readonly number: string;
  public static Parse(d: string): PnlPlanItem {
    return PnlPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PnlPlanItem {
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
    checkBoolean(d.enabled, field + ".enabled");
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    checkString(d.number, field + ".number");
    const knownProperties = ["enabled","id","label","number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new PnlPlanItem(d);
  }
  private constructor(d: any) {
    this.enabled = d.enabled;
    this.id = d.id;
    this.label = d.label;
    this.number = d.number;
  }
}

export class Thirdparty {
  public readonly id: number;
  public readonly name: string;
  public static Parse(d: string): Thirdparty {
    return Thirdparty.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Thirdparty {
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
    checkString(d.name, field + ".name");
    const knownProperties = ["id","name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new Thirdparty(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.name = d.name;
  }
}

export class Pagination {
  public readonly hasNextPage: boolean;
  public readonly page: number;
  public readonly pages: number;
  public readonly pageSize: number;
  public readonly totalEntries: number;
  public readonly totalEntriesPrecision: string;
  public readonly totalEntriesStr: string;
  public static Parse(d: string): Pagination {
    return Pagination.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Pagination {
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
    checkBoolean(d.hasNextPage, field + ".hasNextPage");
    checkNumber(d.page, field + ".page");
    checkNumber(d.pages, field + ".pages");
    checkNumber(d.pageSize, field + ".pageSize");
    checkNumber(d.totalEntries, field + ".totalEntries");
    checkString(d.totalEntriesPrecision, field + ".totalEntriesPrecision");
    checkString(d.totalEntriesStr, field + ".totalEntriesStr");
    const knownProperties = ["hasNextPage","page","pages","pageSize","totalEntries","totalEntriesPrecision","totalEntriesStr"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new Pagination(d);
  }
  private constructor(d: any) {
    this.hasNextPage = d.hasNextPage;
    this.page = d.page;
    this.pages = d.pages;
    this.pageSize = d.pageSize;
    this.totalEntries = d.totalEntries;
    this.totalEntriesPrecision = d.totalEntriesPrecision;
    this.totalEntriesStr = d.totalEntriesStr;
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
}
