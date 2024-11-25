import { $, $$, parseHTML } from "../_";
import Service from "../framework/service";

/**
 * Add infos on each entry form block
 */
export default class EntryBlocInfos extends Service {
    private readonly docList = new WeakSet();
    public async init () {
        setInterval(() => { this.findBlocs(); }, 200);
    }

    /**
     * Search for all entry bloc in the page
     */
    private findBlocs () {
        const docs = $$<HTMLFormElement>(`form[name^="DocumentEntries-"]`);
        docs.forEach(doc => {
            if (this.docList.has(doc)) return;
            this.docList.add(doc);
            this.fill(doc);
        });
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
