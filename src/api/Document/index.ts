// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDocument';
let obj: any = null;
export class APIDocument {
  public readonly company_id: number;
  public readonly direction: string | null;
  public readonly grouped_documents: GroupedDocumentsEntity[];
  public readonly has_file: boolean;
  public readonly id: number;
  public readonly type: string;
  public readonly url: string;
  public static Parse(d: string): APIDocument {
    return APIDocument.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDocument {
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
    checkArray(d.grouped_documents, field + ".grouped_documents");
    if (d.grouped_documents) {
      for (let i = 0; i < d.grouped_documents.length; i++) {
        d.grouped_documents[i] = GroupedDocumentsEntity.Create(d.grouped_documents[i], field + ".grouped_documents" + "[" + i + "]");
      }
    }
    checkBoolean(d.has_file, field + ".has_file");
    checkNumber(d.id, field + ".id");
    checkString(d.type, field + ".type");
    checkString(d.url, field + ".url");
    const knownProperties = ["company_id","direction","grouped_documents","has_file","id","type","url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDocument(d);
  }
  private constructor(d: any) {
    this.company_id = d.company_id;
    this.direction = d.direction;
    this.grouped_documents = d.grouped_documents;
    this.has_file = d.has_file;
    this.id = d.id;
    this.type = d.type;
    this.url = d.url;
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
  public readonly preview_urls: string[];
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
        checkString(d.preview_urls[i], field + ".preview_urls" + "[" + i + "]");
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
