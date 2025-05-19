import { injectCSS } from '../../_/css.js';
import { $, findElem, waitElem } from '../../_/dom.js';
import { waitFunc } from '../../_/time.js';
import Service from '../../framework/Service.js';

export default class TransactionPannelStyle extends Service {
  async init() {
    this.hideOldDateBanner();
    this.fixAccountNumbersOweflow();
    this.fixMatchSuggestionTextOverlap();
    this.expandDMSNameInputField();
  }

  private async hideOldDateBanner() {
    const ref = await waitElem<HTMLSpanElement>('span', 'Vous êtes en train de visualiser un exercice antérieur à l’exercice courant.');
    const banner = ref.closest<HTMLDivElement>('main>div>div.d-block');
    this.log({ ref, banner });
    if (banner) {
      banner.style.height = '0';
      banner.style.overflow = 'hidden';
      const column = $<HTMLDivElement>('.panel-opened>.flex-column');
      if (column) column.style.top = '40px';
    }
    await waitFunc(() => findElem('span', 'Vous êtes en train de visualiser un exercice antérieur à l’exercice courant.') !== ref);
    this.hideOldDateBanner();
  }

  private fixAccountNumbersOweflow() {
    injectCSS(`
      html body .ui-transition-collapse.ui-transition-collapse {
        overflow: unset;
      }
    `);
  }

  /**
   * Corrige l'affichage des factures suggérées dans le détail d'une transaction
   */
  private fixMatchSuggestionTextOverlap() {
    injectCSS(`
      .ui-card.border-automation-500 .flex-column .text-right {
        margin-top: 1.2em;
      }
    `);
  }

  /**
   * Augmente la taille du champ "nom" des fichiers de la GED
   */
  private expandDMSNameInputField() {
    injectCSS(`
      form[name="DocumentNameForm"] > div.d-flex {
        flex-direction: column;
        gap: 0.5em;
      }

      form[name="DocumentNameForm"] > div.d-flex > div {
        margin-left: 0 !important;
      }
    `);
  }
}
