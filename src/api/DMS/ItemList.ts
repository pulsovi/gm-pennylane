// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDMSItemList';
let obj: any = null;
export class APIDMSItemList {
  public readonly filters: string | null;
  public readonly items: ItemsEntity[];
  public readonly pagination: Pagination;
  public readonly sort: string;
  public static Parse(d: string): APIDMSItemList {
    return APIDMSItemList.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDMSItemList {
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
      checkString(d.filters, field + ".filters", "string | null");
    } catch (e) {
      try {
        checkNull(d.filters, field + ".filters", "string | null");
      } catch (e) {
      }
    }
    checkArray(d.items, field + ".items");
    if (d.items) {
      for (let i = 0; i < d.items.length; i++) {
        d.items[i] = ItemsEntity.Create(d.items[i], field + ".items" + "[" + i + "]");
      }
    }
    d.pagination = Pagination.Create(d.pagination, field + ".pagination");
    checkString(d.sort, field + ".sort");
    const knownProperties = ["filters","items","pagination","sort"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDMSItemList(d);
  }
  private constructor(d: any) {
    this.filters = d.filters;
    this.items = d.items;
    this.pagination = d.pagination;
    this.sort = d.sort;
  }
}

export class ItemsEntity {
  public readonly archived_at: null | string;
  public readonly comments_count?: number;
  public readonly created_at: string;
  public readonly creator?: Creator;
  public readonly favorite?: boolean;
  public readonly file_extension?: string;
  public readonly file_size?: number;
  public readonly file_url?: string;
  public readonly fixed?: boolean;
  public readonly id: number;
  public readonly imports_allowed: boolean;
  public readonly itemable_id: number;
  public readonly method: string;
  public readonly name: string;
  public readonly parent_id: number | null;
  public readonly pusher_channel?: string;
  public readonly readonly?: boolean;
  public readonly reference_link?: null;
  public readonly shared: boolean;
  public readonly signed_id?: string;
  public readonly type: string;
  public readonly updated_at: string;
  public readonly visible?: boolean;
  public static Parse(d: string): ItemsEntity {
    return ItemsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): ItemsEntity {
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
      checkNull(d.archived_at, field + ".archived_at", "null | string");
    } catch (e) {
      try {
        checkString(d.archived_at, field + ".archived_at", "null | string");
      } catch (e) {
      }
    }
    if ("comments_count" in d) {
      checkNumber(d.comments_count, field + ".comments_count");
    }
    checkString(d.created_at, field + ".created_at");
    if ("creator" in d) {
      d.creator = Creator.Create(d.creator, field + ".creator");
    }
    if ("favorite" in d) {
      checkBoolean(d.favorite, field + ".favorite");
    }
    if ("file_extension" in d) {
      checkString(d.file_extension, field + ".file_extension");
    }
    if ("file_size" in d) {
      checkNumber(d.file_size, field + ".file_size");
    }
    if ("file_url" in d) {
      checkString(d.file_url, field + ".file_url");
    }
    if ("fixed" in d) {
      checkBoolean(d.fixed, field + ".fixed");
    }
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
      }
    }
    if ("pusher_channel" in d) {
      checkString(d.pusher_channel, field + ".pusher_channel");
    }
    if ("readonly" in d) {
      checkBoolean(d.readonly, field + ".readonly");
    }
    if ("reference_link" in d) {
      checkNull(d.reference_link, field + ".reference_link");
    }
    checkBoolean(d.shared, field + ".shared");
    if ("signed_id" in d) {
      checkString(d.signed_id, field + ".signed_id");
    }
    checkString(d.type, field + ".type");
    checkString(d.updated_at, field + ".updated_at");
    if ("visible" in d) {
      checkBoolean(d.visible, field + ".visible");
    }
    const knownProperties = ["archived_at","comments_count","created_at","creator","favorite","file_extension","file_size","file_url","fixed","id","imports_allowed","itemable_id","method","name","parent_id","pusher_channel","readonly","reference_link","shared","signed_id","type","updated_at","visible"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new ItemsEntity(d);
  }
  private constructor(d: any) {
    this.archived_at = d.archived_at;
    if ("comments_count" in d) this.comments_count = d.comments_count;
    this.created_at = d.created_at;
    if ("creator" in d) this.creator = d.creator;
    if ("favorite" in d) this.favorite = d.favorite;
    if ("file_extension" in d) this.file_extension = d.file_extension;
    if ("file_size" in d) this.file_size = d.file_size;
    if ("file_url" in d) this.file_url = d.file_url;
    if ("fixed" in d) this.fixed = d.fixed;
    this.id = d.id;
    this.imports_allowed = d.imports_allowed;
    this.itemable_id = d.itemable_id;
    this.method = d.method;
    this.name = d.name;
    this.parent_id = d.parent_id;
    if ("pusher_channel" in d) this.pusher_channel = d.pusher_channel;
    if ("readonly" in d) this.readonly = d.readonly;
    if ("reference_link" in d) this.reference_link = d.reference_link;
    this.shared = d.shared;
    if ("signed_id" in d) this.signed_id = d.signed_id;
    this.type = d.type;
    this.updated_at = d.updated_at;
    if ("visible" in d) this.visible = d.visible;
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

export class Pagination {
  public readonly hasNextPage: boolean;
  public readonly page: number;
  public readonly pages: number;
  public readonly pageSize: number;
  public readonly totalEntries: number;
  public readonly totalEntriesPrecision: string;
  public readonly totalEntriesStr: string;
  public static Parse(d: string): Pagination {
    return Pagination.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Pagination {
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
    checkBoolean(d.hasNextPage, field + ".hasNextPage");
    checkNumber(d.page, field + ".page");
    checkNumber(d.pages, field + ".pages");
    checkNumber(d.pageSize, field + ".pageSize");
    checkNumber(d.totalEntries, field + ".totalEntries");
    checkString(d.totalEntriesPrecision, field + ".totalEntriesPrecision");
    checkString(d.totalEntriesStr, field + ".totalEntriesStr");
    const knownProperties = ["hasNextPage","page","pages","pageSize","totalEntries","totalEntriesPrecision","totalEntriesStr"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Pagination(d);
  }
  private constructor(d: any) {
    this.hasNextPage = d.hasNextPage;
    this.page = d.page;
    this.pages = d.pages;
    this.pageSize = d.pageSize;
    this.totalEntries = d.totalEntries;
    this.totalEntriesPrecision = d.totalEntriesPrecision;
    this.totalEntriesStr = d.totalEntriesStr;
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
    console.log('Expected ' + type + " at " + field + " but found:\n" + JSON.stringify(d), jsonClone);
  }
}
