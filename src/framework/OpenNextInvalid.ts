import { $, getParam, getRandomArrayItem, parseHTML, sleep } from "../_";
import { openDocument } from "../navigation/openDocument";
import Autostarter, { type AutostarterParent } from "./Autostarter";
import CacheList from "./CacheList";
import Service from "./service";
import Tooltip from "./Tooltip";

export interface RawStatus {
  id: number;
  valid: boolean;
  message: string;
  createdAt: number;
};

interface Status extends RawStatus {
  fetchedAt: number;
  ignored?: boolean;
}

export default abstract class OpenNextInvalid extends Service implements AutostarterParent {
  public abstract readonly id: string;
  public readonly container = document.createElement('div');

  private autostart: Autostarter;
  private current: number;
  private invalidGenerator: AsyncGenerator<Status>;

  protected abstract readonly idParamName: string;
  protected abstract readonly storageKey: string;
  protected abstract cache: CacheList<Status>;

  async init () {
    console.log(this.constructor.name, 'init');

    this.start = this.start.bind(this);
    this.current = Number(getParam(location.href, this.idParamName));

    this.appendOpenNextButton();
    this.allowIgnoring();
    this.autostart = new Autostarter(this);

    this.invalidGenerator = this.loadInvalid();
    this.firstLoading();
  }

  /**
   * Start action
   *
   * `this` keyword is bounded at constructor
   */
  start (interactionAllowed?: boolean|Event) {
    this.autostart.stop();
    setTimeout(() => this.openNext(interactionAllowed ===  true), 0);
  }

  /**
   * Append the button for open next to the DOM
   */
  private appendOpenNextButton () {
    const number = this.cache.filter({ valid: false }).length;
    const className = 'sc-jwIPbr kzNmya bxhmjB justify-content-center btn btn-primary btn-sm';
    this.container.appendChild(parseHTML(
      `<button type="button" class="${className} open-next-invalid-btn">&nbsp;&gt;&nbsp;${number}</button>`
    ));
    const button = $<HTMLButtonElement>(`.open-next-invalid-btn`, this.container)!;

    button.addEventListener('click', this.start.bind(this, true));
    Tooltip.make({ target: button, text: 'Ouvrir le prochain élément invalide' });

    this.cache.on('change', () => {
      const number = this.cache.filter({ valid: false }).length;
      button.innerHTML = `&nbsp;&gt;&nbsp;${number}`;
    });
  }

  /**
   * Create next invalid generator
   */
  private async *loadInvalid (): AsyncGenerator<Status, undefined, void> {
    // verifier le cache
    let cached = this.cache.filter({ valid: false });
    for (const cachedItem of cached) {
      const status = await this.updateStatus(cachedItem.id);
      if (status?.valid === false) yield status;
    }

    // verifier les entrées non encore chargées
    const from = this.cache.reduce(
      (acc, status) => Math.max(status.createdAt, acc),
    0);
    const filter = from ?
      [{ field: 'created_at', operator: 'gteq', value: new Date(from).toISOString() }] :
      [];
    const news = this.walk({
      filter: JSON.stringify(filter),
      sort: '+created_at',
    });
    let newItem = (await news.next()).value;
    while (newItem) {
      const status = await this.updateStatus(newItem);
      if (status?.valid === false) yield status;
      newItem = (await news.next()).value;
    }

    // verifier les plus anciennes entrées
    const olds = this.walk({ sort: '+created_at' });
    let oldItem = (await olds.next()).value;
    while (oldItem) {
      // all next values already tested at "news" step
      if (oldItem.createdAt >= from) return;

      const status = await this.updateStatus(oldItem);
      if (status?.valid === false) yield status;
      oldItem = (await news.next()).value;
    }
  }

  /**
   * Update status of an item given by its ID
   */
  private async updateStatus (id: number | RawStatus, value?: RawStatus|null): Promise<Status|null> {
    if ('number' !== typeof id) {
      value = id;
      id = value.id;
    }
    if (!value) value = await this.getStatus(id);
    if (!value) {
      this.cache.delete({id});
      return null;
    }
    const oldStatus = this.cache.find({id}) ?? {};
    const status = Object.assign({}, oldStatus, value, { fetchedAt: Date.now() });
    this.cache.updateItem({ id }, status);
    return status;
  }

  /**
   * Get the status of an item
   */
  protected abstract getStatus (id: number): Promise<RawStatus|null>;

  /**
   * Walk through all items matching given search params
   */
  protected abstract walk (params: Record<string, string|number>): AsyncGenerator<RawStatus, undefined, void>;

  async openNext (interactionAllowed = false) {
    console.log(this.constructor.name, 'openNext');

    let status = (await this.invalidGenerator.next()).value;
    while (status?.id === this.current || status?.ignored) {
      console.log({status, current: this.current, class: this});
      status = (await this.invalidGenerator.next()).value;
    }
    if (status) {
      console.log(this.constructor.name, 'next found :', { current: this.current, status, class: this });
      openDocument(status.id);
      return;
    }
    if (
      interactionAllowed &&
      confirm(this.constructor.name + ': tous les éléments sont valides selon les paramétres actuels. Revérifier tout depuis le début ?')
    ) {
      this.cache.clear();
      this.invalidGenerator = this.loadInvalid();
      return this.openNext(interactionAllowed);
    }
  }

  private async firstLoading () {
    const storageKey = `${this.storageKey}-state`;
    const currentVersion = window.GM_Pennylane_Version;
    const state = JSON.parse(localStorage.getItem(storageKey) ?? '{}');

    if (state.version !== currentVersion) {
      // clear cache
      this.cache.clear();
      state.version = currentVersion;
      state.loaded = false;
      localStorage.setItem(storageKey, JSON.stringify(state));
    }

    if (state.loaded) return;

    // load all
    const from = this.cache.reduce((acc, status) => Math.max(status.createdAt, acc), 0);
    const news = this.walk({
      filter: JSON.stringify([{ field: 'created_at', operator: 'gteq', value: new Date(from).toISOString() }]),
      sort: '+created_at',
    });
    let newItem = (await news.next()).value;
    while (newItem) {
      await this.updateStatus(newItem);
      newItem = (await news.next()).value;
    }

    // save loaded status
    state.loaded = true;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  private allowIgnoring () {
    const ignored = Boolean(this.cache.find({ id: this.current })?.ignored);
    const className = 'sc-jwIPbr kzNmya bxhmjB justify-content-center btn btn-primary btn-sm';

    this.container.appendChild(parseHTML(`<button
      type="button"
      class="${className} ignore-item"
      ${ignored ? 'style="background-color: var(--red);"' : ''}
    >x</button>`));
    const button = $<HTMLButtonElement>(`.ignore-item`, this.container)!;
    Tooltip.make({ target: button, text: 'Ignorer cet élément, ne plus afficher' });

    button.addEventListener('click', () => {
      const status = this.cache.find({ id: this.current });
      if (!status) return;
      this.cache.updateItem({ id: this.current }, Object.assign(status, { ignored: !status.ignored }));
    });

    this.cache.on('change', () => {
      const ignored = Boolean(this.cache.find({ id: this.current })?.ignored);
      const background = ignored ? 'var(--red)' : '';
      if (button.style.backgroundColor !== background) button.style.backgroundColor = background;
    });
  }
}
