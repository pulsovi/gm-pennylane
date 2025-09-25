// ==UserScript==
// @name     Pennylane
// @version  0.1.34
// @grant    unsafeWindow
// @grant    GM.openInTab
// @grant    GM.xmlHttpRequest
// @match    https://app.pennylane.com/companies/*
// @icon     https://app.pennylane.com/favicon.ico
// ==/UserScript==
'use strict';

function openTabService() {
    setInterval(() => {
        const elem = document.querySelector('div.open_tab');
        if (!elem)
            return;
        const url = unescape(elem.dataset.url ?? '');
        if (!url)
            return;
        const options = JSON.parse(unescape(elem.dataset.options ?? '{}'));
        console.log('GM_openInTab', { elem, url });
        GM.openInTab(url, { active: false, insert: true, ...options });
        elem.remove();
    }, 200);
}

/**
 * cyrb53 from [Generate a Hash from string in Javascript - Stack Overflow](https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480)
 *
 * @since 0.1.7
 */
function hashString(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * WCAG implementation : https://colorjs.io/docs/contrast#wcag-21
 *
 * @since 0.1.7
 */
function contrastScore(hex1, hex2) {
    // Convertir les couleurs hexadécimales en valeurs RGB
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    // Calculer la luminance relative pour chaque couleur
    const l1 = relativeLuminance(rgb1);
    const l2 = relativeLuminance(rgb2);
    // Calculer le ratio de contraste
    const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
    // Normaliser le score entre 0 et 1
    return (ratio - 1) / 20;
}
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}
function relativeLuminance(rgb) {
    const [r, g, b] = rgb.map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function rgbToHex([r, g, b]) {
    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');
    return `#${hexR}${hexG}${hexB}`;
}
function hslToRgb([h, s, l]) {
    // Assurez-vous que h, s et l sont dans les bonnes plages
    h = h % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) {
        [r, g, b] = [c, x, 0];
    }
    else if (60 <= h && h < 120) {
        [r, g, b] = [x, c, 0];
    }
    else if (120 <= h && h < 180) {
        [r, g, b] = [0, c, x];
    }
    else if (180 <= h && h < 240) {
        [r, g, b] = [0, x, c];
    }
    else if (240 <= h && h < 300) {
        [r, g, b] = [x, 0, c];
    }
    else if (300 <= h && h < 360) {
        [r, g, b] = [c, 0, x];
    }
    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
}
function textToColor(text) {
    // Calculer le hachage du texte
    const hashValue = hashString(text);
    // Utiliser le hachage pour générer une teinte (0-360)
    const hue = Math.abs(hashValue % 360);
    // Fixer la saturation et la luminosité pour des couleurs vives
    const saturation = 70; // Pourcentage
    const lightness = 50; // Pourcentage
    // Retourner la couleur au format HSL
    return hslToHex([hue, saturation, lightness]);
}
function hslToHex(hsl) {
    return rgbToHex(hslToRgb(hsl));
}

class EventEmitter {
    constructor() {
        this.events = {};
    }
    // Abonner une fonction à un événement
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }
    // Abonner une fonction à un événement une seule fois
    once(event, listener) {
        const proxy = data => {
            listener(data);
            this.off(event, proxy);
        };
        this.on(event, proxy);
        return this;
    }
    // Désabonner une fonction d'un événement
    off(event, listener) {
        if (!this.events[event])
            return this;
        this.events[event] = this.events[event].filter(l => l !== listener);
        return this;
    }
    // Déclencher un événement avec des données
    emit(event, data) {
        if (!this.events[event])
            return this;
        this.events[event].forEach(listener => listener(data));
        return this;
    }
}

const csl = Object.entries(window.console).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
}, {});
Object.assign(window, { GM_Pennylane_debug: window["GM_Pennylane_debug"] ?? false });
class Logger extends EventEmitter {
    constructor(name) {
        super();
        this.loggerName = name ?? this.constructor.name;
    }
    getStyles() {
        if (!("logColor" in this)) {
            const background = textToColor(this.loggerName ?? this.constructor.name);
            const foreground = contrastScore(background, "#ffffff") > contrastScore(background, "#000000") ? "#ffffff" : "#000000";
            this.logColor = { bg: background, fg: foreground };
        }
        return [
            "background: #0b0b31; color: #fff; padding: 0.1em .3em; border-radius: 0.3em 0 0 0.3em;",
            `background: ${this.logColor.bg}; color: ${this.logColor.fg}; padding: 0.1em .3em; border-radius: 0 0.3em 0.3em 0;`,
            "background: #f2cc72; color: #555; padding: 0 .8em; border-radius: 1em; margin-left: 1em;",
        ];
    }
    log(...messages) {
        const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, "[$1]");
        csl.log(`${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}`, ...this.getStyles().slice(0, 2), ...messages);
    }
    error(...messages) {
        const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, "[$1]");
        csl.error(`${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}`, ...this.getStyles().slice(0, 2), ...messages);
    }
    debug(...messages) {
        if (!GM_Pennylane_debug)
            return;
        const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, "[$1]");
        csl.log(`${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}%cDebug`, ...this.getStyles(), ...messages);
    }
}

class Service extends Logger {
    constructor() {
        super();
        this.init();
    }
    static start() {
        console.log(this.name, 'start', this);
        this.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            const instance = new this();
            this.instance = instance;
        }
        return this.instance;
    }
    init() { }
    ;
}

class XmlHttpRequest extends Service {
    init() {
        window.addEventListener('message', event => this.handleMessage(event.data));
    }
    async handleMessage(data) {
        if (data.target !== 'GM.xmlHttpRequest')
            return;
        this.log('handle request sending', { data });
        const response = await this.request(data.payload);
        this.log('handle request response', { response });
        window.postMessage({ source: 'GM.xmlHttpRequest', id: data.id, response: JSON.stringify(response) });
    }
    async request(payload) {
        this.log('request', { payload });
        return new Promise(resolve => {
            GM.xmlHttpRequest({
                ...payload,
                onload: resolve,
            });
        });
    }
}

const code = ';(function IIFE() {' + "'use strict';\n" +
"\n" +
"/**\n" +
" * Parse and enable LAST_7_DAYS filter on transactions page\n" +
" *\n" +
" * :Adding `date=LAST_7DAYS` in param url will auto filter transaction\n" +
" */\n" +
"function last7DaysFilter() {\n" +
"    const url = new URL(location.href);\n" +
"    //if (!new RegExp('^/companies/\\\\d+/clients/transactions$').test(url.pathname)) return;\n" +
"    if (url.searchParams.get('date') !== 'LAST_7_DAYS')\n" +
"        return;\n" +
"    const zone = new Date().toString().replace(/^.*GMT(...)(..).*$/, '$1:$2');\n" +
"    const today = new Date(Math.floor(Date.now() / 86400000) * 86400000);\n" +
"    const start = new Date(today.getTime() - (86400000 * 7)).toISOString().replace('.000Z', zone);\n" +
"    const end = today.toISOString().replace('.000Z', zone);\n" +
"    const filter = JSON.parse(url.searchParams.get('filter') ?? '[]');\n" +
"    filter.splice(filter.findIndex(item => item.field === 'date'), 1);\n" +
"    filter.splice(filter.findIndex(item => item.field === 'date'), 1);\n" +
"    filter.push({ field: 'date', operator: 'gteq', value: start }, { field: 'date', operator: 'lteq', value: end });\n" +
"    url.searchParams.set('filter', JSON.stringify(filter));\n" +
"    url.searchParams.delete('date');\n" +
"    location.replace(url);\n" +
"}\n" +
"\n" +
"const MINUTE_IN_MS = 60 * 1000;\n" +
"const HOUR_IN_MS = 60 * MINUTE_IN_MS;\n" +
"const DAY_IN_MS = 24 * HOUR_IN_MS;\n" +
"const WEEK_IN_MS = 7 * DAY_IN_MS;\n" +
"async function sleep(ms) {\n" +
"    await new Promise((rs) => setTimeout(rs, ms));\n" +
"}\n" +
"async function waitFunc(cb, timeout = 0) {\n" +
"    const out = timeout ? Date.now() + timeout : 0;\n" +
"    let result = cb();\n" +
"    if (result instanceof Promise)\n" +
"        result = await result;\n" +
"    while (result === false) {\n" +
"        if (out && Date.now() > out)\n" +
"            return false;\n" +
"        await sleep(200);\n" +
"        result = await cb();\n" +
"    }\n" +
"    return result;\n" +
"}\n" +
"\n" +
"function $(selector, root = document) {\n" +
"    if (root === null)\n" +
"        root = document;\n" +
"    return root.querySelector(selector);\n" +
"}\n" +
"function $$(selector, root = document) {\n" +
"    return Array.from(root.querySelectorAll(selector));\n" +
"}\n" +
"async function waitElem(selector, content, timeout = 0) {\n" +
"    const result = await waitFunc(() => findElem(selector, content) ?? false, timeout);\n" +
"    if (result === false)\n" +
"        return null;\n" +
"    return result;\n" +
"}\n" +
"function findElem(selector, content) {\n" +
"    return $$(selector).find(el => !content || el.textContent === content) ?? null;\n" +
"}\n" +
"/**\n" +
" * Parse an HTML string and return a DocumentFragment which can be inserted in the DOM as is\n" +
" *\n" +
" * @param {string} html The HTML string to parse\n" +
" *\n" +
" * @return {DocumentFragment} The parsed HTML fragment\n" +
" */\n" +
"function parseHTML(html) {\n" +
"    const template = document.createElement('template');\n" +
"    template.innerHTML = html;\n" +
"    return template.content;\n" +
"}\n" +
"function HTMLToString(html) {\n" +
"    const div = document.createElement('div');\n" +
"    div.innerHTML = html;\n" +
"    return div.innerText;\n" +
"}\n" +
"\n" +
"function jsonClone(obj) {\n" +
"    try {\n" +
"        return JSON.parse(JSON.stringify(obj));\n" +
"    }\n" +
"    catch (error) {\n" +
"        console.log('unable to jsonClone this object', obj);\n" +
"        console.log(error);\n" +
"        return obj;\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * Find the React component that rendered the given element.\n" +
" * @param elem The element to find the React component for.\n" +
" * @param up The number of levels up the component tree to traverse.\n" +
" * @returns The React component that rendered the given element.\n" +
" */\n" +
"function getReact(elem, up = 0) {\n" +
"    if (!elem)\n" +
"        return null;\n" +
"    const keys = Object.getOwnPropertyNames(elem);\n" +
"    const fiberKey = keys.find(key => key.startsWith('__reactFiber'));\n" +
"    if (!fiberKey)\n" +
"        return null;\n" +
"    const fiber = elem[fiberKey];\n" +
"    let component = fiber.return;\n" +
"    for (let i = 0; i < up; ++i)\n" +
"        component = component.return;\n" +
"    return component;\n" +
"}\n" +
"/**\n" +
" * Find the React props that rendered the given element.\n" +
" * @param elem The element to find the React props for.\n" +
" * @param up The number of levels up the component tree to traverse.\n" +
" * @returns The React props that rendered the given element.\n" +
" */\n" +
"function getReactProps(elem, up = 0) {\n" +
"    return getReact(elem, up)?.memoizedProps;\n" +
"}\n" +
"/**\n" +
" * Find React prop property value. Search for the given property name in the React Props\n" +
" * of the given element and, if not found, in the React props of its ancestors.\n" +
" * @param elem The element to find the React prop for.\n" +
" * @param propName The prop to find.\n" +
" * @returns The React prop value.\n" +
" */\n" +
"function getReactPropValue(elem, propName) {\n" +
"    return getReactProps(elem, findReactProp(elem, propName))?.[propName];\n" +
"}\n" +
"function findReactProp(elem, propName) {\n" +
"    const propList = new Set();\n" +
"    let i = 0;\n" +
"    while (elem) {\n" +
"        const props = getReactProps(elem, i);\n" +
"        if (!props)\n" +
"            break;\n" +
"        if (!propName)\n" +
"            Object.keys(props).forEach(key => propList.add(key));\n" +
"        else if (props && propName in props)\n" +
"            return i;\n" +
"        ++i;\n" +
"    }\n" +
"    if (!propName)\n" +
"        return propList;\n" +
"    return null;\n" +
"}\n" +
"\n" +
"function getParam(url, paramName) {\n" +
"    return new URL(url).searchParams.get(paramName);\n" +
"}\n" +
"\n" +
"function rotateImage(imageUrl, spin) {\n" +
"    return new Promise((resolve, reject) => {\n" +
"        const img = new Image();\n" +
"        img.onload = () => {\n" +
"            const canvas = document.createElement('canvas');\n" +
"            const ctx = canvas.getContext('2d');\n" +
"            ([canvas.width, canvas.height] = spin % 2 ? [img.height, img.width] : [img.width, img.height]);\n" +
"            ctx.translate(canvas.width / 2, canvas.height / 2);\n" +
"            ctx.rotate((Math.PI * spin) / 2);\n" +
"            ctx.drawImage(img, -img.width / 2, -img.height / 2);\n" +
"            resolve(canvas.toDataURL());\n" +
"        };\n" +
"        img.onerror = (error) => {\n" +
"            console.error('rotateImage', error, { imageUrl, spin });\n" +
"            reject(error);\n" +
"        };\n" +
"        img.src = imageUrl;\n" +
"    });\n" +
"}\n" +
"\n" +
"let cachedClassName = '';\n" +
"/**\n" +
" * Get className to apply to a button element\n" +
" */\n" +
"function getButtonClassName() {\n" +
"    if (cachedClassName)\n" +
"        return cachedClassName;\n" +
"    const buttonModel = findElem('button div', 'Raccourcis')?.parentElement\n" +
"        ?? findElem('div', 'Détails')?.querySelector('button+button:last-child')\n" +
"        ?? findElem('button', 'Déplacer');\n" +
"    const className = buttonModel?.className ?? '';\n" +
"    cachedClassName = className;\n" +
"    return className;\n" +
"}\n" +
"\n" +
"/**\n" +
" * cyrb53 from [Generate a Hash from string in Javascript - Stack Overflow](https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480)\n" +
" *\n" +
" * @since 0.1.7\n" +
" */\n" +
"function hashString(str, seed = 0) {\n" +
"    let h1 = 0xdeadbeef ^ seed;\n" +
"    let h2 = 0x41c6ce57 ^ seed;\n" +
"    for (let i = 0; i < str.length; i++) {\n" +
"        const ch = str.charCodeAt(i);\n" +
"        h1 = Math.imul(h1 ^ ch, 2654435761);\n" +
"        h2 = Math.imul(h2 ^ ch, 1597334677);\n" +
"    }\n" +
"    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);\n" +
"    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);\n" +
"    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);\n" +
"    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);\n" +
"    return 4294967296 * (2097151 & h2) + (h1 >>> 0);\n" +
"}\n" +
"\n" +
"/**\n" +
" * WCAG implementation : https://colorjs.io/docs/contrast#wcag-21\n" +
" *\n" +
" * @since 0.1.7\n" +
" */\n" +
"function contrastScore(hex1, hex2) {\n" +
"    // Convertir les couleurs hexadécimales en valeurs RGB\n" +
"    const rgb1 = hexToRgb(hex1);\n" +
"    const rgb2 = hexToRgb(hex2);\n" +
"    // Calculer la luminance relative pour chaque couleur\n" +
"    const l1 = relativeLuminance(rgb1);\n" +
"    const l2 = relativeLuminance(rgb2);\n" +
"    // Calculer le ratio de contraste\n" +
"    const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);\n" +
"    // Normaliser le score entre 0 et 1\n" +
"    return (ratio - 1) / 20;\n" +
"}\n" +
"function hexToRgb(hex) {\n" +
"    const r = parseInt(hex.slice(1, 3), 16);\n" +
"    const g = parseInt(hex.slice(3, 5), 16);\n" +
"    const b = parseInt(hex.slice(5, 7), 16);\n" +
"    return [r, g, b];\n" +
"}\n" +
"function relativeLuminance(rgb) {\n" +
"    const [r, g, b] = rgb.map(c => {\n" +
"        c /= 255;\n" +
"        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);\n" +
"    });\n" +
"    return 0.2126 * r + 0.7152 * g + 0.0722 * b;\n" +
"}\n" +
"function rgbToHex([r, g, b]) {\n" +
"    const hexR = r.toString(16).padStart(2, '0');\n" +
"    const hexG = g.toString(16).padStart(2, '0');\n" +
"    const hexB = b.toString(16).padStart(2, '0');\n" +
"    return `#${hexR}${hexG}${hexB}`;\n" +
"}\n" +
"function hslToRgb([h, s, l]) {\n" +
"    // Assurez-vous que h, s et l sont dans les bonnes plages\n" +
"    h = h % 360;\n" +
"    s = Math.max(0, Math.min(100, s)) / 100;\n" +
"    l = Math.max(0, Math.min(100, l)) / 100;\n" +
"    const c = (1 - Math.abs(2 * l - 1)) * s;\n" +
"    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));\n" +
"    const m = l - c / 2;\n" +
"    let r = 0, g = 0, b = 0;\n" +
"    if (0 <= h && h < 60) {\n" +
"        [r, g, b] = [c, x, 0];\n" +
"    }\n" +
"    else if (60 <= h && h < 120) {\n" +
"        [r, g, b] = [x, c, 0];\n" +
"    }\n" +
"    else if (120 <= h && h < 180) {\n" +
"        [r, g, b] = [0, c, x];\n" +
"    }\n" +
"    else if (180 <= h && h < 240) {\n" +
"        [r, g, b] = [0, x, c];\n" +
"    }\n" +
"    else if (240 <= h && h < 300) {\n" +
"        [r, g, b] = [x, 0, c];\n" +
"    }\n" +
"    else if (300 <= h && h < 360) {\n" +
"        [r, g, b] = [c, 0, x];\n" +
"    }\n" +
"    return [\n" +
"        Math.round((r + m) * 255),\n" +
"        Math.round((g + m) * 255),\n" +
"        Math.round((b + m) * 255)\n" +
"    ];\n" +
"}\n" +
"function textToColor(text) {\n" +
"    // Calculer le hachage du texte\n" +
"    const hashValue = hashString(text);\n" +
"    // Utiliser le hachage pour générer une teinte (0-360)\n" +
"    const hue = Math.abs(hashValue % 360);\n" +
"    // Fixer la saturation et la luminosité pour des couleurs vives\n" +
"    const saturation = 70; // Pourcentage\n" +
"    const lightness = 50; // Pourcentage\n" +
"    // Retourner la couleur au format HSL\n" +
"    return hslToHex([hue, saturation, lightness]);\n" +
"}\n" +
"function hslToHex(hsl) {\n" +
"    return rgbToHex(hslToRgb(hsl));\n" +
"}\n" +
"\n" +
"class EventEmitter {\n" +
"    constructor() {\n" +
"        this.events = {};\n" +
"    }\n" +
"    // Abonner une fonction à un événement\n" +
"    on(event, listener) {\n" +
"        if (!this.events[event]) {\n" +
"            this.events[event] = [];\n" +
"        }\n" +
"        this.events[event].push(listener);\n" +
"        return this;\n" +
"    }\n" +
"    // Abonner une fonction à un événement une seule fois\n" +
"    once(event, listener) {\n" +
"        const proxy = data => {\n" +
"            listener(data);\n" +
"            this.off(event, proxy);\n" +
"        };\n" +
"        this.on(event, proxy);\n" +
"        return this;\n" +
"    }\n" +
"    // Désabonner une fonction d'un événement\n" +
"    off(event, listener) {\n" +
"        if (!this.events[event])\n" +
"            return this;\n" +
"        this.events[event] = this.events[event].filter(l => l !== listener);\n" +
"        return this;\n" +
"    }\n" +
"    // Déclencher un événement avec des données\n" +
"    emit(event, data) {\n" +
"        if (!this.events[event])\n" +
"            return this;\n" +
"        this.events[event].forEach(listener => listener(data));\n" +
"        return this;\n" +
"    }\n" +
"}\n" +
"\n" +
"const csl = Object.entries(window.console).reduce((acc, [key, value]) => {\n" +
"    acc[key] = value;\n" +
"    return acc;\n" +
"}, {});\n" +
"Object.assign(window, { GM_Pennylane_debug: window[\"GM_Pennylane_debug\"] ?? false });\n" +
"class Logger extends EventEmitter {\n" +
"    constructor(name) {\n" +
"        super();\n" +
"        this.loggerName = name ?? this.constructor.name;\n" +
"    }\n" +
"    getStyles() {\n" +
"        if (!(\"logColor\" in this)) {\n" +
"            const background = textToColor(this.loggerName ?? this.constructor.name);\n" +
"            const foreground = contrastScore(background, \"#ffffff\") > contrastScore(background, \"#000000\") ? \"#ffffff\" : \"#000000\";\n" +
"            this.logColor = { bg: background, fg: foreground };\n" +
"        }\n" +
"        return [\n" +
"            \"background: #0b0b31; color: #fff; padding: 0.1em .3em; border-radius: 0.3em 0 0 0.3em;\",\n" +
"            `background: ${this.logColor.bg}; color: ${this.logColor.fg}; padding: 0.1em .3em; border-radius: 0 0.3em 0.3em 0;`,\n" +
"            \"background: #f2cc72; color: #555; padding: 0 .8em; border-radius: 1em; margin-left: 1em;\",\n" +
"        ];\n" +
"    }\n" +
"    log(...messages) {\n" +
"        const date = new Date().toISOString().replace(/^[^T]*T([\\d:]*).*$/, \"[$1]\");\n" +
"        csl.log(`${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}`, ...this.getStyles().slice(0, 2), ...messages);\n" +
"    }\n" +
"    error(...messages) {\n" +
"        const date = new Date().toISOString().replace(/^[^T]*T([\\d:]*).*$/, \"[$1]\");\n" +
"        csl.error(`${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}`, ...this.getStyles().slice(0, 2), ...messages);\n" +
"    }\n" +
"    debug(...messages) {\n" +
"        if (!GM_Pennylane_debug)\n" +
"            return;\n" +
"        const date = new Date().toISOString().replace(/^[^T]*T([\\d:]*).*$/, \"[$1]\");\n" +
"        csl.log(`${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}%cDebug`, ...this.getStyles(), ...messages);\n" +
"    }\n" +
"}\n" +
"\n" +
"class Service extends Logger {\n" +
"    constructor() {\n" +
"        super();\n" +
"        this.init();\n" +
"    }\n" +
"    static start() {\n" +
"        console.log(this.name, 'start', this);\n" +
"        this.getInstance();\n" +
"    }\n" +
"    static getInstance() {\n" +
"        if (!this.instance) {\n" +
"            const instance = new this();\n" +
"            this.instance = instance;\n" +
"        }\n" +
"        return this.instance;\n" +
"    }\n" +
"    init() { }\n" +
"    ;\n" +
"}\n" +
"\n" +
"function isString(data) {\n" +
"    return typeof data === 'string';\n" +
"}\n" +
"\n" +
"const logger$2 = new Logger(\"API Request\");\n" +
"async function apiRequest(endpoint, data = null, method = \"POST\") {\n" +
"    await apiRequestQueue.wait(200);\n" +
"    const delayBefore = apiRequestQueue.MIN_DELAY;\n" +
"    const options = isString(endpoint) ? {} : endpoint;\n" +
"    const rawUrl = isString(endpoint) ? endpoint : endpoint.url;\n" +
"    const url = rawUrl.startsWith(\"http\") ? rawUrl : `${location.href.split(\"/\").slice(0, 5).join(\"/\")}/${rawUrl}`;\n" +
"    const response = await fetch(url, {\n" +
"        method,\n" +
"        headers: {\n" +
"            \"X-CSRF-TOKEN\": getCookies(\"my_csrf_token\"),\n" +
"            \"Content-Type\": \"application/json\",\n" +
"            Accept: \"application/json\",\n" +
"        },\n" +
"        body: data ? JSON.stringify(data) : null,\n" +
"        ...options,\n" +
"    }).catch((error) => ({ error }));\n" +
"    if (\"error\" in response) {\n" +
"        console.log(\"API request error :\", { endpoint, data, method, error: response.error });\n" +
"        apiRequestQueue.push(3000);\n" +
"        logger$2.debug(\"apiRequestWait: 3000\");\n" +
"        return apiRequest(endpoint, data, method);\n" +
"    }\n" +
"    if (response.status === 204) {\n" +
"        console.log(\"API Request: pas de contenu\", { endpoint, data, method });\n" +
"        return null;\n" +
"    }\n" +
"    if (response.status === 404) {\n" +
"        logger$2.error(\"page introuvable\", { endpoint, data, method });\n" +
"        return null;\n" +
"    }\n" +
"    if (response.status === 422) {\n" +
"        const message = (await response.clone().json()).message;\n" +
"        logger$2.log(message, { endpoint, method, data });\n" +
"        if (typeof endpoint !== \"string\" && !endpoint.headers?.[\"X-CSRF-TOKEN\"]) {\n" +
"            apiRequestQueue.push(200);\n" +
"            logger$2.debug(\"apiRequestWait: 200\");\n" +
"            return apiRequest({\n" +
"                ...endpoint,\n" +
"                headers: {\n" +
"                    \"X-CSRF-TOKEN\": getCookies(\"my_csrf_token\"),\n" +
"                    /*\n" +
"                    \"X-COMPANY-CONTEXT-DATA-UPDATED-AT\": \"2025-05-11T19:23:33.772Z\",\n" +
"                    \"X-PLAN-USED-BY-FRONT-END\": \"v1_saas_free\",\n" +
"                    \"X-FRONTEND-LAST-APPLICATION-LOADED-AT\": \"2025-05-11T19:23:30.880Z\",\n" +
"                    \"X-Reseller\": \"pennylane\",\n" +
"                    \"X-DEPLOYMENT\": \"2025-05-09\",\n" +
"                    \"X-SOURCE-VERSION\": \"853861f\",\n" +
"                    \"X-SOURCE-VERSION-BUILT-AT\": \"2025-05-09T18:17:28.976Z\",\n" +
"                    \"X-DOCUMENT-REFERRER\": location.origin + location.pathname,\n" +
"                    \"X-TAB-ID\": \"0f97ec55-8b4f-44b8-bdd5-4232d75772c9\",\n" +
"                    \"traceparent\": \"00-000000000000000024a046b489ead241-33404d6d5ea99f22-01\",\n" +
"                    */\n" +
"                    ...endpoint.headers,\n" +
"                },\n" +
"            });\n" +
"        }\n" +
"        if (message) {\n" +
"            alert(message);\n" +
"            return null;\n" +
"        }\n" +
"    }\n" +
"    if (response.status === 429 || response.status === 418) {\n" +
"        apiRequestQueue.unshift(1000);\n" +
"        apiRequestQueue.MIN_DELAY = delayBefore + 1;\n" +
"        apiRequestQueue.VERY_MIN_DELAY = Math.max(apiRequestQueue.VERY_MIN_DELAY, delayBefore + 1);\n" +
"        logger$2.debug(\"apiRequestWait: 1000\");\n" +
"        return apiRequest(endpoint, data, method);\n" +
"    }\n" +
"    if (response.status !== 200) {\n" +
"        console.log(\"apiRequest response status is not 200\", { response, status: response.status });\n" +
"        console.error(\"Todo : Créer un gestionnaire pour le code error status = \" + response.status);\n" +
"        return null;\n" +
"    }\n" +
"    apiRequestQueue.MIN_DELAY = Math.max(apiRequestQueue.VERY_MIN_DELAY, delayBefore * 0.99);\n" +
"    return response;\n" +
"}\n" +
"function getCookies(key) {\n" +
"    const allCookies = new URLSearchParams(document.cookie\n" +
"        .split(\";\")\n" +
"        .map((c) => c.trim())\n" +
"        .join(\"&\"));\n" +
"    return allCookies.get(key);\n" +
"}\n" +
"Object.assign(window, { apiRequest });\n" +
"class Queue {\n" +
"    constructor() {\n" +
"        this.VERY_MIN_DELAY = 0;\n" +
"        this.MIN_DELAY = 100;\n" +
"        this.queue = [];\n" +
"        this.running = false;\n" +
"    }\n" +
"    wait(postDelay) {\n" +
"        return new Promise((rs) => {\n" +
"            this.queue.push({ cb: rs });\n" +
"            if (postDelay)\n" +
"                this.push(postDelay);\n" +
"            this.run();\n" +
"        });\n" +
"    }\n" +
"    push(delay) {\n" +
"        const last = this.queue.reduce((last, item) => {\n" +
"            if (\"time\" in item)\n" +
"                return item.time;\n" +
"            return last;\n" +
"        }, Date.now());\n" +
"        const time = Math.max(last + this.MIN_DELAY, Date.now() + delay);\n" +
"        this.queue.push({ time });\n" +
"        this.run();\n" +
"    }\n" +
"    unshift(delay) {\n" +
"        this.queue.unshift({ time: Date.now() + delay });\n" +
"        this.run();\n" +
"    }\n" +
"    run() {\n" +
"        if (this.running || this.queue.length === 0)\n" +
"            return;\n" +
"        this.running = true;\n" +
"        const nextItem = this.queue.shift();\n" +
"        if (\"time\" in nextItem) {\n" +
"            setTimeout(() => {\n" +
"                this.running = false;\n" +
"                this.run();\n" +
"            }, Math.max(nextItem.time - Date.now(), this.MIN_DELAY));\n" +
"        }\n" +
"        else {\n" +
"            nextItem.cb();\n" +
"            this.running = false;\n" +
"            this.run();\n" +
"        }\n" +
"    }\n" +
"}\n" +
"const apiRequestQueue = new Queue();\n" +
"logger$2.log({ apiRequestQueue });\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$o = null;\n" +
"class APIDocument {\n" +
"    static Parse(d) {\n" +
"        return APIDocument.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        if (\"account_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNumber$k(d.account_id, field + \".account_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.account_id, field + \".account_id\", \"number | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.accounting_type, field + \".accounting_type\");\n" +
"        if (\"amount\" in d) {\n" +
"            checkString$m(d.amount, field + \".amount\");\n" +
"        }\n" +
"        checkBoolean$d(d.archived, field + \".archived\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.attachment_lost, field + \".attachment_lost\");\n" +
"        checkBoolean$d(d.attachment_required, field + \".attachment_required\");\n" +
"        checkNull$h(d.billing_subscription_id, field + \".billing_subscription_id\");\n" +
"        if (\"can_be_stamped_as_paid_in_pdf\" in d) {\n" +
"            checkBoolean$d(d.can_be_stamped_as_paid_in_pdf, field + \".can_be_stamped_as_paid_in_pdf\");\n" +
"        }\n" +
"        if (\"company\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                d.company = Company.Create(d.company, field + \".company\", \"Company | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.company, field + \".company\", \"Company | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        if (\"complete\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.complete, field + \".complete\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.complete, field + \".complete\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"completeness\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNumber$k(d.completeness, field + \".completeness\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.completeness, field + \".completeness\", \"number | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"converted_invoice_urls\" in d) {\n" +
"            checkArray$d(d.converted_invoice_urls, field + \".converted_invoice_urls\");\n" +
"            if (d.converted_invoice_urls) {\n" +
"                for (let i = 0; i < d.converted_invoice_urls.length; i++) {\n" +
"                    checkNever$6(d.converted_invoice_urls[i], field + \".converted_invoice_urls\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        if (\"credit_notes_amount\" in d) {\n" +
"            checkString$m(d.credit_notes_amount, field + \".credit_notes_amount\");\n" +
"        }\n" +
"        if (\"currency\" in d) {\n" +
"            checkString$m(d.currency, field + \".currency\");\n" +
"        }\n" +
"        if (\"currency_amount\" in d) {\n" +
"            checkString$m(d.currency_amount, field + \".currency_amount\");\n" +
"        }\n" +
"        if (\"currency_amount_before_tax\" in d) {\n" +
"            checkString$m(d.currency_amount_before_tax, field + \".currency_amount_before_tax\");\n" +
"        }\n" +
"        if (\"currency_price_before_tax\" in d) {\n" +
"            checkString$m(d.currency_price_before_tax, field + \".currency_price_before_tax\");\n" +
"        }\n" +
"        if (\"currency_tax\" in d) {\n" +
"            checkString$m(d.currency_tax, field + \".currency_tax\");\n" +
"        }\n" +
"        if (\"custom_payment_reference\" in d) {\n" +
"            checkString$m(d.custom_payment_reference, field + \".custom_payment_reference\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.date, field + \".date\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.date, field + \".date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"deadline\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.deadline, field + \".deadline\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.deadline, field + \".deadline\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"direction\" in d) {\n" +
"            checkString$m(d.direction, field + \".direction\");\n" +
"        }\n" +
"        if (\"discount\" in d) {\n" +
"            checkString$m(d.discount, field + \".discount\");\n" +
"        }\n" +
"        if (\"discount_type\" in d) {\n" +
"            checkString$m(d.discount_type, field + \".discount_type\");\n" +
"        }\n" +
"        checkBoolean$d(d.draft, field + \".draft\");\n" +
"        checkNull$h(d.email_from, field + \".email_from\");\n" +
"        if (\"estimate_status\" in d) {\n" +
"            checkNull$h(d.estimate_status, field + \".estimate_status\");\n" +
"        }\n" +
"        checkString$m(d.external_id, field + \".external_id\");\n" +
"        if (\"factor_status\" in d) {\n" +
"            checkString$m(d.factor_status, field + \".factor_status\");\n" +
"        }\n" +
"        checkString$m(d.fec_pieceref, field + \".fec_pieceref\");\n" +
"        if (\"finalized_at\" in d) {\n" +
"            checkNull$h(d.finalized_at, field + \".finalized_at\");\n" +
"        }\n" +
"        if (\"from_estimate_id\" in d) {\n" +
"            checkNull$h(d.from_estimate_id, field + \".from_estimate_id\");\n" +
"        }\n" +
"        if (\"future_in_days\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNumber$k(d.future_in_days, field + \".future_in_days\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.future_in_days, field + \".future_in_days\", \"number | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.gdrive_path, field + \".gdrive_path\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.gdrive_path, field + \".gdrive_path\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"gross_amount\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.gross_amount, field + \".gross_amount\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.gross_amount, field + \".gross_amount\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.group_uuid, field + \".group_uuid\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.grouped_at, field + \".grouped_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.grouped_at, field + \".grouped_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$d(d.grouped_documents, field + \".grouped_documents\");\n" +
"        if (d.grouped_documents) {\n" +
"            for (let i = 0; i < d.grouped_documents.length; i++) {\n" +
"                d.grouped_documents[i] = GroupedDocumentsEntity$1.Create(d.grouped_documents[i], field + \".grouped_documents\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        if (\"iban\" in d) {\n" +
"            checkString$m(d.iban, field + \".iban\");\n" +
"        }\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        if (\"invoice_kind\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.invoice_kind, field + \".invoice_kind\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$m(d.invoice_kind, field + \".invoice_kind\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"invoice_number\" in d) {\n" +
"            checkString$m(d.invoice_number, field + \".invoice_number\");\n" +
"        }\n" +
"        if (\"invoicing_detailed_source\" in d) {\n" +
"            checkNull$h(d.invoicing_detailed_source, field + \".invoicing_detailed_source\");\n" +
"        }\n" +
"        if (\"is_credit_note\" in d) {\n" +
"            checkBoolean$d(d.is_credit_note, field + \".is_credit_note\");\n" +
"        }\n" +
"        if (\"is_destroyable\" in d) {\n" +
"            checkBoolean$d(d.is_destroyable, field + \".is_destroyable\");\n" +
"        }\n" +
"        if (\"is_estimate\" in d) {\n" +
"            checkBoolean$d(d.is_estimate, field + \".is_estimate\");\n" +
"        }\n" +
"        checkBoolean$d(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        if (\"is_waiting_for_ocr\" in d) {\n" +
"            checkBoolean$d(d.is_waiting_for_ocr, field + \".is_waiting_for_ocr\");\n" +
"        }\n" +
"        checkNumber$k(d.journal_id, field + \".journal_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.label, field + \".label\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.label, field + \".label\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"language\" in d) {\n" +
"            checkString$m(d.language, field + \".language\");\n" +
"        }\n" +
"        if (\"manual_partial_invoices\" in d) {\n" +
"            checkBoolean$d(d.manual_partial_invoices, field + \".manual_partial_invoices\");\n" +
"        }\n" +
"        checkString$m(d.method, field + \".method\");\n" +
"        if (\"multiplier\" in d) {\n" +
"            checkNumber$k(d.multiplier, field + \".multiplier\");\n" +
"        }\n" +
"        if (\"not_duplicate\" in d) {\n" +
"            checkBoolean$d(d.not_duplicate, field + \".not_duplicate\");\n" +
"        }\n" +
"        if (\"ocr_thirdparty_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.ocr_thirdparty_id, field + \".ocr_thirdparty_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$k(d.ocr_thirdparty_id, field + \".ocr_thirdparty_id\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"outstanding_balance\" in d) {\n" +
"            checkString$m(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        }\n" +
"        if (\"paid\" in d) {\n" +
"            checkBoolean$d(d.paid, field + \".paid\");\n" +
"        }\n" +
"        if (\"payment_id\" in d) {\n" +
"            checkNull$h(d.payment_id, field + \".payment_id\");\n" +
"        }\n" +
"        if (\"payment_method\" in d) {\n" +
"            checkNull$h(d.payment_method, field + \".payment_method\");\n" +
"        }\n" +
"        if (\"payment_reference\" in d) {\n" +
"            checkString$m(d.payment_reference, field + \".payment_reference\");\n" +
"        }\n" +
"        if (\"payment_reminder_enabled\" in d) {\n" +
"            checkBoolean$d(d.payment_reminder_enabled, field + \".payment_reminder_enabled\");\n" +
"        }\n" +
"        if (\"payment_status\" in d) {\n" +
"            checkString$m(d.payment_status, field + \".payment_status\");\n" +
"        }\n" +
"        checkString$m(d.pdf_generation_status, field + \".pdf_generation_status\");\n" +
"        if (\"pdf_invoice_display_products_list\" in d) {\n" +
"            checkBoolean$d(d.pdf_invoice_display_products_list, field + \".pdf_invoice_display_products_list\");\n" +
"        }\n" +
"        if (\"pdf_invoice_free_text\" in d) {\n" +
"            checkString$m(d.pdf_invoice_free_text, field + \".pdf_invoice_free_text\");\n" +
"        }\n" +
"        if (\"pdf_invoice_free_text_enabled\" in d) {\n" +
"            checkBoolean$d(d.pdf_invoice_free_text_enabled, field + \".pdf_invoice_free_text_enabled\");\n" +
"        }\n" +
"        if (\"pdf_invoice_subject\" in d) {\n" +
"            checkString$m(d.pdf_invoice_subject, field + \".pdf_invoice_subject\");\n" +
"        }\n" +
"        if (\"pdf_invoice_subject_enabled\" in d) {\n" +
"            checkBoolean$d(d.pdf_invoice_subject_enabled, field + \".pdf_invoice_subject_enabled\");\n" +
"        }\n" +
"        if (\"pdf_invoice_title\" in d) {\n" +
"            checkString$m(d.pdf_invoice_title, field + \".pdf_invoice_title\");\n" +
"        }\n" +
"        if (\"pdf_paid_stamp\" in d) {\n" +
"            checkBoolean$d(d.pdf_paid_stamp, field + \".pdf_paid_stamp\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.preview_status, field + \".preview_status\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.preview_status, field + \".preview_status\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"price_before_tax\" in d) {\n" +
"            checkString$m(d.price_before_tax, field + \".price_before_tax\");\n" +
"        }\n" +
"        checkString$m(d.pusher_channel, field + \".pusher_channel\");\n" +
"        if (\"quote_group_uuid\" in d) {\n" +
"            checkString$m(d.quote_group_uuid, field + \".quote_group_uuid\");\n" +
"        }\n" +
"        if (\"quote_uid\" in d) {\n" +
"            checkNull$h(d.quote_uid, field + \".quote_uid\");\n" +
"        }\n" +
"        checkBoolean$d(d.quotes, field + \".quotes\");\n" +
"        checkBoolean$d(d.readonly, field + \".readonly\");\n" +
"        if (\"recipients\" in d) {\n" +
"            checkArray$d(d.recipients, field + \".recipients\");\n" +
"            if (d.recipients) {\n" +
"                for (let i = 0; i < d.recipients.length; i++) {\n" +
"                    checkNever$6(d.recipients[i], field + \".recipients\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkNull$h(d.reversal_origin_id, field + \".reversal_origin_id\");\n" +
"        checkNull$h(d.score, field + \".score\");\n" +
"        if (\"scored_invoices\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                d.scored_invoices = ScoredInvoices.Create(d.scored_invoices, field + \".scored_invoices\", \"ScoredInvoices | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.scored_invoices, field + \".scored_invoices\", \"ScoredInvoices | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"scored_transactions\" in d) {\n" +
"            checkArray$d(d.scored_transactions, field + \".scored_transactions\");\n" +
"            if (d.scored_transactions) {\n" +
"                for (let i = 0; i < d.scored_transactions.length; i++) {\n" +
"                    checkNever$6(d.scored_transactions[i], field + \".scored_transactions\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.source, field + \".source\");\n" +
"        if (\"special_mention\" in d) {\n" +
"            checkNull$h(d.special_mention, field + \".special_mention\");\n" +
"        }\n" +
"        if (\"status\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.status, field + \".status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.status, field + \".status\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"tax\" in d) {\n" +
"            checkString$m(d.tax, field + \".tax\");\n" +
"        }\n" +
"        if (\"thirdparty_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.thirdparty_id, field + \".thirdparty_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$k(d.thirdparty_id, field + \".thirdparty_id\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.type, field + \".type\");\n" +
"        checkString$m(d.updated_at, field + \".updated_at\");\n" +
"        checkString$m(d.url, field + \".url\");\n" +
"        if (\"validation_needed\" in d) {\n" +
"            checkBoolean$d(d.validation_needed, field + \".validation_needed\");\n" +
"        }\n" +
"        const knownProperties = [\"account_id\", \"accounting_type\", \"amount\", \"archived\", \"archived_at\", \"attachment_lost\", \"attachment_required\", \"billing_subscription_id\", \"can_be_stamped_as_paid_in_pdf\", \"company\", \"company_id\", \"complete\", \"completeness\", \"converted_invoice_urls\", \"created_at\", \"credit_notes_amount\", \"currency\", \"currency_amount\", \"currency_amount_before_tax\", \"currency_price_before_tax\", \"currency_tax\", \"custom_payment_reference\", \"date\", \"deadline\", \"direction\", \"discount\", \"discount_type\", \"draft\", \"email_from\", \"estimate_status\", \"external_id\", \"factor_status\", \"fec_pieceref\", \"finalized_at\", \"from_estimate_id\", \"future_in_days\", \"gdrive_path\", \"gross_amount\", \"group_uuid\", \"grouped_at\", \"grouped_documents\", \"iban\", \"id\", \"invoice_kind\", \"invoice_number\", \"invoicing_detailed_source\", \"is_credit_note\", \"is_destroyable\", \"is_estimate\", \"is_waiting_details\", \"is_waiting_for_ocr\", \"journal_id\", \"label\", \"language\", \"manual_partial_invoices\", \"method\", \"multiplier\", \"not_duplicate\", \"ocr_thirdparty_id\", \"outstanding_balance\", \"paid\", \"payment_id\", \"payment_method\", \"payment_reference\", \"payment_reminder_enabled\", \"payment_status\", \"pdf_generation_status\", \"pdf_invoice_display_products_list\", \"pdf_invoice_free_text\", \"pdf_invoice_free_text_enabled\", \"pdf_invoice_subject\", \"pdf_invoice_subject_enabled\", \"pdf_invoice_title\", \"pdf_paid_stamp\", \"preview_status\", \"price_before_tax\", \"pusher_channel\", \"quote_group_uuid\", \"quote_uid\", \"quotes\", \"readonly\", \"recipients\", \"reversal_origin_id\", \"score\", \"scored_invoices\", \"scored_transactions\", \"source\", \"special_mention\", \"status\", \"tax\", \"thirdparty_id\", \"type\", \"updated_at\", \"url\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDocument(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"account_id\" in d)\n" +
"            this.account_id = d.account_id;\n" +
"        this.accounting_type = d.accounting_type;\n" +
"        if (\"amount\" in d)\n" +
"            this.amount = d.amount;\n" +
"        this.archived = d.archived;\n" +
"        this.archived_at = d.archived_at;\n" +
"        this.attachment_lost = d.attachment_lost;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.billing_subscription_id = d.billing_subscription_id;\n" +
"        if (\"can_be_stamped_as_paid_in_pdf\" in d)\n" +
"            this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;\n" +
"        if (\"company\" in d)\n" +
"            this.company = d.company;\n" +
"        this.company_id = d.company_id;\n" +
"        if (\"complete\" in d)\n" +
"            this.complete = d.complete;\n" +
"        if (\"completeness\" in d)\n" +
"            this.completeness = d.completeness;\n" +
"        if (\"converted_invoice_urls\" in d)\n" +
"            this.converted_invoice_urls = d.converted_invoice_urls;\n" +
"        this.created_at = d.created_at;\n" +
"        if (\"credit_notes_amount\" in d)\n" +
"            this.credit_notes_amount = d.credit_notes_amount;\n" +
"        if (\"currency\" in d)\n" +
"            this.currency = d.currency;\n" +
"        if (\"currency_amount\" in d)\n" +
"            this.currency_amount = d.currency_amount;\n" +
"        if (\"currency_amount_before_tax\" in d)\n" +
"            this.currency_amount_before_tax = d.currency_amount_before_tax;\n" +
"        if (\"currency_price_before_tax\" in d)\n" +
"            this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        if (\"currency_tax\" in d)\n" +
"            this.currency_tax = d.currency_tax;\n" +
"        if (\"custom_payment_reference\" in d)\n" +
"            this.custom_payment_reference = d.custom_payment_reference;\n" +
"        this.date = d.date;\n" +
"        if (\"deadline\" in d)\n" +
"            this.deadline = d.deadline;\n" +
"        if (\"direction\" in d)\n" +
"            this.direction = d.direction;\n" +
"        if (\"discount\" in d)\n" +
"            this.discount = d.discount;\n" +
"        if (\"discount_type\" in d)\n" +
"            this.discount_type = d.discount_type;\n" +
"        this.draft = d.draft;\n" +
"        this.email_from = d.email_from;\n" +
"        if (\"estimate_status\" in d)\n" +
"            this.estimate_status = d.estimate_status;\n" +
"        this.external_id = d.external_id;\n" +
"        if (\"factor_status\" in d)\n" +
"            this.factor_status = d.factor_status;\n" +
"        this.fec_pieceref = d.fec_pieceref;\n" +
"        if (\"finalized_at\" in d)\n" +
"            this.finalized_at = d.finalized_at;\n" +
"        if (\"from_estimate_id\" in d)\n" +
"            this.from_estimate_id = d.from_estimate_id;\n" +
"        if (\"future_in_days\" in d)\n" +
"            this.future_in_days = d.future_in_days;\n" +
"        this.gdrive_path = d.gdrive_path;\n" +
"        if (\"gross_amount\" in d)\n" +
"            this.gross_amount = d.gross_amount;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.grouped_at = d.grouped_at;\n" +
"        this.grouped_documents = d.grouped_documents;\n" +
"        if (\"iban\" in d)\n" +
"            this.iban = d.iban;\n" +
"        this.id = d.id;\n" +
"        if (\"invoice_kind\" in d)\n" +
"            this.invoice_kind = d.invoice_kind;\n" +
"        if (\"invoice_number\" in d)\n" +
"            this.invoice_number = d.invoice_number;\n" +
"        if (\"invoicing_detailed_source\" in d)\n" +
"            this.invoicing_detailed_source = d.invoicing_detailed_source;\n" +
"        if (\"is_credit_note\" in d)\n" +
"            this.is_credit_note = d.is_credit_note;\n" +
"        if (\"is_destroyable\" in d)\n" +
"            this.is_destroyable = d.is_destroyable;\n" +
"        if (\"is_estimate\" in d)\n" +
"            this.is_estimate = d.is_estimate;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        if (\"is_waiting_for_ocr\" in d)\n" +
"            this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        this.journal_id = d.journal_id;\n" +
"        this.label = d.label;\n" +
"        if (\"language\" in d)\n" +
"            this.language = d.language;\n" +
"        if (\"manual_partial_invoices\" in d)\n" +
"            this.manual_partial_invoices = d.manual_partial_invoices;\n" +
"        this.method = d.method;\n" +
"        if (\"multiplier\" in d)\n" +
"            this.multiplier = d.multiplier;\n" +
"        if (\"not_duplicate\" in d)\n" +
"            this.not_duplicate = d.not_duplicate;\n" +
"        if (\"ocr_thirdparty_id\" in d)\n" +
"            this.ocr_thirdparty_id = d.ocr_thirdparty_id;\n" +
"        if (\"outstanding_balance\" in d)\n" +
"            this.outstanding_balance = d.outstanding_balance;\n" +
"        if (\"paid\" in d)\n" +
"            this.paid = d.paid;\n" +
"        if (\"payment_id\" in d)\n" +
"            this.payment_id = d.payment_id;\n" +
"        if (\"payment_method\" in d)\n" +
"            this.payment_method = d.payment_method;\n" +
"        if (\"payment_reference\" in d)\n" +
"            this.payment_reference = d.payment_reference;\n" +
"        if (\"payment_reminder_enabled\" in d)\n" +
"            this.payment_reminder_enabled = d.payment_reminder_enabled;\n" +
"        if (\"payment_status\" in d)\n" +
"            this.payment_status = d.payment_status;\n" +
"        this.pdf_generation_status = d.pdf_generation_status;\n" +
"        if (\"pdf_invoice_display_products_list\" in d)\n" +
"            this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;\n" +
"        if (\"pdf_invoice_free_text\" in d)\n" +
"            this.pdf_invoice_free_text = d.pdf_invoice_free_text;\n" +
"        if (\"pdf_invoice_free_text_enabled\" in d)\n" +
"            this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;\n" +
"        if (\"pdf_invoice_subject\" in d)\n" +
"            this.pdf_invoice_subject = d.pdf_invoice_subject;\n" +
"        if (\"pdf_invoice_subject_enabled\" in d)\n" +
"            this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;\n" +
"        if (\"pdf_invoice_title\" in d)\n" +
"            this.pdf_invoice_title = d.pdf_invoice_title;\n" +
"        if (\"pdf_paid_stamp\" in d)\n" +
"            this.pdf_paid_stamp = d.pdf_paid_stamp;\n" +
"        this.preview_status = d.preview_status;\n" +
"        if (\"price_before_tax\" in d)\n" +
"            this.price_before_tax = d.price_before_tax;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        if (\"quote_group_uuid\" in d)\n" +
"            this.quote_group_uuid = d.quote_group_uuid;\n" +
"        if (\"quote_uid\" in d)\n" +
"            this.quote_uid = d.quote_uid;\n" +
"        this.quotes = d.quotes;\n" +
"        this.readonly = d.readonly;\n" +
"        if (\"recipients\" in d)\n" +
"            this.recipients = d.recipients;\n" +
"        this.reversal_origin_id = d.reversal_origin_id;\n" +
"        this.score = d.score;\n" +
"        if (\"scored_invoices\" in d)\n" +
"            this.scored_invoices = d.scored_invoices;\n" +
"        if (\"scored_transactions\" in d)\n" +
"            this.scored_transactions = d.scored_transactions;\n" +
"        this.source = d.source;\n" +
"        if (\"special_mention\" in d)\n" +
"            this.special_mention = d.special_mention;\n" +
"        if (\"status\" in d)\n" +
"            this.status = d.status;\n" +
"        if (\"tax\" in d)\n" +
"            this.tax = d.tax;\n" +
"        if (\"thirdparty_id\" in d)\n" +
"            this.thirdparty_id = d.thirdparty_id;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.url = d.url;\n" +
"        if (\"validation_needed\" in d)\n" +
"            this.validation_needed = d.validation_needed;\n" +
"    }\n" +
"}\n" +
"class Company {\n" +
"    static Parse(d) {\n" +
"        return Company.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        const knownProperties = [\"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Company(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.name = d.name;\n" +
"    }\n" +
"}\n" +
"let GroupedDocumentsEntity$1 = class GroupedDocumentsEntity {\n" +
"    static Parse(d) {\n" +
"        return GroupedDocumentsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        if (\"account\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.account, field + \".account\", \"null | Account\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    d.account = Account$1.Create(d.account, field + \".account\", \"null | Account\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"account_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.account_id, field + \".account_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$k(d.account_id, field + \".account_id\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"accounting_status\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.accounting_status, field + \".accounting_status\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$m(d.accounting_status, field + \".accounting_status\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.accounting_type, field + \".accounting_type\");\n" +
"        if (\"amount\" in d) {\n" +
"            checkString$m(d.amount, field + \".amount\");\n" +
"        }\n" +
"        checkBoolean$d(d.archived, field + \".archived\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"attachment_label\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.attachment_label, field + \".attachment_label\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.attachment_label, field + \".attachment_label\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.attachment_lost, field + \".attachment_lost\");\n" +
"        checkBoolean$d(d.attachment_required, field + \".attachment_required\");\n" +
"        checkNull$h(d.billing_subscription_id, field + \".billing_subscription_id\");\n" +
"        if (\"can_be_stamped_as_paid_in_pdf\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.can_be_stamped_as_paid_in_pdf, field + \".can_be_stamped_as_paid_in_pdf\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.can_be_stamped_as_paid_in_pdf, field + \".can_be_stamped_as_paid_in_pdf\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkArray$d(d.client_comments, field + \".client_comments\");\n" +
"        if (d.client_comments) {\n" +
"            for (let i = 0; i < d.client_comments.length; i++) {\n" +
"                d.client_comments[i] = ClientCommentsEntityOrEstablishmentComment.Create(d.client_comments[i], field + \".client_comments\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        if (\"company\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.company, field + \".company\", \"null | Company1\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    d.company = Company1.Create(d.company, field + \".company\", \"null | Company1\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        if (\"complete\" in d) {\n" +
"            checkBoolean$d(d.complete, field + \".complete\");\n" +
"        }\n" +
"        if (\"completeness\" in d) {\n" +
"            checkNumber$k(d.completeness, field + \".completeness\");\n" +
"        }\n" +
"        if (\"converted_invoice_urls\" in d) {\n" +
"            checkArray$d(d.converted_invoice_urls, field + \".converted_invoice_urls\");\n" +
"            if (d.converted_invoice_urls) {\n" +
"                for (let i = 0; i < d.converted_invoice_urls.length; i++) {\n" +
"                    checkNever$6(d.converted_invoice_urls[i], field + \".converted_invoice_urls\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        if (\"credit_notes_amount\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.credit_notes_amount, field + \".credit_notes_amount\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.credit_notes_amount, field + \".credit_notes_amount\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"currency\" in d) {\n" +
"            checkString$m(d.currency, field + \".currency\");\n" +
"        }\n" +
"        if (\"currency_amount\" in d) {\n" +
"            checkString$m(d.currency_amount, field + \".currency_amount\");\n" +
"        }\n" +
"        if (\"currency_amount_before_tax\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.currency_amount_before_tax, field + \".currency_amount_before_tax\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.currency_amount_before_tax, field + \".currency_amount_before_tax\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"currency_price_before_tax\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.currency_price_before_tax, field + \".currency_price_before_tax\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.currency_price_before_tax, field + \".currency_price_before_tax\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"currency_tax\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.currency_tax, field + \".currency_tax\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.currency_tax, field + \".currency_tax\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"current_account_plan_item\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.current_account_plan_item, field + \".current_account_plan_item\", \"null | PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    d.current_account_plan_item = PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem.Create(d.current_account_plan_item, field + \".current_account_plan_item\", \"null | PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"custom_payment_reference\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.custom_payment_reference, field + \".custom_payment_reference\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.custom_payment_reference, field + \".custom_payment_reference\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.date, field + \".date\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.date, field + \".date\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"deadline\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.deadline, field + \".deadline\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$m(d.deadline, field + \".deadline\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"direction\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.direction, field + \".direction\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.direction, field + \".direction\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"discount\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.discount, field + \".discount\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.discount, field + \".discount\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"discount_type\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.discount_type, field + \".discount_type\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.discount_type, field + \".discount_type\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.draft, field + \".draft\");\n" +
"        checkNull$h(d.email_from, field + \".email_from\");\n" +
"        if (\"embeddable_in_browser\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.embeddable_in_browser, field + \".embeddable_in_browser\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.embeddable_in_browser, field + \".embeddable_in_browser\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"establishment_comment\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.establishment_comment, field + \".establishment_comment\", \"null | EstablishmentCommentOrClientCommentsEntity\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    d.establishment_comment = EstablishmentCommentOrClientCommentsEntity.Create(d.establishment_comment, field + \".establishment_comment\", \"null | EstablishmentCommentOrClientCommentsEntity\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"estimate_status\" in d) {\n" +
"            checkNull$h(d.estimate_status, field + \".estimate_status\");\n" +
"        }\n" +
"        checkString$m(d.external_id, field + \".external_id\");\n" +
"        if (\"factor_status\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.factor_status, field + \".factor_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.factor_status, field + \".factor_status\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.fec_pieceref, field + \".fec_pieceref\");\n" +
"        if (\"file_signed_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.file_signed_id, field + \".file_signed_id\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.file_signed_id, field + \".file_signed_id\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.filename, field + \".filename\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.filename, field + \".filename\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"finalized_at\" in d) {\n" +
"            checkNull$h(d.finalized_at, field + \".finalized_at\");\n" +
"        }\n" +
"        if (\"from_estimate_id\" in d) {\n" +
"            checkNull$h(d.from_estimate_id, field + \".from_estimate_id\");\n" +
"        }\n" +
"        if (\"future_in_days\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNumber$k(d.future_in_days, field + \".future_in_days\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.future_in_days, field + \".future_in_days\", \"number | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.gdrive_path, field + \".gdrive_path\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.gdrive_path, field + \".gdrive_path\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"gross_amount\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.gross_amount, field + \".gross_amount\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$m(d.gross_amount, field + \".gross_amount\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.group_uuid, field + \".group_uuid\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.grouped_at, field + \".grouped_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.grouped_at, field + \".grouped_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.has_file, field + \".has_file\");\n" +
"        if (\"has_linked_quotes\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.has_linked_quotes, field + \".has_linked_quotes\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.has_linked_quotes, field + \".has_linked_quotes\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.hasTooManyLedgerEvents, field + \".hasTooManyLedgerEvents\");\n" +
"        if (\"iban\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.iban, field + \".iban\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.iban, field + \".iban\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        if (\"incomplete\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.incomplete, field + \".incomplete\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.incomplete, field + \".incomplete\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"invoice_kind\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.invoice_kind, field + \".invoice_kind\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.invoice_kind, field + \".invoice_kind\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"invoice_lines\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkArray$d(d.invoice_lines, field + \".invoice_lines\", \"InvoiceLinesEntity[] | null\");\n" +
"                if (d.invoice_lines) {\n" +
"                    for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                        d.invoice_lines[i] = InvoiceLinesEntity$2.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"                    }\n" +
"                }\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.invoice_lines, field + \".invoice_lines\", \"InvoiceLinesEntity[] | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"invoice_number\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.invoice_number, field + \".invoice_number\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.invoice_number, field + \".invoice_number\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"invoicing_detailed_source\" in d) {\n" +
"            checkNull$h(d.invoicing_detailed_source, field + \".invoicing_detailed_source\");\n" +
"        }\n" +
"        if (\"is_accounting_needed\" in d) {\n" +
"            checkNull$h(d.is_accounting_needed, field + \".is_accounting_needed\");\n" +
"        }\n" +
"        if (\"is_credit_note\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.is_credit_note, field + \".is_credit_note\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.is_credit_note, field + \".is_credit_note\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"is_destroyable\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.is_destroyable, field + \".is_destroyable\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.is_destroyable, field + \".is_destroyable\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"is_estimate\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.is_estimate, field + \".is_estimate\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.is_estimate, field + \".is_estimate\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"is_sendable\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.is_sendable, field + \".is_sendable\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.is_sendable, field + \".is_sendable\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        if (\"is_waiting_for_ocr\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.is_waiting_for_ocr, field + \".is_waiting_for_ocr\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.is_waiting_for_ocr, field + \".is_waiting_for_ocr\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        d.journal = Journal$1.Create(d.journal, field + \".journal\");\n" +
"        checkNumber$k(d.journal_id, field + \".journal_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.label, field + \".label\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.label, field + \".label\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"language\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.language, field + \".language\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.language, field + \".language\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkArray$d(d.ledgerEvents, field + \".ledgerEvents\");\n" +
"        if (d.ledgerEvents) {\n" +
"            for (let i = 0; i < d.ledgerEvents.length; i++) {\n" +
"                d.ledgerEvents[i] = LedgerEventsEntity.Create(d.ledgerEvents[i], field + \".ledgerEvents\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$k(d.ledgerEventsCount, field + \".ledgerEventsCount\");\n" +
"        if (\"manual_partial_invoices\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.manual_partial_invoices, field + \".manual_partial_invoices\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.manual_partial_invoices, field + \".manual_partial_invoices\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.method, field + \".method\");\n" +
"        if (\"multiplier\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNumber$k(d.multiplier, field + \".multiplier\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.multiplier, field + \".multiplier\", \"number | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"not_duplicate\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.not_duplicate, field + \".not_duplicate\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.not_duplicate, field + \".not_duplicate\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"ocr_thirdparty_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.ocr_thirdparty_id, field + \".ocr_thirdparty_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$k(d.ocr_thirdparty_id, field + \".ocr_thirdparty_id\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"outstanding_balance\" in d) {\n" +
"            checkString$m(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        }\n" +
"        if (\"pages_count\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNumber$k(d.pages_count, field + \".pages_count\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.pages_count, field + \".pages_count\", \"number | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"paid\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.paid, field + \".paid\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.paid, field + \".paid\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"payment_id\" in d) {\n" +
"            checkNull$h(d.payment_id, field + \".payment_id\");\n" +
"        }\n" +
"        if (\"payment_method\" in d) {\n" +
"            checkNull$h(d.payment_method, field + \".payment_method\");\n" +
"        }\n" +
"        if (\"payment_reference\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.payment_reference, field + \".payment_reference\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.payment_reference, field + \".payment_reference\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"payment_reminder_enabled\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.payment_reminder_enabled, field + \".payment_reminder_enabled\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.payment_reminder_enabled, field + \".payment_reminder_enabled\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"payment_status\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.payment_status, field + \".payment_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.payment_status, field + \".payment_status\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.pdf_generation_status, field + \".pdf_generation_status\");\n" +
"        if (\"pdf_invoice_display_products_list\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.pdf_invoice_display_products_list, field + \".pdf_invoice_display_products_list\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.pdf_invoice_display_products_list, field + \".pdf_invoice_display_products_list\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"pdf_invoice_free_text\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.pdf_invoice_free_text, field + \".pdf_invoice_free_text\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.pdf_invoice_free_text, field + \".pdf_invoice_free_text\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"pdf_invoice_free_text_enabled\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.pdf_invoice_free_text_enabled, field + \".pdf_invoice_free_text_enabled\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.pdf_invoice_free_text_enabled, field + \".pdf_invoice_free_text_enabled\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"pdf_invoice_subject\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.pdf_invoice_subject, field + \".pdf_invoice_subject\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.pdf_invoice_subject, field + \".pdf_invoice_subject\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"pdf_invoice_subject_enabled\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.pdf_invoice_subject_enabled, field + \".pdf_invoice_subject_enabled\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.pdf_invoice_subject_enabled, field + \".pdf_invoice_subject_enabled\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"pdf_invoice_title\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.pdf_invoice_title, field + \".pdf_invoice_title\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.pdf_invoice_title, field + \".pdf_invoice_title\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"pdf_paid_stamp\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.pdf_paid_stamp, field + \".pdf_paid_stamp\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.pdf_paid_stamp, field + \".pdf_paid_stamp\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.pending, field + \".pending\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.preview_status, field + \".preview_status\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.preview_status, field + \".preview_status\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$d(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString$m(d.preview_urls[i], field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        if (\"price_before_tax\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.price_before_tax, field + \".price_before_tax\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.price_before_tax, field + \".price_before_tax\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.pusher_channel, field + \".pusher_channel\");\n" +
"        if (\"quote_group_uuid\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.quote_group_uuid, field + \".quote_group_uuid\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.quote_group_uuid, field + \".quote_group_uuid\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"quote_uid\" in d) {\n" +
"            checkNull$h(d.quote_uid, field + \".quote_uid\");\n" +
"        }\n" +
"        checkBoolean$d(d.quotes, field + \".quotes\");\n" +
"        checkBoolean$d(d.readonly, field + \".readonly\");\n" +
"        if (\"recipients\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkArray$d(d.recipients, field + \".recipients\", \"never[] | null\");\n" +
"                if (d.recipients) {\n" +
"                    for (let i = 0; i < d.recipients.length; i++) {\n" +
"                        checkNever$6(d.recipients[i], field + \".recipients\" + \"[\" + i + \"]\");\n" +
"                    }\n" +
"                }\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.recipients, field + \".recipients\", \"never[] | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.reconciled, field + \".reconciled\");\n" +
"        checkNull$h(d.reversal_origin_id, field + \".reversal_origin_id\");\n" +
"        checkNull$h(d.score, field + \".score\");\n" +
"        if (\"scored_invoices\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.scored_invoices, field + \".scored_invoices\", \"null | ScoredInvoices1\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    d.scored_invoices = ScoredInvoices1.Create(d.scored_invoices, field + \".scored_invoices\", \"null | ScoredInvoices1\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"scored_transactions\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkArray$d(d.scored_transactions, field + \".scored_transactions\", \"never[] | null\");\n" +
"                if (d.scored_transactions) {\n" +
"                    for (let i = 0; i < d.scored_transactions.length; i++) {\n" +
"                        checkNever$6(d.scored_transactions[i], field + \".scored_transactions\" + \"[\" + i + \"]\");\n" +
"                    }\n" +
"                }\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.scored_transactions, field + \".scored_transactions\", \"never[] | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"size\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.size, field + \".size\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.size, field + \".size\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.source, field + \".source\");\n" +
"        if (\"special_mention\" in d) {\n" +
"            checkNull$h(d.special_mention, field + \".special_mention\");\n" +
"        }\n" +
"        if (\"status\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.status, field + \".status\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$m(d.status, field + \".status\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"subcomplete\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.subcomplete, field + \".subcomplete\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.subcomplete, field + \".subcomplete\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"tagged_at_ledger_events_level\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.tagged_at_ledger_events_level, field + \".tagged_at_ledger_events_level\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.tagged_at_ledger_events_level, field + \".tagged_at_ledger_events_level\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"tax\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$m(d.tax, field + \".tax\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.tax, field + \".tax\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"thirdparty\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                d.thirdparty = Thirdparty$2.Create(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"thirdparty_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$h(d.thirdparty_id, field + \".thirdparty_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$k(d.thirdparty_id, field + \".thirdparty_id\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.type, field + \".type\");\n" +
"        checkString$m(d.updated_at, field + \".updated_at\");\n" +
"        checkString$m(d.url, field + \".url\");\n" +
"        if (\"validation_needed\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.validation_needed, field + \".validation_needed\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.validation_needed, field + \".validation_needed\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"account\", \"account_id\", \"accounting_status\", \"accounting_type\", \"amount\", \"archived\", \"archived_at\", \"attachment_label\", \"attachment_lost\", \"attachment_required\", \"billing_subscription_id\", \"can_be_stamped_as_paid_in_pdf\", \"client_comments\", \"company\", \"company_id\", \"complete\", \"completeness\", \"converted_invoice_urls\", \"created_at\", \"credit_notes_amount\", \"currency\", \"currency_amount\", \"currency_amount_before_tax\", \"currency_price_before_tax\", \"currency_tax\", \"current_account_plan_item\", \"custom_payment_reference\", \"date\", \"deadline\", \"direction\", \"discount\", \"discount_type\", \"draft\", \"email_from\", \"embeddable_in_browser\", \"establishment_comment\", \"estimate_status\", \"external_id\", \"factor_status\", \"fec_pieceref\", \"file_signed_id\", \"filename\", \"finalized_at\", \"from_estimate_id\", \"future_in_days\", \"gdrive_path\", \"gross_amount\", \"group_uuid\", \"grouped_at\", \"has_file\", \"has_linked_quotes\", \"hasTooManyLedgerEvents\", \"iban\", \"id\", \"incomplete\", \"invoice_kind\", \"invoice_lines\", \"invoice_number\", \"invoicing_detailed_source\", \"is_accounting_needed\", \"is_credit_note\", \"is_destroyable\", \"is_estimate\", \"is_sendable\", \"is_waiting_details\", \"is_waiting_for_ocr\", \"journal\", \"journal_id\", \"label\", \"language\", \"ledgerEvents\", \"ledgerEventsCount\", \"manual_partial_invoices\", \"method\", \"multiplier\", \"not_duplicate\", \"ocr_thirdparty_id\", \"outstanding_balance\", \"pages_count\", \"paid\", \"payment_id\", \"payment_method\", \"payment_reference\", \"payment_reminder_enabled\", \"payment_status\", \"pdf_generation_status\", \"pdf_invoice_display_products_list\", \"pdf_invoice_free_text\", \"pdf_invoice_free_text_enabled\", \"pdf_invoice_subject\", \"pdf_invoice_subject_enabled\", \"pdf_invoice_title\", \"pdf_paid_stamp\", \"pending\", \"preview_status\", \"preview_urls\", \"price_before_tax\", \"pusher_channel\", \"quote_group_uuid\", \"quote_uid\", \"quotes\", \"readonly\", \"recipients\", \"reconciled\", \"reversal_origin_id\", \"score\", \"scored_invoices\", \"scored_transactions\", \"size\", \"source\", \"special_mention\", \"status\", \"subcomplete\", \"tagged_at_ledger_events_level\", \"tax\", \"thirdparty\", \"thirdparty_id\", \"type\", \"updated_at\", \"url\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new GroupedDocumentsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"account\" in d)\n" +
"            this.account = d.account;\n" +
"        if (\"account_id\" in d)\n" +
"            this.account_id = d.account_id;\n" +
"        if (\"accounting_status\" in d)\n" +
"            this.accounting_status = d.accounting_status;\n" +
"        this.accounting_type = d.accounting_type;\n" +
"        if (\"amount\" in d)\n" +
"            this.amount = d.amount;\n" +
"        this.archived = d.archived;\n" +
"        this.archived_at = d.archived_at;\n" +
"        if (\"attachment_label\" in d)\n" +
"            this.attachment_label = d.attachment_label;\n" +
"        this.attachment_lost = d.attachment_lost;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.billing_subscription_id = d.billing_subscription_id;\n" +
"        if (\"can_be_stamped_as_paid_in_pdf\" in d)\n" +
"            this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;\n" +
"        this.client_comments = d.client_comments;\n" +
"        if (\"company\" in d)\n" +
"            this.company = d.company;\n" +
"        this.company_id = d.company_id;\n" +
"        if (\"complete\" in d)\n" +
"            this.complete = d.complete;\n" +
"        if (\"completeness\" in d)\n" +
"            this.completeness = d.completeness;\n" +
"        if (\"converted_invoice_urls\" in d)\n" +
"            this.converted_invoice_urls = d.converted_invoice_urls;\n" +
"        this.created_at = d.created_at;\n" +
"        if (\"credit_notes_amount\" in d)\n" +
"            this.credit_notes_amount = d.credit_notes_amount;\n" +
"        if (\"currency\" in d)\n" +
"            this.currency = d.currency;\n" +
"        if (\"currency_amount\" in d)\n" +
"            this.currency_amount = d.currency_amount;\n" +
"        if (\"currency_amount_before_tax\" in d)\n" +
"            this.currency_amount_before_tax = d.currency_amount_before_tax;\n" +
"        if (\"currency_price_before_tax\" in d)\n" +
"            this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        if (\"currency_tax\" in d)\n" +
"            this.currency_tax = d.currency_tax;\n" +
"        if (\"current_account_plan_item\" in d)\n" +
"            this.current_account_plan_item = d.current_account_plan_item;\n" +
"        if (\"custom_payment_reference\" in d)\n" +
"            this.custom_payment_reference = d.custom_payment_reference;\n" +
"        this.date = d.date;\n" +
"        if (\"deadline\" in d)\n" +
"            this.deadline = d.deadline;\n" +
"        if (\"direction\" in d)\n" +
"            this.direction = d.direction;\n" +
"        if (\"discount\" in d)\n" +
"            this.discount = d.discount;\n" +
"        if (\"discount_type\" in d)\n" +
"            this.discount_type = d.discount_type;\n" +
"        this.draft = d.draft;\n" +
"        this.email_from = d.email_from;\n" +
"        if (\"embeddable_in_browser\" in d)\n" +
"            this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        if (\"establishment_comment\" in d)\n" +
"            this.establishment_comment = d.establishment_comment;\n" +
"        if (\"estimate_status\" in d)\n" +
"            this.estimate_status = d.estimate_status;\n" +
"        this.external_id = d.external_id;\n" +
"        if (\"factor_status\" in d)\n" +
"            this.factor_status = d.factor_status;\n" +
"        this.fec_pieceref = d.fec_pieceref;\n" +
"        if (\"file_signed_id\" in d)\n" +
"            this.file_signed_id = d.file_signed_id;\n" +
"        this.filename = d.filename;\n" +
"        if (\"finalized_at\" in d)\n" +
"            this.finalized_at = d.finalized_at;\n" +
"        if (\"from_estimate_id\" in d)\n" +
"            this.from_estimate_id = d.from_estimate_id;\n" +
"        if (\"future_in_days\" in d)\n" +
"            this.future_in_days = d.future_in_days;\n" +
"        this.gdrive_path = d.gdrive_path;\n" +
"        if (\"gross_amount\" in d)\n" +
"            this.gross_amount = d.gross_amount;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.grouped_at = d.grouped_at;\n" +
"        this.has_file = d.has_file;\n" +
"        if (\"has_linked_quotes\" in d)\n" +
"            this.has_linked_quotes = d.has_linked_quotes;\n" +
"        this.hasTooManyLedgerEvents = d.hasTooManyLedgerEvents;\n" +
"        if (\"iban\" in d)\n" +
"            this.iban = d.iban;\n" +
"        this.id = d.id;\n" +
"        if (\"incomplete\" in d)\n" +
"            this.incomplete = d.incomplete;\n" +
"        if (\"invoice_kind\" in d)\n" +
"            this.invoice_kind = d.invoice_kind;\n" +
"        if (\"invoice_lines\" in d)\n" +
"            this.invoice_lines = d.invoice_lines;\n" +
"        if (\"invoice_number\" in d)\n" +
"            this.invoice_number = d.invoice_number;\n" +
"        if (\"invoicing_detailed_source\" in d)\n" +
"            this.invoicing_detailed_source = d.invoicing_detailed_source;\n" +
"        if (\"is_accounting_needed\" in d)\n" +
"            this.is_accounting_needed = d.is_accounting_needed;\n" +
"        if (\"is_credit_note\" in d)\n" +
"            this.is_credit_note = d.is_credit_note;\n" +
"        if (\"is_destroyable\" in d)\n" +
"            this.is_destroyable = d.is_destroyable;\n" +
"        if (\"is_estimate\" in d)\n" +
"            this.is_estimate = d.is_estimate;\n" +
"        if (\"is_sendable\" in d)\n" +
"            this.is_sendable = d.is_sendable;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        if (\"is_waiting_for_ocr\" in d)\n" +
"            this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        this.journal = d.journal;\n" +
"        this.journal_id = d.journal_id;\n" +
"        this.label = d.label;\n" +
"        if (\"language\" in d)\n" +
"            this.language = d.language;\n" +
"        this.ledgerEvents = d.ledgerEvents;\n" +
"        this.ledgerEventsCount = d.ledgerEventsCount;\n" +
"        if (\"manual_partial_invoices\" in d)\n" +
"            this.manual_partial_invoices = d.manual_partial_invoices;\n" +
"        this.method = d.method;\n" +
"        if (\"multiplier\" in d)\n" +
"            this.multiplier = d.multiplier;\n" +
"        if (\"not_duplicate\" in d)\n" +
"            this.not_duplicate = d.not_duplicate;\n" +
"        if (\"ocr_thirdparty_id\" in d)\n" +
"            this.ocr_thirdparty_id = d.ocr_thirdparty_id;\n" +
"        if (\"outstanding_balance\" in d)\n" +
"            this.outstanding_balance = d.outstanding_balance;\n" +
"        if (\"pages_count\" in d)\n" +
"            this.pages_count = d.pages_count;\n" +
"        if (\"paid\" in d)\n" +
"            this.paid = d.paid;\n" +
"        if (\"payment_id\" in d)\n" +
"            this.payment_id = d.payment_id;\n" +
"        if (\"payment_method\" in d)\n" +
"            this.payment_method = d.payment_method;\n" +
"        if (\"payment_reference\" in d)\n" +
"            this.payment_reference = d.payment_reference;\n" +
"        if (\"payment_reminder_enabled\" in d)\n" +
"            this.payment_reminder_enabled = d.payment_reminder_enabled;\n" +
"        if (\"payment_status\" in d)\n" +
"            this.payment_status = d.payment_status;\n" +
"        this.pdf_generation_status = d.pdf_generation_status;\n" +
"        if (\"pdf_invoice_display_products_list\" in d)\n" +
"            this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;\n" +
"        if (\"pdf_invoice_free_text\" in d)\n" +
"            this.pdf_invoice_free_text = d.pdf_invoice_free_text;\n" +
"        if (\"pdf_invoice_free_text_enabled\" in d)\n" +
"            this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;\n" +
"        if (\"pdf_invoice_subject\" in d)\n" +
"            this.pdf_invoice_subject = d.pdf_invoice_subject;\n" +
"        if (\"pdf_invoice_subject_enabled\" in d)\n" +
"            this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;\n" +
"        if (\"pdf_invoice_title\" in d)\n" +
"            this.pdf_invoice_title = d.pdf_invoice_title;\n" +
"        if (\"pdf_paid_stamp\" in d)\n" +
"            this.pdf_paid_stamp = d.pdf_paid_stamp;\n" +
"        this.pending = d.pending;\n" +
"        this.preview_status = d.preview_status;\n" +
"        this.preview_urls = d.preview_urls;\n" +
"        if (\"price_before_tax\" in d)\n" +
"            this.price_before_tax = d.price_before_tax;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        if (\"quote_group_uuid\" in d)\n" +
"            this.quote_group_uuid = d.quote_group_uuid;\n" +
"        if (\"quote_uid\" in d)\n" +
"            this.quote_uid = d.quote_uid;\n" +
"        this.quotes = d.quotes;\n" +
"        this.readonly = d.readonly;\n" +
"        if (\"recipients\" in d)\n" +
"            this.recipients = d.recipients;\n" +
"        this.reconciled = d.reconciled;\n" +
"        this.reversal_origin_id = d.reversal_origin_id;\n" +
"        this.score = d.score;\n" +
"        if (\"scored_invoices\" in d)\n" +
"            this.scored_invoices = d.scored_invoices;\n" +
"        if (\"scored_transactions\" in d)\n" +
"            this.scored_transactions = d.scored_transactions;\n" +
"        if (\"size\" in d)\n" +
"            this.size = d.size;\n" +
"        this.source = d.source;\n" +
"        if (\"special_mention\" in d)\n" +
"            this.special_mention = d.special_mention;\n" +
"        if (\"status\" in d)\n" +
"            this.status = d.status;\n" +
"        if (\"subcomplete\" in d)\n" +
"            this.subcomplete = d.subcomplete;\n" +
"        if (\"tagged_at_ledger_events_level\" in d)\n" +
"            this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;\n" +
"        if (\"tax\" in d)\n" +
"            this.tax = d.tax;\n" +
"        if (\"thirdparty\" in d)\n" +
"            this.thirdparty = d.thirdparty;\n" +
"        if (\"thirdparty_id\" in d)\n" +
"            this.thirdparty_id = d.thirdparty_id;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.url = d.url;\n" +
"        if (\"validation_needed\" in d)\n" +
"            this.validation_needed = d.validation_needed;\n" +
"    }\n" +
"};\n" +
"let Account$1 = class Account {\n" +
"    static Parse(d) {\n" +
"        return Account.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.balance, field + \".balance\");\n" +
"        checkString$m(d.bic, field + \".bic\");\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.connection, field + \".connection\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.connection, field + \".connection\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.currency, field + \".currency\");\n" +
"        checkString$m(d.currency_balance, field + \".currency_balance\");\n" +
"        d.establishment = Establishment.Create(d.establishment, field + \".establishment\");\n" +
"        checkNumber$k(d.establishment_id, field + \".establishment_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.iban, field + \".iban\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.iban, field + \".iban\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkString$m(d.label, field + \".label\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.last_successful_sync_at, field + \".last_successful_sync_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.last_successful_sync_at, field + \".last_successful_sync_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.last_sync_at, field + \".last_sync_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.last_sync_at, field + \".last_sync_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$h(d.last_sync_error, field + \".last_sync_error\");\n" +
"        checkNumber$k(d.last_sync_http_code, field + \".last_sync_http_code\");\n" +
"        checkNull$h(d.ledger_events_count, field + \".ledger_events_count\");\n" +
"        checkNull$h(d.ledger_events_max_date, field + \".ledger_events_max_date\");\n" +
"        checkNull$h(d.ledger_events_min_date, field + \".ledger_events_min_date\");\n" +
"        checkString$m(d.merge_url, field + \".merge_url\");\n" +
"        checkString$m(d.method, field + \".method\");\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        checkString$m(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkBoolean$d(d.swan, field + \".swan\");\n" +
"        checkNull$h(d.swan_number, field + \".swan_number\");\n" +
"        checkBoolean$d(d.sync_attachments, field + \".sync_attachments\");\n" +
"        checkBoolean$d(d.sync_customers, field + \".sync_customers\");\n" +
"        checkNull$h(d.sync_since, field + \".sync_since\");\n" +
"        checkBoolean$d(d.synchronized, field + \".synchronized\");\n" +
"        checkNull$h(d.transactions_count, field + \".transactions_count\");\n" +
"        checkString$m(d.updated_at, field + \".updated_at\");\n" +
"        checkString$m(d.url, field + \".url\");\n" +
"        checkBoolean$d(d.use_as_default_for_vat_return, field + \".use_as_default_for_vat_return\");\n" +
"        checkBoolean$d(d.visible, field + \".visible\");\n" +
"        const knownProperties = [\"balance\", \"bic\", \"company_id\", \"connection\", \"currency\", \"currency_balance\", \"establishment\", \"establishment_id\", \"iban\", \"id\", \"label\", \"last_successful_sync_at\", \"last_sync_at\", \"last_sync_error\", \"last_sync_http_code\", \"ledger_events_count\", \"ledger_events_max_date\", \"ledger_events_min_date\", \"merge_url\", \"method\", \"name\", \"pusher_channel\", \"swan\", \"swan_number\", \"sync_attachments\", \"sync_customers\", \"sync_since\", \"synchronized\", \"transactions_count\", \"updated_at\", \"url\", \"use_as_default_for_vat_return\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Account(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.balance = d.balance;\n" +
"        this.bic = d.bic;\n" +
"        this.company_id = d.company_id;\n" +
"        this.connection = d.connection;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_balance = d.currency_balance;\n" +
"        this.establishment = d.establishment;\n" +
"        this.establishment_id = d.establishment_id;\n" +
"        this.iban = d.iban;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.last_successful_sync_at = d.last_successful_sync_at;\n" +
"        this.last_sync_at = d.last_sync_at;\n" +
"        this.last_sync_error = d.last_sync_error;\n" +
"        this.last_sync_http_code = d.last_sync_http_code;\n" +
"        this.ledger_events_count = d.ledger_events_count;\n" +
"        this.ledger_events_max_date = d.ledger_events_max_date;\n" +
"        this.ledger_events_min_date = d.ledger_events_min_date;\n" +
"        this.merge_url = d.merge_url;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.swan = d.swan;\n" +
"        this.swan_number = d.swan_number;\n" +
"        this.sync_attachments = d.sync_attachments;\n" +
"        this.sync_customers = d.sync_customers;\n" +
"        this.sync_since = d.sync_since;\n" +
"        this.synchronized = d.synchronized;\n" +
"        this.transactions_count = d.transactions_count;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.url = d.url;\n" +
"        this.use_as_default_for_vat_return = d.use_as_default_for_vat_return;\n" +
"        this.visible = d.visible;\n" +
"    }\n" +
"};\n" +
"class Establishment {\n" +
"    static Parse(d) {\n" +
"        return Establishment.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkNumber$k(d.accounts_count, field + \".accounts_count\");\n" +
"        checkArray$d(d.bridge_ids, field + \".bridge_ids\");\n" +
"        if (d.bridge_ids) {\n" +
"            for (let i = 0; i < d.bridge_ids.length; i++) {\n" +
"                checkNumber$k(d.bridge_ids[i], field + \".bridge_ids\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$h(d.budgetinsight_id, field + \".budgetinsight_id\");\n" +
"        checkString$m(d.crm_url, field + \".crm_url\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkString$m(d.logo_url, field + \".logo_url\");\n" +
"        checkString$m(d.method, field + \".method\");\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        const knownProperties = [\"accounts_count\", \"bridge_ids\", \"budgetinsight_id\", \"crm_url\", \"id\", \"logo_url\", \"method\", \"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Establishment(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.accounts_count = d.accounts_count;\n" +
"        this.bridge_ids = d.bridge_ids;\n" +
"        this.budgetinsight_id = d.budgetinsight_id;\n" +
"        this.crm_url = d.crm_url;\n" +
"        this.id = d.id;\n" +
"        this.logo_url = d.logo_url;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"    }\n" +
"}\n" +
"class ClientCommentsEntityOrEstablishmentComment {\n" +
"    static Parse(d) {\n" +
"        return ClientCommentsEntityOrEstablishmentComment.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.content, field + \".content\");\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        checkNumber$k(d.record_id, field + \".record_id\");\n" +
"        checkString$m(d.record_type, field + \".record_type\");\n" +
"        checkNull$h(d.rich_content, field + \".rich_content\");\n" +
"        checkBoolean$d(d.seen, field + \".seen\");\n" +
"        checkString$m(d.updated_at, field + \".updated_at\");\n" +
"        d.user = User.Create(d.user, field + \".user\");\n" +
"        checkNumber$k(d.user_id, field + \".user_id\");\n" +
"        const knownProperties = [\"content\", \"created_at\", \"id\", \"name\", \"record_id\", \"record_type\", \"rich_content\", \"seen\", \"updated_at\", \"user\", \"user_id\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ClientCommentsEntityOrEstablishmentComment(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.content = d.content;\n" +
"        this.created_at = d.created_at;\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"        this.record_id = d.record_id;\n" +
"        this.record_type = d.record_type;\n" +
"        this.rich_content = d.rich_content;\n" +
"        this.seen = d.seen;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.user = d.user;\n" +
"        this.user_id = d.user_id;\n" +
"    }\n" +
"}\n" +
"class User {\n" +
"    static Parse(d) {\n" +
"        return User.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.first_name, field + \".first_name\");\n" +
"        checkString$m(d.full_name, field + \".full_name\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkString$m(d.last_name, field + \".last_name\");\n" +
"        checkNull$h(d.profile_picture_url, field + \".profile_picture_url\");\n" +
"        const knownProperties = [\"first_name\", \"full_name\", \"id\", \"last_name\", \"profile_picture_url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new User(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.id = d.id;\n" +
"        this.last_name = d.last_name;\n" +
"        this.profile_picture_url = d.profile_picture_url;\n" +
"    }\n" +
"}\n" +
"class Company1 {\n" +
"    static Parse(d) {\n" +
"        return Company1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        const knownProperties = [\"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Company1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.name = d.name;\n" +
"    }\n" +
"}\n" +
"class PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        checkString$m(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$d(d.enabled, field + \".enabled\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkNull$h(d.internal_identifier, field + \".internal_identifier\");\n" +
"        checkString$m(d.label, field + \".label\");\n" +
"        checkBoolean$d(d.label_is_editable, field + \".label_is_editable\");\n" +
"        checkString$m(d.number, field + \".number\");\n" +
"        checkString$m(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"        this.number = d.number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"class EstablishmentCommentOrClientCommentsEntity {\n" +
"    static Parse(d) {\n" +
"        return EstablishmentCommentOrClientCommentsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        if (\"author\" in d) {\n" +
"            checkNull$h(d.author, field + \".author\");\n" +
"        }\n" +
"        checkString$m(d.content, field + \".content\");\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        checkNumber$k(d.record_id, field + \".record_id\");\n" +
"        checkString$m(d.record_type, field + \".record_type\");\n" +
"        checkNull$h(d.rich_content, field + \".rich_content\");\n" +
"        checkBoolean$d(d.seen, field + \".seen\");\n" +
"        checkString$m(d.updated_at, field + \".updated_at\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.user, field + \".user\", \"null | User\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.user = User.Create(d.user, field + \".user\", \"null | User\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.user_id, field + \".user_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$k(d.user_id, field + \".user_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"author\", \"content\", \"created_at\", \"id\", \"name\", \"record_id\", \"record_type\", \"rich_content\", \"seen\", \"updated_at\", \"user\", \"user_id\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new EstablishmentCommentOrClientCommentsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"author\" in d)\n" +
"            this.author = d.author;\n" +
"        this.content = d.content;\n" +
"        this.created_at = d.created_at;\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"        this.record_id = d.record_id;\n" +
"        this.record_type = d.record_type;\n" +
"        this.rich_content = d.rich_content;\n" +
"        this.seen = d.seen;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.user = d.user;\n" +
"        this.user_id = d.user_id;\n" +
"    }\n" +
"}\n" +
"let InvoiceLinesEntity$2 = class InvoiceLinesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoiceLinesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.advance_id, field + \".advance_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$k(d.advance_id, field + \".advance_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.amount, field + \".amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$k(d.asset_id, field + \".asset_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.asset_id, field + \".asset_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        checkString$m(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$m(d.currency_price_before_tax, field + \".currency_price_before_tax\");\n" +
"        checkString$m(d.currency_tax, field + \".currency_tax\");\n" +
"        checkString$m(d.currency_unit_price_before_tax, field + \".currency_unit_price_before_tax\");\n" +
"        checkNull$h(d.deferral_id, field + \".deferral_id\");\n" +
"        checkString$m(d.description, field + \".description\");\n" +
"        checkString$m(d.discount, field + \".discount\");\n" +
"        checkString$m(d.discount_type, field + \".discount_type\");\n" +
"        checkNumber$k(d.document_id, field + \".document_id\");\n" +
"        checkBoolean$d(d.global_vat, field + \".global_vat\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$k(d.invoice_line_section_id, field + \".invoice_line_section_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.invoice_line_section_id, field + \".invoice_line_section_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.label, field + \".label\");\n" +
"        checkBoolean$d(d.manual_vat_mode, field + \".manual_vat_mode\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.ocr_vat_rate, field + \".ocr_vat_rate\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.ocr_vat_rate, field + \".ocr_vat_rate\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        d.pnl_plan_item = PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkNumber$k(d.pnl_plan_item_id, field + \".pnl_plan_item_id\");\n" +
"        checkBoolean$d(d.prepaid_pnl, field + \".prepaid_pnl\");\n" +
"        checkString$m(d.price_before_tax, field + \".price_before_tax\");\n" +
"        checkNull$h(d.product_id, field + \".product_id\");\n" +
"        checkString$m(d.quantity, field + \".quantity\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$k(d.rank, field + \".rank\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.rank, field + \".rank\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.raw_currency_unit_price, field + \".raw_currency_unit_price\");\n" +
"        checkString$m(d.tax, field + \".tax\");\n" +
"        checkString$m(d.undiscounted_currency_price_before_tax, field + \".undiscounted_currency_price_before_tax\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.unit, field + \".unit\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.unit, field + \".unit\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"advance_id\", \"amount\", \"asset_id\", \"company_id\", \"created_at\", \"currency_amount\", \"currency_price_before_tax\", \"currency_tax\", \"currency_unit_price_before_tax\", \"deferral_id\", \"description\", \"discount\", \"discount_type\", \"document_id\", \"global_vat\", \"id\", \"invoice_line_section_id\", \"label\", \"manual_vat_mode\", \"ocr_vat_rate\", \"pnl_plan_item\", \"pnl_plan_item_id\", \"prepaid_pnl\", \"price_before_tax\", \"product_id\", \"quantity\", \"rank\", \"raw_currency_unit_price\", \"tax\", \"undiscounted_currency_price_before_tax\", \"unit\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.advance_id = d.advance_id;\n" +
"        this.amount = d.amount;\n" +
"        this.asset_id = d.asset_id;\n" +
"        this.company_id = d.company_id;\n" +
"        this.created_at = d.created_at;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.currency_unit_price_before_tax = d.currency_unit_price_before_tax;\n" +
"        this.deferral_id = d.deferral_id;\n" +
"        this.description = d.description;\n" +
"        this.discount = d.discount;\n" +
"        this.discount_type = d.discount_type;\n" +
"        this.document_id = d.document_id;\n" +
"        this.global_vat = d.global_vat;\n" +
"        this.id = d.id;\n" +
"        this.invoice_line_section_id = d.invoice_line_section_id;\n" +
"        this.label = d.label;\n" +
"        this.manual_vat_mode = d.manual_vat_mode;\n" +
"        this.ocr_vat_rate = d.ocr_vat_rate;\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        this.prepaid_pnl = d.prepaid_pnl;\n" +
"        this.price_before_tax = d.price_before_tax;\n" +
"        this.product_id = d.product_id;\n" +
"        this.quantity = d.quantity;\n" +
"        this.rank = d.rank;\n" +
"        this.raw_currency_unit_price = d.raw_currency_unit_price;\n" +
"        this.tax = d.tax;\n" +
"        this.undiscounted_currency_price_before_tax = d.undiscounted_currency_price_before_tax;\n" +
"        this.unit = d.unit;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"};\n" +
"class PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1 {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        checkString$m(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$d(d.enabled, field + \".enabled\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.internal_identifier, field + \".internal_identifier\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.internal_identifier, field + \".internal_identifier\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.label, field + \".label\");\n" +
"        checkBoolean$d(d.label_is_editable, field + \".label_is_editable\");\n" +
"        checkString$m(d.number, field + \".number\");\n" +
"        checkString$m(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"        this.number = d.number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"let Journal$1 = class Journal {\n" +
"    static Parse(d) {\n" +
"        return Journal.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.code, field + \".code\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkString$m(d.label, field + \".label\");\n" +
"        const knownProperties = [\"code\", \"id\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Journal(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.code = d.code;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"    }\n" +
"};\n" +
"class LedgerEventsEntity {\n" +
"    static Parse(d) {\n" +
"        return LedgerEventsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.balance, field + \".balance\");\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        checkString$m(d.credit, field + \".credit\");\n" +
"        checkString$m(d.date, field + \".date\");\n" +
"        checkString$m(d.debit, field + \".debit\");\n" +
"        checkNumber$k(d.document_id, field + \".document_id\");\n" +
"        if (\"document_label\" in d) {\n" +
"            checkString$m(d.document_label, field + \".document_label\");\n" +
"        }\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.label, field + \".label\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.label, field + \".label\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"lettering\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                d.lettering = Lettering$1.Create(d.lettering, field + \".lettering\", \"Lettering | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.lettering, field + \".lettering\", \"Lettering | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$k(d.lettering_id, field + \".lettering_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.lettering_id, field + \".lettering_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$k(d.plan_item_id, field + \".plan_item_id\");\n" +
"        d.planItem = PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2.Create(d.planItem, field + \".planItem\");\n" +
"        if (\"processed_label\" in d) {\n" +
"            checkString$m(d.processed_label, field + \".processed_label\");\n" +
"        }\n" +
"        checkBoolean$d(d.readonly, field + \".readonly\");\n" +
"        checkBoolean$d(d.readonlyAmounts, field + \".readonlyAmounts\");\n" +
"        if (\"reallocation\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                d.reallocation = Reallocation.Create(d.reallocation, field + \".reallocation\", \"Reallocation | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$h(d.reallocation, field + \".reallocation\", \"Reallocation | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.reallocation_id, field + \".reallocation_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$k(d.reallocation_id, field + \".reallocation_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$k(d.reconciliation_id, field + \".reconciliation_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.reconciliation_id, field + \".reconciliation_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.source, field + \".source\");\n" +
"        const knownProperties = [\"balance\", \"company_id\", \"created_at\", \"credit\", \"date\", \"debit\", \"document_id\", \"document_label\", \"id\", \"label\", \"lettering\", \"lettering_id\", \"plan_item_id\", \"planItem\", \"processed_label\", \"readonly\", \"readonlyAmounts\", \"reallocation\", \"reallocation_id\", \"reconciliation_id\", \"source\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new LedgerEventsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.balance = d.balance;\n" +
"        this.company_id = d.company_id;\n" +
"        this.created_at = d.created_at;\n" +
"        this.credit = d.credit;\n" +
"        this.date = d.date;\n" +
"        this.debit = d.debit;\n" +
"        this.document_id = d.document_id;\n" +
"        if (\"document_label\" in d)\n" +
"            this.document_label = d.document_label;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        if (\"lettering\" in d)\n" +
"            this.lettering = d.lettering;\n" +
"        this.lettering_id = d.lettering_id;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.planItem = d.planItem;\n" +
"        if (\"processed_label\" in d)\n" +
"            this.processed_label = d.processed_label;\n" +
"        this.readonly = d.readonly;\n" +
"        this.readonlyAmounts = d.readonlyAmounts;\n" +
"        if (\"reallocation\" in d)\n" +
"            this.reallocation = d.reallocation;\n" +
"        this.reallocation_id = d.reallocation_id;\n" +
"        this.reconciliation_id = d.reconciliation_id;\n" +
"        this.source = d.source;\n" +
"    }\n" +
"}\n" +
"let Lettering$1 = class Lettering {\n" +
"    static Parse(d) {\n" +
"        return Lettering.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.balance, field + \".balance\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkString$m(d.plan_item_number, field + \".plan_item_number\");\n" +
"        const knownProperties = [\"balance\", \"id\", \"plan_item_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Lettering(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.balance = d.balance;\n" +
"        this.id = d.id;\n" +
"        this.plan_item_number = d.plan_item_number;\n" +
"    }\n" +
"};\n" +
"class PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2 {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        checkString$m(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$d(d.enabled, field + \".enabled\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.internal_identifier, field + \".internal_identifier\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.internal_identifier, field + \".internal_identifier\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.label, field + \".label\");\n" +
"        checkBoolean$d(d.label_is_editable, field + \".label_is_editable\");\n" +
"        checkString$m(d.number, field + \".number\");\n" +
"        checkString$m(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem2(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"        this.number = d.number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"class Reallocation {\n" +
"    static Parse(d) {\n" +
"        return Reallocation.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        d.fromPlanItem = PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3.Create(d.fromPlanItem, field + \".fromPlanItem\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        const knownProperties = [\"created_at\", \"fromPlanItem\", \"id\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Reallocation(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.fromPlanItem = d.fromPlanItem;\n" +
"        this.id = d.id;\n" +
"    }\n" +
"}\n" +
"class PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3 {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        checkString$m(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$d(d.enabled, field + \".enabled\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.internal_identifier, field + \".internal_identifier\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.internal_identifier, field + \".internal_identifier\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.label, field + \".label\");\n" +
"        checkBoolean$d(d.label_is_editable, field + \".label_is_editable\");\n" +
"        checkString$m(d.number, field + \".number\");\n" +
"        checkString$m(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItemOrPnlPlanItemOrFromPlanItemOrCurrentAccountPlanItem3(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"        this.number = d.number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"class ScoredInvoices1 {\n" +
"    static Parse(d) {\n" +
"        return ScoredInvoices1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        const knownProperties = [];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ScoredInvoices1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"    }\n" +
"}\n" +
"let Thirdparty$2 = class Thirdparty {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        checkString$m(d.activity_code, field + \".activity_code\");\n" +
"        checkString$m(d.activity_nomenclature, field + \".activity_nomenclature\");\n" +
"        checkString$m(d.address, field + \".address\");\n" +
"        checkString$m(d.address_additional_info, field + \".address_additional_info\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.admin_city_code, field + \".admin_city_code\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.admin_city_code, field + \".admin_city_code\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$h(d.balance, field + \".balance\");\n" +
"        checkNull$h(d.billing_bank, field + \".billing_bank\");\n" +
"        checkNull$h(d.billing_bic, field + \".billing_bic\");\n" +
"        checkNull$h(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        checkNull$h(d.billing_footer_invoice_label, field + \".billing_footer_invoice_label\");\n" +
"        checkNull$h(d.billing_iban, field + \".billing_iban\");\n" +
"        checkString$m(d.billing_language, field + \".billing_language\");\n" +
"        checkString$m(d.city, field + \".city\");\n" +
"        checkNumber$k(d.company_id, field + \".company_id\");\n" +
"        checkBoolean$d(d.complete, field + \".complete\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.country, field + \".country\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.country, field + \".country\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkNull$h(d.credits, field + \".credits\");\n" +
"        checkNull$h(d.current_mandate, field + \".current_mandate\");\n" +
"        checkString$m(d.customer_type, field + \".customer_type\");\n" +
"        checkNull$h(d.debits, field + \".debits\");\n" +
"        checkString$m(d.delivery_address, field + \".delivery_address\");\n" +
"        checkString$m(d.delivery_address_additional_info, field + \".delivery_address_additional_info\");\n" +
"        checkString$m(d.delivery_city, field + \".delivery_city\");\n" +
"        checkNull$h(d.delivery_country, field + \".delivery_country\");\n" +
"        checkString$m(d[\"delivery_country_alpha2\"], field + \".delivery_country_alpha2\");\n" +
"        checkString$m(d.delivery_postal_code, field + \".delivery_postal_code\");\n" +
"        checkBoolean$d(d.disable_pending_vat, field + \".disable_pending_vat\");\n" +
"        checkNull$h(d.display_name, field + \".display_name\");\n" +
"        checkArray$d(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNever$6(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$m(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$h(d.estimate_count, field + \".estimate_count\");\n" +
"        checkString$m(d.first_name, field + \".first_name\");\n" +
"        checkBoolean$d(d.force_pending_vat, field + \".force_pending_vat\");\n" +
"        checkNull$h(d.gender, field + \".gender\");\n" +
"        checkNull$h(d.gocardless_id, field + \".gocardless_id\");\n" +
"        checkString$m(d.iban, field + \".iban\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkNull$h(d.invoice_count, field + \".invoice_count\");\n" +
"        checkNull$h(d.invoice_dump_id, field + \".invoice_dump_id\");\n" +
"        checkBoolean$d(d.invoices_auto_generated, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$d(d.invoices_auto_validated, field + \".invoices_auto_validated\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$h(d.known_supplier_id, field + \".known_supplier_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$k(d.known_supplier_id, field + \".known_supplier_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.last_name, field + \".last_name\");\n" +
"        checkNull$h(d.ledger_events_count, field + \".ledger_events_count\");\n" +
"        checkString$m(d.legal_form_code, field + \".legal_form_code\");\n" +
"        checkString$m(d.method, field + \".method\");\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        checkString$m(d.notes, field + \".notes\");\n" +
"        checkNull$h(d.notes_comment, field + \".notes_comment\");\n" +
"        checkString$m(d.payment_conditions, field + \".payment_conditions\");\n" +
"        checkString$m(d.phone, field + \".phone\");\n" +
"        checkNull$h(d.plan_item, field + \".plan_item\");\n" +
"        checkNull$h(d.plan_item_attributes, field + \".plan_item_attributes\");\n" +
"        checkNumber$k(d.plan_item_id, field + \".plan_item_id\");\n" +
"        checkNull$h(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$k(d.pnl_plan_item_id, field + \".pnl_plan_item_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.pnl_plan_item_id, field + \".pnl_plan_item_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.postal_code, field + \".postal_code\");\n" +
"        checkNull$h(d.purchase_request_count, field + \".purchase_request_count\");\n" +
"        checkBoolean$d(d.received_a_mandate_request, field + \".received_a_mandate_request\");\n" +
"        checkString$m(d.recipient, field + \".recipient\");\n" +
"        checkBoolean$d(d.recurrent, field + \".recurrent\");\n" +
"        checkString$m(d.reference, field + \".reference\");\n" +
"        checkString$m(d.reg_no, field + \".reg_no\");\n" +
"        checkString$m(d.role, field + \".role\");\n" +
"        checkBoolean$d(d.rule_enabled, field + \".rule_enabled\");\n" +
"        checkArray$d(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$m(d.search_terms[i], field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$m(d.source_id, field + \".source_id\");\n" +
"        checkNull$h(d.stripe_id, field + \".stripe_id\");\n" +
"        checkNull$h(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$d(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                checkNever$6(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$h(d.turnover, field + \".turnover\");\n" +
"        checkString$m(d.url, field + \".url\");\n" +
"        checkString$m(d.vat_number, field + \".vat_number\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$m(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$h(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"activity_code\", \"activity_nomenclature\", \"address\", \"address_additional_info\", \"admin_city_code\", \"balance\", \"billing_bank\", \"billing_bic\", \"billing_footer_invoice_id\", \"billing_footer_invoice_label\", \"billing_iban\", \"billing_language\", \"city\", \"company_id\", \"complete\", \"country\", \"country_alpha2\", \"credits\", \"current_mandate\", \"customer_type\", \"debits\", \"delivery_address\", \"delivery_address_additional_info\", \"delivery_city\", \"delivery_country\", \"delivery_country_alpha2\", \"delivery_postal_code\", \"disable_pending_vat\", \"display_name\", \"emails\", \"establishment_no\", \"estimate_count\", \"first_name\", \"force_pending_vat\", \"gender\", \"gocardless_id\", \"iban\", \"id\", \"invoice_count\", \"invoice_dump_id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"known_supplier_id\", \"last_name\", \"ledger_events_count\", \"legal_form_code\", \"method\", \"name\", \"notes\", \"notes_comment\", \"payment_conditions\", \"phone\", \"plan_item\", \"plan_item_attributes\", \"plan_item_id\", \"pnl_plan_item\", \"pnl_plan_item_id\", \"postal_code\", \"purchase_request_count\", \"received_a_mandate_request\", \"recipient\", \"recurrent\", \"reference\", \"reg_no\", \"role\", \"rule_enabled\", \"search_terms\", \"source_id\", \"stripe_id\", \"supplier_payment_method\", \"supplier_payment_method_last_updated_at\", \"tags\", \"turnover\", \"url\", \"vat_number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Thirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.activity_code = d.activity_code;\n" +
"        this.activity_nomenclature = d.activity_nomenclature;\n" +
"        this.address = d.address;\n" +
"        this.address_additional_info = d.address_additional_info;\n" +
"        this.admin_city_code = d.admin_city_code;\n" +
"        this.balance = d.balance;\n" +
"        this.billing_bank = d.billing_bank;\n" +
"        this.billing_bic = d.billing_bic;\n" +
"        this.billing_footer_invoice_id = d.billing_footer_invoice_id;\n" +
"        this.billing_footer_invoice_label = d.billing_footer_invoice_label;\n" +
"        this.billing_iban = d.billing_iban;\n" +
"        this.billing_language = d.billing_language;\n" +
"        this.city = d.city;\n" +
"        this.company_id = d.company_id;\n" +
"        this.complete = d.complete;\n" +
"        this.country = d.country;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.credits = d.credits;\n" +
"        this.current_mandate = d.current_mandate;\n" +
"        this.customer_type = d.customer_type;\n" +
"        this.debits = d.debits;\n" +
"        this.delivery_address = d.delivery_address;\n" +
"        this.delivery_address_additional_info = d.delivery_address_additional_info;\n" +
"        this.delivery_city = d.delivery_city;\n" +
"        this.delivery_country = d.delivery_country;\n" +
"        this[\"delivery_country_alpha2\"] = d[\"delivery_country_alpha2\"];\n" +
"        this.delivery_postal_code = d.delivery_postal_code;\n" +
"        this.disable_pending_vat = d.disable_pending_vat;\n" +
"        this.display_name = d.display_name;\n" +
"        this.emails = d.emails;\n" +
"        this.establishment_no = d.establishment_no;\n" +
"        this.estimate_count = d.estimate_count;\n" +
"        this.first_name = d.first_name;\n" +
"        this.force_pending_vat = d.force_pending_vat;\n" +
"        this.gender = d.gender;\n" +
"        this.gocardless_id = d.gocardless_id;\n" +
"        this.iban = d.iban;\n" +
"        this.id = d.id;\n" +
"        this.invoice_count = d.invoice_count;\n" +
"        this.invoice_dump_id = d.invoice_dump_id;\n" +
"        this.invoices_auto_generated = d.invoices_auto_generated;\n" +
"        this.invoices_auto_validated = d.invoices_auto_validated;\n" +
"        this.known_supplier_id = d.known_supplier_id;\n" +
"        this.last_name = d.last_name;\n" +
"        this.ledger_events_count = d.ledger_events_count;\n" +
"        this.legal_form_code = d.legal_form_code;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        this.notes = d.notes;\n" +
"        this.notes_comment = d.notes_comment;\n" +
"        this.payment_conditions = d.payment_conditions;\n" +
"        this.phone = d.phone;\n" +
"        this.plan_item = d.plan_item;\n" +
"        this.plan_item_attributes = d.plan_item_attributes;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        this.postal_code = d.postal_code;\n" +
"        this.purchase_request_count = d.purchase_request_count;\n" +
"        this.received_a_mandate_request = d.received_a_mandate_request;\n" +
"        this.recipient = d.recipient;\n" +
"        this.recurrent = d.recurrent;\n" +
"        this.reference = d.reference;\n" +
"        this.reg_no = d.reg_no;\n" +
"        this.role = d.role;\n" +
"        this.rule_enabled = d.rule_enabled;\n" +
"        this.search_terms = d.search_terms;\n" +
"        this.source_id = d.source_id;\n" +
"        this.stripe_id = d.stripe_id;\n" +
"        this.supplier_payment_method = d.supplier_payment_method;\n" +
"        this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;\n" +
"        this.tags = d.tags;\n" +
"        this.turnover = d.turnover;\n" +
"        this.url = d.url;\n" +
"        this.vat_number = d.vat_number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"};\n" +
"class ScoredInvoices {\n" +
"    static Parse(d) {\n" +
"        return ScoredInvoices.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$o = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$o(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$o(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$o(field, d);\n" +
"        }\n" +
"        const knownProperties = [];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ScoredInvoices(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$o(field, value, multiple) {\n" +
"    return errorHelper$o(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$o(field, value, multiple) {\n" +
"    return errorHelper$o(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$o(field, value, multiple) {\n" +
"    return errorHelper$o(field, value, \"object\");\n" +
"}\n" +
"function checkArray$d(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$o(field, value, multiple ?? \"array\");\n" +
"}\n" +
"function checkNumber$k(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$o(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$d(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$o(field, value, multiple ?? \"boolean\");\n" +
"}\n" +
"function checkString$m(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$o(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$h(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$o(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$6(value, field, multiple) {\n" +
"    return errorHelper$o(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$o(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$o));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$o;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$o));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$n = null;\n" +
"class APIDocumentMatching {\n" +
"    static Parse(d) {\n" +
"        return APIDocumentMatching.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$n = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$n(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$n(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$n(field, d);\n" +
"        }\n" +
"        checkString$l(d.amount, field + \".amount\");\n" +
"        checkNumber$j(d.company_id, field + \".company_id\");\n" +
"        checkString$l(d.currency, field + \".currency\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$l(d.date, field + \".date\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$g(d.date, field + \".date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$l(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$l(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$j(d.id, field + \".id\");\n" +
"        checkString$l(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        checkNull$g(d.proof_count, field + \".proof_count\");\n" +
"        checkString$l(d.type, field + \".type\");\n" +
"        checkString$l(d.updated_at, field + \".updated_at\");\n" +
"        const knownProperties = [\"amount\", \"company_id\", \"currency\", \"date\", \"gross_amount\", \"group_uuid\", \"id\", \"outstanding_balance\", \"proof_count\", \"type\", \"updated_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$n(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDocumentMatching(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.company_id = d.company_id;\n" +
"        this.currency = d.currency;\n" +
"        this.date = d.date;\n" +
"        this.gross_amount = d.gross_amount;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.id = d.id;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.proof_count = d.proof_count;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$n(field, value, multiple) {\n" +
"    return errorHelper$n(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$n(field, value, multiple) {\n" +
"    return errorHelper$n(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$n(field, value, multiple) {\n" +
"    return errorHelper$n(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$j(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$n(field, value, \"number\");\n" +
"}\n" +
"function checkString$l(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$n(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$g(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$n(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function errorHelper$n(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$n));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$n;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$n));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"async function getDocument(id) {\n" +
"    const response = await apiRequest(`documents/${id}`, null, 'GET');\n" +
"    if (!response)\n" +
"        return null;\n" +
"    const data = await response?.json();\n" +
"    return APIDocument.Create(data);\n" +
"}\n" +
"async function documentMatching(options) {\n" +
"    const group_uuids = Array.isArray(options.groups) ? options.groups : [options.groups];\n" +
"    const response = await apiRequest(`documents/${options.id}/matching`, { matching: { unmatch_ids: [], group_uuids } }, 'PUT');\n" +
"    if (!response)\n" +
"        return null;\n" +
"    return APIDocumentMatching.Create(await response.json());\n" +
"}\n" +
"async function reloadLedgerEvents(id) {\n" +
"    const response = await apiRequest(`documents/${id}/settle`, null, 'POST');\n" +
"    const data = await response?.json();\n" +
"    return APIDocument.Create(data);\n" +
"}\n" +
"/**\n" +
" * @return {Promise<number>} The number of modified documents\n" +
" */\n" +
"async function archiveDocument(id, unarchive = false) {\n" +
"    const body = { documents: [{ id }], unarchive };\n" +
"    const response = await apiRequest('documents/batch_archive', body, 'POST');\n" +
"    const responseData = await response?.json();\n" +
"    return responseData;\n" +
"}\n" +
"/**\n" +
" * Return http link to open a document\n" +
" */\n" +
"function getDocumentLink(id) {\n" +
"    return `${location.href.split('/').slice(0, 5).join('/')}/documents/${id}.html`;\n" +
"}\n" +
"\n" +
"const DB_NAME = \"GM_Pennylane\";\n" +
"const DB_VERSION = 1;\n" +
"let registeringTO = null;\n" +
"const tables = [];\n" +
"function registerTable(table) {\n" +
"    if (tables.some((tableItem) => tableItem.name === table.name))\n" +
"        throw new Error(`Table nammed \"${table.name}\" already exists`);\n" +
"    tables.push(table);\n" +
"    registeringTO = sleep(200);\n" +
"}\n" +
"let DBLoading;\n" +
"async function getDB() {\n" +
"    let end;\n" +
"    do {\n" +
"        end = registeringTO;\n" +
"        await end;\n" +
"    } while (end !== registeringTO);\n" +
"    if (!DBLoading)\n" +
"        DBLoading = loadDB();\n" +
"    return DBLoading;\n" +
"}\n" +
"async function loadDB() {\n" +
"    const db = await new Promise((rs, rj) => {\n" +
"        const openRequest = indexedDB.open(DB_NAME, DB_VERSION);\n" +
"        /**\n" +
"         * Database upgrade needed : DB_VERSION is greather than the current db version\n" +
"         */\n" +
"        openRequest.onupgradeneeded = (event) => {\n" +
"            const db = openRequest.result;\n" +
"            switch (event.oldVersion) {\n" +
"                case 0:\n" +
"                    tables.forEach((table) => {\n" +
"                        if (!db.objectStoreNames.contains(table.name))\n" +
"                            db.createObjectStore(table.name, { keyPath: table.primary, autoIncrement: table.autoIncrement });\n" +
"                    });\n" +
"                    return;\n" +
"                default:\n" +
"                    console.log(\"IDB load error: upgrade needed\", { openRequest, event });\n" +
"                    rj(new Error(\"IDB load error: upgrade needed\"));\n" +
"            }\n" +
"        };\n" +
"        /**\n" +
"         * Database open failed\n" +
"         */\n" +
"        openRequest.onerror = (event) => {\n" +
"            console.error(\"IDB load error : error event\", { error: openRequest.error, event });\n" +
"            rj(new Error(\"IDB load error : error event\"));\n" +
"        };\n" +
"        /**\n" +
"         * Database successfully opened\n" +
"         */\n" +
"        openRequest.onsuccess = () => {\n" +
"            rs(openRequest.result);\n" +
"        };\n" +
"        /**\n" +
"         * There is outdated version of the database open in another tab\n" +
"         */\n" +
"        openRequest.onblocked = (event) => {\n" +
"            console.error(\"database blocked\", { version: DB_VERSION });\n" +
"            rj(event);\n" +
"        };\n" +
"    });\n" +
"    if (db) {\n" +
"        /**\n" +
"         * Database version change : DB_VERSION becomes lower than the current db version\n" +
"         */\n" +
"        db.onversionchange = () => {\n" +
"            console.error(\"database version change\", { version: DB_VERSION });\n" +
"            db.close();\n" +
"        };\n" +
"    }\n" +
"    return db;\n" +
"}\n" +
"class IDBCache extends Logger {\n" +
"    constructor(tableName, primary) {\n" +
"        super();\n" +
"        this.tableName = tableName;\n" +
"        this.primary = primary;\n" +
"        registerTable({ name: tableName, primary });\n" +
"        this.loading = this.load();\n" +
"        this.debug(\"new Cache\", this);\n" +
"    }\n" +
"    static getInstance(tableName, primary) {\n" +
"        if (!this.instances[tableName]) {\n" +
"            this.instances[tableName] = new this(tableName, primary);\n" +
"        }\n" +
"        return this.instances[tableName];\n" +
"    }\n" +
"    /**\n" +
"     * Load database\n" +
"     */\n" +
"    async load() {\n" +
"        this.log(\"Loading database\", this.tableName);\n" +
"        this.db = await getDB();\n" +
"        this.log(\"Database loaded\", this.db);\n" +
"        return this.db;\n" +
"    }\n" +
"    async find(match) {\n" +
"        if (this.primary in match)\n" +
"            return this.get(match[this.primary]);\n" +
"        for await (const item of this.walk(\"readonly\")) {\n" +
"            if (!item)\n" +
"                return null;\n" +
"            if (Object.entries(match).every(([key, value]) => item[key] === value))\n" +
"                return item;\n" +
"        }\n" +
"        return null;\n" +
"    }\n" +
"    async update(match) {\n" +
"        const oldValue = await this.get(match[this.primary]);\n" +
"        const newValue = oldValue ? { ...oldValue, ...match } : match;\n" +
"        const store = await this.getStore(\"readwrite\");\n" +
"        store.put(newValue);\n" +
"    }\n" +
"    async get(id) {\n" +
"        const store = await this.getStore(\"readonly\");\n" +
"        const getRequest = store?.get(id);\n" +
"        return await this.consumeRequest(Object.assign(getRequest, { request: `get(${id})` }));\n" +
"    }\n" +
"    async getStore(mode) {\n" +
"        const db = await this.loading;\n" +
"        if (!db)\n" +
"            return null;\n" +
"        const transaction = Object.assign(db.transaction(this.tableName, mode), { state: [\"pending\", null] });\n" +
"        transaction.oncomplete = (event) => {\n" +
"            transaction.state = [\"completed\", event];\n" +
"        };\n" +
"        transaction.onerror = (event) => {\n" +
"            transaction.state = [\"error\", event];\n" +
"        };\n" +
"        transaction.onabort = (event) => {\n" +
"            transaction.state = [\"aborted\", event];\n" +
"        };\n" +
"        const store = transaction.objectStore(this.tableName);\n" +
"        return store;\n" +
"    }\n" +
"    async *walk(mode) {\n" +
"        const store = await this.getStore(mode);\n" +
"        const cursorRequest = store?.openCursor();\n" +
"        if (!cursorRequest)\n" +
"            return null;\n" +
"        while (true) {\n" +
"            const cursor = await this.consumeRequest(Object.assign(cursorRequest, { request: \"openCursor\" }));\n" +
"            if (!cursor)\n" +
"                return null;\n" +
"            yield cursor.value;\n" +
"            cursor.continue();\n" +
"        }\n" +
"    }\n" +
"    consumeRequest(request) {\n" +
"        if (!request)\n" +
"            return null;\n" +
"        if (!request.request)\n" +
"            console.error(\"IDBRequest has no request property\", request);\n" +
"        window.getIDBRequests = window.getIDBRequests ?? [];\n" +
"        if (!window.getIDBRequests.includes(request))\n" +
"            window.getIDBRequests.push(request);\n" +
"        return new Promise((rs, rj) => {\n" +
"            request.onsuccess = () => rs(request.result);\n" +
"            request.onerror = () => rj(request.error);\n" +
"        });\n" +
"    }\n" +
"}\n" +
"IDBCache.instances = {};\n" +
"\n" +
"const storageKey = \"apiCache\";\n" +
"const cache = IDBCache.getInstance(storageKey, \"key\");\n" +
"async function cachedRequest(ref, args, fetcher, maxAge = WEEK_IN_MS) {\n" +
"    const argsString = JSON.stringify(args);\n" +
"    const key = `${ref}(${argsString})`;\n" +
"    const cached = await cache.find({ key });\n" +
"    if (cached && Date.now() - cached.fetchedAt < maxAge)\n" +
"        return cached.value;\n" +
"    const value = await fetcher(args);\n" +
"    if (value)\n" +
"        cache.update({ ref, args, value, fetchedAt: Date.now(), key });\n" +
"    return value;\n" +
"}\n" +
"async function updateAPICacheItem(item) {\n" +
"    const key = `${item.ref}(${JSON.stringify(item.args)})`;\n" +
"    cache.update({ fetchedAt: Date.now(), ...item, key });\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$m = null;\n" +
"class APIDMSCreateLink {\n" +
"    static Parse(d) {\n" +
"        return APIDMSCreateLink.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$m = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$m(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$m(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$m(field, d);\n" +
"        }\n" +
"        const knownProperties = [];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$m(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSCreateLink(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$m(field, value, multiple) {\n" +
"    return errorHelper$m(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$m(field, value, multiple) {\n" +
"    return errorHelper$m(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$m(field, value, multiple) {\n" +
"    return errorHelper$m(field, value, \"object\");\n" +
"}\n" +
"function errorHelper$m(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$m));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$m;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$m));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$l = null;\n" +
"class APIDMSItem {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$l = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$l(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$l(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$l(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$k(d.archived_at, field + \".archived_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$f(d.archived_at, field + \".archived_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"children\" in d) {\n" +
"            checkArray$c(d.children, field + \".children\");\n" +
"            if (d.children) {\n" +
"                for (let i = 0; i < d.children.length; i++) {\n" +
"                    d.children[i] = ChildrenEntityOrItemsEntity.Create(d.children[i], field + \".children\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$k(d.created_at, field + \".created_at\");\n" +
"        if (\"creator\" in d) {\n" +
"            d.creator = Creator$5.Create(d.creator, field + \".creator\");\n" +
"        }\n" +
"        if (\"favorite\" in d) {\n" +
"            checkBoolean$c(d.favorite, field + \".favorite\");\n" +
"        }\n" +
"        if (\"file_extension\" in d) {\n" +
"            checkString$k(d.file_extension, field + \".file_extension\");\n" +
"        }\n" +
"        if (\"file_size\" in d) {\n" +
"            checkNumber$i(d.file_size, field + \".file_size\");\n" +
"        }\n" +
"        if (\"file_url\" in d) {\n" +
"            checkString$k(d.file_url, field + \".file_url\");\n" +
"        }\n" +
"        if (\"filters\" in d) {\n" +
"            checkNull$f(d.filters, field + \".filters\");\n" +
"        }\n" +
"        if (\"fixed\" in d) {\n" +
"            checkBoolean$c(d.fixed, field + \".fixed\");\n" +
"        }\n" +
"        checkNumber$i(d.id, field + \".id\");\n" +
"        checkBoolean$c(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$i(d.itemable_id, field + \".itemable_id\");\n" +
"        if (\"items\" in d) {\n" +
"            checkArray$c(d.items, field + \".items\");\n" +
"            if (d.items) {\n" +
"                for (let i = 0; i < d.items.length; i++) {\n" +
"                    d.items[i] = ItemsEntityOrChildrenEntity.Create(d.items[i], field + \".items\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$k(d.method, field + \".method\");\n" +
"        checkString$k(d.name, field + \".name\");\n" +
"        if (\"pagination\" in d) {\n" +
"            d.pagination = Pagination$3.Create(d.pagination, field + \".pagination\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$i(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$f(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$k(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$c(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"reference_link\" in d) {\n" +
"            checkNull$f(d.reference_link, field + \".reference_link\");\n" +
"        }\n" +
"        checkBoolean$c(d.shared, field + \".shared\");\n" +
"        if (\"signed_id\" in d) {\n" +
"            checkString$k(d.signed_id, field + \".signed_id\");\n" +
"        }\n" +
"        if (\"sort\" in d) {\n" +
"            checkString$k(d.sort, field + \".sort\");\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$f(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        if (\"summary_text_prediction_id\" in d) {\n" +
"            checkNull$f(d.summary_text_prediction_id, field + \".summary_text_prediction_id\");\n" +
"        }\n" +
"        checkString$k(d.type, field + \".type\");\n" +
"        checkString$k(d.updated_at, field + \".updated_at\");\n" +
"        if (\"visible\" in d) {\n" +
"            checkBoolean$c(d.visible, field + \".visible\");\n" +
"        }\n" +
"        const knownProperties = [\"archived_at\", \"children\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"filters\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"items\", \"method\", \"name\", \"pagination\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"sort\", \"summary_text\", \"summary_text_prediction_id\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$l(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.archived_at = d.archived_at;\n" +
"        if (\"children\" in d)\n" +
"            this.children = d.children;\n" +
"        this.created_at = d.created_at;\n" +
"        if (\"creator\" in d)\n" +
"            this.creator = d.creator;\n" +
"        if (\"favorite\" in d)\n" +
"            this.favorite = d.favorite;\n" +
"        if (\"file_extension\" in d)\n" +
"            this.file_extension = d.file_extension;\n" +
"        if (\"file_size\" in d)\n" +
"            this.file_size = d.file_size;\n" +
"        if (\"file_url\" in d)\n" +
"            this.file_url = d.file_url;\n" +
"        if (\"filters\" in d)\n" +
"            this.filters = d.filters;\n" +
"        if (\"fixed\" in d)\n" +
"            this.fixed = d.fixed;\n" +
"        this.id = d.id;\n" +
"        this.imports_allowed = d.imports_allowed;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        if (\"items\" in d)\n" +
"            this.items = d.items;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        if (\"pagination\" in d)\n" +
"            this.pagination = d.pagination;\n" +
"        this.parent_id = d.parent_id;\n" +
"        if (\"pusher_channel\" in d)\n" +
"            this.pusher_channel = d.pusher_channel;\n" +
"        if (\"readonly\" in d)\n" +
"            this.readonly = d.readonly;\n" +
"        if (\"reference_link\" in d)\n" +
"            this.reference_link = d.reference_link;\n" +
"        this.shared = d.shared;\n" +
"        if (\"signed_id\" in d)\n" +
"            this.signed_id = d.signed_id;\n" +
"        if (\"sort\" in d)\n" +
"            this.sort = d.sort;\n" +
"        if (\"summary_text\" in d)\n" +
"            this.summary_text = d.summary_text;\n" +
"        if (\"summary_text_prediction_id\" in d)\n" +
"            this.summary_text_prediction_id = d.summary_text_prediction_id;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        if (\"visible\" in d)\n" +
"            this.visible = d.visible;\n" +
"    }\n" +
"}\n" +
"class ChildrenEntityOrItemsEntity {\n" +
"    static Parse(d) {\n" +
"        return ChildrenEntityOrItemsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$l = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$l(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$l(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$l(field, d);\n" +
"        }\n" +
"        checkNull$f(d.archived_at, field + \".archived_at\");\n" +
"        if (\"comments_count\" in d) {\n" +
"            checkNumber$i(d.comments_count, field + \".comments_count\");\n" +
"        }\n" +
"        checkString$k(d.created_at, field + \".created_at\");\n" +
"        if (\"creator\" in d) {\n" +
"            d.creator = Creator1.Create(d.creator, field + \".creator\");\n" +
"        }\n" +
"        if (\"favorite\" in d) {\n" +
"            checkBoolean$c(d.favorite, field + \".favorite\");\n" +
"        }\n" +
"        if (\"file_extension\" in d) {\n" +
"            checkString$k(d.file_extension, field + \".file_extension\");\n" +
"        }\n" +
"        if (\"file_size\" in d) {\n" +
"            checkNumber$i(d.file_size, field + \".file_size\");\n" +
"        }\n" +
"        if (\"file_url\" in d) {\n" +
"            checkString$k(d.file_url, field + \".file_url\");\n" +
"        }\n" +
"        if (\"files_count\" in d) {\n" +
"            checkNumber$i(d.files_count, field + \".files_count\");\n" +
"        }\n" +
"        if (\"fixed\" in d) {\n" +
"            checkBoolean$c(d.fixed, field + \".fixed\");\n" +
"        }\n" +
"        checkNumber$i(d.id, field + \".id\");\n" +
"        checkBoolean$c(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$i(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$k(d.method, field + \".method\");\n" +
"        checkString$k(d.name, field + \".name\");\n" +
"        checkNumber$i(d.parent_id, field + \".parent_id\");\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$k(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$c(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"reference_link\" in d) {\n" +
"            checkNull$f(d.reference_link, field + \".reference_link\");\n" +
"        }\n" +
"        checkBoolean$c(d.shared, field + \".shared\");\n" +
"        if (\"signed_id\" in d) {\n" +
"            checkString$k(d.signed_id, field + \".signed_id\");\n" +
"        }\n" +
"        if (\"suggested_folders\" in d) {\n" +
"            checkArray$c(d.suggested_folders, field + \".suggested_folders\");\n" +
"            if (d.suggested_folders) {\n" +
"                for (let i = 0; i < d.suggested_folders.length; i++) {\n" +
"                    checkNever$5(d.suggested_folders[i], field + \".suggested_folders\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$f(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        checkString$k(d.type, field + \".type\");\n" +
"        checkString$k(d.updated_at, field + \".updated_at\");\n" +
"        if (\"visible\" in d) {\n" +
"            checkBoolean$c(d.visible, field + \".visible\");\n" +
"        }\n" +
"        const knownProperties = [\"archived_at\", \"comments_count\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"files_count\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"suggested_folders\", \"summary_text\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$l(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ChildrenEntityOrItemsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.archived_at = d.archived_at;\n" +
"        if (\"comments_count\" in d)\n" +
"            this.comments_count = d.comments_count;\n" +
"        this.created_at = d.created_at;\n" +
"        if (\"creator\" in d)\n" +
"            this.creator = d.creator;\n" +
"        if (\"favorite\" in d)\n" +
"            this.favorite = d.favorite;\n" +
"        if (\"file_extension\" in d)\n" +
"            this.file_extension = d.file_extension;\n" +
"        if (\"file_size\" in d)\n" +
"            this.file_size = d.file_size;\n" +
"        if (\"file_url\" in d)\n" +
"            this.file_url = d.file_url;\n" +
"        if (\"files_count\" in d)\n" +
"            this.files_count = d.files_count;\n" +
"        if (\"fixed\" in d)\n" +
"            this.fixed = d.fixed;\n" +
"        this.id = d.id;\n" +
"        this.imports_allowed = d.imports_allowed;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        this.parent_id = d.parent_id;\n" +
"        if (\"pusher_channel\" in d)\n" +
"            this.pusher_channel = d.pusher_channel;\n" +
"        if (\"readonly\" in d)\n" +
"            this.readonly = d.readonly;\n" +
"        if (\"reference_link\" in d)\n" +
"            this.reference_link = d.reference_link;\n" +
"        this.shared = d.shared;\n" +
"        if (\"signed_id\" in d)\n" +
"            this.signed_id = d.signed_id;\n" +
"        if (\"suggested_folders\" in d)\n" +
"            this.suggested_folders = d.suggested_folders;\n" +
"        if (\"summary_text\" in d)\n" +
"            this.summary_text = d.summary_text;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        if (\"visible\" in d)\n" +
"            this.visible = d.visible;\n" +
"    }\n" +
"}\n" +
"class Creator1 {\n" +
"    static Parse(d) {\n" +
"        return Creator1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$l = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$l(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$l(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$l(field, d);\n" +
"        }\n" +
"        checkString$k(d.email, field + \".email\");\n" +
"        checkString$k(d.first_name, field + \".first_name\");\n" +
"        checkString$k(d.full_name, field + \".full_name\");\n" +
"        checkString$k(d.last_name, field + \".last_name\");\n" +
"        checkString$k(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$l(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Creator1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.email = d.email;\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.role = d.role;\n" +
"    }\n" +
"}\n" +
"let Creator$5 = class Creator {\n" +
"    static Parse(d) {\n" +
"        return Creator.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$l = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$l(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$l(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$l(field, d);\n" +
"        }\n" +
"        checkString$k(d.email, field + \".email\");\n" +
"        checkString$k(d.first_name, field + \".first_name\");\n" +
"        checkString$k(d.full_name, field + \".full_name\");\n" +
"        checkString$k(d.last_name, field + \".last_name\");\n" +
"        checkString$k(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$l(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Creator(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.email = d.email;\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.role = d.role;\n" +
"    }\n" +
"};\n" +
"class ItemsEntityOrChildrenEntity {\n" +
"    static Parse(d) {\n" +
"        return ItemsEntityOrChildrenEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$l = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$l(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$l(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$l(field, d);\n" +
"        }\n" +
"        checkNull$f(d.archived_at, field + \".archived_at\");\n" +
"        if (\"comments_count\" in d) {\n" +
"            checkNumber$i(d.comments_count, field + \".comments_count\");\n" +
"        }\n" +
"        checkString$k(d.created_at, field + \".created_at\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$f(d.creator, field + \".creator\", \"null | Creator2\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.creator = Creator2.Create(d.creator, field + \".creator\", \"null | Creator2\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"favorite\" in d) {\n" +
"            checkBoolean$c(d.favorite, field + \".favorite\");\n" +
"        }\n" +
"        if (\"file_extension\" in d) {\n" +
"            checkString$k(d.file_extension, field + \".file_extension\");\n" +
"        }\n" +
"        if (\"file_size\" in d) {\n" +
"            checkNumber$i(d.file_size, field + \".file_size\");\n" +
"        }\n" +
"        if (\"file_url\" in d) {\n" +
"            checkString$k(d.file_url, field + \".file_url\");\n" +
"        }\n" +
"        if (\"files_count\" in d) {\n" +
"            checkNumber$i(d.files_count, field + \".files_count\");\n" +
"        }\n" +
"        if (\"fixed\" in d) {\n" +
"            checkBoolean$c(d.fixed, field + \".fixed\");\n" +
"        }\n" +
"        checkNumber$i(d.id, field + \".id\");\n" +
"        checkBoolean$c(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$i(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$k(d.method, field + \".method\");\n" +
"        checkString$k(d.name, field + \".name\");\n" +
"        checkNumber$i(d.parent_id, field + \".parent_id\");\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$k(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$c(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"reference_link\" in d) {\n" +
"            checkNull$f(d.reference_link, field + \".reference_link\");\n" +
"        }\n" +
"        checkBoolean$c(d.shared, field + \".shared\");\n" +
"        if (\"signed_id\" in d) {\n" +
"            checkString$k(d.signed_id, field + \".signed_id\");\n" +
"        }\n" +
"        if (\"suggested_folders\" in d) {\n" +
"            checkArray$c(d.suggested_folders, field + \".suggested_folders\");\n" +
"            if (d.suggested_folders) {\n" +
"                for (let i = 0; i < d.suggested_folders.length; i++) {\n" +
"                    checkNever$5(d.suggested_folders[i], field + \".suggested_folders\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$f(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        checkString$k(d.type, field + \".type\");\n" +
"        checkString$k(d.updated_at, field + \".updated_at\");\n" +
"        if (\"visible\" in d) {\n" +
"            checkBoolean$c(d.visible, field + \".visible\");\n" +
"        }\n" +
"        const knownProperties = [\"archived_at\", \"comments_count\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"files_count\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"suggested_folders\", \"summary_text\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$l(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ItemsEntityOrChildrenEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.archived_at = d.archived_at;\n" +
"        if (\"comments_count\" in d)\n" +
"            this.comments_count = d.comments_count;\n" +
"        this.created_at = d.created_at;\n" +
"        this.creator = d.creator;\n" +
"        if (\"favorite\" in d)\n" +
"            this.favorite = d.favorite;\n" +
"        if (\"file_extension\" in d)\n" +
"            this.file_extension = d.file_extension;\n" +
"        if (\"file_size\" in d)\n" +
"            this.file_size = d.file_size;\n" +
"        if (\"file_url\" in d)\n" +
"            this.file_url = d.file_url;\n" +
"        if (\"files_count\" in d)\n" +
"            this.files_count = d.files_count;\n" +
"        if (\"fixed\" in d)\n" +
"            this.fixed = d.fixed;\n" +
"        this.id = d.id;\n" +
"        this.imports_allowed = d.imports_allowed;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        this.parent_id = d.parent_id;\n" +
"        if (\"pusher_channel\" in d)\n" +
"            this.pusher_channel = d.pusher_channel;\n" +
"        if (\"readonly\" in d)\n" +
"            this.readonly = d.readonly;\n" +
"        if (\"reference_link\" in d)\n" +
"            this.reference_link = d.reference_link;\n" +
"        this.shared = d.shared;\n" +
"        if (\"signed_id\" in d)\n" +
"            this.signed_id = d.signed_id;\n" +
"        if (\"suggested_folders\" in d)\n" +
"            this.suggested_folders = d.suggested_folders;\n" +
"        if (\"summary_text\" in d)\n" +
"            this.summary_text = d.summary_text;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        if (\"visible\" in d)\n" +
"            this.visible = d.visible;\n" +
"    }\n" +
"}\n" +
"class Creator2 {\n" +
"    static Parse(d) {\n" +
"        return Creator2.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$l = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$l(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$l(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$l(field, d);\n" +
"        }\n" +
"        checkString$k(d.email, field + \".email\");\n" +
"        checkString$k(d.first_name, field + \".first_name\");\n" +
"        checkString$k(d.full_name, field + \".full_name\");\n" +
"        checkString$k(d.last_name, field + \".last_name\");\n" +
"        checkString$k(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$l(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Creator2(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.email = d.email;\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.role = d.role;\n" +
"    }\n" +
"}\n" +
"let Pagination$3 = class Pagination {\n" +
"    static Parse(d) {\n" +
"        return Pagination.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$l = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$l(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$l(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$l(field, d);\n" +
"        }\n" +
"        checkBoolean$c(d.hasNextPage, field + \".hasNextPage\");\n" +
"        checkNumber$i(d.page, field + \".page\");\n" +
"        checkNumber$i(d.pages, field + \".pages\");\n" +
"        checkNumber$i(d.pageSize, field + \".pageSize\");\n" +
"        checkNumber$i(d.totalEntries, field + \".totalEntries\");\n" +
"        checkString$k(d.totalEntriesPrecision, field + \".totalEntriesPrecision\");\n" +
"        checkString$k(d.totalEntriesStr, field + \".totalEntriesStr\");\n" +
"        const knownProperties = [\"hasNextPage\", \"page\", \"pages\", \"pageSize\", \"totalEntries\", \"totalEntriesPrecision\", \"totalEntriesStr\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$l(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Pagination(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.hasNextPage = d.hasNextPage;\n" +
"        this.page = d.page;\n" +
"        this.pages = d.pages;\n" +
"        this.pageSize = d.pageSize;\n" +
"        this.totalEntries = d.totalEntries;\n" +
"        this.totalEntriesPrecision = d.totalEntriesPrecision;\n" +
"        this.totalEntriesStr = d.totalEntriesStr;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$l(field, value, multiple) {\n" +
"    return errorHelper$l(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$l(field, value, multiple) {\n" +
"    return errorHelper$l(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$l(field, value, multiple) {\n" +
"    return errorHelper$l(field, value, \"object\");\n" +
"}\n" +
"function checkArray$c(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$l(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$i(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$l(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$c(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$l(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$k(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$l(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$f(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$l(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$5(value, field, multiple) {\n" +
"    return errorHelper$l(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$l(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$l));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$l;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$l));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$k = null;\n" +
"class APIDMSItemLink {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItemLink.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$k = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$k(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$k(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$k(field, d);\n" +
"        }\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkNumber$h(d.record_id, field + \".record_id\");\n" +
"        checkString$j(d.record_name, field + \".record_name\");\n" +
"        checkString$j(d.record_type, field + \".record_type\");\n" +
"        checkString$j(d.record_url, field + \".record_url\");\n" +
"        const knownProperties = [\"id\", \"record_id\", \"record_name\", \"record_type\", \"record_url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$k(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSItemLink(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.record_id = d.record_id;\n" +
"        this.record_name = d.record_name;\n" +
"        this.record_type = d.record_type;\n" +
"        this.record_url = d.record_url;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$k(field, value, multiple) {\n" +
"    return errorHelper$k(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$k(field, value, multiple) {\n" +
"    return errorHelper$k(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$k(field, value, multiple) {\n" +
"    return errorHelper$k(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$h(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$k(field, value, \"number\");\n" +
"}\n" +
"function checkString$j(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$k(field, value, \"string\");\n" +
"}\n" +
"function errorHelper$k(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$k));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$k;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$k));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$j = null;\n" +
"class APIDMSItemList {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItemList.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$j = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$j(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$j(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$j(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$i(d.filters, field + \".filters\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.filters, field + \".filters\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$b(d.items, field + \".items\");\n" +
"        if (d.items) {\n" +
"            for (let i = 0; i < d.items.length; i++) {\n" +
"                d.items[i] = ItemsEntity.Create(d.items[i], field + \".items\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.pagination = Pagination$2.Create(d.pagination, field + \".pagination\");\n" +
"        checkString$i(d.sort, field + \".sort\");\n" +
"        const knownProperties = [\"filters\", \"items\", \"pagination\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSItemList(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.filters = d.filters;\n" +
"        this.items = d.items;\n" +
"        this.pagination = d.pagination;\n" +
"        this.sort = d.sort;\n" +
"    }\n" +
"}\n" +
"class ItemsEntity {\n" +
"    static Parse(d) {\n" +
"        return ItemsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$j = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$j(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$j(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$j(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$e(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$i(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"comments_count\" in d) {\n" +
"            checkNumber$g(d.comments_count, field + \".comments_count\");\n" +
"        }\n" +
"        checkString$i(d.created_at, field + \".created_at\");\n" +
"        if (\"creator\" in d) {\n" +
"            d.creator = Creator$4.Create(d.creator, field + \".creator\");\n" +
"        }\n" +
"        if (\"favorite\" in d) {\n" +
"            checkBoolean$b(d.favorite, field + \".favorite\");\n" +
"        }\n" +
"        if (\"file_extension\" in d) {\n" +
"            checkString$i(d.file_extension, field + \".file_extension\");\n" +
"        }\n" +
"        if (\"file_size\" in d) {\n" +
"            checkNumber$g(d.file_size, field + \".file_size\");\n" +
"        }\n" +
"        if (\"file_url\" in d) {\n" +
"            checkString$i(d.file_url, field + \".file_url\");\n" +
"        }\n" +
"        if (\"fixed\" in d) {\n" +
"            checkBoolean$b(d.fixed, field + \".fixed\");\n" +
"        }\n" +
"        checkNumber$g(d.id, field + \".id\");\n" +
"        checkBoolean$b(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$g(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$i(d.method, field + \".method\");\n" +
"        checkString$i(d.name, field + \".name\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$g(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$i(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$b(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"reference_link\" in d) {\n" +
"            checkNull$e(d.reference_link, field + \".reference_link\");\n" +
"        }\n" +
"        checkBoolean$b(d.shared, field + \".shared\");\n" +
"        if (\"signed_id\" in d) {\n" +
"            checkString$i(d.signed_id, field + \".signed_id\");\n" +
"        }\n" +
"        if (\"suggested_folders\" in d) {\n" +
"            checkArray$b(d.suggested_folders, field + \".suggested_folders\");\n" +
"            if (d.suggested_folders) {\n" +
"                for (let i = 0; i < d.suggested_folders.length; i++) {\n" +
"                    checkNever$4(d.suggested_folders[i], field + \".suggested_folders\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$e(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        checkString$i(d.type, field + \".type\");\n" +
"        checkString$i(d.updated_at, field + \".updated_at\");\n" +
"        if (\"visible\" in d) {\n" +
"            checkBoolean$b(d.visible, field + \".visible\");\n" +
"        }\n" +
"        const knownProperties = [\"archived_at\", \"comments_count\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"suggested_folders\", \"summary_text\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ItemsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.archived_at = d.archived_at;\n" +
"        if (\"comments_count\" in d)\n" +
"            this.comments_count = d.comments_count;\n" +
"        this.created_at = d.created_at;\n" +
"        if (\"creator\" in d)\n" +
"            this.creator = d.creator;\n" +
"        if (\"favorite\" in d)\n" +
"            this.favorite = d.favorite;\n" +
"        if (\"file_extension\" in d)\n" +
"            this.file_extension = d.file_extension;\n" +
"        if (\"file_size\" in d)\n" +
"            this.file_size = d.file_size;\n" +
"        if (\"file_url\" in d)\n" +
"            this.file_url = d.file_url;\n" +
"        if (\"fixed\" in d)\n" +
"            this.fixed = d.fixed;\n" +
"        this.id = d.id;\n" +
"        this.imports_allowed = d.imports_allowed;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        this.parent_id = d.parent_id;\n" +
"        if (\"pusher_channel\" in d)\n" +
"            this.pusher_channel = d.pusher_channel;\n" +
"        if (\"readonly\" in d)\n" +
"            this.readonly = d.readonly;\n" +
"        if (\"reference_link\" in d)\n" +
"            this.reference_link = d.reference_link;\n" +
"        this.shared = d.shared;\n" +
"        if (\"signed_id\" in d)\n" +
"            this.signed_id = d.signed_id;\n" +
"        if (\"suggested_folders\" in d)\n" +
"            this.suggested_folders = d.suggested_folders;\n" +
"        if (\"summary_text\" in d)\n" +
"            this.summary_text = d.summary_text;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        if (\"visible\" in d)\n" +
"            this.visible = d.visible;\n" +
"    }\n" +
"}\n" +
"let Creator$4 = class Creator {\n" +
"    static Parse(d) {\n" +
"        return Creator.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$j = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$j(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$j(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$j(field, d);\n" +
"        }\n" +
"        checkString$i(d.email, field + \".email\");\n" +
"        checkString$i(d.first_name, field + \".first_name\");\n" +
"        checkString$i(d.full_name, field + \".full_name\");\n" +
"        checkString$i(d.last_name, field + \".last_name\");\n" +
"        checkString$i(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Creator(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.email = d.email;\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.role = d.role;\n" +
"    }\n" +
"};\n" +
"let Pagination$2 = class Pagination {\n" +
"    static Parse(d) {\n" +
"        return Pagination.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$j = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$j(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$j(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$j(field, d);\n" +
"        }\n" +
"        checkBoolean$b(d.hasNextPage, field + \".hasNextPage\");\n" +
"        checkNumber$g(d.page, field + \".page\");\n" +
"        checkNumber$g(d.pages, field + \".pages\");\n" +
"        checkNumber$g(d.pageSize, field + \".pageSize\");\n" +
"        checkNumber$g(d.totalEntries, field + \".totalEntries\");\n" +
"        checkString$i(d.totalEntriesPrecision, field + \".totalEntriesPrecision\");\n" +
"        checkString$i(d.totalEntriesStr, field + \".totalEntriesStr\");\n" +
"        const knownProperties = [\"hasNextPage\", \"page\", \"pages\", \"pageSize\", \"totalEntries\", \"totalEntriesPrecision\", \"totalEntriesStr\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Pagination(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.hasNextPage = d.hasNextPage;\n" +
"        this.page = d.page;\n" +
"        this.pages = d.pages;\n" +
"        this.pageSize = d.pageSize;\n" +
"        this.totalEntries = d.totalEntries;\n" +
"        this.totalEntriesPrecision = d.totalEntriesPrecision;\n" +
"        this.totalEntriesStr = d.totalEntriesStr;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$j(field, value, multiple) {\n" +
"    return errorHelper$j(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$j(field, value, multiple) {\n" +
"    return errorHelper$j(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$j(field, value, multiple) {\n" +
"    return errorHelper$j(field, value, \"object\");\n" +
"}\n" +
"function checkArray$b(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$j(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$g(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$j(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$b(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$j(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$i(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$j(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$e(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$j(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$4(value, field, multiple) {\n" +
"    return errorHelper$j(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$j(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$j));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$j;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$j));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$i = null;\n" +
"class APIDMSItemListParams {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItemListParams.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$i = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$i(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$i(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$i(field, d);\n" +
"        }\n" +
"        if (\"filter\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkArray$a(d.filter, field + \".filter\", \"FilterEntity[] | string\");\n" +
"                if (d.filter) {\n" +
"                    for (let i = 0; i < d.filter.length; i++) {\n" +
"                        d.filter[i] = FilterEntity$1.Create(d.filter[i], field + \".filter\" + \"[\" + i + \"]\");\n" +
"                    }\n" +
"                }\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$h(d.filter, field + \".filter\", \"FilterEntity[] | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"page\" in d) {\n" +
"            checkNumber$f(d.page, field + \".page\");\n" +
"        }\n" +
"        if (\"page_name\" in d) {\n" +
"            checkString$h(d.page_name, field + \".page_name\");\n" +
"        }\n" +
"        if (\"sort\" in d) {\n" +
"            checkString$h(d.sort, field + \".sort\");\n" +
"        }\n" +
"        const knownProperties = [\"filter\", \"page\", \"page_name\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$i(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSItemListParams(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"filter\" in d)\n" +
"            this.filter = d.filter;\n" +
"        if (\"page\" in d)\n" +
"            this.page = d.page;\n" +
"        if (\"page_name\" in d)\n" +
"            this.page_name = d.page_name;\n" +
"        if (\"sort\" in d)\n" +
"            this.sort = d.sort;\n" +
"    }\n" +
"}\n" +
"let FilterEntity$1 = class FilterEntity {\n" +
"    static Parse(d) {\n" +
"        return FilterEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$i = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$i(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$i(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$i(field, d);\n" +
"        }\n" +
"        checkString$h(d.field, field + \".field\");\n" +
"        checkString$h(d.operator, field + \".operator\");\n" +
"        checkString$h(d.value, field + \".value\");\n" +
"        const knownProperties = [\"field\", \"operator\", \"value\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$i(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new FilterEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.field = d.field;\n" +
"        this.operator = d.operator;\n" +
"        this.value = d.value;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$i(field, value, multiple) {\n" +
"    return errorHelper$i(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$i(field, value, multiple) {\n" +
"    return errorHelper$i(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$i(field, value, multiple) {\n" +
"    return errorHelper$i(field, value, \"object\");\n" +
"}\n" +
"function checkArray$a(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$i(field, value, multiple);\n" +
"}\n" +
"function checkNumber$f(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$i(field, value, \"number\");\n" +
"}\n" +
"function checkString$h(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$i(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function errorHelper$i(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$i));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$i;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$i));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$h = null;\n" +
"class APIDMSItemSettings {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItemSettings.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$h = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$h(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$h(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$h(field, d);\n" +
"        }\n" +
"        checkString$g(d.filters, field + \".filters\");\n" +
"        checkArray$9(d.firm_admins, field + \".firm_admins\");\n" +
"        if (d.firm_admins) {\n" +
"            for (let i = 0; i < d.firm_admins.length; i++) {\n" +
"                checkNever$3(d.firm_admins[i], field + \".firm_admins\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.folder = Folder.Create(d.folder, field + \".folder\");\n" +
"        checkBoolean$a(d.is_dms_activated_on_firm, field + \".is_dms_activated_on_firm\");\n" +
"        checkBoolean$a(d.is_firm_admin, field + \".is_firm_admin\");\n" +
"        d.item = Item.Create(d.item, field + \".item\");\n" +
"        checkString$g(d.sort, field + \".sort\");\n" +
"        const knownProperties = [\"filters\", \"firm_admins\", \"folder\", \"is_dms_activated_on_firm\", \"is_firm_admin\", \"item\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$h(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSItemSettings(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.filters = d.filters;\n" +
"        this.firm_admins = d.firm_admins;\n" +
"        this.folder = d.folder;\n" +
"        this.is_dms_activated_on_firm = d.is_dms_activated_on_firm;\n" +
"        this.is_firm_admin = d.is_firm_admin;\n" +
"        this.item = d.item;\n" +
"        this.sort = d.sort;\n" +
"    }\n" +
"}\n" +
"class Folder {\n" +
"    static Parse(d) {\n" +
"        return Folder.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$h = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$h(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$h(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$h(field, d);\n" +
"        }\n" +
"        checkNull$d(d.archived_at, field + \".archived_at\");\n" +
"        checkString$g(d.created_at, field + \".created_at\");\n" +
"        d.creator = Creator$3.Create(d.creator, field + \".creator\");\n" +
"        checkBoolean$a(d.fixed, field + \".fixed\");\n" +
"        checkNumber$e(d.id, field + \".id\");\n" +
"        checkBoolean$a(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$e(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$g(d.method, field + \".method\");\n" +
"        checkString$g(d.name, field + \".name\");\n" +
"        checkNumber$e(d.parent_id, field + \".parent_id\");\n" +
"        checkBoolean$a(d.shared, field + \".shared\");\n" +
"        checkString$g(d.type, field + \".type\");\n" +
"        checkString$g(d.updated_at, field + \".updated_at\");\n" +
"        checkBoolean$a(d.visible, field + \".visible\");\n" +
"        const knownProperties = [\"archived_at\", \"created_at\", \"creator\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"shared\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$h(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Folder(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.archived_at = d.archived_at;\n" +
"        this.created_at = d.created_at;\n" +
"        this.creator = d.creator;\n" +
"        this.fixed = d.fixed;\n" +
"        this.id = d.id;\n" +
"        this.imports_allowed = d.imports_allowed;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        this.parent_id = d.parent_id;\n" +
"        this.shared = d.shared;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.visible = d.visible;\n" +
"    }\n" +
"}\n" +
"let Creator$3 = class Creator {\n" +
"    static Parse(d) {\n" +
"        return Creator.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$h = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$h(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$h(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$h(field, d);\n" +
"        }\n" +
"        checkString$g(d.email, field + \".email\");\n" +
"        checkString$g(d.first_name, field + \".first_name\");\n" +
"        checkString$g(d.full_name, field + \".full_name\");\n" +
"        checkString$g(d.last_name, field + \".last_name\");\n" +
"        checkString$g(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$h(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Creator(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.email = d.email;\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.role = d.role;\n" +
"    }\n" +
"};\n" +
"class Item {\n" +
"    static Parse(d) {\n" +
"        return Item.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$h = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$h(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$h(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$h(field, d);\n" +
"        }\n" +
"        checkNull$d(d.archived_at, field + \".archived_at\");\n" +
"        checkNumber$e(d.comments_count, field + \".comments_count\");\n" +
"        checkString$g(d.created_at, field + \".created_at\");\n" +
"        d.creator = Creator$3.Create(d.creator, field + \".creator\");\n" +
"        checkBoolean$a(d.favorite, field + \".favorite\");\n" +
"        checkString$g(d.file_extension, field + \".file_extension\");\n" +
"        checkNumber$e(d.file_size, field + \".file_size\");\n" +
"        checkString$g(d.file_url, field + \".file_url\");\n" +
"        checkNumber$e(d.id, field + \".id\");\n" +
"        checkBoolean$a(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$e(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$g(d.method, field + \".method\");\n" +
"        checkString$g(d.name, field + \".name\");\n" +
"        checkNumber$e(d.parent_id, field + \".parent_id\");\n" +
"        checkString$g(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkBoolean$a(d.readonly, field + \".readonly\");\n" +
"        checkNull$d(d.reference_link, field + \".reference_link\");\n" +
"        checkBoolean$a(d.shared, field + \".shared\");\n" +
"        checkString$g(d.signed_id, field + \".signed_id\");\n" +
"        checkString$g(d.type, field + \".type\");\n" +
"        checkString$g(d.updated_at, field + \".updated_at\");\n" +
"        const knownProperties = [\"archived_at\", \"comments_count\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"type\", \"updated_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$h(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Item(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.archived_at = d.archived_at;\n" +
"        this.comments_count = d.comments_count;\n" +
"        this.created_at = d.created_at;\n" +
"        this.creator = d.creator;\n" +
"        this.favorite = d.favorite;\n" +
"        this.file_extension = d.file_extension;\n" +
"        this.file_size = d.file_size;\n" +
"        this.file_url = d.file_url;\n" +
"        this.id = d.id;\n" +
"        this.imports_allowed = d.imports_allowed;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        this.parent_id = d.parent_id;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.readonly = d.readonly;\n" +
"        this.reference_link = d.reference_link;\n" +
"        this.shared = d.shared;\n" +
"        this.signed_id = d.signed_id;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$h(field, value, multiple) {\n" +
"    return errorHelper$h(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$h(field, value, multiple) {\n" +
"    return errorHelper$h(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$h(field, value, multiple) {\n" +
"    return errorHelper$h(field, value, \"object\");\n" +
"}\n" +
"function checkArray$9(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$h(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$e(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$h(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$a(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$h(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$g(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$h(field, value, \"string\");\n" +
"}\n" +
"function checkNull$d(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$h(field, value, \"null\");\n" +
"}\n" +
"function checkNever$3(value, field, multiple) {\n" +
"    return errorHelper$h(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$h(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$h));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$h;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$h));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$g = null;\n" +
"class APIDMSLink {\n" +
"    static Parse(d) {\n" +
"        return APIDMSLink.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$g = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$g(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$g(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$g(field, d);\n" +
"        }\n" +
"        checkString$f(d.created_at, field + \".created_at\");\n" +
"        checkNumber$d(d.id, field + \".id\");\n" +
"        checkNumber$d(d.item_id, field + \".item_id\");\n" +
"        d.linkable = Linkable$1.Create(d.linkable, field + \".linkable\");\n" +
"        checkNumber$d(d.linkable_id, field + \".linkable_id\");\n" +
"        checkString$f(d.linkable_type, field + \".linkable_type\");\n" +
"        checkString$f(d.name, field + \".name\");\n" +
"        checkNumber$d(d.record_id, field + \".record_id\");\n" +
"        checkString$f(d.record_type, field + \".record_type\");\n" +
"        checkNull$c(d.reference, field + \".reference\");\n" +
"        const knownProperties = [\"created_at\", \"id\", \"item_id\", \"linkable\", \"linkable_id\", \"linkable_type\", \"name\", \"record_id\", \"record_type\", \"reference\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$g(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSLink(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.id = d.id;\n" +
"        this.item_id = d.item_id;\n" +
"        this.linkable = d.linkable;\n" +
"        this.linkable_id = d.linkable_id;\n" +
"        this.linkable_type = d.linkable_type;\n" +
"        this.name = d.name;\n" +
"        this.record_id = d.record_id;\n" +
"        this.record_type = d.record_type;\n" +
"        this.reference = d.reference;\n" +
"    }\n" +
"}\n" +
"let Linkable$1 = class Linkable {\n" +
"    static Parse(d) {\n" +
"        return Linkable.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$g = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$g(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$g(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$g(field, d);\n" +
"        }\n" +
"        checkArray$8(d.comments, field + \".comments\");\n" +
"        if (d.comments) {\n" +
"            for (let i = 0; i < d.comments.length; i++) {\n" +
"                d.comments[i] = CommentsEntity$1.Create(d.comments[i], field + \".comments\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.creator = Creator$2.Create(d.creator, field + \".creator\");\n" +
"        checkString$f(d.file_extension, field + \".file_extension\");\n" +
"        checkNumber$d(d.file_size, field + \".file_size\");\n" +
"        checkString$f(d.file_url, field + \".file_url\");\n" +
"        checkNumber$d(d.itemable_id, field + \".itemable_id\");\n" +
"        checkNull$c(d.url, field + \".url\");\n" +
"        const knownProperties = [\"comments\", \"creator\", \"file_extension\", \"file_size\", \"file_url\", \"itemable_id\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$g(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Linkable(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.comments = d.comments;\n" +
"        this.creator = d.creator;\n" +
"        this.file_extension = d.file_extension;\n" +
"        this.file_size = d.file_size;\n" +
"        this.file_url = d.file_url;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        this.url = d.url;\n" +
"    }\n" +
"};\n" +
"let CommentsEntity$1 = class CommentsEntity {\n" +
"    static Parse(d) {\n" +
"        return CommentsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$g = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$g(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$g(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$g(field, d);\n" +
"        }\n" +
"        checkString$f(d.content, field + \".content\");\n" +
"        checkString$f(d.created_at, field + \".created_at\");\n" +
"        const knownProperties = [\"content\", \"created_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$g(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new CommentsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.content = d.content;\n" +
"        this.created_at = d.created_at;\n" +
"    }\n" +
"};\n" +
"let Creator$2 = class Creator {\n" +
"    static Parse(d) {\n" +
"        return Creator.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$g = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$g(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$g(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$g(field, d);\n" +
"        }\n" +
"        checkString$f(d.email, field + \".email\");\n" +
"        checkString$f(d.first_name, field + \".first_name\");\n" +
"        checkString$f(d.full_name, field + \".full_name\");\n" +
"        checkString$f(d.last_name, field + \".last_name\");\n" +
"        checkString$f(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$g(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Creator(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.email = d.email;\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.role = d.role;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$g(field, value, multiple) {\n" +
"    return errorHelper$g(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$g(field, value, multiple) {\n" +
"    return errorHelper$g(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$g(field, value, multiple) {\n" +
"    return errorHelper$g(field, value, \"object\");\n" +
"}\n" +
"function checkArray$8(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$g(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$d(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$g(field, value, \"number\");\n" +
"}\n" +
"function checkString$f(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$g(field, value, \"string\");\n" +
"}\n" +
"function checkNull$c(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$g(field, value, \"null\");\n" +
"}\n" +
"function errorHelper$g(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$g));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$g;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$g));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$f = null;\n" +
"class APIDMSLinkList {\n" +
"    static Parse(d) {\n" +
"        return APIDMSLinkList.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$f = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$f(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$f(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$f(field, d);\n" +
"        }\n" +
"        checkArray$7(d.dms_links, field + \".dms_links\");\n" +
"        if (d.dms_links) {\n" +
"            for (let i = 0; i < d.dms_links.length; i++) {\n" +
"                d.dms_links[i] = DmsLinksEntity.Create(d.dms_links[i], field + \".dms_links\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"dms_links\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$f(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSLinkList(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.dms_links = d.dms_links;\n" +
"    }\n" +
"}\n" +
"class DmsLinksEntity {\n" +
"    static Parse(d) {\n" +
"        return DmsLinksEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$f = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$f(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$f(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$f(field, d);\n" +
"        }\n" +
"        checkString$e(d.created_at, field + \".created_at\");\n" +
"        checkNumber$c(d.id, field + \".id\");\n" +
"        checkNumber$c(d.item_id, field + \".item_id\");\n" +
"        d.linkable = Linkable.Create(d.linkable, field + \".linkable\");\n" +
"        checkNumber$c(d.linkable_id, field + \".linkable_id\");\n" +
"        checkString$e(d.linkable_type, field + \".linkable_type\");\n" +
"        checkString$e(d.name, field + \".name\");\n" +
"        checkNumber$c(d.record_id, field + \".record_id\");\n" +
"        checkString$e(d.record_type, field + \".record_type\");\n" +
"        checkNull$b(d.reference, field + \".reference\");\n" +
"        const knownProperties = [\"created_at\", \"id\", \"item_id\", \"linkable\", \"linkable_id\", \"linkable_type\", \"name\", \"record_id\", \"record_type\", \"reference\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$f(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new DmsLinksEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.id = d.id;\n" +
"        this.item_id = d.item_id;\n" +
"        this.linkable = d.linkable;\n" +
"        this.linkable_id = d.linkable_id;\n" +
"        this.linkable_type = d.linkable_type;\n" +
"        this.name = d.name;\n" +
"        this.record_id = d.record_id;\n" +
"        this.record_type = d.record_type;\n" +
"        this.reference = d.reference;\n" +
"    }\n" +
"}\n" +
"class Linkable {\n" +
"    static Parse(d) {\n" +
"        return Linkable.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$f = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$f(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$f(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$f(field, d);\n" +
"        }\n" +
"        checkArray$7(d.comments, field + \".comments\");\n" +
"        if (d.comments) {\n" +
"            for (let i = 0; i < d.comments.length; i++) {\n" +
"                d.comments[i] = CommentsEntity.Create(d.comments[i], field + \".comments\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.creator = Creator$1.Create(d.creator, field + \".creator\");\n" +
"        checkString$e(d.file_extension, field + \".file_extension\");\n" +
"        checkNumber$c(d.file_size, field + \".file_size\");\n" +
"        checkString$e(d.file_url, field + \".file_url\");\n" +
"        checkNumber$c(d.itemable_id, field + \".itemable_id\");\n" +
"        checkNull$b(d.url, field + \".url\");\n" +
"        const knownProperties = [\"comments\", \"creator\", \"file_extension\", \"file_size\", \"file_url\", \"itemable_id\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$f(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Linkable(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.comments = d.comments;\n" +
"        this.creator = d.creator;\n" +
"        this.file_extension = d.file_extension;\n" +
"        this.file_size = d.file_size;\n" +
"        this.file_url = d.file_url;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        this.url = d.url;\n" +
"    }\n" +
"}\n" +
"class CommentsEntity {\n" +
"    static Parse(d) {\n" +
"        return CommentsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$f = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$f(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$f(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$f(field, d);\n" +
"        }\n" +
"        checkString$e(d.content, field + \".content\");\n" +
"        checkString$e(d.created_at, field + \".created_at\");\n" +
"        const knownProperties = [\"content\", \"created_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$f(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new CommentsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.content = d.content;\n" +
"        this.created_at = d.created_at;\n" +
"    }\n" +
"}\n" +
"let Creator$1 = class Creator {\n" +
"    static Parse(d) {\n" +
"        return Creator.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$f = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$f(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$f(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$f(field, d);\n" +
"        }\n" +
"        checkString$e(d.email, field + \".email\");\n" +
"        checkString$e(d.first_name, field + \".first_name\");\n" +
"        checkString$e(d.full_name, field + \".full_name\");\n" +
"        checkString$e(d.last_name, field + \".last_name\");\n" +
"        checkString$e(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$f(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Creator(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.email = d.email;\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.role = d.role;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$f(field, value, multiple) {\n" +
"    return errorHelper$f(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$f(field, value, multiple) {\n" +
"    return errorHelper$f(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$f(field, value, multiple) {\n" +
"    return errorHelper$f(field, value, \"object\");\n" +
"}\n" +
"function checkArray$7(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$f(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$c(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$f(field, value, \"number\");\n" +
"}\n" +
"function checkString$e(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$f(field, value, \"string\");\n" +
"}\n" +
"function checkNull$b(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$f(field, value, \"null\");\n" +
"}\n" +
"function errorHelper$f(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$f));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$f;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$f));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$e = null;\n" +
"class APIDMSToInvoice {\n" +
"    static Parse(d) {\n" +
"        return APIDMSToInvoice.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$e = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$e(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$e(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$e(field, d);\n" +
"        }\n" +
"        checkString$d(d.message, field + \".message\");\n" +
"        const knownProperties = [\"message\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$e(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSToInvoice(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.message = d.message;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$e(field, value, multiple) {\n" +
"    return errorHelper$e(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$e(field, value, multiple) {\n" +
"    return errorHelper$e(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$e(field, value, multiple) {\n" +
"    return errorHelper$e(field, value, \"object\");\n" +
"}\n" +
"function checkString$d(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$e(field, value, \"string\");\n" +
"}\n" +
"function errorHelper$e(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$e));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$e;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$e));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$d = null;\n" +
"class APIDMSUpdateItem {\n" +
"    static Parse(d) {\n" +
"        return APIDMSUpdateItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$d = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$d(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$d(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$d(field, d);\n" +
"        }\n" +
"        checkNull$a(d.archived_at, field + \".archived_at\");\n" +
"        checkString$c(d.created_at, field + \".created_at\");\n" +
"        d.creator = Creator.Create(d.creator, field + \".creator\");\n" +
"        checkBoolean$9(d.favorite, field + \".favorite\");\n" +
"        checkString$c(d.file_extension, field + \".file_extension\");\n" +
"        checkNumber$b(d.file_size, field + \".file_size\");\n" +
"        checkString$c(d.file_url, field + \".file_url\");\n" +
"        checkNumber$b(d.id, field + \".id\");\n" +
"        checkBoolean$9(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$b(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$c(d.method, field + \".method\");\n" +
"        checkString$c(d.name, field + \".name\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$b(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$a(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$c(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkBoolean$9(d.readonly, field + \".readonly\");\n" +
"        checkNull$a(d.reference_link, field + \".reference_link\");\n" +
"        checkBoolean$9(d.shared, field + \".shared\");\n" +
"        checkString$c(d.signed_id, field + \".signed_id\");\n" +
"        checkString$c(d.type, field + \".type\");\n" +
"        checkString$c(d.updated_at, field + \".updated_at\");\n" +
"        const knownProperties = [\"archived_at\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"type\", \"updated_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$d(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSUpdateItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.archived_at = d.archived_at;\n" +
"        this.created_at = d.created_at;\n" +
"        this.creator = d.creator;\n" +
"        this.favorite = d.favorite;\n" +
"        this.file_extension = d.file_extension;\n" +
"        this.file_size = d.file_size;\n" +
"        this.file_url = d.file_url;\n" +
"        this.id = d.id;\n" +
"        this.imports_allowed = d.imports_allowed;\n" +
"        this.itemable_id = d.itemable_id;\n" +
"        this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        this.parent_id = d.parent_id;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.readonly = d.readonly;\n" +
"        this.reference_link = d.reference_link;\n" +
"        this.shared = d.shared;\n" +
"        this.signed_id = d.signed_id;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"    }\n" +
"}\n" +
"class Creator {\n" +
"    static Parse(d) {\n" +
"        return Creator.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$d = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$d(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$d(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$d(field, d);\n" +
"        }\n" +
"        checkString$c(d.email, field + \".email\");\n" +
"        checkString$c(d.first_name, field + \".first_name\");\n" +
"        checkString$c(d.full_name, field + \".full_name\");\n" +
"        checkString$c(d.last_name, field + \".last_name\");\n" +
"        checkString$c(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$d(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Creator(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.email = d.email;\n" +
"        this.first_name = d.first_name;\n" +
"        this.full_name = d.full_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.role = d.role;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$d(field, value, multiple) {\n" +
"    return errorHelper$d(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$d(field, value, multiple) {\n" +
"    return errorHelper$d(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$d(field, value, multiple) {\n" +
"    return errorHelper$d(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$b(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$d(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$9(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$d(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$c(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$d(field, value, \"string\");\n" +
"}\n" +
"function checkNull$a(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$d(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function errorHelper$d(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$d));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$d;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$d));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"const logger$1 = new Logger('API_DMS');\n" +
"/**\n" +
" * Get DMS items linked to a record (a document)\n" +
" * @param recordId\n" +
" * @param recordType\n" +
" * @returns\n" +
" */\n" +
"async function getDMSLinks(recordId, recordType) {\n" +
"    if (!recordType)\n" +
"        recordType = (await getDocument(recordId)).type;\n" +
"    const response = await apiRequest(`dms/links/data?record_ids[]=${recordId}&record_type=${recordType}`, null, 'GET');\n" +
"    const data = await response?.json();\n" +
"    if (!data)\n" +
"        return data;\n" +
"    const list = APIDMSLinkList.Create(data);\n" +
"    return list.dms_links.map(link => APIDMSLink.Create(link));\n" +
"}\n" +
"/**\n" +
" * Get DMS item\n" +
" * @param id\n" +
" * @returns\n" +
" */\n" +
"async function getDMSItem(id) {\n" +
"    const response = await apiRequest(`dms/items/${id}`, null, 'GET');\n" +
"    const data = await response?.json();\n" +
"    if (!data) {\n" +
"        logger$1.error('getDMSItem', { id, response, data });\n" +
"        const settings = await getDMSItemSettings(id);\n" +
"        if (!settings?.item)\n" +
"            return null;\n" +
"        return settings.item;\n" +
"    }\n" +
"    return APIDMSItem.Create(data);\n" +
"}\n" +
"/**\n" +
" * Get list of records (documents) linked to a DMS item\n" +
" * @param dmsFileId\n" +
" * @returns\n" +
" */\n" +
"async function getDMSItemLinks(\n" +
"/** the DMSItem.itemable_id */\n" +
"dmsFileId, maxAge) {\n" +
"    const data = await cachedRequest(\"dms:getDMSItemLinks\", { id: dmsFileId }, async ({ id }) => {\n" +
"        const response = await apiRequest(`dms/files/${id}/links`, null, \"GET\");\n" +
"        const data = await response?.json();\n" +
"        if (!Array.isArray(data)) {\n" +
"            logger$1.error(\"réponse inattendue pour getDMSItemLinks\", { response, data });\n" +
"            return [];\n" +
"        }\n" +
"        return data;\n" +
"    }, maxAge);\n" +
"    return data.map((item) => APIDMSItemLink.Create(item));\n" +
"}\n" +
"/**\n" +
" * Get DMS item settings\n" +
" * @param id\n" +
" * @returns\n" +
" */\n" +
"async function getDMSItemSettings(id) {\n" +
"    const response = await apiRequest(`dms/items/settings.json?filter=&item_id=${id}`, null, 'GET');\n" +
"    const data = await response?.json();\n" +
"    if (!data) {\n" +
"        logger$1.error('getDMSItemSettings', { id, response, data });\n" +
"        return data;\n" +
"    }\n" +
"    return APIDMSItemSettings.Create(data);\n" +
"}\n" +
"/**\n" +
" * Generate all result one by one as generator\n" +
" */\n" +
"async function* getDMSItemGenerator(params = {}) {\n" +
"    let page = Number(params.page ?? 1);\n" +
"    if (!Number.isSafeInteger(page)) {\n" +
"        console.log('getDMSItemGenerator', { params, page });\n" +
"        throw new Error('params.page, if provided, MUST be a safe integer');\n" +
"    }\n" +
"    do {\n" +
"        const data = await getDMSItemList(Object.assign({}, params, { page }));\n" +
"        const items = data.items;\n" +
"        if (!items?.length)\n" +
"            return;\n" +
"        for (const item of items)\n" +
"            yield item;\n" +
"        ++page;\n" +
"    } while (true);\n" +
"}\n" +
"/**\n" +
" * Load list of DMS from API. paginated.\n" +
" */\n" +
"async function getDMSItemList(params = {}) {\n" +
"    if ('filter' in params && typeof params.filter !== 'string')\n" +
"        params = { ...params, filter: JSON.stringify(params.filter) };\n" +
"    params = { ...params, page_name: 'all' };\n" +
"    const searchParams = new URLSearchParams(APIDMSItemListParams.Create(params));\n" +
"    const url = `dms/items/data.json?${searchParams.toString()}`;\n" +
"    const response = await apiRequest(url, null, 'GET');\n" +
"    return APIDMSItemList.Create(await response.json());\n" +
"}\n" +
"/**\n" +
" * Update DMS item\n" +
" */\n" +
"async function updateDMSItem(entry) {\n" +
"    const { id, ...value } = entry;\n" +
"    const response = await apiRequest(`dms/items/${id}`, { dms_item: value }, 'PUT');\n" +
"    return APIDMSUpdateItem.Create(await response.json());\n" +
"}\n" +
"/**\n" +
" * Lier un fichier de la DMS\n" +
" * https://app.pennylane.com/companies/21936866/dms/links/batch_create\n" +
" * {\"dms_links\":{\"record_ids\":[580461033],\"record_type\":\"Transaction\",\"dms_file_ids\":[48168851],\"dms_external_link_ids\":[]}}\n" +
" * POST\n" +
" * */\n" +
"async function createDMSLink(dmsFileId, recordId, recordType) {\n" +
"    const response = await apiRequest('dms/links/batch_create', { dms_links: { record_ids: [recordId], record_type: recordType, dms_file_ids: [dmsFileId] } }, 'POST');\n" +
"    return APIDMSCreateLink.Create(await response.json());\n" +
"}\n" +
"async function dmsToInvoice(dmsId, direction) {\n" +
"    const signed_ids = Array.isArray(dmsId) ? dmsId : [dmsId];\n" +
"    const response = await apiRequest('dms/files/convert_to_invoice', { upload: { signed_ids, direction } }, 'POST');\n" +
"    const data = await response?.json();\n" +
"    if (!data)\n" +
"        return data;\n" +
"    return APIDMSToInvoice.Create(data);\n" +
"}\n" +
"async function getDMSDestId(ref) {\n" +
"    let direction;\n" +
"    let year = ref.date.slice(0, 4);\n" +
"    if (ref.type === \"Transaction\") {\n" +
"        direction = parseFloat(ref.amount) > 0 ? \"customer\" : \"supplier\";\n" +
"    }\n" +
"    if (ref.type === \"Invoice\" && \"direction\" in ref) {\n" +
"        direction = ref.direction;\n" +
"    }\n" +
"    logger$1.log(\"getDMSDestId\", { ref, direction, year });\n" +
"    switch (direction) {\n" +
"        case \"customer\":\n" +
"            switch (year) {\n" +
"                case \"2023\":\n" +
"                    return { parent_id: 57983092, direction }; // 2023 - Compta - Clients\n" +
"                case \"2024\":\n" +
"                    return { parent_id: 21994051, direction }; // 2024 - Compta - Clients\n" +
"                case \"2025\":\n" +
"                    return { parent_id: 21994066, direction }; // 2025 - Compta - Clients Ventes\n" +
"            }\n" +
"            break;\n" +
"        case \"supplier\":\n" +
"            switch (year) {\n" +
"                case \"2024\":\n" +
"                    return { parent_id: 21994050, direction }; // 2024 - Compta - Fournisseurs\n" +
"                case \"2025\":\n" +
"                    return { parent_id: 21994065, direction }; // 2025 - Compta - Achats\n" +
"            }\n" +
"            break;\n" +
"    }\n" +
"    logger$1.log(\"getDMSDestId\", { ref });\n" +
"    return null;\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$c = null;\n" +
"class APIJournal {\n" +
"    static Parse(d) {\n" +
"        return APIJournal.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$c = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$c(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$c(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$c(field, d);\n" +
"        }\n" +
"        checkString$b(d.code, field + \".code\");\n" +
"        checkNumber$a(d.id, field + \".id\");\n" +
"        checkString$b(d.journal_type, field + \".journal_type\");\n" +
"        checkString$b(d.label, field + \".label\");\n" +
"        const knownProperties = [\"code\", \"id\", \"journal_type\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$c(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIJournal(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.code = d.code;\n" +
"        this.id = d.id;\n" +
"        this.journal_type = d.journal_type;\n" +
"        this.label = d.label;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$c(field, value, multiple) {\n" +
"    return errorHelper$c(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$c(field, value, multiple) {\n" +
"    return errorHelper$c(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$c(field, value, multiple) {\n" +
"    return errorHelper$c(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$a(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$c(field, value, \"number\");\n" +
"}\n" +
"function checkString$b(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$c(field, value, \"string\");\n" +
"}\n" +
"function errorHelper$c(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$c));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$c;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$c));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"async function getJournal(id) {\n" +
"    const response = await apiRequest(`journals/${id}`, null, \"GET\");\n" +
"    const data = await response?.json();\n" +
"    if (!data)\n" +
"        return null;\n" +
"    return APIJournal.Create(data);\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$b = null;\n" +
"class APIGroupedDocument {\n" +
"    static Parse(d) {\n" +
"        return APIGroupedDocument.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$b = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$b(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$b(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$b(field, d);\n" +
"        }\n" +
"        checkString$a(d.amount, field + \".amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$9(d.date, field + \".date\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$a(d.date, field + \".date\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$a(d.fec_pieceref, field + \".fec_pieceref\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        checkBoolean$8(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        d.journal = Journal.Create(d.journal, field + \".journal\");\n" +
"        checkNumber$9(d.journal_id, field + \".journal_id\");\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        checkNumber$9(d.ledgerEventsCount, field + \".ledgerEventsCount\");\n" +
"        checkBoolean$8(d.readonly, field + \".readonly\");\n" +
"        checkString$a(d.source, field + \".source\");\n" +
"        if (\"taggingCount\" in d) {\n" +
"            checkNumber$9(d.taggingCount, field + \".taggingCount\");\n" +
"        }\n" +
"        checkString$a(d.totalCredit, field + \".totalCredit\");\n" +
"        checkString$a(d.totalDebit, field + \".totalDebit\");\n" +
"        checkString$a(d.type, field + \".type\");\n" +
"        const knownProperties = [\"amount\", \"date\", \"fec_pieceref\", \"id\", \"is_waiting_details\", \"journal\", \"journal_id\", \"label\", \"ledgerEventsCount\", \"readonly\", \"source\", \"taggingCount\", \"totalCredit\", \"totalDebit\", \"type\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIGroupedDocument(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.date = d.date;\n" +
"        this.fec_pieceref = d.fec_pieceref;\n" +
"        this.id = d.id;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        this.journal = d.journal;\n" +
"        this.journal_id = d.journal_id;\n" +
"        this.label = d.label;\n" +
"        this.ledgerEventsCount = d.ledgerEventsCount;\n" +
"        this.readonly = d.readonly;\n" +
"        this.source = d.source;\n" +
"        if (\"taggingCount\" in d)\n" +
"            this.taggingCount = d.taggingCount;\n" +
"        this.totalCredit = d.totalCredit;\n" +
"        this.totalDebit = d.totalDebit;\n" +
"        this.type = d.type;\n" +
"    }\n" +
"}\n" +
"class Journal {\n" +
"    static Parse(d) {\n" +
"        return Journal.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$b = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$b(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$b(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$b(field, d);\n" +
"        }\n" +
"        checkString$a(d.code, field + \".code\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        const knownProperties = [\"code\", \"id\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Journal(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.code = d.code;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$b(field, value, multiple) {\n" +
"    return errorHelper$b(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$b(field, value, multiple) {\n" +
"    return errorHelper$b(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$b(field, value, multiple) {\n" +
"    return errorHelper$b(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$9(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$b(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$8(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$b(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$a(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$b(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$9(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$b(field, value, multiple);\n" +
"}\n" +
"function errorHelper$b(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$b));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$b;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$b));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$a = null;\n" +
"class APILedgerEvent {\n" +
"    static Parse(d) {\n" +
"        return APILedgerEvent.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$a(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$a(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$a(field, d);\n" +
"        }\n" +
"        checkString$9(d.amount, field + \".amount\");\n" +
"        checkString$9(d.balance, field + \".balance\");\n" +
"        checkBoolean$7(d.closed, field + \".closed\");\n" +
"        checkString$9(d.credit, field + \".credit\");\n" +
"        checkString$9(d.debit, field + \".debit\");\n" +
"        checkNumber$8(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.label, field + \".label\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$9(d.label, field + \".label\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.lettering, field + \".lettering\", \"null | Lettering\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.lettering = Lettering.Create(d.lettering, field + \".lettering\", \"null | Lettering\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.lettering_id, field + \".lettering_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$8(d.lettering_id, field + \".lettering_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$8(d.plan_item_id, field + \".plan_item_id\");\n" +
"        d.planItem = PlanItem$1.Create(d.planItem, field + \".planItem\");\n" +
"        checkBoolean$7(d.readonly, field + \".readonly\");\n" +
"        checkBoolean$7(d.readonlyAmounts, field + \".readonlyAmounts\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.reconciliation_id, field + \".reconciliation_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$8(d.reconciliation_id, field + \".reconciliation_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$9(d.source, field + \".source\");\n" +
"        const knownProperties = [\"amount\", \"balance\", \"closed\", \"credit\", \"debit\", \"id\", \"label\", \"lettering\", \"lettering_id\", \"plan_item_id\", \"planItem\", \"readonly\", \"readonlyAmounts\", \"reconciliation_id\", \"source\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APILedgerEvent(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.balance = d.balance;\n" +
"        this.closed = d.closed;\n" +
"        this.credit = d.credit;\n" +
"        this.debit = d.debit;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.lettering = d.lettering;\n" +
"        this.lettering_id = d.lettering_id;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.planItem = d.planItem;\n" +
"        this.readonly = d.readonly;\n" +
"        this.readonlyAmounts = d.readonlyAmounts;\n" +
"        this.reconciliation_id = d.reconciliation_id;\n" +
"        this.source = d.source;\n" +
"    }\n" +
"}\n" +
"class Lettering {\n" +
"    static Parse(d) {\n" +
"        return Lettering.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$a(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$a(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$a(field, d);\n" +
"        }\n" +
"        checkString$9(d.balance, field + \".balance\");\n" +
"        checkNumber$8(d.id, field + \".id\");\n" +
"        checkString$9(d.max_date, field + \".max_date\");\n" +
"        checkString$9(d.min_date, field + \".min_date\");\n" +
"        checkString$9(d.plan_item_number, field + \".plan_item_number\");\n" +
"        const knownProperties = [\"balance\", \"id\", \"max_date\", \"min_date\", \"plan_item_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Lettering(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.balance = d.balance;\n" +
"        this.id = d.id;\n" +
"        this.max_date = d.max_date;\n" +
"        this.min_date = d.min_date;\n" +
"        this.plan_item_number = d.plan_item_number;\n" +
"    }\n" +
"}\n" +
"let PlanItem$1 = class PlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$a(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$a(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$a(field, d);\n" +
"        }\n" +
"        checkString$9(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$7(d.enabled, field + \".enabled\");\n" +
"        checkNumber$8(d.id, field + \".id\");\n" +
"        checkString$9(d.label, field + \".label\");\n" +
"        checkString$9(d.number, field + \".number\");\n" +
"        checkString$9(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"country_alpha2\", \"enabled\", \"id\", \"label\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$a(field, value, multiple) {\n" +
"    return errorHelper$a(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$a(field, value, multiple) {\n" +
"    return errorHelper$a(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$a(field, value, multiple) {\n" +
"    return errorHelper$a(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$8(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$a(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$7(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$a(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$9(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$a(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$8(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$a(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function errorHelper$a(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$a));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$a;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$a));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"const logger = new Logger(\"Operation\");\n" +
"async function getLedgerEvents(id, maxAge) {\n" +
"    const data = await cachedRequest(\"operation:getLedgerEvents\", { id }, async ({ id }) => {\n" +
"        const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, \"GET\");\n" +
"        if (!response) {\n" +
"            logger.error(`Unable to load ledger events for ${id}`);\n" +
"            return [];\n" +
"        }\n" +
"        return await response.json();\n" +
"    }, maxAge);\n" +
"    return data.map((item) => APILedgerEvent.Create(item));\n" +
"}\n" +
"async function getGroupedDocuments(id, maxAge) {\n" +
"    if (!Number.isSafeInteger(id) || !id) {\n" +
"        logger.error(\"getGroupedDocuments: `id` MUST be an integer\", { id });\n" +
"        throw new Error(\"`id` MUST be an integer\");\n" +
"    }\n" +
"    const documents = await cachedRequest(\"operation:getGroupedDocuments\", { id }, fetchGroupedDocuments, maxAge);\n" +
"    documents.forEach((doc) => {\n" +
"        const ref = \"operation:getGroupedDocuments\";\n" +
"        const args = { id: doc.id };\n" +
"        updateAPICacheItem({ ref, args, value: documents });\n" +
"    });\n" +
"    return documents;\n" +
"}\n" +
"async function fetchGroupedDocuments({ id }) {\n" +
"    let page = 1;\n" +
"    const documents = [];\n" +
"    let response = await apiRequest(`accountants/operations/${id}/grouped_documents?per_page=20&page=${page}`, null, \"GET\");\n" +
"    if (!response) {\n" +
"        // probablement une facture supprimée\n" +
"        logger.error(`Unable to load grouped documents for ${id}`);\n" +
"        return [];\n" +
"    }\n" +
"    let list = [];\n" +
"    do {\n" +
"        const result = await response.json();\n" +
"        list = result.map((item) => APIGroupedDocument.Create(item));\n" +
"        documents.push(...list);\n" +
"        page++;\n" +
"        response = await apiRequest(`accountants/operations/${id}/grouped_documents?per_page=20&page=${page}`, null, \"GET\");\n" +
"    } while (response && list.length === 20);\n" +
"    return documents;\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$9 = null;\n" +
"class APIThirdparty {\n" +
"    static Parse(d) {\n" +
"        return APIThirdparty.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        if (\"customer\" in d) {\n" +
"            d.customer = Customer.Create(d.customer, field + \".customer\");\n" +
"        }\n" +
"        if (\"supplier\" in d) {\n" +
"            d.supplier = Supplier.Create(d.supplier, field + \".supplier\");\n" +
"        }\n" +
"        const knownProperties = [\"customer\", \"supplier\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIThirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"customer\" in d)\n" +
"            this.customer = d.customer;\n" +
"        if (\"supplier\" in d)\n" +
"            this.supplier = d.supplier;\n" +
"    }\n" +
"}\n" +
"class Customer {\n" +
"    static Parse(d) {\n" +
"        return Customer.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkString$8(d.address, field + \".address\");\n" +
"        checkString$8(d.address_additional_info, field + \".address_additional_info\");\n" +
"        checkNull$7(d.billing_bank, field + \".billing_bank\");\n" +
"        checkNull$7(d.billing_bic, field + \".billing_bic\");\n" +
"        checkNull$7(d.billing_footer_invoice, field + \".billing_footer_invoice\");\n" +
"        checkNull$7(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        checkNull$7(d.billing_iban, field + \".billing_iban\");\n" +
"        checkString$8(d.billing_language, field + \".billing_language\");\n" +
"        checkString$8(d.city, field + \".city\");\n" +
"        checkNumber$7(d.company_id, field + \".company_id\");\n" +
"        checkString$8(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkNull$7(d.current_mandate, field + \".current_mandate\");\n" +
"        checkString$8(d.customer_type, field + \".customer_type\");\n" +
"        checkString$8(d.delivery_address, field + \".delivery_address\");\n" +
"        checkString$8(d.delivery_address_additional_info, field + \".delivery_address_additional_info\");\n" +
"        checkString$8(d.delivery_city, field + \".delivery_city\");\n" +
"        checkString$8(d[\"delivery_country_alpha2\"], field + \".delivery_country_alpha2\");\n" +
"        checkString$8(d.delivery_postal_code, field + \".delivery_postal_code\");\n" +
"        checkBoolean$6(d.disable_pending_vat, field + \".disable_pending_vat\");\n" +
"        checkArray$6(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNever$2(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$8(d.first_name, field + \".first_name\");\n" +
"        checkBoolean$6(d.force_pending_vat, field + \".force_pending_vat\");\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkBoolean$6(d.invoices_auto_generated, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$6(d.invoices_auto_validated, field + \".invoices_auto_validated\");\n" +
"        checkString$8(d.last_name, field + \".last_name\");\n" +
"        checkString$8(d.name, field + \".name\");\n" +
"        checkString$8(d.notes, field + \".notes\");\n" +
"        checkNull$7(d.notes_comment, field + \".notes_comment\");\n" +
"        checkString$8(d.payment_conditions, field + \".payment_conditions\");\n" +
"        checkString$8(d.phone, field + \".phone\");\n" +
"        d.plan_item = PlanItem.Create(d.plan_item, field + \".plan_item\");\n" +
"        checkString$8(d.postal_code, field + \".postal_code\");\n" +
"        checkBoolean$6(d.received_a_mandate_request, field + \".received_a_mandate_request\");\n" +
"        checkString$8(d.recipient, field + \".recipient\");\n" +
"        checkString$8(d.reference, field + \".reference\");\n" +
"        checkString$8(d.reg_no, field + \".reg_no\");\n" +
"        checkArray$6(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$8(d.search_terms[i], field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$7(d.sepa_mandate, field + \".sepa_mandate\");\n" +
"        checkString$8(d.source_id, field + \".source_id\");\n" +
"        checkArray$6(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                checkNever$2(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$6(d.thirdparties_tags, field + \".thirdparties_tags\");\n" +
"        if (d.thirdparties_tags) {\n" +
"            for (let i = 0; i < d.thirdparties_tags.length; i++) {\n" +
"                checkNever$2(d.thirdparties_tags[i], field + \".thirdparties_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$6(d.thirdparty_contacts, field + \".thirdparty_contacts\");\n" +
"        if (d.thirdparty_contacts) {\n" +
"            for (let i = 0; i < d.thirdparty_contacts.length; i++) {\n" +
"                checkNever$2(d.thirdparty_contacts[i], field + \".thirdparty_contacts\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$6(d.thirdparty_invoice_line_rules, field + \".thirdparty_invoice_line_rules\");\n" +
"        if (d.thirdparty_invoice_line_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {\n" +
"                d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity.Create(d.thirdparty_invoice_line_rules[i], field + \".thirdparty_invoice_line_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$8(d.vat_number, field + \".vat_number\");\n" +
"        const knownProperties = [\"address\", \"address_additional_info\", \"billing_bank\", \"billing_bic\", \"billing_footer_invoice\", \"billing_footer_invoice_id\", \"billing_iban\", \"billing_language\", \"city\", \"company_id\", \"country_alpha2\", \"current_mandate\", \"customer_type\", \"delivery_address\", \"delivery_address_additional_info\", \"delivery_city\", \"delivery_country_alpha2\", \"delivery_postal_code\", \"disable_pending_vat\", \"emails\", \"first_name\", \"force_pending_vat\", \"id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"last_name\", \"name\", \"notes\", \"notes_comment\", \"payment_conditions\", \"phone\", \"plan_item\", \"postal_code\", \"received_a_mandate_request\", \"recipient\", \"reference\", \"reg_no\", \"search_terms\", \"sepa_mandate\", \"source_id\", \"tags\", \"thirdparties_tags\", \"thirdparty_contacts\", \"thirdparty_invoice_line_rules\", \"vat_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Customer(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.address = d.address;\n" +
"        this.address_additional_info = d.address_additional_info;\n" +
"        this.billing_bank = d.billing_bank;\n" +
"        this.billing_bic = d.billing_bic;\n" +
"        this.billing_footer_invoice = d.billing_footer_invoice;\n" +
"        this.billing_footer_invoice_id = d.billing_footer_invoice_id;\n" +
"        this.billing_iban = d.billing_iban;\n" +
"        this.billing_language = d.billing_language;\n" +
"        this.city = d.city;\n" +
"        this.company_id = d.company_id;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.current_mandate = d.current_mandate;\n" +
"        this.customer_type = d.customer_type;\n" +
"        this.delivery_address = d.delivery_address;\n" +
"        this.delivery_address_additional_info = d.delivery_address_additional_info;\n" +
"        this.delivery_city = d.delivery_city;\n" +
"        this[\"delivery_country_alpha2\"] = d[\"delivery_country_alpha2\"];\n" +
"        this.delivery_postal_code = d.delivery_postal_code;\n" +
"        this.disable_pending_vat = d.disable_pending_vat;\n" +
"        this.emails = d.emails;\n" +
"        this.first_name = d.first_name;\n" +
"        this.force_pending_vat = d.force_pending_vat;\n" +
"        this.id = d.id;\n" +
"        this.invoices_auto_generated = d.invoices_auto_generated;\n" +
"        this.invoices_auto_validated = d.invoices_auto_validated;\n" +
"        this.last_name = d.last_name;\n" +
"        this.name = d.name;\n" +
"        this.notes = d.notes;\n" +
"        this.notes_comment = d.notes_comment;\n" +
"        this.payment_conditions = d.payment_conditions;\n" +
"        this.phone = d.phone;\n" +
"        this.plan_item = d.plan_item;\n" +
"        this.postal_code = d.postal_code;\n" +
"        this.received_a_mandate_request = d.received_a_mandate_request;\n" +
"        this.recipient = d.recipient;\n" +
"        this.reference = d.reference;\n" +
"        this.reg_no = d.reg_no;\n" +
"        this.search_terms = d.search_terms;\n" +
"        this.sepa_mandate = d.sepa_mandate;\n" +
"        this.source_id = d.source_id;\n" +
"        this.tags = d.tags;\n" +
"        this.thirdparties_tags = d.thirdparties_tags;\n" +
"        this.thirdparty_contacts = d.thirdparty_contacts;\n" +
"        this.thirdparty_invoice_line_rules = d.thirdparty_invoice_line_rules;\n" +
"        this.vat_number = d.vat_number;\n" +
"    }\n" +
"}\n" +
"class PlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkString$8(d.number, field + \".number\");\n" +
"        const knownProperties = [\"id\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"}\n" +
"class ThirdpartyInvoiceLineRulesEntity {\n" +
"    static Parse(d) {\n" +
"        return ThirdpartyInvoiceLineRulesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        d.pnl_plan_item = PnlPlanItem$1.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkString$8(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"pnl_plan_item\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ThirdpartyInvoiceLineRulesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"let PnlPlanItem$1 = class PnlPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkBoolean$6(d.enabled, field + \".enabled\");\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkString$8(d.label, field + \".label\");\n" +
"        checkString$8(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"};\n" +
"class Supplier {\n" +
"    static Parse(d) {\n" +
"        return Supplier.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkString$8(d.activity_nomenclature, field + \".activity_nomenclature\");\n" +
"        checkString$8(d.address, field + \".address\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$7(d.admin_city_code, field + \".admin_city_code\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$8(d.admin_city_code, field + \".admin_city_code\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"auto_process_invoices\" in d) {\n" +
"            checkBoolean$6(d.auto_process_invoices, field + \".auto_process_invoices\");\n" +
"        }\n" +
"        checkString$8(d.city, field + \".city\");\n" +
"        checkNumber$7(d.company_id, field + \".company_id\");\n" +
"        checkString$8(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$6(d.disable_pending_vat, field + \".disable_pending_vat\");\n" +
"        checkArray$6(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNever$2(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$7(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$8(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$6(d.force_pending_vat, field + \".force_pending_vat\");\n" +
"        checkString$8(d.iban, field + \".iban\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$7(d.iban_last_update, field + \".iban_last_update\", \"null | IbanLastUpdate\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.iban_last_update = IbanLastUpdate.Create(d.iban_last_update, field + \".iban_last_update\", \"null | IbanLastUpdate\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"iban_proof\" in d) {\n" +
"            checkNull$7(d.iban_proof, field + \".iban_proof\");\n" +
"        }\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkBoolean$6(d.invoices_auto_generated, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$6(d.invoices_auto_validated, field + \".invoices_auto_validated\");\n" +
"        checkString$8(d.name, field + \".name\");\n" +
"        checkString$8(d.notes, field + \".notes\");\n" +
"        checkNull$7(d.notes_comment, field + \".notes_comment\");\n" +
"        d.plan_item = PlanItem1.Create(d.plan_item, field + \".plan_item\");\n" +
"        checkString$8(d.postal_code, field + \".postal_code\");\n" +
"        checkArray$6(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$8(d.search_terms[i], field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$7(d.supplier_due_date_delay, field + \".supplier_due_date_delay\");\n" +
"        checkString$8(d.supplier_due_date_rule, field + \".supplier_due_date_rule\");\n" +
"        checkNull$7(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        checkArray$6(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                d.tags[i] = TagsEntityOrTag.Create(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$6(d.thirdparties_tags, field + \".thirdparties_tags\");\n" +
"        if (d.thirdparties_tags) {\n" +
"            for (let i = 0; i < d.thirdparties_tags.length; i++) {\n" +
"                d.thirdparties_tags[i] = ThirdpartiesTagsEntity.Create(d.thirdparties_tags[i], field + \".thirdparties_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$6(d.thirdparty_invoice_line_rules, field + \".thirdparty_invoice_line_rules\");\n" +
"        if (d.thirdparty_invoice_line_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {\n" +
"                d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity1.Create(d.thirdparty_invoice_line_rules[i], field + \".thirdparty_invoice_line_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$6(d.thirdparty_visibility_rules, field + \".thirdparty_visibility_rules\");\n" +
"        if (d.thirdparty_visibility_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_visibility_rules.length; i++) {\n" +
"                d.thirdparty_visibility_rules[i] = ThirdpartyVisibilityRulesEntity.Create(d.thirdparty_visibility_rules[i], field + \".thirdparty_visibility_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        if (\"validation_status\" in d) {\n" +
"            checkString$8(d.validation_status, field + \".validation_status\");\n" +
"        }\n" +
"        checkString$8(d.vat_number, field + \".vat_number\");\n" +
"        const knownProperties = [\"activity_nomenclature\", \"address\", \"admin_city_code\", \"auto_process_invoices\", \"city\", \"company_id\", \"country_alpha2\", \"disable_pending_vat\", \"emails\", \"establishment_no\", \"force_pending_vat\", \"iban\", \"iban_last_update\", \"iban_proof\", \"id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"name\", \"notes\", \"notes_comment\", \"plan_item\", \"postal_code\", \"search_terms\", \"supplier_due_date_delay\", \"supplier_due_date_rule\", \"supplier_payment_method\", \"tags\", \"thirdparties_tags\", \"thirdparty_invoice_line_rules\", \"thirdparty_visibility_rules\", \"validation_status\", \"vat_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Supplier(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.activity_nomenclature = d.activity_nomenclature;\n" +
"        this.address = d.address;\n" +
"        this.admin_city_code = d.admin_city_code;\n" +
"        if (\"auto_process_invoices\" in d)\n" +
"            this.auto_process_invoices = d.auto_process_invoices;\n" +
"        this.city = d.city;\n" +
"        this.company_id = d.company_id;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.disable_pending_vat = d.disable_pending_vat;\n" +
"        this.emails = d.emails;\n" +
"        this.establishment_no = d.establishment_no;\n" +
"        this.force_pending_vat = d.force_pending_vat;\n" +
"        this.iban = d.iban;\n" +
"        this.iban_last_update = d.iban_last_update;\n" +
"        if (\"iban_proof\" in d)\n" +
"            this.iban_proof = d.iban_proof;\n" +
"        this.id = d.id;\n" +
"        this.invoices_auto_generated = d.invoices_auto_generated;\n" +
"        this.invoices_auto_validated = d.invoices_auto_validated;\n" +
"        this.name = d.name;\n" +
"        this.notes = d.notes;\n" +
"        this.notes_comment = d.notes_comment;\n" +
"        this.plan_item = d.plan_item;\n" +
"        this.postal_code = d.postal_code;\n" +
"        this.search_terms = d.search_terms;\n" +
"        this.supplier_due_date_delay = d.supplier_due_date_delay;\n" +
"        this.supplier_due_date_rule = d.supplier_due_date_rule;\n" +
"        this.supplier_payment_method = d.supplier_payment_method;\n" +
"        this.tags = d.tags;\n" +
"        this.thirdparties_tags = d.thirdparties_tags;\n" +
"        this.thirdparty_invoice_line_rules = d.thirdparty_invoice_line_rules;\n" +
"        this.thirdparty_visibility_rules = d.thirdparty_visibility_rules;\n" +
"        if (\"validation_status\" in d)\n" +
"            this.validation_status = d.validation_status;\n" +
"        this.vat_number = d.vat_number;\n" +
"    }\n" +
"}\n" +
"class IbanLastUpdate {\n" +
"    static Parse(d) {\n" +
"        return IbanLastUpdate.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkString$8(d.at, field + \".at\");\n" +
"        checkBoolean$6(d.from_pennylane, field + \".from_pennylane\");\n" +
"        checkString$8(d.name, field + \".name\");\n" +
"        const knownProperties = [\"at\", \"from_pennylane\", \"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new IbanLastUpdate(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.at = d.at;\n" +
"        this.from_pennylane = d.from_pennylane;\n" +
"        this.name = d.name;\n" +
"    }\n" +
"}\n" +
"class PlanItem1 {\n" +
"    static Parse(d) {\n" +
"        return PlanItem1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkString$8(d.number, field + \".number\");\n" +
"        const knownProperties = [\"id\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItem1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"}\n" +
"class TagsEntityOrTag {\n" +
"    static Parse(d) {\n" +
"        return TagsEntityOrTag.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        if (\"color\" in d) {\n" +
"            checkString$8(d.color, field + \".color\");\n" +
"        }\n" +
"        d.group = Group$1.Create(d.group, field + \".group\");\n" +
"        checkNumber$7(d.group_id, field + \".group_id\");\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkString$8(d.label, field + \".label\");\n" +
"        const knownProperties = [\"color\", \"group\", \"group_id\", \"id\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new TagsEntityOrTag(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"color\" in d)\n" +
"            this.color = d.color;\n" +
"        this.group = d.group;\n" +
"        this.group_id = d.group_id;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"    }\n" +
"}\n" +
"let Group$1 = class Group {\n" +
"    static Parse(d) {\n" +
"        return Group.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkString$8(d.label, field + \".label\");\n" +
"        checkBoolean$6(d.self_service_accounting, field + \".self_service_accounting\");\n" +
"        const knownProperties = [\"label\", \"self_service_accounting\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Group(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.label = d.label;\n" +
"        this.self_service_accounting = d.self_service_accounting;\n" +
"    }\n" +
"};\n" +
"class ThirdpartiesTagsEntity {\n" +
"    static Parse(d) {\n" +
"        return ThirdpartiesTagsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        d.tag = TagsEntityOrTag1.Create(d.tag, field + \".tag\");\n" +
"        checkString$8(d.weight, field + \".weight\");\n" +
"        const knownProperties = [\"id\", \"tag\", \"weight\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ThirdpartiesTagsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.tag = d.tag;\n" +
"        this.weight = d.weight;\n" +
"    }\n" +
"}\n" +
"class TagsEntityOrTag1 {\n" +
"    static Parse(d) {\n" +
"        return TagsEntityOrTag1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        if (\"color\" in d) {\n" +
"            checkString$8(d.color, field + \".color\");\n" +
"        }\n" +
"        d.group = Group$1.Create(d.group, field + \".group\");\n" +
"        checkNumber$7(d.group_id, field + \".group_id\");\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkString$8(d.label, field + \".label\");\n" +
"        const knownProperties = [\"color\", \"group\", \"group_id\", \"id\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new TagsEntityOrTag1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"color\" in d)\n" +
"            this.color = d.color;\n" +
"        this.group = d.group;\n" +
"        this.group_id = d.group_id;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"    }\n" +
"}\n" +
"class ThirdpartyInvoiceLineRulesEntity1 {\n" +
"    static Parse(d) {\n" +
"        return ThirdpartyInvoiceLineRulesEntity1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.pnl_plan_item = PnlPlanItem1.Create(d.pnl_plan_item, field + \".pnl_plan_item\", \"PnlPlanItem1 | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$7(d.pnl_plan_item, field + \".pnl_plan_item\", \"PnlPlanItem1 | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$8(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$7(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"pnl_plan_item\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ThirdpartyInvoiceLineRulesEntity1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"class PnlPlanItem1 {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItem1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkBoolean$6(d.enabled, field + \".enabled\");\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkString$8(d.label, field + \".label\");\n" +
"        checkString$8(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PnlPlanItem1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"}\n" +
"class ThirdpartyVisibilityRulesEntity {\n" +
"    static Parse(d) {\n" +
"        return ThirdpartyVisibilityRulesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$9(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d);\n" +
"        }\n" +
"        checkNumber$7(d.id, field + \".id\");\n" +
"        checkString$8(d.visible_on, field + \".visible_on\");\n" +
"        const knownProperties = [\"id\", \"visible_on\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ThirdpartyVisibilityRulesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.visible_on = d.visible_on;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$9(field, value, multiple) {\n" +
"    return errorHelper$9(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$9(field, value, multiple) {\n" +
"    return errorHelper$9(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$9(field, value, multiple) {\n" +
"    return errorHelper$9(field, value, \"object\");\n" +
"}\n" +
"function checkArray$6(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$9(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$7(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$9(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$6(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$9(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$8(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$9(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$7(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$9(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$2(value, field, multiple) {\n" +
"    return errorHelper$9(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$9(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$9));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$9;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$9));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * @param id The ID of the supplier or customer\n" +
" */\n" +
"async function getThirdparty(id) {\n" +
"    const response = await apiRequest(`thirdparties/${id}`, null, 'GET');\n" +
"    const json = await response?.json();\n" +
"    if (!json)\n" +
"        return json;\n" +
"    const data = APIThirdparty.Create(json);\n" +
"    const [direction, thirdparty] = Object.entries(data)[0];\n" +
"    return { direction, thirdparty };\n" +
"}\n" +
"\n" +
"class Cache extends Logger {\n" +
"    constructor(key, initialValue) {\n" +
"        super();\n" +
"        this.storageKey = key;\n" +
"        this.data = initialValue;\n" +
"        this.load();\n" +
"        this.debug('new Cache', this);\n" +
"        this.follow();\n" +
"    }\n" +
"    /**\n" +
"     * stringify data for storage\n" +
"     */\n" +
"    stringify(value) {\n" +
"        return JSON.stringify(value);\n" +
"    }\n" +
"    /**\n" +
"     * Load data from localStorage\n" +
"     */\n" +
"    load() {\n" +
"        try {\n" +
"            this.data = this.parse(localStorage.getItem(this.storageKey));\n" +
"            this.emit('loadend', this);\n" +
"        }\n" +
"        catch (_error) { /* Reject data and overrid it at next save() */ }\n" +
"    }\n" +
"    /**\n" +
"     * Save data to localStorage\n" +
"     */\n" +
"    save(data) {\n" +
"        if (data) {\n" +
"            this.parse(this.stringify(data)); // validate value: throws if invalid\n" +
"            this.data = data;\n" +
"        }\n" +
"        localStorage.setItem(this.storageKey, this.stringify(this.data));\n" +
"        this.emit('saved', this);\n" +
"    }\n" +
"    /**\n" +
"     * Follow storage change from other Browser pages\n" +
"     */\n" +
"    follow() {\n" +
"        window.addEventListener('storage', event => {\n" +
"            if (event.storageArea !== localStorage || event.key !== this.storageKey)\n" +
"                return;\n" +
"            try {\n" +
"                this.data = this.parse(event.newValue);\n" +
"                this.emit('change', this);\n" +
"            }\n" +
"            catch (error) {\n" +
"                this.log('storage event error', { error, value: event.newValue });\n" +
"                /* Reject data and overrid it at next save() */\n" +
"            }\n" +
"        });\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * CacheList is a cache that stores a list of data.\n" +
" * It extends Cache and provides a simple interface to filter and find.\n" +
" */\n" +
"class CacheList extends Cache {\n" +
"    static getInstance(storageKey) {\n" +
"        if (!this.instances[storageKey]) {\n" +
"            this.instances[storageKey] = new this(storageKey);\n" +
"        }\n" +
"        return this.instances[storageKey];\n" +
"    }\n" +
"    constructor(key, initialValue = []) {\n" +
"        super(key, initialValue);\n" +
"    }\n" +
"    parse(data) {\n" +
"        const value = JSON.parse(data);\n" +
"        if (!Array.isArray(value))\n" +
"            throw new Error(\"The given value does not parse as an Array.\");\n" +
"        return value;\n" +
"    }\n" +
"    filter(matchOrPredicate) {\n" +
"        this.load();\n" +
"        if (typeof matchOrPredicate === \"function\")\n" +
"            return this.data.filter(matchOrPredicate);\n" +
"        return this.data.filter((item) => Object.entries(matchOrPredicate).every(([key, value]) => item[key] === value));\n" +
"    }\n" +
"    find(match) {\n" +
"        this.load();\n" +
"        if (typeof match === \"function\")\n" +
"            return this.data.find(match);\n" +
"        return this.data.find((item) => Object.entries(match).every(([key, value]) => item[key] === value));\n" +
"    }\n" +
"    /**\n" +
"     * delete one item\n" +
"     *\n" +
"     * @return Deleted item if found\n" +
"     */\n" +
"    delete(match) {\n" +
"        this.load();\n" +
"        const found = this.find(match);\n" +
"        if (!found)\n" +
"            return null;\n" +
"        this.data.splice(this.data.indexOf(found), 1);\n" +
"        this.emit(\"delete\", { old: found });\n" +
"        this.save();\n" +
"        this.emit(\"change\", this);\n" +
"        return found;\n" +
"    }\n" +
"    /**\n" +
"     * clear all data\n" +
"     */\n" +
"    clear() {\n" +
"        this.data.length = 0;\n" +
"        this.emit(\"clear\", this);\n" +
"        this.save();\n" +
"        this.emit(\"change\", this);\n" +
"        return this;\n" +
"    }\n" +
"    updateItem(matchOrValue, valueOrCreate, create) {\n" +
"        let match;\n" +
"        let value;\n" +
"        if (typeof valueOrCreate === \"boolean\" ||\n" +
"            typeof valueOrCreate === \"undefined\") {\n" +
"            if (!(\"id\" in matchOrValue))\n" +
"                throw new Error(\"`matchOrValue` MUST have an `id` property\");\n" +
"            create = valueOrCreate ?? true;\n" +
"            value = matchOrValue;\n" +
"            match = { id: matchOrValue.id };\n" +
"        }\n" +
"        else {\n" +
"            value = valueOrCreate;\n" +
"            match = matchOrValue;\n" +
"        }\n" +
"        this.load();\n" +
"        const item = this.find(match);\n" +
"        if (item) {\n" +
"            this.data.splice(this.data.indexOf(item), 1, value);\n" +
"            this.emit(\"update\", { old: item, new: value });\n" +
"        }\n" +
"        else {\n" +
"            if (!create)\n" +
"                return;\n" +
"            this.data.push(value);\n" +
"            this.emit(\"add\", { new: value });\n" +
"        }\n" +
"        this.save();\n" +
"        this.emit(\"change\", this);\n" +
"        return item;\n" +
"    }\n" +
"    /**\n" +
"     * Calls the specified callback function for all the elements in an array.\n" +
"     * The return value of the callback function is the accumulated result,\n" +
"     * and is provided as an argument in the next call to the callback function.\n" +
"     */\n" +
"    reduce(cb, startingValue) {\n" +
"        this.load();\n" +
"        return this.data.reduce(cb, startingValue);\n" +
"    }\n" +
"}\n" +
"CacheList.instances = {};\n" +
"\n" +
"class Document extends Logger {\n" +
"    constructor({ id }) {\n" +
"        super();\n" +
"        if (!Number.isSafeInteger(id)) {\n" +
"            this.log(\"constructor\", { id, args: arguments });\n" +
"            throw new Error(\"`id` MUST be an integer\");\n" +
"        }\n" +
"        this.id = id;\n" +
"        Document.DocumentCache.set(id, this);\n" +
"    }\n" +
"    /**\n" +
"     * Get a document by id, all documents are cached for performance\n" +
"     */\n" +
"    static get(id) {\n" +
"        if (!Document.DocumentCache.has(id)) {\n" +
"            return new Document({ id });\n" +
"        }\n" +
"        return Document.DocumentCache.get(id);\n" +
"    }\n" +
"    /**\n" +
"     * Update a document from an APIGroupedDocument\n" +
"     */\n" +
"    static fromAPIGroupedDocument(apigdoc) {\n" +
"        const doc = Document.get(apigdoc.id);\n" +
"        doc.gDocument = apigdoc;\n" +
"        return doc;\n" +
"    }\n" +
"    async getDocument() {\n" +
"        if (!this.document) {\n" +
"            this.document = getDocument(this.id);\n" +
"            this.document = await this.document;\n" +
"        }\n" +
"        return await this.document;\n" +
"    }\n" +
"    async getGdoc() {\n" +
"        if (this.gDocument)\n" +
"            return this.gDocument;\n" +
"        return this.getDocument();\n" +
"    }\n" +
"    async getJournal() {\n" +
"        if (!this.journal) {\n" +
"            this.journal = this._loadJournal();\n" +
"        }\n" +
"        return await this.journal;\n" +
"    }\n" +
"    async _loadJournal() {\n" +
"        const gdoc = await this.getGdoc();\n" +
"        if (\"journal\" in gdoc)\n" +
"            return gdoc.journal;\n" +
"        return await getJournal(gdoc.journal_id);\n" +
"    }\n" +
"    async getLedgerEvents() {\n" +
"        if (!this.ledgerEvents) {\n" +
"            this.ledgerEvents = this._loadLedgerEvents();\n" +
"        }\n" +
"        return await this.ledgerEvents;\n" +
"    }\n" +
"    async _loadLedgerEvents() {\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const events = await Promise.all(groupedDocuments.map((doc) => getLedgerEvents(doc.id)));\n" +
"        this.ledgerEvents = [].concat(...events);\n" +
"        return this.ledgerEvents;\n" +
"    }\n" +
"    async reloadLedgerEvents() {\n" +
"        delete this.ledgerEvents;\n" +
"        this.document = reloadLedgerEvents(this.id);\n" +
"        this.document = await this.document;\n" +
"        return this.document;\n" +
"    }\n" +
"    async isClosed() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        return ledgerEvents.some((event) => event.closed);\n" +
"    }\n" +
"    async isReconciled() {\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        for (const doc of groupedDocuments) {\n" +
"            const gDocument = await doc.getDocument();\n" +
"            const meAsGdoc = gDocument.grouped_documents.find((d) => d.id === this.id);\n" +
"            if (meAsGdoc)\n" +
"                return meAsGdoc.reconciled;\n" +
"        }\n" +
"        const ledgerEvents = await getLedgerEvents(this.id);\n" +
"        return ledgerEvents.some((event) => event.reconciliation_id);\n" +
"    }\n" +
"    async archive(unarchive = false) {\n" +
"        return await archiveDocument(this.id, unarchive);\n" +
"    }\n" +
"    async unarchive() {\n" +
"        return await this.archive(true);\n" +
"    }\n" +
"    async getGroupedDocuments(maxAge) {\n" +
"        if (!this.groupedDocuments)\n" +
"            this.groupedDocuments = this._loadGroupedDocuments(maxAge);\n" +
"        return await this.groupedDocuments;\n" +
"    }\n" +
"    async _loadGroupedDocuments(maxAge) {\n" +
"        const mainDocument = await this.getDocument();\n" +
"        if (!mainDocument) {\n" +
"            this.error(`Document introuvable ${this.id}`);\n" +
"            return [];\n" +
"        }\n" +
"        const otherDocuments = (await getGroupedDocuments(this.id, maxAge)).map((doc) => Document.fromAPIGroupedDocument(doc));\n" +
"        this.groupedDocuments = [...otherDocuments, this];\n" +
"        return this.groupedDocuments;\n" +
"    }\n" +
"    async getThirdparty() {\n" +
"        if (!this.thirdparty)\n" +
"            this.thirdparty = this._getThirdparty();\n" +
"        return (await this.thirdparty)?.thirdparty;\n" +
"    }\n" +
"    async _getThirdparty() {\n" +
"        const doc = await this.getDocument();\n" +
"        return await getThirdparty(doc.thirdparty_id);\n" +
"    }\n" +
"    async getDMSLinks(recordType) {\n" +
"        return await getDMSLinks(this.id, recordType);\n" +
"    }\n" +
"    static async isClosed(id) {\n" +
"        const cached = this.closedCache.find({ id });\n" +
"        if (cached && new Date(cached.updatedAt) > new Date(Date.now() - WEEK_IN_MS))\n" +
"            return cached.closed;\n" +
"        const doc = new Document({ id });\n" +
"        const closed = await doc.isClosed();\n" +
"        this.closedCache.updateItem({\n" +
"            id,\n" +
"            closed,\n" +
"            updatedAt: new Date().toISOString(),\n" +
"        });\n" +
"        return closed;\n" +
"    }\n" +
"}\n" +
"Document.DocumentCache = new Map();\n" +
"Document.closedCache = new CacheList(\"closedDocumentsCache\", []);\n" +
"\n" +
"class ValidableDocument extends Document {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.valid = null;\n" +
"        this.validMessage = null;\n" +
"    }\n" +
"    async getValidMessage() {\n" +
"        if (this.validMessage === null)\n" +
"            await this.loadValidation();\n" +
"        return this.validMessage;\n" +
"    }\n" +
"    async loadValidation() {\n" +
"        if (this.validMessage === null)\n" +
"            this.validMessage = await this.loadValidMessage();\n" +
"        this.valid = this.validMessage === \"OK\";\n" +
"    }\n" +
"    async isValid() {\n" +
"        if (this.valid === null)\n" +
"            await this.loadValidation();\n" +
"        return this.valid;\n" +
"    }\n" +
"    /**\n" +
"     * Get validation status of the document.\n" +
"     * @returns The status of the document or null if the document is not found.\n" +
"     */\n" +
"    async getStatus() {\n" +
"        const id = this.id;\n" +
"        const valid = await this.isValid();\n" +
"        const message = await this.getValidMessage();\n" +
"        const doc = await this.getDocument();\n" +
"        if (!doc)\n" +
"            return null;\n" +
"        const createdAt = doc && new Date(doc.created_at).getTime();\n" +
"        const date = doc && new Date(doc.date).getTime();\n" +
"        return { id, valid, message, createdAt, date };\n" +
"    }\n" +
"    async reloadLedgerEvents() {\n" +
"        this.valid = null;\n" +
"        this.validMessage = null;\n" +
"        return super.reloadLedgerEvents();\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$8 = null;\n" +
"class APITransaction {\n" +
"    static Parse(d) {\n" +
"        return APITransaction.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$8 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$8(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$8(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$8(field, d);\n" +
"        }\n" +
"        checkNumber$6(d.account_id, field + \".account_id\");\n" +
"        d.account_synchronization = AccountSynchronization$1.Create(d.account_synchronization, field + \".account_synchronization\");\n" +
"        checkString$7(d.amount, field + \".amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$6(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$7(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$5(d.attachment_lost, field + \".attachment_lost\");\n" +
"        checkBoolean$5(d.attachment_required, field + \".attachment_required\");\n" +
"        checkNumber$6(d.company_id, field + \".company_id\");\n" +
"        checkString$7(d.currency, field + \".currency\");\n" +
"        checkString$7(d.currency_amount, field + \".currency_amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$7(d.currency_fee, field + \".currency_fee\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$6(d.currency_fee, field + \".currency_fee\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$7(d.date, field + \".date\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$6(d.dump, field + \".dump\", \"null | Dump\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.dump = Dump$1.Create(d.dump, field + \".dump\", \"null | Dump\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$6(d.dump_id, field + \".dump_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$6(d.dump_id, field + \".dump_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$7(d.fee, field + \".fee\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$6(d.fee, field + \".fee\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$6(d.files_count, field + \".files_count\");\n" +
"        checkString$7(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$7(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$6(d.id, field + \".id\");\n" +
"        checkBoolean$5(d.is_potential_duplicate, field + \".is_potential_duplicate\");\n" +
"        checkBoolean$5(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        checkString$7(d.label, field + \".label\");\n" +
"        checkBoolean$5(d.pending, field + \".pending\");\n" +
"        checkNull$6(d.reconciliation_id, field + \".reconciliation_id\");\n" +
"        checkString$7(d.source, field + \".source\");\n" +
"        checkString$7(d.source_logo, field + \".source_logo\");\n" +
"        checkString$7(d.status, field + \".status\");\n" +
"        checkString$7(d.type, field + \".type\");\n" +
"        checkString$7(d.updated_at, field + \".updated_at\");\n" +
"        checkBoolean$5(d.validation_needed, field + \".validation_needed\");\n" +
"        const knownProperties = [\"account_id\", \"account_synchronization\", \"amount\", \"archived_at\", \"attachment_lost\", \"attachment_required\", \"company_id\", \"currency\", \"currency_amount\", \"currency_fee\", \"date\", \"dump\", \"dump_id\", \"fee\", \"files_count\", \"gross_amount\", \"group_uuid\", \"id\", \"is_potential_duplicate\", \"is_waiting_details\", \"label\", \"pending\", \"reconciliation_id\", \"source\", \"source_logo\", \"status\", \"type\", \"updated_at\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$8(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APITransaction(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.account_id = d.account_id;\n" +
"        this.account_synchronization = d.account_synchronization;\n" +
"        this.amount = d.amount;\n" +
"        this.archived_at = d.archived_at;\n" +
"        this.attachment_lost = d.attachment_lost;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.company_id = d.company_id;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_fee = d.currency_fee;\n" +
"        this.date = d.date;\n" +
"        this.dump = d.dump;\n" +
"        this.dump_id = d.dump_id;\n" +
"        this.fee = d.fee;\n" +
"        this.files_count = d.files_count;\n" +
"        this.gross_amount = d.gross_amount;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.id = d.id;\n" +
"        this.is_potential_duplicate = d.is_potential_duplicate;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        this.label = d.label;\n" +
"        this.pending = d.pending;\n" +
"        this.reconciliation_id = d.reconciliation_id;\n" +
"        this.source = d.source;\n" +
"        this.source_logo = d.source_logo;\n" +
"        this.status = d.status;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.validation_needed = d.validation_needed;\n" +
"    }\n" +
"}\n" +
"let AccountSynchronization$1 = class AccountSynchronization {\n" +
"    static Parse(d) {\n" +
"        return AccountSynchronization.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$8 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$8(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$8(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$8(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$7(d.created_at, field + \".created_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$6(d.created_at, field + \".created_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$6(d.error_message, field + \".error_message\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkBoolean$5(d.triggered_manually, field + \".triggered_manually\", \"boolean | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$6(d.triggered_manually, field + \".triggered_manually\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"created_at\", \"error_message\", \"triggered_manually\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$8(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new AccountSynchronization(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.error_message = d.error_message;\n" +
"        this.triggered_manually = d.triggered_manually;\n" +
"    }\n" +
"};\n" +
"let Dump$1 = class Dump {\n" +
"    static Parse(d) {\n" +
"        return Dump.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$8 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$8(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$8(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$8(field, d);\n" +
"        }\n" +
"        checkString$7(d.created_at, field + \".created_at\");\n" +
"        checkString$7(d.creator, field + \".creator\");\n" +
"        checkString$7(d.type, field + \".type\");\n" +
"        const knownProperties = [\"created_at\", \"creator\", \"type\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$8(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Dump(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.creator = d.creator;\n" +
"        this.type = d.type;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$8(field, value, multiple) {\n" +
"    return errorHelper$8(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$8(field, value, multiple) {\n" +
"    return errorHelper$8(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$8(field, value, multiple) {\n" +
"    return errorHelper$8(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$6(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$8(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$5(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$8(field, value, multiple ?? \"boolean\");\n" +
"}\n" +
"function checkString$7(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$8(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$6(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$8(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function errorHelper$8(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$8));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$8;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$8));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$7 = null;\n" +
"class APITransactionList {\n" +
"    static Parse(d) {\n" +
"        return APITransactionList.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$7(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$7(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$7(field, d);\n" +
"        }\n" +
"        d.pagination = Pagination$1.Create(d.pagination, field + \".pagination\");\n" +
"        checkArray$5(d.transactions, field + \".transactions\");\n" +
"        if (d.transactions) {\n" +
"            for (let i = 0; i < d.transactions.length; i++) {\n" +
"                d.transactions[i] = TransactionsEntity.Create(d.transactions[i], field + \".transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"pagination\", \"transactions\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APITransactionList(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.pagination = d.pagination;\n" +
"        this.transactions = d.transactions;\n" +
"    }\n" +
"}\n" +
"let Pagination$1 = class Pagination {\n" +
"    static Parse(d) {\n" +
"        return Pagination.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$7(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$7(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$7(field, d);\n" +
"        }\n" +
"        checkBoolean$4(d.hasNextPage, field + \".hasNextPage\");\n" +
"        checkNumber$5(d.page, field + \".page\");\n" +
"        checkNumber$5(d.pages, field + \".pages\");\n" +
"        checkNumber$5(d.pageSize, field + \".pageSize\");\n" +
"        checkNumber$5(d.totalEntries, field + \".totalEntries\");\n" +
"        checkString$6(d.totalEntriesPrecision, field + \".totalEntriesPrecision\");\n" +
"        checkString$6(d.totalEntriesStr, field + \".totalEntriesStr\");\n" +
"        const knownProperties = [\"hasNextPage\", \"page\", \"pages\", \"pageSize\", \"totalEntries\", \"totalEntriesPrecision\", \"totalEntriesStr\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Pagination(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.hasNextPage = d.hasNextPage;\n" +
"        this.page = d.page;\n" +
"        this.pages = d.pages;\n" +
"        this.pageSize = d.pageSize;\n" +
"        this.totalEntries = d.totalEntries;\n" +
"        this.totalEntriesPrecision = d.totalEntriesPrecision;\n" +
"        this.totalEntriesStr = d.totalEntriesStr;\n" +
"    }\n" +
"};\n" +
"class TransactionsEntity {\n" +
"    static Parse(d) {\n" +
"        return TransactionsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$7(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$7(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$7(field, d);\n" +
"        }\n" +
"        checkNumber$5(d.account_id, field + \".account_id\");\n" +
"        d.account_synchronization = AccountSynchronization.Create(d.account_synchronization, field + \".account_synchronization\");\n" +
"        checkString$6(d.amount, field + \".amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$5(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$6(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$4(d.attachment_lost, field + \".attachment_lost\");\n" +
"        checkBoolean$4(d.attachment_required, field + \".attachment_required\");\n" +
"        checkNumber$5(d.company_id, field + \".company_id\");\n" +
"        checkString$6(d.currency, field + \".currency\");\n" +
"        checkString$6(d.currency_amount, field + \".currency_amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$6(d.currency_fee, field + \".currency_fee\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$5(d.currency_fee, field + \".currency_fee\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$6(d.date, field + \".date\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$5(d.dump, field + \".dump\", \"null | Dump\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.dump = Dump.Create(d.dump, field + \".dump\", \"null | Dump\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$5(d.dump_id, field + \".dump_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$5(d.dump_id, field + \".dump_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$6(d.fee, field + \".fee\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$5(d.fee, field + \".fee\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$5(d.files_count, field + \".files_count\");\n" +
"        checkString$6(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$6(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$5(d.id, field + \".id\");\n" +
"        checkBoolean$4(d.is_potential_duplicate, field + \".is_potential_duplicate\");\n" +
"        checkBoolean$4(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        checkString$6(d.label, field + \".label\");\n" +
"        checkBoolean$4(d.pending, field + \".pending\");\n" +
"        checkNull$5(d.reconciliation_id, field + \".reconciliation_id\");\n" +
"        checkString$6(d.source, field + \".source\");\n" +
"        checkString$6(d.source_logo, field + \".source_logo\");\n" +
"        checkString$6(d.status, field + \".status\");\n" +
"        checkString$6(d.type, field + \".type\");\n" +
"        checkString$6(d.updated_at, field + \".updated_at\");\n" +
"        checkBoolean$4(d.validation_needed, field + \".validation_needed\");\n" +
"        const knownProperties = [\"account_id\", \"account_synchronization\", \"amount\", \"archived_at\", \"attachment_lost\", \"attachment_required\", \"company_id\", \"currency\", \"currency_amount\", \"currency_fee\", \"date\", \"dump\", \"dump_id\", \"fee\", \"files_count\", \"gross_amount\", \"group_uuid\", \"id\", \"is_potential_duplicate\", \"is_waiting_details\", \"label\", \"pending\", \"reconciliation_id\", \"source\", \"source_logo\", \"status\", \"type\", \"updated_at\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new TransactionsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.account_id = d.account_id;\n" +
"        this.account_synchronization = d.account_synchronization;\n" +
"        this.amount = d.amount;\n" +
"        this.archived_at = d.archived_at;\n" +
"        this.attachment_lost = d.attachment_lost;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.company_id = d.company_id;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_fee = d.currency_fee;\n" +
"        this.date = d.date;\n" +
"        this.dump = d.dump;\n" +
"        this.dump_id = d.dump_id;\n" +
"        this.fee = d.fee;\n" +
"        this.files_count = d.files_count;\n" +
"        this.gross_amount = d.gross_amount;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.id = d.id;\n" +
"        this.is_potential_duplicate = d.is_potential_duplicate;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        this.label = d.label;\n" +
"        this.pending = d.pending;\n" +
"        this.reconciliation_id = d.reconciliation_id;\n" +
"        this.source = d.source;\n" +
"        this.source_logo = d.source_logo;\n" +
"        this.status = d.status;\n" +
"        this.type = d.type;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.validation_needed = d.validation_needed;\n" +
"    }\n" +
"}\n" +
"class AccountSynchronization {\n" +
"    static Parse(d) {\n" +
"        return AccountSynchronization.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$7(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$7(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$7(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$6(d.created_at, field + \".created_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$5(d.created_at, field + \".created_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$5(d.error_message, field + \".error_message\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkBoolean$4(d.triggered_manually, field + \".triggered_manually\", \"boolean | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$5(d.triggered_manually, field + \".triggered_manually\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"created_at\", \"error_message\", \"triggered_manually\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new AccountSynchronization(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.error_message = d.error_message;\n" +
"        this.triggered_manually = d.triggered_manually;\n" +
"    }\n" +
"}\n" +
"class Dump {\n" +
"    static Parse(d) {\n" +
"        return Dump.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$7(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$7(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$7(field, d);\n" +
"        }\n" +
"        checkString$6(d.created_at, field + \".created_at\");\n" +
"        checkString$6(d.creator, field + \".creator\");\n" +
"        checkString$6(d.type, field + \".type\");\n" +
"        const knownProperties = [\"created_at\", \"creator\", \"type\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Dump(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.creator = d.creator;\n" +
"        this.type = d.type;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$7(field, value, multiple) {\n" +
"    return errorHelper$7(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$7(field, value, multiple) {\n" +
"    return errorHelper$7(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$7(field, value, multiple) {\n" +
"    return errorHelper$7(field, value, \"object\");\n" +
"}\n" +
"function checkArray$5(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$7(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$5(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$7(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$4(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$7(field, value, multiple ?? \"boolean\");\n" +
"}\n" +
"function checkString$6(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$7(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$5(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$7(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function errorHelper$7(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$7));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$7;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$7));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$6 = null;\n" +
"class APITransactionListParams {\n" +
"    static Parse(d) {\n" +
"        return APITransactionListParams.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$6 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$6(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$6(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$6(field, d);\n" +
"        }\n" +
"        if (\"filter\" in d) {\n" +
"            checkString$5(d.filter, field + \".filter\");\n" +
"        }\n" +
"        if (\"page\" in d) {\n" +
"            checkNumber$4(d.page, field + \".page\");\n" +
"        }\n" +
"        if (\"sort\" in d) {\n" +
"            checkString$5(d.sort, field + \".sort\");\n" +
"        }\n" +
"        const knownProperties = [\"filter\", \"page\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APITransactionListParams(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"filter\" in d)\n" +
"            this.filter = d.filter;\n" +
"        if (\"page\" in d)\n" +
"            this.page = d.page;\n" +
"        if (\"sort\" in d)\n" +
"            this.sort = d.sort;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$6(field, value, multiple) {\n" +
"    return errorHelper$6(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$6(field, value, multiple) {\n" +
"    return errorHelper$6(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$6(field, value, multiple) {\n" +
"    return errorHelper$6(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$4(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$6(field, value, \"number\");\n" +
"}\n" +
"function checkString$5(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$6(field, value, \"string\");\n" +
"}\n" +
"function errorHelper$6(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$6));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$6;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$6));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$5 = null;\n" +
"class APITransactionLite {\n" +
"    static Parse(d) {\n" +
"        return APITransactionLite.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$5(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$5(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$5(field, d);\n" +
"        }\n" +
"        d.account = Account.Create(d.account, field + \".account\");\n" +
"        checkBoolean$3(d.automatically_processed, field + \".automatically_processed\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.automation_rule_plan_item = AutomationRulePlanItem.Create(d.automation_rule_plan_item, field + \".automation_rule_plan_item\", \"AutomationRulePlanItem | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$4(d.automation_rule_plan_item, field + \".automation_rule_plan_item\", \"AutomationRulePlanItem | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$3(d.comments_count, field + \".comments_count\");\n" +
"        checkString$4(d.fee, field + \".fee\");\n" +
"        checkArray$4(d.grouped_documents, field + \".grouped_documents\");\n" +
"        if (d.grouped_documents) {\n" +
"            for (let i = 0; i < d.grouped_documents.length; i++) {\n" +
"                d.grouped_documents[i] = GroupedDocumentsEntity.Create(d.grouped_documents[i], field + \".grouped_documents\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$3(d.id, field + \".id\");\n" +
"        checkBoolean$3(d.internal_transfer, field + \".internal_transfer\");\n" +
"        checkArray$4(d.ledger_events, field + \".ledger_events\");\n" +
"        if (d.ledger_events) {\n" +
"            for (let i = 0; i < d.ledger_events.length; i++) {\n" +
"                checkNever$1(d.ledger_events[i], field + \".ledger_events\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$4(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        checkString$4(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkString$4(d.source, field + \".source\");\n" +
"        checkString$4(d.source_logo, field + \".source_logo\");\n" +
"        const knownProperties = [\"account\", \"automatically_processed\", \"automation_rule_plan_item\", \"comments_count\", \"fee\", \"grouped_documents\", \"id\", \"internal_transfer\", \"ledger_events\", \"outstanding_balance\", \"pusher_channel\", \"source\", \"source_logo\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APITransactionLite(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.account = d.account;\n" +
"        this.automatically_processed = d.automatically_processed;\n" +
"        this.automation_rule_plan_item = d.automation_rule_plan_item;\n" +
"        this.comments_count = d.comments_count;\n" +
"        this.fee = d.fee;\n" +
"        this.grouped_documents = d.grouped_documents;\n" +
"        this.id = d.id;\n" +
"        this.internal_transfer = d.internal_transfer;\n" +
"        this.ledger_events = d.ledger_events;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.source = d.source;\n" +
"        this.source_logo = d.source_logo;\n" +
"    }\n" +
"}\n" +
"class Account {\n" +
"    static Parse(d) {\n" +
"        return Account.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$5(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$5(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$5(field, d);\n" +
"        }\n" +
"        checkString$4(d.logo_url, field + \".logo_url\");\n" +
"        checkString$4(d.name, field + \".name\");\n" +
"        const knownProperties = [\"logo_url\", \"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Account(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.logo_url = d.logo_url;\n" +
"        this.name = d.name;\n" +
"    }\n" +
"}\n" +
"class AutomationRulePlanItem {\n" +
"    static Parse(d) {\n" +
"        return AutomationRulePlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$5(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$5(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$5(field, d);\n" +
"        }\n" +
"        checkNumber$3(d.id, field + \".id\");\n" +
"        checkString$4(d.label, field + \".label\");\n" +
"        checkString$4(d.number, field + \".number\");\n" +
"        checkString$4(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"id\", \"label\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new AutomationRulePlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"class GroupedDocumentsEntity {\n" +
"    static Parse(d) {\n" +
"        return GroupedDocumentsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$5(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$5(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$5(field, d);\n" +
"        }\n" +
"        checkString$4(d.amount, field + \".amount\");\n" +
"        checkString$4(d.currency, field + \".currency\");\n" +
"        checkString$4(d.currency_amount, field + \".currency_amount\");\n" +
"        checkNumber$3(d.id, field + \".id\");\n" +
"        checkString$4(d.type, field + \".type\");\n" +
"        const knownProperties = [\"amount\", \"currency\", \"currency_amount\", \"id\", \"type\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new GroupedDocumentsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.id = d.id;\n" +
"        this.type = d.type;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$5(field, value, multiple) {\n" +
"    return errorHelper$5(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$5(field, value, multiple) {\n" +
"    return errorHelper$5(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$5(field, value, multiple) {\n" +
"    return errorHelper$5(field, value, \"object\");\n" +
"}\n" +
"function checkArray$4(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$5(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$3(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$5(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$3(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$5(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$4(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$5(field, value, \"string\");\n" +
"}\n" +
"function checkNull$4(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$5(field, value, multiple);\n" +
"}\n" +
"function checkNever$1(value, field, multiple) {\n" +
"    return errorHelper$5(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$5(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$5));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$5;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$5));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * @return {Promise<RawTransactionMin>}    Type vérifié\n" +
" */\n" +
"async function getTransaction(id) {\n" +
"    const response = await apiRequest(`accountants/wip/transactions/${id}`, null, 'GET');\n" +
"    const data = await response?.json();\n" +
"    return APITransactionLite.Create(data);\n" +
"}\n" +
"/**\n" +
" * Load list of transactions from API. paginated.\n" +
" */\n" +
"async function getTransactionsList(params = {}) {\n" +
"    const searchParams = new URLSearchParams(APITransactionListParams.Create(params));\n" +
"    const url = `accountants/wip/transactions?${searchParams.toString()}`;\n" +
"    const response = await apiRequest(url, null, 'GET');\n" +
"    return APITransactionList.Create(await response.json());\n" +
"}\n" +
"/**\n" +
" * Load list of transaction one to one as generator\n" +
" */\n" +
"async function* getTransactionGenerator(params = {}) {\n" +
"    let page = Number(params.page ?? 1);\n" +
"    do {\n" +
"        const data = await getTransactionsList(Object.assign({}, params, { page }));\n" +
"        const transactions = data.transactions.map(item => APITransaction.Create(item));\n" +
"        if (!transactions?.length)\n" +
"            return;\n" +
"        for (const transaction of transactions)\n" +
"            yield transaction;\n" +
"        ++page;\n" +
"    } while (true);\n" +
"}\n" +
"\n" +
"/**\n" +
" * Take a string and a RegExp, search for partial match and return\n" +
" * the start and stop indexes of the unmatch portion.\n" +
" *\n" +
" * @param str The string to search in\n" +
" * @param regex The RegExp to search for\n" +
" * @returns The start and stop indexes of the unmatch portion\n" +
" */\n" +
"function regexPartialMatch(str, regex) {\n" +
"    if (regex.test(str))\n" +
"        return [str.length, str.length];\n" +
"    const source = regex.source;\n" +
"    let partialRegex = regex;\n" +
"    for (let i = 1; i < source.length; ++i) {\n" +
"        try {\n" +
"            partialRegex = new RegExp(source.slice(0, -i));\n" +
"            if (partialRegex.test(str))\n" +
"                break;\n" +
"        }\n" +
"        catch (_error) { /* do nothing */ }\n" +
"    }\n" +
"    const start = partialRegex.test(str) ? str.match(partialRegex)[0].length : 0;\n" +
"    partialRegex = regex;\n" +
"    for (let i = 0; i < source.length; ++i) {\n" +
"        try {\n" +
"            partialRegex = new RegExp(source.slice(i));\n" +
"            if (partialRegex.test(str))\n" +
"                break;\n" +
"        }\n" +
"        catch (_error) { /* do nothing */ }\n" +
"    }\n" +
"    if (!partialRegex.test(str))\n" +
"        return [start, str.length];\n" +
"    const stop = str.length - str.match(partialRegex)[0].length;\n" +
"    return [start, stop];\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$4 = null;\n" +
"class APIInvoice {\n" +
"    static Parse(d) {\n" +
"        return APIInvoice.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkString$3(d.amount, field + \".amount\");\n" +
"        checkNull$3(d.approval_status, field + \".approval_status\");\n" +
"        checkBoolean$2(d.archived, field + \".archived\");\n" +
"        checkBoolean$2(d.attachment_required, field + \".attachment_required\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$2(d.blob_id, field + \".blob_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.blob_id, field + \".blob_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$3(d.checksum, field + \".checksum\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.checksum, field + \".checksum\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$2(d.client_comments_count, field + \".client_comments_count\");\n" +
"        checkNumber$2(d.company_id, field + \".company_id\");\n" +
"        checkString$3(d.created_at, field + \".created_at\");\n" +
"        checkString$3(d.currency, field + \".currency\");\n" +
"        checkString$3(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$3(d.currency_price_before_tax, field + \".currency_price_before_tax\");\n" +
"        checkString$3(d.currency_tax, field + \".currency_tax\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.current_account_plan_item, field + \".current_account_plan_item\", \"null | PnlPlanItemOrCurrentAccountPlanItem\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.current_account_plan_item = PnlPlanItemOrCurrentAccountPlanItem.Create(d.current_account_plan_item, field + \".current_account_plan_item\", \"null | PnlPlanItemOrCurrentAccountPlanItem\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.current_account_plan_item_id, field + \".current_account_plan_item_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$2(d.current_account_plan_item_id, field + \".current_account_plan_item_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.date, field + \".date\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$3(d.date, field + \".date\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.deadline, field + \".deadline\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$3(d.deadline, field + \".deadline\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.direction, field + \".direction\");\n" +
"        checkArray$3(d.document_tags, field + \".document_tags\");\n" +
"        if (d.document_tags) {\n" +
"            for (let i = 0; i < d.document_tags.length; i++) {\n" +
"                d.document_tags[i] = DocumentTagsEntity.Create(d.document_tags[i], field + \".document_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$2(d.duplicates_count, field + \".duplicates_count\");\n" +
"        checkNull$3(d.email_from, field + \".email_from\");\n" +
"        checkBoolean$2(d.embeddable_in_browser, field + \".embeddable_in_browser\");\n" +
"        checkString$3(d.file_signed_id, field + \".file_signed_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$3(d.filename, field + \".filename\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.filename, field + \".filename\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$3(d.gdrive_path, field + \".gdrive_path\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.gdrive_path, field + \".gdrive_path\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.group_uuid, field + \".group_uuid\");\n" +
"        checkBoolean$2(d.has_closed_ledger_events, field + \".has_closed_ledger_events\");\n" +
"        checkBoolean$2(d.has_duplicates, field + \".has_duplicates\");\n" +
"        checkBoolean$2(d.has_file, field + \".has_file\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        checkBoolean$2(d.incomplete, field + \".incomplete\");\n" +
"        checkArray$3(d.invoice_lines, field + \".invoice_lines\");\n" +
"        if (d.invoice_lines) {\n" +
"            for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                d.invoice_lines[i] = InvoiceLinesEntity$1.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$2(d.invoice_lines_count, field + \".invoice_lines_count\");\n" +
"        checkString$3(d.invoice_number, field + \".invoice_number\");\n" +
"        checkBoolean$2(d.is_employee_expense, field + \".is_employee_expense\");\n" +
"        checkBoolean$2(d.is_estimate, field + \".is_estimate\");\n" +
"        checkBoolean$2(d.is_factur_x, field + \".is_factur_x\");\n" +
"        checkBoolean$2(d.is_waiting_for_ocr, field + \".is_waiting_for_ocr\");\n" +
"        checkNumber$2(d.journal_id, field + \".journal_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$3(d.label, field + \".label\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.label, field + \".label\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.method, field + \".method\");\n" +
"        checkNull$3(d.mileage_allowance, field + \".mileage_allowance\");\n" +
"        checkString$3(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$2(d.pages_count, field + \".pages_count\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.pages_count, field + \".pages_count\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$2(d.paid, field + \".paid\");\n" +
"        checkString$3(d.payment_status, field + \".payment_status\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$3(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$3(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString$3(d.preview_urls[i], field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkString$3(d.source, field + \".source\");\n" +
"        checkString$3(d.status, field + \".status\");\n" +
"        checkBoolean$2(d.subcomplete, field + \".subcomplete\");\n" +
"        checkBoolean$2(d.tagged_at_ledger_events_level, field + \".tagged_at_ledger_events_level\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.thirdparty = Thirdparty$1.Create(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$2(d.thirdparty_id, field + \".thirdparty_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.thirdparty_id, field + \".thirdparty_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.type, field + \".type\");\n" +
"        checkString$3(d.url, field + \".url\");\n" +
"        checkBoolean$2(d.validation_needed, field + \".validation_needed\");\n" +
"        const knownProperties = [\"amount\", \"approval_status\", \"archived\", \"attachment_required\", \"blob_id\", \"checksum\", \"client_comments_count\", \"company_id\", \"created_at\", \"currency\", \"currency_amount\", \"currency_price_before_tax\", \"currency_tax\", \"current_account_plan_item\", \"current_account_plan_item_id\", \"date\", \"deadline\", \"direction\", \"document_tags\", \"duplicates_count\", \"email_from\", \"embeddable_in_browser\", \"file_signed_id\", \"filename\", \"gdrive_path\", \"group_uuid\", \"has_closed_ledger_events\", \"has_duplicates\", \"has_file\", \"id\", \"incomplete\", \"invoice_lines\", \"invoice_lines_count\", \"invoice_number\", \"is_employee_expense\", \"is_estimate\", \"is_factur_x\", \"is_waiting_for_ocr\", \"journal_id\", \"label\", \"method\", \"mileage_allowance\", \"outstanding_balance\", \"pages_count\", \"paid\", \"payment_status\", \"preview_status\", \"preview_urls\", \"pusher_channel\", \"source\", \"status\", \"subcomplete\", \"tagged_at_ledger_events_level\", \"thirdparty\", \"thirdparty_id\", \"type\", \"url\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIInvoice(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.approval_status = d.approval_status;\n" +
"        this.archived = d.archived;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.blob_id = d.blob_id;\n" +
"        this.checksum = d.checksum;\n" +
"        this.client_comments_count = d.client_comments_count;\n" +
"        this.company_id = d.company_id;\n" +
"        this.created_at = d.created_at;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.current_account_plan_item = d.current_account_plan_item;\n" +
"        this.current_account_plan_item_id = d.current_account_plan_item_id;\n" +
"        this.date = d.date;\n" +
"        this.deadline = d.deadline;\n" +
"        this.direction = d.direction;\n" +
"        this.document_tags = d.document_tags;\n" +
"        this.duplicates_count = d.duplicates_count;\n" +
"        this.email_from = d.email_from;\n" +
"        this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        this.file_signed_id = d.file_signed_id;\n" +
"        this.filename = d.filename;\n" +
"        this.gdrive_path = d.gdrive_path;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.has_closed_ledger_events = d.has_closed_ledger_events;\n" +
"        this.has_duplicates = d.has_duplicates;\n" +
"        this.has_file = d.has_file;\n" +
"        this.id = d.id;\n" +
"        this.incomplete = d.incomplete;\n" +
"        this.invoice_lines = d.invoice_lines;\n" +
"        this.invoice_lines_count = d.invoice_lines_count;\n" +
"        this.invoice_number = d.invoice_number;\n" +
"        this.is_employee_expense = d.is_employee_expense;\n" +
"        this.is_estimate = d.is_estimate;\n" +
"        this.is_factur_x = d.is_factur_x;\n" +
"        this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        this.journal_id = d.journal_id;\n" +
"        this.label = d.label;\n" +
"        this.method = d.method;\n" +
"        this.mileage_allowance = d.mileage_allowance;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.pages_count = d.pages_count;\n" +
"        this.paid = d.paid;\n" +
"        this.payment_status = d.payment_status;\n" +
"        this.preview_status = d.preview_status;\n" +
"        this.preview_urls = d.preview_urls;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.source = d.source;\n" +
"        this.status = d.status;\n" +
"        this.subcomplete = d.subcomplete;\n" +
"        this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;\n" +
"        this.thirdparty = d.thirdparty;\n" +
"        this.thirdparty_id = d.thirdparty_id;\n" +
"        this.type = d.type;\n" +
"        this.url = d.url;\n" +
"        this.validation_needed = d.validation_needed;\n" +
"    }\n" +
"}\n" +
"class PnlPlanItemOrCurrentAccountPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItemOrCurrentAccountPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkBoolean$2(d.enabled, field + \".enabled\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        checkString$3(d.label, field + \".label\");\n" +
"        checkString$3(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PnlPlanItemOrCurrentAccountPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"}\n" +
"class DocumentTagsEntity {\n" +
"    static Parse(d) {\n" +
"        return DocumentTagsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkNumber$2(d.document_id, field + \".document_id\");\n" +
"        checkNumber$2(d.group_id, field + \".group_id\");\n" +
"        if (\"id\" in d) {\n" +
"            checkNumber$2(d.id, field + \".id\");\n" +
"        }\n" +
"        d.tag = Tag.Create(d.tag, field + \".tag\");\n" +
"        checkNumber$2(d.tag_id, field + \".tag_id\");\n" +
"        if (\"weight\" in d) {\n" +
"            checkString$3(d.weight, field + \".weight\");\n" +
"        }\n" +
"        const knownProperties = [\"document_id\", \"group_id\", \"id\", \"tag\", \"tag_id\", \"weight\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new DocumentTagsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.document_id = d.document_id;\n" +
"        this.group_id = d.group_id;\n" +
"        if (\"id\" in d)\n" +
"            this.id = d.id;\n" +
"        this.tag = d.tag;\n" +
"        this.tag_id = d.tag_id;\n" +
"        if (\"weight\" in d)\n" +
"            this.weight = d.weight;\n" +
"    }\n" +
"}\n" +
"class Tag {\n" +
"    static Parse(d) {\n" +
"        return Tag.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkNull$3(d.analytical_code, field + \".analytical_code\");\n" +
"        if (\"color\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$3(d.color, field + \".color\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$3(d.color, field + \".color\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        d.group = Group.Create(d.group, field + \".group\");\n" +
"        checkNumber$2(d.group_id, field + \".group_id\");\n" +
"        checkNull$3(d.icon, field + \".icon\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        checkString$3(d.label, field + \".label\");\n" +
"        checkNull$3(d.variant, field + \".variant\");\n" +
"        const knownProperties = [\"analytical_code\", \"color\", \"group\", \"group_id\", \"icon\", \"id\", \"label\", \"variant\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Tag(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.analytical_code = d.analytical_code;\n" +
"        if (\"color\" in d)\n" +
"            this.color = d.color;\n" +
"        this.group = d.group;\n" +
"        this.group_id = d.group_id;\n" +
"        this.icon = d.icon;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.variant = d.variant;\n" +
"    }\n" +
"}\n" +
"class Group {\n" +
"    static Parse(d) {\n" +
"        return Group.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkString$3(d.icon, field + \".icon\");\n" +
"        checkString$3(d.label, field + \".label\");\n" +
"        checkBoolean$2(d.self_service_accounting, field + \".self_service_accounting\");\n" +
"        const knownProperties = [\"icon\", \"label\", \"self_service_accounting\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Group(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.icon = d.icon;\n" +
"        this.label = d.label;\n" +
"        this.self_service_accounting = d.self_service_accounting;\n" +
"    }\n" +
"}\n" +
"let InvoiceLinesEntity$1 = class InvoiceLinesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoiceLinesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.advance, field + \".advance\", \"null | Advance\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.advance = Advance.Create(d.advance, field + \".advance\", \"null | Advance\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.advance_id, field + \".advance_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$2(d.advance_id, field + \".advance_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$2(d.advance_pnl, field + \".advance_pnl\");\n" +
"        checkString$3(d.amount, field + \".amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.asset, field + \".asset\", \"null | Asset\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.asset = Asset.Create(d.asset, field + \".asset\", \"null | Asset\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.asset_id, field + \".asset_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$2(d.asset_id, field + \".asset_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$3(d.currency_price_before_tax, field + \".currency_price_before_tax\");\n" +
"        checkString$3(d.currency_tax, field + \".currency_tax\");\n" +
"        checkNull$3(d.deferral, field + \".deferral\");\n" +
"        checkNull$3(d.deferral_id, field + \".deferral_id\");\n" +
"        checkBoolean$2(d.global_vat, field + \".global_vat\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        if (\"invoice_line_period\" in d) {\n" +
"            checkNull$3(d.invoice_line_period, field + \".invoice_line_period\");\n" +
"        }\n" +
"        checkString$3(d.label, field + \".label\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.ledger_event_label, field + \".ledger_event_label\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$3(d.ledger_event_label, field + \".ledger_event_label\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.ocr_vat_rate, field + \".ocr_vat_rate\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$3(d.ocr_vat_rate, field + \".ocr_vat_rate\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        d.pnl_plan_item = PnlPlanItemOrCurrentAccountPlanItem1.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkNumber$2(d.pnl_plan_item_id, field + \".pnl_plan_item_id\");\n" +
"        checkBoolean$2(d.prepaid_pnl, field + \".prepaid_pnl\");\n" +
"        checkString$3(d.tax, field + \".tax\");\n" +
"        checkString$3(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"advance\", \"advance_id\", \"advance_pnl\", \"amount\", \"asset\", \"asset_id\", \"currency_amount\", \"currency_price_before_tax\", \"currency_tax\", \"deferral\", \"deferral_id\", \"global_vat\", \"id\", \"invoice_line_period\", \"label\", \"ledger_event_label\", \"ocr_vat_rate\", \"pnl_plan_item\", \"pnl_plan_item_id\", \"prepaid_pnl\", \"tax\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.advance = d.advance;\n" +
"        this.advance_id = d.advance_id;\n" +
"        this.advance_pnl = d.advance_pnl;\n" +
"        this.amount = d.amount;\n" +
"        this.asset = d.asset;\n" +
"        this.asset_id = d.asset_id;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.deferral = d.deferral;\n" +
"        this.deferral_id = d.deferral_id;\n" +
"        this.global_vat = d.global_vat;\n" +
"        this.id = d.id;\n" +
"        if (\"invoice_line_period\" in d)\n" +
"            this.invoice_line_period = d.invoice_line_period;\n" +
"        this.label = d.label;\n" +
"        this.ledger_event_label = d.ledger_event_label;\n" +
"        this.ocr_vat_rate = d.ocr_vat_rate;\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        this.prepaid_pnl = d.prepaid_pnl;\n" +
"        this.tax = d.tax;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"};\n" +
"class Advance {\n" +
"    static Parse(d) {\n" +
"        return Advance.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkNumber$2(d.company_id, field + \".company_id\");\n" +
"        checkString$3(d.date, field + \".date\");\n" +
"        checkBoolean$2(d.has_ledger_events, field + \".has_ledger_events\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        const knownProperties = [\"company_id\", \"date\", \"has_ledger_events\", \"id\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Advance(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this.date = d.date;\n" +
"        this.has_ledger_events = d.has_ledger_events;\n" +
"        this.id = d.id;\n" +
"    }\n" +
"}\n" +
"class Asset {\n" +
"    static Parse(d) {\n" +
"        return Asset.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkNumber$2(d.amortization_months, field + \".amortization_months\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$3(d.amortization_type, field + \".amortization_type\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.amortization_type, field + \".amortization_type\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.entry_date, field + \".entry_date\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        checkBoolean$2(d.invoice_line_editable, field + \".invoice_line_editable\");\n" +
"        checkString$3(d.name, field + \".name\");\n" +
"        checkNumber$2(d.plan_item_id, field + \".plan_item_id\");\n" +
"        checkNumber$2(d.quantity, field + \".quantity\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$3(d.start_date, field + \".start_date\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.start_date, field + \".start_date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"amortization_months\", \"amortization_type\", \"entry_date\", \"id\", \"invoice_line_editable\", \"name\", \"plan_item_id\", \"quantity\", \"start_date\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Asset(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amortization_months = d.amortization_months;\n" +
"        this.amortization_type = d.amortization_type;\n" +
"        this.entry_date = d.entry_date;\n" +
"        this.id = d.id;\n" +
"        this.invoice_line_editable = d.invoice_line_editable;\n" +
"        this.name = d.name;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.quantity = d.quantity;\n" +
"        this.start_date = d.start_date;\n" +
"    }\n" +
"}\n" +
"class PnlPlanItemOrCurrentAccountPlanItem1 {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItemOrCurrentAccountPlanItem1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkBoolean$2(d.enabled, field + \".enabled\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        checkString$3(d.label, field + \".label\");\n" +
"        checkString$3(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PnlPlanItemOrCurrentAccountPlanItem1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"}\n" +
"let Thirdparty$1 = class Thirdparty {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        if (\"activity_code\" in d) {\n" +
"            checkString$3(d.activity_code, field + \".activity_code\");\n" +
"        }\n" +
"        if (\"activity_nomenclature\" in d) {\n" +
"            checkString$3(d.activity_nomenclature, field + \".activity_nomenclature\");\n" +
"        }\n" +
"        if (\"address\" in d) {\n" +
"            checkString$3(d.address, field + \".address\");\n" +
"        }\n" +
"        if (\"address_additional_info\" in d) {\n" +
"            checkString$3(d.address_additional_info, field + \".address_additional_info\");\n" +
"        }\n" +
"        if (\"admin_city_code\" in d) {\n" +
"            checkNull$3(d.admin_city_code, field + \".admin_city_code\");\n" +
"        }\n" +
"        if (\"balance\" in d) {\n" +
"            checkNull$3(d.balance, field + \".balance\");\n" +
"        }\n" +
"        if (\"billing_bank\" in d) {\n" +
"            checkNull$3(d.billing_bank, field + \".billing_bank\");\n" +
"        }\n" +
"        if (\"billing_bic\" in d) {\n" +
"            checkNull$3(d.billing_bic, field + \".billing_bic\");\n" +
"        }\n" +
"        if (\"billing_footer_invoice_id\" in d) {\n" +
"            checkNull$3(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        }\n" +
"        if (\"billing_footer_invoice_label\" in d) {\n" +
"            checkNull$3(d.billing_footer_invoice_label, field + \".billing_footer_invoice_label\");\n" +
"        }\n" +
"        if (\"billing_iban\" in d) {\n" +
"            checkNull$3(d.billing_iban, field + \".billing_iban\");\n" +
"        }\n" +
"        if (\"billing_language\" in d) {\n" +
"            checkString$3(d.billing_language, field + \".billing_language\");\n" +
"        }\n" +
"        if (\"city\" in d) {\n" +
"            checkString$3(d.city, field + \".city\");\n" +
"        }\n" +
"        if (\"company_id\" in d) {\n" +
"            checkNumber$2(d.company_id, field + \".company_id\");\n" +
"        }\n" +
"        if (\"complete\" in d) {\n" +
"            checkBoolean$2(d.complete, field + \".complete\");\n" +
"        }\n" +
"        if (\"country\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$3(d.country, field + \".country\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$3(d.country, field + \".country\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        if (\"credits\" in d) {\n" +
"            checkNull$3(d.credits, field + \".credits\");\n" +
"        }\n" +
"        if (\"current_mandate\" in d) {\n" +
"            checkNull$3(d.current_mandate, field + \".current_mandate\");\n" +
"        }\n" +
"        if (\"customer_type\" in d) {\n" +
"            checkString$3(d.customer_type, field + \".customer_type\");\n" +
"        }\n" +
"        if (\"debits\" in d) {\n" +
"            checkNull$3(d.debits, field + \".debits\");\n" +
"        }\n" +
"        if (\"delivery_address\" in d) {\n" +
"            checkString$3(d.delivery_address, field + \".delivery_address\");\n" +
"        }\n" +
"        if (\"delivery_address_additional_info\" in d) {\n" +
"            checkString$3(d.delivery_address_additional_info, field + \".delivery_address_additional_info\");\n" +
"        }\n" +
"        if (\"delivery_city\" in d) {\n" +
"            checkString$3(d.delivery_city, field + \".delivery_city\");\n" +
"        }\n" +
"        if (\"delivery_country\" in d) {\n" +
"            checkNull$3(d.delivery_country, field + \".delivery_country\");\n" +
"        }\n" +
"        if (\"delivery_country_alpha2\" in d) {\n" +
"            checkString$3(d[\"delivery_country_alpha2\"], field + \".delivery_country_alpha2\");\n" +
"        }\n" +
"        if (\"delivery_postal_code\" in d) {\n" +
"            checkString$3(d.delivery_postal_code, field + \".delivery_postal_code\");\n" +
"        }\n" +
"        if (\"disable_pending_vat\" in d) {\n" +
"            checkBoolean$2(d.disable_pending_vat, field + \".disable_pending_vat\");\n" +
"        }\n" +
"        if (\"display_name\" in d) {\n" +
"            checkNull$3(d.display_name, field + \".display_name\");\n" +
"        }\n" +
"        if (\"emails\" in d) {\n" +
"            checkArray$3(d.emails, field + \".emails\");\n" +
"            if (d.emails) {\n" +
"                for (let i = 0; i < d.emails.length; i++) {\n" +
"                    checkNever(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"establishment_no\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$3(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$3(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"estimate_count\" in d) {\n" +
"            checkNull$3(d.estimate_count, field + \".estimate_count\");\n" +
"        }\n" +
"        if (\"first_name\" in d) {\n" +
"            checkString$3(d.first_name, field + \".first_name\");\n" +
"        }\n" +
"        if (\"force_pending_vat\" in d) {\n" +
"            checkBoolean$2(d.force_pending_vat, field + \".force_pending_vat\");\n" +
"        }\n" +
"        if (\"gender\" in d) {\n" +
"            checkNull$3(d.gender, field + \".gender\");\n" +
"        }\n" +
"        if (\"gocardless_id\" in d) {\n" +
"            checkNull$3(d.gocardless_id, field + \".gocardless_id\");\n" +
"        }\n" +
"        if (\"iban\" in d) {\n" +
"            checkString$3(d.iban, field + \".iban\");\n" +
"        }\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        if (\"invoice_count\" in d) {\n" +
"            checkNull$3(d.invoice_count, field + \".invoice_count\");\n" +
"        }\n" +
"        if (\"invoice_dump_id\" in d) {\n" +
"            checkNull$3(d.invoice_dump_id, field + \".invoice_dump_id\");\n" +
"        }\n" +
"        if (\"invoices_auto_generated\" in d) {\n" +
"            checkBoolean$2(d.invoices_auto_generated, field + \".invoices_auto_generated\");\n" +
"        }\n" +
"        if (\"invoices_auto_validated\" in d) {\n" +
"            checkBoolean$2(d.invoices_auto_validated, field + \".invoices_auto_validated\");\n" +
"        }\n" +
"        if (\"known_supplier_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$3(d.known_supplier_id, field + \".known_supplier_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$2(d.known_supplier_id, field + \".known_supplier_id\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"last_name\" in d) {\n" +
"            checkString$3(d.last_name, field + \".last_name\");\n" +
"        }\n" +
"        if (\"ledger_events_count\" in d) {\n" +
"            checkNull$3(d.ledger_events_count, field + \".ledger_events_count\");\n" +
"        }\n" +
"        if (\"legal_form_code\" in d) {\n" +
"            checkString$3(d.legal_form_code, field + \".legal_form_code\");\n" +
"        }\n" +
"        if (\"method\" in d) {\n" +
"            checkString$3(d.method, field + \".method\");\n" +
"        }\n" +
"        checkString$3(d.name, field + \".name\");\n" +
"        if (\"notes\" in d) {\n" +
"            checkString$3(d.notes, field + \".notes\");\n" +
"        }\n" +
"        if (\"notes_comment\" in d) {\n" +
"            checkNull$3(d.notes_comment, field + \".notes_comment\");\n" +
"        }\n" +
"        if (\"payment_conditions\" in d) {\n" +
"            checkString$3(d.payment_conditions, field + \".payment_conditions\");\n" +
"        }\n" +
"        if (\"phone\" in d) {\n" +
"            checkString$3(d.phone, field + \".phone\");\n" +
"        }\n" +
"        if (\"plan_item\" in d) {\n" +
"            d.plan_item = PlanItemOrPnlPlanItem.Create(d.plan_item, field + \".plan_item\");\n" +
"        }\n" +
"        if (\"plan_item_attributes\" in d) {\n" +
"            checkNull$3(d.plan_item_attributes, field + \".plan_item_attributes\");\n" +
"        }\n" +
"        if (\"plan_item_id\" in d) {\n" +
"            checkNumber$2(d.plan_item_id, field + \".plan_item_id\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.pnl_plan_item = PlanItemOrPnlPlanItemOrCurrentAccountPlanItem.Create(d.pnl_plan_item, field + \".pnl_plan_item\", \"PlanItemOrPnlPlanItemOrCurrentAccountPlanItem | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.pnl_plan_item, field + \".pnl_plan_item\", \"PlanItemOrPnlPlanItemOrCurrentAccountPlanItem | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$2(d.pnl_plan_item_id, field + \".pnl_plan_item_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.pnl_plan_item_id, field + \".pnl_plan_item_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"postal_code\" in d) {\n" +
"            checkString$3(d.postal_code, field + \".postal_code\");\n" +
"        }\n" +
"        if (\"purchase_request_count\" in d) {\n" +
"            checkNull$3(d.purchase_request_count, field + \".purchase_request_count\");\n" +
"        }\n" +
"        if (\"received_a_mandate_request\" in d) {\n" +
"            checkBoolean$2(d.received_a_mandate_request, field + \".received_a_mandate_request\");\n" +
"        }\n" +
"        if (\"recipient\" in d) {\n" +
"            checkString$3(d.recipient, field + \".recipient\");\n" +
"        }\n" +
"        if (\"recurrent\" in d) {\n" +
"            checkBoolean$2(d.recurrent, field + \".recurrent\");\n" +
"        }\n" +
"        if (\"reference\" in d) {\n" +
"            checkString$3(d.reference, field + \".reference\");\n" +
"        }\n" +
"        if (\"reg_no\" in d) {\n" +
"            checkString$3(d.reg_no, field + \".reg_no\");\n" +
"        }\n" +
"        if (\"role\" in d) {\n" +
"            checkString$3(d.role, field + \".role\");\n" +
"        }\n" +
"        if (\"rule_enabled\" in d) {\n" +
"            checkBoolean$2(d.rule_enabled, field + \".rule_enabled\");\n" +
"        }\n" +
"        if (\"search_terms\" in d) {\n" +
"            checkArray$3(d.search_terms, field + \".search_terms\");\n" +
"            if (d.search_terms) {\n" +
"                for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                    checkString$3(d.search_terms[i], field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"source_id\" in d) {\n" +
"            checkString$3(d.source_id, field + \".source_id\");\n" +
"        }\n" +
"        if (\"stripe_id\" in d) {\n" +
"            checkNull$3(d.stripe_id, field + \".stripe_id\");\n" +
"        }\n" +
"        if (\"supplier_payment_method\" in d) {\n" +
"            checkNull$3(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        }\n" +
"        if (\"supplier_payment_method_last_updated_at\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$3(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$3(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"tags\" in d) {\n" +
"            checkArray$3(d.tags, field + \".tags\");\n" +
"            if (d.tags) {\n" +
"                for (let i = 0; i < d.tags.length; i++) {\n" +
"                    checkNever(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"turnover\" in d) {\n" +
"            checkNull$3(d.turnover, field + \".turnover\");\n" +
"        }\n" +
"        if (\"url\" in d) {\n" +
"            checkString$3(d.url, field + \".url\");\n" +
"        }\n" +
"        if (\"vat_number\" in d) {\n" +
"            checkString$3(d.vat_number, field + \".vat_number\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$3(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$3(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"activity_code\", \"activity_nomenclature\", \"address\", \"address_additional_info\", \"admin_city_code\", \"balance\", \"billing_bank\", \"billing_bic\", \"billing_footer_invoice_id\", \"billing_footer_invoice_label\", \"billing_iban\", \"billing_language\", \"city\", \"company_id\", \"complete\", \"country\", \"country_alpha2\", \"credits\", \"current_mandate\", \"customer_type\", \"debits\", \"delivery_address\", \"delivery_address_additional_info\", \"delivery_city\", \"delivery_country\", \"delivery_country_alpha2\", \"delivery_postal_code\", \"disable_pending_vat\", \"display_name\", \"emails\", \"establishment_no\", \"estimate_count\", \"first_name\", \"force_pending_vat\", \"gender\", \"gocardless_id\", \"iban\", \"id\", \"invoice_count\", \"invoice_dump_id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"known_supplier_id\", \"last_name\", \"ledger_events_count\", \"legal_form_code\", \"method\", \"name\", \"notes\", \"notes_comment\", \"payment_conditions\", \"phone\", \"plan_item\", \"plan_item_attributes\", \"plan_item_id\", \"pnl_plan_item\", \"pnl_plan_item_id\", \"postal_code\", \"purchase_request_count\", \"received_a_mandate_request\", \"recipient\", \"recurrent\", \"reference\", \"reg_no\", \"role\", \"rule_enabled\", \"search_terms\", \"source_id\", \"stripe_id\", \"supplier_payment_method\", \"supplier_payment_method_last_updated_at\", \"tags\", \"turnover\", \"url\", \"vat_number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Thirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"activity_code\" in d)\n" +
"            this.activity_code = d.activity_code;\n" +
"        if (\"activity_nomenclature\" in d)\n" +
"            this.activity_nomenclature = d.activity_nomenclature;\n" +
"        if (\"address\" in d)\n" +
"            this.address = d.address;\n" +
"        if (\"address_additional_info\" in d)\n" +
"            this.address_additional_info = d.address_additional_info;\n" +
"        if (\"admin_city_code\" in d)\n" +
"            this.admin_city_code = d.admin_city_code;\n" +
"        if (\"balance\" in d)\n" +
"            this.balance = d.balance;\n" +
"        if (\"billing_bank\" in d)\n" +
"            this.billing_bank = d.billing_bank;\n" +
"        if (\"billing_bic\" in d)\n" +
"            this.billing_bic = d.billing_bic;\n" +
"        if (\"billing_footer_invoice_id\" in d)\n" +
"            this.billing_footer_invoice_id = d.billing_footer_invoice_id;\n" +
"        if (\"billing_footer_invoice_label\" in d)\n" +
"            this.billing_footer_invoice_label = d.billing_footer_invoice_label;\n" +
"        if (\"billing_iban\" in d)\n" +
"            this.billing_iban = d.billing_iban;\n" +
"        if (\"billing_language\" in d)\n" +
"            this.billing_language = d.billing_language;\n" +
"        if (\"city\" in d)\n" +
"            this.city = d.city;\n" +
"        if (\"company_id\" in d)\n" +
"            this.company_id = d.company_id;\n" +
"        if (\"complete\" in d)\n" +
"            this.complete = d.complete;\n" +
"        if (\"country\" in d)\n" +
"            this.country = d.country;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        if (\"credits\" in d)\n" +
"            this.credits = d.credits;\n" +
"        if (\"current_mandate\" in d)\n" +
"            this.current_mandate = d.current_mandate;\n" +
"        if (\"customer_type\" in d)\n" +
"            this.customer_type = d.customer_type;\n" +
"        if (\"debits\" in d)\n" +
"            this.debits = d.debits;\n" +
"        if (\"delivery_address\" in d)\n" +
"            this.delivery_address = d.delivery_address;\n" +
"        if (\"delivery_address_additional_info\" in d)\n" +
"            this.delivery_address_additional_info = d.delivery_address_additional_info;\n" +
"        if (\"delivery_city\" in d)\n" +
"            this.delivery_city = d.delivery_city;\n" +
"        if (\"delivery_country\" in d)\n" +
"            this.delivery_country = d.delivery_country;\n" +
"        if (\"delivery_country_alpha2\" in d)\n" +
"            this[\"delivery_country_alpha2\"] = d[\"delivery_country_alpha2\"];\n" +
"        if (\"delivery_postal_code\" in d)\n" +
"            this.delivery_postal_code = d.delivery_postal_code;\n" +
"        if (\"disable_pending_vat\" in d)\n" +
"            this.disable_pending_vat = d.disable_pending_vat;\n" +
"        if (\"display_name\" in d)\n" +
"            this.display_name = d.display_name;\n" +
"        if (\"emails\" in d)\n" +
"            this.emails = d.emails;\n" +
"        if (\"establishment_no\" in d)\n" +
"            this.establishment_no = d.establishment_no;\n" +
"        if (\"estimate_count\" in d)\n" +
"            this.estimate_count = d.estimate_count;\n" +
"        if (\"first_name\" in d)\n" +
"            this.first_name = d.first_name;\n" +
"        if (\"force_pending_vat\" in d)\n" +
"            this.force_pending_vat = d.force_pending_vat;\n" +
"        if (\"gender\" in d)\n" +
"            this.gender = d.gender;\n" +
"        if (\"gocardless_id\" in d)\n" +
"            this.gocardless_id = d.gocardless_id;\n" +
"        if (\"iban\" in d)\n" +
"            this.iban = d.iban;\n" +
"        this.id = d.id;\n" +
"        if (\"invoice_count\" in d)\n" +
"            this.invoice_count = d.invoice_count;\n" +
"        if (\"invoice_dump_id\" in d)\n" +
"            this.invoice_dump_id = d.invoice_dump_id;\n" +
"        if (\"invoices_auto_generated\" in d)\n" +
"            this.invoices_auto_generated = d.invoices_auto_generated;\n" +
"        if (\"invoices_auto_validated\" in d)\n" +
"            this.invoices_auto_validated = d.invoices_auto_validated;\n" +
"        if (\"known_supplier_id\" in d)\n" +
"            this.known_supplier_id = d.known_supplier_id;\n" +
"        if (\"last_name\" in d)\n" +
"            this.last_name = d.last_name;\n" +
"        if (\"ledger_events_count\" in d)\n" +
"            this.ledger_events_count = d.ledger_events_count;\n" +
"        if (\"legal_form_code\" in d)\n" +
"            this.legal_form_code = d.legal_form_code;\n" +
"        if (\"method\" in d)\n" +
"            this.method = d.method;\n" +
"        this.name = d.name;\n" +
"        if (\"notes\" in d)\n" +
"            this.notes = d.notes;\n" +
"        if (\"notes_comment\" in d)\n" +
"            this.notes_comment = d.notes_comment;\n" +
"        if (\"payment_conditions\" in d)\n" +
"            this.payment_conditions = d.payment_conditions;\n" +
"        if (\"phone\" in d)\n" +
"            this.phone = d.phone;\n" +
"        if (\"plan_item\" in d)\n" +
"            this.plan_item = d.plan_item;\n" +
"        if (\"plan_item_attributes\" in d)\n" +
"            this.plan_item_attributes = d.plan_item_attributes;\n" +
"        if (\"plan_item_id\" in d)\n" +
"            this.plan_item_id = d.plan_item_id;\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        if (\"postal_code\" in d)\n" +
"            this.postal_code = d.postal_code;\n" +
"        if (\"purchase_request_count\" in d)\n" +
"            this.purchase_request_count = d.purchase_request_count;\n" +
"        if (\"received_a_mandate_request\" in d)\n" +
"            this.received_a_mandate_request = d.received_a_mandate_request;\n" +
"        if (\"recipient\" in d)\n" +
"            this.recipient = d.recipient;\n" +
"        if (\"recurrent\" in d)\n" +
"            this.recurrent = d.recurrent;\n" +
"        if (\"reference\" in d)\n" +
"            this.reference = d.reference;\n" +
"        if (\"reg_no\" in d)\n" +
"            this.reg_no = d.reg_no;\n" +
"        if (\"role\" in d)\n" +
"            this.role = d.role;\n" +
"        if (\"rule_enabled\" in d)\n" +
"            this.rule_enabled = d.rule_enabled;\n" +
"        if (\"search_terms\" in d)\n" +
"            this.search_terms = d.search_terms;\n" +
"        if (\"source_id\" in d)\n" +
"            this.source_id = d.source_id;\n" +
"        if (\"stripe_id\" in d)\n" +
"            this.stripe_id = d.stripe_id;\n" +
"        if (\"supplier_payment_method\" in d)\n" +
"            this.supplier_payment_method = d.supplier_payment_method;\n" +
"        if (\"supplier_payment_method_last_updated_at\" in d)\n" +
"            this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;\n" +
"        if (\"tags\" in d)\n" +
"            this.tags = d.tags;\n" +
"        if (\"turnover\" in d)\n" +
"            this.turnover = d.turnover;\n" +
"        if (\"url\" in d)\n" +
"            this.url = d.url;\n" +
"        if (\"vat_number\" in d)\n" +
"            this.vat_number = d.vat_number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"};\n" +
"class PlanItemOrPnlPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        checkNumber$2(d.company_id, field + \".company_id\");\n" +
"        checkString$3(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$2(d.enabled, field + \".enabled\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        checkNull$3(d.internal_identifier, field + \".internal_identifier\");\n" +
"        checkString$3(d.label, field + \".label\");\n" +
"        checkBoolean$2(d.label_is_editable, field + \".label_is_editable\");\n" +
"        checkString$3(d.number, field + \".number\");\n" +
"        checkString$3(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItemOrPnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"        this.number = d.number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"class PlanItemOrPnlPlanItemOrCurrentAccountPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItemOrCurrentAccountPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$4(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d);\n" +
"        }\n" +
"        if (\"company_id\" in d) {\n" +
"            checkNumber$2(d.company_id, field + \".company_id\");\n" +
"        }\n" +
"        if (\"country_alpha2\" in d) {\n" +
"            checkString$3(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        }\n" +
"        checkBoolean$2(d.enabled, field + \".enabled\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        if (\"internal_identifier\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$3(d.internal_identifier, field + \".internal_identifier\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$3(d.internal_identifier, field + \".internal_identifier\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.label, field + \".label\");\n" +
"        if (\"label_is_editable\" in d) {\n" +
"            checkBoolean$2(d.label_is_editable, field + \".label_is_editable\");\n" +
"        }\n" +
"        checkString$3(d.number, field + \".number\");\n" +
"        if (\"vat_rate\" in d) {\n" +
"            checkString$3(d.vat_rate, field + \".vat_rate\");\n" +
"        }\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItemOrPnlPlanItemOrCurrentAccountPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"company_id\" in d)\n" +
"            this.company_id = d.company_id;\n" +
"        if (\"country_alpha2\" in d)\n" +
"            this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        if (\"internal_identifier\" in d)\n" +
"            this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        if (\"label_is_editable\" in d)\n" +
"            this.label_is_editable = d.label_is_editable;\n" +
"        this.number = d.number;\n" +
"        if (\"vat_rate\" in d)\n" +
"            this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$4(field, value, multiple) {\n" +
"    return errorHelper$4(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$4(field, value, multiple) {\n" +
"    return errorHelper$4(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$4(field, value, multiple) {\n" +
"    return errorHelper$4(field, value, \"object\");\n" +
"}\n" +
"function checkArray$3(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$4(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$2(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$4(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$2(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$4(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$3(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$4(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$3(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$4(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever(value, field, multiple) {\n" +
"    return errorHelper$4(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$4(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$4));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$4;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$4));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$3 = null;\n" +
"class APIInvoiceList {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceList.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$3(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d);\n" +
"        }\n" +
"        checkArray$2(d.invoices, field + \".invoices\");\n" +
"        if (d.invoices) {\n" +
"            for (let i = 0; i < d.invoices.length; i++) {\n" +
"                d.invoices[i] = InvoicesEntity.Create(d.invoices[i], field + \".invoices\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$1(d.pageSize, field + \".pageSize\");\n" +
"        d.pagination = Pagination.Create(d.pagination, field + \".pagination\");\n" +
"        const knownProperties = [\"invoices\", \"pageSize\", \"pagination\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIInvoiceList(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.invoices = d.invoices;\n" +
"        this.pageSize = d.pageSize;\n" +
"        this.pagination = d.pagination;\n" +
"    }\n" +
"}\n" +
"class InvoicesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoicesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$3(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d);\n" +
"        }\n" +
"        checkString$2(d.amount, field + \".amount\");\n" +
"        checkString$2(d.amount_without_tax, field + \".amount_without_tax\");\n" +
"        checkNull$2(d.approval_status, field + \".approval_status\");\n" +
"        checkBoolean$1(d.archived, field + \".archived\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$2(d.checksum, field + \".checksum\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$2(d.checksum, field + \".checksum\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$1(d.company_id, field + \".company_id\");\n" +
"        checkString$2(d.created_at, field + \".created_at\");\n" +
"        checkString$2(d.currency, field + \".currency\");\n" +
"        checkString$2(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$2(d.currency_tax, field + \".currency_tax\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$2(d.date, field + \".date\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$2(d.date, field + \".date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$2(d.deadline, field + \".deadline\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$2(d.deadline, field + \".deadline\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$2(d.direction, field + \".direction\");\n" +
"        checkNull$2(d.email_from, field + \".email_from\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$2(d.filename, field + \".filename\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$2(d.filename, field + \".filename\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$2(d.gdrive_path, field + \".gdrive_path\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$2(d.gdrive_path, field + \".gdrive_path\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkBoolean$1(d.incomplete, field + \".incomplete\");\n" +
"        checkArray$2(d.invoice_lines, field + \".invoice_lines\");\n" +
"        if (d.invoice_lines) {\n" +
"            for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$2(d.invoice_number, field + \".invoice_number\");\n" +
"        checkBoolean$1(d.is_factur_x, field + \".is_factur_x\");\n" +
"        checkBoolean$1(d.is_waiting_for_ocr, field + \".is_waiting_for_ocr\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$2(d.label, field + \".label\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$2(d.label, field + \".label\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$1(d.not_duplicate, field + \".not_duplicate\");\n" +
"        checkBoolean$1(d.paid, field + \".paid\");\n" +
"        checkString$2(d.payment_status, field + \".payment_status\");\n" +
"        checkString$2(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkString$2(d.source, field + \".source\");\n" +
"        checkString$2(d.status, field + \".status\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.thirdparty = Thirdparty.Create(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$2(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$2(d.type, field + \".type\");\n" +
"        checkBoolean$1(d.validation_needed, field + \".validation_needed\");\n" +
"        const knownProperties = [\"amount\", \"amount_without_tax\", \"approval_status\", \"archived\", \"checksum\", \"company_id\", \"created_at\", \"currency\", \"currency_amount\", \"currency_tax\", \"date\", \"deadline\", \"direction\", \"email_from\", \"filename\", \"gdrive_path\", \"id\", \"incomplete\", \"invoice_lines\", \"invoice_number\", \"is_factur_x\", \"is_waiting_for_ocr\", \"label\", \"not_duplicate\", \"paid\", \"payment_status\", \"pusher_channel\", \"source\", \"status\", \"thirdparty\", \"type\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new InvoicesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.amount_without_tax = d.amount_without_tax;\n" +
"        this.approval_status = d.approval_status;\n" +
"        this.archived = d.archived;\n" +
"        this.checksum = d.checksum;\n" +
"        this.company_id = d.company_id;\n" +
"        this.created_at = d.created_at;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.date = d.date;\n" +
"        this.deadline = d.deadline;\n" +
"        this.direction = d.direction;\n" +
"        this.email_from = d.email_from;\n" +
"        this.filename = d.filename;\n" +
"        this.gdrive_path = d.gdrive_path;\n" +
"        this.id = d.id;\n" +
"        this.incomplete = d.incomplete;\n" +
"        this.invoice_lines = d.invoice_lines;\n" +
"        this.invoice_number = d.invoice_number;\n" +
"        this.is_factur_x = d.is_factur_x;\n" +
"        this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        this.label = d.label;\n" +
"        this.not_duplicate = d.not_duplicate;\n" +
"        this.paid = d.paid;\n" +
"        this.payment_status = d.payment_status;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.source = d.source;\n" +
"        this.status = d.status;\n" +
"        this.thirdparty = d.thirdparty;\n" +
"        this.type = d.type;\n" +
"        this.validation_needed = d.validation_needed;\n" +
"    }\n" +
"}\n" +
"class InvoiceLinesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoiceLinesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$3(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d);\n" +
"        }\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkString$2(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"id\", \"pnl_plan_item\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"class PnlPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$3(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d);\n" +
"        }\n" +
"        checkBoolean$1(d.enabled, field + \".enabled\");\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$2(d.label, field + \".label\");\n" +
"        checkString$2(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"}\n" +
"class Thirdparty {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$3(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d);\n" +
"        }\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$2(d.name, field + \".name\");\n" +
"        const knownProperties = [\"id\", \"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Thirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"    }\n" +
"}\n" +
"class Pagination {\n" +
"    static Parse(d) {\n" +
"        return Pagination.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$3(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d);\n" +
"        }\n" +
"        checkBoolean$1(d.hasNextPage, field + \".hasNextPage\");\n" +
"        checkNumber$1(d.page, field + \".page\");\n" +
"        checkNumber$1(d.pages, field + \".pages\");\n" +
"        checkNumber$1(d.pageSize, field + \".pageSize\");\n" +
"        checkNumber$1(d.totalEntries, field + \".totalEntries\");\n" +
"        checkString$2(d.totalEntriesPrecision, field + \".totalEntriesPrecision\");\n" +
"        checkString$2(d.totalEntriesStr, field + \".totalEntriesStr\");\n" +
"        const knownProperties = [\"hasNextPage\", \"page\", \"pages\", \"pageSize\", \"totalEntries\", \"totalEntriesPrecision\", \"totalEntriesStr\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Pagination(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.hasNextPage = d.hasNextPage;\n" +
"        this.page = d.page;\n" +
"        this.pages = d.pages;\n" +
"        this.pageSize = d.pageSize;\n" +
"        this.totalEntries = d.totalEntries;\n" +
"        this.totalEntriesPrecision = d.totalEntriesPrecision;\n" +
"        this.totalEntriesStr = d.totalEntriesStr;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$3(field, value, multiple) {\n" +
"    return errorHelper$3(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$3(field, value, multiple) {\n" +
"    return errorHelper$3(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$3(field, value, multiple) {\n" +
"    return errorHelper$3(field, value, \"object\");\n" +
"}\n" +
"function checkArray$2(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$3(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$1(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$3(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$1(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$3(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$2(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$3(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$2(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$3(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function errorHelper$3(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$3));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$3;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$3));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$2 = null;\n" +
"class APIInvoiceListParams {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceListParams.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$2 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$2(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d);\n" +
"        }\n" +
"        checkString$1(d.direction, field + \".direction\");\n" +
"        if (\"filter\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$1(d.filter, field + \".filter\", \"string | FilterEntity[]\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkArray$1(d.filter, field + \".filter\", \"string | FilterEntity[]\");\n" +
"                    if (d.filter) {\n" +
"                        for (let i = 0; i < d.filter.length; i++) {\n" +
"                            d.filter[i] = FilterEntity.Create(d.filter[i], field + \".filter\" + \"[\" + i + \"]\");\n" +
"                        }\n" +
"                    }\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"page\" in d) {\n" +
"            checkNumber(d.page, field + \".page\");\n" +
"        }\n" +
"        if (\"sort\" in d) {\n" +
"            checkString$1(d.sort, field + \".sort\");\n" +
"        }\n" +
"        const knownProperties = [\"direction\", \"filter\", \"page\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$2(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIInvoiceListParams(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.direction = d.direction;\n" +
"        if (\"filter\" in d)\n" +
"            this.filter = d.filter;\n" +
"        if (\"page\" in d)\n" +
"            this.page = d.page;\n" +
"        if (\"sort\" in d)\n" +
"            this.sort = d.sort;\n" +
"    }\n" +
"}\n" +
"class FilterEntity {\n" +
"    static Parse(d) {\n" +
"        return FilterEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$2 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$2(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d);\n" +
"        }\n" +
"        checkString$1(d.field, field + \".field\");\n" +
"        checkString$1(d.operator, field + \".operator\");\n" +
"        checkString$1(d.value, field + \".value\");\n" +
"        const knownProperties = [\"field\", \"operator\", \"value\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$2(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new FilterEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.field = d.field;\n" +
"        this.operator = d.operator;\n" +
"        this.value = d.value;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$2(field, value, multiple) {\n" +
"    return errorHelper$2(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$2(field, value, multiple) {\n" +
"    return errorHelper$2(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$2(field, value, multiple) {\n" +
"    return errorHelper$2(field, value, \"object\");\n" +
"}\n" +
"function checkArray$1(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$2(field, value, multiple);\n" +
"}\n" +
"function checkNumber(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$2(field, value, \"number\");\n" +
"}\n" +
"function checkString$1(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$2(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function errorHelper$2(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$2));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$2;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$2));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$1 = null;\n" +
"class APIInvoiceToDMS {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceToDMS.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$1 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$1(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$1(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$1(field, d);\n" +
"        }\n" +
"        checkNull$1(d.response, field + \".response\");\n" +
"        const knownProperties = [\"response\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIInvoiceToDMS(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.response = d.response;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$1(field, value, multiple) {\n" +
"    return errorHelper$1(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$1(field, value, multiple) {\n" +
"    return errorHelper$1(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$1(field, value, multiple) {\n" +
"    return errorHelper$1(field, value, \"object\");\n" +
"}\n" +
"function checkNull$1(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$1(field, value, \"null\");\n" +
"}\n" +
"function errorHelper$1(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$1));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$1;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$1));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj = null;\n" +
"class APIInvoiceUpdateResponse {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceUpdateResponse.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray(field, d);\n" +
"        }\n" +
"        checkBoolean(d.embeddable_in_browser, field + \".embeddable_in_browser\");\n" +
"        checkBoolean(d.has_file, field + \".has_file\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString(d.preview_urls[i], field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"embeddable_in_browser\", \"has_file\", \"preview_status\", \"preview_urls\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIInvoiceUpdateResponse(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        this.has_file = d.has_file;\n" +
"        this.preview_status = d.preview_status;\n" +
"        this.preview_urls = d.preview_urls;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull(field, value, multiple) {\n" +
"    return errorHelper(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject(field, value, multiple) {\n" +
"    return errorHelper(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray(field, value, multiple) {\n" +
"    return errorHelper(field, value, \"object\");\n" +
"}\n" +
"function checkArray(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper(field, value, \"array\");\n" +
"}\n" +
"function checkBoolean(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper(field, value, \"boolean\");\n" +
"}\n" +
"function checkString(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper(field, value, multiple);\n" +
"}\n" +
"function errorHelper(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"async function getInvoice(id, maxAge) {\n" +
"    if (!id)\n" +
"        throw new Error(`Error: getInvoice() invalid id: ${id}`);\n" +
"    const invoice = await cachedRequest(\"invoice:getInvoice\", { id }, async () => {\n" +
"        const response = await apiRequest(`accountants/invoices/${id}`, null, \"GET\");\n" +
"        if (!response)\n" +
"            return null;\n" +
"        const data = await response.json();\n" +
"        return data.invoice;\n" +
"    }, maxAge);\n" +
"    return invoice ? APIInvoice.Create(invoice) : null;\n" +
"}\n" +
"async function updateInvoice(id, data) {\n" +
"    const response = await apiRequest(`/accountants/invoices/${id}`, { invoice: data }, \"PUT\");\n" +
"    const responseData = await response?.json();\n" +
"    if (!responseData)\n" +
"        return null;\n" +
"    return APIInvoiceUpdateResponse.Create(responseData);\n" +
"}\n" +
"/**\n" +
" * Get invoice list paginated\n" +
" */\n" +
"async function getInvoicesList(params = { direction: \"supplier\" }) {\n" +
"    params = APIInvoiceListParams.Create(params);\n" +
"    if (\"page\" in params && !Number.isSafeInteger(params.page)) {\n" +
"        console.log(\"getInvoicesList\", { params });\n" +
"        throw new Error(\"params.page, if provided, MUST be a safe integer\");\n" +
"    }\n" +
"    if (\"filter\" in params && typeof params.filter !== \"string\")\n" +
"        Object.assign(params, { filter: JSON.stringify(params.filter) });\n" +
"    const searchParams = new URLSearchParams(params);\n" +
"    if (!searchParams.has(\"filter\"))\n" +
"        searchParams.set(\"filter\", \"[]\");\n" +
"    const url = `accountants/invoices/list?${searchParams.toString()}`;\n" +
"    const response = await apiRequest(url, null, \"GET\");\n" +
"    const data = await response?.json();\n" +
"    return APIInvoiceList.Create(data);\n" +
"}\n" +
"/**\n" +
" * Generate all result one by one as generator\n" +
" */\n" +
"async function* getInvoiceGenerator(params = { direction: \"supplier\" }) {\n" +
"    let page = Number(params.page ?? 1);\n" +
"    if (!Number.isSafeInteger(page)) {\n" +
"        console.log(\"getInvoiceGenerator\", { params, page });\n" +
"        throw new Error(\"params.page, if provided, MUST be a safe integer\");\n" +
"    }\n" +
"    do {\n" +
"        const data = await getInvoicesList(Object.assign({}, params, { page }));\n" +
"        const invoices = data.invoices;\n" +
"        if (!invoices?.length)\n" +
"            return;\n" +
"        for (const invoice of invoices)\n" +
"            yield invoice;\n" +
"        ++page;\n" +
"    } while (true);\n" +
"}\n" +
"async function findInvoice(cb, params = {}) {\n" +
"    if (\"page\" in params && !Number.isInteger(params.page)) {\n" +
"        console.log(\"findInvoice\", { cb, params });\n" +
"        throw new Error('The \"page\" parameter must be a valid integer number');\n" +
"    }\n" +
"    let parameters = jsonClone(params);\n" +
"    Object.assign(parameters, { page: parameters.page ?? 1 });\n" +
"    let data = null;\n" +
"    do {\n" +
"        data = await getInvoicesList(parameters);\n" +
"        const invoices = data.invoices;\n" +
"        if (!invoices?.length)\n" +
"            return null;\n" +
"        console.log(\"findInvoice page\", { parameters, data, invoices });\n" +
"        for (const invoice of invoices)\n" +
"            if (await cb(invoice, parameters))\n" +
"                return invoice;\n" +
"        parameters = Object.assign(jsonClone(parameters), { page: (parameters.page ?? 0) + 1 });\n" +
"    } while (true);\n" +
"}\n" +
"/**\n" +
" * Move invoice to DMS\n" +
" */\n" +
"async function moveToDms(id, destId) {\n" +
"    const url = `accountants/invoices/${id}/move_to_dms?parent_id=${destId.parent_id}&direction=${destId.direction}`;\n" +
"    const response = await apiRequest(url, null, \"PUT\");\n" +
"    return APIInvoiceToDMS.Create({ response });\n" +
"}\n" +
"\n" +
"class DMSItem extends Logger {\n" +
"    constructor({ id }) {\n" +
"        super();\n" +
"        this.id = id;\n" +
"        this.valid = null;\n" +
"        this.validMessage = null;\n" +
"    }\n" +
"    async getLinks() {\n" +
"        const fileId = (await this.getItem())?.itemable_id;\n" +
"        if (!fileId)\n" +
"            return [];\n" +
"        return await getDMSItemLinks(fileId);\n" +
"    }\n" +
"    async getItem() {\n" +
"        if (!this.item) {\n" +
"            this.item = getDMSItem(this.id);\n" +
"            this.item = await this.item;\n" +
"        }\n" +
"        return await this.item;\n" +
"    }\n" +
"    async toInvoice() {\n" +
"        const start = new Date().toISOString();\n" +
"        const dmsItem = await this.getItem();\n" +
"        const regex = /^(?<number>.*?)(?: - (?<date>[0123]\\d-[01]\\d-\\d{4}))?(?: - (?<amount>[\\d .]*(?:,\\d\\d)?) ?€)$/u;\n" +
"        const match = dmsItem.name.match(regex)?.groups;\n" +
"        if (!match) {\n" +
"            this.log('The file name does not match the Invoice Regex', { name: dmsItem.name, regex });\n" +
"            return;\n" +
"        }\n" +
"        const date = match.date && new Date(match.date.split('-').reverse().join('-'));\n" +
"        const groupedDocs = await this.getLinks();\n" +
"        const transactionRecord = groupedDocs.find(gdoc => gdoc.record_type === 'BankTransaction');\n" +
"        const transactionDocument = transactionRecord && await getDocument(transactionRecord.record_id);\n" +
"        const direction = Number(transactionDocument?.amount) > 0 ? 'customer' : 'supplier';\n" +
"        this.debug(jsonClone({ start, dmsItem, match: { ...match }, groupedDocs, direction, transactionRecord, transactionDocument, date: date.toLocaleDateString() }));\n" +
"        if (!match) {\n" +
"            this.log('toInvoice: Unable to parse invoice infos');\n" +
"        }\n" +
"        if (!transactionDocument) {\n" +
"            this.log('toInvoice : Unable to determine direction');\n" +
"            return;\n" +
"        }\n" +
"        const dmsToInvoiceResponse = await dmsToInvoice(dmsItem.signed_id, direction);\n" +
"        const invoice = await findInvoice(() => true, { direction, filter: [{ field: 'created_at', operator: 'gteq', value: start }] });\n" +
"        const line = {};\n" +
"        const data = {\n" +
"            invoice_number: match.number,\n" +
"            validation_needed: false,\n" +
"            incomplete: false,\n" +
"            is_waiting_for_ocr: false,\n" +
"        };\n" +
"        if (match.date)\n" +
"            Object.assign(data, { date: match.date, deadline: match.date });\n" +
"        if (match.amount)\n" +
"            Object.assign(line, {\n" +
"                currency_amount: parseFloat(match.amount),\n" +
"                currency_price_before_tax: parseFloat(match.amount),\n" +
"                currency_tax: 0,\n" +
"                vat_rate: \"exempt\"\n" +
"            });\n" +
"        if (transactionDocument?.thirdparty_id) {\n" +
"            const thirdparty = (await getThirdparty(transactionDocument.thirdparty_id)).thirdparty;\n" +
"            Object.assign(data, { thirdparty_id: transactionDocument.thirdparty_id });\n" +
"            Object.assign(line, { pnl_plan_item_id: thirdparty.thirdparty_invoice_line_rules[0]?.pnl_plan_item });\n" +
"        }\n" +
"        Object.assign(data, { invoice_lines_attributes: [line] });\n" +
"        const updateInvoiceResponse = await updateInvoice(invoice.id, data);\n" +
"        this.log({ dmsToInvoiceResponse, updateInvoiceResponse, invoice, data });\n" +
"        return invoice;\n" +
"    }\n" +
"    async loadValidation() {\n" +
"        if (this.validMessage === null)\n" +
"            this.validMessage = await this.getValidMessage();\n" +
"        this.valid = this.validMessage === 'OK';\n" +
"    }\n" +
"    async isValid() {\n" +
"        if (this.valid === null)\n" +
"            await this.loadValidation();\n" +
"        return this.valid;\n" +
"    }\n" +
"    isCurrent() {\n" +
"        return this.id === Number(getParam(location.href, 'item_id'));\n" +
"    }\n" +
"    async fixDateCase() {\n" +
"        const item = await this.getItem();\n" +
"        if (!item)\n" +
"            return;\n" +
"        const re = / - (?<date>(?<day>[0123]\\d)\\/(?<month>0[1-9]|1[0-2])\\/(?<year>\\d{4})) - /;\n" +
"        const date = item.name.match(re)?.groups;\n" +
"        if (!date)\n" +
"            return;\n" +
"        const name = item.name.replace(re, ` - ${date.day}-${date.month}-${date.year} - `);\n" +
"        const updatedItem = await updateDMSItem({ id: this.id, name });\n" +
"        const input = $('input[name=\"name\"]');\n" +
"        input.value = name;\n" +
"        const rightList = findElem('div', 'Nom du Fichier').closest('div.w-100');\n" +
"        const props = getReactProps(rightList, 7);\n" +
"        if (props)\n" +
"            props.item = updatedItem;\n" +
"    }\n" +
"    async getStatus() {\n" +
"        const id = this.id;\n" +
"        const item = await this.getItem();\n" +
"        if (!item)\n" +
"            return null;\n" +
"        const valid = await this.isValid();\n" +
"        const message = await this.getValidMessage();\n" +
"        const createdAt = new Date(item.created_at).getTime();\n" +
"        const date = new Date(item.updated_at).getTime();\n" +
"        return { id, valid, message, createdAt, date };\n" +
"    }\n" +
"    async isPermanent() {\n" +
"        const item = await this.getItem();\n" +
"        if (!item)\n" +
"            return null;\n" +
"        return [\n" +
"            21994019, // 05. Contrats\n" +
"        ].includes(item.parent_id);\n" +
"    }\n" +
"    async getValidMessage() {\n" +
"        const item = await this.getItem();\n" +
"        if (!item)\n" +
"            return null;\n" +
"        if (item.type === 'dms_folder')\n" +
"            return 'OK';\n" +
"        if (await this.isPermanent())\n" +
"            return \"OK\";\n" +
"        const rules = await this.getRules();\n" +
"        if (getParam(location.href, 'item_id') === this.id.toString(10)) {\n" +
"            this.log('getValidMessage', { rules, item });\n" +
"        }\n" +
"        if (item.archived_at)\n" +
"            return 'OK';\n" +
"        if (this.isCurrent())\n" +
"            this.fixDateCase();\n" +
"        if (rules) {\n" +
"            const match = rules.templates.some(template => template.regex.test(item.name));\n" +
"            if (!match)\n" +
"                return rules.message;\n" +
"        }\n" +
"        else {\n" +
"            const links = await this.getLinks();\n" +
"            if (!links.length)\n" +
"                return 'Ce document n\\'est pas lié';\n" +
"        }\n" +
"        return 'OK';\n" +
"    }\n" +
"    async getRules() {\n" +
"        const item = await this.getItem();\n" +
"        if (!item)\n" +
"            return null;\n" +
"        if (item.name.startsWith('RECU') || item.name.startsWith('§'))\n" +
"            return null;\n" +
"        const links = await this.getLinks();\n" +
"        if (await this.hasClosedLink(links))\n" +
"            return null;\n" +
"        const transactions = links.filter(link => link.record_type === 'BankTransaction');\n" +
"        const isCheckRemmitance = transactions\n" +
"            .some(transaction => transaction.record_name.startsWith('REMISE CHEQUE '));\n" +
"        if (isCheckRemmitance) {\n" +
"            const templates = [\n" +
"                {\n" +
"                    title: 'Photo du chèque',\n" +
"                    text: 'CHQ&lt;n° du chèque&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€',\n" +
"                    regex: /^CHQ(?: n°)? ?\\d* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d \\.]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                },\n" +
"                {\n" +
"                    title: 'Reçu de don',\n" +
"                    text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€',\n" +
"                    regex: /^CERFA(?: n°)? ?[\\d-]* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                }\n" +
"            ];\n" +
"            const message = `<a\n" +
"        title=\"Le nom des fichiers attachés à une remise de chèque doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;\n" +
"            return { templates, message };\n" +
"        }\n" +
"        const isEmittedCheck = transactions\n" +
"            .some(transaction => transaction.record_name.startsWith('CHEQUE '));\n" +
"        if (isEmittedCheck) {\n" +
"            const templates = [\n" +
"                {\n" +
"                    title: 'Talon du chèque',\n" +
"                    text: 'CHQ&lt;numéro du chèque&gt; - &lt;destinataire du chèque&gt; - &lt;montant&gt;€',\n" +
"                    regex: /^CHQ ?\\d* - .* - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                },\n" +
"                {\n" +
"                    title: 'Reçu de don à une association',\n" +
"                    text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom bénéficiaire&gt; - jj-mm-aaaa - &lt;montant&gt;€',\n" +
"                    regex: /^CERFA n° ?[\\d-]* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                },\n" +
"                {\n" +
"                    title: 'Reçu d\\'octroi d\\'aide',\n" +
"                    text: 'AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj-mm-aaaa - &lt;montant&gt;€',\n" +
"                    regex: /^AIDES?\\d* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                },\n" +
"            ];\n" +
"            const message = `<a\n" +
"        title=\"Le nom des fichiers attachés à un paiement par chèque doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;\n" +
"            return { templates, message };\n" +
"        }\n" +
"        const isReceivedTransfer = transactions.some(transaction => [\n" +
"            'VIR INST RE',\n" +
"            'VIR RECU',\n" +
"            'VIR INSTANTANE RECU DE:',\n" +
"        ].some(label => transaction.record_name.startsWith(label)));\n" +
"        if (isReceivedTransfer) {\n" +
"            const templates = [\n" +
"                {\n" +
"                    title: 'Reçu de don',\n" +
"                    text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€',\n" +
"                    regex: /^CERFA n° ?[\\d-]* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                },\n" +
"            ];\n" +
"            const message = `<a\n" +
"        title=\"Le nom des fichiers attachés à un virement reçu doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;\n" +
"            return { templates, message };\n" +
"        }\n" +
"        const isEmittedTransfer = transactions.some(transaction => [\n" +
"            'VIR EUROPEEN EMIS',\n" +
"            'VIR INSTANTANE EMIS',\n" +
"        ].some(label => transaction.record_name.includes(label)));\n" +
"        if (isEmittedTransfer) {\n" +
"            const templates = [\n" +
"                {\n" +
"                    title: 'Reçu de don à une association',\n" +
"                    text: 'CERFA n°&lt;n° de cerfa&gt; - &lt;nom bénéficiaire&gt; - jj-mm-aaaa - &lt;montant&gt;€',\n" +
"                    regex: /^CERFA n° ?[\\d-]* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                },\n" +
"                {\n" +
"                    title: 'Reçu d\\'octroi d\\'aide',\n" +
"                    text: 'AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj-mm-aaaa - &lt;montant&gt;€',\n" +
"                    regex: /^AIDES?\\d* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                },\n" +
"            ];\n" +
"            const message = `<a\n" +
"        title=\"Le nom des fichiers attachés à un virement émis doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates.map(it => `<li><b>${it.title} :</b><code>${it.text}</code></li>`).join('')}</ul>`;\n" +
"            return { templates, message };\n" +
"        }\n" +
"        return null;\n" +
"    }\n" +
"    async partialMatch(str) {\n" +
"        if (str.startsWith('RECU'))\n" +
"            return [str.length, str.length];\n" +
"        const rules = await this.getRules();\n" +
"        return (rules?.templates ?? []).reduce((pmatch, template) => {\n" +
"            const templateMatch = regexPartialMatch(str, template.regex);\n" +
"            const pmatchLength = pmatch[1] - pmatch[0];\n" +
"            const templateMatchLength = templateMatch[1] - templateMatch[0];\n" +
"            return pmatchLength > templateMatchLength ? templateMatch : pmatch;\n" +
"        }, [0, str.length]);\n" +
"    }\n" +
"    async hasClosedLink(links) {\n" +
"        const closed = await Promise.all(links.map(link => Document.isClosed(link.record_id)));\n" +
"        return closed.some(closed => closed);\n" +
"    }\n" +
"}\n" +
"\n" +
"class Balance {\n" +
"    constructor() {\n" +
"        this._CHQ = [];\n" +
"        this._reçu = [];\n" +
"        this._transaction = [];\n" +
"        this._autre = [];\n" +
"        this._error = [];\n" +
"        this.initialized = [];\n" +
"    }\n" +
"    toJSON() {\n" +
"        return this.initialized.reduce((json, key) => ({ ...json, [key]: this.get(key) }), {});\n" +
"    }\n" +
"    addCHQ(value) {\n" +
"        this.add(\"CHQ\", value);\n" +
"    }\n" +
"    addAutre(value) {\n" +
"        this.add(\"autre\", value);\n" +
"    }\n" +
"    addReçu(value) {\n" +
"        this.add(\"reçu\", value);\n" +
"    }\n" +
"    addTransaction(value) {\n" +
"        this.add(\"transaction\", value);\n" +
"    }\n" +
"    addError(value) {\n" +
"        this._error.push(value);\n" +
"    }\n" +
"    add(key, value) {\n" +
"        this.validKey(key);\n" +
"        if (!this.initialized.includes(key))\n" +
"            this.initialized.push(key);\n" +
"        if (value === null)\n" +
"            return;\n" +
"        if (typeof value !== \"number\")\n" +
"            throw TypeError(`value must be number, \"${typeof value}\" received`);\n" +
"        this[`_${key}`].push(value);\n" +
"    }\n" +
"    get CHQ() {\n" +
"        return this.get(\"CHQ\");\n" +
"    }\n" +
"    get autre() {\n" +
"        return this.get(\"autre\");\n" +
"    }\n" +
"    get reçu() {\n" +
"        return this.get(\"reçu\");\n" +
"    }\n" +
"    get transaction() {\n" +
"        return this.get(\"transaction\");\n" +
"    }\n" +
"    get error() {\n" +
"        return this._error.join(\"\\n" +
"\\n" +
"\");\n" +
"    }\n" +
"    get(key) {\n" +
"        this.validKey(key);\n" +
"        return this[`_${key}`].reduce((a, b) => a + b, 0);\n" +
"    }\n" +
"    hasCHQ() {\n" +
"        return this.has(\"CHQ\");\n" +
"    }\n" +
"    hasAutre() {\n" +
"        return this.has(\"autre\");\n" +
"    }\n" +
"    hasReçu() {\n" +
"        return this.has(\"reçu\");\n" +
"    }\n" +
"    hasTransaction() {\n" +
"        return this.has(\"transaction\");\n" +
"    }\n" +
"    has(key) {\n" +
"        this.validKey(key);\n" +
"        return this[`_${key}`].length > 0;\n" +
"    }\n" +
"    validKey(key) {\n" +
"        if (![\"transaction\", \"CHQ\", \"autre\", \"reçu\"].includes(key))\n" +
"            throw new ReferenceError(`La balance ne possède pas de cumul pour \"${key}\"`);\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * CacheListRecord is a cache that stores a list of records.\n" +
" * It extends CacheList and provides a simple interface to update one item.\n" +
" */\n" +
"class CacheListRecord extends CacheList {\n" +
"    updateItem(match, newValueOrCreate, create = true) {\n" +
"        let newValue;\n" +
"        if (typeof newValueOrCreate === 'object') {\n" +
"            newValue = newValueOrCreate;\n" +
"        }\n" +
"        else {\n" +
"            if (!('id' in match))\n" +
"                throw new ReferenceError('updating without match/newValue pair requires id property');\n" +
"            create = newValueOrCreate ?? true;\n" +
"            newValue = match;\n" +
"        }\n" +
"        this.load();\n" +
"        const oldValue = this.find(match);\n" +
"        if (oldValue) {\n" +
"            newValue = { ...oldValue, ...newValue };\n" +
"            this.data.splice(this.data.indexOf(oldValue), 1, newValue);\n" +
"            if (('id' in newValue) && newValue.id == getParam(location.href, 'id'))\n" +
"                this.debug('updateItem', { match, create, oldValue, newValue, stack: new Error('').stack });\n" +
"            this.emit('update', { oldValue, newValue });\n" +
"        }\n" +
"        else {\n" +
"            if (!create)\n" +
"                return;\n" +
"            this.data.push(newValue);\n" +
"            this.emit('add', { newValue });\n" +
"        }\n" +
"        this.save();\n" +
"        this.emit('change', this);\n" +
"        return oldValue;\n" +
"    }\n" +
"}\n" +
"\n" +
"class CacheStatus extends CacheListRecord {\n" +
"}\n" +
"\n" +
"const user = localStorage.getItem('user') ?? 'assistant';\n" +
"class Transaction extends ValidableDocument {\n" +
"    constructor(raw) {\n" +
"        super(raw);\n" +
"        this._raw = raw;\n" +
"        this.cacheStatus = CacheStatus.getInstance(\"transactionValidation\");\n" +
"    }\n" +
"    async getTransaction() {\n" +
"        if (!this._transaction) {\n" +
"            this._transaction = getTransaction(this.id);\n" +
"            this._transaction = await this._transaction;\n" +
"        }\n" +
"        if (this._transaction instanceof Promise)\n" +
"            return await this._transaction;\n" +
"        return this._transaction;\n" +
"    }\n" +
"    async getGroupedDocuments() {\n" +
"        return await super.getGroupedDocuments(this.isCurrent() ? 0 : void 0);\n" +
"    }\n" +
"    async getDMSLinks() {\n" +
"        return await super.getDMSLinks(\"Transaction\");\n" +
"    }\n" +
"    isCurrent() {\n" +
"        return String(this.id) === getParam(location.href, \"transaction_id\");\n" +
"    }\n" +
"    async getBalance() {\n" +
"        if (!this._balance) {\n" +
"            this._balance = new Promise(async (rs) => {\n" +
"                // balance déséquilibrée - version exigeante\n" +
"                const balance = new Balance();\n" +
"                const groupedDocuments = await this.getGroupedDocuments();\n" +
"                for (const gDocument of groupedDocuments) {\n" +
"                    if (this.isCurrent())\n" +
"                        this.debug(\"balance counting\", jsonClone({ gdoc: gDocument, balance }));\n" +
"                    const gdoc = await gDocument.getGdoc();\n" +
"                    const journal = await gDocument.getJournal();\n" +
"                    const coeff = gdoc.type === \"Invoice\" && journal.code === \"HA\" ? -1 : 1;\n" +
"                    const value = parseFloat(gdoc.amount) * coeff;\n" +
"                    if (gDocument.type === \"transaction\") {\n" +
"                        if (this.isCurrent())\n" +
"                            this.log(\"Balance: Transaction\", { balance, gdoc, value });\n" +
"                        balance.addTransaction(value);\n" +
"                    }\n" +
"                    else if (/ CERFA | AIDES - /u.test(gdoc.label)) {\n" +
"                        if (this.isCurrent())\n" +
"                            this.log(\"Balance: Reçu\", { balance, gdoc, value });\n" +
"                        balance.addReçu(value);\n" +
"                    }\n" +
"                    else if (/ CHQ(?:\\d|\\s)/u.test(gdoc.label)) {\n" +
"                        if (this.isCurrent())\n" +
"                            this.log(\"Balance: CHQ\", { balance, gdoc, value });\n" +
"                        balance.addCHQ(value);\n" +
"                    }\n" +
"                    else {\n" +
"                        if (this.isCurrent())\n" +
"                            this.log(\"Balance: Autre\", { balance, gdoc, value });\n" +
"                        balance.addAutre(value);\n" +
"                    }\n" +
"                }\n" +
"                const dmsLinks = await this.getDMSLinks();\n" +
"                dmsLinks.forEach((dmsLink) => {\n" +
"                    if (this.isCurrent())\n" +
"                        this.debug(\"balance counting\", jsonClone({ dmsLink, balance }));\n" +
"                    if (dmsLink.name.startsWith(\"CHQ\")) {\n" +
"                        const amount = dmsLink.name.match(/- (?<amount>[\\d \\.]*) ?€$/u)?.groups.amount;\n" +
"                        balance.addCHQ(parseFloat(amount ?? \"0\") * Math.sign(balance.transaction));\n" +
"                    }\n" +
"                    if (/^(?:CERFA|AIDES) /u.test(dmsLink.name)) {\n" +
"                        if (this.isCurrent())\n" +
"                            this.log(\"aide trouvée\", { dmsLink });\n" +
"                        const amount = dmsLink.name.match(/- (?<amount>[\\d \\.]*) ?€$/u)?.groups.amount;\n" +
"                        balance.addReçu(parseFloat(amount ?? \"0\") * Math.sign(balance.transaction));\n" +
"                    }\n" +
"                });\n" +
"                const ledgerEvents = await this.getLedgerEvents();\n" +
"                ledgerEvents.forEach((event) => {\n" +
"                    // pertes/gains de change\n" +
"                    if ([\"47600001\", \"656\", \"609\", \"756\", \"75800002\"].includes(event.planItem.number)) {\n" +
"                        balance.addAutre(parseFloat(event.amount) * -1);\n" +
"                    }\n" +
"                });\n" +
"                rs(balance);\n" +
"            });\n" +
"            this._balance = await this._balance;\n" +
"        }\n" +
"        if (this._balance instanceof Promise)\n" +
"            return await this._balance;\n" +
"        return this._balance;\n" +
"    }\n" +
"    async getStatus() {\n" +
"        const status = await super.getStatus();\n" +
"        this.cacheStatus.updateItem(status, false);\n" +
"        return status;\n" +
"    }\n" +
"    async loadValidMessage() {\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"loadValidMessage\", this);\n" +
"        const status = ((await this.isClosedCheck()) ??\n" +
"            (await this.isArchived()) ??\n" +
"            (await this.hasMalnammedDMSLink()) ??\n" +
"            (await this.is2025()) ??\n" +
"            (await this.hasVAT()) ??\n" +
"            (await this.isMissingBanking()) ??\n" +
"            (await this.hasToSendToInvoice()) ??\n" +
"            (await this.isUnbalanced()) ??\n" +
"            (await this.isMissingCounterpart()) ??\n" +
"            (await this.isWrongDonationCounterpart()) ??\n" +
"            (await this.isTrashCounterpart()) ??\n" +
"            (await this.hasUnbalancedThirdparty()) ??\n" +
"            //?? await this.isMissingAttachment() // déjà inclus dans isUnbalanced()\n" +
"            (await this.isOldUnbalanced()) ??\n" +
"            (await this.isBankFees()) ??\n" +
"            //?? await this.isAllodons()\n" +
"            //?? await this.isDonationRenewal()\n" +
"            (await this.isTransfer()) ??\n" +
"            (await this.isAid()) ??\n" +
"            (await this.hasToSendToDMS()) ??\n" +
"            \"OK\");\n" +
"        if (user !== \"assistant\")\n" +
"            return status;\n" +
"        const assistant = [\"orange\", \"envoyer les reçus en facturation\"];\n" +
"        if (assistant.some((needle) => status.includes(needle)) === (user === \"assistant\") || this.isCurrent())\n" +
"            return status;\n" +
"        return \"OK\";\n" +
"    }\n" +
"    async is2025() {\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"is2025\");\n" +
"        const doc = await this.getDocument();\n" +
"        if (doc.date.startsWith(\"2025\")) {\n" +
"            return (await this.isUnbalanced()) ?? (await this.isMissingAttachment()) ?? (await this.hasToSendToDMS()) ?? \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isClosedCheck() {\n" +
"        const closed = await Document.isClosed(this.id);\n" +
"        if (closed) {\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"fait partie d'un exercice clos\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isArchived() {\n" +
"        // Transaction archivée\n" +
"        const doc = await this.getDocument();\n" +
"        if (doc.archived) {\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"transaction archivée\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async hasMalnammedDMSLink() {\n" +
"        // Fichiers DMS mal nommés\n" +
"        const dmsLinks = await this.getDMSLinks();\n" +
"        for (const dmsLink of dmsLinks) {\n" +
"            const dmsItem = new DMSItem({ id: dmsLink.item_id });\n" +
"            const dmsStatus = await dmsItem.getValidMessage();\n" +
"            if (dmsStatus !== \"OK\")\n" +
"                return `Corriger les noms des fichiers attachés dans l'onglet \"Réconciliation\" (surlignés en orange)`;\n" +
"        }\n" +
"    }\n" +
"    async isMissingBanking() {\n" +
"        // Pas de rapprochement bancaire\n" +
"        const doc = await this.getDocument();\n" +
"        const recent = Date.now() - new Date(doc.date).getTime() < 86400000 * 30;\n" +
"        const isReconciled = await this.isReconciled();\n" +
"        if (!recent && !isReconciled) {\n" +
"            return `<a\n" +
"        title=\"Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FRapprochements%20bancaires\"\n" +
"      >Cette transaction n\\'est pas rattachée à un rapprochement bancaire ⓘ</a>`;\n" +
"        }\n" +
"        this.debug(\"loadValidMessage > rapprochement bancaire\", {\n" +
"            recent,\n" +
"            reconciled: this,\n" +
"        });\n" +
"    }\n" +
"    async hasUnbalancedThirdparty() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const thirdparties = ledgerEvents.reduce((tp, event) => {\n" +
"            const nb = event.planItem.number;\n" +
"            if (nb.startsWith(\"4\")) {\n" +
"                tp[nb] = (tp[nb] ?? []).concat(parseFloat(event.amount));\n" +
"            }\n" +
"            return tp;\n" +
"        }, {});\n" +
"        const [unbalanced, events] = Object.entries(thirdparties).find(([key, val]) => Math.abs(val.reduce((a, b) => a + b, 0)) > 0.001) ?? [];\n" +
"        if (unbalanced) {\n" +
"            this.log(\"hasUnbalancedThirdparty\", { ledgerEvents, thirdparties, unbalanced, events });\n" +
"            return `Le compte tiers \"${unbalanced}\" n'est pas équilibré.`;\n" +
"        }\n" +
"    }\n" +
"    async isUnbalanced() {\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"isUnbalanced\");\n" +
"        const balance = await this.getBalance();\n" +
"        if (this.isCurrent())\n" +
"            this.log({ balance });\n" +
"        let message = (await this.isCheckRemittance(balance)) ??\n" +
"            (await this.hasUnbalancedCHQ(balance)) ??\n" +
"            (await this.hasUnbalancedReceipt(balance)) ??\n" +
"            (await this.isOtherUnbalanced(balance));\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"balance:\", { balance, message, balanceJSON: balance.toJSON() });\n" +
"        if (message) {\n" +
"            return `<a\n" +
"        title=\"Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Balance%20v2#${escape(message)}\"\n" +
"      >Balance déséquilibrée: ${message} ⓘ</a><ul>${Object.entries(balance.toJSON())\n" +
"                .sort(([keya], [keyb]) => {\n" +
"                const keys = [\"transaction\", \"CHQ\", \"reçu\", \"autre\"];\n" +
"                return keys.indexOf(keya) - keys.indexOf(keyb);\n" +
"            })\n" +
"                .map(([key, value]) => `<li><strong>${key} :</strong>${value}${key !== \"transaction\" && balance.transaction && value !== balance.transaction\n" +
"                ? ` (diff : ${balance.transaction - value})`\n" +
"                : \"\"}</li>`)\n" +
"                .join(\"\")}</ul>`;\n" +
"        }\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"fin contrôle balance\", { message });\n" +
"    }\n" +
"    async isCheckRemittance(balance) {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith(\"6571\"));\n" +
"        // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa\n" +
"        if (doc.label.startsWith(\"REMISE CHEQUE \") || (aidLedgerEvent && doc.label.startsWith(\"CHEQUE \"))) {\n" +
"            // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa\n" +
"            // On a parfois des calculs qui ne tombent pas très juste en JS\n" +
"            if (Math.abs(balance.transaction - balance.reçu) > 0.001) {\n" +
"                balance.addReçu(null);\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"isCheckRemittance(): somme des reçus incorrecte\");\n" +
"                return \"La somme des reçus doit valoir le montant de la transaction\";\n" +
"            }\n" +
"            // On a parfois des calculs qui ne tombent pas très juste en JS\n" +
"            if (Math.abs(balance.transaction - balance.CHQ) > 0.001) {\n" +
"                const lost = doc.grouped_documents\n" +
"                    .find((gdoc) => gdoc.id === this.id)\n" +
"                    ?.client_comments?.find((comment) => comment.content === \"PHOTO CHEQUE PERDUE\");\n" +
"                if (!lost) {\n" +
"                    balance.addCHQ(null);\n" +
"                    if (this.isCurrent())\n" +
"                        this.log(\"isCheckRemittance(): somme des chèques incorrecte\");\n" +
"                    return \"La somme des chèques doit valoir le montant de la transaction\";\n" +
"                }\n" +
"                else {\n" +
"                    if (this.isCurrent())\n" +
"                        this.log(\"isCheckRemittance(): photo chèque perdue\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async hasUnbalancedCHQ(balance) {\n" +
"        if (balance.hasCHQ()) {\n" +
"            if (Math.abs(balance.CHQ - balance.transaction) > 0.001) {\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"hasUnbalancedCHQ(): somme des chèques incorrecte\");\n" +
"                return \"La somme des chèques doit valoir le montant de la transaction\";\n" +
"            }\n" +
"            if (Math.abs(balance.CHQ - balance.reçu) > 0.001) {\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"hasUnbalancedCHQ(): somme des reçus incorrecte\");\n" +
"                // sample: 1798997950\n" +
"                return \"La somme des reçus doit valoir celles des chèques\";\n" +
"            }\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"balance avec chèques équilibrée\", balance);\n" +
"            return \"\";\n" +
"        }\n" +
"    }\n" +
"    async hasUnbalancedReceipt(balance) {\n" +
"        if (balance.hasReçu()) {\n" +
"            if (Math.abs(balance.reçu - balance.transaction) > 0.001) {\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"hasUnbalancedReceipt(): somme des reçus incorrecte\");\n" +
"                return \"La somme des reçus doit valoir le montant de la transaction\";\n" +
"            }\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"balance avec reçus équilibrée\", balance);\n" +
"            return \"\";\n" +
"        }\n" +
"    }\n" +
"    async isOtherUnbalanced(balance) {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const optionalProof = [\n" +
"            \"58000004\", // Virements internes société générale\n" +
"            \"58000001\", // Virements internes Stripe\n" +
"            \"754110002\", // Dons Manuels - Stripe\n" +
"            \"754110001\", // Dons Manuels - Allodons\n" +
"            \"6270005\", // Frais Bancaires Société Générale\n" +
"            \"6270001\", // Frais Stripe\n" +
"        ];\n" +
"        if (ledgerEvents.some((line) => optionalProof.some((number) => line.planItem.number === number))) {\n" +
"            if (this.isCurrent())\n" +
"                this.debug(\"isOtherUnbalanced: justificatif facultatif\");\n" +
"            return;\n" +
"        }\n" +
"        // perte de reçu acceptable pour les petites dépenses, mais pas récurrents\n" +
"        const requiredProof = [\"DE: GOCARDLESS\"];\n" +
"        if (Math.abs(balance.transaction) < 100 &&\n" +
"            balance.transaction < 0 &&\n" +
"            !balance.hasAutre() &&\n" +
"            !requiredProof.some((label) => doc.label.includes(label))) {\n" +
"            if (this.isCurrent())\n" +
"                this.debug(\"isOtherUnbalanced: petit montant non récurrent\");\n" +
"            return;\n" +
"        }\n" +
"        if (Math.abs(balance.transaction - balance.autre) > 0.001) {\n" +
"            balance.addAutre(null);\n" +
"            return \"La somme des autres justificatifs doit valoir le montant de la transaction\";\n" +
"        }\n" +
"        if (this.isCurrent())\n" +
"            this.debug(\"isOtherUnbalanced: balance équilibrée\");\n" +
"    }\n" +
"    async hasVAT() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        // Les associations ne gèrent pas la TVA\n" +
"        if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"445\"))) {\n" +
"            return \"Une écriture comporte un compte de TVA\";\n" +
"        }\n" +
"    }\n" +
"    async isTrashCounterpart() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        if (ledgerEvents.find((line) => line.planItem.number === \"6288\")) {\n" +
"            return \"Une ligne d'écriture comporte le numéro de compte 6288\";\n" +
"        }\n" +
"    }\n" +
"    async isMissingCounterpart() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        if (ledgerEvents.find((line) => line.planItem.number === \"4716001\")) {\n" +
"            return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations.\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20attribu%C3%A9e%20%C3%A0%20un%20compte%20d'attente\"\n" +
"          >Une ligne d'écriture utilise un compte d'attente: 4716001 ⓘ</a>`;\n" +
"        }\n" +
"        if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"47\") && line.planItem.number !== \"47600001\")) {\n" +
"            return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations.\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20attribu%C3%A9e%20%C3%A0%20un%20compte%20d'attente\"\n" +
"          >Une écriture comporte un compte d\\'attente (commençant par 47) ⓘ</a>`;\n" +
"        }\n" +
"    }\n" +
"    async isWrongDonationCounterpart() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await Promise.all((await this.getGroupedDocuments()).map((doc) => doc.getGdoc()));\n" +
"        const dmsLinks = await this.getDMSLinks();\n" +
"        const isDonation = groupedDocuments.some((gdoc) => / CERFA | AIDES - /u.test(gdoc.label)) ||\n" +
"            dmsLinks.some((dmsLink) => /^(?:CERFA|AIDES) /u.test(dmsLink.name));\n" +
"        const donationCounterparts = [\n" +
"            \"75411\", // Dons manuels\n" +
"            \"6571\", // Aides financières accordées à un particulier\n" +
"            \"6571002\", // Don versé à une autre association\n" +
"        ];\n" +
"        if (isDonation && !ledgerEvents.some((line) => donationCounterparts.includes(line.planItem.number))) {\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"La contrepartie devrait faire partie de cette liste\", { ledgerEvents, donationCounterparts });\n" +
"            return `La contrepartie devrait faire partie de cette liste (onglet \"Écritures\")<ul><li>${donationCounterparts.join(\"</li><li>\")}</li></ul>`;\n" +
"        }\n" +
"    }\n" +
"    async isOldUnbalanced() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        // balance déséquilibrée\n" +
"        const third = ledgerEvents.find((line) => line.planItem.number.startsWith(\"40\"))?.planItem?.number;\n" +
"        if (third) {\n" +
"            const thirdEvents = ledgerEvents.filter((line) => line.planItem.number === third);\n" +
"            const balance = thirdEvents.reduce((sum, line) => sum + parseFloat(line.amount), 0);\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"loadValidMessage: Balance\", Math.abs(balance) > 0.001 ? \"déséquilibrée\" : \"OK\", this);\n" +
"            // On a parfois des calculs qui ne tombent pas très juste en JS\n" +
"            //if (Math.abs(balance) > 0.001) {\n" +
"            if (Math.abs(balance) > 100) {\n" +
"                return `Balance déséquilibrée avec Tiers spécifié : ${balance}`;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async isMissingAttachment() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const dmsLinks = await this.getDMSLinks();\n" +
"        // Justificatif manquant\n" +
"        if (!ledgerEvents.some((levent) => levent.closed) && // Exercice clos\n" +
"            Math.abs(parseFloat(doc.currency_amount)) >= 100) ;\n" +
"        const attachmentOptional = \n" +
"        // Justificatif pas exigé pour les petits montants\n" +
"        (!this.isCurrent() && Math.abs(parseFloat(doc.currency_amount)) < 100) ||\n" +
"            [\" DE: STRIPE MOTIF: ALLODONS REF: \", \"Payout: STRIPE PAYOUT \"].some((label) => doc.label.includes(label)) ||\n" +
"            [\"REMISE CHEQUE \", \"VIR RECU \", \"VIR INST RE \", \"VIR INSTANTANE RECU DE: \"].some((label) => doc.label.startsWith(label));\n" +
"        const attachmentRequired = doc.attachment_required && !doc.attachment_lost && (!attachmentOptional || this.isCurrent());\n" +
"        const hasAttachment = groupedDocuments.length + dmsLinks.length > 1;\n" +
"        if (this.isCurrent())\n" +
"            this.log({ attachmentOptional, attachmentRequired, groupedDocuments, hasAttachment });\n" +
"        if (attachmentRequired && !hasAttachment)\n" +
"            return \"Justificatif manquant\";\n" +
"    }\n" +
"    async isBankFees() {\n" +
"        return await this.isIntlTransferFees();\n" +
"        //?? await this.isStripeFees()\n" +
"    }\n" +
"    async isIntlTransferFees() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        if (doc.label.startsWith(\"FRAIS VIR INTL ELEC \")) {\n" +
"            if (ledgerEvents.length !== 2 ||\n" +
"                groupedDocuments.length > 1 ||\n" +
"                ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"                !ledgerEvents.find((ev) => ev.planItem.number === \"6270005\"))\n" +
"                return \"Frais bancaires SG mal attribué (=> 6270005)\";\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"frais bancaires OK\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isStripeFees() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        if (doc.label.startsWith(\"Fee: Billing - Usage Fee (\")) {\n" +
"            if (ledgerEvents.length !== 2 ||\n" +
"                groupedDocuments.length > 1 ||\n" +
"                ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"                !ledgerEvents.find((ev) => ev.planItem.number === \"6270001\"))\n" +
"                return \"Frais Stripe mal attribués (=>6270001)\";\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"frais bancaires Stripe OK\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isAllodons() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        if (doc.label.includes(\" DE: STRIPE MOTIF: ALLODONS REF: \")) {\n" +
"            if (ledgerEvents.length !== 2 ||\n" +
"                groupedDocuments.length > 1 ||\n" +
"                ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"                !ledgerEvents.find((ev) => ev.planItem.number === \"754110001\"))\n" +
"                return \"Virement Allodons mal attribué (=>754110001)\";\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"virement allodon OK\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isDonationRenewal() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        if (doc.label.startsWith(\"Charge: \")) {\n" +
"            if (ledgerEvents.length !== 3 ||\n" +
"                groupedDocuments.length > 1 ||\n" +
"                ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"                !ledgerEvents.find((ev) => ev.planItem.number === \"6270001\") ||\n" +
"                !ledgerEvents.find((ev) => ev.planItem.number === \"754110002\"))\n" +
"                return \"Renouvellement de don mal attribués\";\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"Renouvellement de don OK\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isTransfer() {\n" +
"        const doc = await this.getDocument();\n" +
"        if ([\"VIR \", \"Payout: \"].some((label) => doc.label.startsWith(label))) {\n" +
"            return await this.isStripeInternalTransfer();\n" +
"            // ?? await this.isAssociationDonation()\n" +
"            // ?? await this.isOptionalReceiptDonation() // Les CERFAs ne sont pas optionel, seul leur envoi au donateur peut l'être\n" +
"            // ?? await this.isNormalDonation()          // inclus dans la balance\n" +
"        }\n" +
"    }\n" +
"    async isStripeInternalTransfer() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        if ([\n" +
"            \" DE: Stripe Technology Europe Ltd MOTIF: STRIPE \",\n" +
"            \" DE: STRIPE MOTIF: STRIPE REF: STRIPE-\",\n" +
"            \"Payout: STRIPE PAYOUT (\",\n" +
"        ].some((label) => doc.label.includes(label))) {\n" +
"            if (ledgerEvents.length !== 2 ||\n" +
"                groupedDocuments.length > 1 ||\n" +
"                ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"                !ledgerEvents.find((ev) => ev.planItem.number === \"58000001\"))\n" +
"                return \"Virement interne Stripe mal attribué (=>58000001)\";\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"virement interne Stripe OK\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isAssociationDonation() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const assos = [\n" +
"            \" DE: ALEF.ASSOC ETUDE ENSEIGNEMENT FO\",\n" +
"            \" DE: ASS UNE LUMIERE POUR MILLE\",\n" +
"            \" DE: COLLEL EREV KINIAN AVRAM (C E K \",\n" +
"            \" DE: ESPACE CULTUREL ET UNIVERSITAIRE \",\n" +
"            \" DE: JEOM MOTIF: \",\n" +
"            \" DE: MIKDACH MEAT \",\n" +
"            \" DE: YECHIVA AZ YACHIR MOCHE MOTIF: \",\n" +
"            \" DE: ASSOCIATION BEER MOTIF: \",\n" +
"        ];\n" +
"        if (assos.some((label) => doc.label.includes(label))) {\n" +
"            if (ledgerEvents.length !== 2 ||\n" +
"                groupedDocuments.length > 1 ||\n" +
"                ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"                !ledgerEvents.find((ev) => ev.planItem.number === \"75411\"))\n" +
"                return \"Virement reçu d'une association mal attribué\";\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"virement reçu d'une association OK\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isOptionalReceiptDonation() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const sansCerfa = [\n" +
"            \" DE: MONSIEUR FABRICE HARARI MOTIF: \",\n" +
"            \" DE: MR ET MADAME DENIS LEVY\",\n" +
"            \" DE: Zacharie Mimoun \",\n" +
"            \" DE: M OU MME MIMOUN ZACHARIE MOTIF: \",\n" +
"        ];\n" +
"        if (sansCerfa.some((label) => doc.label.includes(label))) {\n" +
"            if (ledgerEvents.length !== 2 ||\n" +
"                groupedDocuments.length > 1 ||\n" +
"                ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"                !ledgerEvents.find((ev) => ev.planItem.number === \"75411\"))\n" +
"                return \"Virement reçu avec CERFA optionel mal attribué (=>75411)\";\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"Virement reçu avec CERFA optionel OK\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isNormalDonation() {\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        if (gdocs.length < 2) {\n" +
"            return `<a\n" +
"        title=\"Ajouter le CERFA dans les pièces de réconciliation. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Virement%20re%C3%A7u%20sans%20justificatif\"\n" +
"      >Virement reçu sans justificatif ⓘ</a>`;\n" +
"        }\n" +
"        if (!gdocs.find((gdoc) => gdoc.label.includes(\"CERFA\"))) {\n" +
"            return \"Les virements reçus doivent être justifiés par un CERFA\";\n" +
"        }\n" +
"    }\n" +
"    async isAid() {\n" +
"        // Aides octroyées\n" +
"        return ((await this.isAssociationAid()) ??\n" +
"            (await this.isMissingBeneficiaryName()) ??\n" +
"            (await this.isMissingCounterpartLabel()));\n" +
"    }\n" +
"    async isAssociationAid() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith(\"6571\"));\n" +
"        if (aidLedgerEvent?.planItem.number === \"6571002\") ;\n" +
"    }\n" +
"    async isMissingBeneficiaryName() {\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith(\"6571\"));\n" +
"        if (aidLedgerEvent && !aidLedgerEvent.label) {\n" +
"            // Aides octroyées sans label\n" +
"            return `<a\n" +
"        title=\"Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#nom%20du%20bénéficiaire%20manquant%20dans%20l'écriture%20%226571%22\"\n" +
"      >nom du bénéficiaire manquant dans l\\'écriture \"6571\" ⓘ</a>`;\n" +
"        }\n" +
"    }\n" +
"    async isMissingCounterpartLabel() {\n" +
"        const doc = await this.getDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith(\"6571\"));\n" +
"        if (!aidLedgerEvent && parseFloat(doc.amount) < 0) {\n" +
"            for (const gdoc of gdocs) {\n" +
"                if (gdoc.type !== \"Invoice\")\n" +
"                    continue;\n" +
"                const { thirdparty_id } = await new Document(gdoc).getDocument();\n" +
"                // Aides octroyées à une asso ou un particulier\n" +
"                if ([106438171, 114270419].includes(thirdparty_id)) {\n" +
"                    // Aides octroyées sans compte d'aide\n" +
"                    return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations.\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#contrepartie%20%226571%22%20manquante\"\n" +
"          >contrepartie \"6571\" manquante ⓘ</a>`;\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async hasToSendToDMS() {\n" +
"        const balance = await this.getBalance();\n" +
"        if (balance.CHQ &&\n" +
"            balance.CHQ === balance.transaction &&\n" +
"            (balance.autre === balance.transaction || balance.reçu === balance.transaction)) {\n" +
"            const groupedDocuments = await this.getGroupedDocuments();\n" +
"            const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"            const chqs = gdocs.filter((gdoc) => gdoc.label.includes(\" - CHQ\"));\n" +
"            this.log(\"hasToSendToDMS\", { groupedDocuments, chqs, balance });\n" +
"            if (!chqs.length) {\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"hasToSendToDMS\", \"tous les chq sont en GED\", { groupedDocuments, balance });\n" +
"                return;\n" +
"            }\n" +
"            return \"envoyer les CHQs en GED\";\n" +
"        }\n" +
"    }\n" +
"    async hasToSendToInvoice() {\n" +
"        const balance = await this.getBalance();\n" +
"        if (balance.reçu) {\n" +
"            const dmsLinks = await this.getDMSLinks();\n" +
"            const receipts = dmsLinks.filter((link) => [\"CERFA\", \"AIDES\"].some((key) => link.name.startsWith(key)));\n" +
"            this.log(\"hasToSendToInvoice\", { dmsLinks, receipts, balance });\n" +
"            if (!receipts.length) {\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"hasToSendToInvoice\", \"tous les reçus sont en facturation\", {\n" +
"                        groupedDocuments: dmsLinks,\n" +
"                        balance,\n" +
"                    });\n" +
"                return;\n" +
"            }\n" +
"            return \"envoyer les reçus en facturation\";\n" +
"        }\n" +
"    }\n" +
"    /** Add item to this transaction's group */\n" +
"    async groupAdd(id) {\n" +
"        const doc = await this.getDocument();\n" +
"        const groups = doc.group_uuid;\n" +
"        const docMatchResp = await documentMatching({ id, groups });\n" +
"        this.debug(\"groupAdd\", { docMatchResp });\n" +
"        if (docMatchResp?.id !== id)\n" +
"            await createDMSLink(id, this.id, \"Transaction\");\n" +
"    }\n" +
"}\n" +
"\n" +
"function openInTab(url, options = {}) {\n" +
"    document.body.appendChild(parseHTML(`<div\n" +
"      class=\"open_tab\"\n" +
"      data-url=\"${escape(url)}\"\n" +
"      data-options=\"${escape(JSON.stringify(options))}\"\n" +
"      style=\"display: none;\"\n" +
"    ></div>`));\n" +
"}\n" +
"\n" +
"function openDocument(documentId) {\n" +
"    const url = new URL(location.href.replace(/accountants.*$/, `documents/${documentId}.html`));\n" +
"    openInTab(url.toString(), { insert: false });\n" +
"}\n" +
"\n" +
"function uniquid(length = 20) {\n" +
"    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';\n" +
"    let id = '';\n" +
"    for (let i = 0; i < length; i++) {\n" +
"        id += chars.charAt(Math.floor(Math.random() * chars.length));\n" +
"    }\n" +
"    return id;\n" +
"}\n" +
"\n" +
"class Tooltip {\n" +
"    constructor({ target }) {\n" +
"        this.id = `T${uniquid()}`;\n" +
"        this.target = target;\n" +
"        this.createContainer();\n" +
"        setInterval(() => { this.setPos(); }, 200);\n" +
"    }\n" +
"    static make({ target, text }) {\n" +
"        const tooltip = new Tooltip({ target });\n" +
"        if (text)\n" +
"            tooltip.setText(text);\n" +
"        return tooltip;\n" +
"    }\n" +
"    /**\n" +
"     * Create the tooltip DOM and append it to the page\n" +
"     */\n" +
"    createContainer() {\n" +
"        document.body.appendChild(parseHTML(`<div\n" +
"      style=\"display: none; position: absolute; inset: 0px auto auto 0px;\"\n" +
"      role=\"tooltip\"\n" +
"      x-placement=\"bottom\"\n" +
"      class=\"sc-ghWlax esvpOe fade show tooltip bs-tooltip-bottom\"\n" +
"      id=\"${this.id}\"\n" +
"      data-popper-reference-hidden=\"false\"\n" +
"      data-popper-escaped=\"false\"\n" +
"      data-popper-placement=\"bottom\"\n" +
"    >\n" +
"      <div class=\"arrow\" style=\"position: absolute; left: 0px; transform: translate(33.5px);\"></div>\n" +
"      <div class=\"tooltip-inner\"></div>\n" +
"    </div>`));\n" +
"        this.target.setAttribute('aria-labelledby', this.id);\n" +
"        this.target.addEventListener('mouseenter', () => {\n" +
"            $(`#${this.id}`).style.display = 'unset';\n" +
"        });\n" +
"        this.target.addEventListener('mouseleave', () => {\n" +
"            $(`#${this.id}`).style.display = 'none';\n" +
"        });\n" +
"    }\n" +
"    /**\n" +
"     * Set the text for the tooltip\n" +
"     */\n" +
"    setText(text, html = false) {\n" +
"        const inner = $(`#${this.id} .tooltip-inner`);\n" +
"        if (!inner)\n" +
"            throw new Error('Unable to find tooltip container');\n" +
"        if (html) {\n" +
"            inner.innerHTML = text;\n" +
"        }\n" +
"        else {\n" +
"            inner.innerText = text;\n" +
"        }\n" +
"    }\n" +
"    /**\n" +
"     * Get the tooltip HTML text\n" +
"     */\n" +
"    getHTML() {\n" +
"        const inner = $(`#${this.id} .tooltip-inner`);\n" +
"        return inner.innerHTML;\n" +
"    }\n" +
"    /**\n" +
"     * Move the tooltip at good position to point visually the target\n" +
"     */\n" +
"    setPos() {\n" +
"        const tooltip = $(`#${this.id}`);\n" +
"        const arrow = $('.arrow', tooltip);\n" +
"        if (tooltip.style.display === 'none')\n" +
"            return;\n" +
"        const targetRect = this.target.getBoundingClientRect();\n" +
"        const tooltipRect = tooltip.getBoundingClientRect();\n" +
"        const arrowRect = arrow.getBoundingClientRect();\n" +
"        const targetWidth = targetRect.right - targetRect.left;\n" +
"        const tooltipWidth = tooltipRect.right - tooltipRect.left;\n" +
"        const arrowWidth = arrowRect.right - arrowRect.left;\n" +
"        const arrowTransform = `translate(${Math.round(10 * ((tooltipWidth / 2) - (arrowWidth / 2))) / 10}px)`;\n" +
"        if (arrow.style.transform !== arrowTransform) {\n" +
"            arrow.style.transform = arrowTransform;\n" +
"        }\n" +
"        const tooltipTransform = `translate(${Math.round(10 * (targetRect.left + (targetWidth / 2) - (tooltipWidth / 2))) / 10}px, ${Math.round(10 * targetRect.bottom) / 10}px)`;\n" +
"        if (tooltip.style.transform !== tooltipTransform) {\n" +
"            tooltip.style.transform = tooltipTransform;\n" +
"        }\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * CacheRecord is a cache that stores a record of data.\n" +
" * It extends Cache and provides a simple interface to get, set and has.\n" +
" */\n" +
"class CacheRecord extends Cache {\n" +
"    parse(data) {\n" +
"        const value = JSON.parse(data);\n" +
"        if (!value || typeof value !== 'object')\n" +
"            throw new Error('The given value does not parse as an Object.');\n" +
"        return value;\n" +
"    }\n" +
"    /**\n" +
"     * Returns the value of the specified key\n" +
"     */\n" +
"    get(key) {\n" +
"        return this.data[key];\n" +
"    }\n" +
"    /**\n" +
"     * Update one item\n" +
"     *\n" +
"     * @return Old value\n" +
"     */\n" +
"    set(key, valueOrCb) {\n" +
"        const oldValue = this.get(key);\n" +
"        const newValue = valueOrCb instanceof Function ? valueOrCb(oldValue) : valueOrCb;\n" +
"        this.data[key] = newValue;\n" +
"        this.emit('update', { oldValue, newValue });\n" +
"        this.save();\n" +
"        this.emit('change', this);\n" +
"        return oldValue;\n" +
"    }\n" +
"    /**\n" +
"     * Check if the record has a specific key\n" +
"     *\n" +
"     * @param key The key to check\n" +
"     * @return True if the record has the key\n" +
"     */\n" +
"    has(key) {\n" +
"        return key in this.data;\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * Autolaunch some service at the first user interaction\n" +
" */\n" +
"class Autostarter extends Logger {\n" +
"    constructor(parent) {\n" +
"        super(`${parent.constructor.name}_Autostart`);\n" +
"        this.eventList = ['click', 'keyup', 'keydown', 'keypress', 'mouseup'];\n" +
"        /**\n" +
"         * @property stopped Flag moved to true by the stop() method\n" +
"         */\n" +
"        this.stopped = false;\n" +
"        this.parent = parent;\n" +
"        this.config = new CacheRecord(`${this.parent.id}-autostart`, { enabled: true });\n" +
"        this.start = this.start.bind(this);\n" +
"        this.init();\n" +
"    }\n" +
"    /**\n" +
"     * Async init routines\n" +
"     */\n" +
"    async init() {\n" +
"        this.attachEvents();\n" +
"        this.appendDisableButton();\n" +
"    }\n" +
"    /**\n" +
"     * Attach interaction events to the browser page\n" +
"     */\n" +
"    attachEvents() {\n" +
"        this.eventList.forEach(event => {\n" +
"            document.addEventListener(event, this.start);\n" +
"        });\n" +
"    }\n" +
"    /**\n" +
"     * Detach interaction events from the browser\n" +
"     */\n" +
"    detachEvents() {\n" +
"        this.eventList.forEach(event => {\n" +
"            document.removeEventListener(event, this.start);\n" +
"        });\n" +
"    }\n" +
"    /**\n" +
"     * Add button for enabling / disabling this autostart behavior\n" +
"     */\n" +
"    appendDisableButton() {\n" +
"        const buttonId = `${this.parent.id}-autostart-enable-disable`;\n" +
"        this.parent.container.appendChild(parseHTML(`<button\n" +
"      type=\"button\"\n" +
"      class=\"${getButtonClassName()}\"\n" +
"      id=\"${buttonId}\"\n" +
"      style=\"font-family: initial;\"\n" +
"    ></button>`));\n" +
"        const button = $(`#${buttonId}`, this.parent.container);\n" +
"        const tooltip = Tooltip.make({ target: button });\n" +
"        button.addEventListener('click', () => {\n" +
"            this.config.set('enabled', oldValue => !oldValue);\n" +
"        });\n" +
"        let lastVal = null;\n" +
"        const setText = () => {\n" +
"            const enabled = this.config.get('enabled');\n" +
"            if (enabled === lastVal)\n" +
"                return;\n" +
"            lastVal = enabled;\n" +
"            if (enabled) {\n" +
"                button.innerText = '⏹';\n" +
"                tooltip.setText('Stopper l\\'ouverture automatique');\n" +
"            }\n" +
"            else {\n" +
"                button.innerText = '⏵';\n" +
"                tooltip.setText('Activer l\\'ouverture automatique');\n" +
"            }\n" +
"        };\n" +
"        setText();\n" +
"        this.config.on('change', setText);\n" +
"        this.debug({ me: this, button, tooltip });\n" +
"    }\n" +
"    /**\n" +
"     * Callback for autostart events\n" +
"     *\n" +
"     * `this` keyword is bounded at constructor\n" +
"     */\n" +
"    start() {\n" +
"        if (this.config.get('enabled') && !this.stopped)\n" +
"            this.parent.start();\n" +
"    }\n" +
"    /**\n" +
"     * Stop all watchers\n" +
"     */\n" +
"    stop() {\n" +
"        this.stopped = true;\n" +
"        this.detachEvents();\n" +
"    }\n" +
"}\n" +
"\n" +
"var styles = \".open-next-invalid-btn .number .waiting {\\n" +
"  background: var(--blue);\\n" +
"  color: white;\\n" +
"  padding: 0 0.2em;\\n" +
"}\\n" +
"\\n" +
".open-next-invalid-btn .number .ignored {\\n" +
"  background: var(--red);\\n" +
"  color: white;\\n" +
"  padding: 0 0.2em;\\n" +
"}\\n" +
"\";\n" +
"\n" +
"function injectStyles(css, id) {\n" +
"    const style = document.createElement('style');\n" +
"    style.textContent = css;\n" +
"    document.head.appendChild(style);\n" +
"}\n" +
"\n" +
"injectStyles(styles);\n" +
"class OpenNextInvalid extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.container = document.createElement('div');\n" +
"        this.running = false;\n" +
"        this.spinner = {\n" +
"            //frames: '🕛 🕧 🕐 🕜 🕑 🕝 🕒 🕞 🕓 🕟 🕔 🕠 🕕 🕡 🕖 🕢 🕗 🕣 🕘 🕤 🕙 🕥 🕚 🕦'.split(' '),\n" +
"            //frames: '🕛 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚'.split(' '),\n" +
"            frames: '⢎⡰ ⢎⡡ ⢎⡑ ⢎⠱ ⠎⡱ ⢊⡱ ⢌⡱ ⢆⡱'.split(' '),\n" +
"            interval: 200,\n" +
"        };\n" +
"    }\n" +
"    async init() {\n" +
"        this.log('init');\n" +
"        this.start = this.start.bind(this);\n" +
"        this.loadCurrent();\n" +
"        this.appendOpenNextButton();\n" +
"        setInterval(() => { this.setSpinner(); }, this.spinner.interval);\n" +
"        this.allowIgnoring();\n" +
"        this.allowWaiting();\n" +
"        this.autostart = new Autostarter(this);\n" +
"        this.invalidGenerator = this.loadInvalid();\n" +
"        this.firstLoading();\n" +
"        window.addEventListener('beforeunload', event => {\n" +
"            if (this.running) {\n" +
"                this.log(\"Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert.\");\n" +
"                event.returnValue = \"Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert. Voulez-vous vraiment continuer ?\";\n" +
"                const modal = parseHTML(`\n" +
"          <div class=\"modal\" style=\"display: block;padding: 10em; background-color: #DDDD;\">\n" +
"            <div class=\"modal-content\" style=\"max-width: 40em;\">\n" +
"              <div class=\"modal-header\">\n" +
"                <h2>Confirmation</h2>\n" +
"              </div>\n" +
"              <div class=\"modal-body\">\n" +
"                <p>Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert. Voulez-vous vraiment continuer ?</p>\n" +
"              </div>\n" +
"            </div>\n" +
"          </div>\n" +
"        `).firstElementChild;\n" +
"                document.body.appendChild(modal);\n" +
"                event.preventDefault();\n" +
"                setTimeout(() => { modal.remove(); }, 100);\n" +
"            }\n" +
"        });\n" +
"    }\n" +
"    /**\n" +
"     * Load current item ID\n" +
"     */\n" +
"    loadCurrent() {\n" +
"        this.current = Number(getParam(location.href, this.idParamName));\n" +
"        setInterval(() => {\n" +
"            const current = Number(getParam(location.href, this.idParamName));\n" +
"            if (current === this.current)\n" +
"                return;\n" +
"            this.current = current;\n" +
"            this.emit('reload', current);\n" +
"        });\n" +
"    }\n" +
"    /**\n" +
"     * Start action\n" +
"     *\n" +
"     * `this` keyword is bounded at constructor\n" +
"     */\n" +
"    start(interactionAllowed) {\n" +
"        if (this.running)\n" +
"            return;\n" +
"        this.autostart.stop();\n" +
"        this.running = true;\n" +
"        setTimeout(() => this.openNext(interactionAllowed === true), 0);\n" +
"    }\n" +
"    /**\n" +
"     * Append the button for open next to the DOM\n" +
"     */\n" +
"    appendOpenNextButton() {\n" +
"        this.container.appendChild(parseHTML(`<button type=\"button\" class=\"${getButtonClassName()} open-next-invalid-btn\">&nbsp;\n" +
"        <span class=\"icon\" style=\"font-family: monospace;\">&gt;</span>&nbsp;\n" +
"        <span class=\"number\">\n" +
"          <span class=\"invalid\" title=\"nombre d'éléments invalides\"></span>|\n" +
"          <span class=\"waiting\" title=\"nombre d'éléments temporairement ignorés\"></span>|\n" +
"          <span class=\"ignored\" title=\"nombre d'éléments ignorés\"></span>\n" +
"        </span>\n" +
"      </button>`.trim().replace(/\\n" +
"\\s*/g, '')));\n" +
"        const button = $(`.open-next-invalid-btn`, this.container);\n" +
"        button.addEventListener('click', this.start.bind(this, true));\n" +
"        Tooltip.make({ target: button, text: 'Ouvrir le prochain élément invalide' });\n" +
"        this.reloadNumber();\n" +
"        this.cache.on('change', () => this.reloadNumber());\n" +
"    }\n" +
"    /**\n" +
"     * Set the number display on openNextInvalid button\n" +
"     */\n" +
"    reloadNumber() {\n" +
"        const count = this.cache.reduce((acc, status) => {\n" +
"            if (status.ignored)\n" +
"                return { ...acc, ignored: acc.ignored + 1 };\n" +
"            if (status.wait && (new Date(status.wait).getTime() > Date.now()))\n" +
"                return { ...acc, waiting: acc.waiting + 1 };\n" +
"            if (!status.valid)\n" +
"                return { ...acc, invalid: acc.invalid + 1 };\n" +
"            return acc;\n" +
"        }, { invalid: 0, waiting: 0, ignored: 0 });\n" +
"        const button = $(`.open-next-invalid-btn`, this.container);\n" +
"        const number = $('.number', button);\n" +
"        Object.entries(count).forEach(([key, value]) => {\n" +
"            const span = $(`.${key}`, number);\n" +
"            if (!span) {\n" +
"                this.log(`Unable to find the \"${key}\" number span`, { button, number });\n" +
"                return;\n" +
"            }\n" +
"            span.innerText = `${value}`;\n" +
"        });\n" +
"    }\n" +
"    /**\n" +
"     * Create next invalid generator\n" +
"     */\n" +
"    async *loadInvalid() {\n" +
"        // verifier le cache\n" +
"        let cached = this.cache.filter({ valid: false }).sort((a, b) => a.date - b.date);\n" +
"        for (const cachedItem of cached) {\n" +
"            if (this.isSkipped(cachedItem)) {\n" +
"                if (!cachedItem?.valid)\n" +
"                    this.log('skip', cachedItem);\n" +
"                continue;\n" +
"            }\n" +
"            /**\n" +
"            const status = cachedItem;\n" +
"            this.updateStatus(cachedItem.id).then((updatedStatus) => {\n" +
"              if (this.isSkipped(updatedStatus) || updatedStatus.valid) {\n" +
"                this.start();\n" +
"              }\n" +
"            });\n" +
"            /*/\n" +
"            const status = await this.updateStatus(cachedItem.id);\n" +
"            if (this.isSkipped(status)) {\n" +
"                if (!status?.valid)\n" +
"                    this.log('skip', status);\n" +
"                continue;\n" +
"            }\n" +
"            /**/\n" +
"            yield status;\n" +
"        }\n" +
"        // verifier les entrées non encore chargées\n" +
"        for await (const item of this.walk()) {\n" +
"            const status = await this.updateStatus(item);\n" +
"            if (this.isSkipped(status)) {\n" +
"                if (!status?.valid)\n" +
"                    this.log('skip', status);\n" +
"                continue;\n" +
"            }\n" +
"            yield status;\n" +
"        }\n" +
"        // verifier les plus anciennes entrées\n" +
"        const dateRef = Date.now() - (3 * 86400000);\n" +
"        let item = this.cache.find(cachedItem => cachedItem.fetchedAt < dateRef);\n" +
"        while (item) {\n" +
"            const status = await this.updateStatus(item);\n" +
"            if (this.isSkipped(status)) {\n" +
"                if (!status?.valid)\n" +
"                    this.log('skip', status);\n" +
"            }\n" +
"            else {\n" +
"                yield status;\n" +
"            }\n" +
"            item = this.cache.find(cachedItem => cachedItem.fetchedAt < dateRef);\n" +
"        }\n" +
"    }\n" +
"    isSkipped(status) {\n" +
"        if (!status)\n" +
"            return true;\n" +
"        if (status.valid)\n" +
"            return true;\n" +
"        if (status.ignored)\n" +
"            return true;\n" +
"        if (status.wait && (new Date(status.wait).getTime() > Date.now()))\n" +
"            return true;\n" +
"        return false;\n" +
"    }\n" +
"    /**\n" +
"     * Update status of an item given by its ID\n" +
"     */\n" +
"    async updateStatus(id, value) {\n" +
"        if ('number' !== typeof id) {\n" +
"            id = id.id;\n" +
"        }\n" +
"        if (!value)\n" +
"            value = await this.getStatus(id);\n" +
"        if (!value) {\n" +
"            this.cache.delete({ id });\n" +
"            return null;\n" +
"        }\n" +
"        const oldStatus = this.cache.find({ id }) ?? {};\n" +
"        const status = Object.assign({}, oldStatus, value, { fetchedAt: Date.now() });\n" +
"        if (isNaN(status.createdAt)) {\n" +
"            this.log({ value, id, oldStatus, status });\n" +
"            throw new Error('status.createdAt must be number');\n" +
"        }\n" +
"        this.cache.updateItem({ id }, status);\n" +
"        return status;\n" +
"    }\n" +
"    async openNext(interactionAllowed = false) {\n" +
"        this.log('openNext');\n" +
"        let status = (await this.invalidGenerator.next()).value;\n" +
"        while (status?.id === this.current) {\n" +
"            this.log({ status, current: this.current, class: this });\n" +
"            status = (await this.invalidGenerator.next()).value;\n" +
"        }\n" +
"        if (!status && interactionAllowed) {\n" +
"            if (!this.skippedElems)\n" +
"                this.skippedElems = this.cache.filter(item => this.isSkipped(item));\n" +
"            while (!status && this.skippedElems.length) {\n" +
"                const id = this.skippedElems.shift().id;\n" +
"                status = await this.updateStatus(id);\n" +
"                if (status?.valid || status.id === this.current)\n" +
"                    status = false;\n" +
"            }\n" +
"        }\n" +
"        if (status) {\n" +
"            this.log('next found :', { current: this.current, status, class: this });\n" +
"            this.open(status.id);\n" +
"            this.running = false;\n" +
"            return;\n" +
"        }\n" +
"        if (interactionAllowed &&\n" +
"            confirm(this.constructor.name + ': tous les éléments sont valides selon les paramétres actuels. Revérifier tout depuis le début ?')) {\n" +
"            this.reloadAll();\n" +
"            return this.openNext(interactionAllowed);\n" +
"        }\n" +
"        this.running = false;\n" +
"    }\n" +
"    open(id) {\n" +
"        openDocument(id);\n" +
"    }\n" +
"    async reloadAll() {\n" +
"        this.cache.clear();\n" +
"        localStorage.removeItem(`${this.storageKey}-state`);\n" +
"        this.invalidGenerator = this.loadInvalid();\n" +
"    }\n" +
"    async firstLoading() {\n" +
"        const storageKey = `${this.storageKey}-state`;\n" +
"        const currentVersion = window.GM_Pennylane_Version;\n" +
"        const state = JSON.parse(localStorage.getItem(storageKey) ?? '{}');\n" +
"        if (state.version !== currentVersion) {\n" +
"            // clear cache\n" +
"            this.cache.clear();\n" +
"            state.version = currentVersion;\n" +
"            state.loaded = false;\n" +
"            localStorage.setItem(storageKey, JSON.stringify(state));\n" +
"        }\n" +
"        const dateRef = Date.now() - (3 * 86400000);\n" +
"        let status = this.cache.find(item => item.fetchedAt < dateRef);\n" +
"        while (status) {\n" +
"            await this.updateStatus(status);\n" +
"            status = this.cache.find(item => item.fetchedAt < dateRef);\n" +
"        }\n" +
"        if (state.loaded)\n" +
"            return;\n" +
"        // load all\n" +
"        this.walk();\n" +
"        for await (const item of this.walk())\n" +
"            await this.updateStatus(item);\n" +
"        // save loaded status\n" +
"        state.loaded = true;\n" +
"        localStorage.setItem(storageKey, JSON.stringify(state));\n" +
"    }\n" +
"    allowIgnoring() {\n" +
"        const ignored = Boolean(this.cache.find({ id: this.current })?.ignored);\n" +
"        this.container.appendChild(parseHTML(`<button\n" +
"      type=\"button\"\n" +
"      class=\"${getButtonClassName()} ignore-item\"\n" +
"      ${ignored ? 'style=\"background-color: var(--red);\"' : ''}\n" +
"    >x</button>`));\n" +
"        const button = $(`.ignore-item`, this.container);\n" +
"        Tooltip.make({ target: button, text: 'Ignorer cet élément, ne plus afficher' });\n" +
"        const refresh = () => {\n" +
"            const ignored = Boolean(this.cache.find({ id: this.current })?.ignored);\n" +
"            const background = ignored ? 'var(--red)' : '';\n" +
"            if (button.style.backgroundColor !== background)\n" +
"                button.style.backgroundColor = background;\n" +
"        };\n" +
"        button.addEventListener('click', () => {\n" +
"            const status = this.cache.find({ id: this.current });\n" +
"            if (!status)\n" +
"                return;\n" +
"            this.cache.updateItem({ id: this.current }, Object.assign(status, { ignored: !status.ignored }));\n" +
"        });\n" +
"        this.cache.on('change', () => { refresh(); });\n" +
"        this.on('reload', () => { refresh(); });\n" +
"    }\n" +
"    allowWaiting() {\n" +
"        this.container.appendChild(parseHTML(`<button type=\"button\" class=\"${getButtonClassName()} wait-item\">\\ud83d\\udd52</button>`));\n" +
"        const waitButton = $(`.wait-item`, this.container);\n" +
"        const tooltip = Tooltip.make({ target: waitButton, text: '' });\n" +
"        const updateWaitDisplay = () => {\n" +
"            const status = this.cache.find({ id: this.current });\n" +
"            if (!status?.wait || (new Date(status.wait).getTime() < Date.now())) {\n" +
"                waitButton.style.backgroundColor = '';\n" +
"                tooltip.setText('Ne plus afficher pendant 3 jours');\n" +
"                return;\n" +
"            }\n" +
"            waitButton.style.backgroundColor = 'var(--blue)';\n" +
"            const date = new Date(status.wait).toISOString().replace('T', ' ').slice(0, 16)\n" +
"                .split(' ').map(block => block.split('-').reverse().join('/')).join(' ');\n" +
"            tooltip.setText(`Ignoré jusqu'à ${date}.`);\n" +
"        };\n" +
"        updateWaitDisplay();\n" +
"        setInterval(() => { updateWaitDisplay(); }, 60000);\n" +
"        waitButton.addEventListener('click', () => {\n" +
"            this.log('waiting button clicked');\n" +
"            const status = this.cache.find({ id: this.current });\n" +
"            if (!status)\n" +
"                return this.log({ cachedStatus: status, id: this.current });\n" +
"            const wait = (status.wait && (new Date(status.wait).getTime() > Date.now())) ? ''\n" +
"                : new Date(Date.now() + 3 * 86400000).toISOString();\n" +
"            this.cache.updateItem({ id: this.current }, Object.assign(status, { wait }));\n" +
"            updateWaitDisplay();\n" +
"        });\n" +
"        waitButton.addEventListener('contextmenu', event => {\n" +
"            event.preventDefault();\n" +
"            const date = prompt('Date de fin de timeout ? (jj/mm/aaaa)', '');\n" +
"            if (!date)\n" +
"                return;\n" +
"            const d = date.split('/');\n" +
"            if (d.length !== 3) {\n" +
"                alert(' Format attendu : jj/mm/aaaa');\n" +
"                return;\n" +
"            }\n" +
"            try {\n" +
"                const wait = new Date(Number(d[2]), Number(d[1]) - 1, Number(d[0])).toISOString();\n" +
"                const status = this.cache.find({ id: this.current });\n" +
"                if (!status)\n" +
"                    return this.log({ cachedStatus: status, id: this.current });\n" +
"                this.cache.updateItem({ id: this.current }, Object.assign(status, { wait }));\n" +
"                updateWaitDisplay();\n" +
"            }\n" +
"            catch {\n" +
"                alert(' Format attendu : jj/mm/aaaa');\n" +
"            }\n" +
"        });\n" +
"        this.cache.on('change', () => { updateWaitDisplay(); });\n" +
"        this.on('reload', () => { updateWaitDisplay(); });\n" +
"    }\n" +
"    setSpinner() {\n" +
"        const span = $('.open-next-invalid-btn .icon', this.container);\n" +
"        if (!span)\n" +
"            return;\n" +
"        if (!this.running) {\n" +
"            if (span.innerText !== '>')\n" +
"                span.innerText = '>';\n" +
"            return;\n" +
"        }\n" +
"        this.spinner.index = ((this.spinner.index ?? 0) + 1) % this.spinner.frames.length;\n" +
"        span.innerText = this.spinner.frames[this.spinner.index];\n" +
"    }\n" +
"    getCache() {\n" +
"        return this.cache;\n" +
"    }\n" +
"}\n" +
"\n" +
"class NextInvalidTransaction extends OpenNextInvalid {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.id = 'next-invalid-transaction';\n" +
"        this.storageKey = 'transactionValidation';\n" +
"        this.idParamName = 'transaction_id';\n" +
"    }\n" +
"    async init() {\n" +
"        // Wait for appending button in the matching page before init auto open service\n" +
"        await this.appendContainer();\n" +
"        this.cache = CacheStatus.getInstance(this.storageKey);\n" +
"        await super.init();\n" +
"    }\n" +
"    async *walk() {\n" +
"        // Load new added transactions\n" +
"        const max = this.cache.reduce((acc, status) => Math.max(status.createdAt, acc), 0);\n" +
"        if (max) {\n" +
"            const params = {\n" +
"                filter: JSON.stringify([{ field: 'created_at', operator: 'gteq', value: new Date(max).toISOString() }]),\n" +
"                sort: '+created_at',\n" +
"            };\n" +
"            for await (const transaction of getTransactionGenerator(params)) {\n" +
"                yield new Transaction(transaction).getStatus();\n" +
"            }\n" +
"        }\n" +
"        // Load old unloaded transactions\n" +
"        const min = this.cache.reduce((acc, status) => Math.min(status.createdAt, acc), Date.now());\n" +
"        const params = {\n" +
"            filter: JSON.stringify([{ field: 'created_at', operator: 'lteq', value: new Date(min).toISOString() }]),\n" +
"            sort: '-created_at',\n" +
"        };\n" +
"        for await (const transaction of getTransactionGenerator(params)) {\n" +
"            yield new Transaction(transaction).getStatus();\n" +
"        }\n" +
"    }\n" +
"    async getStatus(id) {\n" +
"        const transaction = new Transaction({ id });\n" +
"        return await transaction.getStatus();\n" +
"    }\n" +
"    /** Add \"next invalid transaction\" button on transactions list */\n" +
"    async appendContainer() {\n" +
"        const nextButton = await waitFunc(() => findElem('div', 'Détails')?.querySelector('button+button:last-child') ?? false);\n" +
"        nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);\n" +
"        waitFunc(() => findElem('div', 'Détails')?.querySelector('button+button:last-child') !== nextButton)\n" +
"            .then(() => this.appendContainer());\n" +
"    }\n" +
"}\n" +
"\n" +
"/** Add validation message on transaction panel */\n" +
"class ValidMessage extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.container = parseHTML(`<div><div class=\"headband-is-valid\">⟳</div></div>`)\n" +
"            .firstElementChild;\n" +
"        this.state = { ledgerEvents: [] };\n" +
"        this._message = '⟳';\n" +
"    }\n" +
"    static getInstance() {\n" +
"        if (!this.instance)\n" +
"            this.instance = new this();\n" +
"        return this.instance;\n" +
"    }\n" +
"    async init() {\n" +
"        await this.insertContainer();\n" +
"        this.on('message-change', () => this.displayMessage());\n" +
"        this.watchReloadHotkey();\n" +
"        await this.loadMessage();\n" +
"        setInterval(() => this.watch(), 200);\n" +
"    }\n" +
"    async insertContainer() {\n" +
"        await waitElem('h3', 'Transactions'); // Transactions panel\n" +
"        await waitElem('.paragraph-body-m+.heading-page.mt-1'); // transaction detail panel\n" +
"        const detailTab = await waitElem('aside div');\n" +
"        detailTab.insertBefore(this.container, detailTab.firstChild);\n" +
"        waitFunc(() => $('aside div') !== detailTab).then(() => { this.insertContainer(); });\n" +
"    }\n" +
"    watchReloadHotkey() {\n" +
"        document.addEventListener('keydown', event => {\n" +
"            if (findElem('h3', 'Transactions') && event.ctrlKey && event.key.toLowerCase() === 's') {\n" +
"                event.preventDefault();\n" +
"                this.reload();\n" +
"            }\n" +
"        });\n" +
"    }\n" +
"    reload() {\n" +
"        this.loadMessage();\n" +
"    }\n" +
"    set message(html) {\n" +
"        this._message = html;\n" +
"        this.emit('message-change', html);\n" +
"    }\n" +
"    get message() {\n" +
"        return this._message;\n" +
"    }\n" +
"    async loadMessage() {\n" +
"        this.log('loadMessage', this);\n" +
"        this.message = '⟳';\n" +
"        const rawTransaction = getReactProps($('.paragraph-body-m+.heading-page.mt-1'), 9).transaction;\n" +
"        this.state.transaction = new Transaction(rawTransaction);\n" +
"        const cache = NextInvalidTransaction.getInstance().getCache();\n" +
"        const cachedStatus = cache.find({ id: this.state.transaction?.id });\n" +
"        if (cachedStatus)\n" +
"            this.message = `<aside style=\"background: lightgray;\">⟳ ${cachedStatus.message}</aside>`;\n" +
"        const message = await this.state.transaction.getValidMessage();\n" +
"        if (this.state.transaction?.id !== rawTransaction.id)\n" +
"            return;\n" +
"        this.message = `${(await this.state.transaction.isValid()) ? '✓' : '✗'} ${message}`;\n" +
"    }\n" +
"    async watch() {\n" +
"        const ledgerEvents = $$('form[name^=DocumentEntries-]')\n" +
"            .reduce((events, form) => {\n" +
"            const formEvents = getReactProps(form.parentElement, 3)?.initialValues?.ledgerEvents ?? [];\n" +
"            return [...events, ...formEvents];\n" +
"        }, []);\n" +
"        if (ledgerEvents.some((event, id) => this.state.ledgerEvents[id] !== event)) {\n" +
"            const logData = { oldEvents: this.state.ledgerEvents };\n" +
"            this.state.ledgerEvents = ledgerEvents;\n" +
"            this.debug('ledgerEvents desynchronisé', { ...logData, ...this });\n" +
"            this.reload();\n" +
"        }\n" +
"        const current = Number(getParam(location.href, 'transaction_id'));\n" +
"        if (current && current !== this.state.transaction?.id) {\n" +
"            this.debug('transaction desynchronisée', { current, ...this });\n" +
"            this.reload();\n" +
"        }\n" +
"    }\n" +
"    async displayMessage() {\n" +
"        $('.headband-is-valid', this.container).innerHTML =\n" +
"            `${this.getTransactionId()}${this.getCommentLogo()} ${this.message}`;\n" +
"    }\n" +
"    getTransactionId() {\n" +
"        if (!this.state.transaction?.id)\n" +
"            return '';\n" +
"        return `<span class=\"transaction-id d-inline-block bg-secondary-100 dihsuQ px-0_5 m-0\">#${this.state.transaction.id}</span>`;\n" +
"    }\n" +
"    getCommentLogo() {\n" +
"        if (!this.state.transaction)\n" +
"            return '';\n" +
"        if (!this.state.comments || this.state.transaction.id !== this.state.comments.transactionId) {\n" +
"            this.reloadCommentState();\n" +
"            return '';\n" +
"        }\n" +
"        return this.state.comments.hasComment ?\n" +
"            '<span class=\"d-inline-block bg-danger m-0\">💬</span>' : '';\n" +
"    }\n" +
"    async reloadCommentState() {\n" +
"        if (!this.state.transaction)\n" +
"            return;\n" +
"        const transactionId = this.state.transaction.id;\n" +
"        const transactionDoc = await this.state.transaction.getDocument();\n" +
"        const transaction = transactionDoc.grouped_documents.find(doc => doc.id === transactionId);\n" +
"        this.state.comments = {\n" +
"            transactionId,\n" +
"            hasComment: Boolean(transaction?.client_comments?.length),\n" +
"        };\n" +
"        this.displayMessage();\n" +
"    }\n" +
"}\n" +
"/** Open next invalid transaction */\n" +
"/**\n" +
" * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :\n" +
"getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);\n" +
" */\n" +
"\n" +
"async function waitPage(pageName) {\n" +
"    return await waitFunc(() => isPage(pageName));\n" +
"}\n" +
"function isPage(pageName) {\n" +
"    switch (pageName) {\n" +
"        case 'invoiceDetail': return findElem('h4', 'Réconciliation') ?? false;\n" +
"        case 'DMS': return location.href.split('/')[5] === 'dms' && findElem('h3', 'GED') || false;\n" +
"        case 'DMSDetail': return ((location.href.split('/')[5] === 'dms' && findElem('h3', 'Détail du document'))\n" +
"            || false);\n" +
"        case 'transactionDetail': return findElem('button.tabbarlink', 'Réconciliation') ?? false;\n" +
"        default: throw new Error(`unknown page required : \"${pageName}\"`);\n" +
"    }\n" +
"}\n" +
"\n" +
"/** Add 'add by ID' button on transaction reconciliation tab */\n" +
"class TransactionAddByIdButton extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.button = parseHTML('<div class=\"btn-sm w-100 btn-primary add-by-id-btn\" style=\"cursor: pointer;\">Ajouter par ID</div>').firstElementChild;\n" +
"        this.disabled = false;\n" +
"    }\n" +
"    async init() {\n" +
"        await this.insertContainer();\n" +
"        this.attachEvent();\n" +
"    }\n" +
"    async insertContainer() {\n" +
"        const div = (await Promise.race([\n" +
"            waitElem(\"button\", \"Voir plus de factures\"),\n" +
"            waitElem(\"button\", \"Chercher parmi les factures\"),\n" +
"        ])).closest(\".mt-2\");\n" +
"        if (!div) {\n" +
"            this.log(\"TransactionAddByIdButton\", {\n" +
"                button: await Promise.race([\n" +
"                    waitElem(\"button\", \"Voir plus de factures\"),\n" +
"                    waitElem(\"button\", \"Chercher parmi les factures\"),\n" +
"                ]),\n" +
"                div,\n" +
"            });\n" +
"            throw new Error(\"Impossible de trouver le bloc de boutons\");\n" +
"        }\n" +
"        div.insertBefore(this.button, div.lastElementChild);\n" +
"        Tooltip.make({ target: this.button, text: \"Ajouter par ID (Alt+Z)\" });\n" +
"        waitFunc(async () => {\n" +
"            const currentDiv = (await Promise.race([\n" +
"                waitElem(\"button\", \"Voir plus de factures\"),\n" +
"                waitElem(\"button\", \"Chercher parmi les factures\"),\n" +
"            ])).closest(\".mt-2\");\n" +
"            return currentDiv !== div;\n" +
"        }).then(() => this.insertContainer());\n" +
"    }\n" +
"    attachEvent() {\n" +
"        this.log({ button: this.button });\n" +
"        this.button.addEventListener(\"click\", () => {\n" +
"            this.addById();\n" +
"        });\n" +
"        document.addEventListener(\"keydown\", (event) => {\n" +
"            if (isPage(\"transactionDetail\") && event.altKey && [\"z\", \"Z\"].includes(event.key)) {\n" +
"                this.addById();\n" +
"            }\n" +
"            else {\n" +
"                this.debug({\n" +
"                    isPageTransactionDetail: isPage(\"transactionDetail\"),\n" +
"                    event,\n" +
"                });\n" +
"            }\n" +
"        });\n" +
"    }\n" +
"    async addById() {\n" +
"        if (this.disabled)\n" +
"            return;\n" +
"        /**\n" +
"         * Obligé de recharger la transaction à chaque appel : le numéro guid du\n" +
"         * groupe change à chaque attachement de nouvelle pièce\n" +
"         */\n" +
"        const transactionId = Number(getParam(location.href, \"transaction_id\"));\n" +
"        const id = Number(prompt(\"ID du justificatif ?\"));\n" +
"        const transaction = new Transaction({ id: transactionId });\n" +
"        this.disabled = true;\n" +
"        const spinner = parseHTML('<div class=\"spinner-border spinner-border-sm\" role=\"status\"></div>')\n" +
"            .firstElementChild;\n" +
"        this.button.appendChild(spinner);\n" +
"        await transaction.groupAdd(id);\n" +
"        spinner.remove();\n" +
"        this.disabled = false;\n" +
"        ValidMessage.getInstance().reload();\n" +
"    }\n" +
"}\n" +
"\n" +
"const staticLogger = new Logger(\"Invoice\");\n" +
"class Invoice extends ValidableDocument {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.type = \"invoice\";\n" +
"    }\n" +
"    static from(invoice) {\n" +
"        if (invoice.direction === \"supplier\")\n" +
"            return new SupplierInvoice(invoice);\n" +
"        return new CustomerInvoice(invoice);\n" +
"    }\n" +
"    static async load(id) {\n" +
"        const invoice = await getInvoice(id);\n" +
"        if (!invoice?.id) {\n" +
"            staticLogger.log(\"Invoice.load: cannot load this invoice\", { id, invoice, _this: this });\n" +
"            return new NotFoundInvoice({ id });\n" +
"        }\n" +
"        return this.from(invoice);\n" +
"    }\n" +
"    async update(data) {\n" +
"        return await updateInvoice(this.id, data);\n" +
"    }\n" +
"    async getInvoice() {\n" +
"        const maxAge = this.isCurrent() ? 0 : void 0;\n" +
"        if (!this.invoice) {\n" +
"            this.invoice = getInvoice(this.id, maxAge).then((response) => {\n" +
"                if (!response)\n" +
"                    throw new Error(\"Impossible de charger la facture\");\n" +
"                return response;\n" +
"            });\n" +
"        }\n" +
"        return this.invoice;\n" +
"    }\n" +
"    async getGroupedDocuments() {\n" +
"        const maxAge = this.isCurrent() ? 0 : void 0;\n" +
"        return await super.getGroupedDocuments(maxAge);\n" +
"    }\n" +
"    async moveToDms(destId) {\n" +
"        this.debug(\"moveToDms before auto destId\", { destId });\n" +
"        destId = destId ?? (await this.getDMSDestId());\n" +
"        if (!destId) {\n" +
"            this.error(\"Unable to choose DMS folder\", this);\n" +
"            return;\n" +
"        }\n" +
"        this.debug(\"moveToDms\", { destId });\n" +
"        const invoice = await this.getInvoice();\n" +
"        const filename = invoice.filename;\n" +
"        const fileId = invoice.file_signed_id;\n" +
"        const invoiceName = [\n" +
"            invoice.invoice_number,\n" +
"            invoice.thirdparty?.name ?? \"\",\n" +
"            invoice.date ? new Date(invoice.date).toLocaleDateString().replace(/\\//g, \"-\") : \"\",\n" +
"            `${invoice.amount.replace(/.0+$/, \"\")}€`,\n" +
"        ].join(\" - \");\n" +
"        await moveToDms(this.id, destId);\n" +
"        this.debug(\"moveToDms response\");\n" +
"        const files = await getDMSItemList({\n" +
"            filter: [{ field: \"name\", operator: \"search_all\", value: filename }],\n" +
"        });\n" +
"        const item = files.items.find((fileItem) => fileItem.signed_id === fileId);\n" +
"        await updateDMSItem({ id: item.id, name: invoiceName });\n" +
"        return new DMSItem({ id: item.id });\n" +
"    }\n" +
"    async getDMSDestId() {\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        const transaction = gdocs.find((gdoc) => gdoc.type === \"Transaction\");\n" +
"        if (transaction)\n" +
"            return await getDMSDestId(transaction);\n" +
"        const ref = await this.getRef();\n" +
"        if (ref)\n" +
"            return await getDMSDestId(ref);\n" +
"    }\n" +
"    async getRef() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        const refId = invoice.invoice_number.match(/^§ #(?<id>\\d+)[^\\d]/u)?.groups?.id;\n" +
"        return refId && (await getDocument(Number(refId)));\n" +
"    }\n" +
"    isCurrent() {\n" +
"        return getParam(location.href, \"id\") === String(this.id);\n" +
"    }\n" +
"}\n" +
"class NotFoundInvoice extends Invoice {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.direction = \"unknown\";\n" +
"    }\n" +
"    loadValidMessage() {\n" +
"        return Promise.resolve(\"Facture introuvable\");\n" +
"    }\n" +
"}\n" +
"class SupplierInvoice extends Invoice {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.direction = \"supplier\";\n" +
"    }\n" +
"    async loadValidMessage() {\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"loadValidMessage\", this);\n" +
"        return ((await this.isUnreachable()) ??\n" +
"            (await this.isClosedInvoice()) ??\n" +
"            (await this.isArchived()) ??\n" +
"            //?? await this.validTemplate()\n" +
"            (await this.is2025()) ??\n" +
"            (await this.isZero()) ??\n" +
"            (await this.isMissingThirdparty()) ??\n" +
"            (await this.isMissingCounterpart()) ??\n" +
"            (await this.isTrashCounterpart()) ??\n" +
"            (await this.isAid()) ??\n" +
"            (await this.hasWrongChangeOffset()) ??\n" +
"            (await this.isMissingLettering()) ??\n" +
"            //?? await this.hasToSendToDMS()\n" +
"            (await this.isMissingDate()) ??\n" +
"            (this.isCurrent() && this.log(\"loadValidMessage\", \"fin des contrôles\"), \"OK\"));\n" +
"    }\n" +
"    async isUnreachable() {\n" +
"        const invoice = await this.getInvoice().catch((error) => error);\n" +
"        if (!(invoice instanceof APIInvoice)) {\n" +
"            this.error(\"loadValidMessage\", invoice);\n" +
"            return `Impossible de valider : ${invoice.message}`;\n" +
"        }\n" +
"    }\n" +
"    async isClosedInvoice() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        // Fait partie d'un exercice clôturé\n" +
"        if (invoice.has_closed_ledger_events) {\n" +
"            this.log(\"Fait partie d'un exercice clos\");\n" +
"            if (invoice.date)\n" +
"                return \"OK\";\n" +
"        }\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        if (ledgerEvents.some((levent) => levent.closed)) {\n" +
"            this.log(\"Est attaché à une écriture faisant partie d'un exercice clos\");\n" +
"            if (invoice.date)\n" +
"                return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isArchived() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        const archivedAllowed = [\n" +
"            \"§ #\",\n" +
"            \"¤ CARTE ETRANGERE\",\n" +
"            \"¤ PIECE ETRANGERE\",\n" +
"            \"¤ TRANSACTION INTROUVABLE\",\n" +
"            \"CHQ DÉCHIRÉ\",\n" +
"        ];\n" +
"        // Archived\n" +
"        if (invoice.archived) {\n" +
"            if (archivedAllowed.some((allowedItem) => invoice.invoice_number.startsWith(allowedItem))) {\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"loadValidMessage\", \"archivé avec numéro de facture correct\");\n" +
"                return \"OK\";\n" +
"            }\n" +
"            return `<a\n" +
"        title=\"Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"      >Facture archivée sans référence ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${archivedAllowed\n" +
"                .map((it) => `<li>${it}</li>`)\n" +
"                .join(\"\")}</ul>`;\n" +
"        }\n" +
"        else if (archivedAllowed.some((allowedItem) => invoice.invoice_number.startsWith(allowedItem))) {\n" +
"            return `<a\n" +
"        title=\"Archiver la facture : ⁝ &gt; Archiver la facture.\\n" +
"Cliquer ici pour plus d'informations\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"      >Archiver la facture ⓘ</a><br/>Les factures dont le numéro de facture commence par ${archivedAllowed.find((allowedItem) => invoice.invoice_number.startsWith(allowedItem))} doivent être archivées.`;\n" +
"        }\n" +
"    }\n" +
"    async validTemplate() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        const templates = [\n" +
"            {\n" +
"                title: \"Talon de chèque\",\n" +
"                regex: /^CHQ ?(?:n°)?\\d+ - .+ - [\\d \\.]*(?:,\\d\\d)? ?€$/,\n" +
"                text: \"CHQ&lt;numéro du chèque&gt; - &lt;nom du bénéficiaire ou raison sociale&gt; - &lt;montant&gt;€\",\n" +
"            },\n" +
"        ];\n" +
"        const match = templates.some((template) => template.regex.test(invoice.invoice_number));\n" +
"        if (!match) {\n" +
"            return `<a\n" +
"        title=\"Le champ \\\"Numéro de facture\\\" doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"      >Le champ \\\"Numéro de facture\\\" doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates\n" +
"                .map((it) => `<li><b>${it.title} :</b><code>${it.text}</code></li>`)\n" +
"                .join(\"\")}</ul>`;\n" +
"        }\n" +
"    }\n" +
"    async is2025() {\n" +
"        const doc = await this.getDocument();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        if (doc.date?.startsWith(\"2025\") || gdocs.some((gdoc) => gdoc.date?.startsWith(\"2025\"))) {\n" +
"            return (await this.isMissingLettering()) ?? (await this.isZero()) ?? (this.isCurrent() && this.log(\"2025\"), \"OK\");\n" +
"        }\n" +
"    }\n" +
"    async isZero() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        // Montant\n" +
"        if (invoice.amount === \"0.0\" && !invoice.invoice_number.includes(\"|ZERO|\"))\n" +
"            return `<a\n" +
"      title=\"Cliquer ici pour plus d'informations.\"\n" +
"      href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client\"\n" +
"    >Ajouter le montant ⓘ</a><ul style=\"margin:0;padding:0.8em;\"><li>|ZERO|</li></ul>`;\n" +
"    }\n" +
"    async isMissingThirdparty() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        // Pas de tiers\n" +
"        if (!invoice.thirdparty_id && !invoice.thirdparty) {\n" +
"            return `<a\n" +
"        title=\"Cliquer ici pour plus d'informations\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"      >Ajouter un fournisseur ⓘ</a><ul style=\"margin:0;padding:0.8em;\"><li>CHQ DÉCHIRÉ - CHQ###</li></ul>`;\n" +
"        }\n" +
"    }\n" +
"    async isMissingCounterpart() {\n" +
"        const thirdparty = await this.getThirdparty();\n" +
"        // Pas de compte de charge associé\n" +
"        if (!thirdparty?.thirdparty_invoice_line_rules?.[0]?.pnl_plan_item) {\n" +
"            return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"        >Fournisseur inconnu ⓘ</a>`;\n" +
"        }\n" +
"    }\n" +
"    async isTrashCounterpart() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        // exclude 6288\n" +
"        if (invoice.invoice_lines?.some((line) => line.pnl_plan_item?.number == \"6288\"))\n" +
"            return \"compte tiers 6288\";\n" +
"    }\n" +
"    async isAid() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        // Aides octroyées sans numéro de facture\n" +
"        if (106438171 === invoice.thirdparty_id && // AIDES OCTROYÉES\n" +
"            ![\"AIDES - \", \"CHQ\", \"CERFA - \"].some((label) => invoice.invoice_number.startsWith(label))) {\n" +
"            if (invoice.invoice_number.startsWith(\"§ #\"))\n" +
"                return \"Archiver le reçu.\";\n" +
"            return `<a\n" +
"        title=\"Cliquer ici pour plus d'informations\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#Format%20incorrect%20pour%20le%20num%E9ro%20de%20facture\"\n" +
"      >Format incorrect pour le numéro de facture ⓘ</a>\n" +
"      <ul style=\"margin:0;padding:0.8em;\">\n" +
"        <li>AIDES - NOM - JJ/MM/AAAA</li>\n" +
"        <li>CERFA - NOM ASSO - JJ/MM/AAAA</li>\n" +
"        <li>CHQ###</li>\n" +
"      </ul>`;\n" +
"        }\n" +
"        // Aides octroyées avec mauvais ID\n" +
"        if (invoice.thirdparty?.name === \"AIDES OCTROYÉES\" && invoice.thirdparty.id !== 106438171)\n" +
"            return \"Il ne doit y avoir qu'un seul compte \\\"AIDES OCTROYÉES\\\", et ce n'est pas le bon...\";\n" +
"        // Piece d'identité avec mauvais ID\n" +
"        if (invoice.thirdparty?.name === \"PIECE ID\" && invoice.thirdparty.id !== 106519227)\n" +
"            return \"Il ne doit y avoir qu'un seul compte \\\"PIECE ID\\\", et ce n'est pas le bon...\";\n" +
"        // ID card\n" +
"        if (invoice.thirdparty?.id === 106519227 && !invoice.invoice_number?.startsWith(\"ID \")) {\n" +
"            return 'Le \"Numéro de facture\" des pièces d\\'identité commence obligatoirement par \"ID \"';\n" +
"        }\n" +
"    }\n" +
"    async hasWrongChangeOffset() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        // Ecarts de conversion de devise\n" +
"        if (invoice.currency !== \"EUR\") {\n" +
"            const diffLine = ledgerEvents.find((line) => line.planItem.number === \"4716001\");\n" +
"            if (diffLine) {\n" +
"                this.log(\"loadValidMessage > Ecarts de conversion de devise\", {\n" +
"                    ledgerEvents,\n" +
"                    diffLine,\n" +
"                });\n" +
"                if (parseFloat(diffLine.amount) < 0) {\n" +
"                    return \"Les écarts de conversions de devises doivent utiliser le compte 756\";\n" +
"                }\n" +
"                else {\n" +
"                    return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FLes%20%C3%A9carts%20de%20conversions%20de%20devises%20doivent%20utiliser%20le%20compte%20656\"\n" +
"          >Les écarts de conversions de devises doivent utiliser le compte 656 ⓘ</a>`;\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async isMissingLettering() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        const doc = await this.getDocument();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        const transactions = gdocs.filter((gdoc) => gdoc.type === \"Transaction\");\n" +
"        // Has transaction attached\n" +
"        const documentDate = new Date(doc.date);\n" +
"        const dayInMs = 86400000;\n" +
"        const isRecent = Date.now() - documentDate.getTime() < 10 * dayInMs;\n" +
"        if (!isRecent && !transactions.length) {\n" +
"            const orphanAllowedThirdparties = [\n" +
"                115640202, // Stripe - facture de frais bancaires réparties sur toutes les transactions de don\n" +
"            ];\n" +
"            const orphanAllowedNumbers = [\"¤ TRANSACTION INTROUVABLE\"];\n" +
"            const archivedAllowedNumbers = [\"§ #\", \"¤ CARTE ETRANGERE\", \"¤ PIECE ETRANGERE\", \"CHQ DÉCHIRÉ\"];\n" +
"            if (!orphanAllowedNumbers.some((label) => invoice.invoice_number.startsWith(label)) &&\n" +
"                !orphanAllowedThirdparties.some((tpid) => invoice.thirdparty_id === tpid)) {\n" +
"                return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e\"\n" +
"        >Pas de transaction attachée ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${orphanAllowedNumbers\n" +
"                    .concat(archivedAllowedNumbers)\n" +
"                    .map((it) => `<li>${it}</li>`)\n" +
"                    .join(\"\")}</ul>`;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async hasToSendToDMS() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        const transactions = gdocs.filter((gdoc) => gdoc.type === \"Transaction\");\n" +
"        // Justificatif ne donnant pas lieu à une écriture\n" +
"        if (transactions.length &&\n" +
"            /*\n" +
"              [\n" +
"                106438171, // AIDES OCTROYÉES             : talon de chèque ou reçu signé\n" +
"                114270419, // DON VERSÉ A UNE ASSOCIATION : talon de chèque ou reçu cerfa\n" +
"                106519227, // PIECE ID\n" +
"              ].includes(invoice.thirdparty?.id ?? 0)\n" +
"              ||*/ invoice.invoice_number.startsWith(\"CHQ\") // TALON DE CHEQUE\n" +
"        ) {\n" +
"            /*\n" +
"            if (transactions.find(transaction => transaction.date.startsWith('2023'))) {\n" +
"              const dmsItem = await this.moveToDms(57983091 //2023 - Compta - Fournisseurs\n" +
"            );\n" +
"              this.log({ dmsItem });\n" +
"              if (this.isCurrent()) this.log('moved to DMS', { invoice: this });\n" +
"              return (await Invoice.load(this.id)).loadValidMessage();\n" +
"            }\n" +
"            */\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"Envoyer en GED\", transactions);\n" +
"            return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Envoi%20en%20GED\"\n" +
"        >Envoyer en GED ? ⓘ</a>`;\n" +
"        }\n" +
"    }\n" +
"    async isMissingDate() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        const transactions = gdocs.filter((gdoc) => gdoc.type === \"Transaction\");\n" +
"        // Date manquante\n" +
"        if (!invoice.date) {\n" +
"            if (invoice.has_closed_ledger_events || ledgerEvents.some((levent) => levent.closed)) {\n" +
"                this.log(\"exercice clos, on ne peut plus remplir la date\");\n" +
"                if (transactions.find((transaction) => transaction.date.startsWith(\"2023\"))) {\n" +
"                    const dmsItem = await this.moveToDms({\n" +
"                        parent_id: 57983091 /*2023 - Compta - Fournisseurs*/,\n" +
"                        direction: \"supplier\",\n" +
"                    });\n" +
"                    this.log({ dmsItem });\n" +
"                    if (this.isCurrent())\n" +
"                        this.log(\"moved to DMS\", { invoice: this });\n" +
"                    return (await Invoice.load(this.id)).loadValidMessage();\n" +
"                }\n" +
"                return \"envoyer en GED\";\n" +
"            }\n" +
"            else {\n" +
"                return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture\"\n" +
"        >Date de facture vide ⓘ</a>`;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"}\n" +
"class CustomerInvoice extends Invoice {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.direction = \"customer\";\n" +
"    }\n" +
"    async loadValidMessage() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        // Fait partie d'un exercis clôt\n" +
"        invoice.has_closed_ledger_events;\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"loadValidMessage\", this);\n" +
"        // Archived\n" +
"        const archivedAllowed = [\"§ #\", \"¤ TRANSACTION INTROUVABLE\"];\n" +
"        if (invoice.archived) {\n" +
"            if (\n" +
"            //legacy\n" +
"            !invoice.invoice_number.startsWith(\"§ ESPECES\") &&\n" +
"                !archivedAllowed.some((allowedItem) => invoice.invoice_number.startsWith(allowedItem)))\n" +
"                return `<a\n" +
"          title=\"Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"        >Facture archivée sans référence ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${archivedAllowed\n" +
"                    .map((it) => `<li>${it}</li>`)\n" +
"                    .join(\"\")}</ul>`;\n" +
"            return \"OK\";\n" +
"        }\n" +
"        // Pas de client\n" +
"        if (!invoice.thirdparty)\n" +
"            return 'choisir un \"client\"';\n" +
"        // don manuel\n" +
"        if (![113420582, 103165930].includes(invoice.thirdparty.id))\n" +
"            return 'les seuls clients autorisés sont \"PIECE ID\" et \"DON MANUEL\"';\n" +
"        // piece id\n" +
"        if (invoice.thirdparty.id === 113420582 /* PIECE ID */) {\n" +
"            if (!invoice.invoice_number?.startsWith(\"ID \"))\n" +
"                return 'le champ \"Numéro de facture\" doit commencer par \"ID NOM_DE_LA_PERSONNE\"';\n" +
"        }\n" +
"        // Montant\n" +
"        if (invoice.amount === \"0.0\" &&\n" +
"            !((invoice.invoice_number.includes(\"|ZERO|\") || invoice.thirdparty.id === 113420582) /* PIECE ID */))\n" +
"            return `<a\n" +
"      title=\"Cliquer ici pour plus d'informations.\"\n" +
"      href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client\"\n" +
"    >Ajouter le montant ⓘ</a><ul style=\"margin:0;padding:0.8em;\"><li>|ZERO|</li></ul>`;\n" +
"        // Don Manuel\n" +
"        if (invoice.thirdparty_id === 103165930 /* DON MANUEL */ &&\n" +
"            ![\"CHQ\", \"CERFA\"].some((label) => invoice.invoice_number.includes(label))) {\n" +
"            return `<a\n" +
"        title=\"Le numéro de facture doit être conforme à un des modèles proposés. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20Manuel%20-%20num%C3%A9ro%20de%20facture\"\n" +
"      >Informations manquantes dans le numéro de facture ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${[\n" +
"                \"CERFA n°### - Prénom Nom - JJ/MM/AAAA\",\n" +
"                \"CHQ n°### - Prénom Nom - JJ/MM/AAAA\",\n" +
"            ]\n" +
"                .map((it) => `<li>${it}</li>`)\n" +
"                .join(\"\")}</ul>`;\n" +
"        }\n" +
"        return ((await this.checkHasTransactionAttached()) ??\n" +
"            //this.hasToSendToDMS() ??\n" +
"            \"OK\");\n" +
"    }\n" +
"    async hasToSendToDMS() {\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        const transactions = gdocs.filter((gdoc) => gdoc.type === \"Transaction\");\n" +
"        const invoice = await this.getInvoice();\n" +
"        const archivedAllowed = [\"§ #\", \"¤ TRANSACTION INTROUVABLE\"];\n" +
"        // if (transactions.find(transaction => transaction.date.startsWith('2024'))) {\n" +
"        //   const dmsItem = await this.moveToDms(21994051 /*2024 - Compta - Clients */);\n" +
"        //   this.log({ dmsItem });\n" +
"        //   if (this.isCurrent()) this.log('moved to DMS', { invoice: this });\n" +
"        //   return (await Invoice.load(this.id)).loadValidMessage();\n" +
"        // }\n" +
"        // if (transactions.find(transaction => transaction.date.startsWith('2023'))) {\n" +
"        //   const dmsItem = await this.moveToDms(57983092 /*2023 - Compta - Clients */);\n" +
"        //   this.log({ dmsItem });\n" +
"        //   if (this.isCurrent()) this.log('moved to DMS', { invoice: this });\n" +
"        //   return (await Invoice.load(this.id)).loadValidMessage();\n" +
"        // }\n" +
"        // Date manquante\n" +
"        if (!invoice.date) {\n" +
"            const archiveLabel = archivedAllowed.find((label) => invoice.invoice_number.startsWith(label));\n" +
"            if (archiveLabel) {\n" +
"                return `<a\n" +
"          title=\"Archiver la facture : ⁝ > Archiver la facture.\\n" +
"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"        >Archiver ${archiveLabel} ⓘ</a><ul style=\"margin:0;padding:0.8em;\">`;\n" +
"            }\n" +
"            const ledgerEvents = await this.getLedgerEvents();\n" +
"            if (invoice.has_closed_ledger_events || ledgerEvents.some((levent) => levent.closed)) {\n" +
"                this.log(\"exercice clos, on ne peut plus remplir la date\");\n" +
"            }\n" +
"            else {\n" +
"                return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture\"\n" +
"        >Date de facture vide ⓘ</a>`;\n" +
"            }\n" +
"        }\n" +
"        if (!transactions.find((transaction) => transaction.date.startsWith(\"2025\"))) {\n" +
"            this.log(\"Envoyer en GED\", transactions);\n" +
"            return `<a\n" +
"        title=\"Cliquer ici pour plus d'informations\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Envoi%20en%20GED\"\n" +
"      >Envoyer en GED ⓘ</a>`;\n" +
"        }\n" +
"    }\n" +
"    async checkHasTransactionAttached() {\n" +
"        // Has transaction attached\n" +
"        const groupedOptional = [\"¤ TRANSACTION INTROUVABLE\"];\n" +
"        const invoice = await this.getInvoice();\n" +
"        if (groupedOptional.some((label) => invoice.invoice_number.startsWith(label)))\n" +
"            return null;\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        if (groupedDocuments?.some((doc) => doc.type === \"transaction\"))\n" +
"            return null;\n" +
"        return `<a\n" +
"        title=\"Si la transaction est introuvable, mettre un des textes proposés au début du numéro de facture. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e\"\n" +
"      >Pas de transaction attachée ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${groupedOptional\n" +
"            .map((it) => `<li>${it}</li>`)\n" +
"            .join(\"\")}</ul>`;\n" +
"    }\n" +
"}\n" +
"\n" +
"class NextInvalidInvoice extends OpenNextInvalid {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.id = 'next-invalid-invoice';\n" +
"        this.storageKey = 'InvoiceValidation';\n" +
"        this.idParamName = 'id';\n" +
"    }\n" +
"    async init() {\n" +
"        // Wait for appending button in the matched page before init auto open service\n" +
"        await this.appendContainer();\n" +
"        this.cache = CacheListRecord.getInstance(this.storageKey);\n" +
"        await super.init();\n" +
"    }\n" +
"    async *walk() {\n" +
"        // Load new added invoices\n" +
"        for await (const status of this.walkInvoices('supplier', '+'))\n" +
"            yield status;\n" +
"        for await (const status of this.walkInvoices('customer', '+'))\n" +
"            yield status;\n" +
"        // Load old un loaded invoices\n" +
"        for await (const status of this.walkInvoices('supplier', '-'))\n" +
"            yield status;\n" +
"        for await (const status of this.walkInvoices('customer', '-'))\n" +
"            yield status;\n" +
"    }\n" +
"    async *walkInvoices(direction, sort) {\n" +
"        const startFrom = sort === '+' ? 0 : Date.now();\n" +
"        const limit = this.cache\n" +
"            .filter({ direction })\n" +
"            .reduce((acc, status) => Math[sort === '+' ? 'max' : 'min'](status.createdAt, acc), startFrom);\n" +
"        if (limit || sort === '-') {\n" +
"            this.log(`Recherche vers le ${sort === '+' ? 'futur' : 'passé'} depuis`, this.cache.find({ createdAt: limit }), { cache: this.cache });\n" +
"            const operator = sort === '+' ? 'gteq' : 'lteq';\n" +
"            const value = new Date(limit).toISOString();\n" +
"            const params = {\n" +
"                direction,\n" +
"                filter: JSON.stringify([{ field: 'created_at', operator, value }]),\n" +
"                sort: `${sort}created_at`,\n" +
"            };\n" +
"            for await (const invoice of getInvoiceGenerator(params)) {\n" +
"                const status = await Invoice.from(invoice).getStatus();\n" +
"                yield { ...status, direction };\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async getStatus(id) {\n" +
"        const invoice = await Invoice.load(id);\n" +
"        if (!invoice || invoice instanceof NotFoundInvoice)\n" +
"            return null; // probablement une facture supprimée\n" +
"        const status = await invoice.getStatus();\n" +
"        if (!status)\n" +
"            return null;\n" +
"        return status;\n" +
"    }\n" +
"    /** Add \"next invalid invoice\" button on invoices list */\n" +
"    async appendContainer() {\n" +
"        const ref = await waitPage('invoiceDetail');\n" +
"        const nextButton = await waitElem('div>span+button+button:last-child');\n" +
"        nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);\n" +
"        waitFunc(() => isPage('invoiceDetail') !== ref).then(() => this.appendContainer());\n" +
"    }\n" +
"}\n" +
"\n" +
"function openInNewTabIcon(asString = true) {\n" +
"    return parseIcon('<svg class=\"MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0_5 css-q7mezt\" focusable=\"false\" aria-hidden=\"true\" viewBox=\"0 0 24 24\" data-testid=\"OpenInNewRoundedIcon\" style=\"font-size: 1rem;\"><path d=\"M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1M14 4c0 .55.45 1 1 1h2.59l-9.13 9.13c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1\"></path></svg>', asString);\n" +
"}\n" +
"function parseIcon(stringHTML, asString) {\n" +
"    if (asString)\n" +
"        return stringHTML;\n" +
"    return parseHTML(stringHTML).firstElementChild;\n" +
"}\n" +
"\n" +
"/** Add infos on Invoice full page display */\n" +
"class InvoiceDisplayInfos extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.storageKey = 'InvoiceValidation';\n" +
"        this.state = {};\n" +
"    }\n" +
"    static getInstance() {\n" +
"        if (!this.instance)\n" +
"            this.instance = new this();\n" +
"        return this.instance;\n" +
"    }\n" +
"    async init() {\n" +
"        await waitPage('invoiceDetail');\n" +
"        this.tooltipThirdpartyId();\n" +
"        this.cache = CacheStatus.getInstance(this.storageKey);\n" +
"        this.cache.on('change', () => this.handleCacheChange());\n" +
"        this.watchReloadHotkey();\n" +
"        this.watchEventSave();\n" +
"        await this.appendContainer();\n" +
"        setInterval(() => { this.watch(); }, 200);\n" +
"    }\n" +
"    async tooltipThirdpartyId() {\n" +
"        const target = await waitElem('div[data-testid=\"thirdpartyAutocompleteAsyncSelect\"]');\n" +
"        let invoice = await waitFunc(() => this.state.invoice?.getInvoice() ?? false);\n" +
"        const tooltip = Tooltip.make({ target, text: `#${invoice.thirdparty_id}` });\n" +
"        do {\n" +
"            await waitFunc(() => {\n" +
"                return $('div[data-testid=\"thirdpartyAutocompleteAsyncSelect\"]') !== target ||\n" +
"                    this.state.invoice?.id !== invoice.id;\n" +
"            });\n" +
"            if (this.state.invoice?.id !== invoice.id) {\n" +
"                invoice = await waitFunc(() => this.state.invoice?.getInvoice() ?? false);\n" +
"                tooltip.setText(`#${invoice.thirdparty_id}`);\n" +
"            }\n" +
"            else\n" +
"                break;\n" +
"        } while (true);\n" +
"        this.tooltipThirdpartyId();\n" +
"    }\n" +
"    set message(text) {\n" +
"        this.emit('message-change', text);\n" +
"    }\n" +
"    set id(text) {\n" +
"        this.emit('id-change', text);\n" +
"    }\n" +
"    watchReloadHotkey() {\n" +
"        document.addEventListener('keydown', event => {\n" +
"            if (isPage('invoiceDetail') && event.ctrlKey && ['KeyS', 'KeyR'].includes(event.code)) {\n" +
"                if (event.code === 'KeyR')\n" +
"                    event.preventDefault();\n" +
"                this.reload();\n" +
"                this.debug('reloading from watchReloadHotkey');\n" +
"            }\n" +
"            else {\n" +
"                this.debug('skip reload hotkey :', {\n" +
"                    \"isPage('invoiceDetail')\": isPage('invoiceDetail'),\n" +
"                    'event.ctrlKey': event.ctrlKey,\n" +
"                    'event.code (expect \"KeyR\")': event.code,\n" +
"                });\n" +
"            }\n" +
"        });\n" +
"    }\n" +
"    reload() {\n" +
"        this.state = {};\n" +
"    }\n" +
"    async watch() {\n" +
"        const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');\n" +
"        const invoice = getReactPropValue(infos, 'invoice');\n" +
"        if (!invoice)\n" +
"            this.error('Unable to load invoice');\n" +
"        let reload = false;\n" +
"        if (this.state.reactInvoice !== invoice || this.state.invoice?.id !== invoice.id) {\n" +
"            this.state.reactInvoice = invoice;\n" +
"            this.state.invoice = await Invoice.load(invoice.id);\n" +
"            reload = true;\n" +
"        }\n" +
"        const reactEvents = $$('form[name^=DocumentEntries-]')\n" +
"            .reduce((events, form) => {\n" +
"            events.concat(getReactProps(form.parentElement, 3)?.initialValues?.ledgerEvents ?? []);\n" +
"            return events;\n" +
"        }, []);\n" +
"        if (this.state.events?.length !== reactEvents.length\n" +
"            || reactEvents.some(event => this.state.events?.find(ev => ev.id === event.id) !== event)) {\n" +
"            this.state.events = reactEvents;\n" +
"            reload = true;\n" +
"        }\n" +
"        if (reload) {\n" +
"            this.setId();\n" +
"            this.loadMessage();\n" +
"        }\n" +
"    }\n" +
"    on(eventName, cb) { return super.on(eventName, cb); }\n" +
"    async appendContainer() {\n" +
"        if (!this.container) {\n" +
"            this.container = parseHTML(`<div class=\"sc-iGgVNO clwwQL d-flex align-items-center gap-1 gm-tag-container\">\n" +
"        <div id=\"invoice-id\" class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\"></div>\n" +
"        <div id=\"is-valid-tag\" class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">⟳</div>\n" +
"      </div>`).firstElementChild;\n" +
"            const messageDiv = $('#is-valid-tag', this.container);\n" +
"            this.on('message-change', message => { messageDiv.innerHTML = message; });\n" +
"            const idDiv = $('#invoice-id', this.container);\n" +
"            this.on('id-change', id => { idDiv.innerHTML = id; });\n" +
"        }\n" +
"        const infos = await waitElem('h4.heading-section-3.mr-2', 'Informations');\n" +
"        const tagsContainer = infos.nextSibling;\n" +
"        if (!tagsContainer)\n" +
"            throw new Error('InvoiceDisplayInfos: Impossible de trouver le bloc de tags');\n" +
"        tagsContainer.insertBefore(this.container, tagsContainer.firstChild);\n" +
"        waitFunc(() => findElem('h4.heading-section-3.mr-2', 'Informations')?.nextSibling !== tagsContainer).then(() => { this.appendContainer(); });\n" +
"    }\n" +
"    async loadMessage() {\n" +
"        this.log('load message', this);\n" +
"        if (!this.state.invoice) {\n" +
"            this.message = '⟳';\n" +
"            return;\n" +
"        }\n" +
"        const status = { ...await this.state.invoice.getStatus(), fetchedAt: Date.now() };\n" +
"        this.state.cachedStatus = status;\n" +
"        this.cache.updateItem({ id: status.id }, status, false);\n" +
"        const { message, valid } = status;\n" +
"        return this.message = valid ? '✓' : `✗ ${message}`;\n" +
"    }\n" +
"    async setId() {\n" +
"        if (!this.state.invoice?.id) {\n" +
"            this.id = '';\n" +
"            return;\n" +
"        }\n" +
"        this.id = `#${this.state.invoice?.id}<a title=\"réouvrir cette pièce dans un nouvel onglet\" target=\"_blank\" href=\"${location.href.split('/').slice(0, 5).join('/')}/documents/${this.state.invoice?.id}.html\" >${openInNewTabIcon()}</a>`;\n" +
"    }\n" +
"    async watchEventSave() {\n" +
"        const ref = await waitElem('button', 'Enregistrer');\n" +
"        ref.addEventListener('click', () => { delete this.state.events; });\n" +
"        waitFunc(() => findElem('button', 'Enregistrer') !== ref)\n" +
"            .then(() => { this.watchEventSave(); });\n" +
"    }\n" +
"    async handleCacheChange() {\n" +
"        if (!this.state.invoice)\n" +
"            return;\n" +
"        const cachedStatus = this.cache.find({ id: this.state.invoice.id });\n" +
"        if (!cachedStatus)\n" +
"            return;\n" +
"        const diff = ['message', 'valid'].reduce((acc, key) => {\n" +
"            if (this.state.cachedStatus?.[key] !== cachedStatus?.[key])\n" +
"                acc.push({ key, oldValue: this.state.cachedStatus?.[key], newValue: cachedStatus?.[key] });\n" +
"            return acc;\n" +
"        }, []);\n" +
"        if (diff.length) {\n" +
"            this.reload();\n" +
"            this.log('handleCacheChange', diff);\n" +
"        }\n" +
"    }\n" +
"}\n" +
"\n" +
"/** Add \"Archive\" button on bonded invoice in transaction pannel */\n" +
"class ArchiveGroupedDocument extends Service {\n" +
"    async init() {\n" +
"        this.state = [];\n" +
"        this.state.push('wait for transaction detail panel');\n" +
"        await waitPage('transactionDetail');\n" +
"        this.state.push('wait for items');\n" +
"        let item = await this.getNext();\n" +
"        while (true) {\n" +
"            this.addGroupedActions(item);\n" +
"            item = await this.getNext();\n" +
"        }\n" +
"    }\n" +
"    async getNext() {\n" +
"        return await waitFunc(() => $('.ui-card:not(.GM-archive-grouped-document) a.ui-button.ui-button-secondary+button.ui-button-secondary-danger') ?? false);\n" +
"    }\n" +
"    addGroupedActions(item) {\n" +
"        const card = item.closest('.ui-card');\n" +
"        card?.classList.add('GM-archive-grouped-document');\n" +
"        const id = getReactPropValue(card, 'invoice')?.id;\n" +
"        if (!card || !id) {\n" +
"            if (card?.textContent?.includes(\"ajouté dans la GED le\"))\n" +
"                return;\n" +
"            this.error('addGroupedActions : no invoice found', { item, card, id });\n" +
"            return;\n" +
"        }\n" +
"        const buttonsBlock = $(`a[href$=\"${id}.html\"]`, card)?.closest('div');\n" +
"        if (!buttonsBlock) {\n" +
"            this.error('addGroupedActions : no buttons block found', card);\n" +
"            return;\n" +
"        }\n" +
"        const buttonClass = buttonsBlock.querySelector('button')?.className ?? '';\n" +
"        this.state.push(`addGroupedActions for #${id}`);\n" +
"        this.log('addGroupedActions', { card, buttonsBlock, id });\n" +
"        buttonsBlock.insertBefore(parseHTML(`\n" +
"        <button\n" +
"          class=\"dms-button noCaret ui-button ui-button-sm ui-button-secondary ui-button-secondary-primary ui-button-sm-icon-only\" aria-haspopup=\"true\" aria-expanded=\"false\" type=\"button\">\n" +
"          <svg class=\"MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0 css-q7mezt\" focusable=\"false\" aria-hidden=\"true\" viewBox=\"0 0 24 24\" data-testid=\"DriveFileMoveRoundedIcon\" style=\"font-size: 1rem;\"><path d=\"M20 6h-8l-1.41-1.41C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-8 9.79V14H9c-.55 0-1-.45-1-1s.45-1 1-1h3v-1.79c0-.45.54-.67.85-.35l2.79 2.79c.2.2.2.51 0 .71l-2.79 2.79c-.31.31-.85.09-.85-.36\"></path></svg>\n" +
"        </button>\n" +
"        <button class=\"archive-button ${buttonClass}\">&nbsp;x&nbsp;</button>\n" +
"      `), buttonsBlock.firstElementChild);\n" +
"        const archiveButton = $('.archive-button', buttonsBlock);\n" +
"        Tooltip.make({ target: archiveButton, text: 'Archiver ce justificatif' });\n" +
"        archiveButton.addEventListener('click', () => this.archive(card));\n" +
"        const dmsButton = $('.dms-button', buttonsBlock);\n" +
"        Tooltip.make({ target: dmsButton, text: 'Envoyer la facture en GED' });\n" +
"        dmsButton.addEventListener('click', () => this.dms(card));\n" +
"    }\n" +
"    async archive(card) {\n" +
"        const id = getReactProps(card, 2).invoice.id;\n" +
"        const buttonsBlock = $(`a[href$=\"${id}.html\"]`, card).closest('div');\n" +
"        if (!buttonsBlock) {\n" +
"            this.error('archive : no buttons block found', card);\n" +
"            return;\n" +
"        }\n" +
"        const archiveButton = $('.archive-button', buttonsBlock);\n" +
"        this.log('archive invoice', { card, id });\n" +
"        archiveButton.disabled = true;\n" +
"        archiveButton.classList.add('disabled');\n" +
"        archiveButton.innerText = '⟳';\n" +
"        const invoice = await Invoice.load(id);\n" +
"        if (!invoice) {\n" +
"            alert('Impossible de trouver la facture #' + id);\n" +
"            archiveButton.innerText = '⚠';\n" +
"            return;\n" +
"        }\n" +
"        const invoiceDoc = await invoice?.getInvoice();\n" +
"        const docs = await invoice.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(docs.map((doc) => doc.getGdoc()));\n" +
"        const transactions = gdocs\n" +
"            .filter((doc) => doc.type === \"Transaction\")\n" +
"            .map((doc) => `#${doc.id}`);\n" +
"        await invoice.update({\n" +
"            invoice_number: `§ ${transactions.join(' - ')} - ${invoiceDoc.invoice_number}`\n" +
"        });\n" +
"        await invoice.archive();\n" +
"        buttonsBlock.closest('.ui-card')?.remove();\n" +
"        this.log(`archive invoice #${id}`, { invoice });\n" +
"        ValidMessage.getInstance().reload();\n" +
"    }\n" +
"    async dms(card) {\n" +
"        const id = getReactProps(card, 2).invoice.id;\n" +
"        const buttonsBlock = $(`a[href$=\"${id}.html\"]`, card).closest('div');\n" +
"        if (!buttonsBlock) {\n" +
"            this.error('dms : no buttons block found', card);\n" +
"            return;\n" +
"        }\n" +
"        const dmsButton = $('.dms-button', buttonsBlock);\n" +
"        this.log('move to dms', { card, id });\n" +
"        dmsButton.disabled = true;\n" +
"        dmsButton.classList.add('disabled');\n" +
"        dmsButton.innerText = '⟳';\n" +
"        const invoice = await Invoice.load(id);\n" +
"        if (!invoice) {\n" +
"            alert('Impossible de trouver la facture #' + id);\n" +
"            dmsButton.innerText = '⚠';\n" +
"            return;\n" +
"        }\n" +
"        const dmsItem = await invoice.moveToDms();\n" +
"        if (!dmsItem) {\n" +
"            this.error('move to dms error');\n" +
"            return;\n" +
"        }\n" +
"        buttonsBlock.closest('.ui-card')?.remove();\n" +
"        this.log('moveToDms', { dmsItem });\n" +
"        ValidMessage.getInstance().reload();\n" +
"    }\n" +
"}\n" +
"\n" +
"class FixTab extends Service {\n" +
"    async init() {\n" +
"        await waitPage('invoiceDetail');\n" +
"        document.addEventListener('keydown', event => this.handleKeyDown(event));\n" +
"        this.watch();\n" +
"    }\n" +
"    handleKeyDown(event) {\n" +
"        if (event.code !== 'Tab')\n" +
"            return;\n" +
"        const order = this.getOrder(event.target);\n" +
"        const toSelect = event.shiftKey ? order?.previous : order?.next;\n" +
"        if (!toSelect || !order)\n" +
"            return;\n" +
"        event.preventDefault();\n" +
"        event.stopPropagation();\n" +
"        const currentContainer = order.current.closest('.show.dropdown');\n" +
"        if (currentContainer)\n" +
"            currentContainer.classList.remove('show');\n" +
"        const toSelectContainer = toSelect.closest('.dropdown');\n" +
"        if (toSelectContainer)\n" +
"            toSelectContainer.classList.add('show');\n" +
"        toSelect.focus();\n" +
"        toSelect.setSelectionRange(0, toSelect.value.length);\n" +
"    }\n" +
"    getOrder(target) {\n" +
"        const orderList = this.getOrderList();\n" +
"        const currentSelector = orderList.find(selector => $(selector) === target);\n" +
"        if (!currentSelector)\n" +
"            return null;\n" +
"        const searchList = orderList.slice(orderList.indexOf(currentSelector) + 1)\n" +
"            .concat(orderList.slice(0, orderList.indexOf(currentSelector)));\n" +
"        const nextSelector = searchList.find(selector => $(selector));\n" +
"        const previousSelector = searchList.reverse().find(selector => $(selector));\n" +
"        return {\n" +
"            current: $(currentSelector),\n" +
"            previous: previousSelector ? $(previousSelector) : null,\n" +
"            next: nextSelector ? $(nextSelector) : null,\n" +
"        };\n" +
"    }\n" +
"    getOrderList() {\n" +
"        if (findElem('button', 'Client'))\n" +
"            return [\n" +
"                '.input-group-prepend+.input-group-append input',\n" +
"                'div[data-testid=\"thirdpartyAutocompleteAsyncSelect\"] input',\n" +
"                'input[name=\"invoice_number\"]',\n" +
"                'input[name=\"currency_amount\"]',\n" +
"                'input[placeholder=\"Rechercher\"]',\n" +
"                'input[name=\"date\"]',\n" +
"                'input[name=\"deadline\"]',\n" +
"            ];\n" +
"        return [\n" +
"            'div[data-testid=\"thirdpartyAutocompleteAsyncSelect\"] input',\n" +
"            'input[name=\"invoice_number\"]',\n" +
"            '.input-group-prepend+.input-group-append input',\n" +
"            'input[name=\"date\"]',\n" +
"            'input[name=\"deadline\"]',\n" +
"            'input[name=\"currency_amount\"]',\n" +
"            'input[name=\"currency_amount\"]+.input-group-append input[placeholder=\"Rechercher\"]',\n" +
"        ];\n" +
"    }\n" +
"    async watch() {\n" +
"        const ref = await waitElem('input[name=\"invoice_number\"]');\n" +
"        ref.focus();\n" +
"        waitFunc(() => $('input[name=\"invoice_number\"]') !== ref).then(() => this.watch());\n" +
"    }\n" +
"}\n" +
"\n" +
"class AllowChangeArchivedInvoiceNumber extends Service {\n" +
"    async init() {\n" +
"        await waitPage('invoiceDetail');\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        document.addEventListener('keyup', async (event) => {\n" +
"            if (event.code !== 'KeyS' || !event.ctrlKey)\n" +
"                return;\n" +
"            this.debug('Ctrl + S pressed');\n" +
"            const invoiceNumberField = $('input[name=invoice_number]');\n" +
"            if (event.target !== invoiceNumberField || !invoiceNumberField) {\n" +
"                this.debug({ invoiceNumberField, eventTarget: event.target });\n" +
"                return;\n" +
"            }\n" +
"            event.preventDefault();\n" +
"            event.stopImmediatePropagation();\n" +
"            const deep = findReactProp(invoiceNumberField, 'initialValues');\n" +
"            const rawInvoice = deep ? getReactProps(invoiceNumberField, deep).initialValues : null;\n" +
"            if (!rawInvoice) {\n" +
"                this.error('Unable to load invoice', { invoiceNumberField, deep, rawInvoice });\n" +
"                return;\n" +
"            }\n" +
"            if (!rawInvoice.archived) {\n" +
"                this.debug('Invoice is not archived');\n" +
"                return;\n" +
"            }\n" +
"            const invoice = Invoice.from(rawInvoice);\n" +
"            await invoice.unarchive();\n" +
"            await invoice.update({ invoice_number: invoiceNumberField.value });\n" +
"            await invoice.archive();\n" +
"            InvoiceDisplayInfos.getInstance().reload();\n" +
"        });\n" +
"    }\n" +
"}\n" +
"\n" +
"class TransactionPanelHotkeys extends Service {\n" +
"    async init() {\n" +
"        document.addEventListener('keydown', event => this.handleKeydown(event));\n" +
"    }\n" +
"    async handleKeydown(event) {\n" +
"        if (!findElem('h3', 'Transactions'))\n" +
"            return; // Transactions panel\n" +
"        this.debug('handleKeydown', event);\n" +
"        if (event.altKey) {\n" +
"            switch (event.code) {\n" +
"                case 'KeyE': return this.filterClick('button.ui-filters-button--size-sm.ui-filters-button:nth-of-type(3)', event);\n" +
"                case 'KeyD': return this.filterClick('Date', event);\n" +
"            }\n" +
"        }\n" +
"        if (event.ctrlKey) {\n" +
"            switch (event.code) {\n" +
"                case 'KeyS': return this.save();\n" +
"            }\n" +
"        }\n" +
"        else\n" +
"            switch (event.code) {\n" +
"                case 'NumpadEnter':\n" +
"                case 'Enter':\n" +
"                    return this.manageEnter(event);\n" +
"            }\n" +
"    }\n" +
"    async filterClick(selector, event) {\n" +
"        event.preventDefault();\n" +
"        const filterButton = $(selector);\n" +
"        if (!filterButton)\n" +
"            this.log(`bouton \"${selector}\" introuvable`);\n" +
"        if (event.shiftKey) {\n" +
"            $('div[aria-label=Effacer]', filterButton)?.click();\n" +
"            return;\n" +
"        }\n" +
"        filterButton?.click();\n" +
"        const inputContainerId = filterButton.getAttribute('aria-controls');\n" +
"        const inputField = await waitElem(`div[id=\"${inputContainerId}\"] input`, '', 2000);\n" +
"        if (!inputField)\n" +
"            this.log(`champ \"div[id=\"${inputContainerId}\"] input\" introuvable`);\n" +
"        inputField?.focus();\n" +
"    }\n" +
"    async manageEnter(event) {\n" +
"        if (event.target instanceof HTMLInputElement && event.target.getAttribute('aria-label') === 'Date') {\n" +
"            if (/\\d\\d\\/\\d\\d\\/\\d\\d\\d\\d - __\\/__\\/____/u.test(event.target.value)) {\n" +
"                const date = event.target.value.slice(0, 10);\n" +
"                event.target.value = `${date} - ${date}`;\n" +
"                getReactProps(event.target).onChange({ target: event.target });\n" +
"                const validButton = $('button[data-tracking-action=\"Transactions Page - Date Filter click\"]');\n" +
"                await waitFunc(() => !validButton?.disabled);\n" +
"            }\n" +
"            return $('button[data-tracking-action=\"Transactions Page - Date Filter click\"]')?.click();\n" +
"        }\n" +
"    }\n" +
"    save() {\n" +
"        this.saveLedgerEvents();\n" +
"        this.confirmRules();\n" +
"    }\n" +
"    saveLedgerEvents() {\n" +
"        this.log('saveLedgerEvents()');\n" +
"        findElem('button', 'Enregistrer')?.click();\n" +
"    }\n" +
"    confirmRules() {\n" +
"        this.log('confirmRules()');\n" +
"        findElem('button', 'Confirmer')?.click();\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * Add infos on each entry form block\n" +
" */\n" +
"class EntryBlocInfos extends Service {\n" +
"    async init() {\n" +
"        const className = `${this.constructor.name}-managed`;\n" +
"        const selector = `form[name^=\"DocumentEntries-\"]:not(.${className})`;\n" +
"        while (true) {\n" +
"            const doc = await waitElem(selector);\n" +
"            doc.classList.add(className);\n" +
"            this.fill(doc);\n" +
"        }\n" +
"    }\n" +
"    /**\n" +
"     * Add infos on an entry bloc\n" +
"     */\n" +
"    fill(form) {\n" +
"        const id = form.getAttribute('name')?.split('-').pop();\n" +
"        const header = $('header', form);\n" +
"        if (!header)\n" +
"            return;\n" +
"        const className = header.firstElementChild?.className ?? '';\n" +
"        header.insertBefore(parseHTML(`<div class=\"${className}\">\n" +
"      <span class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">#${id}</span>\n" +
"    </div>`), $('.border-bottom', header));\n" +
"    }\n" +
"}\n" +
"\n" +
"class AddInvoiceIdColumn extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.name = this.constructor.name;\n" +
"    }\n" +
"    async init() {\n" +
"        await Promise.race([\n" +
"            waitElem('h3', 'Factures fournisseurs'),\n" +
"        ]);\n" +
"        const anchor = await waitElem('.tiny-caption', 'Statut');\n" +
"        const to = setTimeout(() => this.fill(anchor), 1000);\n" +
"        await waitFunc(() => findElem('.tiny-caption', 'Statut') !== anchor);\n" +
"        clearTimeout(to);\n" +
"        this.init();\n" +
"    }\n" +
"    fill(anchor) {\n" +
"        const table = anchor.closest('table');\n" +
"        if (!table)\n" +
"            return;\n" +
"        this.log(\"fill\", table);\n" +
"        const headRow = $('thead tr', table);\n" +
"        $('th.id-column', headRow)?.remove();\n" +
"        headRow?.insertBefore(parseHTML(`<th class=\"id-column th-element border-top-0 border-bottom-0 box-shadow-bottom-secondary-200 align-middle p-1 text-secondary-700 font-size-075 text-nowrap is-pinned\">\n" +
"      <div class=\"sc-ivxoEo dLrrKG d-flex flex-row sc-eSclpK dSYLCv\">\n" +
"        <span class=\"tiny-caption font-weight-bold\">ID</span>\n" +
"      </div>\n" +
"    </th>`), $('th+th', headRow));\n" +
"        const bodyRows = $$('tbody tr', table);\n" +
"        this.log({ bodyRows });\n" +
"        bodyRows.forEach(row => {\n" +
"            const id = getReactProps(row, 1).data.id;\n" +
"            $('.id-column', row)?.remove();\n" +
"            row.insertBefore(parseHTML(`<td style=\"cursor: auto;\" class=\"id-column px-1 py-0_5 align-middle border-top-0 box-shadow-bottom-secondary-100\">\n" +
"          <span class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">#${id}</span>\n" +
"        </td>`), $('td+td', row));\n" +
"            $('.id-column', row)?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });\n" +
"        });\n" +
"    }\n" +
"}\n" +
"\n" +
"function blobToUrl(blob) {\n" +
"    return new Promise((resolve, reject) => {\n" +
"        const reader = new FileReader();\n" +
"        reader.onloadend = () => resolve(reader.result); // Résoudre avec la Data URL\n" +
"        reader.onerror = reject; // Rejeter en cas d'erreur\n" +
"        reader.readAsDataURL(blob); // Lire le Blob comme Data URL\n" +
"    });\n" +
"}\n" +
"\n" +
"async function fetchToDataURL(url) {\n" +
"    const response = await fetch(url);\n" +
"    const blob = await response.blob();\n" +
"    return await blobToUrl(blob);\n" +
"}\n" +
"\n" +
"/**\n" +
" * Allow to rotate preview img of attachment pieces\n" +
" */\n" +
"class RotateImg extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.rotateButton = (parseHTML(`<button>⟳</button>`).firstElementChild);\n" +
"    }\n" +
"    /**\n" +
"     * @inheritDoc\n" +
"     */\n" +
"    async init() {\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        let modal;\n" +
"        while (await waitFunc(() => $('div.ui-modal') !== modal)) {\n" +
"            this.emit('new-modal');\n" +
"            modal = $('div.ui-modal');\n" +
"            const closeButton = $('button.ui-modal-header-close-button', modal);\n" +
"            if (!modal || !closeButton)\n" +
"                continue;\n" +
"            modal.classList.remove('ui-modal-dialog-centered');\n" +
"            modal.style.right = '1em';\n" +
"            modal.style.top = '50%';\n" +
"            modal.style.transform = 'translate(0,-50%)';\n" +
"            modal.style.position = 'absolute';\n" +
"            this.rotateButton.classList.add(...closeButton.className.split(' '));\n" +
"            this.rotateButton.style.marginRight = '2.5em';\n" +
"            closeButton.parentElement?.insertBefore(this.rotateButton, closeButton);\n" +
"            $$('img', modal).forEach(image => this.handleImage(image));\n" +
"        }\n" +
"    }\n" +
"    async handleImage(image) {\n" +
"        let rotation = 0;\n" +
"        const mainImage = await fetchToDataURL(image.src);\n" +
"        const rotations = [mainImage];\n" +
"        const handleRotation = async () => {\n" +
"            rotation = (rotation + 1) % 4;\n" +
"            if (!rotations[rotation])\n" +
"                rotations[rotation] = await rotateImage(mainImage, rotation);\n" +
"            image.src = rotations[rotation];\n" +
"        };\n" +
"        this.rotateButton.addEventListener('click', handleRotation);\n" +
"        this.once('new-modal', () => {\n" +
"            this.rotateButton.removeEventListener('click', handleRotation);\n" +
"        });\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * Ajoute du code CSS à la page en créant une balise style\n" +
" * @param {string} cssCode - Le code CSS à injecter\n" +
" * @param {string} [id] - Identifiant optionnel pour la balise style\n" +
" * @return {HTMLStyleElement} - L'élément style créé\n" +
" */\n" +
"function injectCSS(cssCode, id = null) {\n" +
"    const styleElement = document.createElement('style');\n" +
"    styleElement.type = 'text/css';\n" +
"    if (id)\n" +
"        styleElement.id = id;\n" +
"    styleElement.appendChild(document.createTextNode(cssCode));\n" +
"    document.body.appendChild(styleElement);\n" +
"    return styleElement;\n" +
"}\n" +
"\n" +
"class TransactionPannelStyle extends Service {\n" +
"    async init() {\n" +
"        this.hideOldDateBanner();\n" +
"        this.fixAccountNumbersOweflow();\n" +
"        this.fixMatchSuggestionTextOverlap();\n" +
"        this.expandDMSNameInputField();\n" +
"    }\n" +
"    async hideOldDateBanner() {\n" +
"        const ref = await waitElem('span', 'Vous êtes en train de visualiser un exercice antérieur à l’exercice courant.');\n" +
"        const banner = ref.closest('main>div>div.d-block');\n" +
"        this.log({ ref, banner });\n" +
"        if (banner) {\n" +
"            banner.style.height = '0';\n" +
"            banner.style.overflow = 'hidden';\n" +
"            const column = $('.panel-opened>.flex-column');\n" +
"            if (column)\n" +
"                column.style.top = '40px';\n" +
"        }\n" +
"        await waitFunc(() => findElem('span', 'Vous êtes en train de visualiser un exercice antérieur à l’exercice courant.') !== ref);\n" +
"        this.hideOldDateBanner();\n" +
"    }\n" +
"    fixAccountNumbersOweflow() {\n" +
"        injectCSS(`\n" +
"      html body .ui-transition-collapse.ui-transition-collapse {\n" +
"        overflow: unset;\n" +
"      }\n" +
"    `);\n" +
"    }\n" +
"    /**\n" +
"     * Corrige l'affichage des factures suggérées dans le détail d'une transaction\n" +
"     */\n" +
"    fixMatchSuggestionTextOverlap() {\n" +
"        injectCSS(`\n" +
"      .ui-card.border-automation-500 .flex-column .text-right {\n" +
"        margin-top: 1.2em;\n" +
"      }\n" +
"    `);\n" +
"    }\n" +
"    /**\n" +
"     * Augmente la taille du champ \"nom\" des fichiers de la GED\n" +
"     */\n" +
"    expandDMSNameInputField() {\n" +
"        injectCSS(`\n" +
"      form[name=\"DocumentNameForm\"] > div.d-flex {\n" +
"        flex-direction: column;\n" +
"        gap: 0.5em;\n" +
"      }\n" +
"\n" +
"      form[name=\"DocumentNameForm\"] > div.d-flex > div {\n" +
"        margin-left: 0 !important;\n" +
"      }\n" +
"    `);\n" +
"    }\n" +
"}\n" +
"\n" +
"class AutoSearchTransaction extends Service {\n" +
"    async init() {\n" +
"        await waitPage(\"invoiceDetail\");\n" +
"        this.createButton();\n" +
"        this.watch();\n" +
"    }\n" +
"    createButton() {\n" +
"        this.container = parseHTML(`<button\n" +
"      class=\"${getButtonClassName()} auto-find-transaction-button\"\n" +
"      style=\"margin-left: 1em; padding: .2em;\"\n" +
"    >🔍</button>`).firstElementChild;\n" +
"        Tooltip.make({ target: this.container, text: \"Chercher une transaction de ce montant\" });\n" +
"        this.container.addEventListener(\"click\", (event) => {\n" +
"            const amountInput = findElem('input[name=\"currency_amount\"]');\n" +
"            const filters = [\n" +
"                {\n" +
"                    field: \"amount\",\n" +
"                    operator: \"abs_eq\",\n" +
"                    value: amountInput.value.replace(\",\", \".\").replace(/ /gu, \"\"),\n" +
"                },\n" +
"            ];\n" +
"            const [minDate, maxDate] = [\n" +
"                $('input[name=\"date\"]'),\n" +
"                $('input[name=\"deadline\"]'),\n" +
"            ].map((input, id) => {\n" +
"                if (!input.value)\n" +
"                    return id ? \"2025-12-31\" : \"2024-01-01\";\n" +
"                return new Date(input.value.split(\"/\").reverse().join(\"-\")).toISOString();\n" +
"            });\n" +
"            filters.push({\n" +
"                field: \"date\",\n" +
"                operator: \"gteq\",\n" +
"                value: minDate,\n" +
"            }, {\n" +
"                field: \"date\",\n" +
"                operator: \"lteq\",\n" +
"                value: maxDate,\n" +
"            });\n" +
"            const invoiceNumber = $('input[name=\"invoice_number\"');\n" +
"            const invoice = APIInvoice.Create(getReactPropValue(invoiceNumber, \"invoice\"));\n" +
"            const match = invoiceNumber.value.match(/CHQ ?(?:n° ?)?(?<chq_number>\\d+)/u)?.groups;\n" +
"            if (match) {\n" +
"                if (invoice.direction === \"supplier\") {\n" +
"                    filters.push({\n" +
"                        field: \"label\",\n" +
"                        operator: \"search\",\n" +
"                        value: `CHEQUE ${match.chq_number}`,\n" +
"                    });\n" +
"                }\n" +
"                else {\n" +
"                    filters.push({\n" +
"                        field: \"label\",\n" +
"                        operator: \"search\",\n" +
"                        value: `REMISE CHEQUE `,\n" +
"                    });\n" +
"                }\n" +
"            }\n" +
"            const urlRoot = location.href.split(\"/\").slice(0, 6).join(\"/\");\n" +
"            const url = `${urlRoot}/transactions?filter=${JSON.stringify(filters)}&per_page=300&sort=-date&sidepanel_tab=reconciliation&period_start=${minDate.slice(0, 4)}-01-01&period_end=${maxDate.slice(0, 4)}-12-31`;\n" +
"            openInTab(url);\n" +
"            navigator.clipboard.writeText(getParam(location.href, \"id\"));\n" +
"        });\n" +
"    }\n" +
"    async watch() {\n" +
"        const refEl = await waitPage(\"invoiceDetail\");\n" +
"        const amountInput = findElem('input[name=\"currency_amount\"]');\n" +
"        amountInput.closest(\".ui-form-group\").querySelector(\"label\").appendChild(this.container);\n" +
"        await waitFunc(async () => (await waitPage(\"invoiceDetail\")) !== refEl);\n" +
"        this.init();\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * Allow to rotate preview img of attachment pieces\n" +
" */\n" +
"class DMSRotateImg extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.rotateButton = (parseHTML(`<button style=\"padding: 0.5em 0.6em;\">⟳</button>`).firstElementChild);\n" +
"        this.state = {\n" +
"            inMove: false,\n" +
"            from: { x: 0, y: 0 },\n" +
"            old: { x: 0, y: 0 },\n" +
"            matrix: {\n" +
"                translationX: 0,\n" +
"                translationY: 0,\n" +
"                zoom: 1,\n" +
"            },\n" +
"            zoomMin: 1,\n" +
"        };\n" +
"    }\n" +
"    /**\n" +
"     * @inheritDoc\n" +
"     */\n" +
"    async init() {\n" +
"        await waitPage('DMSDetail');\n" +
"        this.rotateButton.className = getButtonClassName();\n" +
"        const container = findElem('div', 'Nom du Fichier').closest('div.w-100');\n" +
"        this.container = parseHTML(`<div class=\"${container.firstElementChild.className}\"></div>`).firstElementChild;\n" +
"        this.container.appendChild(this.rotateButton);\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        await waitPage('DMSDetail');\n" +
"        const rightList = findElem('div', 'Nom du Fichier').closest('div.w-100');\n" +
"        rightList.appendChild(this.container);\n" +
"        const iframe = $('iframe', rightList.parentElement.previousElementSibling);\n" +
"        if (iframe) {\n" +
"            const srcContent = await fetch(iframe.src);\n" +
"            const url = srcContent.redirected && new URL(srcContent.url);\n" +
"            this.log({ iframeSrc: iframe.src, srcContent, url });\n" +
"            if (url?.searchParams.get('response-content-type') !== 'application/pdf') {\n" +
"                const replacement = parseHTML(`\n" +
"        <div class=\"border rounded border-secondary-200\">\n" +
"          <div class=\"pan-container sc-ewIWWK bVhudS overflow-hidden\" style=\"user-select: none;\">\n" +
"            <div class=\"matrix\" style=\"transform: matrix(1, 0, 0, 1, 0, 0);\">\n" +
"              <div class=\"img-div\">\n" +
"                <img src=\"${url}\" alt=\"jpeg image\" class=\"sc-Qotzb guRGpi\">\n" +
"              </div>\n" +
"            </div>\n" +
"          </div>\n" +
"        </div>\n" +
"      `).firstElementChild;\n" +
"                iframe.parentElement.insertBefore(replacement, iframe);\n" +
"                iframe.hidden = true;\n" +
"                this.makePanContainerDynamic();\n" +
"                this.on('reload', () => {\n" +
"                    this.log('reload', { replacement });\n" +
"                    replacement.remove();\n" +
"                });\n" +
"            }\n" +
"        }\n" +
"        if ($('.pan-container')) {\n" +
"            $$('img', $('.pan-container'))\n" +
"                .forEach(image => this.handleImage(image));\n" +
"        }\n" +
"        const ref = getReactProps(rightList, 7).item;\n" +
"        await waitFunc(() => getReactProps(rightList, 7).item !== ref);\n" +
"        this.emit('reload');\n" +
"        this.log('reload');\n" +
"        this.watch();\n" +
"    }\n" +
"    async handleImage(image) {\n" +
"        let rotation = 0;\n" +
"        const mainImage = await fetchToDataURL(image.src);\n" +
"        const rotations = [mainImage];\n" +
"        const handleRotation = async () => {\n" +
"            rotation = (rotation + 1) % 4;\n" +
"            if (!rotations[rotation])\n" +
"                rotations[rotation] = await rotateImage(mainImage, rotation);\n" +
"            image.src = rotations[rotation];\n" +
"            this.reset();\n" +
"        };\n" +
"        this.rotateButton.addEventListener('click', handleRotation);\n" +
"        this.once('reload', () => {\n" +
"            this.rotateButton.removeEventListener('click', handleRotation);\n" +
"        });\n" +
"    }\n" +
"    makePanContainerDynamic() {\n" +
"        this.panContainer = $('.pan-container');\n" +
"        this.matrixEl = $('.matrix', this.panContainer);\n" +
"        this.img = $('img', this.matrixEl);\n" +
"        this.reset();\n" +
"        document.addEventListener('mouseup', event => {\n" +
"            this.state.inMove = false;\n" +
"            this.panContainer.style.cursor = 'grab';\n" +
"        });\n" +
"        this.panContainer.addEventListener('mousedown', (event) => {\n" +
"            this.state.inMove = true;\n" +
"            this.panContainer.style.cursor = 'move';\n" +
"            this.state.from.x = event.clientX;\n" +
"            this.state.from.y = event.clientY;\n" +
"            this.state.old.x = this.state.matrix.translationX;\n" +
"            this.state.old.y = this.state.matrix.translationY;\n" +
"        });\n" +
"        this.panContainer.addEventListener('dragstart', event => {\n" +
"            event.preventDefault();\n" +
"            event.stopPropagation();\n" +
"        }, true);\n" +
"        document.addEventListener('mousemove', (event) => {\n" +
"            if (!this.state.inMove)\n" +
"                return;\n" +
"            event.preventDefault();\n" +
"            event.stopPropagation();\n" +
"            event.stopImmediatePropagation();\n" +
"            this.state.matrix.translationX = event.clientX - this.state.from.x + this.state.old.x;\n" +
"            this.state.matrix.translationY = event.clientY - this.state.from.y + this.state.old.y;\n" +
"            this.setMatrix();\n" +
"        }, { capture: true });\n" +
"        this.panContainer.addEventListener('wheel', (event) => {\n" +
"            event.stopPropagation();\n" +
"            event.preventDefault();\n" +
"            const absDelta = Math.abs(event.deltaY);\n" +
"            const isTrackpad = absDelta !== Math.floor(absDelta) || absDelta < 80;\n" +
"            const offset = event.deltaY / (isTrackpad ? 50 : -4e3);\n" +
"            this.state.matrix.zoom = Math.max(this.state.zoomMin, this.state.matrix.zoom + offset);\n" +
"            this.setMatrix();\n" +
"        });\n" +
"        this.panContainer.addEventListener('mouseup', () => {\n" +
"            $('input[name=\"name\"]').focus();\n" +
"        });\n" +
"    }\n" +
"    async reset() {\n" +
"        await new Promise(rs => { this.img.addEventListener('load', rs); });\n" +
"        await new Promise(rs => { requestAnimationFrame(() => { setTimeout(rs, 0); }); });\n" +
"        const containerHeight = parseInt(getComputedStyle(this.panContainer).height);\n" +
"        const containerWidth = parseInt(getComputedStyle(this.panContainer).width);\n" +
"        const imgHeight = this.img.height;\n" +
"        const imgWidth = this.img.width;\n" +
"        this.state.zoomMin = Math.min(containerHeight / imgHeight, containerWidth / imgWidth);\n" +
"        this.state.matrix.zoom = this.state.zoomMin;\n" +
"        this.state.matrix.translationX = -(containerWidth - (containerWidth * this.state.zoomMin)) / 2;\n" +
"        this.state.matrix.translationY = -(containerHeight - (containerHeight * this.state.zoomMin)) / 2;\n" +
"        this.log({ containerHeight, containerWidth, imgHeight, imgWidth, class: this });\n" +
"        this.setMatrix();\n" +
"    }\n" +
"    setMatrix() {\n" +
"        const matrix = [\n" +
"            this.state.matrix.zoom,\n" +
"            0,\n" +
"            0,\n" +
"            this.state.matrix.zoom,\n" +
"            this.state.matrix.translationX,\n" +
"            this.state.matrix.translationY\n" +
"        ].join(', ');\n" +
"        this.matrixEl.style.transform = `matrix(${matrix})`;\n" +
"    }\n" +
"}\n" +
"\n" +
"const log = new Logger('GMXmlHttpRequest');\n" +
"function GMXmlHttpRequest(data) {\n" +
"    return new Promise((resolve) => {\n" +
"        log.log('request', { data });\n" +
"        if (typeof data === 'string')\n" +
"            data = { url: data };\n" +
"        const id = uniquid();\n" +
"        const handle = (message) => {\n" +
"            if (message.data.id !== id || message.data.source !== 'GM.xmlHttpRequest')\n" +
"                return;\n" +
"            window.removeEventListener('message', handle);\n" +
"            try {\n" +
"                const result = resolve(JSON.parse(message.data.response));\n" +
"                log.log('loadend', { result, request: data, response: message });\n" +
"            }\n" +
"            catch (error) {\n" +
"                log.log('loadend', { request: data, response: message, error });\n" +
"                resolve(JSON.parse(message.data.response));\n" +
"            }\n" +
"        };\n" +
"        window.addEventListener('message', handle);\n" +
"        window.postMessage({\n" +
"            id,\n" +
"            target: 'GM.xmlHttpRequest',\n" +
"            payload: {\n" +
"                method: 'GET',\n" +
"                data: data.body,\n" +
"                ...data,\n" +
"            },\n" +
"        });\n" +
"    });\n" +
"}\n" +
"\n" +
"/**\n" +
" * Display validation status on DMS items\n" +
" */\n" +
"class DMSDisplayStatus extends Service {\n" +
"    /**\n" +
"     * @inheritDoc\n" +
"     */\n" +
"    async init() {\n" +
"        await waitPage('DMSDetail');\n" +
"        const container = findElem('div', 'Nom du Fichier').closest('div.w-100');\n" +
"        this.container = parseHTML(`<div class=\"${container.firstElementChild.className}\"></div>`).firstElementChild;\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        await waitPage('DMSDetail');\n" +
"        const rightList = findElem('div', 'Nom du Fichier').closest('div.w-100');\n" +
"        const ref = getReactProps(rightList, 7).item;\n" +
"        rightList.insertBefore(this.container, rightList.firstChild);\n" +
"        const item = new DMSItem(ref);\n" +
"        const dmsItem = await item.getItem();\n" +
"        const message = await item.getValidMessage();\n" +
"        this.container.innerHTML = `#${dmsItem.itemable_id} (${dmsItem.id})<br/>${message}`;\n" +
"        const isOk = message === 'OK';\n" +
"        this.container.classList.toggle('bg-warning-100', !isOk);\n" +
"        this.container.classList.toggle('bg-primary-100', isOk);\n" +
"        if (!isOk) {\n" +
"            const input = $('input[name=\"name\"]');\n" +
"            input?.focus();\n" +
"            input?.select();\n" +
"            const indexes = await item.partialMatch(input.value);\n" +
"            this.log('partialMatch indexes', indexes, [\n" +
"                input.value,\n" +
"                input.value.slice(0, indexes[0]),\n" +
"                input.value.slice(indexes[0], indexes[1]),\n" +
"                input.value.slice(indexes[1]),\n" +
"            ]);\n" +
"            input.selectionStart = indexes[0];\n" +
"            input.selectionEnd = indexes[1];\n" +
"        }\n" +
"        await waitFunc(() => getReactProps(rightList, 7)?.item !== ref);\n" +
"        this.emit('reload');\n" +
"        this.log('reload');\n" +
"        this.watch();\n" +
"    }\n" +
"}\n" +
"\n" +
"class OpenRefTransaction extends Service {\n" +
"    async init() {\n" +
"        await waitPage(\"invoiceDetail\");\n" +
"        this.createButton();\n" +
"        this.watch();\n" +
"    }\n" +
"    createButton() {\n" +
"        this.container = parseHTML(`<a\n" +
"      class=\"${getButtonClassName()} auto-find-transaction-button\"\n" +
"      style=\"margin-left: 1em; padding: .2em;\"\n" +
"      target=\"_blank\"\n" +
"    >${openInNewTabIcon()}</a>`).firstElementChild;\n" +
"        const tooltip = Tooltip.make({\n" +
"            target: this.container,\n" +
"            text: 'Ouvrir la reference dans un nouvel onglet'\n" +
"        });\n" +
"        this.container.addEventListener('click', async (event) => {\n" +
"            const invoiceNumber = findElem('input[name=\"invoice_number\"]').value;\n" +
"            const refId = invoiceNumber.match(/§ ?#(?<refId>\\d*)(?: |$)/u)?.groups.refId;\n" +
"            if (!refId) {\n" +
"                event.preventDefault();\n" +
"                event.stopPropagation();\n" +
"                const mainText = tooltip.getHTML();\n" +
"                tooltip.setText('aucune transaction trouvée');\n" +
"                await sleep(2000);\n" +
"                tooltip.setText(mainText, true);\n" +
"                return;\n" +
"            }\n" +
"            const urlRoot = location.href.split('/').slice(0, 5).join('/');\n" +
"            const url = `${urlRoot}/documents/${refId}.html`;\n" +
"            if (this.container.href !== url) {\n" +
"                event.preventDefault();\n" +
"                event.stopPropagation();\n" +
"                this.container.href = url;\n" +
"                openInTab(url);\n" +
"            }\n" +
"        }, true);\n" +
"    }\n" +
"    async watch() {\n" +
"        const refEl = await waitPage(\"invoiceDetail\");\n" +
"        const invoiceNumber = findElem('input[name=\"invoice_number\"]');\n" +
"        invoiceNumber.closest('.ui-form-group').querySelector('label').appendChild(this.container);\n" +
"        await waitFunc(async () => await waitPage('invoiceDetail') !== refEl);\n" +
"        this.init();\n" +
"    }\n" +
"}\n" +
"\n" +
"class ImproveMatchSuggestions extends Service {\n" +
"    async init() {\n" +
"        await waitPage('transactionDetail');\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        while (await waitPage('transactionDetail')) {\n" +
"            const unmanagedSuggestionButtons = $$('button')\n" +
"                .filter(button => !button.className.includes('GM') && button.innerText === 'Réconcilier');\n" +
"            if (!unmanagedSuggestionButtons.length) {\n" +
"                await sleep(2000);\n" +
"                continue;\n" +
"            }\n" +
"            for (const button of unmanagedSuggestionButtons) {\n" +
"                this.log({ button });\n" +
"                const invoice = getReactProps(button, 20)?.invoice;\n" +
"                const openInvoiceButton = parseHTML(`<a target=\"_blank\" class=\"${getButtonClassName()}\" href=\"${getDocumentLink(invoice.id)}\">\n" +
"            ${openInNewTabIcon()}\n" +
"          </a>`).firstElementChild;\n" +
"                button.parentElement.insertBefore(openInvoiceButton, button.parentElement.firstElementChild);\n" +
"                Tooltip.make({ target: openInvoiceButton, text: 'Voir la facture' });\n" +
"                button.classList.add('GM');\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"}\n" +
"\n" +
"class HighlightWrongDMSFilenames extends Service {\n" +
"    async init() {\n" +
"        await waitPage('transactionDetail');\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        while (await waitPage('transactionDetail')) {\n" +
"            const unmanagedDMSItems = $$('.ui-card:not(.GM) span.tiny-caption').filter(span => (!span.classList.contains('GM')\n" +
"                && span.innerText.startsWith('ajouté dans la GED le ')));\n" +
"            if (!unmanagedDMSItems.length) {\n" +
"                await sleep(2000);\n" +
"                continue;\n" +
"            }\n" +
"            for (const span of unmanagedDMSItems) {\n" +
"                this.debug({ span, fiber: getReact(span) });\n" +
"                const files = getReactProps(span, 11).files;\n" +
"                for (const file of files) {\n" +
"                    const dmsItem = new DMSItem({ id: file.item_id });\n" +
"                    const status = await dmsItem.getValidMessage();\n" +
"                    const card = $(`a[href$=\"${file.item_id}\"]`)?.closest('.ui-card');\n" +
"                    const nameDiv = $('div.d-block', card);\n" +
"                    if (!card || !nameDiv) {\n" +
"                        this.log('nameDiv is null', {\n" +
"                            span, file, files, status, dmsItem, card, nameDiv\n" +
"                        });\n" +
"                        continue;\n" +
"                    }\n" +
"                    card.classList.add('GM');\n" +
"                    this.debug({ nameDiv, file, files, status, closest: nameDiv.closest('.ui-card'), dmsItem });\n" +
"                    if (status !== 'OK') {\n" +
"                        nameDiv.classList.add('bg-warning-100');\n" +
"                        Tooltip.make({ target: nameDiv, text: HTMLToString(status) });\n" +
"                    }\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * Allow to rotate preview img of attachment pieces\n" +
" */\n" +
"class DMSToInvoiceButton extends Service {\n" +
"    /**\n" +
"     * @inheritDoc\n" +
"     */\n" +
"    async init() {\n" +
"        await waitPage('DMSDetail');\n" +
"        this.createButton();\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        await waitPage('DMSDetail');\n" +
"        const div = await waitElem('div', 'Liens avec la comptabilité');\n" +
"        const buttonRef = $('button', div.nextElementSibling);\n" +
"        buttonRef.parentElement.insertBefore(this.toInvoiceButton, buttonRef);\n" +
"        const rightList = findElem('div', 'Nom du Fichier').closest('div.w-100');\n" +
"        const ref = getReactProps(rightList, 7).item;\n" +
"        await waitFunc(() => {\n" +
"            if (!this.toInvoiceButton.className)\n" +
"                this.toInvoiceButton.className = getButtonClassName();\n" +
"            return getReactProps(rightList, 7).item !== ref;\n" +
"        });\n" +
"        this.emit('reload');\n" +
"        this.log('reload');\n" +
"        this.watch();\n" +
"    }\n" +
"    createButton() {\n" +
"        this.toInvoiceButton = (parseHTML(`<button class=\"${getButtonClassName()}\" style=\"padding: 0.5em 0.6em;\">🧾</button>`).firstElementChild);\n" +
"        Tooltip.make({ target: this.toInvoiceButton, text: 'Envoyer en facturation' });\n" +
"        this.toInvoiceButton.addEventListener('click', () => this.moveToInvoice());\n" +
"    }\n" +
"    async moveToInvoice() {\n" +
"        const rightList = findElem('div', 'Nom du Fichier').closest('div.w-100');\n" +
"        const ref = getReactProps(rightList, 7).item;\n" +
"        const item = new DMSItem(ref);\n" +
"        const invoice = await item.toInvoice();\n" +
"        openDocument(invoice.id);\n" +
"    }\n" +
"}\n" +
"\n" +
"class MoveDMSToInvoice extends Service {\n" +
"    async init() {\n" +
"        await waitPage('transactionDetail');\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        while (await waitPage('transactionDetail')) {\n" +
"            const unmanagedDMSItems = $$('.ui-card:not(.GM-to-invoice) span.tiny-caption').filter(span => (!span.classList.contains('GM-to-invoice')\n" +
"                && span.innerText.startsWith('ajouté dans la GED le ')));\n" +
"            if (!unmanagedDMSItems.length) {\n" +
"                await sleep(2000);\n" +
"                continue;\n" +
"            }\n" +
"            for (const span of unmanagedDMSItems) {\n" +
"                this.debug({ span });\n" +
"                const files = getReactProps(span, 11).files;\n" +
"                for (const file of files)\n" +
"                    await this.manageFile(file);\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async manageFile(file) {\n" +
"        const dmsItem = new DMSItem({ id: file.item_id });\n" +
"        const card = $(`a[href$=\"${file.item_id}\"]`)?.closest('.ui-card');\n" +
"        const buttonsBlock = $('button', card).closest('div');\n" +
"        if (card.classList.contains('GM-to-invoice'))\n" +
"            return;\n" +
"        if (!card || !buttonsBlock) {\n" +
"            this.log('unable to find this file card', { file, status, dmsItem, card, buttonsBlock });\n" +
"            return;\n" +
"        }\n" +
"        card.classList.add('GM-to-invoice');\n" +
"        this.debug({ buttonsBlock, file, status, card, dmsItem });\n" +
"        const toInvoiceButton = parseHTML(`<button class=\"${getButtonClassName()} to-invoice-button\">🧾</button>`).firstElementChild;\n" +
"        Tooltip.make({ target: toInvoiceButton, text: 'Sortir de la GED et envoyer en facturation' });\n" +
"        buttonsBlock.insertBefore(toInvoiceButton, buttonsBlock.firstChild);\n" +
"        toInvoiceButton.addEventListener('click', () => this.moveToInvoice(dmsItem, card));\n" +
"    }\n" +
"    async moveToInvoice(item, card) {\n" +
"        const button = $('.to-invoice-button', card);\n" +
"        button.disabled = true;\n" +
"        button.classList.add('disabled');\n" +
"        button.innerText = '⟳';\n" +
"        const invoice = await item.toInvoice();\n" +
"        if (invoice)\n" +
"            card.remove();\n" +
"        else\n" +
"            alert('move to invoice : erreur, voir la console');\n" +
"        this.log('moveToInvoice', { invoice });\n" +
"    }\n" +
"}\n" +
"\n" +
"class DMSListHasLinks extends Service {\n" +
"    async init() {\n" +
"        await waitPage('DMS');\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        await waitPage('DMS');\n" +
"        const cell = await waitElem('tr:not(.GM-has-links) td[role=cell]:nth-child(2) svg');\n" +
"        await this.manageRow(cell);\n" +
"        this.watch();\n" +
"    }\n" +
"    async manageRow(cell) {\n" +
"        const row = cell.closest('tr');\n" +
"        row.classList.add('GM-has-links');\n" +
"        const data = getReactProps(cell, findReactProp(cell, 'data'));\n" +
"        const dmsItem = new DMSItem(data.row.original);\n" +
"        const links = await dmsItem.getLinks();\n" +
"        if (!links.length)\n" +
"            cell.parentElement.appendChild(document.createTextNode('x'));\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * @unreleased\n" +
" */\n" +
"class PreviewDMSFiles extends Service {\n" +
"    async init() {\n" +
"        await waitPage('transactionDetail');\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        while (await waitPage('transactionDetail')) {\n" +
"            const unmanagedDMSItems = $$('.ui-card:not(.GM-preview-dms) span.tiny-caption').filter(span => (span.innerText.startsWith('ajouté dans la GED le ')));\n" +
"            if (!unmanagedDMSItems.length) {\n" +
"                await sleep(2000);\n" +
"                continue;\n" +
"            }\n" +
"            for (const span of unmanagedDMSItems) {\n" +
"                this.debug({ span });\n" +
"                const files = getReactProps(span, 11).files;\n" +
"                for (const file of files)\n" +
"                    await this.manageFile(file);\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async manageFile(file) {\n" +
"        this.log('manageFile', { file });\n" +
"        const dmsItem = new DMSItem({ id: file.item_id });\n" +
"        const card = $(`a[href$=\"${file.item_id}\"]`)?.closest('.ui-card');\n" +
"        const img = $('img', card);\n" +
"        if (card.classList.contains('GM-preview-dms'))\n" +
"            return;\n" +
"        if (!card || !img) {\n" +
"            this.log('unable to find this file card', { file, dmsItem, card, img });\n" +
"            return;\n" +
"        }\n" +
"        card.classList.add('GM-preview-dms');\n" +
"        this.debug({ file, dmsItem, card, img });\n" +
"        img.addEventListener('click', () => this.showDMS(dmsItem));\n" +
"    }\n" +
"    async showDMS(dmsItem) {\n" +
"        const item = await dmsItem.getItem();\n" +
"        const finalUrl = await followRedirections(item.file_url);\n" +
"        const modal = parseHTML(`\n" +
"      <div data-state=\"open\" class=\"ui-modal-overlay\" style=\"pointer-events: auto;\">\n" +
"        <div role=\"dialog\" id=\"radix-:rqs:\" aria-labelledby=\"radix-:rqt:\"\n" +
"          data-state=\"open\" tabindex=\"false\" class=\"ui-modal ui-modal-md\"\n" +
"          style=\"grid-template-rows: auto 1fr auto; pointer-events: auto; right: 1em; top: 50%; transform: translate(0px, -50%); position: absolute;\"\n" +
"        >\n" +
"        <header class=\"ui-modal-header\">\n" +
"            <h2 id=\"radix-:rqt:\" class=\"heading-section-1 mr-3\">${item.name}</h2>\n" +
"            <button\n" +
"                class=\"ui-modal-header-close-button ui-button ui-button-md ui-button-tertiary ui-button-tertiary-primary ui-button-md-icon-only\"\n" +
"                type=\"button\"\n" +
"            >\n" +
"                <svg class=\"MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0 css-q7mezt\"\n" +
"                    focusable=\"false\" aria-hidden=\"true\" viewBox=\"0 0 24 24\"\n" +
"                    data-testid=\"CloseIcon\" style=\"font-size: 1rem;\"\n" +
"                >\n" +
"                    <path d=\"M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"></path>\n" +
"                </svg>\n" +
"            </button>\n" +
"        </header>\n" +
"        <div class=\"ui-modal-body\">\n" +
"            <div class=\"sc-hvigdm hXZdYQ d-block overflow-auto\">\n" +
"                <div style=\"height: 60vh; user-select: none; cursor: crosshair;\">\n" +
"                    <div style=\"position: relative; cursor: zoom-in;\">\n" +
"                        <img src=\"${finalUrl}\" alt=\"${item.name}\" style=\"display: block; visibility: visible; width: 100%;\">\n" +
"                        <div style=\"position: absolute; box-sizing: border-box; pointer-events: none; width: 760px; height: 551.4px; top: 0px; overflow: hidden; left: 0px;\">\n" +
"                            <img src=\"${finalUrl}\" alt=\"${item.name}\" style=\"position: absolute; box-sizing: border-box; display: block; top: 0px; left: 0px; transform: translate(0px); z-index: 1; visibility: hidden; width: auto;\">\n" +
"                        </div>\n" +
"                    </div>\n" +
"                </div>\n" +
"            </div>\n" +
"        </div>\n" +
"      </div>\n" +
"    `).firstElementChild;\n" +
"        modal.querySelector('.ui-modal-header-close-button')?.addEventListener('click', () => modal.remove());\n" +
"        document.body.appendChild(modal);\n" +
"    }\n" +
"}\n" +
"/**\n" +
" * Fetch given URL and follow all redirections. Finally returns the last URL\n" +
" * @param url URL to fetch\n" +
" */\n" +
"async function followRedirections(url) {\n" +
"    const response = await fetch(url);\n" +
"    if (response.url !== url)\n" +
"        return followRedirections(response.url);\n" +
"    return url;\n" +
"}\n" +
"\n" +
"class NextInvalidDMS extends OpenNextInvalid {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.id = 'next-invalid-dms';\n" +
"        this.storageKey = 'DMSValidation';\n" +
"        /** The location search param name of the currently showed item id. */\n" +
"        this.idParamName = 'item_id';\n" +
"    }\n" +
"    async init() {\n" +
"        // Wait for appending button in the matched page before init auto open service\n" +
"        await this.appendContainer();\n" +
"        this.cache = CacheListRecord.getInstance(this.storageKey);\n" +
"        await super.init();\n" +
"    }\n" +
"    async *walk() {\n" +
"        // Load new added items\n" +
"        for await (const status of this.walkItems('+'))\n" +
"            yield status;\n" +
"        // Load old unloaded items\n" +
"        for await (const status of this.walkItems('-'))\n" +
"            yield status;\n" +
"    }\n" +
"    async *walkItems(sort) {\n" +
"        const startFrom = sort === '+' ? 0 : Date.now();\n" +
"        const limit = this.cache\n" +
"            .reduce((acc, status) => Math[sort === '+' ? 'max' : 'min'](status.createdAt, acc), startFrom);\n" +
"        if (limit || sort === '-') {\n" +
"            this.log(`Recherche vers le ${sort === '+' ? 'futur' : 'passé'} depuis`, this.cache.find({ createdAt: limit }), { cache: this.cache });\n" +
"            const operator = sort === '+' ? 'gteq' : 'lteq';\n" +
"            const value = new Date(limit).toISOString();\n" +
"            const params = {\n" +
"                filter: JSON.stringify([{ field: 'created_at', operator, value }]),\n" +
"                sort: `${sort}created_at`,\n" +
"            };\n" +
"            for await (const dmsItem of getDMSItemGenerator(params)) {\n" +
"                const status = await new DMSItem(dmsItem).getStatus();\n" +
"                yield { ...status };\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async getStatus(id) {\n" +
"        const item = new DMSItem({ id });\n" +
"        if (!item) {\n" +
"            this.error('getStatus', 'item not found', { id });\n" +
"            return null;\n" +
"        }\n" +
"        const status = await item.getStatus();\n" +
"        return status;\n" +
"    }\n" +
"    /** Add \"next invalid invoice\" button on invoices list */\n" +
"    async appendContainer() {\n" +
"        const ref = await waitPage('DMSDetail');\n" +
"        const rightList = findElem('div', 'Nom du Fichier').closest('div.w-100');\n" +
"        if (!this.containerWrapper) {\n" +
"            this.containerWrapper = parseHTML(`<div class=\"${rightList.firstElementChild.className}\"></div>`).firstElementChild;\n" +
"            this.containerWrapper.appendChild(this.container);\n" +
"        }\n" +
"        rightList.insertBefore(this.containerWrapper, rightList.firstChild);\n" +
"        waitFunc(() => isPage('DMSDetail') !== ref).then(() => this.appendContainer());\n" +
"    }\n" +
"    open(id) {\n" +
"        const url = new URL(location.href.replace(/item_id=\\d+/, `item_id=${id}`));\n" +
"        openInTab(url.toString(), { insert: false });\n" +
"    }\n" +
"}\n" +
"\n" +
"class FullPeriod extends Service {\n" +
"    async init() {\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        const block = await this.getPeriodBlock();\n" +
"        if (!$(\".GM-full-period\", block))\n" +
"            this.addButton(block);\n" +
"        await sleep(100);\n" +
"        this.watch();\n" +
"    }\n" +
"    async getPeriodBlock() {\n" +
"        const button = $$(\"button\").find((button) => Boolean(getReactPropValue(button, \"periodStart\")));\n" +
"        if (!button) {\n" +
"            await sleep(100);\n" +
"            return this.getPeriodBlock();\n" +
"        }\n" +
"        return button.closest(\"div\");\n" +
"    }\n" +
"    addButton(block) {\n" +
"        const periodEnd = new Date().getFullYear() + \"-12-31\";\n" +
"        const buttonRef = $$(\"button\", block).find((button) => button.getAttribute(\"aria-label\")?.includes(\"exercice\"));\n" +
"        const button = parseHTML(`\n" +
"      <button class=\"${buttonRef?.className ?? \"\"} GM-full-period\">&nbsp;x&nbsp;</button>\n" +
"    `).firstElementChild;\n" +
"        Tooltip.make({ target: button, text: \"Tous les exercices\" });\n" +
"        block.insertBefore(button, block.firstChild);\n" +
"        button.addEventListener(\"click\", () => {\n" +
"            const url = new URL(location.href);\n" +
"            url.searchParams.set(\"period_start\", \"2022-01-01\");\n" +
"            url.searchParams.set(\"period_end\", periodEnd);\n" +
"            location.replace(url.toString());\n" +
"        });\n" +
"    }\n" +
"}\n" +
"\n" +
"last7DaysFilter();\n" +
"AddInvoiceIdColumn.start();\n" +
"AllowChangeArchivedInvoiceNumber.start();\n" +
"ArchiveGroupedDocument.start();\n" +
"AutoSearchTransaction.start();\n" +
"DMSDisplayStatus.start();\n" +
"DMSRotateImg.start();\n" +
"DMSToInvoiceButton.start();\n" +
"EntryBlocInfos.start();\n" +
"FixTab.start();\n" +
"FullPeriod.start();\n" +
"HighlightWrongDMSFilenames.start();\n" +
"ImproveMatchSuggestions.start();\n" +
"InvoiceDisplayInfos.start();\n" +
"MoveDMSToInvoice.start();\n" +
"NextInvalidDMS.start();\n" +
"NextInvalidInvoice.start();\n" +
"NextInvalidTransaction.start();\n" +
"OpenRefTransaction.start();\n" +
"PreviewDMSFiles.start();\n" +
"RotateImg.start();\n" +
"TransactionAddByIdButton.start();\n" +
"TransactionPanelHotkeys.start();\n" +
"TransactionPannelStyle.start();\n" +
"ValidMessage.start();\n" +
"DMSListHasLinks.start();\n" +
"/*\n" +
"async function mergeInvoices () {\n" +
"  const button = Array.from(document.getElementsByTagName('button'))\n" +
"    .find(b => b.textContent.includes('Chercher parmi les factures'));\n" +
"  const component = button.closest('.px-2.py-3');\n" +
"  const items = getReactProps(component).panelTransaction.grouped_documents;\n" +
"  const invoices = items.filter(item => item.type === 'Invoice').map(invoice => invoice.id);\n" +
"  const response = await apiRequest(\n" +
"    'accountants/invoices/merge_files',\n" +
"    {invoice_ids: invoices}\n" +
"  );\n" +
"  console.log('mergeInvoices', {response});\n" +
"}\n" +
"*/\n" +
"const augmentation = {\n" +
"    GM_Pennylane_Version: /** version **/ \"0.1.34\",\n" +
"    GM: {\n" +
"        API: {\n" +
"            documentMatching,\n" +
"            getDocument,\n" +
"            getGroupedDocuments,\n" +
"            getInvoice,\n" +
"            getInvoicesList,\n" +
"            getLedgerEvents,\n" +
"            getThirdparty,\n" +
"            getTransactionsList,\n" +
"            getDMSItem,\n" +
"            getDMSLinks,\n" +
"            getDMSItemLinks,\n" +
"            getDMSItemList,\n" +
"            getDMSItemSettings,\n" +
"        },\n" +
"        $$,\n" +
"        $,\n" +
"        findElem,\n" +
"        findReactProp,\n" +
"        getReact,\n" +
"        getReactProps,\n" +
"        parseHTML,\n" +
"        waitElem: findElem,\n" +
"        getButtonClassName,\n" +
"        GMXmlHttpRequest,\n" +
"        getDMSItem,\n" +
"        getDMSLinks,\n" +
"        getDMSItemLinks,\n" +
"        getDMSItemList,\n" +
"        getInvoicesList,\n" +
"        getInvoice,\n" +
"        waitPage,\n" +
"        models: {\n" +
"            Invoice,\n" +
"            Transaction,\n" +
"            DMSItem,\n" +
"        },\n" +
"    },\n" +
"};\n" +
"Object.assign(window, augmentation);\n" +
"" + '})();';
try {
    // inject eval.ts
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => { URL.revokeObjectURL(url); };
    unsafeWindow.document.body.appendChild(script);
    // start services
    openTabService();
    XmlHttpRequest.start();
    console.log('GM SUCCESS');
}
catch (error) {
    console.log('GM ERROR');
    console.log({ error, line: code.split('\n')[error.lineNumber - 1] });
}
