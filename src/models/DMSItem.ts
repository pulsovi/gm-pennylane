import { jsonClone } from "../_/json.js";
import { dmsToInvoice, getDMSItem, getDMSItemLinks } from "../api/dms.js";
import { APIDMSItem } from "../api/DMS/Item.js";
import { getDocument } from "../api/document.js";
import { findInvoice, getInvoicesList, updateInvoice } from "../api/invoice.js";
import { APIInvoice } from "../api/Invoice/index.js";
import { getLedgerEvents } from "../api/operation.js";
import { getThirdparty } from "../api/thirdparties.js";
import Logger from "../framework/Logger.js";
import { openDocument } from "../navigation/openDocument.js";

export default class DMSItem extends Logger {
  public readonly id: number;
  private item: Promise<APIDMSItem> | APIDMSItem;

  public constructor({ id }: { id: number }) {
    super();
    this.id = id;
  }

  public async getLinks() {
    const fileId = (await this.getItem())?.itemable_id;
    if (!fileId) return [];
    return await getDMSItemLinks(fileId);
  }

  public async getItem() {
    if (!this.item) {
      this.item = getDMSItem(this.id);
      this.item = await this.item;
    }
    return await this.item;
  }

  public async toInvoice() {
    const start = new Date().toISOString();
    const dmsItem = await this.getItem();
    const regex = /^(?<number>.*?)(?: - (?<date>[0123]\d\/[01]\d\/\d{4}))?(?: - (?<amount>[\d .]*(?:,\d\d)?) ?€)$/u;
    const match = dmsItem.name.match(regex)?.groups;
    const date = match.date && new Date(match.date.split('/').reverse().join('-'));
    const groupedDocs = await this.getLinks();
    const transactionRecord = groupedDocs.find(gdoc => gdoc.record_type === 'BankTransaction');
    const transactionDocument = transactionRecord && await getDocument(transactionRecord.record_id);
    const direction = Number(transactionDocument?.amount) > 0 ? 'customer' : 'supplier';

    this.debug(jsonClone({start, dmsItem, match: { ...match }, groupedDocs, direction, transactionRecord, transactionDocument, date: date.toLocaleDateString() }));
    if (!match) {
      this.log('toInvoice: Unable to parse invoice infos');
    }

    if (!transactionDocument) {
      this.log('toInvoice : Unable to determine direction');
      return;
    }

    const dmsToInvoiceResponse = await dmsToInvoice(dmsItem.signed_id, direction);

    const invoice = await findInvoice(
      () => true,
      { direction, filter: [{ field: 'created_at', operator: 'gteq', value: start }] }
    );
    const line = {};
    const data: Partial<APIInvoice> = {
      invoice_number: match.number,
      validation_needed: false,
      incomplete: false,
      is_waiting_for_ocr: false,
    };
    if (match.date) Object.assign(data, { date: match.date, deadline: match.date });
    if (match.amount) Object.assign(line, {
      currency_amount: parseFloat(match.amount),
      currency_price_before_tax: parseFloat(match.amount),
      currency_tax: 0,
      vat_rate: "exempt"
    });
    if (transactionDocument?.thirdparty_id) {
      const thirdparty = (await getThirdparty(transactionDocument.thirdparty_id)).thirdparty;
      Object.assign(data, { thirdparty_id: transactionDocument.thirdparty_id });
      Object.assign(line, { pnl_plan_item_id: thirdparty.thirdparty_invoice_line_rules[0]?.pnl_plan_item });
    }
    Object.assign(data, { invoice_lines_attributes: [line] });
    const updateInvoiceResponse = await updateInvoice(invoice.id, data);
    this.log({ dmsToInvoiceResponse, updateInvoiceResponse, invoice, data });
    return invoice;
  }

  public async getValidMessage(): Promise<string> {
    const item = await this.getItem();
    if (item.name.startsWith('RECU')) return 'OK';

    const links = await this.getLinks();

    const transactions = links.filter(link => link.record_type === 'BankTransaction');
    const isCheckRemmitance = transactions
      .some(transaction => transaction.record_name.startsWith('REMISE CHEQUE '));

    if (isCheckRemmitance) {
      const templates = [
        {
          title: 'Photo du chèque',
          text: 'CHQ&lt;n° du chèque&gt; - &lt;nom donateur&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^CHQ ?\d* - .* - [0123]\d\/[01]\d\/\d{4} - [\d \.]*(?:,\d\d)? ?€$/u,
        },
        {
          title: 'Reçu de don',
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^CERFA n° ?[\d-]* - .* - [0123]\d\/[01]\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
        }
      ];
      const match = templates.some(template => template.regex.test(item.name));
      if (!match) {
        return `<a
          title="Le nom des fichiers attachés à une remise de chèque doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED"
        >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style="margin:0;padding:0.8em;">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;
      }
    }

    const isEmittedCheck = transactions
      .some(transaction => transaction.record_name.startsWith('CHEQUE '));

    if (isEmittedCheck) {
      const templates = [
        {
          title: 'Talon du chèque',
          text: 'CHQ&lt;numéro du chèque&gt; - &lt;destinataire du chèque&gt; - &lt;montant&gt;€',
          regex: /^CHQ ?\d* - .* - [\d .]*(?:,\d\d)? ?€$/u,
        },
        {
          title: 'Reçu de don à une association',
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom bénéficiaire&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^CERFA n° ?[\d-]* - .* - [0123]\d\/[01]\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
        },
        {
          title: 'Reçu d\'octroi d\'aide',
          text: 'AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^AIDES?\d* - .* - [0123]\d\/[01]\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
        },
      ];
      const match = templates.some(template => template.regex.test(item.name));
      if (!match) {
        return `<a
          title="Le nom des fichiers attachés à un paiement par chèque doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED"
        >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style="margin:0;padding:0.8em;">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;
      }
    }

    const isReceivedTransfer = transactions.some(transaction => [
      'VIR INST RE',
      'VIR RECU',
      'VIR INSTANTANE RECU DE:',
    ].some(label => transaction.record_name.startsWith(label)));

    if (isReceivedTransfer) {
      const templates = [
        {
          title: 'Reçu de don',
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^CERFA n° ?[\d-]* - .* - [0123]\d\/[01]\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
        },
      ];
      const match = templates.some(template => template.regex.test(item.name));
      if (!match) {
        return `<a
          title="Le nom des fichiers attachés à un virement reçu doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED"
        >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style="margin:0;padding:0.8em;">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;
      }
    }

    const isEmittedTransfer = transactions.some(transaction => [
      'VIR EUROPEEN EMIS',
      'VIR INSTANTANE EMIS',
    ].some(label => transaction.record_name.includes(label)));

    if (isEmittedTransfer) {
      const templates = [
        {
          title: 'Reçu de don à une association',
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom bénéficiaire&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^CERFA n° ?[\d-]* - .* - [0123]\d\/[01]\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
        },
        {
          title: 'Reçu d\'octroi d\'aide',
          text: 'AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^AIDES?\d* - .* - [0123]\d\/[01]\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
        },
      ];
      const match = templates.some(template => template.regex.test(item.name));
      if (!match) {
        return `<a
          title="Le nom des fichiers attachés à un virement émis doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED"
        >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style="margin:0;padding:0.8em;">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;
      }
    }

    return 'OK';
  }
}
