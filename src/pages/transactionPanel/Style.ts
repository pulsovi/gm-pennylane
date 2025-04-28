import { $, findElem, waitElem } from '../../_/dom.js';
import { waitFunc } from '../../_/time.js';
import Service from '../../framework/Service.js';

export default class TransactionPannelStyle extends Service {
  async init () {
    this.hideOldDateBanner();
  }

  private async hideOldDateBanner () {
    const ref = await waitElem<HTMLSpanElement>('span', 'Vous êtes en train de visualiser un exercice antérieur à l’exercice courant.');
    const banner = ref.closest<HTMLDivElement>('main>div>div.d-block');
    this.log({ref, banner});
    if (banner) {
      banner.style.height = '0';
      banner.style.overflow = 'hidden';
      const column = $<HTMLDivElement>('.panel-opened>.flex-column');
      if (column) column.style.top = '40px';
    }
    await waitFunc(() => findElem('span', 'Vous êtes en train de visualiser un exercice antérieur à l’exercice courant.') !== ref);
    this.hideOldDateBanner();
  }
}
