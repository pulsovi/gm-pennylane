// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDMSItemList';
let obj: any = null;
export class APIDMSItemList {
  // samples: ["[{\"field\":\"name\",\"operator\":\"search_all\",\"value\":\"Scan2024-01-22_184251.jpg\"}]","[{\"field\":\"name\",\"operator\":\"search_all\",\"value\":\"Scan2024-01-22_184251\"}]"]
  public readonly filters: string;
  // samples: [[],[{"id":92179675,"itemable_id":48164141,"name":"Scan2024-01-22_184251.jpg","archived_at":null,"created_at":"2025-05-08T07:53:09.017893Z","updated_at":"2025-05-08T07:53:09.036275Z","pusher_channel":"private-gid---jeancaisse-DmsItem-92179675","parent_id":57983091,"shared":false,"imports_allowed":false,"type":"dms_file","favorite":false,"creator":{"first_name":"David","last_name":"Gabison","full_name":"David Gabison","email":"david@gabison.com","role":"external_accountant"},"file_url":"/rails/active_storage/blobs/redirect/zICBpl9yYWlsc4KkZGF0Yc4Gfexgo3B1cqdibG9iX2lk--651dd80922ea608b3dd39e3527e7fbd56388b8ab/Scan2024-01-22_184251.jpg","file_size":446168,"signed_id":"zICBpl9yYWlsc4KkZGF0Yc4Gfexgo3B1cqdibG9iX2lk--651dd80922ea608b3dd39e3527e7fbd56388b8ab","file_extension":"jpg","reference_link":null,"comments_count":0,"readonly":false,"method":"GET"}]]
  public readonly items: ItemsEntity[];
  // samples: [{"page":0,"pageSize":20,"pages":1,"totalEntries":0,"totalEntriesStr":"0","totalEntriesPrecision":"exact","hasNextPage":false}]
  public readonly pagination: Pagination;
  // samples: ["+name"]
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
    checkString(d.filters, field + ".filters");
    checkArray(d.items, field + ".items");
    if (d.items) {
      for (let i = 0; i < d.items.length; i++) {
        d.items[i] = ItemsEntity.Create(d.items[i], field + ".items" + "[" + i + "]", undefined);
      }
    }
    d.pagination = Pagination.Create(d.pagination, field + ".pagination", undefined);
    checkString(d.sort, field + ".sort");
    const knownProperties = ["filters","items","pagination","sort"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
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
  // samples: [null]
  public readonly archived_at: null;
  // samples: [0]
  public readonly comments_count: number;
  // samples: ["2025-05-08T07:53:09.017893Z"]
  public readonly created_at: string;
  // samples: [{"first_name":"David","last_name":"Gabison","full_name":"David Gabison","email":"david@gabison.com","role":"external_accountant"}]
  public readonly creator: Creator;
  // samples: [false]
  public readonly favorite: boolean;
  // samples: ["jpg"]
  public readonly file_extension: string;
  // samples: [446168]
  public readonly file_size: number;
  // samples: ["/rails/active_storage/blobs/redirect/zICBpl9yYWlsc4KkZGF0Yc4Gfexgo3B1cqdibG9iX2lk--651dd80922ea608b3dd39e3527e7fbd56388b8ab/Scan2024-01-22_184251.jpg"]
  public readonly file_url: string;
  // samples: [92179675]
  public readonly id: number;
  // samples: [false]
  public readonly imports_allowed: boolean;
  // samples: [48164141]
  public readonly itemable_id: number;
  // samples: ["GET"]
  public readonly method: string;
  // samples: ["Scan2024-01-22_184251.jpg"]
  public readonly name: string;
  // samples: [57983091]
  public readonly parent_id: number;
  // samples: ["private-gid---jeancaisse-DmsItem-92179675"]
  public readonly pusher_channel: string;
  // samples: [false]
  public readonly readonly: boolean;
  // samples: [null]
  public readonly reference_link: null;
  // samples: [false]
  public readonly shared: boolean;
  // samples: ["zICBpl9yYWlsc4KkZGF0Yc4Gfexgo3B1cqdibG9iX2lk--651dd80922ea608b3dd39e3527e7fbd56388b8ab"]
  public readonly signed_id: string;
  // samples: ["dms_file"]
  public readonly type: string;
  // samples: ["2025-05-08T07:53:09.036275Z"]
  public readonly updated_at: string;
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
    checkNumber(d.parent_id, field + ".parent_id");
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
    return new ItemsEntity(d);
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

export class Pagination {
  // samples: [false]
  public readonly hasNextPage: boolean;
  // samples: [0]
  public readonly page: number;
  // samples: [1]
  public readonly pages: number;
  // samples: [20]
  public readonly pageSize: number;
  // samples: [0]
  public readonly totalEntries: number;
  // samples: ["exact"]
  public readonly totalEntriesPrecision: string;
  // samples: ["0"]
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
    if (unknownProperty) errorHelper(unknownProperty, d, "never (unknown property)");
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

function throwNull2NonNull(field: string, value: any, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "non-nullable object");
}
function throwNotObject(field: string, value: any, multiple?: string): never {
  return errorHelper(field, value, multiple ?? "object");
}
function throwIsArray(field: string, value: any, multiple?: string): never {
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
