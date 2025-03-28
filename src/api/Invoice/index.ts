// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIInvoice';
let obj: any = null;
export class APIInvoice {
  public readonly amount: string;
  public readonly attachment_required: boolean;
  public readonly client_comments_count: number;
  public readonly company_id: number;
  public readonly created_at: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly currency_tax: string;
  public readonly currency_price_before_tax: string;
  public readonly current_account_plan_item_id?: number | null;
  public readonly date?: string | null;
  public readonly deadline?: string | null;
  public readonly direction: string;
  public readonly email_from?: null;
  public readonly filename: string;
  public readonly gdrive_path?: string | null;
  public readonly group_uuid: string;
  public readonly id: number;
  public readonly invoice_number: string;
  public readonly label: string;
  public readonly outstanding_balance: string;
  public readonly preview_status: string;
  public readonly payment_status: string;
  public readonly paid: boolean;
  public readonly pusher_channel: string;
  public readonly source: string;
  public readonly type: string;
  public readonly validation_needed: boolean;
  public readonly journal_id: number;
  public readonly thirdparty_id?: number | null;
  public readonly preview_urls?: (string | null)[] | null;
  public readonly approval_status?: null;
  public readonly checksum: string;
  public readonly archived: boolean;
  public readonly duplicates_count: number;
  public readonly has_duplicates: boolean;
  public readonly invoice_lines_count: number;
  public readonly is_estimate: boolean;
  public readonly is_employee_expense: boolean;
  public readonly is_factur_x: boolean;
  public readonly subcomplete: boolean;
  public readonly has_closed_ledger_events: boolean;
  public readonly thirdparty?: Thirdparty | null;
  public readonly invoice_lines?: InvoiceLinesEntity[] | null;
  public readonly incomplete: boolean;
  public readonly is_waiting_for_ocr: boolean;
  public readonly status: string;
  public readonly tagged_at_ledger_events_level: boolean;
  public readonly current_account_plan_item?: PnlPlanItemOrCurrentAccountPlanItem | null;
  public readonly has_file: boolean;
  public readonly file_signed_id: string;
  public readonly embeddable_in_browser: boolean;
  public readonly pages_count?: number | null;
  public readonly blob_id: number;
  public readonly url: string;
  public readonly method: string;
  public readonly document_tags?: (DocumentTagsEntity | null)[] | null;
  public readonly mileage_allowance?: null;
  public static Parse(d: string): APIInvoice {
    return APIInvoice.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APIInvoice {
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
    checkString(d.amount, false, field + ".amount");
    checkBoolean(d.attachment_required, false, field + ".attachment_required");
    checkNumber(d.client_comments_count, false, field + ".client_comments_count");
    checkNumber(d.company_id, false, field + ".company_id");
    checkString(d.created_at, false, field + ".created_at");
    checkString(d.currency, false, field + ".currency");
    checkString(d.currency_amount, false, field + ".currency_amount");
    checkString(d.currency_tax, false, field + ".currency_tax");
    checkString(d.currency_price_before_tax, false, field + ".currency_price_before_tax");
    checkNumber(d.current_account_plan_item_id, true, field + ".current_account_plan_item_id");
    checkString(d.date, true, field + ".date");
    checkString(d.deadline, true, field + ".deadline");
    checkString(d.direction, false, field + ".direction");
    checkNull(d.email_from, field + ".email_from");
    checkString(d.filename, false, field + ".filename");
    checkString(d.gdrive_path, true, field + ".gdrive_path");
    checkString(d.group_uuid, false, field + ".group_uuid");
    checkNumber(d.id, false, field + ".id");
    checkString(d.invoice_number, false, field + ".invoice_number");
    checkString(d.label, false, field + ".label");
    checkString(d.outstanding_balance, false, field + ".outstanding_balance");
    checkString(d.preview_status, false, field + ".preview_status");
    checkString(d.payment_status, false, field + ".payment_status");
    checkBoolean(d.paid, false, field + ".paid");
    checkString(d.pusher_channel, false, field + ".pusher_channel");
    checkString(d.source, false, field + ".source");
    checkString(d.type, false, field + ".type");
    checkBoolean(d.validation_needed, false, field + ".validation_needed");
    checkNumber(d.journal_id, false, field + ".journal_id");
    checkNumber(d.thirdparty_id, true, field + ".thirdparty_id");
    checkArray(d.preview_urls, field + ".preview_urls");
    if (d.preview_urls) {
      for (let i = 0; i < d.preview_urls.length; i++) {
        checkString(d.preview_urls[i], true, field + ".preview_urls" + "[" + i + "]");
      }
    }
    checkNull(d.approval_status, field + ".approval_status");
    checkString(d.checksum, false, field + ".checksum");
    checkBoolean(d.archived, false, field + ".archived");
    checkNumber(d.duplicates_count, false, field + ".duplicates_count");
    checkBoolean(d.has_duplicates, false, field + ".has_duplicates");
    checkNumber(d.invoice_lines_count, false, field + ".invoice_lines_count");
    checkBoolean(d.is_estimate, false, field + ".is_estimate");
    checkBoolean(d.is_employee_expense, false, field + ".is_employee_expense");
    checkBoolean(d.is_factur_x, false, field + ".is_factur_x");
    checkBoolean(d.subcomplete, false, field + ".subcomplete");
    checkBoolean(d.has_closed_ledger_events, false, field + ".has_closed_ledger_events");
    d.thirdparty = Thirdparty.Create(d.thirdparty, field + ".thirdparty");
    checkArray(d.invoice_lines, field + ".invoice_lines");
    if (d.invoice_lines) {
      for (let i = 0; i < d.invoice_lines.length; i++) {
        d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + ".invoice_lines" + "[" + i + "]");
      }
    }
    checkBoolean(d.incomplete, false, field + ".incomplete");
    checkBoolean(d.is_waiting_for_ocr, false, field + ".is_waiting_for_ocr");
    checkString(d.status, false, field + ".status");
    checkBoolean(d.tagged_at_ledger_events_level, false, field + ".tagged_at_ledger_events_level");
    d.current_account_plan_item = PnlPlanItemOrCurrentAccountPlanItem.Create(d.current_account_plan_item, field + ".current_account_plan_item");
    checkBoolean(d.has_file, false, field + ".has_file");
    checkString(d.file_signed_id, false, field + ".file_signed_id");
    checkBoolean(d.embeddable_in_browser, false, field + ".embeddable_in_browser");
    checkNumber(d.pages_count, true, field + ".pages_count");
    checkNumber(d.blob_id, false, field + ".blob_id");
    checkString(d.url, false, field + ".url");
    checkString(d.method, false, field + ".method");
    checkArray(d.document_tags, field + ".document_tags");
    if (d.document_tags) {
      for (let i = 0; i < d.document_tags.length; i++) {
        d.document_tags[i] = DocumentTagsEntity.Create(d.document_tags[i], field + ".document_tags" + "[" + i + "]");
      }
    }
    checkNull(d.mileage_allowance, field + ".mileage_allowance");
    const knownProperties = ["amount","attachment_required","client_comments_count","company_id","created_at","currency","currency_amount","currency_tax","currency_price_before_tax","current_account_plan_item_id","date","deadline","direction","email_from","filename","gdrive_path","group_uuid","id","invoice_number","label","outstanding_balance","preview_status","payment_status","paid","pusher_channel","source","type","validation_needed","journal_id","thirdparty_id","preview_urls","approval_status","checksum","archived","duplicates_count","has_duplicates","invoice_lines_count","is_estimate","is_employee_expense","is_factur_x","subcomplete","has_closed_ledger_events","thirdparty","invoice_lines","incomplete","is_waiting_for_ocr","status","tagged_at_ledger_events_level","current_account_plan_item","has_file","file_signed_id","embeddable_in_browser","pages_count","blob_id","url","method","document_tags","mileage_allowance"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APIInvoice(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.attachment_required = d.attachment_required;
    this.client_comments_count = d.client_comments_count;
    this.company_id = d.company_id;
    this.created_at = d.created_at;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.currency_tax = d.currency_tax;
    this.currency_price_before_tax = d.currency_price_before_tax;
    if ("current_account_plan_item_id" in d) this.current_account_plan_item_id = d.current_account_plan_item_id;
    if ("date" in d) this.date = d.date;
    if ("deadline" in d) this.deadline = d.deadline;
    this.direction = d.direction;
    if ("email_from" in d) this.email_from = d.email_from;
    this.filename = d.filename;
    if ("gdrive_path" in d) this.gdrive_path = d.gdrive_path;
    this.group_uuid = d.group_uuid;
    this.id = d.id;
    this.invoice_number = d.invoice_number;
    this.label = d.label;
    this.outstanding_balance = d.outstanding_balance;
    this.preview_status = d.preview_status;
    this.payment_status = d.payment_status;
    this.paid = d.paid;
    this.pusher_channel = d.pusher_channel;
    this.source = d.source;
    this.type = d.type;
    this.validation_needed = d.validation_needed;
    this.journal_id = d.journal_id;
    if ("thirdparty_id" in d) this.thirdparty_id = d.thirdparty_id;
    if ("preview_urls" in d) this.preview_urls = d.preview_urls;
    if ("approval_status" in d) this.approval_status = d.approval_status;
    this.checksum = d.checksum;
    this.archived = d.archived;
    this.duplicates_count = d.duplicates_count;
    this.has_duplicates = d.has_duplicates;
    this.invoice_lines_count = d.invoice_lines_count;
    this.is_estimate = d.is_estimate;
    this.is_employee_expense = d.is_employee_expense;
    this.is_factur_x = d.is_factur_x;
    this.subcomplete = d.subcomplete;
    this.has_closed_ledger_events = d.has_closed_ledger_events;
    if ("thirdparty" in d) this.thirdparty = d.thirdparty;
    if ("invoice_lines" in d) this.invoice_lines = d.invoice_lines;
    this.incomplete = d.incomplete;
    this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    this.status = d.status;
    this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;
    if ("current_account_plan_item" in d) this.current_account_plan_item = d.current_account_plan_item;
    this.has_file = d.has_file;
    this.file_signed_id = d.file_signed_id;
    this.embeddable_in_browser = d.embeddable_in_browser;
    if ("pages_count" in d) this.pages_count = d.pages_count;
    this.blob_id = d.blob_id;
    this.url = d.url;
    this.method = d.method;
    if ("document_tags" in d) this.document_tags = d.document_tags;
    if ("mileage_allowance" in d) this.mileage_allowance = d.mileage_allowance;
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
  public readonly plan_item: PlanItemOrPnlPlanItem;
  public readonly pnl_plan_item?: PnlPlanItem | null;
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
    d.plan_item = PlanItemOrPnlPlanItem.Create(d.plan_item, field + ".plan_item");
    d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + ".pnl_plan_item");
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
    this.plan_item = d.plan_item;
    if ("pnl_plan_item" in d) this.pnl_plan_item = d.pnl_plan_item;
    if ("current_mandate" in d) this.current_mandate = d.current_mandate;
    this.received_a_mandate_request = d.received_a_mandate_request;
    if ("notes_comment" in d) this.notes_comment = d.notes_comment;
    if ("plan_item_attributes" in d) this.plan_item_attributes = d.plan_item_attributes;
    if ("tags" in d) this.tags = d.tags;
  }
}

export class PlanItemOrPnlPlanItem {
  public readonly id: number;
  public readonly number: string;
  public readonly internal_identifier?: null;
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

export class PnlPlanItem {
  public readonly id: number;
  public readonly number: string;
  public readonly internal_identifier?: string | null;
  public readonly label: string;
  public readonly company_id: number;
  public readonly enabled: boolean;
  public readonly vat_rate: string;
  public readonly "country_alpha2": string;
  public readonly label_is_editable: boolean;
  public static Parse(d: string): PnlPlanItem | null {
    return PnlPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): PnlPlanItem | null {
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
    return new PnlPlanItem(d);
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

export class InvoiceLinesEntity {
  public readonly id: number;
  public readonly amount: string;
  public readonly tax: string;
  public readonly currency_amount: string;
  public readonly currency_price_before_tax: string;
  public readonly currency_tax: string;
  public readonly label: string;
  public readonly pnl_plan_item_id: number;
  public readonly advance?: null;
  public readonly vat_rate: string;
  public readonly ocr_vat_rate?: string | null;
  public readonly asset_id?: number | null;
  public readonly deferral_id?: null;
  public readonly advance_id?: null;
  public readonly prepaid_pnl: boolean;
  public readonly global_vat: boolean;
  public readonly ledger_event_label?: null;
  public readonly pnl_plan_item: PnlPlanItemOrCurrentAccountPlanItem1;
  public readonly deferral?: null;
  public readonly asset?: Asset | null;
  public readonly advance_pnl: boolean;
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
    checkString(d.amount, false, field + ".amount");
    checkString(d.tax, false, field + ".tax");
    checkString(d.currency_amount, false, field + ".currency_amount");
    checkString(d.currency_price_before_tax, false, field + ".currency_price_before_tax");
    checkString(d.currency_tax, false, field + ".currency_tax");
    checkString(d.label, false, field + ".label");
    checkNumber(d.pnl_plan_item_id, false, field + ".pnl_plan_item_id");
    checkNull(d.advance, field + ".advance");
    checkString(d.vat_rate, false, field + ".vat_rate");
    checkString(d.ocr_vat_rate, true, field + ".ocr_vat_rate");
    checkNumber(d.asset_id, true, field + ".asset_id");
    checkNull(d.deferral_id, field + ".deferral_id");
    checkNull(d.advance_id, field + ".advance_id");
    checkBoolean(d.prepaid_pnl, false, field + ".prepaid_pnl");
    checkBoolean(d.global_vat, false, field + ".global_vat");
    checkNull(d.ledger_event_label, field + ".ledger_event_label");
    d.pnl_plan_item = PnlPlanItemOrCurrentAccountPlanItem1.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    checkNull(d.deferral, field + ".deferral");
    d.asset = Asset.Create(d.asset, field + ".asset");
    checkBoolean(d.advance_pnl, false, field + ".advance_pnl");
    const knownProperties = ["id","amount","tax","currency_amount","currency_price_before_tax","currency_tax","label","pnl_plan_item_id","advance","vat_rate","ocr_vat_rate","asset_id","deferral_id","advance_id","prepaid_pnl","global_vat","ledger_event_label","pnl_plan_item","deferral","asset","advance_pnl"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new InvoiceLinesEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.amount = d.amount;
    this.tax = d.tax;
    this.currency_amount = d.currency_amount;
    this.currency_price_before_tax = d.currency_price_before_tax;
    this.currency_tax = d.currency_tax;
    this.label = d.label;
    this.pnl_plan_item_id = d.pnl_plan_item_id;
    if ("advance" in d) this.advance = d.advance;
    this.vat_rate = d.vat_rate;
    if ("ocr_vat_rate" in d) this.ocr_vat_rate = d.ocr_vat_rate;
    if ("asset_id" in d) this.asset_id = d.asset_id;
    if ("deferral_id" in d) this.deferral_id = d.deferral_id;
    if ("advance_id" in d) this.advance_id = d.advance_id;
    this.prepaid_pnl = d.prepaid_pnl;
    this.global_vat = d.global_vat;
    if ("ledger_event_label" in d) this.ledger_event_label = d.ledger_event_label;
    this.pnl_plan_item = d.pnl_plan_item;
    if ("deferral" in d) this.deferral = d.deferral;
    if ("asset" in d) this.asset = d.asset;
    this.advance_pnl = d.advance_pnl;
  }
}

export class PnlPlanItemOrCurrentAccountPlanItem1 {
  public readonly id: number;
  public readonly number: string;
  public readonly label: string;
  public readonly enabled: boolean;
  public static Parse(d: string): PnlPlanItemOrCurrentAccountPlanItem1 {
    return PnlPlanItemOrCurrentAccountPlanItem1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): PnlPlanItemOrCurrentAccountPlanItem1 {
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
    return new PnlPlanItemOrCurrentAccountPlanItem1(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
    this.label = d.label;
    this.enabled = d.enabled;
  }
}

export class Asset {
  public readonly id: number;
  public readonly name: string;
  public readonly plan_item_id: number;
  public readonly entry_date: string;
  public readonly start_date?: string | null;
  public readonly quantity: number;
  public readonly amortization_type?: string | null;
  public readonly amortization_months: number;
  public readonly invoice_line_editable: boolean;
  public static Parse(d: string): Asset | null {
    return Asset.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Asset | null {
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
    checkNumber(d.plan_item_id, false, field + ".plan_item_id");
    checkString(d.entry_date, false, field + ".entry_date");
    checkString(d.start_date, true, field + ".start_date");
    checkNumber(d.quantity, false, field + ".quantity");
    checkString(d.amortization_type, true, field + ".amortization_type");
    checkNumber(d.amortization_months, false, field + ".amortization_months");
    checkBoolean(d.invoice_line_editable, false, field + ".invoice_line_editable");
    const knownProperties = ["id","name","plan_item_id","entry_date","start_date","quantity","amortization_type","amortization_months","invoice_line_editable"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Asset(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.name = d.name;
    this.plan_item_id = d.plan_item_id;
    this.entry_date = d.entry_date;
    if ("start_date" in d) this.start_date = d.start_date;
    this.quantity = d.quantity;
    if ("amortization_type" in d) this.amortization_type = d.amortization_type;
    this.amortization_months = d.amortization_months;
    this.invoice_line_editable = d.invoice_line_editable;
  }
}

export class PnlPlanItemOrCurrentAccountPlanItem {
  public readonly id: number;
  public readonly number: string;
  public readonly label: string;
  public readonly enabled: boolean;
  public static Parse(d: string): PnlPlanItemOrCurrentAccountPlanItem | null {
    return PnlPlanItemOrCurrentAccountPlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): PnlPlanItemOrCurrentAccountPlanItem | null {
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
    checkString(d.number, false, field + ".number");
    checkString(d.label, false, field + ".label");
    checkBoolean(d.enabled, false, field + ".enabled");
    const knownProperties = ["id","number","label","enabled"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new PnlPlanItemOrCurrentAccountPlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
    this.label = d.label;
    this.enabled = d.enabled;
  }
}

export class DocumentTagsEntity {
  public readonly id: number;
  public readonly document_id: number;
  public readonly tag_id: number;
  public readonly group_id: number;
  public readonly weight: string;
  public readonly tag: Tag;
  public static Parse(d: string): DocumentTagsEntity | null {
    return DocumentTagsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): DocumentTagsEntity | null {
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
    checkNumber(d.document_id, false, field + ".document_id");
    checkNumber(d.tag_id, false, field + ".tag_id");
    checkNumber(d.group_id, false, field + ".group_id");
    checkString(d.weight, false, field + ".weight");
    d.tag = Tag.Create(d.tag, field + ".tag");
    const knownProperties = ["id","document_id","tag_id","group_id","weight","tag"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new DocumentTagsEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.document_id = d.document_id;
    this.tag_id = d.tag_id;
    this.group_id = d.group_id;
    this.weight = d.weight;
    this.tag = d.tag;
  }
}

export class Tag {
  public readonly id: number;
  public readonly label: string;
  public readonly analytical_code?: null;
  public readonly group_id: number;
  public readonly variant?: null;
  public readonly icon?: null;
  public readonly group: Group;
  public static Parse(d: string): Tag {
    return Tag.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Tag {
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
    checkString(d.label, false, field + ".label");
    checkNull(d.analytical_code, field + ".analytical_code");
    checkNumber(d.group_id, false, field + ".group_id");
    checkNull(d.variant, field + ".variant");
    checkNull(d.icon, field + ".icon");
    d.group = Group.Create(d.group, field + ".group");
    const knownProperties = ["id","label","analytical_code","group_id","variant","icon","group"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Tag(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.label = d.label;
    if ("analytical_code" in d) this.analytical_code = d.analytical_code;
    this.group_id = d.group_id;
    if ("variant" in d) this.variant = d.variant;
    if ("icon" in d) this.icon = d.icon;
    this.group = d.group;
  }
}

export class Group {
  public readonly label: string;
  public readonly icon: string;
  public readonly self_service_accounting: boolean;
  public static Parse(d: string): Group {
    return Group.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Group {
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
    checkString(d.label, false, field + ".label");
    checkString(d.icon, false, field + ".icon");
    checkBoolean(d.self_service_accounting, false, field + ".self_service_accounting");
    const knownProperties = ["label","icon","self_service_accounting"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Group(d);
  }
  private constructor(d: any) {
    this.label = d.label;
    this.icon = d.icon;
    this.self_service_accounting = d.self_service_accounting;
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
