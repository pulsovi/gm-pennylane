// Stores the currently-being-typechecked object for error messages.
const proxyName = 'APITransactionReconciliation';
let obj: any = null;
export class APITransactionReconciliation {
  public readonly transactions: TransactionsEntity[];
  public static Parse(d: string): APITransactionReconciliation {
    return APITransactionReconciliation.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): APITransactionReconciliation {
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
    checkArray(d.transactions, field + ".transactions");
    if (d.transactions) {
      for (let i = 0; i < d.transactions.length; i++) {
        d.transactions[i] = TransactionsEntity.Create(d.transactions[i], field + ".transactions" + "[" + i + "]");
      }
    }
    const knownProperties = ["transactions"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new APITransactionReconciliation(d);
  }
  private constructor(d: any) {
    this.transactions = d.transactions;
  }
}

export class TransactionsEntity {
  public readonly id: number;
  public readonly reconciliation_id: number | null;
  public static Parse(d: string): TransactionsEntity {
    return TransactionsEntity.Create(JSON.parse(d));
  }
  public static Create(d: any, field?: string, multiple ?: string): TransactionsEntity {
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
    checkNumber(d.id, field + ".id");
    // This will be refactored in the next release.
    try {
      checkNumber(d.reconciliation_id, field + ".reconciliation_id", "number | null");
    } catch (e) {
      try {
        checkNull(d.reconciliation_id, field + ".reconciliation_id", "number | null");
      } catch (e) {
      }
    }
    const knownProperties = ["id","reconciliation_id"];
    const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));
    if (unknownProperty) errorHelper(field + '.' + unknownProperty, d[unknownProperty], "never (unknown property)");
    return new TransactionsEntity(d);
  }
  private constructor(d: any) {
    this.id = d.id;
    this.reconciliation_id = d.reconciliation_id;
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
