// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APIDMSLinkList';
let obj: any = null;
export class APIDMSLinkList {
  public readonly dms_links: DmsLinksEntity[];
  public static Parse(d: string): APIDMSLinkList {
    return APIDMSLinkList.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APIDMSLinkList {
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
    checkArray(d.dms_links, field + ".dms_links");
    if (d.dms_links) {
      for (let i = 0; i < d.dms_links.length; i++) {
        d.dms_links[i] = DmsLinksEntity.Create(d.dms_links[i], field + ".dms_links" + "[" + i + "]");
      }
    }
    const knownProperties = ["dms_links"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APIDMSLinkList(d);
  }
  private constructor(d: any) {
    this.dms_links = d.dms_links;
  }
}

export class DmsLinksEntity {
  public readonly created_at: string;
  public readonly id: number;
  public readonly item_id: number;
  public readonly linkable: Linkable;
  public readonly linkable_id: number;
  public readonly linkable_type: string;
  public readonly name: string;
  public readonly record_id: number;
  public readonly record_type: string;
  public readonly reference: null;
  public static Parse(d: string): DmsLinksEntity {
    return DmsLinksEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): DmsLinksEntity {
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
    checkString(d.created_at, field + ".created_at");
    checkNumber(d.id, field + ".id");
    checkNumber(d.item_id, field + ".item_id");
    d.linkable = Linkable.Create(d.linkable, field + ".linkable");
    checkNumber(d.linkable_id, field + ".linkable_id");
    checkString(d.linkable_type, field + ".linkable_type");
    checkString(d.name, field + ".name");
    checkNumber(d.record_id, field + ".record_id");
    checkString(d.record_type, field + ".record_type");
    checkNull(d.reference, field + ".reference");
    const knownProperties = ["created_at","id","item_id","linkable","linkable_id","linkable_type","name","record_id","record_type","reference"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new DmsLinksEntity(d);
  }
  private constructor(d: any) {
    this.created_at = d.created_at;
    this.id = d.id;
    this.item_id = d.item_id;
    this.linkable = d.linkable;
    this.linkable_id = d.linkable_id;
    this.linkable_type = d.linkable_type;
    this.name = d.name;
    this.record_id = d.record_id;
    this.record_type = d.record_type;
    this.reference = d.reference;
  }
}

export class Linkable {
  public readonly comments: CommentsEntity[];
  public readonly creator: Creator;
  public readonly file_extension: string;
  public readonly file_size: number;
  public readonly file_url: string;
  public readonly itemable_id: number;
  public readonly url: null;
  public static Parse(d: string): Linkable {
    return Linkable.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): Linkable {
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
    d.creator = Creator.Create(d.creator, field + ".creator");
    checkString(d.file_extension, field + ".file_extension");
    checkNumber(d.file_size, field + ".file_size");
    checkString(d.file_url, field + ".file_url");
    checkNumber(d.itemable_id, field + ".itemable_id");
    checkNull(d.url, field + ".url");
    const knownProperties = ["comments","creator","file_extension","file_size","file_url","itemable_id","url"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new Linkable(d);
  }
  private constructor(d: any) {
    this.comments = d.comments;
    this.creator = d.creator;
    this.file_extension = d.file_extension;
    this.file_size = d.file_size;
    this.file_url = d.file_url;
    this.itemable_id = d.itemable_id;
    this.url = d.url;
  }
}

export class CommentsEntity {
  public readonly content: string;
  public readonly created_at: string;
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
    const knownProperties = ["content","created_at"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new CommentsEntity(d);
  }
  private constructor(d: any) {
    this.content = d.content;
    this.created_at = d.created_at;
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
function checkArray(value: any, field: string, multiple?: string): void {
  if (!Array.isArray(value)) errorHelper(field, value, multiple ?? "array");
}
function checkNumber(value: any, field: string, multiple?: string): void {
  if (typeof(value) !== 'number') errorHelper(field, value, multiple ?? "number");
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
