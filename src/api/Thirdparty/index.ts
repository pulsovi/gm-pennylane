// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIThirdparty';
let obj: any = null;
export class APIThirdparty {
  public readonly supplier?: Supplier | null;
  public readonly customer?: Customer | null;
  public static Parse(d: string): APIThirdparty {
    return APIThirdparty.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APIThirdparty {
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
    d.supplier = Supplier.Create(d.supplier, field + ".supplier");
    d.customer = Customer.Create(d.customer, field + ".customer");
    const knownProperties = ["supplier","customer"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APIThirdparty(d);
  }
  private constructor(d: any) {
    if ("supplier" in d) this.supplier = d.supplier;
    if ("customer" in d) this.customer = d.customer;
  }
}

export class Supplier {
  public readonly id: number;
  public readonly company_id: number;
  public readonly disable_pending_vat: boolean;
  public readonly emails?: null[] | null;
  public readonly "country_alpha2": string;
  public readonly force_pending_vat: boolean;
  public readonly iban: string;
  public readonly invoices_auto_generated: boolean;
  public readonly invoices_auto_validated: boolean;
  public readonly name: string;
  public readonly notes: string;
  public readonly search_terms?: string[] | null;
  public readonly supplier_payment_method?: null;
  public readonly vat_number: string;
  public readonly supplier_due_date_delay?: null;
  public readonly supplier_due_date_rule: string;
  public readonly address: string;
  public readonly city: string;
  public readonly postal_code: string;
  public readonly admin_city_code?: null;
  public readonly activity_nomenclature: string;
  public readonly establishment_no?: null;
  public readonly notes_comment?: null;
  public readonly plan_item: PlanItem;
  public readonly thirdparty_invoice_line_rules?: ThirdpartyInvoiceLineRulesEntity[] | null;
  public readonly tags?: (TagsEntityOrTag | null)[] | null;
  public readonly thirdparties_tags?: (ThirdpartiesTagsEntity | null)[] | null;
  public readonly iban_last_update?: IbanLastUpdate | null;
  public readonly thirdparty_visibility_rules?: ThirdpartyVisibilityRulesEntity[] | null;
  public static Parse(d: string): Supplier | null {
    return Supplier.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Supplier | null {
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
    checkBoolean(d.disable_pending_vat, false, field + ".disable_pending_vat");
    checkArray(d.emails, field + ".emails");
    if (d.emails) {
      for (let i = 0; i < d.emails.length; i++) {
        checkNull(d.emails[i], field + ".emails" + "[" + i + "]");
      }
    }
    checkString(d["country_alpha2"], false, field + ".country_alpha2");
    checkBoolean(d.force_pending_vat, false, field + ".force_pending_vat");
    checkString(d.iban, false, field + ".iban");
    checkBoolean(d.invoices_auto_generated, false, field + ".invoices_auto_generated");
    checkBoolean(d.invoices_auto_validated, false, field + ".invoices_auto_validated");
    checkString(d.name, false, field + ".name");
    checkString(d.notes, false, field + ".notes");
    checkArray(d.search_terms, field + ".search_terms");
    if (d.search_terms) {
      for (let i = 0; i < d.search_terms.length; i++) {
        checkString(d.search_terms[i], false, field + ".search_terms" + "[" + i + "]");
      }
    }
    checkNull(d.supplier_payment_method, field + ".supplier_payment_method");
    checkString(d.vat_number, false, field + ".vat_number");
    checkNull(d.supplier_due_date_delay, field + ".supplier_due_date_delay");
    checkString(d.supplier_due_date_rule, false, field + ".supplier_due_date_rule");
    checkString(d.address, false, field + ".address");
    checkString(d.city, false, field + ".city");
    checkString(d.postal_code, false, field + ".postal_code");
    checkNull(d.admin_city_code, field + ".admin_city_code");
    checkString(d.activity_nomenclature, false, field + ".activity_nomenclature");
    checkNull(d.establishment_no, field + ".establishment_no");
    checkNull(d.notes_comment, field + ".notes_comment");
    d.plan_item = PlanItem.Create(d.plan_item, field + ".plan_item");
    checkArray(d.thirdparty_invoice_line_rules, field + ".thirdparty_invoice_line_rules");
    if (d.thirdparty_invoice_line_rules) {
      for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {
        d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity.Create(d.thirdparty_invoice_line_rules[i], field + ".thirdparty_invoice_line_rules" + "[" + i + "]");
      }
    }
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
    d.iban_last_update = IbanLastUpdate.Create(d.iban_last_update, field + ".iban_last_update");
    checkArray(d.thirdparty_visibility_rules, field + ".thirdparty_visibility_rules");
    if (d.thirdparty_visibility_rules) {
      for (let i = 0; i < d.thirdparty_visibility_rules.length; i++) {
        d.thirdparty_visibility_rules[i] = ThirdpartyVisibilityRulesEntity.Create(d.thirdparty_visibility_rules[i], field + ".thirdparty_visibility_rules" + "[" + i + "]");
      }
    }
    const knownProperties = ["id","company_id","disable_pending_vat","emails","country_alpha2","force_pending_vat","iban","invoices_auto_generated","invoices_auto_validated","name","notes","search_terms","supplier_payment_method","vat_number","supplier_due_date_delay","supplier_due_date_rule","address","city","postal_code","admin_city_code","activity_nomenclature","establishment_no","notes_comment","plan_item","thirdparty_invoice_line_rules","tags","thirdparties_tags","iban_last_update","thirdparty_visibility_rules"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Supplier(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.company_id = d.company_id;
    this.disable_pending_vat = d.disable_pending_vat;
    if ("emails" in d) this.emails = d.emails;
    this["country_alpha2"] = d["country_alpha2"];
    this.force_pending_vat = d.force_pending_vat;
    this.iban = d.iban;
    this.invoices_auto_generated = d.invoices_auto_generated;
    this.invoices_auto_validated = d.invoices_auto_validated;
    this.name = d.name;
    this.notes = d.notes;
    if ("search_terms" in d) this.search_terms = d.search_terms;
    if ("supplier_payment_method" in d) this.supplier_payment_method = d.supplier_payment_method;
    this.vat_number = d.vat_number;
    if ("supplier_due_date_delay" in d) this.supplier_due_date_delay = d.supplier_due_date_delay;
    this.supplier_due_date_rule = d.supplier_due_date_rule;
    this.address = d.address;
    this.city = d.city;
    this.postal_code = d.postal_code;
    if ("admin_city_code" in d) this.admin_city_code = d.admin_city_code;
    this.activity_nomenclature = d.activity_nomenclature;
    if ("establishment_no" in d) this.establishment_no = d.establishment_no;
    if ("notes_comment" in d) this.notes_comment = d.notes_comment;
    this.plan_item = d.plan_item;
    if ("thirdparty_invoice_line_rules" in d) this.thirdparty_invoice_line_rules = d.thirdparty_invoice_line_rules;
    if ("tags" in d) this.tags = d.tags;
    if ("thirdparties_tags" in d) this.thirdparties_tags = d.thirdparties_tags;
    if ("iban_last_update" in d) this.iban_last_update = d.iban_last_update;
    if ("thirdparty_visibility_rules" in d) this.thirdparty_visibility_rules = d.thirdparty_visibility_rules;
  }
}

export class PlanItem {
  public readonly id: number;
  public readonly number: string;
  public static Parse(d: string): PlanItem {
    return PlanItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): PlanItem {
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
    const knownProperties = ["id","number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new PlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.number = d.number;
  }
}

export class ThirdpartyInvoiceLineRulesEntity {
  public readonly pnl_plan_item: PnlPlanItem;
  public readonly vat_rate?: string | null;
  public static Parse(d: string): ThirdpartyInvoiceLineRulesEntity {
    return ThirdpartyInvoiceLineRulesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): ThirdpartyInvoiceLineRulesEntity {
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
    d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    checkString(d.vat_rate, true, field + ".vat_rate");
    const knownProperties = ["pnl_plan_item","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new ThirdpartyInvoiceLineRulesEntity(d);
  }
  private constructor(d: any) {
    this.pnl_plan_item = d.pnl_plan_item;
    if ("vat_rate" in d) this.vat_rate = d.vat_rate;
  }
}

export class PnlPlanItem {
  public readonly id: number;
  public readonly enabled: boolean;
  public readonly label: string;
  public readonly number: string;
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
    checkBoolean(d.enabled, false, field + ".enabled");
    checkString(d.label, false, field + ".label");
    checkString(d.number, false, field + ".number");
    const knownProperties = ["id","enabled","label","number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new PnlPlanItem(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.enabled = d.enabled;
    this.label = d.label;
    this.number = d.number;
  }
}

export class TagsEntityOrTag {
  public readonly id: number;
  public readonly label: string;
  public readonly group_id: number;
  public readonly group: Group;
  public static Parse(d: string): TagsEntityOrTag | null {
    return TagsEntityOrTag.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): TagsEntityOrTag | null {
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
    checkString(d.label, false, field + ".label");
    checkNumber(d.group_id, false, field + ".group_id");
    d.group = Group.Create(d.group, field + ".group");
    const knownProperties = ["id","label","group_id","group"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new TagsEntityOrTag(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.label = d.label;
    this.group_id = d.group_id;
    this.group = d.group;
  }
}

export class Group {
  public readonly label: string;
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
    checkBoolean(d.self_service_accounting, false, field + ".self_service_accounting");
    const knownProperties = ["label","self_service_accounting"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Group(d);
  }
  private constructor(d: any) {
    this.label = d.label;
    this.self_service_accounting = d.self_service_accounting;
  }
}

export class ThirdpartiesTagsEntity {
  public readonly id: number;
  public readonly weight: string;
  public readonly tag: TagsEntityOrTag1;
  public static Parse(d: string): ThirdpartiesTagsEntity | null {
    return ThirdpartiesTagsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): ThirdpartiesTagsEntity | null {
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
    checkString(d.weight, false, field + ".weight");
    d.tag = TagsEntityOrTag1.Create(d.tag, field + ".tag");
    const knownProperties = ["id","weight","tag"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new ThirdpartiesTagsEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.weight = d.weight;
    this.tag = d.tag;
  }
}

export class TagsEntityOrTag1 {
  public readonly id: number;
  public readonly label: string;
  public readonly group_id: number;
  public readonly group: Group;
  public static Parse(d: string): TagsEntityOrTag1 {
    return TagsEntityOrTag1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): TagsEntityOrTag1 {
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
    checkNumber(d.group_id, false, field + ".group_id");
    d.group = Group.Create(d.group, field + ".group");
    const knownProperties = ["id","label","group_id","group"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new TagsEntityOrTag1(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.label = d.label;
    this.group_id = d.group_id;
    this.group = d.group;
  }
}

export class IbanLastUpdate {
  public readonly at: string;
  public readonly name: string;
  public readonly from_pennylane: boolean;
  public static Parse(d: string): IbanLastUpdate | null {
    return IbanLastUpdate.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): IbanLastUpdate | null {
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
    checkString(d.at, false, field + ".at");
    checkString(d.name, false, field + ".name");
    checkBoolean(d.from_pennylane, false, field + ".from_pennylane");
    const knownProperties = ["at","name","from_pennylane"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new IbanLastUpdate(d);
  }
  private constructor(d: any) {
    this.at = d.at;
    this.name = d.name;
    this.from_pennylane = d.from_pennylane;
  }
}

export class ThirdpartyVisibilityRulesEntity {
  public readonly id: number;
  public readonly visible_on: string;
  public static Parse(d: string): ThirdpartyVisibilityRulesEntity {
    return ThirdpartyVisibilityRulesEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): ThirdpartyVisibilityRulesEntity {
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
    checkString(d.visible_on, false, field + ".visible_on");
    const knownProperties = ["id","visible_on"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new ThirdpartyVisibilityRulesEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.visible_on = d.visible_on;
  }
}

export class Customer {
  public readonly id: number;
  public readonly company_id: number;
  public readonly address: string;
  public readonly address_additional_info: string;
  public readonly billing_bank?: null;
  public readonly billing_bic?: null;
  public readonly billing_footer_invoice_id?: null;
  public readonly billing_iban?: null;
  public readonly billing_language: string;
  public readonly city: string;
  public readonly "country_alpha2": string;
  public readonly customer_type: string;
  public readonly delivery_address: string;
  public readonly delivery_address_additional_info: string;
  public readonly delivery_city: string;
  public readonly "delivery_country_alpha2": string;
  public readonly delivery_postal_code: string;
  public readonly disable_pending_vat: boolean;
  public readonly emails?: null[] | null;
  public readonly first_name: string;
  public readonly force_pending_vat: boolean;
  public readonly invoices_auto_generated: boolean;
  public readonly invoices_auto_validated: boolean;
  public readonly last_name: string;
  public readonly name: string;
  public readonly notes: string;
  public readonly payment_conditions: string;
  public readonly phone: string;
  public readonly postal_code: string;
  public readonly reference: string;
  public readonly reg_no: string;
  public readonly search_terms?: string[] | null;
  public readonly source_id: string;
  public readonly vat_number: string;
  public readonly recipient: string;
  public readonly notes_comment?: null;
  public readonly plan_item: PlanItem;
  public readonly thirdparty_invoice_line_rules?: ThirdpartyInvoiceLineRulesEntity1[] | null;
  public readonly tags?: null[] | null;
  public readonly thirdparties_tags?: null[] | null;
  public readonly billing_footer_invoice?: null;
  public readonly sepa_mandate?: null;
  public readonly current_mandate?: null;
  public readonly received_a_mandate_request: boolean;
  public readonly thirdparty_contacts?: null[] | null;
  public static Parse(d: string): Customer | null {
    return Customer.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): Customer | null {
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
    checkString(d.address, false, field + ".address");
    checkString(d.address_additional_info, false, field + ".address_additional_info");
    checkNull(d.billing_bank, field + ".billing_bank");
    checkNull(d.billing_bic, field + ".billing_bic");
    checkNull(d.billing_footer_invoice_id, field + ".billing_footer_invoice_id");
    checkNull(d.billing_iban, field + ".billing_iban");
    checkString(d.billing_language, false, field + ".billing_language");
    checkString(d.city, false, field + ".city");
    checkString(d["country_alpha2"], false, field + ".country_alpha2");
    checkString(d.customer_type, false, field + ".customer_type");
    checkString(d.delivery_address, false, field + ".delivery_address");
    checkString(d.delivery_address_additional_info, false, field + ".delivery_address_additional_info");
    checkString(d.delivery_city, false, field + ".delivery_city");
    checkString(d["delivery_country_alpha2"], false, field + ".delivery_country_alpha2");
    checkString(d.delivery_postal_code, false, field + ".delivery_postal_code");
    checkBoolean(d.disable_pending_vat, false, field + ".disable_pending_vat");
    checkArray(d.emails, field + ".emails");
    if (d.emails) {
      for (let i = 0; i < d.emails.length; i++) {
        checkNull(d.emails[i], field + ".emails" + "[" + i + "]");
      }
    }
    checkString(d.first_name, false, field + ".first_name");
    checkBoolean(d.force_pending_vat, false, field + ".force_pending_vat");
    checkBoolean(d.invoices_auto_generated, false, field + ".invoices_auto_generated");
    checkBoolean(d.invoices_auto_validated, false, field + ".invoices_auto_validated");
    checkString(d.last_name, false, field + ".last_name");
    checkString(d.name, false, field + ".name");
    checkString(d.notes, false, field + ".notes");
    checkString(d.payment_conditions, false, field + ".payment_conditions");
    checkString(d.phone, false, field + ".phone");
    checkString(d.postal_code, false, field + ".postal_code");
    checkString(d.reference, false, field + ".reference");
    checkString(d.reg_no, false, field + ".reg_no");
    checkArray(d.search_terms, field + ".search_terms");
    if (d.search_terms) {
      for (let i = 0; i < d.search_terms.length; i++) {
        checkString(d.search_terms[i], false, field + ".search_terms" + "[" + i + "]");
      }
    }
    checkString(d.source_id, false, field + ".source_id");
    checkString(d.vat_number, false, field + ".vat_number");
    checkString(d.recipient, false, field + ".recipient");
    checkNull(d.notes_comment, field + ".notes_comment");
    d.plan_item = PlanItem.Create(d.plan_item, field + ".plan_item");
    checkArray(d.thirdparty_invoice_line_rules, field + ".thirdparty_invoice_line_rules");
    if (d.thirdparty_invoice_line_rules) {
      for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {
        d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity1.Create(d.thirdparty_invoice_line_rules[i], field + ".thirdparty_invoice_line_rules" + "[" + i + "]");
      }
    }
    checkArray(d.tags, field + ".tags");
    if (d.tags) {
      for (let i = 0; i < d.tags.length; i++) {
        checkNull(d.tags[i], field + ".tags" + "[" + i + "]");
      }
    }
    checkArray(d.thirdparties_tags, field + ".thirdparties_tags");
    if (d.thirdparties_tags) {
      for (let i = 0; i < d.thirdparties_tags.length; i++) {
        checkNull(d.thirdparties_tags[i], field + ".thirdparties_tags" + "[" + i + "]");
      }
    }
    checkNull(d.billing_footer_invoice, field + ".billing_footer_invoice");
    checkNull(d.sepa_mandate, field + ".sepa_mandate");
    checkNull(d.current_mandate, field + ".current_mandate");
    checkBoolean(d.received_a_mandate_request, false, field + ".received_a_mandate_request");
    checkArray(d.thirdparty_contacts, field + ".thirdparty_contacts");
    if (d.thirdparty_contacts) {
      for (let i = 0; i < d.thirdparty_contacts.length; i++) {
        checkNull(d.thirdparty_contacts[i], field + ".thirdparty_contacts" + "[" + i + "]");
      }
    }
    const knownProperties = ["id","company_id","address","address_additional_info","billing_bank","billing_bic","billing_footer_invoice_id","billing_iban","billing_language","city","country_alpha2","customer_type","delivery_address","delivery_address_additional_info","delivery_city","delivery_country_alpha2","delivery_postal_code","disable_pending_vat","emails","first_name","force_pending_vat","invoices_auto_generated","invoices_auto_validated","last_name","name","notes","payment_conditions","phone","postal_code","reference","reg_no","search_terms","source_id","vat_number","recipient","notes_comment","plan_item","thirdparty_invoice_line_rules","tags","thirdparties_tags","billing_footer_invoice","sepa_mandate","current_mandate","received_a_mandate_request","thirdparty_contacts"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new Customer(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.company_id = d.company_id;
    this.address = d.address;
    this.address_additional_info = d.address_additional_info;
    if ("billing_bank" in d) this.billing_bank = d.billing_bank;
    if ("billing_bic" in d) this.billing_bic = d.billing_bic;
    if ("billing_footer_invoice_id" in d) this.billing_footer_invoice_id = d.billing_footer_invoice_id;
    if ("billing_iban" in d) this.billing_iban = d.billing_iban;
    this.billing_language = d.billing_language;
    this.city = d.city;
    this["country_alpha2"] = d["country_alpha2"];
    this.customer_type = d.customer_type;
    this.delivery_address = d.delivery_address;
    this.delivery_address_additional_info = d.delivery_address_additional_info;
    this.delivery_city = d.delivery_city;
    this["delivery_country_alpha2"] = d["delivery_country_alpha2"];
    this.delivery_postal_code = d.delivery_postal_code;
    this.disable_pending_vat = d.disable_pending_vat;
    if ("emails" in d) this.emails = d.emails;
    this.first_name = d.first_name;
    this.force_pending_vat = d.force_pending_vat;
    this.invoices_auto_generated = d.invoices_auto_generated;
    this.invoices_auto_validated = d.invoices_auto_validated;
    this.last_name = d.last_name;
    this.name = d.name;
    this.notes = d.notes;
    this.payment_conditions = d.payment_conditions;
    this.phone = d.phone;
    this.postal_code = d.postal_code;
    this.reference = d.reference;
    this.reg_no = d.reg_no;
    if ("search_terms" in d) this.search_terms = d.search_terms;
    this.source_id = d.source_id;
    this.vat_number = d.vat_number;
    this.recipient = d.recipient;
    if ("notes_comment" in d) this.notes_comment = d.notes_comment;
    this.plan_item = d.plan_item;
    if ("thirdparty_invoice_line_rules" in d) this.thirdparty_invoice_line_rules = d.thirdparty_invoice_line_rules;
    if ("tags" in d) this.tags = d.tags;
    if ("thirdparties_tags" in d) this.thirdparties_tags = d.thirdparties_tags;
    if ("billing_footer_invoice" in d) this.billing_footer_invoice = d.billing_footer_invoice;
    if ("sepa_mandate" in d) this.sepa_mandate = d.sepa_mandate;
    if ("current_mandate" in d) this.current_mandate = d.current_mandate;
    this.received_a_mandate_request = d.received_a_mandate_request;
    if ("thirdparty_contacts" in d) this.thirdparty_contacts = d.thirdparty_contacts;
  }
}

export class ThirdpartyInvoiceLineRulesEntity1 {
  public readonly pnl_plan_item: PnlPlanItem;
  public readonly vat_rate: string;
  public static Parse(d: string): ThirdpartyInvoiceLineRulesEntity1 {
    return ThirdpartyInvoiceLineRulesEntity1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): ThirdpartyInvoiceLineRulesEntity1 {
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
    d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + ".pnl_plan_item");
    checkString(d.vat_rate, false, field + ".vat_rate");
    const knownProperties = ["pnl_plan_item","vat_rate"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new ThirdpartyInvoiceLineRulesEntity1(d);
  }
  private constructor(d: any) {
    this.pnl_plan_item = d.pnl_plan_item;
    this.vat_rate = d.vat_rate;
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
