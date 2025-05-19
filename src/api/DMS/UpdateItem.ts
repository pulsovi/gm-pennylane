// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDMSUpdateItem';
let obj: any = null;
export class APIDMSUpdateItem {
  public readonly archived_at: null;
  public readonly created_at: string;
  public readonly creator: Creator;
  public readonly favorite: boolean;
  public readonly file_extension: string;
  public readonly file_size: number;
  public readonly file_url: string;
  public readonly id: number;
  public readonly imports_allowed: boolean;
  public readonly itemable_id: number;
  public readonly method: string;
  public readonly name: string;
  public readonly parent_id: number;
  public readonly pusher_channel: string;
  public readonly readonly: boolean;
  public readonly reference_link: null;
  public readonly shared: boolean;
  public readonly signed_id: string;
  public readonly type: string;
  public readonly updated_at: string;
  public static Parse(d: string): APIDMSUpdateItem {
    return APIDMSUpdateItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDMSUpdateItem {
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
    checkNull(d.archived_at, field + ".archived_at");
    checkString(d.created_at, field + ".created_at");
    d.creator = Creator.Create(d.creator, field + ".creator");
    checkBoolean(d.favorite, field + ".favorite");
    checkString(d.file_extension, field + ".file_extension");
    checkNumber(d.file_size, field + ".file_size");
    checkString(d.file_url, field + ".file_url");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.imports_allowed, field + ".imports_allowed");
    checkNumber(d.itemable_id, field + ".itemable_id");
    checkString(d.method, field + ".method");
    checkString(d.name, field + ".name");
    checkNumber(d.parent_id, field + ".parent_id");
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkBoolean(d.readonly, field + ".readonly");
    checkNull(d.reference_link, field + ".reference_link");
    checkBoolean(d.shared, field + ".shared");
    checkString(d.signed_id, field + ".signed_id");
    checkString(d.type, field + ".type");
    checkString(d.updated_at, field + ".updated_at");
    const knownProperties = ["archived_at","created_at","creator","favorite","file_extension","file_size","file_url","id","imports_allowed","itemable_id","method","name","parent_id","pusher_channel","readonly","reference_link","shared","signed_id","type","updated_at"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDMSUpdateItem(d);
  }
  private constructor(d: any) {
    this.archived_at = d.archived_at;
    this.created_at = d.created_at;
    this.creator = d.creator;
    this.favorite = d.favorite;
    this.file_extension = d.file_extension;
    this.file_size = d.file_size;
    this.file_url = d.file_url;
    this.id = d.id;
    this.imports_allowed = d.imports_allowed;
    this.itemable_id = d.itemable_id;
    this.method = d.method;
    this.name = d.name;
    this.parent_id = d.parent_id;
    this.pusher_channel = d.pusher_channel;
    this.readonly = d.readonly;
    this.reference_link = d.reference_link;
    this.shared = d.shared;
    this.signed_id = d.signed_id;
    this.type = d.type;
    this.updated_at = d.updated_at;
  }
}

export class Creator {
  public readonly email: string;
  public readonly first_name: string;
  public readonly full_name: string;
  public readonly last_name: string;
  public readonly role: string;
  public static Parse(d: string): Creator {
    return Creator.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Creator {
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
    checkString(d.email, field + ".email");
    checkString(d.first_name, field + ".first_name");
    checkString(d.full_name, field + ".full_name");
    checkString(d.last_name, field + ".last_name");
    checkString(d.role, field + ".role");
    const knownProperties = ["email","first_name","full_name","last_name","role"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Creator(d);
  }
  private constructor(d: any) {
    this.email = d.email;
    this.first_name = d.first_name;
    this.full_name = d.full_name;
    this.last_name = d.last_name;
    this.role = d.role;
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
    console.log('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d), jsonClone);
    prompt(proxyName+':', JSON.stringify(obj));
  }
}
