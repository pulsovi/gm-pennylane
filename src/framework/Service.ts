import Logger from "./Logger";

export default class Service extends Logger {
  protected static instance: Service;

  protected constructor () {
    super();
    this.init();
  }

  public static start () {
    console.log(this.name, 'start', this);
    this.getInstance();
  }

  public static getInstance () {
    if (!this.instance) this.instance = new this();
    return this.instance;
  }

  init (): void | Promise<void> {};
}
