import { $, parseHTML, waitElem } from "../_";
import Tooltip from "./Tooltip";

export interface AutostarterParent {
  container: ParentNode;
  id: string;
  start: () => void;
}

interface AutostarterConfig {
  enabled: boolean;
}

/**
 * Autolaunch some service at the first user interaction
 */
export default class Autostarter {
  private readonly parent: AutostarterParent;
  private readonly eventList = ['click', 'keyup'];
  private stopped = false;

  public constructor (parent: AutostarterParent) {
    this.parent = parent;
    this.start = this.start.bind(this);
    this.init();
  }

  /**
   * Async init routines
   */
  private async init () {
    this.attachEvents();
    this.appendDisableButton();
  }

  /**
   * Attach interaction events to the browser page
   */
  private attachEvents () {
    this.eventList.forEach(event => {
      document.addEventListener(event, this.start);
    });
  }

  /**
   * Detach interaction events from the browser
   */
  private detachEvents () {
    this.eventList.forEach(event => {
      document.removeEventListener(event, this.start);
    });
  }

  /**
   * Add button for enabling / disabling this autostart behavior
   */
  private appendDisableButton () {
    const buttonId = `${this.parent.id}-autostart-enable-disable`;
    this.parent.container.appendChild(parseHTML(`<button
      type="button"
      class="sc-jwIPbr bxhmjB kzNmya justify-content-center btn btn-primary btn-sm"
      id="${buttonId}"
      style="font-family: initial;"
    ></button>`));
    const button = $<HTMLButtonElement>(`#${buttonId}`, this.parent.container)!;
    const tooltip = Tooltip.make({target: button});

    button.addEventListener('click', () => {
      this.setConfig({ enabled: !this.getConfig().enabled });
    });

    let lastVal: boolean|null = null;
    setInterval(() => {
      const { enabled } = this.getConfig();
      if (enabled === lastVal) return;
      lastVal = enabled;
      if (enabled) {
        button.innerText = '⏹';
        tooltip.setText('Stopper l\'ouverture automatique');
      } else {
        button.innerText = '⏵';
        tooltip.setText('Activer l\'ouverture automatique');
      }
    }, 200);

    console.log(this.constructor.name, this, { button, tooltip });
  }

  /**
   * Callback for autostart events
   *
   * `this` keyword is bounded at constructor
   */
  private start () {
    if (this.getConfig().enabled && !this.stopped) this.parent.start();
  }

  /**
   * Stop all watchers
   */
  public stop () {
    this.detachEvents();
  }

  /**
   * Load config from localStorage
   */
  private getConfig (): AutostarterConfig {
    const defaults: AutostarterConfig = { enabled: true };
    return Object.assign(
      defaults,
      JSON.parse(localStorage.getItem(`${this.parent.id}-autostart`) ?? '{}')
    );
  }

  /**
   * Set properties to this config and save it to localStorage
   */
  private setConfig (settings: Partial<AutostarterConfig> = {}) {
    localStorage.setItem(
      `${this.parent.id}-autostart`,
      JSON.stringify(Object.assign(this.getConfig(), settings))
    );
  }
}
