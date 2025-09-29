import { contrastScore, textToColor } from '../_/color.js';
import EventEmitter from './EventEmitter.js';

declare const GM_Pennylane_debug: boolean;
const csl = Object.entries(window.console).reduce((acc, [key, value]) => {
  acc[key] = value;
  return acc;
}, {}) as typeof console;

Object.assign(window, {
  GM_Pennylane_debug: window["GM_Pennylane_debug"] ?? localStorage.getItem("GM_Pennylane_debug") === "true",
});

export default class Logger extends EventEmitter {
  private logColor?: { bg: string; fg: string };
  private readonly loggerName?: string;

  public constructor(name?: string) {
    super();
    this.loggerName = name ?? this.constructor.name;
  }

  private getStyles() {
    if (!("logColor" in this)) {
      const background = textToColor(this.loggerName ?? this.constructor.name);
      const foreground =
        contrastScore(background, "#ffffff") > contrastScore(background, "#000000") ? "#ffffff" : "#000000";
      this.logColor = { bg: background, fg: foreground };
    }
    return [
      "background: #0b0b31; color: #fff; padding: 0.1em .3em; border-radius: 0.3em 0 0 0.3em;",
      `background: ${this.logColor.bg}; color: ${this.logColor.fg}; padding: 0.1em .3em; border-radius: 0 0.3em 0.3em 0;`,
      "background: #f2cc72; color: #555; padding: 0 .8em; border-radius: 1em; margin-left: 1em;",
    ];
  }

  public log(...messages: unknown[]): void {
    const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, "[$1]");
    csl.log(
      `${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}`,
      ...this.getStyles().slice(0, 2),
      ...messages
    );
  }

  public error(...messages: unknown[]): void {
    const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, "[$1]");
    csl.error(
      `${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}`,
      ...this.getStyles().slice(0, 2),
      ...messages
    );
  }

  public debug(...messages: unknown[]): void {
    if (!GM_Pennylane_debug) return;
    const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, "[$1]");
    csl.trace(
      `${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}%cDebug`,
      ...this.getStyles(),
      ...messages
    );
  }
}
export { Logger };
