import { contrastScore, textToColor } from "../_/color";
import EventEmitter from "./EventEmitter";

declare const GM_Pennylane_debug: boolean;

Object.assign(window, { GM_Pennylane_debug: window['GM_Pennylane_debug'] ?? false });

export default class Logger extends EventEmitter {
  private readonly logColor: { bg: string; fg: string; };

  public constructor (name?: string) {
    super();
    const background = textToColor(name ?? this.constructor.name);
    const foreground = contrastScore(background, '#ffffff') > contrastScore(background, '#000000')
        ? '#ffffff' : '#000000';
    this.logColor = { bg: background, fg: foreground}
  }

  private getStyles () {
    return [
      'background: #0b0b31; color: #fff; padding: 0.1em .3em; border-radius: 0.3em 0 0 0.3em;',
      `background: ${this.logColor.bg}; color: ${this.logColor.fg}; padding: 0.1em .3em; border-radius: 0 0.3em 0.3em 0;`,
      'background: #f2cc72; color: #555; padding: 0 .8em; border-radius: 1em; margin-left: 1em;',
    ];
  }

  public log (...messages: unknown[]): void {
    const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, '[$1]');
    console.log(
      `${date} %cGM_Pennylane%c${this.constructor.name}`,
      ...this.getStyles().slice(0, 2),
      ...messages
    );
  }

  public debug (...messages: unknown[]): void {
    if (!GM_Pennylane_debug) return;
    const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, '[$1]');
    console.log(
      `${date} %cGM_Pennylane%c${this.constructor.name}%cDebug`,
      ...this.getStyles(),
      ...messages
    );
  }
}
export { Logger };
