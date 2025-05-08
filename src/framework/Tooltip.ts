import { $, parseHTML } from '../_/index.js';
import { uniquid } from '../_/uniquid.js';

export default class Tooltip {
  private readonly id = `T${uniquid()}`;
  private readonly target: Element;

  private constructor ({target}: {target: Element}) {
    this.target = target;
    this.createContainer();
    setInterval(() => { this.setPos(); }, 200);
  }

  public static make ({target, text}: {
    target: Element;
    text?: string;
  }) {
    const tooltip = new Tooltip({target});
    if (text) tooltip.setText(text);
    return tooltip;
  }

  /**
   * Create the tooltip DOM and append it to the page
   */
  private createContainer () {
    document.body.appendChild(parseHTML(`<div
      style="display: none; position: absolute; inset: 0px auto auto 0px;"
      role="tooltip"
      x-placement="bottom"
      class="sc-ghWlax esvpOe fade show tooltip bs-tooltip-bottom"
      id="${this.id}"
      data-popper-reference-hidden="false"
      data-popper-escaped="false"
      data-popper-placement="bottom"
    >
      <div class="arrow" style="position: absolute; left: 0px; transform: translate(33.5px);"></div>
      <div class="tooltip-inner"></div>
    </div>`));
    this.target.setAttribute('aria-labelledby', this.id);
    this.target.addEventListener('mouseenter', () => {
      $<HTMLDivElement>(`#${this.id}`)!.style.display = 'unset';
    });
    this.target.addEventListener('mouseleave', () => {
      $<HTMLDivElement>(`#${this.id}`)!.style.display = 'none';
    });
  }

  /**
   * Set the text for the tooltip
   */
  public setText (text: string, html = false) {
    const inner = $<HTMLDivElement>(`#${this.id} .tooltip-inner`);
    if (!inner) throw new Error('Unable to find tooltip container');
    if (html) {
      inner.innerHTML = text;
    } else {
      inner.innerText = text;
    }
  }

  /**
   * Get the tooltip HTML text
   */
  public getHTML (): string {
    const inner = $<HTMLDivElement>(`#${this.id} .tooltip-inner`);
    return inner.innerHTML;
  }

  /**
   * Move the tooltip at good position to point visually the target
   */
  private setPos () {
    const tooltip = $<HTMLDivElement>(`#${this.id}`)!;
    const arrow = $<HTMLDivElement>('.arrow', tooltip)!;

    if (tooltip.style.display === 'none') return;

    const targetRect = this.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const arrowRect = arrow.getBoundingClientRect();

    const targetWidth = targetRect.right - targetRect.left;
    const tooltipWidth = tooltipRect.right - tooltipRect.left;
    const arrowWidth = arrowRect.right - arrowRect.left;

    const arrowTransform = `translate(${Math.round(10*((tooltipWidth/2)-(arrowWidth/2)))/10}px)`;
    if (arrow.style.transform !== arrowTransform) {
      arrow.style.transform = arrowTransform;
    }

    const tooltipTransform = `translate(${
      Math.round(10*(targetRect.left+(targetWidth/2)-(tooltipWidth/2)))/10}px, ${
      Math.round(10*targetRect.bottom)/10}px)`;
    if (tooltip.style.transform !== tooltipTransform) {
      tooltip.style.transform = tooltipTransform;
    }
  }
}
