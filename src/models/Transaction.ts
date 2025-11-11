import ValidableDocument from "./ValidableDocument.js";
import Document, { DocumentCache, isTypedDocument } from "./Document.js";
import { getTransactionFull, getTransactionReconciliationId } from "../api/transaction.js";
import { getParam } from "../_/url.js";
import { APIDMSLink } from "../api/DMS/Link.js";
import DMSItem from "./DMSItem.js";
import { createDMSLink } from "../api/dms.js";
import { jsonClone } from "../_/json.js";
import Balance from "./Balance.js";
import { APITransactionLite } from "../api/Transaction/Lite.js";
import CacheStatus, { Status } from "../framework/CacheStatus.js";
import { APILedgerEvent } from "../api/LedgerEvent/index.js";
import { APITransaction } from "../api/Transaction/index.js";
import type ModelFactory from "./Factory.js";
import { getTransactionClientsComments } from "../api/records.js";
import { documentMatching, getDocumentGuuid, matchDocuments } from "../api/document.js";

const user = localStorage.getItem("user") ?? "assistant";

export default class Transaction extends ValidableDocument {
  protected _raw: { id: number };
  protected _transaction: Promise<APITransaction> | APITransaction;
  protected _balance: SyncOrPromise<Balance>;
  protected _isReconciled: SyncOrPromise<boolean>;
  /** Date timestamp of start of refresh */
  private refreshing: number;
  public readonly cacheStatus: CacheStatus;

  constructor(raw: { id: number }, factory: typeof ModelFactory) {
    super(raw, factory);
    this._raw = raw;
    this.cacheStatus = CacheStatus.getInstance<Status>("transactionValidation");
  }

  public static get(raw: { id: number }, factory: typeof ModelFactory): Transaction {
    if (!isTypedDocument(raw) || raw.type.toLowerCase() !== "transaction")
      throw new Error("`raw.type` MUST be 'transaction'");
    const old = DocumentCache.get(raw.id);
    if (old instanceof Transaction) return old;
    return factory.getTransaction(raw.id);
  }

  public async hasComments(maxAge?: number): Promise<boolean> {
    const comments = await this.getComments(maxAge);
    return comments.length > 0;
  }

  public async getComments(maxAge?: number) {
    if (typeof maxAge !== "number") maxAge = this.maxAge(maxAge);
    return await getTransactionClientsComments(this.id, maxAge);
  }

  public async getTransaction(maxAge?: number): Promise<APITransaction> {
    if (typeof maxAge !== "number") maxAge = this.maxAge(maxAge);
    return await getTransactionFull(this.id, maxAge);
  }

  public async getGroupedDocuments(maxAge?: number): Promise<Document[]> {
    return await super.getGroupedDocuments(this.maxAge(maxAge));
  }

  public async getDMSLinks(): Promise<APIDMSLink[]> {
    this.debug("getDMSLinks", this);
    return await super.getDMSLinks("Transaction", this.isCurrent() ? 1000 : void 0);
  }

  public async getDate(): Promise<string> {
    return (await this.getTransaction()).date;
  }

  public async getAmount(): Promise<`${number}`> {
    return (await this.getTransaction()).amount as `${number}`;
  }

  private isCurrent() {
    return String(this.id) === getParam(location.href, "transaction_id");
  }

  public async isReconciled() {
    return Boolean(await getTransactionReconciliationId(this.id));
  }

  public async getLedgerEvents(maxAge?: number): Promise<APILedgerEvent[]> {
    return await super.getLedgerEvents(this.maxAge(maxAge));
  }

  public async getBalance(): Promise<Balance> {
    if (!this._balance || this.refreshing) {
      this._balance = new Promise(async (rs) => {
        // balance déséquilibrée - version exigeante
        const balance: Balance = new Balance();

        const groupedDocuments = await this.getGroupedDocuments();
        for (const gDocument of groupedDocuments) {
          if (this.isCurrent()) this.debug("balance counting", gDocument, jsonClone(balance));
          const gdoc = await gDocument.getFullDocument();
          const journal = await gDocument.getJournal();
          const coeff = gdoc.type === "Invoice" && journal.code === "HA" ? -1 : 1;
          const value = parseFloat(gdoc.amount) * coeff;
          if (gdoc.type === "Transaction") {
            if (this.isCurrent()) this.log("Balance: Transaction", { balance, gdoc, value });
            balance.addTransaction(value);
          } else if (/ CERFA | AIDES - /u.test(gdoc.label)) {
            if (this.isCurrent()) this.log("Balance: Reçu", { balance, gdoc, value });
            balance.addReçu(value);
          } else if (/ CHQ(?:\d|\s)/u.test(gdoc.label)) {
            if (this.isCurrent()) this.log("Balance: CHQ", { balance, gdoc, value });
            balance.addCHQ(value);
          } else {
            if (this.isCurrent()) this.log("Balance: Autre", { balance, gdoc, value });
            balance.addAutre(value);
          }
        }

        const dmsLinks = await this.getDMSLinks();
        dmsLinks.forEach((dmsLink) => {
          if (this.isCurrent()) this.debug("balance counting", dmsLink, jsonClone(balance));
          if (dmsLink.name.startsWith("CHQ")) {
            const amount = dmsLink.name.match(/- (?<amount>[\d \.]*) ?€(?:\.\w+)?$/u)?.groups.amount;
            balance.addCHQ(parseFloat(amount ?? "0") * Math.sign(balance.transaction));
          } else if (/^(?:CERFA|AIDES) /u.test(dmsLink.name)) {
            if (this.isCurrent()) this.log("aide trouvée", { dmsLink });
            const amount = dmsLink.name.match(/- (?<amount>[\d \.]*) ?€$/u)?.groups.amount;
            balance.addReçu(parseFloat(amount ?? "0") * Math.sign(balance.transaction));
          } else {
            const amount = dmsLink.name.match(/(?<amount>[\d \.]*) ?€(?:\.\w+)?$/u)?.groups.amount;
            balance.addAutre(parseFloat(amount ?? "0") * Math.sign(balance.transaction));
          }
        });

        const ledgerEvents = await this.getLedgerEvents();
        ledgerEvents.forEach((event) => {
          // pertes/gains de change
          if (["47600001", "656", "609", "756", "75800002"].includes(event.planItem.number)) {
            balance.addAutre(parseFloat(event.amount) * -1);
          }
        });

        rs(balance);
      });
      this._balance = await this._balance;
    }
    if (this._balance instanceof Promise) return await this._balance;
    return this._balance;
  }

  public async getStatus(refresh = false): Promise<Status> {
    const status = await super.getStatus(refresh);
    this.cacheStatus.updateItem(status, false);
    return status;
  }

  protected async loadValidMessage(refresh: boolean | number = false): Promise<string> {
    if (refresh) this.refreshing = refresh === true ? Date.now() : refresh;
    if (this.isCurrent()) this.log("loadValidMessage", this);

    const status = ((await this.isClosedCheck()) ??
      (await this.isArchived()) ??
      (await this.hasMalnammedDMSLink()) ??
      (await this.isNextYear()) ??
      (await this.hasVAT()) ??
      (await this.isMissingBanking()) ??
      (await this.hasToSendToInvoice()) ??
      (await this.isUnbalanced()) ??
      (await this.isMissingCounterpart()) ??
      (await this.isWrongDonationCounterpart()) ??
      (await this.isTrashCounterpart()) ??
      (await this.hasUnbalancedThirdparty()) ??
      //?? await this.isMissingAttachment() // déjà inclus dans isUnbalanced()
      (await this.isOldUnbalanced()) ??
      (await this.isBankFees()) ??
      //?? await this.isAllodons()
      //?? await this.isDonationRenewal()
      (await this.isTransfer()) ??
      (await this.isAid()) ??
      (await this.hasToSendToDMS()) ??
      "OK") as string;

    this.refreshing = null;
    return status;
  }

  private async isNextYear() {
    if (this.isCurrent()) this.log("isNextYear");
    else this.debug("isNextYear", this);
    const transaction = await this.getTransaction();

    if (transaction.date.startsWith("2026")) {
      return (await this.isUnbalanced()) ?? (await this.isMissingAttachment()) ?? (await this.hasToSendToDMS()) ?? "OK";
    }
  }

  private async isClosedCheck() {
    this.debug("isClosedCheck");
    const closed = await this.isClosed();
    if (closed) {
      if (this.isCurrent()) this.log("fait partie d'un exercice clos");
      return "OK";
    }
  }

  private async isArchived() {
    this.debug("isArchived");
    // Transaction archivée
    const doc = await this.getFullDocument();
    if (doc.archived_at) {
      if (this.isCurrent()) this.log("transaction archivée");
      return "OK";
    }
  }

  private async hasMalnammedDMSLink() {
    this.debug("hasMalnammedDMSLink");
    // Fichiers DMS mal nommés
    const dmsLinks = await this.getDMSLinks();
    for (const dmsLink of dmsLinks) {
      const dmsItem = this.factory.getDMSItem(dmsLink.item_id);
      const dmsStatus = await dmsItem.getValidMessage(true);
      if (dmsStatus !== "OK")
        return `Corriger les noms des fichiers attachés dans l'onglet "Réconciliation" (surlignés en orange)`;
    }
  }

  /**
   * Vérifie si la transaction n'est pas rattachée à un rapprochement bancaire.
   */
  private async isMissingBanking(): Promise<string | void> {
    this.debug("isMissingBanking");

    const date = await this.getDate();
    const recent = Date.now() - new Date(date).getTime() < 86_400_000 * 30;
    if (recent) return;

    const isReconciled = await this.isReconciled();
    if (!isReconciled) {
      return `<a
        title="Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FRapprochements%20bancaires"
      >Cette transaction n\'est pas rattachée à un rapprochement bancaire ⓘ</a>`;
    }
    this.debug("loadValidMessage > rapprochement bancaire", {
      recent,
      reconciled: this,
    });
  }

  private async hasUnbalancedThirdparty() {
    this.debug("hasUnbalancedThirdparty");
    const ledgerEvents = await this.getLedgerEvents();

    const thirdparties: Record<string, number[]> = ledgerEvents.reduce((tp, event) => {
      const nb = event.planItem.number;
      if (nb.startsWith("4")) {
        tp[nb] = (tp[nb] ?? []).concat(parseFloat(event.amount));
      }
      return tp;
    }, {});
    const [unbalanced, events] =
      Object.entries(thirdparties).find(([key, val]) => Math.abs(val.reduce((a, b) => a + b, 0)) > 0.001) ?? [];
    if (unbalanced) {
      if (this.isCurrent()) this.log("hasUnbalancedThirdparty", { ledgerEvents, thirdparties, unbalanced, events });
      return `Le compte tiers "${unbalanced}" n'est pas équilibré.`;
    }
  }

  private async isUnbalanced() {
    if (this.isCurrent()) this.log("isUnbalanced");
    else this.debug("isUnbalanced");
    const balance = await this.getBalance();
    if (this.isCurrent()) this.log({ balance });

    let message =
      (await this.isCheckRemittance(balance)) ??
      (await this.hasUnbalancedCHQ(balance)) ??
      (await this.hasUnbalancedReceipt(balance)) ??
      (await this.isOtherUnbalanced(balance));
    if (this.isCurrent()) this.log("balance:", { balance, message, balanceJSON: balance.toJSON() });

    if (message) {
      return `<a
        title="Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Balance%20v2#${escape(
          message
        )}"
      >Balance déséquilibrée: ${message} ⓘ</a><ul>${Object.entries(balance.toJSON())
        .sort(([keya], [keyb]) => {
          const keys = ["transaction", "CHQ", "reçu", "autre"];
          return keys.indexOf(keya) - keys.indexOf(keyb);
        })
        .map(
          ([key, value]) =>
            `<li><strong>${key} :</strong>${value}${
              key !== "transaction" && balance.transaction && value !== balance.transaction
                ? ` (diff : ${balance.transaction - value})`
                : ""
            }</li>`
        )
        .join("")}</ul>`;
    }
    if (this.isCurrent()) this.log("fin contrôle balance", { message });
  }

  private async isCheckRemittance(balance: Balance) {
    this.debug("isCheckRemittance");
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith("6571"));

    // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa
    if (doc.label.startsWith("REMISE CHEQUE ") || (aidLedgerEvent && doc.label.startsWith("CHEQUE "))) {
      // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa
      // On a parfois des calculs qui ne tombent pas très juste en JS
      if (Math.abs(Math.abs(balance.transaction) - Math.abs(balance.reçu)) > 0.001) {
        balance.addReçu(null);
        if (this.isCurrent()) this.log("isCheckRemittance(): somme des reçus incorrecte");
        return "La somme des reçus doit valoir le montant de la transaction";
      }
      // On a parfois des calculs qui ne tombent pas très juste en JS
      if (Math.abs(balance.transaction - balance.CHQ) > 0.001) {
        const lost = (await this.getComments()).find((comment) => comment.content === "PHOTO CHEQUE PERDUE");
        if (!lost) {
          balance.addCHQ(null);
          if (this.isCurrent()) this.log("isCheckRemittance(): somme des chèques incorrecte");
          return "La somme des chèques doit valoir le montant de la transaction";
        } else {
          if (this.isCurrent()) this.log("isCheckRemittance(): photo chèque perdue");
        }
      }
    }
  }

  private async hasUnbalancedCHQ(balance: Balance) {
    this.debug("hasUnbalancedCHQ");
    if (balance.hasCHQ()) {
      if (Math.abs(Math.abs(balance.CHQ) - Math.abs(balance.transaction)) > 0.001) {
        if (this.isCurrent()) this.log("hasUnbalancedCHQ(): somme des chèques incorrecte");
        return "La somme des chèques doit valoir le montant de la transaction";
      }
      if (Math.abs(Math.abs(balance.CHQ) - Math.abs(balance.autre) - Math.abs(balance.reçu)) > 0.001) {
        if (this.isCurrent()) {
          this.log("hasUnbalancedCHQ(): somme des factures incorrecte", {
            CHQ: balance.CHQ,
            autre: balance.autre,
            reçu: balance.reçu,
            diff: Math.abs(Math.abs(balance.CHQ) - Math.abs(balance.autre) - Math.abs(balance.reçu)),
          });
        }
        // sample: 1798997950, 821819482
        return "La somme des factures et des reçus doit valoir celles des chèques";
      }
      if (this.isCurrent()) this.log("balance avec chèques équilibrée", balance);
      return "";
    }
  }

  private async hasUnbalancedReceipt(balance: Balance) {
    this.debug("hasUnbalancedReceipt");
    if (balance.hasReçu()) {
      if (Math.abs(balance.reçu - balance.transaction) > 0.001) {
        if (this.isCurrent()) this.log("hasUnbalancedReceipt(): somme des reçus incorrecte");
        return "La somme des reçus doit valoir le montant de la transaction";
      }
      if (this.isCurrent()) this.log("balance avec reçus équilibrée", balance);
      return "";
    }
  }

  private async isOtherUnbalanced(balance: Balance) {
    this.debug("isOtherUnbalanced");
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();

    const optionalProof = [
      "58000004", // Virements internes société générale
      "58000001", // Virements internes Stripe
      "754110002", // Dons Manuels - Stripe
      "754110001", // Dons Manuels - Allodons
      "6270005", // Frais Bancaires Société Générale
      "6270001", // Frais Stripe
      "768", // Autres produits financiers (Interets créditeurs)
    ];
    if (ledgerEvents.some((line) => optionalProof.some((number) => line.planItem.number === number))) {
      if (this.isCurrent()) this.debug("isOtherUnbalanced: justificatif facultatif");
      return;
    }

    // perte de reçu acceptable pour les petites dépenses, mais pas récurrents
    const requiredProof = ["DE: GOCARDLESS"];
    if (
      Math.abs(balance.transaction) < 100 &&
      balance.transaction < 0 &&
      !balance.hasAutre() &&
      !requiredProof.some((label) => doc.label.includes(label))
    ) {
      if (this.isCurrent()) this.debug("isOtherUnbalanced: petit montant non récurrent");
      return;
    }

    if (Math.abs(balance.transaction - balance.autre) > 0.001) {
      balance.addAutre(null);
      return "La somme des autres justificatifs doit valoir le montant de la transaction";
    }
    if (this.isCurrent()) this.debug("isOtherUnbalanced: balance équilibrée");
  }

  private async hasVAT() {
    this.debug("hasVAT");
    const ledgerEvents = await this.getLedgerEvents();

    // Les associations ne gèrent pas la TVA
    if (ledgerEvents.some((line) => line.planItem.number.startsWith("445"))) {
      return "Une écriture comporte un compte de TVA";
    }
  }

  private async isTrashCounterpart() {
    this.debug("isTrashCounterpart");
    const ledgerEvents = await this.getLedgerEvents();

    if (ledgerEvents.find((line) => line.planItem.number === "6288")) {
      return "Une ligne d'écriture comporte le numéro de compte 6288";
    }
  }

  private async isMissingCounterpart() {
    this.debug("isMissingCounterpart");
    const ledgerEvents = await this.getLedgerEvents();

    if (ledgerEvents.find((line) => line.planItem.number === "4716001")) {
      return `<a
            title="Cliquer ici pour plus d'informations."
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20attribu%C3%A9e%20%C3%A0%20un%20compte%20d'attente"
          >Une ligne d'écriture utilise un compte d'attente: 4716001 ⓘ</a>`;
    }

    if (ledgerEvents.some((line) => line.planItem.number.startsWith("47") && line.planItem.number !== "47600001")) {
      return `<a
            title="Cliquer ici pour plus d'informations."
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20attribu%C3%A9e%20%C3%A0%20un%20compte%20d'attente"
          >Une écriture comporte un compte d\'attente (commençant par 47) ⓘ</a>`;
    }
  }

  private async isWrongDonationCounterpart() {
    this.debug("isWrongDonationCounterpart");
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await Promise.all((await this.getGroupedDocuments()).map((doc) => doc.getFullDocument()));
    const dmsLinks = await this.getDMSLinks();

    const isDonation =
      groupedDocuments.some((gdoc) => / CERFA | AIDES - /u.test(gdoc.label)) ||
      dmsLinks.some((dmsLink) => /^(?:CERFA|AIDES) /u.test(dmsLink.name));
    const donationCounterparts = [
      "75411", // Dons manuels
      "6571", // Aides financières accordées à un particulier
      "6571002", // Don versé à une autre association
    ];
    if (isDonation && !ledgerEvents.some((line) => donationCounterparts.includes(line.planItem.number))) {
      if (this.isCurrent())
        this.log("La contrepartie devrait faire partie de cette liste", { ledgerEvents, donationCounterparts });
      return `La contrepartie devrait faire partie de cette liste (onglet "Écritures")<ul><li>${donationCounterparts.join(
        "</li><li>"
      )}</li></ul>`;
    }
  }

  private async isOldUnbalanced() {
    this.debug("isOldUnbalanced");
    const ledgerEvents = await this.getLedgerEvents();

    // balance déséquilibrée
    const third = ledgerEvents.find((line) => line.planItem.number.startsWith("40"))?.planItem?.number;
    if (third) {
      const thirdEvents = ledgerEvents.filter((line) => line.planItem.number === third);
      const balance = thirdEvents.reduce((sum, line) => sum + parseFloat(line.amount), 0);
      if (this.isCurrent())
        this.log("loadValidMessage: Balance", Math.abs(balance) > 0.001 ? "déséquilibrée" : "OK", this);

      // On a parfois des calculs qui ne tombent pas très juste en JS
      //if (Math.abs(balance) > 0.001) {
      if (Math.abs(balance) > 100) {
        return `Balance déséquilibrée avec Tiers spécifié : ${balance}`;
      }
    }
  }

  private async isMissingAttachment() {
    this.debug("isMissingAttachment");
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();
    const dmsLinks = await this.getDMSLinks();

    // Justificatif manquant
    if (
      !ledgerEvents.some((levent) => levent.closed) && // Exercice clos
      Math.abs(parseFloat(doc.currency_amount)) >= 100
    ) {
    }
    const attachmentOptional =
      // Justificatif pas exigé pour les petits montants
      (!this.isCurrent() && Math.abs(parseFloat(doc.currency_amount)) < 100) ||
      [" DE: STRIPE MOTIF: ALLODONS REF: ", "Payout: STRIPE PAYOUT "].some((label) => doc.label.includes(label)) ||
      ["REMISE CHEQUE ", "VIR RECU ", "VIR INST RE ", "VIR INSTANTANE RECU DE: "].some((label) =>
        doc.label.startsWith(label)
      );
    const attachmentRequired =
      doc.attachment_required && !doc.attachment_lost && (!attachmentOptional || this.isCurrent());
    const hasAttachment = groupedDocuments.length + dmsLinks.length > 1;
    if (this.isCurrent()) this.log({ attachmentOptional, attachmentRequired, groupedDocuments, hasAttachment });
    if (attachmentRequired && !hasAttachment) return "Justificatif manquant";
  }

  private async isBankFees() {
    this.debug("isBankFees");
    return await this.isIntlTransferFees();
    //?? await this.isStripeFees()
  }

  private async isIntlTransferFees() {
    this.debug("isIntlTransferFees");
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.label.startsWith("FRAIS VIR INTL ELEC ")) {
      if (
        ledgerEvents.length !== 2 ||
        groupedDocuments.length > 1 ||
        ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||
        !ledgerEvents.find((ev) => ev.planItem.number === "6270005")
      )
        return "Frais bancaires SG mal attribué (=> 6270005)";
      if (this.isCurrent()) this.log("frais bancaires OK");
      return "OK";
    }
  }

  private async isStripeFees() {
    this.debug("isStripeFees");
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.label.startsWith("Fee: Billing - Usage Fee (")) {
      if (
        ledgerEvents.length !== 2 ||
        groupedDocuments.length > 1 ||
        ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||
        !ledgerEvents.find((ev) => ev.planItem.number === "6270001")
      )
        return "Frais Stripe mal attribués (=>6270001)";
      if (this.isCurrent()) this.log("frais bancaires Stripe OK");
      return "OK";
    }
  }

  private async isAllodons() {
    this.debug("isAllodons");
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.label.includes(" DE: STRIPE MOTIF: ALLODONS REF: ")) {
      if (
        ledgerEvents.length !== 2 ||
        groupedDocuments.length > 1 ||
        ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||
        !ledgerEvents.find((ev) => ev.planItem.number === "754110001")
      )
        return "Virement Allodons mal attribué (=>754110001)";
      if (this.isCurrent()) this.log("virement allodon OK");
      return "OK";
    }
  }

  private async isDonationRenewal() {
    this.debug("isDonationRenewal");
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.label.startsWith("Charge: ")) {
      if (
        ledgerEvents.length !== 3 ||
        groupedDocuments.length > 1 ||
        ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||
        !ledgerEvents.find((ev) => ev.planItem.number === "6270001") ||
        !ledgerEvents.find((ev) => ev.planItem.number === "754110002")
      )
        return "Renouvellement de don mal attribués";
      if (this.isCurrent()) this.log("Renouvellement de don OK");
      return "OK";
    }
  }

  private async isTransfer() {
    this.debug("isTransfer");
    const doc = await this.getFullDocument();
    if (["VIR ", "Payout: "].some((label) => doc.label.startsWith(label))) {
      return await this.isStripeInternalTransfer();
      // ?? await this.isAssociationDonation()
      // ?? await this.isOptionalReceiptDonation() // Les CERFAs ne sont pas optionel, seul leur envoi au donateur peut l'être
      // ?? await this.isNormalDonation()          // inclus dans la balance
    }
  }

  private async isStripeInternalTransfer() {
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (
      [
        " DE: Stripe Technology Europe Ltd MOTIF: STRIPE ",
        " DE: STRIPE MOTIF: STRIPE REF: STRIPE-",
        "Payout: STRIPE PAYOUT (",
      ].some((label) => doc.label.includes(label))
    ) {
      if (
        ledgerEvents.length !== 2 ||
        groupedDocuments.length > 1 ||
        ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||
        !ledgerEvents.find((ev) => ev.planItem.number === "58000001")
      )
        return "Virement interne Stripe mal attribué (=>58000001)";
      if (this.isCurrent()) this.log("virement interne Stripe OK");
      return "OK";
    }
  }

  private async isAssociationDonation() {
    this.debug("isAssociationDonation");
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    const assos = [
      " DE: ALEF.ASSOC ETUDE ENSEIGNEMENT FO",
      " DE: ASS UNE LUMIERE POUR MILLE",
      " DE: COLLEL EREV KINIAN AVRAM (C E K ",
      " DE: ESPACE CULTUREL ET UNIVERSITAIRE ",
      " DE: JEOM MOTIF: ",
      " DE: MIKDACH MEAT ",
      " DE: YECHIVA AZ YACHIR MOCHE MOTIF: ",
      " DE: ASSOCIATION BEER MOTIF: ",
    ];
    this.error("todo: réparer cette fonction");
    debugger;
    /*
    if (assos.some((label) => doc.label.includes(label))) {
      if (
        ledgerEvents.length !== 2 ||
        groupedDocuments.length > 1 ||
        ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||
        !ledgerEvents.find((ev) => ev.planItem.number === "75411")
      )
        return "Virement reçu d'une association mal attribué";
      if (this.isCurrent()) this.log("virement reçu d'une association OK");
      return "OK";
    }
    */
  }

  private async isOptionalReceiptDonation() {
    this.debug("isOptionalReceiptDonation");
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    const sansCerfa = [
      " DE: MONSIEUR FABRICE HARARI MOTIF: ",
      " DE: MR ET MADAME DENIS LEVY",
      " DE: Zacharie Mimoun ",
      " DE: M OU MME MIMOUN ZACHARIE MOTIF: ",
    ];
    this.error("todo: réparer cette fonction");
    debugger;
    /*
    if (sansCerfa.some((label) => doc.label.includes(label))) {
      if (
        ledgerEvents.length !== 2 ||
        groupedDocuments.length > 1 ||
        ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||
        !ledgerEvents.find((ev) => ev.planItem.number === "75411")
      )
        return "Virement reçu avec CERFA optionel mal attribué (=>75411)";
      if (this.isCurrent()) this.log("Virement reçu avec CERFA optionel OK");
      return "OK";
    }
  }

  private async isNormalDonation() {
    const groupedDocuments = await this.getGroupedDocuments();
    const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));

    if (gdocs.length < 2) {
      return `<a
        title="Ajouter le CERFA dans les pièces de réconciliation. Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Virement%20re%C3%A7u%20sans%20justificatif"
      >Virement reçu sans justificatif ⓘ</a>`;
    }

    this.error("todo: réparer cette fonction");
    debugger;
    /*
    if (!gdocs.find((gdoc) => gdoc.label.includes("CERFA"))) {
      return "Les virements reçus doivent être justifiés par un CERFA";
    }
    */
  }

  private async isAid() {
    this.debug("isAid");
    // Aides octroyées
    return (
      (await this.isAssociationAid()) ??
      (await this.isMissingBeneficiaryName()) ??
      (await this.isMissingCounterpartLabel())
    );
  }

  private async isAssociationAid() {
    this.debug("isAssociationAid");
    const ledgerEvents = await this.getLedgerEvents();
    const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith("6571"));

    if (aidLedgerEvent?.planItem.number === "6571002") {
      // a une autre asso
      /**
      // Aides octroyées sans label
      if (!aidLedgerEvent.label) {
        return `<a
          title="Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20%C3%A0%20une%20autre%20association"
        >nom du bénéficiaire manquant dans l\'écriture "6571" ⓘ</a>`;
      }

      const isCheck = doc.label.startsWith('CHEQUE ');
      const receiptsNb = groupedDocuments.filter(gdoc => gdoc.type !== 'Transaction'
        && [' CERFA ', ' CB '].some(needle => gdoc.label.includes(needle))
      ).length + dmsLinks.filter(dms => dms.name.includes('CERFA ')).length;
      if (
        ledgerEvents.length !== 2
        || (groupedDocuments.length + dmsLinks.length) !== 1 + Number(isCheck) + Number(receiptsNb)
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
      ) {
        if (this.isCurrent()) this.log('Don versé à une autre association incorrectement traité', {
          'ledgerEvents.length': ledgerEvents.length,
          'groupedDocuments.length': groupedDocuments.length,
          isCheck,
          receiptsNb,
          dmsLinks,
          eventsSum: ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0)
        });
        return `<a
          title="Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20%C3%A0%20une%20autre%20association"
        >Don versé à une autre association incorrectement traité ⓘ</a>`;
      }
      if (this.isCurrent()) this.log('Don versé à une autre association OK');
      return 'OK';
      /**/
    }
  }

  private async isMissingBeneficiaryName() {
    this.debug("isMissingBeneficiaryName");
    const ledgerEvents = await this.getLedgerEvents();
    const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith("6571"));

    if (aidLedgerEvent && !aidLedgerEvent.label) {
      // Aides octroyées sans label
      return `<a
        title="Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#nom%20du%20bénéficiaire%20manquant%20dans%20l'écriture%20%226571%22"
      >nom du bénéficiaire manquant dans l\'écriture "6571" ⓘ</a>`;
    }
  }

  private async isMissingCounterpartLabel() {
    this.debug("isMissingCounterpartLabel");
    const doc = await this.getFullDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();
    const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith("6571"));

    if (!aidLedgerEvent && parseFloat(doc.amount) < 0) {
      for (const gdoc of groupedDocuments) {
        if (gdoc.type !== "invoice") continue;
        const thirdparty = await gdoc.getThirdparty();
        // Aides octroyées à une asso ou un particulier
        if ([106438171, 114270419].includes(thirdparty.id)) {
          // Aides octroyées sans compte d'aide
          return `<a
            title="Cliquer ici pour plus d'informations."
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#contrepartie%20%226571%22%20manquante"
          >contrepartie "6571" manquante ⓘ</a>`;
        }
      }
    }
  }

  private async hasToSendToDMS() {
    this.debug("hasToSendToDMS");
    const balance = await this.getBalance();
    if (
      balance.CHQ &&
      balance.CHQ === balance.transaction &&
      (balance.autre === balance.transaction || balance.reçu === balance.transaction)
    ) {
      const groupedDocuments = await this.getGroupedDocuments();
      for (const gdoc of groupedDocuments) {
        const label = await gdoc.getLabel();
        if (label.includes(" - CHQ")) {
          if (this.isCurrent()) this.log("hasToSendToDMS", { groupedDocuments, balance });
          return "envoyer les CHQs en GED";
        }
      }
      if (this.isCurrent()) this.log("hasToSendToDMS", "tous les chq sont en GED", { groupedDocuments, balance });
      return;
    }
  }

  private async hasToSendToInvoice() {
    this.debug("hasToSendToInvoice");
    if (await this.isFrozen()) return;
    const balance = await this.getBalance();
    if (balance.reçu) {
      const dmsLinks = await this.getDMSLinks();
      const receipts = dmsLinks.filter((link) => ["CERFA", "AIDES"].some((key) => link.name.startsWith(key)));
      if (this.isCurrent()) this.log("hasToSendToInvoice", { dmsLinks, receipts, balance });
      if (!receipts.length) {
        if (this.isCurrent())
          this.log("hasToSendToInvoice", "tous les reçus sont en facturation", {
            groupedDocuments: dmsLinks,
            balance,
          });
        return;
      }
      return "envoyer les reçus en facturation";
    }
  }

  /** Add item to this transaction's group */
  async groupAdd(id: number) {
    this.debug("groupAdd");
    const response = await matchDocuments(this.id, id);

    // If the provided id is an invoice, the request should succeed.
    if (response && "grouped_transactions" in response && response.grouped_transactions.some((tr) => tr.id === this.id))
      return;

    // If the provided id is a DMS file, we need use the DMS link instead of relying on document matching.
    this.error('todo: réparer la méthode "groupAdd()"', this);
    debugger;
    /*
    const doc = await this.getDocument(0);
    const groups = doc.group_uuid;
    this.error("groupAdd", { response });
    await createDMSLink(id, this.id, "Transaction");
    /**/
  }

  async getGuuid(maxAge?: number) {
    if (typeof maxAge !== "number") maxAge = this.maxAge(maxAge);
    return await getDocumentGuuid(this.id, maxAge);
  }

  /** Determine the acceptable maxAge of API data */
  private maxAge(maxAge?: number) {
    if (typeof maxAge === "number") return maxAge;
    if (this.refreshing) return Date.now() - this.refreshing;
    if (this.isCurrent()) return Date.now() - performance.timeOrigin;
    return void 0;
  }
}
