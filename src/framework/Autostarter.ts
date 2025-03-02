import { $, getButtonClassName, parseHTML, waitElem } from "../_";
import Tooltip from "./Tooltip";
import CacheRecord from './CacheRecord';
import Logger from "./Logger";

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
export default class Autostarter extends Logger {
  private readonly parent: AutostarterParent;
  private readonly config: CacheRecord<AutostarterConfig>;
  private readonly eventList = ['click', 'keyup', 'keydown', 'keypress', 'mouseup'];

  /**
   * @property stopped Flag moved to true by the stop() method
   */
  private stopped = false;

  public constructor (parent: AutostarterParent) {
    super(`${parent}_Autostart`);
    this.parent = parent;
    this.config = new CacheRecord<AutostarterConfig>(`${this.parent.id}-autostart`, { enabled: true });
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
      class="${getButtonClassName()}"
      id="${buttonId}"
      style="font-family: initial;"
    ></button>`));
    const button = $<HTMLButtonElement>(`#${buttonId}`, this.parent.container)!;
    const tooltip = Tooltip.make({target: button});

    button.addEventListener('click', () => {
      this.config.set('enabled', oldValue => !oldValue);
    });

    let lastVal: boolean|null = null;
    const setText = () => {
      const enabled = this.config.get('enabled');

      if (enabled === lastVal) return;
      lastVal = enabled;

      if (enabled) {
        button.innerText = '⏹';
        tooltip.setText('Stopper l\'ouverture automatique');
      } else {
        button.innerText = '⏵';
        tooltip.setText('Activer l\'ouverture automatique');
      }
    };
    setText();
    this.config.on('change', setText);

    this.debug({ me: this, button, tooltip });
  }

  /**
   * Callback for autostart events
   *
   * `this` keyword is bounded at constructor
   */
  private start () {
    if (this.config.get('enabled') && !this.stopped) this.parent.start();
  }

  /**
   * Stop all watchers
   */
  public stop () {
    this.stopped = true;
    this.detachEvents();
  }
}
