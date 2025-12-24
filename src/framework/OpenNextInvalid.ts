import { $, getParam, parseHTML } from '../_/index.js';
import { openDocument } from '../navigation/openDocument.js';
import Autostarter, { type AutostarterParent } from './Autostarter.js';
import CacheList from './CacheList.js';
import Service from './Service.js';
import Tooltip from './Tooltip.js';
import type { Spinner } from '../_/spinners.js';
import { getButtonClassName } from '../_/getButtonClassName.js';
import styles from './openNextInvalid.css';
import { injectStyles } from '../_/styles.js';
import IDBCache from "./IDBCache.js";
import { Status } from "./CacheStatus.js";

injectStyles(styles);

export interface OpenNextInvalid_ItemStatus {
  id: number;
  /** timestamp de dernière verification */
  fetchedAt?: number;
  ignored?: boolean;
  wait?: string;
  /** timestamp de création du document */
  date: number;
  message: string;
  valid: boolean;
}

export default abstract class OpenNextInvalid<TItem extends OpenNextInvalid_ItemStatus = OpenNextInvalid_ItemStatus>
  extends Service
  implements AutostarterParent
{
  public abstract readonly id: string;
  public readonly container = document.createElement("div");

  private autostart: Autostarter;
  private current: number;
  private invalidGenerator: AsyncGenerator<TItem>;
  private running = false;
  private spinner: Spinner & { index?: number } = {
    //frames: '🕛 🕧 🕐 🕜 🕑 🕝 🕒 🕞 🕓 🕟 🕔 🕠 🕕 🕡 🕖 🕢 🕗 🕣 🕘 🕤 🕙 🕥 🕚 🕦'.split(' '),
    //frames: '🕛 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚'.split(' '),
    frames: "⢎⡰ ⢎⡡ ⢎⡑ ⢎⠱ ⠎⡱ ⢊⡱ ⢌⡱ ⢆⡱".split(" "),
    interval: 200,
  };
  private skippedElems: TItem[];

  protected abstract readonly idParamName: string;
  protected abstract readonly storageKey: string;
  protected abstract cache: IDBCache<TItem, "id", number>;

  async init() {
    this.log("init");
    await this.cache.loading;

    this.start = this.start.bind(this);
    this.loadCurrent();
    this.appendOpenNextButton();
    setInterval(() => {
      this.setSpinner();
    }, this.spinner.interval);
    this.allowIgnoring();
    this.allowWaiting();
    this.autostart = new Autostarter(this);

    this.invalidGenerator = this.loadInvalid();
    this.firstLoading();

    window.addEventListener("beforeunload", (event) => {
      if (this.running) {
        this.log("Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert.");
        event.returnValue =
          "Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert. Voulez-vous vraiment continuer ?";
        const modal = parseHTML(`
          <div class="modal" style="display: block;padding: 10em; background-color: #DDDD;">
            <div class="modal-content" style="max-width: 40em;">
              <div class="modal-header">
                <h2>Confirmation</h2>
              </div>
              <div class="modal-body">
                <p>Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert. Voulez-vous vraiment continuer ?</p>
              </div>
            </div>
          </div>
        `).firstElementChild as HTMLDivElement;
        document.body.appendChild(modal);
        event.preventDefault();
        setTimeout(() => {
          modal.remove();
        }, 100);
      }
    });
  }

  /**
   * Load current item ID
   */
  loadCurrent() {
    this.current = Number(getParam(location.href, this.idParamName));
    setInterval(() => {
      const current = Number(getParam(location.href, this.idParamName));
      if (current === this.current) return;
      this.current = current;
      this.emit("reload", current);
    });
  }

  /**
   * Start action
   *
   * `this` keyword is bounded at constructor
   */
  start(interactionAllowed?: boolean | Event) {
    if (this.running) return;
    this.autostart.stop();
    this.running = true;
    setTimeout(() => this.openNext(interactionAllowed === true), 0);
  }

  /**
   * Append the button for open next to the DOM
   */
  private appendOpenNextButton() {
    this.container.appendChild(
      parseHTML(
        `<button type="button" class="${getButtonClassName()} open-next-invalid-btn">&nbsp;
        <span class="icon" style="font-family: monospace;">&gt;</span>&nbsp;
        <span class="number">
          <span class="invalid" title="nombre d'éléments invalides"></span>|
          <span class="waiting" title="nombre d'éléments temporairement ignorés"></span>|
          <span class="ignored" title="nombre d'éléments ignorés"></span>
        </span>
      </button>`
          .trim()
          .replace(/\n\s*/g, "")
      )
    );
    const button = $<HTMLButtonElement>(`.open-next-invalid-btn`, this.container)!;

    button.addEventListener("click", this.start.bind(this, true));
    Tooltip.make({ target: button, text: "Ouvrir le prochain élément invalide" });
    this.reloadNumber();

    this.cache.on("update", () => this.reloadNumber());
  }

  /**
   * Set the number display on openNextInvalid button
   */
  private async reloadNumber() {
    const count: { invalid: number; waiting: number; ignored: number } = await this.cache.reduce(
      (acc, status) => {
        if (status.ignored) return { ...acc, ignored: acc.ignored + 1 };
        if (status.wait && new Date(status.wait).getTime() > Date.now()) return { ...acc, waiting: acc.waiting + 1 };
        if (!status.valid) return { ...acc, invalid: acc.invalid + 1 };
        return acc;
      },
      { invalid: 0, waiting: 0, ignored: 0 }
    );
    const button = $<HTMLButtonElement>(`.open-next-invalid-btn`, this.container);
    const number = $<HTMLSpanElement>(".number", button);
    Object.entries(count).forEach(([key, value]) => {
      const span = $<HTMLSpanElement>(`.${key}`, number);
      if (!span) {
        this.log(`Unable to find the "${key}" number span`, { button, number });
        return;
      }
      span.innerText = `${value}`;
    });
  }

  /**
   * Create next invalid generator
   */
  private async *loadInvalid(): AsyncGenerator<TItem, undefined, void> {
    for await (const cachedItem of this.cache.walk({ column: "date", sortDirection: "asc" })) {
      if (!cachedItem) continue;
      if (this.isSkipped(cachedItem)) {
        if (!cachedItem?.valid) this.log("skip", cachedItem);
        continue;
      }
      /**
      const status = cachedItem;
      this.updateStatus(cachedItem.id).then((updatedStatus) => {
        if (this.isSkipped(updatedStatus) || updatedStatus.valid) {
          this.start();
        }
      });
      /*/
      const status = await this.updateStatus(cachedItem.id);
      if (this.isSkipped(status)) {
        if (!status?.valid) this.log("skip", status);
        continue;
      }
      /**/
      yield status!;
    }

    // verifier les entrées non encore chargées
    for await (const item of this.walk()) {
      const status = await this.updateStatus(item);
      if (this.isSkipped(status)) {
        if (!status?.valid) this.log("skip", status);
        continue;
      }
      yield status!;
    }

    // verifier les plus anciennes entrées
    const dateRef = Date.now() - 3 * 86_400_000;
    let item = await this.cache.find((cachedItem) => cachedItem.fetchedAt < dateRef);
    while (item) {
      const status = await this.updateStatus(item);
      if (this.isSkipped(status)) {
        if (!status?.valid) this.log("skip", status);
      } else {
        yield status!;
      }
      item = await this.cache.find((cachedItem) => cachedItem.fetchedAt < dateRef);
    }
  }

  private isSkipped(status: TItem | null) {
    if (!status) return true;
    if (status.valid) return true;
    if (status.ignored) return true;
    if (status.wait && new Date(status.wait).getTime() > Date.now()) return true;
    return false;
  }

  /**
   * Update status of an item given by its ID
   */
  protected async updateStatus(
    id: number | { id: number },
    value?: TItem | null,
    force = false
  ): Promise<TItem | null> {
    if ("number" !== typeof id) {
      id = id.id;
    }
    if (!value) value = await this.getStatus(id, force);
    if (!value) {
      this.cache.delete(id);
      return null;
    }
    const oldStatus = (await this.cache.get(id)) ?? {};
    const status = Object.assign({}, oldStatus, value, { fetchedAt: Date.now() });

    this.cache.update(status);
    return status;
  }

  /**
   * Get the status of an item
   */
  protected abstract getStatus(id: number, force?: boolean): Promise<TItem | null>;

  /**
   * Walk through all items matching given search params
   */
  protected abstract walk(): AsyncGenerator<TItem, undefined, void>;

  async openNext(interactionAllowed = false) {
    this.log("openNext");

    let status = (await this.invalidGenerator.next()).value;
    while (status?.id === this.current) {
      this.log("openNext: found current, skip it", { status, current: this.current, class: this });
      status = (await this.invalidGenerator.next()).value;
    }

    if (!status && interactionAllowed) {
      this.log("openNext no invalid item found in the cache, opening the skipped ones");
      if (!this.skippedElems) this.skippedElems = await this.cache.filter((item) => this.isSkipped(item));
      while (!status && this.skippedElems.length) {
        const id = this.skippedElems.shift()!.id;
        status = await this.updateStatus(id);
        if (status?.valid || status.id === this.current) status = false;
      }
    }

    if (status) {
      this.log("next found :", { current: this.current, status, me: this, stack: new Error() });
      this.open(status.id, status);
      this.running = false;
      return;
    }

    if (
      interactionAllowed &&
      confirm(
        this.constructor.name +
          ": tous les éléments sont valides selon les paramétres actuels. Revérifier tout depuis le début ?"
      )
    ) {
      this.reloadAll();
      return this.openNext(interactionAllowed);
    }

    this.running = false;
  }

  protected open(id: number, before?: Status): void {
    const tab = openDocument(id);
    this.updateStatus(id, null, true).then((status) => {
      if (this.isSkipped(status)) {
        this.log("open invalid error: the opened item is skippable", { status, before });
        tab.close();
        this.start();
      } else {
        this.log("open invalid success: the opened item was really invalid", { status, before });
        tab.destroy();
      }
    });
  }

  private async reloadAll() {
    this.cache.clear();
    localStorage.removeItem(`${this.storageKey}-state`);
    this.invalidGenerator = this.loadInvalid();
  }

  private async firstLoading() {
    const storageKey = `${this.storageKey}-state`;
    const currentVersion = window.GM_Pennylane_Version;
    const state = JSON.parse(localStorage.getItem(storageKey) ?? "{}");

    if (state.version !== currentVersion) {
      // clear cache
      this.cache.clear();
      state.version = currentVersion;
      state.loaded = false;
      localStorage.setItem(storageKey, JSON.stringify(state));
    }

    const dateRef = Date.now() - 3 * 86_400_000;
    let status = await this.cache.find((item) => item.fetchedAt < dateRef);
    while (status) {
      await this.updateStatus(status);
      status = await this.cache.find((item) => item.fetchedAt < dateRef);
    }

    if (state.loaded) return;

    // load all
    for await (const item of this.walk()) await this.updateStatus(item);

    // save loaded status
    state.loaded = true;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  private async allowIgnoring() {
    const currentStatus = await this.cache.find({ id: this.current } as Partial<TItem>);
    const ignored = Boolean(currentStatus?.ignored);

    this.container.appendChild(
      parseHTML(`<button
      type="button"
      class="${getButtonClassName()} ignore-item"
      ${ignored ? 'style="background-color: var(--red);"' : ""}
    >x</button>`)
    );
    const button = $<HTMLButtonElement>(`.ignore-item`, this.container)!;
    Tooltip.make({ target: button, text: "Ignorer cet élément, ne plus afficher" });

    const refresh = async () => {
      const status = await this.cache.get(this.current);
      const ignored = Boolean(status?.ignored);
      const background = ignored ? "var(--red)" : "";
      if (button.style.backgroundColor !== background) button.style.backgroundColor = background;
    };

    button.addEventListener("click", async () => {
      const status = await this.cache.get(this.current);
      if (!status) return;
      this.cache.update(Object.assign(status, { ignored: !status.ignored }));
    });

    this.cache.on("update", () => {
      refresh();
    });
  }

  private allowWaiting() {
    this.container.appendChild(
      parseHTML(`<button type="button" class="${getButtonClassName()} wait-item">\ud83d\udd52</button>`)
    );

    const waitButton = $<HTMLButtonElement>(`.wait-item`, this.container)!;
    const tooltip = Tooltip.make({ target: waitButton, text: "" });
    const updateWaitDisplay = async () => {
      const status = await this.cache.get(this.current);

      if (!status?.wait || new Date(status.wait).getTime() < Date.now()) {
        waitButton.style.backgroundColor = "";
        tooltip.setText("Ne plus afficher pendant 3 jours");
        return;
      }

      waitButton.style.backgroundColor = "var(--blue)";
      const date = new Date(status.wait)
        .toISOString()
        .replace("T", " ")
        .slice(0, 16)
        .split(" ")
        .map((block) => block.split("-").reverse().join("/"))
        .join(" ");
      tooltip.setText(`Ignoré jusqu'à ${date}.`);
    };

    updateWaitDisplay();

    setInterval(() => {
      updateWaitDisplay();
    }, 60_000);

    waitButton.addEventListener("click", async () => {
      this.log("waiting button clicked");
      const status = await this.cache.get(this.current);
      if (!status)
        return this.log("waiting button click: cannot find status in the cache", {
          cachedStatus: status,
          id: this.current,
        });
      const wait =
        status.wait && new Date(status.wait).getTime() > Date.now()
          ? ""
          : new Date(Date.now() + 3 * 86_400_000).toISOString();
      await this.cache.update(Object.assign(status, { wait }));
      updateWaitDisplay();
    });

    waitButton.addEventListener("contextmenu", async (event) => {
      event.preventDefault();
      const date = prompt("Date de fin de timeout ? (jj/mm/aaaa)", "");
      if (!date) return;
      const d = date.split("/");
      if (d.length !== 3) {
        alert(" Format attendu : jj/mm/aaaa");
        return;
      }
      try {
        const wait = new Date(Number(d[2]), Number(d[1]) - 1, Number(d[0])).toISOString();
        const status = await this.cache.get(this.current);
        if (!status) return this.log({ cachedStatus: status, id: this.current });
        this.cache.update(Object.assign(status, { wait }));
        updateWaitDisplay();
      } catch {
        alert(" Format attendu : jj/mm/aaaa");
      }
    });

    this.cache.on("update", () => {
      updateWaitDisplay();
    });
  }

  setSpinner() {
    const span = $<HTMLSpanElement>(".open-next-invalid-btn .icon", this.container);
    if (!span) return;
    if (!this.running) {
      if (span.innerText !== ">") span.innerText = ">";
      return;
    }
    this.spinner.index = ((this.spinner.index ?? 0) + 1) % this.spinner.frames.length;
    span.innerText = this.spinner.frames[this.spinner.index];
  }

  public getCache() {
    return this.cache;
  }
}
