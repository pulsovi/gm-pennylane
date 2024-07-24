import { getParam } from '../_';
import { getInvoice, updateInvoice } from '../api/invoice.js';
import { RawInvoice, RawInvoiceUpdate } from '../api/types.js';
import ValidableDocument from './ValidableDocument.js';

export default abstract class Invoice extends ValidableDocument {
  public readonly type = 'invoice';
  public invoice: RawInvoice | Promise<RawInvoice>;

  protected constructor (invoice: RawInvoice) {
    super(invoice);
    this.getInvoice();
  }

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
    const current = Number(getParam(location.href, 'id'));
    if (invoice.id === current)
      console.log('SupplierInvoice.loadValidMessage', { invoice, invoiceDocument });

    const transactions = invoiceDocument.grouped_documents.filter(doc => doc.type === 'Transaction');
    if (transactions.length && transactions.every(transaction => transaction.date.startsWith('2024'))) {
      if (invoice.id == current) console.log('transactions 2024');
      return 'OK';
    }

    // Archived
    if (invoice.archived) {
      return 'OK';
      const allowed = ['§ #', '§ CARTE ETRANGERE', '¤ TRANSACTION INTROUVABLE'];
      if (!allowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem)))
        return `Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités : ${allowed.map(it => `"${it}"`).join(', ')}`;
      return 'OK';
    }

    // exclude 6288
    if (invoice.invoice_lines?.some(line => line.pnl_plan_item?.number == '6288'))
      return 'compte tiers 6288';

    // Known orphan invoice
    if (invoice.invoice_number?.startsWith('¤')) {
      if (invoice.id == current) console.log('¤');
      return 'OK';
    }

    // Aides octroyées avec date
    if ([106438171, 114270419].includes(invoice.thirdparty?.id ?? 0)) {
      if (invoice.date || invoice.deadline) return 'Les dates doivent être vides';
    }

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
          return 'Les écarts de conversions de devises doivent utiliser le compte 477';
        else
          return 'Les écarts de conversions de devises doivent utiliser le compte 476';
      }
    }

    // Stripe fees invoice
    if (invoice.thirdparty?.id === 115640202) return 'OK';

    // ID card
    if (invoice.thirdparty?.id === 106519227 && invoice.invoice_number?.startsWith('ID ')) return 'OK';

    // Has transaction attached
    const groupedDocuments = invoiceDocument.grouped_documents;
    if (!groupedDocuments?.some(doc => doc.type === 'Transaction'))
      return 'pas de transaction attachée';

    return 'OK';
  }
}

class CustomerInvoice extends Invoice {
  public readonly direction = 'customer';

  async loadValidMessage () {
    if (!this.invoice.thirdparty) return 'choisir un "client"';
    if (this.invoice.date || this.invoice.deadline) return 'les dates doivent être vides';

    // don manuel
    if (this.invoice.thirdparty.id === 103165930) return 'OK';

    // piece id
    if (this.invoice.thirdparty.id === 113420582) {
      if (!this.invoice.invoice_number?.startsWith('ID '))
        return 'le champ "Numéro de facture" doit commencer par "ID NOM_DE_LA_PERSONNE"';
      return 'OK';
    }

    return 'les seuls clients autorisés sont "PIECE ID" et "DON MANUEL"';
  }
}
