import { $, $$, findElem, parseHTML } from "../../_/dom.js";
import { fetchToDataURL } from "../../_/fetch.js";
import { getButtonClassName } from "../../_/getButtonClassName.js";
import { GMXmlHttpRequest } from "../../_/gmXhr.js";
import { rotateImage } from "../../_/image.js";
import { getReactProps } from "../../_/react.js";
import { waitFunc } from "../../_/time.js";
import { isObject } from "../../_/typing.js";
import Service from "../../framework/Service.js";
import { waitPage } from "../../navigation/waitPage.js";

/**
 * Allow to rotate preview img of attachment pieces
 */
export default class DMSRotateImg extends Service {
  private rotateButton: HTMLButtonElement = (parseHTML(`<button style="padding: 0.5em 0.6em;">⟳</button>`).firstElementChild) as HTMLButtonElement;
  private container: HTMLDivElement;
  private panContainer: HTMLDivElement;
  private matrixEl: HTMLDivElement;
  private img: HTMLImageElement;
  private state = {
    inMove: false,
    from: { x: 0, y: 0 },
    old: { x: 0, y: 0 },
    matrix: {
      translationX: 0,
      translationY: 0,
      zoom: 1,
    },
    zoomMin: 1,
  };

  /**
   * @inheritDoc
   */
  async init() {
    await waitPage('DMS');

    this.rotateButton.className = getButtonClassName();
    const container = findElem<HTMLDivElement>('div', 'Nom du Fichier').closest('div.w-100');
    this.container = parseHTML(`<div class="${container.firstElementChild.className}"></div>`).firstElementChild as HTMLDivElement;
    this.container.appendChild(this.rotateButton);
    this.watch();
  }

  async watch() {
    await waitPage('DMS');
    const rightList = findElem<HTMLDivElement>('div', 'Nom du Fichier').closest('div.w-100')
    rightList.appendChild(this.container);

    const iframe = $<HTMLIFrameElement>('iframe', rightList.parentElement.previousElementSibling);
    if (iframe) {
      const src = await GMXmlHttpRequest(iframe.src);
      const url = isObject(src) && ('finalUrl' in src) && src.finalUrl;
      this.log({ url });
      const replacement = parseHTML(`
        <div class="border rounded border-secondary-200">
          <div class="pan-container sc-ewIWWK bVhudS overflow-hidden" style="user-select: none;">
            <div class="matrix" style="transform: matrix(1, 0, 0, 1, 0, 0);">
              <div class="img-div">
                <img src="${url}" alt="jpeg image" class="sc-Qotzb guRGpi">
              </div>
            </div>
          </div>
        </div>
      `).firstElementChild;
      iframe.parentElement.insertBefore(replacement, iframe);
      iframe.hidden = true;
      this.makePanContainerDynamic();
      this.on('reload', () => {
        this.log('reload', {replacement});
        replacement.remove();
      });
    }
    $$<HTMLImageElement>('img', $('.pan-container')).forEach(image => this.handleImage(image));
    const ref = getReactProps(rightList, 7).item;
    await waitFunc(() => getReactProps(rightList, 7).item !== ref);
    this.emit('reload');
    this.log('reload');
    this.watch();
  }

  async handleImage(image: HTMLImageElement) {
    let rotation = 0;
    const mainImage = await fetchToDataURL(image.src);
    const rotations = [mainImage];
    const handleRotation = async () => {
      rotation = (rotation + 1) % 4;
      if (!rotations[rotation]) rotations[rotation] = await rotateImage(mainImage, rotation);
      image.src = rotations[rotation];
      this.reset();
    };
    this.rotateButton.addEventListener('click', handleRotation);
    this.once('reload', () => {
      this.rotateButton.removeEventListener('click', handleRotation);
    });
  }

  makePanContainerDynamic() {
    this.panContainer = $('.pan-container');
    this.matrixEl = $('.matrix', this.panContainer);
    this.img = $('img', this.matrixEl);
    this.reset();
    document.addEventListener('mouseup', event => {
      this.state.inMove = false;
      this.panContainer.style.cursor = 'grab';
    });
    this.panContainer.addEventListener('mousedown', (event: MouseEvent) => {
      this.state.inMove = true;
      this.panContainer.style.cursor = 'move';
      this.state.from.x = event.clientX;
      this.state.from.y = event.clientY;
      this.state.old.x = this.state.matrix.translationX;
      this.state.old.y = this.state.matrix.translationY;
    });
    this.panContainer.addEventListener('dragstart', event => {
      event.preventDefault();
      event.stopPropagation();
    }, true);
    document.addEventListener('mousemove', (event: MouseEvent) => {
      if (!this.state.inMove) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.state.matrix.translationX = event.clientX - this.state.from.x + this.state.old.x;
      this.state.matrix.translationY = event.clientY - this.state.from.y + this.state.old.y;
      this.setMatrix();
    }, { capture: true });
    this.panContainer.addEventListener('wheel', (event: WheelEvent) => {
      event.stopPropagation();
      event.preventDefault();
      this.state.matrix.zoom = Math.max(this.state.zoomMin, this.state.matrix.zoom + (event.deltaY / 50));
      this.setMatrix();
    });
  }

  async reset() {
    await new Promise(rs => { this.img.addEventListener('load', rs); });
    await new Promise(rs => { requestAnimationFrame(() => { setTimeout(rs, 0); })});

    const containerHeight = parseInt(getComputedStyle(this.panContainer).height);
    const containerWidth = parseInt(getComputedStyle(this.panContainer).width);
    const imgHeight = this.img.height;
    const imgWidth = this.img.width;

    this.state.zoomMin = Math.min(containerHeight / imgHeight, containerWidth / imgWidth);
    this.state.matrix.zoom = this.state.zoomMin;
    this.state.matrix.translationX = -(containerWidth - (containerWidth*this.state.zoomMin)) / 2;
    this.state.matrix.translationY = -(containerHeight - (containerHeight*this.state.zoomMin)) / 2;
    this.log({ containerHeight, containerWidth, imgHeight, imgWidth, class: this });
    this.setMatrix();
  }

  setMatrix() {
    const matrix = [
      this.state.matrix.zoom,
      0,
      0,
      this.state.matrix.zoom,
      this.state.matrix.translationX,
      this.state.matrix.translationY
    ].join(', ');
    this.matrixEl.style.transform = `matrix(${matrix})`;
  }
}

