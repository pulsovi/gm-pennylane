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

injectStyles(styles);

export interface RawStatus {
  id: number;
  /** timestamp de création du document */
  date: number;
  valid: boolean;
  message: string;
  createdAt: number;
};

interface Status extends RawStatus {
  /** timestamp de dernière verification */
  fetchedAt?: number;
  ignored?: boolean;
  wait?: string;
  /** timestamp de création du document */
  date: number;
}

export default abstract class OpenNextInvalid extends Service implements AutostarterParent {
  public abstract readonly id: string;
  public readonly container = document.createElement('div');

  private autostart: Autostarter;
  private current: number;
  private invalidGenerator: AsyncGenerator<Status>;
  private running = false;
  private spinner: Spinner & { index?: number } = {
    //frames: '🕛 🕧 🕐 🕜 🕑 🕝 🕒 🕞 🕓 🕟 🕔 🕠 🕕 🕡 🕖 🕢 🕗 🕣 🕘 🕤 🕙 🕥 🕚 🕦'.split(' '),
    //frames: '🕛 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚'.split(' '),
    frames: '⢎⡰ ⢎⡡ ⢎⡑ ⢎⠱ ⠎⡱ ⢊⡱ ⢌⡱ ⢆⡱'.split(' '),
    interval: 200,
  };
  private skippedElems: Status[];

  protected abstract readonly idParamName: string;
  protected abstract readonly storageKey: string;
  protected abstract cache: CacheList<Status>;

  async init() {
    this.log('init');

    this.start = this.start.bind(this);
    this.loadCurrent();
    this.appendOpenNextButton();
    setInterval(() => { this.setSpinner(); }, this.spinner.interval);
    this.allowIgnoring();
    this.allowWaiting();
    this.autostart = new Autostarter(this);

    this.invalidGenerator = this.loadInvalid();
    this.firstLoading();

    window.addEventListener('beforeunload', event => {
      if (this.running) {
        this.log("Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert.");
        event.returnValue = "Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert. Voulez-vous vraiment continuer ?";
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
        setTimeout(() => { modal.remove(); }, 100);
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
      this.emit('reload', current);
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
    this.container.appendChild(parseHTML(
      `<button type="button" class="${getButtonClassName()} open-next-invalid-btn">&nbsp;
        <span class="icon" style="font-family: monospace;">&gt;</span>&nbsp;
        <span class="number">
          <span class="invalid" title="nombre d'éléments invalides"></span>|
          <span class="waiting" title="nombre d'éléments temporairement ignorés"></span>|
          <span class="ignored" title="nombre d'éléments ignorés"></span>
        </span>
      </button>`.trim().replace(/\n\s*/g, '')
    ));
    const button = $<HTMLButtonElement>(`.open-next-invalid-btn`, this.container)!;

    button.addEventListener('click', this.start.bind(this, true));
    Tooltip.make({ target: button, text: 'Ouvrir le prochain élément invalide' });
    this.reloadNumber();

    this.cache.on('change', () => this.reloadNumber());
  }

  /**
   * Set the number display on openNextInvalid button
   */
  private reloadNumber() {
    const count = this.cache.reduce((acc, status) => {
      if (status.ignored) return { ...acc, ignored: acc.ignored + 1 };
      if (status.wait && (new Date(status.wait).getTime() > Date.now()))
        return { ...acc, waiting: acc.waiting + 1 };
      if (!status.valid) return { ...acc, invalid: acc.invalid + 1 };
      return acc;
    }, { invalid: 0, waiting: 0, ignored: 0 });
    const button = $<HTMLButtonElement>(`.open-next-invalid-btn`, this.container);
    const number = $<HTMLSpanElement>('.number', button);
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
  private async *loadInvalid(): AsyncGenerator<Status, undefined, void> {
    // verifier le cache
    let cached = this.cache.filter({ valid: false }).sort((a, b) => a.date - b.date);
    for (const cachedItem of cached) {
      if (this.isSkipped(cachedItem)) {
        if (!cachedItem?.valid) this.log('skip', cachedItem);
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
        if (!status?.valid) this.log('skip', status);
        continue;
      }
      /**/
      yield status!;
    }

    // verifier les entrées non encore chargées
    for await (const item of this.walk()) {
      const status = await this.updateStatus(item);
      if (this.isSkipped(status)) {
        if (!status?.valid) this.log('skip', status);
        continue;
      }
      yield status!;
    }

    // verifier les plus anciennes entrées
    const dateRef = Date.now() - (3 * 86_400_000);
    let item = this.cache.find(cachedItem => cachedItem.fetchedAt < dateRef);
    while (item) {
      const status = await this.updateStatus(item);
      if (this.isSkipped(status)) {
        if (!status?.valid) this.log('skip', status);
      } else {
        yield status!;
      }
      item = this.cache.find(cachedItem => cachedItem.fetchedAt < dateRef);
    }
  }

  private isSkipped(status: Status | null) {
    if (!status) return true;
    if (status.valid) return true;
    if (status.ignored) return true;
    if (status.wait && (new Date(status.wait).getTime() > Date.now())) return true;
    return false;
  }

  /**
   * Update status of an item given by its ID
   */
  private async updateStatus(id: number | RawStatus, value?: RawStatus | null): Promise<Status | null> {
    if ('number' !== typeof id) { id = id.id; }
    if (!value) value = await this.getStatus(id);
    if (!value) {
      this.cache.delete({ id });
      return null;
    }
    const oldStatus = this.cache.find({ id }) ?? {};
    const status = Object.assign({}, oldStatus, value, { fetchedAt: Date.now() });

    if (isNaN(status.createdAt)) {
      this.log({ value, id, oldStatus, status });
      throw new Error('status.createdAt must be number');
    }

    this.cache.updateItem({ id }, status);
    return status;
  }

  /**
   * Get the status of an item
   */
  protected abstract getStatus(id: number): Promise<RawStatus | null>;

  /**
   * Walk through all items matching given search params
   */
  protected abstract walk(): AsyncGenerator<RawStatus, undefined, void>;

  async openNext(interactionAllowed = false) {
    this.log('openNext');

    let status = (await this.invalidGenerator.next()).value;
    while (status?.id === this.current) {
      this.log({ status, current: this.current, class: this });
      status = (await this.invalidGenerator.next()).value;
    }

    if (!status && interactionAllowed) {
      if (!this.skippedElems) this.skippedElems = this.cache.filter(item => this.isSkipped(item));
      while (!status && this.skippedElems.length) {
        const id = this.skippedElems.shift()!.id;
        status = await this.updateStatus(id);
        if (status?.valid || status.id === this.current) status = false;
      }
    }

    if (status) {
      this.log('next found :', { current: this.current, status, class: this });
      this.open(status.id);
      this.running = false;
      return;
    }

    if (
      interactionAllowed &&
      confirm(this.constructor.name + ': tous les éléments sont valides selon les paramétres actuels. Revérifier tout depuis le début ?')
    ) {
      this.reloadAll();
      return this.openNext(interactionAllowed);
    }

    this.running = false;
  }

  protected open(id: number): void {
    openDocument(id);
  }

  private async reloadAll() {
    this.cache.clear();
    localStorage.removeItem(`${this.storageKey}-state`);
    this.invalidGenerator = this.loadInvalid();
  }

  private async firstLoading() {
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

    const dateRef = Date.now() - (3 * 86_400_000);
    let status = this.cache.find(item => item.fetchedAt < dateRef);
    while (status) {
      await this.updateStatus(status);
      status = this.cache.find(item => item.fetchedAt < dateRef);
    }

    if (state.loaded) return;

    // load all
    const news = this.walk();
    for await (const item of this.walk()) await this.updateStatus(item);

    // save loaded status
    state.loaded = true;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  private allowIgnoring() {
    const ignored = Boolean(this.cache.find({ id: this.current })?.ignored);

    this.container.appendChild(parseHTML(`<button
      type="button"
      class="${getButtonClassName()} ignore-item"
      ${ignored ? 'style="background-color: var(--red);"' : ''}
    >x</button>`));
    const button = $<HTMLButtonElement>(`.ignore-item`, this.container)!;
    Tooltip.make({ target: button, text: 'Ignorer cet élément, ne plus afficher' });

    const refresh = () => {
      const ignored = Boolean(this.cache.find({ id: this.current })?.ignored);
      const background = ignored ? 'var(--red)' : '';
      if (button.style.backgroundColor !== background) button.style.backgroundColor = background;
    }

    button.addEventListener('click', () => {
      const status = this.cache.find({ id: this.current });
      if (!status) return;
      this.cache.updateItem({ id: this.current }, Object.assign(status, { ignored: !status.ignored }));
    });

    this.cache.on('change', () => { refresh(); });
    this.on('reload', () => { refresh(); });
  }

  private allowWaiting() {
    this.container.appendChild(parseHTML(
      `<button type="button" class="${getButtonClassName()} wait-item">\ud83d\udd52</button>`
    ));

    const waitButton = $<HTMLButtonElement>(`.wait-item`, this.container)!;
    const tooltip = Tooltip.make({ target: waitButton, text: '' });
    const updateWaitDisplay = () => {
      const status = this.cache.find({ id: this.current });

      if (!status?.wait || (new Date(status.wait).getTime() < Date.now())) {
        waitButton.style.backgroundColor = '';
        tooltip.setText('Ne plus afficher pendant 3 jours');
        return;
      }

      waitButton.style.backgroundColor = 'var(--blue)';
      const date = new Date(status.wait).toISOString().replace('T', ' ').slice(0, 16)
        .split(' ').map(block => block.split('-').reverse().join('/')).join(' ');
      tooltip.setText(`Ignoré jusqu'à ${date}.`);
    }

    updateWaitDisplay();

    setInterval(() => { updateWaitDisplay(); }, 60_000);

    waitButton.addEventListener('click', () => {
      this.log('waiting button clicked');
      const status = this.cache.find({ id: this.current });
      if (!status) return this.log({ cachedStatus: status, id: this.current });
      const wait = (status.wait && (new Date(status.wait).getTime() > Date.now())) ? ''
        : new Date(Date.now() + 3 * 86_400_000).toISOString();
      this.cache.updateItem({ id: this.current }, Object.assign(status, { wait }));
      updateWaitDisplay();
    });

    this.cache.on('change', () => { updateWaitDisplay(); });
    this.on('reload', () => { updateWaitDisplay(); });
  }

  setSpinner() {
    const span = $<HTMLSpanElement>('.open-next-invalid-btn .icon', this.container);
    if (!span) return;
    if (!this.running) {
      if (span.innerText !== '>') span.innerText = '>';
      return;
    }
    this.spinner.index = ((this.spinner.index ?? 0) + 1) % this.spinner.frames.length;
    span.innerText = this.spinner.frames[this.spinner.index];
  }

  public getCache() {
    return this.cache;
  }
}
