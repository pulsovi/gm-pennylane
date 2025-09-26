import { $, waitElem, findElem, getReactProps, parseHTML, waitFunc, $$, getParam } from '../../_/index.js';
import { APILedgerEvent } from '../../api/LedgerEvent/index.js';
import { APITransaction } from "../../api/Transaction/index.js";
import CacheStatus, { Status } from "../../framework/CacheStatus.js";
import Service from "../../framework/Service.js";
import Transaction from "../../models/Transaction.js";
import NextInvalidTransaction from "./NextInvalidTransaction.js";

const cache = CacheStatus.getInstance<Status>("transactionValidation");

/** Add validation message on transaction panel */
export default class TransactionValidMessage extends Service {
  private container = parseHTML(`<div><div class="headband-is-valid">⟳</div></div>`)
    .firstElementChild as HTMLDivElement;
  private state: {
    transaction?: Transaction;
    ledgerEvents: APILedgerEvent[];
    comments?: {
      transactionId: number;
      hasComment: boolean;
    };
  } = { ledgerEvents: [] };
  private _message: string = "⟳";

  public static getInstance(): TransactionValidMessage {
    if (!this.instance) this.instance = new this();
    return this.instance as TransactionValidMessage;
  }

  async init() {
    await this.insertContainer();
    this.on("message-change", () => this.displayMessage());
    this.watchReloadHotkey();
    await this.loadMessage();
    setInterval(() => this.watch(), 200);
    cache.on("update", this.handleCacheUpdate.bind(this));
    cache.on("add", this.handleCacheUpdate.bind(this));
  }

  async insertContainer() {
    await waitElem("h3", "Transactions"); // Transactions panel
    await waitElem(".paragraph-body-m+.heading-page.mt-1"); // transaction detail panel
    const detailTab = await waitElem("aside div");
    detailTab.insertBefore(this.container, detailTab.firstChild);
    waitFunc(() => $("aside div") !== detailTab).then(() => {
      this.insertContainer();
    });
  }

  watchReloadHotkey() {
    document.addEventListener("keydown", (event) => {
      if (findElem("h3", "Transactions") && event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        this.reload();
      }
    });
  }

  reload() {
    this.loadMessage(true);
  }

  set message(html: string) {
    this._message = html;
    this.emit("message-change", html);
  }

  get message(): string {
    return this._message;
  }

  async loadMessage(refresh = false) {
    this.log("loadMessage", this);
    this.message = "⟳";

    const rawTransaction = APITransaction.Create(
      getReactProps($(".paragraph-body-m+.heading-page.mt-1"), 9).transaction
    );
    this.state.transaction = Transaction.get(rawTransaction);

    const cachedStatus = cache.find({ id: rawTransaction.id });
    if (cachedStatus) this.message = `<aside style="background: lightgray;">⟳ ${cachedStatus.message}</aside>`;

    const status = await this.state.transaction.getStatus(refresh);
    cache.updateItem(
      { id: rawTransaction.id },
      {
        id: rawTransaction.id,
        valid: status.valid,
        message: status.message,
        createdAt: Date.now(),
        date: new Date(rawTransaction.date).getTime(),
      }
    );
    this.handleCacheUpdate({ newValue: status });
  }

  async watch() {
    const ledgerEvents = $$<HTMLFormElement>("form[name^=DocumentEntries-]").reduce<APILedgerEvent[]>(
      (events, form) => {
        const formEvents = getReactProps(form.parentElement, 3)?.initialValues?.ledgerEvents ?? [];
        return [...events, ...formEvents];
      },
      []
    );

    if (ledgerEvents.some((event, id) => this.state.ledgerEvents[id] !== event)) {
      const logData = { oldEvents: this.state.ledgerEvents };
      this.state.ledgerEvents = ledgerEvents;
      this.debug("ledgerEvents desynchronisé", { ...logData, ...this });
      this.reload();
    }

    const current = Number(getParam(location.href, "transaction_id"));
    if (current && current !== this.state.transaction?.id) {
      this.debug("transaction desynchronisée", { current, ...this });
      this.reload();
    }
  }

  async displayMessage() {
    $(".headband-is-valid", this.container)!.innerHTML = `${this.getTransactionId()}${this.getCommentLogo()} ${
      this.message
    }`;
  }

  getTransactionId() {
    if (!this.state.transaction?.id) return "";
    return `<span class="transaction-id d-inline-block bg-secondary-100 dihsuQ px-0_5 m-0">#${this.state.transaction.id}</span>`;
  }

  private getCommentLogo() {
    if (!this.state.transaction) return "";
    if (!this.state.comments || this.state.transaction.id !== this.state.comments.transactionId) {
      this.reloadCommentState();
      return "";
    }
    return this.state.comments.hasComment ? '<span class="d-inline-block bg-danger m-0">💬</span>' : "";
  }

  private async reloadCommentState() {
    if (!this.state.transaction) return;
    const transactionId = this.state.transaction.id;
    const transactionDoc = await this.state.transaction.getDocument();
    const transaction = transactionDoc.grouped_documents.find((doc) => doc.id === transactionId);
    this.state.comments = {
      transactionId,
      hasComment: Boolean(transaction?.client_comments?.length),
    };
    this.displayMessage();
  }

  private handleCacheUpdate({ newValue: status }: { newValue: Status }) {
    if (status.id !== this.state.transaction?.id) return;
    this.error("handleCacheUpdate", { status, _this: this });
    this.message = `${status.valid ? "✓" : "✗"} ${status.message}`;
  }
}

/** Open next invalid transaction */
/**
 * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :
getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);
 */
