import { $, $$, findElem, getReact, getReactProps, parseHTML, sleep, upElement, waitElem, waitFunc } from "../../_";
import { LedgerEvent } from "../../api/types";
import Service from "../../framework/service";
import Invoice from "../../models/Invoice";

/** Add infos on Invoice full page display */
export default class InvoiceDisplayInfos extends Service {
  private invoice: Invoice;
  private state: Record<string, unknown> = {};
  protected static instance: InvoiceDisplayInfos

  static getInstance (): InvoiceDisplayInfos {
    return this.instance;
  }

  async init () {
    await waitElem('h4', 'Ventilation');
    console.log('GreaseMonkey - Pennylane', 'Invoice panel');
    while (await waitFunc(async () => !await this.isSync())) {
      await this.loadMessage();
    }
  }

  reload () {
    this.state = {};
  }

  async isSync () {
    const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');
    const {invoice} = getReact(infos, 32).memoizedProps;

    if (this.state.invoice !== invoice) {
      this.state.lastInvoice = this.state.invoice;
      this.state.invoice = invoice;
      this.invoice = Invoice.from(invoice);
      console.log(this.constructor.name, 'désynchronisé', { ...this.state });
      return false;
    }

    const ledgerEvents = $$<HTMLFormElement>('form[name^=DocumentEntries-]')
      .reduce<LedgerEvent[]>((events, form) => {
        events.concat(getReactProps(form.parentElement ,3)?.initialValues.ledgerEvents);
        return events;
      }, []);

    if (ledgerEvents.some((event, id) => this.state.events?.[id] !== event)) {
      this.state.lastEvents = ledgerEvents;
      this.state.events = ledgerEvents;
      console.log(this.constructor.name, 'desynchronisé', { ...this.state });
      return false;
    }

    return true;
  }

  async createTagContainer () {
    const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');
    const tagsContainer = infos.nextSibling;
    if (!tagsContainer) throw new Error('InvoiceDisplayInfos: Impossible de trouver le bloc de tags');
    tagsContainer.insertBefore(
      parseHTML(`<div class="sc-iGgVNO clwwQL d-flex align-items-center gap-1 gm-tag-container">
        <div id="is-valid-tag" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">⟳</div>
        <div id="invoice-id" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">#${this.invoice.id}</div>
      </div>`),
      tagsContainer.firstChild
    );
  }

  async loadMessage () {
    console.log('load message', this);
    if (!$('#is-valid-tag')) await this.createTagContainer();
    const tag = $('#is-valid-tag');
    if (!tag) throw new Error('tag "is-valid-tag" introuvable');
    const {message, valid} = await this.invoice.getStatus();
    tag.textContent = valid ? '✓' : '✗ '+message;
  }
}
