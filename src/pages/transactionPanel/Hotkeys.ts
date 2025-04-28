import { $, $$, findElem, getReactProps, waitElem, waitFunc } from '../../_/index.js';
import Service from '../../framework/Service.js';

export default class TransactionPanelHotkeys extends Service {
  async init () {
    document.addEventListener('keydown', event => this.handleKeydown(event));
  }

  private async handleKeydown (event: KeyboardEvent) {
    if (!findElem('h3', 'Transactions')) return;                    // Transactions panel
    this.debug('handleKeydown', event);
    if (event.altKey) {
      switch (event.code) {
      case 'KeyE': return this.filterClick('button.ui-filters-button--size-sm.ui-filters-button:nth-of-type(3)', event);
      case 'KeyD': return this.filterClick('Date', event);
      }
    }
    if (event.ctrlKey) {
      switch (event.code) {
      case 'KeyS': return this.save();
      }
    }
    else switch (event.code) {
    case 'NumpadEnter':
    case 'Enter':
      return this.manageEnter(event);
    }
  }

  private async filterClick (selector: string, event: KeyboardEvent) {
    event.preventDefault();
    const filterButton = $<HTMLButtonElement>(selector)
    if (!filterButton) this.log(`bouton "${selector}" introuvable`);

    if (event.shiftKey) {
      $<HTMLDivElement>('div[aria-label=Effacer]', filterButton)?.click();
      return;
    }

    filterButton?.click();

    const inputContainerId = filterButton.getAttribute('aria-controls');
    const inputField = await waitElem<HTMLInputElement>(`div[id="${inputContainerId}"] input`, '', 2000);
    if (!inputField) this.log(`champ "div[id="${inputContainerId}"] input" introuvable`);
    inputField?.focus();
  }

  private async manageEnter (event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement && event.target.getAttribute('aria-label') === 'Date') {
      if (/\d\d\/\d\d\/\d\d\d\d - __\/__\/____/u.test(event.target.value)) {
        const date = event.target.value.slice(0, 10);
        event.target.value = `${date} - ${date}`;
        getReactProps(event.target).onChange({target: event.target});
        const validButton = $<HTMLButtonElement>('button[data-tracking-action="Transactions Page - Date Filter click"]');
        await waitFunc(() => !validButton?.disabled);
      }
      return $<HTMLButtonElement>('button[data-tracking-action="Transactions Page - Date Filter click"]')?.click();
    }
  }

  private save() {
    this.saveLedgerEvents();
    this.confirmRules();
  }

  private saveLedgerEvents () {
    this.log('saveLedgerEvents()');
    findElem<HTMLButtonElement>('button', 'Enregistrer')?.click();
  }

  private confirmRules () {
    this.log('confirmRules()');
    findElem<HTMLButtonElement>('button', 'Confirmer')?.click();
  }
}
