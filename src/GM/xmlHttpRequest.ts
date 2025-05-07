import Service from "../framework/Service.js";

export class XmlHttpRequest extends Service {
  init () {
    window.addEventListener('message', event => this.handleMessage(event.data));
  }

  private async handleMessage (data) {
    if (data.target !== 'GM.xmlHttpRequest') return;
    this.log('handle request sending', {data});
    const response = await this.request(data.payload);
    this.log('handle request response', {response});
    window.postMessage({ source: 'GM.xmlHttpRequest', id: data.id, response: JSON.stringify(response) });
  }

  private async request (payload) {
    this.log('request', {payload});
    return new Promise (resolve => {
      GM.xmlHttpRequest({
        ...payload,
        onload: resolve,
      });
    });
  }
}
