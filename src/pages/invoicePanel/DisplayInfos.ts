import { openInNewTabIcon } from '../../_/icons.js';
import { $, $$, findElem, getReactProps, getReactPropValue, parseHTML, waitElem, waitFunc } from '../../_/index.js';
import { APIInvoice } from '../../api/Invoice/index.js';
import { APILedgerEvent } from '../../api/LedgerEvent/index.js';
import CacheStatus, { Status } from '../../framework/CacheStatus.js';
import Service from '../../framework/Service.js';
import Tooltip from '../../framework/Tooltip.js';
import ModelFactory from "../../models/Factory.js";
import Invoice from '../../models/Invoice.js';
import { isPage, waitPage } from '../../navigation/waitPage.js';

/** Add infos on Invoice full page display */
export default class InvoiceDisplayInfos extends Service {
  protected static instance: InvoiceDisplayInfos;

  protected readonly storageKey = 'InvoiceValidation';
  protected cache: CacheStatus;
  private state: {
    invoice?: Invoice | null;
    reactInvoice?: APIInvoice;
    events?: APILedgerEvent[];
    cachedStatus?: Status;
  } = {};
  private container: HTMLDivElement;

  static getInstance (): InvoiceDisplayInfos {
    if (!this.instance) this.instance = new this();
    return this.instance;
  }

  async init () {
    await waitPage('invoiceDetail');

    this.tooltipThirdpartyId();
    this.cache = CacheStatus.getInstance(this.storageKey);
    this.cache.on('change', () => this.handleCacheChange());
    this.watchReloadHotkey();
    this.watchEventSave();
    await this.appendContainer();
    setInterval(() => { this.watch(); }, 200);
    document.addEventListener('keydown', event => this.watchHotkey(event));
  }

  async tooltipThirdpartyId () {
    const target = await waitElem<HTMLDivElement>('div[data-testid="thirdpartyAutocompleteAsyncSelect"]');
    let invoice = await waitFunc(() => this.state.invoice?.getInvoice() ?? false);
    const tooltip = Tooltip.make({ target, text: `#${invoice.thirdparty_id}` });
    do {
      await waitFunc(() => {
        return $('div[data-testid="thirdpartyAutocompleteAsyncSelect"]') !== target ||
        this.state.invoice?.id !== invoice.id
      });
      if (this.state.invoice?.id !== invoice.id) {
        invoice = await waitFunc(() => this.state.invoice?.getInvoice() ?? false);
        tooltip.setText(`#${invoice.thirdparty_id}`);
      } else break;
    } while (true);
    this.tooltipThirdpartyId();
  }

  set message (text: string) {
    this.emit('message-change', text);
  }

  set id (text: string) {
    this.emit('id-change', text);
  }

  watchReloadHotkey () {
    document.addEventListener('keydown', event => {
      if (isPage('invoiceDetail') && event.ctrlKey && ['KeyS', 'KeyR'].includes(event.code)) {
        if (event.code === 'KeyR') event.preventDefault();
        this.reload();
        this.debug('reloading from watchReloadHotkey');
      } else {
        this.debug('skip reload hotkey :', {
          "isPage('invoiceDetail')": isPage('invoiceDetail'),
          'event.ctrlKey': event.ctrlKey,
          'event.code (expect "KeyR")': event.code,
        });
      }
    });
  }

  reload () {
    this.state = {};
  }

  async watch () {
    const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');
    const invoice: APIInvoice = getReactPropValue(infos, 'invoice');

    if (!invoice) this.error('Unable to load invoice');

    let reload = false;

    if (this.state.reactInvoice !== invoice || this.state.invoice?.id !== invoice.id) {
      this.state.reactInvoice = invoice;
      this.state.invoice = await ModelFactory.getInvoice(invoice.id);
      reload = true;
    }

    const reactEvents = $$<HTMLFormElement>('form[name^=DocumentEntries-]')
      .reduce<APILedgerEvent[]>((events, form) => {
        events.concat(getReactProps(form.parentElement ,3)?.initialValues?.ledgerEvents ?? []);
        return events;
      }, []);

    if (
      this.state.events?.length !== reactEvents.length
      || reactEvents.some(event => this.state.events?.find(ev => ev.id === event.id) !== event)
    ) {
      this.state.events = reactEvents;
      reload = true;
    }

    if (reload) {
      this.setId();
      this.loadMessage();
    }
  }

  on (eventName: 'message-change', cb: (message: string) => void): this;
  on (eventName: 'id-change', cb: (id: string) => void): this;
  on (eventName, cb) { return super.on(eventName, cb); }

  async appendContainer () {
    if (!this.container) {
      this.container = parseHTML(`<div class="sc-iGgVNO clwwQL d-flex align-items-center gap-1 gm-tag-container">
        <div id="invoice-id" class="d-inline-block bg-secondary-100 dihsuQ px-0_5"></div>
        <div id="is-valid-tag" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">⟳</div>
      </div>`).firstElementChild as HTMLDivElement;

      const messageDiv = $<HTMLDivElement>('#is-valid-tag', this.container)!;
      this.on('message-change', message => { messageDiv.innerHTML = message; });

      const idDiv = $<HTMLDivElement>('#invoice-id', this.container)!;
      this.on('id-change', id => { idDiv.innerHTML = id; });

    }
    const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');
    const tagsContainer = infos.nextSibling;
    if (!tagsContainer) throw new Error('InvoiceDisplayInfos: Impossible de trouver le bloc de tags');
    tagsContainer.insertBefore(this.container, tagsContainer.firstChild);
    waitFunc(
      () => findElem('h4.heading-section-3.mr-2', 'Informations')?.nextSibling !== tagsContainer
    ).then(() => { this.appendContainer(); });
  }

  async loadMessage () {
    this.log('load message', this);
    if (!this.state.invoice) {
      this.message = '⟳';
      return;
    }

    const status = { ...await this.state.invoice.getStatus(), fetchedAt: Date.now() };
    this.state.cachedStatus = status;
    this.cache.updateItem({ id: status.id }, status, false);
    const {message, valid} = status;
    return this.message = valid ? '✓' : `✗ ${message}`;
  }

  async setId () {
    if (!this.state.invoice?.id) {
      this.id = '';
      return;
    }
    this.id = `#${this.state.invoice?.id}<a title="réouvrir cette pièce dans un nouvel onglet" target="_blank" href="${location.href.split('/').slice(0, 5).join('/')}/documents/${this.state.invoice?.id}.html" >${openInNewTabIcon()}</a>`;
  }

  async watchEventSave () {
    const ref = await waitElem('button', 'Enregistrer');
    ref.addEventListener('click', () => { delete this.state.events; });
    waitFunc(() => findElem('button', 'Enregistrer') !== ref)
      .then(() => { this.watchEventSave(); });
  }

  async handleCacheChange () {
    if (!this.state.invoice) return;
    const cachedStatus = this.cache.find({ id: this.state.invoice.id });
    if (!cachedStatus) return;
    const diff = ['message', 'valid'].reduce<object[]>((acc, key) => {
      if (this.state.cachedStatus?.[key] !== cachedStatus?.[key])
        acc.push({ key, oldValue: this.state.cachedStatus?.[key], newValue: cachedStatus?.[key] });
      return acc;
    }, []);
    if (diff.length) {
      this.reload();
      this.log('handleCacheChange', diff);
    }
  }

  watchHotkey (event: KeyboardEvent) {
    if (event.ctrlKey && (event.key === 'c' || event.key === 'C') && !getSelection()?.toString() && this.state.invoice?.id) {
      navigator.clipboard.writeText(this.state.invoice.id.toString());
      this.selectId();
    }
  }

  selectId () {
    const idDiv = $<HTMLDivElement>('#invoice-id', this.container)!;
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) activeElement.blur();
    const textNode = idDiv.firstChild;
    const range = document.createRange();
    range.setStart(textNode!, 1);
    range.setEnd(textNode!, String(this.state.invoice?.id).length + 1);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}
