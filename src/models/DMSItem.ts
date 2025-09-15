import { $, findElem } from "../_/dom.js";
import { jsonClone } from "../_/json.js";
import { getReactProps } from "../_/react.js";
import { regexPartialMatch } from "../_/regex.js";
import { getParam } from "../_/url.js";
import { dmsToInvoice, getDMSItem, getDMSItemLinks, updateDMSItem } from "../api/dms.js";
import { APIDMSItem } from "../api/DMS/Item.js";
import { APIDMSItemLink } from "../api/DMS/ItemLink.js";
import { APIDMSLink } from "../api/DMS/Link.js";
import { getDocument } from "../api/document.js";
import { findInvoice, updateInvoice } from "../api/invoice.js";
import { APIInvoice } from "../api/Invoice/index.js";
import { getThirdparty } from "../api/thirdparties.js";
import { Status } from "../framework/CacheStatus.js";
import Logger from "../framework/Logger.js";
import Document from "./Document.js";

interface Template {
  title: string;
  text: string;
  regex: RegExp;
}

export type DMSItemStatus = Omit<Status, 'date'>;

export default class DMSItem extends Logger {
  public readonly id: number;
  private item: Promise<APIDMSItem> | APIDMSItem;
  private valid: boolean | null;
  private validMessage: string | null;

  public constructor({ id }: { id: number }) {
    super();
    this.id = id;
    this.valid = null;
    this.validMessage = null;
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
    const regex = /^(?<number>.*?)(?: - (?<date>[0123]\d-[01]\d-\d{4}))?(?: - (?<amount>[\d .]*(?:,\d\d)?) ?€)$/u;
    const match = dmsItem.name.match(regex)?.groups;
    if (!match) {
      this.log('The file name does not match the Invoice Regex', { name: dmsItem.name, regex });
      return;
    }
    const date = match.date && new Date(match.date.split('-').reverse().join('-'));
    const groupedDocs = await this.getLinks();
    const transactionRecord = groupedDocs.find(gdoc => gdoc.record_type === 'BankTransaction');
    const transactionDocument = transactionRecord && await getDocument(transactionRecord.record_id);
    const direction = Number(transactionDocument?.amount) > 0 ? 'customer' : 'supplier';

    this.debug(jsonClone({ start, dmsItem, match: { ...match }, groupedDocs, direction, transactionRecord, transactionDocument, date: date.toLocaleDateString() }));
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

  private async loadValidation () {
    if (this.validMessage === null)
      this.validMessage = await this.getValidMessage();
    this.valid = this.validMessage === 'OK';
  }

  async isValid () {
    if (this.valid === null)
      await this.loadValidation();
    return this.valid!;
  }

  isCurrent () {
    return this.id === Number(getParam(location.href, 'item_id'));
  }

  async fixDateCase () {
    const item = await this.getItem();
    if (!item) return;
    const re = / - (?<date>(?<day>[0123]\d)\/(?<month>0[1-9]|1[0-2])\/(?<year>\d{4})) - /;
    const date = item.name.match(re)?.groups;
    if (!date) return;
    const name = item.name.replace(re, ` - ${date.day}-${date.month}-${date.year} - `);
    const updatedItem = await updateDMSItem({ id: this.id, name });
    const input = $('input[name="name"]') as HTMLInputElement;
    input.value = name;
    const rightList = findElem<HTMLDivElement>('div', 'Nom du Fichier').closest('div.w-100');
    const props = getReactProps(rightList, 7);
    if (props) props.item = updatedItem;
  }

  async getStatus (): Promise<Status> {
    const id = this.id;
    const item = await this.getItem();
    if (!item) return null;
    const valid = await this.isValid();
    const message = await this.getValidMessage();
    const createdAt = new Date(item.created_at).getTime();
    const date = new Date(item.updated_at).getTime();
    return { id, valid, message, createdAt, date };
  }

  private async isPermanent (): Promise<boolean> {
    const item = await this.getItem();
    if (!item) return null;
    return [
      21994019, // 05. Contrats
    ].includes(item.parent_id)
  }

  public async getValidMessage(): Promise<string> {
    const item = await this.getItem();
    if (!item) return null;

    if (item.type === 'dms_folder') return 'OK';
    if (await this.isPermanent()) return "OK";

    const rules = await this.getRules();

    if (getParam(location.href, 'item_id') === this.id.toString(10)) {
      this.log('getValidMessage', { rules, item });
    }

    if (item.archived_at) return 'OK';

    if (this.isCurrent()) this.fixDateCase();

    if (rules) {
      const match = rules.templates.some(template => template.regex.test(item.name));
      if (!match) return rules.message;
    } else {
      const links = await this.getLinks();
      if (!links.length) return 'Ce document n\'est pas lié';
    }

    return 'OK';
  }

  public async getRules(): Promise<{templates: Template[]; message: string; }> {
    const item = await this.getItem();
    if (!item) return null;
    if (item.name.startsWith('RECU') || item.name.startsWith('§')) return null;

    const links = await this.getLinks();
    if (await this.hasClosedLink(links)) return null;

    const transactions = links.filter(link => link.record_type === 'BankTransaction');
    const isCheckRemmitance = transactions
      .some(transaction => transaction.record_name.startsWith('REMISE CHEQUE '));

    if (isCheckRemmitance) {
      const templates: Template[] = [
        {
          title: 'Photo du chèque',
          text: 'CHQ&lt;n° du chèque&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€',
          regex: /^CHQ(?: n°)? ?\d* - .* - [0123]\d-[01]\d-\d{4} - [\d \.]*(?:,\d\d)? ?€(?:\.[a-zA-Z]{3,4})?$/u,
        },
        {
          title: 'Reçu de don',
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€',
          regex: /^CERFA(?: n°)? ?[\d-]* - .* - [0123]\d-[01]\d-\d{4} - [\d .]*(?:,\d\d)? ?€(?:\.[a-zA-Z]{3,4})?$/u,
        }
      ];
      const message = `<a
        title="Le nom des fichiers attachés à une remise de chèque doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED"
      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style="margin:0;padding:0.8em;">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;
      return { templates, message };
    }

    const isEmittedCheck = transactions
      .some(transaction => transaction.record_name.startsWith('CHEQUE '));

    if (isEmittedCheck) {
      const templates = [
        {
          title: 'Talon du chèque',
          text: 'CHQ&lt;numéro du chèque&gt; - &lt;destinataire du chèque&gt; - &lt;montant&gt;€',
          regex: /^CHQ ?\d* - .* - [\d .]*(?:,\d\d)? ?€(?:\.[a-zA-Z]{3,4})?$/u,
        },
        {
          title: 'Reçu de don à une association',
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom bénéficiaire&gt; - jj-mm-aaaa - &lt;montant&gt;€',
          regex: /^CERFA n° ?[\d-]* - .* - [0123]\d-[01]\d-\d{4} - [\d .]*(?:,\d\d)? ?€(?:\.[a-zA-Z]{3,4})?$/u,
        },
        {
          title: 'Reçu d\'octroi d\'aide',
          text: 'AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj-mm-aaaa - &lt;montant&gt;€',
          regex: /^AIDES?\d* - .* - [0123]\d-[01]\d-\d{4} - [\d .]*(?:,\d\d)? ?€(?:\.[a-zA-Z]{3,4})?$/u,
        },
      ];
      const message = `<a
        title="Le nom des fichiers attachés à un paiement par chèque doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED"
      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style="margin:0;padding:0.8em;">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;
      return { templates, message };
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
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€',
          regex: /^CERFA n° ?[\d-]* - .* - [0123]\d-[01]\d-\d{4} - [\d .]*(?:,\d\d)? ?€(?:\.[a-zA-Z]{3,4})?$/u,
        },
      ];
      const message = `<a
        title="Le nom des fichiers attachés à un virement reçu doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED"
      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style="margin:0;padding:0.8em;">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;
      return { templates, message };
    }

    const isEmittedTransfer = transactions.some(transaction => [
      'VIR EUROPEEN EMIS',
      'VIR INSTANTANE EMIS',
    ].some(label => transaction.record_name.includes(label)));

    if (isEmittedTransfer) {
      const templates = [
        {
          title: 'Reçu de don à une association',
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom bénéficiaire&gt; - jj-mm-aaaa - &lt;montant&gt;€',
          regex: /^CERFA n° ?[\d-]* - .* - [0123]\d-[01]\d-\d{4} - [\d .]*(?:,\d\d)? ?€(?:\.[a-zA-Z]{3,4})?$/u,
        },
        {
          title: 'Reçu d\'octroi d\'aide',
          text: 'AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj-mm-aaaa - &lt;montant&gt;€',
          regex: /^AIDES?\d* - .* - [0123]\d-[01]\d-\d{4} - [\d .]*(?:,\d\d)? ?€(?:\.[a-zA-Z]{3,4})?$/u,
        },
      ];
      const message = `<a
        title="Le nom des fichiers attachés à un virement émis doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED"
      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style="margin:0;padding:0.8em;">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;
      return { templates, message };
    }

    return null;
  }

  public async partialMatch(str: string): Promise<[number, number]> {
    if (str.startsWith('RECU')) return [str.length, str.length];
    const rules = await this.getRules();
    return (rules?.templates ?? []).reduce<[number, number]>((pmatch, template) => {
      const templateMatch = regexPartialMatch(str, template.regex);
      const pmatchLength = pmatch[1] - pmatch[0];
      const templateMatchLength = templateMatch[1] - templateMatch[0];
      return pmatchLength > templateMatchLength ? templateMatch : pmatch;
    }, [0, str.length]);
  }

  public async hasClosedLink(links: APIDMSItemLink[]) {
    const closed = await Promise.all(links.map(link => Document.isClosed(link.record_id)))
    return closed.some(closed => closed);
  }
}
