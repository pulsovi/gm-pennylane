import { $, $$, findElem, getReactProps, parseHTML, waitElem, waitFunc } from "../../_"
import Service from "../../framework/service"

export default class AddInvoiceIdColumn extends Service {
  protected readonly name = this.constructor.name;

  async init () {
    await Promise.race([
      waitElem('h3', 'Factures fournisseurs'),
    ]);
    const anchor = await waitElem('.tiny-caption', 'Statut');
    const to = setTimeout(() => this.fill(anchor), 1000);
    await waitFunc(() => findElem('.tiny-caption', 'Statut') !== anchor);
    clearTimeout(to);
    this.init();
  }

  fill (anchor: Element) {
    const table = <HTMLTableElement>anchor.closest('table');
    this.log("fill", table);
    const headRow = $<HTMLTableRowElement>('thead tr', table);
    $('th.id-column', headRow)?.remove();
    headRow?.insertBefore(parseHTML(`<th class="id-column th-element border-top-0 border-bottom-0 box-shadow-bottom-secondary-200 align-middle p-1 text-secondary-700 font-size-075 text-nowrap is-pinned">
      <div class="sc-ivxoEo dLrrKG d-flex flex-row sc-eSclpK dSYLCv">
        <span class="tiny-caption font-weight-bold">ID</span>
      </div>
    </th>`), $('th+th', headRow));
    const bodyRows = $$<HTMLTableRowElement>('tbody tr', table);
    this.log({ bodyRows });
    bodyRows.forEach(row => {
      const id: number = getReactProps(row, 1).data.id;
      $('.id-column', row)?.remove();
      row.insertBefore(
        parseHTML(`<td style="cursor: auto;" class="id-column px-1 py-0_5 align-middle border-top-0 box-shadow-bottom-secondary-100">
          <span class="d-inline-block bg-secondary-100 dihsuQ px-0_5">#${id}</span>
        </td>`),
        $('td+td', row)
      );
      $('.id-column', row)?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
    });
  }
}
