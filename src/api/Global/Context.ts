// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIGlobalContext';
let obj: any = null;
export class APIGlobalContext {
  public readonly company: Company;
  public readonly companyFeaturesAbility: CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity[];
  public readonly experiments: null;
  public readonly firm: Firm;
  public readonly hasSwanToken: boolean;
  public readonly isKeyAccount: boolean;
  public readonly isNonProfit: boolean;
  public readonly redirect_to_onboarding_form: boolean;
  public readonly redirect_to_onboarding_steps: boolean;
  public readonly requiresUserConsent: null;
  public readonly todayFiscalYear: TodayFiscalYear;
  public readonly userFeaturesAbility: CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity[];
  public readonly userRole: null;
  public static Parse(d: string): APIGlobalContext {
    return APIGlobalContext.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIGlobalContext {
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
    d.company = Company.Create(d.company, field + ".company");
    checkArray(d.companyFeaturesAbility, field + ".companyFeaturesAbility");
    if (d.companyFeaturesAbility) {
      for (let i = 0; i < d.companyFeaturesAbility.length; i++) {
        d.companyFeaturesAbility[i] = CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity.Create(d.companyFeaturesAbility[i], field + ".companyFeaturesAbility" + "[" + i + "]");
      }
    }
    checkNull(d.experiments, field + ".experiments");
    d.firm = Firm.Create(d.firm, field + ".firm");
    checkBoolean(d.hasSwanToken, field + ".hasSwanToken");
    checkBoolean(d.isKeyAccount, field + ".isKeyAccount");
    checkBoolean(d.isNonProfit, field + ".isNonProfit");
    checkBoolean(d.redirect_to_onboarding_form, field + ".redirect_to_onboarding_form");
    checkBoolean(d.redirect_to_onboarding_steps, field + ".redirect_to_onboarding_steps");
    checkNull(d.requiresUserConsent, field + ".requiresUserConsent");
    d.todayFiscalYear = TodayFiscalYear.Create(d.todayFiscalYear, field + ".todayFiscalYear");
    checkArray(d.userFeaturesAbility, field + ".userFeaturesAbility");
    if (d.userFeaturesAbility) {
      for (let i = 0; i < d.userFeaturesAbility.length; i++) {
        d.userFeaturesAbility[i] = CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity.Create(d.userFeaturesAbility[i], field + ".userFeaturesAbility" + "[" + i + "]");
      }
    }
    checkNull(d.userRole, field + ".userRole");
    const knownProperties = ["company","companyFeaturesAbility","experiments","firm","hasSwanToken","isKeyAccount","isNonProfit","redirect_to_onboarding_form","redirect_to_onboarding_steps","requiresUserConsent","todayFiscalYear","userFeaturesAbility","userRole"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIGlobalContext(d);
  }
  private constructor(d: any) {
    this.company = d.company;
    this.companyFeaturesAbility = d.companyFeaturesAbility;
    this.experiments = d.experiments;
    this.firm = d.firm;
    this.hasSwanToken = d.hasSwanToken;
    this.isKeyAccount = d.isKeyAccount;
    this.isNonProfit = d.isNonProfit;
    this.redirect_to_onboarding_form = d.redirect_to_onboarding_form;
    this.redirect_to_onboarding_steps = d.redirect_to_onboarding_steps;
    this.requiresUserConsent = d.requiresUserConsent;
    this.todayFiscalYear = d.todayFiscalYear;
    this.userFeaturesAbility = d.userFeaturesAbility;
    this.userRole = d.userRole;
  }
}

export class Company {
  public readonly accountant: Accountant;
  public readonly accountant_editable: boolean;
  public readonly accountants_can_bypass_freezing: boolean;
  public readonly accounting_logic: string;
  public readonly accounting_manager_id: number;
  public readonly address: string;
  public readonly all_onboarding_steps_completed_at: null;
  public readonly auto_match_invoices: boolean;
  public readonly auto_process_factur_x: boolean;
  public readonly auto_process_invoices: boolean;
  public readonly billing_bank: string;
  public readonly billing_bic: string;
  public readonly billing_company_name: string;
  public readonly billing_email: string;
  public readonly billing_iban: string;
  public readonly billing_payment_conditions: string;
  public readonly billing_payment_options: string[];
  public readonly billing_telephone: string;
  public readonly billing_user_approved_at: null;
  public readonly business_description: string;
  public readonly cash_based_accounting: boolean;
  public readonly churns_on: null;
  public readonly city: string;
  public readonly closing: string;
  public readonly "country_alpha2": string;
  public readonly created_at: string;
  public readonly creation_date: string;
  public readonly customer_since: string;
  public readonly default_payment_reminder_id: null;
  public readonly default_substance: null;
  public readonly default_vat_rate: string;
  public readonly disable_pending_vat_for_customers: boolean;
  public readonly display_name: string;
  public readonly dms_activated: string;
  public readonly enable_accepted_email: boolean;
  public readonly enable_submitted_email: boolean;
  public readonly fees_default_plan_item_id?: null;
  public readonly firm: Firm1;
  public readonly firm_group: FirmGroup;
  public readonly firm_id: number;
  public readonly firm_related_settings: FirmRelatedSettings;
  public readonly fiscal_category: null;
  public readonly fiscal_regime: null;
  public readonly fiscal_rof_vat: number;
  public readonly fiscalYears: FiscalYearsEntityOrTodayFiscalYear[];
  public readonly formatted_reg_no: string;
  public readonly freeze_complete_invoices_enabled: boolean;
  public readonly frozen_since: null;
  public readonly frozen_until: string;
  public readonly gocardless_mandates_sync_at: null;
  public readonly gocardless_onboarding_status: string;
  public readonly gocardless_organization_id: null;
  public readonly handelsregisternummer: null;
  public readonly has_budgetinsight: boolean;
  public readonly has_pro_account: boolean;
  public readonly hasAccountant: boolean;
  public readonly hasCards: boolean;
  public readonly hasChequeDeposits: boolean;
  public readonly id: number;
  public readonly instructions: string;
  public readonly invoices_generation_from_migrations_and_ledger_events_dumps: boolean;
  public readonly invoicing_software: null;
  public readonly is_onboarding_ongoing: boolean;
  public readonly is_revision_only: boolean;
  public readonly isConstruction: boolean;
  public readonly isDemo: boolean;
  public readonly isFake: boolean;
  public readonly isMasterDemo: boolean;
  public readonly isPLSubsidiary: boolean;
  public readonly isRestaurant: boolean;
  public readonly isRev: boolean;
  public readonly isTraining: boolean;
  public readonly ledger_event_control_enabled: boolean;
  public readonly legal_form_code: string;
  public readonly logo: null;
  public readonly logo_url: null;
  public readonly maxDate: string;
  public readonly minDate: string;
  public readonly name: string;
  public readonly number_of_employees: string;
  public readonly nUsedTagGroups: null;
  public readonly onboarding_form_completed_at: string;
  public readonly one_stop_shop: boolean;
  public readonly payroll_solution: null;
  public readonly plan_item_number_length?: null;
  public readonly postal_code: string;
  public readonly primary_color: string;
  public readonly pusher_channel: string;
  public readonly pusher_channel_access_token: string;
  public readonly reg_no: string;
  public readonly reseller: null;
  public readonly resumption_start: string;
  public readonly resumption_status: string;
  public readonly saas_plan: string;
  public readonly salesforce_business_segmentation: string;
  public readonly salesforce_id: string;
  public readonly sepa_creditor_identifier: null;
  public readonly sepa_mandates: boolean;
  public readonly share_capital: string;
  public readonly share_capital_currency: string;
  public readonly show_bank_info_on_estimates: boolean;
  public readonly show_pro_account: boolean;
  public readonly show_quotes_branding: boolean;
  public readonly source_id: string;
  public readonly steuernummer: null;
  public readonly stripe_checkout_enabled: boolean;
  public readonly submitted_to_vat_from: string;
  public readonly subscription_plan: string;
  public readonly swan_account_holder_verification_status: null;
  public readonly swan_id: null;
  public readonly swan_onboarding_email: null;
  public readonly swan_onboarding_id: null;
  public readonly trade_name: null;
  public readonly url: string;
  public readonly use_factor: boolean;
  public readonly use_pl_as_white_label: boolean;
  public readonly vat_day_of_month: null;
  public readonly vat_frequency: string;
  public readonly vat_number: string;
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
    d.accountant = Accountant.Create(d.accountant, field + ".accountant");
    checkBoolean(d.accountant_editable, field + ".accountant_editable");
    checkBoolean(d.accountants_can_bypass_freezing, field + ".accountants_can_bypass_freezing");
    checkString(d.accounting_logic, field + ".accounting_logic");
    checkNumber(d.accounting_manager_id, field + ".accounting_manager_id");
    checkString(d.address, field + ".address");
    checkNull(d.all_onboarding_steps_completed_at, field + ".all_onboarding_steps_completed_at");
    checkBoolean(d.auto_match_invoices, field + ".auto_match_invoices");
    checkBoolean(d.auto_process_factur_x, field + ".auto_process_factur_x");
    checkBoolean(d.auto_process_invoices, field + ".auto_process_invoices");
    checkString(d.billing_bank, field + ".billing_bank");
    checkString(d.billing_bic, field + ".billing_bic");
    checkString(d.billing_company_name, field + ".billing_company_name");
    checkString(d.billing_email, field + ".billing_email");
    checkString(d.billing_iban, field + ".billing_iban");
    checkString(d.billing_payment_conditions, field + ".billing_payment_conditions");
    checkArray(d.billing_payment_options, field + ".billing_payment_options");
    if (d.billing_payment_options) {
      for (let i = 0; i < d.billing_payment_options.length; i++) {
        checkString(d.billing_payment_options[i], field + ".billing_payment_options" + "[" + i + "]");
      }
    }
    checkString(d.billing_telephone, field + ".billing_telephone");
    checkNull(d.billing_user_approved_at, field + ".billing_user_approved_at");
    checkString(d.business_description, field + ".business_description");
    checkBoolean(d.cash_based_accounting, field + ".cash_based_accounting");
    checkNull(d.churns_on, field + ".churns_on");
    checkString(d.city, field + ".city");
    checkString(d.closing, field + ".closing");
    checkString(d["country_alpha2"], field + ".country_alpha2");
    checkString(d.created_at, field + ".created_at");
    checkString(d.creation_date, field + ".creation_date");
    checkString(d.customer_since, field + ".customer_since");
    checkNull(d.default_payment_reminder_id, field + ".default_payment_reminder_id");
    checkNull(d.default_substance, field + ".default_substance");
    checkString(d.default_vat_rate, field + ".default_vat_rate");
    checkBoolean(d.disable_pending_vat_for_customers, field + ".disable_pending_vat_for_customers");
    checkString(d.display_name, field + ".display_name");
    checkString(d.dms_activated, field + ".dms_activated");
    checkBoolean(d.enable_accepted_email, field + ".enable_accepted_email");
    checkBoolean(d.enable_submitted_email, field + ".enable_submitted_email");
    if ("fees_default_plan_item_id" in d) {
      checkNull(d.fees_default_plan_item_id, field + ".fees_default_plan_item_id");
    }
    d.firm = Firm1.Create(d.firm, field + ".firm");
    d.firm_group = FirmGroup.Create(d.firm_group, field + ".firm_group");
    checkNumber(d.firm_id, field + ".firm_id");
    d.firm_related_settings = FirmRelatedSettings.Create(d.firm_related_settings, field + ".firm_related_settings");
    checkNull(d.fiscal_category, field + ".fiscal_category");
    checkNull(d.fiscal_regime, field + ".fiscal_regime");
    checkNumber(d.fiscal_rof_vat, field + ".fiscal_rof_vat");
    checkArray(d.fiscalYears, field + ".fiscalYears");
    if (d.fiscalYears) {
      for (let i = 0; i < d.fiscalYears.length; i++) {
        d.fiscalYears[i] = FiscalYearsEntityOrTodayFiscalYear.Create(d.fiscalYears[i], field + ".fiscalYears" + "[" + i + "]");
      }
    }
    checkString(d.formatted_reg_no, field + ".formatted_reg_no");
    checkBoolean(d.freeze_complete_invoices_enabled, field + ".freeze_complete_invoices_enabled");
    checkNull(d.frozen_since, field + ".frozen_since");
    checkString(d.frozen_until, field + ".frozen_until");
    checkNull(d.gocardless_mandates_sync_at, field + ".gocardless_mandates_sync_at");
    checkString(d.gocardless_onboarding_status, field + ".gocardless_onboarding_status");
    checkNull(d.gocardless_organization_id, field + ".gocardless_organization_id");
    checkNull(d.handelsregisternummer, field + ".handelsregisternummer");
    checkBoolean(d.has_budgetinsight, field + ".has_budgetinsight");
    checkBoolean(d.has_pro_account, field + ".has_pro_account");
    checkBoolean(d.hasAccountant, field + ".hasAccountant");
    checkBoolean(d.hasCards, field + ".hasCards");
    checkBoolean(d.hasChequeDeposits, field + ".hasChequeDeposits");
    checkNumber(d.id, field + ".id");
    checkString(d.instructions, field + ".instructions");
    checkBoolean(d.invoices_generation_from_migrations_and_ledger_events_dumps, field + ".invoices_generation_from_migrations_and_ledger_events_dumps");
    checkNull(d.invoicing_software, field + ".invoicing_software");
    checkBoolean(d.is_onboarding_ongoing, field + ".is_onboarding_ongoing");
    checkBoolean(d.is_revision_only, field + ".is_revision_only");
    checkBoolean(d.isConstruction, field + ".isConstruction");
    checkBoolean(d.isDemo, field + ".isDemo");
    checkBoolean(d.isFake, field + ".isFake");
    checkBoolean(d.isMasterDemo, field + ".isMasterDemo");
    checkBoolean(d.isPLSubsidiary, field + ".isPLSubsidiary");
    checkBoolean(d.isRestaurant, field + ".isRestaurant");
    checkBoolean(d.isRev, field + ".isRev");
    checkBoolean(d.isTraining, field + ".isTraining");
    checkBoolean(d.ledger_event_control_enabled, field + ".ledger_event_control_enabled");
    checkString(d.legal_form_code, field + ".legal_form_code");
    checkNull(d.logo, field + ".logo");
    checkNull(d.logo_url, field + ".logo_url");
    checkString(d.maxDate, field + ".maxDate");
    checkString(d.minDate, field + ".minDate");
    checkString(d.name, field + ".name");
    checkString(d.number_of_employees, field + ".number_of_employees");
    checkNull(d.nUsedTagGroups, field + ".nUsedTagGroups");
    checkString(d.onboarding_form_completed_at, field + ".onboarding_form_completed_at");
    checkBoolean(d.one_stop_shop, field + ".one_stop_shop");
    checkNull(d.payroll_solution, field + ".payroll_solution");
    if ("plan_item_number_length" in d) {
      checkNull(d.plan_item_number_length, field + ".plan_item_number_length");
    }
    checkString(d.postal_code, field + ".postal_code");
    checkString(d.primary_color, field + ".primary_color");
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkString(d.pusher_channel_access_token, field + ".pusher_channel_access_token");
    checkString(d.reg_no, field + ".reg_no");
    checkNull(d.reseller, field + ".reseller");
    checkString(d.resumption_start, field + ".resumption_start");
    checkString(d.resumption_status, field + ".resumption_status");
    checkString(d.saas_plan, field + ".saas_plan");
    checkString(d.salesforce_business_segmentation, field + ".salesforce_business_segmentation");
    checkString(d.salesforce_id, field + ".salesforce_id");
    checkNull(d.sepa_creditor_identifier, field + ".sepa_creditor_identifier");
    checkBoolean(d.sepa_mandates, field + ".sepa_mandates");
    checkString(d.share_capital, field + ".share_capital");
    checkString(d.share_capital_currency, field + ".share_capital_currency");
    checkBoolean(d.show_bank_info_on_estimates, field + ".show_bank_info_on_estimates");
    checkBoolean(d.show_pro_account, field + ".show_pro_account");
    checkBoolean(d.show_quotes_branding, field + ".show_quotes_branding");
    checkString(d.source_id, field + ".source_id");
    checkNull(d.steuernummer, field + ".steuernummer");
    checkBoolean(d.stripe_checkout_enabled, field + ".stripe_checkout_enabled");
    checkString(d.submitted_to_vat_from, field + ".submitted_to_vat_from");
    checkString(d.subscription_plan, field + ".subscription_plan");
    checkNull(d.swan_account_holder_verification_status, field + ".swan_account_holder_verification_status");
    checkNull(d.swan_id, field + ".swan_id");
    checkNull(d.swan_onboarding_email, field + ".swan_onboarding_email");
    checkNull(d.swan_onboarding_id, field + ".swan_onboarding_id");
    checkNull(d.trade_name, field + ".trade_name");
    checkString(d.url, field + ".url");
    checkBoolean(d.use_factor, field + ".use_factor");
    checkBoolean(d.use_pl_as_white_label, field + ".use_pl_as_white_label");
    checkNull(d.vat_day_of_month, field + ".vat_day_of_month");
    checkString(d.vat_frequency, field + ".vat_frequency");
    checkString(d.vat_number, field + ".vat_number");
    const knownProperties = ["accountant","accountant_editable","accountants_can_bypass_freezing","accounting_logic","accounting_manager_id","address","all_onboarding_steps_completed_at","auto_match_invoices","auto_process_factur_x","auto_process_invoices","billing_bank","billing_bic","billing_company_name","billing_email","billing_iban","billing_payment_conditions","billing_payment_options","billing_telephone","billing_user_approved_at","business_description","cash_based_accounting","churns_on","city","closing","country_alpha2","created_at","creation_date","customer_since","default_payment_reminder_id","default_substance","default_vat_rate","disable_pending_vat_for_customers","display_name","dms_activated","enable_accepted_email","enable_submitted_email","fees_default_plan_item_id","firm","firm_group","firm_id","firm_related_settings","fiscal_category","fiscal_regime","fiscal_rof_vat","fiscalYears","formatted_reg_no","freeze_complete_invoices_enabled","frozen_since","frozen_until","gocardless_mandates_sync_at","gocardless_onboarding_status","gocardless_organization_id","handelsregisternummer","has_budgetinsight","has_pro_account","hasAccountant","hasCards","hasChequeDeposits","id","instructions","invoices_generation_from_migrations_and_ledger_events_dumps","invoicing_software","is_onboarding_ongoing","is_revision_only","isConstruction","isDemo","isFake","isMasterDemo","isPLSubsidiary","isRestaurant","isRev","isTraining","ledger_event_control_enabled","legal_form_code","logo","logo_url","maxDate","minDate","name","number_of_employees","nUsedTagGroups","onboarding_form_completed_at","one_stop_shop","payroll_solution","plan_item_number_length","postal_code","primary_color","pusher_channel","pusher_channel_access_token","reg_no","reseller","resumption_start","resumption_status","saas_plan","salesforce_business_segmentation","salesforce_id","sepa_creditor_identifier","sepa_mandates","share_capital","share_capital_currency","show_bank_info_on_estimates","show_pro_account","show_quotes_branding","source_id","steuernummer","stripe_checkout_enabled","submitted_to_vat_from","subscription_plan","swan_account_holder_verification_status","swan_id","swan_onboarding_email","swan_onboarding_id","trade_name","url","use_factor","use_pl_as_white_label","vat_day_of_month","vat_frequency","vat_number"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Company(d);
  }
  private constructor(d: any) {
    this.accountant = d.accountant;
    this.accountant_editable = d.accountant_editable;
    this.accountants_can_bypass_freezing = d.accountants_can_bypass_freezing;
    this.accounting_logic = d.accounting_logic;
    this.accounting_manager_id = d.accounting_manager_id;
    this.address = d.address;
    this.all_onboarding_steps_completed_at = d.all_onboarding_steps_completed_at;
    this.auto_match_invoices = d.auto_match_invoices;
    this.auto_process_factur_x = d.auto_process_factur_x;
    this.auto_process_invoices = d.auto_process_invoices;
    this.billing_bank = d.billing_bank;
    this.billing_bic = d.billing_bic;
    this.billing_company_name = d.billing_company_name;
    this.billing_email = d.billing_email;
    this.billing_iban = d.billing_iban;
    this.billing_payment_conditions = d.billing_payment_conditions;
    this.billing_payment_options = d.billing_payment_options;
    this.billing_telephone = d.billing_telephone;
    this.billing_user_approved_at = d.billing_user_approved_at;
    this.business_description = d.business_description;
    this.cash_based_accounting = d.cash_based_accounting;
    this.churns_on = d.churns_on;
    this.city = d.city;
    this.closing = d.closing;
    this["country_alpha2"] = d["country_alpha2"];
    this.created_at = d.created_at;
    this.creation_date = d.creation_date;
    this.customer_since = d.customer_since;
    this.default_payment_reminder_id = d.default_payment_reminder_id;
    this.default_substance = d.default_substance;
    this.default_vat_rate = d.default_vat_rate;
    this.disable_pending_vat_for_customers = d.disable_pending_vat_for_customers;
    this.display_name = d.display_name;
    this.dms_activated = d.dms_activated;
    this.enable_accepted_email = d.enable_accepted_email;
    this.enable_submitted_email = d.enable_submitted_email;
    if ("fees_default_plan_item_id" in d) this.fees_default_plan_item_id = d.fees_default_plan_item_id;
    this.firm = d.firm;
    this.firm_group = d.firm_group;
    this.firm_id = d.firm_id;
    this.firm_related_settings = d.firm_related_settings;
    this.fiscal_category = d.fiscal_category;
    this.fiscal_regime = d.fiscal_regime;
    this.fiscal_rof_vat = d.fiscal_rof_vat;
    this.fiscalYears = d.fiscalYears;
    this.formatted_reg_no = d.formatted_reg_no;
    this.freeze_complete_invoices_enabled = d.freeze_complete_invoices_enabled;
    this.frozen_since = d.frozen_since;
    this.frozen_until = d.frozen_until;
    this.gocardless_mandates_sync_at = d.gocardless_mandates_sync_at;
    this.gocardless_onboarding_status = d.gocardless_onboarding_status;
    this.gocardless_organization_id = d.gocardless_organization_id;
    this.handelsregisternummer = d.handelsregisternummer;
    this.has_budgetinsight = d.has_budgetinsight;
    this.has_pro_account = d.has_pro_account;
    this.hasAccountant = d.hasAccountant;
    this.hasCards = d.hasCards;
    this.hasChequeDeposits = d.hasChequeDeposits;
    this.id = d.id;
    this.instructions = d.instructions;
    this.invoices_generation_from_migrations_and_ledger_events_dumps = d.invoices_generation_from_migrations_and_ledger_events_dumps;
    this.invoicing_software = d.invoicing_software;
    this.is_onboarding_ongoing = d.is_onboarding_ongoing;
    this.is_revision_only = d.is_revision_only;
    this.isConstruction = d.isConstruction;
    this.isDemo = d.isDemo;
    this.isFake = d.isFake;
    this.isMasterDemo = d.isMasterDemo;
    this.isPLSubsidiary = d.isPLSubsidiary;
    this.isRestaurant = d.isRestaurant;
    this.isRev = d.isRev;
    this.isTraining = d.isTraining;
    this.ledger_event_control_enabled = d.ledger_event_control_enabled;
    this.legal_form_code = d.legal_form_code;
    this.logo = d.logo;
    this.logo_url = d.logo_url;
    this.maxDate = d.maxDate;
    this.minDate = d.minDate;
    this.name = d.name;
    this.number_of_employees = d.number_of_employees;
    this.nUsedTagGroups = d.nUsedTagGroups;
    this.onboarding_form_completed_at = d.onboarding_form_completed_at;
    this.one_stop_shop = d.one_stop_shop;
    this.payroll_solution = d.payroll_solution;
    if ("plan_item_number_length" in d) this.plan_item_number_length = d.plan_item_number_length;
    this.postal_code = d.postal_code;
    this.primary_color = d.primary_color;
    this.pusher_channel = d.pusher_channel;
    this.pusher_channel_access_token = d.pusher_channel_access_token;
    this.reg_no = d.reg_no;
    this.reseller = d.reseller;
    this.resumption_start = d.resumption_start;
    this.resumption_status = d.resumption_status;
    this.saas_plan = d.saas_plan;
    this.salesforce_business_segmentation = d.salesforce_business_segmentation;
    this.salesforce_id = d.salesforce_id;
    this.sepa_creditor_identifier = d.sepa_creditor_identifier;
    this.sepa_mandates = d.sepa_mandates;
    this.share_capital = d.share_capital;
    this.share_capital_currency = d.share_capital_currency;
    this.show_bank_info_on_estimates = d.show_bank_info_on_estimates;
    this.show_pro_account = d.show_pro_account;
    this.show_quotes_branding = d.show_quotes_branding;
    this.source_id = d.source_id;
    this.steuernummer = d.steuernummer;
    this.stripe_checkout_enabled = d.stripe_checkout_enabled;
    this.submitted_to_vat_from = d.submitted_to_vat_from;
    this.subscription_plan = d.subscription_plan;
    this.swan_account_holder_verification_status = d.swan_account_holder_verification_status;
    this.swan_id = d.swan_id;
    this.swan_onboarding_email = d.swan_onboarding_email;
    this.swan_onboarding_id = d.swan_onboarding_id;
    this.trade_name = d.trade_name;
    this.url = d.url;
    this.use_factor = d.use_factor;
    this.use_pl_as_white_label = d.use_pl_as_white_label;
    this.vat_day_of_month = d.vat_day_of_month;
    this.vat_frequency = d.vat_frequency;
    this.vat_number = d.vat_number;
  }
}

export class Accountant {
  public readonly first_name: string;
  public readonly last_name: string;
  public static Parse(d: string): Accountant {
    return Accountant.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Accountant {
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
    checkString(d.last_name, field + ".last_name");
    const knownProperties = ["first_name","last_name"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Accountant(d);
  }
  private constructor(d: any) {
    this.first_name = d.first_name;
    this.last_name = d.last_name;
  }
}

export class Firm1 {
  public readonly id: number;
  public readonly internal_name: string;
  public readonly light_logo_url: null;
  public readonly mobile_logo_url: null;
  public readonly name: string;
  public readonly portal_url: string;
  public readonly white_label: boolean;
  public static Parse(d: string): Firm1 {
    return Firm1.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Firm1 {
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
    checkString(d.internal_name, field + ".internal_name");
    checkNull(d.light_logo_url, field + ".light_logo_url");
    checkNull(d.mobile_logo_url, field + ".mobile_logo_url");
    checkString(d.name, field + ".name");
    checkString(d.portal_url, field + ".portal_url");
    checkBoolean(d.white_label, field + ".white_label");
    const knownProperties = ["id","internal_name","light_logo_url","mobile_logo_url","name","portal_url","white_label"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Firm1(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.internal_name = d.internal_name;
    this.light_logo_url = d.light_logo_url;
    this.mobile_logo_url = d.mobile_logo_url;
    this.name = d.name;
    this.portal_url = d.portal_url;
    this.white_label = d.white_label;
  }
}

export class FirmGroup {
  public readonly id: number;
  public readonly internal_name: string;
  public readonly name: string;
  public readonly standalone: boolean;
  public static Parse(d: string): FirmGroup {
    return FirmGroup.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): FirmGroup {
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
    checkString(d.internal_name, field + ".internal_name");
    checkString(d.name, field + ".name");
    checkBoolean(d.standalone, field + ".standalone");
    const knownProperties = ["id","internal_name","name","standalone"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new FirmGroup(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.internal_name = d.internal_name;
    this.name = d.name;
    this.standalone = d.standalone;
  }
}

export class FirmRelatedSettings {
  public readonly ai_comptassistant_enabled: boolean;
  public readonly ai_enabled: boolean;
  public readonly ai_report_analysis_enabled: boolean;
  public readonly ai_smart_dms_enabled?: boolean;
  public readonly block_accountant_user_creation: boolean;
  public readonly block_company_creation: boolean;
  public readonly block_sme_user_creation: boolean;
  public readonly cabinet_text_override: null;
  public readonly company_saas_plan: null;
  public readonly comptable_text_override: null;
  public readonly customized_first_steps_enabled: boolean;
  public readonly hide_pro_account: boolean;
  public readonly show_accountant_tab: boolean;
  public readonly show_onboarding_video: boolean;
  public static Parse(d: string): FirmRelatedSettings {
    return FirmRelatedSettings.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): FirmRelatedSettings {
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
    checkBoolean(d.ai_comptassistant_enabled, field + ".ai_comptassistant_enabled");
    checkBoolean(d.ai_enabled, field + ".ai_enabled");
    checkBoolean(d.ai_report_analysis_enabled, field + ".ai_report_analysis_enabled");
    if ("ai_smart_dms_enabled" in d) {
      checkBoolean(d.ai_smart_dms_enabled, field + ".ai_smart_dms_enabled");
    }
    checkBoolean(d.block_accountant_user_creation, field + ".block_accountant_user_creation");
    checkBoolean(d.block_company_creation, field + ".block_company_creation");
    checkBoolean(d.block_sme_user_creation, field + ".block_sme_user_creation");
    checkNull(d.cabinet_text_override, field + ".cabinet_text_override");
    checkNull(d.company_saas_plan, field + ".company_saas_plan");
    checkNull(d.comptable_text_override, field + ".comptable_text_override");
    checkBoolean(d.customized_first_steps_enabled, field + ".customized_first_steps_enabled");
    checkBoolean(d.hide_pro_account, field + ".hide_pro_account");
    checkBoolean(d.show_accountant_tab, field + ".show_accountant_tab");
    checkBoolean(d.show_onboarding_video, field + ".show_onboarding_video");
    const knownProperties = ["ai_comptassistant_enabled","ai_enabled","ai_report_analysis_enabled","ai_smart_dms_enabled","block_accountant_user_creation","block_company_creation","block_sme_user_creation","cabinet_text_override","company_saas_plan","comptable_text_override","customized_first_steps_enabled","hide_pro_account","show_accountant_tab","show_onboarding_video"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new FirmRelatedSettings(d);
  }
  private constructor(d: any) {
    this.ai_comptassistant_enabled = d.ai_comptassistant_enabled;
    this.ai_enabled = d.ai_enabled;
    this.ai_report_analysis_enabled = d.ai_report_analysis_enabled;
    if ("ai_smart_dms_enabled" in d) this.ai_smart_dms_enabled = d.ai_smart_dms_enabled;
    this.block_accountant_user_creation = d.block_accountant_user_creation;
    this.block_company_creation = d.block_company_creation;
    this.block_sme_user_creation = d.block_sme_user_creation;
    this.cabinet_text_override = d.cabinet_text_override;
    this.company_saas_plan = d.company_saas_plan;
    this.comptable_text_override = d.comptable_text_override;
    this.customized_first_steps_enabled = d.customized_first_steps_enabled;
    this.hide_pro_account = d.hide_pro_account;
    this.show_accountant_tab = d.show_accountant_tab;
    this.show_onboarding_video = d.show_onboarding_video;
  }
}

export class FiscalYearsEntityOrTodayFiscalYear {
  public readonly carryover_generation_status: string;
  public readonly carryover_id: null | number;
  public readonly closed_at: string | null;
  public readonly finish: string;
  public readonly id: number;
  public readonly pusher_channel: string;
  public readonly start: string;
  public readonly status: string;
  public readonly validation_status: string;
  public static Parse(d: string): FiscalYearsEntityOrTodayFiscalYear {
    return FiscalYearsEntityOrTodayFiscalYear.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): FiscalYearsEntityOrTodayFiscalYear {
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
    checkString(d.carryover_generation_status, field + ".carryover_generation_status");
    // This will be refactored in the next release.
    try {
      checkNull(d.carryover_id, field + ".carryover_id", "null | number");
    } catch (e) {
      try {
        checkNumber(d.carryover_id, field + ".carryover_id", "null | number");
      } catch (e) {
      }
    }
    // This will be refactored in the next release.
    try {
      checkString(d.closed_at, field + ".closed_at", "string | null");
    } catch (e) {
      try {
        checkNull(d.closed_at, field + ".closed_at", "string | null");
      } catch (e) {
      }
    }
    checkString(d.finish, field + ".finish");
    checkNumber(d.id, field + ".id");
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkString(d.start, field + ".start");
    checkString(d.status, field + ".status");
    checkString(d.validation_status, field + ".validation_status");
    const knownProperties = ["carryover_generation_status","carryover_id","closed_at","finish","id","pusher_channel","start","status","validation_status"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new FiscalYearsEntityOrTodayFiscalYear(d);
  }
  private constructor(d: any) {
    this.carryover_generation_status = d.carryover_generation_status;
    this.carryover_id = d.carryover_id;
    this.closed_at = d.closed_at;
    this.finish = d.finish;
    this.id = d.id;
    this.pusher_channel = d.pusher_channel;
    this.start = d.start;
    this.status = d.status;
    this.validation_status = d.validation_status;
  }
}

export class CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity {
  public readonly action: string;
  public readonly subject: string[];
  public static Parse(d: string): CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity {
    return CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity {
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
    checkString(d.action, field + ".action");
    checkArray(d.subject, field + ".subject");
    if (d.subject) {
      for (let i = 0; i < d.subject.length; i++) {
        checkString(d.subject[i], field + ".subject" + "[" + i + "]");
      }
    }
    const knownProperties = ["action","subject"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity(d);
  }
  private constructor(d: any) {
    this.action = d.action;
    this.subject = d.subject;
  }
}

export class Firm {
  public readonly grant_subsidiaries_access_to_all_companies: boolean;
  public readonly id: number;
  public readonly internalName: string;
  public readonly isUserInvitationButtonHidden: boolean;
  public readonly name: string;
  public readonly own_company_id: null;
  public readonly white_label: boolean;
  public static Parse(d: string): Firm {
    return Firm.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Firm {
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
    checkBoolean(d.grant_subsidiaries_access_to_all_companies, field + ".grant_subsidiaries_access_to_all_companies");
    checkNumber(d.id, field + ".id");
    checkString(d.internalName, field + ".internalName");
    checkBoolean(d.isUserInvitationButtonHidden, field + ".isUserInvitationButtonHidden");
    checkString(d.name, field + ".name");
    checkNull(d.own_company_id, field + ".own_company_id");
    checkBoolean(d.white_label, field + ".white_label");
    const knownProperties = ["grant_subsidiaries_access_to_all_companies","id","internalName","isUserInvitationButtonHidden","name","own_company_id","white_label"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Firm(d);
  }
  private constructor(d: any) {
    this.grant_subsidiaries_access_to_all_companies = d.grant_subsidiaries_access_to_all_companies;
    this.id = d.id;
    this.internalName = d.internalName;
    this.isUserInvitationButtonHidden = d.isUserInvitationButtonHidden;
    this.name = d.name;
    this.own_company_id = d.own_company_id;
    this.white_label = d.white_label;
  }
}

export class TodayFiscalYear {
  public readonly carryover_generation_status: string;
  public readonly carryover_id: null;
  public readonly closed_at: null;
  public readonly finish: string;
  public readonly id: number;
  public readonly pusher_channel: string;
  public readonly start: string;
  public readonly status: string;
  public readonly validation_status: string;
  public static Parse(d: string): TodayFiscalYear {
    return TodayFiscalYear.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): TodayFiscalYear {
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
    checkString(d.carryover_generation_status, field + ".carryover_generation_status");
    checkNull(d.carryover_id, field + ".carryover_id");
    checkNull(d.closed_at, field + ".closed_at");
    checkString(d.finish, field + ".finish");
    checkNumber(d.id, field + ".id");
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkString(d.start, field + ".start");
    checkString(d.status, field + ".status");
    checkString(d.validation_status, field + ".validation_status");
    const knownProperties = ["carryover_generation_status","carryover_id","closed_at","finish","id","pusher_channel","start","status","validation_status"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new TodayFiscalYear(d);
  }
  private constructor(d: any) {
    this.carryover_generation_status = d.carryover_generation_status;
    this.carryover_id = d.carryover_id;
    this.closed_at = d.closed_at;
    this.finish = d.finish;
    this.id = d.id;
    this.pusher_channel = d.pusher_channel;
    this.start = d.start;
    this.status = d.status;
    this.validation_status = d.validation_status;
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
