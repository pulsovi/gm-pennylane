import { $, $$, findElem, getReact, getReactProps, parseHTML, waitElem, waitFunc } from "../../_";
import { LedgerEvent, RawInvoice } from "../../api/types";
import CacheStatus, { Status } from "../../framework/CacheStatus";
import Service from "../../framework/Service";
import Invoice from "../../models/Invoice";

/** Add infos on Invoice full page display */
export default class InvoiceDisplayInfos extends Service {
  protected static instance: InvoiceDisplayInfos;

  protected readonly storageKey = 'InvoiceValidation';
  protected cache: CacheStatus;
  private state: {
    invoice?: Invoice | null;
    reactInvoice?: RawInvoice;
    events?: LedgerEvent[];
    cachedStatus?: Status;
  } = {};
  private container: HTMLDivElement;

  static getInstance (): InvoiceDisplayInfos {
    if (!this.instance) this.instance = new this();
    return this.instance;
  }

  async init () {
    await waitElem('h4', 'Ventilation');

    this.cache = CacheStatus.getInstance(this.storageKey);
    this.watch();
  }

  async watch () {
    this.watchEventSave();
    this.cache.on('change', () => this.handleCacheChange());

    while (await waitFunc(async () => !await this.isSync())) {
      await this.setId();
      await this.setMessage('⟳');
      await this.loadMessage();
    }
  }

  reload () {
    this.state = {};
  }

  async isSync () {
    const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');
    const invoice: RawInvoice = getReact(infos, 32).memoizedProps.invoice;

    if (this.state.reactInvoice !== invoice) {
      this.state.reactInvoice = invoice;
      this.state.invoice = await Invoice.load(invoice.id);
      return false;
    }

    const ledgerEvents = $$<HTMLFormElement>('form[name^=DocumentEntries-]')
      .reduce<LedgerEvent[]>((events, form) => {
        events.concat(getReactProps(form.parentElement ,3)?.initialValues.ledgerEvents);
        return events;
      }, []);

    if (
      this.state.events?.length !== ledgerEvents.length
      || ledgerEvents.some(event => this.state.events?.find(ev => ev.id === event.id) !== event)
    ) {
      this.state.events = ledgerEvents;
      return false;
    }

    return true;
  }

  async appendContainer () {
    if (!this.container) {
      this.container = parseHTML(`<div class="sc-iGgVNO clwwQL d-flex align-items-center gap-1 gm-tag-container">
        <div id="is-valid-tag" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">⟳</div>
        <div id="invoice-id" class="d-inline-block bg-secondary-100 dihsuQ px-0_5"></div>
      </div>`).firstElementChild as HTMLDivElement;
      this.setId();
    }
    const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');
    const tagsContainer = infos.nextSibling;
    if (!tagsContainer) throw new Error('InvoiceDisplayInfos: Impossible de trouver le bloc de tags');
    tagsContainer.insertBefore(this.container, tagsContainer.firstChild);
  }

  async loadMessage () {
    this.log('load message', this);
    if (!this.state.invoice) return this.setMessage('⟳');
    const status = { ...await this.state.invoice.getStatus(), fetchedAt: Date.now() };
    this.state.cachedStatus = status;
    this.cache.updateItem({ id: status.id }, status);
    const {message, valid} = status;
    return this.setMessage(valid ? '✓' : '✗ '+message);
  }

  async setId () {
    if (!this.container) await this.appendContainer();
    const tag = $<HTMLDivElement>('#invoice-id', this.container);
    if (!tag) throw new Error('tag "invoice-id" introuvable');
    tag.innerHTML = `#${this.state.invoice?.id}<a title="réouvrir cette pièce dans un nouvel onglet" target="_blank" href="${location.href.split('/').slice(0, 5).join('/')}/documents/${this.state.invoice?.id}.html" ><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0_5 css-q7mezt" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="OpenInNewRoundedIcon" style="font-size: 1rem;"><path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1M14 4c0 .55.45 1 1 1h2.59l-9.13 9.13c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1"></path></svg></a>`;
  }

  async setMessage (message: string) {
    await this.appendContainer();
    const tag = $('#is-valid-tag', this.container);
    if (!tag) throw new Error('tag "is-valid-tag" introuvable');
    tag.innerHTML = message;
  }

  async watchEventSave () {
    const ref = await waitElem('button', 'Enregistrer');
    ref.addEventListener('click', () => this.reload());
    await waitFunc(() => findElem('button', 'Enregistrer') !== ref);
    this.watchEventSave();
  }

  async handleCacheChange () {
    if (!this.state.invoice) return;
    const cachedStatus = this.cache.find({ id: this.state.invoice.id });
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
