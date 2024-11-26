import { $, $$, parseHTML, waitElem } from "../_";
import Service from "../framework/service";

/**
 * Add infos on each entry form block
 */
export default class EntryBlocInfos extends Service {
  public async init () {
    const className = `${this.constructor.name}-managed`;
    const selector = `form[name^="DocumentEntries-"]:not(.${className})`;
    while (true) {
      const doc = await waitElem<HTMLFormElement>(selector);
      doc.classList.add(className);
      this.fill(doc);
    }
  }

  /**
   * Add infos on an entry bloc
   */
  private fill (form: HTMLFormElement) {
    const id = form.getAttribute('name')?.split('-').pop();
    const header = $('header', form);
    if (!header) return;
    const className = header.firstElementChild?.className ?? '';
    header.insertBefore(parseHTML(`<div class="${className}">
      <span class="d-inline-block bg-secondary-100 dihsuQ px-0_5">#${id}</span>
    </div>`), $('.border-bottom', header));
  }
}
