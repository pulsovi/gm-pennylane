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

  init (): void | Promise<void> {};
}
