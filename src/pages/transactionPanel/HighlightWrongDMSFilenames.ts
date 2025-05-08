import { $$, findElem, HTMLToString } from "../../_/dom.js";
import { getReactProps } from "../../_/react.js";
import { sleep } from "../../_/time.js";
import { APIDMSItem } from "../../api/DMS/Item.js";
import { APIDMSLink } from "../../api/DMS/Link.js";
import Service from "../../framework/Service.js";
import Tooltip from "../../framework/Tooltip.js";
import DMSItem from "../../models/DMSItem.js";
import { waitPage } from "../../navigation/waitPage.js";

export default class HighlightWrongDMSFilenames extends Service {
  async init () {
    await waitPage('transactionDetail');
    this.watch();
  }

  async watch () {
    while (await waitPage('transactionDetail')) {
      const unmanagedDMSItems = $$('span.tiny-caption').filter(span => (
        !span.classList.contains('GM')
        && span.innerText.startsWith('ajouté dans la GED le ')
      ));
      if (!unmanagedDMSItems.length) {
        await sleep(2000);
        continue;
      }
      for (const span of unmanagedDMSItems) {
        this.log({span});
        const files = getReactProps(span, 11).files as APIDMSLink[];
        for (const file of files) {
          const dmsItem = new DMSItem({id:file.item_id});
          const status = await dmsItem.getValidMessage();
          const nameDiv = findElem('div.d-block', file.name);
          const targetSpan = nameDiv.nextElementSibling;
          targetSpan.classList.add('GM');
          if (status !== 'OK') {
            nameDiv.classList.add('bg-warning-100');
            Tooltip.make({target: nameDiv, text: HTMLToString(status)});
          }
        }
      }
    }
  }
}
