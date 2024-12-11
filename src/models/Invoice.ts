import { getParam } from '../_';
import { getInvoice, updateInvoice } from '../api/invoice.js';
import { RawInvoice, RawInvoiceUpdate } from '../api/types.js';
import ValidableDocument from './ValidableDocument.js';

export default abstract class Invoice extends ValidableDocument {
  public readonly type = 'invoice';
  private invoice: RawInvoice | Promise<RawInvoice>;

  public static from (invoice: RawInvoice) {
    if (invoice.direction === 'supplier') return new SupplierInvoice(invoice);
    return new CustomerInvoice(invoice);
  }

  static async load (id: number) {
    const invoice = await getInvoice(id);
    if (!invoice?.id) {
      console.log('Invoice.load: cannot load this invoice', {id, invoice, _this: this});
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
    const isCurrent = current === this.id;

    const invoice = await this.getInvoice();
    if (!invoice) this.log('SupplierInvoice.loadValidMessage', {invoice});

    const invoiceDocument = await this.getDocument();
    if (invoice.id === current)
      this.log('SupplierInvoice.loadValidMessage', this);

    // Transaction < 2024 => OK
    const groupedDocuments = await this.getGroupedDocuments();
    const transactions = groupedDocuments.filter(doc => doc.type === 'Transaction');
    const currentYear = 2024; //new Date().getFullYear();
    if (
      transactions.length &&
      transactions.every(transaction => parseInt(transaction.date.slice(0, 4)) < currentYear)
    ) {
      if (invoice.id == current) this.log('loadValidMessage', 'année passée');
      return 'OK';
    }

    // Archived
    const archivedAllowed = ['§ #', '¤ PIECE ETRANGERE', '¤ TRANSACTION INTROUVABLE', 'CHQ DÉCHIRÉ'];
    if (invoice.archived) {
      if (
        //legacy :
        !invoice.invoice_number.startsWith('¤ CARTE ETRANGERE') &&

        !archivedAllowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem))
      )
        return `<a
          title="Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e"
        >Facture archivée sans référence ⓘ</a><ul style="margin:0;padding:0.8em;">${archivedAllowed.map(it => `<li>${it}</li>`).join('')}</ul>`;
      if (invoice.id == current) this.log('loadValidMessage', 'archivé avec numéro de facture correct');
      return 'OK';
    }

    // Pas de tiers
    if (!invoice.thirdparty_id && !invoice.thirdparty) {
      if (invoice.invoice_number.startsWith('CHQ DÉCHIRÉ - CHQ')) {
        return `<a
            title="Archiver la facture : ⁝ > Archiver la facture.\nCliquer ici pour plus d'informations"
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu"
          >Archiver le chèque déchiré ⓘ</a></ul>`;
      }
      return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu"
        >Ajouter un fournisseur ⓘ</a><ul style="margin:0;padding:0.8em;"><li>CHQ DÉCHIRÉ - CHQ###</li></ul>`;
    }

    // Pas de compte de charge associé
    const thirdparty = await this.getThirdparty();
    if (!thirdparty.thirdparty_invoice_line_rules?.[0]?.pnl_plan_item) {
      return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu"
        >Fournisseur inconnu ⓘ</a>`;
    }


    // exclude 6288
    if (invoice.invoice_lines?.some(line => line.pnl_plan_item?.number == '6288'))
      return 'compte tiers 6288';

    // CHQ "Taxi"
    if (
      invoice.thirdparty_id === 98348455
      && !invoice.invoice_number.includes('|TAXI|')
    ) {
      return `<a
        title="Le fournisseur 'TAXI' est trop souvent attribué aux chèques par Pennylane.\nSi le fournisseur est réélement 'TAXI' ajouter |TAXI| à la fin du numéro de facture.\nCliquer ici pour plus d'informations"
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20CHQ%20TAXI"
      >Ajouter le fournisseur ⓘ</a><ul style="margin:0;padding:0.8em;"><li>|TAXI|</li><li>CHQ#</li></ul>`;
    }

    // Aides octroyées ou piece d'indentité avec date
    const emptyDateAllowed = ['CHQ'];
    if (
      [106438171, 114270419, 106519227].includes(invoice.thirdparty?.id ?? 0)
      || emptyDateAllowed.some(item => invoice.invoice_number?.startsWith(item))
    ) {
      if (invoice.date || invoice.deadline) return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture"
        >Les dates doivent être vides ⓘ</a>`;
    } else if (!invoice.date) {
      if (!emptyDateAllowed.some(item => invoice.invoice_number?.startsWith(item)))
        return `<a
          title="Cliquer ici pour plus d'informations"
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture"
        >Date de facture vide ⓘ</a><ul style="margin:0;padding:0.8em;">${emptyDateAllowed.map(it => `<li>${it}</li>`).join('')}</ul>`;
    }

    // Aides octroyées avec mauvais ID
    if (invoice.thirdparty?.name === "AIDES OCTROYÉES" && invoice.thirdparty.id !== 106438171)
      return 'Il ne doit y avoir qu\'un seul compte "AIDES OCTROYÉES", et ce n\'est pas le bon...';

    // Piece d'identité avec mauvais ID
    if (invoice.thirdparty?.name === "PIECE ID" && invoice.thirdparty.id !== 106519227)
      return 'Il ne doit y avoir qu\'un seul compte "PIECE ID", et ce n\'est pas le bon...';

    const ledgerEvents = await this.getLedgerEvents();

    // Ecarts de conversion de devise
    if (invoice.currency !== 'EUR') {
      const diffLine = ledgerEvents.find(line => line.planItem.number === '4716001');
      this.log({ledgerEvents, diffLine});
      if (diffLine) {
        if (parseFloat(diffLine.amount) < 0)
          return 'Les écarts de conversions de devises doivent utiliser le compte 756';
        else {
          return `<a
            title="Cliquer ici pour plus d'informations"
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FLes%20%C3%A9carts%20de%20conversions%20de%20devises%20doivent%20utiliser%20le%20compte%20656"
          >Les écarts de conversions de devises doivent utiliser le compte 656 ⓘ</a>`;
        }
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
    if (!transactions.length) {
      const orphanAllowed = ['¤ TRANSACTION INTROUVABLE'];
      if (!orphanAllowed.some(label => invoice.invoice_number.startsWith(label))) {
        const archiveLabel = archivedAllowed.find(label => invoice.invoice_number.startsWith(label));
        if (archiveLabel) {
          return `<a
            title="Archiver la facture : ⁝ > Archiver la facture.\nCliquer ici pour plus d'informations"
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e"
          >Archiver ${archiveLabel} ⓘ</a><ul style="margin:0;padding:0.8em;">`;
        }
        return `<a
            title="Cliquer ici pour plus d'informations"
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e"
          >Pas de transaction attachée ⓘ</a><ul style="margin:0;padding:0.8em;">${orphanAllowed.concat(archivedAllowed).map(it => `<li>${it}</li>`).join('')}</ul>`;
      }
    }


    return 'OK';
  }
}

class CustomerInvoice extends Invoice {
  public readonly direction = 'customer';

  async loadValidMessage () {
    const invoice = await this.getInvoice();
    this.log('loadValidMessage', { invoice });
    // Archived
    if (invoice.archived) {
      const allowed = ['§ #', '¤ TRANSACTION INTROUVABLE'];
      if (
        //legacy
        !invoice.invoice_number.startsWith('§ ESPECES') &&

        !allowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem))
      )
        return `<a
          title="Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e"
        >Facture archivée sans référence ⓘ</a><ul style="margin:0;padding:0.8em;">${allowed.map(it => `<li>${it}</li>`).join('')}</ul>`;
      return 'OK';
    }

    // Pas de client
    if (!invoice.thirdparty) return 'choisir un "client"';

    // don manuel
    if (![113420582, 103165930].includes(invoice.thirdparty.id))
      return 'les seuls clients autorisés sont "PIECE ID" et "DON MANUEL"';

    // piece id
    if (invoice.thirdparty.id === 113420582) {
      if (!invoice.invoice_number?.startsWith('ID '))
        return 'le champ "Numéro de facture" doit commencer par "ID NOM_DE_LA_PERSONNE"';
      return 'OK';
    }

    // Montant
    if (invoice.amount === '0.0') return `<a
      title="Cliquer ici pour plus d'informations."
      href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client"
    >Ajouter le montant ⓘ</a>`;

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

    // Les dates doivent toujours être vides
    if (invoice.date || invoice.deadline) return `<a
      title="Les dates des pièces orientées client doivent toujours être vides. Cliquer ici pour plus d'informations"
      href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client"
    >Les dates doivent être vides ⓘ</a>`;

    return 'OK';
  }
}
