import { beep } from "../_/beep.js";
import { contrastScore, textToColor } from "../_/color.js";
import { uniquid } from "../_/uniquid.js";
import EventEmitter from "./EventEmitter.js";

declare const GM_Pennylane_debug: boolean;
const csl = getOrigConsole();

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
    beep();
  }

  public debug(...messages: unknown[]): void {
    if (!GM_Pennylane_debug) return;
    const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, "[$1]");
    csl.error(
      `${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}%cDebug`,
      ...this.getStyles(),
      ...messages
    );
  }

  public triggerWarning(...messages: unknown[]): void {
    this.error(...messages);
    debugger;
  }

  public triggerError(message: string, ...otherArgs: any[]): never {
    this.error(message, ...otherArgs);
    debugger;
    throw new Error(message);
  }
}
export { Logger };

function getOrigConsole() {
  return Object.fromEntries(
    Object.entries(window.console).map(([key, value]) => {
      if (!["debug", "info", "warn", "error", "log", "assert", "trace"].includes(key)) return [key, value];
      const id = uniquid();
      let origFunc = null;
      const origApply = Function.prototype.apply;
      Function.prototype.apply = function (this: unknown, thisArg: unknown, args: unknown[]) {
        if (args.includes(id)) {
          origFunc = this;
          return;
        }
        return origApply.call(this, thisArg, args);
      };
      console[key](id);
      Function.prototype.apply = origApply;
      if (origFunc) return [key, origFunc];
      return [key, value];
    })
  );
}