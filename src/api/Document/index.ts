// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDocument';
let obj: any = null;
export class APIDocument {
  public readonly id: number;
  public readonly company_id: number;
  public readonly date?: string | null;
  public readonly created_at: string;
  public readonly updated_at: string;
  public readonly archived_at?: string | null;
  public readonly type: string;
  public readonly source: string;
  public readonly draft: boolean;
  public readonly group_uuid: string;
  public readonly gdrive_path?: string | null;
  public readonly preview_status?: string | null;
  public readonly pusher_channel: string;
  public readonly email_from?: null;
  public readonly score?: null;
  public readonly is_waiting_details: boolean;
  public readonly external_id: string;
  public readonly journal_id: number;
  public readonly grouped_at?: string | null;
  public readonly attachment_required: boolean;
  public readonly attachment_lost: boolean;
  public readonly pdf_generation_status: string;
  public readonly reversal_origin_id?: null;
  public readonly billing_subscription_id?: null;
  public readonly fec_pieceref: string;
  public readonly label: string;
  public readonly url: string;
  public readonly method: string;
  public readonly accounting_type: boolean;
  public readonly archived: boolean;
  public readonly quotes: boolean;
  public readonly readonly: boolean;
  public readonly account_id?: number | null;
  public readonly thirdparty_id?: number | null;
  public readonly payment_id?: null;
  public readonly amount: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly outstanding_balance: string;
  public readonly completeness?: number | null;
  public readonly gross_amount?: string | null;
  public readonly status?: string | null;
  public readonly complete?: boolean | null;
  public readonly company?: Company | null;
  public readonly scored_invoices?: ScoredInvoices | null;
  public readonly grouped_documents?: GroupedDocumentsEntity[] | null;
  public readonly is_waiting_for_ocr?: boolean | null;
  public readonly ocr_thirdparty_id?: number | null;
  public readonly direction?: string | null;
  public readonly deadline?: string | null;
  public readonly multiplier?: number | null;
  public readonly price_before_tax?: string | null;
  public readonly quote_uid?: null;
  public readonly special_mention?: null;
  public readonly not_duplicate?: boolean | null;
  public readonly validation_needed?: boolean | null;
  public readonly currency_tax?: string | null;
  public readonly currency_price_before_tax?: string | null;
  public readonly language?: string | null;
  public readonly payment_status?: string | null;
  public readonly payment_method?: null;
  public readonly invoice_number?: string | null;
  public readonly tax?: string | null;
  public readonly estimate_status?: null;
  public readonly iban?: string | null;
  public readonly paid?: boolean | null;
  public readonly future_in_days?: number | null;
  public readonly discount?: string | null;
  public readonly discount_type?: string | null;
  public readonly finalized_at?: null;
  public readonly quote_group_uuid?: string | null;
  public readonly factor_status?: string | null;
  public readonly currency_amount_before_tax?: string | null;
  public readonly from_estimate_id?: null;
  public readonly credit_notes_amount?: string | null;
  public readonly payment_reminder_enabled?: boolean | null;
  public readonly payment_reference?: string | null;
  public readonly is_credit_note?: boolean | null;
  public readonly is_estimate?: boolean | null;
  public readonly is_destroyable?: boolean | null;
  public readonly can_be_stamped_as_paid_in_pdf?: boolean | null;
  public readonly custom_payment_reference?: string | null;
  public readonly scored_transactions?: null[] | null;
  public readonly recipients?: null[] | null;
  public readonly invoice_kind?: string | null;
  public readonly pdf_invoice_title?: string | null;
  public readonly pdf_invoice_free_text?: string | null;
  public readonly pdf_invoice_free_text_enabled?: boolean | null;
  public readonly pdf_invoice_subject?: string | null;
  public readonly pdf_invoice_subject_enabled?: boolean | null;
  public readonly pdf_invoice_display_products_list?: boolean | null;
  public readonly pdf_paid_stamp?: boolean | null;
  public readonly invoicing_detailed_source?: null;
  public readonly manual_partial_invoices?: boolean | null;
  public static Parse(d: string): APIDocument {
    return APIDocument.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APIDocument {
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
    checkNumber(d.company_id, false, field + ".company_id");
    checkString(d.date, true, field + ".date");
    checkString(d.created_at, false, field + ".created_at");
    checkString(d.updated_at, false, field + ".updated_at");
    checkString(d.archived_at, true, field + ".archived_at");
    checkString(d.type, false, field + ".type");
    checkString(d.source, false, field + ".source");
    checkBoolean(d.draft, false, field + ".draft");
    checkString(d.group_uuid, false, field + ".group_uuid");
    checkString(d.gdrive_path, true, field + ".gdrive_path");
    checkString(d.preview_status, true, field + ".preview_status");
    checkString(d.pusher_channel, false, field + ".pusher_channel");
    checkNull(d.email_from, field + ".email_from");
    checkNull(d.score, field + ".score");
    checkBoolean(d.is_waiting_details, false, field + ".is_waiting_details");
    checkString(d.external_id, false, field + ".external_id");
    checkNumber(d.journal_id, false, field + ".journal_id");
    checkString(d.grouped_at, true, field + ".grouped_at");
    checkBoolean(d.attachment_required, false, field + ".attachment_required");
    checkBoolean(d.attachment_lost, false, field + ".attachment_lost");
    checkString(d.pdf_generation_status, false, field + ".pdf_generation_status");
    checkNull(d.reversal_origin_id, field + ".reversal_origin_id");
    checkNull(d.billing_subscription_id, field + ".billing_subscription_id");
    checkString(d.fec_pieceref, false, field + ".fec_pieceref");
    checkString(d.label, false, field + ".label");
    checkString(d.url, false, field + ".url");
    checkString(d.method, false, field + ".method");
    checkBoolean(d.accounting_type, false, field + ".accounting_type");
    checkBoolean(d.archived, false, field + ".archived");
    checkBoolean(d.quotes, false, field + ".quotes");
    checkBoolean(d.readonly, false, field + ".readonly");
    checkNumber(d.account_id, true, field + ".account_id");
    checkNumber(d.thirdparty_id, true, field + ".thirdparty_id");
    checkNull(d.payment_id, field + ".payment_id");
    checkString(d.amount, false, field + ".amount");
    checkString(d.currency, false, field + ".currency");
    checkString(d.currency_amount, false, field + ".currency_amount");
    checkString(d.outstanding_balance, false, field + ".outstanding_balance");
    checkNumber(d.completeness, true, field + ".completeness");
    checkString(d.gross_amount, true, field + ".gross_amount");
    checkString(d.status, true, field + ".status");
    checkBoolean(d.complete, true, field + ".complete");
    d.company = Company.Create(d.company, field + ".company");
    d.scored_invoices = ScoredInvoices.Create(d.scored_invoices, field + ".scored_invoices");
    checkArray(d.grouped_documents, field + ".grouped_documents");
    if (d.grouped_documents) {
      for (let i = 0; i < d.grouped_documents.length; i++) {
        d.grouped_documents[i] = GroupedDocumentsEntity.Create(d.grouped_documents[i], field + ".grouped_documents" + "[" + i + "]");
      }
    }
    checkBoolean(d.is_waiting_for_ocr, true, field + ".is_waiting_for_ocr");
    checkNumber(d.ocr_thirdparty_id, true, field + ".ocr_thirdparty_id");
    checkString(d.direction, true, field + ".direction");
    checkString(d.deadline, true, field + ".deadline");
    checkNumber(d.multiplier, true, field + ".multiplier");
    checkString(d.price_before_tax, true, field + ".price_before_tax");
    checkNull(d.quote_uid, field + ".quote_uid");
    checkNull(d.special_mention, field + ".special_mention");
    checkBoolean(d.not_duplicate, true, field + ".not_duplicate");
    checkBoolean(d.validation_needed, true, field + ".validation_needed");
    checkString(d.currency_tax, true, field + ".currency_tax");
    checkString(d.currency_price_before_tax, true, field + ".currency_price_before_tax");
    checkString(d.language, true, field + ".language");
    checkString(d.payment_status, true, field + ".payment_status");
    checkNull(d.payment_method, field + ".payment_method");
    checkString(d.invoice_number, true, field + ".invoice_number");
    checkString(d.tax, true, field + ".tax");
    checkNull(d.estimate_status, field + ".estimate_status");
    checkString(d.iban, true, field + ".iban");
    checkBoolean(d.paid, true, field + ".paid");
    checkNumber(d.future_in_days, true, field + ".future_in_days");
    checkString(d.discount, true, field + ".discount");
    checkString(d.discount_type, true, field + ".discount_type");
    checkNull(d.finalized_at, field + ".finalized_at");
    checkString(d.quote_group_uuid, true, field + ".quote_group_uuid");
    checkString(d.factor_status, true, field + ".factor_status");
    checkString(d.currency_amount_before_tax, true, field + ".currency_amount_before_tax");
    checkNull(d.from_estimate_id, field + ".from_estimate_id");
    checkString(d.credit_notes_amount, true, field + ".credit_notes_amount");
    checkBoolean(d.payment_reminder_enabled, true, field + ".payment_reminder_enabled");
    checkString(d.payment_reference, true, field + ".payment_reference");
    checkBoolean(d.is_credit_note, true, field + ".is_credit_note");
    checkBoolean(d.is_estimate, true, field + ".is_estimate");
    checkBoolean(d.is_destroyable, true, field + ".is_destroyable");
    checkBoolean(d.can_be_stamped_as_paid_in_pdf, true, field + ".can_be_stamped_as_paid_in_pdf");
    checkString(d.custom_payment_reference, true, field + ".custom_payment_reference");
    checkArray(d.scored_transactions, field + ".scored_transactions");
    if (d.scored_transactions) {
      for (let i = 0; i < d.scored_transactions.length; i++) {
        checkNull(d.scored_transactions[i], field + ".scored_transactions" + "[" + i + "]");
      }
    }
    checkArray(d.recipients, field + ".recipients");
    if (d.recipients) {
      for (let i = 0; i < d.recipients.length; i++) {
        checkNull(d.recipients[i], field + ".recipients" + "[" + i + "]");
      }
    }
    checkString(d.invoice_kind, true, field + ".invoice_kind");
    checkString(d.pdf_invoice_title, true, field + ".pdf_invoice_title");
    checkString(d.pdf_invoice_free_text, true, field + ".pdf_invoice_free_text");
    checkBoolean(d.pdf_invoice_free_text_enabled, true, field + ".pdf_invoice_free_text_enabled");
    checkString(d.pdf_invoice_subject, true, field + ".pdf_invoice_subject");
    checkBoolean(d.pdf_invoice_subject_enabled, true, field + ".pdf_invoice_subject_enabled");
    checkBoolean(d.pdf_invoice_display_products_list, true, field + ".pdf_invoice_display_products_list");
    checkBoolean(d.pdf_paid_stamp, true, field + ".pdf_paid_stamp");
    checkNull(d.invoicing_detailed_source, field + ".invoicing_detailed_source");
    checkBoolean(d.manual_partial_invoices, true, field + ".manual_partial_invoices");
    const knownProperties = ["id","company_id","date","created_at","updated_at","archived_at","type","source","draft","group_uuid","gdrive_path","preview_status","pusher_channel","email_from","score","is_waiting_details","external_id","journal_id","grouped_at","attachment_required","attachment_lost","pdf_generation_status","reversal_origin_id","billing_subscription_id","fec_pieceref","label","url","method","accounting_type","archived","quotes","readonly","account_id","thirdparty_id","payment_id","amount","currency","currency_amount","outstanding_balance","completeness","gross_amount","status","complete","company","scored_invoices","grouped_documents","is_waiting_for_ocr","ocr_thirdparty_id","direction","deadline","multiplier","price_before_tax","quote_uid","special_mention","not_duplicate","validation_needed","currency_tax","currency_price_before_tax","language","payment_status","payment_method","invoice_number","tax","estimate_status","iban","paid","future_in_days","discount","discount_type","finalized_at","quote_group_uuid","factor_status","currency_amount_before_tax","from_estimate_id","credit_notes_amount","payment_reminder_enabled","payment_reference","is_credit_note","is_estimate","is_destroyable","can_be_stamped_as_paid_in_pdf","custom_payment_reference","scored_transactions","recipients","invoice_kind","pdf_invoice_title","pdf_invoice_free_text","pdf_invoice_free_text_enabled","pdf_invoice_subject","pdf_invoice_subject_enabled","pdf_invoice_display_products_list","pdf_paid_stamp","invoicing_detailed_source","manual_partial_invoices"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APIDocument(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.company_id = d.company_id;
    if ("date" in d) this.date = d.date;
    this.created_at = d.created_at;
    this.updated_at = d.updated_at;
    if ("archived_at" in d) this.archived_at = d.archived_at;
    this.type = d.type;
    this.source = d.source;
    this.draft = d.draft;
    this.group_uuid = d.group_uuid;
    if ("gdrive_path" in d) this.gdrive_path = d.gdrive_path;
    if ("preview_status" in d) this.preview_status = d.preview_status;
    this.pusher_channel = d.pusher_channel;
    if ("email_from" in d) this.email_from = d.email_from;
    if ("score" in d) this.score = d.score;
    this.is_waiting_details = d.is_waiting_details;
    this.external_id = d.external_id;
    this.journal_id = d.journal_id;
    if ("grouped_at" in d) this.grouped_at = d.grouped_at;
    this.attachment_required = d.attachment_required;
    this.attachment_lost = d.attachment_lost;
    this.pdf_generation_status = d.pdf_generation_status;
    if ("reversal_origin_id" in d) this.reversal_origin_id = d.reversal_origin_id;
    if ("billing_subscription_id" in d) this.billing_subscription_id = d.billing_subscription_id;
    this.fec_pieceref = d.fec_pieceref;
    this.label = d.label;
    this.url = d.url;
    this.method = d.method;
    this.accounting_type = d.accounting_type;
    this.archived = d.archived;
    this.quotes = d.quotes;
    this.readonly = d.readonly;
    if ("account_id" in d) this.account_id = d.account_id;
    if ("thirdparty_id" in d) this.thirdparty_id = d.thirdparty_id;
    if ("payment_id" in d) this.payment_id = d.payment_id;
    this.amount = d.amount;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.outstanding_balance = d.outstanding_balance;
    if ("completeness" in d) this.completeness = d.completeness;
    if ("gross_amount" in d) this.gross_amount = d.gross_amount;
    if ("status" in d) this.status = d.status;
    if ("complete" in d) this.complete = d.complete;
    if ("company" in d) this.company = d.company;
    if ("scored_invoices" in d) this.scored_invoices = d.scored_invoices;
    if ("grouped_documents" in d) this.grouped_documents = d.grouped_documents;
    if ("is_waiting_for_ocr" in d) this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    if ("ocr_thirdparty_id" in d) this.ocr_thirdparty_id = d.ocr_thirdparty_id;
    if ("direction" in d) this.direction = d.direction;
    if ("deadline" in d) this.deadline = d.deadline;
    if ("multiplier" in d) this.multiplier = d.multiplier;
    if ("price_before_tax" in d) this.price_before_tax = d.price_before_tax;
    if ("quote_uid" in d) this.quote_uid = d.quote_uid;
    if ("special_mention" in d) this.special_mention = d.special_mention;
    if ("not_duplicate" in d) this.not_duplicate = d.not_duplicate;
    if ("validation_needed" in d) this.validation_needed = d.validation_needed;
    if ("currency_tax" in d) this.currency_tax = d.currency_tax;
    if ("currency_price_before_tax" in d) this.currency_price_before_tax = d.currency_price_before_tax;
    if ("language" in d) this.language = d.language;
    if ("payment_status" in d) this.payment_status = d.payment_status;
    if ("payment_method" in d) this.payment_method = d.payment_method;
    if ("invoice_number" in d) this.invoice_number = d.invoice_number;
    if ("tax" in d) this.tax = d.tax;
    if ("estimate_status" in d) this.estimate_status = d.estimate_status;
    if ("iban" in d) this.iban = d.iban;
    if ("paid" in d) this.paid = d.paid;
    if ("future_in_days" in d) this.future_in_days = d.future_in_days;
    if ("discount" in d) this.discount = d.discount;
    if ("discount_type" in d) this.discount_type = d.discount_type;
    if ("finalized_at" in d) this.finalized_at = d.finalized_at;
    if ("quote_group_uuid" in d) this.quote_group_uuid = d.quote_group_uuid;
    if ("factor_status" in d) this.factor_status = d.factor_status;
    if ("currency_amount_before_tax" in d) this.currency_amount_before_tax = d.currency_amount_before_tax;
    if ("from_estimate_id" in d) this.from_estimate_id = d.from_estimate_id;
    if ("credit_notes_amount" in d) this.credit_notes_amount = d.credit_notes_amount;
    if ("payment_reminder_enabled" in d) this.payment_reminder_enabled = d.payment_reminder_enabled;
    if ("payment_reference" in d) this.payment_reference = d.payment_reference;
    if ("is_credit_note" in d) this.is_credit_note = d.is_credit_note;
    if ("is_estimate" in d) this.is_estimate = d.is_estimate;
    if ("is_destroyable" in d) this.is_destroyable = d.is_destroyable;
    if ("can_be_stamped_as_paid_in_pdf" in d) this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;
    if ("custom_payment_reference" in d) this.custom_payment_reference = d.custom_payment_reference;
    if ("scored_transactions" in d) this.scored_transactions = d.scored_transactions;
    if ("recipients" in d) this.recipients = d.recipients;
    if ("invoice_kind" in d) this.invoice_kind = d.invoice_kind;
    if ("pdf_invoice_title" in d) this.pdf_invoice_title = d.pdf_invoice_title;
    if ("pdf_invoice_free_text" in d) this.pdf_invoice_free_text = d.pdf_invoice_free_text;
    if ("pdf_invoice_free_text_enabled" in d) this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;
    if ("pdf_invoice_subject" in d) this.pdf_invoice_subject = d.pdf_invoice_subject;
    if ("pdf_invoice_subject_enabled" in d) this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;
    if ("pdf_invoice_display_products_list" in d) this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;
    if ("pdf_paid_stamp" in d) this.pdf_paid_stamp = d.pdf_paid_stamp;
    if ("invoicing_detailed_source" in d) this.invoicing_detailed_source = d.invoicing_detailed_source;
    if ("manual_partial_invoices" in d) this.manual_partial_invoices = d.manual_partial_invoices;
  }
}

export class Company {
  public readonly name: string;
  public static Parse(d: string): Company | null {
    return Company.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Company | null {
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
    checkString(d.name, false, field + ".name");
    const knownProperties = ["name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Company(d);
  }
  private constructor(d: any) {
    this.name = d.name;
  }
}

export class ScoredInvoices {
  public static Parse(d: string): ScoredInvoices | null {
    return ScoredInvoices.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): ScoredInvoices | null {
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
    const knownProperties = [];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new ScoredInvoices(d);
  }
  private constructor(d: any) {
  }
}

export class GroupedDocumentsEntity {
  public readonly id: number;
  public readonly company_id: number;
  public readonly date?: string | null;
  public readonly created_at: string;
  public readonly updated_at: string;
  public readonly archived_at?: string | null;
  public readonly type: string;
  public readonly source: string;
  public readonly draft: boolean;
  public readonly group_uuid: string;
  public readonly gdrive_path?: string | null;
  public readonly preview_status?: string | null;
  public readonly pusher_channel: string;
  public readonly email_from?: null;
  public readonly score?: null;
  public readonly is_waiting_details: boolean;
  public readonly external_id: string;
  public readonly journal_id: number;
  public readonly grouped_at?: string | null;
  public readonly attachment_required: boolean;
  public readonly attachment_lost: boolean;
  public readonly pdf_generation_status: string;
  public readonly reversal_origin_id?: null;
  public readonly billing_subscription_id?: null;
  public readonly fec_pieceref: string;
  public readonly label: string;
  public readonly journal: Journal;
  public readonly url: string;
  public readonly method: string;
  public readonly accounting_type: boolean;
  public readonly preview_urls?: (string | null)[] | null;
  public readonly archived: boolean;
  public readonly quotes: boolean;
  public readonly filename?: string | null;
  public readonly has_file: boolean;
  public readonly readonly: boolean;
  public readonly account_id?: number | null;
  public readonly thirdparty_id?: number | null;
  public readonly payment_id?: null;
  public readonly amount: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly outstanding_balance: string;
  public readonly completeness: number;
  public readonly gross_amount?: string | null;
  public readonly status?: string | null;
  public readonly complete: boolean;
  public readonly account?: Account | null;
  public readonly company?: Company1 | null;
  public readonly scored_invoices?: ScoredInvoices1 | null;
  public readonly is_accounting_needed?: null;
  public readonly pending: boolean;
  public readonly hasTooManyLedgerEvents: boolean;
  public readonly ledgerEventsCount: number;
  public readonly ledgerEvents?: (LedgerEventsEntity | null)[] | null;
  public readonly reconciled: boolean;
  public readonly client_comments?: (ClientCommentsEntityOrEstablishmentComment | null)[] | null;
  public readonly is_waiting_for_ocr?: boolean | null;
  public readonly has_linked_quotes?: boolean | null;
  public readonly size?: string | null;
  public readonly embeddable_in_browser?: boolean | null;
  public readonly ocr_thirdparty_id?: number | null;
  public readonly direction?: string | null;
  public readonly deadline?: string | null;
  public readonly multiplier?: number | null;
  public readonly price_before_tax?: string | null;
  public readonly quote_uid?: null;
  public readonly special_mention?: null;
  public readonly not_duplicate?: boolean | null;
  public readonly validation_needed?: boolean | null;
  public readonly currency_tax?: string | null;
  public readonly currency_price_before_tax?: string | null;
  public readonly language?: string | null;
  public readonly payment_status?: string | null;
  public readonly payment_method?: null;
  public readonly invoice_number?: string | null;
  public readonly tax?: string | null;
  public readonly estimate_status?: null;
  public readonly iban?: string | null;
  public readonly paid?: boolean | null;
  public readonly future_in_days?: number | null;
  public readonly discount?: string | null;
  public readonly discount_type?: string | null;
  public readonly finalized_at?: null;
  public readonly quote_group_uuid?: string | null;
  public readonly factor_status?: string | null;
  public readonly currency_amount_before_tax?: string | null;
  public readonly from_estimate_id?: null;
  public readonly credit_notes_amount?: string | null;
  public readonly payment_reminder_enabled?: boolean | null;
  public readonly payment_reference?: string | null;
  public readonly is_credit_note?: boolean | null;
  public readonly is_estimate?: boolean | null;
  public readonly is_destroyable?: boolean | null;
  public readonly can_be_stamped_as_paid_in_pdf?: boolean | null;
  public readonly custom_payment_reference?: string | null;
  public readonly scored_transactions?: null[] | null;
  public readonly is_sendable?: boolean | null;
  public readonly incomplete?: boolean | null;
  public readonly subcomplete?: boolean | null;
  public readonly attachment_label?: string | null;
  public readonly accounting_status?: string | null;
  public readonly thirdparty?: Thirdparty | null;
  public readonly recipients?: null[] | null;
  public readonly invoice_lines?: InvoiceLinesEntity[] | null;
  public readonly invoice_kind?: string | null;
  public readonly file_signed_id?: string | null;
  public readonly pages_count?: number | null;
  public readonly tagged_at_ledger_events_level?: boolean | null;
  public readonly pdf_invoice_title?: string | null;
  public readonly pdf_invoice_free_text?: string | null;
  public readonly pdf_invoice_free_text_enabled?: boolean | null;
  public readonly pdf_invoice_subject?: string | null;
  public readonly pdf_invoice_subject_enabled?: boolean | null;
  public readonly pdf_invoice_display_products_list?: boolean | null;
  public readonly pdf_paid_stamp?: boolean | null;
  public readonly invoicing_detailed_source?: null;
  public readonly manual_partial_invoices?: boolean | null;
  public readonly establishment_comment?: EstablishmentComment | null;
  public static Parse(d: string): GroupedDocumentsEntity {
    return GroupedDocumentsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): GroupedDocumentsEntity {
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
    checkNumber(d.company_id, false, field + ".company_id");
    checkString(d.date, true, field + ".date");
    checkString(d.created_at, false, field + ".created_at");
    checkString(d.updated_at, false, field + ".updated_at");
    checkString(d.archived_at, true, field + ".archived_at");
    checkString(d.type, false, field + ".type");
    checkString(d.source, false, field + ".source");
    checkBoolean(d.draft, false, field + ".draft");
    checkString(d.group_uuid, false, field + ".group_uuid");
    checkString(d.gdrive_path, true, field + ".gdrive_path");
    checkString(d.preview_status, true, field + ".preview_status");
    checkString(d.pusher_channel, false, field + ".pusher_channel");
    checkNull(d.email_from, field + ".email_from");
    checkNull(d.score, field + ".score");
    checkBoolean(d.is_waiting_details, false, field + ".is_waiting_details");
    checkString(d.external_id, false, field + ".external_id");
    checkNumber(d.journal_id, false, field + ".journal_id");
    checkString(d.grouped_at, true, field + ".grouped_at");
    checkBoolean(d.attachment_required, false, field + ".attachment_required");
    checkBoolean(d.attachment_lost, false, field + ".attachment_lost");
    checkString(d.pdf_generation_status, false, field + ".pdf_generation_status");
    checkNull(d.reversal_origin_id, field + ".reversal_origin_id");
    checkNull(d.billing_subscription_id, field + ".billing_subscription_id");
    checkString(d.fec_pieceref, false, field + ".fec_pieceref");
    checkString(d.label, false, field + ".label");
    d.journal = Journal.Create(d.journal, field + ".journal");
    checkString(d.url, false, field + ".url");
    checkString(d.method, false, field + ".method");
    checkBoolean(d.accounting_type, false, field + ".accounting_type");
    checkArray(d.preview_urls, field + ".preview_urls");
    if (d.preview_urls) {
      for (let i = 0; i < d.preview_urls.length; i++) {
        checkString(d.preview_urls[i], true, field + ".preview_urls" + "[" + i + "]");
      }
    }
    checkBoolean(d.archived, false, field + ".archived");
    checkBoolean(d.quotes, false, field + ".quotes");
    checkString(d.filename, true, field + ".filename");
    checkBoolean(d.has_file, false, field + ".has_file");
    checkBoolean(d.readonly, false, field + ".readonly");
    checkNumber(d.account_id, true, field + ".account_id");
    checkNumber(d.thirdparty_id, true, field + ".thirdparty_id");
    checkNull(d.payment_id, field + ".payment_id");
    checkString(d.amount, false, field + ".amount");
    checkString(d.currency, false, field + ".currency");
    checkString(d.currency_amount, false, field + ".currency_amount");
    checkString(d.outstanding_balance, false, field + ".outstanding_balance");
    checkNumber(d.completeness, false, field + ".completeness");
    checkString(d.gross_amount, true, field + ".gross_amount");
    checkString(d.status, true, field + ".status");
    checkBoolean(d.complete, false, field + ".complete");
    d.account = Account.Create(d.account, field + ".account");
    d.company = Company1.Create(d.company, field + ".company");
    d.scored_invoices = ScoredInvoices1.Create(d.scored_invoices, field + ".scored_invoices");
    checkNull(d.is_accounting_needed, field + ".is_accounting_needed");
    checkBoolean(d.pending, false, field + ".pending");
    checkBoolean(d.hasTooManyLedgerEvents, false, field + ".hasTooManyLedgerEvents");
    checkNumber(d.ledgerEventsCount, false, field + ".ledgerEventsCount");
    checkArray(d.ledgerEvents, field + ".ledgerEvents");
    if (d.ledgerEvents) {
      for (let i = 0; i < d.ledgerEvents.length; i++) {
        d.ledgerEvents[i] = LedgerEventsEntity.Create(d.ledgerEvents[i], field + ".ledgerEvents" + "[" + i + "]");
      }
    }
    checkBoolean(d.reconciled, false, field + ".reconciled");
    checkArray(d.client_comments, field + ".client_comments");
    if (d.client_comments) {
      for (let i = 0; i < d.client_comments.length; i++) {
        d.client_comments[i] = ClientCommentsEntityOrEstablishmentComment.Create(d.client_comments[i], field + ".client_comments" + "[" + i + "]");
      }
    }
    checkBoolean(d.is_waiting_for_ocr, true, field + ".is_waiting_for_ocr");
    checkBoolean(d.has_linked_quotes, true, field + ".has_linked_quotes");
    checkString(d.size, true, field + ".size");
    checkBoolean(d.embeddable_in_browser, true, field + ".embeddable_in_browser");
    checkNumber(d.ocr_thirdparty_id, true, field + ".ocr_thirdparty_id");
    checkString(d.direction, true, field + ".direction");
    checkString(d.deadline, true, field + ".deadline");
    checkNumber(d.multiplier, true, field + ".multiplier");
    checkString(d.price_before_tax, true, field + ".price_before_tax");
    checkNull(d.quote_uid, field + ".quote_uid");
    checkNull(d.special_mention, field + ".special_mention");
    checkBoolean(d.not_duplicate, true, field + ".not_duplicate");
    checkBoolean(d.validation_needed, true, field + ".validation_needed");
    checkString(d.currency_tax, true, field + ".currency_tax");
    checkString(d.currency_price_before_tax, true, field + ".currency_price_before_tax");
    checkString(d.language, true, field + ".language");
    checkString(d.payment_status, true, field + ".payment_status");
    checkNull(d.payment_method, field + ".payment_method");
    checkString(d.invoice_number, true, field + ".invoice_number");
    checkString(d.tax, true, field + ".tax");
    checkNull(d.estimate_status, field + ".estimate_status");
    checkString(d.iban, true, field + ".iban");
    checkBoolean(d.paid, true, field + ".paid");
    checkNumber(d.future_in_days, true, field + ".future_in_days");
    checkString(d.discount, true, field + ".discount");
    checkString(d.discount_type, true, field + ".discount_type");
    checkNull(d.finalized_at, field + ".finalized_at");
    checkString(d.quote_group_uuid, true, field + ".quote_group_uuid");
    checkString(d.factor_status, true, field + ".factor_status");
    checkString(d.currency_amount_before_tax, true, field + ".currency_amount_before_tax");
    checkNull(d.from_estimate_id, field + ".from_estimate_id");
    checkString(d.credit_notes_amount, true, field + ".credit_notes_amount");
    checkBoolean(d.payment_reminder_enabled, true, field + ".payment_reminder_enabled");
    checkString(d.payment_reference, true, field + ".payment_reference");
    checkBoolean(d.is_credit_note, true, field + ".is_credit_note");
    checkBoolean(d.is_estimate, true, field + ".is_estimate");
    checkBoolean(d.is_destroyable, true, field + ".is_destroyable");
    checkBoolean(d.can_be_stamped_as_paid_in_pdf, true, field + ".can_be_stamped_as_paid_in_pdf");
    checkString(d.custom_payment_reference, true, field + ".custom_payment_reference");
    checkArray(d.scored_transactions, field + ".scored_transactions");
    if (d.scored_transactions) {
      for (let i = 0; i < d.scored_transactions.length; i++) {
        checkNull(d.scored_transactions[i], field + ".scored_transactions" + "[" + i + "]");
      }
    }
    checkBoolean(d.is_sendable, true, field + ".is_sendable");
    checkBoolean(d.incomplete, true, field + ".incomplete");
    checkBoolean(d.subcomplete, true, field + ".subcomplete");
    checkString(d.attachment_label, true, field + ".attachment_label");
    checkString(d.accounting_status, true, field + ".accounting_status");
    d.thirdparty = Thirdparty.Create(d.thirdparty, field + ".thirdparty");
    checkArray(d.recipients, field + ".recipients");
    if (d.recipients) {
      for (let i = 0; i < d.recipients.length; i++) {
        checkNull(d.recipients[i], field + ".recipients" + "[" + i + "]");
      }
    }
    checkArray(d.invoice_lines, field + ".invoice_lines");
    if (d.invoice_lines) {
      for (let i = 0; i < d.invoice_lines.length; i++) {
        d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + ".invoice_lines" + "[" + i + "]");
      }
    }
    checkString(d.invoice_kind, true, field + ".invoice_kind");
    checkString(d.file_signed_id, true, field + ".file_signed_id");
    checkNumber(d.pages_count, true, field + ".pages_count");
    checkBoolean(d.tagged_at_ledger_events_level, true, field + ".tagged_at_ledger_events_level");
    checkString(d.pdf_invoice_title, true, field + ".pdf_invoice_title");
    checkString(d.pdf_invoice_free_text, true, field + ".pdf_invoice_free_text");
    checkBoolean(d.pdf_invoice_free_text_enabled, true, field + ".pdf_invoice_free_text_enabled");
    checkString(d.pdf_invoice_subject, true, field + ".pdf_invoice_subject");
    checkBoolean(d.pdf_invoice_subject_enabled, true, field + ".pdf_invoice_subject_enabled");
    checkBoolean(d.pdf_invoice_display_products_list, true, field + ".pdf_invoice_display_products_list");
    checkBoolean(d.pdf_paid_stamp, true, field + ".pdf_paid_stamp");
    checkNull(d.invoicing_detailed_source, field + ".invoicing_detailed_source");
    checkBoolean(d.manual_partial_invoices, true, field + ".manual_partial_invoices");
    d.establishment_comment = EstablishmentComment.Create(d.establishment_comment, field + ".establishment_comment");
    const knownProperties = ["id","company_id","date","created_at","updated_at","archived_at","type","source","draft","group_uuid","gdrive_path","preview_status","pusher_channel","email_from","score","is_waiting_details","external_id","journal_id","grouped_at","attachment_required","attachment_lost","pdf_generation_status","reversal_origin_id","billing_subscription_id","fec_pieceref","label","journal","url","method","accounting_type","preview_urls","archived","quotes","filename","has_file","readonly","account_id","thirdparty_id","payment_id","amount","currency","currency_amount","outstanding_balance","completeness","gross_amount","status","complete","account","company","scored_invoices","is_accounting_needed","pending","hasTooManyLedgerEvents","ledgerEventsCount","ledgerEvents","reconciled","client_comments","is_waiting_for_ocr","has_linked_quotes","size","embeddable_in_browser","ocr_thirdparty_id","direction","deadline","multiplier","price_before_tax","quote_uid","special_mention","not_duplicate","validation_needed","currency_tax","currency_price_before_tax","language","payment_status","payment_method","invoice_number","tax","estimate_status","iban","paid","future_in_days","discount","discount_type","finalized_at","quote_group_uuid","factor_status","currency_amount_before_tax","from_estimate_id","credit_notes_amount","payment_reminder_enabled","payment_reference","is_credit_note","is_estimate","is_destroyable","can_be_stamped_as_paid_in_pdf","custom_payment_reference","scored_transactions","is_sendable","incomplete","subcomplete","attachment_label","accounting_status","thirdparty","recipients","invoice_lines","invoice_kind","file_signed_id","pages_count","tagged_at_ledger_events_level","pdf_invoice_title","pdf_invoice_free_text","pdf_invoice_free_text_enabled","pdf_invoice_subject","pdf_invoice_subject_enabled","pdf_invoice_display_products_list","pdf_paid_stamp","invoicing_detailed_source","manual_partial_invoices","establishment_comment"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new GroupedDocumentsEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.company_id = d.company_id;
    if ("date" in d) this.date = d.date;
    this.created_at = d.created_at;
    this.updated_at = d.updated_at;
    if ("archived_at" in d) this.archived_at = d.archived_at;
    this.type = d.type;
    this.source = d.source;
    this.draft = d.draft;
    this.group_uuid = d.group_uuid;
    if ("gdrive_path" in d) this.gdrive_path = d.gdrive_path;
    if ("preview_status" in d) this.preview_status = d.preview_status;
    this.pusher_channel = d.pusher_channel;
    if ("email_from" in d) this.email_from = d.email_from;
    if ("score" in d) this.score = d.score;
    this.is_waiting_details = d.is_waiting_details;
    this.external_id = d.external_id;
    this.journal_id = d.journal_id;
    if ("grouped_at" in d) this.grouped_at = d.grouped_at;
    this.attachment_required = d.attachment_required;
    this.attachment_lost = d.attachment_lost;
    this.pdf_generation_status = d.pdf_generation_status;
    if ("reversal_origin_id" in d) this.reversal_origin_id = d.reversal_origin_id;
    if ("billing_subscription_id" in d) this.billing_subscription_id = d.billing_subscription_id;
    this.fec_pieceref = d.fec_pieceref;
    this.label = d.label;
    this.journal = d.journal;
    this.url = d.url;
    this.method = d.method;
    this.accounting_type = d.accounting_type;
    if ("preview_urls" in d) this.preview_urls = d.preview_urls;
    this.archived = d.archived;
    this.quotes = d.quotes;
    if ("filename" in d) this.filename = d.filename;
    this.has_file = d.has_file;
    this.readonly = d.readonly;
    if ("account_id" in d) this.account_id = d.account_id;
    if ("thirdparty_id" in d) this.thirdparty_id = d.thirdparty_id;
    if ("payment_id" in d) this.payment_id = d.payment_id;
    this.amount = d.amount;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.outstanding_balance = d.outstanding_balance;
    this.completeness = d.completeness;
    if ("gross_amount" in d) this.gross_amount = d.gross_amount;
    if ("status" in d) this.status = d.status;
    this.complete = d.complete;
    if ("account" in d) this.account = d.account;
    if ("company" in d) this.company = d.company;
    if ("scored_invoices" in d) this.scored_invoices = d.scored_invoices;
    if ("is_accounting_needed" in d) this.is_accounting_needed = d.is_accounting_needed;
    this.pending = d.pending;
    this.hasTooManyLedgerEvents = d.hasTooManyLedgerEvents;
    this.ledgerEventsCount = d.ledgerEventsCount;
    if ("ledgerEvents" in d) this.ledgerEvents = d.ledgerEvents;
    this.reconciled = d.reconciled;
    if ("client_comments" in d) this.client_comments = d.client_comments;
    if ("is_waiting_for_ocr" in d) this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    if ("has_linked_quotes" in d) this.has_linked_quotes = d.has_linked_quotes;
    if ("size" in d) this.size = d.size;
    if ("embeddable_in_browser" in d) this.embeddable_in_browser = d.embeddable_in_browser;
    if ("ocr_thirdparty_id" in d) this.ocr_thirdparty_id = d.ocr_thirdparty_id;
    if ("direction" in d) this.direction = d.direction;
    if ("deadline" in d) this.deadline = d.deadline;
    if ("multiplier" in d) this.multiplier = d.multiplier;
    if ("price_before_tax" in d) this.price_before_tax = d.price_before_tax;
    if ("quote_uid" in d) this.quote_uid = d.quote_uid;
    if ("special_mention" in d) this.special_mention = d.special_mention;
    if ("not_duplicate" in d) this.not_duplicate = d.not_duplicate;
    if ("validation_needed" in d) this.validation_needed = d.validation_needed;
    if ("currency_tax" in d) this.currency_tax = d.currency_tax;
    if ("currency_price_before_tax" in d) this.currency_price_before_tax = d.currency_price_before_tax;
    if ("language" in d) this.language = d.language;
    if ("payment_status" in d) this.payment_status = d.payment_status;
    if ("payment_method" in d) this.payment_method = d.payment_method;
    if ("invoice_number" in d) this.invoice_number = d.invoice_number;
    if ("tax" in d) this.tax = d.tax;
    if ("estimate_status" in d) this.estimate_status = d.estimate_status;
    if ("iban" in d) this.iban = d.iban;
    if ("paid" in d) this.paid = d.paid;
    if ("future_in_days" in d) this.future_in_days = d.future_in_days;
    if ("discount" in d) this.discount = d.discount;
    if ("discount_type" in d) this.discount_type = d.discount_type;
    if ("finalized_at" in d) this.finalized_at = d.finalized_at;
    if ("quote_group_uuid" in d) this.quote_group_uuid = d.quote_group_uuid;
    if ("factor_status" in d) this.factor_status = d.factor_status;
    if ("currency_amount_before_tax" in d) this.currency_amount_before_tax = d.currency_amount_before_tax;
    if ("from_estimate_id" in d) this.from_estimate_id = d.from_estimate_id;
    if ("credit_notes_amount" in d) this.credit_notes_amount = d.credit_notes_amount;
    if ("payment_reminder_enabled" in d) this.payment_reminder_enabled = d.payment_reminder_enabled;
    if ("payment_reference" in d) this.payment_reference = d.payment_reference;
    if ("is_credit_note" in d) this.is_credit_note = d.is_credit_note;
    if ("is_estimate" in d) this.is_estimate = d.is_estimate;
    if ("is_destroyable" in d) this.is_destroyable = d.is_destroyable;
    if ("can_be_stamped_as_paid_in_pdf" in d) this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;
    if ("custom_payment_reference" in d) this.custom_payment_reference = d.custom_payment_reference;
    if ("scored_transactions" in d) this.scored_transactions = d.scored_transactions;
    if ("is_sendable" in d) this.is_sendable = d.is_sendable;
    if ("incomplete" in d) this.incomplete = d.incomplete;
    if ("subcomplete" in d) this.subcomplete = d.subcomplete;
    if ("attachment_label" in d) this.attachment_label = d.attachment_label;
    if ("accounting_status" in d) this.accounting_status = d.accounting_status;
    if ("thirdparty" in d) this.thirdparty = d.thirdparty;
    if ("recipients" in d) this.recipients = d.recipients;
    if ("invoice_lines" in d) this.invoice_lines = d.invoice_lines;
    if ("invoice_kind" in d) this.invoice_kind = d.invoice_kind;
    if ("file_signed_id" in d) this.file_signed_id = d.file_signed_id;
    if ("pages_count" in d) this.pages_count = d.pages_count;
    if ("tagged_at_ledger_events_level" in d) this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;
    if ("pdf_invoice_title" in d) this.pdf_invoice_title = d.pdf_invoice_title;
    if ("pdf_invoice_free_text" in d) this.pdf_invoice_free_text = d.pdf_invoice_free_text;
    if ("pdf_invoice_free_text_enabled" in d) this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;
    if ("pdf_invoice_subject" in d) this.pdf_invoice_subject = d.pdf_invoice_subject;
    if ("pdf_invoice_subject_enabled" in d) this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;
    if ("pdf_invoice_display_products_list" in d) this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;
    if ("pdf_paid_stamp" in d) this.pdf_paid_stamp = d.pdf_paid_stamp;
    if ("invoicing_detailed_source" in d) this.invoicing_detailed_source = d.invoicing_detailed_source;
    if ("manual_partial_invoices" in d) this.manual_partial_invoices = d.manual_partial_invoices;
    if ("establishment_comment" in d) this.establishment_comment = d.establishment_comment;
  }
}

export class Journal {
  public readonly id: number;
  public readonly code: string;
  public readonly label: string;
  public static Parse(d: string): Journal {
    return Journal.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Journal {
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
    checkString(d.code, false, field + ".code");
    checkString(d.label, false, field + ".label");
    const knownProperties = ["id","code","label"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Journal(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.code = d.code;
    this.label = d.label;
  }
}

export class Account {
  public readonly id: number;
  public readonly company_id: number;
  public readonly name: string;
  public readonly visible: boolean;
  public readonly synchronized: boolean;
  public readonly currency: string;
  public readonly balance: string;
  public readonly currency_balance: string;
  public readonly last_sync_http_code: number;
  public readonly last_sync_error?: null;
  public readonly last_sync_at: string;
  public readonly sync_customers: boolean;
  public readonly sync_since?: null;
  public readonly last_successful_sync_at: string;
  public readonly updated_at: string;
  public readonly ledger_events_count?: null;
  public readonly ledger_events_min_date?: null;
  public readonly ledger_events_max_date?: null;
  public readonly transactions_count?: null;
  public readonly sync_attachments: boolean;
  public readonly establishment_id: number;
  public readonly pusher_channel: string;
  public readonly connection: string;
  public readonly iban?: string | null;
  public readonly bic: string;
  public readonly use_as_default_for_vat_return: boolean;
  public readonly method: string;
  public readonly url: string;
  public readonly swan: boolean;
  public readonly swan_number?: null;
  public readonly establishment: Establishment;
  public readonly label: string;
  public readonly merge_url: string;
  public static Parse(d: string): Account | null {
    return Account.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Account | null {
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
    checkNumber(d.company_id, false, field + ".company_id");
    checkString(d.name, false, field + ".name");
    checkBoolean(d.visible, false, field + ".visible");
    checkBoolean(d.synchronized, false, field + ".synchronized");
    checkString(d.currency, false, field + ".currency");
    checkString(d.balance, false, field + ".balance");
    checkString(d.currency_balance, false, field + ".currency_balance");
    checkNumber(d.last_sync_http_code, false, field + ".last_sync_http_code");
    checkNull(d.last_sync_error, field + ".last_sync_error");
    checkString(d.last_sync_at, false, field + ".last_sync_at");
    checkBoolean(d.sync_customers, false, field + ".sync_customers");
    checkNull(d.sync_since, field + ".sync_since");
    checkString(d.last_successful_sync_at, false, field + ".last_successful_sync_at");
    checkString(d.updated_at, false, field + ".updated_at");
    checkNull(d.ledger_events_count, field + ".ledger_events_count");
    checkNull(d.ledger_events_min_date, field + ".ledger_events_min_date");
    checkNull(d.ledger_events_max_date, field + ".ledger_events_max_date");
    checkNull(d.transactions_count, field + ".transactions_count");
    checkBoolean(d.sync_attachments, false, field + ".sync_attachments");
    checkNumber(d.establishment_id, false, field + ".establishment_id");
    checkString(d.pusher_channel, false, field + ".pusher_channel");
    checkString(d.connection, false, field + ".connection");
    checkString(d.iban, true, field + ".iban");
    checkString(d.bic, false, field + ".bic");
    checkBoolean(d.use_as_default_for_vat_return, false, field + ".use_as_default_for_vat_return");
    checkString(d.method, false, field + ".method");
    checkString(d.url, false, field + ".url");
    checkBoolean(d.swan, false, field + ".swan");
    checkNull(d.swan_number, field + ".swan_number");
    d.establishment = Establishment.Create(d.establishment, field + ".establishment");
    checkString(d.label, false, field + ".label");
    checkString(d.merge_url, false, field + ".merge_url");
    const knownProperties = ["id","company_id","name","visible","synchronized","currency","balance","currency_balance","last_sync_http_code","last_sync_error","last_sync_at","sync_customers","sync_since","last_successful_sync_at","updated_at","ledger_events_count","ledger_events_min_date","ledger_events_max_date","transactions_count","sync_attachments","establishment_id","pusher_channel","connection","iban","bic","use_as_default_for_vat_return","method","url","swan","swan_number","establishment","label","merge_url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Account(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.company_id = d.company_id;
    this.name = d.name;
    this.visible = d.visible;
    this.synchronized = d.synchronized;
    this.currency = d.currency;
    this.balance = d.balance;
    this.currency_balance = d.currency_balance;
    this.last_sync_http_code = d.last_sync_http_code;
    if ("last_sync_error" in d) this.last_sync_error = d.last_sync_error;
    this.last_sync_at = d.last_sync_at;
    this.sync_customers = d.sync_customers;
    if ("sync_since" in d) this.sync_since = d.sync_since;
    this.last_successful_sync_at = d.last_successful_sync_at;
    this.updated_at = d.updated_at;
    if ("ledger_events_count" in d) this.ledger_events_count = d.ledger_events_count;
    if ("ledger_events_min_date" in d) this.ledger_events_min_date = d.ledger_events_min_date;
    if ("ledger_events_max_date" in d) this.ledger_events_max_date = d.ledger_events_max_date;
    if ("transactions_count" in d) this.transactions_count = d.transactions_count;
    this.sync_attachments = d.sync_attachments;
    this.establishment_id = d.establishment_id;
    this.pusher_channel = d.pusher_channel;
    this.connection = d.connection;
    if ("iban" in d) this.iban = d.iban;
    this.bic = d.bic;
    this.use_as_default_for_vat_return = d.use_as_default_for_vat_return;
    this.method = d.method;
    this.url = d.url;
    this.swan = d.swan;
    if ("swan_number" in d) this.swan_number = d.swan_number;
    this.establishment = d.establishment;
    this.label = d.label;
    this.merge_url = d.merge_url;
  }
}

export class Establishment {
  public readonly id: number;
  public readonly name: string;
  public readonly accounts_count: number;
  public readonly budgetinsight_id?: null;
  public readonly bridge_ids?: (number | null)[] | null;
  public readonly logo_url: string;
  public readonly method: string;
  public readonly crm_url: string;
  public static Parse(d: string): Establishment {
    return Establishment.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Establishment {
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
    checkString(d.name, false, field + ".name");
    checkNumber(d.accounts_count, false, field + ".accounts_count");
    checkNull(d.budgetinsight_id, field + ".budgetinsight_id");
    checkArray(d.bridge_ids, field + ".bridge_ids");
    if (d.bridge_ids) {
      for (let i = 0; i < d.bridge_ids.length; i++) {
        checkNumber(d.bridge_ids[i], true, field + ".bridge_ids" + "[" + i + "]");
      }
    }
    checkString(d.logo_url, false, field + ".logo_url");
    checkString(d.method, false, field + ".method");
    checkString(d.crm_url, false, field + ".crm_url");
    const knownProperties = ["id","name","accounts_count","budgetinsight_id","bridge_ids","logo_url","method","crm_url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Establishment(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.name = d.name;
    this.accounts_count = d.accounts_count;
    if ("budgetinsight_id" in d) this.budgetinsight_id = d.budgetinsight_id;
    if ("bridge_ids" in d) this.bridge_ids = d.bridge_ids;
    this.logo_url = d.logo_url;
    this.method = d.method;
    this.crm_url = d.crm_url;
  }
}

export class Company1 {
  public readonly name: string;
  public static Parse(d: string): Company1 | null {
    return Company1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Company1 | null {
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
    checkString(d.name, false, field + ".name");
    const knownProperties = ["name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Company1(d);
  }
  private constructor(d: any) {
    this.name = d.name;
  }
}

export class ScoredInvoices1 {
  public static Parse(d: string): ScoredInvoices1 | null {
    return ScoredInvoices1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): ScoredInvoices1 | null {
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
    const knownProperties = [];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new ScoredInvoices1(d);
  }
  private constructor(d: any) {
  }
}

export class LedgerEventsEntity {
  public readonly id: number;
  public readonly company_id: number;
  public readonly plan_item_id: number;
  public readonly document_id: number;
  public readonly created_at: string;
  public readonly reconciliation_id?: number | null;
  public readonly source: string;
  public readonly lettering_id?: number | null;
  public readonly reallocation_id?: number | null;
  public readonly debit: string;
  public readonly credit: string;
  public readonly balance: string;
  public readonly date: string;
  public readonly planItem: PlanItemOrPnlPlanItem;
  public readonly readonly: boolean;
  public readonly readonlyAmounts: boolean;
  public readonly label?: string | null;
  public readonly lettering?: Lettering | null;
  public readonly reallocation?: Reallocation | null;
  public static Parse(d: string): LedgerEventsEntity | null {
    return LedgerEventsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): LedgerEventsEntity | null {
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
    checkNumber(d.company_id, false, field + ".company_id");
    checkNumber(d.plan_item_id, false, field + ".plan_item_id");
    checkNumber(d.document_id, false, field + ".document_id");
    checkString(d.created_at, false, field + ".created_at");
    checkNumber(d.reconciliation_id, true, field + ".reconciliation_id");
    checkString(d.source, false, field + ".source");
    checkNumber(d.lettering_id, true, field + ".lettering_id");
    checkNumber(d.reallocation_id, true, field + ".reallocation_id");
    checkString(d.debit, false, field + ".debit");
    checkString(d.credit, false, field + ".credit");
    checkString(d.balance, false, field + ".balance");
    checkString(d.date, false, field + ".date");
    d.planItem = PlanItemOrPnlPlanItem.Create(d.planItem, field + ".planItem");
    checkBoolean(d.readonly, false, field + ".readonly");
    checkBoolean(d.readonlyAmounts, false, field + ".readonlyAmounts");
    checkString(d.label, true, field + ".label");
    d.lettering = Lettering.Create(d.lettering, field + ".lettering");
    d.reallocation = Reallocation.Create(d.reallocation, field + ".reallocation");
    const knownProperties = ["id","company_id","plan_item_id","document_id","created_at","reconciliation_id","source","lettering_id","reallocation_id","debit","credit","balance","date","planItem","readonly","readonlyAmounts","label","lettering","reallocation"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new LedgerEventsEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.company_id = d.company_id;
    this.plan_item_id = d.plan_item_id;
    this.document_id = d.document_id;
    this.created_at = d.created_at;
    if ("reconciliation_id" in d) this.reconciliation_id = d.reconciliation_id;
    this.source = d.source;
    if ("lettering_id" in d) this.lettering_id = d.lettering_id;
    if ("reallocation_id" in d) this.reallocation_id = d.reallocation_id;
    this.debit = d.debit;
    this.credit = d.credit;
    this.balance = d.balance;
    this.date = d.date;
    this.planItem = d.planItem;
    this.readonly = d.readonly;
    this.readonlyAmounts = d.readonlyAmounts;
    if ("label" in d) this.label = d.label;
    if ("lettering" in d) this.lettering = d.lettering;
    if ("reallocation" in d) this.reallocation = d.reallocation;
  }
}

export class PlanItemOrPnlPlanItem {
  public readonly id: number;
  public readonly number: string;
  public readonly internal_identifier?: string | null;
  public readonly label: string;
  public readonly company_id: number;
  public readonly enabled: boolean;
  public readonly vat_rate: string;
  public readonly "country_alpha2": string;
  public readonly label_is_editable: boolean;
  public static Parse(d: string): PlanItemOrPnlPlanItem {
    return PlanItemOrPnlPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): PlanItemOrPnlPlanItem {
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
    checkString(d.internal_identifier, true, field + ".internal_identifier");
    checkString(d.label, false, field + ".label");
    checkNumber(d.company_id, false, field + ".company_id");
    checkBoolean(d.enabled, false, field + ".enabled");
    checkString(d.vat_rate, false, field + ".vat_rate");
    checkString(d["country_alpha2"], false, field + ".country_alpha2");
    checkBoolean(d.label_is_editable, false, field + ".label_is_editable");
    const knownProperties = ["id","number","internal_identifier","label","company_id","enabled","vat_rate","country_alpha2","label_is_editable"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new PlanItemOrPnlPlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
    if ("internal_identifier" in d) this.internal_identifier = d.internal_identifier;
    this.label = d.label;
    this.company_id = d.company_id;
    this.enabled = d.enabled;
    this.vat_rate = d.vat_rate;
    this["country_alpha2"] = d["country_alpha2"];
    this.label_is_editable = d.label_is_editable;
  }
}

export class Lettering {
  public readonly id: number;
  public readonly balance: string;
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
    checkString(d.plan_item_number, false, field + ".plan_item_number");
    const knownProperties = ["id","balance","plan_item_number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Lettering(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.balance = d.balance;
    this.plan_item_number = d.plan_item_number;
  }
}

export class Reallocation {
  public readonly id: number;
  public readonly created_at: string;
  public readonly fromPlanItem: PlanItemOrPnlPlanItemOrFromPlanItem;
  public static Parse(d: string): Reallocation | null {
    return Reallocation.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Reallocation | null {
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
    checkString(d.created_at, false, field + ".created_at");
    d.fromPlanItem = PlanItemOrPnlPlanItemOrFromPlanItem.Create(d.fromPlanItem, field + ".fromPlanItem");
    const knownProperties = ["id","created_at","fromPlanItem"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Reallocation(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.created_at = d.created_at;
    this.fromPlanItem = d.fromPlanItem;
  }
}

export class PlanItemOrPnlPlanItemOrFromPlanItem {
  public readonly id: number;
  public readonly number: string;
  public readonly internal_identifier?: null;
  public readonly label: string;
  public readonly company_id: number;
  public readonly enabled: boolean;
  public readonly vat_rate: string;
  public readonly "country_alpha2": string;
  public readonly label_is_editable: boolean;
  public static Parse(d: string): PlanItemOrPnlPlanItemOrFromPlanItem {
    return PlanItemOrPnlPlanItemOrFromPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): PlanItemOrPnlPlanItemOrFromPlanItem {
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
    checkNull(d.internal_identifier, field + ".internal_identifier");
    checkString(d.label, false, field + ".label");
    checkNumber(d.company_id, false, field + ".company_id");
    checkBoolean(d.enabled, false, field + ".enabled");
    checkString(d.vat_rate, false, field + ".vat_rate");
    checkString(d["country_alpha2"], false, field + ".country_alpha2");
    checkBoolean(d.label_is_editable, false, field + ".label_is_editable");
    const knownProperties = ["id","number","internal_identifier","label","company_id","enabled","vat_rate","country_alpha2","label_is_editable"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new PlanItemOrPnlPlanItemOrFromPlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
    if ("internal_identifier" in d) this.internal_identifier = d.internal_identifier;
    this.label = d.label;
    this.company_id = d.company_id;
    this.enabled = d.enabled;
    this.vat_rate = d.vat_rate;
    this["country_alpha2"] = d["country_alpha2"];
    this.label_is_editable = d.label_is_editable;
  }
}

export class ClientCommentsEntityOrEstablishmentComment {
  public readonly id: number;
  public readonly name: string;
  public readonly content: string;
  public readonly created_at: string;
  public readonly seen: boolean;
  public readonly record_type: string;
  public readonly record_id: number;
  public readonly updated_at: string;
  public readonly user_id: number;
  public readonly rich_content?: null;
  public readonly user: User;
  public static Parse(d: string): ClientCommentsEntityOrEstablishmentComment | null {
    return ClientCommentsEntityOrEstablishmentComment.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): ClientCommentsEntityOrEstablishmentComment | null {
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
    checkString(d.content, false, field + ".content");
    checkString(d.created_at, false, field + ".created_at");
    checkBoolean(d.seen, false, field + ".seen");
    checkString(d.record_type, false, field + ".record_type");
    checkNumber(d.record_id, false, field + ".record_id");
    checkString(d.updated_at, false, field + ".updated_at");
    checkNumber(d.user_id, false, field + ".user_id");
    checkNull(d.rich_content, field + ".rich_content");
    d.user = User.Create(d.user, field + ".user");
    const knownProperties = ["id","name","content","created_at","seen","record_type","record_id","updated_at","user_id","rich_content","user"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new ClientCommentsEntityOrEstablishmentComment(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.name = d.name;
    this.content = d.content;
    this.created_at = d.created_at;
    this.seen = d.seen;
    this.record_type = d.record_type;
    this.record_id = d.record_id;
    this.updated_at = d.updated_at;
    this.user_id = d.user_id;
    if ("rich_content" in d) this.rich_content = d.rich_content;
    this.user = d.user;
  }
}

export class User {
  public readonly id: number;
  public readonly first_name: string;
  public readonly last_name: string;
  public readonly full_name: string;
  public readonly profile_picture_url?: null;
  public static Parse(d: string): User {
    return User.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): User {
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
    checkString(d.first_name, false, field + ".first_name");
    checkString(d.last_name, false, field + ".last_name");
    checkString(d.full_name, false, field + ".full_name");
    checkNull(d.profile_picture_url, field + ".profile_picture_url");
    const knownProperties = ["id","first_name","last_name","full_name","profile_picture_url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new User(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.first_name = d.first_name;
    this.last_name = d.last_name;
    this.full_name = d.full_name;
    if ("profile_picture_url" in d) this.profile_picture_url = d.profile_picture_url;
  }
}

export class Thirdparty {
  public readonly id: number;
  public readonly known_supplier_id?: number | null;
  public readonly company_id: number;
  public readonly name: string;
  public readonly role: string;
  public readonly address: string;
  public readonly postal_code: string;
  public readonly city: string;
  public readonly "country_alpha2": string;
  public readonly vat_number: string;
  public readonly search_terms?: string[] | null;
  public readonly emails?: null[] | null;
  public readonly reg_no: string;
  public readonly phone: string;
  public readonly first_name: string;
  public readonly recurrent: boolean;
  public readonly last_name: string;
  public readonly gender?: null;
  public readonly payment_conditions: string;
  public readonly customer_type: string;
  public readonly disable_pending_vat: boolean;
  public readonly force_pending_vat: boolean;
  public readonly gocardless_id?: null;
  public readonly invoices_auto_generated: boolean;
  public readonly invoices_auto_validated: boolean;
  public readonly billing_iban?: null;
  public readonly billing_bic?: null;
  public readonly billing_bank?: null;
  public readonly recipient: string;
  public readonly billing_language: string;
  public readonly iban: string;
  public readonly stripe_id?: null;
  public readonly invoice_dump_id?: null;
  public readonly delivery_address: string;
  public readonly delivery_postal_code: string;
  public readonly delivery_city: string;
  public readonly "delivery_country_alpha2": string;
  public readonly reference: string;
  public readonly legal_form_code: string;
  public readonly activity_nomenclature: string;
  public readonly activity_code: string;
  public readonly billing_footer_invoice_id?: null;
  public readonly plan_item_id: number;
  public readonly rule_enabled: boolean;
  public readonly supplier_payment_method?: null;
  public readonly supplier_payment_method_last_updated_at?: string | null;
  public readonly notes: string;
  public readonly admin_city_code?: null;
  public readonly establishment_no?: string | null;
  public readonly address_additional_info: string;
  public readonly delivery_address_additional_info: string;
  public readonly vat_rate?: string | null;
  public readonly pnl_plan_item_id?: number | null;
  public readonly source_id: string;
  public readonly country?: string | null;
  public readonly delivery_country?: null;
  public readonly complete: boolean;
  public readonly url: string;
  public readonly method: string;
  public readonly billing_footer_invoice_label?: null;
  public readonly display_name?: null;
  public readonly debits?: null;
  public readonly credits?: null;
  public readonly balance?: null;
  public readonly invoice_count?: null;
  public readonly purchase_request_count?: null;
  public readonly estimate_count?: null;
  public readonly turnover?: null;
  public readonly ledger_events_count?: null;
  public readonly plan_item?: null;
  public readonly pnl_plan_item?: null;
  public readonly current_mandate?: null;
  public readonly received_a_mandate_request: boolean;
  public readonly notes_comment?: null;
  public readonly plan_item_attributes?: null;
  public readonly tags?: null[] | null;
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
    checkNumber(d.known_supplier_id, true, field + ".known_supplier_id");
    checkNumber(d.company_id, false, field + ".company_id");
    checkString(d.name, false, field + ".name");
    checkString(d.role, false, field + ".role");
    checkString(d.address, false, field + ".address");
    checkString(d.postal_code, false, field + ".postal_code");
    checkString(d.city, false, field + ".city");
    checkString(d["country_alpha2"], false, field + ".country_alpha2");
    checkString(d.vat_number, false, field + ".vat_number");
    checkArray(d.search_terms, field + ".search_terms");
    if (d.search_terms) {
      for (let i = 0; i < d.search_terms.length; i++) {
        checkString(d.search_terms[i], false, field + ".search_terms" + "[" + i + "]");
      }
    }
    checkArray(d.emails, field + ".emails");
    if (d.emails) {
      for (let i = 0; i < d.emails.length; i++) {
        checkNull(d.emails[i], field + ".emails" + "[" + i + "]");
      }
    }
    checkString(d.reg_no, false, field + ".reg_no");
    checkString(d.phone, false, field + ".phone");
    checkString(d.first_name, false, field + ".first_name");
    checkBoolean(d.recurrent, false, field + ".recurrent");
    checkString(d.last_name, false, field + ".last_name");
    checkNull(d.gender, field + ".gender");
    checkString(d.payment_conditions, false, field + ".payment_conditions");
    checkString(d.customer_type, false, field + ".customer_type");
    checkBoolean(d.disable_pending_vat, false, field + ".disable_pending_vat");
    checkBoolean(d.force_pending_vat, false, field + ".force_pending_vat");
    checkNull(d.gocardless_id, field + ".gocardless_id");
    checkBoolean(d.invoices_auto_generated, false, field + ".invoices_auto_generated");
    checkBoolean(d.invoices_auto_validated, false, field + ".invoices_auto_validated");
    checkNull(d.billing_iban, field + ".billing_iban");
    checkNull(d.billing_bic, field + ".billing_bic");
    checkNull(d.billing_bank, field + ".billing_bank");
    checkString(d.recipient, false, field + ".recipient");
    checkString(d.billing_language, false, field + ".billing_language");
    checkString(d.iban, false, field + ".iban");
    checkNull(d.stripe_id, field + ".stripe_id");
    checkNull(d.invoice_dump_id, field + ".invoice_dump_id");
    checkString(d.delivery_address, false, field + ".delivery_address");
    checkString(d.delivery_postal_code, false, field + ".delivery_postal_code");
    checkString(d.delivery_city, false, field + ".delivery_city");
    checkString(d["delivery_country_alpha2"], false, field + ".delivery_country_alpha2");
    checkString(d.reference, false, field + ".reference");
    checkString(d.legal_form_code, false, field + ".legal_form_code");
    checkString(d.activity_nomenclature, false, field + ".activity_nomenclature");
    checkString(d.activity_code, false, field + ".activity_code");
    checkNull(d.billing_footer_invoice_id, field + ".billing_footer_invoice_id");
    checkNumber(d.plan_item_id, false, field + ".plan_item_id");
    checkBoolean(d.rule_enabled, false, field + ".rule_enabled");
    checkNull(d.supplier_payment_method, field + ".supplier_payment_method");
    checkString(d.supplier_payment_method_last_updated_at, true, field + ".supplier_payment_method_last_updated_at");
    checkString(d.notes, false, field + ".notes");
    checkNull(d.admin_city_code, field + ".admin_city_code");
    checkString(d.establishment_no, true, field + ".establishment_no");
    checkString(d.address_additional_info, false, field + ".address_additional_info");
    checkString(d.delivery_address_additional_info, false, field + ".delivery_address_additional_info");
    checkString(d.vat_rate, true, field + ".vat_rate");
    checkNumber(d.pnl_plan_item_id, true, field + ".pnl_plan_item_id");
    checkString(d.source_id, false, field + ".source_id");
    checkString(d.country, true, field + ".country");
    checkNull(d.delivery_country, field + ".delivery_country");
    checkBoolean(d.complete, false, field + ".complete");
    checkString(d.url, false, field + ".url");
    checkString(d.method, false, field + ".method");
    checkNull(d.billing_footer_invoice_label, field + ".billing_footer_invoice_label");
    checkNull(d.display_name, field + ".display_name");
    checkNull(d.debits, field + ".debits");
    checkNull(d.credits, field + ".credits");
    checkNull(d.balance, field + ".balance");
    checkNull(d.invoice_count, field + ".invoice_count");
    checkNull(d.purchase_request_count, field + ".purchase_request_count");
    checkNull(d.estimate_count, field + ".estimate_count");
    checkNull(d.turnover, field + ".turnover");
    checkNull(d.ledger_events_count, field + ".ledger_events_count");
    checkNull(d.plan_item, field + ".plan_item");
    checkNull(d.pnl_plan_item, field + ".pnl_plan_item");
    checkNull(d.current_mandate, field + ".current_mandate");
    checkBoolean(d.received_a_mandate_request, false, field + ".received_a_mandate_request");
    checkNull(d.notes_comment, field + ".notes_comment");
    checkNull(d.plan_item_attributes, field + ".plan_item_attributes");
    checkArray(d.tags, field + ".tags");
    if (d.tags) {
      for (let i = 0; i < d.tags.length; i++) {
        checkNull(d.tags[i], field + ".tags" + "[" + i + "]");
      }
    }
    const knownProperties = ["id","known_supplier_id","company_id","name","role","address","postal_code","city","country_alpha2","vat_number","search_terms","emails","reg_no","phone","first_name","recurrent","last_name","gender","payment_conditions","customer_type","disable_pending_vat","force_pending_vat","gocardless_id","invoices_auto_generated","invoices_auto_validated","billing_iban","billing_bic","billing_bank","recipient","billing_language","iban","stripe_id","invoice_dump_id","delivery_address","delivery_postal_code","delivery_city","delivery_country_alpha2","reference","legal_form_code","activity_nomenclature","activity_code","billing_footer_invoice_id","plan_item_id","rule_enabled","supplier_payment_method","supplier_payment_method_last_updated_at","notes","admin_city_code","establishment_no","address_additional_info","delivery_address_additional_info","vat_rate","pnl_plan_item_id","source_id","country","delivery_country","complete","url","method","billing_footer_invoice_label","display_name","debits","credits","balance","invoice_count","purchase_request_count","estimate_count","turnover","ledger_events_count","plan_item","pnl_plan_item","current_mandate","received_a_mandate_request","notes_comment","plan_item_attributes","tags"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Thirdparty(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    if ("known_supplier_id" in d) this.known_supplier_id = d.known_supplier_id;
    this.company_id = d.company_id;
    this.name = d.name;
    this.role = d.role;
    this.address = d.address;
    this.postal_code = d.postal_code;
    this.city = d.city;
    this["country_alpha2"] = d["country_alpha2"];
    this.vat_number = d.vat_number;
    if ("search_terms" in d) this.search_terms = d.search_terms;
    if ("emails" in d) this.emails = d.emails;
    this.reg_no = d.reg_no;
    this.phone = d.phone;
    this.first_name = d.first_name;
    this.recurrent = d.recurrent;
    this.last_name = d.last_name;
    if ("gender" in d) this.gender = d.gender;
    this.payment_conditions = d.payment_conditions;
    this.customer_type = d.customer_type;
    this.disable_pending_vat = d.disable_pending_vat;
    this.force_pending_vat = d.force_pending_vat;
    if ("gocardless_id" in d) this.gocardless_id = d.gocardless_id;
    this.invoices_auto_generated = d.invoices_auto_generated;
    this.invoices_auto_validated = d.invoices_auto_validated;
    if ("billing_iban" in d) this.billing_iban = d.billing_iban;
    if ("billing_bic" in d) this.billing_bic = d.billing_bic;
    if ("billing_bank" in d) this.billing_bank = d.billing_bank;
    this.recipient = d.recipient;
    this.billing_language = d.billing_language;
    this.iban = d.iban;
    if ("stripe_id" in d) this.stripe_id = d.stripe_id;
    if ("invoice_dump_id" in d) this.invoice_dump_id = d.invoice_dump_id;
    this.delivery_address = d.delivery_address;
    this.delivery_postal_code = d.delivery_postal_code;
    this.delivery_city = d.delivery_city;
    this["delivery_country_alpha2"] = d["delivery_country_alpha2"];
    this.reference = d.reference;
    this.legal_form_code = d.legal_form_code;
    this.activity_nomenclature = d.activity_nomenclature;
    this.activity_code = d.activity_code;
    if ("billing_footer_invoice_id" in d) this.billing_footer_invoice_id = d.billing_footer_invoice_id;
    this.plan_item_id = d.plan_item_id;
    this.rule_enabled = d.rule_enabled;
    if ("supplier_payment_method" in d) this.supplier_payment_method = d.supplier_payment_method;
    if ("supplier_payment_method_last_updated_at" in d) this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;
    this.notes = d.notes;
    if ("admin_city_code" in d) this.admin_city_code = d.admin_city_code;
    if ("establishment_no" in d) this.establishment_no = d.establishment_no;
    this.address_additional_info = d.address_additional_info;
    this.delivery_address_additional_info = d.delivery_address_additional_info;
    if ("vat_rate" in d) this.vat_rate = d.vat_rate;
    if ("pnl_plan_item_id" in d) this.pnl_plan_item_id = d.pnl_plan_item_id;
    this.source_id = d.source_id;
    if ("country" in d) this.country = d.country;
    if ("delivery_country" in d) this.delivery_country = d.delivery_country;
    this.complete = d.complete;
    this.url = d.url;
    this.method = d.method;
    if ("billing_footer_invoice_label" in d) this.billing_footer_invoice_label = d.billing_footer_invoice_label;
    if ("display_name" in d) this.display_name = d.display_name;
    if ("debits" in d) this.debits = d.debits;
    if ("credits" in d) this.credits = d.credits;
    if ("balance" in d) this.balance = d.balance;
    if ("invoice_count" in d) this.invoice_count = d.invoice_count;
    if ("purchase_request_count" in d) this.purchase_request_count = d.purchase_request_count;
    if ("estimate_count" in d) this.estimate_count = d.estimate_count;
    if ("turnover" in d) this.turnover = d.turnover;
    if ("ledger_events_count" in d) this.ledger_events_count = d.ledger_events_count;
    if ("plan_item" in d) this.plan_item = d.plan_item;
    if ("pnl_plan_item" in d) this.pnl_plan_item = d.pnl_plan_item;
    if ("current_mandate" in d) this.current_mandate = d.current_mandate;
    this.received_a_mandate_request = d.received_a_mandate_request;
    if ("notes_comment" in d) this.notes_comment = d.notes_comment;
    if ("plan_item_attributes" in d) this.plan_item_attributes = d.plan_item_attributes;
    if ("tags" in d) this.tags = d.tags;
  }
}

export class InvoiceLinesEntity {
  public readonly id: number;
  public readonly price_before_tax: string;
  public readonly amount: string;
  public readonly tax: string;
  public readonly label: string;
  public readonly description: string;
  public readonly pnl_plan_item_id: number;
  public readonly product_id?: null;
  public readonly quantity: string;
  public readonly unit?: string | null;
  public readonly created_at: string;
  public readonly currency_amount: string;
  public readonly currency_tax: string;
  public readonly currency_price_before_tax: string;
  public readonly rank?: number | null;
  public readonly prepaid_pnl: boolean;
  public readonly ocr_vat_rate?: string | null;
  public readonly document_id: number;
  public readonly discount: string;
  public readonly discount_type: string;
  public readonly company_id: number;
  public readonly asset_id?: number | null;
  public readonly deferral_id?: null;
  public readonly advance_id?: null;
  public readonly raw_currency_unit_price: string;
  public readonly undiscounted_currency_price_before_tax: string;
  public readonly manual_vat_mode: boolean;
  public readonly invoice_line_section_id?: number | null;
  public readonly global_vat: boolean;
  public readonly vat_rate: string;
  public readonly pnl_plan_item: PlanItemOrPnlPlanItem;
  public readonly currency_unit_price_before_tax: string;
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
    checkString(d.price_before_tax, false, field + ".price_before_tax");
    checkString(d.amount, false, field + ".amount");
    checkString(d.tax, false, field + ".tax");
    checkString(d.label, false, field + ".label");
    checkString(d.description, false, field + ".description");
    checkNumber(d.pnl_plan_item_id, false, field + ".pnl_plan_item_id");
    checkNull(d.product_id, field + ".product_id");
    checkString(d.quantity, false, field + ".quantity");
    checkString(d.unit, true, field + ".unit");
    checkString(d.created_at, false, field + ".created_at");
    checkString(d.currency_amount, false, field + ".currency_amount");
    checkString(d.currency_tax, false, field + ".currency_tax");
    checkString(d.currency_price_before_tax, false, field + ".currency_price_before_tax");
    checkNumber(d.rank, true, field + ".rank");
    checkBoolean(d.prepaid_pnl, false, field + ".prepaid_pnl");
    checkString(d.ocr_vat_rate, true, field + ".ocr_vat_rate");
    checkNumber(d.document_id, false, field + ".document_id");
    checkString(d.discount, false, field + ".discount");
    checkString(d.discount_type, false, field + ".discount_type");
    checkNumber(d.company_id, false, field + ".company_id");
    checkNumber(d.asset_id, true, field + ".asset_id");
    checkNull(d.deferral_id, field + ".deferral_id");
    checkNull(d.advance_id, field + ".advance_id");
    checkString(d.raw_currency_unit_price, false, field + ".raw_currency_unit_price");
    checkString(d.undiscounted_currency_price_before_tax, false, field + ".undiscounted_currency_price_before_tax");
    checkBoolean(d.manual_vat_mode, false, field + ".manual_vat_mode");
    checkNumber(d.invoice_line_section_id, true, field + ".invoice_line_section_id");
    checkBoolean(d.global_vat, false, field + ".global_vat");
    checkString(d.vat_rate, false, field + ".vat_rate");
    d.pnl_plan_item = PlanItemOrPnlPlanItem.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    checkString(d.currency_unit_price_before_tax, false, field + ".currency_unit_price_before_tax");
    const knownProperties = ["id","price_before_tax","amount","tax","label","description","pnl_plan_item_id","product_id","quantity","unit","created_at","currency_amount","currency_tax","currency_price_before_tax","rank","prepaid_pnl","ocr_vat_rate","document_id","discount","discount_type","company_id","asset_id","deferral_id","advance_id","raw_currency_unit_price","undiscounted_currency_price_before_tax","manual_vat_mode","invoice_line_section_id","global_vat","vat_rate","pnl_plan_item","currency_unit_price_before_tax"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new InvoiceLinesEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.price_before_tax = d.price_before_tax;
    this.amount = d.amount;
    this.tax = d.tax;
    this.label = d.label;
    this.description = d.description;
    this.pnl_plan_item_id = d.pnl_plan_item_id;
    if ("product_id" in d) this.product_id = d.product_id;
    this.quantity = d.quantity;
    if ("unit" in d) this.unit = d.unit;
    this.created_at = d.created_at;
    this.currency_amount = d.currency_amount;
    this.currency_tax = d.currency_tax;
    this.currency_price_before_tax = d.currency_price_before_tax;
    if ("rank" in d) this.rank = d.rank;
    this.prepaid_pnl = d.prepaid_pnl;
    if ("ocr_vat_rate" in d) this.ocr_vat_rate = d.ocr_vat_rate;
    this.document_id = d.document_id;
    this.discount = d.discount;
    this.discount_type = d.discount_type;
    this.company_id = d.company_id;
    if ("asset_id" in d) this.asset_id = d.asset_id;
    if ("deferral_id" in d) this.deferral_id = d.deferral_id;
    if ("advance_id" in d) this.advance_id = d.advance_id;
    this.raw_currency_unit_price = d.raw_currency_unit_price;
    this.undiscounted_currency_price_before_tax = d.undiscounted_currency_price_before_tax;
    this.manual_vat_mode = d.manual_vat_mode;
    if ("invoice_line_section_id" in d) this.invoice_line_section_id = d.invoice_line_section_id;
    this.global_vat = d.global_vat;
    this.vat_rate = d.vat_rate;
    this.pnl_plan_item = d.pnl_plan_item;
    this.currency_unit_price_before_tax = d.currency_unit_price_before_tax;
  }
}

export class EstablishmentComment {
  public readonly id: number;
  public readonly name: string;
  public readonly content: string;
  public readonly created_at: string;
  public readonly seen: boolean;
  public readonly record_type: string;
  public readonly record_id: number;
  public readonly updated_at: string;
  public readonly user_id?: number | null;
  public readonly rich_content?: null;
  public readonly user?: User1 | null;
  public readonly author?: null;
  public static Parse(d: string): EstablishmentComment | null {
    return EstablishmentComment.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): EstablishmentComment | null {
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
    checkString(d.content, false, field + ".content");
    checkString(d.created_at, false, field + ".created_at");
    checkBoolean(d.seen, false, field + ".seen");
    checkString(d.record_type, false, field + ".record_type");
    checkNumber(d.record_id, false, field + ".record_id");
    checkString(d.updated_at, false, field + ".updated_at");
    checkNumber(d.user_id, true, field + ".user_id");
    checkNull(d.rich_content, field + ".rich_content");
    d.user = User1.Create(d.user, field + ".user");
    checkNull(d.author, field + ".author");
    const knownProperties = ["id","name","content","created_at","seen","record_type","record_id","updated_at","user_id","rich_content","user","author"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new EstablishmentComment(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.name = d.name;
    this.content = d.content;
    this.created_at = d.created_at;
    this.seen = d.seen;
    this.record_type = d.record_type;
    this.record_id = d.record_id;
    this.updated_at = d.updated_at;
    if ("user_id" in d) this.user_id = d.user_id;
    if ("rich_content" in d) this.rich_content = d.rich_content;
    if ("user" in d) this.user = d.user;
    if ("author" in d) this.author = d.author;
  }
}

export class User1 {
  public readonly id: number;
  public readonly first_name: string;
  public readonly last_name: string;
  public readonly full_name: string;
  public readonly profile_picture_url?: null;
  public static Parse(d: string): User1 | null {
    return User1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): User1 | null {
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
    checkString(d.first_name, false, field + ".first_name");
    checkString(d.last_name, false, field + ".last_name");
    checkString(d.full_name, false, field + ".full_name");
    checkNull(d.profile_picture_url, field + ".profile_picture_url");
    const knownProperties = ["id","first_name","last_name","full_name","profile_picture_url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new User1(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.first_name = d.first_name;
    this.last_name = d.last_name;
    this.full_name = d.full_name;
    if ("profile_picture_url" in d) this.profile_picture_url = d.profile_picture_url;
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
