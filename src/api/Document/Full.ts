// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDocumentFull';
let obj: any = null;
export class APIDocumentFull {
  public readonly accountants_status?: string;
  public readonly active_payment_reminder_id?: null;
  public readonly amount?: string;
  public readonly annexes?: never[];
  public readonly appendices?: never[];
  public readonly approvable_record_id?: null;
  public readonly approval_flow?: null;
  public readonly archived?: boolean;
  public readonly archived_at?: null;
  public readonly attachment_required?: boolean;
  public readonly bad_debt?: boolean;
  public readonly been_manually_marked_as_paid?: boolean;
  public readonly billing_subscription_id?: null;
  public readonly can_be_attached_to_a_cheque_deposit?: boolean;
  public readonly can_be_finalized?: boolean;
  public readonly can_be_manually_marked_as_paid?: boolean;
  public readonly can_be_manually_marked_as_sent?: boolean;
  public readonly can_be_stamped_as_paid_in_pdf?: boolean;
  public readonly can_be_unmarked_as_paid?: boolean;
  public readonly can_be_unmarked_as_sent?: boolean;
  public readonly can_request_a_fintecture_payment_url?: boolean;
  public readonly cancellable?: boolean;
  public readonly cancelled?: boolean;
  public readonly checksum?: string;
  public readonly client_comments_count?: number;
  public readonly company_id: number;
  public readonly complete?: boolean;
  public readonly completeness?: number;
  public readonly created_at?: string;
  public readonly credit_note?: null;
  public readonly credit_notes?: CreditNotesEntity[];
  public readonly credit_notes_amount?: string;
  public readonly credited_invoice_id?: null;
  public readonly currency?: string;
  public readonly currency_amount?: string;
  public readonly currency_amount_before_tax?: string;
  public readonly currency_price_before_tax?: string;
  public readonly currency_tax?: string;
  public readonly current_account_plan_item?: null;
  public readonly current_account_plan_item_id?: null;
  public readonly customer_validation_needed?: boolean;
  public readonly date?: string | null;
  public readonly deadline?: string | null;
  public readonly defacto_loan_eligible?: boolean;
  public readonly direction: string | null;
  public readonly discount?: string;
  public readonly discount_type?: string;
  public readonly display_reactivate_button?: boolean;
  public readonly display_revoke_button?: boolean;
  public readonly document_tags?: DocumentTagsEntity[];
  public readonly draft?: boolean;
  public readonly duplicates?: DuplicatesEntity[];
  public readonly email_from?: null;
  public readonly embeddable_in_browser?: boolean | null;
  public readonly external_id?: string;
  public readonly factor_status?: string;
  public readonly fec_pieceref?: string;
  public readonly file_signed_id?: string;
  public readonly filename?: string | null;
  public readonly finalized_at?: null;
  public readonly flow_approved?: null;
  public readonly from_estimate_id?: null;
  public readonly gdrive_path?: null;
  public readonly gocardless_billing_subscription?: boolean;
  public readonly group_uuid?: string;
  public readonly grouped_at?: string | null;
  public readonly grouped_documents?: GroupedDocumentsEntity[];
  public readonly has_already_sent_an_email?: boolean;
  public readonly has_credit_note?: boolean;
  public readonly has_file: boolean;
  public readonly has_grouped_documents?: null | boolean;
  public readonly has_linked_quotes?: boolean;
  public readonly has_pending_payments?: boolean;
  public readonly hasTooManyLedgerEvents?: boolean;
  public readonly iban?: string;
  public readonly id: number;
  public readonly incomplete?: boolean;
  public readonly invoice_kind?: string;
  public readonly invoice_lines?: InvoiceLinesEntity[];
  public readonly invoice_number?: string;
  public readonly invoice_status?: null;
  public readonly invoicing_detailed_source?: null;
  public readonly is_credit_note?: boolean;
  public readonly is_destroyable?: boolean;
  public readonly is_estimate?: boolean;
  public readonly is_factur_x?: boolean;
  public readonly is_payment_emitted?: boolean;
  public readonly is_payment_found?: boolean;
  public readonly is_payment_in_process?: boolean;
  public readonly is_reconciliation_delay_expired?: null;
  public readonly is_sendable?: boolean;
  public readonly is_waiting_for_ocr?: boolean;
  public readonly journal_id?: number;
  public readonly label?: string;
  public readonly language?: string;
  public readonly last_payment?: null;
  public readonly ledgerEvents?: LedgerEventsEntity[];
  public readonly ledgerEventsCount?: number;
  public readonly manually_marked_as_paid_at?: null;
  public readonly manually_marked_as_sent_at?: null;
  public readonly match_badge_count?: number;
  public readonly means_of_payment?: null;
  public readonly method?: string;
  public readonly min_permitted_issue_date?: null;
  public readonly multiplier?: number;
  public readonly not_duplicate?: boolean;
  public readonly ocr_iban?: null | string;
  public readonly ocr_thirdparty_id?: null;
  public readonly opened_at?: null | string;
  public readonly outstanding_balance?: string;
  public readonly owner?: null;
  public readonly pages_count?: null | number;
  public readonly paid?: boolean;
  public readonly paid_by?: null;
  public readonly paid_personally?: boolean;
  public readonly partial_kind?: null;
  public readonly partial_order?: null;
  public readonly partial_percentage?: null;
  public readonly partially_cancelled?: boolean;
  public readonly past_payments?: never[];
  public readonly payment_emitted_at?: null;
  public readonly payment_ids?: never[];
  public readonly payment_in_process_started_at?: null;
  public readonly payment_method?: null;
  public readonly payment_methods?: never[];
  public readonly payment_reference?: string;
  public readonly payment_reminder_enabled?: boolean;
  public readonly payment_reminder_recipients?: null;
  public readonly payment_reminder_steps?: never[];
  public readonly payment_status?: string;
  public readonly payments?: never[];
  public readonly pdf_description?: null;
  public readonly pdf_generation_status?: string;
  public readonly pdf_invoice_display_products_list?: boolean;
  public readonly pdf_invoice_free_text?: string;
  public readonly pdf_invoice_free_text_enabled?: boolean;
  public readonly pdf_invoice_subject?: string;
  public readonly pdf_invoice_subject_enabled?: boolean;
  public readonly pdf_invoice_title?: string;
  public readonly pdf_paid_stamp?: boolean;
  public readonly pdp_refusal_reason?: null;
  public readonly pdp_status?: null;
  public readonly pending?: boolean;
  public readonly preview_status?: string | null;
  public readonly preview_urls?: string[];
  public readonly price_before_tax?: string;
  public readonly primary_badge?: string;
  public readonly pro_account_check_deposits?: never[];
  public readonly public_link?: null;
  public readonly purchase_request_id?: null;
  public readonly purchase_request_ids?: never[];
  public readonly pusher_channel?: string;
  public readonly quote_group_uuid?: string;
  public readonly quote_uid?: null;
  public readonly quotes?: boolean;
  public readonly readonly?: boolean;
  public readonly recipients?: never[];
  public readonly reconciled?: boolean;
  public readonly remaining_amount?: string | null;
  public readonly requires_validation?: boolean;
  public readonly reviewed_by?: null;
  public readonly scored_transactions?: null;
  public readonly sepa_xml_exports?: never[];
  public readonly show_duplicates_tab?: boolean;
  public readonly signed_type?: string;
  public readonly size?: string;
  public readonly source?: string;
  public readonly source_document_id?: null;
  public readonly source_document_label?: null;
  public readonly source_metadata?: null | SourceMetadata;
  public readonly special_mention?: null;
  public readonly status?: string;
  public readonly subcomplete?: boolean;
  public readonly tagged_at_ledger_events_level?: boolean;
  public readonly tax?: string;
  public readonly team?: null;
  public readonly thirdparty?: Thirdparty | null;
  public readonly thirdparty_id?: number | null;
  public readonly type: string;
  public readonly updated_at?: string;
  public readonly url: string;
  public readonly use_manual_partial_invoices?: boolean;
  public readonly validated_at?: null;
  public readonly validation_needed?: boolean;
  public static Parse(d: string): APIDocumentFull {
    return APIDocumentFull.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDocumentFull {
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
    if ("accountants_status" in d) {
      checkString(d.accountants_status, field + ".accountants_status");
    }
    if ("active_payment_reminder_id" in d) {
      checkNull(d.active_payment_reminder_id, field + ".active_payment_reminder_id");
    }
    if ("amount" in d) {
      checkString(d.amount, field + ".amount");
    }
    if ("annexes" in d) {
      checkArray(d.annexes, field + ".annexes");
      if (d.annexes) {
        for (let i = 0; i < d.annexes.length; i++) {
          checkNever(d.annexes[i], field + ".annexes" + "[" + i + "]");
        }
      }
    }
    if ("appendices" in d) {
      checkArray(d.appendices, field + ".appendices");
      if (d.appendices) {
        for (let i = 0; i < d.appendices.length; i++) {
          checkNever(d.appendices[i], field + ".appendices" + "[" + i + "]");
        }
      }
    }
    if ("approvable_record_id" in d) {
      checkNull(d.approvable_record_id, field + ".approvable_record_id");
    }
    if ("approval_flow" in d) {
      checkNull(d.approval_flow, field + ".approval_flow");
    }
    if ("archived" in d) {
      checkBoolean(d.archived, field + ".archived");
    }
    if ("archived_at" in d) {
      checkNull(d.archived_at, field + ".archived_at");
    }
    if ("attachment_required" in d) {
      checkBoolean(d.attachment_required, field + ".attachment_required");
    }
    if ("bad_debt" in d) {
      checkBoolean(d.bad_debt, field + ".bad_debt");
    }
    if ("been_manually_marked_as_paid" in d) {
      checkBoolean(d.been_manually_marked_as_paid, field + ".been_manually_marked_as_paid");
    }
    if ("billing_subscription_id" in d) {
      checkNull(d.billing_subscription_id, field + ".billing_subscription_id");
    }
    if ("can_be_attached_to_a_cheque_deposit" in d) {
      checkBoolean(d.can_be_attached_to_a_cheque_deposit, field + ".can_be_attached_to_a_cheque_deposit");
    }
    if ("can_be_finalized" in d) {
      checkBoolean(d.can_be_finalized, field + ".can_be_finalized");
    }
    if ("can_be_manually_marked_as_paid" in d) {
      checkBoolean(d.can_be_manually_marked_as_paid, field + ".can_be_manually_marked_as_paid");
    }
    if ("can_be_manually_marked_as_sent" in d) {
      checkBoolean(d.can_be_manually_marked_as_sent, field + ".can_be_manually_marked_as_sent");
    }
    if ("can_be_stamped_as_paid_in_pdf" in d) {
      checkBoolean(d.can_be_stamped_as_paid_in_pdf, field + ".can_be_stamped_as_paid_in_pdf");
    }
    if ("can_be_unmarked_as_paid" in d) {
      checkBoolean(d.can_be_unmarked_as_paid, field + ".can_be_unmarked_as_paid");
    }
    if ("can_be_unmarked_as_sent" in d) {
      checkBoolean(d.can_be_unmarked_as_sent, field + ".can_be_unmarked_as_sent");
    }
    if ("can_request_a_fintecture_payment_url" in d) {
      checkBoolean(d.can_request_a_fintecture_payment_url, field + ".can_request_a_fintecture_payment_url");
    }
    if ("cancellable" in d) {
      checkBoolean(d.cancellable, field + ".cancellable");
    }
    if ("cancelled" in d) {
      checkBoolean(d.cancelled, field + ".cancelled");
    }
    if ("checksum" in d) {
      checkString(d.checksum, field + ".checksum");
    }
    if ("client_comments_count" in d) {
      checkNumber(d.client_comments_count, field + ".client_comments_count");
    }
    checkNumber(d.company_id, field + ".company_id");
    if ("complete" in d) {
      checkBoolean(d.complete, field + ".complete");
    }
    if ("completeness" in d) {
      checkNumber(d.completeness, field + ".completeness");
    }
    if ("created_at" in d) {
      checkString(d.created_at, field + ".created_at");
    }
    if ("credit_note" in d) {
      checkNull(d.credit_note, field + ".credit_note");
    }
    if ("credit_notes" in d) {
      checkArray(d.credit_notes, field + ".credit_notes");
      if (d.credit_notes) {
        for (let i = 0; i < d.credit_notes.length; i++) {
          d.credit_notes[i] = CreditNotesEntity.Create(d.credit_notes[i], field + ".credit_notes" + "[" + i + "]");
        }
      }
    }
    if ("credit_notes_amount" in d) {
      checkString(d.credit_notes_amount, field + ".credit_notes_amount");
    }
    if ("credited_invoice_id" in d) {
      checkNull(d.credited_invoice_id, field + ".credited_invoice_id");
    }
    if ("currency" in d) {
      checkString(d.currency, field + ".currency");
    }
    if ("currency_amount" in d) {
      checkString(d.currency_amount, field + ".currency_amount");
    }
    if ("currency_amount_before_tax" in d) {
      checkString(d.currency_amount_before_tax, field + ".currency_amount_before_tax");
    }
    if ("currency_price_before_tax" in d) {
      checkString(d.currency_price_before_tax, field + ".currency_price_before_tax");
    }
    if ("currency_tax" in d) {
      checkString(d.currency_tax, field + ".currency_tax");
    }
    if ("current_account_plan_item" in d) {
      checkNull(d.current_account_plan_item, field + ".current_account_plan_item");
    }
    if ("current_account_plan_item_id" in d) {
      checkNull(d.current_account_plan_item_id, field + ".current_account_plan_item_id");
    }
    if ("customer_validation_needed" in d) {
      checkBoolean(d.customer_validation_needed, field + ".customer_validation_needed");
    }
    if ("date" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.date, field + ".date", "string | null");
      } catch (e) {
        try {
          checkNull(d.date, field + ".date", "string | null");
        } catch (e) {
        }
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
    if ("defacto_loan_eligible" in d) {
      checkBoolean(d.defacto_loan_eligible, field + ".defacto_loan_eligible");
    }
    // This will be refactored in the next release.
    try {
      checkString(d.direction, field + ".direction", "string | null");
    } catch (e) {
      try {
        checkNull(d.direction, field + ".direction", "string | null");
      } catch (e) {
      }
    }
    if ("discount" in d) {
      checkString(d.discount, field + ".discount");
    }
    if ("discount_type" in d) {
      checkString(d.discount_type, field + ".discount_type");
    }
    if ("display_reactivate_button" in d) {
      checkBoolean(d.display_reactivate_button, field + ".display_reactivate_button");
    }
    if ("display_revoke_button" in d) {
      checkBoolean(d.display_revoke_button, field + ".display_revoke_button");
    }
    if ("document_tags" in d) {
      checkArray(d.document_tags, field + ".document_tags");
      if (d.document_tags) {
        for (let i = 0; i < d.document_tags.length; i++) {
          d.document_tags[i] = DocumentTagsEntity.Create(d.document_tags[i], field + ".document_tags" + "[" + i + "]");
        }
      }
    }
    if ("draft" in d) {
      checkBoolean(d.draft, field + ".draft");
    }
    if ("duplicates" in d) {
      checkArray(d.duplicates, field + ".duplicates");
      if (d.duplicates) {
        for (let i = 0; i < d.duplicates.length; i++) {
          d.duplicates[i] = DuplicatesEntity.Create(d.duplicates[i], field + ".duplicates" + "[" + i + "]");
        }
      }
    }
    if ("email_from" in d) {
      checkNull(d.email_from, field + ".email_from");
    }
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
    if ("external_id" in d) {
      checkString(d.external_id, field + ".external_id");
    }
    if ("factor_status" in d) {
      checkString(d.factor_status, field + ".factor_status");
    }
    if ("fec_pieceref" in d) {
      checkString(d.fec_pieceref, field + ".fec_pieceref");
    }
    if ("file_signed_id" in d) {
      checkString(d.file_signed_id, field + ".file_signed_id");
    }
    if ("filename" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.filename, field + ".filename", "string | null");
      } catch (e) {
        try {
          checkNull(d.filename, field + ".filename", "string | null");
        } catch (e) {
        }
      }
    }
    if ("finalized_at" in d) {
      checkNull(d.finalized_at, field + ".finalized_at");
    }
    if ("flow_approved" in d) {
      checkNull(d.flow_approved, field + ".flow_approved");
    }
    if ("from_estimate_id" in d) {
      checkNull(d.from_estimate_id, field + ".from_estimate_id");
    }
    if ("gdrive_path" in d) {
      checkNull(d.gdrive_path, field + ".gdrive_path");
    }
    if ("gocardless_billing_subscription" in d) {
      checkBoolean(d.gocardless_billing_subscription, field + ".gocardless_billing_subscription");
    }
    if ("group_uuid" in d) {
      checkString(d.group_uuid, field + ".group_uuid");
    }
    if ("grouped_at" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.grouped_at, field + ".grouped_at", "string | null");
      } catch (e) {
        try {
          checkNull(d.grouped_at, field + ".grouped_at", "string | null");
        } catch (e) {
        }
      }
    }
    if ("grouped_documents" in d) {
      checkArray(d.grouped_documents, field + ".grouped_documents");
      if (d.grouped_documents) {
        for (let i = 0; i < d.grouped_documents.length; i++) {
          d.grouped_documents[i] = GroupedDocumentsEntity.Create(d.grouped_documents[i], field + ".grouped_documents" + "[" + i + "]");
        }
      }
    }
    if ("has_already_sent_an_email" in d) {
      checkBoolean(d.has_already_sent_an_email, field + ".has_already_sent_an_email");
    }
    if ("has_credit_note" in d) {
      checkBoolean(d.has_credit_note, field + ".has_credit_note");
    }
    checkBoolean(d.has_file, field + ".has_file");
    if ("has_grouped_documents" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.has_grouped_documents, field + ".has_grouped_documents", "null | boolean");
      } catch (e) {
        try {
          checkBoolean(d.has_grouped_documents, field + ".has_grouped_documents", "null | boolean");
        } catch (e) {
        }
      }
    }
    if ("has_linked_quotes" in d) {
      checkBoolean(d.has_linked_quotes, field + ".has_linked_quotes");
    }
    if ("has_pending_payments" in d) {
      checkBoolean(d.has_pending_payments, field + ".has_pending_payments");
    }
    if ("hasTooManyLedgerEvents" in d) {
      checkBoolean(d.hasTooManyLedgerEvents, field + ".hasTooManyLedgerEvents");
    }
    if ("iban" in d) {
      checkString(d.iban, field + ".iban");
    }
    checkNumber(d.id, field + ".id");
    if ("incomplete" in d) {
      checkBoolean(d.incomplete, field + ".incomplete");
    }
    if ("invoice_kind" in d) {
      checkString(d.invoice_kind, field + ".invoice_kind");
    }
    if ("invoice_lines" in d) {
      checkArray(d.invoice_lines, field + ".invoice_lines");
      if (d.invoice_lines) {
        for (let i = 0; i < d.invoice_lines.length; i++) {
          d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + ".invoice_lines" + "[" + i + "]");
        }
      }
    }
    if ("invoice_number" in d) {
      checkString(d.invoice_number, field + ".invoice_number");
    }
    if ("invoice_status" in d) {
      checkNull(d.invoice_status, field + ".invoice_status");
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
    if ("is_factur_x" in d) {
      checkBoolean(d.is_factur_x, field + ".is_factur_x");
    }
    if ("is_payment_emitted" in d) {
      checkBoolean(d.is_payment_emitted, field + ".is_payment_emitted");
    }
    if ("is_payment_found" in d) {
      checkBoolean(d.is_payment_found, field + ".is_payment_found");
    }
    if ("is_payment_in_process" in d) {
      checkBoolean(d.is_payment_in_process, field + ".is_payment_in_process");
    }
    if ("is_reconciliation_delay_expired" in d) {
      checkNull(d.is_reconciliation_delay_expired, field + ".is_reconciliation_delay_expired");
    }
    if ("is_sendable" in d) {
      checkBoolean(d.is_sendable, field + ".is_sendable");
    }
    if ("is_waiting_for_ocr" in d) {
      checkBoolean(d.is_waiting_for_ocr, field + ".is_waiting_for_ocr");
    }
    if ("journal_id" in d) {
      checkNumber(d.journal_id, field + ".journal_id");
    }
    if ("label" in d) {
      checkString(d.label, field + ".label");
    }
    if ("language" in d) {
      checkString(d.language, field + ".language");
    }
    if ("last_payment" in d) {
      checkNull(d.last_payment, field + ".last_payment");
    }
    if ("ledgerEvents" in d) {
      checkArray(d.ledgerEvents, field + ".ledgerEvents");
      if (d.ledgerEvents) {
        for (let i = 0; i < d.ledgerEvents.length; i++) {
          d.ledgerEvents[i] = LedgerEventsEntity.Create(d.ledgerEvents[i], field + ".ledgerEvents" + "[" + i + "]");
        }
      }
    }
    if ("ledgerEventsCount" in d) {
      checkNumber(d.ledgerEventsCount, field + ".ledgerEventsCount");
    }
    if ("manually_marked_as_paid_at" in d) {
      checkNull(d.manually_marked_as_paid_at, field + ".manually_marked_as_paid_at");
    }
    if ("manually_marked_as_sent_at" in d) {
      checkNull(d.manually_marked_as_sent_at, field + ".manually_marked_as_sent_at");
    }
    if ("match_badge_count" in d) {
      checkNumber(d.match_badge_count, field + ".match_badge_count");
    }
    if ("means_of_payment" in d) {
      checkNull(d.means_of_payment, field + ".means_of_payment");
    }
    if ("method" in d) {
      checkString(d.method, field + ".method");
    }
    if ("min_permitted_issue_date" in d) {
      checkNull(d.min_permitted_issue_date, field + ".min_permitted_issue_date");
    }
    if ("multiplier" in d) {
      checkNumber(d.multiplier, field + ".multiplier");
    }
    if ("not_duplicate" in d) {
      checkBoolean(d.not_duplicate, field + ".not_duplicate");
    }
    if ("ocr_iban" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.ocr_iban, field + ".ocr_iban", "null | string");
      } catch (e) {
        try {
          checkString(d.ocr_iban, field + ".ocr_iban", "null | string");
        } catch (e) {
        }
      }
    }
    if ("ocr_thirdparty_id" in d) {
      checkNull(d.ocr_thirdparty_id, field + ".ocr_thirdparty_id");
    }
    if ("opened_at" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.opened_at, field + ".opened_at", "null | string");
      } catch (e) {
        try {
          checkString(d.opened_at, field + ".opened_at", "null | string");
        } catch (e) {
        }
      }
    }
    if ("outstanding_balance" in d) {
      checkString(d.outstanding_balance, field + ".outstanding_balance");
    }
    if ("owner" in d) {
      checkNull(d.owner, field + ".owner");
    }
    if ("pages_count" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.pages_count, field + ".pages_count", "null | number");
      } catch (e) {
        try {
          checkNumber(d.pages_count, field + ".pages_count", "null | number");
        } catch (e) {
        }
      }
    }
    if ("paid" in d) {
      checkBoolean(d.paid, field + ".paid");
    }
    if ("paid_by" in d) {
      checkNull(d.paid_by, field + ".paid_by");
    }
    if ("paid_personally" in d) {
      checkBoolean(d.paid_personally, field + ".paid_personally");
    }
    if ("partial_kind" in d) {
      checkNull(d.partial_kind, field + ".partial_kind");
    }
    if ("partial_order" in d) {
      checkNull(d.partial_order, field + ".partial_order");
    }
    if ("partial_percentage" in d) {
      checkNull(d.partial_percentage, field + ".partial_percentage");
    }
    if ("partially_cancelled" in d) {
      checkBoolean(d.partially_cancelled, field + ".partially_cancelled");
    }
    if ("past_payments" in d) {
      checkArray(d.past_payments, field + ".past_payments");
      if (d.past_payments) {
        for (let i = 0; i < d.past_payments.length; i++) {
          checkNever(d.past_payments[i], field + ".past_payments" + "[" + i + "]");
        }
      }
    }
    if ("payment_emitted_at" in d) {
      checkNull(d.payment_emitted_at, field + ".payment_emitted_at");
    }
    if ("payment_ids" in d) {
      checkArray(d.payment_ids, field + ".payment_ids");
      if (d.payment_ids) {
        for (let i = 0; i < d.payment_ids.length; i++) {
          checkNever(d.payment_ids[i], field + ".payment_ids" + "[" + i + "]");
        }
      }
    }
    if ("payment_in_process_started_at" in d) {
      checkNull(d.payment_in_process_started_at, field + ".payment_in_process_started_at");
    }
    if ("payment_method" in d) {
      checkNull(d.payment_method, field + ".payment_method");
    }
    if ("payment_methods" in d) {
      checkArray(d.payment_methods, field + ".payment_methods");
      if (d.payment_methods) {
        for (let i = 0; i < d.payment_methods.length; i++) {
          checkNever(d.payment_methods[i], field + ".payment_methods" + "[" + i + "]");
        }
      }
    }
    if ("payment_reference" in d) {
      checkString(d.payment_reference, field + ".payment_reference");
    }
    if ("payment_reminder_enabled" in d) {
      checkBoolean(d.payment_reminder_enabled, field + ".payment_reminder_enabled");
    }
    if ("payment_reminder_recipients" in d) {
      checkNull(d.payment_reminder_recipients, field + ".payment_reminder_recipients");
    }
    if ("payment_reminder_steps" in d) {
      checkArray(d.payment_reminder_steps, field + ".payment_reminder_steps");
      if (d.payment_reminder_steps) {
        for (let i = 0; i < d.payment_reminder_steps.length; i++) {
          checkNever(d.payment_reminder_steps[i], field + ".payment_reminder_steps" + "[" + i + "]");
        }
      }
    }
    if ("payment_status" in d) {
      checkString(d.payment_status, field + ".payment_status");
    }
    if ("payments" in d) {
      checkArray(d.payments, field + ".payments");
      if (d.payments) {
        for (let i = 0; i < d.payments.length; i++) {
          checkNever(d.payments[i], field + ".payments" + "[" + i + "]");
        }
      }
    }
    if ("pdf_description" in d) {
      checkNull(d.pdf_description, field + ".pdf_description");
    }
    if ("pdf_generation_status" in d) {
      checkString(d.pdf_generation_status, field + ".pdf_generation_status");
    }
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
    if ("pdp_refusal_reason" in d) {
      checkNull(d.pdp_refusal_reason, field + ".pdp_refusal_reason");
    }
    if ("pdp_status" in d) {
      checkNull(d.pdp_status, field + ".pdp_status");
    }
    if ("pending" in d) {
      checkBoolean(d.pending, field + ".pending");
    }
    if ("preview_status" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.preview_status, field + ".preview_status", "string | null");
      } catch (e) {
        try {
          checkNull(d.preview_status, field + ".preview_status", "string | null");
        } catch (e) {
        }
      }
    }
    if ("preview_urls" in d) {
      checkArray(d.preview_urls, field + ".preview_urls");
      if (d.preview_urls) {
        for (let i = 0; i < d.preview_urls.length; i++) {
          checkString(d.preview_urls[i], field + ".preview_urls" + "[" + i + "]");
        }
      }
    }
    if ("price_before_tax" in d) {
      checkString(d.price_before_tax, field + ".price_before_tax");
    }
    if ("primary_badge" in d) {
      checkString(d.primary_badge, field + ".primary_badge");
    }
    if ("pro_account_check_deposits" in d) {
      checkArray(d.pro_account_check_deposits, field + ".pro_account_check_deposits");
      if (d.pro_account_check_deposits) {
        for (let i = 0; i < d.pro_account_check_deposits.length; i++) {
          checkNever(d.pro_account_check_deposits[i], field + ".pro_account_check_deposits" + "[" + i + "]");
        }
      }
    }
    if ("public_link" in d) {
      checkNull(d.public_link, field + ".public_link");
    }
    if ("purchase_request_id" in d) {
      checkNull(d.purchase_request_id, field + ".purchase_request_id");
    }
    if ("purchase_request_ids" in d) {
      checkArray(d.purchase_request_ids, field + ".purchase_request_ids");
      if (d.purchase_request_ids) {
        for (let i = 0; i < d.purchase_request_ids.length; i++) {
          checkNever(d.purchase_request_ids[i], field + ".purchase_request_ids" + "[" + i + "]");
        }
      }
    }
    if ("pusher_channel" in d) {
      checkString(d.pusher_channel, field + ".pusher_channel");
    }
    if ("quote_group_uuid" in d) {
      checkString(d.quote_group_uuid, field + ".quote_group_uuid");
    }
    if ("quote_uid" in d) {
      checkNull(d.quote_uid, field + ".quote_uid");
    }
    if ("quotes" in d) {
      checkBoolean(d.quotes, field + ".quotes");
    }
    if ("readonly" in d) {
      checkBoolean(d.readonly, field + ".readonly");
    }
    if ("recipients" in d) {
      checkArray(d.recipients, field + ".recipients");
      if (d.recipients) {
        for (let i = 0; i < d.recipients.length; i++) {
          checkNever(d.recipients[i], field + ".recipients" + "[" + i + "]");
        }
      }
    }
    if ("reconciled" in d) {
      checkBoolean(d.reconciled, field + ".reconciled");
    }
    if ("remaining_amount" in d) {
      // This will be refactored in the next release.
      try {
        checkString(d.remaining_amount, field + ".remaining_amount", "string | null");
      } catch (e) {
        try {
          checkNull(d.remaining_amount, field + ".remaining_amount", "string | null");
        } catch (e) {
        }
      }
    }
    if ("requires_validation" in d) {
      checkBoolean(d.requires_validation, field + ".requires_validation");
    }
    if ("reviewed_by" in d) {
      checkNull(d.reviewed_by, field + ".reviewed_by");
    }
    if ("scored_transactions" in d) {
      checkNull(d.scored_transactions, field + ".scored_transactions");
    }
    if ("sepa_xml_exports" in d) {
      checkArray(d.sepa_xml_exports, field + ".sepa_xml_exports");
      if (d.sepa_xml_exports) {
        for (let i = 0; i < d.sepa_xml_exports.length; i++) {
          checkNever(d.sepa_xml_exports[i], field + ".sepa_xml_exports" + "[" + i + "]");
        }
      }
    }
    if ("show_duplicates_tab" in d) {
      checkBoolean(d.show_duplicates_tab, field + ".show_duplicates_tab");
    }
    if ("signed_type" in d) {
      checkString(d.signed_type, field + ".signed_type");
    }
    if ("size" in d) {
      checkString(d.size, field + ".size");
    }
    if ("source" in d) {
      checkString(d.source, field + ".source");
    }
    if ("source_document_id" in d) {
      checkNull(d.source_document_id, field + ".source_document_id");
    }
    if ("source_document_label" in d) {
      checkNull(d.source_document_label, field + ".source_document_label");
    }
    if ("source_metadata" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.source_metadata, field + ".source_metadata", "null | SourceMetadata");
      } catch (e) {
        try {
          d.source_metadata = SourceMetadata.Create(d.source_metadata, field + ".source_metadata", "null | SourceMetadata");
        } catch (e) {
        }
      }
    }
    if ("special_mention" in d) {
      checkNull(d.special_mention, field + ".special_mention");
    }
    if ("status" in d) {
      checkString(d.status, field + ".status");
    }
    if ("subcomplete" in d) {
      checkBoolean(d.subcomplete, field + ".subcomplete");
    }
    if ("tagged_at_ledger_events_level" in d) {
      checkBoolean(d.tagged_at_ledger_events_level, field + ".tagged_at_ledger_events_level");
    }
    if ("tax" in d) {
      checkString(d.tax, field + ".tax");
    }
    if ("team" in d) {
      checkNull(d.team, field + ".team");
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
    if ("thirdparty_id" in d) {
      // This will be refactored in the next release.
      try {
        checkNumber(d.thirdparty_id, field + ".thirdparty_id", "number | null");
      } catch (e) {
        try {
          checkNull(d.thirdparty_id, field + ".thirdparty_id", "number | null");
        } catch (e) {
        }
      }
    }
    checkString(d.type, field + ".type");
    if ("updated_at" in d) {
      checkString(d.updated_at, field + ".updated_at");
    }
    checkString(d.url, field + ".url");
    if ("use_manual_partial_invoices" in d) {
      checkBoolean(d.use_manual_partial_invoices, field + ".use_manual_partial_invoices");
    }
    if ("validated_at" in d) {
      checkNull(d.validated_at, field + ".validated_at");
    }
    if ("validation_needed" in d) {
      checkBoolean(d.validation_needed, field + ".validation_needed");
    }
    const knownProperties = ["accountants_status","active_payment_reminder_id","amount","annexes","appendices","approvable_record_id","approval_flow","archived","archived_at","attachment_required","bad_debt","been_manually_marked_as_paid","billing_subscription_id","can_be_attached_to_a_cheque_deposit","can_be_finalized","can_be_manually_marked_as_paid","can_be_manually_marked_as_sent","can_be_stamped_as_paid_in_pdf","can_be_unmarked_as_paid","can_be_unmarked_as_sent","can_request_a_fintecture_payment_url","cancellable","cancelled","checksum","client_comments_count","company_id","complete","completeness","created_at","credit_note","credit_notes","credit_notes_amount","credited_invoice_id","currency","currency_amount","currency_amount_before_tax","currency_price_before_tax","currency_tax","current_account_plan_item","current_account_plan_item_id","customer_validation_needed","date","deadline","defacto_loan_eligible","direction","discount","discount_type","display_reactivate_button","display_revoke_button","document_tags","draft","duplicates","email_from","embeddable_in_browser","external_id","factor_status","fec_pieceref","file_signed_id","filename","finalized_at","flow_approved","from_estimate_id","gdrive_path","gocardless_billing_subscription","group_uuid","grouped_at","grouped_documents","has_already_sent_an_email","has_credit_note","has_file","has_grouped_documents","has_linked_quotes","has_pending_payments","hasTooManyLedgerEvents","iban","id","incomplete","invoice_kind","invoice_lines","invoice_number","invoice_status","invoicing_detailed_source","is_credit_note","is_destroyable","is_estimate","is_factur_x","is_payment_emitted","is_payment_found","is_payment_in_process","is_reconciliation_delay_expired","is_sendable","is_waiting_for_ocr","journal_id","label","language","last_payment","ledgerEvents","ledgerEventsCount","manually_marked_as_paid_at","manually_marked_as_sent_at","match_badge_count","means_of_payment","method","min_permitted_issue_date","multiplier","not_duplicate","ocr_iban","ocr_thirdparty_id","opened_at","outstanding_balance","owner","pages_count","paid","paid_by","paid_personally","partial_kind","partial_order","partial_percentage","partially_cancelled","past_payments","payment_emitted_at","payment_ids","payment_in_process_started_at","payment_method","payment_methods","payment_reference","payment_reminder_enabled","payment_reminder_recipients","payment_reminder_steps","payment_status","payments","pdf_description","pdf_generation_status","pdf_invoice_display_products_list","pdf_invoice_free_text","pdf_invoice_free_text_enabled","pdf_invoice_subject","pdf_invoice_subject_enabled","pdf_invoice_title","pdf_paid_stamp","pdp_refusal_reason","pdp_status","pending","preview_status","preview_urls","price_before_tax","primary_badge","pro_account_check_deposits","public_link","purchase_request_id","purchase_request_ids","pusher_channel","quote_group_uuid","quote_uid","quotes","readonly","recipients","reconciled","remaining_amount","requires_validation","reviewed_by","scored_transactions","sepa_xml_exports","show_duplicates_tab","signed_type","size","source","source_document_id","source_document_label","source_metadata","special_mention","status","subcomplete","tagged_at_ledger_events_level","tax","team","thirdparty","thirdparty_id","type","updated_at","url","use_manual_partial_invoices","validated_at","validation_needed"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDocumentFull(d);
  }
  private constructor(d: any) {
    if ("accountants_status" in d) this.accountants_status = d.accountants_status;
    if ("active_payment_reminder_id" in d) this.active_payment_reminder_id = d.active_payment_reminder_id;
    if ("amount" in d) this.amount = d.amount;
    if ("annexes" in d) this.annexes = d.annexes;
    if ("appendices" in d) this.appendices = d.appendices;
    if ("approvable_record_id" in d) this.approvable_record_id = d.approvable_record_id;
    if ("approval_flow" in d) this.approval_flow = d.approval_flow;
    if ("archived" in d) this.archived = d.archived;
    if ("archived_at" in d) this.archived_at = d.archived_at;
    if ("attachment_required" in d) this.attachment_required = d.attachment_required;
    if ("bad_debt" in d) this.bad_debt = d.bad_debt;
    if ("been_manually_marked_as_paid" in d) this.been_manually_marked_as_paid = d.been_manually_marked_as_paid;
    if ("billing_subscription_id" in d) this.billing_subscription_id = d.billing_subscription_id;
    if ("can_be_attached_to_a_cheque_deposit" in d) this.can_be_attached_to_a_cheque_deposit = d.can_be_attached_to_a_cheque_deposit;
    if ("can_be_finalized" in d) this.can_be_finalized = d.can_be_finalized;
    if ("can_be_manually_marked_as_paid" in d) this.can_be_manually_marked_as_paid = d.can_be_manually_marked_as_paid;
    if ("can_be_manually_marked_as_sent" in d) this.can_be_manually_marked_as_sent = d.can_be_manually_marked_as_sent;
    if ("can_be_stamped_as_paid_in_pdf" in d) this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;
    if ("can_be_unmarked_as_paid" in d) this.can_be_unmarked_as_paid = d.can_be_unmarked_as_paid;
    if ("can_be_unmarked_as_sent" in d) this.can_be_unmarked_as_sent = d.can_be_unmarked_as_sent;
    if ("can_request_a_fintecture_payment_url" in d) this.can_request_a_fintecture_payment_url = d.can_request_a_fintecture_payment_url;
    if ("cancellable" in d) this.cancellable = d.cancellable;
    if ("cancelled" in d) this.cancelled = d.cancelled;
    if ("checksum" in d) this.checksum = d.checksum;
    if ("client_comments_count" in d) this.client_comments_count = d.client_comments_count;
    this.company_id = d.company_id;
    if ("complete" in d) this.complete = d.complete;
    if ("completeness" in d) this.completeness = d.completeness;
    if ("created_at" in d) this.created_at = d.created_at;
    if ("credit_note" in d) this.credit_note = d.credit_note;
    if ("credit_notes" in d) this.credit_notes = d.credit_notes;
    if ("credit_notes_amount" in d) this.credit_notes_amount = d.credit_notes_amount;
    if ("credited_invoice_id" in d) this.credited_invoice_id = d.credited_invoice_id;
    if ("currency" in d) this.currency = d.currency;
    if ("currency_amount" in d) this.currency_amount = d.currency_amount;
    if ("currency_amount_before_tax" in d) this.currency_amount_before_tax = d.currency_amount_before_tax;
    if ("currency_price_before_tax" in d) this.currency_price_before_tax = d.currency_price_before_tax;
    if ("currency_tax" in d) this.currency_tax = d.currency_tax;
    if ("current_account_plan_item" in d) this.current_account_plan_item = d.current_account_plan_item;
    if ("current_account_plan_item_id" in d) this.current_account_plan_item_id = d.current_account_plan_item_id;
    if ("customer_validation_needed" in d) this.customer_validation_needed = d.customer_validation_needed;
    if ("date" in d) this.date = d.date;
    if ("deadline" in d) this.deadline = d.deadline;
    if ("defacto_loan_eligible" in d) this.defacto_loan_eligible = d.defacto_loan_eligible;
    this.direction = d.direction;
    if ("discount" in d) this.discount = d.discount;
    if ("discount_type" in d) this.discount_type = d.discount_type;
    if ("display_reactivate_button" in d) this.display_reactivate_button = d.display_reactivate_button;
    if ("display_revoke_button" in d) this.display_revoke_button = d.display_revoke_button;
    if ("document_tags" in d) this.document_tags = d.document_tags;
    if ("draft" in d) this.draft = d.draft;
    if ("duplicates" in d) this.duplicates = d.duplicates;
    if ("email_from" in d) this.email_from = d.email_from;
    if ("embeddable_in_browser" in d) this.embeddable_in_browser = d.embeddable_in_browser;
    if ("external_id" in d) this.external_id = d.external_id;
    if ("factor_status" in d) this.factor_status = d.factor_status;
    if ("fec_pieceref" in d) this.fec_pieceref = d.fec_pieceref;
    if ("file_signed_id" in d) this.file_signed_id = d.file_signed_id;
    if ("filename" in d) this.filename = d.filename;
    if ("finalized_at" in d) this.finalized_at = d.finalized_at;
    if ("flow_approved" in d) this.flow_approved = d.flow_approved;
    if ("from_estimate_id" in d) this.from_estimate_id = d.from_estimate_id;
    if ("gdrive_path" in d) this.gdrive_path = d.gdrive_path;
    if ("gocardless_billing_subscription" in d) this.gocardless_billing_subscription = d.gocardless_billing_subscription;
    if ("group_uuid" in d) this.group_uuid = d.group_uuid;
    if ("grouped_at" in d) this.grouped_at = d.grouped_at;
    if ("grouped_documents" in d) this.grouped_documents = d.grouped_documents;
    if ("has_already_sent_an_email" in d) this.has_already_sent_an_email = d.has_already_sent_an_email;
    if ("has_credit_note" in d) this.has_credit_note = d.has_credit_note;
    this.has_file = d.has_file;
    if ("has_grouped_documents" in d) this.has_grouped_documents = d.has_grouped_documents;
    if ("has_linked_quotes" in d) this.has_linked_quotes = d.has_linked_quotes;
    if ("has_pending_payments" in d) this.has_pending_payments = d.has_pending_payments;
    if ("hasTooManyLedgerEvents" in d) this.hasTooManyLedgerEvents = d.hasTooManyLedgerEvents;
    if ("iban" in d) this.iban = d.iban;
    this.id = d.id;
    if ("incomplete" in d) this.incomplete = d.incomplete;
    if ("invoice_kind" in d) this.invoice_kind = d.invoice_kind;
    if ("invoice_lines" in d) this.invoice_lines = d.invoice_lines;
    if ("invoice_number" in d) this.invoice_number = d.invoice_number;
    if ("invoice_status" in d) this.invoice_status = d.invoice_status;
    if ("invoicing_detailed_source" in d) this.invoicing_detailed_source = d.invoicing_detailed_source;
    if ("is_credit_note" in d) this.is_credit_note = d.is_credit_note;
    if ("is_destroyable" in d) this.is_destroyable = d.is_destroyable;
    if ("is_estimate" in d) this.is_estimate = d.is_estimate;
    if ("is_factur_x" in d) this.is_factur_x = d.is_factur_x;
    if ("is_payment_emitted" in d) this.is_payment_emitted = d.is_payment_emitted;
    if ("is_payment_found" in d) this.is_payment_found = d.is_payment_found;
    if ("is_payment_in_process" in d) this.is_payment_in_process = d.is_payment_in_process;
    if ("is_reconciliation_delay_expired" in d) this.is_reconciliation_delay_expired = d.is_reconciliation_delay_expired;
    if ("is_sendable" in d) this.is_sendable = d.is_sendable;
    if ("is_waiting_for_ocr" in d) this.is_waiting_for_ocr = d.is_waiting_for_ocr;
    if ("journal_id" in d) this.journal_id = d.journal_id;
    if ("label" in d) this.label = d.label;
    if ("language" in d) this.language = d.language;
    if ("last_payment" in d) this.last_payment = d.last_payment;
    if ("ledgerEvents" in d) this.ledgerEvents = d.ledgerEvents;
    if ("ledgerEventsCount" in d) this.ledgerEventsCount = d.ledgerEventsCount;
    if ("manually_marked_as_paid_at" in d) this.manually_marked_as_paid_at = d.manually_marked_as_paid_at;
    if ("manually_marked_as_sent_at" in d) this.manually_marked_as_sent_at = d.manually_marked_as_sent_at;
    if ("match_badge_count" in d) this.match_badge_count = d.match_badge_count;
    if ("means_of_payment" in d) this.means_of_payment = d.means_of_payment;
    if ("method" in d) this.method = d.method;
    if ("min_permitted_issue_date" in d) this.min_permitted_issue_date = d.min_permitted_issue_date;
    if ("multiplier" in d) this.multiplier = d.multiplier;
    if ("not_duplicate" in d) this.not_duplicate = d.not_duplicate;
    if ("ocr_iban" in d) this.ocr_iban = d.ocr_iban;
    if ("ocr_thirdparty_id" in d) this.ocr_thirdparty_id = d.ocr_thirdparty_id;
    if ("opened_at" in d) this.opened_at = d.opened_at;
    if ("outstanding_balance" in d) this.outstanding_balance = d.outstanding_balance;
    if ("owner" in d) this.owner = d.owner;
    if ("pages_count" in d) this.pages_count = d.pages_count;
    if ("paid" in d) this.paid = d.paid;
    if ("paid_by" in d) this.paid_by = d.paid_by;
    if ("paid_personally" in d) this.paid_personally = d.paid_personally;
    if ("partial_kind" in d) this.partial_kind = d.partial_kind;
    if ("partial_order" in d) this.partial_order = d.partial_order;
    if ("partial_percentage" in d) this.partial_percentage = d.partial_percentage;
    if ("partially_cancelled" in d) this.partially_cancelled = d.partially_cancelled;
    if ("past_payments" in d) this.past_payments = d.past_payments;
    if ("payment_emitted_at" in d) this.payment_emitted_at = d.payment_emitted_at;
    if ("payment_ids" in d) this.payment_ids = d.payment_ids;
    if ("payment_in_process_started_at" in d) this.payment_in_process_started_at = d.payment_in_process_started_at;
    if ("payment_method" in d) this.payment_method = d.payment_method;
    if ("payment_methods" in d) this.payment_methods = d.payment_methods;
    if ("payment_reference" in d) this.payment_reference = d.payment_reference;
    if ("payment_reminder_enabled" in d) this.payment_reminder_enabled = d.payment_reminder_enabled;
    if ("payment_reminder_recipients" in d) this.payment_reminder_recipients = d.payment_reminder_recipients;
    if ("payment_reminder_steps" in d) this.payment_reminder_steps = d.payment_reminder_steps;
    if ("payment_status" in d) this.payment_status = d.payment_status;
    if ("payments" in d) this.payments = d.payments;
    if ("pdf_description" in d) this.pdf_description = d.pdf_description;
    if ("pdf_generation_status" in d) this.pdf_generation_status = d.pdf_generation_status;
    if ("pdf_invoice_display_products_list" in d) this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;
    if ("pdf_invoice_free_text" in d) this.pdf_invoice_free_text = d.pdf_invoice_free_text;
    if ("pdf_invoice_free_text_enabled" in d) this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;
    if ("pdf_invoice_subject" in d) this.pdf_invoice_subject = d.pdf_invoice_subject;
    if ("pdf_invoice_subject_enabled" in d) this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;
    if ("pdf_invoice_title" in d) this.pdf_invoice_title = d.pdf_invoice_title;
    if ("pdf_paid_stamp" in d) this.pdf_paid_stamp = d.pdf_paid_stamp;
    if ("pdp_refusal_reason" in d) this.pdp_refusal_reason = d.pdp_refusal_reason;
    if ("pdp_status" in d) this.pdp_status = d.pdp_status;
    if ("pending" in d) this.pending = d.pending;
    if ("preview_status" in d) this.preview_status = d.preview_status;
    if ("preview_urls" in d) this.preview_urls = d.preview_urls;
    if ("price_before_tax" in d) this.price_before_tax = d.price_before_tax;
    if ("primary_badge" in d) this.primary_badge = d.primary_badge;
    if ("pro_account_check_deposits" in d) this.pro_account_check_deposits = d.pro_account_check_deposits;
    if ("public_link" in d) this.public_link = d.public_link;
    if ("purchase_request_id" in d) this.purchase_request_id = d.purchase_request_id;
    if ("purchase_request_ids" in d) this.purchase_request_ids = d.purchase_request_ids;
    if ("pusher_channel" in d) this.pusher_channel = d.pusher_channel;
    if ("quote_group_uuid" in d) this.quote_group_uuid = d.quote_group_uuid;
    if ("quote_uid" in d) this.quote_uid = d.quote_uid;
    if ("quotes" in d) this.quotes = d.quotes;
    if ("readonly" in d) this.readonly = d.readonly;
    if ("recipients" in d) this.recipients = d.recipients;
    if ("reconciled" in d) this.reconciled = d.reconciled;
    if ("remaining_amount" in d) this.remaining_amount = d.remaining_amount;
    if ("requires_validation" in d) this.requires_validation = d.requires_validation;
    if ("reviewed_by" in d) this.reviewed_by = d.reviewed_by;
    if ("scored_transactions" in d) this.scored_transactions = d.scored_transactions;
    if ("sepa_xml_exports" in d) this.sepa_xml_exports = d.sepa_xml_exports;
    if ("show_duplicates_tab" in d) this.show_duplicates_tab = d.show_duplicates_tab;
    if ("signed_type" in d) this.signed_type = d.signed_type;
    if ("size" in d) this.size = d.size;
    if ("source" in d) this.source = d.source;
    if ("source_document_id" in d) this.source_document_id = d.source_document_id;
    if ("source_document_label" in d) this.source_document_label = d.source_document_label;
    if ("source_metadata" in d) this.source_metadata = d.source_metadata;
    if ("special_mention" in d) this.special_mention = d.special_mention;
    if ("status" in d) this.status = d.status;
    if ("subcomplete" in d) this.subcomplete = d.subcomplete;
    if ("tagged_at_ledger_events_level" in d) this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;
    if ("tax" in d) this.tax = d.tax;
    if ("team" in d) this.team = d.team;
    if ("thirdparty" in d) this.thirdparty = d.thirdparty;
    if ("thirdparty_id" in d) this.thirdparty_id = d.thirdparty_id;
    this.type = d.type;
    if ("updated_at" in d) this.updated_at = d.updated_at;
    this.url = d.url;
    if ("use_manual_partial_invoices" in d) this.use_manual_partial_invoices = d.use_manual_partial_invoices;
    if ("validated_at" in d) this.validated_at = d.validated_at;
    if ("validation_needed" in d) this.validation_needed = d.validation_needed;
  }
}

export class CreditNotesEntity {
  public readonly amount: string;
  public readonly created_at: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly currency_tax: string;
  public readonly date: string | null;
  public readonly file: File | null;
  public readonly has_file: boolean;
  public readonly id: number;
  public readonly invoice_number: string;
  public readonly tax: string;
  public static Parse(d: string): CreditNotesEntity {
    return CreditNotesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): CreditNotesEntity {
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
      }
    }
    // This will be refactored in the next release.
    try {
      d.file = File.Create(d.file, field + ".file", "File | null");
    } catch (e) {
      try {
        checkNull(d.file, field + ".file", "File | null");
      } catch (e) {
      }
    }
    checkBoolean(d.has_file, field + ".has_file");
    checkNumber(d.id, field + ".id");
    checkString(d.invoice_number, field + ".invoice_number");
    checkString(d.tax, field + ".tax");
    const knownProperties = ["amount","created_at","currency","currency_amount","currency_tax","date","file","has_file","id","invoice_number","tax"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new CreditNotesEntity(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.created_at = d.created_at;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.currency_tax = d.currency_tax;
    this.date = d.date;
    this.file = d.file;
    this.has_file = d.has_file;
    this.id = d.id;
    this.invoice_number = d.invoice_number;
    this.tax = d.tax;
  }
}

export class File {
  public readonly byte_size: number;
  public readonly created_at: string;
  public readonly embeddable_in_browser: boolean;
  public readonly filename: string;
  public readonly id: number;
  public readonly preview_url: string;
  public readonly signed_id: string;
  public readonly url: string;
  public static Parse(d: string): File {
    return File.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): File {
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
    checkNumber(d.byte_size, field + ".byte_size");
    checkString(d.created_at, field + ".created_at");
    checkBoolean(d.embeddable_in_browser, field + ".embeddable_in_browser");
    checkString(d.filename, field + ".filename");
    checkNumber(d.id, field + ".id");
    checkString(d.preview_url, field + ".preview_url");
    checkString(d.signed_id, field + ".signed_id");
    checkString(d.url, field + ".url");
    const knownProperties = ["byte_size","created_at","embeddable_in_browser","filename","id","preview_url","signed_id","url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new File(d);
  }
  private constructor(d: any) {
    this.byte_size = d.byte_size;
    this.created_at = d.created_at;
    this.embeddable_in_browser = d.embeddable_in_browser;
    this.filename = d.filename;
    this.id = d.id;
    this.preview_url = d.preview_url;
    this.signed_id = d.signed_id;
    this.url = d.url;
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
  public readonly analytical_code?: null;
  public readonly color: string;
  public readonly direction?: string;
  public readonly group: Group;
  public readonly group_id: number;
  public readonly icon: null;
  public readonly id: number;
  public readonly is_editable?: boolean;
  public readonly label: string;
  public readonly method?: string;
  public readonly rank?: number;
  public readonly restricted_from_user?: boolean;
  public readonly url?: string;
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
    if ("analytical_code" in d) {
      checkNull(d.analytical_code, field + ".analytical_code");
    }
    checkString(d.color, field + ".color");
    if ("direction" in d) {
      checkString(d.direction, field + ".direction");
    }
    d.group = Group.Create(d.group, field + ".group");
    checkNumber(d.group_id, field + ".group_id");
    checkNull(d.icon, field + ".icon");
    checkNumber(d.id, field + ".id");
    if ("is_editable" in d) {
      checkBoolean(d.is_editable, field + ".is_editable");
    }
    checkString(d.label, field + ".label");
    if ("method" in d) {
      checkString(d.method, field + ".method");
    }
    if ("rank" in d) {
      checkNumber(d.rank, field + ".rank");
    }
    if ("restricted_from_user" in d) {
      checkBoolean(d.restricted_from_user, field + ".restricted_from_user");
    }
    if ("url" in d) {
      checkString(d.url, field + ".url");
    }
    checkNull(d.variant, field + ".variant");
    const knownProperties = ["analytical_code","color","direction","group","group_id","icon","id","is_editable","label","method","rank","restricted_from_user","url","variant"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Tag(d);
  }
  private constructor(d: any) {
    if ("analytical_code" in d) this.analytical_code = d.analytical_code;
    this.color = d.color;
    if ("direction" in d) this.direction = d.direction;
    this.group = d.group;
    this.group_id = d.group_id;
    this.icon = d.icon;
    this.id = d.id;
    if ("is_editable" in d) this.is_editable = d.is_editable;
    this.label = d.label;
    if ("method" in d) this.method = d.method;
    if ("rank" in d) this.rank = d.rank;
    if ("restricted_from_user" in d) this.restricted_from_user = d.restricted_from_user;
    if ("url" in d) this.url = d.url;
    this.variant = d.variant;
  }
}

export class Group {
  public readonly icon: string;
  public readonly id?: number;
  public readonly kind?: string;
  public readonly label: string;
  public readonly method?: string;
  public readonly qonto_id?: null;
  public readonly self_service_accounting: boolean;
  public readonly url?: string;
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
    if ("id" in d) {
      checkNumber(d.id, field + ".id");
    }
    if ("kind" in d) {
      checkString(d.kind, field + ".kind");
    }
    checkString(d.label, field + ".label");
    if ("method" in d) {
      checkString(d.method, field + ".method");
    }
    if ("qonto_id" in d) {
      checkNull(d.qonto_id, field + ".qonto_id");
    }
    checkBoolean(d.self_service_accounting, field + ".self_service_accounting");
    if ("url" in d) {
      checkString(d.url, field + ".url");
    }
    const knownProperties = ["icon","id","kind","label","method","qonto_id","self_service_accounting","url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Group(d);
  }
  private constructor(d: any) {
    this.icon = d.icon;
    if ("id" in d) this.id = d.id;
    if ("kind" in d) this.kind = d.kind;
    this.label = d.label;
    if ("method" in d) this.method = d.method;
    if ("qonto_id" in d) this.qonto_id = d.qonto_id;
    this.self_service_accounting = d.self_service_accounting;
    if ("url" in d) this.url = d.url;
  }
}

export class DuplicatesEntity {
  public readonly amount: string;
  public readonly currency: string;
  public readonly currency_amount: string;
  public readonly date: string;
  public readonly direction: string;
  public readonly has_grouped_documents: boolean;
  public readonly id: number;
  public readonly invoice_number: string;
  public readonly not_duplicate: boolean;
  public readonly source: string;
  public readonly thirdparty: Thirdparty1;
  public static Parse(d: string): DuplicatesEntity {
    return DuplicatesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): DuplicatesEntity {
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
    checkString(d.currency, field + ".currency");
    checkString(d.currency_amount, field + ".currency_amount");
    checkString(d.date, field + ".date");
    checkString(d.direction, field + ".direction");
    checkBoolean(d.has_grouped_documents, field + ".has_grouped_documents");
    checkNumber(d.id, field + ".id");
    checkString(d.invoice_number, field + ".invoice_number");
    checkBoolean(d.not_duplicate, field + ".not_duplicate");
    checkString(d.source, field + ".source");
    d.thirdparty = Thirdparty1.Create(d.thirdparty, field + ".thirdparty");
    const knownProperties = ["amount","currency","currency_amount","date","direction","has_grouped_documents","id","invoice_number","not_duplicate","source","thirdparty"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new DuplicatesEntity(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.currency = d.currency;
    this.currency_amount = d.currency_amount;
    this.date = d.date;
    this.direction = d.direction;
    this.has_grouped_documents = d.has_grouped_documents;
    this.id = d.id;
    this.invoice_number = d.invoice_number;
    this.not_duplicate = d.not_duplicate;
    this.source = d.source;
    this.thirdparty = d.thirdparty;
  }
}

export class Thirdparty1 {
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly emails: never[];
  public readonly iban: string;
  public readonly id: number;
  public readonly name: string;
  public readonly notes: string;
  public readonly notes_last_updated_at: null;
  public readonly notes_last_updated_by_name: null;
  public readonly supplier_due_date_delay: null;
  public readonly supplier_due_date_rule: string;
  public readonly supplier_payment_method: null;
  public readonly supplier_payment_method_last_updated_at: string | null;
  public readonly validation_status: string;
  public static Parse(d: string): Thirdparty1 {
    return Thirdparty1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Thirdparty1 {
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
    checkArray(d.emails, field + ".emails");
    if (d.emails) {
      for (let i = 0; i < d.emails.length; i++) {
        checkNever(d.emails[i], field + ".emails" + "[" + i + "]");
      }
    }
    checkString(d.iban, field + ".iban");
    checkNumber(d.id, field + ".id");
    checkString(d.name, field + ".name");
    checkString(d.notes, field + ".notes");
    checkNull(d.notes_last_updated_at, field + ".notes_last_updated_at");
    checkNull(d.notes_last_updated_by_name, field + ".notes_last_updated_by_name");
    checkNull(d.supplier_due_date_delay, field + ".supplier_due_date_delay");
    checkString(d.supplier_due_date_rule, field + ".supplier_due_date_rule");
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
    checkString(d.validation_status, field + ".validation_status");
    const knownProperties = ["company_id","country_alpha2","emails","iban","id","name","notes","notes_last_updated_at","notes_last_updated_by_name","supplier_due_date_delay","supplier_due_date_rule","supplier_payment_method","supplier_payment_method_last_updated_at","validation_status"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Thirdparty1(d);
  }
  private constructor(d: any) {
    this.company_id = d.company_id;
    this["country_alpha2"] = d["country_alpha2"];
    this.emails = d.emails;
    this.iban = d.iban;
    this.id = d.id;
    this.name = d.name;
    this.notes = d.notes;
    this.notes_last_updated_at = d.notes_last_updated_at;
    this.notes_last_updated_by_name = d.notes_last_updated_by_name;
    this.supplier_due_date_delay = d.supplier_due_date_delay;
    this.supplier_due_date_rule = d.supplier_due_date_rule;
    this.supplier_payment_method = d.supplier_payment_method;
    this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;
    this.validation_status = d.validation_status;
  }
}

export class GroupedDocumentsEntity {
  public readonly company_id: number;
  public readonly direction: string | null;
  public readonly embeddable_in_browser: boolean;
  public readonly filename: string | null;
  public readonly has_file: boolean;
  public readonly id: number;
  public readonly preview_status: string | null;
  public readonly preview_urls: never[];
  public readonly pusher_channel: string;
  public readonly size: string | null;
  public readonly type: string;
  public readonly url: string;
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
    checkNumber(d.company_id, field + ".company_id");
    // This will be refactored in the next release.
    try {
      checkString(d.direction, field + ".direction", "string | null");
    } catch (e) {
      try {
        checkNull(d.direction, field + ".direction", "string | null");
      } catch (e) {
      }
    }
    checkBoolean(d.embeddable_in_browser, field + ".embeddable_in_browser");
    // This will be refactored in the next release.
    try {
      checkString(d.filename, field + ".filename", "string | null");
    } catch (e) {
      try {
        checkNull(d.filename, field + ".filename", "string | null");
      } catch (e) {
      }
    }
    checkBoolean(d.has_file, field + ".has_file");
    checkNumber(d.id, field + ".id");
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
        checkNever(d.preview_urls[i], field + ".preview_urls" + "[" + i + "]");
      }
    }
    checkString(d.pusher_channel, field + ".pusher_channel");
    // This will be refactored in the next release.
    try {
      checkString(d.size, field + ".size", "string | null");
    } catch (e) {
      try {
        checkNull(d.size, field + ".size", "string | null");
      } catch (e) {
      }
    }
    checkString(d.type, field + ".type");
    checkString(d.url, field + ".url");
    const knownProperties = ["company_id","direction","embeddable_in_browser","filename","has_file","id","preview_status","preview_urls","pusher_channel","size","type","url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new GroupedDocumentsEntity(d);
  }
  private constructor(d: any) {
    this.company_id = d.company_id;
    this.direction = d.direction;
    this.embeddable_in_browser = d.embeddable_in_browser;
    this.filename = d.filename;
    this.has_file = d.has_file;
    this.id = d.id;
    this.preview_status = d.preview_status;
    this.preview_urls = d.preview_urls;
    this.pusher_channel = d.pusher_channel;
    this.size = d.size;
    this.type = d.type;
    this.url = d.url;
  }
}

export class InvoiceLinesEntity {
  public readonly advance_id?: null;
  public readonly amount: string;
  public readonly asset_id?: null;
  public readonly company_id?: number;
  public readonly created_at?: string;
  public readonly currency_amount: string;
  public readonly currency_price_before_tax: string;
  public readonly currency_tax: string;
  public readonly deferral: null;
  public readonly deferral_id: null;
  public readonly description: string;
  public readonly discount?: string;
  public readonly discount_type?: string;
  public readonly document_id?: number;
  public readonly global_vat: boolean;
  public readonly id: number;
  public readonly invoice_line_period: null;
  public readonly invoice_line_section_id?: null | number;
  public readonly label?: string;
  public readonly manual_vat_mode?: boolean;
  public readonly ocr_vat_rate?: null;
  public readonly pnl_plan_item_id: number;
  public readonly prepaid_pnl?: boolean;
  public readonly price_before_tax: string;
  public readonly product_id: null;
  public readonly quantity: string;
  public readonly rank?: null | number;
  public readonly raw_currency_unit_price?: string;
  public readonly tax: string;
  public readonly undiscounted_currency_price_before_tax?: string;
  public readonly unit?: null | string;
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
    if ("advance_id" in d) {
      checkNull(d.advance_id, field + ".advance_id");
    }
    checkString(d.amount, field + ".amount");
    if ("asset_id" in d) {
      checkNull(d.asset_id, field + ".asset_id");
    }
    if ("company_id" in d) {
      checkNumber(d.company_id, field + ".company_id");
    }
    if ("created_at" in d) {
      checkString(d.created_at, field + ".created_at");
    }
    checkString(d.currency_amount, field + ".currency_amount");
    checkString(d.currency_price_before_tax, field + ".currency_price_before_tax");
    checkString(d.currency_tax, field + ".currency_tax");
    checkNull(d.deferral, field + ".deferral");
    checkNull(d.deferral_id, field + ".deferral_id");
    checkString(d.description, field + ".description");
    if ("discount" in d) {
      checkString(d.discount, field + ".discount");
    }
    if ("discount_type" in d) {
      checkString(d.discount_type, field + ".discount_type");
    }
    if ("document_id" in d) {
      checkNumber(d.document_id, field + ".document_id");
    }
    checkBoolean(d.global_vat, field + ".global_vat");
    checkNumber(d.id, field + ".id");
    checkNull(d.invoice_line_period, field + ".invoice_line_period");
    if ("invoice_line_section_id" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.invoice_line_section_id, field + ".invoice_line_section_id", "null | number");
      } catch (e) {
        try {
          checkNumber(d.invoice_line_section_id, field + ".invoice_line_section_id", "null | number");
        } catch (e) {
        }
      }
    }
    if ("label" in d) {
      checkString(d.label, field + ".label");
    }
    if ("manual_vat_mode" in d) {
      checkBoolean(d.manual_vat_mode, field + ".manual_vat_mode");
    }
    if ("ocr_vat_rate" in d) {
      checkNull(d.ocr_vat_rate, field + ".ocr_vat_rate");
    }
    checkNumber(d.pnl_plan_item_id, field + ".pnl_plan_item_id");
    if ("prepaid_pnl" in d) {
      checkBoolean(d.prepaid_pnl, field + ".prepaid_pnl");
    }
    checkString(d.price_before_tax, field + ".price_before_tax");
    checkNull(d.product_id, field + ".product_id");
    checkString(d.quantity, field + ".quantity");
    if ("rank" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.rank, field + ".rank", "null | number");
      } catch (e) {
        try {
          checkNumber(d.rank, field + ".rank", "null | number");
        } catch (e) {
        }
      }
    }
    if ("raw_currency_unit_price" in d) {
      checkString(d.raw_currency_unit_price, field + ".raw_currency_unit_price");
    }
    checkString(d.tax, field + ".tax");
    if ("undiscounted_currency_price_before_tax" in d) {
      checkString(d.undiscounted_currency_price_before_tax, field + ".undiscounted_currency_price_before_tax");
    }
    if ("unit" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.unit, field + ".unit", "null | string");
      } catch (e) {
        try {
          checkString(d.unit, field + ".unit", "null | string");
        } catch (e) {
        }
      }
    }
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["advance_id","amount","asset_id","company_id","created_at","currency_amount","currency_price_before_tax","currency_tax","deferral","deferral_id","description","discount","discount_type","document_id","global_vat","id","invoice_line_period","invoice_line_section_id","label","manual_vat_mode","ocr_vat_rate","pnl_plan_item_id","prepaid_pnl","price_before_tax","product_id","quantity","rank","raw_currency_unit_price","tax","undiscounted_currency_price_before_tax","unit","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new InvoiceLinesEntity(d);
  }
  private constructor(d: any) {
    if ("advance_id" in d) this.advance_id = d.advance_id;
    this.amount = d.amount;
    if ("asset_id" in d) this.asset_id = d.asset_id;
    if ("company_id" in d) this.company_id = d.company_id;
    if ("created_at" in d) this.created_at = d.created_at;
    this.currency_amount = d.currency_amount;
    this.currency_price_before_tax = d.currency_price_before_tax;
    this.currency_tax = d.currency_tax;
    this.deferral = d.deferral;
    this.deferral_id = d.deferral_id;
    this.description = d.description;
    if ("discount" in d) this.discount = d.discount;
    if ("discount_type" in d) this.discount_type = d.discount_type;
    if ("document_id" in d) this.document_id = d.document_id;
    this.global_vat = d.global_vat;
    this.id = d.id;
    this.invoice_line_period = d.invoice_line_period;
    if ("invoice_line_section_id" in d) this.invoice_line_section_id = d.invoice_line_section_id;
    if ("label" in d) this.label = d.label;
    if ("manual_vat_mode" in d) this.manual_vat_mode = d.manual_vat_mode;
    if ("ocr_vat_rate" in d) this.ocr_vat_rate = d.ocr_vat_rate;
    this.pnl_plan_item_id = d.pnl_plan_item_id;
    if ("prepaid_pnl" in d) this.prepaid_pnl = d.prepaid_pnl;
    this.price_before_tax = d.price_before_tax;
    this.product_id = d.product_id;
    this.quantity = d.quantity;
    if ("rank" in d) this.rank = d.rank;
    if ("raw_currency_unit_price" in d) this.raw_currency_unit_price = d.raw_currency_unit_price;
    this.tax = d.tax;
    if ("undiscounted_currency_price_before_tax" in d) this.undiscounted_currency_price_before_tax = d.undiscounted_currency_price_before_tax;
    if ("unit" in d) this.unit = d.unit;
    this.vat_rate = d.vat_rate;
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
  public readonly id: number;
  public readonly label: null;
  public readonly lettering: Lettering | null;
  public readonly lettering_id: number | null;
  public readonly plan_item_id: number;
  public readonly planItem: PlanItem;
  public readonly readonly: boolean;
  public readonly readonlyAmounts: boolean;
  public readonly reallocation_id: null;
  public readonly reconciliation_id: null;
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
    checkNumber(d.id, field + ".id");
    checkNull(d.label, field + ".label");
    // This will be refactored in the next release.
    try {
      d.lettering = Lettering.Create(d.lettering, field + ".lettering", "Lettering | null");
    } catch (e) {
      try {
        checkNull(d.lettering, field + ".lettering", "Lettering | null");
      } catch (e) {
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
    d.planItem = PlanItem.Create(d.planItem, field + ".planItem");
    checkBoolean(d.readonly, field + ".readonly");
    checkBoolean(d.readonlyAmounts, field + ".readonlyAmounts");
    checkNull(d.reallocation_id, field + ".reallocation_id");
    checkNull(d.reconciliation_id, field + ".reconciliation_id");
    checkString(d.source, field + ".source");
    const knownProperties = ["balance","company_id","created_at","credit","date","debit","document_id","id","label","lettering","lettering_id","plan_item_id","planItem","readonly","readonlyAmounts","reallocation_id","reconciliation_id","source"];
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
    this.id = d.id;
    this.label = d.label;
    this.lettering = d.lettering;
    this.lettering_id = d.lettering_id;
    this.plan_item_id = d.plan_item_id;
    this.planItem = d.planItem;
    this.readonly = d.readonly;
    this.readonlyAmounts = d.readonlyAmounts;
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

export class PlanItem {
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly internal_identifier: null;
  public readonly label: string;
  public readonly label_is_editable: boolean;
  public readonly number: string;
  public readonly vat_rate: string;
  public static Parse(d: string): PlanItem {
    return PlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItem {
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
    return new PlanItem(d);
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

export class SourceMetadata {
  public readonly from: null;
  public readonly path: string;
  public static Parse(d: string): SourceMetadata {
    return SourceMetadata.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): SourceMetadata {
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
    checkNull(d.from, field + ".from");
    checkString(d.path, field + ".path");
    const knownProperties = ["from","path"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new SourceMetadata(d);
  }
  private constructor(d: any) {
    this.from = d.from;
    this.path = d.path;
  }
}

export class Thirdparty {
  public readonly activity_code?: string;
  public readonly activity_nomenclature?: string;
  public readonly address?: string;
  public readonly balance?: null;
  public readonly billing_bank?: null;
  public readonly billing_bic?: null;
  public readonly billing_footer_invoice_id?: null;
  public readonly billing_iban?: null;
  public readonly billing_language?: string;
  public readonly city?: string;
  public readonly company_id: number;
  public readonly complete?: boolean;
  public readonly country?: null;
  public readonly "country_alpha2": string;
  public readonly credits?: null;
  public readonly customer_type?: string;
  public readonly debits?: null;
  public readonly delivery_address?: string;
  public readonly delivery_city?: string;
  public readonly delivery_country?: null;
  public readonly "delivery_country_alpha2"?: string;
  public readonly delivery_postal_code?: string;
  public readonly disable_pending_vat?: boolean;
  public readonly display_name?: null;
  public readonly emails: never[];
  public readonly estimate_count?: null;
  public readonly first_name?: string;
  public readonly gender?: null;
  public readonly gocardless_id?: null;
  public readonly iban: string;
  public readonly iban_last_update?: null | IbanLastUpdate;
  public readonly id: number;
  public readonly invoice_count?: null;
  public readonly invoice_dump_id?: null;
  public readonly invoices_auto_generated?: boolean;
  public readonly invoices_auto_validated?: boolean;
  public readonly known_supplier_id?: null;
  public readonly last_name?: string;
  public readonly ledger_events_count?: null;
  public readonly legal_form_code?: string;
  public readonly method?: string;
  public readonly name: string;
  public readonly notes: string;
  public readonly notes_last_updated_at?: null;
  public readonly notes_last_updated_by_name?: null;
  public readonly payment_conditions?: string;
  public readonly phone?: string;
  public readonly plan_item_id?: number;
  public readonly pnl_plan_item_id?: number;
  public readonly postal_code?: string;
  public readonly purchase_request_count?: null;
  public readonly recipient?: string;
  public readonly recurrent?: boolean;
  public readonly reference?: string;
  public readonly reg_no?: string;
  public readonly role?: string;
  public readonly rule_enabled?: boolean;
  public readonly search_terms?: string[];
  public readonly source_id?: string;
  public readonly stripe_id?: null;
  public readonly supplier_due_date_delay?: null;
  public readonly supplier_due_date_rule?: string;
  public readonly supplier_ibans?: never[];
  public readonly supplier_payment_method: null;
  public readonly supplier_payment_method_last_updated_at: null | string;
  public readonly turnover?: null;
  public readonly url?: string;
  public readonly validation_status?: string;
  public readonly vat_number?: string;
  public readonly vat_rate?: string;
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
    if ("billing_iban" in d) {
      checkNull(d.billing_iban, field + ".billing_iban");
    }
    if ("billing_language" in d) {
      checkString(d.billing_language, field + ".billing_language");
    }
    if ("city" in d) {
      checkString(d.city, field + ".city");
    }
    checkNumber(d.company_id, field + ".company_id");
    if ("complete" in d) {
      checkBoolean(d.complete, field + ".complete");
    }
    if ("country" in d) {
      checkNull(d.country, field + ".country");
    }
    checkString(d["country_alpha2"], field + ".country_alpha2");
    if ("credits" in d) {
      checkNull(d.credits, field + ".credits");
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
    checkArray(d.emails, field + ".emails");
    if (d.emails) {
      for (let i = 0; i < d.emails.length; i++) {
        checkNever(d.emails[i], field + ".emails" + "[" + i + "]");
      }
    }
    if ("estimate_count" in d) {
      checkNull(d.estimate_count, field + ".estimate_count");
    }
    if ("first_name" in d) {
      checkString(d.first_name, field + ".first_name");
    }
    if ("gender" in d) {
      checkNull(d.gender, field + ".gender");
    }
    if ("gocardless_id" in d) {
      checkNull(d.gocardless_id, field + ".gocardless_id");
    }
    checkString(d.iban, field + ".iban");
    if ("iban_last_update" in d) {
      // This will be refactored in the next release.
      try {
        checkNull(d.iban_last_update, field + ".iban_last_update", "null | IbanLastUpdate");
      } catch (e) {
        try {
          d.iban_last_update = IbanLastUpdate.Create(d.iban_last_update, field + ".iban_last_update", "null | IbanLastUpdate");
        } catch (e) {
        }
      }
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
      checkNull(d.known_supplier_id, field + ".known_supplier_id");
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
    checkString(d.notes, field + ".notes");
    if ("notes_last_updated_at" in d) {
      checkNull(d.notes_last_updated_at, field + ".notes_last_updated_at");
    }
    if ("notes_last_updated_by_name" in d) {
      checkNull(d.notes_last_updated_by_name, field + ".notes_last_updated_by_name");
    }
    if ("payment_conditions" in d) {
      checkString(d.payment_conditions, field + ".payment_conditions");
    }
    if ("phone" in d) {
      checkString(d.phone, field + ".phone");
    }
    if ("plan_item_id" in d) {
      checkNumber(d.plan_item_id, field + ".plan_item_id");
    }
    if ("pnl_plan_item_id" in d) {
      checkNumber(d.pnl_plan_item_id, field + ".pnl_plan_item_id");
    }
    if ("postal_code" in d) {
      checkString(d.postal_code, field + ".postal_code");
    }
    if ("purchase_request_count" in d) {
      checkNull(d.purchase_request_count, field + ".purchase_request_count");
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
    if ("supplier_due_date_delay" in d) {
      checkNull(d.supplier_due_date_delay, field + ".supplier_due_date_delay");
    }
    if ("supplier_due_date_rule" in d) {
      checkString(d.supplier_due_date_rule, field + ".supplier_due_date_rule");
    }
    if ("supplier_ibans" in d) {
      checkArray(d.supplier_ibans, field + ".supplier_ibans");
      if (d.supplier_ibans) {
        for (let i = 0; i < d.supplier_ibans.length; i++) {
          checkNever(d.supplier_ibans[i], field + ".supplier_ibans" + "[" + i + "]");
        }
      }
    }
    checkNull(d.supplier_payment_method, field + ".supplier_payment_method");
    // This will be refactored in the next release.
    try {
      checkNull(d.supplier_payment_method_last_updated_at, field + ".supplier_payment_method_last_updated_at", "null | string");
    } catch (e) {
      try {
        checkString(d.supplier_payment_method_last_updated_at, field + ".supplier_payment_method_last_updated_at", "null | string");
      } catch (e) {
      }
    }
    if ("turnover" in d) {
      checkNull(d.turnover, field + ".turnover");
    }
    if ("url" in d) {
      checkString(d.url, field + ".url");
    }
    if ("validation_status" in d) {
      checkString(d.validation_status, field + ".validation_status");
    }
    if ("vat_number" in d) {
      checkString(d.vat_number, field + ".vat_number");
    }
    if ("vat_rate" in d) {
      checkString(d.vat_rate, field + ".vat_rate");
    }
    const knownProperties = ["activity_code","activity_nomenclature","address","balance","billing_bank","billing_bic","billing_footer_invoice_id","billing_iban","billing_language","city","company_id","complete","country","country_alpha2","credits","customer_type","debits","delivery_address","delivery_city","delivery_country","delivery_country_alpha2","delivery_postal_code","disable_pending_vat","display_name","emails","estimate_count","first_name","gender","gocardless_id","iban","iban_last_update","id","invoice_count","invoice_dump_id","invoices_auto_generated","invoices_auto_validated","known_supplier_id","last_name","ledger_events_count","legal_form_code","method","name","notes","notes_last_updated_at","notes_last_updated_by_name","payment_conditions","phone","plan_item_id","pnl_plan_item_id","postal_code","purchase_request_count","recipient","recurrent","reference","reg_no","role","rule_enabled","search_terms","source_id","stripe_id","supplier_due_date_delay","supplier_due_date_rule","supplier_ibans","supplier_payment_method","supplier_payment_method_last_updated_at","turnover","url","validation_status","vat_number","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Thirdparty(d);
  }
  private constructor(d: any) {
    if ("activity_code" in d) this.activity_code = d.activity_code;
    if ("activity_nomenclature" in d) this.activity_nomenclature = d.activity_nomenclature;
    if ("address" in d) this.address = d.address;
    if ("balance" in d) this.balance = d.balance;
    if ("billing_bank" in d) this.billing_bank = d.billing_bank;
    if ("billing_bic" in d) this.billing_bic = d.billing_bic;
    if ("billing_footer_invoice_id" in d) this.billing_footer_invoice_id = d.billing_footer_invoice_id;
    if ("billing_iban" in d) this.billing_iban = d.billing_iban;
    if ("billing_language" in d) this.billing_language = d.billing_language;
    if ("city" in d) this.city = d.city;
    this.company_id = d.company_id;
    if ("complete" in d) this.complete = d.complete;
    if ("country" in d) this.country = d.country;
    this["country_alpha2"] = d["country_alpha2"];
    if ("credits" in d) this.credits = d.credits;
    if ("customer_type" in d) this.customer_type = d.customer_type;
    if ("debits" in d) this.debits = d.debits;
    if ("delivery_address" in d) this.delivery_address = d.delivery_address;
    if ("delivery_city" in d) this.delivery_city = d.delivery_city;
    if ("delivery_country" in d) this.delivery_country = d.delivery_country;
    if ("delivery_country_alpha2" in d) this["delivery_country_alpha2"] = d["delivery_country_alpha2"];
    if ("delivery_postal_code" in d) this.delivery_postal_code = d.delivery_postal_code;
    if ("disable_pending_vat" in d) this.disable_pending_vat = d.disable_pending_vat;
    if ("display_name" in d) this.display_name = d.display_name;
    this.emails = d.emails;
    if ("estimate_count" in d) this.estimate_count = d.estimate_count;
    if ("first_name" in d) this.first_name = d.first_name;
    if ("gender" in d) this.gender = d.gender;
    if ("gocardless_id" in d) this.gocardless_id = d.gocardless_id;
    this.iban = d.iban;
    if ("iban_last_update" in d) this.iban_last_update = d.iban_last_update;
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
    this.notes = d.notes;
    if ("notes_last_updated_at" in d) this.notes_last_updated_at = d.notes_last_updated_at;
    if ("notes_last_updated_by_name" in d) this.notes_last_updated_by_name = d.notes_last_updated_by_name;
    if ("payment_conditions" in d) this.payment_conditions = d.payment_conditions;
    if ("phone" in d) this.phone = d.phone;
    if ("plan_item_id" in d) this.plan_item_id = d.plan_item_id;
    if ("pnl_plan_item_id" in d) this.pnl_plan_item_id = d.pnl_plan_item_id;
    if ("postal_code" in d) this.postal_code = d.postal_code;
    if ("purchase_request_count" in d) this.purchase_request_count = d.purchase_request_count;
    if ("recipient" in d) this.recipient = d.recipient;
    if ("recurrent" in d) this.recurrent = d.recurrent;
    if ("reference" in d) this.reference = d.reference;
    if ("reg_no" in d) this.reg_no = d.reg_no;
    if ("role" in d) this.role = d.role;
    if ("rule_enabled" in d) this.rule_enabled = d.rule_enabled;
    if ("search_terms" in d) this.search_terms = d.search_terms;
    if ("source_id" in d) this.source_id = d.source_id;
    if ("stripe_id" in d) this.stripe_id = d.stripe_id;
    if ("supplier_due_date_delay" in d) this.supplier_due_date_delay = d.supplier_due_date_delay;
    if ("supplier_due_date_rule" in d) this.supplier_due_date_rule = d.supplier_due_date_rule;
    if ("supplier_ibans" in d) this.supplier_ibans = d.supplier_ibans;
    this.supplier_payment_method = d.supplier_payment_method;
    this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;
    if ("turnover" in d) this.turnover = d.turnover;
    if ("url" in d) this.url = d.url;
    if ("validation_status" in d) this.validation_status = d.validation_status;
    if ("vat_number" in d) this.vat_number = d.vat_number;
    if ("vat_rate" in d) this.vat_rate = d.vat_rate;
  }
}

export class IbanLastUpdate {
  public readonly at: string;
  public readonly from_pennylane: boolean;
  public readonly name: string;
  public static Parse(d: string): IbanLastUpdate {
    return IbanLastUpdate.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): IbanLastUpdate {
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
    checkString(d.at, field + ".at");
    checkBoolean(d.from_pennylane, field + ".from_pennylane");
    checkString(d.name, field + ".name");
    const knownProperties = ["at","from_pennylane","name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new IbanLastUpdate(d);
  }
  private constructor(d: any) {
    this.at = d.at;
    this.from_pennylane = d.from_pennylane;
    this.name = d.name;
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
