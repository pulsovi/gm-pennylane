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

async function sleep(ms) {
    await new Promise((rs) => setTimeout(rs, ms));
}

const beep = (() => {
    const queue = [];
    let handled = false;
    const handle = async () => {
        if (handled)
            return;
        handled = true;
        while (true) {
            if (queue.length) {
                const { duration, frequency, volume } = queue.shift();
                await _beep(duration, frequency, volume);
            }
            await sleep(500);
        }
    };
    ["click", "mousedown", "mouseup", "touchstart", "touchend", "keydown"].forEach((event) => document.addEventListener(event, handle, { once: true }));
    return function beep(duration = 200, frequency = 600, volume = 0.5) {
        queue.push({ duration, frequency, volume });
    };
    async function _beep(duration = 200, frequency = 1000, volume = 0.5) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        // Volume initial à 0 pour le fondu d’entrée
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        // Fondu d’entrée sur 10 ms
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        // Maintient le volume pendant presque toute la durée
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + (duration - 20) / 1000);
        // Fondu de sortie sur les 10 dernières ms
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);
        await sleep(duration);
    }
})();

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
Object.assign(window, {
    GM_Pennylane_debug: window["GM_Pennylane_debug"] ?? localStorage.getItem("GM_Pennylane_debug") === "true",
});
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
        beep();
    }
    debug(...messages) {
        if (!GM_Pennylane_debug)
            return;
        const date = new Date().toISOString().replace(/^[^T]*T([\d:]*).*$/, "[$1]");
        csl.error(`${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}%cDebug`, ...this.getStyles(), ...messages);
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
"        return JSON.parse(JSON.stringify(obj, (key, value) => {\n" +
"            if (value instanceof RegExp)\n" +
"                return value.toString();\n" +
"            return value;\n" +
"        }));\n" +
"    }\n" +
"    catch (error) {\n" +
"        console.error(\"unable to jsonClone this object\", obj, error);\n" +
"        return obj;\n" +
"    }\n" +
"}\n" +
"function regexFromJSON(json) {\n" +
"    const match = json.match(/^\\/(?<regex>.*)\\/(?<flags>[a-z]*)$/i);\n" +
"    if (!match)\n" +
"        return null;\n" +
"    return new RegExp(match.groups?.regex, match.groups?.flags);\n" +
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
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$t = null;\n" +
"class APITransaction {\n" +
"    static Parse(d) {\n" +
"        return APITransaction.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$t = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$t(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$t(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$t(field, d);\n" +
"        }\n" +
"        checkNumber$q(d.account_id, field + \".account_id\");\n" +
"        d.account_synchronization = AccountSynchronization$1.Create(d.account_synchronization, field + \".account_synchronization\");\n" +
"        checkString$r(d.amount, field + \".amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$l(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$r(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$i(d.attachment_lost, field + \".attachment_lost\");\n" +
"        checkBoolean$i(d.attachment_required, field + \".attachment_required\");\n" +
"        checkNumber$q(d.company_id, field + \".company_id\");\n" +
"        checkString$r(d.currency, field + \".currency\");\n" +
"        checkString$r(d.currency_amount, field + \".currency_amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$r(d.currency_fee, field + \".currency_fee\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$l(d.currency_fee, field + \".currency_fee\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$r(d.date, field + \".date\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$l(d.dump, field + \".dump\", \"null | Dump\");\n" +
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
"            checkNull$l(d.dump_id, field + \".dump_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$q(d.dump_id, field + \".dump_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$r(d.fee, field + \".fee\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$l(d.fee, field + \".fee\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$q(d.files_count, field + \".files_count\");\n" +
"        checkString$r(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$r(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$q(d.id, field + \".id\");\n" +
"        checkBoolean$i(d.is_potential_duplicate, field + \".is_potential_duplicate\");\n" +
"        checkBoolean$i(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        checkString$r(d.label, field + \".label\");\n" +
"        checkBoolean$i(d.pending, field + \".pending\");\n" +
"        checkNull$l(d.reconciliation_id, field + \".reconciliation_id\");\n" +
"        checkString$r(d.source, field + \".source\");\n" +
"        checkString$r(d.source_logo, field + \".source_logo\");\n" +
"        checkString$r(d.status, field + \".status\");\n" +
"        checkString$r(d.type, field + \".type\");\n" +
"        checkString$r(d.updated_at, field + \".updated_at\");\n" +
"        checkBoolean$i(d.validation_needed, field + \".validation_needed\");\n" +
"        const knownProperties = [\"account_id\", \"account_synchronization\", \"amount\", \"archived_at\", \"attachment_lost\", \"attachment_required\", \"company_id\", \"currency\", \"currency_amount\", \"currency_fee\", \"date\", \"dump\", \"dump_id\", \"fee\", \"files_count\", \"gross_amount\", \"group_uuid\", \"id\", \"is_potential_duplicate\", \"is_waiting_details\", \"label\", \"pending\", \"reconciliation_id\", \"source\", \"source_logo\", \"status\", \"type\", \"updated_at\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$t(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$t = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$t(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$t(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$t(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$r(d.created_at, field + \".created_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$l(d.created_at, field + \".created_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$l(d.error_message, field + \".error_message\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkBoolean$i(d.triggered_manually, field + \".triggered_manually\", \"boolean | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$l(d.triggered_manually, field + \".triggered_manually\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"created_at\", \"error_message\", \"triggered_manually\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$t(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$t = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$t(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$t(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$t(field, d);\n" +
"        }\n" +
"        checkString$r(d.created_at, field + \".created_at\");\n" +
"        checkString$r(d.creator, field + \".creator\");\n" +
"        checkString$r(d.type, field + \".type\");\n" +
"        const knownProperties = [\"created_at\", \"creator\", \"type\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$t(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Dump(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.creator = d.creator;\n" +
"        this.type = d.type;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$t(field, value, multiple) {\n" +
"    return errorHelper$t(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$t(field, value, multiple) {\n" +
"    return errorHelper$t(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$t(field, value, multiple) {\n" +
"    return errorHelper$t(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$q(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$t(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$i(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$t(field, value, multiple ?? \"boolean\");\n" +
"}\n" +
"function checkString$r(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$t(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$l(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$t(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function errorHelper$t(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$t));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$t;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$t));\n" +
"        }\n" +
"        catch (error) {\n" +
"            console.log(error);\n" +
"        }\n" +
"        console.error('Expected \"' + type + '\" at ' + field + ' but found:\\n" +
"' + JSON.stringify(d), jsonClone);\n" +
"    }\n" +
"}\n" +
"\n" +
"const beep = (() => {\n" +
"    const queue = [];\n" +
"    let handled = false;\n" +
"    const handle = async () => {\n" +
"        if (handled)\n" +
"            return;\n" +
"        handled = true;\n" +
"        while (true) {\n" +
"            if (queue.length) {\n" +
"                const { duration, frequency, volume } = queue.shift();\n" +
"                await _beep(duration, frequency, volume);\n" +
"            }\n" +
"            await sleep(500);\n" +
"        }\n" +
"    };\n" +
"    [\"click\", \"mousedown\", \"mouseup\", \"touchstart\", \"touchend\", \"keydown\"].forEach((event) => document.addEventListener(event, handle, { once: true }));\n" +
"    return function beep(duration = 200, frequency = 600, volume = 0.5) {\n" +
"        queue.push({ duration, frequency, volume });\n" +
"    };\n" +
"    async function _beep(duration = 200, frequency = 1000, volume = 0.5) {\n" +
"        const audioContext = new (window.AudioContext || window.webkitAudioContext)();\n" +
"        const oscillator = audioContext.createOscillator();\n" +
"        const gainNode = audioContext.createGain();\n" +
"        oscillator.type = \"sine\";\n" +
"        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);\n" +
"        // Volume initial à 0 pour le fondu d’entrée\n" +
"        gainNode.gain.setValueAtTime(0, audioContext.currentTime);\n" +
"        // Fondu d’entrée sur 10 ms\n" +
"        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);\n" +
"        // Maintient le volume pendant presque toute la durée\n" +
"        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + (duration - 20) / 1000);\n" +
"        // Fondu de sortie sur les 10 dernières ms\n" +
"        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);\n" +
"        oscillator.connect(gainNode);\n" +
"        gainNode.connect(audioContext.destination);\n" +
"        oscillator.start();\n" +
"        oscillator.stop(audioContext.currentTime + duration / 1000);\n" +
"        await sleep(duration);\n" +
"    }\n" +
"})();\n" +
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
"Object.assign(window, {\n" +
"    GM_Pennylane_debug: window[\"GM_Pennylane_debug\"] ?? localStorage.getItem(\"GM_Pennylane_debug\") === \"true\",\n" +
"});\n" +
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
"        beep();\n" +
"    }\n" +
"    debug(...messages) {\n" +
"        if (!GM_Pennylane_debug)\n" +
"            return;\n" +
"        const date = new Date().toISOString().replace(/^[^T]*T([\\d:]*).*$/, \"[$1]\");\n" +
"        csl.error(`${date} %cGM_Pennylane%c${this.loggerName ?? this.constructor.name}%cDebug`, ...this.getStyles(), ...messages);\n" +
"    }\n" +
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
"        if (typeof valueOrCreate === \"boolean\" || typeof valueOrCreate === \"undefined\") {\n" +
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
"class T_IDBCursor extends Logger {\n" +
"    constructor(cursor, options) {\n" +
"        super();\n" +
"        const { store, ...other } = options;\n" +
"        this.options = other;\n" +
"        this.store = store;\n" +
"        this.cursor = cursor;\n" +
"    }\n" +
"    static parseCursorQuery(value, operator = \"=\") {\n" +
"        if (typeof value === \"undefined\")\n" +
"            return null;\n" +
"        switch (operator) {\n" +
"            case \"=\":\n" +
"                return IDBKeyRange.only(value);\n" +
"            default:\n" +
"                throw new Error(`Invalid operator: \"${operator}\"`);\n" +
"        }\n" +
"    }\n" +
"    get value() {\n" +
"        return this.cursor?.value;\n" +
"    }\n" +
"    async continue() {\n" +
"        if (this.store.transaction.state === \"pending\") {\n" +
"            try {\n" +
"                this.cursor.continue();\n" +
"                return new Promise((resolve, reject) => {\n" +
"                    this.cursor.request.onerror = reject;\n" +
"                    this.cursor.request.onsuccess = (event) => {\n" +
"                        this.cursor = this.cursor.request.result;\n" +
"                        resolve(this);\n" +
"                    };\n" +
"                });\n" +
"            }\n" +
"            catch (error) {\n" +
"                this.error(`continue() Error: error.message`, {\n" +
"                    Cursor: this,\n" +
"                    error,\n" +
"                    store: this.store,\n" +
"                    transaction: this.store.transaction,\n" +
"                    state: this.store.transaction.state,\n" +
"                });\n" +
"                if (error.message !==\n" +
"                    \"A request was placed against a transaction which is currently not active, or which is finished.\") {\n" +
"                    this.cursor = null;\n" +
"                    return this;\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        const last = this.value;\n" +
"        const newCursor = await this.reload();\n" +
"        this.cursor = newCursor.cursor;\n" +
"        this.store = newCursor.store;\n" +
"        await this.goto(last);\n" +
"        return this.continue();\n" +
"    }\n" +
"    async reload() {\n" +
"        const store = this.store.reload();\n" +
"        const cursor = await store.openCursor(this.options);\n" +
"        return cursor;\n" +
"    }\n" +
"    goto(item) {\n" +
"        if (this.cursor.source instanceof IDBIndex) {\n" +
"            const index = this.cursor.source;\n" +
"            const store = index.objectStore;\n" +
"            const [indexKey] = Array.isArray(index.keyPath) ? index.keyPath : [index.keyPath];\n" +
"            const [storeKey] = Array.isArray(store.keyPath) ? store.keyPath : [store.keyPath];\n" +
"            this.cursor.continuePrimaryKey(item[indexKey], item[storeKey]);\n" +
"        }\n" +
"        else {\n" +
"            const store = this.cursor.source;\n" +
"            const [primaryKey] = Array.isArray(store.keyPath) ? store.keyPath : [store.keyPath];\n" +
"            this.cursor.continue(item[primaryKey]);\n" +
"        }\n" +
"        return new Promise((resolve, reject) => {\n" +
"            this.cursor.request.onerror = reject;\n" +
"            this.cursor.request.onsuccess = (_event) => {\n" +
"                this.cursor = this.cursor.request.result;\n" +
"                resolve(this);\n" +
"            };\n" +
"        });\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * Typed IDBObjectStore wrapper\n" +
" */\n" +
"class T_IDBStore {\n" +
"    constructor(store, transaction) {\n" +
"        this.store = store;\n" +
"        this.transaction = transaction;\n" +
"    }\n" +
"    get(key) {\n" +
"        const getRequest = this.store.get(key);\n" +
"        return this.promisify(getRequest);\n" +
"    }\n" +
"    put(value, key) {\n" +
"        const putRequest = this.store.put(value, key);\n" +
"        return this.promisify(putRequest);\n" +
"    }\n" +
"    delete(key) {\n" +
"        const deleteRequest = this.store.delete(key);\n" +
"        return this.promisify(deleteRequest);\n" +
"    }\n" +
"    clear() {\n" +
"        const clearRequest = this.store.clear();\n" +
"        return this.promisify(clearRequest);\n" +
"    }\n" +
"    async openCursor(options) {\n" +
"        const index = options.column ? this.store.index(options.column) : this.store;\n" +
"        const query = T_IDBCursor.parseCursorQuery(options.value, options.operator);\n" +
"        const cursorRequest = index?.openCursor(query, options.sortDirection === \"asc\" ? \"next\" : \"prev\");\n" +
"        if (!cursorRequest)\n" +
"            return null;\n" +
"        return new Promise((resolve, reject) => {\n" +
"            cursorRequest.onerror = reject;\n" +
"            cursorRequest.onsuccess = () => {\n" +
"                const cursor = cursorRequest.result;\n" +
"                resolve(new T_IDBCursor(cursor, { ...options, store: this }));\n" +
"            };\n" +
"        });\n" +
"    }\n" +
"    reload() {\n" +
"        const transaction = this.transaction.reload();\n" +
"        return transaction.getStore();\n" +
"    }\n" +
"    promisify(request) {\n" +
"        return new Promise((resolve, reject) => {\n" +
"            request.onsuccess = () => resolve(request.result);\n" +
"            request.onerror = () => reject(request.error);\n" +
"        });\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * IDBTransaction wrapper with type and state readonly property\n" +
" */\n" +
"class T_IDBTransaction {\n" +
"    constructor({ database, table, mode = \"readonly\", onError }) {\n" +
"        this._state = \"pending\";\n" +
"        this.table = table;\n" +
"        this.mode = mode;\n" +
"        this.transaction = database.transaction(this.table, this.mode);\n" +
"        this.attachEvents(onError);\n" +
"        this.options = { database, table, mode, onError };\n" +
"    }\n" +
"    get state() {\n" +
"        return this._state;\n" +
"    }\n" +
"    attachEvents(onError) {\n" +
"        this.transaction.oncomplete = () => {\n" +
"            this._state = \"completed\";\n" +
"        };\n" +
"        this.transaction.onerror = (event) => {\n" +
"            this._state = \"error\";\n" +
"            onError?.(event);\n" +
"        };\n" +
"        this.transaction.onabort = () => {\n" +
"            this._state = \"aborted\";\n" +
"        };\n" +
"    }\n" +
"    getStore() {\n" +
"        return new T_IDBStore(this.transaction.objectStore(this.table), this);\n" +
"    }\n" +
"    reload() {\n" +
"        return new T_IDBTransaction(this.options);\n" +
"    }\n" +
"}\n" +
"\n" +
"const logger$7 = new Logger(\"IDBCache:global\");\n" +
"const tableDefaults = {\n" +
"    autoIncrement: false,\n" +
"    indexedColumns: [],\n" +
"};\n" +
"const DB_NAME = \"GM_Pennylane\";\n" +
"const structure = JSON.parse(localStorage.getItem(`${DB_NAME}_IDB_structure`) || JSON.stringify({ version: 1, tables: [] }));\n" +
"function registerTable(table) {\n" +
"    const oldStructure = JSON.parse(JSON.stringify(structure));\n" +
"    const registering = { ...tableDefaults, ...table };\n" +
"    const registered = structure.tables.find((tableItem) => tableItem.name === registering.name);\n" +
"    if (registered) {\n" +
"        if (registered.primary !== registering.primary) {\n" +
"            logger$7.error(`Table ${registering.name} primary conflict`, { registered, registering });\n" +
"            throw new Error(`Table ${registering.name} already registered with primary key \"${registered.primary}\"`);\n" +
"        }\n" +
"        if (Boolean(registered.autoIncrement) !== Boolean(registering.autoIncrement)) {\n" +
"            logger$7.error(`Table ${registering.name} autoIncrement conflict`, { registered, registering });\n" +
"            throw new Error(`Table ${registering.name} already registered with autoIncrement \"${registered.autoIncrement}\"`);\n" +
"        }\n" +
"        let versionChange = false;\n" +
"        registering.indexedColumns?.forEach((column) => {\n" +
"            if (!registered.indexedColumns?.includes(column)) {\n" +
"                registered.indexedColumns = [...(registered.indexedColumns || []), column];\n" +
"                versionChange = true;\n" +
"            }\n" +
"        });\n" +
"        if (!versionChange)\n" +
"            return registered;\n" +
"    }\n" +
"    else\n" +
"        structure.tables.push(registering);\n" +
"    structure.version++;\n" +
"    logger$7.log(\"Structure updated\", { oldStructure, structure });\n" +
"    localStorage.setItem(`${DB_NAME}_IDB_structure`, JSON.stringify(structure));\n" +
"    location.reload();\n" +
"    return registering;\n" +
"}\n" +
"async function getDB() {\n" +
"    const db = await new Promise((rs, rj) => {\n" +
"        const openRequest = indexedDB.open(DB_NAME, structure.version);\n" +
"        /**\n" +
"         * Database upgrade needed : DB_VERSION is greather than the current db version\n" +
"         */\n" +
"        openRequest.onupgradeneeded = () => {\n" +
"            const db = openRequest.result;\n" +
"            structure.tables.forEach((table) => {\n" +
"                if (!db.objectStoreNames.contains(table.name))\n" +
"                    db.createObjectStore(table.name, { keyPath: table.primary, autoIncrement: table.autoIncrement });\n" +
"                const upgradeTx = openRequest.transaction;\n" +
"                if (!upgradeTx)\n" +
"                    return;\n" +
"                const store = upgradeTx.objectStore(table.name);\n" +
"                (table.indexedColumns || []).forEach((column) => {\n" +
"                    if (!store.indexNames.contains(column)) {\n" +
"                        store.createIndex(column, column, { unique: false });\n" +
"                    }\n" +
"                });\n" +
"            });\n" +
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
"        openRequest.onblocked = () => {\n" +
"            console.error(\"database blocked\", { version: structure.version });\n" +
"            rj(new Error(\"database blocked\"));\n" +
"        };\n" +
"    });\n" +
"    if (db) {\n" +
"        /**\n" +
"         * Database version change : DB_VERSION becomes lower than the current db version\n" +
"         */\n" +
"        db.onversionchange = () => {\n" +
"            console.error(\"database version change\", { structure });\n" +
"            db.close();\n" +
"        };\n" +
"    }\n" +
"    // Compare structure with db\n" +
"    let error = false;\n" +
"    structure.tables.forEach((table) => {\n" +
"        if (!db.objectStoreNames.contains(table.name)) {\n" +
"            logger$7.error(`Table \"${table.name}\" not found in DB`, { structure, db: db.objectStoreNames });\n" +
"            error = true;\n" +
"        }\n" +
"        else {\n" +
"            const store = db.transaction(table.name, \"readonly\").objectStore(table.name);\n" +
"            // compare primary key\n" +
"            if (store.keyPath !== table.primary) {\n" +
"                logger$7.error(`Primary key mismatch for table \"${table.name}\"`, { structure: table, db: store });\n" +
"                error = true;\n" +
"            }\n" +
"            // compare indexed columns\n" +
"            table.indexedColumns?.forEach((column) => {\n" +
"                if (!store.indexNames.contains(column)) {\n" +
"                    logger$7.error(`Indexed column \"${column}\" not found in table \"${table.name}\"`, {\n" +
"                        structure: table,\n" +
"                        db: store,\n" +
"                    });\n" +
"                    error = true;\n" +
"                }\n" +
"            });\n" +
"        }\n" +
"    });\n" +
"    if (error) {\n" +
"        structure.version++;\n" +
"        localStorage.setItem(`${DB_NAME}_IDB_structure`, JSON.stringify(structure));\n" +
"        location.reload();\n" +
"    }\n" +
"    return db;\n" +
"}\n" +
"class IDBCache extends Logger {\n" +
"    constructor(tableName, primary, indexedColumns) {\n" +
"        super();\n" +
"        this.tableName = tableName;\n" +
"        this.primary = primary;\n" +
"        const structure = registerTable({ name: tableName, primary, indexedColumns });\n" +
"        this.indexedColumns = structure.indexedColumns;\n" +
"        this.loading = this.load().then(() => { });\n" +
"        this.debug(\"new Cache\", this);\n" +
"    }\n" +
"    static getInstance(tableName, primary, indexedColumns) {\n" +
"        if (!this.instances[tableName]) {\n" +
"            this.instances[tableName] = new this(tableName, primary, indexedColumns);\n" +
"        }\n" +
"        return this.instances[tableName];\n" +
"    }\n" +
"    get db() {\n" +
"        if (!this._db) {\n" +
"            const message = `Database not loaded, please wait for ${this.constructor.name}.loading before using this method.`;\n" +
"            this.error(message);\n" +
"            throw new Error(message);\n" +
"        }\n" +
"        return this._db;\n" +
"    }\n" +
"    /**\n" +
"     * Load database\n" +
"     */\n" +
"    async load() {\n" +
"        this.log(\"Loading database\", this.tableName);\n" +
"        this._db = await getDB();\n" +
"        this.log(\"Database loaded\", this._db);\n" +
"        return this._db;\n" +
"    }\n" +
"    async find(matchOrParadigm) {\n" +
"        if (typeof matchOrParadigm === \"function\") {\n" +
"            const paradigm = matchOrParadigm;\n" +
"            for await (const item of this.walk()) {\n" +
"                if (!item)\n" +
"                    return null;\n" +
"                if (paradigm(item))\n" +
"                    return item;\n" +
"            }\n" +
"            return null;\n" +
"        }\n" +
"        const match = matchOrParadigm;\n" +
"        if (this.primary in match)\n" +
"            return this.get(match[this.primary]);\n" +
"        for await (const item of this.walk()) {\n" +
"            if (!item)\n" +
"                return null;\n" +
"            if (Object.entries(match).every(([key, value]) => item[key] === value))\n" +
"                return item;\n" +
"        }\n" +
"        return null;\n" +
"    }\n" +
"    async reduce(callback, initialValue) {\n" +
"        let acc = initialValue;\n" +
"        for await (const item of this.walk()) {\n" +
"            if (!item)\n" +
"                continue;\n" +
"            acc = callback(acc, item);\n" +
"        }\n" +
"        return acc;\n" +
"    }\n" +
"    async filter(matchOrParadigm) {\n" +
"        const callback = typeof matchOrParadigm === \"function\"\n" +
"            ? matchOrParadigm\n" +
"            : (item) => Object.entries(matchOrParadigm).every(([key, value]) => item[key] === value);\n" +
"        const items = [];\n" +
"        for await (const item of this.walk()) {\n" +
"            if (!item)\n" +
"                continue;\n" +
"            if (callback(item))\n" +
"                items.push(item);\n" +
"        }\n" +
"        return items;\n" +
"    }\n" +
"    async update(match) {\n" +
"        const oldValue = await this.get(match[this.primary]);\n" +
"        const newValue = oldValue ? { ...oldValue, ...match } : match;\n" +
"        const store = await this.getStore(\"readwrite\");\n" +
"        return await store?.put(newValue);\n" +
"    }\n" +
"    async delete(match) {\n" +
"        const store = await this.getStore(\"readwrite\");\n" +
"        return await store?.delete(match[this.primary]);\n" +
"    }\n" +
"    async get(id) {\n" +
"        const store = await this.getStore(\"readonly\");\n" +
"        return await store?.get(id);\n" +
"    }\n" +
"    /**\n" +
"     * Walk through the cache\n" +
"     *\n" +
"     * @param mode - \"readonly\" or \"readwrite\"\n" +
"     * @returns an async generator of items, if the store is not found, returns null\n" +
"     */\n" +
"    async *walk(options = {}) {\n" +
"        const cursor = await this.getCursor(options);\n" +
"        while (cursor.value) {\n" +
"            yield cursor.value;\n" +
"            await cursor.continue();\n" +
"        }\n" +
"    }\n" +
"    async getStore(mode) {\n" +
"        const transaction = new T_IDBTransaction({\n" +
"            database: this.db,\n" +
"            table: this.tableName,\n" +
"            mode,\n" +
"        });\n" +
"        return transaction.getStore();\n" +
"    }\n" +
"    /**\n" +
"     * Open a cursor on the store\n" +
"     * @param options - cursor options\n" +
"     * @param callback - callback function to handle the cursor. The callback function will be called after the first item is found, and after each cursor.continue() call\n" +
"     * @param onError - error callback function\n" +
"     */\n" +
"    async getCursor(options, callback, onError) {\n" +
"        if (options.column && !this.indexedColumns?.includes(options.column)) {\n" +
"            // This action will trigger a page reload\n" +
"            registerTable({\n" +
"                name: this.tableName,\n" +
"                primary: this.primary,\n" +
"                indexedColumns: [...this.indexedColumns, options.column],\n" +
"            });\n" +
"        }\n" +
"        const store = await this.getStore(options.mode);\n" +
"        return await store.openCursor(options);\n" +
"    }\n" +
"    /**\n" +
"     * Delete all data in this table\n" +
"     */\n" +
"    async clear() {\n" +
"        const store = await this.getStore(\"readwrite\");\n" +
"        return await store?.clear();\n" +
"    }\n" +
"}\n" +
"IDBCache.instances = {};\n" +
"\n" +
"class DataCache extends Logger {\n" +
"    constructor(storageKey) {\n" +
"        super(`DataCache(${storageKey})`);\n" +
"        this.storageKey = storageKey;\n" +
"        this.cache = IDBCache.getInstance(this.storageKey, \"key\");\n" +
"    }\n" +
"    static getInstance(storageKey) {\n" +
"        if (!this.instances[storageKey]) {\n" +
"            this.instances[storageKey] = new DataCache(storageKey);\n" +
"        }\n" +
"        return this.instances[storageKey];\n" +
"    }\n" +
"    async fetch(options) {\n" +
"        const { ref, args, fetcher, maxAge = WEEK_IN_MS } = options;\n" +
"        this.debug(\"fetch\", { options, ref, args, maxAge });\n" +
"        const argsString = JSON.stringify(args);\n" +
"        const key = `${ref}(${argsString})`;\n" +
"        const cached = (await this.cache.find({ key }));\n" +
"        if (cached && Date.now() - cached.fetchedAt < maxAge) {\n" +
"            this.debug(`fetch:${key}:FromCache`, { ref, args, maxAge, key, cached, age: Date.now() - cached.fetchedAt });\n" +
"            return this.sanitize(options, cached.value);\n" +
"        }\n" +
"        const value = await fetcher(args);\n" +
"        this.debug(`fetch:${key}:Reload`, {\n" +
"            ref,\n" +
"            args,\n" +
"            maxAge,\n" +
"            key,\n" +
"            cached,\n" +
"            now: Date.now(),\n" +
"            age: cached ? Date.now() - cached.fetchedAt : void 0,\n" +
"            value,\n" +
"        });\n" +
"        if (value)\n" +
"            this.cache.update({ ref, args, value, fetchedAt: Date.now(), key });\n" +
"        return this.sanitize(options, value);\n" +
"    }\n" +
"    async update(item) {\n" +
"        const key = `${item.ref}(${JSON.stringify(item.args)})`;\n" +
"        this.cache.update({ fetchedAt: Date.now(), ...item, key });\n" +
"    }\n" +
"    async delete(item) {\n" +
"        const key = `${item.ref}(${JSON.stringify(item.args)})`;\n" +
"        this.cache.delete({ key });\n" +
"    }\n" +
"    sanitize(options, value) {\n" +
"        if (\"sanitizer\" in options)\n" +
"            return options.sanitizer(value);\n" +
"        return value;\n" +
"    }\n" +
"}\n" +
"DataCache.instances = {};\n" +
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
"    let partialRegex = new RegExp(source);\n" +
"    for (let i = 0; i < source.length; ++i) {\n" +
"        try {\n" +
"            partialRegex = new RegExp(source.slice(0, i ? -i : void 0));\n" +
"            if (partialRegex.test(str))\n" +
"                break;\n" +
"        }\n" +
"        catch (_error) {\n" +
"            /* do nothing */\n" +
"        }\n" +
"    }\n" +
"    const start = partialRegex.test(str) ? str.match(partialRegex)[0].length : 0;\n" +
"    partialRegex = new RegExp(source);\n" +
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
"const logger$6 = new Logger(\"apiCache\");\n" +
"const storageKey = \"apiCache\";\n" +
"const cache$2 = IDBCache.getInstance(storageKey, \"key\");\n" +
"async function cachedRequest(ref, args, fetcher, maxAge = WEEK_IN_MS) {\n" +
"    const argsString = JSON.stringify(args);\n" +
"    const key = `${ref}(${argsString})`;\n" +
"    const cached = await cache$2.find({ key });\n" +
"    if (cached && Date.now() - cached.fetchedAt < maxAge)\n" +
"        return cached.value;\n" +
"    logger$6.debug(\"cachedRequest\", {\n" +
"        ref,\n" +
"        args,\n" +
"        maxAge,\n" +
"        key,\n" +
"        cached,\n" +
"        now: Date.now(),\n" +
"        age: cached ? Date.now() - cached.fetchedAt : null,\n" +
"    });\n" +
"    const value = await fetcher(args);\n" +
"    if (value)\n" +
"        cache$2.update({ ref, args, value, fetchedAt: Date.now(), key });\n" +
"    return value;\n" +
"}\n" +
"async function updateAPICacheItem(item) {\n" +
"    const key = `${item.ref}(${JSON.stringify(item.args)})`;\n" +
"    cache$2.update({ fetchedAt: Date.now(), ...item, key });\n" +
"}\n" +
"\n" +
"function isString(data) {\n" +
"    return typeof data === 'string';\n" +
"}\n" +
"\n" +
"const logger$5 = new Logger(\"API Request\");\n" +
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
"        logger$5.debug(\"apiRequestWait: 3000\");\n" +
"        return apiRequest(endpoint, data, method);\n" +
"    }\n" +
"    if (response.status === 204) {\n" +
"        console.log(\"API Request: pas de contenu\", { endpoint, data, method });\n" +
"        return null;\n" +
"    }\n" +
"    if (response.status === 404) {\n" +
"        logger$5.error(\"page introuvable\", { endpoint, data, method });\n" +
"        return null;\n" +
"    }\n" +
"    if (response.status === 422) {\n" +
"        const message = (await response.clone().json()).message;\n" +
"        logger$5.log(message, { endpoint, method, data });\n" +
"        if (typeof endpoint !== \"string\" && !endpoint.headers?.[\"X-CSRF-TOKEN\"]) {\n" +
"            apiRequestQueue.push(200);\n" +
"            logger$5.debug(\"apiRequestWait: 200\");\n" +
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
"    if (response.status === 502) {\n" +
"        // La réponse contient de l'HTML. L'afficher dans un nouvel onglet\n" +
"        logger$5.error(\"API Request: error 502\", { endpoint, data, method });\n" +
"        const html = await response.clone().text();\n" +
"        const newTab = window.open(\"\", \"_blank\");\n" +
"        newTab?.document.write(html);\n" +
"        newTab?.document.close();\n" +
"        return null;\n" +
"    }\n" +
"    if (response.status === 429 || response.status === 418) {\n" +
"        apiRequestQueue.unshift(1000);\n" +
"        apiRequestQueue.MIN_DELAY = delayBefore + 1;\n" +
"        apiRequestQueue.VERY_MIN_DELAY = Math.max(apiRequestQueue.VERY_MIN_DELAY, delayBefore + 1);\n" +
"        logger$5.debug(\"apiRequestWait: 1000\");\n" +
"        return apiRequest(endpoint, data, method);\n" +
"    }\n" +
"    // empty success response\n" +
"    if (response.status === 201)\n" +
"        return null;\n" +
"    if (response.status !== 200) {\n" +
"        console.log(\"apiRequest response status is not 200\", { response, status: response.status });\n" +
"        console.error(\"Todo : Créer un gestionnaire pour le code error status = \" + response.status);\n" +
"        return null;\n" +
"    }\n" +
"    response\n" +
"        .clone()\n" +
"        .text()\n" +
"        .then((text) => {\n" +
"        if (!text)\n" +
"            logger$5.error(\"apiRequest: empty response\", { endpoint, data, method, response: response.clone() });\n" +
"    });\n" +
"    apiRequestQueue.MIN_DELAY = Math.max(apiRequestQueue.VERY_MIN_DELAY, delayBefore * 0.99);\n" +
"    return response.clone();\n" +
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
"logger$5.log({ apiRequestQueue });\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$s = null;\n" +
"class APIDMSItem {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$s = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$s(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$s(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$s(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$q(d.archived_at, field + \".archived_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$k(d.archived_at, field + \".archived_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"children\" in d) {\n" +
"            checkArray$i(d.children, field + \".children\");\n" +
"            if (d.children) {\n" +
"                for (let i = 0; i < d.children.length; i++) {\n" +
"                    d.children[i] = ChildrenEntityOrItemsEntity.Create(d.children[i], field + \".children\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$q(d.created_at, field + \".created_at\");\n" +
"        if (\"creator\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                d.creator = Creator$5.Create(d.creator, field + \".creator\", \"Creator | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$k(d.creator, field + \".creator\", \"Creator | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"favorite\" in d) {\n" +
"            checkBoolean$h(d.favorite, field + \".favorite\");\n" +
"        }\n" +
"        if (\"file_extension\" in d) {\n" +
"            checkString$q(d.file_extension, field + \".file_extension\");\n" +
"        }\n" +
"        if (\"file_size\" in d) {\n" +
"            checkNumber$p(d.file_size, field + \".file_size\");\n" +
"        }\n" +
"        if (\"file_url\" in d) {\n" +
"            checkString$q(d.file_url, field + \".file_url\");\n" +
"        }\n" +
"        if (\"filters\" in d) {\n" +
"            checkNull$k(d.filters, field + \".filters\");\n" +
"        }\n" +
"        if (\"fixed\" in d) {\n" +
"            checkBoolean$h(d.fixed, field + \".fixed\");\n" +
"        }\n" +
"        checkNumber$p(d.id, field + \".id\");\n" +
"        checkBoolean$h(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$p(d.itemable_id, field + \".itemable_id\");\n" +
"        if (\"items\" in d) {\n" +
"            checkArray$i(d.items, field + \".items\");\n" +
"            if (d.items) {\n" +
"                for (let i = 0; i < d.items.length; i++) {\n" +
"                    d.items[i] = ItemsEntityOrChildrenEntity.Create(d.items[i], field + \".items\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$q(d.method, field + \".method\");\n" +
"        checkString$q(d.name, field + \".name\");\n" +
"        if (\"pagination\" in d) {\n" +
"            d.pagination = Pagination$3.Create(d.pagination, field + \".pagination\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$p(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$k(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$q(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$h(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"reference_link\" in d) {\n" +
"            checkNull$k(d.reference_link, field + \".reference_link\");\n" +
"        }\n" +
"        checkBoolean$h(d.shared, field + \".shared\");\n" +
"        if (\"signed_id\" in d) {\n" +
"            checkString$q(d.signed_id, field + \".signed_id\");\n" +
"        }\n" +
"        if (\"sort\" in d) {\n" +
"            checkString$q(d.sort, field + \".sort\");\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$k(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        if (\"summary_text_prediction_id\" in d) {\n" +
"            checkNull$k(d.summary_text_prediction_id, field + \".summary_text_prediction_id\");\n" +
"        }\n" +
"        checkString$q(d.type, field + \".type\");\n" +
"        checkString$q(d.updated_at, field + \".updated_at\");\n" +
"        if (\"visible\" in d) {\n" +
"            checkBoolean$h(d.visible, field + \".visible\");\n" +
"        }\n" +
"        const knownProperties = [\"archived_at\", \"children\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"filters\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"items\", \"method\", \"name\", \"pagination\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"sort\", \"summary_text\", \"summary_text_prediction_id\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$s(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$s = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$s(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$s(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$s(field, d);\n" +
"        }\n" +
"        checkNull$k(d.archived_at, field + \".archived_at\");\n" +
"        if (\"comments_count\" in d) {\n" +
"            checkNumber$p(d.comments_count, field + \".comments_count\");\n" +
"        }\n" +
"        checkString$q(d.created_at, field + \".created_at\");\n" +
"        if (\"creator\" in d) {\n" +
"            d.creator = Creator1.Create(d.creator, field + \".creator\");\n" +
"        }\n" +
"        if (\"favorite\" in d) {\n" +
"            checkBoolean$h(d.favorite, field + \".favorite\");\n" +
"        }\n" +
"        if (\"file_extension\" in d) {\n" +
"            checkString$q(d.file_extension, field + \".file_extension\");\n" +
"        }\n" +
"        if (\"file_size\" in d) {\n" +
"            checkNumber$p(d.file_size, field + \".file_size\");\n" +
"        }\n" +
"        if (\"file_url\" in d) {\n" +
"            checkString$q(d.file_url, field + \".file_url\");\n" +
"        }\n" +
"        if (\"files_count\" in d) {\n" +
"            checkNumber$p(d.files_count, field + \".files_count\");\n" +
"        }\n" +
"        if (\"fixed\" in d) {\n" +
"            checkBoolean$h(d.fixed, field + \".fixed\");\n" +
"        }\n" +
"        checkNumber$p(d.id, field + \".id\");\n" +
"        checkBoolean$h(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$p(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$q(d.method, field + \".method\");\n" +
"        checkString$q(d.name, field + \".name\");\n" +
"        checkNumber$p(d.parent_id, field + \".parent_id\");\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$q(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$h(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"reference_link\" in d) {\n" +
"            checkNull$k(d.reference_link, field + \".reference_link\");\n" +
"        }\n" +
"        checkBoolean$h(d.shared, field + \".shared\");\n" +
"        if (\"signed_id\" in d) {\n" +
"            checkString$q(d.signed_id, field + \".signed_id\");\n" +
"        }\n" +
"        if (\"suggested_folders\" in d) {\n" +
"            checkArray$i(d.suggested_folders, field + \".suggested_folders\");\n" +
"            if (d.suggested_folders) {\n" +
"                for (let i = 0; i < d.suggested_folders.length; i++) {\n" +
"                    checkNever$7(d.suggested_folders[i], field + \".suggested_folders\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$k(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        if (\"summary_text_prediction_id\" in d) {\n" +
"            checkNull$k(d.summary_text_prediction_id, field + \".summary_text_prediction_id\");\n" +
"        }\n" +
"        checkString$q(d.type, field + \".type\");\n" +
"        checkString$q(d.updated_at, field + \".updated_at\");\n" +
"        if (\"visible\" in d) {\n" +
"            checkBoolean$h(d.visible, field + \".visible\");\n" +
"        }\n" +
"        const knownProperties = [\"archived_at\", \"comments_count\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"files_count\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"suggested_folders\", \"summary_text\", \"summary_text_prediction_id\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$s(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"summary_text_prediction_id\" in d)\n" +
"            this.summary_text_prediction_id = d.summary_text_prediction_id;\n" +
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
"            obj$s = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$s(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$s(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$s(field, d);\n" +
"        }\n" +
"        checkString$q(d.email, field + \".email\");\n" +
"        checkString$q(d.first_name, field + \".first_name\");\n" +
"        checkString$q(d.full_name, field + \".full_name\");\n" +
"        checkString$q(d.last_name, field + \".last_name\");\n" +
"        checkString$q(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$s(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$s = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$s(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$s(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$s(field, d);\n" +
"        }\n" +
"        checkString$q(d.email, field + \".email\");\n" +
"        checkString$q(d.first_name, field + \".first_name\");\n" +
"        checkString$q(d.full_name, field + \".full_name\");\n" +
"        checkString$q(d.last_name, field + \".last_name\");\n" +
"        checkString$q(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$s(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$s = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$s(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$s(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$s(field, d);\n" +
"        }\n" +
"        checkNull$k(d.archived_at, field + \".archived_at\");\n" +
"        if (\"comments_count\" in d) {\n" +
"            checkNumber$p(d.comments_count, field + \".comments_count\");\n" +
"        }\n" +
"        checkString$q(d.created_at, field + \".created_at\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$k(d.creator, field + \".creator\", \"null | Creator2\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.creator = Creator2.Create(d.creator, field + \".creator\", \"null | Creator2\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"favorite\" in d) {\n" +
"            checkBoolean$h(d.favorite, field + \".favorite\");\n" +
"        }\n" +
"        if (\"file_extension\" in d) {\n" +
"            checkString$q(d.file_extension, field + \".file_extension\");\n" +
"        }\n" +
"        if (\"file_size\" in d) {\n" +
"            checkNumber$p(d.file_size, field + \".file_size\");\n" +
"        }\n" +
"        if (\"file_url\" in d) {\n" +
"            checkString$q(d.file_url, field + \".file_url\");\n" +
"        }\n" +
"        if (\"files_count\" in d) {\n" +
"            checkNumber$p(d.files_count, field + \".files_count\");\n" +
"        }\n" +
"        if (\"fixed\" in d) {\n" +
"            checkBoolean$h(d.fixed, field + \".fixed\");\n" +
"        }\n" +
"        checkNumber$p(d.id, field + \".id\");\n" +
"        checkBoolean$h(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$p(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$q(d.method, field + \".method\");\n" +
"        checkString$q(d.name, field + \".name\");\n" +
"        checkNumber$p(d.parent_id, field + \".parent_id\");\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$q(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$h(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"reference_link\" in d) {\n" +
"            checkNull$k(d.reference_link, field + \".reference_link\");\n" +
"        }\n" +
"        checkBoolean$h(d.shared, field + \".shared\");\n" +
"        if (\"signed_id\" in d) {\n" +
"            checkString$q(d.signed_id, field + \".signed_id\");\n" +
"        }\n" +
"        if (\"suggested_folders\" in d) {\n" +
"            checkArray$i(d.suggested_folders, field + \".suggested_folders\");\n" +
"            if (d.suggested_folders) {\n" +
"                for (let i = 0; i < d.suggested_folders.length; i++) {\n" +
"                    checkNever$7(d.suggested_folders[i], field + \".suggested_folders\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$k(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        if (\"summary_text_prediction_id\" in d) {\n" +
"            checkNull$k(d.summary_text_prediction_id, field + \".summary_text_prediction_id\");\n" +
"        }\n" +
"        checkString$q(d.type, field + \".type\");\n" +
"        checkString$q(d.updated_at, field + \".updated_at\");\n" +
"        if (\"visible\" in d) {\n" +
"            checkBoolean$h(d.visible, field + \".visible\");\n" +
"        }\n" +
"        const knownProperties = [\"archived_at\", \"comments_count\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"files_count\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"suggested_folders\", \"summary_text\", \"summary_text_prediction_id\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$s(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"summary_text_prediction_id\" in d)\n" +
"            this.summary_text_prediction_id = d.summary_text_prediction_id;\n" +
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
"            obj$s = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$s(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$s(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$s(field, d);\n" +
"        }\n" +
"        checkString$q(d.email, field + \".email\");\n" +
"        checkString$q(d.first_name, field + \".first_name\");\n" +
"        checkString$q(d.full_name, field + \".full_name\");\n" +
"        checkString$q(d.last_name, field + \".last_name\");\n" +
"        checkString$q(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$s(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$s = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$s(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$s(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$s(field, d);\n" +
"        }\n" +
"        checkBoolean$h(d.hasNextPage, field + \".hasNextPage\");\n" +
"        checkNumber$p(d.page, field + \".page\");\n" +
"        checkNumber$p(d.pages, field + \".pages\");\n" +
"        checkNumber$p(d.pageSize, field + \".pageSize\");\n" +
"        checkNumber$p(d.totalEntries, field + \".totalEntries\");\n" +
"        checkString$q(d.totalEntriesPrecision, field + \".totalEntriesPrecision\");\n" +
"        checkString$q(d.totalEntriesStr, field + \".totalEntriesStr\");\n" +
"        const knownProperties = [\"hasNextPage\", \"page\", \"pages\", \"pageSize\", \"totalEntries\", \"totalEntriesPrecision\", \"totalEntriesStr\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$s(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$s(field, value, multiple) {\n" +
"    return errorHelper$s(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$s(field, value, multiple) {\n" +
"    return errorHelper$s(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$s(field, value, multiple) {\n" +
"    return errorHelper$s(field, value, \"object\");\n" +
"}\n" +
"function checkArray$i(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$s(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$p(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$s(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$h(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$s(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$q(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$s(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$k(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$s(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$7(value, field, multiple) {\n" +
"    return errorHelper$s(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$s(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$s));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$s;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$s));\n" +
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
"let obj$r = null;\n" +
"class APIDMSItemLink {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItemLink.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$r = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$r(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$r(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$r(field, d);\n" +
"        }\n" +
"        checkNumber$o(d.id, field + \".id\");\n" +
"        checkNumber$o(d.record_id, field + \".record_id\");\n" +
"        checkString$p(d.record_name, field + \".record_name\");\n" +
"        checkString$p(d.record_type, field + \".record_type\");\n" +
"        checkString$p(d.record_url, field + \".record_url\");\n" +
"        const knownProperties = [\"id\", \"record_id\", \"record_name\", \"record_type\", \"record_url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$r(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$r(field, value, multiple) {\n" +
"    return errorHelper$r(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$r(field, value, multiple) {\n" +
"    return errorHelper$r(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$r(field, value, multiple) {\n" +
"    return errorHelper$r(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$o(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$r(field, value, \"number\");\n" +
"}\n" +
"function checkString$p(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$r(field, value, \"string\");\n" +
"}\n" +
"function errorHelper$r(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$r));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$r;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$r));\n" +
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
"let obj$q = null;\n" +
"class APIDMSItemList {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItemList.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$q = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$q(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$q(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$q(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$o(d.filters, field + \".filters\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$j(d.filters, field + \".filters\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$h(d.items, field + \".items\");\n" +
"        if (d.items) {\n" +
"            for (let i = 0; i < d.items.length; i++) {\n" +
"                d.items[i] = ItemsEntity.Create(d.items[i], field + \".items\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.pagination = Pagination$2.Create(d.pagination, field + \".pagination\");\n" +
"        checkString$o(d.sort, field + \".sort\");\n" +
"        const knownProperties = [\"filters\", \"items\", \"pagination\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$q(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$q = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$q(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$q(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$q(field, d);\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$j(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$o(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"comments_count\" in d) {\n" +
"            checkNumber$n(d.comments_count, field + \".comments_count\");\n" +
"        }\n" +
"        checkString$o(d.created_at, field + \".created_at\");\n" +
"        if (\"creator\" in d) {\n" +
"            d.creator = Creator$4.Create(d.creator, field + \".creator\");\n" +
"        }\n" +
"        if (\"favorite\" in d) {\n" +
"            checkBoolean$g(d.favorite, field + \".favorite\");\n" +
"        }\n" +
"        if (\"file_extension\" in d) {\n" +
"            checkString$o(d.file_extension, field + \".file_extension\");\n" +
"        }\n" +
"        if (\"file_size\" in d) {\n" +
"            checkNumber$n(d.file_size, field + \".file_size\");\n" +
"        }\n" +
"        if (\"file_url\" in d) {\n" +
"            checkString$o(d.file_url, field + \".file_url\");\n" +
"        }\n" +
"        if (\"fixed\" in d) {\n" +
"            checkBoolean$g(d.fixed, field + \".fixed\");\n" +
"        }\n" +
"        checkNumber$n(d.id, field + \".id\");\n" +
"        checkBoolean$g(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$n(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$o(d.method, field + \".method\");\n" +
"        checkString$o(d.name, field + \".name\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$n(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$j(d.parent_id, field + \".parent_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$o(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$g(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"reference_link\" in d) {\n" +
"            checkNull$j(d.reference_link, field + \".reference_link\");\n" +
"        }\n" +
"        checkBoolean$g(d.shared, field + \".shared\");\n" +
"        if (\"signed_id\" in d) {\n" +
"            checkString$o(d.signed_id, field + \".signed_id\");\n" +
"        }\n" +
"        if (\"suggested_folders\" in d) {\n" +
"            checkArray$h(d.suggested_folders, field + \".suggested_folders\");\n" +
"            if (d.suggested_folders) {\n" +
"                for (let i = 0; i < d.suggested_folders.length; i++) {\n" +
"                    checkNever$6(d.suggested_folders[i], field + \".suggested_folders\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$j(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        if (\"summary_text_prediction_id\" in d) {\n" +
"            checkNull$j(d.summary_text_prediction_id, field + \".summary_text_prediction_id\");\n" +
"        }\n" +
"        checkString$o(d.type, field + \".type\");\n" +
"        checkString$o(d.updated_at, field + \".updated_at\");\n" +
"        if (\"visible\" in d) {\n" +
"            checkBoolean$g(d.visible, field + \".visible\");\n" +
"        }\n" +
"        const knownProperties = [\"archived_at\", \"comments_count\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"suggested_folders\", \"summary_text\", \"summary_text_prediction_id\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$q(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"summary_text_prediction_id\" in d)\n" +
"            this.summary_text_prediction_id = d.summary_text_prediction_id;\n" +
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
"            obj$q = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$q(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$q(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$q(field, d);\n" +
"        }\n" +
"        checkString$o(d.email, field + \".email\");\n" +
"        checkString$o(d.first_name, field + \".first_name\");\n" +
"        checkString$o(d.full_name, field + \".full_name\");\n" +
"        checkString$o(d.last_name, field + \".last_name\");\n" +
"        checkString$o(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$q(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$q = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$q(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$q(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$q(field, d);\n" +
"        }\n" +
"        checkBoolean$g(d.hasNextPage, field + \".hasNextPage\");\n" +
"        checkNumber$n(d.page, field + \".page\");\n" +
"        checkNumber$n(d.pages, field + \".pages\");\n" +
"        checkNumber$n(d.pageSize, field + \".pageSize\");\n" +
"        checkNumber$n(d.totalEntries, field + \".totalEntries\");\n" +
"        checkString$o(d.totalEntriesPrecision, field + \".totalEntriesPrecision\");\n" +
"        checkString$o(d.totalEntriesStr, field + \".totalEntriesStr\");\n" +
"        const knownProperties = [\"hasNextPage\", \"page\", \"pages\", \"pageSize\", \"totalEntries\", \"totalEntriesPrecision\", \"totalEntriesStr\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$q(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$q(field, value, multiple) {\n" +
"    return errorHelper$q(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$q(field, value, multiple) {\n" +
"    return errorHelper$q(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$q(field, value, multiple) {\n" +
"    return errorHelper$q(field, value, \"object\");\n" +
"}\n" +
"function checkArray$h(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$q(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$n(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$q(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$g(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$q(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$o(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$q(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$j(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$q(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$6(value, field, multiple) {\n" +
"    return errorHelper$q(field, value, \"never\");\n" +
"}\n" +
"function errorHelper$q(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$q));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$q;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$q));\n" +
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
"let obj$p = null;\n" +
"class APIDMSItemListParams {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItemListParams.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field, multiple) {\n" +
"        if (!field) {\n" +
"            obj$p = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$p(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$p(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$p(field, d);\n" +
"        }\n" +
"        if (\"filter\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkArray$g(d.filter, field + \".filter\", \"FilterEntity[] | string\");\n" +
"                if (d.filter) {\n" +
"                    for (let i = 0; i < d.filter.length; i++) {\n" +
"                        d.filter[i] = FilterEntity$1.Create(d.filter[i], field + \".filter\" + \"[\" + i + \"]\");\n" +
"                    }\n" +
"                }\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$n(d.filter, field + \".filter\", \"FilterEntity[] | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"page\" in d) {\n" +
"            checkNumber$m(d.page, field + \".page\");\n" +
"        }\n" +
"        if (\"page_name\" in d) {\n" +
"            checkString$n(d.page_name, field + \".page_name\");\n" +
"        }\n" +
"        if (\"sort\" in d) {\n" +
"            checkString$n(d.sort, field + \".sort\");\n" +
"        }\n" +
"        const knownProperties = [\"filter\", \"page\", \"page_name\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$p(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"            obj$p = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (!d) {\n" +
"            throwNull2NonNull$p(field, d, multiple ?? this.name);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$p(field, d);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$p(field, d);\n" +
"        }\n" +
"        checkString$n(d.field, field + \".field\");\n" +
"        checkString$n(d.operator, field + \".operator\");\n" +
"        checkString$n(d.value, field + \".value\");\n" +
"        const knownProperties = [\"field\", \"operator\", \"value\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$p(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new FilterEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.field = d.field;\n" +
"        this.operator = d.operator;\n" +
"        this.value = d.value;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$p(field, value, multiple) {\n" +
"    return errorHelper$p(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$p(field, value, multiple) {\n" +
"    return errorHelper$p(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$p(field, value, multiple) {\n" +
"    return errorHelper$p(field, value, \"object\");\n" +
"}\n" +
"function checkArray$g(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$p(field, value, multiple);\n" +
"}\n" +
"function checkNumber$m(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$p(field, value, \"number\");\n" +
"}\n" +
"function checkString$n(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$p(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function errorHelper$p(field, d, type) {\n" +
"    if (type.includes(' | ')) {\n" +
"        throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$p));\n" +
"    }\n" +
"    else {\n" +
"        let jsonClone = obj$p;\n" +
"        try {\n" +
"            jsonClone = JSON.parse(JSON.stringify(obj$p));\n" +
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
"let obj$o = null;\n" +
"class APIDMSItemSettings {\n" +
"    static Parse(d) {\n" +
"        return APIDMSItemSettings.Create(JSON.parse(d));\n" +
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
"        checkString$m(d.filters, field + \".filters\");\n" +
"        checkArray$f(d.firm_admins, field + \".firm_admins\");\n" +
"        if (d.firm_admins) {\n" +
"            for (let i = 0; i < d.firm_admins.length; i++) {\n" +
"                checkNever$5(d.firm_admins[i], field + \".firm_admins\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.folder = Folder.Create(d.folder, field + \".folder\");\n" +
"        checkBoolean$f(d.is_dms_activated_on_firm, field + \".is_dms_activated_on_firm\");\n" +
"        checkBoolean$f(d.is_firm_admin, field + \".is_firm_admin\");\n" +
"        d.item = Item.Create(d.item, field + \".item\");\n" +
"        checkString$m(d.sort, field + \".sort\");\n" +
"        const knownProperties = [\"filters\", \"firm_admins\", \"folder\", \"is_dms_activated_on_firm\", \"is_firm_admin\", \"item\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkNull$i(d.archived_at, field + \".archived_at\");\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        d.creator = Creator$3.Create(d.creator, field + \".creator\");\n" +
"        checkBoolean$f(d.fixed, field + \".fixed\");\n" +
"        checkNumber$l(d.id, field + \".id\");\n" +
"        checkBoolean$f(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$l(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$m(d.method, field + \".method\");\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        checkNumber$l(d.parent_id, field + \".parent_id\");\n" +
"        checkBoolean$f(d.shared, field + \".shared\");\n" +
"        checkString$m(d.type, field + \".type\");\n" +
"        checkString$m(d.updated_at, field + \".updated_at\");\n" +
"        checkBoolean$f(d.visible, field + \".visible\");\n" +
"        const knownProperties = [\"archived_at\", \"created_at\", \"creator\", \"fixed\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"shared\", \"type\", \"updated_at\", \"visible\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$m(d.email, field + \".email\");\n" +
"        checkString$m(d.first_name, field + \".first_name\");\n" +
"        checkString$m(d.full_name, field + \".full_name\");\n" +
"        checkString$m(d.last_name, field + \".last_name\");\n" +
"        checkString$m(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkNull$i(d.archived_at, field + \".archived_at\");\n" +
"        checkNumber$l(d.comments_count, field + \".comments_count\");\n" +
"        checkString$m(d.created_at, field + \".created_at\");\n" +
"        d.creator = Creator$3.Create(d.creator, field + \".creator\");\n" +
"        checkBoolean$f(d.favorite, field + \".favorite\");\n" +
"        checkString$m(d.file_extension, field + \".file_extension\");\n" +
"        checkNumber$l(d.file_size, field + \".file_size\");\n" +
"        checkString$m(d.file_url, field + \".file_url\");\n" +
"        checkNumber$l(d.id, field + \".id\");\n" +
"        checkBoolean$f(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$l(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$m(d.method, field + \".method\");\n" +
"        checkString$m(d.name, field + \".name\");\n" +
"        checkNumber$l(d.parent_id, field + \".parent_id\");\n" +
"        checkString$m(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkBoolean$f(d.readonly, field + \".readonly\");\n" +
"        checkNull$i(d.reference_link, field + \".reference_link\");\n" +
"        checkBoolean$f(d.shared, field + \".shared\");\n" +
"        checkString$m(d.signed_id, field + \".signed_id\");\n" +
"        checkString$m(d.type, field + \".type\");\n" +
"        checkString$m(d.updated_at, field + \".updated_at\");\n" +
"        const knownProperties = [\"archived_at\", \"comments_count\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"type\", \"updated_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$o(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$o(field, value, multiple) {\n" +
"    return errorHelper$o(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$o(field, value, multiple) {\n" +
"    return errorHelper$o(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$o(field, value, multiple) {\n" +
"    return errorHelper$o(field, value, \"object\");\n" +
"}\n" +
"function checkArray$f(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$o(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$l(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$o(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$f(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$o(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$m(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$o(field, value, \"string\");\n" +
"}\n" +
"function checkNull$i(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$o(field, value, \"null\");\n" +
"}\n" +
"function checkNever$5(value, field, multiple) {\n" +
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
"class APIDMSLink {\n" +
"    static Parse(d) {\n" +
"        return APIDMSLink.Create(JSON.parse(d));\n" +
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
"        checkString$l(d.created_at, field + \".created_at\");\n" +
"        checkNumber$k(d.id, field + \".id\");\n" +
"        checkNumber$k(d.item_id, field + \".item_id\");\n" +
"        d.linkable = Linkable$1.Create(d.linkable, field + \".linkable\");\n" +
"        checkNumber$k(d.linkable_id, field + \".linkable_id\");\n" +
"        checkString$l(d.linkable_type, field + \".linkable_type\");\n" +
"        checkString$l(d.name, field + \".name\");\n" +
"        checkNumber$k(d.record_id, field + \".record_id\");\n" +
"        checkString$l(d.record_type, field + \".record_type\");\n" +
"        checkNull$h(d.reference, field + \".reference\");\n" +
"        const knownProperties = [\"created_at\", \"id\", \"item_id\", \"linkable\", \"linkable_id\", \"linkable_type\", \"name\", \"record_id\", \"record_type\", \"reference\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$n(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkArray$e(d.comments, field + \".comments\");\n" +
"        if (d.comments) {\n" +
"            for (let i = 0; i < d.comments.length; i++) {\n" +
"                d.comments[i] = CommentsEntity$1.Create(d.comments[i], field + \".comments\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.creator = Creator$2.Create(d.creator, field + \".creator\");\n" +
"        checkString$l(d.file_extension, field + \".file_extension\");\n" +
"        checkNumber$k(d.file_size, field + \".file_size\");\n" +
"        checkString$l(d.file_url, field + \".file_url\");\n" +
"        checkNumber$k(d.itemable_id, field + \".itemable_id\");\n" +
"        checkNull$h(d.url, field + \".url\");\n" +
"        const knownProperties = [\"comments\", \"creator\", \"file_extension\", \"file_size\", \"file_url\", \"itemable_id\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$n(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$l(d.content, field + \".content\");\n" +
"        checkString$l(d.created_at, field + \".created_at\");\n" +
"        const knownProperties = [\"content\", \"created_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$n(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$l(d.email, field + \".email\");\n" +
"        checkString$l(d.first_name, field + \".first_name\");\n" +
"        checkString$l(d.full_name, field + \".full_name\");\n" +
"        checkString$l(d.last_name, field + \".last_name\");\n" +
"        checkString$l(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$n(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$n(field, value, multiple) {\n" +
"    return errorHelper$n(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$n(field, value, multiple) {\n" +
"    return errorHelper$n(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$n(field, value, multiple) {\n" +
"    return errorHelper$n(field, value, \"object\");\n" +
"}\n" +
"function checkArray$e(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$n(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$k(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$n(field, value, \"number\");\n" +
"}\n" +
"function checkString$l(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$n(field, value, \"string\");\n" +
"}\n" +
"function checkNull$h(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$n(field, value, \"null\");\n" +
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
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$m = null;\n" +
"class APIDMSLinkList {\n" +
"    static Parse(d) {\n" +
"        return APIDMSLinkList.Create(JSON.parse(d));\n" +
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
"        checkArray$d(d.dms_links, field + \".dms_links\");\n" +
"        if (d.dms_links) {\n" +
"            for (let i = 0; i < d.dms_links.length; i++) {\n" +
"                d.dms_links[i] = DmsLinksEntity.Create(d.dms_links[i], field + \".dms_links\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"dms_links\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$m(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$k(d.created_at, field + \".created_at\");\n" +
"        checkNumber$j(d.id, field + \".id\");\n" +
"        checkNumber$j(d.item_id, field + \".item_id\");\n" +
"        d.linkable = Linkable.Create(d.linkable, field + \".linkable\");\n" +
"        checkNumber$j(d.linkable_id, field + \".linkable_id\");\n" +
"        checkString$k(d.linkable_type, field + \".linkable_type\");\n" +
"        checkString$k(d.name, field + \".name\");\n" +
"        checkNumber$j(d.record_id, field + \".record_id\");\n" +
"        checkString$k(d.record_type, field + \".record_type\");\n" +
"        checkNull$g(d.reference, field + \".reference\");\n" +
"        const knownProperties = [\"created_at\", \"id\", \"item_id\", \"linkable\", \"linkable_id\", \"linkable_type\", \"name\", \"record_id\", \"record_type\", \"reference\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$m(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkArray$d(d.comments, field + \".comments\");\n" +
"        if (d.comments) {\n" +
"            for (let i = 0; i < d.comments.length; i++) {\n" +
"                d.comments[i] = CommentsEntity.Create(d.comments[i], field + \".comments\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.creator = Creator$1.Create(d.creator, field + \".creator\");\n" +
"        checkString$k(d.file_extension, field + \".file_extension\");\n" +
"        checkNumber$j(d.file_size, field + \".file_size\");\n" +
"        checkString$k(d.file_url, field + \".file_url\");\n" +
"        checkNumber$j(d.itemable_id, field + \".itemable_id\");\n" +
"        checkNull$g(d.url, field + \".url\");\n" +
"        const knownProperties = [\"comments\", \"creator\", \"file_extension\", \"file_size\", \"file_url\", \"itemable_id\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$m(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$k(d.content, field + \".content\");\n" +
"        checkString$k(d.created_at, field + \".created_at\");\n" +
"        const knownProperties = [\"content\", \"created_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$m(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$k(d.email, field + \".email\");\n" +
"        checkString$k(d.first_name, field + \".first_name\");\n" +
"        checkString$k(d.full_name, field + \".full_name\");\n" +
"        checkString$k(d.last_name, field + \".last_name\");\n" +
"        checkString$k(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$m(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$m(field, value, multiple) {\n" +
"    return errorHelper$m(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$m(field, value, multiple) {\n" +
"    return errorHelper$m(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$m(field, value, multiple) {\n" +
"    return errorHelper$m(field, value, \"object\");\n" +
"}\n" +
"function checkArray$d(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$m(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$j(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$m(field, value, \"number\");\n" +
"}\n" +
"function checkString$k(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$m(field, value, \"string\");\n" +
"}\n" +
"function checkNull$g(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$m(field, value, \"null\");\n" +
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
"class APIDMSToInvoice {\n" +
"    static Parse(d) {\n" +
"        return APIDMSToInvoice.Create(JSON.parse(d));\n" +
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
"        checkString$j(d.message, field + \".message\");\n" +
"        const knownProperties = [\"message\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$l(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDMSToInvoice(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.message = d.message;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$l(field, value, multiple) {\n" +
"    return errorHelper$l(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$l(field, value, multiple) {\n" +
"    return errorHelper$l(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$l(field, value, multiple) {\n" +
"    return errorHelper$l(field, value, \"object\");\n" +
"}\n" +
"function checkString$j(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$l(field, value, \"string\");\n" +
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
"class APIDMSUpdateItem {\n" +
"    static Parse(d) {\n" +
"        return APIDMSUpdateItem.Create(JSON.parse(d));\n" +
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
"        checkNull$f(d.archived_at, field + \".archived_at\");\n" +
"        checkString$i(d.created_at, field + \".created_at\");\n" +
"        d.creator = Creator.Create(d.creator, field + \".creator\");\n" +
"        checkBoolean$e(d.favorite, field + \".favorite\");\n" +
"        checkString$i(d.file_extension, field + \".file_extension\");\n" +
"        checkNumber$i(d.file_size, field + \".file_size\");\n" +
"        checkString$i(d.file_url, field + \".file_url\");\n" +
"        checkNumber$i(d.id, field + \".id\");\n" +
"        checkBoolean$e(d.imports_allowed, field + \".imports_allowed\");\n" +
"        checkNumber$i(d.itemable_id, field + \".itemable_id\");\n" +
"        checkString$i(d.method, field + \".method\");\n" +
"        checkString$i(d.name, field + \".name\");\n" +
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
"        checkString$i(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkBoolean$e(d.readonly, field + \".readonly\");\n" +
"        checkNull$f(d.reference_link, field + \".reference_link\");\n" +
"        checkBoolean$e(d.shared, field + \".shared\");\n" +
"        checkString$i(d.signed_id, field + \".signed_id\");\n" +
"        if (\"suggested_folders\" in d) {\n" +
"            checkArray$c(d.suggested_folders, field + \".suggested_folders\");\n" +
"            if (d.suggested_folders) {\n" +
"                for (let i = 0; i < d.suggested_folders.length; i++) {\n" +
"                    checkNever$4(d.suggested_folders[i], field + \".suggested_folders\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"summary_text\" in d) {\n" +
"            checkNull$f(d.summary_text, field + \".summary_text\");\n" +
"        }\n" +
"        if (\"summary_text_prediction_id\" in d) {\n" +
"            checkNull$f(d.summary_text_prediction_id, field + \".summary_text_prediction_id\");\n" +
"        }\n" +
"        checkString$i(d.type, field + \".type\");\n" +
"        checkString$i(d.updated_at, field + \".updated_at\");\n" +
"        const knownProperties = [\"archived_at\", \"created_at\", \"creator\", \"favorite\", \"file_extension\", \"file_size\", \"file_url\", \"id\", \"imports_allowed\", \"itemable_id\", \"method\", \"name\", \"parent_id\", \"pusher_channel\", \"readonly\", \"reference_link\", \"shared\", \"signed_id\", \"suggested_folders\", \"summary_text\", \"summary_text_prediction_id\", \"type\", \"updated_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$k(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"suggested_folders\" in d)\n" +
"            this.suggested_folders = d.suggested_folders;\n" +
"        if (\"summary_text\" in d)\n" +
"            this.summary_text = d.summary_text;\n" +
"        if (\"summary_text_prediction_id\" in d)\n" +
"            this.summary_text_prediction_id = d.summary_text_prediction_id;\n" +
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
"        checkString$i(d.email, field + \".email\");\n" +
"        checkString$i(d.first_name, field + \".first_name\");\n" +
"        checkString$i(d.full_name, field + \".full_name\");\n" +
"        checkString$i(d.last_name, field + \".last_name\");\n" +
"        checkString$i(d.role, field + \".role\");\n" +
"        const knownProperties = [\"email\", \"first_name\", \"full_name\", \"last_name\", \"role\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$k(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$k(field, value, multiple) {\n" +
"    return errorHelper$k(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$k(field, value, multiple) {\n" +
"    return errorHelper$k(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$k(field, value, multiple) {\n" +
"    return errorHelper$k(field, value, \"object\");\n" +
"}\n" +
"function checkArray$c(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$k(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$i(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$k(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$e(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$k(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$i(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$k(field, value, \"string\");\n" +
"}\n" +
"function checkNull$f(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$k(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$4(value, field, multiple) {\n" +
"    return errorHelper$k(field, value, \"never\");\n" +
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
"class APIDocumentFull {\n" +
"    static Parse(d) {\n" +
"        return APIDocumentFull.Create(JSON.parse(d));\n" +
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
"        if (\"accountants_status\" in d) {\n" +
"            checkString$h(d.accountants_status, field + \".accountants_status\");\n" +
"        }\n" +
"        if (\"active_payment_reminder_id\" in d) {\n" +
"            checkNull$e(d.active_payment_reminder_id, field + \".active_payment_reminder_id\");\n" +
"        }\n" +
"        if (\"amount\" in d) {\n" +
"            checkString$h(d.amount, field + \".amount\");\n" +
"        }\n" +
"        if (\"annexes\" in d) {\n" +
"            checkArray$b(d.annexes, field + \".annexes\");\n" +
"            if (d.annexes) {\n" +
"                for (let i = 0; i < d.annexes.length; i++) {\n" +
"                    checkNever$3(d.annexes[i], field + \".annexes\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"appendices\" in d) {\n" +
"            checkArray$b(d.appendices, field + \".appendices\");\n" +
"            if (d.appendices) {\n" +
"                for (let i = 0; i < d.appendices.length; i++) {\n" +
"                    checkNever$3(d.appendices[i], field + \".appendices\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"approvable_record_id\" in d) {\n" +
"            checkNull$e(d.approvable_record_id, field + \".approvable_record_id\");\n" +
"        }\n" +
"        if (\"approval_flow\" in d) {\n" +
"            checkNull$e(d.approval_flow, field + \".approval_flow\");\n" +
"        }\n" +
"        if (\"archived\" in d) {\n" +
"            checkBoolean$d(d.archived, field + \".archived\");\n" +
"        }\n" +
"        if (\"archived_at\" in d) {\n" +
"            checkNull$e(d.archived_at, field + \".archived_at\");\n" +
"        }\n" +
"        if (\"attachment_required\" in d) {\n" +
"            checkBoolean$d(d.attachment_required, field + \".attachment_required\");\n" +
"        }\n" +
"        if (\"bad_debt\" in d) {\n" +
"            checkBoolean$d(d.bad_debt, field + \".bad_debt\");\n" +
"        }\n" +
"        if (\"been_manually_marked_as_paid\" in d) {\n" +
"            checkBoolean$d(d.been_manually_marked_as_paid, field + \".been_manually_marked_as_paid\");\n" +
"        }\n" +
"        if (\"billing_subscription_id\" in d) {\n" +
"            checkNull$e(d.billing_subscription_id, field + \".billing_subscription_id\");\n" +
"        }\n" +
"        if (\"can_be_attached_to_a_cheque_deposit\" in d) {\n" +
"            checkBoolean$d(d.can_be_attached_to_a_cheque_deposit, field + \".can_be_attached_to_a_cheque_deposit\");\n" +
"        }\n" +
"        if (\"can_be_finalized\" in d) {\n" +
"            checkBoolean$d(d.can_be_finalized, field + \".can_be_finalized\");\n" +
"        }\n" +
"        if (\"can_be_manually_marked_as_paid\" in d) {\n" +
"            checkBoolean$d(d.can_be_manually_marked_as_paid, field + \".can_be_manually_marked_as_paid\");\n" +
"        }\n" +
"        if (\"can_be_manually_marked_as_sent\" in d) {\n" +
"            checkBoolean$d(d.can_be_manually_marked_as_sent, field + \".can_be_manually_marked_as_sent\");\n" +
"        }\n" +
"        if (\"can_be_stamped_as_paid_in_pdf\" in d) {\n" +
"            checkBoolean$d(d.can_be_stamped_as_paid_in_pdf, field + \".can_be_stamped_as_paid_in_pdf\");\n" +
"        }\n" +
"        if (\"can_be_unmarked_as_paid\" in d) {\n" +
"            checkBoolean$d(d.can_be_unmarked_as_paid, field + \".can_be_unmarked_as_paid\");\n" +
"        }\n" +
"        if (\"can_be_unmarked_as_sent\" in d) {\n" +
"            checkBoolean$d(d.can_be_unmarked_as_sent, field + \".can_be_unmarked_as_sent\");\n" +
"        }\n" +
"        if (\"can_request_a_fintecture_payment_url\" in d) {\n" +
"            checkBoolean$d(d.can_request_a_fintecture_payment_url, field + \".can_request_a_fintecture_payment_url\");\n" +
"        }\n" +
"        if (\"cancellable\" in d) {\n" +
"            checkBoolean$d(d.cancellable, field + \".cancellable\");\n" +
"        }\n" +
"        if (\"cancelled\" in d) {\n" +
"            checkBoolean$d(d.cancelled, field + \".cancelled\");\n" +
"        }\n" +
"        if (\"checksum\" in d) {\n" +
"            checkString$h(d.checksum, field + \".checksum\");\n" +
"        }\n" +
"        if (\"client_comments_count\" in d) {\n" +
"            checkNumber$h(d.client_comments_count, field + \".client_comments_count\");\n" +
"        }\n" +
"        checkNumber$h(d.company_id, field + \".company_id\");\n" +
"        if (\"complete\" in d) {\n" +
"            checkBoolean$d(d.complete, field + \".complete\");\n" +
"        }\n" +
"        if (\"completeness\" in d) {\n" +
"            checkNumber$h(d.completeness, field + \".completeness\");\n" +
"        }\n" +
"        if (\"created_at\" in d) {\n" +
"            checkString$h(d.created_at, field + \".created_at\");\n" +
"        }\n" +
"        if (\"credit_note\" in d) {\n" +
"            checkNull$e(d.credit_note, field + \".credit_note\");\n" +
"        }\n" +
"        if (\"credit_notes\" in d) {\n" +
"            checkArray$b(d.credit_notes, field + \".credit_notes\");\n" +
"            if (d.credit_notes) {\n" +
"                for (let i = 0; i < d.credit_notes.length; i++) {\n" +
"                    d.credit_notes[i] = CreditNotesEntity.Create(d.credit_notes[i], field + \".credit_notes\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"credit_notes_amount\" in d) {\n" +
"            checkString$h(d.credit_notes_amount, field + \".credit_notes_amount\");\n" +
"        }\n" +
"        if (\"credited_invoice_id\" in d) {\n" +
"            checkNull$e(d.credited_invoice_id, field + \".credited_invoice_id\");\n" +
"        }\n" +
"        if (\"currency\" in d) {\n" +
"            checkString$h(d.currency, field + \".currency\");\n" +
"        }\n" +
"        if (\"currency_amount\" in d) {\n" +
"            checkString$h(d.currency_amount, field + \".currency_amount\");\n" +
"        }\n" +
"        if (\"currency_amount_before_tax\" in d) {\n" +
"            checkString$h(d.currency_amount_before_tax, field + \".currency_amount_before_tax\");\n" +
"        }\n" +
"        if (\"currency_price_before_tax\" in d) {\n" +
"            checkString$h(d.currency_price_before_tax, field + \".currency_price_before_tax\");\n" +
"        }\n" +
"        if (\"currency_tax\" in d) {\n" +
"            checkString$h(d.currency_tax, field + \".currency_tax\");\n" +
"        }\n" +
"        if (\"current_account_plan_item\" in d) {\n" +
"            checkNull$e(d.current_account_plan_item, field + \".current_account_plan_item\");\n" +
"        }\n" +
"        if (\"current_account_plan_item_id\" in d) {\n" +
"            checkNull$e(d.current_account_plan_item_id, field + \".current_account_plan_item_id\");\n" +
"        }\n" +
"        if (\"customer_validation_needed\" in d) {\n" +
"            checkBoolean$d(d.customer_validation_needed, field + \".customer_validation_needed\");\n" +
"        }\n" +
"        if (\"date\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$h(d.date, field + \".date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.date, field + \".date\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"deadline\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$h(d.deadline, field + \".deadline\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.deadline, field + \".deadline\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"defacto_loan_eligible\" in d) {\n" +
"            checkBoolean$d(d.defacto_loan_eligible, field + \".defacto_loan_eligible\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$h(d.direction, field + \".direction\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.direction, field + \".direction\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"discount\" in d) {\n" +
"            checkString$h(d.discount, field + \".discount\");\n" +
"        }\n" +
"        if (\"discount_type\" in d) {\n" +
"            checkString$h(d.discount_type, field + \".discount_type\");\n" +
"        }\n" +
"        if (\"display_reactivate_button\" in d) {\n" +
"            checkBoolean$d(d.display_reactivate_button, field + \".display_reactivate_button\");\n" +
"        }\n" +
"        if (\"display_revoke_button\" in d) {\n" +
"            checkBoolean$d(d.display_revoke_button, field + \".display_revoke_button\");\n" +
"        }\n" +
"        if (\"document_tags\" in d) {\n" +
"            checkArray$b(d.document_tags, field + \".document_tags\");\n" +
"            if (d.document_tags) {\n" +
"                for (let i = 0; i < d.document_tags.length; i++) {\n" +
"                    d.document_tags[i] = DocumentTagsEntity$1.Create(d.document_tags[i], field + \".document_tags\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"draft\" in d) {\n" +
"            checkBoolean$d(d.draft, field + \".draft\");\n" +
"        }\n" +
"        if (\"duplicates\" in d) {\n" +
"            checkArray$b(d.duplicates, field + \".duplicates\");\n" +
"            if (d.duplicates) {\n" +
"                for (let i = 0; i < d.duplicates.length; i++) {\n" +
"                    d.duplicates[i] = DuplicatesEntity.Create(d.duplicates[i], field + \".duplicates\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"email_from\" in d) {\n" +
"            checkNull$e(d.email_from, field + \".email_from\");\n" +
"        }\n" +
"        if (\"embeddable_in_browser\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkBoolean$d(d.embeddable_in_browser, field + \".embeddable_in_browser\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.embeddable_in_browser, field + \".embeddable_in_browser\", \"boolean | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"external_id\" in d) {\n" +
"            checkString$h(d.external_id, field + \".external_id\");\n" +
"        }\n" +
"        if (\"factor_status\" in d) {\n" +
"            checkString$h(d.factor_status, field + \".factor_status\");\n" +
"        }\n" +
"        if (\"fec_pieceref\" in d) {\n" +
"            checkString$h(d.fec_pieceref, field + \".fec_pieceref\");\n" +
"        }\n" +
"        if (\"file_signed_id\" in d) {\n" +
"            checkString$h(d.file_signed_id, field + \".file_signed_id\");\n" +
"        }\n" +
"        if (\"filename\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$h(d.filename, field + \".filename\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.filename, field + \".filename\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"finalized_at\" in d) {\n" +
"            checkNull$e(d.finalized_at, field + \".finalized_at\");\n" +
"        }\n" +
"        if (\"flow_approved\" in d) {\n" +
"            checkNull$e(d.flow_approved, field + \".flow_approved\");\n" +
"        }\n" +
"        if (\"from_estimate_id\" in d) {\n" +
"            checkNull$e(d.from_estimate_id, field + \".from_estimate_id\");\n" +
"        }\n" +
"        if (\"gdrive_path\" in d) {\n" +
"            checkNull$e(d.gdrive_path, field + \".gdrive_path\");\n" +
"        }\n" +
"        if (\"gocardless_billing_subscription\" in d) {\n" +
"            checkBoolean$d(d.gocardless_billing_subscription, field + \".gocardless_billing_subscription\");\n" +
"        }\n" +
"        if (\"group_uuid\" in d) {\n" +
"            checkString$h(d.group_uuid, field + \".group_uuid\");\n" +
"        }\n" +
"        if (\"grouped_at\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$h(d.grouped_at, field + \".grouped_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.grouped_at, field + \".grouped_at\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"grouped_documents\" in d) {\n" +
"            checkArray$b(d.grouped_documents, field + \".grouped_documents\");\n" +
"            if (d.grouped_documents) {\n" +
"                for (let i = 0; i < d.grouped_documents.length; i++) {\n" +
"                    d.grouped_documents[i] = GroupedDocumentsEntity$1.Create(d.grouped_documents[i], field + \".grouped_documents\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"has_already_sent_an_email\" in d) {\n" +
"            checkBoolean$d(d.has_already_sent_an_email, field + \".has_already_sent_an_email\");\n" +
"        }\n" +
"        if (\"has_credit_note\" in d) {\n" +
"            checkBoolean$d(d.has_credit_note, field + \".has_credit_note\");\n" +
"        }\n" +
"        checkBoolean$d(d.has_file, field + \".has_file\");\n" +
"        if (\"has_grouped_documents\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.has_grouped_documents, field + \".has_grouped_documents\", \"null | boolean\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkBoolean$d(d.has_grouped_documents, field + \".has_grouped_documents\", \"null | boolean\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"has_linked_quotes\" in d) {\n" +
"            checkBoolean$d(d.has_linked_quotes, field + \".has_linked_quotes\");\n" +
"        }\n" +
"        if (\"has_pending_payments\" in d) {\n" +
"            checkBoolean$d(d.has_pending_payments, field + \".has_pending_payments\");\n" +
"        }\n" +
"        if (\"hasTooManyLedgerEvents\" in d) {\n" +
"            checkBoolean$d(d.hasTooManyLedgerEvents, field + \".hasTooManyLedgerEvents\");\n" +
"        }\n" +
"        if (\"iban\" in d) {\n" +
"            checkString$h(d.iban, field + \".iban\");\n" +
"        }\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        if (\"incomplete\" in d) {\n" +
"            checkBoolean$d(d.incomplete, field + \".incomplete\");\n" +
"        }\n" +
"        if (\"invoice_kind\" in d) {\n" +
"            checkString$h(d.invoice_kind, field + \".invoice_kind\");\n" +
"        }\n" +
"        if (\"invoice_lines\" in d) {\n" +
"            checkArray$b(d.invoice_lines, field + \".invoice_lines\");\n" +
"            if (d.invoice_lines) {\n" +
"                for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                    d.invoice_lines[i] = InvoiceLinesEntity$2.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"invoice_number\" in d) {\n" +
"            checkString$h(d.invoice_number, field + \".invoice_number\");\n" +
"        }\n" +
"        if (\"invoice_status\" in d) {\n" +
"            checkNull$e(d.invoice_status, field + \".invoice_status\");\n" +
"        }\n" +
"        if (\"invoicing_detailed_source\" in d) {\n" +
"            checkNull$e(d.invoicing_detailed_source, field + \".invoicing_detailed_source\");\n" +
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
"        if (\"is_factur_x\" in d) {\n" +
"            checkBoolean$d(d.is_factur_x, field + \".is_factur_x\");\n" +
"        }\n" +
"        if (\"is_payment_emitted\" in d) {\n" +
"            checkBoolean$d(d.is_payment_emitted, field + \".is_payment_emitted\");\n" +
"        }\n" +
"        if (\"is_payment_found\" in d) {\n" +
"            checkBoolean$d(d.is_payment_found, field + \".is_payment_found\");\n" +
"        }\n" +
"        if (\"is_payment_in_process\" in d) {\n" +
"            checkBoolean$d(d.is_payment_in_process, field + \".is_payment_in_process\");\n" +
"        }\n" +
"        if (\"is_reconciliation_delay_expired\" in d) {\n" +
"            checkNull$e(d.is_reconciliation_delay_expired, field + \".is_reconciliation_delay_expired\");\n" +
"        }\n" +
"        if (\"is_sendable\" in d) {\n" +
"            checkBoolean$d(d.is_sendable, field + \".is_sendable\");\n" +
"        }\n" +
"        if (\"is_waiting_for_ocr\" in d) {\n" +
"            checkBoolean$d(d.is_waiting_for_ocr, field + \".is_waiting_for_ocr\");\n" +
"        }\n" +
"        if (\"journal_id\" in d) {\n" +
"            checkNumber$h(d.journal_id, field + \".journal_id\");\n" +
"        }\n" +
"        if (\"label\" in d) {\n" +
"            checkString$h(d.label, field + \".label\");\n" +
"        }\n" +
"        if (\"language\" in d) {\n" +
"            checkString$h(d.language, field + \".language\");\n" +
"        }\n" +
"        if (\"last_payment\" in d) {\n" +
"            checkNull$e(d.last_payment, field + \".last_payment\");\n" +
"        }\n" +
"        if (\"ledgerEvents\" in d) {\n" +
"            checkArray$b(d.ledgerEvents, field + \".ledgerEvents\");\n" +
"            if (d.ledgerEvents) {\n" +
"                for (let i = 0; i < d.ledgerEvents.length; i++) {\n" +
"                    d.ledgerEvents[i] = LedgerEventsEntity.Create(d.ledgerEvents[i], field + \".ledgerEvents\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"ledgerEventsCount\" in d) {\n" +
"            checkNumber$h(d.ledgerEventsCount, field + \".ledgerEventsCount\");\n" +
"        }\n" +
"        if (\"manually_marked_as_paid_at\" in d) {\n" +
"            checkNull$e(d.manually_marked_as_paid_at, field + \".manually_marked_as_paid_at\");\n" +
"        }\n" +
"        if (\"manually_marked_as_sent_at\" in d) {\n" +
"            checkNull$e(d.manually_marked_as_sent_at, field + \".manually_marked_as_sent_at\");\n" +
"        }\n" +
"        if (\"match_badge_count\" in d) {\n" +
"            checkNumber$h(d.match_badge_count, field + \".match_badge_count\");\n" +
"        }\n" +
"        if (\"means_of_payment\" in d) {\n" +
"            checkNull$e(d.means_of_payment, field + \".means_of_payment\");\n" +
"        }\n" +
"        if (\"method\" in d) {\n" +
"            checkString$h(d.method, field + \".method\");\n" +
"        }\n" +
"        if (\"min_permitted_issue_date\" in d) {\n" +
"            checkNull$e(d.min_permitted_issue_date, field + \".min_permitted_issue_date\");\n" +
"        }\n" +
"        if (\"multiplier\" in d) {\n" +
"            checkNumber$h(d.multiplier, field + \".multiplier\");\n" +
"        }\n" +
"        if (\"not_duplicate\" in d) {\n" +
"            checkBoolean$d(d.not_duplicate, field + \".not_duplicate\");\n" +
"        }\n" +
"        if (\"ocr_iban\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.ocr_iban, field + \".ocr_iban\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$h(d.ocr_iban, field + \".ocr_iban\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"ocr_thirdparty_id\" in d) {\n" +
"            checkNull$e(d.ocr_thirdparty_id, field + \".ocr_thirdparty_id\");\n" +
"        }\n" +
"        if (\"opened_at\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.opened_at, field + \".opened_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$h(d.opened_at, field + \".opened_at\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"outstanding_balance\" in d) {\n" +
"            checkString$h(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        }\n" +
"        if (\"owner\" in d) {\n" +
"            checkNull$e(d.owner, field + \".owner\");\n" +
"        }\n" +
"        if (\"pages_count\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.pages_count, field + \".pages_count\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$h(d.pages_count, field + \".pages_count\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"paid\" in d) {\n" +
"            checkBoolean$d(d.paid, field + \".paid\");\n" +
"        }\n" +
"        if (\"paid_by\" in d) {\n" +
"            checkNull$e(d.paid_by, field + \".paid_by\");\n" +
"        }\n" +
"        if (\"paid_personally\" in d) {\n" +
"            checkBoolean$d(d.paid_personally, field + \".paid_personally\");\n" +
"        }\n" +
"        if (\"partial_kind\" in d) {\n" +
"            checkNull$e(d.partial_kind, field + \".partial_kind\");\n" +
"        }\n" +
"        if (\"partial_order\" in d) {\n" +
"            checkNull$e(d.partial_order, field + \".partial_order\");\n" +
"        }\n" +
"        if (\"partial_percentage\" in d) {\n" +
"            checkNull$e(d.partial_percentage, field + \".partial_percentage\");\n" +
"        }\n" +
"        if (\"partially_cancelled\" in d) {\n" +
"            checkBoolean$d(d.partially_cancelled, field + \".partially_cancelled\");\n" +
"        }\n" +
"        if (\"past_payments\" in d) {\n" +
"            checkArray$b(d.past_payments, field + \".past_payments\");\n" +
"            if (d.past_payments) {\n" +
"                for (let i = 0; i < d.past_payments.length; i++) {\n" +
"                    checkNever$3(d.past_payments[i], field + \".past_payments\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"payment_emitted_at\" in d) {\n" +
"            checkNull$e(d.payment_emitted_at, field + \".payment_emitted_at\");\n" +
"        }\n" +
"        if (\"payment_ids\" in d) {\n" +
"            checkArray$b(d.payment_ids, field + \".payment_ids\");\n" +
"            if (d.payment_ids) {\n" +
"                for (let i = 0; i < d.payment_ids.length; i++) {\n" +
"                    checkNever$3(d.payment_ids[i], field + \".payment_ids\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"payment_in_process_started_at\" in d) {\n" +
"            checkNull$e(d.payment_in_process_started_at, field + \".payment_in_process_started_at\");\n" +
"        }\n" +
"        if (\"payment_method\" in d) {\n" +
"            checkNull$e(d.payment_method, field + \".payment_method\");\n" +
"        }\n" +
"        if (\"payment_methods\" in d) {\n" +
"            checkArray$b(d.payment_methods, field + \".payment_methods\");\n" +
"            if (d.payment_methods) {\n" +
"                for (let i = 0; i < d.payment_methods.length; i++) {\n" +
"                    checkNever$3(d.payment_methods[i], field + \".payment_methods\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"payment_reference\" in d) {\n" +
"            checkString$h(d.payment_reference, field + \".payment_reference\");\n" +
"        }\n" +
"        if (\"payment_reminder_enabled\" in d) {\n" +
"            checkBoolean$d(d.payment_reminder_enabled, field + \".payment_reminder_enabled\");\n" +
"        }\n" +
"        if (\"payment_reminder_recipients\" in d) {\n" +
"            checkNull$e(d.payment_reminder_recipients, field + \".payment_reminder_recipients\");\n" +
"        }\n" +
"        if (\"payment_reminder_steps\" in d) {\n" +
"            checkArray$b(d.payment_reminder_steps, field + \".payment_reminder_steps\");\n" +
"            if (d.payment_reminder_steps) {\n" +
"                for (let i = 0; i < d.payment_reminder_steps.length; i++) {\n" +
"                    checkNever$3(d.payment_reminder_steps[i], field + \".payment_reminder_steps\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"payment_status\" in d) {\n" +
"            checkString$h(d.payment_status, field + \".payment_status\");\n" +
"        }\n" +
"        if (\"payments\" in d) {\n" +
"            checkArray$b(d.payments, field + \".payments\");\n" +
"            if (d.payments) {\n" +
"                for (let i = 0; i < d.payments.length; i++) {\n" +
"                    checkNever$3(d.payments[i], field + \".payments\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"pdf_description\" in d) {\n" +
"            checkNull$e(d.pdf_description, field + \".pdf_description\");\n" +
"        }\n" +
"        if (\"pdf_generation_status\" in d) {\n" +
"            checkString$h(d.pdf_generation_status, field + \".pdf_generation_status\");\n" +
"        }\n" +
"        if (\"pdf_invoice_display_products_list\" in d) {\n" +
"            checkBoolean$d(d.pdf_invoice_display_products_list, field + \".pdf_invoice_display_products_list\");\n" +
"        }\n" +
"        if (\"pdf_invoice_free_text\" in d) {\n" +
"            checkString$h(d.pdf_invoice_free_text, field + \".pdf_invoice_free_text\");\n" +
"        }\n" +
"        if (\"pdf_invoice_free_text_enabled\" in d) {\n" +
"            checkBoolean$d(d.pdf_invoice_free_text_enabled, field + \".pdf_invoice_free_text_enabled\");\n" +
"        }\n" +
"        if (\"pdf_invoice_subject\" in d) {\n" +
"            checkString$h(d.pdf_invoice_subject, field + \".pdf_invoice_subject\");\n" +
"        }\n" +
"        if (\"pdf_invoice_subject_enabled\" in d) {\n" +
"            checkBoolean$d(d.pdf_invoice_subject_enabled, field + \".pdf_invoice_subject_enabled\");\n" +
"        }\n" +
"        if (\"pdf_invoice_title\" in d) {\n" +
"            checkString$h(d.pdf_invoice_title, field + \".pdf_invoice_title\");\n" +
"        }\n" +
"        if (\"pdf_paid_stamp\" in d) {\n" +
"            checkBoolean$d(d.pdf_paid_stamp, field + \".pdf_paid_stamp\");\n" +
"        }\n" +
"        if (\"pdp_refusal_reason\" in d) {\n" +
"            checkNull$e(d.pdp_refusal_reason, field + \".pdp_refusal_reason\");\n" +
"        }\n" +
"        if (\"pdp_status\" in d) {\n" +
"            checkNull$e(d.pdp_status, field + \".pdp_status\");\n" +
"        }\n" +
"        if (\"pending\" in d) {\n" +
"            checkBoolean$d(d.pending, field + \".pending\");\n" +
"        }\n" +
"        if (\"preview_status\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$h(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"preview_urls\" in d) {\n" +
"            checkArray$b(d.preview_urls, field + \".preview_urls\");\n" +
"            if (d.preview_urls) {\n" +
"                for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                    checkString$h(d.preview_urls[i], field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"price_before_tax\" in d) {\n" +
"            checkString$h(d.price_before_tax, field + \".price_before_tax\");\n" +
"        }\n" +
"        if (\"primary_badge\" in d) {\n" +
"            checkString$h(d.primary_badge, field + \".primary_badge\");\n" +
"        }\n" +
"        if (\"pro_account_check_deposits\" in d) {\n" +
"            checkArray$b(d.pro_account_check_deposits, field + \".pro_account_check_deposits\");\n" +
"            if (d.pro_account_check_deposits) {\n" +
"                for (let i = 0; i < d.pro_account_check_deposits.length; i++) {\n" +
"                    checkNever$3(d.pro_account_check_deposits[i], field + \".pro_account_check_deposits\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"public_link\" in d) {\n" +
"            checkNull$e(d.public_link, field + \".public_link\");\n" +
"        }\n" +
"        if (\"purchase_request_id\" in d) {\n" +
"            checkNull$e(d.purchase_request_id, field + \".purchase_request_id\");\n" +
"        }\n" +
"        if (\"purchase_request_ids\" in d) {\n" +
"            checkArray$b(d.purchase_request_ids, field + \".purchase_request_ids\");\n" +
"            if (d.purchase_request_ids) {\n" +
"                for (let i = 0; i < d.purchase_request_ids.length; i++) {\n" +
"                    checkNever$3(d.purchase_request_ids[i], field + \".purchase_request_ids\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"pusher_channel\" in d) {\n" +
"            checkString$h(d.pusher_channel, field + \".pusher_channel\");\n" +
"        }\n" +
"        if (\"quote_group_uuid\" in d) {\n" +
"            checkString$h(d.quote_group_uuid, field + \".quote_group_uuid\");\n" +
"        }\n" +
"        if (\"quote_uid\" in d) {\n" +
"            checkNull$e(d.quote_uid, field + \".quote_uid\");\n" +
"        }\n" +
"        if (\"quotes\" in d) {\n" +
"            checkBoolean$d(d.quotes, field + \".quotes\");\n" +
"        }\n" +
"        if (\"readonly\" in d) {\n" +
"            checkBoolean$d(d.readonly, field + \".readonly\");\n" +
"        }\n" +
"        if (\"recipients\" in d) {\n" +
"            checkArray$b(d.recipients, field + \".recipients\");\n" +
"            if (d.recipients) {\n" +
"                for (let i = 0; i < d.recipients.length; i++) {\n" +
"                    checkNever$3(d.recipients[i], field + \".recipients\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"reconciled\" in d) {\n" +
"            checkBoolean$d(d.reconciled, field + \".reconciled\");\n" +
"        }\n" +
"        if (\"remaining_amount\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$h(d.remaining_amount, field + \".remaining_amount\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.remaining_amount, field + \".remaining_amount\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"requires_validation\" in d) {\n" +
"            checkBoolean$d(d.requires_validation, field + \".requires_validation\");\n" +
"        }\n" +
"        if (\"reviewed_by\" in d) {\n" +
"            checkNull$e(d.reviewed_by, field + \".reviewed_by\");\n" +
"        }\n" +
"        if (\"scored_transactions\" in d) {\n" +
"            checkNull$e(d.scored_transactions, field + \".scored_transactions\");\n" +
"        }\n" +
"        if (\"sepa_xml_exports\" in d) {\n" +
"            checkArray$b(d.sepa_xml_exports, field + \".sepa_xml_exports\");\n" +
"            if (d.sepa_xml_exports) {\n" +
"                for (let i = 0; i < d.sepa_xml_exports.length; i++) {\n" +
"                    checkNever$3(d.sepa_xml_exports[i], field + \".sepa_xml_exports\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"show_duplicates_tab\" in d) {\n" +
"            checkBoolean$d(d.show_duplicates_tab, field + \".show_duplicates_tab\");\n" +
"        }\n" +
"        if (\"signed_type\" in d) {\n" +
"            checkString$h(d.signed_type, field + \".signed_type\");\n" +
"        }\n" +
"        if (\"size\" in d) {\n" +
"            checkString$h(d.size, field + \".size\");\n" +
"        }\n" +
"        if (\"source\" in d) {\n" +
"            checkString$h(d.source, field + \".source\");\n" +
"        }\n" +
"        if (\"source_document_id\" in d) {\n" +
"            checkNull$e(d.source_document_id, field + \".source_document_id\");\n" +
"        }\n" +
"        if (\"source_document_label\" in d) {\n" +
"            checkNull$e(d.source_document_label, field + \".source_document_label\");\n" +
"        }\n" +
"        if (\"source_metadata\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.source_metadata, field + \".source_metadata\", \"null | SourceMetadata\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    d.source_metadata = SourceMetadata.Create(d.source_metadata, field + \".source_metadata\", \"null | SourceMetadata\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"special_mention\" in d) {\n" +
"            checkNull$e(d.special_mention, field + \".special_mention\");\n" +
"        }\n" +
"        if (\"status\" in d) {\n" +
"            checkString$h(d.status, field + \".status\");\n" +
"        }\n" +
"        if (\"subcomplete\" in d) {\n" +
"            checkBoolean$d(d.subcomplete, field + \".subcomplete\");\n" +
"        }\n" +
"        if (\"tagged_at_ledger_events_level\" in d) {\n" +
"            checkBoolean$d(d.tagged_at_ledger_events_level, field + \".tagged_at_ledger_events_level\");\n" +
"        }\n" +
"        if (\"tax\" in d) {\n" +
"            checkString$h(d.tax, field + \".tax\");\n" +
"        }\n" +
"        if (\"team\" in d) {\n" +
"            checkNull$e(d.team, field + \".team\");\n" +
"        }\n" +
"        if (\"thirdparty\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                d.thirdparty = Thirdparty$2.Create(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"thirdparty_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNumber$h(d.thirdparty_id, field + \".thirdparty_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$e(d.thirdparty_id, field + \".thirdparty_id\", \"number | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$h(d.type, field + \".type\");\n" +
"        if (\"updated_at\" in d) {\n" +
"            checkString$h(d.updated_at, field + \".updated_at\");\n" +
"        }\n" +
"        checkString$h(d.url, field + \".url\");\n" +
"        if (\"use_manual_partial_invoices\" in d) {\n" +
"            checkBoolean$d(d.use_manual_partial_invoices, field + \".use_manual_partial_invoices\");\n" +
"        }\n" +
"        if (\"validated_at\" in d) {\n" +
"            checkNull$e(d.validated_at, field + \".validated_at\");\n" +
"        }\n" +
"        if (\"validation_needed\" in d) {\n" +
"            checkBoolean$d(d.validation_needed, field + \".validation_needed\");\n" +
"        }\n" +
"        const knownProperties = [\"accountants_status\", \"active_payment_reminder_id\", \"amount\", \"annexes\", \"appendices\", \"approvable_record_id\", \"approval_flow\", \"archived\", \"archived_at\", \"attachment_required\", \"bad_debt\", \"been_manually_marked_as_paid\", \"billing_subscription_id\", \"can_be_attached_to_a_cheque_deposit\", \"can_be_finalized\", \"can_be_manually_marked_as_paid\", \"can_be_manually_marked_as_sent\", \"can_be_stamped_as_paid_in_pdf\", \"can_be_unmarked_as_paid\", \"can_be_unmarked_as_sent\", \"can_request_a_fintecture_payment_url\", \"cancellable\", \"cancelled\", \"checksum\", \"client_comments_count\", \"company_id\", \"complete\", \"completeness\", \"created_at\", \"credit_note\", \"credit_notes\", \"credit_notes_amount\", \"credited_invoice_id\", \"currency\", \"currency_amount\", \"currency_amount_before_tax\", \"currency_price_before_tax\", \"currency_tax\", \"current_account_plan_item\", \"current_account_plan_item_id\", \"customer_validation_needed\", \"date\", \"deadline\", \"defacto_loan_eligible\", \"direction\", \"discount\", \"discount_type\", \"display_reactivate_button\", \"display_revoke_button\", \"document_tags\", \"draft\", \"duplicates\", \"email_from\", \"embeddable_in_browser\", \"external_id\", \"factor_status\", \"fec_pieceref\", \"file_signed_id\", \"filename\", \"finalized_at\", \"flow_approved\", \"from_estimate_id\", \"gdrive_path\", \"gocardless_billing_subscription\", \"group_uuid\", \"grouped_at\", \"grouped_documents\", \"has_already_sent_an_email\", \"has_credit_note\", \"has_file\", \"has_grouped_documents\", \"has_linked_quotes\", \"has_pending_payments\", \"hasTooManyLedgerEvents\", \"iban\", \"id\", \"incomplete\", \"invoice_kind\", \"invoice_lines\", \"invoice_number\", \"invoice_status\", \"invoicing_detailed_source\", \"is_credit_note\", \"is_destroyable\", \"is_estimate\", \"is_factur_x\", \"is_payment_emitted\", \"is_payment_found\", \"is_payment_in_process\", \"is_reconciliation_delay_expired\", \"is_sendable\", \"is_waiting_for_ocr\", \"journal_id\", \"label\", \"language\", \"last_payment\", \"ledgerEvents\", \"ledgerEventsCount\", \"manually_marked_as_paid_at\", \"manually_marked_as_sent_at\", \"match_badge_count\", \"means_of_payment\", \"method\", \"min_permitted_issue_date\", \"multiplier\", \"not_duplicate\", \"ocr_iban\", \"ocr_thirdparty_id\", \"opened_at\", \"outstanding_balance\", \"owner\", \"pages_count\", \"paid\", \"paid_by\", \"paid_personally\", \"partial_kind\", \"partial_order\", \"partial_percentage\", \"partially_cancelled\", \"past_payments\", \"payment_emitted_at\", \"payment_ids\", \"payment_in_process_started_at\", \"payment_method\", \"payment_methods\", \"payment_reference\", \"payment_reminder_enabled\", \"payment_reminder_recipients\", \"payment_reminder_steps\", \"payment_status\", \"payments\", \"pdf_description\", \"pdf_generation_status\", \"pdf_invoice_display_products_list\", \"pdf_invoice_free_text\", \"pdf_invoice_free_text_enabled\", \"pdf_invoice_subject\", \"pdf_invoice_subject_enabled\", \"pdf_invoice_title\", \"pdf_paid_stamp\", \"pdp_refusal_reason\", \"pdp_status\", \"pending\", \"preview_status\", \"preview_urls\", \"price_before_tax\", \"primary_badge\", \"pro_account_check_deposits\", \"public_link\", \"purchase_request_id\", \"purchase_request_ids\", \"pusher_channel\", \"quote_group_uuid\", \"quote_uid\", \"quotes\", \"readonly\", \"recipients\", \"reconciled\", \"remaining_amount\", \"requires_validation\", \"reviewed_by\", \"scored_transactions\", \"sepa_xml_exports\", \"show_duplicates_tab\", \"signed_type\", \"size\", \"source\", \"source_document_id\", \"source_document_label\", \"source_metadata\", \"special_mention\", \"status\", \"subcomplete\", \"tagged_at_ledger_events_level\", \"tax\", \"team\", \"thirdparty\", \"thirdparty_id\", \"type\", \"updated_at\", \"url\", \"use_manual_partial_invoices\", \"validated_at\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDocumentFull(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"accountants_status\" in d)\n" +
"            this.accountants_status = d.accountants_status;\n" +
"        if (\"active_payment_reminder_id\" in d)\n" +
"            this.active_payment_reminder_id = d.active_payment_reminder_id;\n" +
"        if (\"amount\" in d)\n" +
"            this.amount = d.amount;\n" +
"        if (\"annexes\" in d)\n" +
"            this.annexes = d.annexes;\n" +
"        if (\"appendices\" in d)\n" +
"            this.appendices = d.appendices;\n" +
"        if (\"approvable_record_id\" in d)\n" +
"            this.approvable_record_id = d.approvable_record_id;\n" +
"        if (\"approval_flow\" in d)\n" +
"            this.approval_flow = d.approval_flow;\n" +
"        if (\"archived\" in d)\n" +
"            this.archived = d.archived;\n" +
"        if (\"archived_at\" in d)\n" +
"            this.archived_at = d.archived_at;\n" +
"        if (\"attachment_required\" in d)\n" +
"            this.attachment_required = d.attachment_required;\n" +
"        if (\"bad_debt\" in d)\n" +
"            this.bad_debt = d.bad_debt;\n" +
"        if (\"been_manually_marked_as_paid\" in d)\n" +
"            this.been_manually_marked_as_paid = d.been_manually_marked_as_paid;\n" +
"        if (\"billing_subscription_id\" in d)\n" +
"            this.billing_subscription_id = d.billing_subscription_id;\n" +
"        if (\"can_be_attached_to_a_cheque_deposit\" in d)\n" +
"            this.can_be_attached_to_a_cheque_deposit = d.can_be_attached_to_a_cheque_deposit;\n" +
"        if (\"can_be_finalized\" in d)\n" +
"            this.can_be_finalized = d.can_be_finalized;\n" +
"        if (\"can_be_manually_marked_as_paid\" in d)\n" +
"            this.can_be_manually_marked_as_paid = d.can_be_manually_marked_as_paid;\n" +
"        if (\"can_be_manually_marked_as_sent\" in d)\n" +
"            this.can_be_manually_marked_as_sent = d.can_be_manually_marked_as_sent;\n" +
"        if (\"can_be_stamped_as_paid_in_pdf\" in d)\n" +
"            this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;\n" +
"        if (\"can_be_unmarked_as_paid\" in d)\n" +
"            this.can_be_unmarked_as_paid = d.can_be_unmarked_as_paid;\n" +
"        if (\"can_be_unmarked_as_sent\" in d)\n" +
"            this.can_be_unmarked_as_sent = d.can_be_unmarked_as_sent;\n" +
"        if (\"can_request_a_fintecture_payment_url\" in d)\n" +
"            this.can_request_a_fintecture_payment_url = d.can_request_a_fintecture_payment_url;\n" +
"        if (\"cancellable\" in d)\n" +
"            this.cancellable = d.cancellable;\n" +
"        if (\"cancelled\" in d)\n" +
"            this.cancelled = d.cancelled;\n" +
"        if (\"checksum\" in d)\n" +
"            this.checksum = d.checksum;\n" +
"        if (\"client_comments_count\" in d)\n" +
"            this.client_comments_count = d.client_comments_count;\n" +
"        this.company_id = d.company_id;\n" +
"        if (\"complete\" in d)\n" +
"            this.complete = d.complete;\n" +
"        if (\"completeness\" in d)\n" +
"            this.completeness = d.completeness;\n" +
"        if (\"created_at\" in d)\n" +
"            this.created_at = d.created_at;\n" +
"        if (\"credit_note\" in d)\n" +
"            this.credit_note = d.credit_note;\n" +
"        if (\"credit_notes\" in d)\n" +
"            this.credit_notes = d.credit_notes;\n" +
"        if (\"credit_notes_amount\" in d)\n" +
"            this.credit_notes_amount = d.credit_notes_amount;\n" +
"        if (\"credited_invoice_id\" in d)\n" +
"            this.credited_invoice_id = d.credited_invoice_id;\n" +
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
"        if (\"current_account_plan_item_id\" in d)\n" +
"            this.current_account_plan_item_id = d.current_account_plan_item_id;\n" +
"        if (\"customer_validation_needed\" in d)\n" +
"            this.customer_validation_needed = d.customer_validation_needed;\n" +
"        if (\"date\" in d)\n" +
"            this.date = d.date;\n" +
"        if (\"deadline\" in d)\n" +
"            this.deadline = d.deadline;\n" +
"        if (\"defacto_loan_eligible\" in d)\n" +
"            this.defacto_loan_eligible = d.defacto_loan_eligible;\n" +
"        this.direction = d.direction;\n" +
"        if (\"discount\" in d)\n" +
"            this.discount = d.discount;\n" +
"        if (\"discount_type\" in d)\n" +
"            this.discount_type = d.discount_type;\n" +
"        if (\"display_reactivate_button\" in d)\n" +
"            this.display_reactivate_button = d.display_reactivate_button;\n" +
"        if (\"display_revoke_button\" in d)\n" +
"            this.display_revoke_button = d.display_revoke_button;\n" +
"        if (\"document_tags\" in d)\n" +
"            this.document_tags = d.document_tags;\n" +
"        if (\"draft\" in d)\n" +
"            this.draft = d.draft;\n" +
"        if (\"duplicates\" in d)\n" +
"            this.duplicates = d.duplicates;\n" +
"        if (\"email_from\" in d)\n" +
"            this.email_from = d.email_from;\n" +
"        if (\"embeddable_in_browser\" in d)\n" +
"            this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        if (\"external_id\" in d)\n" +
"            this.external_id = d.external_id;\n" +
"        if (\"factor_status\" in d)\n" +
"            this.factor_status = d.factor_status;\n" +
"        if (\"fec_pieceref\" in d)\n" +
"            this.fec_pieceref = d.fec_pieceref;\n" +
"        if (\"file_signed_id\" in d)\n" +
"            this.file_signed_id = d.file_signed_id;\n" +
"        if (\"filename\" in d)\n" +
"            this.filename = d.filename;\n" +
"        if (\"finalized_at\" in d)\n" +
"            this.finalized_at = d.finalized_at;\n" +
"        if (\"flow_approved\" in d)\n" +
"            this.flow_approved = d.flow_approved;\n" +
"        if (\"from_estimate_id\" in d)\n" +
"            this.from_estimate_id = d.from_estimate_id;\n" +
"        if (\"gdrive_path\" in d)\n" +
"            this.gdrive_path = d.gdrive_path;\n" +
"        if (\"gocardless_billing_subscription\" in d)\n" +
"            this.gocardless_billing_subscription = d.gocardless_billing_subscription;\n" +
"        if (\"group_uuid\" in d)\n" +
"            this.group_uuid = d.group_uuid;\n" +
"        if (\"grouped_at\" in d)\n" +
"            this.grouped_at = d.grouped_at;\n" +
"        if (\"grouped_documents\" in d)\n" +
"            this.grouped_documents = d.grouped_documents;\n" +
"        if (\"has_already_sent_an_email\" in d)\n" +
"            this.has_already_sent_an_email = d.has_already_sent_an_email;\n" +
"        if (\"has_credit_note\" in d)\n" +
"            this.has_credit_note = d.has_credit_note;\n" +
"        this.has_file = d.has_file;\n" +
"        if (\"has_grouped_documents\" in d)\n" +
"            this.has_grouped_documents = d.has_grouped_documents;\n" +
"        if (\"has_linked_quotes\" in d)\n" +
"            this.has_linked_quotes = d.has_linked_quotes;\n" +
"        if (\"has_pending_payments\" in d)\n" +
"            this.has_pending_payments = d.has_pending_payments;\n" +
"        if (\"hasTooManyLedgerEvents\" in d)\n" +
"            this.hasTooManyLedgerEvents = d.hasTooManyLedgerEvents;\n" +
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
"        if (\"invoice_status\" in d)\n" +
"            this.invoice_status = d.invoice_status;\n" +
"        if (\"invoicing_detailed_source\" in d)\n" +
"            this.invoicing_detailed_source = d.invoicing_detailed_source;\n" +
"        if (\"is_credit_note\" in d)\n" +
"            this.is_credit_note = d.is_credit_note;\n" +
"        if (\"is_destroyable\" in d)\n" +
"            this.is_destroyable = d.is_destroyable;\n" +
"        if (\"is_estimate\" in d)\n" +
"            this.is_estimate = d.is_estimate;\n" +
"        if (\"is_factur_x\" in d)\n" +
"            this.is_factur_x = d.is_factur_x;\n" +
"        if (\"is_payment_emitted\" in d)\n" +
"            this.is_payment_emitted = d.is_payment_emitted;\n" +
"        if (\"is_payment_found\" in d)\n" +
"            this.is_payment_found = d.is_payment_found;\n" +
"        if (\"is_payment_in_process\" in d)\n" +
"            this.is_payment_in_process = d.is_payment_in_process;\n" +
"        if (\"is_reconciliation_delay_expired\" in d)\n" +
"            this.is_reconciliation_delay_expired = d.is_reconciliation_delay_expired;\n" +
"        if (\"is_sendable\" in d)\n" +
"            this.is_sendable = d.is_sendable;\n" +
"        if (\"is_waiting_for_ocr\" in d)\n" +
"            this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        if (\"journal_id\" in d)\n" +
"            this.journal_id = d.journal_id;\n" +
"        if (\"label\" in d)\n" +
"            this.label = d.label;\n" +
"        if (\"language\" in d)\n" +
"            this.language = d.language;\n" +
"        if (\"last_payment\" in d)\n" +
"            this.last_payment = d.last_payment;\n" +
"        if (\"ledgerEvents\" in d)\n" +
"            this.ledgerEvents = d.ledgerEvents;\n" +
"        if (\"ledgerEventsCount\" in d)\n" +
"            this.ledgerEventsCount = d.ledgerEventsCount;\n" +
"        if (\"manually_marked_as_paid_at\" in d)\n" +
"            this.manually_marked_as_paid_at = d.manually_marked_as_paid_at;\n" +
"        if (\"manually_marked_as_sent_at\" in d)\n" +
"            this.manually_marked_as_sent_at = d.manually_marked_as_sent_at;\n" +
"        if (\"match_badge_count\" in d)\n" +
"            this.match_badge_count = d.match_badge_count;\n" +
"        if (\"means_of_payment\" in d)\n" +
"            this.means_of_payment = d.means_of_payment;\n" +
"        if (\"method\" in d)\n" +
"            this.method = d.method;\n" +
"        if (\"min_permitted_issue_date\" in d)\n" +
"            this.min_permitted_issue_date = d.min_permitted_issue_date;\n" +
"        if (\"multiplier\" in d)\n" +
"            this.multiplier = d.multiplier;\n" +
"        if (\"not_duplicate\" in d)\n" +
"            this.not_duplicate = d.not_duplicate;\n" +
"        if (\"ocr_iban\" in d)\n" +
"            this.ocr_iban = d.ocr_iban;\n" +
"        if (\"ocr_thirdparty_id\" in d)\n" +
"            this.ocr_thirdparty_id = d.ocr_thirdparty_id;\n" +
"        if (\"opened_at\" in d)\n" +
"            this.opened_at = d.opened_at;\n" +
"        if (\"outstanding_balance\" in d)\n" +
"            this.outstanding_balance = d.outstanding_balance;\n" +
"        if (\"owner\" in d)\n" +
"            this.owner = d.owner;\n" +
"        if (\"pages_count\" in d)\n" +
"            this.pages_count = d.pages_count;\n" +
"        if (\"paid\" in d)\n" +
"            this.paid = d.paid;\n" +
"        if (\"paid_by\" in d)\n" +
"            this.paid_by = d.paid_by;\n" +
"        if (\"paid_personally\" in d)\n" +
"            this.paid_personally = d.paid_personally;\n" +
"        if (\"partial_kind\" in d)\n" +
"            this.partial_kind = d.partial_kind;\n" +
"        if (\"partial_order\" in d)\n" +
"            this.partial_order = d.partial_order;\n" +
"        if (\"partial_percentage\" in d)\n" +
"            this.partial_percentage = d.partial_percentage;\n" +
"        if (\"partially_cancelled\" in d)\n" +
"            this.partially_cancelled = d.partially_cancelled;\n" +
"        if (\"past_payments\" in d)\n" +
"            this.past_payments = d.past_payments;\n" +
"        if (\"payment_emitted_at\" in d)\n" +
"            this.payment_emitted_at = d.payment_emitted_at;\n" +
"        if (\"payment_ids\" in d)\n" +
"            this.payment_ids = d.payment_ids;\n" +
"        if (\"payment_in_process_started_at\" in d)\n" +
"            this.payment_in_process_started_at = d.payment_in_process_started_at;\n" +
"        if (\"payment_method\" in d)\n" +
"            this.payment_method = d.payment_method;\n" +
"        if (\"payment_methods\" in d)\n" +
"            this.payment_methods = d.payment_methods;\n" +
"        if (\"payment_reference\" in d)\n" +
"            this.payment_reference = d.payment_reference;\n" +
"        if (\"payment_reminder_enabled\" in d)\n" +
"            this.payment_reminder_enabled = d.payment_reminder_enabled;\n" +
"        if (\"payment_reminder_recipients\" in d)\n" +
"            this.payment_reminder_recipients = d.payment_reminder_recipients;\n" +
"        if (\"payment_reminder_steps\" in d)\n" +
"            this.payment_reminder_steps = d.payment_reminder_steps;\n" +
"        if (\"payment_status\" in d)\n" +
"            this.payment_status = d.payment_status;\n" +
"        if (\"payments\" in d)\n" +
"            this.payments = d.payments;\n" +
"        if (\"pdf_description\" in d)\n" +
"            this.pdf_description = d.pdf_description;\n" +
"        if (\"pdf_generation_status\" in d)\n" +
"            this.pdf_generation_status = d.pdf_generation_status;\n" +
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
"        if (\"pdp_refusal_reason\" in d)\n" +
"            this.pdp_refusal_reason = d.pdp_refusal_reason;\n" +
"        if (\"pdp_status\" in d)\n" +
"            this.pdp_status = d.pdp_status;\n" +
"        if (\"pending\" in d)\n" +
"            this.pending = d.pending;\n" +
"        if (\"preview_status\" in d)\n" +
"            this.preview_status = d.preview_status;\n" +
"        if (\"preview_urls\" in d)\n" +
"            this.preview_urls = d.preview_urls;\n" +
"        if (\"price_before_tax\" in d)\n" +
"            this.price_before_tax = d.price_before_tax;\n" +
"        if (\"primary_badge\" in d)\n" +
"            this.primary_badge = d.primary_badge;\n" +
"        if (\"pro_account_check_deposits\" in d)\n" +
"            this.pro_account_check_deposits = d.pro_account_check_deposits;\n" +
"        if (\"public_link\" in d)\n" +
"            this.public_link = d.public_link;\n" +
"        if (\"purchase_request_id\" in d)\n" +
"            this.purchase_request_id = d.purchase_request_id;\n" +
"        if (\"purchase_request_ids\" in d)\n" +
"            this.purchase_request_ids = d.purchase_request_ids;\n" +
"        if (\"pusher_channel\" in d)\n" +
"            this.pusher_channel = d.pusher_channel;\n" +
"        if (\"quote_group_uuid\" in d)\n" +
"            this.quote_group_uuid = d.quote_group_uuid;\n" +
"        if (\"quote_uid\" in d)\n" +
"            this.quote_uid = d.quote_uid;\n" +
"        if (\"quotes\" in d)\n" +
"            this.quotes = d.quotes;\n" +
"        if (\"readonly\" in d)\n" +
"            this.readonly = d.readonly;\n" +
"        if (\"recipients\" in d)\n" +
"            this.recipients = d.recipients;\n" +
"        if (\"reconciled\" in d)\n" +
"            this.reconciled = d.reconciled;\n" +
"        if (\"remaining_amount\" in d)\n" +
"            this.remaining_amount = d.remaining_amount;\n" +
"        if (\"requires_validation\" in d)\n" +
"            this.requires_validation = d.requires_validation;\n" +
"        if (\"reviewed_by\" in d)\n" +
"            this.reviewed_by = d.reviewed_by;\n" +
"        if (\"scored_transactions\" in d)\n" +
"            this.scored_transactions = d.scored_transactions;\n" +
"        if (\"sepa_xml_exports\" in d)\n" +
"            this.sepa_xml_exports = d.sepa_xml_exports;\n" +
"        if (\"show_duplicates_tab\" in d)\n" +
"            this.show_duplicates_tab = d.show_duplicates_tab;\n" +
"        if (\"signed_type\" in d)\n" +
"            this.signed_type = d.signed_type;\n" +
"        if (\"size\" in d)\n" +
"            this.size = d.size;\n" +
"        if (\"source\" in d)\n" +
"            this.source = d.source;\n" +
"        if (\"source_document_id\" in d)\n" +
"            this.source_document_id = d.source_document_id;\n" +
"        if (\"source_document_label\" in d)\n" +
"            this.source_document_label = d.source_document_label;\n" +
"        if (\"source_metadata\" in d)\n" +
"            this.source_metadata = d.source_metadata;\n" +
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
"        if (\"team\" in d)\n" +
"            this.team = d.team;\n" +
"        if (\"thirdparty\" in d)\n" +
"            this.thirdparty = d.thirdparty;\n" +
"        if (\"thirdparty_id\" in d)\n" +
"            this.thirdparty_id = d.thirdparty_id;\n" +
"        this.type = d.type;\n" +
"        if (\"updated_at\" in d)\n" +
"            this.updated_at = d.updated_at;\n" +
"        this.url = d.url;\n" +
"        if (\"use_manual_partial_invoices\" in d)\n" +
"            this.use_manual_partial_invoices = d.use_manual_partial_invoices;\n" +
"        if (\"validated_at\" in d)\n" +
"            this.validated_at = d.validated_at;\n" +
"        if (\"validation_needed\" in d)\n" +
"            this.validation_needed = d.validation_needed;\n" +
"    }\n" +
"}\n" +
"class CreditNotesEntity {\n" +
"    static Parse(d) {\n" +
"        return CreditNotesEntity.Create(JSON.parse(d));\n" +
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
"        checkString$h(d.amount, field + \".amount\");\n" +
"        checkString$h(d.created_at, field + \".created_at\");\n" +
"        checkString$h(d.currency, field + \".currency\");\n" +
"        checkString$h(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$h(d.currency_tax, field + \".currency_tax\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$h(d.date, field + \".date\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.date, field + \".date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.file = File.Create(d.file, field + \".file\", \"File | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.file, field + \".file\", \"File | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.has_file, field + \".has_file\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkString$h(d.invoice_number, field + \".invoice_number\");\n" +
"        checkString$h(d.tax, field + \".tax\");\n" +
"        const knownProperties = [\"amount\", \"created_at\", \"currency\", \"currency_amount\", \"currency_tax\", \"date\", \"file\", \"has_file\", \"id\", \"invoice_number\", \"tax\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new CreditNotesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.created_at = d.created_at;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.date = d.date;\n" +
"        this.file = d.file;\n" +
"        this.has_file = d.has_file;\n" +
"        this.id = d.id;\n" +
"        this.invoice_number = d.invoice_number;\n" +
"        this.tax = d.tax;\n" +
"    }\n" +
"}\n" +
"class File {\n" +
"    static Parse(d) {\n" +
"        return File.Create(JSON.parse(d));\n" +
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
"        checkNumber$h(d.byte_size, field + \".byte_size\");\n" +
"        checkString$h(d.created_at, field + \".created_at\");\n" +
"        checkBoolean$d(d.embeddable_in_browser, field + \".embeddable_in_browser\");\n" +
"        checkString$h(d.filename, field + \".filename\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkString$h(d.preview_url, field + \".preview_url\");\n" +
"        checkString$h(d.signed_id, field + \".signed_id\");\n" +
"        checkString$h(d.url, field + \".url\");\n" +
"        const knownProperties = [\"byte_size\", \"created_at\", \"embeddable_in_browser\", \"filename\", \"id\", \"preview_url\", \"signed_id\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new File(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.byte_size = d.byte_size;\n" +
"        this.created_at = d.created_at;\n" +
"        this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        this.filename = d.filename;\n" +
"        this.id = d.id;\n" +
"        this.preview_url = d.preview_url;\n" +
"        this.signed_id = d.signed_id;\n" +
"        this.url = d.url;\n" +
"    }\n" +
"}\n" +
"let DocumentTagsEntity$1 = class DocumentTagsEntity {\n" +
"    static Parse(d) {\n" +
"        return DocumentTagsEntity.Create(JSON.parse(d));\n" +
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
"        checkNumber$h(d.document_id, field + \".document_id\");\n" +
"        checkNumber$h(d.group_id, field + \".group_id\");\n" +
"        if (\"id\" in d) {\n" +
"            checkNumber$h(d.id, field + \".id\");\n" +
"        }\n" +
"        d.tag = Tag$1.Create(d.tag, field + \".tag\");\n" +
"        checkNumber$h(d.tag_id, field + \".tag_id\");\n" +
"        if (\"weight\" in d) {\n" +
"            checkString$h(d.weight, field + \".weight\");\n" +
"        }\n" +
"        const knownProperties = [\"document_id\", \"group_id\", \"id\", \"tag\", \"tag_id\", \"weight\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"};\n" +
"let Tag$1 = class Tag {\n" +
"    static Parse(d) {\n" +
"        return Tag.Create(JSON.parse(d));\n" +
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
"        if (\"analytical_code\" in d) {\n" +
"            checkNull$e(d.analytical_code, field + \".analytical_code\");\n" +
"        }\n" +
"        checkString$h(d.color, field + \".color\");\n" +
"        if (\"direction\" in d) {\n" +
"            checkString$h(d.direction, field + \".direction\");\n" +
"        }\n" +
"        d.group = Group$2.Create(d.group, field + \".group\");\n" +
"        checkNumber$h(d.group_id, field + \".group_id\");\n" +
"        checkNull$e(d.icon, field + \".icon\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        if (\"is_editable\" in d) {\n" +
"            checkBoolean$d(d.is_editable, field + \".is_editable\");\n" +
"        }\n" +
"        checkString$h(d.label, field + \".label\");\n" +
"        if (\"method\" in d) {\n" +
"            checkString$h(d.method, field + \".method\");\n" +
"        }\n" +
"        if (\"rank\" in d) {\n" +
"            checkNumber$h(d.rank, field + \".rank\");\n" +
"        }\n" +
"        if (\"restricted_from_user\" in d) {\n" +
"            checkBoolean$d(d.restricted_from_user, field + \".restricted_from_user\");\n" +
"        }\n" +
"        if (\"url\" in d) {\n" +
"            checkString$h(d.url, field + \".url\");\n" +
"        }\n" +
"        checkNull$e(d.variant, field + \".variant\");\n" +
"        const knownProperties = [\"analytical_code\", \"color\", \"direction\", \"group\", \"group_id\", \"icon\", \"id\", \"is_editable\", \"label\", \"method\", \"rank\", \"restricted_from_user\", \"url\", \"variant\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Tag(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"analytical_code\" in d)\n" +
"            this.analytical_code = d.analytical_code;\n" +
"        this.color = d.color;\n" +
"        if (\"direction\" in d)\n" +
"            this.direction = d.direction;\n" +
"        this.group = d.group;\n" +
"        this.group_id = d.group_id;\n" +
"        this.icon = d.icon;\n" +
"        this.id = d.id;\n" +
"        if (\"is_editable\" in d)\n" +
"            this.is_editable = d.is_editable;\n" +
"        this.label = d.label;\n" +
"        if (\"method\" in d)\n" +
"            this.method = d.method;\n" +
"        if (\"rank\" in d)\n" +
"            this.rank = d.rank;\n" +
"        if (\"restricted_from_user\" in d)\n" +
"            this.restricted_from_user = d.restricted_from_user;\n" +
"        if (\"url\" in d)\n" +
"            this.url = d.url;\n" +
"        this.variant = d.variant;\n" +
"    }\n" +
"};\n" +
"let Group$2 = class Group {\n" +
"    static Parse(d) {\n" +
"        return Group.Create(JSON.parse(d));\n" +
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
"        checkString$h(d.icon, field + \".icon\");\n" +
"        if (\"id\" in d) {\n" +
"            checkNumber$h(d.id, field + \".id\");\n" +
"        }\n" +
"        if (\"kind\" in d) {\n" +
"            checkString$h(d.kind, field + \".kind\");\n" +
"        }\n" +
"        checkString$h(d.label, field + \".label\");\n" +
"        if (\"method\" in d) {\n" +
"            checkString$h(d.method, field + \".method\");\n" +
"        }\n" +
"        if (\"qonto_id\" in d) {\n" +
"            checkNull$e(d.qonto_id, field + \".qonto_id\");\n" +
"        }\n" +
"        checkBoolean$d(d.self_service_accounting, field + \".self_service_accounting\");\n" +
"        if (\"url\" in d) {\n" +
"            checkString$h(d.url, field + \".url\");\n" +
"        }\n" +
"        const knownProperties = [\"icon\", \"id\", \"kind\", \"label\", \"method\", \"qonto_id\", \"self_service_accounting\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Group(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.icon = d.icon;\n" +
"        if (\"id\" in d)\n" +
"            this.id = d.id;\n" +
"        if (\"kind\" in d)\n" +
"            this.kind = d.kind;\n" +
"        this.label = d.label;\n" +
"        if (\"method\" in d)\n" +
"            this.method = d.method;\n" +
"        if (\"qonto_id\" in d)\n" +
"            this.qonto_id = d.qonto_id;\n" +
"        this.self_service_accounting = d.self_service_accounting;\n" +
"        if (\"url\" in d)\n" +
"            this.url = d.url;\n" +
"    }\n" +
"};\n" +
"class DuplicatesEntity {\n" +
"    static Parse(d) {\n" +
"        return DuplicatesEntity.Create(JSON.parse(d));\n" +
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
"        checkString$h(d.amount, field + \".amount\");\n" +
"        checkString$h(d.currency, field + \".currency\");\n" +
"        checkString$h(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$h(d.date, field + \".date\");\n" +
"        checkString$h(d.direction, field + \".direction\");\n" +
"        checkBoolean$d(d.has_grouped_documents, field + \".has_grouped_documents\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkString$h(d.invoice_number, field + \".invoice_number\");\n" +
"        checkBoolean$d(d.not_duplicate, field + \".not_duplicate\");\n" +
"        checkString$h(d.source, field + \".source\");\n" +
"        d.thirdparty = Thirdparty1.Create(d.thirdparty, field + \".thirdparty\");\n" +
"        const knownProperties = [\"amount\", \"currency\", \"currency_amount\", \"date\", \"direction\", \"has_grouped_documents\", \"id\", \"invoice_number\", \"not_duplicate\", \"source\", \"thirdparty\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new DuplicatesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.date = d.date;\n" +
"        this.direction = d.direction;\n" +
"        this.has_grouped_documents = d.has_grouped_documents;\n" +
"        this.id = d.id;\n" +
"        this.invoice_number = d.invoice_number;\n" +
"        this.not_duplicate = d.not_duplicate;\n" +
"        this.source = d.source;\n" +
"        this.thirdparty = d.thirdparty;\n" +
"    }\n" +
"}\n" +
"class Thirdparty1 {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty1.Create(JSON.parse(d));\n" +
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
"        checkNumber$h(d.company_id, field + \".company_id\");\n" +
"        checkString$h(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkArray$b(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNever$3(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$h(d.iban, field + \".iban\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkString$h(d.name, field + \".name\");\n" +
"        checkString$h(d.notes, field + \".notes\");\n" +
"        checkNull$e(d.notes_last_updated_at, field + \".notes_last_updated_at\");\n" +
"        checkNull$e(d.notes_last_updated_by_name, field + \".notes_last_updated_by_name\");\n" +
"        checkNull$e(d.supplier_due_date_delay, field + \".supplier_due_date_delay\");\n" +
"        checkString$h(d.supplier_due_date_rule, field + \".supplier_due_date_rule\");\n" +
"        checkNull$e(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$h(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$h(d.validation_status, field + \".validation_status\");\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"emails\", \"iban\", \"id\", \"name\", \"notes\", \"notes_last_updated_at\", \"notes_last_updated_by_name\", \"supplier_due_date_delay\", \"supplier_due_date_rule\", \"supplier_payment_method\", \"supplier_payment_method_last_updated_at\", \"validation_status\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Thirdparty1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.emails = d.emails;\n" +
"        this.iban = d.iban;\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"        this.notes = d.notes;\n" +
"        this.notes_last_updated_at = d.notes_last_updated_at;\n" +
"        this.notes_last_updated_by_name = d.notes_last_updated_by_name;\n" +
"        this.supplier_due_date_delay = d.supplier_due_date_delay;\n" +
"        this.supplier_due_date_rule = d.supplier_due_date_rule;\n" +
"        this.supplier_payment_method = d.supplier_payment_method;\n" +
"        this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;\n" +
"        this.validation_status = d.validation_status;\n" +
"    }\n" +
"}\n" +
"let GroupedDocumentsEntity$1 = class GroupedDocumentsEntity {\n" +
"    static Parse(d) {\n" +
"        return GroupedDocumentsEntity.Create(JSON.parse(d));\n" +
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
"        checkNumber$h(d.company_id, field + \".company_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$h(d.direction, field + \".direction\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.direction, field + \".direction\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.embeddable_in_browser, field + \".embeddable_in_browser\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$h(d.filename, field + \".filename\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.filename, field + \".filename\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$d(d.has_file, field + \".has_file\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$h(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$b(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkNever$3(d.preview_urls[i], field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$h(d.pusher_channel, field + \".pusher_channel\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$h(d.size, field + \".size\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.size, field + \".size\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$h(d.type, field + \".type\");\n" +
"        checkString$h(d.url, field + \".url\");\n" +
"        const knownProperties = [\"company_id\", \"direction\", \"embeddable_in_browser\", \"filename\", \"has_file\", \"id\", \"preview_status\", \"preview_urls\", \"pusher_channel\", \"size\", \"type\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new GroupedDocumentsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this.direction = d.direction;\n" +
"        this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        this.filename = d.filename;\n" +
"        this.has_file = d.has_file;\n" +
"        this.id = d.id;\n" +
"        this.preview_status = d.preview_status;\n" +
"        this.preview_urls = d.preview_urls;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.size = d.size;\n" +
"        this.type = d.type;\n" +
"        this.url = d.url;\n" +
"    }\n" +
"};\n" +
"let InvoiceLinesEntity$2 = class InvoiceLinesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoiceLinesEntity.Create(JSON.parse(d));\n" +
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
"        if (\"advance_id\" in d) {\n" +
"            checkNull$e(d.advance_id, field + \".advance_id\");\n" +
"        }\n" +
"        checkString$h(d.amount, field + \".amount\");\n" +
"        if (\"asset_id\" in d) {\n" +
"            checkNull$e(d.asset_id, field + \".asset_id\");\n" +
"        }\n" +
"        if (\"company_id\" in d) {\n" +
"            checkNumber$h(d.company_id, field + \".company_id\");\n" +
"        }\n" +
"        if (\"created_at\" in d) {\n" +
"            checkString$h(d.created_at, field + \".created_at\");\n" +
"        }\n" +
"        checkString$h(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$h(d.currency_price_before_tax, field + \".currency_price_before_tax\");\n" +
"        checkString$h(d.currency_tax, field + \".currency_tax\");\n" +
"        checkNull$e(d.deferral, field + \".deferral\");\n" +
"        checkNull$e(d.deferral_id, field + \".deferral_id\");\n" +
"        checkString$h(d.description, field + \".description\");\n" +
"        if (\"discount\" in d) {\n" +
"            checkString$h(d.discount, field + \".discount\");\n" +
"        }\n" +
"        if (\"discount_type\" in d) {\n" +
"            checkString$h(d.discount_type, field + \".discount_type\");\n" +
"        }\n" +
"        if (\"document_id\" in d) {\n" +
"            checkNumber$h(d.document_id, field + \".document_id\");\n" +
"        }\n" +
"        checkBoolean$d(d.global_vat, field + \".global_vat\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkNull$e(d.invoice_line_period, field + \".invoice_line_period\");\n" +
"        if (\"invoice_line_section_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.invoice_line_section_id, field + \".invoice_line_section_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$h(d.invoice_line_section_id, field + \".invoice_line_section_id\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"label\" in d) {\n" +
"            checkString$h(d.label, field + \".label\");\n" +
"        }\n" +
"        if (\"manual_vat_mode\" in d) {\n" +
"            checkBoolean$d(d.manual_vat_mode, field + \".manual_vat_mode\");\n" +
"        }\n" +
"        if (\"ocr_vat_rate\" in d) {\n" +
"            checkNull$e(d.ocr_vat_rate, field + \".ocr_vat_rate\");\n" +
"        }\n" +
"        checkNumber$h(d.pnl_plan_item_id, field + \".pnl_plan_item_id\");\n" +
"        if (\"prepaid_pnl\" in d) {\n" +
"            checkBoolean$d(d.prepaid_pnl, field + \".prepaid_pnl\");\n" +
"        }\n" +
"        checkString$h(d.price_before_tax, field + \".price_before_tax\");\n" +
"        checkNull$e(d.product_id, field + \".product_id\");\n" +
"        checkString$h(d.quantity, field + \".quantity\");\n" +
"        if (\"rank\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.rank, field + \".rank\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$h(d.rank, field + \".rank\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"raw_currency_unit_price\" in d) {\n" +
"            checkString$h(d.raw_currency_unit_price, field + \".raw_currency_unit_price\");\n" +
"        }\n" +
"        checkString$h(d.tax, field + \".tax\");\n" +
"        if (\"undiscounted_currency_price_before_tax\" in d) {\n" +
"            checkString$h(d.undiscounted_currency_price_before_tax, field + \".undiscounted_currency_price_before_tax\");\n" +
"        }\n" +
"        if (\"unit\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.unit, field + \".unit\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$h(d.unit, field + \".unit\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$h(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"advance_id\", \"amount\", \"asset_id\", \"company_id\", \"created_at\", \"currency_amount\", \"currency_price_before_tax\", \"currency_tax\", \"deferral\", \"deferral_id\", \"description\", \"discount\", \"discount_type\", \"document_id\", \"global_vat\", \"id\", \"invoice_line_period\", \"invoice_line_section_id\", \"label\", \"manual_vat_mode\", \"ocr_vat_rate\", \"pnl_plan_item_id\", \"prepaid_pnl\", \"price_before_tax\", \"product_id\", \"quantity\", \"rank\", \"raw_currency_unit_price\", \"tax\", \"undiscounted_currency_price_before_tax\", \"unit\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"advance_id\" in d)\n" +
"            this.advance_id = d.advance_id;\n" +
"        this.amount = d.amount;\n" +
"        if (\"asset_id\" in d)\n" +
"            this.asset_id = d.asset_id;\n" +
"        if (\"company_id\" in d)\n" +
"            this.company_id = d.company_id;\n" +
"        if (\"created_at\" in d)\n" +
"            this.created_at = d.created_at;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.deferral = d.deferral;\n" +
"        this.deferral_id = d.deferral_id;\n" +
"        this.description = d.description;\n" +
"        if (\"discount\" in d)\n" +
"            this.discount = d.discount;\n" +
"        if (\"discount_type\" in d)\n" +
"            this.discount_type = d.discount_type;\n" +
"        if (\"document_id\" in d)\n" +
"            this.document_id = d.document_id;\n" +
"        this.global_vat = d.global_vat;\n" +
"        this.id = d.id;\n" +
"        this.invoice_line_period = d.invoice_line_period;\n" +
"        if (\"invoice_line_section_id\" in d)\n" +
"            this.invoice_line_section_id = d.invoice_line_section_id;\n" +
"        if (\"label\" in d)\n" +
"            this.label = d.label;\n" +
"        if (\"manual_vat_mode\" in d)\n" +
"            this.manual_vat_mode = d.manual_vat_mode;\n" +
"        if (\"ocr_vat_rate\" in d)\n" +
"            this.ocr_vat_rate = d.ocr_vat_rate;\n" +
"        this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        if (\"prepaid_pnl\" in d)\n" +
"            this.prepaid_pnl = d.prepaid_pnl;\n" +
"        this.price_before_tax = d.price_before_tax;\n" +
"        this.product_id = d.product_id;\n" +
"        this.quantity = d.quantity;\n" +
"        if (\"rank\" in d)\n" +
"            this.rank = d.rank;\n" +
"        if (\"raw_currency_unit_price\" in d)\n" +
"            this.raw_currency_unit_price = d.raw_currency_unit_price;\n" +
"        this.tax = d.tax;\n" +
"        if (\"undiscounted_currency_price_before_tax\" in d)\n" +
"            this.undiscounted_currency_price_before_tax = d.undiscounted_currency_price_before_tax;\n" +
"        if (\"unit\" in d)\n" +
"            this.unit = d.unit;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"};\n" +
"class LedgerEventsEntity {\n" +
"    static Parse(d) {\n" +
"        return LedgerEventsEntity.Create(JSON.parse(d));\n" +
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
"        checkString$h(d.balance, field + \".balance\");\n" +
"        checkNumber$h(d.company_id, field + \".company_id\");\n" +
"        checkString$h(d.created_at, field + \".created_at\");\n" +
"        checkString$h(d.credit, field + \".credit\");\n" +
"        checkString$h(d.date, field + \".date\");\n" +
"        checkString$h(d.debit, field + \".debit\");\n" +
"        checkNumber$h(d.document_id, field + \".document_id\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkNull$e(d.label, field + \".label\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.lettering = Lettering$1.Create(d.lettering, field + \".lettering\", \"Lettering | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.lettering, field + \".lettering\", \"Lettering | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$h(d.lettering_id, field + \".lettering_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$e(d.lettering_id, field + \".lettering_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$h(d.plan_item_id, field + \".plan_item_id\");\n" +
"        d.planItem = PlanItem$2.Create(d.planItem, field + \".planItem\");\n" +
"        checkBoolean$d(d.readonly, field + \".readonly\");\n" +
"        checkBoolean$d(d.readonlyAmounts, field + \".readonlyAmounts\");\n" +
"        checkNull$e(d.reallocation_id, field + \".reallocation_id\");\n" +
"        checkNull$e(d.reconciliation_id, field + \".reconciliation_id\");\n" +
"        checkString$h(d.source, field + \".source\");\n" +
"        const knownProperties = [\"balance\", \"company_id\", \"created_at\", \"credit\", \"date\", \"debit\", \"document_id\", \"id\", \"label\", \"lettering\", \"lettering_id\", \"plan_item_id\", \"planItem\", \"readonly\", \"readonlyAmounts\", \"reallocation_id\", \"reconciliation_id\", \"source\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.lettering = d.lettering;\n" +
"        this.lettering_id = d.lettering_id;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.planItem = d.planItem;\n" +
"        this.readonly = d.readonly;\n" +
"        this.readonlyAmounts = d.readonlyAmounts;\n" +
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
"        checkString$h(d.balance, field + \".balance\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkString$h(d.plan_item_number, field + \".plan_item_number\");\n" +
"        const knownProperties = [\"balance\", \"id\", \"plan_item_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Lettering(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.balance = d.balance;\n" +
"        this.id = d.id;\n" +
"        this.plan_item_number = d.plan_item_number;\n" +
"    }\n" +
"};\n" +
"let PlanItem$2 = class PlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItem.Create(JSON.parse(d));\n" +
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
"        checkNumber$h(d.company_id, field + \".company_id\");\n" +
"        checkString$h(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$d(d.enabled, field + \".enabled\");\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        checkNull$e(d.internal_identifier, field + \".internal_identifier\");\n" +
"        checkString$h(d.label, field + \".label\");\n" +
"        checkBoolean$d(d.label_is_editable, field + \".label_is_editable\");\n" +
"        checkString$h(d.number, field + \".number\");\n" +
"        checkString$h(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PlanItem(d);\n" +
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
"};\n" +
"class SourceMetadata {\n" +
"    static Parse(d) {\n" +
"        return SourceMetadata.Create(JSON.parse(d));\n" +
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
"        checkNull$e(d.from, field + \".from\");\n" +
"        checkString$h(d.path, field + \".path\");\n" +
"        const knownProperties = [\"from\", \"path\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new SourceMetadata(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.from = d.from;\n" +
"        this.path = d.path;\n" +
"    }\n" +
"}\n" +
"let Thirdparty$2 = class Thirdparty {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty.Create(JSON.parse(d));\n" +
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
"        if (\"activity_code\" in d) {\n" +
"            checkString$h(d.activity_code, field + \".activity_code\");\n" +
"        }\n" +
"        if (\"activity_nomenclature\" in d) {\n" +
"            checkString$h(d.activity_nomenclature, field + \".activity_nomenclature\");\n" +
"        }\n" +
"        if (\"address\" in d) {\n" +
"            checkString$h(d.address, field + \".address\");\n" +
"        }\n" +
"        if (\"balance\" in d) {\n" +
"            checkNull$e(d.balance, field + \".balance\");\n" +
"        }\n" +
"        if (\"billing_bank\" in d) {\n" +
"            checkNull$e(d.billing_bank, field + \".billing_bank\");\n" +
"        }\n" +
"        if (\"billing_bic\" in d) {\n" +
"            checkNull$e(d.billing_bic, field + \".billing_bic\");\n" +
"        }\n" +
"        if (\"billing_footer_invoice_id\" in d) {\n" +
"            checkNull$e(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        }\n" +
"        if (\"billing_iban\" in d) {\n" +
"            checkNull$e(d.billing_iban, field + \".billing_iban\");\n" +
"        }\n" +
"        if (\"billing_language\" in d) {\n" +
"            checkString$h(d.billing_language, field + \".billing_language\");\n" +
"        }\n" +
"        if (\"city\" in d) {\n" +
"            checkString$h(d.city, field + \".city\");\n" +
"        }\n" +
"        checkNumber$h(d.company_id, field + \".company_id\");\n" +
"        if (\"complete\" in d) {\n" +
"            checkBoolean$d(d.complete, field + \".complete\");\n" +
"        }\n" +
"        if (\"country\" in d) {\n" +
"            checkNull$e(d.country, field + \".country\");\n" +
"        }\n" +
"        checkString$h(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        if (\"credits\" in d) {\n" +
"            checkNull$e(d.credits, field + \".credits\");\n" +
"        }\n" +
"        if (\"customer_type\" in d) {\n" +
"            checkString$h(d.customer_type, field + \".customer_type\");\n" +
"        }\n" +
"        if (\"debits\" in d) {\n" +
"            checkNull$e(d.debits, field + \".debits\");\n" +
"        }\n" +
"        if (\"delivery_address\" in d) {\n" +
"            checkString$h(d.delivery_address, field + \".delivery_address\");\n" +
"        }\n" +
"        if (\"delivery_city\" in d) {\n" +
"            checkString$h(d.delivery_city, field + \".delivery_city\");\n" +
"        }\n" +
"        if (\"delivery_country\" in d) {\n" +
"            checkNull$e(d.delivery_country, field + \".delivery_country\");\n" +
"        }\n" +
"        if (\"delivery_country_alpha2\" in d) {\n" +
"            checkString$h(d[\"delivery_country_alpha2\"], field + \".delivery_country_alpha2\");\n" +
"        }\n" +
"        if (\"delivery_postal_code\" in d) {\n" +
"            checkString$h(d.delivery_postal_code, field + \".delivery_postal_code\");\n" +
"        }\n" +
"        if (\"disable_pending_vat\" in d) {\n" +
"            checkBoolean$d(d.disable_pending_vat, field + \".disable_pending_vat\");\n" +
"        }\n" +
"        if (\"display_name\" in d) {\n" +
"            checkNull$e(d.display_name, field + \".display_name\");\n" +
"        }\n" +
"        checkArray$b(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNever$3(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        if (\"estimate_count\" in d) {\n" +
"            checkNull$e(d.estimate_count, field + \".estimate_count\");\n" +
"        }\n" +
"        if (\"first_name\" in d) {\n" +
"            checkString$h(d.first_name, field + \".first_name\");\n" +
"        }\n" +
"        if (\"gender\" in d) {\n" +
"            checkNull$e(d.gender, field + \".gender\");\n" +
"        }\n" +
"        if (\"gocardless_id\" in d) {\n" +
"            checkNull$e(d.gocardless_id, field + \".gocardless_id\");\n" +
"        }\n" +
"        checkString$h(d.iban, field + \".iban\");\n" +
"        if (\"iban_last_update\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$e(d.iban_last_update, field + \".iban_last_update\", \"null | IbanLastUpdate\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    d.iban_last_update = IbanLastUpdate$1.Create(d.iban_last_update, field + \".iban_last_update\", \"null | IbanLastUpdate\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkNumber$h(d.id, field + \".id\");\n" +
"        if (\"invoice_count\" in d) {\n" +
"            checkNull$e(d.invoice_count, field + \".invoice_count\");\n" +
"        }\n" +
"        if (\"invoice_dump_id\" in d) {\n" +
"            checkNull$e(d.invoice_dump_id, field + \".invoice_dump_id\");\n" +
"        }\n" +
"        if (\"invoices_auto_generated\" in d) {\n" +
"            checkBoolean$d(d.invoices_auto_generated, field + \".invoices_auto_generated\");\n" +
"        }\n" +
"        if (\"invoices_auto_validated\" in d) {\n" +
"            checkBoolean$d(d.invoices_auto_validated, field + \".invoices_auto_validated\");\n" +
"        }\n" +
"        if (\"known_supplier_id\" in d) {\n" +
"            checkNull$e(d.known_supplier_id, field + \".known_supplier_id\");\n" +
"        }\n" +
"        if (\"last_name\" in d) {\n" +
"            checkString$h(d.last_name, field + \".last_name\");\n" +
"        }\n" +
"        if (\"ledger_events_count\" in d) {\n" +
"            checkNull$e(d.ledger_events_count, field + \".ledger_events_count\");\n" +
"        }\n" +
"        if (\"legal_form_code\" in d) {\n" +
"            checkString$h(d.legal_form_code, field + \".legal_form_code\");\n" +
"        }\n" +
"        if (\"method\" in d) {\n" +
"            checkString$h(d.method, field + \".method\");\n" +
"        }\n" +
"        checkString$h(d.name, field + \".name\");\n" +
"        checkString$h(d.notes, field + \".notes\");\n" +
"        if (\"notes_last_updated_at\" in d) {\n" +
"            checkNull$e(d.notes_last_updated_at, field + \".notes_last_updated_at\");\n" +
"        }\n" +
"        if (\"notes_last_updated_by_name\" in d) {\n" +
"            checkNull$e(d.notes_last_updated_by_name, field + \".notes_last_updated_by_name\");\n" +
"        }\n" +
"        if (\"payment_conditions\" in d) {\n" +
"            checkString$h(d.payment_conditions, field + \".payment_conditions\");\n" +
"        }\n" +
"        if (\"phone\" in d) {\n" +
"            checkString$h(d.phone, field + \".phone\");\n" +
"        }\n" +
"        if (\"plan_item_id\" in d) {\n" +
"            checkNumber$h(d.plan_item_id, field + \".plan_item_id\");\n" +
"        }\n" +
"        if (\"pnl_plan_item_id\" in d) {\n" +
"            checkNumber$h(d.pnl_plan_item_id, field + \".pnl_plan_item_id\");\n" +
"        }\n" +
"        if (\"postal_code\" in d) {\n" +
"            checkString$h(d.postal_code, field + \".postal_code\");\n" +
"        }\n" +
"        if (\"purchase_request_count\" in d) {\n" +
"            checkNull$e(d.purchase_request_count, field + \".purchase_request_count\");\n" +
"        }\n" +
"        if (\"recipient\" in d) {\n" +
"            checkString$h(d.recipient, field + \".recipient\");\n" +
"        }\n" +
"        if (\"recurrent\" in d) {\n" +
"            checkBoolean$d(d.recurrent, field + \".recurrent\");\n" +
"        }\n" +
"        if (\"reference\" in d) {\n" +
"            checkString$h(d.reference, field + \".reference\");\n" +
"        }\n" +
"        if (\"reg_no\" in d) {\n" +
"            checkString$h(d.reg_no, field + \".reg_no\");\n" +
"        }\n" +
"        if (\"role\" in d) {\n" +
"            checkString$h(d.role, field + \".role\");\n" +
"        }\n" +
"        if (\"rule_enabled\" in d) {\n" +
"            checkBoolean$d(d.rule_enabled, field + \".rule_enabled\");\n" +
"        }\n" +
"        if (\"search_terms\" in d) {\n" +
"            checkArray$b(d.search_terms, field + \".search_terms\");\n" +
"            if (d.search_terms) {\n" +
"                for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                    checkString$h(d.search_terms[i], field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"source_id\" in d) {\n" +
"            checkString$h(d.source_id, field + \".source_id\");\n" +
"        }\n" +
"        if (\"stripe_id\" in d) {\n" +
"            checkNull$e(d.stripe_id, field + \".stripe_id\");\n" +
"        }\n" +
"        if (\"supplier_due_date_delay\" in d) {\n" +
"            checkNull$e(d.supplier_due_date_delay, field + \".supplier_due_date_delay\");\n" +
"        }\n" +
"        if (\"supplier_due_date_rule\" in d) {\n" +
"            checkString$h(d.supplier_due_date_rule, field + \".supplier_due_date_rule\");\n" +
"        }\n" +
"        if (\"supplier_ibans\" in d) {\n" +
"            checkArray$b(d.supplier_ibans, field + \".supplier_ibans\");\n" +
"            if (d.supplier_ibans) {\n" +
"                for (let i = 0; i < d.supplier_ibans.length; i++) {\n" +
"                    checkNever$3(d.supplier_ibans[i], field + \".supplier_ibans\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkNull$e(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$e(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$h(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"turnover\" in d) {\n" +
"            checkNull$e(d.turnover, field + \".turnover\");\n" +
"        }\n" +
"        if (\"url\" in d) {\n" +
"            checkString$h(d.url, field + \".url\");\n" +
"        }\n" +
"        if (\"validation_status\" in d) {\n" +
"            checkString$h(d.validation_status, field + \".validation_status\");\n" +
"        }\n" +
"        if (\"vat_number\" in d) {\n" +
"            checkString$h(d.vat_number, field + \".vat_number\");\n" +
"        }\n" +
"        if (\"vat_rate\" in d) {\n" +
"            checkString$h(d.vat_rate, field + \".vat_rate\");\n" +
"        }\n" +
"        const knownProperties = [\"activity_code\", \"activity_nomenclature\", \"address\", \"balance\", \"billing_bank\", \"billing_bic\", \"billing_footer_invoice_id\", \"billing_iban\", \"billing_language\", \"city\", \"company_id\", \"complete\", \"country\", \"country_alpha2\", \"credits\", \"customer_type\", \"debits\", \"delivery_address\", \"delivery_city\", \"delivery_country\", \"delivery_country_alpha2\", \"delivery_postal_code\", \"disable_pending_vat\", \"display_name\", \"emails\", \"estimate_count\", \"first_name\", \"gender\", \"gocardless_id\", \"iban\", \"iban_last_update\", \"id\", \"invoice_count\", \"invoice_dump_id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"known_supplier_id\", \"last_name\", \"ledger_events_count\", \"legal_form_code\", \"method\", \"name\", \"notes\", \"notes_last_updated_at\", \"notes_last_updated_by_name\", \"payment_conditions\", \"phone\", \"plan_item_id\", \"pnl_plan_item_id\", \"postal_code\", \"purchase_request_count\", \"recipient\", \"recurrent\", \"reference\", \"reg_no\", \"role\", \"rule_enabled\", \"search_terms\", \"source_id\", \"stripe_id\", \"supplier_due_date_delay\", \"supplier_due_date_rule\", \"supplier_ibans\", \"supplier_payment_method\", \"supplier_payment_method_last_updated_at\", \"turnover\", \"url\", \"validation_status\", \"vat_number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Thirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"activity_code\" in d)\n" +
"            this.activity_code = d.activity_code;\n" +
"        if (\"activity_nomenclature\" in d)\n" +
"            this.activity_nomenclature = d.activity_nomenclature;\n" +
"        if (\"address\" in d)\n" +
"            this.address = d.address;\n" +
"        if (\"balance\" in d)\n" +
"            this.balance = d.balance;\n" +
"        if (\"billing_bank\" in d)\n" +
"            this.billing_bank = d.billing_bank;\n" +
"        if (\"billing_bic\" in d)\n" +
"            this.billing_bic = d.billing_bic;\n" +
"        if (\"billing_footer_invoice_id\" in d)\n" +
"            this.billing_footer_invoice_id = d.billing_footer_invoice_id;\n" +
"        if (\"billing_iban\" in d)\n" +
"            this.billing_iban = d.billing_iban;\n" +
"        if (\"billing_language\" in d)\n" +
"            this.billing_language = d.billing_language;\n" +
"        if (\"city\" in d)\n" +
"            this.city = d.city;\n" +
"        this.company_id = d.company_id;\n" +
"        if (\"complete\" in d)\n" +
"            this.complete = d.complete;\n" +
"        if (\"country\" in d)\n" +
"            this.country = d.country;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        if (\"credits\" in d)\n" +
"            this.credits = d.credits;\n" +
"        if (\"customer_type\" in d)\n" +
"            this.customer_type = d.customer_type;\n" +
"        if (\"debits\" in d)\n" +
"            this.debits = d.debits;\n" +
"        if (\"delivery_address\" in d)\n" +
"            this.delivery_address = d.delivery_address;\n" +
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
"        this.emails = d.emails;\n" +
"        if (\"estimate_count\" in d)\n" +
"            this.estimate_count = d.estimate_count;\n" +
"        if (\"first_name\" in d)\n" +
"            this.first_name = d.first_name;\n" +
"        if (\"gender\" in d)\n" +
"            this.gender = d.gender;\n" +
"        if (\"gocardless_id\" in d)\n" +
"            this.gocardless_id = d.gocardless_id;\n" +
"        this.iban = d.iban;\n" +
"        if (\"iban_last_update\" in d)\n" +
"            this.iban_last_update = d.iban_last_update;\n" +
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
"        this.notes = d.notes;\n" +
"        if (\"notes_last_updated_at\" in d)\n" +
"            this.notes_last_updated_at = d.notes_last_updated_at;\n" +
"        if (\"notes_last_updated_by_name\" in d)\n" +
"            this.notes_last_updated_by_name = d.notes_last_updated_by_name;\n" +
"        if (\"payment_conditions\" in d)\n" +
"            this.payment_conditions = d.payment_conditions;\n" +
"        if (\"phone\" in d)\n" +
"            this.phone = d.phone;\n" +
"        if (\"plan_item_id\" in d)\n" +
"            this.plan_item_id = d.plan_item_id;\n" +
"        if (\"pnl_plan_item_id\" in d)\n" +
"            this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        if (\"postal_code\" in d)\n" +
"            this.postal_code = d.postal_code;\n" +
"        if (\"purchase_request_count\" in d)\n" +
"            this.purchase_request_count = d.purchase_request_count;\n" +
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
"        if (\"supplier_due_date_delay\" in d)\n" +
"            this.supplier_due_date_delay = d.supplier_due_date_delay;\n" +
"        if (\"supplier_due_date_rule\" in d)\n" +
"            this.supplier_due_date_rule = d.supplier_due_date_rule;\n" +
"        if (\"supplier_ibans\" in d)\n" +
"            this.supplier_ibans = d.supplier_ibans;\n" +
"        this.supplier_payment_method = d.supplier_payment_method;\n" +
"        this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;\n" +
"        if (\"turnover\" in d)\n" +
"            this.turnover = d.turnover;\n" +
"        if (\"url\" in d)\n" +
"            this.url = d.url;\n" +
"        if (\"validation_status\" in d)\n" +
"            this.validation_status = d.validation_status;\n" +
"        if (\"vat_number\" in d)\n" +
"            this.vat_number = d.vat_number;\n" +
"        if (\"vat_rate\" in d)\n" +
"            this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"};\n" +
"let IbanLastUpdate$1 = class IbanLastUpdate {\n" +
"    static Parse(d) {\n" +
"        return IbanLastUpdate.Create(JSON.parse(d));\n" +
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
"        checkString$h(d.at, field + \".at\");\n" +
"        checkBoolean$d(d.from_pennylane, field + \".from_pennylane\");\n" +
"        checkString$h(d.name, field + \".name\");\n" +
"        const knownProperties = [\"at\", \"from_pennylane\", \"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$j(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new IbanLastUpdate(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.at = d.at;\n" +
"        this.from_pennylane = d.from_pennylane;\n" +
"        this.name = d.name;\n" +
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
"function checkNumber$h(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$j(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$d(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$j(field, value, multiple ?? \"boolean\");\n" +
"}\n" +
"function checkString$h(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$j(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$e(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$j(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$3(value, field, multiple) {\n" +
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
"class APIDocument {\n" +
"    static Parse(d) {\n" +
"        return APIDocument.Create(JSON.parse(d));\n" +
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
"        checkNumber$g(d.company_id, field + \".company_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$g(d.direction, field + \".direction\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$d(d.direction, field + \".direction\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$a(d.grouped_documents, field + \".grouped_documents\");\n" +
"        if (d.grouped_documents) {\n" +
"            for (let i = 0; i < d.grouped_documents.length; i++) {\n" +
"                d.grouped_documents[i] = GroupedDocumentsEntity.Create(d.grouped_documents[i], field + \".grouped_documents\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$c(d.has_file, field + \".has_file\");\n" +
"        checkNumber$g(d.id, field + \".id\");\n" +
"        checkString$g(d.type, field + \".type\");\n" +
"        checkString$g(d.url, field + \".url\");\n" +
"        const knownProperties = [\"company_id\", \"direction\", \"grouped_documents\", \"has_file\", \"id\", \"type\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$i(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDocument(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this.direction = d.direction;\n" +
"        this.grouped_documents = d.grouped_documents;\n" +
"        this.has_file = d.has_file;\n" +
"        this.id = d.id;\n" +
"        this.type = d.type;\n" +
"        this.url = d.url;\n" +
"    }\n" +
"}\n" +
"class GroupedDocumentsEntity {\n" +
"    static Parse(d) {\n" +
"        return GroupedDocumentsEntity.Create(JSON.parse(d));\n" +
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
"        checkNumber$g(d.company_id, field + \".company_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$g(d.direction, field + \".direction\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$d(d.direction, field + \".direction\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$c(d.embeddable_in_browser, field + \".embeddable_in_browser\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$g(d.filename, field + \".filename\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$d(d.filename, field + \".filename\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$c(d.has_file, field + \".has_file\");\n" +
"        checkNumber$g(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$g(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$d(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$a(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString$g(d.preview_urls[i], field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$g(d.pusher_channel, field + \".pusher_channel\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$g(d.size, field + \".size\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$d(d.size, field + \".size\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$g(d.type, field + \".type\");\n" +
"        checkString$g(d.url, field + \".url\");\n" +
"        const knownProperties = [\"company_id\", \"direction\", \"embeddable_in_browser\", \"filename\", \"has_file\", \"id\", \"preview_status\", \"preview_urls\", \"pusher_channel\", \"size\", \"type\", \"url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$i(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new GroupedDocumentsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this.direction = d.direction;\n" +
"        this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        this.filename = d.filename;\n" +
"        this.has_file = d.has_file;\n" +
"        this.id = d.id;\n" +
"        this.preview_status = d.preview_status;\n" +
"        this.preview_urls = d.preview_urls;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.size = d.size;\n" +
"        this.type = d.type;\n" +
"        this.url = d.url;\n" +
"    }\n" +
"}\n" +
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
"        errorHelper$i(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$g(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$i(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$c(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$i(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$g(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$i(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$d(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$i(field, value, multiple);\n" +
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
"class APIDocumentMatching {\n" +
"    static Parse(d) {\n" +
"        return APIDocumentMatching.Create(JSON.parse(d));\n" +
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
"        checkString$f(d.amount, field + \".amount\");\n" +
"        checkNumber$f(d.company_id, field + \".company_id\");\n" +
"        checkString$f(d.currency, field + \".currency\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$f(d.date, field + \".date\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$c(d.date, field + \".date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$f(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$f(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$f(d.id, field + \".id\");\n" +
"        checkString$f(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        checkNull$c(d.proof_count, field + \".proof_count\");\n" +
"        checkString$f(d.type, field + \".type\");\n" +
"        checkString$f(d.updated_at, field + \".updated_at\");\n" +
"        const knownProperties = [\"amount\", \"company_id\", \"currency\", \"date\", \"gross_amount\", \"group_uuid\", \"id\", \"outstanding_balance\", \"proof_count\", \"type\", \"updated_at\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$h(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$h(field, value, multiple) {\n" +
"    return errorHelper$h(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$h(field, value, multiple) {\n" +
"    return errorHelper$h(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$h(field, value, multiple) {\n" +
"    return errorHelper$h(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$f(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$h(field, value, \"number\");\n" +
"}\n" +
"function checkString$f(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$h(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$c(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$h(field, value, multiple ?? \"null\");\n" +
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
"class APIDocumentMatchingInvoice {\n" +
"    static Parse(d) {\n" +
"        return APIDocumentMatchingInvoice.Create(JSON.parse(d));\n" +
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
"        checkArray$9(d.grouped_transactions, field + \".grouped_transactions\");\n" +
"        if (d.grouped_transactions) {\n" +
"            for (let i = 0; i < d.grouped_transactions.length; i++) {\n" +
"                d.grouped_transactions[i] = GroupedTransactionsEntity$1.Create(d.grouped_transactions[i], field + \".grouped_transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$e(d.multiplier, field + \".multiplier\");\n" +
"        checkString$e(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        checkArray$9(d.suggested_transactions, field + \".suggested_transactions\");\n" +
"        if (d.suggested_transactions) {\n" +
"            for (let i = 0; i < d.suggested_transactions.length; i++) {\n" +
"                d.suggested_transactions[i] = SuggestedTransactionsEntity.Create(d.suggested_transactions[i], field + \".suggested_transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"grouped_transactions\", \"multiplier\", \"outstanding_balance\", \"suggested_transactions\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$g(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIDocumentMatchingInvoice(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.grouped_transactions = d.grouped_transactions;\n" +
"        this.multiplier = d.multiplier;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.suggested_transactions = d.suggested_transactions;\n" +
"    }\n" +
"}\n" +
"let GroupedTransactionsEntity$1 = class GroupedTransactionsEntity {\n" +
"    static Parse(d) {\n" +
"        return GroupedTransactionsEntity.Create(JSON.parse(d));\n" +
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
"        checkString$e(d.amount, field + \".amount\");\n" +
"        checkNumber$e(d.company_id, field + \".company_id\");\n" +
"        checkString$e(d.currency, field + \".currency\");\n" +
"        checkString$e(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$e(d.date, field + \".date\");\n" +
"        checkString$e(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$e(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$e(d.id, field + \".id\");\n" +
"        checkBoolean$b(d.is_grouped_or_lettered, field + \".is_grouped_or_lettered\");\n" +
"        checkBoolean$b(d.is_suggested, field + \".is_suggested\");\n" +
"        checkString$e(d.label, field + \".label\");\n" +
"        checkString$e(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        checkString$e(d.status, field + \".status\");\n" +
"        const knownProperties = [\"amount\", \"company_id\", \"currency\", \"currency_amount\", \"date\", \"gross_amount\", \"group_uuid\", \"id\", \"is_grouped_or_lettered\", \"is_suggested\", \"label\", \"outstanding_balance\", \"status\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$g(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new GroupedTransactionsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.company_id = d.company_id;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.date = d.date;\n" +
"        this.gross_amount = d.gross_amount;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.id = d.id;\n" +
"        this.is_grouped_or_lettered = d.is_grouped_or_lettered;\n" +
"        this.is_suggested = d.is_suggested;\n" +
"        this.label = d.label;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.status = d.status;\n" +
"    }\n" +
"};\n" +
"class SuggestedTransactionsEntity {\n" +
"    static Parse(d) {\n" +
"        return SuggestedTransactionsEntity.Create(JSON.parse(d));\n" +
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
"        checkString$e(d.amount, field + \".amount\");\n" +
"        checkNumber$e(d.company_id, field + \".company_id\");\n" +
"        checkString$e(d.currency, field + \".currency\");\n" +
"        checkString$e(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$e(d.date, field + \".date\");\n" +
"        checkString$e(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$e(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$e(d.id, field + \".id\");\n" +
"        checkBoolean$b(d.is_grouped_or_lettered, field + \".is_grouped_or_lettered\");\n" +
"        checkBoolean$b(d.is_suggested, field + \".is_suggested\");\n" +
"        checkString$e(d.label, field + \".label\");\n" +
"        d.matching_suggestion = MatchingSuggestion.Create(d.matching_suggestion, field + \".matching_suggestion\");\n" +
"        checkString$e(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        checkString$e(d.status, field + \".status\");\n" +
"        const knownProperties = [\"amount\", \"company_id\", \"currency\", \"currency_amount\", \"date\", \"gross_amount\", \"group_uuid\", \"id\", \"is_grouped_or_lettered\", \"is_suggested\", \"label\", \"matching_suggestion\", \"outstanding_balance\", \"status\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$g(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new SuggestedTransactionsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.company_id = d.company_id;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.date = d.date;\n" +
"        this.gross_amount = d.gross_amount;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.id = d.id;\n" +
"        this.is_grouped_or_lettered = d.is_grouped_or_lettered;\n" +
"        this.is_suggested = d.is_suggested;\n" +
"        this.label = d.label;\n" +
"        this.matching_suggestion = d.matching_suggestion;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.status = d.status;\n" +
"    }\n" +
"}\n" +
"class MatchingSuggestion {\n" +
"    static Parse(d) {\n" +
"        return MatchingSuggestion.Create(JSON.parse(d));\n" +
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
"        checkString$e(d.created_at, field + \".created_at\");\n" +
"        checkNull$b(d.exposure, field + \".exposure\");\n" +
"        checkNumber$e(d.id, field + \".id\");\n" +
"        checkString$e(d.model_version, field + \".model_version\");\n" +
"        checkString$e(d.prediction_id, field + \".prediction_id\");\n" +
"        checkNumber$e(d.score, field + \".score\");\n" +
"        checkString$e(d.version, field + \".version\");\n" +
"        const knownProperties = [\"created_at\", \"exposure\", \"id\", \"model_version\", \"prediction_id\", \"score\", \"version\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$g(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new MatchingSuggestion(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.exposure = d.exposure;\n" +
"        this.id = d.id;\n" +
"        this.model_version = d.model_version;\n" +
"        this.prediction_id = d.prediction_id;\n" +
"        this.score = d.score;\n" +
"        this.version = d.version;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$g(field, value, multiple) {\n" +
"    return errorHelper$g(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$g(field, value, multiple) {\n" +
"    return errorHelper$g(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$g(field, value, multiple) {\n" +
"    return errorHelper$g(field, value, \"object\");\n" +
"}\n" +
"function checkArray$9(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$g(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$e(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$g(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$b(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$g(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$e(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$g(field, value, \"string\");\n" +
"}\n" +
"function checkNull$b(value, field, multiple) {\n" +
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
"class APIInvoiceMatching {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceMatching.Create(JSON.parse(d));\n" +
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
"        checkArray$8(d.grouped_transactions, field + \".grouped_transactions\");\n" +
"        if (d.grouped_transactions) {\n" +
"            for (let i = 0; i < d.grouped_transactions.length; i++) {\n" +
"                d.grouped_transactions[i] = GroupedTransactionsEntity.Create(d.grouped_transactions[i], field + \".grouped_transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$d(d.multiplier, field + \".multiplier\");\n" +
"        checkString$d(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        checkArray$8(d.suggested_transactions, field + \".suggested_transactions\");\n" +
"        if (d.suggested_transactions) {\n" +
"            for (let i = 0; i < d.suggested_transactions.length; i++) {\n" +
"                checkNever$2(d.suggested_transactions[i], field + \".suggested_transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"grouped_transactions\", \"multiplier\", \"outstanding_balance\", \"suggested_transactions\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$f(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIInvoiceMatching(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.grouped_transactions = d.grouped_transactions;\n" +
"        this.multiplier = d.multiplier;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.suggested_transactions = d.suggested_transactions;\n" +
"    }\n" +
"}\n" +
"class GroupedTransactionsEntity {\n" +
"    static Parse(d) {\n" +
"        return GroupedTransactionsEntity.Create(JSON.parse(d));\n" +
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
"        checkString$d(d.amount, field + \".amount\");\n" +
"        checkNumber$d(d.company_id, field + \".company_id\");\n" +
"        checkString$d(d.currency, field + \".currency\");\n" +
"        checkString$d(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$d(d.date, field + \".date\");\n" +
"        checkString$d(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$d(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$d(d.id, field + \".id\");\n" +
"        checkBoolean$a(d.is_grouped_or_lettered, field + \".is_grouped_or_lettered\");\n" +
"        checkBoolean$a(d.is_suggested, field + \".is_suggested\");\n" +
"        checkString$d(d.label, field + \".label\");\n" +
"        checkString$d(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        checkString$d(d.status, field + \".status\");\n" +
"        const knownProperties = [\"amount\", \"company_id\", \"currency\", \"currency_amount\", \"date\", \"gross_amount\", \"group_uuid\", \"id\", \"is_grouped_or_lettered\", \"is_suggested\", \"label\", \"outstanding_balance\", \"status\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$f(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new GroupedTransactionsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.company_id = d.company_id;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.date = d.date;\n" +
"        this.gross_amount = d.gross_amount;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.id = d.id;\n" +
"        this.is_grouped_or_lettered = d.is_grouped_or_lettered;\n" +
"        this.is_suggested = d.is_suggested;\n" +
"        this.label = d.label;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.status = d.status;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$f(field, value, multiple) {\n" +
"    return errorHelper$f(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$f(field, value, multiple) {\n" +
"    return errorHelper$f(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$f(field, value, multiple) {\n" +
"    return errorHelper$f(field, value, \"object\");\n" +
"}\n" +
"function checkArray$8(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$f(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$d(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$f(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$a(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$f(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$d(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$f(field, value, \"string\");\n" +
"}\n" +
"function checkNever$2(value, field, multiple) {\n" +
"    return errorHelper$f(field, value, \"never\");\n" +
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
"class APITransactionList {\n" +
"    static Parse(d) {\n" +
"        return APITransactionList.Create(JSON.parse(d));\n" +
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
"        d.pagination = Pagination$1.Create(d.pagination, field + \".pagination\");\n" +
"        checkArray$7(d.transactions, field + \".transactions\");\n" +
"        if (d.transactions) {\n" +
"            for (let i = 0; i < d.transactions.length; i++) {\n" +
"                d.transactions[i] = TransactionsEntity$1.Create(d.transactions[i], field + \".transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"pagination\", \"transactions\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$e(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkBoolean$9(d.hasNextPage, field + \".hasNextPage\");\n" +
"        checkNumber$c(d.page, field + \".page\");\n" +
"        checkNumber$c(d.pages, field + \".pages\");\n" +
"        checkNumber$c(d.pageSize, field + \".pageSize\");\n" +
"        checkNumber$c(d.totalEntries, field + \".totalEntries\");\n" +
"        checkString$c(d.totalEntriesPrecision, field + \".totalEntriesPrecision\");\n" +
"        checkString$c(d.totalEntriesStr, field + \".totalEntriesStr\");\n" +
"        const knownProperties = [\"hasNextPage\", \"page\", \"pages\", \"pageSize\", \"totalEntries\", \"totalEntriesPrecision\", \"totalEntriesStr\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$e(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"let TransactionsEntity$1 = class TransactionsEntity {\n" +
"    static Parse(d) {\n" +
"        return TransactionsEntity.Create(JSON.parse(d));\n" +
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
"        checkNumber$c(d.account_id, field + \".account_id\");\n" +
"        d.account_synchronization = AccountSynchronization.Create(d.account_synchronization, field + \".account_synchronization\");\n" +
"        checkString$c(d.amount, field + \".amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$a(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$c(d.archived_at, field + \".archived_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$9(d.attachment_lost, field + \".attachment_lost\");\n" +
"        checkBoolean$9(d.attachment_required, field + \".attachment_required\");\n" +
"        checkNumber$c(d.company_id, field + \".company_id\");\n" +
"        checkString$c(d.currency, field + \".currency\");\n" +
"        checkString$c(d.currency_amount, field + \".currency_amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$c(d.currency_fee, field + \".currency_fee\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$a(d.currency_fee, field + \".currency_fee\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$c(d.date, field + \".date\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$a(d.dump, field + \".dump\", \"null | Dump\");\n" +
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
"            checkNull$a(d.dump_id, field + \".dump_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$c(d.dump_id, field + \".dump_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$c(d.fee, field + \".fee\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$a(d.fee, field + \".fee\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$c(d.files_count, field + \".files_count\");\n" +
"        checkString$c(d.gross_amount, field + \".gross_amount\");\n" +
"        checkString$c(d.group_uuid, field + \".group_uuid\");\n" +
"        checkNumber$c(d.id, field + \".id\");\n" +
"        checkBoolean$9(d.is_potential_duplicate, field + \".is_potential_duplicate\");\n" +
"        checkBoolean$9(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        checkString$c(d.label, field + \".label\");\n" +
"        checkBoolean$9(d.pending, field + \".pending\");\n" +
"        checkNull$a(d.reconciliation_id, field + \".reconciliation_id\");\n" +
"        checkString$c(d.source, field + \".source\");\n" +
"        checkString$c(d.source_logo, field + \".source_logo\");\n" +
"        checkString$c(d.status, field + \".status\");\n" +
"        checkString$c(d.type, field + \".type\");\n" +
"        checkString$c(d.updated_at, field + \".updated_at\");\n" +
"        checkBoolean$9(d.validation_needed, field + \".validation_needed\");\n" +
"        const knownProperties = [\"account_id\", \"account_synchronization\", \"amount\", \"archived_at\", \"attachment_lost\", \"attachment_required\", \"company_id\", \"currency\", \"currency_amount\", \"currency_fee\", \"date\", \"dump\", \"dump_id\", \"fee\", \"files_count\", \"gross_amount\", \"group_uuid\", \"id\", \"is_potential_duplicate\", \"is_waiting_details\", \"label\", \"pending\", \"reconciliation_id\", \"source\", \"source_logo\", \"status\", \"type\", \"updated_at\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$e(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"};\n" +
"class AccountSynchronization {\n" +
"    static Parse(d) {\n" +
"        return AccountSynchronization.Create(JSON.parse(d));\n" +
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
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$c(d.created_at, field + \".created_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$a(d.created_at, field + \".created_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$a(d.error_message, field + \".error_message\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkBoolean$9(d.triggered_manually, field + \".triggered_manually\", \"boolean | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$a(d.triggered_manually, field + \".triggered_manually\", \"boolean | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"created_at\", \"error_message\", \"triggered_manually\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$e(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$c(d.created_at, field + \".created_at\");\n" +
"        checkString$c(d.creator, field + \".creator\");\n" +
"        checkString$c(d.type, field + \".type\");\n" +
"        const knownProperties = [\"created_at\", \"creator\", \"type\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$e(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Dump(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.creator = d.creator;\n" +
"        this.type = d.type;\n" +
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
"function checkArray$7(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$e(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$c(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$e(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$9(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$e(field, value, multiple ?? \"boolean\");\n" +
"}\n" +
"function checkString$c(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$e(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$a(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$e(field, value, multiple ?? \"null\");\n" +
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
"class APITransactionListParams {\n" +
"    static Parse(d) {\n" +
"        return APITransactionListParams.Create(JSON.parse(d));\n" +
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
"        if (\"filter\" in d) {\n" +
"            checkString$b(d.filter, field + \".filter\");\n" +
"        }\n" +
"        if (\"page\" in d) {\n" +
"            checkNumber$b(d.page, field + \".page\");\n" +
"        }\n" +
"        if (\"sort\" in d) {\n" +
"            checkString$b(d.sort, field + \".sort\");\n" +
"        }\n" +
"        const knownProperties = [\"filter\", \"page\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$d(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        errorHelper$d(field, value, \"number\");\n" +
"}\n" +
"function checkString$b(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$d(field, value, \"string\");\n" +
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
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$c = null;\n" +
"class APITransactionReconciliation {\n" +
"    static Parse(d) {\n" +
"        return APITransactionReconciliation.Create(JSON.parse(d));\n" +
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
"        checkArray$6(d.transactions, field + \".transactions\");\n" +
"        if (d.transactions) {\n" +
"            for (let i = 0; i < d.transactions.length; i++) {\n" +
"                d.transactions[i] = TransactionsEntity.Create(d.transactions[i], field + \".transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"transactions\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$c(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APITransactionReconciliation(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.transactions = d.transactions;\n" +
"    }\n" +
"}\n" +
"class TransactionsEntity {\n" +
"    static Parse(d) {\n" +
"        return TransactionsEntity.Create(JSON.parse(d));\n" +
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
"        checkNumber$a(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$a(d.reconciliation_id, field + \".reconciliation_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$9(d.reconciliation_id, field + \".reconciliation_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"id\", \"reconciliation_id\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$c(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new TransactionsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.reconciliation_id = d.reconciliation_id;\n" +
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
"function checkArray$6(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$c(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$a(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$c(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkNull$9(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$c(field, value, multiple);\n" +
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
"const logger$4 = new Logger(\"API:transaction\");\n" +
"/**\n" +
" * @return {Promise<RawTransactionMin>}    Type vérifié\n" +
" */\n" +
"/** Endpoint supprimé *\n" +
"export async function getTransaction(id: number): Promise<APITransactionLite> {\n" +
"  const response = await apiRequest(`accountants/wip/transactions/${id}`, null, \"GET\");\n" +
"  const data = await response?.json();\n" +
"  if (!data) {\n" +
"    logger.error(`Transaction ${id} not found`, { response });\n" +
"    return null;\n" +
"  }\n" +
"  return APITransactionLite.Create(data);\n" +
"}\n" +
"/**/\n" +
"async function getTransactionFull(id, maxAge) {\n" +
"    const data = await cachedRequest(\"transaction:getTransactionFull\", { id }, async ({ id }) => {\n" +
"        const response = await apiRequest(`accountants/transactions?ids[]=${id}`, null, \"GET\");\n" +
"        const data = (await response?.json())?.transactions[0];\n" +
"        if (!data) {\n" +
"            logger$4.error(`Transaction ${id} not found`, { response });\n" +
"            return null;\n" +
"        }\n" +
"        return data;\n" +
"    }, maxAge);\n" +
"    if (!data) {\n" +
"        logger$4.error(`Transaction ${id} not found`);\n" +
"        return null;\n" +
"    }\n" +
"    return APITransaction.Create(data);\n" +
"}\n" +
"/**\n" +
" * Load list of transactions from API. paginated.\n" +
" */\n" +
"async function getTransactionsList(params = {}) {\n" +
"    const searchParams = new URLSearchParams(APITransactionListParams.Create(params));\n" +
"    const url = `accountants/transactions?${searchParams.toString()}`;\n" +
"    const response = await apiRequest(url, null, \"GET\");\n" +
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
"async function getTransactionReconciliationId(id, maxAge) {\n" +
"    const data = await cachedRequest(\"transaction:getTransactionIsReconciled\", { id }, async ({ id }) => {\n" +
"        const response = await apiRequest(`accountants/transactions/reconciliations?transaction_ids%5B%5D=${id}`, null, \"GET\");\n" +
"        return await response?.json();\n" +
"    }, maxAge);\n" +
"    if (!data)\n" +
"        return null;\n" +
"    const transactions = APITransactionReconciliation.Create(data);\n" +
"    return transactions.transactions.find((t) => t.id === id)?.reconciliation_id;\n" +
"}\n" +
"\n" +
"const logger$3 = new Logger(\"API:document\");\n" +
"async function getDocument(id, maxAge) {\n" +
"    if (typeof id !== \"number\")\n" +
"        throw new Error(\"id must be a number\");\n" +
"    const data = await cachedRequest(\"document:getDocument\", { id }, async ({ id }) => {\n" +
"        const response = await apiRequest(`documents/${id}`, null, \"GET\");\n" +
"        const data = await response?.json();\n" +
"        return data;\n" +
"    }, maxAge);\n" +
"    if (!data)\n" +
"        return data;\n" +
"    return APIDocument.Create(data);\n" +
"}\n" +
"async function getFullDocument(id, maxAge) {\n" +
"    if (typeof id !== \"number\")\n" +
"        throw new Error(\"id must be a number\");\n" +
"    const liteDoc = await getDocument(id);\n" +
"    switch (liteDoc.type) {\n" +
"        case \"Transaction\":\n" +
"            return await getTransactionFull(id, maxAge);\n" +
"        case \"Invoice\":\n" +
"            return await getInvoiceFull(id, maxAge);\n" +
"        default:\n" +
"            this.error(`Unsupported document type: ${liteDoc.type}`, { id, liteDoc });\n" +
"            throw new Error(`Unsupported document type: ${liteDoc.type}`);\n" +
"    }\n" +
"}\n" +
"async function getInvoiceFull(id, maxAge) {\n" +
"    const data = await cachedRequest(\"document:getInvoiceFull\", { id }, async ({ id }) => {\n" +
"        const doc = await getDocument(id, maxAge);\n" +
"        if (!doc)\n" +
"            return doc;\n" +
"        const response = await apiRequest(doc.url\n" +
"            .split(\"/\")\n" +
"            .slice(3)\n" +
"            .join(\"/\")\n" +
"            .replace(/\\?[^=]*=/u, \"/\"), null, \"GET\");\n" +
"        const data = await response?.json();\n" +
"        return data;\n" +
"    }, maxAge);\n" +
"    if (!data)\n" +
"        return data;\n" +
"    return APIDocumentFull.Create(data);\n" +
"}\n" +
"async function documentMatching(options) {\n" +
"    const group_uuids = Array.isArray(options.groups) ? options.groups : [options.groups];\n" +
"    const matching = { unmatch_ids: [], group_uuids };\n" +
"    const document = await getDocument(options.id);\n" +
"    if (document && document.type === \"Invoice\") {\n" +
"        const response = await apiRequest(`accountants/matching/invoices/matches/${document.id}?direction=${document.direction}`, matching, \"PUT\");\n" +
"        if (response)\n" +
"            return APIDocumentMatchingInvoice.Create(await response.json());\n" +
"    }\n" +
"    const response = await apiRequest(`documents/${options.id}/matching`, { matching }, \"PUT\");\n" +
"    if (!response)\n" +
"        return null;\n" +
"    return APIDocumentMatching.Create(await response.json());\n" +
"}\n" +
"async function reloadLedgerEvents(id) {\n" +
"    const response = await apiRequest(`documents/${id}/settle`, null, \"POST\");\n" +
"    const data = await response?.json();\n" +
"    return APIDocument.Create(data);\n" +
"}\n" +
"/**\n" +
" * @return {Promise<number>} The number of modified documents\n" +
" */\n" +
"async function archiveDocument(id, unarchive = false) {\n" +
"    const body = { documents: [{ id }], unarchive };\n" +
"    const response = await apiRequest(\"documents/batch_archive\", body, \"POST\");\n" +
"    const responseData = await response?.json();\n" +
"    return responseData;\n" +
"}\n" +
"/**\n" +
" * Return http link to open a document\n" +
" */\n" +
"function getDocumentLink(id) {\n" +
"    return `${location.href.split(\"/\").slice(0, 5).join(\"/\")}/documents/${id}.html`;\n" +
"}\n" +
"/**\n" +
" * Return document's group uuid\n" +
" */\n" +
"async function getDocumentGuuid(id, maxAge) {\n" +
"    const doc = await getFullDocument(id, maxAge);\n" +
"    return doc.group_uuid;\n" +
"}\n" +
"async function matchDocuments(id1, id2) {\n" +
"    const doc1 = await getDocument(id1);\n" +
"    const doc2 = await getDocument(id2);\n" +
"    if (doc1.type !== \"Invoice\" && doc2.type !== \"Invoice\")\n" +
"        return null;\n" +
"    const transaction = doc1.type === \"Transaction\" ? doc1 : doc2.type === \"Transaction\" ? doc2 : null;\n" +
"    const document = transaction === doc1 ? doc2 : transaction === doc2 ? doc1 : null;\n" +
"    const guuid = document && (await getDocumentGuuid(document.id, 0));\n" +
"    if (guuid) {\n" +
"        const args = { unmatch_ids: [], group_uuids: [guuid] };\n" +
"        const response = await apiRequest(`documents/${transaction.id}/matching`, args, \"PUT\");\n" +
"        if (!response)\n" +
"            return null;\n" +
"        return APIInvoiceMatching.Create(await response.json());\n" +
"    }\n" +
"    logger$3.error(\"No document found\", { id1, id2, doc1, doc2, transaction, document, guuid });\n" +
"    return null;\n" +
"}\n" +
"\n" +
"const logger$2 = new Logger('API_DMS');\n" +
"/**\n" +
" * Get DMS items linked to a record (a document)\n" +
" * @param recordId\n" +
" * @param recordType\n" +
" * @returns\n" +
" */\n" +
"async function getDMSLinks(recordId, recordType, maxAge) {\n" +
"    if (!recordType)\n" +
"        recordType = (await getDocument(recordId)).type;\n" +
"    const data = await cachedRequest(\"dms:getDMSLinks\", { recordId, recordType }, async ({ recordId, recordType }) => {\n" +
"        const response = await apiRequest(`dms/links/data?record_ids[]=${recordId}&record_type=${recordType}`, null, \"GET\");\n" +
"        return await response?.json();\n" +
"    }, maxAge);\n" +
"    if (!data)\n" +
"        return data;\n" +
"    const list = APIDMSLinkList.Create(data);\n" +
"    return list.dms_links.map((link) => APIDMSLink.Create(link));\n" +
"}\n" +
"/**\n" +
" * Get DMS item\n" +
" * @param id\n" +
" * @returns\n" +
" */\n" +
"async function getDMSItem(id, maxAge) {\n" +
"    const data = await cachedRequest(\"dms:getDMSItem\", { id }, async ({ id }) => {\n" +
"        logger$2.debug(\"getDMSItem\", { id, maxAge });\n" +
"        const response = await apiRequest(`dms/items/${id}`, null, \"GET\");\n" +
"        const data = await response?.json();\n" +
"        if (data)\n" +
"            return data;\n" +
"        logger$2.error(\"getDMSItem\", { id, response, data });\n" +
"        const settings = await getDMSItemSettings(id, maxAge);\n" +
"        if (!settings?.item)\n" +
"            return null;\n" +
"        return settings.item;\n" +
"    }, maxAge);\n" +
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
"            logger$2.error(\"réponse inattendue pour getDMSItemLinks\", { response, data });\n" +
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
"async function getDMSItemSettings(id, maxAge) {\n" +
"    const data = await cachedRequest(\"dms:getDMSItemSettings\", { id }, async ({ id }) => {\n" +
"        logger$2.debug(\"getDMSItemSettings\", { id, maxAge });\n" +
"        const response = await apiRequest(`dms/items/settings.json?filter=&item_id=${id}`, null, \"GET\");\n" +
"        const data = await response?.json();\n" +
"        if (!data)\n" +
"            logger$2.error(\"getDMSItemSettings\", { id, response, data });\n" +
"        return data;\n" +
"    }, maxAge);\n" +
"    return APIDMSItemSettings.Create(data);\n" +
"}\n" +
"/**\n" +
" * Generate all result one by one as generator\n" +
" */\n" +
"async function* getDMSItemGenerator(params = {}) {\n" +
"    let page = Number(params.page ?? 1);\n" +
"    if (!Number.isSafeInteger(page)) {\n" +
"        console.log(\"getDMSItemGenerator\", { params, page });\n" +
"        throw new Error(\"params.page, if provided, MUST be a safe integer\");\n" +
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
"    if (\"filter\" in params && typeof params.filter !== \"string\")\n" +
"        params = { ...params, filter: JSON.stringify(params.filter) };\n" +
"    params = { ...params, page_name: \"all\" };\n" +
"    const searchParams = new URLSearchParams(APIDMSItemListParams.Create(params));\n" +
"    const url = `dms/items/data.json?${searchParams.toString()}`;\n" +
"    const response = await apiRequest(url, null, \"GET\");\n" +
"    return APIDMSItemList.Create(await response.json());\n" +
"}\n" +
"/**\n" +
" * Update DMS item\n" +
" */\n" +
"async function updateDMSItem(entry) {\n" +
"    const { id, ...value } = entry;\n" +
"    const response = await apiRequest(`dms/items/${id}`, { dms_item: value }, \"PUT\");\n" +
"    return APIDMSUpdateItem.Create(await response.json());\n" +
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
"    logger$2.error('todo: réparer cette fonction \"getDMSDestId\"');\n" +
"    debugger;\n" +
"    throw new Error('todo: réparer cette fonction \"getDMSDestId\"');\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$b = null;\n" +
"class APIInvoice {\n" +
"    static Parse(d) {\n" +
"        return APIInvoice.Create(JSON.parse(d));\n" +
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
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.amount, field + \".amount\", \"string | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.amount, field + \".amount\", \"string | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$8(d.approval_status, field + \".approval_status\");\n" +
"        checkBoolean$8(d.archived, field + \".archived\");\n" +
"        checkBoolean$8(d.attachment_required, field + \".attachment_required\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$9(d.blob_id, field + \".blob_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.blob_id, field + \".blob_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.checksum, field + \".checksum\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.checksum, field + \".checksum\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$9(d.client_comments_count, field + \".client_comments_count\");\n" +
"        checkNumber$9(d.company_id, field + \".company_id\");\n" +
"        checkString$a(d.created_at, field + \".created_at\");\n" +
"        checkString$a(d.currency, field + \".currency\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.currency_amount, field + \".currency_amount\", \"string | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.currency_amount, field + \".currency_amount\", \"string | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.currency_price_before_tax, field + \".currency_price_before_tax\", \"string | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.currency_price_before_tax, field + \".currency_price_before_tax\", \"string | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.currency_tax, field + \".currency_tax\", \"string | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.currency_tax, field + \".currency_tax\", \"string | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.current_account_plan_item, field + \".current_account_plan_item\", \"null | PnlPlanItemOrCurrentAccountPlanItem\");\n" +
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
"            checkNull$8(d.current_account_plan_item_id, field + \".current_account_plan_item_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.current_account_plan_item_id, field + \".current_account_plan_item_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"current_account_visible\" in d) {\n" +
"            checkBoolean$8(d.current_account_visible, field + \".current_account_visible\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.date, field + \".date\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$a(d.date, field + \".date\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.deadline, field + \".deadline\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$a(d.deadline, field + \".deadline\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$a(d.direction, field + \".direction\");\n" +
"        checkArray$5(d.document_tags, field + \".document_tags\");\n" +
"        if (d.document_tags) {\n" +
"            for (let i = 0; i < d.document_tags.length; i++) {\n" +
"                d.document_tags[i] = DocumentTagsEntity.Create(d.document_tags[i], field + \".document_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$9(d.duplicates_count, field + \".duplicates_count\");\n" +
"        checkNull$8(d.email_from, field + \".email_from\");\n" +
"        checkBoolean$8(d.embeddable_in_browser, field + \".embeddable_in_browser\");\n" +
"        checkString$a(d.file_signed_id, field + \".file_signed_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.filename, field + \".filename\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.filename, field + \".filename\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.gdrive_path, field + \".gdrive_path\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.gdrive_path, field + \".gdrive_path\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$a(d.group_uuid, field + \".group_uuid\");\n" +
"        checkBoolean$8(d.has_closed_ledger_events, field + \".has_closed_ledger_events\");\n" +
"        checkBoolean$8(d.has_duplicates, field + \".has_duplicates\");\n" +
"        checkBoolean$8(d.has_file, field + \".has_file\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        checkBoolean$8(d.incomplete, field + \".incomplete\");\n" +
"        checkArray$5(d.invoice_lines, field + \".invoice_lines\");\n" +
"        if (d.invoice_lines) {\n" +
"            for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                d.invoice_lines[i] = InvoiceLinesEntity$1.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$9(d.invoice_lines_count, field + \".invoice_lines_count\");\n" +
"        checkString$a(d.invoice_number, field + \".invoice_number\");\n" +
"        checkBoolean$8(d.is_employee_expense, field + \".is_employee_expense\");\n" +
"        checkBoolean$8(d.is_estimate, field + \".is_estimate\");\n" +
"        checkBoolean$8(d.is_factur_x, field + \".is_factur_x\");\n" +
"        checkBoolean$8(d.is_waiting_for_ocr, field + \".is_waiting_for_ocr\");\n" +
"        checkNumber$9(d.journal_id, field + \".journal_id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.label, field + \".label\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.label, field + \".label\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$a(d.method, field + \".method\");\n" +
"        checkNull$8(d.mileage_allowance, field + \".mileage_allowance\");\n" +
"        checkString$a(d.outstanding_balance, field + \".outstanding_balance\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$9(d.pages_count, field + \".pages_count\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.pages_count, field + \".pages_count\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$8(d.paid, field + \".paid\");\n" +
"        checkString$a(d.payment_status, field + \".payment_status\");\n" +
"        if (\"pdf_invoice_free_text\" in d) {\n" +
"            checkString$a(d.pdf_invoice_free_text, field + \".pdf_invoice_free_text\");\n" +
"        }\n" +
"        if (\"pdf_invoice_subject\" in d) {\n" +
"            checkString$a(d.pdf_invoice_subject, field + \".pdf_invoice_subject\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$5(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString$a(d.preview_urls[i], field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        if (\"price_before_tax\" in d) {\n" +
"            checkNumber$9(d.price_before_tax, field + \".price_before_tax\");\n" +
"        }\n" +
"        checkString$a(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkString$a(d.source, field + \".source\");\n" +
"        checkString$a(d.status, field + \".status\");\n" +
"        checkBoolean$8(d.subcomplete, field + \".subcomplete\");\n" +
"        checkBoolean$8(d.tagged_at_ledger_events_level, field + \".tagged_at_ledger_events_level\");\n" +
"        if (\"tax\" in d) {\n" +
"            checkNumber$9(d.tax, field + \".tax\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.thirdparty = Thirdparty$1.Create(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$9(d.thirdparty_id, field + \".thirdparty_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.thirdparty_id, field + \".thirdparty_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$a(d.type, field + \".type\");\n" +
"        checkString$a(d.url, field + \".url\");\n" +
"        checkBoolean$8(d.validation_needed, field + \".validation_needed\");\n" +
"        const knownProperties = [\"amount\", \"approval_status\", \"archived\", \"attachment_required\", \"blob_id\", \"checksum\", \"client_comments_count\", \"company_id\", \"created_at\", \"currency\", \"currency_amount\", \"currency_price_before_tax\", \"currency_tax\", \"current_account_plan_item\", \"current_account_plan_item_id\", \"current_account_visible\", \"date\", \"deadline\", \"direction\", \"document_tags\", \"duplicates_count\", \"email_from\", \"embeddable_in_browser\", \"file_signed_id\", \"filename\", \"gdrive_path\", \"group_uuid\", \"has_closed_ledger_events\", \"has_duplicates\", \"has_file\", \"id\", \"incomplete\", \"invoice_lines\", \"invoice_lines_count\", \"invoice_number\", \"is_employee_expense\", \"is_estimate\", \"is_factur_x\", \"is_waiting_for_ocr\", \"journal_id\", \"label\", \"method\", \"mileage_allowance\", \"outstanding_balance\", \"pages_count\", \"paid\", \"payment_status\", \"pdf_invoice_free_text\", \"pdf_invoice_subject\", \"preview_status\", \"preview_urls\", \"price_before_tax\", \"pusher_channel\", \"source\", \"status\", \"subcomplete\", \"tagged_at_ledger_events_level\", \"tax\", \"thirdparty\", \"thirdparty_id\", \"type\", \"url\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"current_account_visible\" in d)\n" +
"            this.current_account_visible = d.current_account_visible;\n" +
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
"        if (\"pdf_invoice_free_text\" in d)\n" +
"            this.pdf_invoice_free_text = d.pdf_invoice_free_text;\n" +
"        if (\"pdf_invoice_subject\" in d)\n" +
"            this.pdf_invoice_subject = d.pdf_invoice_subject;\n" +
"        this.preview_status = d.preview_status;\n" +
"        this.preview_urls = d.preview_urls;\n" +
"        if (\"price_before_tax\" in d)\n" +
"            this.price_before_tax = d.price_before_tax;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.source = d.source;\n" +
"        this.status = d.status;\n" +
"        this.subcomplete = d.subcomplete;\n" +
"        this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;\n" +
"        if (\"tax\" in d)\n" +
"            this.tax = d.tax;\n" +
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
"        checkBoolean$8(d.enabled, field + \".enabled\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        checkString$a(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkNumber$9(d.document_id, field + \".document_id\");\n" +
"        checkNumber$9(d.group_id, field + \".group_id\");\n" +
"        if (\"id\" in d) {\n" +
"            checkNumber$9(d.id, field + \".id\");\n" +
"        }\n" +
"        d.tag = Tag.Create(d.tag, field + \".tag\");\n" +
"        checkNumber$9(d.tag_id, field + \".tag_id\");\n" +
"        if (\"weight\" in d) {\n" +
"            checkString$a(d.weight, field + \".weight\");\n" +
"        }\n" +
"        const knownProperties = [\"document_id\", \"group_id\", \"id\", \"tag\", \"tag_id\", \"weight\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkNull$8(d.analytical_code, field + \".analytical_code\");\n" +
"        if (\"color\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$8(d.color, field + \".color\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$a(d.color, field + \".color\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        d.group = Group$1.Create(d.group, field + \".group\");\n" +
"        checkNumber$9(d.group_id, field + \".group_id\");\n" +
"        checkNull$8(d.icon, field + \".icon\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        checkNull$8(d.variant, field + \".variant\");\n" +
"        const knownProperties = [\"analytical_code\", \"color\", \"group\", \"group_id\", \"icon\", \"id\", \"label\", \"variant\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"let Group$1 = class Group {\n" +
"    static Parse(d) {\n" +
"        return Group.Create(JSON.parse(d));\n" +
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
"        checkString$a(d.icon, field + \".icon\");\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        checkBoolean$8(d.self_service_accounting, field + \".self_service_accounting\");\n" +
"        const knownProperties = [\"icon\", \"label\", \"self_service_accounting\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Group(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.icon = d.icon;\n" +
"        this.label = d.label;\n" +
"        this.self_service_accounting = d.self_service_accounting;\n" +
"    }\n" +
"};\n" +
"let InvoiceLinesEntity$1 = class InvoiceLinesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoiceLinesEntity.Create(JSON.parse(d));\n" +
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
"        if (\"_destroy\" in d) {\n" +
"            checkBoolean$8(d._destroy, field + \"._destroy\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.advance, field + \".advance\", \"null | Advance\");\n" +
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
"            checkNull$8(d.advance_id, field + \".advance_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.advance_id, field + \".advance_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$8(d.advance_pnl, field + \".advance_pnl\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.amount, field + \".amount\", \"string | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.amount, field + \".amount\", \"string | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.asset, field + \".asset\", \"null | Asset\");\n" +
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
"            checkNull$8(d.asset_id, field + \".asset_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.asset_id, field + \".asset_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.currency_amount, field + \".currency_amount\", \"string | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.currency_amount, field + \".currency_amount\", \"string | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.currency_price_before_tax, field + \".currency_price_before_tax\", \"string | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.currency_price_before_tax, field + \".currency_price_before_tax\", \"string | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.currency_tax, field + \".currency_tax\", \"string | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$9(d.currency_tax, field + \".currency_tax\", \"string | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNull$8(d.deferral, field + \".deferral\");\n" +
"        checkNull$8(d.deferral_id, field + \".deferral_id\");\n" +
"        checkBoolean$8(d.global_vat, field + \".global_vat\");\n" +
"        if (\"has_asset\" in d) {\n" +
"            checkBoolean$8(d.has_asset, field + \".has_asset\");\n" +
"        }\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        if (\"invoice_line_period\" in d) {\n" +
"            checkNull$8(d.invoice_line_period, field + \".invoice_line_period\");\n" +
"        }\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.ledger_event_label, field + \".ledger_event_label\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$a(d.ledger_event_label, field + \".ledger_event_label\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$8(d.ocr_vat_rate, field + \".ocr_vat_rate\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$a(d.ocr_vat_rate, field + \".ocr_vat_rate\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        d.pnl_plan_item = PnlPlanItemOrCurrentAccountPlanItem1.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkNumber$9(d.pnl_plan_item_id, field + \".pnl_plan_item_id\");\n" +
"        checkBoolean$8(d.prepaid_pnl, field + \".prepaid_pnl\");\n" +
"        checkString$a(d.tax, field + \".tax\");\n" +
"        checkString$a(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"_destroy\", \"advance\", \"advance_id\", \"advance_pnl\", \"amount\", \"asset\", \"asset_id\", \"currency_amount\", \"currency_price_before_tax\", \"currency_tax\", \"deferral\", \"deferral_id\", \"global_vat\", \"has_asset\", \"id\", \"invoice_line_period\", \"label\", \"ledger_event_label\", \"ocr_vat_rate\", \"pnl_plan_item\", \"pnl_plan_item_id\", \"prepaid_pnl\", \"tax\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"_destroy\" in d)\n" +
"            this._destroy = d._destroy;\n" +
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
"        if (\"has_asset\" in d)\n" +
"            this.has_asset = d.has_asset;\n" +
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
"        checkNumber$9(d.company_id, field + \".company_id\");\n" +
"        checkString$a(d.date, field + \".date\");\n" +
"        if (\"end_date\" in d) {\n" +
"            checkNull$8(d.end_date, field + \".end_date\");\n" +
"        }\n" +
"        checkBoolean$8(d.has_ledger_events, field + \".has_ledger_events\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        const knownProperties = [\"company_id\", \"date\", \"end_date\", \"has_ledger_events\", \"id\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Advance(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company_id = d.company_id;\n" +
"        this.date = d.date;\n" +
"        if (\"end_date\" in d)\n" +
"            this.end_date = d.end_date;\n" +
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
"        checkNumber$9(d.amortization_months, field + \".amortization_months\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.amortization_type, field + \".amortization_type\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.amortization_type, field + \".amortization_type\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$a(d.entry_date, field + \".entry_date\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        checkBoolean$8(d.invoice_line_editable, field + \".invoice_line_editable\");\n" +
"        checkString$a(d.name, field + \".name\");\n" +
"        checkNumber$9(d.plan_item_id, field + \".plan_item_id\");\n" +
"        checkNumber$9(d.quantity, field + \".quantity\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.start_date, field + \".start_date\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.start_date, field + \".start_date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"amortization_months\", \"amortization_type\", \"entry_date\", \"id\", \"invoice_line_editable\", \"name\", \"plan_item_id\", \"quantity\", \"start_date\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkBoolean$8(d.enabled, field + \".enabled\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        checkString$a(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"activity_code\" in d) {\n" +
"            checkString$a(d.activity_code, field + \".activity_code\");\n" +
"        }\n" +
"        if (\"activity_nomenclature\" in d) {\n" +
"            checkString$a(d.activity_nomenclature, field + \".activity_nomenclature\");\n" +
"        }\n" +
"        if (\"address\" in d) {\n" +
"            checkString$a(d.address, field + \".address\");\n" +
"        }\n" +
"        if (\"address_additional_info\" in d) {\n" +
"            checkString$a(d.address_additional_info, field + \".address_additional_info\");\n" +
"        }\n" +
"        if (\"admin_city_code\" in d) {\n" +
"            checkNull$8(d.admin_city_code, field + \".admin_city_code\");\n" +
"        }\n" +
"        if (\"balance\" in d) {\n" +
"            checkNull$8(d.balance, field + \".balance\");\n" +
"        }\n" +
"        if (\"billing_bank\" in d) {\n" +
"            checkNull$8(d.billing_bank, field + \".billing_bank\");\n" +
"        }\n" +
"        if (\"billing_bic\" in d) {\n" +
"            checkNull$8(d.billing_bic, field + \".billing_bic\");\n" +
"        }\n" +
"        if (\"billing_footer_invoice_id\" in d) {\n" +
"            checkNull$8(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        }\n" +
"        if (\"billing_footer_invoice_label\" in d) {\n" +
"            checkNull$8(d.billing_footer_invoice_label, field + \".billing_footer_invoice_label\");\n" +
"        }\n" +
"        if (\"billing_iban\" in d) {\n" +
"            checkNull$8(d.billing_iban, field + \".billing_iban\");\n" +
"        }\n" +
"        if (\"billing_language\" in d) {\n" +
"            checkString$a(d.billing_language, field + \".billing_language\");\n" +
"        }\n" +
"        if (\"city\" in d) {\n" +
"            checkString$a(d.city, field + \".city\");\n" +
"        }\n" +
"        if (\"company_id\" in d) {\n" +
"            checkNumber$9(d.company_id, field + \".company_id\");\n" +
"        }\n" +
"        if (\"complete\" in d) {\n" +
"            checkBoolean$8(d.complete, field + \".complete\");\n" +
"        }\n" +
"        if (\"country\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$a(d.country, field + \".country\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNull$8(d.country, field + \".country\", \"string | null\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$a(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        if (\"credits\" in d) {\n" +
"            checkNull$8(d.credits, field + \".credits\");\n" +
"        }\n" +
"        if (\"current_mandate\" in d) {\n" +
"            checkNull$8(d.current_mandate, field + \".current_mandate\");\n" +
"        }\n" +
"        if (\"customer_type\" in d) {\n" +
"            checkString$a(d.customer_type, field + \".customer_type\");\n" +
"        }\n" +
"        if (\"debits\" in d) {\n" +
"            checkNull$8(d.debits, field + \".debits\");\n" +
"        }\n" +
"        if (\"delivery_address\" in d) {\n" +
"            checkString$a(d.delivery_address, field + \".delivery_address\");\n" +
"        }\n" +
"        if (\"delivery_address_additional_info\" in d) {\n" +
"            checkString$a(d.delivery_address_additional_info, field + \".delivery_address_additional_info\");\n" +
"        }\n" +
"        if (\"delivery_city\" in d) {\n" +
"            checkString$a(d.delivery_city, field + \".delivery_city\");\n" +
"        }\n" +
"        if (\"delivery_country\" in d) {\n" +
"            checkNull$8(d.delivery_country, field + \".delivery_country\");\n" +
"        }\n" +
"        if (\"delivery_country_alpha2\" in d) {\n" +
"            checkString$a(d[\"delivery_country_alpha2\"], field + \".delivery_country_alpha2\");\n" +
"        }\n" +
"        if (\"delivery_postal_code\" in d) {\n" +
"            checkString$a(d.delivery_postal_code, field + \".delivery_postal_code\");\n" +
"        }\n" +
"        if (\"disable_pending_vat\" in d) {\n" +
"            checkBoolean$8(d.disable_pending_vat, field + \".disable_pending_vat\");\n" +
"        }\n" +
"        if (\"display_name\" in d) {\n" +
"            checkNull$8(d.display_name, field + \".display_name\");\n" +
"        }\n" +
"        if (\"emails\" in d) {\n" +
"            checkArray$5(d.emails, field + \".emails\");\n" +
"            if (d.emails) {\n" +
"                for (let i = 0; i < d.emails.length; i++) {\n" +
"                    checkNever$1(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"establishment_no\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$8(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$a(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"estimate_count\" in d) {\n" +
"            checkNull$8(d.estimate_count, field + \".estimate_count\");\n" +
"        }\n" +
"        if (\"first_name\" in d) {\n" +
"            checkString$a(d.first_name, field + \".first_name\");\n" +
"        }\n" +
"        if (\"force_pending_vat\" in d) {\n" +
"            checkBoolean$8(d.force_pending_vat, field + \".force_pending_vat\");\n" +
"        }\n" +
"        if (\"gender\" in d) {\n" +
"            checkNull$8(d.gender, field + \".gender\");\n" +
"        }\n" +
"        if (\"gocardless_id\" in d) {\n" +
"            checkNull$8(d.gocardless_id, field + \".gocardless_id\");\n" +
"        }\n" +
"        if (\"iban\" in d) {\n" +
"            checkString$a(d.iban, field + \".iban\");\n" +
"        }\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        if (\"invoice_count\" in d) {\n" +
"            checkNull$8(d.invoice_count, field + \".invoice_count\");\n" +
"        }\n" +
"        if (\"invoice_dump_id\" in d) {\n" +
"            checkNull$8(d.invoice_dump_id, field + \".invoice_dump_id\");\n" +
"        }\n" +
"        if (\"invoices_auto_generated\" in d) {\n" +
"            checkBoolean$8(d.invoices_auto_generated, field + \".invoices_auto_generated\");\n" +
"        }\n" +
"        if (\"invoices_auto_validated\" in d) {\n" +
"            checkBoolean$8(d.invoices_auto_validated, field + \".invoices_auto_validated\");\n" +
"        }\n" +
"        if (\"known_supplier_id\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$8(d.known_supplier_id, field + \".known_supplier_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkNumber$9(d.known_supplier_id, field + \".known_supplier_id\", \"null | number\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"last_name\" in d) {\n" +
"            checkString$a(d.last_name, field + \".last_name\");\n" +
"        }\n" +
"        if (\"ledger_events_count\" in d) {\n" +
"            checkNull$8(d.ledger_events_count, field + \".ledger_events_count\");\n" +
"        }\n" +
"        if (\"legal_form_code\" in d) {\n" +
"            checkString$a(d.legal_form_code, field + \".legal_form_code\");\n" +
"        }\n" +
"        if (\"method\" in d) {\n" +
"            checkString$a(d.method, field + \".method\");\n" +
"        }\n" +
"        checkString$a(d.name, field + \".name\");\n" +
"        if (\"notes\" in d) {\n" +
"            checkString$a(d.notes, field + \".notes\");\n" +
"        }\n" +
"        if (\"notes_comment\" in d) {\n" +
"            checkNull$8(d.notes_comment, field + \".notes_comment\");\n" +
"        }\n" +
"        if (\"payment_conditions\" in d) {\n" +
"            checkString$a(d.payment_conditions, field + \".payment_conditions\");\n" +
"        }\n" +
"        if (\"phone\" in d) {\n" +
"            checkString$a(d.phone, field + \".phone\");\n" +
"        }\n" +
"        if (\"plan_item\" in d) {\n" +
"            d.plan_item = PlanItemOrPnlPlanItem.Create(d.plan_item, field + \".plan_item\");\n" +
"        }\n" +
"        if (\"plan_item_attributes\" in d) {\n" +
"            checkNull$8(d.plan_item_attributes, field + \".plan_item_attributes\");\n" +
"        }\n" +
"        if (\"plan_item_id\" in d) {\n" +
"            checkNumber$9(d.plan_item_id, field + \".plan_item_id\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.pnl_plan_item = PlanItemOrPnlPlanItemOrCurrentAccountPlanItem.Create(d.pnl_plan_item, field + \".pnl_plan_item\", \"PlanItemOrPnlPlanItemOrCurrentAccountPlanItem | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.pnl_plan_item, field + \".pnl_plan_item\", \"PlanItemOrPnlPlanItemOrCurrentAccountPlanItem | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNumber$9(d.pnl_plan_item_id, field + \".pnl_plan_item_id\", \"number | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.pnl_plan_item_id, field + \".pnl_plan_item_id\", \"number | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"postal_code\" in d) {\n" +
"            checkString$a(d.postal_code, field + \".postal_code\");\n" +
"        }\n" +
"        if (\"purchase_request_count\" in d) {\n" +
"            checkNull$8(d.purchase_request_count, field + \".purchase_request_count\");\n" +
"        }\n" +
"        if (\"received_a_mandate_request\" in d) {\n" +
"            checkBoolean$8(d.received_a_mandate_request, field + \".received_a_mandate_request\");\n" +
"        }\n" +
"        if (\"recipient\" in d) {\n" +
"            checkString$a(d.recipient, field + \".recipient\");\n" +
"        }\n" +
"        if (\"recurrent\" in d) {\n" +
"            checkBoolean$8(d.recurrent, field + \".recurrent\");\n" +
"        }\n" +
"        if (\"reference\" in d) {\n" +
"            checkString$a(d.reference, field + \".reference\");\n" +
"        }\n" +
"        if (\"reg_no\" in d) {\n" +
"            checkString$a(d.reg_no, field + \".reg_no\");\n" +
"        }\n" +
"        if (\"role\" in d) {\n" +
"            checkString$a(d.role, field + \".role\");\n" +
"        }\n" +
"        if (\"rule_enabled\" in d) {\n" +
"            checkBoolean$8(d.rule_enabled, field + \".rule_enabled\");\n" +
"        }\n" +
"        if (\"search_terms\" in d) {\n" +
"            checkArray$5(d.search_terms, field + \".search_terms\");\n" +
"            if (d.search_terms) {\n" +
"                for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                    checkString$a(d.search_terms[i], field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"source_id\" in d) {\n" +
"            checkString$a(d.source_id, field + \".source_id\");\n" +
"        }\n" +
"        if (\"stripe_id\" in d) {\n" +
"            checkNull$8(d.stripe_id, field + \".stripe_id\");\n" +
"        }\n" +
"        if (\"supplier_payment_method\" in d) {\n" +
"            checkNull$8(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        }\n" +
"        if (\"supplier_payment_method_last_updated_at\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$8(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$a(d.supplier_payment_method_last_updated_at, field + \".supplier_payment_method_last_updated_at\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"tags\" in d) {\n" +
"            checkArray$5(d.tags, field + \".tags\");\n" +
"            if (d.tags) {\n" +
"                for (let i = 0; i < d.tags.length; i++) {\n" +
"                    checkNever$1(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        if (\"turnover\" in d) {\n" +
"            checkNull$8(d.turnover, field + \".turnover\");\n" +
"        }\n" +
"        if (\"url\" in d) {\n" +
"            checkString$a(d.url, field + \".url\");\n" +
"        }\n" +
"        if (\"vat_number\" in d) {\n" +
"            checkString$a(d.vat_number, field + \".vat_number\");\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$a(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$8(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"activity_code\", \"activity_nomenclature\", \"address\", \"address_additional_info\", \"admin_city_code\", \"balance\", \"billing_bank\", \"billing_bic\", \"billing_footer_invoice_id\", \"billing_footer_invoice_label\", \"billing_iban\", \"billing_language\", \"city\", \"company_id\", \"complete\", \"country\", \"country_alpha2\", \"credits\", \"current_mandate\", \"customer_type\", \"debits\", \"delivery_address\", \"delivery_address_additional_info\", \"delivery_city\", \"delivery_country\", \"delivery_country_alpha2\", \"delivery_postal_code\", \"disable_pending_vat\", \"display_name\", \"emails\", \"establishment_no\", \"estimate_count\", \"first_name\", \"force_pending_vat\", \"gender\", \"gocardless_id\", \"iban\", \"id\", \"invoice_count\", \"invoice_dump_id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"known_supplier_id\", \"last_name\", \"ledger_events_count\", \"legal_form_code\", \"method\", \"name\", \"notes\", \"notes_comment\", \"payment_conditions\", \"phone\", \"plan_item\", \"plan_item_attributes\", \"plan_item_id\", \"pnl_plan_item\", \"pnl_plan_item_id\", \"postal_code\", \"purchase_request_count\", \"received_a_mandate_request\", \"recipient\", \"recurrent\", \"reference\", \"reg_no\", \"role\", \"rule_enabled\", \"search_terms\", \"source_id\", \"stripe_id\", \"supplier_payment_method\", \"supplier_payment_method_last_updated_at\", \"tags\", \"turnover\", \"url\", \"vat_number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkNumber$9(d.company_id, field + \".company_id\");\n" +
"        checkString$a(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$8(d.enabled, field + \".enabled\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        checkNull$8(d.internal_identifier, field + \".internal_identifier\");\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        checkBoolean$8(d.label_is_editable, field + \".label_is_editable\");\n" +
"        checkString$a(d.number, field + \".number\");\n" +
"        checkString$a(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"company_id\" in d) {\n" +
"            checkNumber$9(d.company_id, field + \".company_id\");\n" +
"        }\n" +
"        if (\"country_alpha2\" in d) {\n" +
"            checkString$a(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        }\n" +
"        checkBoolean$8(d.enabled, field + \".enabled\");\n" +
"        checkNumber$9(d.id, field + \".id\");\n" +
"        if (\"internal_identifier\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkNull$8(d.internal_identifier, field + \".internal_identifier\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkString$a(d.internal_identifier, field + \".internal_identifier\", \"null | string\");\n" +
"                }\n" +
"                catch (e) {\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        checkString$a(d.label, field + \".label\");\n" +
"        if (\"label_is_editable\" in d) {\n" +
"            checkBoolean$8(d.label_is_editable, field + \".label_is_editable\");\n" +
"        }\n" +
"        checkString$a(d.number, field + \".number\");\n" +
"        if (\"vat_rate\" in d) {\n" +
"            checkString$a(d.vat_rate, field + \".vat_rate\");\n" +
"        }\n" +
"        const knownProperties = [\"company_id\", \"country_alpha2\", \"enabled\", \"id\", \"internal_identifier\", \"label\", \"label_is_editable\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$b(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$b(field, value, multiple) {\n" +
"    return errorHelper$b(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$b(field, value, multiple) {\n" +
"    return errorHelper$b(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$b(field, value, multiple) {\n" +
"    return errorHelper$b(field, value, \"object\");\n" +
"}\n" +
"function checkArray$5(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$b(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$9(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$b(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$8(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$b(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$a(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$b(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$8(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$b(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever$1(value, field, multiple) {\n" +
"    return errorHelper$b(field, value, \"never\");\n" +
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
"class APIInvoiceList {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceList.Create(JSON.parse(d));\n" +
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
"        checkArray$4(d.invoices, field + \".invoices\");\n" +
"        if (d.invoices) {\n" +
"            for (let i = 0; i < d.invoices.length; i++) {\n" +
"                d.invoices[i] = InvoicesEntity.Create(d.invoices[i], field + \".invoices\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$8(d.pageSize, field + \".pageSize\");\n" +
"        d.pagination = Pagination.Create(d.pagination, field + \".pagination\");\n" +
"        const knownProperties = [\"invoices\", \"pageSize\", \"pagination\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$9(d.amount_without_tax, field + \".amount_without_tax\");\n" +
"        checkNull$7(d.approval_status, field + \".approval_status\");\n" +
"        checkBoolean$7(d.archived, field + \".archived\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$7(d.checksum, field + \".checksum\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$9(d.checksum, field + \".checksum\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$8(d.company_id, field + \".company_id\");\n" +
"        checkString$9(d.created_at, field + \".created_at\");\n" +
"        checkString$9(d.currency, field + \".currency\");\n" +
"        checkString$9(d.currency_amount, field + \".currency_amount\");\n" +
"        checkString$9(d.currency_tax, field + \".currency_tax\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$9(d.date, field + \".date\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$7(d.date, field + \".date\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$9(d.deadline, field + \".deadline\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$7(d.deadline, field + \".deadline\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$9(d.direction, field + \".direction\");\n" +
"        checkNull$7(d.email_from, field + \".email_from\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$7(d.filename, field + \".filename\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$9(d.filename, field + \".filename\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$7(d.gdrive_path, field + \".gdrive_path\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$9(d.gdrive_path, field + \".gdrive_path\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$8(d.id, field + \".id\");\n" +
"        checkBoolean$7(d.incomplete, field + \".incomplete\");\n" +
"        checkArray$4(d.invoice_lines, field + \".invoice_lines\");\n" +
"        if (d.invoice_lines) {\n" +
"            for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$9(d.invoice_number, field + \".invoice_number\");\n" +
"        checkBoolean$7(d.is_factur_x, field + \".is_factur_x\");\n" +
"        checkBoolean$7(d.is_waiting_for_ocr, field + \".is_waiting_for_ocr\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$9(d.label, field + \".label\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$7(d.label, field + \".label\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$7(d.not_duplicate, field + \".not_duplicate\");\n" +
"        checkBoolean$7(d.paid, field + \".paid\");\n" +
"        checkString$9(d.payment_status, field + \".payment_status\");\n" +
"        checkString$9(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkString$9(d.source, field + \".source\");\n" +
"        checkString$9(d.status, field + \".status\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.thirdparty = Thirdparty.Create(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$7(d.thirdparty, field + \".thirdparty\", \"Thirdparty | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$9(d.type, field + \".type\");\n" +
"        checkBoolean$7(d.validation_needed, field + \".validation_needed\");\n" +
"        const knownProperties = [\"amount\", \"amount_without_tax\", \"approval_status\", \"archived\", \"checksum\", \"company_id\", \"created_at\", \"currency\", \"currency_amount\", \"currency_tax\", \"date\", \"deadline\", \"direction\", \"email_from\", \"filename\", \"gdrive_path\", \"id\", \"incomplete\", \"invoice_lines\", \"invoice_number\", \"is_factur_x\", \"is_waiting_for_ocr\", \"label\", \"not_duplicate\", \"paid\", \"payment_status\", \"pusher_channel\", \"source\", \"status\", \"thirdparty\", \"type\", \"validation_needed\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkNumber$8(d.id, field + \".id\");\n" +
"        d.pnl_plan_item = PnlPlanItem$1.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkString$9(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"id\", \"pnl_plan_item\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
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
"        checkBoolean$7(d.enabled, field + \".enabled\");\n" +
"        checkNumber$8(d.id, field + \".id\");\n" +
"        checkString$9(d.label, field + \".label\");\n" +
"        checkString$9(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"};\n" +
"class Thirdparty {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty.Create(JSON.parse(d));\n" +
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
"        checkNumber$8(d.id, field + \".id\");\n" +
"        checkString$9(d.name, field + \".name\");\n" +
"        const knownProperties = [\"id\", \"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkBoolean$7(d.hasNextPage, field + \".hasNextPage\");\n" +
"        checkNumber$8(d.page, field + \".page\");\n" +
"        checkNumber$8(d.pages, field + \".pages\");\n" +
"        checkNumber$8(d.pageSize, field + \".pageSize\");\n" +
"        checkNumber$8(d.totalEntries, field + \".totalEntries\");\n" +
"        checkString$9(d.totalEntriesPrecision, field + \".totalEntriesPrecision\");\n" +
"        checkString$9(d.totalEntriesStr, field + \".totalEntriesStr\");\n" +
"        const knownProperties = [\"hasNextPage\", \"page\", \"pages\", \"pageSize\", \"totalEntries\", \"totalEntriesPrecision\", \"totalEntriesStr\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$a(field, value, multiple) {\n" +
"    return errorHelper$a(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$a(field, value, multiple) {\n" +
"    return errorHelper$a(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$a(field, value, multiple) {\n" +
"    return errorHelper$a(field, value, \"object\");\n" +
"}\n" +
"function checkArray$4(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$a(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$8(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$a(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$7(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$a(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$9(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$a(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$7(value, field, multiple) {\n" +
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
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$9 = null;\n" +
"class APIInvoiceListParams {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceListParams.Create(JSON.parse(d));\n" +
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
"        checkString$8(d.direction, field + \".direction\");\n" +
"        if (\"filter\" in d) {\n" +
"            // This will be refactored in the next release.\n" +
"            try {\n" +
"                checkString$8(d.filter, field + \".filter\", \"string | FilterEntity[]\");\n" +
"            }\n" +
"            catch (e) {\n" +
"                try {\n" +
"                    checkArray$3(d.filter, field + \".filter\", \"string | FilterEntity[]\");\n" +
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
"            checkNumber$7(d.page, field + \".page\");\n" +
"        }\n" +
"        if (\"sort\" in d) {\n" +
"            checkString$8(d.sort, field + \".sort\");\n" +
"        }\n" +
"        const knownProperties = [\"direction\", \"filter\", \"page\", \"sort\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$8(d.field, field + \".field\");\n" +
"        checkString$8(d.operator, field + \".operator\");\n" +
"        checkString$8(d.value, field + \".value\");\n" +
"        const knownProperties = [\"field\", \"operator\", \"value\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new FilterEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.field = d.field;\n" +
"        this.operator = d.operator;\n" +
"        this.value = d.value;\n" +
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
"function checkArray$3(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$9(field, value, multiple);\n" +
"}\n" +
"function checkNumber$7(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$9(field, value, \"number\");\n" +
"}\n" +
"function checkString$8(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$9(field, value, multiple ?? \"string\");\n" +
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
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$8 = null;\n" +
"class APIInvoiceToDMS {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceToDMS.Create(JSON.parse(d));\n" +
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
"        checkNull$6(d.response, field + \".response\");\n" +
"        const knownProperties = [\"response\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$8(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIInvoiceToDMS(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.response = d.response;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$8(field, value, multiple) {\n" +
"    return errorHelper$8(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$8(field, value, multiple) {\n" +
"    return errorHelper$8(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$8(field, value, multiple) {\n" +
"    return errorHelper$8(field, value, \"object\");\n" +
"}\n" +
"function checkNull$6(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$8(field, value, \"null\");\n" +
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
"class APIInvoiceUpdateResponse {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceUpdateResponse.Create(JSON.parse(d));\n" +
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
"        checkBoolean$6(d.embeddable_in_browser, field + \".embeddable_in_browser\");\n" +
"        checkBoolean$6(d.has_file, field + \".has_file\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$7(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$5(d.preview_status, field + \".preview_status\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkArray$2(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString$7(d.preview_urls[i], field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"embeddable_in_browser\", \"has_file\", \"preview_status\", \"preview_urls\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIInvoiceUpdateResponse(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        this.has_file = d.has_file;\n" +
"        this.preview_status = d.preview_status;\n" +
"        this.preview_urls = d.preview_urls;\n" +
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
"function checkArray$2(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$7(field, value, \"array\");\n" +
"}\n" +
"function checkBoolean$6(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$7(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$7(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$7(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$5(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$7(field, value, multiple);\n" +
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
"async function getInvoiceCreationDate(id, maxAge) {\n" +
"    const invoice = await getInvoice(id, maxAge);\n" +
"    return invoice?.created_at;\n" +
"}\n" +
"\n" +
"const cache$1 = DataCache.getInstance(\"dmsItem\");\n" +
"class DMSItem extends Logger {\n" +
"    constructor({ id }, factory) {\n" +
"        super();\n" +
"        this.id = id;\n" +
"        this.valid = null;\n" +
"        this.validMessage = null;\n" +
"        this.factory = factory;\n" +
"    }\n" +
"    async getLinks() {\n" +
"        return await this.getCached(\"getLinks\", async ({ id }) => {\n" +
"            const fileId = (await this.getItem())?.itemable_id;\n" +
"            if (!fileId)\n" +
"                return [];\n" +
"            return await getDMSItemLinks(fileId, this.maxAge());\n" +
"        }, {\n" +
"            Create(data) {\n" +
"                return data.map((item) => APIDMSItemLink.Create(item));\n" +
"            },\n" +
"        });\n" +
"    }\n" +
"    async getItem() {\n" +
"        return await this.getCached(\"getItem\", ({ id }) => getDMSItem(id, this.maxAge()), APIDMSItem);\n" +
"    }\n" +
"    async toInvoice() {\n" +
"        this.debug(\"toInvoice\");\n" +
"        const start = new Date().toISOString();\n" +
"        const dmsItem = await this.getItem();\n" +
"        const regex = /^(?<number>.*?)(?: - (?<date>[0123]\\d-[01]\\d-\\d{4}))?(?: - (?<amount>[\\d .]*(?:,\\d\\d)?) ?€)$/u;\n" +
"        const match = dmsItem.name.match(regex)?.groups;\n" +
"        if (!match) {\n" +
"            this.log(\"The file name does not match the Invoice Regex\", { name: dmsItem.name, regex });\n" +
"            return;\n" +
"        }\n" +
"        const date = match.date && new Date(match.date.split(\"-\").reverse().join(\"-\"));\n" +
"        const groupedDocs = await this.getLinks();\n" +
"        const transactionRecord = groupedDocs.find((gdoc) => gdoc.record_type === \"BankTransaction\");\n" +
"        const transactionDocument = transactionRecord && this.factory.getTransaction(transactionRecord.record_id);\n" +
"        const direction = Number(await transactionDocument?.getAmount()) > 0 ? \"customer\" : \"supplier\";\n" +
"        this.debug(jsonClone({\n" +
"            start,\n" +
"            dmsItem,\n" +
"            match: { ...match },\n" +
"            groupedDocs,\n" +
"            direction,\n" +
"            transactionRecord,\n" +
"            transactionDocument,\n" +
"            date: date.toLocaleDateString(),\n" +
"        }));\n" +
"        if (!match) {\n" +
"            this.log(\"toInvoice: Unable to parse invoice infos\");\n" +
"        }\n" +
"        if (!transactionDocument) {\n" +
"            this.log(\"toInvoice : Unable to determine direction\");\n" +
"            return;\n" +
"        }\n" +
"        const dmsToInvoiceResponse = await dmsToInvoice(dmsItem.signed_id, direction);\n" +
"        const invoice = await findInvoice(() => true, {\n" +
"            direction,\n" +
"            filter: [{ field: \"created_at\", operator: \"gteq\", value: start }],\n" +
"        });\n" +
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
"                vat_rate: \"exempt\",\n" +
"            });\n" +
"        this.error(\"todo: réparer cette fonction\");\n" +
"        debugger;\n" +
"        /*\n" +
"        if (transactionDocument?.thirdparty_id) {\n" +
"          const thirdparty = (await getThirdparty(transactionDocument.thirdparty_id)).thirdparty;\n" +
"          Object.assign(data, { thirdparty_id: transactionDocument.thirdparty_id });\n" +
"          Object.assign(line, { pnl_plan_item_id: thirdparty.thirdparty_invoice_line_rules[0]?.pnl_plan_item });\n" +
"        }\n" +
"        */\n" +
"        Object.assign(data, { invoice_lines_attributes: [line] });\n" +
"        const updateInvoiceResponse = await updateInvoice(invoice.id, data);\n" +
"        this.log({ dmsToInvoiceResponse, updateInvoiceResponse, invoice, data });\n" +
"        return invoice;\n" +
"    }\n" +
"    async loadValidation() {\n" +
"        this.debug(\"loadValidation\", { id: this.id });\n" +
"        if (this.validMessage === null)\n" +
"            this.validMessage = await this.getValidMessage();\n" +
"        this.valid = this.validMessage === \"OK\";\n" +
"    }\n" +
"    async isValid() {\n" +
"        this.debug(\"isValid\", { id: this.id });\n" +
"        if (this.valid === null)\n" +
"            await this.loadValidation();\n" +
"        return this.valid;\n" +
"    }\n" +
"    isCurrent() {\n" +
"        return this.id === Number(getParam(location.href, \"item_id\"));\n" +
"    }\n" +
"    async fixDateCase() {\n" +
"        this.debug(\"fixDateCase\", { id: this.id });\n" +
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
"        const rightList = findElem(\"div\", \"Nom du Fichier\").closest(\"div.w-100\");\n" +
"        const props = getReactProps(rightList, 7);\n" +
"        if (props)\n" +
"            props.item = updatedItem;\n" +
"        cache$1.delete({ ref: \"getItem\", args: { id: this.id } });\n" +
"    }\n" +
"    async getStatus() {\n" +
"        this.debug(\"getStatus\", { id: this.id });\n" +
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
"        this.debug(\"isPermanent\", { id: this.id });\n" +
"        const item = await this.getItem();\n" +
"        if (!item)\n" +
"            return null;\n" +
"        return [\n" +
"            21994021, // 03. PV AG - President\n" +
"            21994019, // 05. Contrats\n" +
"        ].includes(item.parent_id);\n" +
"    }\n" +
"    async getValidMessage(refresh = false) {\n" +
"        this.debug(\"getValidMessage\");\n" +
"        if (refresh)\n" +
"            this.refreshing = refresh === true ? Date.now() : refresh;\n" +
"        const message = await new Promise(async (resolve) => {\n" +
"            const item = await this.getItem();\n" +
"            if (!item)\n" +
"                return resolve(null);\n" +
"            if (item.archived_at)\n" +
"                return resolve(\"OK\");\n" +
"            if (item.type === \"dms_folder\")\n" +
"                return resolve(\"OK\");\n" +
"            if (await this.isPermanent())\n" +
"                return resolve(\"OK\");\n" +
"            const rules = await this.getRules();\n" +
"            if (getParam(location.href, \"item_id\") === this.id.toString(10)) {\n" +
"                this.log(\"getValidMessage\", { rules, item });\n" +
"            }\n" +
"            if (item.archived_at)\n" +
"                return resolve(\"OK\");\n" +
"            if (this.isCurrent())\n" +
"                this.fixDateCase();\n" +
"            if (rules) {\n" +
"                const match = rules.templates.some((template) => template.regex.test(item.name));\n" +
"                if (!match)\n" +
"                    return resolve(rules.message);\n" +
"            }\n" +
"            else {\n" +
"                const links = await this.getLinks();\n" +
"                if (!links.length && !item.name.startsWith(\"§§\"))\n" +
"                    return resolve(\"Ce document n'est pas lié\");\n" +
"            }\n" +
"            resolve(\"OK\");\n" +
"        });\n" +
"        this.refreshing = null;\n" +
"        return message;\n" +
"    }\n" +
"    async getRules() {\n" +
"        this.debug(\"getRules\", { id: this.id });\n" +
"        return this.getCached(\"getRules\", async ({ id }) => {\n" +
"            const item = await this.getItem();\n" +
"            if (!item)\n" +
"                return null;\n" +
"            if (item.name.startsWith(\"RECU\") || item.name.startsWith(\"§\"))\n" +
"                return null;\n" +
"            const links = await this.getLinks();\n" +
"            if (await this.hasClosedLink(links))\n" +
"                return null;\n" +
"            const transactions = links.filter((link) => link.record_type === \"BankTransaction\");\n" +
"            const isCheckRemmitance = transactions.some((transaction) => transaction.record_name.startsWith(\"REMISE CHEQUE \"));\n" +
"            if (isCheckRemmitance) {\n" +
"                const templates = [\n" +
"                    {\n" +
"                        title: \"Photo du chèque\",\n" +
"                        text: \"CHQ&lt;n° du chèque&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€\",\n" +
"                        regex: /^CHQ(?: n°)? ?\\d* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d \\.]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                    },\n" +
"                    {\n" +
"                        title: \"Reçu de don\",\n" +
"                        text: \"CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€\",\n" +
"                        regex: /^CERFA(?: n°)? ?[\\d-]* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                    },\n" +
"                ];\n" +
"                const message = `<a\n" +
"          title=\"Le nom des fichiers attachés à une remise de chèque doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"        >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates\n" +
"                    .map((it) => `<li><b>${it.title} :</b><code>${it.text}</code></li>`)\n" +
"                    .join(\"\")}</ul>`;\n" +
"                return { templates, message };\n" +
"            }\n" +
"            const isEmittedCheck = transactions.some((transaction) => transaction.record_name.startsWith(\"CHEQUE \"));\n" +
"            if (isEmittedCheck) {\n" +
"                const templates = [\n" +
"                    {\n" +
"                        title: \"Talon du chèque\",\n" +
"                        text: \"CHQ&lt;numéro du chèque&gt; - &lt;destinataire du chèque&gt; - &lt;montant&gt;€\",\n" +
"                        regex: /^CHQ ?\\d* - .* - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                    },\n" +
"                    {\n" +
"                        title: \"Reçu de don à une association\",\n" +
"                        text: \"CERFA n°&lt;n° de cerfa&gt; - &lt;nom bénéficiaire&gt; - jj-mm-aaaa - &lt;montant&gt;€\",\n" +
"                        regex: /^CERFA n° ?[\\d-]* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                    },\n" +
"                    {\n" +
"                        title: \"Reçu d'octroi d'aide\",\n" +
"                        text: \"AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj-mm-aaaa - &lt;montant&gt;€\",\n" +
"                        regex: /^AIDES?\\d* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                    },\n" +
"                ];\n" +
"                const message = `<a\n" +
"          title=\"Le nom des fichiers attachés à un paiement par chèque doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"        >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates\n" +
"                    .map((it) => `<li><b>${it.title} :</b><code>${it.text}</code></li>`)\n" +
"                    .join(\"\")}</ul>`;\n" +
"                return { templates, message };\n" +
"            }\n" +
"            const isReceivedTransfer = transactions.some((transaction) => [\"VIR INST RE\", \"VIR RECU\", \"VIR INSTANTANE RECU DE:\"].some((label) => transaction.record_name.startsWith(label)));\n" +
"            if (isReceivedTransfer) {\n" +
"                const templates = [\n" +
"                    {\n" +
"                        title: \"Reçu de don\",\n" +
"                        text: \"CERFA n°&lt;n° de cerfa&gt; - &lt;nom donateur&gt; - jj-mm-aaaa - &lt;montant&gt;€\",\n" +
"                        regex: /^CERFA n° ?[\\d\\w\\/-]* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                    },\n" +
"                ];\n" +
"                const message = `<a\n" +
"        title=\"Le nom des fichiers attachés à un virement reçu doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates\n" +
"                    .map((it) => `<li><b>${it.title} :</b><code>${it.text}</code></li>`)\n" +
"                    .join(\"\")}</ul>`;\n" +
"                return { templates, message };\n" +
"            }\n" +
"            const isEmittedTransfer = transactions.some((transaction) => [\"VIR EUROPEEN EMIS\", \"VIR INSTANTANE EMIS\"].some((label) => transaction.record_name.includes(label)));\n" +
"            if (isEmittedTransfer) {\n" +
"                const templates = [\n" +
"                    {\n" +
"                        title: \"Reçu de don à une association\",\n" +
"                        text: \"CERFA n°&lt;n° de cerfa&gt; - &lt;nom bénéficiaire&gt; - jj-mm-aaaa - &lt;montant&gt;€\",\n" +
"                        regex: /^CERFA n° ?[\\d-]* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                    },\n" +
"                    {\n" +
"                        title: \"Reçu d'octroi d'aide\",\n" +
"                        text: \"AIDES - &lt;nom bénéficiaire !!sans le prénom!!&gt; - jj-mm-aaaa - &lt;montant&gt;€\",\n" +
"                        regex: /^AIDES?\\d* - .* - [0123]\\d-[01]\\d-\\d{4} - [\\d .]*(?:,\\d\\d)? ?€(?:\\.[a-zA-Z]{3,4})?$/u,\n" +
"                    },\n" +
"                ];\n" +
"                const message = `<a\n" +
"        title=\"Le nom des fichiers attachés à un virement émis doit correspondre à un de ces modèles. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Nom%20fichier%20GED\"\n" +
"      >Le nom de fichier doit correspondre à un de ces modèles ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${templates\n" +
"                    .map((it) => `<li><b>${it.title} :</b><code>${it.text}</code></li>`)\n" +
"                    .join(\"\")}</ul>`;\n" +
"                return { templates, message };\n" +
"            }\n" +
"            return null;\n" +
"        }, {\n" +
"            Create: (data) => {\n" +
"                if (!data)\n" +
"                    return null;\n" +
"                const { message, templates } = data;\n" +
"                return { message, templates: templates.map((item) => ({ ...item, regex: regexFromJSON(item.regex) })) };\n" +
"            },\n" +
"        });\n" +
"    }\n" +
"    /**\n" +
"     * Find the best match for a string\n" +
"     * @returns [start, end, template] The indexes of the best match\n" +
"     */\n" +
"    async partialMatch(str) {\n" +
"        this.debug(\"partialMatch\", { str, id: this.id });\n" +
"        if (str.startsWith(\"RECU\"))\n" +
"            return [str.length, str.length];\n" +
"        const rules = await this.getRules();\n" +
"        this.debug({ rules, DMS: this });\n" +
"        return (rules?.templates ?? []).reduce((pmatch, template) => {\n" +
"            const templateMatch = [...regexPartialMatch(str, template.regex), template];\n" +
"            const pmatchLength = pmatch[1] - pmatch[0];\n" +
"            const templateMatchLength = templateMatch[1] - templateMatch[0];\n" +
"            return pmatchLength > templateMatchLength ? templateMatch : pmatch;\n" +
"        }, [0, str.length]);\n" +
"    }\n" +
"    async hasClosedLink(links) {\n" +
"        this.debug(\"hasClosedLink\", { links, id: this.id });\n" +
"        const closed = await Promise.all(links.map((link) => Document.isClosed(link.record_id)));\n" +
"        return closed.some((closed) => closed);\n" +
"    }\n" +
"    /** Determine the acceptable maxAge of API data */\n" +
"    maxAge(maxAge) {\n" +
"        if (typeof maxAge === \"number\")\n" +
"            return maxAge;\n" +
"        if (this.refreshing)\n" +
"            return Date.now() - this.refreshing;\n" +
"        if (this.isCurrent())\n" +
"            return Date.now() - performance.timeOrigin;\n" +
"        return void 0;\n" +
"    }\n" +
"    async getCached(ref, fetcher, sanitizer) {\n" +
"        const maxAge = this.maxAge();\n" +
"        const refreshing = this.refreshing;\n" +
"        const now = Date.now();\n" +
"        const elapsed = refreshing ? now - refreshing : this.isCurrent() ? now - performance.timeOrigin : void 0;\n" +
"        let reloaded = false;\n" +
"        const result = await cache$1.fetch({\n" +
"            ref,\n" +
"            args: { id: this.id },\n" +
"            fetcher: async (args) => {\n" +
"                reloaded = true;\n" +
"                const result = await fetcher(args);\n" +
"                this.debug(`getCached:${ref}(${this.id}):Reload`, { ref, args, result });\n" +
"                return result;\n" +
"            },\n" +
"            sanitizer: (data) => sanitizer.Create(jsonClone(data)),\n" +
"            maxAge,\n" +
"        });\n" +
"        if (!reloaded)\n" +
"            this.debug(`getCached:${ref}(${this.id}):FromCache`, {\n" +
"                maxAge,\n" +
"                refreshing,\n" +
"                now,\n" +
"                elapsed,\n" +
"                isCurrent: this.isCurrent(),\n" +
"                result,\n" +
"            });\n" +
"        return result;\n" +
"    }\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$6 = null;\n" +
"class APIGlobalContext {\n" +
"    static Parse(d) {\n" +
"        return APIGlobalContext.Create(JSON.parse(d));\n" +
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
"        d.company = Company.Create(d.company, field + \".company\");\n" +
"        checkArray$1(d.companyFeaturesAbility, field + \".companyFeaturesAbility\");\n" +
"        if (d.companyFeaturesAbility) {\n" +
"            for (let i = 0; i < d.companyFeaturesAbility.length; i++) {\n" +
"                d.companyFeaturesAbility[i] = CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity.Create(d.companyFeaturesAbility[i], field + \".companyFeaturesAbility\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$4(d.experiments, field + \".experiments\");\n" +
"        d.firm = Firm.Create(d.firm, field + \".firm\");\n" +
"        checkBoolean$5(d.hasSwanToken, field + \".hasSwanToken\");\n" +
"        checkBoolean$5(d.isKeyAccount, field + \".isKeyAccount\");\n" +
"        checkBoolean$5(d.isNonProfit, field + \".isNonProfit\");\n" +
"        checkBoolean$5(d.redirect_to_onboarding_form, field + \".redirect_to_onboarding_form\");\n" +
"        checkBoolean$5(d.redirect_to_onboarding_steps, field + \".redirect_to_onboarding_steps\");\n" +
"        checkNull$4(d.requiresUserConsent, field + \".requiresUserConsent\");\n" +
"        d.todayFiscalYear = TodayFiscalYear.Create(d.todayFiscalYear, field + \".todayFiscalYear\");\n" +
"        checkArray$1(d.userFeaturesAbility, field + \".userFeaturesAbility\");\n" +
"        if (d.userFeaturesAbility) {\n" +
"            for (let i = 0; i < d.userFeaturesAbility.length; i++) {\n" +
"                d.userFeaturesAbility[i] = CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity.Create(d.userFeaturesAbility[i], field + \".userFeaturesAbility\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$4(d.userRole, field + \".userRole\");\n" +
"        const knownProperties = [\"company\", \"companyFeaturesAbility\", \"experiments\", \"firm\", \"hasSwanToken\", \"isKeyAccount\", \"isNonProfit\", \"redirect_to_onboarding_form\", \"redirect_to_onboarding_steps\", \"requiresUserConsent\", \"todayFiscalYear\", \"userFeaturesAbility\", \"userRole\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIGlobalContext(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.company = d.company;\n" +
"        this.companyFeaturesAbility = d.companyFeaturesAbility;\n" +
"        this.experiments = d.experiments;\n" +
"        this.firm = d.firm;\n" +
"        this.hasSwanToken = d.hasSwanToken;\n" +
"        this.isKeyAccount = d.isKeyAccount;\n" +
"        this.isNonProfit = d.isNonProfit;\n" +
"        this.redirect_to_onboarding_form = d.redirect_to_onboarding_form;\n" +
"        this.redirect_to_onboarding_steps = d.redirect_to_onboarding_steps;\n" +
"        this.requiresUserConsent = d.requiresUserConsent;\n" +
"        this.todayFiscalYear = d.todayFiscalYear;\n" +
"        this.userFeaturesAbility = d.userFeaturesAbility;\n" +
"        this.userRole = d.userRole;\n" +
"    }\n" +
"}\n" +
"class Company {\n" +
"    static Parse(d) {\n" +
"        return Company.Create(JSON.parse(d));\n" +
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
"        d.accountant = Accountant.Create(d.accountant, field + \".accountant\");\n" +
"        checkBoolean$5(d.accountant_editable, field + \".accountant_editable\");\n" +
"        checkBoolean$5(d.accountants_can_bypass_freezing, field + \".accountants_can_bypass_freezing\");\n" +
"        checkString$6(d.accounting_logic, field + \".accounting_logic\");\n" +
"        checkNumber$6(d.accounting_manager_id, field + \".accounting_manager_id\");\n" +
"        checkString$6(d.address, field + \".address\");\n" +
"        checkNull$4(d.all_onboarding_steps_completed_at, field + \".all_onboarding_steps_completed_at\");\n" +
"        checkBoolean$5(d.auto_match_invoices, field + \".auto_match_invoices\");\n" +
"        checkBoolean$5(d.auto_process_factur_x, field + \".auto_process_factur_x\");\n" +
"        checkBoolean$5(d.auto_process_invoices, field + \".auto_process_invoices\");\n" +
"        checkString$6(d.billing_bank, field + \".billing_bank\");\n" +
"        checkString$6(d.billing_bic, field + \".billing_bic\");\n" +
"        checkString$6(d.billing_company_name, field + \".billing_company_name\");\n" +
"        checkString$6(d.billing_email, field + \".billing_email\");\n" +
"        checkString$6(d.billing_iban, field + \".billing_iban\");\n" +
"        checkString$6(d.billing_payment_conditions, field + \".billing_payment_conditions\");\n" +
"        checkArray$1(d.billing_payment_options, field + \".billing_payment_options\");\n" +
"        if (d.billing_payment_options) {\n" +
"            for (let i = 0; i < d.billing_payment_options.length; i++) {\n" +
"                checkString$6(d.billing_payment_options[i], field + \".billing_payment_options\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$6(d.billing_telephone, field + \".billing_telephone\");\n" +
"        checkNull$4(d.billing_user_approved_at, field + \".billing_user_approved_at\");\n" +
"        checkString$6(d.business_description, field + \".business_description\");\n" +
"        checkBoolean$5(d.cash_based_accounting, field + \".cash_based_accounting\");\n" +
"        checkNull$4(d.churns_on, field + \".churns_on\");\n" +
"        checkString$6(d.city, field + \".city\");\n" +
"        checkString$6(d.closing, field + \".closing\");\n" +
"        checkString$6(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkString$6(d.created_at, field + \".created_at\");\n" +
"        checkString$6(d.creation_date, field + \".creation_date\");\n" +
"        checkString$6(d.customer_since, field + \".customer_since\");\n" +
"        checkNull$4(d.default_payment_reminder_id, field + \".default_payment_reminder_id\");\n" +
"        checkNull$4(d.default_substance, field + \".default_substance\");\n" +
"        checkString$6(d.default_vat_rate, field + \".default_vat_rate\");\n" +
"        checkBoolean$5(d.disable_pending_vat_for_customers, field + \".disable_pending_vat_for_customers\");\n" +
"        checkString$6(d.display_name, field + \".display_name\");\n" +
"        checkString$6(d.dms_activated, field + \".dms_activated\");\n" +
"        checkBoolean$5(d.enable_accepted_email, field + \".enable_accepted_email\");\n" +
"        checkBoolean$5(d.enable_submitted_email, field + \".enable_submitted_email\");\n" +
"        if (\"fees_default_plan_item_id\" in d) {\n" +
"            checkNull$4(d.fees_default_plan_item_id, field + \".fees_default_plan_item_id\");\n" +
"        }\n" +
"        d.firm = Firm1.Create(d.firm, field + \".firm\");\n" +
"        d.firm_group = FirmGroup.Create(d.firm_group, field + \".firm_group\");\n" +
"        checkNumber$6(d.firm_id, field + \".firm_id\");\n" +
"        d.firm_related_settings = FirmRelatedSettings.Create(d.firm_related_settings, field + \".firm_related_settings\");\n" +
"        checkNull$4(d.fiscal_category, field + \".fiscal_category\");\n" +
"        checkNull$4(d.fiscal_regime, field + \".fiscal_regime\");\n" +
"        checkNumber$6(d.fiscal_rof_vat, field + \".fiscal_rof_vat\");\n" +
"        checkArray$1(d.fiscalYears, field + \".fiscalYears\");\n" +
"        if (d.fiscalYears) {\n" +
"            for (let i = 0; i < d.fiscalYears.length; i++) {\n" +
"                d.fiscalYears[i] = FiscalYearsEntityOrTodayFiscalYear.Create(d.fiscalYears[i], field + \".fiscalYears\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$6(d.formatted_reg_no, field + \".formatted_reg_no\");\n" +
"        checkBoolean$5(d.freeze_complete_invoices_enabled, field + \".freeze_complete_invoices_enabled\");\n" +
"        checkNull$4(d.frozen_since, field + \".frozen_since\");\n" +
"        checkString$6(d.frozen_until, field + \".frozen_until\");\n" +
"        checkNull$4(d.gocardless_mandates_sync_at, field + \".gocardless_mandates_sync_at\");\n" +
"        checkString$6(d.gocardless_onboarding_status, field + \".gocardless_onboarding_status\");\n" +
"        checkNull$4(d.gocardless_organization_id, field + \".gocardless_organization_id\");\n" +
"        checkNull$4(d.handelsregisternummer, field + \".handelsregisternummer\");\n" +
"        checkBoolean$5(d.has_budgetinsight, field + \".has_budgetinsight\");\n" +
"        checkBoolean$5(d.has_pro_account, field + \".has_pro_account\");\n" +
"        checkBoolean$5(d.hasAccountant, field + \".hasAccountant\");\n" +
"        checkBoolean$5(d.hasCards, field + \".hasCards\");\n" +
"        checkBoolean$5(d.hasChequeDeposits, field + \".hasChequeDeposits\");\n" +
"        checkNumber$6(d.id, field + \".id\");\n" +
"        checkString$6(d.instructions, field + \".instructions\");\n" +
"        checkBoolean$5(d.invoices_generation_from_migrations_and_ledger_events_dumps, field + \".invoices_generation_from_migrations_and_ledger_events_dumps\");\n" +
"        checkNull$4(d.invoicing_software, field + \".invoicing_software\");\n" +
"        checkBoolean$5(d.is_onboarding_ongoing, field + \".is_onboarding_ongoing\");\n" +
"        checkBoolean$5(d.is_revision_only, field + \".is_revision_only\");\n" +
"        checkBoolean$5(d.isConstruction, field + \".isConstruction\");\n" +
"        checkBoolean$5(d.isDemo, field + \".isDemo\");\n" +
"        checkBoolean$5(d.isFake, field + \".isFake\");\n" +
"        checkBoolean$5(d.isMasterDemo, field + \".isMasterDemo\");\n" +
"        checkBoolean$5(d.isPLSubsidiary, field + \".isPLSubsidiary\");\n" +
"        checkBoolean$5(d.isRestaurant, field + \".isRestaurant\");\n" +
"        checkBoolean$5(d.isRev, field + \".isRev\");\n" +
"        checkBoolean$5(d.isTraining, field + \".isTraining\");\n" +
"        checkBoolean$5(d.ledger_event_control_enabled, field + \".ledger_event_control_enabled\");\n" +
"        checkString$6(d.legal_form_code, field + \".legal_form_code\");\n" +
"        checkNull$4(d.logo, field + \".logo\");\n" +
"        checkNull$4(d.logo_url, field + \".logo_url\");\n" +
"        checkString$6(d.maxDate, field + \".maxDate\");\n" +
"        checkString$6(d.minDate, field + \".minDate\");\n" +
"        checkString$6(d.name, field + \".name\");\n" +
"        checkString$6(d.number_of_employees, field + \".number_of_employees\");\n" +
"        checkNull$4(d.nUsedTagGroups, field + \".nUsedTagGroups\");\n" +
"        checkString$6(d.onboarding_form_completed_at, field + \".onboarding_form_completed_at\");\n" +
"        checkBoolean$5(d.one_stop_shop, field + \".one_stop_shop\");\n" +
"        checkNull$4(d.payroll_solution, field + \".payroll_solution\");\n" +
"        if (\"plan_item_number_length\" in d) {\n" +
"            checkNull$4(d.plan_item_number_length, field + \".plan_item_number_length\");\n" +
"        }\n" +
"        checkString$6(d.postal_code, field + \".postal_code\");\n" +
"        checkString$6(d.primary_color, field + \".primary_color\");\n" +
"        checkString$6(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkString$6(d.pusher_channel_access_token, field + \".pusher_channel_access_token\");\n" +
"        checkString$6(d.reg_no, field + \".reg_no\");\n" +
"        checkNull$4(d.reseller, field + \".reseller\");\n" +
"        checkString$6(d.resumption_start, field + \".resumption_start\");\n" +
"        checkString$6(d.resumption_status, field + \".resumption_status\");\n" +
"        checkString$6(d.saas_plan, field + \".saas_plan\");\n" +
"        checkString$6(d.salesforce_business_segmentation, field + \".salesforce_business_segmentation\");\n" +
"        checkString$6(d.salesforce_id, field + \".salesforce_id\");\n" +
"        checkNull$4(d.sepa_creditor_identifier, field + \".sepa_creditor_identifier\");\n" +
"        checkBoolean$5(d.sepa_mandates, field + \".sepa_mandates\");\n" +
"        checkString$6(d.share_capital, field + \".share_capital\");\n" +
"        checkString$6(d.share_capital_currency, field + \".share_capital_currency\");\n" +
"        checkBoolean$5(d.show_bank_info_on_estimates, field + \".show_bank_info_on_estimates\");\n" +
"        checkBoolean$5(d.show_pro_account, field + \".show_pro_account\");\n" +
"        checkBoolean$5(d.show_quotes_branding, field + \".show_quotes_branding\");\n" +
"        checkString$6(d.source_id, field + \".source_id\");\n" +
"        checkNull$4(d.steuernummer, field + \".steuernummer\");\n" +
"        checkBoolean$5(d.stripe_checkout_enabled, field + \".stripe_checkout_enabled\");\n" +
"        checkString$6(d.submitted_to_vat_from, field + \".submitted_to_vat_from\");\n" +
"        checkString$6(d.subscription_plan, field + \".subscription_plan\");\n" +
"        checkNull$4(d.swan_account_holder_verification_status, field + \".swan_account_holder_verification_status\");\n" +
"        checkNull$4(d.swan_id, field + \".swan_id\");\n" +
"        checkNull$4(d.swan_onboarding_email, field + \".swan_onboarding_email\");\n" +
"        checkNull$4(d.swan_onboarding_id, field + \".swan_onboarding_id\");\n" +
"        checkNull$4(d.trade_name, field + \".trade_name\");\n" +
"        checkString$6(d.url, field + \".url\");\n" +
"        checkBoolean$5(d.use_factor, field + \".use_factor\");\n" +
"        checkBoolean$5(d.use_pl_as_white_label, field + \".use_pl_as_white_label\");\n" +
"        checkNull$4(d.vat_day_of_month, field + \".vat_day_of_month\");\n" +
"        checkString$6(d.vat_frequency, field + \".vat_frequency\");\n" +
"        checkString$6(d.vat_number, field + \".vat_number\");\n" +
"        const knownProperties = [\"accountant\", \"accountant_editable\", \"accountants_can_bypass_freezing\", \"accounting_logic\", \"accounting_manager_id\", \"address\", \"all_onboarding_steps_completed_at\", \"auto_match_invoices\", \"auto_process_factur_x\", \"auto_process_invoices\", \"billing_bank\", \"billing_bic\", \"billing_company_name\", \"billing_email\", \"billing_iban\", \"billing_payment_conditions\", \"billing_payment_options\", \"billing_telephone\", \"billing_user_approved_at\", \"business_description\", \"cash_based_accounting\", \"churns_on\", \"city\", \"closing\", \"country_alpha2\", \"created_at\", \"creation_date\", \"customer_since\", \"default_payment_reminder_id\", \"default_substance\", \"default_vat_rate\", \"disable_pending_vat_for_customers\", \"display_name\", \"dms_activated\", \"enable_accepted_email\", \"enable_submitted_email\", \"fees_default_plan_item_id\", \"firm\", \"firm_group\", \"firm_id\", \"firm_related_settings\", \"fiscal_category\", \"fiscal_regime\", \"fiscal_rof_vat\", \"fiscalYears\", \"formatted_reg_no\", \"freeze_complete_invoices_enabled\", \"frozen_since\", \"frozen_until\", \"gocardless_mandates_sync_at\", \"gocardless_onboarding_status\", \"gocardless_organization_id\", \"handelsregisternummer\", \"has_budgetinsight\", \"has_pro_account\", \"hasAccountant\", \"hasCards\", \"hasChequeDeposits\", \"id\", \"instructions\", \"invoices_generation_from_migrations_and_ledger_events_dumps\", \"invoicing_software\", \"is_onboarding_ongoing\", \"is_revision_only\", \"isConstruction\", \"isDemo\", \"isFake\", \"isMasterDemo\", \"isPLSubsidiary\", \"isRestaurant\", \"isRev\", \"isTraining\", \"ledger_event_control_enabled\", \"legal_form_code\", \"logo\", \"logo_url\", \"maxDate\", \"minDate\", \"name\", \"number_of_employees\", \"nUsedTagGroups\", \"onboarding_form_completed_at\", \"one_stop_shop\", \"payroll_solution\", \"plan_item_number_length\", \"postal_code\", \"primary_color\", \"pusher_channel\", \"pusher_channel_access_token\", \"reg_no\", \"reseller\", \"resumption_start\", \"resumption_status\", \"saas_plan\", \"salesforce_business_segmentation\", \"salesforce_id\", \"sepa_creditor_identifier\", \"sepa_mandates\", \"share_capital\", \"share_capital_currency\", \"show_bank_info_on_estimates\", \"show_pro_account\", \"show_quotes_branding\", \"source_id\", \"steuernummer\", \"stripe_checkout_enabled\", \"submitted_to_vat_from\", \"subscription_plan\", \"swan_account_holder_verification_status\", \"swan_id\", \"swan_onboarding_email\", \"swan_onboarding_id\", \"trade_name\", \"url\", \"use_factor\", \"use_pl_as_white_label\", \"vat_day_of_month\", \"vat_frequency\", \"vat_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Company(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.accountant = d.accountant;\n" +
"        this.accountant_editable = d.accountant_editable;\n" +
"        this.accountants_can_bypass_freezing = d.accountants_can_bypass_freezing;\n" +
"        this.accounting_logic = d.accounting_logic;\n" +
"        this.accounting_manager_id = d.accounting_manager_id;\n" +
"        this.address = d.address;\n" +
"        this.all_onboarding_steps_completed_at = d.all_onboarding_steps_completed_at;\n" +
"        this.auto_match_invoices = d.auto_match_invoices;\n" +
"        this.auto_process_factur_x = d.auto_process_factur_x;\n" +
"        this.auto_process_invoices = d.auto_process_invoices;\n" +
"        this.billing_bank = d.billing_bank;\n" +
"        this.billing_bic = d.billing_bic;\n" +
"        this.billing_company_name = d.billing_company_name;\n" +
"        this.billing_email = d.billing_email;\n" +
"        this.billing_iban = d.billing_iban;\n" +
"        this.billing_payment_conditions = d.billing_payment_conditions;\n" +
"        this.billing_payment_options = d.billing_payment_options;\n" +
"        this.billing_telephone = d.billing_telephone;\n" +
"        this.billing_user_approved_at = d.billing_user_approved_at;\n" +
"        this.business_description = d.business_description;\n" +
"        this.cash_based_accounting = d.cash_based_accounting;\n" +
"        this.churns_on = d.churns_on;\n" +
"        this.city = d.city;\n" +
"        this.closing = d.closing;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.created_at = d.created_at;\n" +
"        this.creation_date = d.creation_date;\n" +
"        this.customer_since = d.customer_since;\n" +
"        this.default_payment_reminder_id = d.default_payment_reminder_id;\n" +
"        this.default_substance = d.default_substance;\n" +
"        this.default_vat_rate = d.default_vat_rate;\n" +
"        this.disable_pending_vat_for_customers = d.disable_pending_vat_for_customers;\n" +
"        this.display_name = d.display_name;\n" +
"        this.dms_activated = d.dms_activated;\n" +
"        this.enable_accepted_email = d.enable_accepted_email;\n" +
"        this.enable_submitted_email = d.enable_submitted_email;\n" +
"        if (\"fees_default_plan_item_id\" in d)\n" +
"            this.fees_default_plan_item_id = d.fees_default_plan_item_id;\n" +
"        this.firm = d.firm;\n" +
"        this.firm_group = d.firm_group;\n" +
"        this.firm_id = d.firm_id;\n" +
"        this.firm_related_settings = d.firm_related_settings;\n" +
"        this.fiscal_category = d.fiscal_category;\n" +
"        this.fiscal_regime = d.fiscal_regime;\n" +
"        this.fiscal_rof_vat = d.fiscal_rof_vat;\n" +
"        this.fiscalYears = d.fiscalYears;\n" +
"        this.formatted_reg_no = d.formatted_reg_no;\n" +
"        this.freeze_complete_invoices_enabled = d.freeze_complete_invoices_enabled;\n" +
"        this.frozen_since = d.frozen_since;\n" +
"        this.frozen_until = d.frozen_until;\n" +
"        this.gocardless_mandates_sync_at = d.gocardless_mandates_sync_at;\n" +
"        this.gocardless_onboarding_status = d.gocardless_onboarding_status;\n" +
"        this.gocardless_organization_id = d.gocardless_organization_id;\n" +
"        this.handelsregisternummer = d.handelsregisternummer;\n" +
"        this.has_budgetinsight = d.has_budgetinsight;\n" +
"        this.has_pro_account = d.has_pro_account;\n" +
"        this.hasAccountant = d.hasAccountant;\n" +
"        this.hasCards = d.hasCards;\n" +
"        this.hasChequeDeposits = d.hasChequeDeposits;\n" +
"        this.id = d.id;\n" +
"        this.instructions = d.instructions;\n" +
"        this.invoices_generation_from_migrations_and_ledger_events_dumps = d.invoices_generation_from_migrations_and_ledger_events_dumps;\n" +
"        this.invoicing_software = d.invoicing_software;\n" +
"        this.is_onboarding_ongoing = d.is_onboarding_ongoing;\n" +
"        this.is_revision_only = d.is_revision_only;\n" +
"        this.isConstruction = d.isConstruction;\n" +
"        this.isDemo = d.isDemo;\n" +
"        this.isFake = d.isFake;\n" +
"        this.isMasterDemo = d.isMasterDemo;\n" +
"        this.isPLSubsidiary = d.isPLSubsidiary;\n" +
"        this.isRestaurant = d.isRestaurant;\n" +
"        this.isRev = d.isRev;\n" +
"        this.isTraining = d.isTraining;\n" +
"        this.ledger_event_control_enabled = d.ledger_event_control_enabled;\n" +
"        this.legal_form_code = d.legal_form_code;\n" +
"        this.logo = d.logo;\n" +
"        this.logo_url = d.logo_url;\n" +
"        this.maxDate = d.maxDate;\n" +
"        this.minDate = d.minDate;\n" +
"        this.name = d.name;\n" +
"        this.number_of_employees = d.number_of_employees;\n" +
"        this.nUsedTagGroups = d.nUsedTagGroups;\n" +
"        this.onboarding_form_completed_at = d.onboarding_form_completed_at;\n" +
"        this.one_stop_shop = d.one_stop_shop;\n" +
"        this.payroll_solution = d.payroll_solution;\n" +
"        if (\"plan_item_number_length\" in d)\n" +
"            this.plan_item_number_length = d.plan_item_number_length;\n" +
"        this.postal_code = d.postal_code;\n" +
"        this.primary_color = d.primary_color;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.pusher_channel_access_token = d.pusher_channel_access_token;\n" +
"        this.reg_no = d.reg_no;\n" +
"        this.reseller = d.reseller;\n" +
"        this.resumption_start = d.resumption_start;\n" +
"        this.resumption_status = d.resumption_status;\n" +
"        this.saas_plan = d.saas_plan;\n" +
"        this.salesforce_business_segmentation = d.salesforce_business_segmentation;\n" +
"        this.salesforce_id = d.salesforce_id;\n" +
"        this.sepa_creditor_identifier = d.sepa_creditor_identifier;\n" +
"        this.sepa_mandates = d.sepa_mandates;\n" +
"        this.share_capital = d.share_capital;\n" +
"        this.share_capital_currency = d.share_capital_currency;\n" +
"        this.show_bank_info_on_estimates = d.show_bank_info_on_estimates;\n" +
"        this.show_pro_account = d.show_pro_account;\n" +
"        this.show_quotes_branding = d.show_quotes_branding;\n" +
"        this.source_id = d.source_id;\n" +
"        this.steuernummer = d.steuernummer;\n" +
"        this.stripe_checkout_enabled = d.stripe_checkout_enabled;\n" +
"        this.submitted_to_vat_from = d.submitted_to_vat_from;\n" +
"        this.subscription_plan = d.subscription_plan;\n" +
"        this.swan_account_holder_verification_status = d.swan_account_holder_verification_status;\n" +
"        this.swan_id = d.swan_id;\n" +
"        this.swan_onboarding_email = d.swan_onboarding_email;\n" +
"        this.swan_onboarding_id = d.swan_onboarding_id;\n" +
"        this.trade_name = d.trade_name;\n" +
"        this.url = d.url;\n" +
"        this.use_factor = d.use_factor;\n" +
"        this.use_pl_as_white_label = d.use_pl_as_white_label;\n" +
"        this.vat_day_of_month = d.vat_day_of_month;\n" +
"        this.vat_frequency = d.vat_frequency;\n" +
"        this.vat_number = d.vat_number;\n" +
"    }\n" +
"}\n" +
"class Accountant {\n" +
"    static Parse(d) {\n" +
"        return Accountant.Create(JSON.parse(d));\n" +
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
"        checkString$6(d.first_name, field + \".first_name\");\n" +
"        checkString$6(d.last_name, field + \".last_name\");\n" +
"        const knownProperties = [\"first_name\", \"last_name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Accountant(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.first_name = d.first_name;\n" +
"        this.last_name = d.last_name;\n" +
"    }\n" +
"}\n" +
"class Firm1 {\n" +
"    static Parse(d) {\n" +
"        return Firm1.Create(JSON.parse(d));\n" +
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
"        checkNumber$6(d.id, field + \".id\");\n" +
"        checkString$6(d.internal_name, field + \".internal_name\");\n" +
"        checkNull$4(d.light_logo_url, field + \".light_logo_url\");\n" +
"        checkNull$4(d.mobile_logo_url, field + \".mobile_logo_url\");\n" +
"        checkString$6(d.name, field + \".name\");\n" +
"        checkString$6(d.portal_url, field + \".portal_url\");\n" +
"        checkBoolean$5(d.white_label, field + \".white_label\");\n" +
"        const knownProperties = [\"id\", \"internal_name\", \"light_logo_url\", \"mobile_logo_url\", \"name\", \"portal_url\", \"white_label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Firm1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.internal_name = d.internal_name;\n" +
"        this.light_logo_url = d.light_logo_url;\n" +
"        this.mobile_logo_url = d.mobile_logo_url;\n" +
"        this.name = d.name;\n" +
"        this.portal_url = d.portal_url;\n" +
"        this.white_label = d.white_label;\n" +
"    }\n" +
"}\n" +
"class FirmGroup {\n" +
"    static Parse(d) {\n" +
"        return FirmGroup.Create(JSON.parse(d));\n" +
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
"        checkNumber$6(d.id, field + \".id\");\n" +
"        checkString$6(d.internal_name, field + \".internal_name\");\n" +
"        checkString$6(d.name, field + \".name\");\n" +
"        checkBoolean$5(d.standalone, field + \".standalone\");\n" +
"        const knownProperties = [\"id\", \"internal_name\", \"name\", \"standalone\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new FirmGroup(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.internal_name = d.internal_name;\n" +
"        this.name = d.name;\n" +
"        this.standalone = d.standalone;\n" +
"    }\n" +
"}\n" +
"class FirmRelatedSettings {\n" +
"    static Parse(d) {\n" +
"        return FirmRelatedSettings.Create(JSON.parse(d));\n" +
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
"        checkBoolean$5(d.ai_comptassistant_enabled, field + \".ai_comptassistant_enabled\");\n" +
"        checkBoolean$5(d.ai_enabled, field + \".ai_enabled\");\n" +
"        checkBoolean$5(d.ai_report_analysis_enabled, field + \".ai_report_analysis_enabled\");\n" +
"        if (\"ai_smart_dms_enabled\" in d) {\n" +
"            checkBoolean$5(d.ai_smart_dms_enabled, field + \".ai_smart_dms_enabled\");\n" +
"        }\n" +
"        checkBoolean$5(d.block_accountant_user_creation, field + \".block_accountant_user_creation\");\n" +
"        checkBoolean$5(d.block_company_creation, field + \".block_company_creation\");\n" +
"        checkBoolean$5(d.block_sme_user_creation, field + \".block_sme_user_creation\");\n" +
"        checkNull$4(d.cabinet_text_override, field + \".cabinet_text_override\");\n" +
"        checkNull$4(d.company_saas_plan, field + \".company_saas_plan\");\n" +
"        checkNull$4(d.comptable_text_override, field + \".comptable_text_override\");\n" +
"        checkBoolean$5(d.customized_first_steps_enabled, field + \".customized_first_steps_enabled\");\n" +
"        checkBoolean$5(d.hide_pro_account, field + \".hide_pro_account\");\n" +
"        checkBoolean$5(d.show_accountant_tab, field + \".show_accountant_tab\");\n" +
"        checkBoolean$5(d.show_onboarding_video, field + \".show_onboarding_video\");\n" +
"        const knownProperties = [\"ai_comptassistant_enabled\", \"ai_enabled\", \"ai_report_analysis_enabled\", \"ai_smart_dms_enabled\", \"block_accountant_user_creation\", \"block_company_creation\", \"block_sme_user_creation\", \"cabinet_text_override\", \"company_saas_plan\", \"comptable_text_override\", \"customized_first_steps_enabled\", \"hide_pro_account\", \"show_accountant_tab\", \"show_onboarding_video\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new FirmRelatedSettings(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.ai_comptassistant_enabled = d.ai_comptassistant_enabled;\n" +
"        this.ai_enabled = d.ai_enabled;\n" +
"        this.ai_report_analysis_enabled = d.ai_report_analysis_enabled;\n" +
"        if (\"ai_smart_dms_enabled\" in d)\n" +
"            this.ai_smart_dms_enabled = d.ai_smart_dms_enabled;\n" +
"        this.block_accountant_user_creation = d.block_accountant_user_creation;\n" +
"        this.block_company_creation = d.block_company_creation;\n" +
"        this.block_sme_user_creation = d.block_sme_user_creation;\n" +
"        this.cabinet_text_override = d.cabinet_text_override;\n" +
"        this.company_saas_plan = d.company_saas_plan;\n" +
"        this.comptable_text_override = d.comptable_text_override;\n" +
"        this.customized_first_steps_enabled = d.customized_first_steps_enabled;\n" +
"        this.hide_pro_account = d.hide_pro_account;\n" +
"        this.show_accountant_tab = d.show_accountant_tab;\n" +
"        this.show_onboarding_video = d.show_onboarding_video;\n" +
"    }\n" +
"}\n" +
"class FiscalYearsEntityOrTodayFiscalYear {\n" +
"    static Parse(d) {\n" +
"        return FiscalYearsEntityOrTodayFiscalYear.Create(JSON.parse(d));\n" +
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
"        checkString$6(d.carryover_generation_status, field + \".carryover_generation_status\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$4(d.carryover_id, field + \".carryover_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$6(d.carryover_id, field + \".carryover_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$6(d.closed_at, field + \".closed_at\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$4(d.closed_at, field + \".closed_at\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$6(d.finish, field + \".finish\");\n" +
"        checkNumber$6(d.id, field + \".id\");\n" +
"        checkString$6(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkString$6(d.start, field + \".start\");\n" +
"        checkString$6(d.status, field + \".status\");\n" +
"        checkString$6(d.validation_status, field + \".validation_status\");\n" +
"        const knownProperties = [\"carryover_generation_status\", \"carryover_id\", \"closed_at\", \"finish\", \"id\", \"pusher_channel\", \"start\", \"status\", \"validation_status\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new FiscalYearsEntityOrTodayFiscalYear(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.carryover_generation_status = d.carryover_generation_status;\n" +
"        this.carryover_id = d.carryover_id;\n" +
"        this.closed_at = d.closed_at;\n" +
"        this.finish = d.finish;\n" +
"        this.id = d.id;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.start = d.start;\n" +
"        this.status = d.status;\n" +
"        this.validation_status = d.validation_status;\n" +
"    }\n" +
"}\n" +
"class CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity {\n" +
"    static Parse(d) {\n" +
"        return CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity.Create(JSON.parse(d));\n" +
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
"        checkString$6(d.action, field + \".action\");\n" +
"        checkArray$1(d.subject, field + \".subject\");\n" +
"        if (d.subject) {\n" +
"            for (let i = 0; i < d.subject.length; i++) {\n" +
"                checkString$6(d.subject[i], field + \".subject\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"action\", \"subject\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new CompanyFeaturesAbilityEntityOrUserFeaturesAbilityEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.action = d.action;\n" +
"        this.subject = d.subject;\n" +
"    }\n" +
"}\n" +
"class Firm {\n" +
"    static Parse(d) {\n" +
"        return Firm.Create(JSON.parse(d));\n" +
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
"        checkBoolean$5(d.grant_subsidiaries_access_to_all_companies, field + \".grant_subsidiaries_access_to_all_companies\");\n" +
"        checkNumber$6(d.id, field + \".id\");\n" +
"        checkString$6(d.internalName, field + \".internalName\");\n" +
"        checkBoolean$5(d.isUserInvitationButtonHidden, field + \".isUserInvitationButtonHidden\");\n" +
"        checkString$6(d.name, field + \".name\");\n" +
"        checkNull$4(d.own_company_id, field + \".own_company_id\");\n" +
"        checkBoolean$5(d.white_label, field + \".white_label\");\n" +
"        const knownProperties = [\"grant_subsidiaries_access_to_all_companies\", \"id\", \"internalName\", \"isUserInvitationButtonHidden\", \"name\", \"own_company_id\", \"white_label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Firm(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.grant_subsidiaries_access_to_all_companies = d.grant_subsidiaries_access_to_all_companies;\n" +
"        this.id = d.id;\n" +
"        this.internalName = d.internalName;\n" +
"        this.isUserInvitationButtonHidden = d.isUserInvitationButtonHidden;\n" +
"        this.name = d.name;\n" +
"        this.own_company_id = d.own_company_id;\n" +
"        this.white_label = d.white_label;\n" +
"    }\n" +
"}\n" +
"class TodayFiscalYear {\n" +
"    static Parse(d) {\n" +
"        return TodayFiscalYear.Create(JSON.parse(d));\n" +
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
"        checkString$6(d.carryover_generation_status, field + \".carryover_generation_status\");\n" +
"        checkNull$4(d.carryover_id, field + \".carryover_id\");\n" +
"        checkNull$4(d.closed_at, field + \".closed_at\");\n" +
"        checkString$6(d.finish, field + \".finish\");\n" +
"        checkNumber$6(d.id, field + \".id\");\n" +
"        checkString$6(d.pusher_channel, field + \".pusher_channel\");\n" +
"        checkString$6(d.start, field + \".start\");\n" +
"        checkString$6(d.status, field + \".status\");\n" +
"        checkString$6(d.validation_status, field + \".validation_status\");\n" +
"        const knownProperties = [\"carryover_generation_status\", \"carryover_id\", \"closed_at\", \"finish\", \"id\", \"pusher_channel\", \"start\", \"status\", \"validation_status\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new TodayFiscalYear(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.carryover_generation_status = d.carryover_generation_status;\n" +
"        this.carryover_id = d.carryover_id;\n" +
"        this.closed_at = d.closed_at;\n" +
"        this.finish = d.finish;\n" +
"        this.id = d.id;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.start = d.start;\n" +
"        this.status = d.status;\n" +
"        this.validation_status = d.validation_status;\n" +
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
"function checkArray$1(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$6(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$6(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$6(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$5(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$6(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$6(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$6(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$4(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$6(field, value, multiple ?? \"null\");\n" +
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
"async function getCompanyContext(maxAge) {\n" +
"    const data = await cachedRequest(\"getCompanyContext\", null, async () => {\n" +
"        const response = await apiRequest(\"context\", null, \"GET\");\n" +
"        return response.json();\n" +
"    }, maxAge);\n" +
"    return APIGlobalContext.Create(data);\n" +
"}\n" +
"async function getExercise(year, maxAge) {\n" +
"    const context = await getCompanyContext(maxAge);\n" +
"    return context.company.fiscalYears.find((fy) => fy.start.startsWith(year.toString()));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$5 = null;\n" +
"class APIJournal {\n" +
"    static Parse(d) {\n" +
"        return APIJournal.Create(JSON.parse(d));\n" +
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
"        checkString$5(d.code, field + \".code\");\n" +
"        checkNumber$5(d.id, field + \".id\");\n" +
"        checkString$5(d.journal_type, field + \".journal_type\");\n" +
"        checkString$5(d.label, field + \".label\");\n" +
"        const knownProperties = [\"code\", \"id\", \"journal_type\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIJournal(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.code = d.code;\n" +
"        this.id = d.id;\n" +
"        this.journal_type = d.journal_type;\n" +
"        this.label = d.label;\n" +
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
"function checkNumber$5(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$5(field, value, \"number\");\n" +
"}\n" +
"function checkString$5(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$5(field, value, \"string\");\n" +
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
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$4 = null;\n" +
"class APIGroupedDocument {\n" +
"    static Parse(d) {\n" +
"        return APIGroupedDocument.Create(JSON.parse(d));\n" +
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
"        checkString$4(d.amount, field + \".amount\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$3(d.date, field + \".date\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$4(d.date, field + \".date\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$4(d.fec_pieceref, field + \".fec_pieceref\");\n" +
"        checkNumber$4(d.id, field + \".id\");\n" +
"        checkBoolean$4(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        d.journal = Journal$1.Create(d.journal, field + \".journal\");\n" +
"        checkNumber$4(d.journal_id, field + \".journal_id\");\n" +
"        checkString$4(d.label, field + \".label\");\n" +
"        checkNumber$4(d.ledgerEventsCount, field + \".ledgerEventsCount\");\n" +
"        checkBoolean$4(d.readonly, field + \".readonly\");\n" +
"        checkString$4(d.source, field + \".source\");\n" +
"        if (\"taggingCount\" in d) {\n" +
"            checkNumber$4(d.taggingCount, field + \".taggingCount\");\n" +
"        }\n" +
"        checkString$4(d.totalCredit, field + \".totalCredit\");\n" +
"        checkString$4(d.totalDebit, field + \".totalDebit\");\n" +
"        checkString$4(d.type, field + \".type\");\n" +
"        const knownProperties = [\"amount\", \"date\", \"fec_pieceref\", \"id\", \"is_waiting_details\", \"journal\", \"journal_id\", \"label\", \"ledgerEventsCount\", \"readonly\", \"source\", \"taggingCount\", \"totalCredit\", \"totalDebit\", \"type\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"let Journal$1 = class Journal {\n" +
"    static Parse(d) {\n" +
"        return Journal.Create(JSON.parse(d));\n" +
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
"        checkString$4(d.code, field + \".code\");\n" +
"        checkNumber$4(d.id, field + \".id\");\n" +
"        checkString$4(d.label, field + \".label\");\n" +
"        const knownProperties = [\"code\", \"id\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Journal(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.code = d.code;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$4(field, value, multiple) {\n" +
"    return errorHelper$4(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$4(field, value, multiple) {\n" +
"    return errorHelper$4(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$4(field, value, multiple) {\n" +
"    return errorHelper$4(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$4(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$4(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$4(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$4(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$4(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$4(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$3(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$4(field, value, multiple);\n" +
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
"class APILedgerEvent {\n" +
"    static Parse(d) {\n" +
"        return APILedgerEvent.Create(JSON.parse(d));\n" +
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
"        checkString$3(d.amount, field + \".amount\");\n" +
"        checkString$3(d.balance, field + \".balance\");\n" +
"        checkBoolean$3(d.closed, field + \".closed\");\n" +
"        checkString$3(d.credit, field + \".credit\");\n" +
"        checkString$3(d.debit, field + \".debit\");\n" +
"        checkNumber$3(d.id, field + \".id\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$2(d.label, field + \".label\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$3(d.label, field + \".label\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$2(d.lettering, field + \".lettering\", \"null | Lettering\");\n" +
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
"            checkNull$2(d.lettering_id, field + \".lettering_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$3(d.lettering_id, field + \".lettering_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkNumber$3(d.plan_item_id, field + \".plan_item_id\");\n" +
"        d.planItem = PlanItem$1.Create(d.planItem, field + \".planItem\");\n" +
"        checkBoolean$3(d.readonly, field + \".readonly\");\n" +
"        checkBoolean$3(d.readonlyAmounts, field + \".readonlyAmounts\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$2(d.reconciliation_id, field + \".reconciliation_id\", \"null | number\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNumber$3(d.reconciliation_id, field + \".reconciliation_id\", \"null | number\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkString$3(d.source, field + \".source\");\n" +
"        const knownProperties = [\"amount\", \"balance\", \"closed\", \"credit\", \"debit\", \"id\", \"label\", \"lettering\", \"lettering_id\", \"plan_item_id\", \"planItem\", \"readonly\", \"readonlyAmounts\", \"reconciliation_id\", \"source\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$3(d.balance, field + \".balance\");\n" +
"        checkNumber$3(d.id, field + \".id\");\n" +
"        checkString$3(d.max_date, field + \".max_date\");\n" +
"        checkString$3(d.min_date, field + \".min_date\");\n" +
"        checkString$3(d.plan_item_number, field + \".plan_item_number\");\n" +
"        const knownProperties = [\"balance\", \"id\", \"max_date\", \"min_date\", \"plan_item_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$3(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$3(d.enabled, field + \".enabled\");\n" +
"        checkNumber$3(d.id, field + \".id\");\n" +
"        checkString$3(d.label, field + \".label\");\n" +
"        checkString$3(d.number, field + \".number\");\n" +
"        checkString$3(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"country_alpha2\", \"enabled\", \"id\", \"label\", \"number\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull$3(field, value, multiple) {\n" +
"    return errorHelper$3(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject$3(field, value, multiple) {\n" +
"    return errorHelper$3(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray$3(field, value, multiple) {\n" +
"    return errorHelper$3(field, value, \"object\");\n" +
"}\n" +
"function checkNumber$3(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$3(field, value, multiple ?? \"number\");\n" +
"}\n" +
"function checkBoolean$3(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$3(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$3(value, field, multiple) {\n" +
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
"class APIOperation {\n" +
"    static Parse(d) {\n" +
"        return APIOperation.Create(JSON.parse(d));\n" +
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
"        checkString$2(d.amount, field + \".amount\");\n" +
"        checkString$2(d.date, field + \".date\");\n" +
"        checkString$2(d.fec_pieceref, field + \".fec_pieceref\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        checkBoolean$2(d.is_waiting_details, field + \".is_waiting_details\");\n" +
"        d.journal = Journal.Create(d.journal, field + \".journal\");\n" +
"        checkNumber$2(d.journal_id, field + \".journal_id\");\n" +
"        checkString$2(d.label, field + \".label\");\n" +
"        checkNumber$2(d.ledgerEventsCount, field + \".ledgerEventsCount\");\n" +
"        checkBoolean$2(d.readonly, field + \".readonly\");\n" +
"        checkString$2(d.source, field + \".source\");\n" +
"        checkNumber$2(d.taggingCount, field + \".taggingCount\");\n" +
"        checkString$2(d.totalCredit, field + \".totalCredit\");\n" +
"        checkString$2(d.totalDebit, field + \".totalDebit\");\n" +
"        checkString$2(d.type, field + \".type\");\n" +
"        const knownProperties = [\"amount\", \"date\", \"fec_pieceref\", \"id\", \"is_waiting_details\", \"journal\", \"journal_id\", \"label\", \"ledgerEventsCount\", \"readonly\", \"source\", \"taggingCount\", \"totalCredit\", \"totalDebit\", \"type\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$2(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIOperation(d);\n" +
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
"        this.taggingCount = d.taggingCount;\n" +
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
"        checkString$2(d.code, field + \".code\");\n" +
"        checkNumber$2(d.id, field + \".id\");\n" +
"        checkString$2(d.label, field + \".label\");\n" +
"        const knownProperties = [\"code\", \"id\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$2(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Journal(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.code = d.code;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
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
"function checkNumber$2(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$2(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$2(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$2(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$2(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$2(field, value, \"string\");\n" +
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
"const logger$1 = new Logger(\"Operation\");\n" +
"async function getLedgerEvents(id, maxAge) {\n" +
"    const data = await cachedRequest(\"operation:getLedgerEvents\", { id }, async ({ id }) => {\n" +
"        const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, \"GET\");\n" +
"        if (!response) {\n" +
"            logger$1.error(`Unable to load ledger events for ${id}`);\n" +
"            return [];\n" +
"        }\n" +
"        return await response.json();\n" +
"    }, maxAge);\n" +
"    return data.map((item) => APILedgerEvent.Create(item));\n" +
"}\n" +
"async function getGroupedDocuments(id, maxAge) {\n" +
"    if (!Number.isSafeInteger(id) || !id) {\n" +
"        logger$1.error(\"getGroupedDocuments: `id` MUST be an integer\", { id });\n" +
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
"        logger$1.error(`Unable to load grouped documents for ${id}`);\n" +
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
"async function getOperation(id, maxAge) {\n" +
"    const data = await cachedRequest(\"operation:getOperation\", { id }, async ({ id }) => {\n" +
"        const response = await apiRequest(`accountants/operations/${id}`, null, \"GET\");\n" +
"        if (!response) {\n" +
"            logger$1.error(`Unable to load operation for ${id}`);\n" +
"            return null;\n" +
"        }\n" +
"        return await response.json();\n" +
"    }, maxAge);\n" +
"    return APIOperation.Create(data);\n" +
"}\n" +
"\n" +
"async function getJournal(id, maxAge) {\n" +
"    const data = await cachedRequest(\"journal:getJournal\", { id }, async ({ id }) => {\n" +
"        const response = await apiRequest(`journals/${id}`, null, \"GET\");\n" +
"        return await response?.json();\n" +
"    }, maxAge);\n" +
"    if (!data)\n" +
"        return null;\n" +
"    return APIJournal.Create(data);\n" +
"}\n" +
"async function getDocumentJournal(id, maxAge) {\n" +
"    const operation = await getOperation(id, maxAge);\n" +
"    if (!operation)\n" +
"        return null;\n" +
"    return operation.journal ?? (await getJournal(operation.journal_id, maxAge));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj$1 = null;\n" +
"class APIThirdparty {\n" +
"    static Parse(d) {\n" +
"        return APIThirdparty.Create(JSON.parse(d));\n" +
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
"        if (\"customer\" in d) {\n" +
"            d.customer = Customer.Create(d.customer, field + \".customer\");\n" +
"        }\n" +
"        if (\"supplier\" in d) {\n" +
"            d.supplier = Supplier.Create(d.supplier, field + \".supplier\");\n" +
"        }\n" +
"        const knownProperties = [\"customer\", \"supplier\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkString$1(d.address, field + \".address\");\n" +
"        checkString$1(d.address_additional_info, field + \".address_additional_info\");\n" +
"        if (\"auto_process_invoices\" in d) {\n" +
"            checkBoolean$1(d.auto_process_invoices, field + \".auto_process_invoices\");\n" +
"        }\n" +
"        checkNull$1(d.billing_bank, field + \".billing_bank\");\n" +
"        checkNull$1(d.billing_bic, field + \".billing_bic\");\n" +
"        checkNull$1(d.billing_footer_invoice, field + \".billing_footer_invoice\");\n" +
"        checkNull$1(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        checkNull$1(d.billing_iban, field + \".billing_iban\");\n" +
"        checkString$1(d.billing_language, field + \".billing_language\");\n" +
"        checkString$1(d.city, field + \".city\");\n" +
"        checkNumber$1(d.company_id, field + \".company_id\");\n" +
"        checkString$1(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkNull$1(d.current_mandate, field + \".current_mandate\");\n" +
"        checkString$1(d.customer_type, field + \".customer_type\");\n" +
"        checkString$1(d.delivery_address, field + \".delivery_address\");\n" +
"        checkString$1(d.delivery_address_additional_info, field + \".delivery_address_additional_info\");\n" +
"        checkString$1(d.delivery_city, field + \".delivery_city\");\n" +
"        checkString$1(d[\"delivery_country_alpha2\"], field + \".delivery_country_alpha2\");\n" +
"        checkString$1(d.delivery_postal_code, field + \".delivery_postal_code\");\n" +
"        checkBoolean$1(d.disable_pending_vat, field + \".disable_pending_vat\");\n" +
"        checkArray(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNever(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$1(d.first_name, field + \".first_name\");\n" +
"        checkBoolean$1(d.force_pending_vat, field + \".force_pending_vat\");\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkBoolean$1(d.invoices_auto_generated, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$1(d.invoices_auto_validated, field + \".invoices_auto_validated\");\n" +
"        checkString$1(d.last_name, field + \".last_name\");\n" +
"        checkString$1(d.name, field + \".name\");\n" +
"        checkString$1(d.notes, field + \".notes\");\n" +
"        checkNull$1(d.notes_comment, field + \".notes_comment\");\n" +
"        checkString$1(d.payment_conditions, field + \".payment_conditions\");\n" +
"        checkString$1(d.phone, field + \".phone\");\n" +
"        d.plan_item = PlanItem.Create(d.plan_item, field + \".plan_item\");\n" +
"        checkString$1(d.postal_code, field + \".postal_code\");\n" +
"        checkBoolean$1(d.received_a_mandate_request, field + \".received_a_mandate_request\");\n" +
"        checkString$1(d.recipient, field + \".recipient\");\n" +
"        checkString$1(d.reference, field + \".reference\");\n" +
"        checkString$1(d.reg_no, field + \".reg_no\");\n" +
"        checkArray(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$1(d.search_terms[i], field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$1(d.sepa_mandate, field + \".sepa_mandate\");\n" +
"        checkString$1(d.source_id, field + \".source_id\");\n" +
"        checkArray(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                checkNever(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray(d.thirdparties_tags, field + \".thirdparties_tags\");\n" +
"        if (d.thirdparties_tags) {\n" +
"            for (let i = 0; i < d.thirdparties_tags.length; i++) {\n" +
"                checkNever(d.thirdparties_tags[i], field + \".thirdparties_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray(d.thirdparty_contacts, field + \".thirdparty_contacts\");\n" +
"        if (d.thirdparty_contacts) {\n" +
"            for (let i = 0; i < d.thirdparty_contacts.length; i++) {\n" +
"                checkNever(d.thirdparty_contacts[i], field + \".thirdparty_contacts\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray(d.thirdparty_invoice_line_rules, field + \".thirdparty_invoice_line_rules\");\n" +
"        if (d.thirdparty_invoice_line_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {\n" +
"                d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity.Create(d.thirdparty_invoice_line_rules[i], field + \".thirdparty_invoice_line_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$1(d.vat_number, field + \".vat_number\");\n" +
"        const knownProperties = [\"address\", \"address_additional_info\", \"auto_process_invoices\", \"billing_bank\", \"billing_bic\", \"billing_footer_invoice\", \"billing_footer_invoice_id\", \"billing_iban\", \"billing_language\", \"city\", \"company_id\", \"country_alpha2\", \"current_mandate\", \"customer_type\", \"delivery_address\", \"delivery_address_additional_info\", \"delivery_city\", \"delivery_country_alpha2\", \"delivery_postal_code\", \"disable_pending_vat\", \"emails\", \"first_name\", \"force_pending_vat\", \"id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"last_name\", \"name\", \"notes\", \"notes_comment\", \"payment_conditions\", \"phone\", \"plan_item\", \"postal_code\", \"received_a_mandate_request\", \"recipient\", \"reference\", \"reg_no\", \"search_terms\", \"sepa_mandate\", \"source_id\", \"tags\", \"thirdparties_tags\", \"thirdparty_contacts\", \"thirdparty_invoice_line_rules\", \"vat_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Customer(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.address = d.address;\n" +
"        this.address_additional_info = d.address_additional_info;\n" +
"        if (\"auto_process_invoices\" in d)\n" +
"            this.auto_process_invoices = d.auto_process_invoices;\n" +
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
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$1(d.number, field + \".number\");\n" +
"        const knownProperties = [\"id\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkString$1(d.vat_rate, field + \".vat_rate\");\n" +
"        const knownProperties = [\"pnl_plan_item\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ThirdpartyInvoiceLineRulesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
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
"        checkBoolean$1(d.enabled, field + \".enabled\");\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$1(d.label, field + \".label\");\n" +
"        checkString$1(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new PnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.enabled = d.enabled;\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"}\n" +
"class Supplier {\n" +
"    static Parse(d) {\n" +
"        return Supplier.Create(JSON.parse(d));\n" +
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
"        checkString$1(d.activity_nomenclature, field + \".activity_nomenclature\");\n" +
"        checkString$1(d.address, field + \".address\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$1(d.admin_city_code, field + \".admin_city_code\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$1(d.admin_city_code, field + \".admin_city_code\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"auto_process_invoices\" in d) {\n" +
"            checkBoolean$1(d.auto_process_invoices, field + \".auto_process_invoices\");\n" +
"        }\n" +
"        checkString$1(d.city, field + \".city\");\n" +
"        if (\"company_auto_process_invoices\" in d) {\n" +
"            checkBoolean$1(d.company_auto_process_invoices, field + \".company_auto_process_invoices\");\n" +
"        }\n" +
"        checkNumber$1(d.company_id, field + \".company_id\");\n" +
"        checkString$1(d[\"country_alpha2\"], field + \".country_alpha2\");\n" +
"        checkBoolean$1(d.disable_pending_vat, field + \".disable_pending_vat\");\n" +
"        checkArray(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNever(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$1(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkString$1(d.establishment_no, field + \".establishment_no\", \"null | string\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$1(d.force_pending_vat, field + \".force_pending_vat\");\n" +
"        checkString$1(d.iban, field + \".iban\");\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkNull$1(d.iban_last_update, field + \".iban_last_update\", \"null | IbanLastUpdate\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                d.iban_last_update = IbanLastUpdate.Create(d.iban_last_update, field + \".iban_last_update\", \"null | IbanLastUpdate\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        if (\"iban_proof\" in d) {\n" +
"            checkNull$1(d.iban_proof, field + \".iban_proof\");\n" +
"        }\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkBoolean$1(d.invoices_auto_generated, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$1(d.invoices_auto_validated, field + \".invoices_auto_validated\");\n" +
"        checkString$1(d.name, field + \".name\");\n" +
"        checkString$1(d.notes, field + \".notes\");\n" +
"        checkNull$1(d.notes_comment, field + \".notes_comment\");\n" +
"        d.plan_item = PlanItem1.Create(d.plan_item, field + \".plan_item\");\n" +
"        checkString$1(d.postal_code, field + \".postal_code\");\n" +
"        checkArray(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$1(d.search_terms[i], field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$1(d.supplier_due_date_delay, field + \".supplier_due_date_delay\");\n" +
"        checkString$1(d.supplier_due_date_rule, field + \".supplier_due_date_rule\");\n" +
"        checkNull$1(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        checkArray(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                d.tags[i] = TagsEntityOrTag.Create(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray(d.thirdparties_tags, field + \".thirdparties_tags\");\n" +
"        if (d.thirdparties_tags) {\n" +
"            for (let i = 0; i < d.thirdparties_tags.length; i++) {\n" +
"                d.thirdparties_tags[i] = ThirdpartiesTagsEntity.Create(d.thirdparties_tags[i], field + \".thirdparties_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray(d.thirdparty_invoice_line_rules, field + \".thirdparty_invoice_line_rules\");\n" +
"        if (d.thirdparty_invoice_line_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {\n" +
"                d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity1.Create(d.thirdparty_invoice_line_rules[i], field + \".thirdparty_invoice_line_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray(d.thirdparty_visibility_rules, field + \".thirdparty_visibility_rules\");\n" +
"        if (d.thirdparty_visibility_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_visibility_rules.length; i++) {\n" +
"                d.thirdparty_visibility_rules[i] = ThirdpartyVisibilityRulesEntity.Create(d.thirdparty_visibility_rules[i], field + \".thirdparty_visibility_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        if (\"validation_status\" in d) {\n" +
"            checkString$1(d.validation_status, field + \".validation_status\");\n" +
"        }\n" +
"        checkString$1(d.vat_number, field + \".vat_number\");\n" +
"        const knownProperties = [\"activity_nomenclature\", \"address\", \"admin_city_code\", \"auto_process_invoices\", \"city\", \"company_auto_process_invoices\", \"company_id\", \"country_alpha2\", \"disable_pending_vat\", \"emails\", \"establishment_no\", \"force_pending_vat\", \"iban\", \"iban_last_update\", \"iban_proof\", \"id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"name\", \"notes\", \"notes_comment\", \"plan_item\", \"postal_code\", \"search_terms\", \"supplier_due_date_delay\", \"supplier_due_date_rule\", \"supplier_payment_method\", \"tags\", \"thirdparties_tags\", \"thirdparty_invoice_line_rules\", \"thirdparty_visibility_rules\", \"validation_status\", \"vat_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Supplier(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.activity_nomenclature = d.activity_nomenclature;\n" +
"        this.address = d.address;\n" +
"        this.admin_city_code = d.admin_city_code;\n" +
"        if (\"auto_process_invoices\" in d)\n" +
"            this.auto_process_invoices = d.auto_process_invoices;\n" +
"        this.city = d.city;\n" +
"        if (\"company_auto_process_invoices\" in d)\n" +
"            this.company_auto_process_invoices = d.company_auto_process_invoices;\n" +
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
"        checkString$1(d.at, field + \".at\");\n" +
"        checkBoolean$1(d.from_pennylane, field + \".from_pennylane\");\n" +
"        checkString$1(d.name, field + \".name\");\n" +
"        const knownProperties = [\"at\", \"from_pennylane\", \"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$1(d.number, field + \".number\");\n" +
"        const knownProperties = [\"id\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"color\" in d) {\n" +
"            checkString$1(d.color, field + \".color\");\n" +
"        }\n" +
"        d.group = Group.Create(d.group, field + \".group\");\n" +
"        checkNumber$1(d.group_id, field + \".group_id\");\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$1(d.label, field + \".label\");\n" +
"        const knownProperties = [\"color\", \"group\", \"group_id\", \"id\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"class Group {\n" +
"    static Parse(d) {\n" +
"        return Group.Create(JSON.parse(d));\n" +
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
"        checkString$1(d.label, field + \".label\");\n" +
"        checkBoolean$1(d.self_service_accounting, field + \".self_service_accounting\");\n" +
"        const knownProperties = [\"label\", \"self_service_accounting\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new Group(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.label = d.label;\n" +
"        this.self_service_accounting = d.self_service_accounting;\n" +
"    }\n" +
"}\n" +
"class ThirdpartiesTagsEntity {\n" +
"    static Parse(d) {\n" +
"        return ThirdpartiesTagsEntity.Create(JSON.parse(d));\n" +
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
"        checkNumber$1(d.id, field + \".id\");\n" +
"        d.tag = TagsEntityOrTag1.Create(d.tag, field + \".tag\");\n" +
"        checkString$1(d.weight, field + \".weight\");\n" +
"        const knownProperties = [\"id\", \"tag\", \"weight\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        if (\"color\" in d) {\n" +
"            checkString$1(d.color, field + \".color\");\n" +
"        }\n" +
"        d.group = Group.Create(d.group, field + \".group\");\n" +
"        checkNumber$1(d.group_id, field + \".group_id\");\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$1(d.label, field + \".label\");\n" +
"        const knownProperties = [\"color\", \"group\", \"group_id\", \"id\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            d.pnl_plan_item = PnlPlanItem1.Create(d.pnl_plan_item, field + \".pnl_plan_item\", \"PnlPlanItem1 | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$1(d.pnl_plan_item, field + \".pnl_plan_item\", \"PnlPlanItem1 | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        // This will be refactored in the next release.\n" +
"        try {\n" +
"            checkString$1(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"        }\n" +
"        catch (e) {\n" +
"            try {\n" +
"                checkNull$1(d.vat_rate, field + \".vat_rate\", \"string | null\");\n" +
"            }\n" +
"            catch (e) {\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"pnl_plan_item\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkBoolean$1(d.enabled, field + \".enabled\");\n" +
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$1(d.label, field + \".label\");\n" +
"        checkString$1(d.number, field + \".number\");\n" +
"        const knownProperties = [\"enabled\", \"id\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"        checkNumber$1(d.id, field + \".id\");\n" +
"        checkString$1(d.visible_on, field + \".visible_on\");\n" +
"        const knownProperties = [\"id\", \"visible_on\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new ThirdpartyVisibilityRulesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.visible_on = d.visible_on;\n" +
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
"function checkArray(value, field, multiple) {\n" +
"    if (!Array.isArray(value))\n" +
"        errorHelper$1(field, value, \"array\");\n" +
"}\n" +
"function checkNumber$1(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper$1(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean$1(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper$1(field, value, \"boolean\");\n" +
"}\n" +
"function checkString$1(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper$1(field, value, multiple ?? \"string\");\n" +
"}\n" +
"function checkNull$1(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper$1(field, value, multiple ?? \"null\");\n" +
"}\n" +
"function checkNever(value, field, multiple) {\n" +
"    return errorHelper$1(field, value, \"never\");\n" +
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
"/**\n" +
" * @param id The ID of the supplier or customer\n" +
" */\n" +
"async function getThirdparty(id) {\n" +
"    if (!id)\n" +
"        throw new Error(`id is mandatory \"${id}\" given`);\n" +
"    const response = await apiRequest(`thirdparties/${id}`, null, 'GET');\n" +
"    const json = await response?.json();\n" +
"    if (!json)\n" +
"        return json;\n" +
"    const data = APIThirdparty.Create(json);\n" +
"    const [direction, thirdparty] = Object.entries(data)[0];\n" +
"    return { direction, thirdparty };\n" +
"}\n" +
"\n" +
"function isDocumentType(value) {\n" +
"    return [\"transaction\", \"invoice\"].includes(value);\n" +
"}\n" +
"function isTypedDocument(value) {\n" +
"    return (value &&\n" +
"        \"object\" === typeof value &&\n" +
"        \"type\" in value &&\n" +
"        \"string\" === typeof value.type &&\n" +
"        isDocumentType(value.type.toLowerCase()));\n" +
"}\n" +
"const DocumentCache = new Map();\n" +
"let Document$1 = class Document extends Logger {\n" +
"    constructor({ id, ...raw }, factory) {\n" +
"        super();\n" +
"        this.factory = factory;\n" +
"        if (!Number.isSafeInteger(id)) {\n" +
"            this.log(\"constructor\", { id, args: arguments });\n" +
"            throw new Error(\"`id` MUST be an integer\");\n" +
"        }\n" +
"        this.id = id;\n" +
"        if (isTypedDocument(raw))\n" +
"            this.type = raw.type.toLowerCase();\n" +
"        DocumentCache.set(id, this);\n" +
"    }\n" +
"    /**\n" +
"     * Get a document by id, all documents are cached for performance\n" +
"     */\n" +
"    static get(raw, factory) {\n" +
"        if (!DocumentCache.has(raw.id)) {\n" +
"            return new Document(raw, factory);\n" +
"        }\n" +
"        return DocumentCache.get(raw.id);\n" +
"    }\n" +
"    /**\n" +
"     * Update a document from an APIGroupedDocument\n" +
"     */\n" +
"    static fromAPIGroupedDocument(apigdoc, factory) {\n" +
"        const doc = Document.get({ id: apigdoc.id }, factory);\n" +
"        doc.gDocument = apigdoc;\n" +
"        doc.type = apigdoc.type === \"Invoice\" ? \"invoice\" : \"transaction\";\n" +
"        return doc;\n" +
"    }\n" +
"    async getDocument(maxAge) {\n" +
"        if (!this.document || typeof maxAge === \"number\") {\n" +
"            this.document = getDocument(this.id, maxAge);\n" +
"            this.document = await this.document;\n" +
"        }\n" +
"        return await this.document;\n" +
"    }\n" +
"    async getFullDocument(maxAge) {\n" +
"        return getFullDocument(this.id, maxAge);\n" +
"    }\n" +
"    async getLabel(maxAge) {\n" +
"        return (await this.getFullDocument(maxAge)).label;\n" +
"    }\n" +
"    async getGdoc() {\n" +
"        if (this.gDocument)\n" +
"            return this.gDocument;\n" +
"        return this.getDocument();\n" +
"    }\n" +
"    async getJournal(maxAge) {\n" +
"        return getDocumentJournal(this.id, maxAge);\n" +
"    }\n" +
"    async getOperation() {\n" +
"        if (!this.operation) {\n" +
"            this.operation = getOperation(this.id);\n" +
"            this.operation = await this.operation;\n" +
"        }\n" +
"        return await this.operation;\n" +
"    }\n" +
"    async getLedgerEvents(maxAge) {\n" +
"        if (!this.ledgerEvents || typeof maxAge === \"number\") {\n" +
"            this.ledgerEvents = new Promise(async (resolve) => {\n" +
"                const groupedDocuments = await this.getGroupedDocuments(maxAge);\n" +
"                const events = await Promise.all(groupedDocuments.map((doc) => getLedgerEvents(doc.id, maxAge)));\n" +
"                this.ledgerEvents = [].concat(...events);\n" +
"                resolve(this.ledgerEvents);\n" +
"            });\n" +
"        }\n" +
"        return await this.ledgerEvents;\n" +
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
"    async isFrozen() {\n" +
"        const doc = await this.getFullDocument();\n" +
"        const exercise = await getExercise(parseInt(doc.date.slice(0, 4)));\n" +
"        return [\"frozen\", \"closed\"].includes(exercise.status);\n" +
"    }\n" +
"    async archive(unarchive = false) {\n" +
"        return await archiveDocument(this.id, unarchive);\n" +
"    }\n" +
"    async unarchive() {\n" +
"        return await this.archive(true);\n" +
"    }\n" +
"    async getGroupedDocuments(maxAge) {\n" +
"        if (!this.groupedDocuments || typeof maxAge === \"number\") {\n" +
"            this.groupedDocuments = new Promise(async (resolve) => {\n" +
"                const mainDocument = await this.getDocument(maxAge);\n" +
"                if (!mainDocument) {\n" +
"                    this.error(`Document introuvable ${this.id}`);\n" +
"                    resolve([]);\n" +
"                    return;\n" +
"                }\n" +
"                const otherDocuments = (await getGroupedDocuments(this.id, maxAge)).map((doc) => Document.fromAPIGroupedDocument(doc, this.factory));\n" +
"                this.groupedDocuments = [...otherDocuments, this];\n" +
"                resolve(this.groupedDocuments);\n" +
"            });\n" +
"        }\n" +
"        return await this.groupedDocuments;\n" +
"    }\n" +
"    async getThirdparty() {\n" +
"        if (!this.thirdparty)\n" +
"            this.thirdparty = this._getThirdparty();\n" +
"        return (await this.thirdparty)?.thirdparty;\n" +
"    }\n" +
"    async _getThirdparty() {\n" +
"        let doc = await this.getFullDocument();\n" +
"        debugger;\n" +
"        if (!doc?.thirdparty_id) {\n" +
"            doc = await this.getFullDocument(1000);\n" +
"            if (!doc?.thirdparty_id) {\n" +
"                this.error(`Thirdparty introuvable ${this.id}`, this);\n" +
"                return null;\n" +
"            }\n" +
"        }\n" +
"        return await getThirdparty(doc.thirdparty_id);\n" +
"    }\n" +
"    async getDMSLinks(recordType, maxAge) {\n" +
"        if (!this._dmslinks) {\n" +
"            this._dmslinks = getDMSLinks(this.id, recordType, maxAge);\n" +
"        }\n" +
"        return await this._dmslinks;\n" +
"    }\n" +
"};\n" +
"Document$1.closedCache = new CacheList(\"closedDocumentsCache\", []);\n" +
"\n" +
"class ValidableDocument extends Document$1 {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.valid = null;\n" +
"        this.validMessage = null;\n" +
"    }\n" +
"    async getValidMessage(refresh = false) {\n" +
"        if (this.validMessage === null || refresh)\n" +
"            await this.loadValidation(refresh);\n" +
"        return this.validMessage;\n" +
"    }\n" +
"    async loadValidation(refresh = false) {\n" +
"        if (this.validMessage === null || refresh)\n" +
"            this.validMessage = await this.loadValidMessage(refresh);\n" +
"        this.valid = this.validMessage === \"OK\";\n" +
"    }\n" +
"    async isValid(refresh = false) {\n" +
"        if (this.valid === null || refresh)\n" +
"            await this.loadValidation(refresh);\n" +
"        return this.valid;\n" +
"    }\n" +
"    /**\n" +
"     * Get validation status of the document.\n" +
"     * @returns The status of the document or null if the document is not found.\n" +
"     */\n" +
"    async getStatus(refresh = false) {\n" +
"        const id = this.id;\n" +
"        const valid = await this.isValid(refresh);\n" +
"        const message = await this.getValidMessage(refresh);\n" +
"        const date = new Date(await this.getDate()).getTime();\n" +
"        return { id, valid, message, date };\n" +
"    }\n" +
"    async reloadLedgerEvents() {\n" +
"        this.valid = null;\n" +
"        this.validMessage = null;\n" +
"        return super.reloadLedgerEvents();\n" +
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
"// Stores the currently-being-typechecked object for error messages.\n" +
"let obj = null;\n" +
"class APIRecordComment {\n" +
"    static Parse(d) {\n" +
"        return APIRecordComment.Create(JSON.parse(d));\n" +
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
"        checkString(d.content, field + \".content\");\n" +
"        checkString(d.created_at, field + \".created_at\");\n" +
"        checkNumber(d.id, field + \".id\");\n" +
"        checkString(d.name, field + \".name\");\n" +
"        checkNumber(d.record_id, field + \".record_id\");\n" +
"        checkString(d.record_type, field + \".record_type\");\n" +
"        checkNull(d.rich_content, field + \".rich_content\");\n" +
"        checkBoolean(d.seen, field + \".seen\");\n" +
"        checkString(d.updated_at, field + \".updated_at\");\n" +
"        d.user = User.Create(d.user, field + \".user\");\n" +
"        checkNumber(d.user_id, field + \".user_id\");\n" +
"        const knownProperties = [\"content\", \"created_at\", \"id\", \"name\", \"record_id\", \"record_type\", \"rich_content\", \"seen\", \"updated_at\", \"user\", \"user_id\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
"        return new APIRecordComment(d);\n" +
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
"        checkString(d.first_name, field + \".first_name\");\n" +
"        checkString(d.full_name, field + \".full_name\");\n" +
"        checkNumber(d.id, field + \".id\");\n" +
"        checkString(d.last_name, field + \".last_name\");\n" +
"        checkNull(d.profile_picture_url, field + \".profile_picture_url\");\n" +
"        const knownProperties = [\"first_name\", \"full_name\", \"id\", \"last_name\", \"profile_picture_url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper(field + '.' + unknownProperty, d[unknownProperty], \"never (unknown property)\");\n" +
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
"function throwNull2NonNull(field, value, multiple) {\n" +
"    return errorHelper(field, value, multiple ?? \"non-nullable object\");\n" +
"}\n" +
"function throwNotObject(field, value, multiple) {\n" +
"    return errorHelper(field, value, \"object\");\n" +
"}\n" +
"function throwIsArray(field, value, multiple) {\n" +
"    return errorHelper(field, value, \"object\");\n" +
"}\n" +
"function checkNumber(value, field, multiple) {\n" +
"    if (typeof (value) !== 'number')\n" +
"        errorHelper(field, value, \"number\");\n" +
"}\n" +
"function checkBoolean(value, field, multiple) {\n" +
"    if (typeof (value) !== 'boolean')\n" +
"        errorHelper(field, value, \"boolean\");\n" +
"}\n" +
"function checkString(value, field, multiple) {\n" +
"    if (typeof (value) !== 'string')\n" +
"        errorHelper(field, value, \"string\");\n" +
"}\n" +
"function checkNull(value, field, multiple) {\n" +
"    if (value !== null)\n" +
"        errorHelper(field, value, \"null\");\n" +
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
"const logger = new Logger(\"API:records\");\n" +
"async function getRecordComments(recordId, maxAge, { name = \"client\", type = \"BankTransaction\", } = {}) {\n" +
"    const data = await cachedRequest(\"records:getRecordComments\", { recordId, name, type }, async ({ recordId, name, type }) => {\n" +
"        let page = 1;\n" +
"        const response = await apiRequest(`comments?record_id=${recordId}&record_type=${type}&name[]=${name}&per_page=20&page=${page}`, null, \"GET\");\n" +
"        const data = await response.json();\n" +
"        if (data.pagination.hasNextPage) {\n" +
"            logger.error(\"todo: le multi page n'est pas implémenté pour la fonction getRecordComments\", {\n" +
"                recordId,\n" +
"                name,\n" +
"                type,\n" +
"                data,\n" +
"            });\n" +
"        }\n" +
"        return data.comments;\n" +
"    }, maxAge);\n" +
"    if (!data) {\n" +
"        logger.error(\"getRecordComments: empty data\", { recordId, name, type });\n" +
"        return [];\n" +
"    }\n" +
"    return data.map((item) => APIRecordComment.Create(item));\n" +
"}\n" +
"async function getTransactionClientsComments(transactionId, maxAge) {\n" +
"    return await getRecordComments(transactionId, maxAge, { type: \"BankTransaction\", name: \"client\" });\n" +
"}\n" +
"\n" +
"localStorage.getItem(\"user\") ?? \"assistant\";\n" +
"class Transaction extends ValidableDocument {\n" +
"    constructor(raw, factory) {\n" +
"        super(raw, factory);\n" +
"        this._raw = raw;\n" +
"        this.cacheStatus = CacheStatus.getInstance(\"transactionValidation\");\n" +
"    }\n" +
"    static get(raw, factory) {\n" +
"        if (!isTypedDocument(raw) || raw.type.toLowerCase() !== \"transaction\")\n" +
"            throw new Error(\"`raw.type` MUST be 'transaction'\");\n" +
"        const old = DocumentCache.get(raw.id);\n" +
"        if (old instanceof Transaction)\n" +
"            return old;\n" +
"        return factory.getTransaction(raw.id);\n" +
"    }\n" +
"    async hasComments(maxAge) {\n" +
"        const comments = await this.getComments(maxAge);\n" +
"        return comments.length > 0;\n" +
"    }\n" +
"    async getComments(maxAge) {\n" +
"        if (typeof maxAge !== \"number\")\n" +
"            maxAge = this.maxAge(maxAge);\n" +
"        return await getTransactionClientsComments(this.id, maxAge);\n" +
"    }\n" +
"    async getTransaction(maxAge) {\n" +
"        if (typeof maxAge !== \"number\")\n" +
"            maxAge = this.maxAge(maxAge);\n" +
"        return await getTransactionFull(this.id, maxAge);\n" +
"    }\n" +
"    async getGroupedDocuments(maxAge) {\n" +
"        return await super.getGroupedDocuments(this.maxAge(maxAge));\n" +
"    }\n" +
"    async getDMSLinks() {\n" +
"        this.debug(\"getDMSLinks\", this);\n" +
"        return await super.getDMSLinks(\"Transaction\", this.isCurrent() ? 1000 : void 0);\n" +
"    }\n" +
"    async getDate() {\n" +
"        return (await this.getTransaction()).date;\n" +
"    }\n" +
"    async getAmount() {\n" +
"        return (await this.getTransaction()).amount;\n" +
"    }\n" +
"    isCurrent() {\n" +
"        return String(this.id) === getParam(location.href, \"transaction_id\");\n" +
"    }\n" +
"    async isReconciled() {\n" +
"        return Boolean(await getTransactionReconciliationId(this.id));\n" +
"    }\n" +
"    async getLedgerEvents(maxAge) {\n" +
"        return await super.getLedgerEvents(this.maxAge(maxAge));\n" +
"    }\n" +
"    async getBalance() {\n" +
"        if (!this._balance || this.refreshing) {\n" +
"            this._balance = new Promise(async (rs) => {\n" +
"                // balance déséquilibrée - version exigeante\n" +
"                const balance = new Balance();\n" +
"                const groupedDocuments = await this.getGroupedDocuments();\n" +
"                for (const gDocument of groupedDocuments) {\n" +
"                    if (this.isCurrent())\n" +
"                        this.debug(\"balance counting\", gDocument, jsonClone(balance));\n" +
"                    const gdoc = await gDocument.getFullDocument();\n" +
"                    const journal = await gDocument.getJournal();\n" +
"                    const coeff = gdoc.type === \"Invoice\" && journal.code === \"HA\" ? -1 : 1;\n" +
"                    const value = parseFloat(gdoc.amount) * coeff;\n" +
"                    if (gdoc.type === \"Transaction\") {\n" +
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
"                        this.debug(\"balance counting\", dmsLink, jsonClone(balance));\n" +
"                    if (dmsLink.name.startsWith(\"CHQ\")) {\n" +
"                        const amount = dmsLink.name.match(/- (?<amount>[\\d \\.]*) ?€(?:\\.\\w+)?$/u)?.groups.amount;\n" +
"                        balance.addCHQ(parseFloat(amount ?? \"0\") * Math.sign(balance.transaction));\n" +
"                    }\n" +
"                    else if (/^(?:CERFA|AIDES) /u.test(dmsLink.name)) {\n" +
"                        if (this.isCurrent())\n" +
"                            this.log(\"aide trouvée\", { dmsLink });\n" +
"                        const amount = dmsLink.name.match(/- (?<amount>[\\d \\.]*) ?€$/u)?.groups.amount;\n" +
"                        balance.addReçu(parseFloat(amount ?? \"0\") * Math.sign(balance.transaction));\n" +
"                    }\n" +
"                    else {\n" +
"                        const amount = dmsLink.name.match(/(?<amount>[\\d \\.]*) ?€(?:\\.\\w+)?$/u)?.groups.amount;\n" +
"                        balance.addAutre(parseFloat(amount ?? \"0\") * Math.sign(balance.transaction));\n" +
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
"    async getStatus(refresh = false) {\n" +
"        const status = await super.getStatus(refresh);\n" +
"        debugger;\n" +
"        this.cacheStatus.updateItem(status, false);\n" +
"        return status;\n" +
"    }\n" +
"    async loadValidMessage(refresh = false) {\n" +
"        if (refresh)\n" +
"            this.refreshing = refresh === true ? Date.now() : refresh;\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"loadValidMessage\", this);\n" +
"        const status = ((await this.isClosedCheck()) ??\n" +
"            (await this.isArchived()) ??\n" +
"            (await this.hasMalnammedDMSLink()) ??\n" +
"            (await this.isNextYear()) ??\n" +
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
"        this.refreshing = null;\n" +
"        return status;\n" +
"    }\n" +
"    async isNextYear() {\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"isNextYear\");\n" +
"        else\n" +
"            this.debug(\"isNextYear\", this);\n" +
"        const transaction = await this.getTransaction();\n" +
"        if (transaction.date.startsWith(\"2026\")) {\n" +
"            return (await this.isUnbalanced()) ?? (await this.isMissingAttachment()) ?? (await this.hasToSendToDMS()) ?? \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isClosedCheck() {\n" +
"        this.debug(\"isClosedCheck\");\n" +
"        const closed = await this.isClosed();\n" +
"        if (closed) {\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"fait partie d'un exercice clos\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async isArchived() {\n" +
"        this.debug(\"isArchived\");\n" +
"        // Transaction archivée\n" +
"        const doc = await this.getFullDocument();\n" +
"        if (doc.archived_at) {\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"transaction archivée\");\n" +
"            return \"OK\";\n" +
"        }\n" +
"    }\n" +
"    async hasMalnammedDMSLink() {\n" +
"        this.debug(\"hasMalnammedDMSLink\");\n" +
"        // Fichiers DMS mal nommés\n" +
"        const dmsLinks = await this.getDMSLinks();\n" +
"        for (const dmsLink of dmsLinks) {\n" +
"            const dmsItem = this.factory.getDMSItem(dmsLink.item_id);\n" +
"            const dmsStatus = await dmsItem.getValidMessage(true);\n" +
"            if (dmsStatus !== \"OK\")\n" +
"                return `Corriger les noms des fichiers attachés dans l'onglet \"Réconciliation\" (surlignés en orange)`;\n" +
"        }\n" +
"    }\n" +
"    /**\n" +
"     * Vérifie si la transaction n'est pas rattachée à un rapprochement bancaire.\n" +
"     */\n" +
"    async isMissingBanking() {\n" +
"        this.debug(\"isMissingBanking\");\n" +
"        const date = await this.getDate();\n" +
"        const recent = Date.now() - new Date(date).getTime() < 86400000 * 30;\n" +
"        if (recent)\n" +
"            return;\n" +
"        const isReconciled = await this.isReconciled();\n" +
"        if (!isReconciled) {\n" +
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
"        this.debug(\"hasUnbalancedThirdparty\");\n" +
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
"            if (this.isCurrent())\n" +
"                this.log(\"hasUnbalancedThirdparty\", { ledgerEvents, thirdparties, unbalanced, events });\n" +
"            return `Le compte tiers \"${unbalanced}\" n'est pas équilibré.`;\n" +
"        }\n" +
"    }\n" +
"    async isUnbalanced() {\n" +
"        if (this.isCurrent())\n" +
"            this.log(\"isUnbalanced\");\n" +
"        else\n" +
"            this.debug(\"isUnbalanced\");\n" +
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
"        this.debug(\"isCheckRemittance\");\n" +
"        const doc = await this.getFullDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith(\"6571\"));\n" +
"        // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa\n" +
"        if (doc.label.startsWith(\"REMISE CHEQUE \") || (aidLedgerEvent && doc.label.startsWith(\"CHEQUE \"))) {\n" +
"            // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa\n" +
"            // On a parfois des calculs qui ne tombent pas très juste en JS\n" +
"            if (Math.abs(Math.abs(balance.transaction) - Math.abs(balance.reçu)) > 0.001) {\n" +
"                balance.addReçu(null);\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"isCheckRemittance(): somme des reçus incorrecte\");\n" +
"                return \"La somme des reçus doit valoir le montant de la transaction\";\n" +
"            }\n" +
"            // On a parfois des calculs qui ne tombent pas très juste en JS\n" +
"            if (Math.abs(balance.transaction - balance.CHQ) > 0.001) {\n" +
"                const lost = (await this.getComments()).find((comment) => comment.content === \"PHOTO CHEQUE PERDUE\");\n" +
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
"        this.debug(\"hasUnbalancedCHQ\");\n" +
"        if (balance.hasCHQ()) {\n" +
"            if (Math.abs(Math.abs(balance.CHQ) - Math.abs(balance.transaction)) > 0.001) {\n" +
"                if (this.isCurrent())\n" +
"                    this.log(\"hasUnbalancedCHQ(): somme des chèques incorrecte\");\n" +
"                return \"La somme des chèques doit valoir le montant de la transaction\";\n" +
"            }\n" +
"            if (Math.abs(Math.abs(balance.CHQ) - Math.abs(balance.autre) - Math.abs(balance.reçu)) > 0.001) {\n" +
"                if (this.isCurrent()) {\n" +
"                    this.log(\"hasUnbalancedCHQ(): somme des factures incorrecte\", {\n" +
"                        CHQ: balance.CHQ,\n" +
"                        autre: balance.autre,\n" +
"                        reçu: balance.reçu,\n" +
"                        diff: Math.abs(Math.abs(balance.CHQ) - Math.abs(balance.autre) - Math.abs(balance.reçu)),\n" +
"                    });\n" +
"                }\n" +
"                // sample: 1798997950, 821819482\n" +
"                return \"La somme des factures et des reçus doit valoir celles des chèques\";\n" +
"            }\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"balance avec chèques équilibrée\", balance);\n" +
"            return \"\";\n" +
"        }\n" +
"    }\n" +
"    async hasUnbalancedReceipt(balance) {\n" +
"        this.debug(\"hasUnbalancedReceipt\");\n" +
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
"        this.debug(\"isOtherUnbalanced\");\n" +
"        const doc = await this.getFullDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const optionalProof = [\n" +
"            \"58000004\", // Virements internes société générale\n" +
"            \"58000001\", // Virements internes Stripe\n" +
"            \"754110002\", // Dons Manuels - Stripe\n" +
"            \"754110001\", // Dons Manuels - Allodons\n" +
"            \"6270005\", // Frais Bancaires Société Générale\n" +
"            \"6270001\", // Frais Stripe\n" +
"            \"768\", // Autres produits financiers (Interets créditeurs)\n" +
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
"        this.debug(\"hasVAT\");\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        // Les associations ne gèrent pas la TVA\n" +
"        if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"445\"))) {\n" +
"            return \"Une écriture comporte un compte de TVA\";\n" +
"        }\n" +
"    }\n" +
"    async isTrashCounterpart() {\n" +
"        this.debug(\"isTrashCounterpart\");\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        if (ledgerEvents.find((line) => line.planItem.number === \"6288\")) {\n" +
"            return \"Une ligne d'écriture comporte le numéro de compte 6288\";\n" +
"        }\n" +
"    }\n" +
"    async isMissingCounterpart() {\n" +
"        this.debug(\"isMissingCounterpart\");\n" +
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
"        this.debug(\"isWrongDonationCounterpart\");\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await Promise.all((await this.getGroupedDocuments()).map((doc) => doc.getFullDocument()));\n" +
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
"        this.debug(\"isOldUnbalanced\");\n" +
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
"        this.debug(\"isMissingAttachment\");\n" +
"        const doc = await this.getFullDocument();\n" +
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
"        debugger;\n" +
"        const attachmentRequired = doc.attachment_required && !doc.attachment_lost && (!attachmentOptional || this.isCurrent());\n" +
"        const hasAttachment = groupedDocuments.length + dmsLinks.length > 1;\n" +
"        if (this.isCurrent())\n" +
"            this.log({ attachmentOptional, attachmentRequired, groupedDocuments, hasAttachment });\n" +
"        if (attachmentRequired && !hasAttachment)\n" +
"            return \"Justificatif manquant\";\n" +
"    }\n" +
"    async isBankFees() {\n" +
"        this.debug(\"isBankFees\");\n" +
"        return await this.isIntlTransferFees();\n" +
"        //?? await this.isStripeFees()\n" +
"    }\n" +
"    async isIntlTransferFees() {\n" +
"        this.debug(\"isIntlTransferFees\");\n" +
"        const doc = await this.getFullDocument();\n" +
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
"        this.debug(\"isStripeFees\");\n" +
"        const doc = await this.getFullDocument();\n" +
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
"        this.debug(\"isAllodons\");\n" +
"        const doc = await this.getFullDocument();\n" +
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
"        this.debug(\"isDonationRenewal\");\n" +
"        const doc = await this.getFullDocument();\n" +
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
"        this.debug(\"isTransfer\");\n" +
"        const doc = await this.getFullDocument();\n" +
"        if ([\"VIR \", \"Payout: \"].some((label) => doc.label.startsWith(label))) {\n" +
"            return await this.isStripeInternalTransfer();\n" +
"            // ?? await this.isAssociationDonation()\n" +
"            // ?? await this.isOptionalReceiptDonation() // Les CERFAs ne sont pas optionel, seul leur envoi au donateur peut l'être\n" +
"            // ?? await this.isNormalDonation()          // inclus dans la balance\n" +
"        }\n" +
"    }\n" +
"    async isStripeInternalTransfer() {\n" +
"        const doc = await this.getFullDocument();\n" +
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
"        this.debug(\"isAssociationDonation\");\n" +
"        await this.getDocument();\n" +
"        await this.getLedgerEvents();\n" +
"        await this.getGroupedDocuments();\n" +
"        this.error(\"todo: réparer cette fonction\");\n" +
"        debugger;\n" +
"        /*\n" +
"        if (assos.some((label) => doc.label.includes(label))) {\n" +
"          if (\n" +
"            ledgerEvents.length !== 2 ||\n" +
"            groupedDocuments.length > 1 ||\n" +
"            ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"            !ledgerEvents.find((ev) => ev.planItem.number === \"75411\")\n" +
"          )\n" +
"            return \"Virement reçu d'une association mal attribué\";\n" +
"          if (this.isCurrent()) this.log(\"virement reçu d'une association OK\");\n" +
"          return \"OK\";\n" +
"        }\n" +
"        */\n" +
"    }\n" +
"    async isOptionalReceiptDonation() {\n" +
"        this.debug(\"isOptionalReceiptDonation\");\n" +
"        await this.getDocument();\n" +
"        await this.getLedgerEvents();\n" +
"        await this.getGroupedDocuments();\n" +
"        this.error(\"todo: réparer cette fonction\");\n" +
"        debugger;\n" +
"        /*\n" +
"        if (sansCerfa.some((label) => doc.label.includes(label))) {\n" +
"          if (\n" +
"            ledgerEvents.length !== 2 ||\n" +
"            groupedDocuments.length > 1 ||\n" +
"            ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 ||\n" +
"            !ledgerEvents.find((ev) => ev.planItem.number === \"75411\")\n" +
"          )\n" +
"            return \"Virement reçu avec CERFA optionel mal attribué (=>75411)\";\n" +
"          if (this.isCurrent()) this.log(\"Virement reçu avec CERFA optionel OK\");\n" +
"          return \"OK\";\n" +
"        }\n" +
"      }\n" +
"    \n" +
"      private async isNormalDonation() {\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"    \n" +
"        if (gdocs.length < 2) {\n" +
"          return `<a\n" +
"            title=\"Ajouter le CERFA dans les pièces de réconciliation. Cliquer ici pour plus d'informations.\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Virement%20re%C3%A7u%20sans%20justificatif\"\n" +
"          >Virement reçu sans justificatif ⓘ</a>`;\n" +
"        }\n" +
"    \n" +
"        this.error(\"todo: réparer cette fonction\");\n" +
"        debugger;\n" +
"        /*\n" +
"        if (!gdocs.find((gdoc) => gdoc.label.includes(\"CERFA\"))) {\n" +
"          return \"Les virements reçus doivent être justifiés par un CERFA\";\n" +
"        }\n" +
"        */\n" +
"    }\n" +
"    async isAid() {\n" +
"        this.debug(\"isAid\");\n" +
"        // Aides octroyées\n" +
"        return ((await this.isAssociationAid()) ??\n" +
"            (await this.isMissingBeneficiaryName()) ??\n" +
"            (await this.isMissingCounterpartLabel()));\n" +
"    }\n" +
"    async isAssociationAid() {\n" +
"        this.debug(\"isAssociationAid\");\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith(\"6571\"));\n" +
"        if (aidLedgerEvent?.planItem.number === \"6571002\") ;\n" +
"    }\n" +
"    async isMissingBeneficiaryName() {\n" +
"        this.debug(\"isMissingBeneficiaryName\");\n" +
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
"        this.debug(\"isMissingCounterpartLabel\");\n" +
"        const doc = await this.getFullDocument();\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const aidLedgerEvent = ledgerEvents.find((line) => line.planItem.number.startsWith(\"6571\"));\n" +
"        if (!aidLedgerEvent && parseFloat(doc.amount) < 0) {\n" +
"            for (const gdoc of groupedDocuments) {\n" +
"                if (gdoc.type !== \"invoice\")\n" +
"                    continue;\n" +
"                const thirdparty = await gdoc.getThirdparty();\n" +
"                // Aides octroyées à une asso ou un particulier\n" +
"                if ([106438171, 114270419].includes(thirdparty.id)) {\n" +
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
"        this.debug(\"hasToSendToDMS\");\n" +
"        const balance = await this.getBalance();\n" +
"        if (balance.CHQ &&\n" +
"            balance.CHQ === balance.transaction &&\n" +
"            (balance.autre === balance.transaction || balance.reçu === balance.transaction)) {\n" +
"            const groupedDocuments = await this.getGroupedDocuments();\n" +
"            for (const gdoc of groupedDocuments) {\n" +
"                const label = await gdoc.getLabel();\n" +
"                if (label.includes(\" - CHQ\")) {\n" +
"                    if (this.isCurrent())\n" +
"                        this.log(\"hasToSendToDMS\", { groupedDocuments, balance });\n" +
"                    return \"envoyer les CHQs en GED\";\n" +
"                }\n" +
"            }\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"hasToSendToDMS\", \"tous les chq sont en GED\", { groupedDocuments, balance });\n" +
"            return;\n" +
"        }\n" +
"    }\n" +
"    async hasToSendToInvoice() {\n" +
"        this.debug(\"hasToSendToInvoice\");\n" +
"        if (await this.isFrozen())\n" +
"            return;\n" +
"        const balance = await this.getBalance();\n" +
"        if (balance.reçu) {\n" +
"            const dmsLinks = await this.getDMSLinks();\n" +
"            const receipts = dmsLinks.filter((link) => [\"CERFA\", \"AIDES\"].some((key) => link.name.startsWith(key)));\n" +
"            if (this.isCurrent())\n" +
"                this.log(\"hasToSendToInvoice\", { dmsLinks, receipts, balance });\n" +
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
"        this.debug(\"groupAdd\");\n" +
"        const response = await matchDocuments(this.id, id);\n" +
"        // If the provided id is an invoice, the request should succeed.\n" +
"        if (response && \"grouped_transactions\" in response && response.grouped_transactions.some((tr) => tr.id === this.id))\n" +
"            return;\n" +
"        // If the provided id is a DMS file, we need use the DMS link instead of relying on document matching.\n" +
"        this.error('todo: réparer la méthode \"groupAdd()\"', this);\n" +
"        debugger;\n" +
"        /*\n" +
"        const doc = await this.getDocument(0);\n" +
"        const groups = doc.group_uuid;\n" +
"        this.error(\"groupAdd\", { response });\n" +
"        await createDMSLink(id, this.id, \"Transaction\");\n" +
"        /**/\n" +
"    }\n" +
"    async getGuuid(maxAge) {\n" +
"        if (typeof maxAge !== \"number\")\n" +
"            maxAge = this.maxAge(maxAge);\n" +
"        return await getDocumentGuuid(this.id, maxAge);\n" +
"    }\n" +
"    /** Determine the acceptable maxAge of API data */\n" +
"    maxAge(maxAge) {\n" +
"        if (typeof maxAge === \"number\")\n" +
"            return maxAge;\n" +
"        if (this.refreshing)\n" +
"            return Date.now() - this.refreshing;\n" +
"        if (this.isCurrent())\n" +
"            return Date.now() - performance.timeOrigin;\n" +
"        return void 0;\n" +
"    }\n" +
"}\n" +
"\n" +
"const staticLogger = new Logger(\"Invoice\");\n" +
"class Invoice extends ValidableDocument {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.type = \"invoice\";\n" +
"    }\n" +
"    static get(raw) {\n" +
"        const old = DocumentCache.get(raw.id);\n" +
"        if (old instanceof Invoice)\n" +
"            return old;\n" +
"        if (!isTypedDocument(raw) || raw.type.toLowerCase() !== \"invoice\")\n" +
"            throw new Error(\"`raw.type` MUST be 'invoice'\");\n" +
"        if (\"direction\" in raw && typeof raw.direction === \"string\" && [\"supplier\", \"customer\"].includes(raw.direction))\n" +
"            return Invoice.from(raw);\n" +
"        throw new Error(\"`raw.direction` MUST be 'supplier' or 'customer'\");\n" +
"    }\n" +
"    static from(invoice, factory) {\n" +
"        if (invoice.direction === \"supplier\")\n" +
"            return new SupplierInvoice(invoice, factory);\n" +
"        return new CustomerInvoice(invoice, factory);\n" +
"    }\n" +
"    static async load(id, factory) {\n" +
"        const invoice = await getInvoice(id);\n" +
"        if (!invoice?.id) {\n" +
"            staticLogger.log(\"Invoice.load: cannot load this invoice\", { id, invoice, _this: this });\n" +
"            return new NotFoundInvoice({ id }, factory);\n" +
"        }\n" +
"        return this.from(invoice, factory);\n" +
"    }\n" +
"    async update(data) {\n" +
"        return await updateInvoice(this.id, data);\n" +
"    }\n" +
"    async getInvoice() {\n" +
"        const maxAge = this.isCurrent() ? 0 : void 0;\n" +
"        if (!this.invoice) {\n" +
"            this.invoice = getInvoice(this.id, maxAge).then((response) => {\n" +
"                if (!response) {\n" +
"                    this.error(\"getInvoice\", \"Impossible de charger la facture\", { id: this.id, maxAge });\n" +
"                    throw new Error(\"Impossible de charger la facture\");\n" +
"                }\n" +
"                return response;\n" +
"            });\n" +
"        }\n" +
"        return this.invoice;\n" +
"    }\n" +
"    async getStatus(refresh = false) {\n" +
"        const status = await super.getStatus(refresh);\n" +
"        if (!status)\n" +
"            return null;\n" +
"        return { ...status, direction: this.direction, createdAt: await this.getCreatedAt(refresh ? 0 : void 0) };\n" +
"    }\n" +
"    async getCreatedAt(maxAge) {\n" +
"        const iso = await getInvoiceCreationDate(this.id, maxAge);\n" +
"        return new Date(iso).getTime();\n" +
"    }\n" +
"    async getDate() {\n" +
"        const invoice = await this.getInvoice();\n" +
"        return invoice.date;\n" +
"    }\n" +
"    async getGroupedDocuments(maxAge) {\n" +
"        if (this.isCurrent() && typeof maxAge === \"undefined\")\n" +
"            maxAge = 0;\n" +
"        return await super.getGroupedDocuments(maxAge);\n" +
"    }\n" +
"    async moveToDms(destId) {\n" +
"        this.debug(\"moveToDms before auto destId\", { destId });\n" +
"        const groupedDocuments = await this.getGroupedDocuments(0);\n" +
"        const transaction = groupedDocuments.find((doc) => doc.type === \"transaction\");\n" +
"        if (groupedDocuments.length > 1 && !transaction) {\n" +
"            alert(\"ouvrir la console\");\n" +
"            debugger;\n" +
"        }\n" +
"        destId = destId ?? (await this.getDMSDestId());\n" +
"        if (!destId) {\n" +
"            alert(\"Unable to choose DMS folder: ouvrir la console\");\n" +
"            debugger;\n" +
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
"        ]\n" +
"            .join(\" - \")\n" +
"            .replace(\" - Donateurs - Dons Manuels\", \"\");\n" +
"        await moveToDms(this.id, destId);\n" +
"        this.debug(\"moveToDms response\");\n" +
"        const files = await getDMSItemList({\n" +
"            filter: [{ field: \"name\", operator: \"search_all\", value: filename }],\n" +
"        });\n" +
"        const item = files.items.find((fileItem) => fileItem.signed_id === fileId);\n" +
"        await updateDMSItem({ id: item.id, name: invoiceName });\n" +
"        if (transaction) {\n" +
"            let newGroup = await transaction.getGroupedDocuments(0);\n" +
"            let missing = groupedDocuments.find((doc) => doc.id !== this.id && !newGroup.some((gdoc) => gdoc.id === doc.id));\n" +
"            while (missing) {\n" +
"                this.log(\"moveToDms: some grouped documents were degrouped\", { missing, groupedDocuments, newGroup });\n" +
"                await Transaction.get({ id: transaction.id }).groupAdd(missing.id);\n" +
"                newGroup = await transaction.getGroupedDocuments(0);\n" +
"            }\n" +
"        }\n" +
"        return new DMSItem({ id: item.id });\n" +
"    }\n" +
"    async getDMSDestId() {\n" +
"        const groupedDocuments = await this.getGroupedDocuments(0);\n" +
"        const gdocs = await Promise.all(groupedDocuments.map((doc) => doc.getGdoc()));\n" +
"        const transaction = gdocs.find((gdoc) => gdoc.type === \"Transaction\");\n" +
"        if (transaction)\n" +
"            return await getDMSDestId();\n" +
"        const ref = await this.getRef();\n" +
"        if (ref)\n" +
"            return await getDMSDestId();\n" +
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
"    getDate() {\n" +
"        throw new Error(\"Facture introuvable\");\n" +
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
"class ModelFactory {\n" +
"    static getTransaction(id) {\n" +
"        const existing = this.store.get(id)?.deref();\n" +
"        if (existing) {\n" +
"            if (!(existing instanceof Transaction)) {\n" +
"                throw new Error(`The given id is not a transaction: ${existing.constructor.name} found.`);\n" +
"            }\n" +
"            return existing;\n" +
"        }\n" +
"        const transaction = new Transaction({ id }, this);\n" +
"        this.store.set(id, new WeakRef(transaction));\n" +
"        return transaction;\n" +
"    }\n" +
"    static async getInvoice(id) {\n" +
"        const existing = this.store.get(id)?.deref();\n" +
"        if (existing) {\n" +
"            if (!(existing instanceof Invoice)) {\n" +
"                throw new Error(`The given id is not an invoice: ${existing.constructor.name} found.`);\n" +
"            }\n" +
"            return existing;\n" +
"        }\n" +
"        const invoice = await Invoice.load(id, this);\n" +
"        this.store.set(id, new WeakRef(invoice));\n" +
"        return invoice;\n" +
"    }\n" +
"    static getDMSItem(id) {\n" +
"        const existing = this.store.get(id)?.deref();\n" +
"        if (existing) {\n" +
"            if (!(existing instanceof DMSItem)) {\n" +
"                throw new Error(`The given id is not a DMS item: ${existing.constructor.name} found.`);\n" +
"            }\n" +
"            return existing;\n" +
"        }\n" +
"        const dmsItem = new DMSItem({ id }, this);\n" +
"        this.store.set(id, new WeakRef(dmsItem));\n" +
"        return dmsItem;\n" +
"    }\n" +
"}\n" +
"ModelFactory.store = new Map();\n" +
"\n" +
"const cache = CacheStatus.getInstance(\"transactionValidation\");\n" +
"/** Add validation message on transaction panel */\n" +
"class TransactionValidMessage extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.container = parseHTML(`<div><div class=\"headband-is-valid\">⟳</div></div>`)\n" +
"            .firstElementChild;\n" +
"        this.state = { ledgerEvents: [] };\n" +
"        this._message = \"⟳\";\n" +
"    }\n" +
"    static getInstance() {\n" +
"        if (!this.instance)\n" +
"            this.instance = new this();\n" +
"        return this.instance;\n" +
"    }\n" +
"    async init() {\n" +
"        await this.insertContainer();\n" +
"        this.on(\"message-change\", () => this.displayMessage());\n" +
"        this.watchReloadHotkey();\n" +
"        await this.loadMessage();\n" +
"        setInterval(() => this.watch(), 200);\n" +
"        cache.on(\"update\", this.handleCacheUpdate.bind(this));\n" +
"        cache.on(\"add\", this.handleCacheUpdate.bind(this));\n" +
"    }\n" +
"    async insertContainer() {\n" +
"        await waitElem(\"h3\", \"Transactions\"); // Transactions panel\n" +
"        await waitElem(\".paragraph-body-m+.heading-page.mt-1\"); // transaction detail panel\n" +
"        const detailTab = await waitElem(\"aside div\");\n" +
"        detailTab.insertBefore(this.container, detailTab.firstChild);\n" +
"        waitFunc(() => $(\"aside div\") !== detailTab).then(() => {\n" +
"            this.insertContainer();\n" +
"        });\n" +
"    }\n" +
"    watchReloadHotkey() {\n" +
"        document.addEventListener(\"keydown\", (event) => {\n" +
"            if (findElem(\"h3\", \"Transactions\") && event.ctrlKey && event.key.toLowerCase() === \"s\") {\n" +
"                event.preventDefault();\n" +
"                this.reload();\n" +
"            }\n" +
"        });\n" +
"    }\n" +
"    reload() {\n" +
"        this.loadMessage(true);\n" +
"    }\n" +
"    set message(html) {\n" +
"        this._message = html;\n" +
"        this.emit(\"message-change\", html);\n" +
"    }\n" +
"    get message() {\n" +
"        return this._message;\n" +
"    }\n" +
"    async loadMessage(refresh = false) {\n" +
"        this.log(\"loadMessage\", this);\n" +
"        this.message = \"⟳\";\n" +
"        const rawTransaction = APITransaction.Create(getReactProps($(\".paragraph-body-m+.heading-page.mt-1\"), 9).transaction);\n" +
"        this.state.transaction = ModelFactory.getTransaction(rawTransaction.id);\n" +
"        const cachedStatus = cache.find({ id: rawTransaction.id });\n" +
"        if (cachedStatus)\n" +
"            this.message = `<aside style=\"background: lightgray;\">⟳ ${cachedStatus.message}</aside>`;\n" +
"        const status = await this.state.transaction.getStatus(refresh);\n" +
"        cache.updateItem({ id: rawTransaction.id }, {\n" +
"            id: rawTransaction.id,\n" +
"            valid: status.valid,\n" +
"            message: status.message,\n" +
"            createdAt: Date.now(),\n" +
"            date: new Date(rawTransaction.date).getTime(),\n" +
"        });\n" +
"        this.handleCacheUpdate({ newValue: status });\n" +
"    }\n" +
"    async watch() {\n" +
"        const ledgerEvents = $$(\"form[name^=DocumentEntries-]\").reduce((events, form) => {\n" +
"            const formEvents = getReactProps(form.parentElement, 3)?.initialValues?.ledgerEvents ?? [];\n" +
"            return [...events, ...formEvents];\n" +
"        }, []);\n" +
"        if (ledgerEvents.some((event, id) => this.state.ledgerEvents[id] !== event)) {\n" +
"            const logData = { oldEvents: this.state.ledgerEvents };\n" +
"            this.state.ledgerEvents = ledgerEvents;\n" +
"            this.debug(\"ledgerEvents desynchronisé\", { ...logData, ...this });\n" +
"            this.reload();\n" +
"        }\n" +
"        const current = Number(getParam(location.href, \"transaction_id\"));\n" +
"        if (current && current !== this.state.transaction?.id) {\n" +
"            this.debug(\"transaction desynchronisée\", { current, ...this });\n" +
"            this.reload();\n" +
"        }\n" +
"    }\n" +
"    async displayMessage() {\n" +
"        $(\".headband-is-valid\", this.container).innerHTML = `${this.getTransactionId()}${this.getCommentLogo()} ${this.message}`;\n" +
"    }\n" +
"    getTransactionId() {\n" +
"        if (!this.state.transaction?.id)\n" +
"            return \"\";\n" +
"        return `<span class=\"transaction-id d-inline-block bg-secondary-100 dihsuQ px-0_5 m-0\">#${this.state.transaction.id}</span>`;\n" +
"    }\n" +
"    getCommentLogo() {\n" +
"        if (!this.state.transaction)\n" +
"            return \"\";\n" +
"        if (!this.state.comments || this.state.transaction.id !== this.state.comments.transactionId) {\n" +
"            this.reloadCommentState();\n" +
"            return \"\";\n" +
"        }\n" +
"        return this.state.comments.hasComment ? '<span class=\"d-inline-block bg-danger m-0\">💬</span>' : \"\";\n" +
"    }\n" +
"    async reloadCommentState() {\n" +
"        if (!this.state.transaction)\n" +
"            return;\n" +
"        this.state.comments = {\n" +
"            transactionId: this.state.transaction.id,\n" +
"            hasComment: await this.state.transaction.hasComments(),\n" +
"        };\n" +
"        this.displayMessage();\n" +
"    }\n" +
"    handleCacheUpdate({ newValue: status }) {\n" +
"        if (status.id !== this.state.transaction?.id)\n" +
"            return;\n" +
"        this.error(\"handleCacheUpdate\", { status, _this: this });\n" +
"        this.message = `${status.valid ? \"✓\" : \"✗\"} ${status.message}`;\n" +
"    }\n" +
"}\n" +
"/** Open next invalid transaction */\n" +
"/**\n" +
" * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :\n" +
"getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);\n" +
" */\n" +
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
"const map = new WeakMap();\n" +
"class Tooltip {\n" +
"    constructor({ target }) {\n" +
"        this.id = `T${uniquid()}`;\n" +
"        this.target = target;\n" +
"        map.set(target, this);\n" +
"        this.createContainer();\n" +
"        setInterval(() => {\n" +
"            this.setPos();\n" +
"        }, 200);\n" +
"    }\n" +
"    /**\n" +
"     * Create a tooltip for an element or update the tooltip text if it already exists\n" +
"     * @returns The tooltip instance\n" +
"     */\n" +
"    static make({ target, text, }) {\n" +
"        let tooltip = map.get(target);\n" +
"        if (!tooltip) {\n" +
"            tooltip = new Tooltip({ target });\n" +
"            map.set(target, tooltip);\n" +
"        }\n" +
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
"        this.target.setAttribute(\"aria-labelledby\", this.id);\n" +
"        this.target.addEventListener(\"mouseenter\", () => {\n" +
"            $(`#${this.id}`).style.display = \"unset\";\n" +
"        });\n" +
"        this.target.addEventListener(\"mouseleave\", () => {\n" +
"            $(`#${this.id}`).style.display = \"none\";\n" +
"        });\n" +
"    }\n" +
"    /**\n" +
"     * Set the text for the tooltip\n" +
"     */\n" +
"    setText(text, html = false) {\n" +
"        const inner = $(`#${this.id} .tooltip-inner`);\n" +
"        if (!inner)\n" +
"            throw new Error(\"Unable to find tooltip container\");\n" +
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
"        const arrow = $(\".arrow\", tooltip);\n" +
"        if (tooltip.style.display === \"none\")\n" +
"            return;\n" +
"        const targetRect = this.target.getBoundingClientRect();\n" +
"        const tooltipRect = tooltip.getBoundingClientRect();\n" +
"        const arrowRect = arrow.getBoundingClientRect();\n" +
"        const targetWidth = targetRect.right - targetRect.left;\n" +
"        const tooltipWidth = tooltipRect.right - tooltipRect.left;\n" +
"        const arrowWidth = arrowRect.right - arrowRect.left;\n" +
"        const arrowTransform = `translate(${Math.round(10 * (tooltipWidth / 2 - arrowWidth / 2)) / 10}px)`;\n" +
"        if (arrow.style.transform !== arrowTransform) {\n" +
"            arrow.style.transform = arrowTransform;\n" +
"        }\n" +
"        const tooltipTransform = `translate(${Math.round(10 * (targetRect.left + targetWidth / 2 - tooltipWidth / 2)) / 10}px, ${Math.round(10 * targetRect.bottom) / 10}px)`;\n" +
"        if (tooltip.style.transform !== tooltipTransform) {\n" +
"            tooltip.style.transform = tooltipTransform;\n" +
"        }\n" +
"    }\n" +
"}\n" +
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
"        this.spinner = parseHTML('<div class=\"spinner-border spinner-border-sm\" style=\"margin-left: 0.5em;\" role=\"status\"></div>').firstElementChild;\n" +
"        this.alertIcon = parseHTML(`<div class=\"alert alert-danger\" style=\"margin-left: 0.5em;\" role=\"alert\">&#x26A0;</div>`).firstElementChild;\n" +
"        this._running = false;\n" +
"        this.button = parseHTML('<div class=\"btn-sm w-100 btn-primary add-by-id-btn\" style=\"cursor: pointer;\">Ajouter par ID</div>').firstElementChild;\n" +
"        this.disabled = false;\n" +
"    }\n" +
"    set alert(value) {\n" +
"        if (value) {\n" +
"            this.button.appendChild(this.alertIcon);\n" +
"        }\n" +
"        else {\n" +
"            this.alertIcon.remove();\n" +
"        }\n" +
"    }\n" +
"    get running() {\n" +
"        return this._running;\n" +
"    }\n" +
"    set running(value) {\n" +
"        this._running = value;\n" +
"        if (value) {\n" +
"            this.alert = false;\n" +
"            this.button.appendChild(this.spinner);\n" +
"        }\n" +
"        else {\n" +
"            this.spinner.remove();\n" +
"        }\n" +
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
"        if (this.running)\n" +
"            return;\n" +
"        /**\n" +
"         * Obligé de recharger la transaction à chaque appel : le numéro guid du\n" +
"         * groupe change à chaque attachement de nouvelle pièce\n" +
"         */\n" +
"        const transactionId = Number(getParam(location.href, \"transaction_id\"));\n" +
"        const id = Number(prompt(\"ID du justificatif ?\"));\n" +
"        const transaction = ModelFactory.getTransaction(transactionId);\n" +
"        this.running = true;\n" +
"        await transaction.groupAdd(id).catch((error) => {\n" +
"            this.error(\"addById>Transaction.groupAdd Error:\", error);\n" +
"            this.alert = true;\n" +
"            this.running = false;\n" +
"            throw error;\n" +
"        });\n" +
"        this.running = false;\n" +
"        TransactionValidMessage.getInstance().reload();\n" +
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
"        this.container = document.createElement(\"div\");\n" +
"        this.running = false;\n" +
"        this.spinner = {\n" +
"            //frames: '🕛 🕧 🕐 🕜 🕑 🕝 🕒 🕞 🕓 🕟 🕔 🕠 🕕 🕡 🕖 🕢 🕗 🕣 🕘 🕤 🕙 🕥 🕚 🕦'.split(' '),\n" +
"            //frames: '🕛 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚'.split(' '),\n" +
"            frames: \"⢎⡰ ⢎⡡ ⢎⡑ ⢎⠱ ⠎⡱ ⢊⡱ ⢌⡱ ⢆⡱\".split(\" \"),\n" +
"            interval: 200,\n" +
"        };\n" +
"    }\n" +
"    async init() {\n" +
"        this.log(\"init\");\n" +
"        await this.cache.loading;\n" +
"        this.start = this.start.bind(this);\n" +
"        this.loadCurrent();\n" +
"        this.appendOpenNextButton();\n" +
"        setInterval(() => {\n" +
"            this.setSpinner();\n" +
"        }, this.spinner.interval);\n" +
"        this.allowIgnoring();\n" +
"        this.allowWaiting();\n" +
"        this.autostart = new Autostarter(this);\n" +
"        this.invalidGenerator = this.loadInvalid();\n" +
"        this.firstLoading();\n" +
"        window.addEventListener(\"beforeunload\", (event) => {\n" +
"            if (this.running) {\n" +
"                this.log(\"Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert.\");\n" +
"                event.returnValue =\n" +
"                    \"Vous allez fermer la page alors que le prochain élément à corriger n'a pas été ouvert. Voulez-vous vraiment continuer ?\";\n" +
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
"                setTimeout(() => {\n" +
"                    modal.remove();\n" +
"                }, 100);\n" +
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
"            this.emit(\"reload\", current);\n" +
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
"      </button>`\n" +
"            .trim()\n" +
"            .replace(/\\n" +
"\\s*/g, \"\")));\n" +
"        const button = $(`.open-next-invalid-btn`, this.container);\n" +
"        button.addEventListener(\"click\", this.start.bind(this, true));\n" +
"        Tooltip.make({ target: button, text: \"Ouvrir le prochain élément invalide\" });\n" +
"        this.reloadNumber();\n" +
"        this.cache.on(\"change\", () => this.reloadNumber());\n" +
"    }\n" +
"    /**\n" +
"     * Set the number display on openNextInvalid button\n" +
"     */\n" +
"    async reloadNumber() {\n" +
"        const count = await this.cache.reduce((acc, status) => {\n" +
"            if (status.ignored)\n" +
"                return { ...acc, ignored: acc.ignored + 1 };\n" +
"            if (status.wait && new Date(status.wait).getTime() > Date.now())\n" +
"                return { ...acc, waiting: acc.waiting + 1 };\n" +
"            if (!status.valid)\n" +
"                return { ...acc, invalid: acc.invalid + 1 };\n" +
"            return acc;\n" +
"        }, { invalid: 0, waiting: 0, ignored: 0 });\n" +
"        const button = $(`.open-next-invalid-btn`, this.container);\n" +
"        const number = $(\".number\", button);\n" +
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
"        for await (const cachedItem of this.cache.walk({ column: \"date\", sortDirection: \"asc\" })) {\n" +
"            if (!cachedItem)\n" +
"                continue;\n" +
"            if (this.isSkipped(cachedItem)) {\n" +
"                if (!cachedItem?.valid)\n" +
"                    this.log(\"skip\", cachedItem);\n" +
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
"                    this.log(\"skip\", status);\n" +
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
"                    this.log(\"skip\", status);\n" +
"                continue;\n" +
"            }\n" +
"            yield status;\n" +
"        }\n" +
"        // verifier les plus anciennes entrées\n" +
"        const dateRef = Date.now() - 3 * 86400000;\n" +
"        let item = await this.cache.find((cachedItem) => cachedItem.fetchedAt < dateRef);\n" +
"        while (item) {\n" +
"            const status = await this.updateStatus(item);\n" +
"            if (this.isSkipped(status)) {\n" +
"                if (!status?.valid)\n" +
"                    this.log(\"skip\", status);\n" +
"            }\n" +
"            else {\n" +
"                yield status;\n" +
"            }\n" +
"            item = await this.cache.find((cachedItem) => cachedItem.fetchedAt < dateRef);\n" +
"        }\n" +
"    }\n" +
"    isSkipped(status) {\n" +
"        if (!status)\n" +
"            return true;\n" +
"        if (status.valid)\n" +
"            return true;\n" +
"        if (status.ignored)\n" +
"            return true;\n" +
"        if (status.wait && new Date(status.wait).getTime() > Date.now())\n" +
"            return true;\n" +
"        return false;\n" +
"    }\n" +
"    /**\n" +
"     * Update status of an item given by its ID\n" +
"     */\n" +
"    async updateStatus(id, value, force = false) {\n" +
"        if (\"number\" !== typeof id) {\n" +
"            id = id.id;\n" +
"        }\n" +
"        if (!value)\n" +
"            value = await this.getStatus(id, force);\n" +
"        if (!value) {\n" +
"            this.cache.delete({ id });\n" +
"            return null;\n" +
"        }\n" +
"        const oldStatus = this.cache.find({ id }) ?? {};\n" +
"        const status = Object.assign({}, oldStatus, value, { fetchedAt: Date.now() });\n" +
"        this.cache.update(status);\n" +
"        return status;\n" +
"    }\n" +
"    async openNext(interactionAllowed = false) {\n" +
"        this.log(\"openNext\");\n" +
"        let status = (await this.invalidGenerator.next()).value;\n" +
"        while (status?.id === this.current) {\n" +
"            this.log({ status, current: this.current, class: this });\n" +
"            status = (await this.invalidGenerator.next()).value;\n" +
"        }\n" +
"        if (!status && interactionAllowed) {\n" +
"            if (!this.skippedElems)\n" +
"                this.skippedElems = await this.cache.filter((item) => this.isSkipped(item));\n" +
"            while (!status && this.skippedElems.length) {\n" +
"                const id = this.skippedElems.shift().id;\n" +
"                status = await this.updateStatus(id);\n" +
"                if (status?.valid || status.id === this.current)\n" +
"                    status = false;\n" +
"            }\n" +
"        }\n" +
"        if (status) {\n" +
"            this.log(\"next found :\", { current: this.current, status, class: this });\n" +
"            this.open(status.id);\n" +
"            this.running = false;\n" +
"            return;\n" +
"        }\n" +
"        if (interactionAllowed &&\n" +
"            confirm(this.constructor.name +\n" +
"                \": tous les éléments sont valides selon les paramétres actuels. Revérifier tout depuis le début ?\")) {\n" +
"            this.reloadAll();\n" +
"            return this.openNext(interactionAllowed);\n" +
"        }\n" +
"        this.running = false;\n" +
"    }\n" +
"    open(id) {\n" +
"        openDocument(id);\n" +
"        this.updateStatus(id, null, true).then((status) => {\n" +
"            if (status?.valid)\n" +
"                this.start();\n" +
"        });\n" +
"    }\n" +
"    async reloadAll() {\n" +
"        this.cache.clear();\n" +
"        localStorage.removeItem(`${this.storageKey}-state`);\n" +
"        this.invalidGenerator = this.loadInvalid();\n" +
"    }\n" +
"    async firstLoading() {\n" +
"        const storageKey = `${this.storageKey}-state`;\n" +
"        const currentVersion = window.GM_Pennylane_Version;\n" +
"        const state = JSON.parse(localStorage.getItem(storageKey) ?? \"{}\");\n" +
"        if (state.version !== currentVersion) {\n" +
"            // clear cache\n" +
"            this.cache.clear();\n" +
"            state.version = currentVersion;\n" +
"            state.loaded = false;\n" +
"            localStorage.setItem(storageKey, JSON.stringify(state));\n" +
"        }\n" +
"        const dateRef = Date.now() - 3 * 86400000;\n" +
"        let status = await this.cache.find((item) => item.fetchedAt < dateRef);\n" +
"        while (status) {\n" +
"            await this.updateStatus(status);\n" +
"            status = await this.cache.find((item) => item.fetchedAt < dateRef);\n" +
"        }\n" +
"        if (state.loaded)\n" +
"            return;\n" +
"        // load all\n" +
"        for await (const item of this.walk())\n" +
"            await this.updateStatus(item);\n" +
"        // save loaded status\n" +
"        state.loaded = true;\n" +
"        localStorage.setItem(storageKey, JSON.stringify(state));\n" +
"    }\n" +
"    async allowIgnoring() {\n" +
"        const currentStatus = await this.cache.find({ id: this.current });\n" +
"        const ignored = Boolean(currentStatus?.ignored);\n" +
"        this.container.appendChild(parseHTML(`<button\n" +
"      type=\"button\"\n" +
"      class=\"${getButtonClassName()} ignore-item\"\n" +
"      ${ignored ? 'style=\"background-color: var(--red);\"' : \"\"}\n" +
"    >x</button>`));\n" +
"        const button = $(`.ignore-item`, this.container);\n" +
"        Tooltip.make({ target: button, text: \"Ignorer cet élément, ne plus afficher\" });\n" +
"        const refresh = async () => {\n" +
"            const status = await this.cache.find({ id: this.current });\n" +
"            const ignored = Boolean(status?.ignored);\n" +
"            const background = ignored ? \"var(--red)\" : \"\";\n" +
"            if (button.style.backgroundColor !== background)\n" +
"                button.style.backgroundColor = background;\n" +
"        };\n" +
"        button.addEventListener(\"click\", async () => {\n" +
"            const status = await this.cache.find({ id: this.current });\n" +
"            if (!status)\n" +
"                return;\n" +
"            this.cache.update(Object.assign(status, { ignored: !status.ignored }));\n" +
"        });\n" +
"        this.cache.on(\"change\", () => {\n" +
"            refresh();\n" +
"        });\n" +
"        this.on(\"reload\", () => {\n" +
"            refresh();\n" +
"        });\n" +
"    }\n" +
"    allowWaiting() {\n" +
"        this.container.appendChild(parseHTML(`<button type=\"button\" class=\"${getButtonClassName()} wait-item\">\\ud83d\\udd52</button>`));\n" +
"        const waitButton = $(`.wait-item`, this.container);\n" +
"        const tooltip = Tooltip.make({ target: waitButton, text: \"\" });\n" +
"        const updateWaitDisplay = async () => {\n" +
"            const status = await this.cache.find({ id: this.current });\n" +
"            if (!status?.wait || new Date(status.wait).getTime() < Date.now()) {\n" +
"                waitButton.style.backgroundColor = \"\";\n" +
"                tooltip.setText(\"Ne plus afficher pendant 3 jours\");\n" +
"                return;\n" +
"            }\n" +
"            waitButton.style.backgroundColor = \"var(--blue)\";\n" +
"            const date = new Date(status.wait)\n" +
"                .toISOString()\n" +
"                .replace(\"T\", \" \")\n" +
"                .slice(0, 16)\n" +
"                .split(\" \")\n" +
"                .map((block) => block.split(\"-\").reverse().join(\"/\"))\n" +
"                .join(\" \");\n" +
"            tooltip.setText(`Ignoré jusqu'à ${date}.`);\n" +
"        };\n" +
"        updateWaitDisplay();\n" +
"        setInterval(() => {\n" +
"            updateWaitDisplay();\n" +
"        }, 60000);\n" +
"        waitButton.addEventListener(\"click\", async () => {\n" +
"            this.log(\"waiting button clicked\");\n" +
"            const status = await this.cache.find({ id: this.current });\n" +
"            if (!status)\n" +
"                return this.log({ cachedStatus: status, id: this.current });\n" +
"            const wait = status.wait && new Date(status.wait).getTime() > Date.now()\n" +
"                ? \"\"\n" +
"                : new Date(Date.now() + 3 * 86400000).toISOString();\n" +
"            this.cache.update(Object.assign(status, { wait }));\n" +
"            updateWaitDisplay();\n" +
"        });\n" +
"        waitButton.addEventListener(\"contextmenu\", async (event) => {\n" +
"            event.preventDefault();\n" +
"            const date = prompt(\"Date de fin de timeout ? (jj/mm/aaaa)\", \"\");\n" +
"            if (!date)\n" +
"                return;\n" +
"            const d = date.split(\"/\");\n" +
"            if (d.length !== 3) {\n" +
"                alert(\" Format attendu : jj/mm/aaaa\");\n" +
"                return;\n" +
"            }\n" +
"            try {\n" +
"                const wait = new Date(Number(d[2]), Number(d[1]) - 1, Number(d[0])).toISOString();\n" +
"                const status = await this.cache.find({ id: this.current });\n" +
"                if (!status)\n" +
"                    return this.log({ cachedStatus: status, id: this.current });\n" +
"                this.cache.update(Object.assign(status, { wait }));\n" +
"                updateWaitDisplay();\n" +
"            }\n" +
"            catch {\n" +
"                alert(\" Format attendu : jj/mm/aaaa\");\n" +
"            }\n" +
"        });\n" +
"        this.cache.on(\"change\", () => {\n" +
"            updateWaitDisplay();\n" +
"        });\n" +
"        this.on(\"reload\", () => {\n" +
"            updateWaitDisplay();\n" +
"        });\n" +
"    }\n" +
"    setSpinner() {\n" +
"        const span = $(\".open-next-invalid-btn .icon\", this.container);\n" +
"        if (!span)\n" +
"            return;\n" +
"        if (!this.running) {\n" +
"            if (span.innerText !== \">\")\n" +
"                span.innerText = \">\";\n" +
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
"class NextInvalidInvoice extends OpenNextInvalid {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.id = \"next-invalid-invoice\";\n" +
"        this.storageKey = \"InvoiceValidation\";\n" +
"        this.idParamName = \"id\";\n" +
"    }\n" +
"    async init() {\n" +
"        // Wait for appending button in the matched page before init auto open service\n" +
"        await this.appendContainer();\n" +
"        this.cache = IDBCache.getInstance(this.storageKey, \"id\");\n" +
"        await super.init();\n" +
"    }\n" +
"    async *walk() {\n" +
"        // Load new added invoices\n" +
"        for await (const status of this.walkInvoices(\"supplier\", \"+\"))\n" +
"            yield status;\n" +
"        for await (const status of this.walkInvoices(\"customer\", \"+\"))\n" +
"            yield status;\n" +
"        // Load old un loaded invoices\n" +
"        for await (const status of this.walkInvoices(\"supplier\", \"-\"))\n" +
"            yield status;\n" +
"        for await (const status of this.walkInvoices(\"customer\", \"-\"))\n" +
"            yield status;\n" +
"    }\n" +
"    async *walkInvoices(direction, sort) {\n" +
"        const startFrom = sort === \"+\" ? 0 : Date.now();\n" +
"        const limit = (await this.cache.filter({ direction })).reduce((acc, status) => Math[sort === \"+\" ? \"max\" : \"min\"](status.createdAt, acc), startFrom);\n" +
"        if (limit || sort === \"-\") {\n" +
"            this.log(`Recherche vers le ${sort === \"+\" ? \"futur\" : \"passé\"} depuis`, this.cache.find({ createdAt: limit }), {\n" +
"                cache: this.cache,\n" +
"            });\n" +
"            const operator = sort === \"+\" ? \"gteq\" : \"lteq\";\n" +
"            const value = new Date(limit).toISOString();\n" +
"            const params = {\n" +
"                direction,\n" +
"                filter: JSON.stringify([{ field: \"created_at\", operator, value }]),\n" +
"                sort: `${sort}created_at`,\n" +
"            };\n" +
"            for await (const invoice of getInvoiceGenerator(params)) {\n" +
"                const status = await (await ModelFactory.getInvoice(invoice.id)).getStatus();\n" +
"                yield { ...status, direction };\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async getStatus(id, force = false) {\n" +
"        const invoice = await ModelFactory.getInvoice(id);\n" +
"        if (!invoice || invoice instanceof NotFoundInvoice)\n" +
"            return null; // probablement une facture supprimée\n" +
"        const status = await invoice.getStatus(force);\n" +
"        if (!status)\n" +
"            return null;\n" +
"        return status;\n" +
"    }\n" +
"    /** Add \"next invalid invoice\" button on invoices list */\n" +
"    async appendContainer() {\n" +
"        const ref = await waitPage(\"invoiceDetail\");\n" +
"        const nextButton = await waitElem(\"div>span+button+button:last-child\");\n" +
"        nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);\n" +
"        waitFunc(() => isPage(\"invoiceDetail\") !== ref).then(() => this.appendContainer());\n" +
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
"        document.addEventListener('keydown', event => this.watchHotkey(event));\n" +
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
"            this.state.invoice = await ModelFactory.getInvoice(invoice.id);\n" +
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
"    watchHotkey(event) {\n" +
"        if (event.ctrlKey && (event.key === 'c' || event.key === 'C') && !getSelection()?.toString() && this.state.invoice?.id) {\n" +
"            navigator.clipboard.writeText(this.state.invoice.id.toString());\n" +
"            this.selectId();\n" +
"        }\n" +
"    }\n" +
"    selectId() {\n" +
"        const idDiv = $('#invoice-id', this.container);\n" +
"        const activeElement = document.activeElement;\n" +
"        if (activeElement instanceof HTMLElement)\n" +
"            activeElement.blur();\n" +
"        const textNode = idDiv.firstChild;\n" +
"        const range = document.createRange();\n" +
"        range.setStart(textNode, 1);\n" +
"        range.setEnd(textNode, String(this.state.invoice?.id).length + 1);\n" +
"        const selection = window.getSelection();\n" +
"        selection?.removeAllRanges();\n" +
"        selection?.addRange(range);\n" +
"    }\n" +
"}\n" +
"\n" +
"/** Add \"Archive\" button on bonded invoice in transaction pannel */\n" +
"class ArchiveGroupedDocument extends Service {\n" +
"    async init() {\n" +
"        this.state = [];\n" +
"        this.state.push(\"wait for transaction detail panel\");\n" +
"        await waitPage(\"transactionDetail\");\n" +
"        this.state.push(\"wait for items\");\n" +
"        let item = await this.getNext();\n" +
"        while (true) {\n" +
"            this.addGroupedActions(item);\n" +
"            item = await this.getNext();\n" +
"        }\n" +
"    }\n" +
"    async getNext() {\n" +
"        return await waitFunc(() => $(\".ui-card:not(.GM-archive-grouped-document) a.ui-button.ui-button-secondary+button.ui-button-secondary-danger\") ?? false);\n" +
"    }\n" +
"    addGroupedActions(item) {\n" +
"        const card = item.closest(\".ui-card\");\n" +
"        card?.classList.add(\"GM-archive-grouped-document\");\n" +
"        const id = getReactPropValue(card, \"invoice\")?.id;\n" +
"        if (!card || !id) {\n" +
"            if (card?.textContent?.includes(\"ajouté dans la GED le\"))\n" +
"                return;\n" +
"            this.error(\"addGroupedActions : no invoice found\", { item, card, id });\n" +
"            return;\n" +
"        }\n" +
"        const buttonsBlock = $(`a[href$=\"${id}.html\"]`, card)?.closest(\"div\");\n" +
"        if (!buttonsBlock) {\n" +
"            this.error(\"addGroupedActions : no buttons block found\", card);\n" +
"            return;\n" +
"        }\n" +
"        const buttonClass = buttonsBlock.querySelector(\"button\")?.className ?? \"\";\n" +
"        this.state.push(`addGroupedActions for #${id}`);\n" +
"        this.log(\"addGroupedActions\", { card, buttonsBlock, id });\n" +
"        buttonsBlock.insertBefore(parseHTML(`\n" +
"        <button\n" +
"          class=\"dms-button noCaret ui-button ui-button-sm ui-button-secondary ui-button-secondary-primary ui-button-sm-icon-only\" aria-haspopup=\"true\" aria-expanded=\"false\" type=\"button\">\n" +
"          <svg class=\"MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0 css-q7mezt\" focusable=\"false\" aria-hidden=\"true\" viewBox=\"0 0 24 24\" data-testid=\"DriveFileMoveRoundedIcon\" style=\"font-size: 1rem;\"><path d=\"M20 6h-8l-1.41-1.41C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-8 9.79V14H9c-.55 0-1-.45-1-1s.45-1 1-1h3v-1.79c0-.45.54-.67.85-.35l2.79 2.79c.2.2.2.51 0 .71l-2.79 2.79c-.31.31-.85.09-.85-.36\"></path></svg>\n" +
"        </button>\n" +
"        <button class=\"archive-button ${buttonClass}\">&nbsp;x&nbsp;</button>\n" +
"      `), buttonsBlock.firstElementChild);\n" +
"        const archiveButton = $(\".archive-button\", buttonsBlock);\n" +
"        Tooltip.make({ target: archiveButton, text: \"Archiver ce justificatif\" });\n" +
"        archiveButton.addEventListener(\"click\", () => this.archive(card));\n" +
"        const dmsButton = $(\".dms-button\", buttonsBlock);\n" +
"        Tooltip.make({ target: dmsButton, text: \"Envoyer la facture en GED\" });\n" +
"        dmsButton.addEventListener(\"click\", () => this.dms(card));\n" +
"    }\n" +
"    async archive(card) {\n" +
"        const id = getReactProps(card, 2).invoice.id;\n" +
"        const buttonsBlock = $(`a[href$=\"${id}.html\"]`, card).closest(\"div\");\n" +
"        if (!buttonsBlock) {\n" +
"            this.error(\"archive : no buttons block found\", card);\n" +
"            return;\n" +
"        }\n" +
"        const archiveButton = $(\".archive-button\", buttonsBlock);\n" +
"        this.log(\"archive invoice\", { card, id });\n" +
"        archiveButton.disabled = true;\n" +
"        archiveButton.classList.add(\"disabled\");\n" +
"        archiveButton.innerText = \"⟳\";\n" +
"        const invoice = await ModelFactory.getInvoice(id);\n" +
"        if (!invoice) {\n" +
"            archiveButton.innerText = \"⚠\";\n" +
"            Tooltip.make({ target: archiveButton, text: \"Impossible de trouver la facture #\" + id });\n" +
"            return;\n" +
"        }\n" +
"        const invoiceDoc = await invoice?.getInvoice();\n" +
"        const docs = await invoice.getGroupedDocuments();\n" +
"        const gdocs = await Promise.all(docs.map((doc) => doc.getGdoc()));\n" +
"        const transactions = gdocs.filter((doc) => doc.type === \"Transaction\").map((doc) => `#${doc.id}`);\n" +
"        await invoice.update({\n" +
"            invoice_number: `§ ${transactions.join(\" - \")} - ${invoiceDoc.invoice_number}`,\n" +
"        });\n" +
"        await invoice.archive();\n" +
"        buttonsBlock.closest(\".ui-card\")?.remove();\n" +
"        this.log(`archive invoice #${id}`, { invoice });\n" +
"        TransactionValidMessage.getInstance().reload();\n" +
"    }\n" +
"    async dms(card) {\n" +
"        const id = getReactProps(card, 2).invoice.id;\n" +
"        const buttonsBlock = $(`a[href$=\"${id}.html\"]`, card).closest(\"div\");\n" +
"        if (!buttonsBlock) {\n" +
"            this.error(\"dms : no buttons block found\", card);\n" +
"            return;\n" +
"        }\n" +
"        const dmsButton = $(\".dms-button\", buttonsBlock);\n" +
"        this.log(\"move to dms\", { card, id });\n" +
"        dmsButton.disabled = true;\n" +
"        dmsButton.classList.add(\"disabled\");\n" +
"        dmsButton.innerText = \"⟳\";\n" +
"        const invoice = await ModelFactory.getInvoice(id);\n" +
"        if (!invoice) {\n" +
"            dmsButton.innerText = \"⚠\";\n" +
"            Tooltip.make({ target: dmsButton, text: \"Impossible de trouver la facture #\" + id });\n" +
"            return;\n" +
"        }\n" +
"        const dmsItem = await invoice.moveToDms();\n" +
"        if (!dmsItem) {\n" +
"            dmsButton.innerText = \"⚠\";\n" +
"            Tooltip.make({ target: dmsButton, text: \"Impossible d'envoyer en GED (voir la console pour plus de détails)\" });\n" +
"            return;\n" +
"        }\n" +
"        buttonsBlock.closest(\".ui-card\")?.remove();\n" +
"        this.log(\"moveToDms\", { dmsItem });\n" +
"        TransactionValidMessage.getInstance().reload();\n" +
"    }\n" +
"}\n" +
"\n" +
"class NextInvalidTransaction extends OpenNextInvalid {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.id = \"next-invalid-transaction\";\n" +
"        this.storageKey = \"transactionValidation\";\n" +
"        this.idParamName = \"transaction_id\";\n" +
"    }\n" +
"    async init() {\n" +
"        // Wait for appending button in the matching page before init auto open service\n" +
"        await this.appendContainer();\n" +
"        this.cache = IDBCache.getInstance(this.storageKey, \"id\");\n" +
"        await super.init();\n" +
"    }\n" +
"    async *walk() {\n" +
"        // Load new added transactions\n" +
"        const max = await this.cache.reduce((acc, status) => Math.max(status.date, acc), 0);\n" +
"        if (max) {\n" +
"            const params = {\n" +
"                filter: JSON.stringify([{ field: \"created_at\", operator: \"gteq\", value: new Date(max).toISOString() }]),\n" +
"                sort: \"+created_at\",\n" +
"            };\n" +
"            for await (const transaction of getTransactionGenerator(params)) {\n" +
"                yield ModelFactory.getTransaction(transaction.id).getStatus();\n" +
"            }\n" +
"        }\n" +
"        // Load old unloaded transactions\n" +
"        const min = await this.cache.reduce((acc, status) => Math.min(status.date, acc), Date.now());\n" +
"        const params = {\n" +
"            filter: JSON.stringify([{ field: \"created_at\", operator: \"lteq\", value: new Date(min).toISOString() }]),\n" +
"            sort: \"-created_at\",\n" +
"        };\n" +
"        for await (const transaction of getTransactionGenerator(params)) {\n" +
"            yield ModelFactory.getTransaction(transaction.id).getStatus();\n" +
"        }\n" +
"    }\n" +
"    async getStatus(id, force) {\n" +
"        const transaction = ModelFactory.getTransaction(id);\n" +
"        return await transaction.getStatus(force);\n" +
"    }\n" +
"    /** Add \"next invalid transaction\" button on transactions list */\n" +
"    async appendContainer() {\n" +
"        const nextButton = await waitFunc(() => findElem(\"div\", \"Détails\")?.querySelector(\"button+button:last-child\") ?? false);\n" +
"        nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);\n" +
"        waitFunc(() => findElem(\"div\", \"Détails\")?.querySelector(\"button+button:last-child\") !== nextButton).then(() => this.appendContainer());\n" +
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
"            const invoice = await ModelFactory.getInvoice(rawInvoice.id);\n" +
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
"        await waitPage(\"DMSDetail\");\n" +
"        const container = findElem(\"div\", \"Nom du Fichier\").closest(\"div.w-100\");\n" +
"        this.container = parseHTML(`<div class=\"${container.firstElementChild.className}\"></div>`)\n" +
"            .firstElementChild;\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        await waitPage(\"DMSDetail\");\n" +
"        const rightList = findElem(\"div\", \"Nom du Fichier\").closest(\"div.w-100\");\n" +
"        const ref = getReactProps(rightList, 7).item;\n" +
"        rightList.insertBefore(this.container, rightList.firstChild);\n" +
"        const item = ModelFactory.getDMSItem(ref);\n" +
"        const message = await item.getValidMessage();\n" +
"        const dmsItem = await item.getItem();\n" +
"        this.container.innerHTML = `${dmsItem.archived_at ? \"📦\" : \"\"} #${dmsItem.itemable_id} (${dmsItem.id})<br/>${message}`;\n" +
"        const isOk = message === \"OK\";\n" +
"        this.container.classList.toggle(\"bg-warning-100\", !isOk);\n" +
"        this.container.classList.toggle(\"bg-primary-100\", isOk);\n" +
"        if (!isOk) {\n" +
"            const input = $('input[name=\"name\"]');\n" +
"            input?.focus();\n" +
"            input?.select();\n" +
"            const indexes = await item.partialMatch(input.value);\n" +
"            this.log(\"partialMatch indexes\", indexes, {\n" +
"                currentValue: input.value,\n" +
"                matchIndexes: indexes,\n" +
"                before: input.value.slice(0, indexes[0]),\n" +
"                match: input.value.slice(indexes[0], indexes[1]),\n" +
"                after: input.value.slice(indexes[1]),\n" +
"                template: indexes[2],\n" +
"            });\n" +
"            input.selectionStart = indexes[0];\n" +
"            input.selectionEnd = indexes[1];\n" +
"        }\n" +
"        await waitFunc(() => getReactProps(rightList, 7)?.item !== ref);\n" +
"        this.emit(\"reload\");\n" +
"        this.log(\"reload\");\n" +
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
"        await waitPage(\"transactionDetail\");\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        while (await waitPage(\"transactionDetail\")) {\n" +
"            const unmanagedDMSItems = $$(\".ui-card:not(.GM) span.tiny-caption\").filter((span) => !span.classList.contains(\"GM\") && span.innerText.startsWith(\"ajouté dans la GED le \"));\n" +
"            if (!unmanagedDMSItems.length) {\n" +
"                await sleep(2000);\n" +
"                continue;\n" +
"            }\n" +
"            for (const span of unmanagedDMSItems) {\n" +
"                this.debug({ span, fiber: getReact(span) });\n" +
"                const files = getReactPropValue(span, \"files\");\n" +
"                for (const file of files) {\n" +
"                    const dmsItem = ModelFactory.getDMSItem(file.item_id);\n" +
"                    const status = await dmsItem.getValidMessage();\n" +
"                    const card = $(`a[href$=\"${file.item_id}\"]`)?.closest(\".ui-card\");\n" +
"                    const nameDiv = $(\"div.d-block\", card);\n" +
"                    if (!card || !nameDiv) {\n" +
"                        this.log(\"nameDiv is null\", {\n" +
"                            span,\n" +
"                            file,\n" +
"                            files,\n" +
"                            status,\n" +
"                            dmsItem,\n" +
"                            card,\n" +
"                            nameDiv,\n" +
"                        });\n" +
"                        continue;\n" +
"                    }\n" +
"                    card.classList.add(\"GM\");\n" +
"                    this.debug({ nameDiv, file, files, status, closest: nameDiv.closest(\".ui-card\"), dmsItem });\n" +
"                    if (status !== \"OK\") {\n" +
"                        nameDiv.classList.add(\"bg-warning-100\");\n" +
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
"        await waitPage(\"DMSDetail\");\n" +
"        this.createButton();\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        await waitPage(\"DMSDetail\");\n" +
"        const div = await waitElem(\"div\", \"Liens avec la comptabilité\");\n" +
"        const buttonRef = $(\"button\", div.nextElementSibling);\n" +
"        buttonRef.parentElement.insertBefore(this.toInvoiceButton, buttonRef);\n" +
"        const rightList = findElem(\"div\", \"Nom du Fichier\").closest(\"div.w-100\");\n" +
"        const ref = getReactProps(rightList, 7).item;\n" +
"        await waitFunc(() => {\n" +
"            if (!this.toInvoiceButton.className)\n" +
"                this.toInvoiceButton.className = getButtonClassName();\n" +
"            return getReactProps(rightList, 7).item !== ref;\n" +
"        });\n" +
"        this.emit(\"reload\");\n" +
"        this.log(\"reload\");\n" +
"        this.watch();\n" +
"    }\n" +
"    createButton() {\n" +
"        this.toInvoiceButton = parseHTML(`<button class=\"${getButtonClassName()}\" style=\"padding: 0.5em 0.6em;\">🧾</button>`).firstElementChild;\n" +
"        Tooltip.make({ target: this.toInvoiceButton, text: \"Envoyer en facturation\" });\n" +
"        this.toInvoiceButton.addEventListener(\"click\", () => this.moveToInvoice());\n" +
"    }\n" +
"    async moveToInvoice() {\n" +
"        const rightList = findElem(\"div\", \"Nom du Fichier\").closest(\"div.w-100\");\n" +
"        const ref = getReactProps(rightList, 7).item;\n" +
"        const item = ModelFactory.getDMSItem(ref);\n" +
"        const invoice = await item.toInvoice();\n" +
"        openDocument(invoice.id);\n" +
"    }\n" +
"}\n" +
"\n" +
"class MoveDMSToInvoice extends Service {\n" +
"    async init() {\n" +
"        await waitPage(\"transactionDetail\");\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        while (await waitPage(\"transactionDetail\")) {\n" +
"            const unmanagedDMSItems = $$(\".ui-card:not(.GM-to-invoice) span.tiny-caption\").filter((span) => !span.classList.contains(\"GM-to-invoice\") && span.innerText.startsWith(\"ajouté dans la GED le \"));\n" +
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
"        const dmsItem = ModelFactory.getDMSItem(file.item_id);\n" +
"        const card = $(`a[href$=\"${file.item_id}\"]`)?.closest(\".ui-card\");\n" +
"        const buttonsBlock = $(\"button\", card).closest(\"div\");\n" +
"        if (card.classList.contains(\"GM-to-invoice\"))\n" +
"            return;\n" +
"        if (!card || !buttonsBlock) {\n" +
"            this.log(\"unable to find this file card\", { file, status, dmsItem, card, buttonsBlock });\n" +
"            return;\n" +
"        }\n" +
"        card.classList.add(\"GM-to-invoice\");\n" +
"        this.debug({ buttonsBlock, file, status, card, dmsItem });\n" +
"        const toInvoiceButton = parseHTML(`<button class=\"${getButtonClassName()} to-invoice-button\">🧾</button>`)\n" +
"            .firstElementChild;\n" +
"        Tooltip.make({ target: toInvoiceButton, text: \"Sortir de la GED et envoyer en facturation\" });\n" +
"        buttonsBlock.insertBefore(toInvoiceButton, buttonsBlock.firstChild);\n" +
"        toInvoiceButton.addEventListener(\"click\", () => this.moveToInvoice(dmsItem, card));\n" +
"    }\n" +
"    async moveToInvoice(item, card) {\n" +
"        const button = $(\".to-invoice-button\", card);\n" +
"        button.disabled = true;\n" +
"        button.classList.add(\"disabled\");\n" +
"        button.innerText = \"⟳\";\n" +
"        const invoice = await item.toInvoice();\n" +
"        if (invoice)\n" +
"            card.remove();\n" +
"        else\n" +
"            alert(\"move to invoice : erreur, voir la console\");\n" +
"        this.log(\"moveToInvoice\", { invoice });\n" +
"    }\n" +
"}\n" +
"\n" +
"class DMSListHasLinks extends Service {\n" +
"    async init() {\n" +
"        await waitPage(\"DMS\");\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        await waitPage(\"DMS\");\n" +
"        const cell = await waitElem(\"tr:not(.GM-has-links) td[role=cell]:nth-child(2) svg\");\n" +
"        await this.manageRow(cell);\n" +
"        this.watch();\n" +
"    }\n" +
"    async manageRow(cell) {\n" +
"        const row = cell.closest(\"tr\");\n" +
"        row.classList.add(\"GM-has-links\");\n" +
"        const data = getReactProps(cell, findReactProp(cell, \"data\"));\n" +
"        const dmsItem = ModelFactory.getDMSItem(data.row.original);\n" +
"        const links = await dmsItem.getLinks();\n" +
"        if (!links.length)\n" +
"            cell.parentElement.appendChild(document.createTextNode(\"x\"));\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * @unreleased\n" +
" */\n" +
"class PreviewDMSFiles extends Service {\n" +
"    async init() {\n" +
"        await waitPage(\"transactionDetail\");\n" +
"        this.watch();\n" +
"    }\n" +
"    async watch() {\n" +
"        while (await waitPage(\"transactionDetail\")) {\n" +
"            const unmanagedDMSItems = $$(\".ui-card:not(.GM-preview-dms) span.tiny-caption\").filter((span) => span.innerText.startsWith(\"ajouté dans la GED le \"));\n" +
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
"        this.log(\"manageFile\", { file });\n" +
"        const dmsItem = ModelFactory.getDMSItem(file.item_id);\n" +
"        const card = $(`a[href$=\"${file.item_id}\"]`)?.closest(\".ui-card\");\n" +
"        const img = $(\"img\", card);\n" +
"        if (card.classList.contains(\"GM-preview-dms\"))\n" +
"            return;\n" +
"        if (!card || !img) {\n" +
"            this.log(\"unable to find this file card\", { file, dmsItem, card, img });\n" +
"            return;\n" +
"        }\n" +
"        card.classList.add(\"GM-preview-dms\");\n" +
"        this.debug({ file, dmsItem, card, img });\n" +
"        img.addEventListener(\"click\", () => this.showDMS(dmsItem));\n" +
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
"        modal.querySelector(\".ui-modal-header-close-button\")?.addEventListener(\"click\", () => modal.remove());\n" +
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
"        this.id = \"next-invalid-dms\";\n" +
"        this.storageKey = \"DMSValidation\";\n" +
"        /** The location search param name of the currently showed item id. */\n" +
"        this.idParamName = \"item_id\";\n" +
"    }\n" +
"    async init() {\n" +
"        // Wait for appending button in the matched page before init auto open service\n" +
"        await this.appendContainer();\n" +
"        this.cache = IDBCache.getInstance(this.storageKey, \"id\");\n" +
"        await super.init();\n" +
"    }\n" +
"    async *walk() {\n" +
"        // Load new added items\n" +
"        for await (const status of this.walkItems(\"+\"))\n" +
"            yield status;\n" +
"        // Load old unloaded items\n" +
"        for await (const status of this.walkItems(\"-\"))\n" +
"            yield status;\n" +
"    }\n" +
"    async *walkItems(sort) {\n" +
"        const startFrom = sort === \"+\" ? 0 : Date.now();\n" +
"        const limit = await this.cache.reduce((acc, status) => Math[sort === \"+\" ? \"max\" : \"min\"](status.createdAt, acc), startFrom);\n" +
"        if (limit || sort === \"-\") {\n" +
"            this.log(`Recherche vers le ${sort === \"+\" ? \"futur\" : \"passé\"} depuis`, this.cache.find({ createdAt: limit }), {\n" +
"                cache: this.cache,\n" +
"            });\n" +
"            const operator = sort === \"+\" ? \"gteq\" : \"lteq\";\n" +
"            const value = new Date(limit).toISOString();\n" +
"            const params = {\n" +
"                filter: JSON.stringify([{ field: \"created_at\", operator, value }]),\n" +
"                sort: `${sort}created_at`,\n" +
"            };\n" +
"            for await (const dmsItem of getDMSItemGenerator(params)) {\n" +
"                const status = await ModelFactory.getDMSItem(dmsItem.id).getStatus();\n" +
"                yield { ...status };\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    async getStatus(id) {\n" +
"        const item = await ModelFactory.getDMSItem(id);\n" +
"        if (!item) {\n" +
"            this.error(\"getStatus\", \"item not found\", { id });\n" +
"            return null;\n" +
"        }\n" +
"        const status = await item.getStatus();\n" +
"        return status;\n" +
"    }\n" +
"    /** Add \"next invalid invoice\" button on invoices list */\n" +
"    async appendContainer() {\n" +
"        const ref = await waitPage(\"DMSDetail\");\n" +
"        const rightList = findElem(\"div\", \"Nom du Fichier\").closest(\"div.w-100\");\n" +
"        if (!this.containerWrapper) {\n" +
"            this.containerWrapper = parseHTML(`<div class=\"${rightList.firstElementChild.className}\"></div>`)\n" +
"                .firstElementChild;\n" +
"            this.containerWrapper.appendChild(this.container);\n" +
"        }\n" +
"        rightList.insertBefore(this.containerWrapper, rightList.firstChild);\n" +
"        waitFunc(() => isPage(\"DMSDetail\") !== ref).then(() => this.appendContainer());\n" +
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
"const statusCache = CacheStatus.getInstance(\"transactionValidation\");\n" +
"class AddIsValidTransactionListIndicator extends Service {\n" +
"    async init() {\n" +
"        this.watch();\n" +
"        statusCache.on(\"update\", ({ newValue }) => this.updateIndicator(newValue));\n" +
"    }\n" +
"    async watch() {\n" +
"        const checkboxDiv = (await waitElem(`div:not(.isValidReady)[data-tracking-action=\"Accounting Transactions - Row Selection Checkbox\"]`));\n" +
"        this.debug(\"found:\", checkboxDiv);\n" +
"        await this.addIndicator(checkboxDiv);\n" +
"        this.watch();\n" +
"    }\n" +
"    async addIndicator(checkboxDiv) {\n" +
"        const rawTransaction = APITransaction.Create(getReactPropValue(checkboxDiv, \"data\"));\n" +
"        const isValid = await this.getIsValid(rawTransaction);\n" +
"        checkboxDiv.classList.toggle(\"isValid\", isValid);\n" +
"        checkboxDiv.classList.add(\"isValidReady\");\n" +
"        checkboxDiv.classList.add(`isValid-${rawTransaction.id}`);\n" +
"        $(\"span\", checkboxDiv).style.background = isValid ? \"#00ff0030\" : \"#ff000030\";\n" +
"    }\n" +
"    async getIsValid(transaction) {\n" +
"        let status = statusCache.find({ id: transaction.id });\n" +
"        if (status)\n" +
"            return status.valid;\n" +
"        status = await ModelFactory.getTransaction(transaction.id).getStatus();\n" +
"        statusCache.updateItem({\n" +
"            id: transaction.id,\n" +
"            valid: status.valid,\n" +
"            message: \"\",\n" +
"            createdAt: Date.now(),\n" +
"            date: new Date(transaction.date).getTime(),\n" +
"        });\n" +
"        return status.valid;\n" +
"    }\n" +
"    updateIndicator(status) {\n" +
"        const checkboxDiv = $(`div.isValid-${status.id}`);\n" +
"        if (!checkboxDiv)\n" +
"            return;\n" +
"        this.debug(\"handle cache update\", status, checkboxDiv);\n" +
"        checkboxDiv.classList.toggle(\"isValid\", status.valid);\n" +
"        $(\"span\", checkboxDiv).style.background = status.valid ? \"#00ff0030\" : \"#ff000030\";\n" +
"    }\n" +
"}\n" +
"\n" +
"last7DaysFilter();\n" +
"AddInvoiceIdColumn.start();\n" +
"AddIsValidTransactionListIndicator.start();\n" +
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
"TransactionValidMessage.start();\n" +
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
"        beep,\n" +
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
