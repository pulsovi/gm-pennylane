// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDocument';
let obj: any = null;
export class APIDocument {
  public readonly account_id?: number | null;
  public readonly accounting_type: boolean;
  public readonly amount: string;
  public readonly archived: boolean;
  public readonly archived_at: null | string;
  public readonly attachment_lost: boolean;
  public readonly attachment_required: boolean;
  public readonly billing_subscription_id: null;
  public readonly can_be_stamped_as_paid_in_pdf?: boolean;
  public readonly company?: Company | null;
  public readonly company_id: number;
  public readonly complete?: boolean | null;
  public readonly completeness?: number | null;
  public readonly converted_invoice_urls?: never[];
  public readonly created_at: string;
  public readonly credit_notes_amount?: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly currency_amount_before_tax?: string;
  public readonly currency_price_before_tax?: string;
  public readonly currency_tax?: string;
  public readonly custom_payment_reference?: string;
  public readonly date: string | null;
  public readonly deadline?: string | null;
  public readonly direction?: string;
  public readonly discount?: string;
  public readonly discount_type?: string;
  public readonly draft: boolean;
  public readonly email_from: null;
  public readonly estimate_status?: null;
  public readonly external_id: string;
  public readonly factor_status?: string;
  public readonly fec_pieceref: string;
  public readonly finalized_at?: null;
  public readonly from_estimate_id?: null;
  public readonly future_in_days?: number | null;
  public readonly gdrive_path: null | string;
  public readonly gross_amount?: string | null;
  public readonly group_uuid: string;
  public readonly grouped_at: null | string;
  public readonly grouped_documents: GroupedDocumentsEntity[];
  public readonly iban?: string;
  public readonly id: number;
  public readonly invoice_kind?: null | string;
  public readonly invoice_number?: string;
  public readonly invoicing_detailed_source?: null;
  public readonly is_credit_note?: boolean;
  public readonly is_destroyable?: boolean;
  public readonly is_estimate?: boolean;
  public readonly is_waiting_details: boolean;
  public readonly is_waiting_for_ocr?: boolean;
  public readonly journal_id: number;
  public readonly label: string | null;
  public readonly language?: string;
  public readonly manual_partial_invoices?: boolean;
  public readonly method: string;
  public readonly multiplier?: number;
  public readonly not_duplicate?: boolean;
  public readonly ocr_thirdparty_id?: null | number;
  public readonly outstanding_balance: string;
  public readonly paid?: boolean;
  public readonly payment_id?: null;
  public readonly payment_method?: null;
  public readonly payment_reference?: string;
  public readonly payment_reminder_enabled?: boolean;
  public readonly payment_status?: string;
  public readonly pdf_generation_status: string;
  public readonly pdf_invoice_display_products_list?: boolean;
  public readonly pdf_invoice_free_text?: string;
  public readonly pdf_invoice_free_text_enabled?: boolean;
  public readonly pdf_invoice_subject?: string;
  public readonly pdf_invoice_subject_enabled?: boolean;
  public readonly pdf_invoice_title?: string;
  public readonly pdf_paid_stamp?: boolean;
  public readonly preview_status: null | string;
  public readonly price_before_tax?: string;
  public readonly pusher_channel: string;
  public readonly quote_group_uuid?: string;
  public readonly quote_uid?: null;
  public readonly quotes: boolean;
  public readonly readonly: boolean;
  public readonly recipients?: never[];
  public readonly reversal_origin_id: null;
  public readonly score: null;
  public readonly scored_invoices?: ScoredInvoices | null;
  public readonly scored_transactions?: never[];
  public readonly source: string;
  public readonly special_mention?: null;
  public readonly status?: string | null;
  public readonly tax?: string;
  public readonly thirdparty_id: null | number;
  public readonly type: string;
  public readonly updated_at: string;
  public readonly url: string;
  public readonly validation_needed?: boolean;
  public static Parse(d: string): APIDocument {
    return APIDocument.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDocument {
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
    if ("account_id" in d) {
      // This will be refactored in the next release.
      try {
        checkNumber(d.account_id, field + ".account_id", "number | null");
      } catch (e) {
        try {
          checkNull(d.account_id, field + ".account_id", "number | null");
        } catch (e) {
        }
      }
    }
    checkBoolean(d.accounting_type, field + ".accounting_type");
    checkString(d.amount, field + ".amount");
    checkBoolean(d.archived, field + ".archived");
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
    checkNull(d.billing_subscription_id, field + ".billing_subscription_id");
    if ("can_be_stamped_as_paid_in_pdf" in d) {
      checkBoolean(d.can_be_stamped_as_paid_in_pdf, field + ".can_be_stamped_as_paid_in_pdf");
    }
    if ("company" in d) {
      // This will be refactored in the next release.
      try {
        d.company = Company.Create(d.company, field + ".company", "Company | null");
      } catch (e) {
        try {
          checkNull(d.company, field + ".company", "Company | null");
        } catch (e) {
        }
      }
    }
    checkNumber(d.company_id, field + ".company_id");
    if ("complete" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.complete, field + ".complete", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.complete, field + ".complete", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("completeness" in d) {
      // This will be refactored in the next release.
      try {
        checkNumber(d.completeness, field + ".completeness", "number | null");
      } catch (e) {
        try {
          checkNull(d.completeness, field + ".completeness", "number | null");
        } catch (e) {
        }
      }
    }
    if ("converted_invoice_urls" in d) {
      checkArray(d.converted_invoice_urls, field + ".converted_invoice_urls");
      if (d.converted_invoice_urls) {
        for (let i = 0; i < d.converted_invoice_urls.length; i++) {
          checkNever(d.converted_invoice_urls[i], field + ".converted_invoice_urls" + "[" + i + "]");
        }
      }
    }
    checkString(d.created_at, field + ".created_at");
    if ("credit_notes_amount" in d) {
      checkString(d.credit_notes_amount, field + ".credit_notes_amount");
    }
    checkString(d.currency, field + ".currency");
    checkString(d.currency_amount, field + ".currency_amount");
    if ("currency_amount_before_tax" in d) {
      checkString(d.currency_amount_before_tax, field + ".currency_amount_before_tax");
    }
    if ("currency_price_before_tax" in d) {
      checkString(d.currency_price_before_tax, field + ".currency_price_before_tax");
    }
    if ("currency_tax" in d) {
      checkString(d.currency_tax, field + ".currency_tax");
    }
    if ("custom_payment_reference" in d) {
      checkString(d.custom_payment_reference, field + ".custom_payment_reference");
    }
    // This will be refactored in the next release.
    try {
      checkString(d.date, field + ".date", "string | null");
    } catch (e) {
      try {
        checkNull(d.date, field + ".date", "string | null");
      } catch (e) {
      }
    }
    if ("deadline" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.deadline, field + ".deadline", "string | null");
      } catch (e) {
        try {
          checkNull(d.deadline, field + ".deadline", "string | null");
        } catch (e) {
        }
      }
    }
    if ("direction" in d) {
      checkString(d.direction, field + ".direction");
    }
    if ("discount" in d) {
      checkString(d.discount, field + ".discount");
    }
    if ("discount_type" in d) {
      checkString(d.discount_type, field + ".discount_type");
    }
    checkBoolean(d.draft, field + ".draft");
    checkNull(d.email_from, field + ".email_from");
    if ("estimate_status" in d) {
      checkNull(d.estimate_status, field + ".estimate_status");
    }
    checkString(d.external_id, field + ".external_id");
    if ("factor_status" in d) {
      checkString(d.factor_status, field + ".factor_status");
    }
    checkString(d.fec_pieceref, field + ".fec_pieceref");
    if ("finalized_at" in d) {
      checkNull(d.finalized_at, field + ".finalized_at");
    }
    if ("from_estimate_id" in d) {
      checkNull(d.from_estimate_id, field + ".from_estimate_id");
    }
    if ("future_in_days" in d) {
      // This will be refactored in the next release.
      try {
        checkNumber(d.future_in_days, field + ".future_in_days", "number | null");
      } catch (e) {
        try {
          checkNull(d.future_in_days, field + ".future_in_days", "number | null");
        } catch (e) {
        }
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.gdrive_path, field + ".gdrive_path", "null | string");
    } catch (e) {
      try {
        checkString(d.gdrive_path, field + ".gdrive_path", "null | string");
      } catch (e) {
      }
    }
    if ("gross_amount" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.gross_amount, field + ".gross_amount", "string | null");
      } catch (e) {
        try {
          checkNull(d.gross_amount, field + ".gross_amount", "string | null");
        } catch (e) {
        }
      }
    }
    checkString(d.group_uuid, field + ".group_uuid");
    // This will be refactored in the next release.
    try {
      checkNull(d.grouped_at, field + ".grouped_at", "null | string");
    } catch (e) {
      try {
        checkString(d.grouped_at, field + ".grouped_at", "null | string");
      } catch (e) {
      }
    }
    checkArray(d.grouped_documents, field + ".grouped_documents");
    if (d.grouped_documents) {
      for (let i = 0; i < d.grouped_documents.length; i++) {
        d.grouped_documents[i] = GroupedDocumentsEntity.Create(d.grouped_documents[i], field + ".grouped_documents" + "[" + i + "]");
      }
    }
    if ("iban" in d) {
      checkString(d.iban, field + ".iban");
    }
    checkNumber(d.id, field + ".id");
    if ("invoice_kind" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.invoice_kind, field + ".invoice_kind", "null | string");
      } catch (e) {
        try {
          checkString(d.invoice_kind, field + ".invoice_kind", "null | string");
        } catch (e) {
        }
      }
    }
    if ("invoice_number" in d) {
      checkString(d.invoice_number, field + ".invoice_number");
    }
    if ("invoicing_detailed_source" in d) {
      checkNull(d.invoicing_detailed_source, field + ".invoicing_detailed_source");
    }
    if ("is_credit_note" in d) {
      checkBoolean(d.is_credit_note, field + ".is_credit_note");
    }
    if ("is_destroyable" in d) {
      checkBoolean(d.is_destroyable, field + ".is_destroyable");
    }
    if ("is_estimate" in d) {
      checkBoolean(d.is_estimate, field + ".is_estimate");
    }
    checkBoolean(d.is_waiting_details, field + ".is_waiting_details");
    if ("is_waiting_for_ocr" in d) {
      checkBoolean(d.is_waiting_for_ocr, field + ".is_waiting_for_ocr");
    }
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
    if ("language" in d) {
      checkString(d.language, field + ".language");
    }
    if ("manual_partial_invoices" in d) {
      checkBoolean(d.manual_partial_invoices, field + ".manual_partial_invoices");
    }
    checkString(d.method, field + ".method");
    if ("multiplier" in d) {
      checkNumber(d.multiplier, field + ".multiplier");
    }
    if ("not_duplicate" in d) {
      checkBoolean(d.not_duplicate, field + ".not_duplicate");
    }
    if ("ocr_thirdparty_id" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.ocr_thirdparty_id, field + ".ocr_thirdparty_id", "null | number");
      } catch (e) {
        try {
          checkNumber(d.ocr_thirdparty_id, field + ".ocr_thirdparty_id", "null | number");
        } catch (e) {
        }
      }
    }
    checkString(d.outstanding_balance, field + ".outstanding_balance");
    if ("paid" in d) {
      checkBoolean(d.paid, field + ".paid");
    }
    if ("payment_id" in d) {
      checkNull(d.payment_id, field + ".payment_id");
    }
    if ("payment_method" in d) {
      checkNull(d.payment_method, field + ".payment_method");
    }
    if ("payment_reference" in d) {
      checkString(d.payment_reference, field + ".payment_reference");
    }
    if ("payment_reminder_enabled" in d) {
      checkBoolean(d.payment_reminder_enabled, field + ".payment_reminder_enabled");
    }
    if ("payment_status" in d) {
      checkString(d.payment_status, field + ".payment_status");
    }
    checkString(d.pdf_generation_status, field + ".pdf_generation_status");
    if ("pdf_invoice_display_products_list" in d) {
      checkBoolean(d.pdf_invoice_display_products_list, field + ".pdf_invoice_display_products_list");
    }
    if ("pdf_invoice_free_text" in d) {
      checkString(d.pdf_invoice_free_text, field + ".pdf_invoice_free_text");
    }
    if ("pdf_invoice_free_text_enabled" in d) {
      checkBoolean(d.pdf_invoice_free_text_enabled, field + ".pdf_invoice_free_text_enabled");
    }
    if ("pdf_invoice_subject" in d) {
      checkString(d.pdf_invoice_subject, field + ".pdf_invoice_subject");
    }
    if ("pdf_invoice_subject_enabled" in d) {
      checkBoolean(d.pdf_invoice_subject_enabled, field + ".pdf_invoice_subject_enabled");
    }
    if ("pdf_invoice_title" in d) {
      checkString(d.pdf_invoice_title, field + ".pdf_invoice_title");
    }
    if ("pdf_paid_stamp" in d) {
      checkBoolean(d.pdf_paid_stamp, field + ".pdf_paid_stamp");
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.preview_status, field + ".preview_status", "null | string");
    } catch (e) {
      try {
        checkString(d.preview_status, field + ".preview_status", "null | string");
      } catch (e) {
      }
    }
    if ("price_before_tax" in d) {
      checkString(d.price_before_tax, field + ".price_before_tax");
    }
    checkString(d.pusher_channel, field + ".pusher_channel");
    if ("quote_group_uuid" in d) {
      checkString(d.quote_group_uuid, field + ".quote_group_uuid");
    }
    if ("quote_uid" in d) {
      checkNull(d.quote_uid, field + ".quote_uid");
    }
    checkBoolean(d.quotes, field + ".quotes");
    checkBoolean(d.readonly, field + ".readonly");
    if ("recipients" in d) {
      checkArray(d.recipients, field + ".recipients");
      if (d.recipients) {
        for (let i = 0; i < d.recipients.length; i++) {
          checkNever(d.recipients[i], field + ".recipients" + "[" + i + "]");
        }
      }
    }
    checkNull(d.reversal_origin_id, field + ".reversal_origin_id");
    checkNull(d.score, field + ".score");
    if ("scored_invoices" in d) {
      // This will be refactored in the next release.
      try {
        d.scored_invoices = ScoredInvoices.Create(d.scored_invoices, field + ".scored_invoices", "ScoredInvoices | null");
      } catch (e) {
        try {
          checkNull(d.scored_invoices, field + ".scored_invoices", "ScoredInvoices | null");
        } catch (e) {
        }
      }
    }
    if ("scored_transactions" in d) {
      checkArray(d.scored_transactions, field + ".scored_transactions");
      if (d.scored_transactions) {
        for (let i = 0; i < d.scored_transactions.length; i++) {
          checkNever(d.scored_transactions[i], field + ".scored_transactions" + "[" + i + "]");
        }
      }
    }
    checkString(d.source, field + ".source");
    if ("special_mention" in d) {
      checkNull(d.special_mention, field + ".special_mention");
    }
    if ("status" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.status, field + ".status", "string | null");
      } catch (e) {
        try {
          checkNull(d.status, field + ".status", "string | null");
        } catch (e) {
        }
      }
    }
    if ("tax" in d) {
      checkString(d.tax, field + ".tax");
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.thirdparty_id, field + ".thirdparty_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.thirdparty_id, field + ".thirdparty_id", "null | number");
      } catch (e) {
      }
    }
    checkString(d.type, field + ".type");
    checkString(d.updated_at, field + ".updated_at");
    checkString(d.url, field + ".url");
    if ("validation_needed" in d) {
      checkBoolean(d.validation_needed, field + ".validation_needed");
    }
    const knownProperties = ["account_id","accounting_type","amount","archived","archived_at","attachment_lost","attachment_required","billing_subscription_id","can_be_stamped_as_paid_in_pdf","company","company_id","complete","completeness","converted_invoice_urls","created_at","credit_notes_amount","currency","currency_amount","currency_amount_before_tax","currency_price_before_tax","currency_tax","custom_payment_reference","date","deadline","direction","discount","discount_type","draft","email_from","estimate_status","external_id","factor_status","fec_pieceref","finalized_at","from_estimate_id","future_in_days","gdrive_path","gross_amount","group_uuid","grouped_at","grouped_documents","iban","id","invoice_kind","invoice_number","invoicing_detailed_source","is_credit_note","is_destroyable","is_estimate","is_waiting_details","is_waiting_for_ocr","journal_id","label","language","manual_partial_invoices","method","multiplier","not_duplicate","ocr_thirdparty_id","outstanding_balance","paid","payment_id","payment_method","payment_reference","payment_reminder_enabled","payment_status","pdf_generation_status","pdf_invoice_display_products_list","pdf_invoice_free_text","pdf_invoice_free_text_enabled","pdf_invoice_subject","pdf_invoice_subject_enabled","pdf_invoice_title","pdf_paid_stamp","preview_status","price_before_tax","pusher_channel","quote_group_uuid","quote_uid","quotes","readonly","recipients","reversal_origin_id","score","scored_invoices","scored_transactions","source","special_mention","status","tax","thirdparty_id","type","updated_at","url","validation_needed"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDocument(d);
  }
  private constructor(d: any) {
    if ("account_id" in d) this.account_id = d.account_id;
    this.accounting_type = d.accounting_type;
    this.amount = d.amount;
    this.archived = d.archived;
    this.archived_at = d.archived_at;
    this.attachment_lost = d.attachment_lost;
    this.attachment_required = d.attachment_required;
    this.billing_subscription_id = d.billing_subscription_id;
    if ("can_be_stamped_as_paid_in_pdf" in d) this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;
    if ("company" in d) this.company = d.company;
    this.company_id = d.company_id;
    if ("complete" in d) this.complete = d.complete;
    if ("completeness" in d) this.completeness = d.completeness;
    if ("converted_invoice_urls" in d) this.converted_invoice_urls = d.converted_invoice_urls;
    this.created_at = d.created_at;
    if ("credit_notes_amount" in d) this.credit_notes_amount = d.credit_notes_amount;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    if ("currency_amount_before_tax" in d) this.currency_amount_before_tax = d.currency_amount_before_tax;
    if ("currency_price_before_tax" in d) this.currency_price_before_tax = d.currency_price_before_tax;
    if ("currency_tax" in d) this.currency_tax = d.currency_tax;
    if ("custom_payment_reference" in d) this.custom_payment_reference = d.custom_payment_reference;
    this.date = d.date;
    if ("deadline" in d) this.deadline = d.deadline;
    if ("direction" in d) this.direction = d.direction;
    if ("discount" in d) this.discount = d.discount;
    if ("discount_type" in d) this.discount_type = d.discount_type;
    this.draft = d.draft;
    this.email_from = d.email_from;
    if ("estimate_status" in d) this.estimate_status = d.estimate_status;
    this.external_id = d.external_id;
    if ("factor_status" in d) this.factor_status = d.factor_status;
    this.fec_pieceref = d.fec_pieceref;
    if ("finalized_at" in d) this.finalized_at = d.finalized_at;
    if ("from_estimate_id" in d) this.from_estimate_id = d.from_estimate_id;
    if ("future_in_days" in d) this.future_in_days = d.future_in_days;
    this.gdrive_path = d.gdrive_path;
    if ("gross_amount" in d) this.gross_amount = d.gross_amount;
    this.group_uuid = d.group_uuid;
    this.grouped_at = d.grouped_at;
    this.grouped_documents = d.grouped_documents;
    if ("iban" in d) this.iban = d.iban;
    this.id = d.id;
    if ("invoice_kind" in d) this.invoice_kind = d.invoice_kind;
    if ("invoice_number" in d) this.invoice_number = d.invoice_number;
    if ("invoicing_detailed_source" in d) this.invoicing_detailed_source = d.invoicing_detailed_source;
    if ("is_credit_note" in d) this.is_credit_note = d.is_credit_note;
    if ("is_destroyable" in d) this.is_destroyable = d.is_destroyable;
    if ("is_estimate" in d) this.is_estimate = d.is_estimate;
    this.is_waiting_details = d.is_waiting_details;
    if ("is_waiting_for_ocr" in d) this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    this.journal_id = d.journal_id;
    this.label = d.label;
    if ("language" in d) this.language = d.language;
    if ("manual_partial_invoices" in d) this.manual_partial_invoices = d.manual_partial_invoices;
    this.method = d.method;
    if ("multiplier" in d) this.multiplier = d.multiplier;
    if ("not_duplicate" in d) this.not_duplicate = d.not_duplicate;
    if ("ocr_thirdparty_id" in d) this.ocr_thirdparty_id = d.ocr_thirdparty_id;
    this.outstanding_balance = d.outstanding_balance;
    if ("paid" in d) this.paid = d.paid;
    if ("payment_id" in d) this.payment_id = d.payment_id;
    if ("payment_method" in d) this.payment_method = d.payment_method;
    if ("payment_reference" in d) this.payment_reference = d.payment_reference;
    if ("payment_reminder_enabled" in d) this.payment_reminder_enabled = d.payment_reminder_enabled;
    if ("payment_status" in d) this.payment_status = d.payment_status;
    this.pdf_generation_status = d.pdf_generation_status;
    if ("pdf_invoice_display_products_list" in d) this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;
    if ("pdf_invoice_free_text" in d) this.pdf_invoice_free_text = d.pdf_invoice_free_text;
    if ("pdf_invoice_free_text_enabled" in d) this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;
    if ("pdf_invoice_subject" in d) this.pdf_invoice_subject = d.pdf_invoice_subject;
    if ("pdf_invoice_subject_enabled" in d) this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;
    if ("pdf_invoice_title" in d) this.pdf_invoice_title = d.pdf_invoice_title;
    if ("pdf_paid_stamp" in d) this.pdf_paid_stamp = d.pdf_paid_stamp;
    this.preview_status = d.preview_status;
    if ("price_before_tax" in d) this.price_before_tax = d.price_before_tax;
    this.pusher_channel = d.pusher_channel;
    if ("quote_group_uuid" in d) this.quote_group_uuid = d.quote_group_uuid;
    if ("quote_uid" in d) this.quote_uid = d.quote_uid;
    this.quotes = d.quotes;
    this.readonly = d.readonly;
    if ("recipients" in d) this.recipients = d.recipients;
    this.reversal_origin_id = d.reversal_origin_id;
    this.score = d.score;
    if ("scored_invoices" in d) this.scored_invoices = d.scored_invoices;
    if ("scored_transactions" in d) this.scored_transactions = d.scored_transactions;
    this.source = d.source;
    if ("special_mention" in d) this.special_mention = d.special_mention;
    if ("status" in d) this.status = d.status;
    if ("tax" in d) this.tax = d.tax;
    this.thirdparty_id = d.thirdparty_id;
    this.type = d.type;
    this.updated_at = d.updated_at;
    this.url = d.url;
    if ("validation_needed" in d) this.validation_needed = d.validation_needed;
  }
}

export class Company {
  public readonly name: string;
  public static Parse(d: string): Company {
    return Company.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Company {
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
    checkString(d.name, field + ".name");
    const knownProperties = ["name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Company(d);
  }
  private constructor(d: any) {
    this.name = d.name;
  }
}

export class GroupedDocumentsEntity {
  public readonly account?: null | Account;
  public readonly account_id?: null | number;
  public readonly accounting_status?: null | string;
  public readonly accounting_type: boolean;
  public readonly amount: string;
  public readonly archived: boolean;
  public readonly archived_at: null | string;
  public readonly attachment_label?: string | null;
  public readonly attachment_lost: boolean;
  public readonly attachment_required: boolean;
  public readonly billing_subscription_id: null;
  public readonly can_be_stamped_as_paid_in_pdf?: boolean | null;
  public readonly client_comments: ClientCommentsEntityOrEstablishmentComment[];
  public readonly company?: null | Company1;
  public readonly company_id: number;
  public readonly complete: boolean;
  public readonly completeness: number;
  public readonly converted_invoice_urls?: never[];
  public readonly created_at: string;
  public readonly credit_notes_amount?: string | null;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly currency_amount_before_tax?: string | null;
  public readonly currency_price_before_tax?: string | null;
  public readonly currency_tax?: string | null;
  public readonly current_account_plan_item?: null | PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem;
  public readonly custom_payment_reference?: string | null;
  public readonly date: null | string;
  public readonly deadline?: null | string;
  public readonly direction?: string | null;
  public readonly discount?: string | null;
  public readonly discount_type?: string | null;
  public readonly draft: boolean;
  public readonly email_from: null;
  public readonly embeddable_in_browser?: boolean | null;
  public readonly establishment_comment?: null | EstablishmentCommentOrClientCommentsEntity;
  public readonly estimate_status?: null;
  public readonly external_id: string;
  public readonly factor_status?: string | null;
  public readonly fec_pieceref: string;
  public readonly file_signed_id?: string | null;
  public readonly filename: null | string;
  public readonly finalized_at?: null;
  public readonly from_estimate_id?: null;
  public readonly future_in_days?: number | null;
  public readonly gdrive_path: string | null;
  public readonly gross_amount?: null | string;
  public readonly group_uuid: string;
  public readonly grouped_at: null | string;
  public readonly has_file: boolean;
  public readonly has_linked_quotes?: boolean | null;
  public readonly hasTooManyLedgerEvents: boolean;
  public readonly iban?: string | null;
  public readonly id: number;
  public readonly incomplete?: boolean | null;
  public readonly invoice_kind?: string | null;
  public readonly invoice_lines?: InvoiceLinesEntity[] | null;
  public readonly invoice_number?: string | null;
  public readonly invoicing_detailed_source?: null;
  public readonly is_accounting_needed?: null;
  public readonly is_credit_note?: boolean | null;
  public readonly is_destroyable?: boolean | null;
  public readonly is_estimate?: boolean | null;
  public readonly is_sendable?: boolean | null;
  public readonly is_waiting_details: boolean;
  public readonly is_waiting_for_ocr?: boolean | null;
  public readonly journal: Journal;
  public readonly journal_id: number;
  public readonly label: string | null;
  public readonly language?: string | null;
  public readonly ledgerEvents: LedgerEventsEntity[];
  public readonly ledgerEventsCount: number;
  public readonly manual_partial_invoices?: boolean | null;
  public readonly method: string;
  public readonly multiplier?: number | null;
  public readonly not_duplicate?: boolean | null;
  public readonly ocr_thirdparty_id?: null | number;
  public readonly outstanding_balance: string;
  public readonly pages_count?: number | null;
  public readonly paid?: boolean | null;
  public readonly payment_id?: null;
  public readonly payment_method?: null;
  public readonly payment_reference?: string | null;
  public readonly payment_reminder_enabled?: boolean | null;
  public readonly payment_status?: string | null;
  public readonly pdf_generation_status: string;
  public readonly pdf_invoice_display_products_list?: boolean | null;
  public readonly pdf_invoice_free_text?: string | null;
  public readonly pdf_invoice_free_text_enabled?: boolean | null;
  public readonly pdf_invoice_subject?: string | null;
  public readonly pdf_invoice_subject_enabled?: boolean | null;
  public readonly pdf_invoice_title?: string | null;
  public readonly pdf_paid_stamp?: boolean | null;
  public readonly pending: boolean;
  public readonly preview_status: null | string;
  public readonly preview_urls: string[];
  public readonly price_before_tax?: string | null;
  public readonly pusher_channel: string;
  public readonly quote_group_uuid?: string | null;
  public readonly quote_uid?: null;
  public readonly quotes: boolean;
  public readonly readonly: boolean;
  public readonly recipients?: never[] | null;
  public readonly reconciled: boolean;
  public readonly reversal_origin_id: null;
  public readonly score: null;
  public readonly scored_invoices?: null | ScoredInvoices1;
  public readonly scored_transactions?: never[] | null;
  public readonly size?: string | null;
  public readonly source: string;
  public readonly special_mention?: null;
  public readonly status?: null | string;
  public readonly subcomplete?: boolean | null;
  public readonly tagged_at_ledger_events_level?: boolean | null;
  public readonly tax?: string | null;
  public readonly thirdparty?: Thirdparty | null;
  public readonly thirdparty_id: null | number;
  public readonly type: string;
  public readonly updated_at: string;
  public readonly url: string;
  public readonly validation_needed?: boolean | null;
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
    if ("account" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.account, field + ".account", "null | Account");
      } catch (e) {
        try {
          d.account = Account.Create(d.account, field + ".account", "null | Account");
        } catch (e) {
        }
      }
    }
    if ("account_id" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.account_id, field + ".account_id", "null | number");
      } catch (e) {
        try {
          checkNumber(d.account_id, field + ".account_id", "null | number");
        } catch (e) {
        }
      }
    }
    if ("accounting_status" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.accounting_status, field + ".accounting_status", "null | string");
      } catch (e) {
        try {
          checkString(d.accounting_status, field + ".accounting_status", "null | string");
        } catch (e) {
        }
      }
    }
    checkBoolean(d.accounting_type, field + ".accounting_type");
    checkString(d.amount, field + ".amount");
    checkBoolean(d.archived, field + ".archived");
    // This will be refactored in the next release.
    try {
      checkNull(d.archived_at, field + ".archived_at", "null | string");
    } catch (e) {
      try {
        checkString(d.archived_at, field + ".archived_at", "null | string");
      } catch (e) {
      }
    }
    if ("attachment_label" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.attachment_label, field + ".attachment_label", "string | null");
      } catch (e) {
        try {
          checkNull(d.attachment_label, field + ".attachment_label", "string | null");
        } catch (e) {
        }
      }
    }
    checkBoolean(d.attachment_lost, field + ".attachment_lost");
    checkBoolean(d.attachment_required, field + ".attachment_required");
    checkNull(d.billing_subscription_id, field + ".billing_subscription_id");
    if ("can_be_stamped_as_paid_in_pdf" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.can_be_stamped_as_paid_in_pdf, field + ".can_be_stamped_as_paid_in_pdf", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.can_be_stamped_as_paid_in_pdf, field + ".can_be_stamped_as_paid_in_pdf", "boolean | null");
        } catch (e) {
        }
      }
    }
    checkArray(d.client_comments, field + ".client_comments");
    if (d.client_comments) {
      for (let i = 0; i < d.client_comments.length; i++) {
        d.client_comments[i] = ClientCommentsEntityOrEstablishmentComment.Create(d.client_comments[i], field + ".client_comments" + "[" + i + "]");
      }
    }
    if ("company" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.company, field + ".company", "null | Company1");
      } catch (e) {
        try {
          d.company = Company1.Create(d.company, field + ".company", "null | Company1");
        } catch (e) {
        }
      }
    }
    checkNumber(d.company_id, field + ".company_id");
    checkBoolean(d.complete, field + ".complete");
    checkNumber(d.completeness, field + ".completeness");
    if ("converted_invoice_urls" in d) {
      checkArray(d.converted_invoice_urls, field + ".converted_invoice_urls");
      if (d.converted_invoice_urls) {
        for (let i = 0; i < d.converted_invoice_urls.length; i++) {
          checkNever(d.converted_invoice_urls[i], field + ".converted_invoice_urls" + "[" + i + "]");
        }
      }
    }
    checkString(d.created_at, field + ".created_at");
    if ("credit_notes_amount" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.credit_notes_amount, field + ".credit_notes_amount", "string | null");
      } catch (e) {
        try {
          checkNull(d.credit_notes_amount, field + ".credit_notes_amount", "string | null");
        } catch (e) {
        }
      }
    }
    checkString(d.currency, field + ".currency");
    checkString(d.currency_amount, field + ".currency_amount");
    if ("currency_amount_before_tax" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.currency_amount_before_tax, field + ".currency_amount_before_tax", "string | null");
      } catch (e) {
        try {
          checkNull(d.currency_amount_before_tax, field + ".currency_amount_before_tax", "string | null");
        } catch (e) {
        }
      }
    }
    if ("currency_price_before_tax" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.currency_price_before_tax, field + ".currency_price_before_tax", "string | null");
      } catch (e) {
        try {
          checkNull(d.currency_price_before_tax, field + ".currency_price_before_tax", "string | null");
        } catch (e) {
        }
      }
    }
    if ("currency_tax" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.currency_tax, field + ".currency_tax", "string | null");
      } catch (e) {
        try {
          checkNull(d.currency_tax, field + ".currency_tax", "string | null");
        } catch (e) {
        }
      }
    }
    if ("current_account_plan_item" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.current_account_plan_item, field + ".current_account_plan_item", "null | PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem");
      } catch (e) {
        try {
          d.current_account_plan_item = PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem.Create(d.current_account_plan_item, field + ".current_account_plan_item", "null | PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem");
        } catch (e) {
        }
      }
    }
    if ("custom_payment_reference" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.custom_payment_reference, field + ".custom_payment_reference", "string | null");
      } catch (e) {
        try {
          checkNull(d.custom_payment_reference, field + ".custom_payment_reference", "string | null");
        } catch (e) {
        }
      }
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
    if ("deadline" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.deadline, field + ".deadline", "null | string");
      } catch (e) {
        try {
          checkString(d.deadline, field + ".deadline", "null | string");
        } catch (e) {
        }
      }
    }
    if ("direction" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.direction, field + ".direction", "string | null");
      } catch (e) {
        try {
          checkNull(d.direction, field + ".direction", "string | null");
        } catch (e) {
        }
      }
    }
    if ("discount" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.discount, field + ".discount", "string | null");
      } catch (e) {
        try {
          checkNull(d.discount, field + ".discount", "string | null");
        } catch (e) {
        }
      }
    }
    if ("discount_type" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.discount_type, field + ".discount_type", "string | null");
      } catch (e) {
        try {
          checkNull(d.discount_type, field + ".discount_type", "string | null");
        } catch (e) {
        }
      }
    }
    checkBoolean(d.draft, field + ".draft");
    checkNull(d.email_from, field + ".email_from");
    if ("embeddable_in_browser" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.embeddable_in_browser, field + ".embeddable_in_browser", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.embeddable_in_browser, field + ".embeddable_in_browser", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("establishment_comment" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.establishment_comment, field + ".establishment_comment", "null | EstablishmentCommentOrClientCommentsEntity");
      } catch (e) {
        try {
          d.establishment_comment = EstablishmentCommentOrClientCommentsEntity.Create(d.establishment_comment, field + ".establishment_comment", "null | EstablishmentCommentOrClientCommentsEntity");
        } catch (e) {
        }
      }
    }
    if ("estimate_status" in d) {
      checkNull(d.estimate_status, field + ".estimate_status");
    }
    checkString(d.external_id, field + ".external_id");
    if ("factor_status" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.factor_status, field + ".factor_status", "string | null");
      } catch (e) {
        try {
          checkNull(d.factor_status, field + ".factor_status", "string | null");
        } catch (e) {
        }
      }
    }
    checkString(d.fec_pieceref, field + ".fec_pieceref");
    if ("file_signed_id" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.file_signed_id, field + ".file_signed_id", "string | null");
      } catch (e) {
        try {
          checkNull(d.file_signed_id, field + ".file_signed_id", "string | null");
        } catch (e) {
        }
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.filename, field + ".filename", "null | string");
    } catch (e) {
      try {
        checkString(d.filename, field + ".filename", "null | string");
      } catch (e) {
      }
    }
    if ("finalized_at" in d) {
      checkNull(d.finalized_at, field + ".finalized_at");
    }
    if ("from_estimate_id" in d) {
      checkNull(d.from_estimate_id, field + ".from_estimate_id");
    }
    if ("future_in_days" in d) {
      // This will be refactored in the next release.
      try {
        checkNumber(d.future_in_days, field + ".future_in_days", "number | null");
      } catch (e) {
        try {
          checkNull(d.future_in_days, field + ".future_in_days", "number | null");
        } catch (e) {
        }
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
    if ("gross_amount" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.gross_amount, field + ".gross_amount", "null | string");
      } catch (e) {
        try {
          checkString(d.gross_amount, field + ".gross_amount", "null | string");
        } catch (e) {
        }
      }
    }
    checkString(d.group_uuid, field + ".group_uuid");
    // This will be refactored in the next release.
    try {
      checkNull(d.grouped_at, field + ".grouped_at", "null | string");
    } catch (e) {
      try {
        checkString(d.grouped_at, field + ".grouped_at", "null | string");
      } catch (e) {
      }
    }
    checkBoolean(d.has_file, field + ".has_file");
    if ("has_linked_quotes" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.has_linked_quotes, field + ".has_linked_quotes", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.has_linked_quotes, field + ".has_linked_quotes", "boolean | null");
        } catch (e) {
        }
      }
    }
    checkBoolean(d.hasTooManyLedgerEvents, field + ".hasTooManyLedgerEvents");
    if ("iban" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.iban, field + ".iban", "string | null");
      } catch (e) {
        try {
          checkNull(d.iban, field + ".iban", "string | null");
        } catch (e) {
        }
      }
    }
    checkNumber(d.id, field + ".id");
    if ("incomplete" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.incomplete, field + ".incomplete", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.incomplete, field + ".incomplete", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("invoice_kind" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.invoice_kind, field + ".invoice_kind", "string | null");
      } catch (e) {
        try {
          checkNull(d.invoice_kind, field + ".invoice_kind", "string | null");
        } catch (e) {
        }
      }
    }
    if ("invoice_lines" in d) {
      // This will be refactored in the next release.
      try {
        checkArray(d.invoice_lines, field + ".invoice_lines", "InvoiceLinesEntity[] | null");
        if (d.invoice_lines) {
          for (let i = 0; i < d.invoice_lines.length; i++) {
            d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + ".invoice_lines" + "[" + i + "]");
          }
        }
      } catch (e) {
        try {
          checkNull(d.invoice_lines, field + ".invoice_lines", "InvoiceLinesEntity[] | null");
        } catch (e) {
        }
      }
    }
    if ("invoice_number" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.invoice_number, field + ".invoice_number", "string | null");
      } catch (e) {
        try {
          checkNull(d.invoice_number, field + ".invoice_number", "string | null");
        } catch (e) {
        }
      }
    }
    if ("invoicing_detailed_source" in d) {
      checkNull(d.invoicing_detailed_source, field + ".invoicing_detailed_source");
    }
    if ("is_accounting_needed" in d) {
      checkNull(d.is_accounting_needed, field + ".is_accounting_needed");
    }
    if ("is_credit_note" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.is_credit_note, field + ".is_credit_note", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.is_credit_note, field + ".is_credit_note", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("is_destroyable" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.is_destroyable, field + ".is_destroyable", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.is_destroyable, field + ".is_destroyable", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("is_estimate" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.is_estimate, field + ".is_estimate", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.is_estimate, field + ".is_estimate", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("is_sendable" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.is_sendable, field + ".is_sendable", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.is_sendable, field + ".is_sendable", "boolean | null");
        } catch (e) {
        }
      }
    }
    checkBoolean(d.is_waiting_details, field + ".is_waiting_details");
    if ("is_waiting_for_ocr" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.is_waiting_for_ocr, field + ".is_waiting_for_ocr", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.is_waiting_for_ocr, field + ".is_waiting_for_ocr", "boolean | null");
        } catch (e) {
        }
      }
    }
    d.journal = Journal.Create(d.journal, field + ".journal");
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
    if ("language" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.language, field + ".language", "string | null");
      } catch (e) {
        try {
          checkNull(d.language, field + ".language", "string | null");
        } catch (e) {
        }
      }
    }
    checkArray(d.ledgerEvents, field + ".ledgerEvents");
    if (d.ledgerEvents) {
      for (let i = 0; i < d.ledgerEvents.length; i++) {
        d.ledgerEvents[i] = LedgerEventsEntity.Create(d.ledgerEvents[i], field + ".ledgerEvents" + "[" + i + "]");
      }
    }
    checkNumber(d.ledgerEventsCount, field + ".ledgerEventsCount");
    if ("manual_partial_invoices" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.manual_partial_invoices, field + ".manual_partial_invoices", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.manual_partial_invoices, field + ".manual_partial_invoices", "boolean | null");
        } catch (e) {
        }
      }
    }
    checkString(d.method, field + ".method");
    if ("multiplier" in d) {
      // This will be refactored in the next release.
      try {
        checkNumber(d.multiplier, field + ".multiplier", "number | null");
      } catch (e) {
        try {
          checkNull(d.multiplier, field + ".multiplier", "number | null");
        } catch (e) {
        }
      }
    }
    if ("not_duplicate" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.not_duplicate, field + ".not_duplicate", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.not_duplicate, field + ".not_duplicate", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("ocr_thirdparty_id" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.ocr_thirdparty_id, field + ".ocr_thirdparty_id", "null | number");
      } catch (e) {
        try {
          checkNumber(d.ocr_thirdparty_id, field + ".ocr_thirdparty_id", "null | number");
        } catch (e) {
        }
      }
    }
    checkString(d.outstanding_balance, field + ".outstanding_balance");
    if ("pages_count" in d) {
      // This will be refactored in the next release.
      try {
        checkNumber(d.pages_count, field + ".pages_count", "number | null");
      } catch (e) {
        try {
          checkNull(d.pages_count, field + ".pages_count", "number | null");
        } catch (e) {
        }
      }
    }
    if ("paid" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.paid, field + ".paid", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.paid, field + ".paid", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("payment_id" in d) {
      checkNull(d.payment_id, field + ".payment_id");
    }
    if ("payment_method" in d) {
      checkNull(d.payment_method, field + ".payment_method");
    }
    if ("payment_reference" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.payment_reference, field + ".payment_reference", "string | null");
      } catch (e) {
        try {
          checkNull(d.payment_reference, field + ".payment_reference", "string | null");
        } catch (e) {
        }
      }
    }
    if ("payment_reminder_enabled" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.payment_reminder_enabled, field + ".payment_reminder_enabled", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.payment_reminder_enabled, field + ".payment_reminder_enabled", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("payment_status" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.payment_status, field + ".payment_status", "string | null");
      } catch (e) {
        try {
          checkNull(d.payment_status, field + ".payment_status", "string | null");
        } catch (e) {
        }
      }
    }
    checkString(d.pdf_generation_status, field + ".pdf_generation_status");
    if ("pdf_invoice_display_products_list" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.pdf_invoice_display_products_list, field + ".pdf_invoice_display_products_list", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.pdf_invoice_display_products_list, field + ".pdf_invoice_display_products_list", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("pdf_invoice_free_text" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.pdf_invoice_free_text, field + ".pdf_invoice_free_text", "string | null");
      } catch (e) {
        try {
          checkNull(d.pdf_invoice_free_text, field + ".pdf_invoice_free_text", "string | null");
        } catch (e) {
        }
      }
    }
    if ("pdf_invoice_free_text_enabled" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.pdf_invoice_free_text_enabled, field + ".pdf_invoice_free_text_enabled", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.pdf_invoice_free_text_enabled, field + ".pdf_invoice_free_text_enabled", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("pdf_invoice_subject" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.pdf_invoice_subject, field + ".pdf_invoice_subject", "string | null");
      } catch (e) {
        try {
          checkNull(d.pdf_invoice_subject, field + ".pdf_invoice_subject", "string | null");
        } catch (e) {
        }
      }
    }
    if ("pdf_invoice_subject_enabled" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.pdf_invoice_subject_enabled, field + ".pdf_invoice_subject_enabled", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.pdf_invoice_subject_enabled, field + ".pdf_invoice_subject_enabled", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("pdf_invoice_title" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.pdf_invoice_title, field + ".pdf_invoice_title", "string | null");
      } catch (e) {
        try {
          checkNull(d.pdf_invoice_title, field + ".pdf_invoice_title", "string | null");
        } catch (e) {
        }
      }
    }
    if ("pdf_paid_stamp" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.pdf_paid_stamp, field + ".pdf_paid_stamp", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.pdf_paid_stamp, field + ".pdf_paid_stamp", "boolean | null");
        } catch (e) {
        }
      }
    }
    checkBoolean(d.pending, field + ".pending");
    // This will be refactored in the next release.
    try {
      checkNull(d.preview_status, field + ".preview_status", "null | string");
    } catch (e) {
      try {
        checkString(d.preview_status, field + ".preview_status", "null | string");
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
      // This will be refactored in the next release.
      try {
        checkString(d.price_before_tax, field + ".price_before_tax", "string | null");
      } catch (e) {
        try {
          checkNull(d.price_before_tax, field + ".price_before_tax", "string | null");
        } catch (e) {
        }
      }
    }
    checkString(d.pusher_channel, field + ".pusher_channel");
    if ("quote_group_uuid" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.quote_group_uuid, field + ".quote_group_uuid", "string | null");
      } catch (e) {
        try {
          checkNull(d.quote_group_uuid, field + ".quote_group_uuid", "string | null");
        } catch (e) {
        }
      }
    }
    if ("quote_uid" in d) {
      checkNull(d.quote_uid, field + ".quote_uid");
    }
    checkBoolean(d.quotes, field + ".quotes");
    checkBoolean(d.readonly, field + ".readonly");
    if ("recipients" in d) {
      // This will be refactored in the next release.
      try {
        checkArray(d.recipients, field + ".recipients", "never[] | null");
        if (d.recipients) {
          for (let i = 0; i < d.recipients.length; i++) {
            checkNever(d.recipients[i], field + ".recipients" + "[" + i + "]");
          }
        }
      } catch (e) {
        try {
          checkNull(d.recipients, field + ".recipients", "never[] | null");
        } catch (e) {
        }
      }
    }
    checkBoolean(d.reconciled, field + ".reconciled");
    checkNull(d.reversal_origin_id, field + ".reversal_origin_id");
    checkNull(d.score, field + ".score");
    if ("scored_invoices" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.scored_invoices, field + ".scored_invoices", "null | ScoredInvoices1");
      } catch (e) {
        try {
          d.scored_invoices = ScoredInvoices1.Create(d.scored_invoices, field + ".scored_invoices", "null | ScoredInvoices1");
        } catch (e) {
        }
      }
    }
    if ("scored_transactions" in d) {
      // This will be refactored in the next release.
      try {
        checkArray(d.scored_transactions, field + ".scored_transactions", "never[] | null");
        if (d.scored_transactions) {
          for (let i = 0; i < d.scored_transactions.length; i++) {
            checkNever(d.scored_transactions[i], field + ".scored_transactions" + "[" + i + "]");
          }
        }
      } catch (e) {
        try {
          checkNull(d.scored_transactions, field + ".scored_transactions", "never[] | null");
        } catch (e) {
        }
      }
    }
    if ("size" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.size, field + ".size", "string | null");
      } catch (e) {
        try {
          checkNull(d.size, field + ".size", "string | null");
        } catch (e) {
        }
      }
    }
    checkString(d.source, field + ".source");
    if ("special_mention" in d) {
      checkNull(d.special_mention, field + ".special_mention");
    }
    if ("status" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.status, field + ".status", "null | string");
      } catch (e) {
        try {
          checkString(d.status, field + ".status", "null | string");
        } catch (e) {
        }
      }
    }
    if ("subcomplete" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.subcomplete, field + ".subcomplete", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.subcomplete, field + ".subcomplete", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("tagged_at_ledger_events_level" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.tagged_at_ledger_events_level, field + ".tagged_at_ledger_events_level", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.tagged_at_ledger_events_level, field + ".tagged_at_ledger_events_level", "boolean | null");
        } catch (e) {
        }
      }
    }
    if ("tax" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.tax, field + ".tax", "string | null");
      } catch (e) {
        try {
          checkNull(d.tax, field + ".tax", "string | null");
        } catch (e) {
        }
      }
    }
    if ("thirdparty" in d) {
      // This will be refactored in the next release.
      try {
        d.thirdparty = Thirdparty.Create(d.thirdparty, field + ".thirdparty", "Thirdparty | null");
      } catch (e) {
        try {
          checkNull(d.thirdparty, field + ".thirdparty", "Thirdparty | null");
        } catch (e) {
        }
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.thirdparty_id, field + ".thirdparty_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.thirdparty_id, field + ".thirdparty_id", "null | number");
      } catch (e) {
      }
    }
    checkString(d.type, field + ".type");
    checkString(d.updated_at, field + ".updated_at");
    checkString(d.url, field + ".url");
    if ("validation_needed" in d) {
      // This will be refactored in the next release.
      try {
        checkBoolean(d.validation_needed, field + ".validation_needed", "boolean | null");
      } catch (e) {
        try {
          checkNull(d.validation_needed, field + ".validation_needed", "boolean | null");
        } catch (e) {
        }
      }
    }
    const knownProperties = ["account","account_id","accounting_status","accounting_type","amount","archived","archived_at","attachment_label","attachment_lost","attachment_required","billing_subscription_id","can_be_stamped_as_paid_in_pdf","client_comments","company","company_id","complete","completeness","converted_invoice_urls","created_at","credit_notes_amount","currency","currency_amount","currency_amount_before_tax","currency_price_before_tax","currency_tax","current_account_plan_item","custom_payment_reference","date","deadline","direction","discount","discount_type","draft","email_from","embeddable_in_browser","establishment_comment","estimate_status","external_id","factor_status","fec_pieceref","file_signed_id","filename","finalized_at","from_estimate_id","future_in_days","gdrive_path","gross_amount","group_uuid","grouped_at","has_file","has_linked_quotes","hasTooManyLedgerEvents","iban","id","incomplete","invoice_kind","invoice_lines","invoice_number","invoicing_detailed_source","is_accounting_needed","is_credit_note","is_destroyable","is_estimate","is_sendable","is_waiting_details","is_waiting_for_ocr","journal","journal_id","label","language","ledgerEvents","ledgerEventsCount","manual_partial_invoices","method","multiplier","not_duplicate","ocr_thirdparty_id","outstanding_balance","pages_count","paid","payment_id","payment_method","payment_reference","payment_reminder_enabled","payment_status","pdf_generation_status","pdf_invoice_display_products_list","pdf_invoice_free_text","pdf_invoice_free_text_enabled","pdf_invoice_subject","pdf_invoice_subject_enabled","pdf_invoice_title","pdf_paid_stamp","pending","preview_status","preview_urls","price_before_tax","pusher_channel","quote_group_uuid","quote_uid","quotes","readonly","recipients","reconciled","reversal_origin_id","score","scored_invoices","scored_transactions","size","source","special_mention","status","subcomplete","tagged_at_ledger_events_level","tax","thirdparty","thirdparty_id","type","updated_at","url","validation_needed"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new GroupedDocumentsEntity(d);
  }
  private constructor(d: any) {
    if ("account" in d) this.account = d.account;
    if ("account_id" in d) this.account_id = d.account_id;
    if ("accounting_status" in d) this.accounting_status = d.accounting_status;
    this.accounting_type = d.accounting_type;
    this.amount = d.amount;
    this.archived = d.archived;
    this.archived_at = d.archived_at;
    if ("attachment_label" in d) this.attachment_label = d.attachment_label;
    this.attachment_lost = d.attachment_lost;
    this.attachment_required = d.attachment_required;
    this.billing_subscription_id = d.billing_subscription_id;
    if ("can_be_stamped_as_paid_in_pdf" in d) this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;
    this.client_comments = d.client_comments;
    if ("company" in d) this.company = d.company;
    this.company_id = d.company_id;
    this.complete = d.complete;
    this.completeness = d.completeness;
    if ("converted_invoice_urls" in d) this.converted_invoice_urls = d.converted_invoice_urls;
    this.created_at = d.created_at;
    if ("credit_notes_amount" in d) this.credit_notes_amount = d.credit_notes_amount;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    if ("currency_amount_before_tax" in d) this.currency_amount_before_tax = d.currency_amount_before_tax;
    if ("currency_price_before_tax" in d) this.currency_price_before_tax = d.currency_price_before_tax;
    if ("currency_tax" in d) this.currency_tax = d.currency_tax;
    if ("current_account_plan_item" in d) this.current_account_plan_item = d.current_account_plan_item;
    if ("custom_payment_reference" in d) this.custom_payment_reference = d.custom_payment_reference;
    this.date = d.date;
    if ("deadline" in d) this.deadline = d.deadline;
    if ("direction" in d) this.direction = d.direction;
    if ("discount" in d) this.discount = d.discount;
    if ("discount_type" in d) this.discount_type = d.discount_type;
    this.draft = d.draft;
    this.email_from = d.email_from;
    if ("embeddable_in_browser" in d) this.embeddable_in_browser = d.embeddable_in_browser;
    if ("establishment_comment" in d) this.establishment_comment = d.establishment_comment;
    if ("estimate_status" in d) this.estimate_status = d.estimate_status;
    this.external_id = d.external_id;
    if ("factor_status" in d) this.factor_status = d.factor_status;
    this.fec_pieceref = d.fec_pieceref;
    if ("file_signed_id" in d) this.file_signed_id = d.file_signed_id;
    this.filename = d.filename;
    if ("finalized_at" in d) this.finalized_at = d.finalized_at;
    if ("from_estimate_id" in d) this.from_estimate_id = d.from_estimate_id;
    if ("future_in_days" in d) this.future_in_days = d.future_in_days;
    this.gdrive_path = d.gdrive_path;
    if ("gross_amount" in d) this.gross_amount = d.gross_amount;
    this.group_uuid = d.group_uuid;
    this.grouped_at = d.grouped_at;
    this.has_file = d.has_file;
    if ("has_linked_quotes" in d) this.has_linked_quotes = d.has_linked_quotes;
    this.hasTooManyLedgerEvents = d.hasTooManyLedgerEvents;
    if ("iban" in d) this.iban = d.iban;
    this.id = d.id;
    if ("incomplete" in d) this.incomplete = d.incomplete;
    if ("invoice_kind" in d) this.invoice_kind = d.invoice_kind;
    if ("invoice_lines" in d) this.invoice_lines = d.invoice_lines;
    if ("invoice_number" in d) this.invoice_number = d.invoice_number;
    if ("invoicing_detailed_source" in d) this.invoicing_detailed_source = d.invoicing_detailed_source;
    if ("is_accounting_needed" in d) this.is_accounting_needed = d.is_accounting_needed;
    if ("is_credit_note" in d) this.is_credit_note = d.is_credit_note;
    if ("is_destroyable" in d) this.is_destroyable = d.is_destroyable;
    if ("is_estimate" in d) this.is_estimate = d.is_estimate;
    if ("is_sendable" in d) this.is_sendable = d.is_sendable;
    this.is_waiting_details = d.is_waiting_details;
    if ("is_waiting_for_ocr" in d) this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    this.journal = d.journal;
    this.journal_id = d.journal_id;
    this.label = d.label;
    if ("language" in d) this.language = d.language;
    this.ledgerEvents = d.ledgerEvents;
    this.ledgerEventsCount = d.ledgerEventsCount;
    if ("manual_partial_invoices" in d) this.manual_partial_invoices = d.manual_partial_invoices;
    this.method = d.method;
    if ("multiplier" in d) this.multiplier = d.multiplier;
    if ("not_duplicate" in d) this.not_duplicate = d.not_duplicate;
    if ("ocr_thirdparty_id" in d) this.ocr_thirdparty_id = d.ocr_thirdparty_id;
    this.outstanding_balance = d.outstanding_balance;
    if ("pages_count" in d) this.pages_count = d.pages_count;
    if ("paid" in d) this.paid = d.paid;
    if ("payment_id" in d) this.payment_id = d.payment_id;
    if ("payment_method" in d) this.payment_method = d.payment_method;
    if ("payment_reference" in d) this.payment_reference = d.payment_reference;
    if ("payment_reminder_enabled" in d) this.payment_reminder_enabled = d.payment_reminder_enabled;
    if ("payment_status" in d) this.payment_status = d.payment_status;
    this.pdf_generation_status = d.pdf_generation_status;
    if ("pdf_invoice_display_products_list" in d) this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;
    if ("pdf_invoice_free_text" in d) this.pdf_invoice_free_text = d.pdf_invoice_free_text;
    if ("pdf_invoice_free_text_enabled" in d) this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;
    if ("pdf_invoice_subject" in d) this.pdf_invoice_subject = d.pdf_invoice_subject;
    if ("pdf_invoice_subject_enabled" in d) this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;
    if ("pdf_invoice_title" in d) this.pdf_invoice_title = d.pdf_invoice_title;
    if ("pdf_paid_stamp" in d) this.pdf_paid_stamp = d.pdf_paid_stamp;
    this.pending = d.pending;
    this.preview_status = d.preview_status;
    this.preview_urls = d.preview_urls;
    if ("price_before_tax" in d) this.price_before_tax = d.price_before_tax;
    this.pusher_channel = d.pusher_channel;
    if ("quote_group_uuid" in d) this.quote_group_uuid = d.quote_group_uuid;
    if ("quote_uid" in d) this.quote_uid = d.quote_uid;
    this.quotes = d.quotes;
    this.readonly = d.readonly;
    if ("recipients" in d) this.recipients = d.recipients;
    this.reconciled = d.reconciled;
    this.reversal_origin_id = d.reversal_origin_id;
    this.score = d.score;
    if ("scored_invoices" in d) this.scored_invoices = d.scored_invoices;
    if ("scored_transactions" in d) this.scored_transactions = d.scored_transactions;
    if ("size" in d) this.size = d.size;
    this.source = d.source;
    if ("special_mention" in d) this.special_mention = d.special_mention;
    if ("status" in d) this.status = d.status;
    if ("subcomplete" in d) this.subcomplete = d.subcomplete;
    if ("tagged_at_ledger_events_level" in d) this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;
    if ("tax" in d) this.tax = d.tax;
    if ("thirdparty" in d) this.thirdparty = d.thirdparty;
    this.thirdparty_id = d.thirdparty_id;
    this.type = d.type;
    this.updated_at = d.updated_at;
    this.url = d.url;
    if ("validation_needed" in d) this.validation_needed = d.validation_needed;
  }
}

export class Account {
  public readonly balance: string;
  public readonly bic: string;
  public readonly company_id: number;
  public readonly connection: string | null;
  public readonly currency: string;
  public readonly currency_balance: string;
  public readonly establishment: Establishment;
  public readonly establishment_id: number;
  public readonly iban: string | null;
  public readonly id: number;
  public readonly label: string;
  public readonly last_successful_sync_at: string | null;
  public readonly last_sync_at: string | null;
  public readonly last_sync_error: null;
  public readonly last_sync_http_code: number;
  public readonly ledger_events_count: null;
  public readonly ledger_events_max_date: null;
  public readonly ledger_events_min_date: null;
  public readonly merge_url: string;
  public readonly method: string;
  public readonly name: string;
  public readonly pusher_channel: string;
  public readonly swan: boolean;
  public readonly swan_number: null;
  public readonly sync_attachments: boolean;
  public readonly sync_customers: boolean;
  public readonly sync_since: null;
  public readonly synchronized: boolean;
  public readonly transactions_count: null;
  public readonly updated_at: string;
  public readonly url: string;
  public readonly use_as_default_for_vat_return: boolean;
  public readonly visible: boolean;
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
    checkString(d.balance, field + ".balance");
    checkString(d.bic, field + ".bic");
    checkNumber(d.company_id, field + ".company_id");
    // This will be refactored in the next release.
    try {
      checkString(d.connection, field + ".connection", "string | null");
    } catch (e) {
      try {
        checkNull(d.connection, field + ".connection", "string | null");
      } catch (e) {
      }
    }
    checkString(d.currency, field + ".currency");
    checkString(d.currency_balance, field + ".currency_balance");
    d.establishment = Establishment.Create(d.establishment, field + ".establishment");
    checkNumber(d.establishment_id, field + ".establishment_id");
    // This will be refactored in the next release.
    try {
      checkString(d.iban, field + ".iban", "string | null");
    } catch (e) {
      try {
        checkNull(d.iban, field + ".iban", "string | null");
      } catch (e) {
      }
    }
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    // This will be refactored in the next release.
    try {
      checkString(d.last_successful_sync_at, field + ".last_successful_sync_at", "string | null");
    } catch (e) {
      try {
        checkNull(d.last_successful_sync_at, field + ".last_successful_sync_at", "string | null");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.last_sync_at, field + ".last_sync_at", "string | null");
    } catch (e) {
      try {
        checkNull(d.last_sync_at, field + ".last_sync_at", "string | null");
      } catch (e) {
      }
    }
    checkNull(d.last_sync_error, field + ".last_sync_error");
    checkNumber(d.last_sync_http_code, field + ".last_sync_http_code");
    checkNull(d.ledger_events_count, field + ".ledger_events_count");
    checkNull(d.ledger_events_max_date, field + ".ledger_events_max_date");
    checkNull(d.ledger_events_min_date, field + ".ledger_events_min_date");
    checkString(d.merge_url, field + ".merge_url");
    checkString(d.method, field + ".method");
    checkString(d.name, field + ".name");
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkBoolean(d.swan, field + ".swan");
    checkNull(d.swan_number, field + ".swan_number");
    checkBoolean(d.sync_attachments, field + ".sync_attachments");
    checkBoolean(d.sync_customers, field + ".sync_customers");
    checkNull(d.sync_since, field + ".sync_since");
    checkBoolean(d.synchronized, field + ".synchronized");
    checkNull(d.transactions_count, field + ".transactions_count");
    checkString(d.updated_at, field + ".updated_at");
    checkString(d.url, field + ".url");
    checkBoolean(d.use_as_default_for_vat_return, field + ".use_as_default_for_vat_return");
    checkBoolean(d.visible, field + ".visible");
    const knownProperties = ["balance","bic","company_id","connection","currency","currency_balance","establishment","establishment_id","iban","id","label","last_successful_sync_at","last_sync_at","last_sync_error","last_sync_http_code","ledger_events_count","ledger_events_max_date","ledger_events_min_date","merge_url","method","name","pusher_channel","swan","swan_number","sync_attachments","sync_customers","sync_since","synchronized","transactions_count","updated_at","url","use_as_default_for_vat_return","visible"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Account(d);
  }
  private constructor(d: any) {
    this.balance = d.balance;
    this.bic = d.bic;
    this.company_id = d.company_id;
    this.connection = d.connection;
    this.currency = d.currency;
    this.currency_balance = d.currency_balance;
    this.establishment = d.establishment;
    this.establishment_id = d.establishment_id;
    this.iban = d.iban;
    this.id = d.id;
    this.label = d.label;
    this.last_successful_sync_at = d.last_successful_sync_at;
    this.last_sync_at = d.last_sync_at;
    this.last_sync_error = d.last_sync_error;
    this.last_sync_http_code = d.last_sync_http_code;
    this.ledger_events_count = d.ledger_events_count;
    this.ledger_events_max_date = d.ledger_events_max_date;
    this.ledger_events_min_date = d.ledger_events_min_date;
    this.merge_url = d.merge_url;
    this.method = d.method;
    this.name = d.name;
    this.pusher_channel = d.pusher_channel;
    this.swan = d.swan;
    this.swan_number = d.swan_number;
    this.sync_attachments = d.sync_attachments;
    this.sync_customers = d.sync_customers;
    this.sync_since = d.sync_since;
    this.synchronized = d.synchronized;
    this.transactions_count = d.transactions_count;
    this.updated_at = d.updated_at;
    this.url = d.url;
    this.use_as_default_for_vat_return = d.use_as_default_for_vat_return;
    this.visible = d.visible;
  }
}

export class Establishment {
  public readonly accounts_count: number;
  public readonly bridge_ids: number[];
  public readonly budgetinsight_id: null;
  public readonly crm_url: string;
  public readonly id: number;
  public readonly logo_url: string;
  public readonly method: string;
  public readonly name: string;
  public static Parse(d: string): Establishment {
    return Establishment.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Establishment {
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
    checkNumber(d.accounts_count, field + ".accounts_count");
    checkArray(d.bridge_ids, field + ".bridge_ids");
    if (d.bridge_ids) {
      for (let i = 0; i < d.bridge_ids.length; i++) {
        checkNumber(d.bridge_ids[i], field + ".bridge_ids" + "[" + i + "]");
      }
    }
    checkNull(d.budgetinsight_id, field + ".budgetinsight_id");
    checkString(d.crm_url, field + ".crm_url");
    checkNumber(d.id, field + ".id");
    checkString(d.logo_url, field + ".logo_url");
    checkString(d.method, field + ".method");
    checkString(d.name, field + ".name");
    const knownProperties = ["accounts_count","bridge_ids","budgetinsight_id","crm_url","id","logo_url","method","name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Establishment(d);
  }
  private constructor(d: any) {
    this.accounts_count = d.accounts_count;
    this.bridge_ids = d.bridge_ids;
    this.budgetinsight_id = d.budgetinsight_id;
    this.crm_url = d.crm_url;
    this.id = d.id;
    this.logo_url = d.logo_url;
    this.method = d.method;
    this.name = d.name;
  }
}

export class ClientCommentsEntityOrEstablishmentComment {
  public readonly content: string;
  public readonly created_at: string;
  public readonly id: number;
  public readonly name: string;
  public readonly record_id: number;
  public readonly record_type: string;
  public readonly rich_content: null;
  public readonly seen: boolean;
  public readonly updated_at: string;
  public readonly user: User;
  public readonly user_id: number;
  public static Parse(d: string): ClientCommentsEntityOrEstablishmentComment {
    return ClientCommentsEntityOrEstablishmentComment.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): ClientCommentsEntityOrEstablishmentComment {
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
    checkString(d.content, field + ".content");
    checkString(d.created_at, field + ".created_at");
    checkNumber(d.id, field + ".id");
    checkString(d.name, field + ".name");
    checkNumber(d.record_id, field + ".record_id");
    checkString(d.record_type, field + ".record_type");
    checkNull(d.rich_content, field + ".rich_content");
    checkBoolean(d.seen, field + ".seen");
    checkString(d.updated_at, field + ".updated_at");
    d.user = User.Create(d.user, field + ".user");
    checkNumber(d.user_id, field + ".user_id");
    const knownProperties = ["content","created_at","id","name","record_id","record_type","rich_content","seen","updated_at","user","user_id"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new ClientCommentsEntityOrEstablishmentComment(d);
  }
  private constructor(d: any) {
    this.content = d.content;
    this.created_at = d.created_at;
    this.id = d.id;
    this.name = d.name;
    this.record_id = d.record_id;
    this.record_type = d.record_type;
    this.rich_content = d.rich_content;
    this.seen = d.seen;
    this.updated_at = d.updated_at;
    this.user = d.user;
    this.user_id = d.user_id;
  }
}

export class User {
  public readonly first_name: string;
  public readonly full_name: string;
  public readonly id: number;
  public readonly last_name: string;
  public readonly profile_picture_url: null;
  public static Parse(d: string): User {
    return User.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): User {
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
    checkString(d.first_name, field + ".first_name");
    checkString(d.full_name, field + ".full_name");
    checkNumber(d.id, field + ".id");
    checkString(d.last_name, field + ".last_name");
    checkNull(d.profile_picture_url, field + ".profile_picture_url");
    const knownProperties = ["first_name","full_name","id","last_name","profile_picture_url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new User(d);
  }
  private constructor(d: any) {
    this.first_name = d.first_name;
    this.full_name = d.full_name;
    this.id = d.id;
    this.last_name = d.last_name;
    this.profile_picture_url = d.profile_picture_url;
  }
}

export class Company1 {
  public readonly name: string;
  public static Parse(d: string): Company1 {
    return Company1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Company1 {
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
    checkString(d.name, field + ".name");
    const knownProperties = ["name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Company1(d);
  }
  private constructor(d: any) {
    this.name = d.name;
  }
}

export class PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem {
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly internal_identifier: null;
  public readonly label: string;
  public readonly label_is_editable: boolean;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem {
    return PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem {
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
    return new PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem(d);
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

export class EstablishmentCommentOrClientCommentsEntity {
  public readonly author?: null;
  public readonly content: string;
  public readonly created_at: string;
  public readonly id: number;
  public readonly name: string;
  public readonly record_id: number;
  public readonly record_type: string;
  public readonly rich_content: null;
  public readonly seen: boolean;
  public readonly updated_at: string;
  public readonly user: null | User;
  public readonly user_id: null | number;
  public static Parse(d: string): EstablishmentCommentOrClientCommentsEntity {
    return EstablishmentCommentOrClientCommentsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): EstablishmentCommentOrClientCommentsEntity {
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
    if ("author" in d) {
      checkNull(d.author, field + ".author");
    }
    checkString(d.content, field + ".content");
    checkString(d.created_at, field + ".created_at");
    checkNumber(d.id, field + ".id");
    checkString(d.name, field + ".name");
    checkNumber(d.record_id, field + ".record_id");
    checkString(d.record_type, field + ".record_type");
    checkNull(d.rich_content, field + ".rich_content");
    checkBoolean(d.seen, field + ".seen");
    checkString(d.updated_at, field + ".updated_at");
    // This will be refactored in the next release.
    try {
      checkNull(d.user, field + ".user", "null | User");
    } catch (e) {
      try {
        d.user = User.Create(d.user, field + ".user", "null | User");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.user_id, field + ".user_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.user_id, field + ".user_id", "null | number");
      } catch (e) {
      }
    }
    const knownProperties = ["author","content","created_at","id","name","record_id","record_type","rich_content","seen","updated_at","user","user_id"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new EstablishmentCommentOrClientCommentsEntity(d);
  }
  private constructor(d: any) {
    if ("author" in d) this.author = d.author;
    this.content = d.content;
    this.created_at = d.created_at;
    this.id = d.id;
    this.name = d.name;
    this.record_id = d.record_id;
    this.record_type = d.record_type;
    this.rich_content = d.rich_content;
    this.seen = d.seen;
    this.updated_at = d.updated_at;
    this.user = d.user;
    this.user_id = d.user_id;
  }
}

export class InvoiceLinesEntity {
  public readonly advance_id: null | number;
  public readonly amount: string;
  public readonly asset_id: number | null;
  public readonly company_id: number;
  public readonly created_at: string;
  public readonly currency_amount: string;
  public readonly currency_price_before_tax: string;
  public readonly currency_tax: string;
  public readonly currency_unit_price_before_tax: string;
  public readonly deferral_id: null;
  public readonly description: string;
  public readonly discount: string;
  public readonly discount_type: string;
  public readonly document_id: number;
  public readonly global_vat: boolean;
  public readonly id: number;
  public readonly invoice_line_section_id: number | null;
  public readonly label: string;
  public readonly manual_vat_mode: boolean;
  public readonly ocr_vat_rate: null | string;
  public readonly pnl_plan_item: PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1;
  public readonly pnl_plan_item_id: number;
  public readonly prepaid_pnl: boolean;
  public readonly price_before_tax: string;
  public readonly product_id: null;
  public readonly quantity: string;
  public readonly rank: number | null;
  public readonly raw_currency_unit_price: string;
  public readonly tax: string;
  public readonly undiscounted_currency_price_before_tax: string;
  public readonly unit: string | null;
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
    // This will be refactored in the next release.
    try {
      checkNull(d.advance_id, field + ".advance_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.advance_id, field + ".advance_id", "null | number");
      } catch (e) {
      }
    }
    checkString(d.amount, field + ".amount");
    // This will be refactored in the next release.
    try {
      checkNumber(d.asset_id, field + ".asset_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.asset_id, field + ".asset_id", "number | null");
      } catch (e) {
      }
    }
    checkNumber(d.company_id, field + ".company_id");
    checkString(d.created_at, field + ".created_at");
    checkString(d.currency_amount, field + ".currency_amount");
    checkString(d.currency_price_before_tax, field + ".currency_price_before_tax");
    checkString(d.currency_tax, field + ".currency_tax");
    checkString(d.currency_unit_price_before_tax, field + ".currency_unit_price_before_tax");
    checkNull(d.deferral_id, field + ".deferral_id");
    checkString(d.description, field + ".description");
    checkString(d.discount, field + ".discount");
    checkString(d.discount_type, field + ".discount_type");
    checkNumber(d.document_id, field + ".document_id");
    checkBoolean(d.global_vat, field + ".global_vat");
    checkNumber(d.id, field + ".id");
    // This will be refactored in the next release.
    try {
      checkNumber(d.invoice_line_section_id, field + ".invoice_line_section_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.invoice_line_section_id, field + ".invoice_line_section_id", "number | null");
      } catch (e) {
      }
    }
    checkString(d.label, field + ".label");
    checkBoolean(d.manual_vat_mode, field + ".manual_vat_mode");
    // This will be refactored in the next release.
    try {
      checkNull(d.ocr_vat_rate, field + ".ocr_vat_rate", "null | string");
    } catch (e) {
      try {
        checkString(d.ocr_vat_rate, field + ".ocr_vat_rate", "null | string");
      } catch (e) {
      }
    }
    d.pnl_plan_item = PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    checkNumber(d.pnl_plan_item_id, field + ".pnl_plan_item_id");
    checkBoolean(d.prepaid_pnl, field + ".prepaid_pnl");
    checkString(d.price_before_tax, field + ".price_before_tax");
    checkNull(d.product_id, field + ".product_id");
    checkString(d.quantity, field + ".quantity");
    // This will be refactored in the next release.
    try {
      checkNumber(d.rank, field + ".rank", "number | null");
    } catch (e) {
      try {
        checkNull(d.rank, field + ".rank", "number | null");
      } catch (e) {
      }
    }
    checkString(d.raw_currency_unit_price, field + ".raw_currency_unit_price");
    checkString(d.tax, field + ".tax");
    checkString(d.undiscounted_currency_price_before_tax, field + ".undiscounted_currency_price_before_tax");
    // This will be refactored in the next release.
    try {
      checkString(d.unit, field + ".unit", "string | null");
    } catch (e) {
      try {
        checkNull(d.unit, field + ".unit", "string | null");
      } catch (e) {
      }
    }
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["advance_id","amount","asset_id","company_id","created_at","currency_amount","currency_price_before_tax","currency_tax","currency_unit_price_before_tax","deferral_id","description","discount","discount_type","document_id","global_vat","id","invoice_line_section_id","label","manual_vat_mode","ocr_vat_rate","pnl_plan_item","pnl_plan_item_id","prepaid_pnl","price_before_tax","product_id","quantity","rank","raw_currency_unit_price","tax","undiscounted_currency_price_before_tax","unit","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new InvoiceLinesEntity(d);
  }
  private constructor(d: any) {
    this.advance_id = d.advance_id;
    this.amount = d.amount;
    this.asset_id = d.asset_id;
    this.company_id = d.company_id;
    this.created_at = d.created_at;
    this.currency_amount = d.currency_amount;
    this.currency_price_before_tax = d.currency_price_before_tax;
    this.currency_tax = d.currency_tax;
    this.currency_unit_price_before_tax = d.currency_unit_price_before_tax;
    this.deferral_id = d.deferral_id;
    this.description = d.description;
    this.discount = d.discount;
    this.discount_type = d.discount_type;
    this.document_id = d.document_id;
    this.global_vat = d.global_vat;
    this.id = d.id;
    this.invoice_line_section_id = d.invoice_line_section_id;
    this.label = d.label;
    this.manual_vat_mode = d.manual_vat_mode;
    this.ocr_vat_rate = d.ocr_vat_rate;
    this.pnl_plan_item = d.pnl_plan_item;
    this.pnl_plan_item_id = d.pnl_plan_item_id;
    this.prepaid_pnl = d.prepaid_pnl;
    this.price_before_tax = d.price_before_tax;
    this.product_id = d.product_id;
    this.quantity = d.quantity;
    this.rank = d.rank;
    this.raw_currency_unit_price = d.raw_currency_unit_price;
    this.tax = d.tax;
    this.undiscounted_currency_price_before_tax = d.undiscounted_currency_price_before_tax;
    this.unit = d.unit;
    this.vat_rate = d.vat_rate;
  }
}

export class PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1 {
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly internal_identifier: null | string;
  public readonly label: string;
  public readonly label_is_editable: boolean;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1 {
    return PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1 {
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
      }
    }
    checkString(d.label, field + ".label");
    checkBoolean(d.label_is_editable, field + ".label_is_editable");
    checkString(d.number, field + ".number");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["company_id","country_alpha2","enabled","id","internal_identifier","label","label_is_editable","number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1(d);
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

export class Journal {
  public readonly code: string;
  public readonly id: number;
  public readonly label: string;
  public static Parse(d: string): Journal {
    return Journal.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Journal {
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
    checkString(d.code, field + ".code");
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    const knownProperties = ["code","id","label"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Journal(d);
  }
  private constructor(d: any) {
    this.code = d.code;
    this.id = d.id;
    this.label = d.label;
  }
}

export class LedgerEventsEntity {
  public readonly balance: string;
  public readonly company_id: number;
  public readonly created_at: string;
  public readonly credit: string;
  public readonly date: string;
  public readonly debit: string;
  public readonly document_id: number;
  public readonly document_label?: string;
  public readonly id: number;
  public readonly label: string | null;
  public readonly lettering?: Lettering | null;
  public readonly lettering_id: number | null;
  public readonly plan_item_id: number;
  public readonly planItem: PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2;
  public readonly processed_label?: string;
  public readonly readonly: boolean;
  public readonly readonlyAmounts: boolean;
  public readonly reallocation?: Reallocation | null;
  public readonly reallocation_id: null | number;
  public readonly reconciliation_id: number | null;
  public readonly source: string;
  public static Parse(d: string): LedgerEventsEntity {
    return LedgerEventsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): LedgerEventsEntity {
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
    checkNumber(d.company_id, field + ".company_id");
    checkString(d.created_at, field + ".created_at");
    checkString(d.credit, field + ".credit");
    checkString(d.date, field + ".date");
    checkString(d.debit, field + ".debit");
    checkNumber(d.document_id, field + ".document_id");
    if ("document_label" in d) {
      checkString(d.document_label, field + ".document_label");
    }
    checkNumber(d.id, field + ".id");
    // This will be refactored in the next release.
    try {
      checkString(d.label, field + ".label", "string | null");
    } catch (e) {
      try {
        checkNull(d.label, field + ".label", "string | null");
      } catch (e) {
      }
    }
    if ("lettering" in d) {
      // This will be refactored in the next release.
      try {
        d.lettering = Lettering.Create(d.lettering, field + ".lettering", "Lettering | null");
      } catch (e) {
        try {
          checkNull(d.lettering, field + ".lettering", "Lettering | null");
        } catch (e) {
        }
      }
    }
    // This will be refactored in the next release.
    try {
      checkNumber(d.lettering_id, field + ".lettering_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.lettering_id, field + ".lettering_id", "number | null");
      } catch (e) {
      }
    }
    checkNumber(d.plan_item_id, field + ".plan_item_id");
    d.planItem = PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2.Create(d.planItem, field + ".planItem");
    if ("processed_label" in d) {
      checkString(d.processed_label, field + ".processed_label");
    }
    checkBoolean(d.readonly, field + ".readonly");
    checkBoolean(d.readonlyAmounts, field + ".readonlyAmounts");
    if ("reallocation" in d) {
      // This will be refactored in the next release.
      try {
        d.reallocation = Reallocation.Create(d.reallocation, field + ".reallocation", "Reallocation | null");
      } catch (e) {
        try {
          checkNull(d.reallocation, field + ".reallocation", "Reallocation | null");
        } catch (e) {
        }
      }
    }
    // This will be refactored in the next release.
    try {
      checkNull(d.reallocation_id, field + ".reallocation_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.reallocation_id, field + ".reallocation_id", "null | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkNumber(d.reconciliation_id, field + ".reconciliation_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.reconciliation_id, field + ".reconciliation_id", "number | null");
      } catch (e) {
      }
    }
    checkString(d.source, field + ".source");
    const knownProperties = ["balance","company_id","created_at","credit","date","debit","document_id","document_label","id","label","lettering","lettering_id","plan_item_id","planItem","processed_label","readonly","readonlyAmounts","reallocation","reallocation_id","reconciliation_id","source"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new LedgerEventsEntity(d);
  }
  private constructor(d: any) {
    this.balance = d.balance;
    this.company_id = d.company_id;
    this.created_at = d.created_at;
    this.credit = d.credit;
    this.date = d.date;
    this.debit = d.debit;
    this.document_id = d.document_id;
    if ("document_label" in d) this.document_label = d.document_label;
    this.id = d.id;
    this.label = d.label;
    if ("lettering" in d) this.lettering = d.lettering;
    this.lettering_id = d.lettering_id;
    this.plan_item_id = d.plan_item_id;
    this.planItem = d.planItem;
    if ("processed_label" in d) this.processed_label = d.processed_label;
    this.readonly = d.readonly;
    this.readonlyAmounts = d.readonlyAmounts;
    if ("reallocation" in d) this.reallocation = d.reallocation;
    this.reallocation_id = d.reallocation_id;
    this.reconciliation_id = d.reconciliation_id;
    this.source = d.source;
  }
}

export class Lettering {
  public readonly balance: string;
  public readonly id: number;
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
    checkString(d.plan_item_number, field + ".plan_item_number");
    const knownProperties = ["balance","id","plan_item_number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Lettering(d);
  }
  private constructor(d: any) {
    this.balance = d.balance;
    this.id = d.id;
    this.plan_item_number = d.plan_item_number;
  }
}

export class PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2 {
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly internal_identifier: null | string;
  public readonly label: string;
  public readonly label_is_editable: boolean;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2 {
    return PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2 {
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
      }
    }
    checkString(d.label, field + ".label");
    checkBoolean(d.label_is_editable, field + ".label_is_editable");
    checkString(d.number, field + ".number");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["company_id","country_alpha2","enabled","id","internal_identifier","label","label_is_editable","number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2(d);
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

export class Reallocation {
  public readonly created_at: string;
  public readonly fromPlanItem: PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3;
  public readonly id: number;
  public static Parse(d: string): Reallocation {
    return Reallocation.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Reallocation {
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
    d.fromPlanItem = PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3.Create(d.fromPlanItem, field + ".fromPlanItem");
    checkNumber(d.id, field + ".id");
    const knownProperties = ["created_at","fromPlanItem","id"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Reallocation(d);
  }
  private constructor(d: any) {
    this.created_at = d.created_at;
    this.fromPlanItem = d.fromPlanItem;
    this.id = d.id;
  }
}

export class PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3 {
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly internal_identifier: string | null;
  public readonly label: string;
  public readonly label_is_editable: boolean;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3 {
    return PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3 {
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
      checkString(d.internal_identifier, field + ".internal_identifier", "string | null");
    } catch (e) {
      try {
        checkNull(d.internal_identifier, field + ".internal_identifier", "string | null");
      } catch (e) {
      }
    }
    checkString(d.label, field + ".label");
    checkBoolean(d.label_is_editable, field + ".label_is_editable");
    checkString(d.number, field + ".number");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["company_id","country_alpha2","enabled","id","internal_identifier","label","label_is_editable","number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3(d);
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

export class ScoredInvoices1 {
  public static Parse(d: string): ScoredInvoices1 {
    return ScoredInvoices1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): ScoredInvoices1 {
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
    const knownProperties = [];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new ScoredInvoices1(d);
  }
  private constructor(d: any) {
  }
}

export class Thirdparty {
  public readonly activity_code: string;
  public readonly activity_nomenclature: string;
  public readonly address: string;
  public readonly address_additional_info: string;
  public readonly admin_city_code: null | string;
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
  public readonly country: null | string;
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
  public readonly plan_item: null;
  public readonly plan_item_attributes: null;
  public readonly plan_item_id: number;
  public readonly pnl_plan_item: null;
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
  public readonly supplier_payment_method_last_updated_at: string | null;
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
    // This will be refactored in the next release.
    try {
      checkNull(d.admin_city_code, field + ".admin_city_code", "null | string");
    } catch (e) {
      try {
        checkString(d.admin_city_code, field + ".admin_city_code", "null | string");
      } catch (e) {
      }
    }
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
      checkNull(d.country, field + ".country", "null | string");
    } catch (e) {
      try {
        checkString(d.country, field + ".country", "null | string");
      } catch (e) {
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
    checkNull(d.plan_item, field + ".plan_item");
    checkNull(d.plan_item_attributes, field + ".plan_item_attributes");
    checkNumber(d.plan_item_id, field + ".plan_item_id");
    checkNull(d.pnl_plan_item, field + ".pnl_plan_item");
    // This will be refactored in the next release.
    try {
      checkNumber(d.pnl_plan_item_id, field + ".pnl_plan_item_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.pnl_plan_item_id, field + ".pnl_plan_item_id", "number | null");
      } catch (e) {
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
      checkString(d.supplier_payment_method_last_updated_at, field + ".supplier_payment_method_last_updated_at", "string | null");
    } catch (e) {
      try {
        checkNull(d.supplier_payment_method_last_updated_at, field + ".supplier_payment_method_last_updated_at", "string | null");
      } catch (e) {
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

export class ScoredInvoices {
  public static Parse(d: string): ScoredInvoices {
    return ScoredInvoices.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): ScoredInvoices {
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
    const knownProperties = [];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new ScoredInvoices(d);
  }
  private constructor(d: any) {
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
  }
}
