export default class Service {
  protected static instance: Service;

  protected constructor () {
    this.init();
  }

  public static start () {
    console.log(this.name, 'start');
    if (this.instance) return;
    this.instance = new this();
  }

  public static getInstance () {
    return this.instance;
  }

  init (): void | Promise<void> {};
}
