import { getParam } from '../_';
import { getInvoice, updateInvoice } from '../api/invoice.js';
import { RawInvoice, RawInvoiceUpdate } from '../api/types.js';
import ValidableDocument from './ValidableDocument.js';

export default abstract class Invoice extends ValidableDocument {
  public readonly type = 'invoice';
  private invoice: RawInvoice | Promise<RawInvoice>;

  static from (invoice: RawInvoice) {
    if (invoice.direction === 'supplier') return new SupplierInvoice(invoice);
    return new CustomerInvoice(invoice);
  }

  static async load (id: number) {
    const invoice = await getInvoice(id);
    if (!invoice?.id) {
      console.log('Invoice.load: cannot load this invoice', {id, invoice});
      return null;
    }
    return this.from(invoice);
  }

  async update (data: Partial<RawInvoiceUpdate>) {
    return await updateInvoice(this.id, data);
  }

  async getInvoice () {
    if (!this.invoice) {
      this.invoice = getInvoice(this.id).then(response => {
        if (!response) throw new Error('Impossible de charger la facture');
        return response;
      });
    }
    return this.invoice;
  }
}
Object.assign(window, {Invoice});

class SupplierInvoice extends Invoice {
  public readonly direction = 'supplier';

  async loadValidMessage () {
    const current = Number(getParam(location.href, 'id'));

    const invoice = await this.getInvoice();
    if (!invoice) console.log('SupplierInvoice.loadValidMessage', {invoice});

    const invoiceDocument = await this.getDocument();
    if (invoice.id === current)
      console.log('SupplierInvoice.loadValidMessage', { invoice, invoiceDocument });

    // Transaction < 2024 => OK
    const groupedDocuments = await this.getGroupedDocuments();
    const transactions = groupedDocuments.filter(doc => doc.type === 'Transaction');
    const currentYear = 2024; //new Date().getFullYear();
    if (
      transactions.length &&
      transactions.every(transaction => parseInt(transaction.date.slice(0, 4)) < currentYear)
    ) {
      if (invoice.id == current) console.log(this.constructor.name, 'loadValidMessage', 'année passée');
      return 'OK';
    }

    // Archived
    if (invoice.archived) {
      const allowed = ['§ #', '¤ CARTE ETRANGERE', '¤ TRANSACTION INTROUVABLE'];
      if (!allowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem)))
        return `Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités : ${allowed.map(it => `"${it}"`).join(', ')}`;
      return 'OK';
    }

    // Pas de tiers
    if (!invoice.thirdparty_id && !invoice.thirdparty) return 'Ajouter un fournisseur';

    if (invoice.thirdparty && !invoice.thirdparty.country)
      return 'Fournisseur inconnu : Choisir un autre fournisseur ou ajouter le pays de celui-ci';


    // exclude 6288
    if (invoice.invoice_lines?.some(line => line.pnl_plan_item?.number == '6288'))
      return 'compte tiers 6288';

    // Known orphan invoice
    if (invoice.invoice_number?.startsWith('¤')) {
      if (invoice.id == current) console.log('¤');
      return 'OK';
    }

    // Aides octroyées ou piece d'indentité avec date
    if ([106438171, 114270419, 106519227].includes(invoice.thirdparty?.id ?? 0)) {
      if (invoice.date || invoice.deadline) return 'Les dates doivent être vides';
    }

    // Aides octroyées avec mauvais ID
    if (invoice.thirdparty?.name === "AIDES OCTROYÉES" && invoice.thirdparty.id !== 106438171)
      return 'Il ne doit y avoir qu\'un seul compte "AIDES OCTROYÉES", et ce n\'est pas le bon...';

    // Piece d'identité avec mauvais ID
    if (invoice.thirdparty?.name === "PIECE ID" && invoice.thirdparty.id !== 106519227)
      return 'Il ne doit y avoir qu\'un seul compte "PIECE ID", et ce n\'est pas le bon...';

    /* Aides octroyées sans label
    if ([106438171, 114270419].includes(invoice.thirdparty?.id)) {
      ledgerEvents = ledgerEvents ?? await getLedgerEvents(invoice.id);
      const lines = ledgerEvents.filter(event => ['6571', '6571002'].includes(event.planItem.number));
      if (!lines.length) return 'écriture "6571" manquante';
    }
    */

    // Ecarts de conversion de devise
    if (invoice.currency !== 'EUR') {
      const ledgerEvents = await this.getLedgerEvents();
      const diffLine = ledgerEvents.find(line => line.planItem.number === '4716001');
      console.log({ledgerEvents, diffLine});
      if (diffLine) {
        if (parseFloat(diffLine.amount) < 0)
          return 'Les écarts de conversions de devises doivent utiliser le compte 756';
        else
          return 'Les écarts de conversions de devises doivent utiliser le compte 656';
      }
    }

    // Stripe fees invoice
    if (invoice.thirdparty?.id === 115640202) return 'OK';

    // ID card
    if (invoice.thirdparty?.id === 106519227) {
      if (invoice.invoice_number?.startsWith('ID ')) return 'OK';
      else return 'Le "Numéro de facture" des pièces d\'identité commence obligatoirement par "ID "';
    }

    // Has transaction attached
    if (!transactions.length) return 'pas de transaction attachée';

    if (!invoice.date) return 'la date de facture est vide';

    return 'OK';
  }
}

class CustomerInvoice extends Invoice {
  public readonly direction = 'customer';

  async loadValidMessage () {
    const invoice = await this.getInvoice();
    console.log(this.constructor.name, 'loadValidMessage', { invoice });
    // Archived
    if (invoice.archived) {
      const allowed = ['§ #', '§ ESPECES', '¤ TRANSACTION INTROUVABLE'];
      if (!allowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem)))
        return `Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités : ${allowed.map(it => `"${it}"`).join(', ')}`;
      return 'OK';
    }

    // Pas de client
    if (!invoice.thirdparty) return 'choisir un "client"';

    // Les dates doivent toujours être vides
    if (invoice.date || invoice.deadline) return 'les dates doivent être vides';

    // piece id
    if (invoice.thirdparty.id === 113420582) {
      if (!invoice.invoice_number?.startsWith('ID '))
        return 'le champ "Numéro de facture" doit commencer par "ID NOM_DE_LA_PERSONNE"';
      return 'OK';
    }

    // don manuel
    if (![113420582, 103165930].includes(invoice.thirdparty.id))
      return 'les seuls clients autorisés sont "PIECE ID" et "DON MANUEL"';

    // Has transaction attached
    const invoiceDocument = await this.getDocument();
    const groupedDocuments = invoiceDocument.grouped_documents;
    if (
      !groupedDocuments?.some(doc => doc.type === 'Transaction')
      && !invoice.invoice_number.startsWith('¤ ')
    )
      return 'pas de transaction attachée';

    return 'OK';
  }
}
