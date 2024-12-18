import { $, getParam, parseHTML } from "../_";
import { openDocument } from "../navigation/openDocument";
import Autostarter, { type AutostarterParent } from "./Autostarter";
import CacheList from "./CacheList";
import Service from "./Service";
import Tooltip from "./Tooltip";
import type { Spinner } from "../_/spinners";

export interface RawStatus {
  id: number;
  valid: boolean;
  message: string;
  createdAt: number;
};

interface Status extends RawStatus {
  fetchedAt?: number;
  ignored?: boolean;
  wait?: string;
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

  protected abstract readonly idParamName: string;
  protected abstract readonly storageKey: string;
  protected abstract cache: CacheList<Status>;

  async init () {
    this.log('init');

    this.start = this.start.bind(this);
    this.current = Number(getParam(location.href, this.idParamName));

    this.appendOpenNextButton();
    setInterval(() => { this.setSpinner(); }, this.spinner.interval);
    this.allowIgnoring();
    this.allowWaiting();
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
    if (this.running) return;
    this.autostart.stop();
    this.running = true;
    setTimeout(() => this.openNext(interactionAllowed ===  true), 0);
  }

  /**
   * Append the button for open next to the DOM
   */
  private appendOpenNextButton () {
    const count = this.cache.filter({ valid: false }).length;
    const className = 'sc-jwIPbr kzNmya bxhmjB justify-content-center btn btn-primary btn-sm';
    this.container.appendChild(parseHTML(
      `<button type="button" class="${className} open-next-invalid-btn">
        &nbsp;<span class="icon" style="font-family: monospace;">&gt;</span>
        &nbsp;<span class="number">${count}</span>
      </button>`
    ));
    const button = $<HTMLButtonElement>(`.open-next-invalid-btn`, this.container)!;
    const number = $<HTMLSpanElement>('.number', button)!;

    button.addEventListener('click', this.start.bind(this, true));
    Tooltip.make({ target: button, text: 'Ouvrir le prochain élément invalide' });

    this.cache.on('change', () => {
      const count = this.cache.filter({ valid: false }).length;
      number.innerHTML = `${count}`;
    });
  }

  /**
   * Create next invalid generator
   */
  private async *loadInvalid (): AsyncGenerator<Status, undefined, void> {
    const isSkipped = (status: Status | null): status is null => {
      if (!status) return true;
      if (status.valid) return true;
      if (status.ignored) return true;
      if (status.wait && (new Date(status.wait).getTime() > Date.now())) return true;
      return false;
    }

    // verifier le cache
    let cached = this.cache.filter({ valid: false });
    for (const cachedItem of cached) {
      const status = await this.updateStatus(cachedItem.id);
      if (isSkipped(status)) continue;
      yield status;
    }

    // verifier les entrées non encore chargées
    for await (const item of this.walk()) {
      const status = await this.updateStatus(item);
      if (isSkipped(status)) continue;
      yield status;
    }

    // verifier les plus anciennes entrées
    this.log('TODO: vérifier les entrées qui ont été modifiée récemment');
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
  protected abstract getStatus (id: number): Promise<RawStatus|null>;

  /**
   * Walk through all items matching given search params
   */
  protected abstract walk (): AsyncGenerator<RawStatus, undefined, void>;

  async openNext (interactionAllowed = false) {
    this.log('openNext');

    let status = (await this.invalidGenerator.next()).value;
    while (status?.id === this.current) {
      this.log({status, current: this.current, class: this});
      status = (await this.invalidGenerator.next()).value;
    }
    if (status) {
      this.log('next found :', { current: this.current, status, class: this });
      openDocument(status.id);
      this.running = false;
      return;
    }
    if (
      interactionAllowed &&
      confirm(this.constructor.name + ': tous les éléments sont valides selon les paramétres actuels. Revérifier tout depuis le début ?')
    ) {
      this.cache.clear();
      localStorage.removeItem(`${this.storageKey}-state`);
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
    const news = this.walk();
    for await (const item of this.walk()) await this.updateStatus(item);

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

  private allowWaiting () {
    const className = 'sc-jwIPbr kzNmya bxhmjB justify-content-center btn btn-primary btn-sm';
    this.container.appendChild(parseHTML(
      `<button type="button" class="${className} wait-item">\ud83d\udd52</button>`
    ));

    const button = $<HTMLButtonElement>(`.wait-item`, this.container)!;
    const tooltip = Tooltip.make({ target: button, text: '' });
    const updateWaitDisplay = () => {
      const status = this.cache.find({ id: this.current });

      if (!status?.wait || (new Date(status.wait).getTime() < Date.now())) {
        button.style.backgroundColor = '';
        tooltip.setText('Ne plus afficher pendant 3 jours');
        return;
      }

      button.style.backgroundColor = 'var(--blue)';
      const date = new Date(status.wait).toISOString().replace('T', ' ').slice(0, 16)
          .split(' ').map(block => block.split('-').reverse().join('/')).join(' ');
      tooltip.setText(`Masqué jusqu'à ${date}.`);
    }

    updateWaitDisplay();

    setInterval(() => { updateWaitDisplay(); }, 60_000);

    button.addEventListener('click', () => {
      const status = this.cache.find({ id: this.current });
      if (!status) return;
      const wait = (status.wait && (new Date(status.wait).getTime() > Date.now())) ? ''
        : new Date(Date.now() + 3*86_400_000).toISOString();
      this.cache.updateItem({ id: this.current }, Object.assign(status, { wait }));
      updateWaitDisplay();
    });

    this.cache.on('change', () => { updateWaitDisplay(); });
  }

  setSpinner () {
    const span = $<HTMLSpanElement>('.open-next-invalid-btn .icon', this.container);
    if (!span) return;
    if (!this.running) {
      if (span.innerText !== '>') span.innerText = '>';
      return;
    }
    this.spinner.index = ((this.spinner.index ?? 0) + 1) % this.spinner.frames.length;
    span.innerText = this.spinner.frames[this.spinner.index];
  }
}
