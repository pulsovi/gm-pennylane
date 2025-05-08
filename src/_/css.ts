/**
 * Ajoute du code CSS à la page en créant une balise style
 * @param {string} cssCode - Le code CSS à injecter
 * @param {string} [id] - Identifiant optionnel pour la balise style
 * @return {HTMLStyleElement} - L'élément style créé
 */
export function injectCSS(cssCode: string, id: string = null): HTMLStyleElement {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';

  if (id) styleElement.id = id;

  styleElement.appendChild(document.createTextNode(cssCode));

  document.body.appendChild(styleElement);

  return styleElement;
}
