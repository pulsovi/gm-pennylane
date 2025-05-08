// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDMSItem';
let obj: any = null;
export class APIDMSItem {
  // samples: [null]
  public readonly archived_at: null;
  // samples: [0]
  public readonly comments_count: number;
  // samples: ["2025-04-27T09:37:01.953459Z","2024-12-17T18:09:06.981297Z"]
  public readonly created_at: string;
  // samples: [{"first_name":"David","last_name":"Gabison","full_name":"David Gabison","email":"david@gabison.com","role":"external_accountant"}]
  public readonly creator: Creator;
  // samples: [false]
  public readonly favorite: boolean;
  // samples: ["pdf"]
  public readonly file_extension: string;
  // samples: [174491,1092695]
  public readonly file_size: number;
  // samples: ["/rails/active_storage/blobs/redirect/zICBpl9yYWlsc4KkZGF0Yc4XCAP+o3B1cqdibG9iX2lk--f88731e378363972012d93566c1d8bc1c7f96c62/undefined%20-%202025-04-11%20-%20IMPORT%20WHATSAPP.pdf","/rails/active_storage/blobs/redirect/zICBpl9yYWlsc4KkZGF0Yc4PXGauo3B1cqdibG9iX2lk--c340f26c76474ce524ab0f6bb2573860177ad059/Adobe%20Scan%2012%20mars%202024%20(1).pdf%20-%202024-03-12%20-%20IMPORT%20WHATSAPP.pdf"]
  public readonly file_url: string;
  // samples: [90315271,62139089]
  public readonly id: number;
  // samples: [false]
  public readonly imports_allowed: boolean;
  // samples: [47272416,30380956]
  public readonly itemable_id: number;
  // samples: ["GET"]
  public readonly method: string;
  // samples: ["undefined - 2025-04-11 - IMPORT WHATSAPP.pdf","Adobe Scan 12 mars 2024 (1).pdf - 2024-03-12 - IMPORT WHATSAPP.pdf"]
  public readonly name: string;
  // samples: [21994065,null]
  public readonly parent_id: number | null;
  // samples: ["private-gid---jeancaisse-DmsItem-90315271","private-gid---jeancaisse-DmsItem-62139089"]
  public readonly pusher_channel: string;
  // samples: [false]
  public readonly readonly: boolean;
  // samples: [null]
  public readonly reference_link: null;
  // samples: [false]
  public readonly shared: boolean;
  // samples: ["zICBpl9yYWlsc4KkZGF0Yc4XCAP+o3B1cqdibG9iX2lk--f88731e378363972012d93566c1d8bc1c7f96c62","zICBpl9yYWlsc4KkZGF0Yc4PXGauo3B1cqdibG9iX2lk--c340f26c76474ce524ab0f6bb2573860177ad059"]
  public readonly signed_id: string;
  // samples: ["dms_file"]
  public readonly type: string;
  // samples: ["2025-04-27T09:37:01.965145Z","2024-12-17T18:09:06.992389Z"]
  public readonly updated_at: string;
  public static Parse(d: string): APIDMSItem {
    return APIDMSItem.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDMSItem {
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
    checkNumber(d.comments_count, field + ".comments_count");
    checkString(d.created_at, field + ".created_at");
    d.creator = Creator.Create(d.creator, field + ".creator", undefined);
    checkBoolean(d.favorite, field + ".favorite");
    checkString(d.file_extension, field + ".file_extension");
    checkNumber(d.file_size, field + ".file_size");
    checkString(d.file_url, field + ".file_url");
    checkNumber(d.id, field + ".id");
    checkBoolean(d.imports_allowed, field + ".imports_allowed");
    checkNumber(d.itemable_id, field + ".itemable_id");
    checkString(d.method, field + ".method");
    checkString(d.name, field + ".name");
    // This will be refactored in the next release.
    try {
      checkNumber(d.parent_id, field + ".parent_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.parent_id, field + ".parent_id", "number | null");
      } catch (e) {
        prompt(proxyName+':', JSON.stringify(obj));
        throw e;
      }
    }
    checkString(d.pusher_channel, field + ".pusher_channel");
    checkBoolean(d.readonly, field + ".readonly");
    checkNull(d.reference_link, field + ".reference_link");
    checkBoolean(d.shared, field + ".shared");
    checkString(d.signed_id, field + ".signed_id");
    checkString(d.type, field + ".type");
    checkString(d.updated_at, field + ".updated_at");
    const knownProperties = ["archived_at","comments_count","created_at","creator","favorite","file_extension","file_size","file_url","id","imports_allowed","itemable_id","method","name","parent_id","pusher_channel","readonly","reference_link","shared","signed_id","type","updated_at"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
    return new APIDMSItem(d);
  }
  private constructor(d: any) {
    this.archived_at = d.archived_at;
    this.comments_count = d.comments_count;
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
  // samples: ["david@gabison.com"]
  public readonly email: string;
  // samples: ["David"]
  public readonly first_name: string;
  // samples: ["David Gabison"]
  public readonly full_name: string;
  // samples: ["Gabison"]
  public readonly last_name: string;
  // samples: ["external_accountant"]
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
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
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
  throw new TypeError('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d) + "\n\nFull object:\n" + JSON.stringify(obj));
}
