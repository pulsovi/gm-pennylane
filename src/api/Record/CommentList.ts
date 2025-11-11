// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIRecordCommentList';
let obj: any = null;
export class APIRecordCommentList {
  public readonly comments: CommentsEntity[];
  public readonly pagination: Pagination;
  public static Parse(d: string): APIRecordCommentList {
    return APIRecordCommentList.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIRecordCommentList {
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
    checkArray(d.comments, field + ".comments");
    if (d.comments) {
      for (let i = 0; i < d.comments.length; i++) {
        d.comments[i] = CommentsEntity.Create(d.comments[i], field + ".comments" + "[" + i + "]");
      }
    }
    d.pagination = Pagination.Create(d.pagination, field + ".pagination");
    const knownProperties = ["comments","pagination"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIRecordCommentList(d);
  }
  private constructor(d: any) {
    this.comments = d.comments;
    this.pagination = d.pagination;
  }
}

export class CommentsEntity {
  public readonly content: string;
  public readonly created_at: string;
  public readonly id: number;
  public readonly name: string;
  public readonly record_id: number;
  public readonly record_type: string;
  public readonly rich_content: null;
  public readonly seen: boolean;
  public readonly updated_at: string;
  public readonly user: User;
  public readonly user_id: number;
  public static Parse(d: string): CommentsEntity {
    return CommentsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): CommentsEntity {
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
    checkString(d.content, field + ".content");
    checkString(d.created_at, field + ".created_at");
    checkNumber(d.id, field + ".id");
    checkString(d.name, field + ".name");
    checkNumber(d.record_id, field + ".record_id");
    checkString(d.record_type, field + ".record_type");
    checkNull(d.rich_content, field + ".rich_content");
    checkBoolean(d.seen, field + ".seen");
    checkString(d.updated_at, field + ".updated_at");
    d.user = User.Create(d.user, field + ".user");
    checkNumber(d.user_id, field + ".user_id");
    const knownProperties = ["content","created_at","id","name","record_id","record_type","rich_content","seen","updated_at","user","user_id"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new CommentsEntity(d);
  }
  private constructor(d: any) {
    this.content = d.content;
    this.created_at = d.created_at;
    this.id = d.id;
    this.name = d.name;
    this.record_id = d.record_id;
    this.record_type = d.record_type;
    this.rich_content = d.rich_content;
    this.seen = d.seen;
    this.updated_at = d.updated_at;
    this.user = d.user;
    this.user_id = d.user_id;
  }
}

export class User {
  public readonly first_name: string;
  public readonly full_name: string;
  public readonly id: number;
  public readonly last_name: string;
  public readonly profile_picture_url: null;
  public static Parse(d: string): User {
    return User.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): User {
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
    checkString(d.full_name, field + ".full_name");
    checkNumber(d.id, field + ".id");
    checkString(d.last_name, field + ".last_name");
    checkNull(d.profile_picture_url, field + ".profile_picture_url");
    const knownProperties = ["first_name","full_name","id","last_name","profile_picture_url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new User(d);
  }
  private constructor(d: any) {
    this.first_name = d.first_name;
    this.full_name = d.full_name;
    this.id = d.id;
    this.last_name = d.last_name;
    this.profile_picture_url = d.profile_picture_url;
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
    console.error('Expected "' + type + '" at ' + field + ' but found:\n' + JSON.stringify(d), jsonClone);
  }
}
