import { $, $$, parseHTML } from "../../_/dom.js";
import { getReactProps } from "../../_/react.js";
import { sleep, waitFunc } from "../../_/time.js";
import { APIDMSLink } from "../../api/DMS/Link.js";
import Service from "../../framework/Service.js";
import DMSItem from "../../models/DMSItem.js";
import ModelFactory from "../../models/Factory.js";
import { waitPage } from "../../navigation/waitPage.js";

/**
 * @unreleased
 */
export default class PreviewDMSFiles extends Service {
  async init() {
    await waitPage("transactionDetail");
    this.watch();
  }

  private async watch() {
    while (await waitPage("transactionDetail")) {
      const unmanagedDMSItems = $$(".ui-card:not(.GM-preview-dms) span.tiny-caption").filter((span) =>
        span.innerText.startsWith("ajouté dans la GED le ")
      );
      if (!unmanagedDMSItems.length) {
        await sleep(2000);
        continue;
      }
      for (const span of unmanagedDMSItems) {
        this.debug({ span });
        const files = getReactProps(span, 11).files as APIDMSLink[];
        for (const file of files) await this.manageFile(file);
      }
    }
  }

  private async manageFile(file: APIDMSLink) {
    this.log("manageFile", { file });
    const dmsItem = ModelFactory.getDMSItem(file.item_id);
    const card = $(`a[href$="${file.item_id}"]`)?.closest(".ui-card") as HTMLDivElement;
    const img = $("img", card);
    if (card.classList.contains("GM-preview-dms")) return;
    if (!card || !img) {
      this.log("unable to find this file card", { file, dmsItem, card, img });
      return;
    }
    card.classList.add("GM-preview-dms");
    this.debug({ file, dmsItem, card, img });
    img.addEventListener("click", () => this.showDMS(dmsItem));
  }

  private async showDMS(dmsItem: DMSItem) {
    const item = await dmsItem.getItem();
    const finalUrl = await followRedirections(item.file_url);
    const modal = parseHTML(`
      <div data-state="open" class="ui-modal-overlay" style="pointer-events: auto;">
        <div role="dialog" id="radix-:rqs:" aria-labelledby="radix-:rqt:"
          data-state="open" tabindex="false" class="ui-modal ui-modal-md"
          style="grid-template-rows: auto 1fr auto; pointer-events: auto; right: 1em; top: 50%; transform: translate(0px, -50%); position: absolute;"
        >
        <header class="ui-modal-header">
            <h2 id="radix-:rqt:" class="heading-section-1 mr-3">${item.name}</h2>
            <button
                class="ui-modal-header-close-button ui-button ui-button-md ui-button-tertiary ui-button-tertiary-primary ui-button-md-icon-only"
                type="button"
            >
                <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0 css-q7mezt"
                    focusable="false" aria-hidden="true" viewBox="0 0 24 24"
                    data-testid="CloseIcon" style="font-size: 1rem;"
                >
                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
            </button>
        </header>
        <div class="ui-modal-body">
            <div class="sc-hvigdm hXZdYQ d-block overflow-auto">
                <div style="height: 60vh; user-select: none; cursor: crosshair;">
                    <div style="position: relative; cursor: zoom-in;">
                        <img src="${finalUrl}" alt="${item.name}" style="display: block; visibility: visible; width: 100%;">
                        <div style="position: absolute; box-sizing: border-box; pointer-events: none; width: 760px; height: 551.4px; top: 0px; overflow: hidden; left: 0px;">
                            <img src="${finalUrl}" alt="${item.name}" style="position: absolute; box-sizing: border-box; display: block; top: 0px; left: 0px; transform: translate(0px); z-index: 1; visibility: hidden; width: auto;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    `).firstElementChild as HTMLDivElement;
    modal.querySelector(".ui-modal-header-close-button")?.addEventListener("click", () => modal.remove());
    document.body.appendChild(modal);
  }
}

/**
 * Fetch given URL and follow all redirections. Finally returns the last URL
 * @param url URL to fetch
 */
async function followRedirections(url: string) {
  const response = await fetch(url);
  if (response.url !== url) return followRedirections(response.url);
  return url;
}