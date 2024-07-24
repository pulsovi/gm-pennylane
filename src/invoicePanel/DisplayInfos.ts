import { $, $$, findElem, getReact, getReactProps, parseHTML, sleep, upElement, waitElem, waitFunc } from "../_";
import { LedgerEvent } from "../api/types";
import Service from "../framework/service";
import Invoice from "../models/Invoice";

/** Add infos on Invoice full page display */
export default class InvoiceDisplayInfos extends Service {
  private invoice: Invoice;
  private events?: any;
  async init () {
    await waitElem('h4', 'Ventilation');
    while (await waitFunc(async () => !await this.isSync())) {
      await this.loadMessage();
    }
  }

  async isSync () {
    const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');
    const {invoice} = getReact(infos, 32).memoizedProps;

    const ledgerEvents = $$<HTMLFormElement>('form[name^=DocumentEntries-]')
      .reduce<LedgerEvent[]>((events, form) => {
        events.concat(getReactProps(form.parentElement ,3)?.initialValues.ledgerEvents);
        return events;
      }, []);

    if ((await this.invoice?.getInvoice()) !== invoice || ledgerEvents.some((event, id) => this.events[id] !== event)) {
      const logData = { oldInvoice: this.invoice, oldEvents: this.events };
      this.invoice = Invoice.from(invoice);
      this.events = ledgerEvents;
      console.log(this.constructor.name, 'desynchronisé', { ...logData, ...this });
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
