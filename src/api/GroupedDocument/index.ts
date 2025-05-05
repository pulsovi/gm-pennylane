// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIGroupedDocument';
let obj: any = null;
export class APIGroupedDocument {
  public readonly amount: string;
  public readonly date: null | string;
  public readonly fec_pieceref: string;
  public readonly id: number;
  public readonly is_waiting_details: boolean;
  public readonly journal: Journal;
  public readonly journal_id: number;
  public readonly label: string;
  public readonly ledgerEventsCount: number;
  public readonly readonly: boolean;
  public readonly source: string;
  public readonly taggingCount?: number;
  public readonly totalCredit: string;
  public readonly totalDebit: string;
  public readonly type: string;
  public static Parse(d: string): APIGroupedDocument {
    return APIGroupedDocument.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIGroupedDocument {
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
    checkString(d.fec_pieceref, field + ".fec_pieceref");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.is_waiting_details, field + ".is_waiting_details");
    d.journal = Journal.Create(d.journal, field + ".journal", undefined);
    checkNumber(d.journal_id, field + ".journal_id");
    checkString(d.label, field + ".label");
    checkNumber(d.ledgerEventsCount, field + ".ledgerEventsCount");
    checkBoolean(d.readonly, field + ".readonly");
    checkString(d.source, field + ".source");
    if ("taggingCount" in d) {
      checkNumber(d.taggingCount, field + ".taggingCount");
    }
    checkString(d.totalCredit, field + ".totalCredit");
    checkString(d.totalDebit, field + ".totalDebit");
    checkString(d.type, field + ".type");
    const knownProperties = ["amount","date","fec_pieceref","id","is_waiting_details","journal","journal_id","label","ledgerEventsCount","readonly","source","taggingCount","totalCredit","totalDebit","type"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new APIGroupedDocument(d);
  }
  private constructor(d: any) {
    this.amount = d.amount;
    this.date = d.date;
    this.fec_pieceref = d.fec_pieceref;
    this.id = d.id;
    this.is_waiting_details = d.is_waiting_details;
    this.journal = d.journal;
    this.journal_id = d.journal_id;
    this.label = d.label;
    this.ledgerEventsCount = d.ledgerEventsCount;
    this.readonly = d.readonly;
    this.source = d.source;
    if ("taggingCount" in d) this.taggingCount = d.taggingCount;
    this.totalCredit = d.totalCredit;
    this.totalDebit = d.totalDebit;
    this.type = d.type;
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
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new Journal(d);
  }
  private constructor(d: any) {
    this.code = d.code;
    this.id = d.id;
    this.label = d.label;
  }
}

function throwNull2NonNull(field: string, value: any, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "non-nullable object");
}
function throwNotObject(field: string, value: any, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "object");
}
function throwIsArray(field: string, value: any, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "object");
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
function errorHelper(field: string, d: any, type: string): never {
  if (!type.includes(' | ')) {
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
