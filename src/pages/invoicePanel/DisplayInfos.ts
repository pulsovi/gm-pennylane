import { $, $$, findElem, getReactProps, parseHTML, waitElem, waitFunc } from "../../_";
import { APILedgerEvent, APIInvoice } from "../../api/types";
import CacheStatus, { Status } from "../../framework/CacheStatus";
import Service from "../../framework/Service";
import Invoice from "../../models/Invoice";
import { isPage, waitPage } from "../../navigation/waitPage";

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

    this.cache = CacheStatus.getInstance(this.storageKey);
    this.cache.on('change', () => this.handleCacheChange());
    this.watchReloadHotkey();
    this.watchEventSave();
    await this.appendContainer();
    setInterval(() => { this.watch(); }, 200);
  }

  set message (text: string) {
    this.emit('message-change', text);
  }

  set id (text: string) {
    this.emit('id-change', text);
  }

  watchReloadHotkey () {
    document.addEventListener('keydown', event => {
      if (isPage('invoiceDetail') && event.ctrlKey && event.code === 'KeyR') {
        event.preventDefault();
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
    const invoice: APIInvoice = getReactProps(infos, 28).invoice;

    let reload = false;

    if (this.state.reactInvoice !== invoice) {
      this.state.reactInvoice = invoice;
      this.state.invoice = await Invoice.load(invoice.id);
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
        <div id="is-valid-tag" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">⟳</div>
        <div id="invoice-id" class="d-inline-block bg-secondary-100 dihsuQ px-0_5"></div>
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
    this.id = `#${this.state.invoice?.id}<a title="réouvrir cette pièce dans un nouvel onglet" target="_blank" href="${location.href.split('/').slice(0, 5).join('/')}/documents/${this.state.invoice?.id}.html" ><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0_5 css-q7mezt" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="OpenInNewRoundedIcon" style="font-size: 1rem;"><path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1M14 4c0 .55.45 1 1 1h2.59l-9.13 9.13c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1"></path></svg></a>`;
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
}
