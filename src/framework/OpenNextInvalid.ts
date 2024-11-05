import { getParam, getRandomArrayItem, sleep } from "../_";
import Service from "./service";

export interface Status {
  id: number;
  valid: boolean;
  message: string;
  page: number;
  updatedAt: number;
}

export default abstract class OpenNextInvalid extends Service {
  private current: number;
  private loading: Promise<void> | null = null;
  private next: (interactionAllowed?: boolean|Event) => void;
  protected events = ['click', 'keyup'];
  protected cache: Record<number, Status>;
  protected invalid?: Status;
  protected launched = false;
  protected readonly idParamName: string;
  protected readonly storageKey: string;

  abstract loadValidations (): Promise<void>;
  abstract openInvalid (status: Status): Promise<boolean>;

  async init () {
    console.log(this.constructor.name, 'init');
    this.loading = this.loadValidations().then(() => { this.loading = null; });
    this.next = (interactionAllowed?: boolean|Event) => setTimeout(() => this.openNext(interactionAllowed ===  true), 0);
    if (!this.launched) this.attachEvents();
  }

  loadCache () {
    this.cache = JSON.parse(localStorage.getItem(this.storageKey) ?? '{}');
  }

  saveCache () {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
  }

  attachEvents () {
    this.events.forEach(event => { document.addEventListener(event, this.next); });
  }

  detachEvents () {
    this.events.forEach(event => { document.removeEventListener(event, this.next); });
  }

  getCurrent () {
    return this.current = Number(getParam(location.href, this.idParamName));
  }

  async openNext (interactionAllowed = false) {
    this.launched = true;
    this.detachEvents();
    console.log(this.constructor.name, 'openNext');
    this.current = this.getCurrent();

    let status = getRandomArrayItem(Object.values(this.cache).filter(status =>
      'number' !== typeof status
      && status.id !== this.current
      && status.valid === false
    ));
    if (!status) status = this.invalid;
    if (!status && this.loading) {
      if (interactionAllowed) {
        alert(this.constructor.name + ': impossible de trouver un élément invalide dans le cache, attente de la fin du scan');
      } else {
        console.log(this.constructor.name + ': impossible de trouver un élément invalide dans le cache, attente de la fin du scan', this);
      }
      await new Promise<void>(async rs => {
        while(this.loading && !this.invalid) await sleep(300);
        rs();
      });
      status = this.invalid;
    }
    if (!status) {
      if (!interactionAllowed) {
        console.log(this.constructor.name + ': tous les éléments semblent valides.');
        return;
      }
      if (!confirm(this.constructor.name + ': tous les éléments semblent valides. Revérifier depuis le début ?')) return;
      this.cache = {};
      this.saveCache();
      this.loading = this.loadValidations().then(() => { this.loading = null; });
      await new Promise<void>(async rs => {
        while(this.loading instanceof Promise && !this.invalid) await sleep(300);
        rs();
      });
      status = this.invalid;
    }
    if (!status) {
      alert(this.constructor.name + ': tous les éléments sont valides selon les paramétres actuels');
      return;
    }
    console.log(this.constructor.name, 'next found :', { current: this.current, status });
    const success = await this.openInvalid(status);
    if (!success) {
      delete this.invalid;
      this.next(interactionAllowed);
    }
  }

  setItemStatus (status: Status) {
    if (!status.valid && status.id !== this.getCurrent()) this.invalid = status;
    this.cache[status.id] = status
    this.saveCache();
  }
}
