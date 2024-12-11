import { $, $$, findElem, getReact, getReactProps, parseHTML, waitElem, waitFunc } from "../../_";
import { LedgerEvent, RawInvoice } from "../../api/types";
import CacheStatus, { Status } from "../../framework/CacheStatus";
import Service from "../../framework/service";
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
        <div id="invoice-id" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">#${this.state.invoice?.id}</div>
      </div>`).firstElementChild as HTMLDivElement;
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
    await this.appendContainer();
    const tag = $<HTMLDivElement>('#invoice-id', this.container);
    if (!tag) throw new Error('tag "invoice-id" introuvable');
    tag.innerText = `#${this.state.invoice?.id}`;
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
