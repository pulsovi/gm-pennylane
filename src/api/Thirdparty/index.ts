// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIThirdparty';
let obj: any = null;
export class APIThirdparty {
  public readonly customer?: Customer;
  public readonly supplier?: Supplier;
  public static Parse(d: string): APIThirdparty {
    return APIThirdparty.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIThirdparty {
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
    if ("customer" in d) {
      d.customer = Customer.Create(d.customer, field + ".customer");
    }
    if ("supplier" in d) {
      d.supplier = Supplier.Create(d.supplier, field + ".supplier");
    }
    const knownProperties = ["customer","supplier"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIThirdparty(d);
  }
  private constructor(d: any) {
    if ("customer" in d) this.customer = d.customer;
    if ("supplier" in d) this.supplier = d.supplier;
  }
}

export class Customer {
  public readonly address: string;
  public readonly address_additional_info: string;
  public readonly auto_process_invoices?: boolean;
  public readonly billing_bank: null;
  public readonly billing_bic: null;
  public readonly billing_footer_invoice: null;
  public readonly billing_footer_invoice_id: null;
  public readonly billing_iban: null;
  public readonly billing_language: string;
  public readonly city: string;
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly current_mandate: null;
  public readonly customer_type: string;
  public readonly delivery_address: string;
  public readonly delivery_address_additional_info: string;
  public readonly delivery_city: string;
  public readonly "delivery_country_alpha2": string;
  public readonly delivery_postal_code: string;
  public readonly disable_pending_vat: boolean;
  public readonly emails: never[];
  public readonly first_name: string;
  public readonly force_pending_vat: boolean;
  public readonly id: number;
  public readonly invoices_auto_generated: boolean;
  public readonly invoices_auto_validated: boolean;
  public readonly last_name: string;
  public readonly name: string;
  public readonly notes: string;
  public readonly notes_comment: null;
  public readonly payment_conditions: string;
  public readonly phone: string;
  public readonly plan_item: PlanItem;
  public readonly postal_code: string;
  public readonly received_a_mandate_request: boolean;
  public readonly recipient: string;
  public readonly reference: string;
  public readonly reg_no: string;
  public readonly search_terms: string[];
  public readonly sepa_mandate: null;
  public readonly source_id: string;
  public readonly tags: never[];
  public readonly thirdparties_tags: never[];
  public readonly thirdparty_contacts: never[];
  public readonly thirdparty_invoice_line_rules: ThirdpartyInvoiceLineRulesEntity[];
  public readonly vat_number: string;
  public static Parse(d: string): Customer {
    return Customer.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Customer {
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
    checkString(d.address, field + ".address");
    checkString(d.address_additional_info, field + ".address_additional_info");
    if ("auto_process_invoices" in d) {
      checkBoolean(d.auto_process_invoices, field + ".auto_process_invoices");
    }
    checkNull(d.billing_bank, field + ".billing_bank");
    checkNull(d.billing_bic, field + ".billing_bic");
    checkNull(d.billing_footer_invoice, field + ".billing_footer_invoice");
    checkNull(d.billing_footer_invoice_id, field + ".billing_footer_invoice_id");
    checkNull(d.billing_iban, field + ".billing_iban");
    checkString(d.billing_language, field + ".billing_language");
    checkString(d.city, field + ".city");
    checkNumber(d.company_id, field + ".company_id");
    checkString(d["country_alpha2"], field + ".country_alpha2");
    checkNull(d.current_mandate, field + ".current_mandate");
    checkString(d.customer_type, field + ".customer_type");
    checkString(d.delivery_address, field + ".delivery_address");
    checkString(d.delivery_address_additional_info, field + ".delivery_address_additional_info");
    checkString(d.delivery_city, field + ".delivery_city");
    checkString(d["delivery_country_alpha2"], field + ".delivery_country_alpha2");
    checkString(d.delivery_postal_code, field + ".delivery_postal_code");
    checkBoolean(d.disable_pending_vat, field + ".disable_pending_vat");
    checkArray(d.emails, field + ".emails");
    if (d.emails) {
      for (let i = 0; i < d.emails.length; i++) {
        checkNever(d.emails[i], field + ".emails" + "[" + i + "]");
      }
    }
    checkString(d.first_name, field + ".first_name");
    checkBoolean(d.force_pending_vat, field + ".force_pending_vat");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.invoices_auto_generated, field + ".invoices_auto_generated");
    checkBoolean(d.invoices_auto_validated, field + ".invoices_auto_validated");
    checkString(d.last_name, field + ".last_name");
    checkString(d.name, field + ".name");
    checkString(d.notes, field + ".notes");
    checkNull(d.notes_comment, field + ".notes_comment");
    checkString(d.payment_conditions, field + ".payment_conditions");
    checkString(d.phone, field + ".phone");
    d.plan_item = PlanItem.Create(d.plan_item, field + ".plan_item");
    checkString(d.postal_code, field + ".postal_code");
    checkBoolean(d.received_a_mandate_request, field + ".received_a_mandate_request");
    checkString(d.recipient, field + ".recipient");
    checkString(d.reference, field + ".reference");
    checkString(d.reg_no, field + ".reg_no");
    checkArray(d.search_terms, field + ".search_terms");
    if (d.search_terms) {
      for (let i = 0; i < d.search_terms.length; i++) {
        checkString(d.search_terms[i], field + ".search_terms" + "[" + i + "]");
      }
    }
    checkNull(d.sepa_mandate, field + ".sepa_mandate");
    checkString(d.source_id, field + ".source_id");
    checkArray(d.tags, field + ".tags");
    if (d.tags) {
      for (let i = 0; i < d.tags.length; i++) {
        checkNever(d.tags[i], field + ".tags" + "[" + i + "]");
      }
    }
    checkArray(d.thirdparties_tags, field + ".thirdparties_tags");
    if (d.thirdparties_tags) {
      for (let i = 0; i < d.thirdparties_tags.length; i++) {
        checkNever(d.thirdparties_tags[i], field + ".thirdparties_tags" + "[" + i + "]");
      }
    }
    checkArray(d.thirdparty_contacts, field + ".thirdparty_contacts");
    if (d.thirdparty_contacts) {
      for (let i = 0; i < d.thirdparty_contacts.length; i++) {
        checkNever(d.thirdparty_contacts[i], field + ".thirdparty_contacts" + "[" + i + "]");
      }
    }
    checkArray(d.thirdparty_invoice_line_rules, field + ".thirdparty_invoice_line_rules");
    if (d.thirdparty_invoice_line_rules) {
      for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {
        d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity.Create(d.thirdparty_invoice_line_rules[i], field + ".thirdparty_invoice_line_rules" + "[" + i + "]");
      }
    }
    checkString(d.vat_number, field + ".vat_number");
    const knownProperties = ["address","address_additional_info","auto_process_invoices","billing_bank","billing_bic","billing_footer_invoice","billing_footer_invoice_id","billing_iban","billing_language","city","company_id","country_alpha2","current_mandate","customer_type","delivery_address","delivery_address_additional_info","delivery_city","delivery_country_alpha2","delivery_postal_code","disable_pending_vat","emails","first_name","force_pending_vat","id","invoices_auto_generated","invoices_auto_validated","last_name","name","notes","notes_comment","payment_conditions","phone","plan_item","postal_code","received_a_mandate_request","recipient","reference","reg_no","search_terms","sepa_mandate","source_id","tags","thirdparties_tags","thirdparty_contacts","thirdparty_invoice_line_rules","vat_number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Customer(d);
  }
  private constructor(d: any) {
    this.address = d.address;
    this.address_additional_info = d.address_additional_info;
    if ("auto_process_invoices" in d) this.auto_process_invoices = d.auto_process_invoices;
    this.billing_bank = d.billing_bank;
    this.billing_bic = d.billing_bic;
    this.billing_footer_invoice = d.billing_footer_invoice;
    this.billing_footer_invoice_id = d.billing_footer_invoice_id;
    this.billing_iban = d.billing_iban;
    this.billing_language = d.billing_language;
    this.city = d.city;
    this.company_id = d.company_id;
    this["country_alpha2"] = d["country_alpha2"];
    this.current_mandate = d.current_mandate;
    this.customer_type = d.customer_type;
    this.delivery_address = d.delivery_address;
    this.delivery_address_additional_info = d.delivery_address_additional_info;
    this.delivery_city = d.delivery_city;
    this["delivery_country_alpha2"] = d["delivery_country_alpha2"];
    this.delivery_postal_code = d.delivery_postal_code;
    this.disable_pending_vat = d.disable_pending_vat;
    this.emails = d.emails;
    this.first_name = d.first_name;
    this.force_pending_vat = d.force_pending_vat;
    this.id = d.id;
    this.invoices_auto_generated = d.invoices_auto_generated;
    this.invoices_auto_validated = d.invoices_auto_validated;
    this.last_name = d.last_name;
    this.name = d.name;
    this.notes = d.notes;
    this.notes_comment = d.notes_comment;
    this.payment_conditions = d.payment_conditions;
    this.phone = d.phone;
    this.plan_item = d.plan_item;
    this.postal_code = d.postal_code;
    this.received_a_mandate_request = d.received_a_mandate_request;
    this.recipient = d.recipient;
    this.reference = d.reference;
    this.reg_no = d.reg_no;
    this.search_terms = d.search_terms;
    this.sepa_mandate = d.sepa_mandate;
    this.source_id = d.source_id;
    this.tags = d.tags;
    this.thirdparties_tags = d.thirdparties_tags;
    this.thirdparty_contacts = d.thirdparty_contacts;
    this.thirdparty_invoice_line_rules = d.thirdparty_invoice_line_rules;
    this.vat_number = d.vat_number;
  }
}

export class PlanItem {
  public readonly id: number;
  public readonly number: string;
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
    checkNumber(d.id, field + ".id");
    checkString(d.number, field + ".number");
    const knownProperties = ["id","number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
  }
}

export class ThirdpartyInvoiceLineRulesEntity {
  public readonly pnl_plan_item: PnlPlanItem;
  public readonly vat_rate: string;
  public static Parse(d: string): ThirdpartyInvoiceLineRulesEntity {
    return ThirdpartyInvoiceLineRulesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): ThirdpartyInvoiceLineRulesEntity {
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
    d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    checkString(d.vat_rate, field + ".vat_rate");
    const knownProperties = ["pnl_plan_item","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new ThirdpartyInvoiceLineRulesEntity(d);
  }
  private constructor(d: any) {
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
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PnlPlanItem(d);
  }
  private constructor(d: any) {
    this.enabled = d.enabled;
    this.id = d.id;
    this.label = d.label;
    this.number = d.number;
  }
}

export class Supplier {
  public readonly activity_nomenclature: string;
  public readonly address: string;
  public readonly admin_city_code: null | string;
  public readonly auto_process_invoices?: boolean;
  public readonly city: string;
  public readonly company_auto_process_invoices?: boolean;
  public readonly company_id: number;
  public readonly "country_alpha2": string;
  public readonly disable_pending_vat: boolean;
  public readonly emails: never[];
  public readonly establishment_no: null | string;
  public readonly force_pending_vat: boolean;
  public readonly iban: string;
  public readonly iban_last_update: null | IbanLastUpdate;
  public readonly iban_proof?: null;
  public readonly id: number;
  public readonly invoices_auto_generated: boolean;
  public readonly invoices_auto_validated: boolean;
  public readonly name: string;
  public readonly notes: string;
  public readonly notes_comment: null;
  public readonly plan_item: PlanItem1;
  public readonly postal_code: string;
  public readonly search_terms: string[];
  public readonly supplier_due_date_delay: null;
  public readonly supplier_due_date_rule: string;
  public readonly supplier_payment_method: null;
  public readonly tags: TagsEntityOrTag[];
  public readonly thirdparties_tags: ThirdpartiesTagsEntity[];
  public readonly thirdparty_invoice_line_rules: ThirdpartyInvoiceLineRulesEntity1[];
  public readonly thirdparty_visibility_rules: ThirdpartyVisibilityRulesEntity[];
  public readonly validation_status?: string;
  public readonly vat_number: string;
  public static Parse(d: string): Supplier {
    return Supplier.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Supplier {
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
    checkString(d.activity_nomenclature, field + ".activity_nomenclature");
    checkString(d.address, field + ".address");
    // This will be refactored in the next release.
    try {
      checkNull(d.admin_city_code, field + ".admin_city_code", "null | string");
    } catch (e) {
      try {
        checkString(d.admin_city_code, field + ".admin_city_code", "null | string");
      } catch (e) {
      }
    }
    if ("auto_process_invoices" in d) {
      checkBoolean(d.auto_process_invoices, field + ".auto_process_invoices");
    }
    checkString(d.city, field + ".city");
    if ("company_auto_process_invoices" in d) {
      checkBoolean(d.company_auto_process_invoices, field + ".company_auto_process_invoices");
    }
    checkNumber(d.company_id, field + ".company_id");
    checkString(d["country_alpha2"], field + ".country_alpha2");
    checkBoolean(d.disable_pending_vat, field + ".disable_pending_vat");
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
    checkBoolean(d.force_pending_vat, field + ".force_pending_vat");
    checkString(d.iban, field + ".iban");
    // This will be refactored in the next release.
    try {
      checkNull(d.iban_last_update, field + ".iban_last_update", "null | IbanLastUpdate");
    } catch (e) {
      try {
        d.iban_last_update = IbanLastUpdate.Create(d.iban_last_update, field + ".iban_last_update", "null | IbanLastUpdate");
      } catch (e) {
      }
    }
    if ("iban_proof" in d) {
      checkNull(d.iban_proof, field + ".iban_proof");
    }
    checkNumber(d.id, field + ".id");
    checkBoolean(d.invoices_auto_generated, field + ".invoices_auto_generated");
    checkBoolean(d.invoices_auto_validated, field + ".invoices_auto_validated");
    checkString(d.name, field + ".name");
    checkString(d.notes, field + ".notes");
    checkNull(d.notes_comment, field + ".notes_comment");
    d.plan_item = PlanItem1.Create(d.plan_item, field + ".plan_item");
    checkString(d.postal_code, field + ".postal_code");
    checkArray(d.search_terms, field + ".search_terms");
    if (d.search_terms) {
      for (let i = 0; i < d.search_terms.length; i++) {
        checkString(d.search_terms[i], field + ".search_terms" + "[" + i + "]");
      }
    }
    checkNull(d.supplier_due_date_delay, field + ".supplier_due_date_delay");
    checkString(d.supplier_due_date_rule, field + ".supplier_due_date_rule");
    checkNull(d.supplier_payment_method, field + ".supplier_payment_method");
    checkArray(d.tags, field + ".tags");
    if (d.tags) {
      for (let i = 0; i < d.tags.length; i++) {
        d.tags[i] = TagsEntityOrTag.Create(d.tags[i], field + ".tags" + "[" + i + "]");
      }
    }
    checkArray(d.thirdparties_tags, field + ".thirdparties_tags");
    if (d.thirdparties_tags) {
      for (let i = 0; i < d.thirdparties_tags.length; i++) {
        d.thirdparties_tags[i] = ThirdpartiesTagsEntity.Create(d.thirdparties_tags[i], field + ".thirdparties_tags" + "[" + i + "]");
      }
    }
    checkArray(d.thirdparty_invoice_line_rules, field + ".thirdparty_invoice_line_rules");
    if (d.thirdparty_invoice_line_rules) {
      for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {
        d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity1.Create(d.thirdparty_invoice_line_rules[i], field + ".thirdparty_invoice_line_rules" + "[" + i + "]");
      }
    }
    checkArray(d.thirdparty_visibility_rules, field + ".thirdparty_visibility_rules");
    if (d.thirdparty_visibility_rules) {
      for (let i = 0; i < d.thirdparty_visibility_rules.length; i++) {
        d.thirdparty_visibility_rules[i] = ThirdpartyVisibilityRulesEntity.Create(d.thirdparty_visibility_rules[i], field + ".thirdparty_visibility_rules" + "[" + i + "]");
      }
    }
    if ("validation_status" in d) {
      checkString(d.validation_status, field + ".validation_status");
    }
    checkString(d.vat_number, field + ".vat_number");
    const knownProperties = ["activity_nomenclature","address","admin_city_code","auto_process_invoices","city","company_auto_process_invoices","company_id","country_alpha2","disable_pending_vat","emails","establishment_no","force_pending_vat","iban","iban_last_update","iban_proof","id","invoices_auto_generated","invoices_auto_validated","name","notes","notes_comment","plan_item","postal_code","search_terms","supplier_due_date_delay","supplier_due_date_rule","supplier_payment_method","tags","thirdparties_tags","thirdparty_invoice_line_rules","thirdparty_visibility_rules","validation_status","vat_number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Supplier(d);
  }
  private constructor(d: any) {
    this.activity_nomenclature = d.activity_nomenclature;
    this.address = d.address;
    this.admin_city_code = d.admin_city_code;
    if ("auto_process_invoices" in d) this.auto_process_invoices = d.auto_process_invoices;
    this.city = d.city;
    if ("company_auto_process_invoices" in d) this.company_auto_process_invoices = d.company_auto_process_invoices;
    this.company_id = d.company_id;
    this["country_alpha2"] = d["country_alpha2"];
    this.disable_pending_vat = d.disable_pending_vat;
    this.emails = d.emails;
    this.establishment_no = d.establishment_no;
    this.force_pending_vat = d.force_pending_vat;
    this.iban = d.iban;
    this.iban_last_update = d.iban_last_update;
    if ("iban_proof" in d) this.iban_proof = d.iban_proof;
    this.id = d.id;
    this.invoices_auto_generated = d.invoices_auto_generated;
    this.invoices_auto_validated = d.invoices_auto_validated;
    this.name = d.name;
    this.notes = d.notes;
    this.notes_comment = d.notes_comment;
    this.plan_item = d.plan_item;
    this.postal_code = d.postal_code;
    this.search_terms = d.search_terms;
    this.supplier_due_date_delay = d.supplier_due_date_delay;
    this.supplier_due_date_rule = d.supplier_due_date_rule;
    this.supplier_payment_method = d.supplier_payment_method;
    this.tags = d.tags;
    this.thirdparties_tags = d.thirdparties_tags;
    this.thirdparty_invoice_line_rules = d.thirdparty_invoice_line_rules;
    this.thirdparty_visibility_rules = d.thirdparty_visibility_rules;
    if ("validation_status" in d) this.validation_status = d.validation_status;
    this.vat_number = d.vat_number;
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

export class PlanItem1 {
  public readonly id: number;
  public readonly number: string;
  public static Parse(d: string): PlanItem1 {
    return PlanItem1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PlanItem1 {
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
    checkString(d.number, field + ".number");
    const knownProperties = ["id","number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new PlanItem1(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
  }
}

export class TagsEntityOrTag {
  public readonly color?: string;
  public readonly group: Group;
  public readonly group_id: number;
  public readonly id: number;
  public readonly label: string;
  public static Parse(d: string): TagsEntityOrTag {
    return TagsEntityOrTag.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): TagsEntityOrTag {
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
    if ("color" in d) {
      checkString(d.color, field + ".color");
    }
    d.group = Group.Create(d.group, field + ".group");
    checkNumber(d.group_id, field + ".group_id");
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    const knownProperties = ["color","group","group_id","id","label"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new TagsEntityOrTag(d);
  }
  private constructor(d: any) {
    if ("color" in d) this.color = d.color;
    this.group = d.group;
    this.group_id = d.group_id;
    this.id = d.id;
    this.label = d.label;
  }
}

export class Group {
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
    checkString(d.label, field + ".label");
    checkBoolean(d.self_service_accounting, field + ".self_service_accounting");
    const knownProperties = ["label","self_service_accounting"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Group(d);
  }
  private constructor(d: any) {
    this.label = d.label;
    this.self_service_accounting = d.self_service_accounting;
  }
}

export class ThirdpartiesTagsEntity {
  public readonly id: number;
  public readonly tag: TagsEntityOrTag1;
  public readonly weight: string;
  public static Parse(d: string): ThirdpartiesTagsEntity {
    return ThirdpartiesTagsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): ThirdpartiesTagsEntity {
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
    d.tag = TagsEntityOrTag1.Create(d.tag, field + ".tag");
    checkString(d.weight, field + ".weight");
    const knownProperties = ["id","tag","weight"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new ThirdpartiesTagsEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.tag = d.tag;
    this.weight = d.weight;
  }
}

export class TagsEntityOrTag1 {
  public readonly color?: string;
  public readonly group: Group;
  public readonly group_id: number;
  public readonly id: number;
  public readonly label: string;
  public static Parse(d: string): TagsEntityOrTag1 {
    return TagsEntityOrTag1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): TagsEntityOrTag1 {
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
    if ("color" in d) {
      checkString(d.color, field + ".color");
    }
    d.group = Group.Create(d.group, field + ".group");
    checkNumber(d.group_id, field + ".group_id");
    checkNumber(d.id, field + ".id");
    checkString(d.label, field + ".label");
    const knownProperties = ["color","group","group_id","id","label"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new TagsEntityOrTag1(d);
  }
  private constructor(d: any) {
    if ("color" in d) this.color = d.color;
    this.group = d.group;
    this.group_id = d.group_id;
    this.id = d.id;
    this.label = d.label;
  }
}

export class ThirdpartyInvoiceLineRulesEntity1 {
  public readonly pnl_plan_item: PnlPlanItem1 | null;
  public readonly vat_rate: string | null;
  public static Parse(d: string): ThirdpartyInvoiceLineRulesEntity1 {
    return ThirdpartyInvoiceLineRulesEntity1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): ThirdpartyInvoiceLineRulesEntity1 {
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
      d.pnl_plan_item = PnlPlanItem1.Create(d.pnl_plan_item, field + ".pnl_plan_item", "PnlPlanItem1 | null");
    } catch (e) {
      try {
        checkNull(d.pnl_plan_item, field + ".pnl_plan_item", "PnlPlanItem1 | null");
      } catch (e) {
      }
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
    const knownProperties = ["pnl_plan_item","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new ThirdpartyInvoiceLineRulesEntity1(d);
  }
  private constructor(d: any) {
    this.pnl_plan_item = d.pnl_plan_item;
    this.vat_rate = d.vat_rate;
  }
}

export class PnlPlanItem1 {
  public readonly enabled: boolean;
  public readonly id: number;
  public readonly label: string;
  public readonly number: string;
  public static Parse(d: string): PnlPlanItem1 {
    return PnlPlanItem1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): PnlPlanItem1 {
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
    return new PnlPlanItem1(d);
  }
  private constructor(d: any) {
    this.enabled = d.enabled;
    this.id = d.id;
    this.label = d.label;
    this.number = d.number;
  }
}

export class ThirdpartyVisibilityRulesEntity {
  public readonly id: number;
  public readonly visible_on: string;
  public static Parse(d: string): ThirdpartyVisibilityRulesEntity {
    return ThirdpartyVisibilityRulesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): ThirdpartyVisibilityRulesEntity {
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
    checkString(d.visible_on, field + ".visible_on");
    const knownProperties = ["id","visible_on"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new ThirdpartyVisibilityRulesEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.visible_on = d.visible_on;
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
