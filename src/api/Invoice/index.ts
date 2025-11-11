// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoice';
let obj: any = null;
export class APIInvoice {
  public readonly amount: string | number;
  public readonly approval_status: null;
  public readonly archived: boolean;
  public readonly attachment_required: boolean;
  public readonly blob_id: number | null;
  public readonly checksum: string | null;
  public readonly client_comments_count: number;
  public readonly company_id: number;
  public readonly created_at: string;
  public readonly currency: string;
  public readonly currency_amount: string | number;
  public readonly currency_price_before_tax: string | number;
  public readonly currency_tax: string | number;
  public readonly current_account_plan_item: null | PnlPlanItemOrCurrentAccountPlanItem;
  public readonly current_account_plan_item_id: null | number;
  public readonly current_account_visible?: boolean;
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
  public readonly label: string | null;
  public readonly method: string;
  public readonly mileage_allowance: null;
  public readonly outstanding_balance: string;
  public readonly pages_count: number | null;
  public readonly paid: boolean;
  public readonly payment_status: string;
  public readonly pdf_invoice_free_text?: string;
  public readonly pdf_invoice_subject?: string;
  public readonly preview_status: string | null;
  public readonly preview_urls: string[];
  public readonly price_before_tax?: number;
  public readonly pusher_channel: string;
  public readonly source: string;
  public readonly status: string;
  public readonly subcomplete: boolean;
  public readonly tagged_at_ledger_events_level: boolean;
  public readonly tax?: number;
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
    // This will be refactored in the next release.
    try {
      checkString(d.amount, field + ".amount", "string | number");
    } catch (e) {
      try {
        checkNumber(d.amount, field + ".amount", "string | number");
      } catch (e) {
      }
    }
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
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.checksum, field + ".checksum", "string | null");
    } catch (e) {
      try {
        checkNull(d.checksum, field + ".checksum", "string | null");
      } catch (e) {
      }
    }
    checkNumber(d.client_comments_count, field + ".client_comments_count");
    checkNumber(d.company_id, field + ".company_id");
    checkString(d.created_at, field + ".created_at");
    checkString(d.currency, field + ".currency");
    // This will be refactored in the next release.
    try {
      checkString(d.currency_amount, field + ".currency_amount", "string | number");
    } catch (e) {
      try {
        checkNumber(d.currency_amount, field + ".currency_amount", "string | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.currency_price_before_tax, field + ".currency_price_before_tax", "string | number");
    } catch (e) {
      try {
        checkNumber(d.currency_price_before_tax, field + ".currency_price_before_tax", "string | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.currency_tax, field + ".currency_tax", "string | number");
    } catch (e) {
      try {
        checkNumber(d.currency_tax, field + ".currency_tax", "string | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.current_account_plan_item, field + ".current_account_plan_item", "null | PnlPlanItemOrCurrentAccountPlanItem");
    } catch (e) {
      try {
        d.current_account_plan_item = PnlPlanItemOrCurrentAccountPlanItem.Create(d.current_account_plan_item, field + ".current_account_plan_item", "null | PnlPlanItemOrCurrentAccountPlanItem");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.current_account_plan_item_id, field + ".current_account_plan_item_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.current_account_plan_item_id, field + ".current_account_plan_item_id", "null | number");
      } catch (e) {
      }
    }
    if ("current_account_visible" in d) {
      checkBoolean(d.current_account_visible, field + ".current_account_visible");
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.date, field + ".date", "null | string");
    } catch (e) {
      try {
        checkString(d.date, field + ".date", "null | string");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.deadline, field + ".deadline", "null | string");
    } catch (e) {
      try {
        checkString(d.deadline, field + ".deadline", "null | string");
      } catch (e) {
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
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.gdrive_path, field + ".gdrive_path", "string | null");
    } catch (e) {
      try {
        checkNull(d.gdrive_path, field + ".gdrive_path", "string | null");
      } catch (e) {
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
    // This will be refactored in the next release.
    try {
      checkString(d.label, field + ".label", "string | null");
    } catch (e) {
      try {
        checkNull(d.label, field + ".label", "string | null");
      } catch (e) {
      }
    }
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
      }
    }
    checkBoolean(d.paid, field + ".paid");
    checkString(d.payment_status, field + ".payment_status");
    if ("pdf_invoice_free_text" in d) {
      checkString(d.pdf_invoice_free_text, field + ".pdf_invoice_free_text");
    }
    if ("pdf_invoice_subject" in d) {
      checkString(d.pdf_invoice_subject, field + ".pdf_invoice_subject");
    }
    // This will be refactored in the next release.
    try {
      checkString(d.preview_status, field + ".preview_status", "string | null");
    } catch (e) {
      try {
        checkNull(d.preview_status, field + ".preview_status", "string | null");
      } catch (e) {
      }
    }
    checkArray(d.preview_urls, field + ".preview_urls");
    if (d.preview_urls) {
      for (let i = 0; i < d.preview_urls.length; i++) {
        checkString(d.preview_urls[i], field + ".preview_urls" + "[" + i + "]");
      }
    }
    if ("price_before_tax" in d) {
      checkNumber(d.price_before_tax, field + ".price_before_tax");
    }
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkString(d.source, field + ".source");
    checkString(d.status, field + ".status");
    checkBoolean(d.subcomplete, field + ".subcomplete");
    checkBoolean(d.tagged_at_ledger_events_level, field + ".tagged_at_ledger_events_level");
    if ("tax" in d) {
      checkNumber(d.tax, field + ".tax");
    }
    // This will be refactored in the next release.
    try {
      d.thirdparty = Thirdparty.Create(d.thirdparty, field + ".thirdparty", "Thirdparty | null");
    } catch (e) {
      try {
        checkNull(d.thirdparty, field + ".thirdparty", "Thirdparty | null");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNumber(d.thirdparty_id, field + ".thirdparty_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.thirdparty_id, field + ".thirdparty_id", "number | null");
      } catch (e) {
      }
    }
    checkString(d.type, field + ".type");
    checkString(d.url, field + ".url");
    checkBoolean(d.validation_needed, field + ".validation_needed");
    const knownProperties = ["amount","approval_status","archived","attachment_required","blob_id","checksum","client_comments_count","company_id","created_at","currency","currency_amount","currency_price_before_tax","currency_tax","current_account_plan_item","current_account_plan_item_id","current_account_visible","date","deadline","direction","document_tags","duplicates_count","email_from","embeddable_in_browser","file_signed_id","filename","gdrive_path","group_uuid","has_closed_ledger_events","has_duplicates","has_file","id","incomplete","invoice_lines","invoice_lines_count","invoice_number","is_employee_expense","is_estimate","is_factur_x","is_waiting_for_ocr","journal_id","label","method","mileage_allowance","outstanding_balance","pages_count","paid","payment_status","pdf_invoice_free_text","pdf_invoice_subject","preview_status","preview_urls","price_before_tax","pusher_channel","source","status","subcomplete","tagged_at_ledger_events_level","tax","thirdparty","thirdparty_id","type","url","validation_needed"];
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
    if ("current_account_visible" in d) this.current_account_visible = d.current_account_visible;
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
    if ("pdf_invoice_free_text" in d) this.pdf_invoice_free_text = d.pdf_invoice_free_text;
    if ("pdf_invoice_subject" in d) this.pdf_invoice_subject = d.pdf_invoice_subject;
    this.preview_status = d.preview_status;
    this.preview_urls = d.preview_urls;
    if ("price_before_tax" in d) this.price_before_tax = d.price_before_tax;
    this.pusher_channel = d.pusher_channel;
    this.source = d.source;
    this.status = d.status;
    this.subcomplete = d.subcomplete;
    this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;
    if ("tax" in d) this.tax = d.tax;
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
  public readonly color?: null | string;
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
    if ("color" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.color, field + ".color", "null | string");
      } catch (e) {
        try {
          checkString(d.color, field + ".color", "null | string");
        } catch (e) {
        }
      }
    }
    d.group = Group.Create(d.group, field + ".group");
    checkNumber(d.group_id, field + ".group_id");
    checkNull(d.icon, field + ".icon");
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    checkNull(d.variant, field + ".variant");
    const knownProperties = ["analytical_code","color","group","group_id","icon","id","label","variant"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Tag(d);
  }
  private constructor(d: any) {
    this.analytical_code = d.analytical_code;
    if ("color" in d) this.color = d.color;
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
  public readonly _destroy?: boolean;
  public readonly advance: null | Advance;
  public readonly advance_id: null | number;
  public readonly advance_pnl: boolean;
  public readonly amount: string | number;
  public readonly asset: null | Asset;
  public readonly asset_id: null | number;
  public readonly currency_amount: string | number;
  public readonly currency_price_before_tax: string | number;
  public readonly currency_tax: string | number;
  public readonly deferral: null;
  public readonly deferral_id: null;
  public readonly global_vat: boolean;
  public readonly has_asset?: boolean;
  public readonly id: number;
  public readonly invoice_line_period?: null;
  public readonly label: string;
  public readonly ledger_event_label: null | string;
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
    if ("_destroy" in d) {
      checkBoolean(d._destroy, field + "._destroy");
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.advance, field + ".advance", "null | Advance");
    } catch (e) {
      try {
        d.advance = Advance.Create(d.advance, field + ".advance", "null | Advance");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.advance_id, field + ".advance_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.advance_id, field + ".advance_id", "null | number");
      } catch (e) {
      }
    }
    checkBoolean(d.advance_pnl, field + ".advance_pnl");
    // This will be refactored in the next release.
    try {
      checkString(d.amount, field + ".amount", "string | number");
    } catch (e) {
      try {
        checkNumber(d.amount, field + ".amount", "string | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.asset, field + ".asset", "null | Asset");
    } catch (e) {
      try {
        d.asset = Asset.Create(d.asset, field + ".asset", "null | Asset");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.asset_id, field + ".asset_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.asset_id, field + ".asset_id", "null | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.currency_amount, field + ".currency_amount", "string | number");
    } catch (e) {
      try {
        checkNumber(d.currency_amount, field + ".currency_amount", "string | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.currency_price_before_tax, field + ".currency_price_before_tax", "string | number");
    } catch (e) {
      try {
        checkNumber(d.currency_price_before_tax, field + ".currency_price_before_tax", "string | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.currency_tax, field + ".currency_tax", "string | number");
    } catch (e) {
      try {
        checkNumber(d.currency_tax, field + ".currency_tax", "string | number");
      } catch (e) {
      }
    }
    checkNull(d.deferral, field + ".deferral");
    checkNull(d.deferral_id, field + ".deferral_id");
    checkBoolean(d.global_vat, field + ".global_vat");
    if ("has_asset" in d) {
      checkBoolean(d.has_asset, field + ".has_asset");
    }
    checkNumber(d.id, field + ".id");
    if ("invoice_line_period" in d) {
      checkNull(d.invoice_line_period, field + ".invoice_line_period");
    }
    checkString(d.label, field + ".label");
    // This will be refactored in the next release.
    try {
      checkNull(d.ledger_event_label, field + ".ledger_event_label", "null | string");
    } catch (e) {
      try {
        checkString(d.ledger_event_label, field + ".ledger_event_label", "null | string");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.ocr_vat_rate, field + ".ocr_vat_rate", "null | string");
    } catch (e) {
      try {
        checkString(d.ocr_vat_rate, field + ".ocr_vat_rate", "null | string");
      } catch (e) {
      }
    }
    d.pnl_plan_item = PnlPlanItemOrCurrentAccountPlanItem1.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    checkNumber(d.pnl_plan_item_id, field + ".pnl_plan_item_id");
    checkBoolean(d.prepaid_pnl, field + ".prepaid_pnl");
    checkString(d.tax, field + ".tax");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["_destroy","advance","advance_id","advance_pnl","amount","asset","asset_id","currency_amount","currency_price_before_tax","currency_tax","deferral","deferral_id","global_vat","has_asset","id","invoice_line_period","label","ledger_event_label","ocr_vat_rate","pnl_plan_item","pnl_plan_item_id","prepaid_pnl","tax","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new InvoiceLinesEntity(d);
  }
  private constructor(d: any) {
    if ("_destroy" in d) this._destroy = d._destroy;
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
    if ("has_asset" in d) this.has_asset = d.has_asset;
    this.id = d.id;
    if ("invoice_line_period" in d) this.invoice_line_period = d.invoice_line_period;
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

export class Advance {
  public readonly company_id: number;
  public readonly date: string;
  public readonly end_date?: null;
  public readonly has_ledger_events: boolean;
  public readonly id: number;
  public static Parse(d: string): Advance {
    return Advance.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Advance {
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
    checkString(d.date, field + ".date");
    if ("end_date" in d) {
      checkNull(d.end_date, field + ".end_date");
    }
    checkBoolean(d.has_ledger_events, field + ".has_ledger_events");
    checkNumber(d.id, field + ".id");
    const knownProperties = ["company_id","date","end_date","has_ledger_events","id"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Advance(d);
  }
  private constructor(d: any) {
    this.company_id = d.company_id;
    this.date = d.date;
    if ("end_date" in d) this.end_date = d.end_date;
    this.has_ledger_events = d.has_ledger_events;
    this.id = d.id;
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
  public readonly activity_code?: string;
  public readonly activity_nomenclature?: string;
  public readonly address?: string;
  public readonly address_additional_info?: string;
  public readonly admin_city_code?: null;
  public readonly balance?: null;
  public readonly billing_bank?: null;
  public readonly billing_bic?: null;
  public readonly billing_footer_invoice_id?: null;
  public readonly billing_footer_invoice_label?: null;
  public readonly billing_iban?: null;
  public readonly billing_language?: string;
  public readonly city?: string;
  public readonly company_id?: number;
  public readonly complete?: boolean;
  public readonly country?: string | null;
  public readonly "country_alpha2": string;
  public readonly credits?: null;
  public readonly current_mandate?: null;
  public readonly customer_type?: string;
  public readonly debits?: null;
  public readonly delivery_address?: string;
  public readonly delivery_address_additional_info?: string;
  public readonly delivery_city?: string;
  public readonly delivery_country?: null;
  public readonly "delivery_country_alpha2"?: string;
  public readonly delivery_postal_code?: string;
  public readonly disable_pending_vat?: boolean;
  public readonly display_name?: null;
  public readonly emails?: never[];
  public readonly establishment_no?: null | string;
  public readonly estimate_count?: null;
  public readonly first_name?: string;
  public readonly force_pending_vat?: boolean;
  public readonly gender?: null;
  public readonly gocardless_id?: null;
  public readonly iban?: string;
  public readonly id: number;
  public readonly invoice_count?: null;
  public readonly invoice_dump_id?: null;
  public readonly invoices_auto_generated?: boolean;
  public readonly invoices_auto_validated?: boolean;
  public readonly known_supplier_id?: null | number;
  public readonly last_name?: string;
  public readonly ledger_events_count?: null;
  public readonly legal_form_code?: string;
  public readonly method?: string;
  public readonly name: string;
  public readonly notes?: string;
  public readonly notes_comment?: null;
  public readonly payment_conditions?: string;
  public readonly phone?: string;
  public readonly plan_item?: PlanItemOrPnlPlanItem;
  public readonly plan_item_attributes?: null;
  public readonly plan_item_id?: number;
  public readonly pnl_plan_item: PlanItemOrPnlPlanItemOrCurrentAccountPlanItem | null;
  public readonly pnl_plan_item_id: number | null;
  public readonly postal_code?: string;
  public readonly purchase_request_count?: null;
  public readonly received_a_mandate_request?: boolean;
  public readonly recipient?: string;
  public readonly recurrent?: boolean;
  public readonly reference?: string;
  public readonly reg_no?: string;
  public readonly role?: string;
  public readonly rule_enabled?: boolean;
  public readonly search_terms?: string[];
  public readonly source_id?: string;
  public readonly stripe_id?: null;
  public readonly supplier_payment_method?: null;
  public readonly supplier_payment_method_last_updated_at?: null | string;
  public readonly tags?: never[];
  public readonly turnover?: null;
  public readonly url?: string;
  public readonly vat_number?: string;
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
    if ("activity_code" in d) {
      checkString(d.activity_code, field + ".activity_code");
    }
    if ("activity_nomenclature" in d) {
      checkString(d.activity_nomenclature, field + ".activity_nomenclature");
    }
    if ("address" in d) {
      checkString(d.address, field + ".address");
    }
    if ("address_additional_info" in d) {
      checkString(d.address_additional_info, field + ".address_additional_info");
    }
    if ("admin_city_code" in d) {
      checkNull(d.admin_city_code, field + ".admin_city_code");
    }
    if ("balance" in d) {
      checkNull(d.balance, field + ".balance");
    }
    if ("billing_bank" in d) {
      checkNull(d.billing_bank, field + ".billing_bank");
    }
    if ("billing_bic" in d) {
      checkNull(d.billing_bic, field + ".billing_bic");
    }
    if ("billing_footer_invoice_id" in d) {
      checkNull(d.billing_footer_invoice_id, field + ".billing_footer_invoice_id");
    }
    if ("billing_footer_invoice_label" in d) {
      checkNull(d.billing_footer_invoice_label, field + ".billing_footer_invoice_label");
    }
    if ("billing_iban" in d) {
      checkNull(d.billing_iban, field + ".billing_iban");
    }
    if ("billing_language" in d) {
      checkString(d.billing_language, field + ".billing_language");
    }
    if ("city" in d) {
      checkString(d.city, field + ".city");
    }
    if ("company_id" in d) {
      checkNumber(d.company_id, field + ".company_id");
    }
    if ("complete" in d) {
      checkBoolean(d.complete, field + ".complete");
    }
    if ("country" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.country, field + ".country", "string | null");
      } catch (e) {
        try {
          checkNull(d.country, field + ".country", "string | null");
        } catch (e) {
        }
      }
    }
    checkString(d["country_alpha2"], field + ".country_alpha2");
    if ("credits" in d) {
      checkNull(d.credits, field + ".credits");
    }
    if ("current_mandate" in d) {
      checkNull(d.current_mandate, field + ".current_mandate");
    }
    if ("customer_type" in d) {
      checkString(d.customer_type, field + ".customer_type");
    }
    if ("debits" in d) {
      checkNull(d.debits, field + ".debits");
    }
    if ("delivery_address" in d) {
      checkString(d.delivery_address, field + ".delivery_address");
    }
    if ("delivery_address_additional_info" in d) {
      checkString(d.delivery_address_additional_info, field + ".delivery_address_additional_info");
    }
    if ("delivery_city" in d) {
      checkString(d.delivery_city, field + ".delivery_city");
    }
    if ("delivery_country" in d) {
      checkNull(d.delivery_country, field + ".delivery_country");
    }
    if ("delivery_country_alpha2" in d) {
      checkString(d["delivery_country_alpha2"], field + ".delivery_country_alpha2");
    }
    if ("delivery_postal_code" in d) {
      checkString(d.delivery_postal_code, field + ".delivery_postal_code");
    }
    if ("disable_pending_vat" in d) {
      checkBoolean(d.disable_pending_vat, field + ".disable_pending_vat");
    }
    if ("display_name" in d) {
      checkNull(d.display_name, field + ".display_name");
    }
    if ("emails" in d) {
      checkArray(d.emails, field + ".emails");
      if (d.emails) {
        for (let i = 0; i < d.emails.length; i++) {
          checkNever(d.emails[i], field + ".emails" + "[" + i + "]");
        }
      }
    }
    if ("establishment_no" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.establishment_no, field + ".establishment_no", "null | string");
      } catch (e) {
        try {
          checkString(d.establishment_no, field + ".establishment_no", "null | string");
        } catch (e) {
        }
      }
    }
    if ("estimate_count" in d) {
      checkNull(d.estimate_count, field + ".estimate_count");
    }
    if ("first_name" in d) {
      checkString(d.first_name, field + ".first_name");
    }
    if ("force_pending_vat" in d) {
      checkBoolean(d.force_pending_vat, field + ".force_pending_vat");
    }
    if ("gender" in d) {
      checkNull(d.gender, field + ".gender");
    }
    if ("gocardless_id" in d) {
      checkNull(d.gocardless_id, field + ".gocardless_id");
    }
    if ("iban" in d) {
      checkString(d.iban, field + ".iban");
    }
    checkNumber(d.id, field + ".id");
    if ("invoice_count" in d) {
      checkNull(d.invoice_count, field + ".invoice_count");
    }
    if ("invoice_dump_id" in d) {
      checkNull(d.invoice_dump_id, field + ".invoice_dump_id");
    }
    if ("invoices_auto_generated" in d) {
      checkBoolean(d.invoices_auto_generated, field + ".invoices_auto_generated");
    }
    if ("invoices_auto_validated" in d) {
      checkBoolean(d.invoices_auto_validated, field + ".invoices_auto_validated");
    }
    if ("known_supplier_id" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.known_supplier_id, field + ".known_supplier_id", "null | number");
      } catch (e) {
        try {
          checkNumber(d.known_supplier_id, field + ".known_supplier_id", "null | number");
        } catch (e) {
        }
      }
    }
    if ("last_name" in d) {
      checkString(d.last_name, field + ".last_name");
    }
    if ("ledger_events_count" in d) {
      checkNull(d.ledger_events_count, field + ".ledger_events_count");
    }
    if ("legal_form_code" in d) {
      checkString(d.legal_form_code, field + ".legal_form_code");
    }
    if ("method" in d) {
      checkString(d.method, field + ".method");
    }
    checkString(d.name, field + ".name");
    if ("notes" in d) {
      checkString(d.notes, field + ".notes");
    }
    if ("notes_comment" in d) {
      checkNull(d.notes_comment, field + ".notes_comment");
    }
    if ("payment_conditions" in d) {
      checkString(d.payment_conditions, field + ".payment_conditions");
    }
    if ("phone" in d) {
      checkString(d.phone, field + ".phone");
    }
    if ("plan_item" in d) {
      d.plan_item = PlanItemOrPnlPlanItem.Create(d.plan_item, field + ".plan_item");
    }
    if ("plan_item_attributes" in d) {
      checkNull(d.plan_item_attributes, field + ".plan_item_attributes");
    }
    if ("plan_item_id" in d) {
      checkNumber(d.plan_item_id, field + ".plan_item_id");
    }
    // This will be refactored in the next release.
    try {
      d.pnl_plan_item = PlanItemOrPnlPlanItemOrCurrentAccountPlanItem.Create(d.pnl_plan_item, field + ".pnl_plan_item", "PlanItemOrPnlPlanItemOrCurrentAccountPlanItem | null");
    } catch (e) {
      try {
        checkNull(d.pnl_plan_item, field + ".pnl_plan_item", "PlanItemOrPnlPlanItemOrCurrentAccountPlanItem | null");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNumber(d.pnl_plan_item_id, field + ".pnl_plan_item_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.pnl_plan_item_id, field + ".pnl_plan_item_id", "number | null");
      } catch (e) {
      }
    }
    if ("postal_code" in d) {
      checkString(d.postal_code, field + ".postal_code");
    }
    if ("purchase_request_count" in d) {
      checkNull(d.purchase_request_count, field + ".purchase_request_count");
    }
    if ("received_a_mandate_request" in d) {
      checkBoolean(d.received_a_mandate_request, field + ".received_a_mandate_request");
    }
    if ("recipient" in d) {
      checkString(d.recipient, field + ".recipient");
    }
    if ("recurrent" in d) {
      checkBoolean(d.recurrent, field + ".recurrent");
    }
    if ("reference" in d) {
      checkString(d.reference, field + ".reference");
    }
    if ("reg_no" in d) {
      checkString(d.reg_no, field + ".reg_no");
    }
    if ("role" in d) {
      checkString(d.role, field + ".role");
    }
    if ("rule_enabled" in d) {
      checkBoolean(d.rule_enabled, field + ".rule_enabled");
    }
    if ("search_terms" in d) {
      checkArray(d.search_terms, field + ".search_terms");
      if (d.search_terms) {
        for (let i = 0; i < d.search_terms.length; i++) {
          checkString(d.search_terms[i], field + ".search_terms" + "[" + i + "]");
        }
      }
    }
    if ("source_id" in d) {
      checkString(d.source_id, field + ".source_id");
    }
    if ("stripe_id" in d) {
      checkNull(d.stripe_id, field + ".stripe_id");
    }
    if ("supplier_payment_method" in d) {
      checkNull(d.supplier_payment_method, field + ".supplier_payment_method");
    }
    if ("supplier_payment_method_last_updated_at" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.supplier_payment_method_last_updated_at, field + ".supplier_payment_method_last_updated_at", "null | string");
      } catch (e) {
        try {
          checkString(d.supplier_payment_method_last_updated_at, field + ".supplier_payment_method_last_updated_at", "null | string");
        } catch (e) {
        }
      }
    }
    if ("tags" in d) {
      checkArray(d.tags, field + ".tags");
      if (d.tags) {
        for (let i = 0; i < d.tags.length; i++) {
          checkNever(d.tags[i], field + ".tags" + "[" + i + "]");
        }
      }
    }
    if ("turnover" in d) {
      checkNull(d.turnover, field + ".turnover");
    }
    if ("url" in d) {
      checkString(d.url, field + ".url");
    }
    if ("vat_number" in d) {
      checkString(d.vat_number, field + ".vat_number");
    }
    // This will be refactored in the next release.
    try {
      checkString(d.vat_rate, field + ".vat_rate", "string | null");
    } catch (e) {
      try {
        checkNull(d.vat_rate, field + ".vat_rate", "string | null");
      } catch (e) {
      }
    }
    const knownProperties = ["activity_code","activity_nomenclature","address","address_additional_info","admin_city_code","balance","billing_bank","billing_bic","billing_footer_invoice_id","billing_footer_invoice_label","billing_iban","billing_language","city","company_id","complete","country","country_alpha2","credits","current_mandate","customer_type","debits","delivery_address","delivery_address_additional_info","delivery_city","delivery_country","delivery_country_alpha2","delivery_postal_code","disable_pending_vat","display_name","emails","establishment_no","estimate_count","first_name","force_pending_vat","gender","gocardless_id","iban","id","invoice_count","invoice_dump_id","invoices_auto_generated","invoices_auto_validated","known_supplier_id","last_name","ledger_events_count","legal_form_code","method","name","notes","notes_comment","payment_conditions","phone","plan_item","plan_item_attributes","plan_item_id","pnl_plan_item","pnl_plan_item_id","postal_code","purchase_request_count","received_a_mandate_request","recipient","recurrent","reference","reg_no","role","rule_enabled","search_terms","source_id","stripe_id","supplier_payment_method","supplier_payment_method_last_updated_at","tags","turnover","url","vat_number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Thirdparty(d);
  }
  private constructor(d: any) {
    if ("activity_code" in d) this.activity_code = d.activity_code;
    if ("activity_nomenclature" in d) this.activity_nomenclature = d.activity_nomenclature;
    if ("address" in d) this.address = d.address;
    if ("address_additional_info" in d) this.address_additional_info = d.address_additional_info;
    if ("admin_city_code" in d) this.admin_city_code = d.admin_city_code;
    if ("balance" in d) this.balance = d.balance;
    if ("billing_bank" in d) this.billing_bank = d.billing_bank;
    if ("billing_bic" in d) this.billing_bic = d.billing_bic;
    if ("billing_footer_invoice_id" in d) this.billing_footer_invoice_id = d.billing_footer_invoice_id;
    if ("billing_footer_invoice_label" in d) this.billing_footer_invoice_label = d.billing_footer_invoice_label;
    if ("billing_iban" in d) this.billing_iban = d.billing_iban;
    if ("billing_language" in d) this.billing_language = d.billing_language;
    if ("city" in d) this.city = d.city;
    if ("company_id" in d) this.company_id = d.company_id;
    if ("complete" in d) this.complete = d.complete;
    if ("country" in d) this.country = d.country;
    this["country_alpha2"] = d["country_alpha2"];
    if ("credits" in d) this.credits = d.credits;
    if ("current_mandate" in d) this.current_mandate = d.current_mandate;
    if ("customer_type" in d) this.customer_type = d.customer_type;
    if ("debits" in d) this.debits = d.debits;
    if ("delivery_address" in d) this.delivery_address = d.delivery_address;
    if ("delivery_address_additional_info" in d) this.delivery_address_additional_info = d.delivery_address_additional_info;
    if ("delivery_city" in d) this.delivery_city = d.delivery_city;
    if ("delivery_country" in d) this.delivery_country = d.delivery_country;
    if ("delivery_country_alpha2" in d) this["delivery_country_alpha2"] = d["delivery_country_alpha2"];
    if ("delivery_postal_code" in d) this.delivery_postal_code = d.delivery_postal_code;
    if ("disable_pending_vat" in d) this.disable_pending_vat = d.disable_pending_vat;
    if ("display_name" in d) this.display_name = d.display_name;
    if ("emails" in d) this.emails = d.emails;
    if ("establishment_no" in d) this.establishment_no = d.establishment_no;
    if ("estimate_count" in d) this.estimate_count = d.estimate_count;
    if ("first_name" in d) this.first_name = d.first_name;
    if ("force_pending_vat" in d) this.force_pending_vat = d.force_pending_vat;
    if ("gender" in d) this.gender = d.gender;
    if ("gocardless_id" in d) this.gocardless_id = d.gocardless_id;
    if ("iban" in d) this.iban = d.iban;
    this.id = d.id;
    if ("invoice_count" in d) this.invoice_count = d.invoice_count;
    if ("invoice_dump_id" in d) this.invoice_dump_id = d.invoice_dump_id;
    if ("invoices_auto_generated" in d) this.invoices_auto_generated = d.invoices_auto_generated;
    if ("invoices_auto_validated" in d) this.invoices_auto_validated = d.invoices_auto_validated;
    if ("known_supplier_id" in d) this.known_supplier_id = d.known_supplier_id;
    if ("last_name" in d) this.last_name = d.last_name;
    if ("ledger_events_count" in d) this.ledger_events_count = d.ledger_events_count;
    if ("legal_form_code" in d) this.legal_form_code = d.legal_form_code;
    if ("method" in d) this.method = d.method;
    this.name = d.name;
    if ("notes" in d) this.notes = d.notes;
    if ("notes_comment" in d) this.notes_comment = d.notes_comment;
    if ("payment_conditions" in d) this.payment_conditions = d.payment_conditions;
    if ("phone" in d) this.phone = d.phone;
    if ("plan_item" in d) this.plan_item = d.plan_item;
    if ("plan_item_attributes" in d) this.plan_item_attributes = d.plan_item_attributes;
    if ("plan_item_id" in d) this.plan_item_id = d.plan_item_id;
    this.pnl_plan_item = d.pnl_plan_item;
    this.pnl_plan_item_id = d.pnl_plan_item_id;
    if ("postal_code" in d) this.postal_code = d.postal_code;
    if ("purchase_request_count" in d) this.purchase_request_count = d.purchase_request_count;
    if ("received_a_mandate_request" in d) this.received_a_mandate_request = d.received_a_mandate_request;
    if ("recipient" in d) this.recipient = d.recipient;
    if ("recurrent" in d) this.recurrent = d.recurrent;
    if ("reference" in d) this.reference = d.reference;
    if ("reg_no" in d) this.reg_no = d.reg_no;
    if ("role" in d) this.role = d.role;
    if ("rule_enabled" in d) this.rule_enabled = d.rule_enabled;
    if ("search_terms" in d) this.search_terms = d.search_terms;
    if ("source_id" in d) this.source_id = d.source_id;
    if ("stripe_id" in d) this.stripe_id = d.stripe_id;
    if ("supplier_payment_method" in d) this.supplier_payment_method = d.supplier_payment_method;
    if ("supplier_payment_method_last_updated_at" in d) this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;
    if ("tags" in d) this.tags = d.tags;
    if ("turnover" in d) this.turnover = d.turnover;
    if ("url" in d) this.url = d.url;
    if ("vat_number" in d) this.vat_number = d.vat_number;
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

export class PlanItemOrPnlPlanItemOrCurrentAccountPlanItem {
  public readonly company_id?: number;
  public readonly "country_alpha2"?: string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly internal_identifier?: null | string;
  public readonly label: string;
  public readonly label_is_editable?: boolean;
  public readonly number: string;
  public readonly vat_rate?: string;
  public static Parse(d: string): PlanItemOrPnlPlanItemOrCurrentAccountPlanItem {
    return PlanItemOrPnlPlanItemOrCurrentAccountPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItemOrPnlPlanItemOrCurrentAccountPlanItem {
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
    if ("company_id" in d) {
      checkNumber(d.company_id, field + ".company_id");
    }
    if ("country_alpha2" in d) {
      checkString(d["country_alpha2"], field + ".country_alpha2");
    }
    checkBoolean(d.enabled, field + ".enabled");
    checkNumber(d.id, field + ".id");
    if ("internal_identifier" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.internal_identifier, field + ".internal_identifier", "null | string");
      } catch (e) {
        try {
          checkString(d.internal_identifier, field + ".internal_identifier", "null | string");
        } catch (e) {
        }
      }
    }
    checkString(d.label, field + ".label");
    if ("label_is_editable" in d) {
      checkBoolean(d.label_is_editable, field + ".label_is_editable");
    }
    checkString(d.number, field + ".number");
    if ("vat_rate" in d) {
      checkString(d.vat_rate, field + ".vat_rate");
    }
    const knownProperties = ["company_id","country_alpha2","enabled","id","internal_identifier","label","label_is_editable","number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PlanItemOrPnlPlanItemOrCurrentAccountPlanItem(d);
  }
  private constructor(d: any) {
    if ("company_id" in d) this.company_id = d.company_id;
    if ("country_alpha2" in d) this["country_alpha2"] = d["country_alpha2"];
    this.enabled = d.enabled;
    this.id = d.id;
    if ("internal_identifier" in d) this.internal_identifier = d.internal_identifier;
    this.label = d.label;
    if ("label_is_editable" in d) this.label_is_editable = d.label_is_editable;
    this.number = d.number;
    if ("vat_rate" in d) this.vat_rate = d.vat_rate;
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
