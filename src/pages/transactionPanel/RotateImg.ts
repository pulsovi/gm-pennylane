import { $, $$, rotateImage, parseHTML, waitFunc } from "../../_";
import { fetchToDataURL } from "../../_/fetch";
import Service from "../../framework/Service";

/**
 * Allow to rotate preview img of attachment pieces
 */
export default class RotateImg extends Service {
  private rotateButton: HTMLButtonElement = (parseHTML(`<button>⟳</button>`).firstElementChild) as HTMLButtonElement;

  /**
   * @inheritDoc
   */
  async init () {
    this.watch();
  }

  async watch () {
    let modal: HTMLDivElement | null;
    while (await waitFunc(() => $<HTMLDivElement>('div.modal-dialog') !== modal)) {
      this.emit('new-modal');
      modal = $<HTMLDivElement>('div.modal-dialog');

      const closeButton = $('div.modal-header button.close', modal);
      if (!modal || !closeButton) continue;

      modal.style.margin = '5rem 0 auto auto';
      closeButton.parentElement?.insertBefore(this.rotateButton, closeButton);

      $$<HTMLImageElement>('img', modal).forEach(image => this.handleImage(image));
    }
  }

  async handleImage (image: HTMLImageElement) {
    let rotation = 0;
    const mainImage = await fetchToDataURL(image.src);
    const rotations = [mainImage];
    const handleRotation = async () => {
      rotation = (rotation + 1) % 4;
      if (!rotations[rotation]) rotations[rotation] = await rotateImage(mainImage, rotation);
      image.src = rotations[rotation];
    };
    this.rotateButton.addEventListener('click', handleRotation);
    this.once('new-modal', () => {
      this.rotateButton.removeEventListener('click', handleRotation);
    });
  }
}

