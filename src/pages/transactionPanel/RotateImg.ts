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
    while (await waitFunc(() => $<HTMLDivElement>('div.ui-modal') !== modal)) {
      this.emit('new-modal');
      modal = $<HTMLDivElement>('div.ui-modal');

      const closeButton = $('button.ui-modal-header-close-button', modal);
      if (!modal || !closeButton) continue;

      modal.classList.remove('ui-modal-dialog-centered');
      modal.style.right = '1em';
      modal.style.top = '50%';
      modal.style.transform = 'translate(0,-50%)';
      modal.style.position = 'absolute';
      this.rotateButton.classList.add(...closeButton.className.split(' '));
      this.rotateButton.style.marginRight = '2.5em';
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

