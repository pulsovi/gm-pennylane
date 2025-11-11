import { $, getParam, parseHTML, waitElem, waitFunc } from '../../_/index.js';
import Service from '../../framework/Service.js';
import Tooltip from "../../framework/Tooltip.js";
import ModelFactory from "../../models/Factory.js";
import Transaction from '../../models/Transaction.js';
import { isPage } from '../../navigation/waitPage.js';
import ValidMessage from './ValidMessage.js';

/** Add 'add by ID' button on transaction reconciliation tab */
export default class TransactionAddByIdButton extends Service {
  private spinner: HTMLDivElement = parseHTML(
    '<div class="spinner-border spinner-border-sm" style="margin-left: 0.5em;" role="status"></div>'
  ).firstElementChild as HTMLDivElement;

  private alertIcon: HTMLDivElement = parseHTML(
    `<div class="alert alert-danger" style="margin-left: 0.5em;" role="alert">&#x26A0;</div>`
  ).firstElementChild as HTMLDivElement;

  private set alert(value: boolean) {
    if (value) {
      this.button.appendChild(this.alertIcon);
    } else {
      this.alertIcon.remove();
    }
  }

  private _running = false;
  private get running() {
    return this._running;
  }
  private set running(value: boolean) {
    this._running = value;
    if (value) {
      this.alert = false;
      this.button.appendChild(this.spinner);
    } else {
      this.spinner.remove();
    }
  }

  private button = parseHTML(
    '<div class="btn-sm w-100 btn-primary add-by-id-btn" style="cursor: pointer;">Ajouter par ID</div>'
  ).firstElementChild as HTMLDivElement;
  private disabled = false;

  async init() {
    await this.insertContainer();
    this.attachEvent();
  }

  async insertContainer() {
    const div = (
      await Promise.race([
        waitElem("button", "Voir plus de factures"),
        waitElem("button", "Chercher parmi les factures"),
      ])
    ).closest<HTMLDivElement>(".mt-2");

    if (!div) {
      this.log("TransactionAddByIdButton", {
        button: await Promise.race([
          waitElem("button", "Voir plus de factures"),
          waitElem("button", "Chercher parmi les factures"),
        ]),
        div,
      });
      throw new Error("Impossible de trouver le bloc de boutons");
    }

    div.insertBefore(this.button, div.lastElementChild);
    Tooltip.make({ target: this.button, text: "Ajouter par ID (Alt+Z)" });

    waitFunc(async () => {
      const currentDiv = (
        await Promise.race([
          waitElem("button", "Voir plus de factures"),
          waitElem("button", "Chercher parmi les factures"),
        ])
      ).closest<HTMLDivElement>(".mt-2");
      return currentDiv !== div;
    }).then(() => this.insertContainer());
  }

  attachEvent() {
    this.log({ button: this.button });
    this.button.addEventListener("click", () => {
      this.addById();
    });
    document.addEventListener("keydown", (event) => {
      if (isPage("transactionDetail") && event.altKey && ["z", "Z"].includes(event.key)) {
        this.addById();
      } else {
        this.debug({
          isPageTransactionDetail: isPage("transactionDetail"),
          event,
        });
      }
    });
  }

  async addById() {
    if (this.running) return;
    /**
     * Obligé de recharger la transaction à chaque appel : le numéro guid du
     * groupe change à chaque attachement de nouvelle pièce
     */
    const transactionId = Number(getParam(location.href, "transaction_id"));
    const id = Number(prompt("ID du justificatif ?"));
    const transaction = ModelFactory.getTransaction(transactionId);
    this.running = true;
    await transaction.groupAdd(id).catch((error) => {
      this.error("addById>Transaction.groupAdd Error:", error);
      this.alert = true;
      this.running = false;
      throw error;
    });
    this.running = false;
    ValidMessage.getInstance().reload();
  }
}
