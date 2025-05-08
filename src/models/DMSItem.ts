import { getDMSItem, getDMSItemLinks } from "../api/dms.js";
import { APIDMSItem } from "../api/DMS/Item.js";
import Logger from "../framework/Logger.js";

export default class
DMSItem extends Logger {
  public readonly id: number;
  private item: Promise<APIDMSItem> | APIDMSItem;

  public constructor ({id}: {id: number}) {
    super();
    this.id = id;
  }

  public async getLinks () {
    const fileId = (await this.getItem())?.itemable_id;
    if (!fileId) return [];
    return await getDMSItemLinks(fileId);
  }

  public async getItem () {
    if (!this.item) {
      this.item = getDMSItem(this.id);
      this.item = await this.item;
    }
    return await this.item;
  }

  public async getValidMessage (): Promise<string> {
    const item = await this.getItem();
    const links = await this.getLinks();

    const transactions = links.filter(link => link.record_type === 'BankTransaction');
    const isCheckRemmitance = transactions
      .some(transaction => transaction.record_name.startsWith('REMISE CHEQUE '));

    if (isCheckRemmitance) {
      const templates = [
        {
          title: 'Photo du chèque',
          text: 'CHQ&lt;n° du chèque&gt; - &lt;nom donateur&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^CHQ ?\d* - .* - [01]\d\/\d\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
        },
        {
          title: 'Reçu de don',
          text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^CERFA n° ?\d* - .* - [01]\d\/\d\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
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
          regex: /^CERFA n° ?\d* - .* - [01]\d\/\d\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
        },
        {
          title: 'Reçu d\'octroi d\'aide',
          text: 'AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj/mm/aaa - &lt;montant&gt;€',
          regex: /^AIDES?\d* - .* - [01]\d\/\d\d\/\d{4} - [\d .]*(?:,\d\d)? ?€$/u,
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

    return 'OK';
  }
}
