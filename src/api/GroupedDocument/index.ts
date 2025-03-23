// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIGroupedDocument';
let obj: any = null;
export class APIGroupedDocument {
  public readonly id: number;
  public readonly type: string;
  public readonly date?: string | null;
  public readonly journal_id: number;
  public readonly source: string;
  public readonly is_waiting_details: boolean;
  public readonly fec_pieceref: string;
  public readonly label: string;
  public readonly amount: string;
  public readonly journal: Journal;
  public readonly readonly: boolean;
  public readonly ledgerEventsCount: number;
  public readonly totalDebit: string;
  public readonly totalCredit: string;
  public static Parse(d: string): APIGroupedDocument {
    return APIGroupedDocument.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string): APIGroupedDocument {
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
    checkString(d.type, false, field + ".type");
    checkString(d.date, true, field + ".date");
    checkNumber(d.journal_id, false, field + ".journal_id");
    checkString(d.source, false, field + ".source");
    checkBoolean(d.is_waiting_details, false, field + ".is_waiting_details");
    checkString(d.fec_pieceref, false, field + ".fec_pieceref");
    checkString(d.label, false, field + ".label");
    checkString(d.amount, false, field + ".amount");
    d.journal = Journal.Create(d.journal, field + ".journal");
    checkBoolean(d.readonly, false, field + ".readonly");
    checkNumber(d.ledgerEventsCount, false, field + ".ledgerEventsCount");
    checkString(d.totalDebit, false, field + ".totalDebit");
    checkString(d.totalCredit, false, field + ".totalCredit");
    const knownProperties = ["id","type","date","journal_id","source","is_waiting_details","fec_pieceref","label","amount","journal","readonly","ledgerEventsCount","totalDebit","totalCredit"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never", false);
    return new APIGroupedDocument(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.type = d.type;
    if ("date" in d) this.date = d.date;
    this.journal_id = d.journal_id;
    this.source = d.source;
    this.is_waiting_details = d.is_waiting_details;
    this.fec_pieceref = d.fec_pieceref;
    this.label = d.label;
    this.amount = d.amount;
    this.journal = d.journal;
    this.readonly = d.readonly;
    this.ledgerEventsCount = d.ledgerEventsCount;
    this.totalDebit = d.totalDebit;
    this.totalCredit = d.totalCredit;
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

function throwNull2NonNull(field: string, d: any): never {
  return errorHelper(field, d, "non-nullable object", false);
}
function throwNotObject(field: string, d: any, nullable: boolean): never {
  return errorHelper(field, d, "object", nullable);
}
function throwIsArray(field: string, d: any, nullable: boolean): never {
  return errorHelper(field, d, "object", nullable);
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
function errorHelper(field: string, d: any, type: string, nullable: boolean): never {
  if (nullable) {
    type += ", null, or undefined";
  }
  prompt(proxyName+':', JSON.stringify(obj));
  throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}
