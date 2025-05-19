// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoice';
let obj: any = null;
export class APIInvoice {
  public readonly amount: string;
  public readonly approval_status: null;
  public readonly archived: boolean;
  public readonly attachment_required: boolean;
  public readonly blob_id: number | null;
  public readonly checksum: string | null;
  public readonly client_comments_count: number;
  public readonly company_id: number;
  public readonly created_at: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly currency_price_before_tax: string;
  public readonly currency_tax: string;
  public readonly current_account_plan_item: null | PnlPlanItemOrCurrentAccountPlanItem;
  public readonly current_account_plan_item_id: null | number;
  public readonly date: null | string;
  public readonly deadline: null | string;
  public readonly direction: string;
  public readonly document_tags: DocumentTagsEntity[];
  public readonly duplicates_count: number;
  public readonly email_from: null;
  public readonly embeddable_in_browser: boolean;
  public readonly file_signed_id: string;
  public readonly filename: string | null;
  public readonly gdrive_path: string | null;
  public readonly group_uuid: string;
  public readonly has_closed_ledger_events: boolean;
  public readonly has_duplicates: boolean;
  public readonly has_file: boolean;
  public readonly id: number;
  public readonly incomplete: boolean;
  public readonly invoice_lines: InvoiceLinesEntity[];
  public readonly invoice_lines_count: number;
  public readonly invoice_number: string;
  public readonly is_employee_expense: boolean;
  public readonly is_estimate: boolean;
  public readonly is_factur_x: boolean;
  public readonly is_waiting_for_ocr: boolean;
  public readonly journal_id: number;
  public readonly label: string;
  public readonly method: string;
  public readonly mileage_allowance: null;
  public readonly outstanding_balance: string;
  public readonly pages_count: number | null;
  public readonly paid: boolean;
  public readonly payment_status: string;
  public readonly preview_status: string | null;
  public readonly preview_urls: string[];
  public readonly pusher_channel: string;
  public readonly source: string;
  public readonly status: string;
  public readonly subcomplete: boolean;
  public readonly tagged_at_ledger_events_level: boolean;
  public readonly thirdparty: Thirdparty | null;
  public readonly thirdparty_id: number | null;
  public readonly type: string;
  public readonly url: string;
  public readonly validation_needed: boolean;
  public static Parse(d: string): APIInvoice {
    return APIInvoice.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIInvoice {
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
    checkNull(d.approval_status, field + ".approval_status");
    checkBoolean(d.archived, field + ".archived");
    checkBoolean(d.attachment_required, field + ".attachment_required");
    // This will be refactored in the next release.
    try {
      checkNumber(d.blob_id, field + ".blob_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.blob_id, field + ".blob_id", "number | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.checksum, field + ".checksum", "string | null");
    } catch (e) {
      try {
        checkNull(d.checksum, field + ".checksum", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkNumber(d.client_comments_count, field + ".client_comments_count");
    checkNumber(d.company_id, field + ".company_id");
    checkString(d.created_at, field + ".created_at");
    checkString(d.currency, field + ".currency");
    checkString(d.currency_amount, field + ".currency_amount");
    checkString(d.currency_price_before_tax, field + ".currency_price_before_tax");
    checkString(d.currency_tax, field + ".currency_tax");
    // This will be refactored in the next release.
    try {
      checkNull(d.current_account_plan_item, field + ".current_account_plan_item", "null | PnlPlanItemOrCurrentAccountPlanItem");
    } catch (e) {
      try {
        d.current_account_plan_item = PnlPlanItemOrCurrentAccountPlanItem.Create(d.current_account_plan_item, field + ".current_account_plan_item", "null | PnlPlanItemOrCurrentAccountPlanItem");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.current_account_plan_item_id, field + ".current_account_plan_item_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.current_account_plan_item_id, field + ".current_account_plan_item_id", "null | number");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.date, field + ".date", "null | string");
    } catch (e) {
      try {
        checkString(d.date, field + ".date", "null | string");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.deadline, field + ".deadline", "null | string");
    } catch (e) {
      try {
        checkString(d.deadline, field + ".deadline", "null | string");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.direction, field + ".direction");
    checkArray(d.document_tags, field + ".document_tags");
    if (d.document_tags) {
      for (let i = 0; i < d.document_tags.length; i++) {
        d.document_tags[i] = DocumentTagsEntity.Create(d.document_tags[i], field + ".document_tags" + "[" + i + "]");
      }
    }
    checkNumber(d.duplicates_count, field + ".duplicates_count");
    checkNull(d.email_from, field + ".email_from");
    checkBoolean(d.embeddable_in_browser, field + ".embeddable_in_browser");
    checkString(d.file_signed_id, field + ".file_signed_id");
    // This will be refactored in the next release.
    try {
      checkString(d.filename, field + ".filename", "string | null");
    } catch (e) {
      try {
        checkNull(d.filename, field + ".filename", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.gdrive_path, field + ".gdrive_path", "string | null");
    } catch (e) {
      try {
        checkNull(d.gdrive_path, field + ".gdrive_path", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.group_uuid, field + ".group_uuid");
    checkBoolean(d.has_closed_ledger_events, field + ".has_closed_ledger_events");
    checkBoolean(d.has_duplicates, field + ".has_duplicates");
    checkBoolean(d.has_file, field + ".has_file");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.incomplete, field + ".incomplete");
    checkArray(d.invoice_lines, field + ".invoice_lines");
    if (d.invoice_lines) {
      for (let i = 0; i < d.invoice_lines.length; i++) {
        d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + ".invoice_lines" + "[" + i + "]");
      }
    }
    checkNumber(d.invoice_lines_count, field + ".invoice_lines_count");
    checkString(d.invoice_number, field + ".invoice_number");
    checkBoolean(d.is_employee_expense, field + ".is_employee_expense");
    checkBoolean(d.is_estimate, field + ".is_estimate");
    checkBoolean(d.is_factur_x, field + ".is_factur_x");
    checkBoolean(d.is_waiting_for_ocr, field + ".is_waiting_for_ocr");
    checkNumber(d.journal_id, field + ".journal_id");
    checkString(d.label, field + ".label");
    checkString(d.method, field + ".method");
    checkNull(d.mileage_allowance, field + ".mileage_allowance");
    checkString(d.outstanding_balance, field + ".outstanding_balance");
    // This will be refactored in the next release.
    try {
      checkNumber(d.pages_count, field + ".pages_count", "number | null");
    } catch (e) {
      try {
        checkNull(d.pages_count, field + ".pages_count", "number | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkBoolean(d.paid, field + ".paid");
    checkString(d.payment_status, field + ".payment_status");
    // This will be refactored in the next release.
    try {
      checkString(d.preview_status, field + ".preview_status", "string | null");
    } catch (e) {
      try {
        checkNull(d.preview_status, field + ".preview_status", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkArray(d.preview_urls, field + ".preview_urls");
    if (d.preview_urls) {
      for (let i = 0; i < d.preview_urls.length; i++) {
        checkString(d.preview_urls[i], field + ".preview_urls" + "[" + i + "]");
      }
    }
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkString(d.source, field + ".source");
    checkString(d.status, field + ".status");
    checkBoolean(d.subcomplete, field + ".subcomplete");
    checkBoolean(d.tagged_at_ledger_events_level, field + ".tagged_at_ledger_events_level");
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
    // This will be refactored in the next release.
    try {
      checkNumber(d.thirdparty_id, field + ".thirdparty_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.thirdparty_id, field + ".thirdparty_id", "number | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.type, field + ".type");
    checkString(d.url, field + ".url");
    checkBoolean(d.validation_needed, field + ".validation_needed");
    const knownProperties = ["amount","approval_status","archived","attachment_required","blob_id","checksum","client_comments_count","company_id","created_at","currency","currency_amount","currency_price_before_tax","currency_tax","current_account_plan_item","current_account_plan_item_id","date","deadline","direction","document_tags","duplicates_count","email_from","embeddable_in_browser","file_signed_id","filename","gdrive_path","group_uuid","has_closed_ledger_events","has_duplicates","has_file","id","incomplete","invoice_lines","invoice_lines_count","invoice_number","is_employee_expense","is_estimate","is_factur_x","is_waiting_for_ocr","journal_id","label","method","mileage_allowance","outstanding_balance","pages_count","paid","payment_status","preview_status","preview_urls","pusher_channel","source","status","subcomplete","tagged_at_ledger_events_level","thirdparty","thirdparty_id","type","url","validation_needed"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIInvoice(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.approval_status = d.approval_status;
    this.archived = d.archived;
    this.attachment_required = d.attachment_required;
    this.blob_id = d.blob_id;
    this.checksum = d.checksum;
    this.client_comments_count = d.client_comments_count;
    this.company_id = d.company_id;
    this.created_at = d.created_at;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.currency_price_before_tax = d.currency_price_before_tax;
    this.currency_tax = d.currency_tax;
    this.current_account_plan_item = d.current_account_plan_item;
    this.current_account_plan_item_id = d.current_account_plan_item_id;
    this.date = d.date;
    this.deadline = d.deadline;
    this.direction = d.direction;
    this.document_tags = d.document_tags;
    this.duplicates_count = d.duplicates_count;
    this.email_from = d.email_from;
    this.embeddable_in_browser = d.embeddable_in_browser;
    this.file_signed_id = d.file_signed_id;
    this.filename = d.filename;
    this.gdrive_path = d.gdrive_path;
    this.group_uuid = d.group_uuid;
    this.has_closed_ledger_events = d.has_closed_ledger_events;
    this.has_duplicates = d.has_duplicates;
    this.has_file = d.has_file;
    this.id = d.id;
    this.incomplete = d.incomplete;
    this.invoice_lines = d.invoice_lines;
    this.invoice_lines_count = d.invoice_lines_count;
    this.invoice_number = d.invoice_number;
    this.is_employee_expense = d.is_employee_expense;
    this.is_estimate = d.is_estimate;
    this.is_factur_x = d.is_factur_x;
    this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    this.journal_id = d.journal_id;
    this.label = d.label;
    this.method = d.method;
    this.mileage_allowance = d.mileage_allowance;
    this.outstanding_balance = d.outstanding_balance;
    this.pages_count = d.pages_count;
    this.paid = d.paid;
    this.payment_status = d.payment_status;
    this.preview_status = d.preview_status;
    this.preview_urls = d.preview_urls;
    this.pusher_channel = d.pusher_channel;
    this.source = d.source;
    this.status = d.status;
    this.subcomplete = d.subcomplete;
    this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;
    this.thirdparty = d.thirdparty;
    this.thirdparty_id = d.thirdparty_id;
    this.type = d.type;
    this.url = d.url;
    this.validation_needed = d.validation_needed;
  }
}

export class PnlPlanItemOrCurrentAccountPlanItem {
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly label: string;
  public readonly number: string;
  public static Parse(d: string): PnlPlanItemOrCurrentAccountPlanItem {
    return PnlPlanItemOrCurrentAccountPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PnlPlanItemOrCurrentAccountPlanItem {
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
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PnlPlanItemOrCurrentAccountPlanItem(d);
  }
  private constructor(d: any) {
    this.enabled = d.enabled;
    this.id = d.id;
    this.label = d.label;
    this.number = d.number;
  }
}

export class DocumentTagsEntity {
  public readonly document_id: number;
  public readonly group_id: number;
  public readonly id?: number;
  public readonly tag: Tag;
  public readonly tag_id: number;
  public readonly weight?: string;
  public static Parse(d: string): DocumentTagsEntity {
    return DocumentTagsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): DocumentTagsEntity {
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
    checkNumber(d.document_id, field + ".document_id");
    checkNumber(d.group_id, field + ".group_id");
    if ("id" in d) {
      checkNumber(d.id, field + ".id");
    }
    d.tag = Tag.Create(d.tag, field + ".tag");
    checkNumber(d.tag_id, field + ".tag_id");
    if ("weight" in d) {
      checkString(d.weight, field + ".weight");
    }
    const knownProperties = ["document_id","group_id","id","tag","tag_id","weight"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new DocumentTagsEntity(d);
  }
  private constructor(d: any) {
    this.document_id = d.document_id;
    this.group_id = d.group_id;
    if ("id" in d) this.id = d.id;
    this.tag = d.tag;
    this.tag_id = d.tag_id;
    if ("weight" in d) this.weight = d.weight;
  }
}

export class Tag {
  public readonly analytical_code: null;
  public readonly group: Group;
  public readonly group_id: number;
  public readonly icon: null;
  public readonly id: number;
  public readonly label: string;
  public readonly variant: null;
  public static Parse(d: string): Tag {
    return Tag.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Tag {
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
    checkNull(d.analytical_code, field + ".analytical_code");
    d.group = Group.Create(d.group, field + ".group");
    checkNumber(d.group_id, field + ".group_id");
    checkNull(d.icon, field + ".icon");
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    checkNull(d.variant, field + ".variant");
    const knownProperties = ["analytical_code","group","group_id","icon","id","label","variant"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Tag(d);
  }
  private constructor(d: any) {
    this.analytical_code = d.analytical_code;
    this.group = d.group;
    this.group_id = d.group_id;
    this.icon = d.icon;
    this.id = d.id;
    this.label = d.label;
    this.variant = d.variant;
  }
}

export class Group {
  public readonly icon: string;
  public readonly label: string;
  public readonly self_service_accounting: boolean;
  public static Parse(d: string): Group {
    return Group.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Group {
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
    checkString(d.icon, field + ".icon");
    checkString(d.label, field + ".label");
    checkBoolean(d.self_service_accounting, field + ".self_service_accounting");
    const knownProperties = ["icon","label","self_service_accounting"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Group(d);
  }
  private constructor(d: any) {
    this.icon = d.icon;
    this.label = d.label;
    this.self_service_accounting = d.self_service_accounting;
  }
}

export class InvoiceLinesEntity {
  public readonly advance: null;
  public readonly advance_id: null;
  public readonly advance_pnl: boolean;
  public readonly amount: string;
  public readonly asset: null | Asset;
  public readonly asset_id: null | number;
  public readonly currency_amount: string;
  public readonly currency_price_before_tax: string;
  public readonly currency_tax: string;
  public readonly deferral: null;
  public readonly deferral_id: null;
  public readonly global_vat: boolean;
  public readonly id: number;
  public readonly label: string;
  public readonly ledger_event_label: null;
  public readonly ocr_vat_rate: null | string;
  public readonly pnl_plan_item: PnlPlanItemOrCurrentAccountPlanItem1;
  public readonly pnl_plan_item_id: number;
  public readonly prepaid_pnl: boolean;
  public readonly tax: string;
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
    checkNull(d.advance, field + ".advance");
    checkNull(d.advance_id, field + ".advance_id");
    checkBoolean(d.advance_pnl, field + ".advance_pnl");
    checkString(d.amount, field + ".amount");
    // This will be refactored in the next release.
    try {
      checkNull(d.asset, field + ".asset", "null | Asset");
    } catch (e) {
      try {
        d.asset = Asset.Create(d.asset, field + ".asset", "null | Asset");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.asset_id, field + ".asset_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.asset_id, field + ".asset_id", "null | number");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.currency_amount, field + ".currency_amount");
    checkString(d.currency_price_before_tax, field + ".currency_price_before_tax");
    checkString(d.currency_tax, field + ".currency_tax");
    checkNull(d.deferral, field + ".deferral");
    checkNull(d.deferral_id, field + ".deferral_id");
    checkBoolean(d.global_vat, field + ".global_vat");
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    checkNull(d.ledger_event_label, field + ".ledger_event_label");
    // This will be refactored in the next release.
    try {
      checkNull(d.ocr_vat_rate, field + ".ocr_vat_rate", "null | string");
    } catch (e) {
      try {
        checkString(d.ocr_vat_rate, field + ".ocr_vat_rate", "null | string");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    d.pnl_plan_item = PnlPlanItemOrCurrentAccountPlanItem1.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    checkNumber(d.pnl_plan_item_id, field + ".pnl_plan_item_id");
    checkBoolean(d.prepaid_pnl, field + ".prepaid_pnl");
    checkString(d.tax, field + ".tax");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["advance","advance_id","advance_pnl","amount","asset","asset_id","currency_amount","currency_price_before_tax","currency_tax","deferral","deferral_id","global_vat","id","label","ledger_event_label","ocr_vat_rate","pnl_plan_item","pnl_plan_item_id","prepaid_pnl","tax","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new InvoiceLinesEntity(d);
  }
  private constructor(d: any) {
    this.advance = d.advance;
    this.advance_id = d.advance_id;
    this.advance_pnl = d.advance_pnl;
    this.amount = d.amount;
    this.asset = d.asset;
    this.asset_id = d.asset_id;
    this.currency_amount = d.currency_amount;
    this.currency_price_before_tax = d.currency_price_before_tax;
    this.currency_tax = d.currency_tax;
    this.deferral = d.deferral;
    this.deferral_id = d.deferral_id;
    this.global_vat = d.global_vat;
    this.id = d.id;
    this.label = d.label;
    this.ledger_event_label = d.ledger_event_label;
    this.ocr_vat_rate = d.ocr_vat_rate;
    this.pnl_plan_item = d.pnl_plan_item;
    this.pnl_plan_item_id = d.pnl_plan_item_id;
    this.prepaid_pnl = d.prepaid_pnl;
    this.tax = d.tax;
    this.vat_rate = d.vat_rate;
  }
}

export class Asset {
  public readonly amortization_months: number;
  public readonly amortization_type: string | null;
  public readonly entry_date: string;
  public readonly id: number;
  public readonly invoice_line_editable: boolean;
  public readonly name: string;
  public readonly plan_item_id: number;
  public readonly quantity: number;
  public readonly start_date: string | null;
  public static Parse(d: string): Asset {
    return Asset.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Asset {
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
    checkNumber(d.amortization_months, field + ".amortization_months");
    // This will be refactored in the next release.
    try {
      checkString(d.amortization_type, field + ".amortization_type", "string | null");
    } catch (e) {
      try {
        checkNull(d.amortization_type, field + ".amortization_type", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.entry_date, field + ".entry_date");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.invoice_line_editable, field + ".invoice_line_editable");
    checkString(d.name, field + ".name");
    checkNumber(d.plan_item_id, field + ".plan_item_id");
    checkNumber(d.quantity, field + ".quantity");
    // This will be refactored in the next release.
    try {
      checkString(d.start_date, field + ".start_date", "string | null");
    } catch (e) {
      try {
        checkNull(d.start_date, field + ".start_date", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    const knownProperties = ["amortization_months","amortization_type","entry_date","id","invoice_line_editable","name","plan_item_id","quantity","start_date"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Asset(d);
  }
  private constructor(d: any) {
    this.amortization_months = d.amortization_months;
    this.amortization_type = d.amortization_type;
    this.entry_date = d.entry_date;
    this.id = d.id;
    this.invoice_line_editable = d.invoice_line_editable;
    this.name = d.name;
    this.plan_item_id = d.plan_item_id;
    this.quantity = d.quantity;
    this.start_date = d.start_date;
  }
}

export class PnlPlanItemOrCurrentAccountPlanItem1 {
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly label: string;
  public readonly number: string;
  public static Parse(d: string): PnlPlanItemOrCurrentAccountPlanItem1 {
    return PnlPlanItemOrCurrentAccountPlanItem1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PnlPlanItemOrCurrentAccountPlanItem1 {
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
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PnlPlanItemOrCurrentAccountPlanItem1(d);
  }
  private constructor(d: any) {
    this.enabled = d.enabled;
    this.id = d.id;
    this.label = d.label;
    this.number = d.number;
  }
}

export class Thirdparty {
  public readonly activity_code: string;
  public readonly activity_nomenclature: string;
  public readonly address: string;
  public readonly address_additional_info: string;
  public readonly admin_city_code: null;
  public readonly balance: null;
  public readonly billing_bank: null;
  public readonly billing_bic: null;
  public readonly billing_footer_invoice_id: null;
  public readonly billing_footer_invoice_label: null;
  public readonly billing_iban: null;
  public readonly billing_language: string;
  public readonly city: string;
  public readonly company_id: number;
  public readonly complete: boolean;
  public readonly country: string | null;
  public readonly "country_alpha2": string;
  public readonly credits: null;
  public readonly current_mandate: null;
  public readonly customer_type: string;
  public readonly debits: null;
  public readonly delivery_address: string;
  public readonly delivery_address_additional_info: string;
  public readonly delivery_city: string;
  public readonly delivery_country: null;
  public readonly "delivery_country_alpha2": string;
  public readonly delivery_postal_code: string;
  public readonly disable_pending_vat: boolean;
  public readonly display_name: null;
  public readonly emails: never[];
  public readonly establishment_no: null | string;
  public readonly estimate_count: null;
  public readonly first_name: string;
  public readonly force_pending_vat: boolean;
  public readonly gender: null;
  public readonly gocardless_id: null;
  public readonly iban: string;
  public readonly id: number;
  public readonly invoice_count: null;
  public readonly invoice_dump_id: null;
  public readonly invoices_auto_generated: boolean;
  public readonly invoices_auto_validated: boolean;
  public readonly known_supplier_id: null | number;
  public readonly last_name: string;
  public readonly ledger_events_count: null;
  public readonly legal_form_code: string;
  public readonly method: string;
  public readonly name: string;
  public readonly notes: string;
  public readonly notes_comment: null;
  public readonly payment_conditions: string;
  public readonly phone: string;
  public readonly plan_item: PlanItemOrPnlPlanItem;
  public readonly plan_item_attributes: null;
  public readonly plan_item_id: number;
  public readonly pnl_plan_item: PlanItemOrPnlPlanItem1 | null;
  public readonly pnl_plan_item_id: number | null;
  public readonly postal_code: string;
  public readonly purchase_request_count: null;
  public readonly received_a_mandate_request: boolean;
  public readonly recipient: string;
  public readonly recurrent: boolean;
  public readonly reference: string;
  public readonly reg_no: string;
  public readonly role: string;
  public readonly rule_enabled: boolean;
  public readonly search_terms: string[];
  public readonly source_id: string;
  public readonly stripe_id: null;
  public readonly supplier_payment_method: null;
  public readonly supplier_payment_method_last_updated_at: null | string;
  public readonly tags: never[];
  public readonly turnover: null;
  public readonly url: string;
  public readonly vat_number: string;
  public readonly vat_rate: string | null;
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
    checkString(d.activity_code, field + ".activity_code");
    checkString(d.activity_nomenclature, field + ".activity_nomenclature");
    checkString(d.address, field + ".address");
    checkString(d.address_additional_info, field + ".address_additional_info");
    checkNull(d.admin_city_code, field + ".admin_city_code");
    checkNull(d.balance, field + ".balance");
    checkNull(d.billing_bank, field + ".billing_bank");
    checkNull(d.billing_bic, field + ".billing_bic");
    checkNull(d.billing_footer_invoice_id, field + ".billing_footer_invoice_id");
    checkNull(d.billing_footer_invoice_label, field + ".billing_footer_invoice_label");
    checkNull(d.billing_iban, field + ".billing_iban");
    checkString(d.billing_language, field + ".billing_language");
    checkString(d.city, field + ".city");
    checkNumber(d.company_id, field + ".company_id");
    checkBoolean(d.complete, field + ".complete");
    // This will be refactored in the next release.
    try {
      checkString(d.country, field + ".country", "string | null");
    } catch (e) {
      try {
        checkNull(d.country, field + ".country", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d["country_alpha2"], field + ".country_alpha2");
    checkNull(d.credits, field + ".credits");
    checkNull(d.current_mandate, field + ".current_mandate");
    checkString(d.customer_type, field + ".customer_type");
    checkNull(d.debits, field + ".debits");
    checkString(d.delivery_address, field + ".delivery_address");
    checkString(d.delivery_address_additional_info, field + ".delivery_address_additional_info");
    checkString(d.delivery_city, field + ".delivery_city");
    checkNull(d.delivery_country, field + ".delivery_country");
    checkString(d["delivery_country_alpha2"], field + ".delivery_country_alpha2");
    checkString(d.delivery_postal_code, field + ".delivery_postal_code");
    checkBoolean(d.disable_pending_vat, field + ".disable_pending_vat");
    checkNull(d.display_name, field + ".display_name");
    checkArray(d.emails, field + ".emails");
    if (d.emails) {
      for (let i = 0; i < d.emails.length; i++) {
        checkNever(d.emails[i], field + ".emails" + "[" + i + "]");
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.establishment_no, field + ".establishment_no", "null | string");
    } catch (e) {
      try {
        checkString(d.establishment_no, field + ".establishment_no", "null | string");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkNull(d.estimate_count, field + ".estimate_count");
    checkString(d.first_name, field + ".first_name");
    checkBoolean(d.force_pending_vat, field + ".force_pending_vat");
    checkNull(d.gender, field + ".gender");
    checkNull(d.gocardless_id, field + ".gocardless_id");
    checkString(d.iban, field + ".iban");
    checkNumber(d.id, field + ".id");
    checkNull(d.invoice_count, field + ".invoice_count");
    checkNull(d.invoice_dump_id, field + ".invoice_dump_id");
    checkBoolean(d.invoices_auto_generated, field + ".invoices_auto_generated");
    checkBoolean(d.invoices_auto_validated, field + ".invoices_auto_validated");
    // This will be refactored in the next release.
    try {
      checkNull(d.known_supplier_id, field + ".known_supplier_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.known_supplier_id, field + ".known_supplier_id", "null | number");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.last_name, field + ".last_name");
    checkNull(d.ledger_events_count, field + ".ledger_events_count");
    checkString(d.legal_form_code, field + ".legal_form_code");
    checkString(d.method, field + ".method");
    checkString(d.name, field + ".name");
    checkString(d.notes, field + ".notes");
    checkNull(d.notes_comment, field + ".notes_comment");
    checkString(d.payment_conditions, field + ".payment_conditions");
    checkString(d.phone, field + ".phone");
    d.plan_item = PlanItemOrPnlPlanItem.Create(d.plan_item, field + ".plan_item");
    checkNull(d.plan_item_attributes, field + ".plan_item_attributes");
    checkNumber(d.plan_item_id, field + ".plan_item_id");
    // This will be refactored in the next release.
    try {
      d.pnl_plan_item = PlanItemOrPnlPlanItem1.Create(d.pnl_plan_item, field + ".pnl_plan_item", "PlanItemOrPnlPlanItem1 | null");
    } catch (e) {
      try {
        checkNull(d.pnl_plan_item, field + ".pnl_plan_item", "PlanItemOrPnlPlanItem1 | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    // This will be refactored in the next release.
    try {
      checkNumber(d.pnl_plan_item_id, field + ".pnl_plan_item_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.pnl_plan_item_id, field + ".pnl_plan_item_id", "number | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.postal_code, field + ".postal_code");
    checkNull(d.purchase_request_count, field + ".purchase_request_count");
    checkBoolean(d.received_a_mandate_request, field + ".received_a_mandate_request");
    checkString(d.recipient, field + ".recipient");
    checkBoolean(d.recurrent, field + ".recurrent");
    checkString(d.reference, field + ".reference");
    checkString(d.reg_no, field + ".reg_no");
    checkString(d.role, field + ".role");
    checkBoolean(d.rule_enabled, field + ".rule_enabled");
    checkArray(d.search_terms, field + ".search_terms");
    if (d.search_terms) {
      for (let i = 0; i < d.search_terms.length; i++) {
        checkString(d.search_terms[i], field + ".search_terms" + "[" + i + "]");
      }
    }
    checkString(d.source_id, field + ".source_id");
    checkNull(d.stripe_id, field + ".stripe_id");
    checkNull(d.supplier_payment_method, field + ".supplier_payment_method");
    // This will be refactored in the next release.
    try {
      checkNull(d.supplier_payment_method_last_updated_at, field + ".supplier_payment_method_last_updated_at", "null | string");
    } catch (e) {
      try {
        checkString(d.supplier_payment_method_last_updated_at, field + ".supplier_payment_method_last_updated_at", "null | string");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkArray(d.tags, field + ".tags");
    if (d.tags) {
      for (let i = 0; i < d.tags.length; i++) {
        checkNever(d.tags[i], field + ".tags" + "[" + i + "]");
      }
    }
    checkNull(d.turnover, field + ".turnover");
    checkString(d.url, field + ".url");
    checkString(d.vat_number, field + ".vat_number");
    // This will be refactored in the next release.
    try {
      checkString(d.vat_rate, field + ".vat_rate", "string | null");
    } catch (e) {
      try {
        checkNull(d.vat_rate, field + ".vat_rate", "string | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    const knownProperties = ["activity_code","activity_nomenclature","address","address_additional_info","admin_city_code","balance","billing_bank","billing_bic","billing_footer_invoice_id","billing_footer_invoice_label","billing_iban","billing_language","city","company_id","complete","country","country_alpha2","credits","current_mandate","customer_type","debits","delivery_address","delivery_address_additional_info","delivery_city","delivery_country","delivery_country_alpha2","delivery_postal_code","disable_pending_vat","display_name","emails","establishment_no","estimate_count","first_name","force_pending_vat","gender","gocardless_id","iban","id","invoice_count","invoice_dump_id","invoices_auto_generated","invoices_auto_validated","known_supplier_id","last_name","ledger_events_count","legal_form_code","method","name","notes","notes_comment","payment_conditions","phone","plan_item","plan_item_attributes","plan_item_id","pnl_plan_item","pnl_plan_item_id","postal_code","purchase_request_count","received_a_mandate_request","recipient","recurrent","reference","reg_no","role","rule_enabled","search_terms","source_id","stripe_id","supplier_payment_method","supplier_payment_method_last_updated_at","tags","turnover","url","vat_number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Thirdparty(d);
  }
  private constructor(d: any) {
    this.activity_code = d.activity_code;
    this.activity_nomenclature = d.activity_nomenclature;
    this.address = d.address;
    this.address_additional_info = d.address_additional_info;
    this.admin_city_code = d.admin_city_code;
    this.balance = d.balance;
    this.billing_bank = d.billing_bank;
    this.billing_bic = d.billing_bic;
    this.billing_footer_invoice_id = d.billing_footer_invoice_id;
    this.billing_footer_invoice_label = d.billing_footer_invoice_label;
    this.billing_iban = d.billing_iban;
    this.billing_language = d.billing_language;
    this.city = d.city;
    this.company_id = d.company_id;
    this.complete = d.complete;
    this.country = d.country;
    this["country_alpha2"] = d["country_alpha2"];
    this.credits = d.credits;
    this.current_mandate = d.current_mandate;
    this.customer_type = d.customer_type;
    this.debits = d.debits;
    this.delivery_address = d.delivery_address;
    this.delivery_address_additional_info = d.delivery_address_additional_info;
    this.delivery_city = d.delivery_city;
    this.delivery_country = d.delivery_country;
    this["delivery_country_alpha2"] = d["delivery_country_alpha2"];
    this.delivery_postal_code = d.delivery_postal_code;
    this.disable_pending_vat = d.disable_pending_vat;
    this.display_name = d.display_name;
    this.emails = d.emails;
    this.establishment_no = d.establishment_no;
    this.estimate_count = d.estimate_count;
    this.first_name = d.first_name;
    this.force_pending_vat = d.force_pending_vat;
    this.gender = d.gender;
    this.gocardless_id = d.gocardless_id;
    this.iban = d.iban;
    this.id = d.id;
    this.invoice_count = d.invoice_count;
    this.invoice_dump_id = d.invoice_dump_id;
    this.invoices_auto_generated = d.invoices_auto_generated;
    this.invoices_auto_validated = d.invoices_auto_validated;
    this.known_supplier_id = d.known_supplier_id;
    this.last_name = d.last_name;
    this.ledger_events_count = d.ledger_events_count;
    this.legal_form_code = d.legal_form_code;
    this.method = d.method;
    this.name = d.name;
    this.notes = d.notes;
    this.notes_comment = d.notes_comment;
    this.payment_conditions = d.payment_conditions;
    this.phone = d.phone;
    this.plan_item = d.plan_item;
    this.plan_item_attributes = d.plan_item_attributes;
    this.plan_item_id = d.plan_item_id;
    this.pnl_plan_item = d.pnl_plan_item;
    this.pnl_plan_item_id = d.pnl_plan_item_id;
    this.postal_code = d.postal_code;
    this.purchase_request_count = d.purchase_request_count;
    this.received_a_mandate_request = d.received_a_mandate_request;
    this.recipient = d.recipient;
    this.recurrent = d.recurrent;
    this.reference = d.reference;
    this.reg_no = d.reg_no;
    this.role = d.role;
    this.rule_enabled = d.rule_enabled;
    this.search_terms = d.search_terms;
    this.source_id = d.source_id;
    this.stripe_id = d.stripe_id;
    this.supplier_payment_method = d.supplier_payment_method;
    this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;
    this.tags = d.tags;
    this.turnover = d.turnover;
    this.url = d.url;
    this.vat_number = d.vat_number;
    this.vat_rate = d.vat_rate;
  }
}

export class PlanItemOrPnlPlanItem {
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly internal_identifier: null;
  public readonly label: string;
  public readonly label_is_editable: boolean;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): PlanItemOrPnlPlanItem {
    return PlanItemOrPnlPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItemOrPnlPlanItem {
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
    checkNumber(d.company_id, field + ".company_id");
    checkString(d["country_alpha2"], field + ".country_alpha2");
    checkBoolean(d.enabled, field + ".enabled");
    checkNumber(d.id, field + ".id");
    checkNull(d.internal_identifier, field + ".internal_identifier");
    checkString(d.label, field + ".label");
    checkBoolean(d.label_is_editable, field + ".label_is_editable");
    checkString(d.number, field + ".number");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["company_id","country_alpha2","enabled","id","internal_identifier","label","label_is_editable","number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PlanItemOrPnlPlanItem(d);
  }
  private constructor(d: any) {
    this.company_id = d.company_id;
    this["country_alpha2"] = d["country_alpha2"];
    this.enabled = d.enabled;
    this.id = d.id;
    this.internal_identifier = d.internal_identifier;
    this.label = d.label;
    this.label_is_editable = d.label_is_editable;
    this.number = d.number;
    this.vat_rate = d.vat_rate;
  }
}

export class PlanItemOrPnlPlanItem1 {
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly internal_identifier: null | string;
  public readonly label: string;
  public readonly label_is_editable: boolean;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): PlanItemOrPnlPlanItem1 {
    return PlanItemOrPnlPlanItem1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItemOrPnlPlanItem1 {
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
    checkNumber(d.company_id, field + ".company_id");
    checkString(d["country_alpha2"], field + ".country_alpha2");
    checkBoolean(d.enabled, field + ".enabled");
    checkNumber(d.id, field + ".id");
    // This will be refactored in the next release.
    try {
      checkNull(d.internal_identifier, field + ".internal_identifier", "null | string");
    } catch (e) {
      try {
        checkString(d.internal_identifier, field + ".internal_identifier", "null | string");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
      }
    }
    checkString(d.label, field + ".label");
    checkBoolean(d.label_is_editable, field + ".label_is_editable");
    checkString(d.number, field + ".number");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["company_id","country_alpha2","enabled","id","internal_identifier","label","label_is_editable","number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PlanItemOrPnlPlanItem1(d);
  }
  private constructor(d: any) {
    this.company_id = d.company_id;
    this["country_alpha2"] = d["country_alpha2"];
    this.enabled = d.enabled;
    this.id = d.id;
    this.internal_identifier = d.internal_identifier;
    this.label = d.label;
    this.label_is_editable = d.label_is_editable;
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
    console.log('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d), jsonClone);
    prompt(proxyName+':', JSON.stringify(obj));
  }
}
