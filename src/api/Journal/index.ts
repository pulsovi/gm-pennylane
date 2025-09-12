// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIJournal';
let obj: any = null;
export class APIJournal {
  public readonly code: string;
  public readonly id: number;
  public readonly journal_type: string;
  public readonly label: string;
  public static Parse(d: string): APIJournal {
    return APIJournal.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIJournal {
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
    checkString(d.journal_type, field + ".journal_type");
    checkString(d.label, field + ".label");
    const knownProperties = ["code","id","journal_type","label"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIJournal(d);
  }
  private constructor(d: any) {
    this.code = d.code;
    this.id = d.id;
    this.journal_type = d.journal_type;
    this.label = d.label;
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
function checkNumber(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'number') errorHelper(field, value, multiple ?? "number");
}
function checkString(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'string') errorHelper(field, value, multiple ?? "string");
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
