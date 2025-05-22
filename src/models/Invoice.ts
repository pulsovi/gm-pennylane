import { getParam } from '../_/url.js';
import { getDMSItemList, updateDMSItem } from '../api/dms.js';
import { APIDMSItem } from '../api/DMS/Item.js';
import { getInvoice, moveToDms, updateInvoice } from '../api/invoice.js';
import { APIInvoice } from '../api/types.js';
import Logger from '../framework/Logger.js';
import DMSItem from './DMSItem.js';

import ValidableDocument from './ValidableDocument.js';

const staticLogger = new Logger('Invoice');

export default abstract class Invoice extends ValidableDocument {
  public readonly type = 'invoice';
  private invoice: APIInvoice | Promise<APIInvoice>;

  public static from(invoice: { direction: string; id: number }) {
    if (invoice.direction === 'supplier') return new SupplierInvoice(invoice);
    return new CustomerInvoice(invoice);
  }

  static async load(id: number) {
    const invoice = await getInvoice(id);
    if (!invoice?.id) {
      staticLogger.log('Invoice.load: cannot load this invoice', { id, invoice, _this: this });
      return new NotFoundInvoice({ id });
    }
    return this.from(invoice);
  }

  async update(data: Partial<APIInvoice>) {
    return await updateInvoice(this.id, data);
  }

  async getInvoice() {
    if (!this.invoice) {
      this.invoice = getInvoice(this.id).then(response => {
        if (!response) throw new Error('Impossible de charger la facture');
        return response;
      });
    }
    return this.invoice;
  }

  async moveToDms(destId: number) {
    const invoice = await this.getInvoice();
    const filename = invoice.filename;
    const fileId = invoice.file_signed_id;
    const invoiceName = `${invoice.invoice_number} - ${invoice.amount}€`;
    await moveToDms(this.id, destId);
    const files = await getDMSItemList({
      filter: [{ field: 'name', operator: 'search_all', value: filename }]
    });
    const item: APIDMSItem = files.items.find(fileItem => fileItem.signed_id === fileId);
    await updateDMSItem({ id: item.id, name: invoiceName });
    return new DMSItem({ id: item.id });
  }

  isCurrent() {
    return getParam(location.href, 'id') === String(this.id);
  }
}

export class NotFoundInvoice extends Invoice {
  public readonly direction = 'unknown';

  loadValidMessage() {
    return Promise.resolve('Facture introuvable');
  }
}

class SupplierInvoice extends Invoice {
  public readonly direction = 'supplier';

  async loadValidMessage() {
    if (this.isCurrent()) this.log('loadValidMessage', this);

    return (
      await this.isUnreachable()
      ?? await this.isClosed()
      ?? await this.isArchived()
      ?? await this.is2025()
      ?? await this.isZero()
      ?? await this.isMissingThirdparty()
      ?? await this.isMissingCounterpart()
      ?? await this.isTrashCounterpart()
      ?? await this.isAid()
      ?? await this.hasWrongChangeOffset()
      ?? await this.isMissingLettering()
      //?? await this.hasToSendToDMS()
      ?? await this.isMissingDate()
      ?? ((this.isCurrent() && this.log('loadValidMessage', 'fin des contrôles')), 'OK')
    );
  }

  private async isUnreachable() {
    const invoice = await this.getInvoice().catch((error: Error) => error);

    if (!(invoice instanceof APIInvoice)) {
      this.log('loadValidMessage', invoice);
      alert(invoice.message);
      return `Impossible de valider : ${invoice.message}`;
    }
  }

  private async isClosed() {
    const invoice = await this.getInvoice();

    // Fait partie d'un exercice clôturé
    if (invoice.has_closed_ledger_events) {
      this.log('Fait partie d\'un exercice clos');
      if (invoice.date) return 'OK';
    }

    const ledgerEvents = await this.getLedgerEvents();

    if (ledgerEvents.some(levent => levent.closed)) {
      this.log("Est attaché à une écriture faisant partie d'un exercice clos");
      if (invoice.date) return 'OK';
    }
  }

  private async isArchived() {
    const invoice = await this.getInvoice();
    const archivedAllowed = [
      '§ #',
      '¤ CARTE ETRANGERE',
      '¤ PIECE ETRANGERE',
      '¤ TRANSACTION INTROUVABLE',
      'CHQ DÉCHIRÉ',
    ];

    // Archived
    if (invoice.archived) {
      if (archivedAllowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem))) {
        if (this.isCurrent()) this.log('loadValidMessage', 'archivé avec numéro de facture correct');
        return 'OK';
      }
      return `<a
        title="Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités. Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e"
      >Facture archivée sans référence ⓘ</a><ul style="margin:0;padding:0.8em;">${archivedAllowed.map(it => `<li>${it}</li>`).join('')}</ul>`;
    } else if (
      archivedAllowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem))
    ) {
      return `<a
        title="Archiver la facture : ⁝ &gt; Archiver la facture.\nCliquer ici pour plus d'informations"
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu"
      >Archiver la facture ⓘ</a><br/>Les factures dont le numéro de facture commence par ${archivedAllowed.find(allowedItem => invoice.invoice_number.startsWith(allowedItem))
        } doivent être archivées.`;
    }
  }

  private async is2025 () {
    const doc = await this.getDocument();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.date?.startsWith('2025') || groupedDocuments.some(gdoc => gdoc.date?.startsWith('2025'))) {
      return (
        await this.isMissingLettering()
        ?? await this.isZero()
        ?? ((this.isCurrent()) && this.log('2025'), 'OK')
      );
    }
  }

  private async isZero () {
    const invoice = await this.getInvoice();
    // Montant
    if (invoice.amount === '0.0' && !invoice.invoice_number.includes('|ZERO|')) return `<a
      title="Cliquer ici pour plus d'informations."
      href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client"
    >Ajouter le montant ⓘ</a><ul style="margin:0;padding:0.8em;"><li>|ZERO|</li></ul>`;
  }

  private async isMissingThirdparty() {
    const invoice = await this.getInvoice();

    // Pas de tiers
    if (!invoice.thirdparty_id && !invoice.thirdparty) {
      return `<a
        title="Cliquer ici pour plus d'informations"
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu"
      >Ajouter un fournisseur ⓘ</a><ul style="margin:0;padding:0.8em;"><li>CHQ DÉCHIRÉ - CHQ###</li></ul>`;
    }
  }

  private async isMissingCounterpart() {
    const thirdparty = await this.getThirdparty();

    // Pas de compte de charge associé
    if (!thirdparty?.thirdparty_invoice_line_rules?.[0]?.pnl_plan_item) {
      return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu"
        >Fournisseur inconnu ⓘ</a>`;
    }
  }

  private async isTrashCounterpart() {
    const invoice = await this.getInvoice();

    // exclude 6288
    if (invoice.invoice_lines?.some(line => line.pnl_plan_item?.number == '6288'))
      return 'compte tiers 6288';
  }

  private async isAid() {
    const invoice = await this.getInvoice();

    // Aides octroyées sans numéro de facture
    if (
      106438171 === invoice.thirdparty_id // AIDES OCTROYÉES
      && !['AIDES - ', 'CHQ', 'CERFA - '].some(label => invoice.invoice_number.startsWith(label))
    ) {
      if (invoice.invoice_number.startsWith('§ #')) return "Archiver le reçu.";
      return `<a
        title="Cliquer ici pour plus d'informations"
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#Format%20incorrect%20pour%20le%20num%E9ro%20de%20facture"
      >Format incorrect pour le numéro de facture ⓘ</a>
      <ul style="margin:0;padding:0.8em;">
        <li>AIDES - NOM - JJ/MM/AAAA</li>
        <li>CERFA - NOM ASSO - JJ/MM/AAAA</li>
        <li>CHQ###</li>
      </ul>`;
    }

    // Aides octroyées avec mauvais ID
    if (invoice.thirdparty?.name === "AIDES OCTROYÉES" && invoice.thirdparty.id !== 106438171)
      return 'Il ne doit y avoir qu\'un seul compte "AIDES OCTROYÉES", et ce n\'est pas le bon...';

    // Piece d'identité avec mauvais ID
    if (invoice.thirdparty?.name === "PIECE ID" && invoice.thirdparty.id !== 106519227)
      return 'Il ne doit y avoir qu\'un seul compte "PIECE ID", et ce n\'est pas le bon...';

    // ID card
    if (invoice.thirdparty?.id === 106519227 && !invoice.invoice_number?.startsWith('ID ')) {
      return 'Le "Numéro de facture" des pièces d\'identité commence obligatoirement par "ID "';
    }
  }

  private async hasWrongChangeOffset() {
    const invoice = await this.getInvoice();
    const ledgerEvents = await this.getLedgerEvents();

    // Ecarts de conversion de devise
    if (invoice.currency !== 'EUR') {
      const diffLine = ledgerEvents.find(line => line.planItem.number === '4716001');
      if (diffLine) {
        this.log('loadValidMessage > Ecarts de conversion de devise', { ledgerEvents, diffLine });
        if (parseFloat(diffLine.amount) < 0) {
          return 'Les écarts de conversions de devises doivent utiliser le compte 756';
        } else {
          return `<a
            title="Cliquer ici pour plus d'informations"
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FLes%20%C3%A9carts%20de%20conversions%20de%20devises%20doivent%20utiliser%20le%20compte%20656"
          >Les écarts de conversions de devises doivent utiliser le compte 656 ⓘ</a>`;
        }
      }
    }
  }

  private async isMissingLettering() {
    const invoice = await this.getInvoice();
    const doc = await this.getDocument();
    const groupedDocuments = await this.getGroupedDocuments();
    const transactions = groupedDocuments.filter(doc => doc.type === 'Transaction');

    // Has transaction attached
    const documentDate = new Date(doc.date);
    const dayInMs = 86_400_000;
    const isRecent = (Date.now() - documentDate.getTime()) < (10 * dayInMs);
    if (!isRecent && !transactions.length) {
      const orphanAllowedThirdparties = [
        115640202, // Stripe - facture de frais bancaires réparties sur toutes les transactions de don
      ];
      const orphanAllowedNumbers = [
        '¤ TRANSACTION INTROUVABLE'
      ];
      const archivedAllowedNumbers = [
        '§ #',
        '¤ CARTE ETRANGERE',
        '¤ PIECE ETRANGERE',
        'CHQ DÉCHIRÉ',
      ];
      if (
        !orphanAllowedNumbers.some(label => invoice.invoice_number.startsWith(label))
        && !orphanAllowedThirdparties.some(tpid => invoice.thirdparty_id === tpid)
      ) {
        return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e"
        >Pas de transaction attachée ⓘ</a><ul style="margin:0;padding:0.8em;">${orphanAllowedNumbers.concat(archivedAllowedNumbers).map(it => `<li>${it}</li>`).join('')}</ul>`;
      }
    }
  }

  private async hasToSendToDMS () {
    const invoice = await this.getInvoice();
    const groupedDocuments = await this.getGroupedDocuments();
    const transactions = groupedDocuments.filter(doc => doc.type === 'Transaction');

    // Justificatif ne donnant pas lieu à une écriture
    if (
      transactions.length && (
        [
          106438171, // AIDES OCTROYÉES             : talon de chèque ou reçu signé
          114270419, // DON VERSÉ A UNE ASSOCIATION : talon de chèque ou reçu cerfa
          106519227, // PIECE ID
        ].includes(invoice.thirdparty?.id ?? 0)
        || invoice.invoice_number.startsWith('CHQ') // TALON DE CHEQUE
      )
    ) {
      if (transactions.find(transaction => transaction.date.startsWith('2023'))) {
        const dmsItem = await this.moveToDms(57983091 /*2023 - Compta - Fournisseurs*/);
        this.log({ dmsItem });
        if (this.isCurrent()) this.log('moved to DMS', { invoice: this });
        return (await Invoice.load(this.id)).loadValidMessage();
      }
      if (transactions.find(transaction => transaction.date.startsWith('2024'))) {
        const dmsItem = await this.moveToDms(21994050 /*2024 - Compta - Fournisseurs*/);
        this.log({ dmsItem });
        if (this.isCurrent()) this.log('moved to DMS', { invoice: this });
        return (await Invoice.load(this.id)).loadValidMessage();
      }
      if (!transactions.find(transaction => transaction.date.startsWith('2025'))) {
        this.log('Envoyer en GED', transactions);
        return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Envoi%20en%20GED"
        >Envoyer en GED ⓘ</a>`;
      }
    }
  }

  private async isMissingDate () {
    const invoice = await this.getInvoice();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();
    const transactions = groupedDocuments.filter(doc => doc.type === 'Transaction');

    // Date manquante
    if (!invoice.date) {
      if (invoice.has_closed_ledger_events || ledgerEvents.some(levent => levent.closed)) {
        this.log('exercice clos, on ne peut plus remplir la date');
        if (transactions.find(transaction => transaction.date.startsWith('2023'))) {
          const dmsItem = await this.moveToDms(57983091 /*2023 - Compta - Fournisseurs*/);
          this.log({ dmsItem });
          if (this.isCurrent()) this.log('moved to DMS', { invoice: this });
          return (await Invoice.load(this.id)).loadValidMessage();
        }
        return 'envoyer en GED';
      } else {
        return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture"
        >Date de facture vide ⓘ</a>`;
      }
    }
  }
}

class CustomerInvoice extends Invoice {
  public readonly direction = 'customer';

  async loadValidMessage() {
    const invoice = await this.getInvoice();

    // Fait partie d'un exercis clôt
    const closed = invoice.has_closed_ledger_events;

    if (this.isCurrent()) this.log('loadValidMessage', this);

    // Archived
    const archivedAllowed = ['§ #', '¤ TRANSACTION INTROUVABLE'];
    if (invoice.archived) {
      if (
        //legacy
        !invoice.invoice_number.startsWith('§ ESPECES') &&

        !archivedAllowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem))
      )
        return `<a
          title="Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e"
        >Facture archivée sans référence ⓘ</a><ul style="margin:0;padding:0.8em;">${archivedAllowed.map(it => `<li>${it}</li>`).join('')}</ul>`;
      return 'OK';
    }

    // Pas de client
    if (!invoice.thirdparty) return 'choisir un "client"';

    // don manuel
    if (![113420582, 103165930].includes(invoice.thirdparty.id))
      return 'les seuls clients autorisés sont "PIECE ID" et "DON MANUEL"';

    // piece id
    if (invoice.thirdparty.id === 113420582 /* PIECE ID */) {
      if (!invoice.invoice_number?.startsWith('ID '))
        return 'le champ "Numéro de facture" doit commencer par "ID NOM_DE_LA_PERSONNE"';
    }

    // Montant
    if (invoice.amount === '0.0' && !(
      invoice.invoice_number.includes('|ZERO|') || invoice.thirdparty.id === 113420582 /* PIECE ID */
    )) return `<a
      title="Cliquer ici pour plus d'informations."
      href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client"
    >Ajouter le montant ⓘ</a><ul style="margin:0;padding:0.8em;"><li>|ZERO|</li></ul>`;

    // Don Manuel
    if (
      invoice.thirdparty_id === 103165930 /* DON MANUEL */
      && !['CHQ', 'CERFA'].some(label => invoice.invoice_number.includes(label))
    ) {
      return `<a
        title="Le numéro de facture doit être conforme à un des modèles proposés. Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20Manuel%20-%20num%C3%A9ro%20de%20facture"
      >Informations manquantes dans le numéro de facture ⓘ</a><ul style="margin:0;padding:0.8em;">${[
          'CERFA n°### - Prénom Nom - JJ/MM/AAAA',
          'CHQ n°### - Prénom Nom - JJ/MM/AAAA',
        ].map(it => `<li>${it}</li>`).join('')}</ul>`;
    }

    // Has transaction attached
    const invoiceDocument = await this.getDocument();
    const groupedOptional = ['¤ TRANSACTION INTROUVABLE'];
    const groupedDocuments = invoiceDocument.grouped_documents;


    if (
      !groupedDocuments?.some(doc => doc.type === 'Transaction')
      && !groupedOptional.some(label => invoice.invoice_number.startsWith(label))
    )
      return `<a
          title="Si la transaction est introuvable, mettre un des textes proposés au début du numéro de facture. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e"
        >Pas de transaction attachée ⓘ</a><ul style="margin:0;padding:0.8em;">${groupedOptional.map(it => `<li>${it}</li>`).join('')}</ul>`;

    return (
      //this.hasToSendToDMS() ??
      'OK'
    );
  }

  private async hasToSendToDMS() {
    const groupedDocuments = await this.getGroupedDocuments();
    const transactions = groupedDocuments.filter(gdoc => gdoc.type === 'Transaction');
    const invoice = await this.getInvoice();

    const archivedAllowed = ['§ #', '¤ TRANSACTION INTROUVABLE'];

    // if (transactions.find(transaction => transaction.date.startsWith('2024'))) {
    //   const dmsItem = await this.moveToDms(21994051 /*2024 - Compta - Clients */);
    //   this.log({ dmsItem });
    //   if (this.isCurrent()) this.log('moved to DMS', { invoice: this });
    //   return (await Invoice.load(this.id)).loadValidMessage();
    // }

    // if (transactions.find(transaction => transaction.date.startsWith('2023'))) {
    //   const dmsItem = await this.moveToDms(57983092 /*2023 - Compta - Clients */);
    //   this.log({ dmsItem });
    //   if (this.isCurrent()) this.log('moved to DMS', { invoice: this });
    //   return (await Invoice.load(this.id)).loadValidMessage();
    // }

    // Date manquante
    if (!invoice.date) {
      const archiveLabel = archivedAllowed.find(label => invoice.invoice_number.startsWith(label));
      if (archiveLabel) {
        return `<a
          title="Archiver la facture : ⁝ > Archiver la facture.\nCliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e"
        >Archiver ${archiveLabel} ⓘ</a><ul style="margin:0;padding:0.8em;">`;
      }

      const ledgerEvents = await this.getLedgerEvents();
      if (invoice.has_closed_ledger_events || ledgerEvents.some(levent => levent.closed)) {
        this.log('exercice clos, on ne peut plus remplir la date');
      } else {
        return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture"
        >Date de facture vide ⓘ</a>`;
      }
    }

    if (!transactions.find(transaction => transaction.date.startsWith('2025'))) {
      this.log('Envoyer en GED', transactions);
      return `<a
        title="Cliquer ici pour plus d'informations"
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Envoi%20en%20GED"
      >Envoyer en GED ⓘ</a>`;
    }
  }
}
