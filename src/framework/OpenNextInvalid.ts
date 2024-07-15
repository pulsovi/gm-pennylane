import { getParam, getRandomArrayItem, sleep } from "../_";
import Service from "./service";

export interface Status {
  id: number;
  valid: boolean;
  message: string;
  page: number;
}

const events = ['click', 'keyup'];
export default abstract class OpenNextInvalid extends Service {
  protected cache: Record<number, Status>;
  private next: () => void;
  private loading: Promise<void> | null = null;
  protected invalid?: Status;
  protected readonly storageKey: string;
  protected readonly idParamName: string;
  private current: number;

  abstract loadValidations (): Promise<void>;
  abstract openInvalid (status: Status): Promise<boolean>;

  async init () {
    console.log(this.constructor.name, 'init');
    this.loading = this.loadValidations().then(() => { this.loading = null; });
    this.next = () => setTimeout(() => this.openNext(), 0);
    this.attachEvents();
  }

  loadCache () {
    this.cache = JSON.parse(localStorage.getItem(this.storageKey) ?? '{}');
  }

  saveCache () {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
  }

  attachEvents () {
    events.forEach(event => { document.addEventListener(event, this.next); });
  }

  detachEvents () {
    events.forEach(event => { document.removeEventListener(event, this.next); });
  }

  getCurrent () {
    return this.current = Number(getParam(location.href, this.idParamName));
  }

  async openNext (interactionAllowed = false) {
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
      setTimeout(this.next, 0);
    }
  }

  setItemStatus (status: Status) {
    if (!status.valid && status.id !== this.getCurrent()) this.invalid = status;
    this.cache[status.id] = status
    this.saveCache();
  }
}
