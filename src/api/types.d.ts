import type Item from '../models/Item.js';

declare type List<ItemName extends string, ItemType> = {
  pagination: {
    hasNextPage: boolean;
    page: number;
    pages: number;
    totalEntries: number;
    totalEntriesPrecision: 'approximate' | 'exact';
    totalEntriesStr: string;
  }
  pageSize: number;
} & {
  [K in ItemName]: ItemType[];
};

declare interface ListParams {
  page?: number;
  direction?: string;
  filter?: string;
  sort?: string;
}

declare type InvoiceList= List<'invoices', APIInvoiceItem>;
declare type MinRawInvoice = Exclude<RawInvoice, 'thirdparty'> & {
  thirdparty?: {
    id: number;
    name: string;
  };
};
declare type InvoiceListParams = ListParams;
declare interface RawInvoice {
  amount: `${number}`;
  archived: boolean;
  attachment_required: boolean;
  client_comments_count: number;
  company_id: number;
  created_at: string;
  currency: string;
  currency_amount: `${number}`;
  currency_price_before_tax: `${number}`;
  currency_tax: `${number}`;
  current_account_plan_item: null;
  current_account_plan_item_id: null;
  date: null;
  deadline: null;
  direction: 'supplier' | 'customer';
  document_tags: string[];
  duplicates_count: number;
  email_from: null;
  embeddable_in_browser: boolean;
  file_signed_id: string;
  filename: string;
  gdrive_path: string;
  group_uuid: string;
  has_closed_ledger_events: boolean;
  has_duplicates: boolean;
  has_file: boolean;
  id: number;
  incomplete: boolean;
  invoice_lines: InvoiceLine[];
  invoice_lines_count: number;
  invoice_number: string;
  is_employee_expense: boolean;
  is_estimate: boolean;
  is_factur_x: boolean;
  is_waiting_for_ocr: boolean;
  journal_id: number;
  label: string;
  method: string;
  mileage_allowance: null;
  outstanding_balance: `${number}`;
  pages_count: number;
  paid: boolean;
  payment_status: string;
  preview_status: string;
  preview_urls: [];
  pusher_channel: string;
  source: string;
  status: string;
  subcomplete: boolean;
  tagged_at_ledger_events_level: boolean;
  thirdparty: ThirdParty | null;
  thirdparty_id: number | null;
  type: string;
  url: string;
  validation_needed: boolean;
}
interface ThirdParty {
  id: number;
  known_supplier_id: null;
  company_id: number;
  name: string;
  role: string;
  address: string;
  postal_code: string;
  city: string;
  country_alpha2: string;
  vat_number: string;
  vat_rate: string;
  search_terms: string[];
  emails: string[];
  reg_no: string;
  phone: string;
  first_name: string;
  recurrent: boolean;
  last_name: string;
  gender: null;
  payment_conditions: string;
  customer_type: string;
  disable_pending_vat: boolean;
  force_pending_vat: boolean;
  gocardless_id: null;
  invoices_auto_generated: boolean;
  invoices_auto_validated: boolean;
  billing_iban: null;
  billing_bic: null;
  billing_bank: null;
  recipient: string;
  billing_language: string;
  pnl_plan_item_id: number;
  iban: string;
  stripe_id: null;
  invoice_dump_id: null;
  delivery_address: string;
  delivery_postal_code: string;
  delivery_city: string;
  delivery_country_alpha2: string;
  reference: string;
  legal_form_code: string;
  activity_nomenclature: string;
  activity_code: string;
  billing_footer_invoice_id: null;
  plan_item_id: number;
  rule_enabled: boolean;
  supplier_payment_method: null;
  supplier_payment_method_last_updated_at: null;
  notes: string;
  admin_city_code: null;
  establishment_no: null;
  source_id: string;
  country: null;
  delivery_country: null;
  complete: boolean;
  url: string;
  method: string;
  billing_footer_invoice_label: null;
  display_name: null;
  debits: null;
  credits: null;
  balance: null;
  invoice_count: null;
  purchase_request_count: null;
  estimate_count: null;
  turnover: null;
  ledger_events_count: null;
  plan_item: {
    id: number;
    number: `${number}`;
    internal_identifier: null;
    label: string;
    company_id: number;
    enabled: boolean;
    vat_rate: string;
    country_alpha2: string;
    label_is_editable: boolean;
  },
  pnl_plan_item: {
    id: number;
    number: `${number}`;
    internal_identifier: null,
    label: string;
    company_id: number;
    enabled: boolean,
    vat_rate: string;
    country_alpha2: string;
    label_is_editable: boolean
  },
  current_mandate: null,
  received_a_mandate_request: boolean,
  notes_comment: null,
  plan_item_attributes: null,
  tags: string[];
}
declare interface InvoiceLine {
  advance: null;
  advance_id: null;
  amount: `${number}`;
  asset_id: null;
  currency_amount: `${number}`;
  currency_price_before_tax: `${number}`;
  currency_tax: `${number}`;
  deferral_id: null;
  global_vat: boolean;
  id: number;
  label: string;
  ocr_vat_rate: string;
  pnl_plan_item_id: null | number;
  pnl_plan_item: null | {
    id: number;
    number: `${number}`;
    label: string;
    enabled: boolean
  };
  advance_pnl: boolean
  asset: null;
  deferral: null;
  prepaid_pnl: boolean;
  tax: `${number}`;
  vat_rate: string;
}

declare type TransactionList= List<'transactions', APITransactionItem>;
declare type TransactionListParams = ListParams;
/** Liste des propriétés vérifiée. Pour plus de détails, récupérer le "document" */
declare interface RawTransactionMin {
  id: number;

  /** Compte bancaire associé */
  account: {
    logo_url: string;
    name: string;
  };

  automatically_processed: boolean;
  automation_rule_plan_item: RulePlanItem | null;
  comments_count: number;
  fee: `${number}`;
  grouped_documents: ReducedGroupedDocument[];
  internal_transfer: boolean;
  outstanding_balance: `${number}`;
  pusher_channel: string;
  source: string;
  source_logo: string;
}

declare interface RulePlanItem {}
declare interface ReducedGroupedDocument {
  amount: `${number}`;
  currency: string;
  currency_amount: `${number}`;
  id: number;
  type: 'Transaction' | 'Invoice';
}

declare interface RawDocument {
  account_id: number;
  accounting_type: boolean;
  amount: `${number}`;
  archived: boolean;
  archived_at: null;
  attachment_lost: boolean;
  attachment_required: boolean;
  billing_subscription_id: null;
  company: { name: string; };
  company_id: number;
  complete: boolean;
  complete_infos_url: string;
  completeness: 0;

  /** date ISO string such '2024-05-17T03:24:55.928153Z' */
  created_at: string;
  currency: string;
  currency_amount: `${number}`;

  /** la date au format iso 2024-12-31 */
  date: string;
  draft: boolean;
  email_from: null;
  external_id: string;
  fec_pieceref: string;
  gdrive_path: null;
  gross_amount: `${number}`;
  group_uuid: string;
  grouped_at: null;

  /** documents liés à celui-ci */
  grouped_documents: GroupedDocument[];
  id: number;

  /** pour une transaction : justificatif demandé */
  is_waiting_details: boolean;
  journal_id: number;
  label: string;
  method: string;
  outstanding_balance: `${number}`;
  payment_id: null;
  pdf_generation_status: string;
  preview_status: null;
  pusher_channel: string;
  quotes: boolean;
  readonly: boolean;
  reversal_origin_id: null;
  score: null;
  scored_invoices: {};
  source: string;
  status: string;
  thirdparty_id: null;
  type: 'Invoice' | 'Transaction';
  /** Date ISO string such '2024-05-17T03:24:55.928153Z' */
  updated_at: string;
  url: string;
}

declare interface GroupedDocument extends Omit<RawDocument, 'grouped_documents'> {
  id: number;

  /** Bank account details */
  account: BankAccount;
  client_comments: string[];
  has_file: boolean;
  hasTooManyLedgerEvents: boolean;
  is_accounting_needed: null;
  is_waiting_details: boolean;
  journal: {
      code: string;
      id: number;
      label: string;
    };
  ledgerEvents?: LedgerEvent[];
  ledgerEventsCount: number;
  pending: boolean;
  preview_status: null;
  preview_urls: string[];
  reconciled: boolean;
}

declare interface BankAccount {
  balance: `${number}`;
  bic: string;

  /** ID de la société pour laquelle le dossier comptable est ouvert */
  company_id: number;
  connection: string;
  currency: string;
  currency_balance: `${number}`;
  establishment: {
    accounts_count: number;
    bridge_ids: number[];
    budgetinsight_id: null;
    crm_url: string;
    fintecture_ids: string[];
    id: number;
    logo_url: string;
    method: string;
    name: string;
  };
  establishment_id: number;
  fintecture: boolean;
  iban: string;
  id: number;
  label: string;
  last_successful_sync_at: string;
  last_sync_at: string;
  last_sync_error: null;
  last_sync_http_code: 200;
  ledger_events_count: null;
  ledger_events_max_date: null;
  ledger_events_min_date: null;
  merge_url: string;
  method: string;
  name: string;
  pusher_channel: string;
  swan: boolean;
  swan_number: null;
  sync_attachments: boolean;
  sync_customers: boolean;
  sync_since: null;
  synchronize_path: string;
  synchronized: boolean;
  transactions_count: null;
  updated_at: string;
  url: string;
  use_as_default_for_vat_return: boolean;
  visible: boolean
}

declare interface LedgerEvent {
  amount: `${number}`;
  balance: `${number}`;
  company_id: number;
  /** Date ISO string such '2024-05-17T03:24:55.928153Z' */
  created_at: string;
  credit: `${number}`;
  date: string;
  debit: `${number}`;
  document_id: number;
  id: number;
  label: null;
  lettering_id: null;
  plan_item_id: number;
  planItem: PlanItem;
  readonly: boolean;
  readonlyAmounts: boolean;
  reallocation_id: null;
  reconciliation_id: null;
  source: string;
}

interface PlanItem  {
  company_id: number;
  country_alpha2: string;
  enabled: boolean;
  id: number;
  internal_identifier: null;
  label: string;
  label_is_editable: boolean;
  number: `${number}`;
  vat_rate: string;
}

declare type RawInvoiceUpdate = Exclude<RawInvoice, 'invoice_lines'> & {
  invoice_lines_attributes: InvoiceLine[];
}

declare interface DocumentStatus {
  has_file: boolean;
  preview_status:"ok";
  preview_urls: string[];
  embeddable_in_browser: boolean;
}

declare interface RawThirdparty {
  id:number;
  company_id:number;
  disable_pending_vat:boolean;
  emails:string[];
  country_alpha2:string;
  force_pending_vat:boolean;
  iban:string;
  invoices_auto_generated:boolean;
  invoices_auto_validated:boolean;
  name:string;
  notes:string;
  search_terms:string[];
  supplier_payment_method:null;
  vat_number:string;
  supplier_due_date_delay:null;
  supplier_due_date_rule:string;
  address:string;
  city:string;
  postal_code:string;
  admin_city_code:null;
  activity_nomenclature:string;
  establishment_no:null;
  notes_comment:null;
  plan_item:{
    id:number;
    number:string;
  };
  thirdparty_invoice_line_rules:{
    pnl_plan_item:{
      id:number;
      enabled:true;
      label:string;
      number:string;
    };
    vat_rate:string;
  }[];
  tags:[];
  thirdparty_visibility_rules:{
    id:number;
    visible_on:string;
  }[];
}

/**
 * Type renvoyé par l'appel API getTransaction(id)
 */
declare interface APITransaction {
  "id": number;
  "fee": `${number}`;
  "source": string;
  "pusher_channel": string;
  "outstanding_balance": `${number}`;
  "comments_count": number;
  "grouped_documents": {
    "id": number;
    "type": "Invoice"|"Transaction";
    "currency": string;
    "amount": `${number}`;
    "currency_amount": `${number}`;
  }[];
  "automation_rule_plan_item": null;
  "source_logo": string;
  "account": {
    "name": string;
    "logo_url": string;
  };
  "automatically_processed": boolean;
  "internal_transfer": boolean;
}

/**
 * Type renvoyé par l'appel API getLedgerEvents(id)
 */
declare interface APILedgerEvent {
  "amount": `${number}`;
  "balance": `${number}`;
  /** Fait partie d'un exercice clos */
  "closed": boolean;
  "credit": `${number}`;
  "debit": `${number}`;
  "id": number;
  "label": string|null;
  "lettering": null;
  "lettering_id": null;
  "planItem": {
    "id": number;
    "number": `${number}`;
    "vat_rate": string;
    "country_alpha2": string;
    "label": string;
    "enabled": boolean
  };
  "plan_item_id": number;
  "readonly": boolean;
  "readonlyAmounts": boolean;
  "reconciliation_id": null;
  "source": string;
}

/**
 * Type renvoyé par l'appel API getInvoiceList()
 */
declare interface APIInvoiceItem {
  "id": number;
  "type": "Invoice";
  "company_id": number;
  "label": string;
  /** Date to ISO string */
  "created_at": string;
  "currency": string;
  "amount": `${number}`;
  "currency_amount": `${number}`;
  "currency_tax": `${number}`;
  /** Date string (ex: 2024-12-16) */
  "date": string;
  "deadline": string;
  "direction": "supplier";
  "invoice_number": string;
  "source": string;
  "email_from": null;
  "gdrive_path": null;
  "pusher_channel": string;
  "validation_needed": boolean;
  "payment_status": string;
  "paid": boolean;
  "amount_without_tax": `${number}`;
  "not_duplicate": boolean;
  "approval_status": null;
  "checksum": string;
  "archived": boolean;
  "incomplete": boolean;
  "is_waiting_for_ocr": boolean;
  "status": string;
  "filename": string;
  "is_factur_x": boolean;
  "thirdparty": {
    "id": number;
    "name": string;
  };
  "invoice_lines": {
    "id": number;
    "vat_rate": string;
    "pnl_plan_item": {
      "id": number;
      "number": `${number}`;
      "label": string;
      "enabled": boolean;
    };
  }[];
}

/** type renvoyé par l'appel API getTransactionList() */
declare interface APITransactionItem {
  "id": number;
  "type": "Transaction";
  "account_id": number;
  "company_id": number;
  "dump_id": null;
  "group_uuid": string;
  /** Date string (ex: 2024-12-16) */
  "date": string;
  "label": string;
  "amount": `${number}`;
  "fee": `${number}`;
  "currency": string;
  "source": string;
  "currency_amount": `${number}`;
  "currency_fee": `${number}`;
  "archived_at": null;
  /** Date to ISO string */
  "updated_at": string;
  "is_waiting_details": boolean;
  "validation_needed": boolean;
  "is_potential_duplicate": boolean;
  "attachment_lost": boolean;
  "attachment_required": boolean;
  "pending": boolean;
  "status": string;
  "gross_amount": `${number}`;
  "reconciliation_id": null;
  "files_count": number;
  "source_logo": string;
  "account_synchronization": {
    /** Date to ISO string */
    "created_at": string;
    "triggered_manually": boolean;
    "error_message": null;
  };
  "dump": null;
}

/**
 * Type renvoyé par l'appel API getGroupedDocuments()
 */
declare interface APIGroupedDocument {
  "id": number;
  "type": "Invoice"|"Transaction";
  /** Date string (ex: 2024-12-16) */
  "date": string;
  "journal_id": number;
  "source": string;
  "is_waiting_details": boolean;
  "fec_pieceref": string;
  "label": string;
  "amount": `${number}`;
  "journal": {
    "id": number;
    "code": string;
    "label": string;
  };
  "readonly": boolean;
  "ledgerEventsCount": number;
  "totalDebit": `${number}`;
  "totalCredit": `${number}`;
}

/**
 * Type renvoyé par l'appel API getDocument()
 */
declare interface APIDocument {
  "id": number;
  "company_id": number;
  /** Date string (ex: 2024-12-16) */
  "date": string;
  /** Date to ISO string */
  "created_at": string;
  /** Date to ISO string */
  "updated_at": string;
  /** Date to ISO string */
  "archived_at": string|null;
  "type": "Transaction"|"Invoice";
  "source": string;
  "draft": boolean;
  "group_uuid": string;
  "gdrive_path": string|null;
  "preview_status": string|null;
  "pusher_channel": string;
  "email_from": string|null;
  "score": string|null;
  "is_waiting_details": boolean;
  "external_id": string;
  "journal_id": number;
  /** Date to ISO string */
  "grouped_at": string;
  "attachment_required": true;
  "attachment_lost": boolean;
  "pdf_generation_status": "not_generated";
  "reversal_origin_id": null;
  "billing_subscription_id": null;
  "fec_pieceref": "PESYPBCMKS";
  "label": "PRELEVEMENT EUROPEEN 7406053292 DE: Orange SA-ORANGE ID: FR18ZZZ002305 MOTIF: Votre abonnement mobile: 06XXXXX079 (facture: 1221600586)";
  "url": "/companies/21936866/documents/1494748897";
  "method": "PUT";
  "accounting_type": boolean;
  "archived": boolean;
  "quotes": boolean;
  "readonly": boolean;
  "account_id": 591935;
  "thirdparty_id": 98639463;
  "payment_id": null;
  "amount": "-15.99";
  "currency": "EUR";
  "currency_amount": "-15.99";
  "outstanding_balance": "0.0";
  "completeness": 0;
  "gross_amount": "-15.99";
  "status": "complete";
  "complete": true;
  "company": {
    "name": string;
  };
  "scored_invoices": {};
  "grouped_documents":
    {
      "id": 1508997886;
      "company_id": 21936866;
      "date": "2024-12-04";
      /** Date to ISO string */
      "created_at": string;
      /** Date to ISO string */
      "updated_at": string;
      "archived_at": null;
      "type": "Invoice";
      "source": "web_accountant_purchasing";
      "draft": boolean;
      "group_uuid": "3aa7b42a-aede-44ac-b372-d14b1c2a3509";
      "gdrive_path": null;
      "preview_status": "ok";
      "pusher_channel": "private-gid---jeancaisse-Invoice-1508997886";
      "email_from": null;
      "score": null;
      "is_waiting_details": boolean;
      "external_id": "HVRLXQQCRO";
      "journal_id": 1756183;
      "grouped_at": "2024-12-20T10:28:05.388477Z";
      "attachment_required": true;
      "attachment_lost": boolean;
      "pdf_generation_status": "not_generated";
      "reversal_origin_id": null;
      "billing_subscription_id": null;
      "fec_pieceref": "HVRLXQQCRO";
      "label": "Facture ORANGE - 1221600586";
      "is_waiting_for_ocr": boolean;
      "journal": {
        "id": 1756183;
        "code": "HA";
        "label": "Journal d'achat"
      };
      "has_linked_quotes": boolean;
      "url": string;
      "method": "PUT";
      "accounting_type": true;
      "preview_urls": [];
      "archived": boolean;
      "quotes": boolean;
      "filename": string;
      "has_file": true;
      "size": "47;6 ko";
      "embeddable_in_browser": true;
      "readonly": boolean;
      "thirdparty_id": 98639463;
      "ocr_thirdparty_id": 98639463;
      "direction": "supplier";
      "amount": "15.99";
      "deadline": "2024-12-15";
      "multiplier": -1;
      "price_before_tax": "15.99";
      "quote_uid": null;
      "special_mention": null;
      "currency": "EUR";
      "currency_amount": "15.99";
      "not_duplicate": boolean;
      "validation_needed": boolean;
      "currency_tax": "0.0";
      "currency_price_before_tax": "15.99";
      "language": "fr_FR";
      "payment_status": "to_be_processed";
      "payment_method": null;
      "invoice_number": "1221600586";
      "tax": "0.0";
      "estimate_status": null;
      "iban": "";
      "paid": true;
      "future_in_days": null;
      "discount": "0.0";
      "discount_type": "relative";
      "finalized_at": null;
      "quote_group_uuid": "689e552a-72d4-4d47-9dc8-2ba9401c9a70";
      "factor_status": "factor_not_sent";
      "currency_amount_before_tax": "15.99";
      "from_estimate_id": null;
      "credit_notes_amount": "0.0";
      "outstanding_balance": "0.0";
      "payment_reminder_enabled": true;
      "payment_reference": "PLHVRLXQQCROZZ";
      "is_credit_note": boolean;
      "is_estimate": boolean;
      "is_destroyable": boolean;
      "can_be_stamped_as_paid_in_pdf": boolean;
      "custom_payment_reference": "PLHVRLXQQCROZZ";
      "scored_transactions": [];
      "is_sendable": boolean;
      "incomplete": boolean;
      "subcomplete": true;
      "attachment_label": "ok";
      "completeness": 0;
      "complete": true;
      "accounting_status": "complete";
      "thirdparty": {
        "id": 98639463;
        "known_supplier_id": null;
        "company_id": 21936866;
        "name": string;
        "role": "supplier";
        "address": "";
        "postal_code": "";
        "city": "";
        "country_alpha2": "FR";
        "vat_number": "FR89380129866";
        "search_terms": string[];
        "emails": [];
        "reg_no": "754591493";
        "phone": "";
        "first_name": "";
        "recurrent": boolean;
        "last_name": "";
        "gender": null;
        "payment_conditions": "30_days";
        "customer_type": "company";
        "disable_pending_vat": boolean;
        "force_pending_vat": boolean;
        "gocardless_id": null;
        "invoices_auto_generated": boolean;
        "invoices_auto_validated": boolean;
        "billing_iban": null;
        "billing_bic": null;
        "billing_bank": null;
        "recipient": "";
        "billing_language": "fr_FR";
        "iban": "";
        "stripe_id": null;
        "invoice_dump_id": null;
        "delivery_address": "";
        "delivery_postal_code": "";
        "delivery_city": "";
        "delivery_country_alpha2": "";
        "reference": "";
        "legal_form_code": "";
        "activity_nomenclature": "";
        "activity_code": "";
        "billing_footer_invoice_id": null;
        "plan_item_id": 592574353;
        "rule_enabled": true;
        "supplier_payment_method": null;
        "supplier_payment_method_last_updated_at": null;
        "notes": "";
        "admin_city_code": null;
        "establishment_no": null;
        "address_additional_info": "";
        "delivery_address_additional_info": "";
        "vat_rate": "exempt";
        "pnl_plan_item_id": 729384767;
        "source_id": "6e837d75-1d50-4226-a88d-52231d4f8a4b";
        "country": "France";
        "delivery_country": null;
        "complete": boolean;
        "url": string;
        "method": "PUT";
        "billing_footer_invoice_label": null;
        "display_name": null;
        "debits": null;
        "credits": null;
        "balance": null;
        "invoice_count": null;
        "purchase_request_count": null;
        "estimate_count": null;
        "turnover": null;
        "ledger_events_count": null;
        "plan_item": null;
        "pnl_plan_item": null;
        "current_mandate": null;
        "received_a_mandate_request": boolean;
        "notes_comment": null;
        "plan_item_attributes": null;
        "tags": []
      };
      "recipients": [];
      "invoice_lines": {
        "id": 190423320;
        "price_before_tax": "15.99";
        "amount": "15.99";
        "tax": "0.0";
        "label": "";
        "description": "";
        "pnl_plan_item_id": 729384767;
        "product_id": null;
        "quantity": "1.0";
        "unit": null;
        "created_at": "2024-12-20T10:26:50.266193Z";
        "currency_amount": "15.99";
        "currency_tax": "0.0";
        "currency_price_before_tax": "15.99";
        "rank": null;
        "prepaid_pnl": boolean;
        "ocr_vat_rate": "exempt";
        "document_id": 1508997886;
        "discount": "0.0";
        "discount_type": "relative";
        "company_id": 21936866;
        "asset_id": null;
        "deferral_id": null;
        "advance_id": null;
        "raw_currency_unit_price": "0.0";
        "undiscounted_currency_price_before_tax": "0.0";
        "manual_vat_mode": boolean;
        "invoice_line_section_id": null;
        "global_vat": boolean;
        "vat_rate": "exempt";
        "pnl_plan_item": {
          "id": 729384767;
          "number": "62620001";
          "internal_identifier": null;
          "label": "Téléphone";
          "company_id": 21936866;
          "enabled": true;
          "vat_rate": "any";
          "country_alpha2": "any";
          "label_is_editable": true
        };
        "currency_unit_price_before_tax": "15.99"
      }[];
      "invoice_kind": null;
      "file_signed_id": "eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCQS96b2c4PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--58bafeddc01df9099b6382d4e21de6ce7d6544e2";
      "pages_count": 2;
      "pending": boolean;
      "hasTooManyLedgerEvents": boolean;
      "ledgerEventsCount": 2;
      "ledgerEvents": {
        "id": 6240621829;
        "company_id": 21936866;
        "plan_item_id": 729384767;
        "document_id": 1508997886;
        "created_at": "2024-12-20T10:28:05.770266Z";
        "reconciliation_id": null;
        "source": "default_ledger_events";
        "lettering_id": null;
        "reallocation_id": null;
        "debit": "15.99";
        "credit": "0.00";
        "balance": "15.99";
        "date": "2024-12-04";
        "planItem": {
          "id": 729384767;
          "number": "62620001";
          "internal_identifier": null;
          "label": string;
          "company_id": 21936866;
          "enabled": true;
          "vat_rate": "any";
          "country_alpha2": "any";
          "label_is_editable": true
        };
        "readonly": boolean;
        "readonlyAmounts": true;
        "label": null
      }[];
      "tagged_at_ledger_events_level": boolean;
      "reconciled": boolean;
      "client_comments": [];
      "pdf_invoice_title": "";
      "pdf_invoice_free_text": "";
      "pdf_invoice_free_text_enabled": boolean;
      "pdf_invoice_subject": "";
      "pdf_invoice_subject_enabled": boolean;
      "pdf_invoice_display_products_list": boolean;
      "pdf_paid_stamp": boolean;
      "invoicing_detailed_source": null;
      "manual_partial_invoices": boolean
    }[];
}
