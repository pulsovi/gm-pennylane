export default class Service {
  protected static instance: Service;

  protected constructor () {
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

  protected log (...messages) {
    console.log(this.constructor.name, ...messages);
  }

  init (): void | Promise<void> {};
}
