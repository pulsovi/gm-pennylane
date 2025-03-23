// ==UserScript==
// @name     Pennylane
// @version  0.1.21
// @grant    unsafeWindow
// @grant    GM.openInTab
// @match    https://app.pennylane.com/companies/*
// @icon     https://app.pennylane.com/favicon.ico
// ==/UserScript=='use strict';

function openTabService() {
    setInterval(() => {
        const elem = document.querySelector('div.open_tab');
        if (!elem)
            return;
        const url = unescape(elem.dataset.url ?? '');
        if (!url)
            return;
        console.log('GM_openInTab', { elem, url });
        GM.openInTab(url, { active: false, insert: true });
        elem.remove();
    }, 200);
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
"async function sleep(ms) {\n" +
"    await new Promise(rs => setTimeout(rs, ms));\n" +
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
"function parentElement(child, steps = 1) {\n" +
"    let parent = child;\n" +
"    for (let i = 0; i < steps; ++i)\n" +
"        parent = parent?.parentElement;\n" +
"    return parent;\n" +
"}\n" +
"function upElement(elem, upCount) {\n" +
"    let retval = elem;\n" +
"    for (let i = 0; i < upCount; ++i)\n" +
"        retval = retval?.parentElement;\n" +
"    return retval;\n" +
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
"Object.assign(window, { gm: {\n" +
"        $$,\n" +
"        $,\n" +
"        findElem,\n" +
"        parentElement,\n" +
"        parseHTML,\n" +
"        upElement,\n" +
"        waitElem,\n" +
"    } });\n" +
"\n" +
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
"function getReactProps(elem, up = 0) {\n" +
"    return getReact(elem, up)?.memoizedProps;\n" +
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
"        img.onerror = reject;\n" +
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
"        ?? findElem('div', 'Détails')?.querySelector('button+button:last-child');\n" +
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
"Object.assign(window, { GM_Pennylane_debug: window['GM_Pennylane_debug'] ?? false });\n" +
"class Logger extends EventEmitter {\n" +
"    constructor(name) {\n" +
"        super();\n" +
"        const background = textToColor(name ?? this.constructor.name);\n" +
"        const foreground = contrastScore(background, '#ffffff') > contrastScore(background, '#000000')\n" +
"            ? '#ffffff' : '#000000';\n" +
"        this.logColor = { bg: background, fg: foreground };\n" +
"    }\n" +
"    getStyles() {\n" +
"        return [\n" +
"            'background: #0b0b31; color: #fff; padding: 0.1em .3em; border-radius: 0.3em 0 0 0.3em;',\n" +
"            `background: ${this.logColor.bg}; color: ${this.logColor.fg}; padding: 0.1em .3em; border-radius: 0 0.3em 0.3em 0;`,\n" +
"            'background: #f2cc72; color: #555; padding: 0 .8em; border-radius: 1em; margin-left: 1em;',\n" +
"        ];\n" +
"    }\n" +
"    log(...messages) {\n" +
"        const date = new Date().toISOString().replace(/^[^T]*T([\\d:]*).*$/, '[$1]');\n" +
"        console.log(`${date} %cGM_Pennylane%c${this.constructor.name}`, ...this.getStyles().slice(0, 2), ...messages);\n" +
"    }\n" +
"    error(...messages) {\n" +
"        const date = new Date().toISOString().replace(/^[^T]*T([\\d:]*).*$/, '[$1]');\n" +
"        console.error(`${date} %cGM_Pennylane%c${this.constructor.name}`, ...this.getStyles().slice(0, 2), ...messages);\n" +
"    }\n" +
"    debug(...messages) {\n" +
"        if (!GM_Pennylane_debug)\n" +
"            return;\n" +
"        const date = new Date().toISOString().replace(/^[^T]*T([\\d:]*).*$/, '[$1]');\n" +
"        console.log(`${date} %cGM_Pennylane%c${this.constructor.name}%cDebug`, ...this.getStyles(), ...messages);\n" +
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
"        if (!this.instance)\n" +
"            this.instance = new this();\n" +
"        return this.instance;\n" +
"    }\n" +
"    init() { }\n" +
"    ;\n" +
"}\n" +
"\n" +
"let apiRequestWait = null;\n" +
"async function apiRequest(endpoint, data, method = 'POST') {\n" +
"    if (apiRequestWait)\n" +
"        await apiRequestWait;\n" +
"    const response = await fetch(`${location.href.split('/').slice(0, 5).join('/')}/${endpoint}`, {\n" +
"        method,\n" +
"        headers: {\n" +
"            \"Content-Type\": \"application/json\",\n" +
"            \"X-COMPANY-CONTEXT-DATA-UPDATED-AT\": \"2024-03-25T20:22:38.289Z\",\n" +
"            \"X-PLAN-USED-BY-FRONT-END\": \"v1_saas_free\",\n" +
"            \"X-FRONTEND-LAST-APPLICATION-LOADED-AT\": \"2024-03-25T20:22:37.968Z\",\n" +
"            \"X-CSRF-TOKEN\": getCookies('my_csrf_token'),\n" +
"            \"X-DEPLOYMENT\": \"2023-04-19\",\n" +
"            \"X-SOURCE-VERSION\": \"e0c18c0\",\n" +
"            \"X-SOURCE-VERSION-BUILT-AT\": \"2024-03-25T18:05:09.769Z\",\n" +
"            \"X-DOCUMENT-REFERRER\": location.origin + location.pathname,\n" +
"            Accept: 'application/json'\n" +
"        },\n" +
"        body: data ? JSON.stringify(data) : null,\n" +
"    }).catch(error => ({ error }));\n" +
"    if ('error' in response) {\n" +
"        console.log('API request error :', { endpoint, data, method, error: response.error });\n" +
"        apiRequestWait = sleep(3000).then(() => { apiRequestWait = null; });\n" +
"        return apiRequest(endpoint, data, method);\n" +
"    }\n" +
"    if (response.status === 429\n" +
"        && await response.clone().text() === \"You made too many requests. Time to take a break?\") {\n" +
"        apiRequestWait = sleep(1000).then(() => { apiRequestWait = null; });\n" +
"        return apiRequest(endpoint, data, method);\n" +
"    }\n" +
"    if (response.status === 422) {\n" +
"        const message = (await response.clone().json()).message;\n" +
"        if (message) {\n" +
"            alert(message);\n" +
"            return null;\n" +
"        }\n" +
"    }\n" +
"    if (response.status === 404) {\n" +
"        console.log('API Request: page introuvable', { endpoint, data, method });\n" +
"        return null;\n" +
"    }\n" +
"    if (response.status !== 200) {\n" +
"        console.log('apiRequest response status is not 200', { response });\n" +
"        throw new Error('Todo : améliorer le message ci-dessus');\n" +
"    }\n" +
"    return response;\n" +
"}\n" +
"function getCookies(key) {\n" +
"    const allCookies = new URLSearchParams(document.cookie.split(';').map(c => c.trim()).join('&'));\n" +
"    return allCookies.get(key);\n" +
"}\n" +
"Object.assign(window, { apiRequest });\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$a = 'APIDocument';\n" +
"let obj$a = null;\n" +
"class APIDocument {\n" +
"    static Parse(d) {\n" +
"        return APIDocument.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$9(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, false);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkNumber$8(d.company_id, false, field + \".company_id\");\n" +
"        checkString$9(d.date, true, field + \".date\");\n" +
"        checkString$9(d.created_at, false, field + \".created_at\");\n" +
"        checkString$9(d.updated_at, false, field + \".updated_at\");\n" +
"        checkString$9(d.archived_at, true, field + \".archived_at\");\n" +
"        checkString$9(d.type, false, field + \".type\");\n" +
"        checkString$9(d.source, false, field + \".source\");\n" +
"        checkBoolean$7(d.draft, false, field + \".draft\");\n" +
"        checkString$9(d.group_uuid, false, field + \".group_uuid\");\n" +
"        checkString$9(d.gdrive_path, true, field + \".gdrive_path\");\n" +
"        checkString$9(d.preview_status, true, field + \".preview_status\");\n" +
"        checkString$9(d.pusher_channel, false, field + \".pusher_channel\");\n" +
"        checkNull$5(d.email_from, field + \".email_from\");\n" +
"        checkNull$5(d.score, field + \".score\");\n" +
"        checkBoolean$7(d.is_waiting_details, false, field + \".is_waiting_details\");\n" +
"        checkString$9(d.external_id, false, field + \".external_id\");\n" +
"        checkNumber$8(d.journal_id, false, field + \".journal_id\");\n" +
"        checkString$9(d.grouped_at, true, field + \".grouped_at\");\n" +
"        checkBoolean$7(d.attachment_required, false, field + \".attachment_required\");\n" +
"        checkBoolean$7(d.attachment_lost, false, field + \".attachment_lost\");\n" +
"        checkString$9(d.pdf_generation_status, false, field + \".pdf_generation_status\");\n" +
"        checkNull$5(d.reversal_origin_id, field + \".reversal_origin_id\");\n" +
"        checkNull$5(d.billing_subscription_id, field + \".billing_subscription_id\");\n" +
"        checkString$9(d.fec_pieceref, false, field + \".fec_pieceref\");\n" +
"        checkString$9(d.label, false, field + \".label\");\n" +
"        checkString$9(d.url, false, field + \".url\");\n" +
"        checkString$9(d.method, false, field + \".method\");\n" +
"        checkBoolean$7(d.accounting_type, false, field + \".accounting_type\");\n" +
"        checkBoolean$7(d.archived, false, field + \".archived\");\n" +
"        checkBoolean$7(d.quotes, false, field + \".quotes\");\n" +
"        checkBoolean$7(d.readonly, false, field + \".readonly\");\n" +
"        checkNumber$8(d.account_id, true, field + \".account_id\");\n" +
"        checkNumber$8(d.thirdparty_id, true, field + \".thirdparty_id\");\n" +
"        checkNull$5(d.payment_id, field + \".payment_id\");\n" +
"        checkString$9(d.amount, false, field + \".amount\");\n" +
"        checkString$9(d.currency, false, field + \".currency\");\n" +
"        checkString$9(d.currency_amount, false, field + \".currency_amount\");\n" +
"        checkString$9(d.outstanding_balance, false, field + \".outstanding_balance\");\n" +
"        checkNumber$8(d.completeness, true, field + \".completeness\");\n" +
"        checkString$9(d.gross_amount, true, field + \".gross_amount\");\n" +
"        checkString$9(d.status, true, field + \".status\");\n" +
"        checkBoolean$7(d.complete, true, field + \".complete\");\n" +
"        d.company = Company.Create(d.company, field + \".company\");\n" +
"        d.scored_invoices = ScoredInvoices.Create(d.scored_invoices, field + \".scored_invoices\");\n" +
"        checkArray$5(d.grouped_documents, field + \".grouped_documents\");\n" +
"        if (d.grouped_documents) {\n" +
"            for (let i = 0; i < d.grouped_documents.length; i++) {\n" +
"                d.grouped_documents[i] = GroupedDocumentsEntity.Create(d.grouped_documents[i], field + \".grouped_documents\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$7(d.is_waiting_for_ocr, true, field + \".is_waiting_for_ocr\");\n" +
"        checkNumber$8(d.ocr_thirdparty_id, true, field + \".ocr_thirdparty_id\");\n" +
"        checkString$9(d.direction, true, field + \".direction\");\n" +
"        checkString$9(d.deadline, true, field + \".deadline\");\n" +
"        checkNumber$8(d.multiplier, true, field + \".multiplier\");\n" +
"        checkString$9(d.price_before_tax, true, field + \".price_before_tax\");\n" +
"        checkNull$5(d.quote_uid, field + \".quote_uid\");\n" +
"        checkNull$5(d.special_mention, field + \".special_mention\");\n" +
"        checkBoolean$7(d.not_duplicate, true, field + \".not_duplicate\");\n" +
"        checkBoolean$7(d.validation_needed, true, field + \".validation_needed\");\n" +
"        checkString$9(d.currency_tax, true, field + \".currency_tax\");\n" +
"        checkString$9(d.currency_price_before_tax, true, field + \".currency_price_before_tax\");\n" +
"        checkString$9(d.language, true, field + \".language\");\n" +
"        checkString$9(d.payment_status, true, field + \".payment_status\");\n" +
"        checkNull$5(d.payment_method, field + \".payment_method\");\n" +
"        checkString$9(d.invoice_number, true, field + \".invoice_number\");\n" +
"        checkString$9(d.tax, true, field + \".tax\");\n" +
"        checkNull$5(d.estimate_status, field + \".estimate_status\");\n" +
"        checkString$9(d.iban, true, field + \".iban\");\n" +
"        checkBoolean$7(d.paid, true, field + \".paid\");\n" +
"        checkNumber$8(d.future_in_days, true, field + \".future_in_days\");\n" +
"        checkString$9(d.discount, true, field + \".discount\");\n" +
"        checkString$9(d.discount_type, true, field + \".discount_type\");\n" +
"        checkNull$5(d.finalized_at, field + \".finalized_at\");\n" +
"        checkString$9(d.quote_group_uuid, true, field + \".quote_group_uuid\");\n" +
"        checkString$9(d.factor_status, true, field + \".factor_status\");\n" +
"        checkString$9(d.currency_amount_before_tax, true, field + \".currency_amount_before_tax\");\n" +
"        checkNull$5(d.from_estimate_id, field + \".from_estimate_id\");\n" +
"        checkString$9(d.credit_notes_amount, true, field + \".credit_notes_amount\");\n" +
"        checkBoolean$7(d.payment_reminder_enabled, true, field + \".payment_reminder_enabled\");\n" +
"        checkString$9(d.payment_reference, true, field + \".payment_reference\");\n" +
"        checkBoolean$7(d.is_credit_note, true, field + \".is_credit_note\");\n" +
"        checkBoolean$7(d.is_estimate, true, field + \".is_estimate\");\n" +
"        checkBoolean$7(d.is_destroyable, true, field + \".is_destroyable\");\n" +
"        checkBoolean$7(d.can_be_stamped_as_paid_in_pdf, true, field + \".can_be_stamped_as_paid_in_pdf\");\n" +
"        checkString$9(d.custom_payment_reference, true, field + \".custom_payment_reference\");\n" +
"        checkArray$5(d.scored_transactions, field + \".scored_transactions\");\n" +
"        if (d.scored_transactions) {\n" +
"            for (let i = 0; i < d.scored_transactions.length; i++) {\n" +
"                checkNull$5(d.scored_transactions[i], field + \".scored_transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$5(d.recipients, field + \".recipients\");\n" +
"        if (d.recipients) {\n" +
"            for (let i = 0; i < d.recipients.length; i++) {\n" +
"                checkNull$5(d.recipients[i], field + \".recipients\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$9(d.invoice_kind, true, field + \".invoice_kind\");\n" +
"        checkString$9(d.pdf_invoice_title, true, field + \".pdf_invoice_title\");\n" +
"        checkString$9(d.pdf_invoice_free_text, true, field + \".pdf_invoice_free_text\");\n" +
"        checkBoolean$7(d.pdf_invoice_free_text_enabled, true, field + \".pdf_invoice_free_text_enabled\");\n" +
"        checkString$9(d.pdf_invoice_subject, true, field + \".pdf_invoice_subject\");\n" +
"        checkBoolean$7(d.pdf_invoice_subject_enabled, true, field + \".pdf_invoice_subject_enabled\");\n" +
"        checkBoolean$7(d.pdf_invoice_display_products_list, true, field + \".pdf_invoice_display_products_list\");\n" +
"        checkBoolean$7(d.pdf_paid_stamp, true, field + \".pdf_paid_stamp\");\n" +
"        checkNull$5(d.invoicing_detailed_source, field + \".invoicing_detailed_source\");\n" +
"        checkBoolean$7(d.manual_partial_invoices, true, field + \".manual_partial_invoices\");\n" +
"        const knownProperties = [\"id\", \"company_id\", \"date\", \"created_at\", \"updated_at\", \"archived_at\", \"type\", \"source\", \"draft\", \"group_uuid\", \"gdrive_path\", \"preview_status\", \"pusher_channel\", \"email_from\", \"score\", \"is_waiting_details\", \"external_id\", \"journal_id\", \"grouped_at\", \"attachment_required\", \"attachment_lost\", \"pdf_generation_status\", \"reversal_origin_id\", \"billing_subscription_id\", \"fec_pieceref\", \"label\", \"url\", \"method\", \"accounting_type\", \"archived\", \"quotes\", \"readonly\", \"account_id\", \"thirdparty_id\", \"payment_id\", \"amount\", \"currency\", \"currency_amount\", \"outstanding_balance\", \"completeness\", \"gross_amount\", \"status\", \"complete\", \"company\", \"scored_invoices\", \"grouped_documents\", \"is_waiting_for_ocr\", \"ocr_thirdparty_id\", \"direction\", \"deadline\", \"multiplier\", \"price_before_tax\", \"quote_uid\", \"special_mention\", \"not_duplicate\", \"validation_needed\", \"currency_tax\", \"currency_price_before_tax\", \"language\", \"payment_status\", \"payment_method\", \"invoice_number\", \"tax\", \"estimate_status\", \"iban\", \"paid\", \"future_in_days\", \"discount\", \"discount_type\", \"finalized_at\", \"quote_group_uuid\", \"factor_status\", \"currency_amount_before_tax\", \"from_estimate_id\", \"credit_notes_amount\", \"payment_reminder_enabled\", \"payment_reference\", \"is_credit_note\", \"is_estimate\", \"is_destroyable\", \"can_be_stamped_as_paid_in_pdf\", \"custom_payment_reference\", \"scored_transactions\", \"recipients\", \"invoice_kind\", \"pdf_invoice_title\", \"pdf_invoice_free_text\", \"pdf_invoice_free_text_enabled\", \"pdf_invoice_subject\", \"pdf_invoice_subject_enabled\", \"pdf_invoice_display_products_list\", \"pdf_paid_stamp\", \"invoicing_detailed_source\", \"manual_partial_invoices\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new APIDocument(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.company_id = d.company_id;\n" +
"        if (\"date\" in d)\n" +
"            this.date = d.date;\n" +
"        this.created_at = d.created_at;\n" +
"        this.updated_at = d.updated_at;\n" +
"        if (\"archived_at\" in d)\n" +
"            this.archived_at = d.archived_at;\n" +
"        this.type = d.type;\n" +
"        this.source = d.source;\n" +
"        this.draft = d.draft;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        if (\"gdrive_path\" in d)\n" +
"            this.gdrive_path = d.gdrive_path;\n" +
"        if (\"preview_status\" in d)\n" +
"            this.preview_status = d.preview_status;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        if (\"email_from\" in d)\n" +
"            this.email_from = d.email_from;\n" +
"        if (\"score\" in d)\n" +
"            this.score = d.score;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        this.external_id = d.external_id;\n" +
"        this.journal_id = d.journal_id;\n" +
"        if (\"grouped_at\" in d)\n" +
"            this.grouped_at = d.grouped_at;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.attachment_lost = d.attachment_lost;\n" +
"        this.pdf_generation_status = d.pdf_generation_status;\n" +
"        if (\"reversal_origin_id\" in d)\n" +
"            this.reversal_origin_id = d.reversal_origin_id;\n" +
"        if (\"billing_subscription_id\" in d)\n" +
"            this.billing_subscription_id = d.billing_subscription_id;\n" +
"        this.fec_pieceref = d.fec_pieceref;\n" +
"        this.label = d.label;\n" +
"        this.url = d.url;\n" +
"        this.method = d.method;\n" +
"        this.accounting_type = d.accounting_type;\n" +
"        this.archived = d.archived;\n" +
"        this.quotes = d.quotes;\n" +
"        this.readonly = d.readonly;\n" +
"        if (\"account_id\" in d)\n" +
"            this.account_id = d.account_id;\n" +
"        if (\"thirdparty_id\" in d)\n" +
"            this.thirdparty_id = d.thirdparty_id;\n" +
"        if (\"payment_id\" in d)\n" +
"            this.payment_id = d.payment_id;\n" +
"        this.amount = d.amount;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        if (\"completeness\" in d)\n" +
"            this.completeness = d.completeness;\n" +
"        if (\"gross_amount\" in d)\n" +
"            this.gross_amount = d.gross_amount;\n" +
"        if (\"status\" in d)\n" +
"            this.status = d.status;\n" +
"        if (\"complete\" in d)\n" +
"            this.complete = d.complete;\n" +
"        if (\"company\" in d)\n" +
"            this.company = d.company;\n" +
"        if (\"scored_invoices\" in d)\n" +
"            this.scored_invoices = d.scored_invoices;\n" +
"        if (\"grouped_documents\" in d)\n" +
"            this.grouped_documents = d.grouped_documents;\n" +
"        if (\"is_waiting_for_ocr\" in d)\n" +
"            this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        if (\"ocr_thirdparty_id\" in d)\n" +
"            this.ocr_thirdparty_id = d.ocr_thirdparty_id;\n" +
"        if (\"direction\" in d)\n" +
"            this.direction = d.direction;\n" +
"        if (\"deadline\" in d)\n" +
"            this.deadline = d.deadline;\n" +
"        if (\"multiplier\" in d)\n" +
"            this.multiplier = d.multiplier;\n" +
"        if (\"price_before_tax\" in d)\n" +
"            this.price_before_tax = d.price_before_tax;\n" +
"        if (\"quote_uid\" in d)\n" +
"            this.quote_uid = d.quote_uid;\n" +
"        if (\"special_mention\" in d)\n" +
"            this.special_mention = d.special_mention;\n" +
"        if (\"not_duplicate\" in d)\n" +
"            this.not_duplicate = d.not_duplicate;\n" +
"        if (\"validation_needed\" in d)\n" +
"            this.validation_needed = d.validation_needed;\n" +
"        if (\"currency_tax\" in d)\n" +
"            this.currency_tax = d.currency_tax;\n" +
"        if (\"currency_price_before_tax\" in d)\n" +
"            this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        if (\"language\" in d)\n" +
"            this.language = d.language;\n" +
"        if (\"payment_status\" in d)\n" +
"            this.payment_status = d.payment_status;\n" +
"        if (\"payment_method\" in d)\n" +
"            this.payment_method = d.payment_method;\n" +
"        if (\"invoice_number\" in d)\n" +
"            this.invoice_number = d.invoice_number;\n" +
"        if (\"tax\" in d)\n" +
"            this.tax = d.tax;\n" +
"        if (\"estimate_status\" in d)\n" +
"            this.estimate_status = d.estimate_status;\n" +
"        if (\"iban\" in d)\n" +
"            this.iban = d.iban;\n" +
"        if (\"paid\" in d)\n" +
"            this.paid = d.paid;\n" +
"        if (\"future_in_days\" in d)\n" +
"            this.future_in_days = d.future_in_days;\n" +
"        if (\"discount\" in d)\n" +
"            this.discount = d.discount;\n" +
"        if (\"discount_type\" in d)\n" +
"            this.discount_type = d.discount_type;\n" +
"        if (\"finalized_at\" in d)\n" +
"            this.finalized_at = d.finalized_at;\n" +
"        if (\"quote_group_uuid\" in d)\n" +
"            this.quote_group_uuid = d.quote_group_uuid;\n" +
"        if (\"factor_status\" in d)\n" +
"            this.factor_status = d.factor_status;\n" +
"        if (\"currency_amount_before_tax\" in d)\n" +
"            this.currency_amount_before_tax = d.currency_amount_before_tax;\n" +
"        if (\"from_estimate_id\" in d)\n" +
"            this.from_estimate_id = d.from_estimate_id;\n" +
"        if (\"credit_notes_amount\" in d)\n" +
"            this.credit_notes_amount = d.credit_notes_amount;\n" +
"        if (\"payment_reminder_enabled\" in d)\n" +
"            this.payment_reminder_enabled = d.payment_reminder_enabled;\n" +
"        if (\"payment_reference\" in d)\n" +
"            this.payment_reference = d.payment_reference;\n" +
"        if (\"is_credit_note\" in d)\n" +
"            this.is_credit_note = d.is_credit_note;\n" +
"        if (\"is_estimate\" in d)\n" +
"            this.is_estimate = d.is_estimate;\n" +
"        if (\"is_destroyable\" in d)\n" +
"            this.is_destroyable = d.is_destroyable;\n" +
"        if (\"can_be_stamped_as_paid_in_pdf\" in d)\n" +
"            this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;\n" +
"        if (\"custom_payment_reference\" in d)\n" +
"            this.custom_payment_reference = d.custom_payment_reference;\n" +
"        if (\"scored_transactions\" in d)\n" +
"            this.scored_transactions = d.scored_transactions;\n" +
"        if (\"recipients\" in d)\n" +
"            this.recipients = d.recipients;\n" +
"        if (\"invoice_kind\" in d)\n" +
"            this.invoice_kind = d.invoice_kind;\n" +
"        if (\"pdf_invoice_title\" in d)\n" +
"            this.pdf_invoice_title = d.pdf_invoice_title;\n" +
"        if (\"pdf_invoice_free_text\" in d)\n" +
"            this.pdf_invoice_free_text = d.pdf_invoice_free_text;\n" +
"        if (\"pdf_invoice_free_text_enabled\" in d)\n" +
"            this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;\n" +
"        if (\"pdf_invoice_subject\" in d)\n" +
"            this.pdf_invoice_subject = d.pdf_invoice_subject;\n" +
"        if (\"pdf_invoice_subject_enabled\" in d)\n" +
"            this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;\n" +
"        if (\"pdf_invoice_display_products_list\" in d)\n" +
"            this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;\n" +
"        if (\"pdf_paid_stamp\" in d)\n" +
"            this.pdf_paid_stamp = d.pdf_paid_stamp;\n" +
"        if (\"invoicing_detailed_source\" in d)\n" +
"            this.invoicing_detailed_source = d.invoicing_detailed_source;\n" +
"        if (\"manual_partial_invoices\" in d)\n" +
"            this.manual_partial_invoices = d.manual_partial_invoices;\n" +
"    }\n" +
"}\n" +
"class Company {\n" +
"    static Parse(d) {\n" +
"        return Company.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkString$9(d.name, false, field + \".name\");\n" +
"        const knownProperties = [\"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new Company(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.name = d.name;\n" +
"    }\n" +
"}\n" +
"class ScoredInvoices {\n" +
"    static Parse(d) {\n" +
"        return ScoredInvoices.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        const knownProperties = [];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new ScoredInvoices(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"    }\n" +
"}\n" +
"class GroupedDocumentsEntity {\n" +
"    static Parse(d) {\n" +
"        return GroupedDocumentsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$9(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, false);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkNumber$8(d.company_id, false, field + \".company_id\");\n" +
"        checkString$9(d.date, true, field + \".date\");\n" +
"        checkString$9(d.created_at, false, field + \".created_at\");\n" +
"        checkString$9(d.updated_at, false, field + \".updated_at\");\n" +
"        checkString$9(d.archived_at, true, field + \".archived_at\");\n" +
"        checkString$9(d.type, false, field + \".type\");\n" +
"        checkString$9(d.source, false, field + \".source\");\n" +
"        checkBoolean$7(d.draft, false, field + \".draft\");\n" +
"        checkString$9(d.group_uuid, false, field + \".group_uuid\");\n" +
"        checkString$9(d.gdrive_path, true, field + \".gdrive_path\");\n" +
"        checkString$9(d.preview_status, true, field + \".preview_status\");\n" +
"        checkString$9(d.pusher_channel, false, field + \".pusher_channel\");\n" +
"        checkNull$5(d.email_from, field + \".email_from\");\n" +
"        checkNull$5(d.score, field + \".score\");\n" +
"        checkBoolean$7(d.is_waiting_details, false, field + \".is_waiting_details\");\n" +
"        checkString$9(d.external_id, false, field + \".external_id\");\n" +
"        checkNumber$8(d.journal_id, false, field + \".journal_id\");\n" +
"        checkString$9(d.grouped_at, true, field + \".grouped_at\");\n" +
"        checkBoolean$7(d.attachment_required, false, field + \".attachment_required\");\n" +
"        checkBoolean$7(d.attachment_lost, false, field + \".attachment_lost\");\n" +
"        checkString$9(d.pdf_generation_status, false, field + \".pdf_generation_status\");\n" +
"        checkNull$5(d.reversal_origin_id, field + \".reversal_origin_id\");\n" +
"        checkNull$5(d.billing_subscription_id, field + \".billing_subscription_id\");\n" +
"        checkString$9(d.fec_pieceref, false, field + \".fec_pieceref\");\n" +
"        checkString$9(d.label, false, field + \".label\");\n" +
"        d.journal = Journal$1.Create(d.journal, field + \".journal\");\n" +
"        checkString$9(d.url, false, field + \".url\");\n" +
"        checkString$9(d.method, false, field + \".method\");\n" +
"        checkBoolean$7(d.accounting_type, false, field + \".accounting_type\");\n" +
"        checkArray$5(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString$9(d.preview_urls[i], true, field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$7(d.archived, false, field + \".archived\");\n" +
"        checkBoolean$7(d.quotes, false, field + \".quotes\");\n" +
"        checkString$9(d.filename, true, field + \".filename\");\n" +
"        checkBoolean$7(d.has_file, false, field + \".has_file\");\n" +
"        checkBoolean$7(d.readonly, false, field + \".readonly\");\n" +
"        checkNumber$8(d.account_id, true, field + \".account_id\");\n" +
"        checkNumber$8(d.thirdparty_id, true, field + \".thirdparty_id\");\n" +
"        checkNull$5(d.payment_id, field + \".payment_id\");\n" +
"        checkString$9(d.amount, false, field + \".amount\");\n" +
"        checkString$9(d.currency, false, field + \".currency\");\n" +
"        checkString$9(d.currency_amount, false, field + \".currency_amount\");\n" +
"        checkString$9(d.outstanding_balance, false, field + \".outstanding_balance\");\n" +
"        checkNumber$8(d.completeness, false, field + \".completeness\");\n" +
"        checkString$9(d.gross_amount, true, field + \".gross_amount\");\n" +
"        checkString$9(d.status, true, field + \".status\");\n" +
"        checkBoolean$7(d.complete, false, field + \".complete\");\n" +
"        d.account = Account.Create(d.account, field + \".account\");\n" +
"        d.company = Company1.Create(d.company, field + \".company\");\n" +
"        d.scored_invoices = ScoredInvoices1.Create(d.scored_invoices, field + \".scored_invoices\");\n" +
"        checkNull$5(d.is_accounting_needed, field + \".is_accounting_needed\");\n" +
"        checkBoolean$7(d.pending, false, field + \".pending\");\n" +
"        checkBoolean$7(d.hasTooManyLedgerEvents, false, field + \".hasTooManyLedgerEvents\");\n" +
"        checkNumber$8(d.ledgerEventsCount, false, field + \".ledgerEventsCount\");\n" +
"        checkArray$5(d.ledgerEvents, field + \".ledgerEvents\");\n" +
"        if (d.ledgerEvents) {\n" +
"            for (let i = 0; i < d.ledgerEvents.length; i++) {\n" +
"                d.ledgerEvents[i] = LedgerEventsEntity.Create(d.ledgerEvents[i], field + \".ledgerEvents\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$7(d.reconciled, false, field + \".reconciled\");\n" +
"        checkArray$5(d.client_comments, field + \".client_comments\");\n" +
"        if (d.client_comments) {\n" +
"            for (let i = 0; i < d.client_comments.length; i++) {\n" +
"                d.client_comments[i] = ClientCommentsEntityOrEstablishmentComment.Create(d.client_comments[i], field + \".client_comments\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$7(d.is_waiting_for_ocr, true, field + \".is_waiting_for_ocr\");\n" +
"        checkBoolean$7(d.has_linked_quotes, true, field + \".has_linked_quotes\");\n" +
"        checkString$9(d.size, true, field + \".size\");\n" +
"        checkBoolean$7(d.embeddable_in_browser, true, field + \".embeddable_in_browser\");\n" +
"        checkNumber$8(d.ocr_thirdparty_id, true, field + \".ocr_thirdparty_id\");\n" +
"        checkString$9(d.direction, true, field + \".direction\");\n" +
"        checkString$9(d.deadline, true, field + \".deadline\");\n" +
"        checkNumber$8(d.multiplier, true, field + \".multiplier\");\n" +
"        checkString$9(d.price_before_tax, true, field + \".price_before_tax\");\n" +
"        checkNull$5(d.quote_uid, field + \".quote_uid\");\n" +
"        checkNull$5(d.special_mention, field + \".special_mention\");\n" +
"        checkBoolean$7(d.not_duplicate, true, field + \".not_duplicate\");\n" +
"        checkBoolean$7(d.validation_needed, true, field + \".validation_needed\");\n" +
"        checkString$9(d.currency_tax, true, field + \".currency_tax\");\n" +
"        checkString$9(d.currency_price_before_tax, true, field + \".currency_price_before_tax\");\n" +
"        checkString$9(d.language, true, field + \".language\");\n" +
"        checkString$9(d.payment_status, true, field + \".payment_status\");\n" +
"        checkNull$5(d.payment_method, field + \".payment_method\");\n" +
"        checkString$9(d.invoice_number, true, field + \".invoice_number\");\n" +
"        checkString$9(d.tax, true, field + \".tax\");\n" +
"        checkNull$5(d.estimate_status, field + \".estimate_status\");\n" +
"        checkString$9(d.iban, true, field + \".iban\");\n" +
"        checkBoolean$7(d.paid, true, field + \".paid\");\n" +
"        checkNumber$8(d.future_in_days, true, field + \".future_in_days\");\n" +
"        checkString$9(d.discount, true, field + \".discount\");\n" +
"        checkString$9(d.discount_type, true, field + \".discount_type\");\n" +
"        checkNull$5(d.finalized_at, field + \".finalized_at\");\n" +
"        checkString$9(d.quote_group_uuid, true, field + \".quote_group_uuid\");\n" +
"        checkString$9(d.factor_status, true, field + \".factor_status\");\n" +
"        checkString$9(d.currency_amount_before_tax, true, field + \".currency_amount_before_tax\");\n" +
"        checkNull$5(d.from_estimate_id, field + \".from_estimate_id\");\n" +
"        checkString$9(d.credit_notes_amount, true, field + \".credit_notes_amount\");\n" +
"        checkBoolean$7(d.payment_reminder_enabled, true, field + \".payment_reminder_enabled\");\n" +
"        checkString$9(d.payment_reference, true, field + \".payment_reference\");\n" +
"        checkBoolean$7(d.is_credit_note, true, field + \".is_credit_note\");\n" +
"        checkBoolean$7(d.is_estimate, true, field + \".is_estimate\");\n" +
"        checkBoolean$7(d.is_destroyable, true, field + \".is_destroyable\");\n" +
"        checkBoolean$7(d.can_be_stamped_as_paid_in_pdf, true, field + \".can_be_stamped_as_paid_in_pdf\");\n" +
"        checkString$9(d.custom_payment_reference, true, field + \".custom_payment_reference\");\n" +
"        checkArray$5(d.scored_transactions, field + \".scored_transactions\");\n" +
"        if (d.scored_transactions) {\n" +
"            for (let i = 0; i < d.scored_transactions.length; i++) {\n" +
"                checkNull$5(d.scored_transactions[i], field + \".scored_transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$7(d.is_sendable, true, field + \".is_sendable\");\n" +
"        checkBoolean$7(d.incomplete, true, field + \".incomplete\");\n" +
"        checkBoolean$7(d.subcomplete, true, field + \".subcomplete\");\n" +
"        checkString$9(d.attachment_label, true, field + \".attachment_label\");\n" +
"        checkString$9(d.accounting_status, true, field + \".accounting_status\");\n" +
"        d.thirdparty = Thirdparty$2.Create(d.thirdparty, field + \".thirdparty\");\n" +
"        checkArray$5(d.recipients, field + \".recipients\");\n" +
"        if (d.recipients) {\n" +
"            for (let i = 0; i < d.recipients.length; i++) {\n" +
"                checkNull$5(d.recipients[i], field + \".recipients\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$5(d.invoice_lines, field + \".invoice_lines\");\n" +
"        if (d.invoice_lines) {\n" +
"            for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                d.invoice_lines[i] = InvoiceLinesEntity$2.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$9(d.invoice_kind, true, field + \".invoice_kind\");\n" +
"        checkString$9(d.file_signed_id, true, field + \".file_signed_id\");\n" +
"        checkNumber$8(d.pages_count, true, field + \".pages_count\");\n" +
"        checkBoolean$7(d.tagged_at_ledger_events_level, true, field + \".tagged_at_ledger_events_level\");\n" +
"        checkString$9(d.pdf_invoice_title, true, field + \".pdf_invoice_title\");\n" +
"        checkString$9(d.pdf_invoice_free_text, true, field + \".pdf_invoice_free_text\");\n" +
"        checkBoolean$7(d.pdf_invoice_free_text_enabled, true, field + \".pdf_invoice_free_text_enabled\");\n" +
"        checkString$9(d.pdf_invoice_subject, true, field + \".pdf_invoice_subject\");\n" +
"        checkBoolean$7(d.pdf_invoice_subject_enabled, true, field + \".pdf_invoice_subject_enabled\");\n" +
"        checkBoolean$7(d.pdf_invoice_display_products_list, true, field + \".pdf_invoice_display_products_list\");\n" +
"        checkBoolean$7(d.pdf_paid_stamp, true, field + \".pdf_paid_stamp\");\n" +
"        checkNull$5(d.invoicing_detailed_source, field + \".invoicing_detailed_source\");\n" +
"        checkBoolean$7(d.manual_partial_invoices, true, field + \".manual_partial_invoices\");\n" +
"        d.establishment_comment = EstablishmentComment.Create(d.establishment_comment, field + \".establishment_comment\");\n" +
"        const knownProperties = [\"id\", \"company_id\", \"date\", \"created_at\", \"updated_at\", \"archived_at\", \"type\", \"source\", \"draft\", \"group_uuid\", \"gdrive_path\", \"preview_status\", \"pusher_channel\", \"email_from\", \"score\", \"is_waiting_details\", \"external_id\", \"journal_id\", \"grouped_at\", \"attachment_required\", \"attachment_lost\", \"pdf_generation_status\", \"reversal_origin_id\", \"billing_subscription_id\", \"fec_pieceref\", \"label\", \"journal\", \"url\", \"method\", \"accounting_type\", \"preview_urls\", \"archived\", \"quotes\", \"filename\", \"has_file\", \"readonly\", \"account_id\", \"thirdparty_id\", \"payment_id\", \"amount\", \"currency\", \"currency_amount\", \"outstanding_balance\", \"completeness\", \"gross_amount\", \"status\", \"complete\", \"account\", \"company\", \"scored_invoices\", \"is_accounting_needed\", \"pending\", \"hasTooManyLedgerEvents\", \"ledgerEventsCount\", \"ledgerEvents\", \"reconciled\", \"client_comments\", \"is_waiting_for_ocr\", \"has_linked_quotes\", \"size\", \"embeddable_in_browser\", \"ocr_thirdparty_id\", \"direction\", \"deadline\", \"multiplier\", \"price_before_tax\", \"quote_uid\", \"special_mention\", \"not_duplicate\", \"validation_needed\", \"currency_tax\", \"currency_price_before_tax\", \"language\", \"payment_status\", \"payment_method\", \"invoice_number\", \"tax\", \"estimate_status\", \"iban\", \"paid\", \"future_in_days\", \"discount\", \"discount_type\", \"finalized_at\", \"quote_group_uuid\", \"factor_status\", \"currency_amount_before_tax\", \"from_estimate_id\", \"credit_notes_amount\", \"payment_reminder_enabled\", \"payment_reference\", \"is_credit_note\", \"is_estimate\", \"is_destroyable\", \"can_be_stamped_as_paid_in_pdf\", \"custom_payment_reference\", \"scored_transactions\", \"is_sendable\", \"incomplete\", \"subcomplete\", \"attachment_label\", \"accounting_status\", \"thirdparty\", \"recipients\", \"invoice_lines\", \"invoice_kind\", \"file_signed_id\", \"pages_count\", \"tagged_at_ledger_events_level\", \"pdf_invoice_title\", \"pdf_invoice_free_text\", \"pdf_invoice_free_text_enabled\", \"pdf_invoice_subject\", \"pdf_invoice_subject_enabled\", \"pdf_invoice_display_products_list\", \"pdf_paid_stamp\", \"invoicing_detailed_source\", \"manual_partial_invoices\", \"establishment_comment\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new GroupedDocumentsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.company_id = d.company_id;\n" +
"        if (\"date\" in d)\n" +
"            this.date = d.date;\n" +
"        this.created_at = d.created_at;\n" +
"        this.updated_at = d.updated_at;\n" +
"        if (\"archived_at\" in d)\n" +
"            this.archived_at = d.archived_at;\n" +
"        this.type = d.type;\n" +
"        this.source = d.source;\n" +
"        this.draft = d.draft;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        if (\"gdrive_path\" in d)\n" +
"            this.gdrive_path = d.gdrive_path;\n" +
"        if (\"preview_status\" in d)\n" +
"            this.preview_status = d.preview_status;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        if (\"email_from\" in d)\n" +
"            this.email_from = d.email_from;\n" +
"        if (\"score\" in d)\n" +
"            this.score = d.score;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        this.external_id = d.external_id;\n" +
"        this.journal_id = d.journal_id;\n" +
"        if (\"grouped_at\" in d)\n" +
"            this.grouped_at = d.grouped_at;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.attachment_lost = d.attachment_lost;\n" +
"        this.pdf_generation_status = d.pdf_generation_status;\n" +
"        if (\"reversal_origin_id\" in d)\n" +
"            this.reversal_origin_id = d.reversal_origin_id;\n" +
"        if (\"billing_subscription_id\" in d)\n" +
"            this.billing_subscription_id = d.billing_subscription_id;\n" +
"        this.fec_pieceref = d.fec_pieceref;\n" +
"        this.label = d.label;\n" +
"        this.journal = d.journal;\n" +
"        this.url = d.url;\n" +
"        this.method = d.method;\n" +
"        this.accounting_type = d.accounting_type;\n" +
"        if (\"preview_urls\" in d)\n" +
"            this.preview_urls = d.preview_urls;\n" +
"        this.archived = d.archived;\n" +
"        this.quotes = d.quotes;\n" +
"        if (\"filename\" in d)\n" +
"            this.filename = d.filename;\n" +
"        this.has_file = d.has_file;\n" +
"        this.readonly = d.readonly;\n" +
"        if (\"account_id\" in d)\n" +
"            this.account_id = d.account_id;\n" +
"        if (\"thirdparty_id\" in d)\n" +
"            this.thirdparty_id = d.thirdparty_id;\n" +
"        if (\"payment_id\" in d)\n" +
"            this.payment_id = d.payment_id;\n" +
"        this.amount = d.amount;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.completeness = d.completeness;\n" +
"        if (\"gross_amount\" in d)\n" +
"            this.gross_amount = d.gross_amount;\n" +
"        if (\"status\" in d)\n" +
"            this.status = d.status;\n" +
"        this.complete = d.complete;\n" +
"        if (\"account\" in d)\n" +
"            this.account = d.account;\n" +
"        if (\"company\" in d)\n" +
"            this.company = d.company;\n" +
"        if (\"scored_invoices\" in d)\n" +
"            this.scored_invoices = d.scored_invoices;\n" +
"        if (\"is_accounting_needed\" in d)\n" +
"            this.is_accounting_needed = d.is_accounting_needed;\n" +
"        this.pending = d.pending;\n" +
"        this.hasTooManyLedgerEvents = d.hasTooManyLedgerEvents;\n" +
"        this.ledgerEventsCount = d.ledgerEventsCount;\n" +
"        if (\"ledgerEvents\" in d)\n" +
"            this.ledgerEvents = d.ledgerEvents;\n" +
"        this.reconciled = d.reconciled;\n" +
"        if (\"client_comments\" in d)\n" +
"            this.client_comments = d.client_comments;\n" +
"        if (\"is_waiting_for_ocr\" in d)\n" +
"            this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        if (\"has_linked_quotes\" in d)\n" +
"            this.has_linked_quotes = d.has_linked_quotes;\n" +
"        if (\"size\" in d)\n" +
"            this.size = d.size;\n" +
"        if (\"embeddable_in_browser\" in d)\n" +
"            this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        if (\"ocr_thirdparty_id\" in d)\n" +
"            this.ocr_thirdparty_id = d.ocr_thirdparty_id;\n" +
"        if (\"direction\" in d)\n" +
"            this.direction = d.direction;\n" +
"        if (\"deadline\" in d)\n" +
"            this.deadline = d.deadline;\n" +
"        if (\"multiplier\" in d)\n" +
"            this.multiplier = d.multiplier;\n" +
"        if (\"price_before_tax\" in d)\n" +
"            this.price_before_tax = d.price_before_tax;\n" +
"        if (\"quote_uid\" in d)\n" +
"            this.quote_uid = d.quote_uid;\n" +
"        if (\"special_mention\" in d)\n" +
"            this.special_mention = d.special_mention;\n" +
"        if (\"not_duplicate\" in d)\n" +
"            this.not_duplicate = d.not_duplicate;\n" +
"        if (\"validation_needed\" in d)\n" +
"            this.validation_needed = d.validation_needed;\n" +
"        if (\"currency_tax\" in d)\n" +
"            this.currency_tax = d.currency_tax;\n" +
"        if (\"currency_price_before_tax\" in d)\n" +
"            this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        if (\"language\" in d)\n" +
"            this.language = d.language;\n" +
"        if (\"payment_status\" in d)\n" +
"            this.payment_status = d.payment_status;\n" +
"        if (\"payment_method\" in d)\n" +
"            this.payment_method = d.payment_method;\n" +
"        if (\"invoice_number\" in d)\n" +
"            this.invoice_number = d.invoice_number;\n" +
"        if (\"tax\" in d)\n" +
"            this.tax = d.tax;\n" +
"        if (\"estimate_status\" in d)\n" +
"            this.estimate_status = d.estimate_status;\n" +
"        if (\"iban\" in d)\n" +
"            this.iban = d.iban;\n" +
"        if (\"paid\" in d)\n" +
"            this.paid = d.paid;\n" +
"        if (\"future_in_days\" in d)\n" +
"            this.future_in_days = d.future_in_days;\n" +
"        if (\"discount\" in d)\n" +
"            this.discount = d.discount;\n" +
"        if (\"discount_type\" in d)\n" +
"            this.discount_type = d.discount_type;\n" +
"        if (\"finalized_at\" in d)\n" +
"            this.finalized_at = d.finalized_at;\n" +
"        if (\"quote_group_uuid\" in d)\n" +
"            this.quote_group_uuid = d.quote_group_uuid;\n" +
"        if (\"factor_status\" in d)\n" +
"            this.factor_status = d.factor_status;\n" +
"        if (\"currency_amount_before_tax\" in d)\n" +
"            this.currency_amount_before_tax = d.currency_amount_before_tax;\n" +
"        if (\"from_estimate_id\" in d)\n" +
"            this.from_estimate_id = d.from_estimate_id;\n" +
"        if (\"credit_notes_amount\" in d)\n" +
"            this.credit_notes_amount = d.credit_notes_amount;\n" +
"        if (\"payment_reminder_enabled\" in d)\n" +
"            this.payment_reminder_enabled = d.payment_reminder_enabled;\n" +
"        if (\"payment_reference\" in d)\n" +
"            this.payment_reference = d.payment_reference;\n" +
"        if (\"is_credit_note\" in d)\n" +
"            this.is_credit_note = d.is_credit_note;\n" +
"        if (\"is_estimate\" in d)\n" +
"            this.is_estimate = d.is_estimate;\n" +
"        if (\"is_destroyable\" in d)\n" +
"            this.is_destroyable = d.is_destroyable;\n" +
"        if (\"can_be_stamped_as_paid_in_pdf\" in d)\n" +
"            this.can_be_stamped_as_paid_in_pdf = d.can_be_stamped_as_paid_in_pdf;\n" +
"        if (\"custom_payment_reference\" in d)\n" +
"            this.custom_payment_reference = d.custom_payment_reference;\n" +
"        if (\"scored_transactions\" in d)\n" +
"            this.scored_transactions = d.scored_transactions;\n" +
"        if (\"is_sendable\" in d)\n" +
"            this.is_sendable = d.is_sendable;\n" +
"        if (\"incomplete\" in d)\n" +
"            this.incomplete = d.incomplete;\n" +
"        if (\"subcomplete\" in d)\n" +
"            this.subcomplete = d.subcomplete;\n" +
"        if (\"attachment_label\" in d)\n" +
"            this.attachment_label = d.attachment_label;\n" +
"        if (\"accounting_status\" in d)\n" +
"            this.accounting_status = d.accounting_status;\n" +
"        if (\"thirdparty\" in d)\n" +
"            this.thirdparty = d.thirdparty;\n" +
"        if (\"recipients\" in d)\n" +
"            this.recipients = d.recipients;\n" +
"        if (\"invoice_lines\" in d)\n" +
"            this.invoice_lines = d.invoice_lines;\n" +
"        if (\"invoice_kind\" in d)\n" +
"            this.invoice_kind = d.invoice_kind;\n" +
"        if (\"file_signed_id\" in d)\n" +
"            this.file_signed_id = d.file_signed_id;\n" +
"        if (\"pages_count\" in d)\n" +
"            this.pages_count = d.pages_count;\n" +
"        if (\"tagged_at_ledger_events_level\" in d)\n" +
"            this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;\n" +
"        if (\"pdf_invoice_title\" in d)\n" +
"            this.pdf_invoice_title = d.pdf_invoice_title;\n" +
"        if (\"pdf_invoice_free_text\" in d)\n" +
"            this.pdf_invoice_free_text = d.pdf_invoice_free_text;\n" +
"        if (\"pdf_invoice_free_text_enabled\" in d)\n" +
"            this.pdf_invoice_free_text_enabled = d.pdf_invoice_free_text_enabled;\n" +
"        if (\"pdf_invoice_subject\" in d)\n" +
"            this.pdf_invoice_subject = d.pdf_invoice_subject;\n" +
"        if (\"pdf_invoice_subject_enabled\" in d)\n" +
"            this.pdf_invoice_subject_enabled = d.pdf_invoice_subject_enabled;\n" +
"        if (\"pdf_invoice_display_products_list\" in d)\n" +
"            this.pdf_invoice_display_products_list = d.pdf_invoice_display_products_list;\n" +
"        if (\"pdf_paid_stamp\" in d)\n" +
"            this.pdf_paid_stamp = d.pdf_paid_stamp;\n" +
"        if (\"invoicing_detailed_source\" in d)\n" +
"            this.invoicing_detailed_source = d.invoicing_detailed_source;\n" +
"        if (\"manual_partial_invoices\" in d)\n" +
"            this.manual_partial_invoices = d.manual_partial_invoices;\n" +
"        if (\"establishment_comment\" in d)\n" +
"            this.establishment_comment = d.establishment_comment;\n" +
"    }\n" +
"}\n" +
"let Journal$1 = class Journal {\n" +
"    static Parse(d) {\n" +
"        return Journal.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$9(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, false);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.code, false, field + \".code\");\n" +
"        checkString$9(d.label, false, field + \".label\");\n" +
"        const knownProperties = [\"id\", \"code\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new Journal(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.code = d.code;\n" +
"        this.label = d.label;\n" +
"    }\n" +
"};\n" +
"class Account {\n" +
"    static Parse(d) {\n" +
"        return Account.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkNumber$8(d.company_id, false, field + \".company_id\");\n" +
"        checkString$9(d.name, false, field + \".name\");\n" +
"        checkBoolean$7(d.visible, false, field + \".visible\");\n" +
"        checkBoolean$7(d.synchronized, false, field + \".synchronized\");\n" +
"        checkString$9(d.currency, false, field + \".currency\");\n" +
"        checkString$9(d.balance, false, field + \".balance\");\n" +
"        checkString$9(d.currency_balance, false, field + \".currency_balance\");\n" +
"        checkNumber$8(d.last_sync_http_code, false, field + \".last_sync_http_code\");\n" +
"        checkNull$5(d.last_sync_error, field + \".last_sync_error\");\n" +
"        checkString$9(d.last_sync_at, false, field + \".last_sync_at\");\n" +
"        checkBoolean$7(d.sync_customers, false, field + \".sync_customers\");\n" +
"        checkNull$5(d.sync_since, field + \".sync_since\");\n" +
"        checkString$9(d.last_successful_sync_at, false, field + \".last_successful_sync_at\");\n" +
"        checkString$9(d.updated_at, false, field + \".updated_at\");\n" +
"        checkNull$5(d.ledger_events_count, field + \".ledger_events_count\");\n" +
"        checkNull$5(d.ledger_events_min_date, field + \".ledger_events_min_date\");\n" +
"        checkNull$5(d.ledger_events_max_date, field + \".ledger_events_max_date\");\n" +
"        checkNull$5(d.transactions_count, field + \".transactions_count\");\n" +
"        checkBoolean$7(d.sync_attachments, false, field + \".sync_attachments\");\n" +
"        checkNumber$8(d.establishment_id, false, field + \".establishment_id\");\n" +
"        checkString$9(d.pusher_channel, false, field + \".pusher_channel\");\n" +
"        checkString$9(d.connection, false, field + \".connection\");\n" +
"        checkString$9(d.iban, true, field + \".iban\");\n" +
"        checkString$9(d.bic, false, field + \".bic\");\n" +
"        checkBoolean$7(d.use_as_default_for_vat_return, false, field + \".use_as_default_for_vat_return\");\n" +
"        checkString$9(d.method, false, field + \".method\");\n" +
"        checkString$9(d.url, false, field + \".url\");\n" +
"        checkBoolean$7(d.swan, false, field + \".swan\");\n" +
"        checkNull$5(d.swan_number, field + \".swan_number\");\n" +
"        d.establishment = Establishment.Create(d.establishment, field + \".establishment\");\n" +
"        checkString$9(d.label, false, field + \".label\");\n" +
"        checkString$9(d.merge_url, false, field + \".merge_url\");\n" +
"        const knownProperties = [\"id\", \"company_id\", \"name\", \"visible\", \"synchronized\", \"currency\", \"balance\", \"currency_balance\", \"last_sync_http_code\", \"last_sync_error\", \"last_sync_at\", \"sync_customers\", \"sync_since\", \"last_successful_sync_at\", \"updated_at\", \"ledger_events_count\", \"ledger_events_min_date\", \"ledger_events_max_date\", \"transactions_count\", \"sync_attachments\", \"establishment_id\", \"pusher_channel\", \"connection\", \"iban\", \"bic\", \"use_as_default_for_vat_return\", \"method\", \"url\", \"swan\", \"swan_number\", \"establishment\", \"label\", \"merge_url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new Account(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.company_id = d.company_id;\n" +
"        this.name = d.name;\n" +
"        this.visible = d.visible;\n" +
"        this.synchronized = d.synchronized;\n" +
"        this.currency = d.currency;\n" +
"        this.balance = d.balance;\n" +
"        this.currency_balance = d.currency_balance;\n" +
"        this.last_sync_http_code = d.last_sync_http_code;\n" +
"        if (\"last_sync_error\" in d)\n" +
"            this.last_sync_error = d.last_sync_error;\n" +
"        this.last_sync_at = d.last_sync_at;\n" +
"        this.sync_customers = d.sync_customers;\n" +
"        if (\"sync_since\" in d)\n" +
"            this.sync_since = d.sync_since;\n" +
"        this.last_successful_sync_at = d.last_successful_sync_at;\n" +
"        this.updated_at = d.updated_at;\n" +
"        if (\"ledger_events_count\" in d)\n" +
"            this.ledger_events_count = d.ledger_events_count;\n" +
"        if (\"ledger_events_min_date\" in d)\n" +
"            this.ledger_events_min_date = d.ledger_events_min_date;\n" +
"        if (\"ledger_events_max_date\" in d)\n" +
"            this.ledger_events_max_date = d.ledger_events_max_date;\n" +
"        if (\"transactions_count\" in d)\n" +
"            this.transactions_count = d.transactions_count;\n" +
"        this.sync_attachments = d.sync_attachments;\n" +
"        this.establishment_id = d.establishment_id;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.connection = d.connection;\n" +
"        if (\"iban\" in d)\n" +
"            this.iban = d.iban;\n" +
"        this.bic = d.bic;\n" +
"        this.use_as_default_for_vat_return = d.use_as_default_for_vat_return;\n" +
"        this.method = d.method;\n" +
"        this.url = d.url;\n" +
"        this.swan = d.swan;\n" +
"        if (\"swan_number\" in d)\n" +
"            this.swan_number = d.swan_number;\n" +
"        this.establishment = d.establishment;\n" +
"        this.label = d.label;\n" +
"        this.merge_url = d.merge_url;\n" +
"    }\n" +
"}\n" +
"class Establishment {\n" +
"    static Parse(d) {\n" +
"        return Establishment.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$9(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, false);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.name, false, field + \".name\");\n" +
"        checkNumber$8(d.accounts_count, false, field + \".accounts_count\");\n" +
"        checkNull$5(d.budgetinsight_id, field + \".budgetinsight_id\");\n" +
"        checkArray$5(d.bridge_ids, field + \".bridge_ids\");\n" +
"        if (d.bridge_ids) {\n" +
"            for (let i = 0; i < d.bridge_ids.length; i++) {\n" +
"                checkNumber$8(d.bridge_ids[i], true, field + \".bridge_ids\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$9(d.logo_url, false, field + \".logo_url\");\n" +
"        checkString$9(d.method, false, field + \".method\");\n" +
"        checkString$9(d.crm_url, false, field + \".crm_url\");\n" +
"        const knownProperties = [\"id\", \"name\", \"accounts_count\", \"budgetinsight_id\", \"bridge_ids\", \"logo_url\", \"method\", \"crm_url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new Establishment(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"        this.accounts_count = d.accounts_count;\n" +
"        if (\"budgetinsight_id\" in d)\n" +
"            this.budgetinsight_id = d.budgetinsight_id;\n" +
"        if (\"bridge_ids\" in d)\n" +
"            this.bridge_ids = d.bridge_ids;\n" +
"        this.logo_url = d.logo_url;\n" +
"        this.method = d.method;\n" +
"        this.crm_url = d.crm_url;\n" +
"    }\n" +
"}\n" +
"class Company1 {\n" +
"    static Parse(d) {\n" +
"        return Company1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkString$9(d.name, false, field + \".name\");\n" +
"        const knownProperties = [\"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new Company1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.name = d.name;\n" +
"    }\n" +
"}\n" +
"class ScoredInvoices1 {\n" +
"    static Parse(d) {\n" +
"        return ScoredInvoices1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        const knownProperties = [];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new ScoredInvoices1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"    }\n" +
"}\n" +
"class LedgerEventsEntity {\n" +
"    static Parse(d) {\n" +
"        return LedgerEventsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkNumber$8(d.company_id, false, field + \".company_id\");\n" +
"        checkNumber$8(d.plan_item_id, false, field + \".plan_item_id\");\n" +
"        checkNumber$8(d.document_id, false, field + \".document_id\");\n" +
"        checkString$9(d.created_at, false, field + \".created_at\");\n" +
"        checkNumber$8(d.reconciliation_id, true, field + \".reconciliation_id\");\n" +
"        checkString$9(d.source, false, field + \".source\");\n" +
"        checkNumber$8(d.lettering_id, true, field + \".lettering_id\");\n" +
"        checkNumber$8(d.reallocation_id, true, field + \".reallocation_id\");\n" +
"        checkString$9(d.debit, false, field + \".debit\");\n" +
"        checkString$9(d.credit, false, field + \".credit\");\n" +
"        checkString$9(d.balance, false, field + \".balance\");\n" +
"        checkString$9(d.date, false, field + \".date\");\n" +
"        d.planItem = PlanItemOrPnlPlanItem$1.Create(d.planItem, field + \".planItem\");\n" +
"        checkBoolean$7(d.readonly, false, field + \".readonly\");\n" +
"        checkBoolean$7(d.readonlyAmounts, false, field + \".readonlyAmounts\");\n" +
"        checkString$9(d.label, true, field + \".label\");\n" +
"        d.lettering = Lettering$1.Create(d.lettering, field + \".lettering\");\n" +
"        d.reallocation = Reallocation.Create(d.reallocation, field + \".reallocation\");\n" +
"        const knownProperties = [\"id\", \"company_id\", \"plan_item_id\", \"document_id\", \"created_at\", \"reconciliation_id\", \"source\", \"lettering_id\", \"reallocation_id\", \"debit\", \"credit\", \"balance\", \"date\", \"planItem\", \"readonly\", \"readonlyAmounts\", \"label\", \"lettering\", \"reallocation\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new LedgerEventsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.company_id = d.company_id;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.document_id = d.document_id;\n" +
"        this.created_at = d.created_at;\n" +
"        if (\"reconciliation_id\" in d)\n" +
"            this.reconciliation_id = d.reconciliation_id;\n" +
"        this.source = d.source;\n" +
"        if (\"lettering_id\" in d)\n" +
"            this.lettering_id = d.lettering_id;\n" +
"        if (\"reallocation_id\" in d)\n" +
"            this.reallocation_id = d.reallocation_id;\n" +
"        this.debit = d.debit;\n" +
"        this.credit = d.credit;\n" +
"        this.balance = d.balance;\n" +
"        this.date = d.date;\n" +
"        this.planItem = d.planItem;\n" +
"        this.readonly = d.readonly;\n" +
"        this.readonlyAmounts = d.readonlyAmounts;\n" +
"        if (\"label\" in d)\n" +
"            this.label = d.label;\n" +
"        if (\"lettering\" in d)\n" +
"            this.lettering = d.lettering;\n" +
"        if (\"reallocation\" in d)\n" +
"            this.reallocation = d.reallocation;\n" +
"    }\n" +
"}\n" +
"let PlanItemOrPnlPlanItem$1 = class PlanItemOrPnlPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$9(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, false);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.number, false, field + \".number\");\n" +
"        checkString$9(d.internal_identifier, true, field + \".internal_identifier\");\n" +
"        checkString$9(d.label, false, field + \".label\");\n" +
"        checkNumber$8(d.company_id, false, field + \".company_id\");\n" +
"        checkBoolean$7(d.enabled, false, field + \".enabled\");\n" +
"        checkString$9(d.vat_rate, false, field + \".vat_rate\");\n" +
"        checkString$9(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkBoolean$7(d.label_is_editable, false, field + \".label_is_editable\");\n" +
"        const knownProperties = [\"id\", \"number\", \"internal_identifier\", \"label\", \"company_id\", \"enabled\", \"vat_rate\", \"country_alpha2\", \"label_is_editable\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new PlanItemOrPnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"        if (\"internal_identifier\" in d)\n" +
"            this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.company_id = d.company_id;\n" +
"        this.enabled = d.enabled;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"    }\n" +
"};\n" +
"let Lettering$1 = class Lettering {\n" +
"    static Parse(d) {\n" +
"        return Lettering.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.balance, false, field + \".balance\");\n" +
"        checkString$9(d.plan_item_number, false, field + \".plan_item_number\");\n" +
"        const knownProperties = [\"id\", \"balance\", \"plan_item_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new Lettering(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.balance = d.balance;\n" +
"        this.plan_item_number = d.plan_item_number;\n" +
"    }\n" +
"};\n" +
"class Reallocation {\n" +
"    static Parse(d) {\n" +
"        return Reallocation.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.created_at, false, field + \".created_at\");\n" +
"        d.fromPlanItem = PlanItemOrPnlPlanItemOrFromPlanItem.Create(d.fromPlanItem, field + \".fromPlanItem\");\n" +
"        const knownProperties = [\"id\", \"created_at\", \"fromPlanItem\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new Reallocation(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.created_at = d.created_at;\n" +
"        this.fromPlanItem = d.fromPlanItem;\n" +
"    }\n" +
"}\n" +
"class PlanItemOrPnlPlanItemOrFromPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItemOrFromPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$9(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, false);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.number, false, field + \".number\");\n" +
"        checkNull$5(d.internal_identifier, field + \".internal_identifier\");\n" +
"        checkString$9(d.label, false, field + \".label\");\n" +
"        checkNumber$8(d.company_id, false, field + \".company_id\");\n" +
"        checkBoolean$7(d.enabled, false, field + \".enabled\");\n" +
"        checkString$9(d.vat_rate, false, field + \".vat_rate\");\n" +
"        checkString$9(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkBoolean$7(d.label_is_editable, false, field + \".label_is_editable\");\n" +
"        const knownProperties = [\"id\", \"number\", \"internal_identifier\", \"label\", \"company_id\", \"enabled\", \"vat_rate\", \"country_alpha2\", \"label_is_editable\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new PlanItemOrPnlPlanItemOrFromPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"        if (\"internal_identifier\" in d)\n" +
"            this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.company_id = d.company_id;\n" +
"        this.enabled = d.enabled;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"    }\n" +
"}\n" +
"class ClientCommentsEntityOrEstablishmentComment {\n" +
"    static Parse(d) {\n" +
"        return ClientCommentsEntityOrEstablishmentComment.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.name, false, field + \".name\");\n" +
"        checkString$9(d.content, false, field + \".content\");\n" +
"        checkString$9(d.created_at, false, field + \".created_at\");\n" +
"        checkBoolean$7(d.seen, false, field + \".seen\");\n" +
"        checkString$9(d.record_type, false, field + \".record_type\");\n" +
"        checkNumber$8(d.record_id, false, field + \".record_id\");\n" +
"        checkString$9(d.updated_at, false, field + \".updated_at\");\n" +
"        checkNumber$8(d.user_id, false, field + \".user_id\");\n" +
"        checkNull$5(d.rich_content, field + \".rich_content\");\n" +
"        d.user = User.Create(d.user, field + \".user\");\n" +
"        const knownProperties = [\"id\", \"name\", \"content\", \"created_at\", \"seen\", \"record_type\", \"record_id\", \"updated_at\", \"user_id\", \"rich_content\", \"user\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new ClientCommentsEntityOrEstablishmentComment(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"        this.content = d.content;\n" +
"        this.created_at = d.created_at;\n" +
"        this.seen = d.seen;\n" +
"        this.record_type = d.record_type;\n" +
"        this.record_id = d.record_id;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.user_id = d.user_id;\n" +
"        if (\"rich_content\" in d)\n" +
"            this.rich_content = d.rich_content;\n" +
"        this.user = d.user;\n" +
"    }\n" +
"}\n" +
"class User {\n" +
"    static Parse(d) {\n" +
"        return User.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$9(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, false);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.first_name, false, field + \".first_name\");\n" +
"        checkString$9(d.last_name, false, field + \".last_name\");\n" +
"        checkString$9(d.full_name, false, field + \".full_name\");\n" +
"        checkNull$5(d.profile_picture_url, field + \".profile_picture_url\");\n" +
"        const knownProperties = [\"id\", \"first_name\", \"last_name\", \"full_name\", \"profile_picture_url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new User(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.first_name = d.first_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.full_name = d.full_name;\n" +
"        if (\"profile_picture_url\" in d)\n" +
"            this.profile_picture_url = d.profile_picture_url;\n" +
"    }\n" +
"}\n" +
"let Thirdparty$2 = class Thirdparty {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkNumber$8(d.known_supplier_id, true, field + \".known_supplier_id\");\n" +
"        checkNumber$8(d.company_id, false, field + \".company_id\");\n" +
"        checkString$9(d.name, false, field + \".name\");\n" +
"        checkString$9(d.role, false, field + \".role\");\n" +
"        checkString$9(d.address, false, field + \".address\");\n" +
"        checkString$9(d.postal_code, false, field + \".postal_code\");\n" +
"        checkString$9(d.city, false, field + \".city\");\n" +
"        checkString$9(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkString$9(d.vat_number, false, field + \".vat_number\");\n" +
"        checkArray$5(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$9(d.search_terms[i], false, field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$5(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNull$5(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$9(d.reg_no, false, field + \".reg_no\");\n" +
"        checkString$9(d.phone, false, field + \".phone\");\n" +
"        checkString$9(d.first_name, false, field + \".first_name\");\n" +
"        checkBoolean$7(d.recurrent, false, field + \".recurrent\");\n" +
"        checkString$9(d.last_name, false, field + \".last_name\");\n" +
"        checkNull$5(d.gender, field + \".gender\");\n" +
"        checkString$9(d.payment_conditions, false, field + \".payment_conditions\");\n" +
"        checkString$9(d.customer_type, false, field + \".customer_type\");\n" +
"        checkBoolean$7(d.disable_pending_vat, false, field + \".disable_pending_vat\");\n" +
"        checkBoolean$7(d.force_pending_vat, false, field + \".force_pending_vat\");\n" +
"        checkNull$5(d.gocardless_id, field + \".gocardless_id\");\n" +
"        checkBoolean$7(d.invoices_auto_generated, false, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$7(d.invoices_auto_validated, false, field + \".invoices_auto_validated\");\n" +
"        checkNull$5(d.billing_iban, field + \".billing_iban\");\n" +
"        checkNull$5(d.billing_bic, field + \".billing_bic\");\n" +
"        checkNull$5(d.billing_bank, field + \".billing_bank\");\n" +
"        checkString$9(d.recipient, false, field + \".recipient\");\n" +
"        checkString$9(d.billing_language, false, field + \".billing_language\");\n" +
"        checkString$9(d.iban, false, field + \".iban\");\n" +
"        checkNull$5(d.stripe_id, field + \".stripe_id\");\n" +
"        checkNull$5(d.invoice_dump_id, field + \".invoice_dump_id\");\n" +
"        checkString$9(d.delivery_address, false, field + \".delivery_address\");\n" +
"        checkString$9(d.delivery_postal_code, false, field + \".delivery_postal_code\");\n" +
"        checkString$9(d.delivery_city, false, field + \".delivery_city\");\n" +
"        checkString$9(d[\"delivery_country_alpha2\"], false, field + \".delivery_country_alpha2\");\n" +
"        checkString$9(d.reference, false, field + \".reference\");\n" +
"        checkString$9(d.legal_form_code, false, field + \".legal_form_code\");\n" +
"        checkString$9(d.activity_nomenclature, false, field + \".activity_nomenclature\");\n" +
"        checkString$9(d.activity_code, false, field + \".activity_code\");\n" +
"        checkNull$5(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        checkNumber$8(d.plan_item_id, false, field + \".plan_item_id\");\n" +
"        checkBoolean$7(d.rule_enabled, false, field + \".rule_enabled\");\n" +
"        checkNull$5(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        checkString$9(d.supplier_payment_method_last_updated_at, true, field + \".supplier_payment_method_last_updated_at\");\n" +
"        checkString$9(d.notes, false, field + \".notes\");\n" +
"        checkNull$5(d.admin_city_code, field + \".admin_city_code\");\n" +
"        checkString$9(d.establishment_no, true, field + \".establishment_no\");\n" +
"        checkString$9(d.address_additional_info, false, field + \".address_additional_info\");\n" +
"        checkString$9(d.delivery_address_additional_info, false, field + \".delivery_address_additional_info\");\n" +
"        checkString$9(d.vat_rate, true, field + \".vat_rate\");\n" +
"        checkNumber$8(d.pnl_plan_item_id, true, field + \".pnl_plan_item_id\");\n" +
"        checkString$9(d.source_id, false, field + \".source_id\");\n" +
"        checkString$9(d.country, true, field + \".country\");\n" +
"        checkNull$5(d.delivery_country, field + \".delivery_country\");\n" +
"        checkBoolean$7(d.complete, false, field + \".complete\");\n" +
"        checkString$9(d.url, false, field + \".url\");\n" +
"        checkString$9(d.method, false, field + \".method\");\n" +
"        checkNull$5(d.billing_footer_invoice_label, field + \".billing_footer_invoice_label\");\n" +
"        checkNull$5(d.display_name, field + \".display_name\");\n" +
"        checkNull$5(d.debits, field + \".debits\");\n" +
"        checkNull$5(d.credits, field + \".credits\");\n" +
"        checkNull$5(d.balance, field + \".balance\");\n" +
"        checkNull$5(d.invoice_count, field + \".invoice_count\");\n" +
"        checkNull$5(d.purchase_request_count, field + \".purchase_request_count\");\n" +
"        checkNull$5(d.estimate_count, field + \".estimate_count\");\n" +
"        checkNull$5(d.turnover, field + \".turnover\");\n" +
"        checkNull$5(d.ledger_events_count, field + \".ledger_events_count\");\n" +
"        checkNull$5(d.plan_item, field + \".plan_item\");\n" +
"        checkNull$5(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkNull$5(d.current_mandate, field + \".current_mandate\");\n" +
"        checkBoolean$7(d.received_a_mandate_request, false, field + \".received_a_mandate_request\");\n" +
"        checkNull$5(d.notes_comment, field + \".notes_comment\");\n" +
"        checkNull$5(d.plan_item_attributes, field + \".plan_item_attributes\");\n" +
"        checkArray$5(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                checkNull$5(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"id\", \"known_supplier_id\", \"company_id\", \"name\", \"role\", \"address\", \"postal_code\", \"city\", \"country_alpha2\", \"vat_number\", \"search_terms\", \"emails\", \"reg_no\", \"phone\", \"first_name\", \"recurrent\", \"last_name\", \"gender\", \"payment_conditions\", \"customer_type\", \"disable_pending_vat\", \"force_pending_vat\", \"gocardless_id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"billing_iban\", \"billing_bic\", \"billing_bank\", \"recipient\", \"billing_language\", \"iban\", \"stripe_id\", \"invoice_dump_id\", \"delivery_address\", \"delivery_postal_code\", \"delivery_city\", \"delivery_country_alpha2\", \"reference\", \"legal_form_code\", \"activity_nomenclature\", \"activity_code\", \"billing_footer_invoice_id\", \"plan_item_id\", \"rule_enabled\", \"supplier_payment_method\", \"supplier_payment_method_last_updated_at\", \"notes\", \"admin_city_code\", \"establishment_no\", \"address_additional_info\", \"delivery_address_additional_info\", \"vat_rate\", \"pnl_plan_item_id\", \"source_id\", \"country\", \"delivery_country\", \"complete\", \"url\", \"method\", \"billing_footer_invoice_label\", \"display_name\", \"debits\", \"credits\", \"balance\", \"invoice_count\", \"purchase_request_count\", \"estimate_count\", \"turnover\", \"ledger_events_count\", \"plan_item\", \"pnl_plan_item\", \"current_mandate\", \"received_a_mandate_request\", \"notes_comment\", \"plan_item_attributes\", \"tags\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new Thirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        if (\"known_supplier_id\" in d)\n" +
"            this.known_supplier_id = d.known_supplier_id;\n" +
"        this.company_id = d.company_id;\n" +
"        this.name = d.name;\n" +
"        this.role = d.role;\n" +
"        this.address = d.address;\n" +
"        this.postal_code = d.postal_code;\n" +
"        this.city = d.city;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.vat_number = d.vat_number;\n" +
"        if (\"search_terms\" in d)\n" +
"            this.search_terms = d.search_terms;\n" +
"        if (\"emails\" in d)\n" +
"            this.emails = d.emails;\n" +
"        this.reg_no = d.reg_no;\n" +
"        this.phone = d.phone;\n" +
"        this.first_name = d.first_name;\n" +
"        this.recurrent = d.recurrent;\n" +
"        this.last_name = d.last_name;\n" +
"        if (\"gender\" in d)\n" +
"            this.gender = d.gender;\n" +
"        this.payment_conditions = d.payment_conditions;\n" +
"        this.customer_type = d.customer_type;\n" +
"        this.disable_pending_vat = d.disable_pending_vat;\n" +
"        this.force_pending_vat = d.force_pending_vat;\n" +
"        if (\"gocardless_id\" in d)\n" +
"            this.gocardless_id = d.gocardless_id;\n" +
"        this.invoices_auto_generated = d.invoices_auto_generated;\n" +
"        this.invoices_auto_validated = d.invoices_auto_validated;\n" +
"        if (\"billing_iban\" in d)\n" +
"            this.billing_iban = d.billing_iban;\n" +
"        if (\"billing_bic\" in d)\n" +
"            this.billing_bic = d.billing_bic;\n" +
"        if (\"billing_bank\" in d)\n" +
"            this.billing_bank = d.billing_bank;\n" +
"        this.recipient = d.recipient;\n" +
"        this.billing_language = d.billing_language;\n" +
"        this.iban = d.iban;\n" +
"        if (\"stripe_id\" in d)\n" +
"            this.stripe_id = d.stripe_id;\n" +
"        if (\"invoice_dump_id\" in d)\n" +
"            this.invoice_dump_id = d.invoice_dump_id;\n" +
"        this.delivery_address = d.delivery_address;\n" +
"        this.delivery_postal_code = d.delivery_postal_code;\n" +
"        this.delivery_city = d.delivery_city;\n" +
"        this[\"delivery_country_alpha2\"] = d[\"delivery_country_alpha2\"];\n" +
"        this.reference = d.reference;\n" +
"        this.legal_form_code = d.legal_form_code;\n" +
"        this.activity_nomenclature = d.activity_nomenclature;\n" +
"        this.activity_code = d.activity_code;\n" +
"        if (\"billing_footer_invoice_id\" in d)\n" +
"            this.billing_footer_invoice_id = d.billing_footer_invoice_id;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.rule_enabled = d.rule_enabled;\n" +
"        if (\"supplier_payment_method\" in d)\n" +
"            this.supplier_payment_method = d.supplier_payment_method;\n" +
"        if (\"supplier_payment_method_last_updated_at\" in d)\n" +
"            this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;\n" +
"        this.notes = d.notes;\n" +
"        if (\"admin_city_code\" in d)\n" +
"            this.admin_city_code = d.admin_city_code;\n" +
"        if (\"establishment_no\" in d)\n" +
"            this.establishment_no = d.establishment_no;\n" +
"        this.address_additional_info = d.address_additional_info;\n" +
"        this.delivery_address_additional_info = d.delivery_address_additional_info;\n" +
"        if (\"vat_rate\" in d)\n" +
"            this.vat_rate = d.vat_rate;\n" +
"        if (\"pnl_plan_item_id\" in d)\n" +
"            this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        this.source_id = d.source_id;\n" +
"        if (\"country\" in d)\n" +
"            this.country = d.country;\n" +
"        if (\"delivery_country\" in d)\n" +
"            this.delivery_country = d.delivery_country;\n" +
"        this.complete = d.complete;\n" +
"        this.url = d.url;\n" +
"        this.method = d.method;\n" +
"        if (\"billing_footer_invoice_label\" in d)\n" +
"            this.billing_footer_invoice_label = d.billing_footer_invoice_label;\n" +
"        if (\"display_name\" in d)\n" +
"            this.display_name = d.display_name;\n" +
"        if (\"debits\" in d)\n" +
"            this.debits = d.debits;\n" +
"        if (\"credits\" in d)\n" +
"            this.credits = d.credits;\n" +
"        if (\"balance\" in d)\n" +
"            this.balance = d.balance;\n" +
"        if (\"invoice_count\" in d)\n" +
"            this.invoice_count = d.invoice_count;\n" +
"        if (\"purchase_request_count\" in d)\n" +
"            this.purchase_request_count = d.purchase_request_count;\n" +
"        if (\"estimate_count\" in d)\n" +
"            this.estimate_count = d.estimate_count;\n" +
"        if (\"turnover\" in d)\n" +
"            this.turnover = d.turnover;\n" +
"        if (\"ledger_events_count\" in d)\n" +
"            this.ledger_events_count = d.ledger_events_count;\n" +
"        if (\"plan_item\" in d)\n" +
"            this.plan_item = d.plan_item;\n" +
"        if (\"pnl_plan_item\" in d)\n" +
"            this.pnl_plan_item = d.pnl_plan_item;\n" +
"        if (\"current_mandate\" in d)\n" +
"            this.current_mandate = d.current_mandate;\n" +
"        this.received_a_mandate_request = d.received_a_mandate_request;\n" +
"        if (\"notes_comment\" in d)\n" +
"            this.notes_comment = d.notes_comment;\n" +
"        if (\"plan_item_attributes\" in d)\n" +
"            this.plan_item_attributes = d.plan_item_attributes;\n" +
"        if (\"tags\" in d)\n" +
"            this.tags = d.tags;\n" +
"    }\n" +
"};\n" +
"let InvoiceLinesEntity$2 = class InvoiceLinesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoiceLinesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$9(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, false);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.price_before_tax, false, field + \".price_before_tax\");\n" +
"        checkString$9(d.amount, false, field + \".amount\");\n" +
"        checkString$9(d.tax, false, field + \".tax\");\n" +
"        checkString$9(d.label, false, field + \".label\");\n" +
"        checkString$9(d.description, false, field + \".description\");\n" +
"        checkNumber$8(d.pnl_plan_item_id, false, field + \".pnl_plan_item_id\");\n" +
"        checkNull$5(d.product_id, field + \".product_id\");\n" +
"        checkString$9(d.quantity, false, field + \".quantity\");\n" +
"        checkString$9(d.unit, true, field + \".unit\");\n" +
"        checkString$9(d.created_at, false, field + \".created_at\");\n" +
"        checkString$9(d.currency_amount, false, field + \".currency_amount\");\n" +
"        checkString$9(d.currency_tax, false, field + \".currency_tax\");\n" +
"        checkString$9(d.currency_price_before_tax, false, field + \".currency_price_before_tax\");\n" +
"        checkNumber$8(d.rank, true, field + \".rank\");\n" +
"        checkBoolean$7(d.prepaid_pnl, false, field + \".prepaid_pnl\");\n" +
"        checkString$9(d.ocr_vat_rate, true, field + \".ocr_vat_rate\");\n" +
"        checkNumber$8(d.document_id, false, field + \".document_id\");\n" +
"        checkString$9(d.discount, false, field + \".discount\");\n" +
"        checkString$9(d.discount_type, false, field + \".discount_type\");\n" +
"        checkNumber$8(d.company_id, false, field + \".company_id\");\n" +
"        checkNumber$8(d.asset_id, true, field + \".asset_id\");\n" +
"        checkNull$5(d.deferral_id, field + \".deferral_id\");\n" +
"        checkNull$5(d.advance_id, field + \".advance_id\");\n" +
"        checkString$9(d.raw_currency_unit_price, false, field + \".raw_currency_unit_price\");\n" +
"        checkString$9(d.undiscounted_currency_price_before_tax, false, field + \".undiscounted_currency_price_before_tax\");\n" +
"        checkBoolean$7(d.manual_vat_mode, false, field + \".manual_vat_mode\");\n" +
"        checkNumber$8(d.invoice_line_section_id, true, field + \".invoice_line_section_id\");\n" +
"        checkBoolean$7(d.global_vat, false, field + \".global_vat\");\n" +
"        checkString$9(d.vat_rate, false, field + \".vat_rate\");\n" +
"        d.pnl_plan_item = PlanItemOrPnlPlanItem$1.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkString$9(d.currency_unit_price_before_tax, false, field + \".currency_unit_price_before_tax\");\n" +
"        const knownProperties = [\"id\", \"price_before_tax\", \"amount\", \"tax\", \"label\", \"description\", \"pnl_plan_item_id\", \"product_id\", \"quantity\", \"unit\", \"created_at\", \"currency_amount\", \"currency_tax\", \"currency_price_before_tax\", \"rank\", \"prepaid_pnl\", \"ocr_vat_rate\", \"document_id\", \"discount\", \"discount_type\", \"company_id\", \"asset_id\", \"deferral_id\", \"advance_id\", \"raw_currency_unit_price\", \"undiscounted_currency_price_before_tax\", \"manual_vat_mode\", \"invoice_line_section_id\", \"global_vat\", \"vat_rate\", \"pnl_plan_item\", \"currency_unit_price_before_tax\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.price_before_tax = d.price_before_tax;\n" +
"        this.amount = d.amount;\n" +
"        this.tax = d.tax;\n" +
"        this.label = d.label;\n" +
"        this.description = d.description;\n" +
"        this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        if (\"product_id\" in d)\n" +
"            this.product_id = d.product_id;\n" +
"        this.quantity = d.quantity;\n" +
"        if (\"unit\" in d)\n" +
"            this.unit = d.unit;\n" +
"        this.created_at = d.created_at;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        if (\"rank\" in d)\n" +
"            this.rank = d.rank;\n" +
"        this.prepaid_pnl = d.prepaid_pnl;\n" +
"        if (\"ocr_vat_rate\" in d)\n" +
"            this.ocr_vat_rate = d.ocr_vat_rate;\n" +
"        this.document_id = d.document_id;\n" +
"        this.discount = d.discount;\n" +
"        this.discount_type = d.discount_type;\n" +
"        this.company_id = d.company_id;\n" +
"        if (\"asset_id\" in d)\n" +
"            this.asset_id = d.asset_id;\n" +
"        if (\"deferral_id\" in d)\n" +
"            this.deferral_id = d.deferral_id;\n" +
"        if (\"advance_id\" in d)\n" +
"            this.advance_id = d.advance_id;\n" +
"        this.raw_currency_unit_price = d.raw_currency_unit_price;\n" +
"        this.undiscounted_currency_price_before_tax = d.undiscounted_currency_price_before_tax;\n" +
"        this.manual_vat_mode = d.manual_vat_mode;\n" +
"        if (\"invoice_line_section_id\" in d)\n" +
"            this.invoice_line_section_id = d.invoice_line_section_id;\n" +
"        this.global_vat = d.global_vat;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.currency_unit_price_before_tax = d.currency_unit_price_before_tax;\n" +
"    }\n" +
"};\n" +
"class EstablishmentComment {\n" +
"    static Parse(d) {\n" +
"        return EstablishmentComment.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.name, false, field + \".name\");\n" +
"        checkString$9(d.content, false, field + \".content\");\n" +
"        checkString$9(d.created_at, false, field + \".created_at\");\n" +
"        checkBoolean$7(d.seen, false, field + \".seen\");\n" +
"        checkString$9(d.record_type, false, field + \".record_type\");\n" +
"        checkNumber$8(d.record_id, false, field + \".record_id\");\n" +
"        checkString$9(d.updated_at, false, field + \".updated_at\");\n" +
"        checkNumber$8(d.user_id, true, field + \".user_id\");\n" +
"        checkNull$5(d.rich_content, field + \".rich_content\");\n" +
"        d.user = User1.Create(d.user, field + \".user\");\n" +
"        checkNull$5(d.author, field + \".author\");\n" +
"        const knownProperties = [\"id\", \"name\", \"content\", \"created_at\", \"seen\", \"record_type\", \"record_id\", \"updated_at\", \"user_id\", \"rich_content\", \"user\", \"author\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new EstablishmentComment(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"        this.content = d.content;\n" +
"        this.created_at = d.created_at;\n" +
"        this.seen = d.seen;\n" +
"        this.record_type = d.record_type;\n" +
"        this.record_id = d.record_id;\n" +
"        this.updated_at = d.updated_at;\n" +
"        if (\"user_id\" in d)\n" +
"            this.user_id = d.user_id;\n" +
"        if (\"rich_content\" in d)\n" +
"            this.rich_content = d.rich_content;\n" +
"        if (\"user\" in d)\n" +
"            this.user = d.user;\n" +
"        if (\"author\" in d)\n" +
"            this.author = d.author;\n" +
"    }\n" +
"}\n" +
"class User1 {\n" +
"    static Parse(d) {\n" +
"        return User1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$a = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$9(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$9(field, d, true);\n" +
"        }\n" +
"        checkNumber$8(d.id, false, field + \".id\");\n" +
"        checkString$9(d.first_name, false, field + \".first_name\");\n" +
"        checkString$9(d.last_name, false, field + \".last_name\");\n" +
"        checkString$9(d.full_name, false, field + \".full_name\");\n" +
"        checkNull$5(d.profile_picture_url, field + \".profile_picture_url\");\n" +
"        const knownProperties = [\"id\", \"first_name\", \"last_name\", \"full_name\", \"profile_picture_url\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$a(unknownProperty, d, \"never\", false);\n" +
"        return new User1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.first_name = d.first_name;\n" +
"        this.last_name = d.last_name;\n" +
"        this.full_name = d.full_name;\n" +
"        if (\"profile_picture_url\" in d)\n" +
"            this.profile_picture_url = d.profile_picture_url;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$9(field, d) {\n" +
"    return errorHelper$a(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$9(field, d, nullable) {\n" +
"    return errorHelper$a(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$9(field, d, nullable) {\n" +
"    return errorHelper$a(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkArray$5(d, field) {\n" +
"    if (!Array.isArray(d) && d !== null && d !== undefined) {\n" +
"        errorHelper$a(field, d, \"array\", true);\n" +
"    }\n" +
"}\n" +
"function checkNumber$8(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$a(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkBoolean$7(d, nullable, field) {\n" +
"    if (typeof (d) !== 'boolean' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$a(field, d, \"boolean\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$9(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$a(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkNull$5(d, field) {\n" +
"    if (d !== null && d !== undefined) {\n" +
"        errorHelper$a(field, d, \"null or undefined\", false);\n" +
"    }\n" +
"}\n" +
"function errorHelper$a(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$a + ':', JSON.stringify(obj$a));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$a));\n" +
"}\n" +
"\n" +
"async function getDocument(id) {\n" +
"    const response = await apiRequest(`documents/${id}`, null, 'GET');\n" +
"    const data = await response?.json();\n" +
"    return APIDocument.Create(data);\n" +
"}\n" +
"async function documentMatching(options) {\n" +
"    const group_uuids = Array.isArray(options.groups) ? options.groups : [options.groups];\n" +
"    await apiRequest(`documents/${options.id}/matching`, { matching: { unmatch_ids: [], group_uuids } }, 'PUT');\n" +
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
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$9 = 'APIGroupedDocument';\n" +
"let obj$9 = null;\n" +
"class APIGroupedDocument {\n" +
"    static Parse(d) {\n" +
"        return APIGroupedDocument.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$8(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$8(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$8(field, d, false);\n" +
"        }\n" +
"        checkNumber$7(d.id, false, field + \".id\");\n" +
"        checkString$8(d.type, false, field + \".type\");\n" +
"        checkString$8(d.date, true, field + \".date\");\n" +
"        checkNumber$7(d.journal_id, false, field + \".journal_id\");\n" +
"        checkString$8(d.source, false, field + \".source\");\n" +
"        checkBoolean$6(d.is_waiting_details, false, field + \".is_waiting_details\");\n" +
"        checkString$8(d.fec_pieceref, false, field + \".fec_pieceref\");\n" +
"        checkString$8(d.label, false, field + \".label\");\n" +
"        checkString$8(d.amount, false, field + \".amount\");\n" +
"        d.journal = Journal.Create(d.journal, field + \".journal\");\n" +
"        checkBoolean$6(d.readonly, false, field + \".readonly\");\n" +
"        checkNumber$7(d.ledgerEventsCount, false, field + \".ledgerEventsCount\");\n" +
"        checkString$8(d.totalDebit, false, field + \".totalDebit\");\n" +
"        checkString$8(d.totalCredit, false, field + \".totalCredit\");\n" +
"        const knownProperties = [\"id\", \"type\", \"date\", \"journal_id\", \"source\", \"is_waiting_details\", \"fec_pieceref\", \"label\", \"amount\", \"journal\", \"readonly\", \"ledgerEventsCount\", \"totalDebit\", \"totalCredit\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(unknownProperty, d, \"never\", false);\n" +
"        return new APIGroupedDocument(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.type = d.type;\n" +
"        if (\"date\" in d)\n" +
"            this.date = d.date;\n" +
"        this.journal_id = d.journal_id;\n" +
"        this.source = d.source;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        this.fec_pieceref = d.fec_pieceref;\n" +
"        this.label = d.label;\n" +
"        this.amount = d.amount;\n" +
"        this.journal = d.journal;\n" +
"        this.readonly = d.readonly;\n" +
"        this.ledgerEventsCount = d.ledgerEventsCount;\n" +
"        this.totalDebit = d.totalDebit;\n" +
"        this.totalCredit = d.totalCredit;\n" +
"    }\n" +
"}\n" +
"class Journal {\n" +
"    static Parse(d) {\n" +
"        return Journal.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$9 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$8(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$8(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$8(field, d, false);\n" +
"        }\n" +
"        checkNumber$7(d.id, false, field + \".id\");\n" +
"        checkString$8(d.code, false, field + \".code\");\n" +
"        checkString$8(d.label, false, field + \".label\");\n" +
"        const knownProperties = [\"id\", \"code\", \"label\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$9(unknownProperty, d, \"never\", false);\n" +
"        return new Journal(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.code = d.code;\n" +
"        this.label = d.label;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$8(field, d) {\n" +
"    return errorHelper$9(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$8(field, d, nullable) {\n" +
"    return errorHelper$9(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$8(field, d, nullable) {\n" +
"    return errorHelper$9(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkNumber$7(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && (true)) {\n" +
"        errorHelper$9(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkBoolean$6(d, nullable, field) {\n" +
"    if (typeof (d) !== 'boolean' && (true)) {\n" +
"        errorHelper$9(field, d, \"boolean\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$8(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$9(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function errorHelper$9(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$9 + ':', JSON.stringify(obj$9));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$9));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$8 = 'APIInvoiceListParams';\n" +
"let obj$8 = null;\n" +
"class APIInvoiceListParams {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceListParams.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$8 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$7(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$7(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$7(field, d, false);\n" +
"        }\n" +
"        checkString$7(d.direction, true, field + \".direction\");\n" +
"        checkString$7(d.filter, true, field + \".filter\");\n" +
"        checkString$7(d.sort, true, field + \".sort\");\n" +
"        checkNumber$6(d.page, true, field + \".page\");\n" +
"        const knownProperties = [\"direction\", \"filter\", \"sort\", \"page\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$8(unknownProperty, d, \"never\", false);\n" +
"        return new APIInvoiceListParams(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"direction\" in d)\n" +
"            this.direction = d.direction;\n" +
"        if (\"filter\" in d)\n" +
"            this.filter = d.filter;\n" +
"        if (\"sort\" in d)\n" +
"            this.sort = d.sort;\n" +
"        if (\"page\" in d)\n" +
"            this.page = d.page;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$7(field, d) {\n" +
"    return errorHelper$8(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$7(field, d, nullable) {\n" +
"    return errorHelper$8(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$7(field, d, nullable) {\n" +
"    return errorHelper$8(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkNumber$6(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && ((d !== null && d !== undefined))) {\n" +
"        errorHelper$8(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$7(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && ((d !== null && d !== undefined))) {\n" +
"        errorHelper$8(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function errorHelper$8(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$8 + ':', JSON.stringify(obj$8));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$8));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$7 = 'APIInvoiceList';\n" +
"let obj$7 = null;\n" +
"class APIInvoiceList {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceList.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$6(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$6(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$6(field, d, false);\n" +
"        }\n" +
"        checkArray$4(d.invoices, field + \".invoices\");\n" +
"        if (d.invoices) {\n" +
"            for (let i = 0; i < d.invoices.length; i++) {\n" +
"                d.invoices[i] = InvoicesEntity.Create(d.invoices[i], field + \".invoices\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNumber$5(d.pageSize, false, field + \".pageSize\");\n" +
"        d.pagination = Pagination$1.Create(d.pagination, field + \".pagination\");\n" +
"        const knownProperties = [\"invoices\", \"pageSize\", \"pagination\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(unknownProperty, d, \"never\", false);\n" +
"        return new APIInvoiceList(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"invoices\" in d)\n" +
"            this.invoices = d.invoices;\n" +
"        this.pageSize = d.pageSize;\n" +
"        this.pagination = d.pagination;\n" +
"    }\n" +
"}\n" +
"class InvoicesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoicesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$6(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$6(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$6(field, d, false);\n" +
"        }\n" +
"        checkNumber$5(d.id, false, field + \".id\");\n" +
"        checkString$6(d.type, false, field + \".type\");\n" +
"        checkNumber$5(d.company_id, false, field + \".company_id\");\n" +
"        checkString$6(d.label, false, field + \".label\");\n" +
"        checkString$6(d.created_at, false, field + \".created_at\");\n" +
"        checkString$6(d.currency, false, field + \".currency\");\n" +
"        checkString$6(d.amount, false, field + \".amount\");\n" +
"        checkString$6(d.currency_amount, false, field + \".currency_amount\");\n" +
"        checkString$6(d.currency_tax, false, field + \".currency_tax\");\n" +
"        checkString$6(d.date, true, field + \".date\");\n" +
"        checkString$6(d.deadline, true, field + \".deadline\");\n" +
"        checkString$6(d.direction, false, field + \".direction\");\n" +
"        checkString$6(d.invoice_number, false, field + \".invoice_number\");\n" +
"        checkString$6(d.source, false, field + \".source\");\n" +
"        checkNull$4(d.email_from, field + \".email_from\");\n" +
"        checkString$6(d.gdrive_path, true, field + \".gdrive_path\");\n" +
"        checkString$6(d.pusher_channel, false, field + \".pusher_channel\");\n" +
"        checkBoolean$5(d.validation_needed, false, field + \".validation_needed\");\n" +
"        checkString$6(d.payment_status, false, field + \".payment_status\");\n" +
"        checkBoolean$5(d.paid, false, field + \".paid\");\n" +
"        checkString$6(d.amount_without_tax, false, field + \".amount_without_tax\");\n" +
"        checkBoolean$5(d.not_duplicate, false, field + \".not_duplicate\");\n" +
"        checkNull$4(d.approval_status, field + \".approval_status\");\n" +
"        checkString$6(d.checksum, false, field + \".checksum\");\n" +
"        checkBoolean$5(d.archived, false, field + \".archived\");\n" +
"        checkBoolean$5(d.incomplete, false, field + \".incomplete\");\n" +
"        checkBoolean$5(d.is_waiting_for_ocr, false, field + \".is_waiting_for_ocr\");\n" +
"        checkString$6(d.status, false, field + \".status\");\n" +
"        checkString$6(d.filename, false, field + \".filename\");\n" +
"        checkBoolean$5(d.is_factur_x, false, field + \".is_factur_x\");\n" +
"        d.thirdparty = Thirdparty$1.Create(d.thirdparty, field + \".thirdparty\");\n" +
"        checkArray$4(d.invoice_lines, field + \".invoice_lines\");\n" +
"        if (d.invoice_lines) {\n" +
"            for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                d.invoice_lines[i] = InvoiceLinesEntity$1.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"id\", \"type\", \"company_id\", \"label\", \"created_at\", \"currency\", \"amount\", \"currency_amount\", \"currency_tax\", \"date\", \"deadline\", \"direction\", \"invoice_number\", \"source\", \"email_from\", \"gdrive_path\", \"pusher_channel\", \"validation_needed\", \"payment_status\", \"paid\", \"amount_without_tax\", \"not_duplicate\", \"approval_status\", \"checksum\", \"archived\", \"incomplete\", \"is_waiting_for_ocr\", \"status\", \"filename\", \"is_factur_x\", \"thirdparty\", \"invoice_lines\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(unknownProperty, d, \"never\", false);\n" +
"        return new InvoicesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.type = d.type;\n" +
"        this.company_id = d.company_id;\n" +
"        this.label = d.label;\n" +
"        this.created_at = d.created_at;\n" +
"        this.currency = d.currency;\n" +
"        this.amount = d.amount;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        if (\"date\" in d)\n" +
"            this.date = d.date;\n" +
"        if (\"deadline\" in d)\n" +
"            this.deadline = d.deadline;\n" +
"        this.direction = d.direction;\n" +
"        this.invoice_number = d.invoice_number;\n" +
"        this.source = d.source;\n" +
"        if (\"email_from\" in d)\n" +
"            this.email_from = d.email_from;\n" +
"        if (\"gdrive_path\" in d)\n" +
"            this.gdrive_path = d.gdrive_path;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.validation_needed = d.validation_needed;\n" +
"        this.payment_status = d.payment_status;\n" +
"        this.paid = d.paid;\n" +
"        this.amount_without_tax = d.amount_without_tax;\n" +
"        this.not_duplicate = d.not_duplicate;\n" +
"        if (\"approval_status\" in d)\n" +
"            this.approval_status = d.approval_status;\n" +
"        this.checksum = d.checksum;\n" +
"        this.archived = d.archived;\n" +
"        this.incomplete = d.incomplete;\n" +
"        this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        this.status = d.status;\n" +
"        this.filename = d.filename;\n" +
"        this.is_factur_x = d.is_factur_x;\n" +
"        if (\"thirdparty\" in d)\n" +
"            this.thirdparty = d.thirdparty;\n" +
"        if (\"invoice_lines\" in d)\n" +
"            this.invoice_lines = d.invoice_lines;\n" +
"    }\n" +
"}\n" +
"let Thirdparty$1 = class Thirdparty {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$6(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$6(field, d, true);\n" +
"        }\n" +
"        checkNumber$5(d.id, false, field + \".id\");\n" +
"        checkString$6(d.name, false, field + \".name\");\n" +
"        const knownProperties = [\"id\", \"name\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(unknownProperty, d, \"never\", false);\n" +
"        return new Thirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"    }\n" +
"};\n" +
"let InvoiceLinesEntity$1 = class InvoiceLinesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoiceLinesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$6(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$6(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$6(field, d, false);\n" +
"        }\n" +
"        checkNumber$5(d.id, false, field + \".id\");\n" +
"        checkString$6(d.vat_rate, false, field + \".vat_rate\");\n" +
"        d.pnl_plan_item = PnlPlanItem$2.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        const knownProperties = [\"id\", \"vat_rate\", \"pnl_plan_item\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(unknownProperty, d, \"never\", false);\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"    }\n" +
"};\n" +
"let PnlPlanItem$2 = class PnlPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$6(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$6(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$6(field, d, false);\n" +
"        }\n" +
"        checkNumber$5(d.id, false, field + \".id\");\n" +
"        checkString$6(d.number, false, field + \".number\");\n" +
"        checkString$6(d.label, false, field + \".label\");\n" +
"        checkBoolean$5(d.enabled, false, field + \".enabled\");\n" +
"        const knownProperties = [\"id\", \"number\", \"label\", \"enabled\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(unknownProperty, d, \"never\", false);\n" +
"        return new PnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"        this.label = d.label;\n" +
"        this.enabled = d.enabled;\n" +
"    }\n" +
"};\n" +
"let Pagination$1 = class Pagination {\n" +
"    static Parse(d) {\n" +
"        return Pagination.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$7 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$6(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$6(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$6(field, d, false);\n" +
"        }\n" +
"        checkNumber$5(d.page, false, field + \".page\");\n" +
"        checkNumber$5(d.pageSize, false, field + \".pageSize\");\n" +
"        checkNumber$5(d.pages, false, field + \".pages\");\n" +
"        checkNumber$5(d.totalEntries, false, field + \".totalEntries\");\n" +
"        checkString$6(d.totalEntriesStr, false, field + \".totalEntriesStr\");\n" +
"        checkString$6(d.totalEntriesPrecision, false, field + \".totalEntriesPrecision\");\n" +
"        checkBoolean$5(d.hasNextPage, false, field + \".hasNextPage\");\n" +
"        const knownProperties = [\"page\", \"pageSize\", \"pages\", \"totalEntries\", \"totalEntriesStr\", \"totalEntriesPrecision\", \"hasNextPage\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$7(unknownProperty, d, \"never\", false);\n" +
"        return new Pagination(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.page = d.page;\n" +
"        this.pageSize = d.pageSize;\n" +
"        this.pages = d.pages;\n" +
"        this.totalEntries = d.totalEntries;\n" +
"        this.totalEntriesStr = d.totalEntriesStr;\n" +
"        this.totalEntriesPrecision = d.totalEntriesPrecision;\n" +
"        this.hasNextPage = d.hasNextPage;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$6(field, d) {\n" +
"    return errorHelper$7(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$6(field, d, nullable) {\n" +
"    return errorHelper$7(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$6(field, d, nullable) {\n" +
"    return errorHelper$7(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkArray$4(d, field) {\n" +
"    if (!Array.isArray(d) && d !== null && d !== undefined) {\n" +
"        errorHelper$7(field, d, \"array\", true);\n" +
"    }\n" +
"}\n" +
"function checkNumber$5(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && (true)) {\n" +
"        errorHelper$7(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkBoolean$5(d, nullable, field) {\n" +
"    if (typeof (d) !== 'boolean' && (true)) {\n" +
"        errorHelper$7(field, d, \"boolean\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$6(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$7(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkNull$4(d, field) {\n" +
"    if (d !== null && d !== undefined) {\n" +
"        errorHelper$7(field, d, \"null or undefined\", false);\n" +
"    }\n" +
"}\n" +
"function errorHelper$7(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$7 + ':', JSON.stringify(obj$7));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$7));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$6 = 'APIInvoiceUpdateResponse';\n" +
"let obj$6 = null;\n" +
"class APIInvoiceUpdateResponse {\n" +
"    static Parse(d) {\n" +
"        return APIInvoiceUpdateResponse.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$6 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$5(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$5(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$5(field, d, false);\n" +
"        }\n" +
"        checkBoolean$4(d.has_file, false, field + \".has_file\");\n" +
"        checkString$5(d.preview_status, false, field + \".preview_status\");\n" +
"        checkArray$3(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString$5(d.preview_urls[i], false, field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$4(d.embeddable_in_browser, false, field + \".embeddable_in_browser\");\n" +
"        const knownProperties = [\"has_file\", \"preview_status\", \"preview_urls\", \"embeddable_in_browser\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$6(unknownProperty, d, \"never\", false);\n" +
"        return new APIInvoiceUpdateResponse(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.has_file = d.has_file;\n" +
"        this.preview_status = d.preview_status;\n" +
"        if (\"preview_urls\" in d)\n" +
"            this.preview_urls = d.preview_urls;\n" +
"        this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$5(field, d) {\n" +
"    return errorHelper$6(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$5(field, d, nullable) {\n" +
"    return errorHelper$6(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$5(field, d, nullable) {\n" +
"    return errorHelper$6(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkArray$3(d, field) {\n" +
"    if (!Array.isArray(d) && d !== null && d !== undefined) {\n" +
"        errorHelper$6(field, d, \"array\", true);\n" +
"    }\n" +
"}\n" +
"function checkBoolean$4(d, nullable, field) {\n" +
"    if (typeof (d) !== 'boolean' && (true)) {\n" +
"        errorHelper$6(field, d, \"boolean\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$5(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && (true)) {\n" +
"        errorHelper$6(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function errorHelper$6(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$6 + ':', JSON.stringify(obj$6));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$6));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$5 = 'APIInvoice';\n" +
"let obj$5 = null;\n" +
"class APIInvoice {\n" +
"    static Parse(d) {\n" +
"        return APIInvoice.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$4(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, false);\n" +
"        }\n" +
"        checkString$4(d.amount, false, field + \".amount\");\n" +
"        checkBoolean$3(d.attachment_required, false, field + \".attachment_required\");\n" +
"        checkNumber$4(d.client_comments_count, false, field + \".client_comments_count\");\n" +
"        checkNumber$4(d.company_id, false, field + \".company_id\");\n" +
"        checkString$4(d.created_at, false, field + \".created_at\");\n" +
"        checkString$4(d.currency, false, field + \".currency\");\n" +
"        checkString$4(d.currency_amount, false, field + \".currency_amount\");\n" +
"        checkString$4(d.currency_tax, false, field + \".currency_tax\");\n" +
"        checkString$4(d.currency_price_before_tax, false, field + \".currency_price_before_tax\");\n" +
"        checkNull$3(d.current_account_plan_item_id, field + \".current_account_plan_item_id\");\n" +
"        checkString$4(d.date, true, field + \".date\");\n" +
"        checkString$4(d.deadline, true, field + \".deadline\");\n" +
"        checkString$4(d.direction, false, field + \".direction\");\n" +
"        checkNull$3(d.email_from, field + \".email_from\");\n" +
"        checkString$4(d.filename, false, field + \".filename\");\n" +
"        checkString$4(d.gdrive_path, true, field + \".gdrive_path\");\n" +
"        checkString$4(d.group_uuid, false, field + \".group_uuid\");\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkString$4(d.invoice_number, false, field + \".invoice_number\");\n" +
"        checkString$4(d.label, false, field + \".label\");\n" +
"        checkString$4(d.outstanding_balance, false, field + \".outstanding_balance\");\n" +
"        checkString$4(d.preview_status, false, field + \".preview_status\");\n" +
"        checkString$4(d.payment_status, false, field + \".payment_status\");\n" +
"        checkBoolean$3(d.paid, false, field + \".paid\");\n" +
"        checkString$4(d.pusher_channel, false, field + \".pusher_channel\");\n" +
"        checkString$4(d.source, false, field + \".source\");\n" +
"        checkString$4(d.type, false, field + \".type\");\n" +
"        checkBoolean$3(d.validation_needed, false, field + \".validation_needed\");\n" +
"        checkNumber$4(d.journal_id, false, field + \".journal_id\");\n" +
"        checkNumber$4(d.thirdparty_id, true, field + \".thirdparty_id\");\n" +
"        checkArray$2(d.preview_urls, field + \".preview_urls\");\n" +
"        if (d.preview_urls) {\n" +
"            for (let i = 0; i < d.preview_urls.length; i++) {\n" +
"                checkString$4(d.preview_urls[i], true, field + \".preview_urls\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$3(d.approval_status, field + \".approval_status\");\n" +
"        checkString$4(d.checksum, false, field + \".checksum\");\n" +
"        checkBoolean$3(d.archived, false, field + \".archived\");\n" +
"        checkNumber$4(d.duplicates_count, false, field + \".duplicates_count\");\n" +
"        checkBoolean$3(d.has_duplicates, false, field + \".has_duplicates\");\n" +
"        checkNumber$4(d.invoice_lines_count, false, field + \".invoice_lines_count\");\n" +
"        checkBoolean$3(d.is_estimate, false, field + \".is_estimate\");\n" +
"        checkBoolean$3(d.is_employee_expense, false, field + \".is_employee_expense\");\n" +
"        checkBoolean$3(d.is_factur_x, false, field + \".is_factur_x\");\n" +
"        checkBoolean$3(d.subcomplete, false, field + \".subcomplete\");\n" +
"        checkBoolean$3(d.has_closed_ledger_events, false, field + \".has_closed_ledger_events\");\n" +
"        d.thirdparty = Thirdparty.Create(d.thirdparty, field + \".thirdparty\");\n" +
"        checkArray$2(d.invoice_lines, field + \".invoice_lines\");\n" +
"        if (d.invoice_lines) {\n" +
"            for (let i = 0; i < d.invoice_lines.length; i++) {\n" +
"                d.invoice_lines[i] = InvoiceLinesEntity.Create(d.invoice_lines[i], field + \".invoice_lines\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkBoolean$3(d.incomplete, false, field + \".incomplete\");\n" +
"        checkBoolean$3(d.is_waiting_for_ocr, false, field + \".is_waiting_for_ocr\");\n" +
"        checkString$4(d.status, false, field + \".status\");\n" +
"        checkBoolean$3(d.tagged_at_ledger_events_level, false, field + \".tagged_at_ledger_events_level\");\n" +
"        checkNull$3(d.current_account_plan_item, field + \".current_account_plan_item\");\n" +
"        checkBoolean$3(d.has_file, false, field + \".has_file\");\n" +
"        checkString$4(d.file_signed_id, false, field + \".file_signed_id\");\n" +
"        checkBoolean$3(d.embeddable_in_browser, false, field + \".embeddable_in_browser\");\n" +
"        checkNumber$4(d.pages_count, true, field + \".pages_count\");\n" +
"        checkNumber$4(d.blob_id, false, field + \".blob_id\");\n" +
"        checkString$4(d.url, false, field + \".url\");\n" +
"        checkString$4(d.method, false, field + \".method\");\n" +
"        checkArray$2(d.document_tags, field + \".document_tags\");\n" +
"        if (d.document_tags) {\n" +
"            for (let i = 0; i < d.document_tags.length; i++) {\n" +
"                d.document_tags[i] = DocumentTagsEntity.Create(d.document_tags[i], field + \".document_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$3(d.mileage_allowance, field + \".mileage_allowance\");\n" +
"        const knownProperties = [\"amount\", \"attachment_required\", \"client_comments_count\", \"company_id\", \"created_at\", \"currency\", \"currency_amount\", \"currency_tax\", \"currency_price_before_tax\", \"current_account_plan_item_id\", \"date\", \"deadline\", \"direction\", \"email_from\", \"filename\", \"gdrive_path\", \"group_uuid\", \"id\", \"invoice_number\", \"label\", \"outstanding_balance\", \"preview_status\", \"payment_status\", \"paid\", \"pusher_channel\", \"source\", \"type\", \"validation_needed\", \"journal_id\", \"thirdparty_id\", \"preview_urls\", \"approval_status\", \"checksum\", \"archived\", \"duplicates_count\", \"has_duplicates\", \"invoice_lines_count\", \"is_estimate\", \"is_employee_expense\", \"is_factur_x\", \"subcomplete\", \"has_closed_ledger_events\", \"thirdparty\", \"invoice_lines\", \"incomplete\", \"is_waiting_for_ocr\", \"status\", \"tagged_at_ledger_events_level\", \"current_account_plan_item\", \"has_file\", \"file_signed_id\", \"embeddable_in_browser\", \"pages_count\", \"blob_id\", \"url\", \"method\", \"document_tags\", \"mileage_allowance\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new APIInvoice(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.amount = d.amount;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.client_comments_count = d.client_comments_count;\n" +
"        this.company_id = d.company_id;\n" +
"        this.created_at = d.created_at;\n" +
"        this.currency = d.currency;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        if (\"current_account_plan_item_id\" in d)\n" +
"            this.current_account_plan_item_id = d.current_account_plan_item_id;\n" +
"        if (\"date\" in d)\n" +
"            this.date = d.date;\n" +
"        if (\"deadline\" in d)\n" +
"            this.deadline = d.deadline;\n" +
"        this.direction = d.direction;\n" +
"        if (\"email_from\" in d)\n" +
"            this.email_from = d.email_from;\n" +
"        this.filename = d.filename;\n" +
"        if (\"gdrive_path\" in d)\n" +
"            this.gdrive_path = d.gdrive_path;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.id = d.id;\n" +
"        this.invoice_number = d.invoice_number;\n" +
"        this.label = d.label;\n" +
"        this.outstanding_balance = d.outstanding_balance;\n" +
"        this.preview_status = d.preview_status;\n" +
"        this.payment_status = d.payment_status;\n" +
"        this.paid = d.paid;\n" +
"        this.pusher_channel = d.pusher_channel;\n" +
"        this.source = d.source;\n" +
"        this.type = d.type;\n" +
"        this.validation_needed = d.validation_needed;\n" +
"        this.journal_id = d.journal_id;\n" +
"        if (\"thirdparty_id\" in d)\n" +
"            this.thirdparty_id = d.thirdparty_id;\n" +
"        if (\"preview_urls\" in d)\n" +
"            this.preview_urls = d.preview_urls;\n" +
"        if (\"approval_status\" in d)\n" +
"            this.approval_status = d.approval_status;\n" +
"        this.checksum = d.checksum;\n" +
"        this.archived = d.archived;\n" +
"        this.duplicates_count = d.duplicates_count;\n" +
"        this.has_duplicates = d.has_duplicates;\n" +
"        this.invoice_lines_count = d.invoice_lines_count;\n" +
"        this.is_estimate = d.is_estimate;\n" +
"        this.is_employee_expense = d.is_employee_expense;\n" +
"        this.is_factur_x = d.is_factur_x;\n" +
"        this.subcomplete = d.subcomplete;\n" +
"        this.has_closed_ledger_events = d.has_closed_ledger_events;\n" +
"        if (\"thirdparty\" in d)\n" +
"            this.thirdparty = d.thirdparty;\n" +
"        if (\"invoice_lines\" in d)\n" +
"            this.invoice_lines = d.invoice_lines;\n" +
"        this.incomplete = d.incomplete;\n" +
"        this.is_waiting_for_ocr = d.is_waiting_for_ocr;\n" +
"        this.status = d.status;\n" +
"        this.tagged_at_ledger_events_level = d.tagged_at_ledger_events_level;\n" +
"        if (\"current_account_plan_item\" in d)\n" +
"            this.current_account_plan_item = d.current_account_plan_item;\n" +
"        this.has_file = d.has_file;\n" +
"        this.file_signed_id = d.file_signed_id;\n" +
"        this.embeddable_in_browser = d.embeddable_in_browser;\n" +
"        if (\"pages_count\" in d)\n" +
"            this.pages_count = d.pages_count;\n" +
"        this.blob_id = d.blob_id;\n" +
"        this.url = d.url;\n" +
"        this.method = d.method;\n" +
"        if (\"document_tags\" in d)\n" +
"            this.document_tags = d.document_tags;\n" +
"        if (\"mileage_allowance\" in d)\n" +
"            this.mileage_allowance = d.mileage_allowance;\n" +
"    }\n" +
"}\n" +
"class Thirdparty {\n" +
"    static Parse(d) {\n" +
"        return Thirdparty.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, true);\n" +
"        }\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkNumber$4(d.known_supplier_id, true, field + \".known_supplier_id\");\n" +
"        checkNumber$4(d.company_id, false, field + \".company_id\");\n" +
"        checkString$4(d.name, false, field + \".name\");\n" +
"        checkString$4(d.role, false, field + \".role\");\n" +
"        checkString$4(d.address, false, field + \".address\");\n" +
"        checkString$4(d.postal_code, false, field + \".postal_code\");\n" +
"        checkString$4(d.city, false, field + \".city\");\n" +
"        checkString$4(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkString$4(d.vat_number, false, field + \".vat_number\");\n" +
"        checkArray$2(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$4(d.search_terms[i], false, field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$2(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNull$3(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$4(d.reg_no, false, field + \".reg_no\");\n" +
"        checkString$4(d.phone, false, field + \".phone\");\n" +
"        checkString$4(d.first_name, false, field + \".first_name\");\n" +
"        checkBoolean$3(d.recurrent, false, field + \".recurrent\");\n" +
"        checkString$4(d.last_name, false, field + \".last_name\");\n" +
"        checkNull$3(d.gender, field + \".gender\");\n" +
"        checkString$4(d.payment_conditions, false, field + \".payment_conditions\");\n" +
"        checkString$4(d.customer_type, false, field + \".customer_type\");\n" +
"        checkBoolean$3(d.disable_pending_vat, false, field + \".disable_pending_vat\");\n" +
"        checkBoolean$3(d.force_pending_vat, false, field + \".force_pending_vat\");\n" +
"        checkNull$3(d.gocardless_id, field + \".gocardless_id\");\n" +
"        checkBoolean$3(d.invoices_auto_generated, false, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$3(d.invoices_auto_validated, false, field + \".invoices_auto_validated\");\n" +
"        checkNull$3(d.billing_iban, field + \".billing_iban\");\n" +
"        checkNull$3(d.billing_bic, field + \".billing_bic\");\n" +
"        checkNull$3(d.billing_bank, field + \".billing_bank\");\n" +
"        checkString$4(d.recipient, false, field + \".recipient\");\n" +
"        checkString$4(d.billing_language, false, field + \".billing_language\");\n" +
"        checkString$4(d.iban, false, field + \".iban\");\n" +
"        checkNull$3(d.stripe_id, field + \".stripe_id\");\n" +
"        checkNull$3(d.invoice_dump_id, field + \".invoice_dump_id\");\n" +
"        checkString$4(d.delivery_address, false, field + \".delivery_address\");\n" +
"        checkString$4(d.delivery_postal_code, false, field + \".delivery_postal_code\");\n" +
"        checkString$4(d.delivery_city, false, field + \".delivery_city\");\n" +
"        checkString$4(d[\"delivery_country_alpha2\"], false, field + \".delivery_country_alpha2\");\n" +
"        checkString$4(d.reference, false, field + \".reference\");\n" +
"        checkString$4(d.legal_form_code, false, field + \".legal_form_code\");\n" +
"        checkString$4(d.activity_nomenclature, false, field + \".activity_nomenclature\");\n" +
"        checkString$4(d.activity_code, false, field + \".activity_code\");\n" +
"        checkNull$3(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        checkNumber$4(d.plan_item_id, false, field + \".plan_item_id\");\n" +
"        checkBoolean$3(d.rule_enabled, false, field + \".rule_enabled\");\n" +
"        checkNull$3(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        checkString$4(d.supplier_payment_method_last_updated_at, true, field + \".supplier_payment_method_last_updated_at\");\n" +
"        checkString$4(d.notes, false, field + \".notes\");\n" +
"        checkNull$3(d.admin_city_code, field + \".admin_city_code\");\n" +
"        checkString$4(d.establishment_no, true, field + \".establishment_no\");\n" +
"        checkString$4(d.address_additional_info, false, field + \".address_additional_info\");\n" +
"        checkString$4(d.delivery_address_additional_info, false, field + \".delivery_address_additional_info\");\n" +
"        checkString$4(d.vat_rate, true, field + \".vat_rate\");\n" +
"        checkNumber$4(d.pnl_plan_item_id, true, field + \".pnl_plan_item_id\");\n" +
"        checkString$4(d.source_id, false, field + \".source_id\");\n" +
"        checkString$4(d.country, true, field + \".country\");\n" +
"        checkNull$3(d.delivery_country, field + \".delivery_country\");\n" +
"        checkBoolean$3(d.complete, false, field + \".complete\");\n" +
"        checkString$4(d.url, false, field + \".url\");\n" +
"        checkString$4(d.method, false, field + \".method\");\n" +
"        checkNull$3(d.billing_footer_invoice_label, field + \".billing_footer_invoice_label\");\n" +
"        checkNull$3(d.display_name, field + \".display_name\");\n" +
"        checkNull$3(d.debits, field + \".debits\");\n" +
"        checkNull$3(d.credits, field + \".credits\");\n" +
"        checkNull$3(d.balance, field + \".balance\");\n" +
"        checkNull$3(d.invoice_count, field + \".invoice_count\");\n" +
"        checkNull$3(d.purchase_request_count, field + \".purchase_request_count\");\n" +
"        checkNull$3(d.estimate_count, field + \".estimate_count\");\n" +
"        checkNull$3(d.turnover, field + \".turnover\");\n" +
"        checkNull$3(d.ledger_events_count, field + \".ledger_events_count\");\n" +
"        d.plan_item = PlanItemOrPnlPlanItem.Create(d.plan_item, field + \".plan_item\");\n" +
"        d.pnl_plan_item = PnlPlanItem$1.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkNull$3(d.current_mandate, field + \".current_mandate\");\n" +
"        checkBoolean$3(d.received_a_mandate_request, false, field + \".received_a_mandate_request\");\n" +
"        checkNull$3(d.notes_comment, field + \".notes_comment\");\n" +
"        checkNull$3(d.plan_item_attributes, field + \".plan_item_attributes\");\n" +
"        checkArray$2(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                checkNull$3(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"id\", \"known_supplier_id\", \"company_id\", \"name\", \"role\", \"address\", \"postal_code\", \"city\", \"country_alpha2\", \"vat_number\", \"search_terms\", \"emails\", \"reg_no\", \"phone\", \"first_name\", \"recurrent\", \"last_name\", \"gender\", \"payment_conditions\", \"customer_type\", \"disable_pending_vat\", \"force_pending_vat\", \"gocardless_id\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"billing_iban\", \"billing_bic\", \"billing_bank\", \"recipient\", \"billing_language\", \"iban\", \"stripe_id\", \"invoice_dump_id\", \"delivery_address\", \"delivery_postal_code\", \"delivery_city\", \"delivery_country_alpha2\", \"reference\", \"legal_form_code\", \"activity_nomenclature\", \"activity_code\", \"billing_footer_invoice_id\", \"plan_item_id\", \"rule_enabled\", \"supplier_payment_method\", \"supplier_payment_method_last_updated_at\", \"notes\", \"admin_city_code\", \"establishment_no\", \"address_additional_info\", \"delivery_address_additional_info\", \"vat_rate\", \"pnl_plan_item_id\", \"source_id\", \"country\", \"delivery_country\", \"complete\", \"url\", \"method\", \"billing_footer_invoice_label\", \"display_name\", \"debits\", \"credits\", \"balance\", \"invoice_count\", \"purchase_request_count\", \"estimate_count\", \"turnover\", \"ledger_events_count\", \"plan_item\", \"pnl_plan_item\", \"current_mandate\", \"received_a_mandate_request\", \"notes_comment\", \"plan_item_attributes\", \"tags\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new Thirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        if (\"known_supplier_id\" in d)\n" +
"            this.known_supplier_id = d.known_supplier_id;\n" +
"        this.company_id = d.company_id;\n" +
"        this.name = d.name;\n" +
"        this.role = d.role;\n" +
"        this.address = d.address;\n" +
"        this.postal_code = d.postal_code;\n" +
"        this.city = d.city;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.vat_number = d.vat_number;\n" +
"        if (\"search_terms\" in d)\n" +
"            this.search_terms = d.search_terms;\n" +
"        if (\"emails\" in d)\n" +
"            this.emails = d.emails;\n" +
"        this.reg_no = d.reg_no;\n" +
"        this.phone = d.phone;\n" +
"        this.first_name = d.first_name;\n" +
"        this.recurrent = d.recurrent;\n" +
"        this.last_name = d.last_name;\n" +
"        if (\"gender\" in d)\n" +
"            this.gender = d.gender;\n" +
"        this.payment_conditions = d.payment_conditions;\n" +
"        this.customer_type = d.customer_type;\n" +
"        this.disable_pending_vat = d.disable_pending_vat;\n" +
"        this.force_pending_vat = d.force_pending_vat;\n" +
"        if (\"gocardless_id\" in d)\n" +
"            this.gocardless_id = d.gocardless_id;\n" +
"        this.invoices_auto_generated = d.invoices_auto_generated;\n" +
"        this.invoices_auto_validated = d.invoices_auto_validated;\n" +
"        if (\"billing_iban\" in d)\n" +
"            this.billing_iban = d.billing_iban;\n" +
"        if (\"billing_bic\" in d)\n" +
"            this.billing_bic = d.billing_bic;\n" +
"        if (\"billing_bank\" in d)\n" +
"            this.billing_bank = d.billing_bank;\n" +
"        this.recipient = d.recipient;\n" +
"        this.billing_language = d.billing_language;\n" +
"        this.iban = d.iban;\n" +
"        if (\"stripe_id\" in d)\n" +
"            this.stripe_id = d.stripe_id;\n" +
"        if (\"invoice_dump_id\" in d)\n" +
"            this.invoice_dump_id = d.invoice_dump_id;\n" +
"        this.delivery_address = d.delivery_address;\n" +
"        this.delivery_postal_code = d.delivery_postal_code;\n" +
"        this.delivery_city = d.delivery_city;\n" +
"        this[\"delivery_country_alpha2\"] = d[\"delivery_country_alpha2\"];\n" +
"        this.reference = d.reference;\n" +
"        this.legal_form_code = d.legal_form_code;\n" +
"        this.activity_nomenclature = d.activity_nomenclature;\n" +
"        this.activity_code = d.activity_code;\n" +
"        if (\"billing_footer_invoice_id\" in d)\n" +
"            this.billing_footer_invoice_id = d.billing_footer_invoice_id;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.rule_enabled = d.rule_enabled;\n" +
"        if (\"supplier_payment_method\" in d)\n" +
"            this.supplier_payment_method = d.supplier_payment_method;\n" +
"        if (\"supplier_payment_method_last_updated_at\" in d)\n" +
"            this.supplier_payment_method_last_updated_at = d.supplier_payment_method_last_updated_at;\n" +
"        this.notes = d.notes;\n" +
"        if (\"admin_city_code\" in d)\n" +
"            this.admin_city_code = d.admin_city_code;\n" +
"        if (\"establishment_no\" in d)\n" +
"            this.establishment_no = d.establishment_no;\n" +
"        this.address_additional_info = d.address_additional_info;\n" +
"        this.delivery_address_additional_info = d.delivery_address_additional_info;\n" +
"        if (\"vat_rate\" in d)\n" +
"            this.vat_rate = d.vat_rate;\n" +
"        if (\"pnl_plan_item_id\" in d)\n" +
"            this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        this.source_id = d.source_id;\n" +
"        if (\"country\" in d)\n" +
"            this.country = d.country;\n" +
"        if (\"delivery_country\" in d)\n" +
"            this.delivery_country = d.delivery_country;\n" +
"        this.complete = d.complete;\n" +
"        this.url = d.url;\n" +
"        this.method = d.method;\n" +
"        if (\"billing_footer_invoice_label\" in d)\n" +
"            this.billing_footer_invoice_label = d.billing_footer_invoice_label;\n" +
"        if (\"display_name\" in d)\n" +
"            this.display_name = d.display_name;\n" +
"        if (\"debits\" in d)\n" +
"            this.debits = d.debits;\n" +
"        if (\"credits\" in d)\n" +
"            this.credits = d.credits;\n" +
"        if (\"balance\" in d)\n" +
"            this.balance = d.balance;\n" +
"        if (\"invoice_count\" in d)\n" +
"            this.invoice_count = d.invoice_count;\n" +
"        if (\"purchase_request_count\" in d)\n" +
"            this.purchase_request_count = d.purchase_request_count;\n" +
"        if (\"estimate_count\" in d)\n" +
"            this.estimate_count = d.estimate_count;\n" +
"        if (\"turnover\" in d)\n" +
"            this.turnover = d.turnover;\n" +
"        if (\"ledger_events_count\" in d)\n" +
"            this.ledger_events_count = d.ledger_events_count;\n" +
"        this.plan_item = d.plan_item;\n" +
"        if (\"pnl_plan_item\" in d)\n" +
"            this.pnl_plan_item = d.pnl_plan_item;\n" +
"        if (\"current_mandate\" in d)\n" +
"            this.current_mandate = d.current_mandate;\n" +
"        this.received_a_mandate_request = d.received_a_mandate_request;\n" +
"        if (\"notes_comment\" in d)\n" +
"            this.notes_comment = d.notes_comment;\n" +
"        if (\"plan_item_attributes\" in d)\n" +
"            this.plan_item_attributes = d.plan_item_attributes;\n" +
"        if (\"tags\" in d)\n" +
"            this.tags = d.tags;\n" +
"    }\n" +
"}\n" +
"class PlanItemOrPnlPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItemOrPnlPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$4(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, false);\n" +
"        }\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkString$4(d.number, false, field + \".number\");\n" +
"        checkNull$3(d.internal_identifier, field + \".internal_identifier\");\n" +
"        checkString$4(d.label, false, field + \".label\");\n" +
"        checkNumber$4(d.company_id, false, field + \".company_id\");\n" +
"        checkBoolean$3(d.enabled, false, field + \".enabled\");\n" +
"        checkString$4(d.vat_rate, false, field + \".vat_rate\");\n" +
"        checkString$4(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkBoolean$3(d.label_is_editable, false, field + \".label_is_editable\");\n" +
"        const knownProperties = [\"id\", \"number\", \"internal_identifier\", \"label\", \"company_id\", \"enabled\", \"vat_rate\", \"country_alpha2\", \"label_is_editable\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new PlanItemOrPnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"        if (\"internal_identifier\" in d)\n" +
"            this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.company_id = d.company_id;\n" +
"        this.enabled = d.enabled;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"    }\n" +
"}\n" +
"let PnlPlanItem$1 = class PnlPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, true);\n" +
"        }\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkString$4(d.number, false, field + \".number\");\n" +
"        checkString$4(d.internal_identifier, true, field + \".internal_identifier\");\n" +
"        checkString$4(d.label, false, field + \".label\");\n" +
"        checkNumber$4(d.company_id, false, field + \".company_id\");\n" +
"        checkBoolean$3(d.enabled, false, field + \".enabled\");\n" +
"        checkString$4(d.vat_rate, false, field + \".vat_rate\");\n" +
"        checkString$4(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkBoolean$3(d.label_is_editable, false, field + \".label_is_editable\");\n" +
"        const knownProperties = [\"id\", \"number\", \"internal_identifier\", \"label\", \"company_id\", \"enabled\", \"vat_rate\", \"country_alpha2\", \"label_is_editable\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new PnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"        if (\"internal_identifier\" in d)\n" +
"            this.internal_identifier = d.internal_identifier;\n" +
"        this.label = d.label;\n" +
"        this.company_id = d.company_id;\n" +
"        this.enabled = d.enabled;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.label_is_editable = d.label_is_editable;\n" +
"    }\n" +
"};\n" +
"class InvoiceLinesEntity {\n" +
"    static Parse(d) {\n" +
"        return InvoiceLinesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$4(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, false);\n" +
"        }\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkString$4(d.amount, false, field + \".amount\");\n" +
"        checkString$4(d.tax, false, field + \".tax\");\n" +
"        checkString$4(d.currency_amount, false, field + \".currency_amount\");\n" +
"        checkString$4(d.currency_price_before_tax, false, field + \".currency_price_before_tax\");\n" +
"        checkString$4(d.currency_tax, false, field + \".currency_tax\");\n" +
"        checkString$4(d.label, false, field + \".label\");\n" +
"        checkNumber$4(d.pnl_plan_item_id, false, field + \".pnl_plan_item_id\");\n" +
"        checkNull$3(d.advance, field + \".advance\");\n" +
"        checkString$4(d.vat_rate, false, field + \".vat_rate\");\n" +
"        checkString$4(d.ocr_vat_rate, true, field + \".ocr_vat_rate\");\n" +
"        checkNumber$4(d.asset_id, true, field + \".asset_id\");\n" +
"        checkNull$3(d.deferral_id, field + \".deferral_id\");\n" +
"        checkNull$3(d.advance_id, field + \".advance_id\");\n" +
"        checkBoolean$3(d.prepaid_pnl, false, field + \".prepaid_pnl\");\n" +
"        checkBoolean$3(d.global_vat, false, field + \".global_vat\");\n" +
"        checkNull$3(d.ledger_event_label, field + \".ledger_event_label\");\n" +
"        d.pnl_plan_item = PnlPlanItem1.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkNull$3(d.deferral, field + \".deferral\");\n" +
"        d.asset = Asset.Create(d.asset, field + \".asset\");\n" +
"        checkBoolean$3(d.advance_pnl, false, field + \".advance_pnl\");\n" +
"        const knownProperties = [\"id\", \"amount\", \"tax\", \"currency_amount\", \"currency_price_before_tax\", \"currency_tax\", \"label\", \"pnl_plan_item_id\", \"advance\", \"vat_rate\", \"ocr_vat_rate\", \"asset_id\", \"deferral_id\", \"advance_id\", \"prepaid_pnl\", \"global_vat\", \"ledger_event_label\", \"pnl_plan_item\", \"deferral\", \"asset\", \"advance_pnl\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new InvoiceLinesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.amount = d.amount;\n" +
"        this.tax = d.tax;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_price_before_tax = d.currency_price_before_tax;\n" +
"        this.currency_tax = d.currency_tax;\n" +
"        this.label = d.label;\n" +
"        this.pnl_plan_item_id = d.pnl_plan_item_id;\n" +
"        if (\"advance\" in d)\n" +
"            this.advance = d.advance;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"        if (\"ocr_vat_rate\" in d)\n" +
"            this.ocr_vat_rate = d.ocr_vat_rate;\n" +
"        if (\"asset_id\" in d)\n" +
"            this.asset_id = d.asset_id;\n" +
"        if (\"deferral_id\" in d)\n" +
"            this.deferral_id = d.deferral_id;\n" +
"        if (\"advance_id\" in d)\n" +
"            this.advance_id = d.advance_id;\n" +
"        this.prepaid_pnl = d.prepaid_pnl;\n" +
"        this.global_vat = d.global_vat;\n" +
"        if (\"ledger_event_label\" in d)\n" +
"            this.ledger_event_label = d.ledger_event_label;\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        if (\"deferral\" in d)\n" +
"            this.deferral = d.deferral;\n" +
"        if (\"asset\" in d)\n" +
"            this.asset = d.asset;\n" +
"        this.advance_pnl = d.advance_pnl;\n" +
"    }\n" +
"}\n" +
"class PnlPlanItem1 {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItem1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$4(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, false);\n" +
"        }\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkString$4(d.number, false, field + \".number\");\n" +
"        checkString$4(d.label, false, field + \".label\");\n" +
"        checkBoolean$3(d.enabled, false, field + \".enabled\");\n" +
"        const knownProperties = [\"id\", \"number\", \"label\", \"enabled\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new PnlPlanItem1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"        this.label = d.label;\n" +
"        this.enabled = d.enabled;\n" +
"    }\n" +
"}\n" +
"class Asset {\n" +
"    static Parse(d) {\n" +
"        return Asset.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, true);\n" +
"        }\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkString$4(d.name, false, field + \".name\");\n" +
"        checkNumber$4(d.plan_item_id, false, field + \".plan_item_id\");\n" +
"        checkString$4(d.entry_date, false, field + \".entry_date\");\n" +
"        checkString$4(d.start_date, true, field + \".start_date\");\n" +
"        checkNumber$4(d.quantity, false, field + \".quantity\");\n" +
"        checkString$4(d.amortization_type, true, field + \".amortization_type\");\n" +
"        checkNumber$4(d.amortization_months, false, field + \".amortization_months\");\n" +
"        checkBoolean$3(d.invoice_line_editable, false, field + \".invoice_line_editable\");\n" +
"        const knownProperties = [\"id\", \"name\", \"plan_item_id\", \"entry_date\", \"start_date\", \"quantity\", \"amortization_type\", \"amortization_months\", \"invoice_line_editable\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new Asset(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.name = d.name;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        this.entry_date = d.entry_date;\n" +
"        if (\"start_date\" in d)\n" +
"            this.start_date = d.start_date;\n" +
"        this.quantity = d.quantity;\n" +
"        if (\"amortization_type\" in d)\n" +
"            this.amortization_type = d.amortization_type;\n" +
"        this.amortization_months = d.amortization_months;\n" +
"        this.invoice_line_editable = d.invoice_line_editable;\n" +
"    }\n" +
"}\n" +
"class DocumentTagsEntity {\n" +
"    static Parse(d) {\n" +
"        return DocumentTagsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, true);\n" +
"        }\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkNumber$4(d.document_id, false, field + \".document_id\");\n" +
"        checkNumber$4(d.tag_id, false, field + \".tag_id\");\n" +
"        checkNumber$4(d.group_id, false, field + \".group_id\");\n" +
"        checkString$4(d.weight, false, field + \".weight\");\n" +
"        d.tag = Tag.Create(d.tag, field + \".tag\");\n" +
"        const knownProperties = [\"id\", \"document_id\", \"tag_id\", \"group_id\", \"weight\", \"tag\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new DocumentTagsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.document_id = d.document_id;\n" +
"        this.tag_id = d.tag_id;\n" +
"        this.group_id = d.group_id;\n" +
"        this.weight = d.weight;\n" +
"        this.tag = d.tag;\n" +
"    }\n" +
"}\n" +
"class Tag {\n" +
"    static Parse(d) {\n" +
"        return Tag.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$4(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, false);\n" +
"        }\n" +
"        checkNumber$4(d.id, false, field + \".id\");\n" +
"        checkString$4(d.label, false, field + \".label\");\n" +
"        checkNull$3(d.analytical_code, field + \".analytical_code\");\n" +
"        checkNumber$4(d.group_id, false, field + \".group_id\");\n" +
"        checkNull$3(d.variant, field + \".variant\");\n" +
"        checkNull$3(d.icon, field + \".icon\");\n" +
"        d.group = Group$1.Create(d.group, field + \".group\");\n" +
"        const knownProperties = [\"id\", \"label\", \"analytical_code\", \"group_id\", \"variant\", \"icon\", \"group\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new Tag(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        if (\"analytical_code\" in d)\n" +
"            this.analytical_code = d.analytical_code;\n" +
"        this.group_id = d.group_id;\n" +
"        if (\"variant\" in d)\n" +
"            this.variant = d.variant;\n" +
"        if (\"icon\" in d)\n" +
"            this.icon = d.icon;\n" +
"        this.group = d.group;\n" +
"    }\n" +
"}\n" +
"let Group$1 = class Group {\n" +
"    static Parse(d) {\n" +
"        return Group.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$5 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$4(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$4(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$4(field, d, false);\n" +
"        }\n" +
"        checkString$4(d.label, false, field + \".label\");\n" +
"        checkString$4(d.icon, false, field + \".icon\");\n" +
"        checkBoolean$3(d.self_service_accounting, false, field + \".self_service_accounting\");\n" +
"        const knownProperties = [\"label\", \"icon\", \"self_service_accounting\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$5(unknownProperty, d, \"never\", false);\n" +
"        return new Group(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.label = d.label;\n" +
"        this.icon = d.icon;\n" +
"        this.self_service_accounting = d.self_service_accounting;\n" +
"    }\n" +
"};\n" +
"function throwNull2NonNull$4(field, d) {\n" +
"    return errorHelper$5(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$4(field, d, nullable) {\n" +
"    return errorHelper$5(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$4(field, d, nullable) {\n" +
"    return errorHelper$5(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkArray$2(d, field) {\n" +
"    if (!Array.isArray(d) && d !== null && d !== undefined) {\n" +
"        errorHelper$5(field, d, \"array\", true);\n" +
"    }\n" +
"}\n" +
"function checkNumber$4(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$5(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkBoolean$3(d, nullable, field) {\n" +
"    if (typeof (d) !== 'boolean' && (true)) {\n" +
"        errorHelper$5(field, d, \"boolean\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$4(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$5(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkNull$3(d, field) {\n" +
"    if (d !== null && d !== undefined) {\n" +
"        errorHelper$5(field, d, \"null or undefined\", false);\n" +
"    }\n" +
"}\n" +
"function errorHelper$5(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$5 + ':', JSON.stringify(obj$5));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$5));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$4 = 'APILedgerEvent';\n" +
"let obj$4 = null;\n" +
"class APILedgerEvent {\n" +
"    static Parse(d) {\n" +
"        return APILedgerEvent.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$3(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d, false);\n" +
"        }\n" +
"        checkNumber$3(d.id, false, field + \".id\");\n" +
"        checkString$3(d.balance, false, field + \".balance\");\n" +
"        checkNumber$3(d.plan_item_id, false, field + \".plan_item_id\");\n" +
"        checkNumber$3(d.lettering_id, true, field + \".lettering_id\");\n" +
"        checkNumber$3(d.reconciliation_id, true, field + \".reconciliation_id\");\n" +
"        checkString$3(d.source, false, field + \".source\");\n" +
"        checkBoolean$2(d.closed, false, field + \".closed\");\n" +
"        checkString$3(d.debit, false, field + \".debit\");\n" +
"        checkString$3(d.credit, false, field + \".credit\");\n" +
"        checkString$3(d.amount, false, field + \".amount\");\n" +
"        d.planItem = PlanItem$1.Create(d.planItem, field + \".planItem\");\n" +
"        checkString$3(d.label, true, field + \".label\");\n" +
"        checkBoolean$2(d.readonly, false, field + \".readonly\");\n" +
"        checkBoolean$2(d.readonlyAmounts, false, field + \".readonlyAmounts\");\n" +
"        d.lettering = Lettering.Create(d.lettering, field + \".lettering\");\n" +
"        const knownProperties = [\"id\", \"balance\", \"plan_item_id\", \"lettering_id\", \"reconciliation_id\", \"source\", \"closed\", \"debit\", \"credit\", \"amount\", \"planItem\", \"label\", \"readonly\", \"readonlyAmounts\", \"lettering\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(unknownProperty, d, \"never\", false);\n" +
"        return new APILedgerEvent(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.balance = d.balance;\n" +
"        this.plan_item_id = d.plan_item_id;\n" +
"        if (\"lettering_id\" in d)\n" +
"            this.lettering_id = d.lettering_id;\n" +
"        if (\"reconciliation_id\" in d)\n" +
"            this.reconciliation_id = d.reconciliation_id;\n" +
"        this.source = d.source;\n" +
"        this.closed = d.closed;\n" +
"        this.debit = d.debit;\n" +
"        this.credit = d.credit;\n" +
"        this.amount = d.amount;\n" +
"        this.planItem = d.planItem;\n" +
"        if (\"label\" in d)\n" +
"            this.label = d.label;\n" +
"        this.readonly = d.readonly;\n" +
"        this.readonlyAmounts = d.readonlyAmounts;\n" +
"        if (\"lettering\" in d)\n" +
"            this.lettering = d.lettering;\n" +
"    }\n" +
"}\n" +
"let PlanItem$1 = class PlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$3(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d, false);\n" +
"        }\n" +
"        checkNumber$3(d.id, false, field + \".id\");\n" +
"        checkString$3(d.number, false, field + \".number\");\n" +
"        checkString$3(d.vat_rate, false, field + \".vat_rate\");\n" +
"        checkString$3(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkString$3(d.label, false, field + \".label\");\n" +
"        checkBoolean$2(d.enabled, false, field + \".enabled\");\n" +
"        const knownProperties = [\"id\", \"number\", \"vat_rate\", \"country_alpha2\", \"label\", \"enabled\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(unknownProperty, d, \"never\", false);\n" +
"        return new PlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.number = d.number;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.label = d.label;\n" +
"        this.enabled = d.enabled;\n" +
"    }\n" +
"};\n" +
"class Lettering {\n" +
"    static Parse(d) {\n" +
"        return Lettering.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$4 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$3(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$3(field, d, true);\n" +
"        }\n" +
"        checkNumber$3(d.id, false, field + \".id\");\n" +
"        checkString$3(d.balance, false, field + \".balance\");\n" +
"        checkString$3(d.min_date, false, field + \".min_date\");\n" +
"        checkString$3(d.max_date, false, field + \".max_date\");\n" +
"        checkString$3(d.plan_item_number, false, field + \".plan_item_number\");\n" +
"        const knownProperties = [\"id\", \"balance\", \"min_date\", \"max_date\", \"plan_item_number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$4(unknownProperty, d, \"never\", false);\n" +
"        return new Lettering(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.balance = d.balance;\n" +
"        this.min_date = d.min_date;\n" +
"        this.max_date = d.max_date;\n" +
"        this.plan_item_number = d.plan_item_number;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$3(field, d) {\n" +
"    return errorHelper$4(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$3(field, d, nullable) {\n" +
"    return errorHelper$4(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$3(field, d, nullable) {\n" +
"    return errorHelper$4(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkNumber$3(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$4(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkBoolean$2(d, nullable, field) {\n" +
"    if (typeof (d) !== 'boolean' && (true)) {\n" +
"        errorHelper$4(field, d, \"boolean\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$3(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$4(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function errorHelper$4(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$4 + ':', JSON.stringify(obj$4));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$4));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$3 = 'APIThirdparty';\n" +
"let obj$3 = null;\n" +
"class APIThirdparty {\n" +
"    static Parse(d) {\n" +
"        return APIThirdparty.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$2(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, false);\n" +
"        }\n" +
"        d.supplier = Supplier.Create(d.supplier, field + \".supplier\");\n" +
"        d.customer = Customer.Create(d.customer, field + \".customer\");\n" +
"        const knownProperties = [\"supplier\", \"customer\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new APIThirdparty(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"supplier\" in d)\n" +
"            this.supplier = d.supplier;\n" +
"        if (\"customer\" in d)\n" +
"            this.customer = d.customer;\n" +
"    }\n" +
"}\n" +
"class Supplier {\n" +
"    static Parse(d) {\n" +
"        return Supplier.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, true);\n" +
"        }\n" +
"        checkNumber$2(d.id, false, field + \".id\");\n" +
"        checkNumber$2(d.company_id, false, field + \".company_id\");\n" +
"        checkBoolean$1(d.disable_pending_vat, false, field + \".disable_pending_vat\");\n" +
"        checkArray$1(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNull$2(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$2(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkBoolean$1(d.force_pending_vat, false, field + \".force_pending_vat\");\n" +
"        checkString$2(d.iban, false, field + \".iban\");\n" +
"        checkBoolean$1(d.invoices_auto_generated, false, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$1(d.invoices_auto_validated, false, field + \".invoices_auto_validated\");\n" +
"        checkString$2(d.name, false, field + \".name\");\n" +
"        checkString$2(d.notes, false, field + \".notes\");\n" +
"        checkArray$1(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$2(d.search_terms[i], false, field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$2(d.supplier_payment_method, field + \".supplier_payment_method\");\n" +
"        checkString$2(d.vat_number, false, field + \".vat_number\");\n" +
"        checkNull$2(d.supplier_due_date_delay, field + \".supplier_due_date_delay\");\n" +
"        checkString$2(d.supplier_due_date_rule, false, field + \".supplier_due_date_rule\");\n" +
"        checkString$2(d.address, false, field + \".address\");\n" +
"        checkString$2(d.city, false, field + \".city\");\n" +
"        checkString$2(d.postal_code, false, field + \".postal_code\");\n" +
"        checkNull$2(d.admin_city_code, field + \".admin_city_code\");\n" +
"        checkString$2(d.activity_nomenclature, false, field + \".activity_nomenclature\");\n" +
"        checkNull$2(d.establishment_no, field + \".establishment_no\");\n" +
"        checkNull$2(d.notes_comment, field + \".notes_comment\");\n" +
"        d.plan_item = PlanItem.Create(d.plan_item, field + \".plan_item\");\n" +
"        checkArray$1(d.thirdparty_invoice_line_rules, field + \".thirdparty_invoice_line_rules\");\n" +
"        if (d.thirdparty_invoice_line_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {\n" +
"                d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity.Create(d.thirdparty_invoice_line_rules[i], field + \".thirdparty_invoice_line_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$1(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                d.tags[i] = TagsEntityOrTag.Create(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$1(d.thirdparties_tags, field + \".thirdparties_tags\");\n" +
"        if (d.thirdparties_tags) {\n" +
"            for (let i = 0; i < d.thirdparties_tags.length; i++) {\n" +
"                d.thirdparties_tags[i] = ThirdpartiesTagsEntity.Create(d.thirdparties_tags[i], field + \".thirdparties_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.iban_last_update = IbanLastUpdate.Create(d.iban_last_update, field + \".iban_last_update\");\n" +
"        checkArray$1(d.thirdparty_visibility_rules, field + \".thirdparty_visibility_rules\");\n" +
"        if (d.thirdparty_visibility_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_visibility_rules.length; i++) {\n" +
"                d.thirdparty_visibility_rules[i] = ThirdpartyVisibilityRulesEntity.Create(d.thirdparty_visibility_rules[i], field + \".thirdparty_visibility_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"id\", \"company_id\", \"disable_pending_vat\", \"emails\", \"country_alpha2\", \"force_pending_vat\", \"iban\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"name\", \"notes\", \"search_terms\", \"supplier_payment_method\", \"vat_number\", \"supplier_due_date_delay\", \"supplier_due_date_rule\", \"address\", \"city\", \"postal_code\", \"admin_city_code\", \"activity_nomenclature\", \"establishment_no\", \"notes_comment\", \"plan_item\", \"thirdparty_invoice_line_rules\", \"tags\", \"thirdparties_tags\", \"iban_last_update\", \"thirdparty_visibility_rules\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new Supplier(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.company_id = d.company_id;\n" +
"        this.disable_pending_vat = d.disable_pending_vat;\n" +
"        if (\"emails\" in d)\n" +
"            this.emails = d.emails;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.force_pending_vat = d.force_pending_vat;\n" +
"        this.iban = d.iban;\n" +
"        this.invoices_auto_generated = d.invoices_auto_generated;\n" +
"        this.invoices_auto_validated = d.invoices_auto_validated;\n" +
"        this.name = d.name;\n" +
"        this.notes = d.notes;\n" +
"        if (\"search_terms\" in d)\n" +
"            this.search_terms = d.search_terms;\n" +
"        if (\"supplier_payment_method\" in d)\n" +
"            this.supplier_payment_method = d.supplier_payment_method;\n" +
"        this.vat_number = d.vat_number;\n" +
"        if (\"supplier_due_date_delay\" in d)\n" +
"            this.supplier_due_date_delay = d.supplier_due_date_delay;\n" +
"        this.supplier_due_date_rule = d.supplier_due_date_rule;\n" +
"        this.address = d.address;\n" +
"        this.city = d.city;\n" +
"        this.postal_code = d.postal_code;\n" +
"        if (\"admin_city_code\" in d)\n" +
"            this.admin_city_code = d.admin_city_code;\n" +
"        this.activity_nomenclature = d.activity_nomenclature;\n" +
"        if (\"establishment_no\" in d)\n" +
"            this.establishment_no = d.establishment_no;\n" +
"        if (\"notes_comment\" in d)\n" +
"            this.notes_comment = d.notes_comment;\n" +
"        this.plan_item = d.plan_item;\n" +
"        if (\"thirdparty_invoice_line_rules\" in d)\n" +
"            this.thirdparty_invoice_line_rules = d.thirdparty_invoice_line_rules;\n" +
"        if (\"tags\" in d)\n" +
"            this.tags = d.tags;\n" +
"        if (\"thirdparties_tags\" in d)\n" +
"            this.thirdparties_tags = d.thirdparties_tags;\n" +
"        if (\"iban_last_update\" in d)\n" +
"            this.iban_last_update = d.iban_last_update;\n" +
"        if (\"thirdparty_visibility_rules\" in d)\n" +
"            this.thirdparty_visibility_rules = d.thirdparty_visibility_rules;\n" +
"    }\n" +
"}\n" +
"class PlanItem {\n" +
"    static Parse(d) {\n" +
"        return PlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$2(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, false);\n" +
"        }\n" +
"        checkNumber$2(d.id, false, field + \".id\");\n" +
"        checkString$2(d.number, false, field + \".number\");\n" +
"        const knownProperties = [\"id\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
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
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$2(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, false);\n" +
"        }\n" +
"        d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkString$2(d.vat_rate, true, field + \".vat_rate\");\n" +
"        const knownProperties = [\"pnl_plan_item\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new ThirdpartyInvoiceLineRulesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        if (\"vat_rate\" in d)\n" +
"            this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"class PnlPlanItem {\n" +
"    static Parse(d) {\n" +
"        return PnlPlanItem.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$2(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, false);\n" +
"        }\n" +
"        checkNumber$2(d.id, false, field + \".id\");\n" +
"        checkBoolean$1(d.enabled, false, field + \".enabled\");\n" +
"        checkString$2(d.label, false, field + \".label\");\n" +
"        checkString$2(d.number, false, field + \".number\");\n" +
"        const knownProperties = [\"id\", \"enabled\", \"label\", \"number\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new PnlPlanItem(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.enabled = d.enabled;\n" +
"        this.label = d.label;\n" +
"        this.number = d.number;\n" +
"    }\n" +
"}\n" +
"class TagsEntityOrTag {\n" +
"    static Parse(d) {\n" +
"        return TagsEntityOrTag.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, true);\n" +
"        }\n" +
"        checkNumber$2(d.id, false, field + \".id\");\n" +
"        checkString$2(d.label, false, field + \".label\");\n" +
"        checkNumber$2(d.group_id, false, field + \".group_id\");\n" +
"        d.group = Group.Create(d.group, field + \".group\");\n" +
"        const knownProperties = [\"id\", \"label\", \"group_id\", \"group\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new TagsEntityOrTag(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.group_id = d.group_id;\n" +
"        this.group = d.group;\n" +
"    }\n" +
"}\n" +
"class Group {\n" +
"    static Parse(d) {\n" +
"        return Group.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$2(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, false);\n" +
"        }\n" +
"        checkString$2(d.label, false, field + \".label\");\n" +
"        checkBoolean$1(d.self_service_accounting, false, field + \".self_service_accounting\");\n" +
"        const knownProperties = [\"label\", \"self_service_accounting\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
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
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, true);\n" +
"        }\n" +
"        checkNumber$2(d.id, false, field + \".id\");\n" +
"        checkString$2(d.weight, false, field + \".weight\");\n" +
"        d.tag = TagsEntityOrTag1.Create(d.tag, field + \".tag\");\n" +
"        const knownProperties = [\"id\", \"weight\", \"tag\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new ThirdpartiesTagsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.weight = d.weight;\n" +
"        this.tag = d.tag;\n" +
"    }\n" +
"}\n" +
"class TagsEntityOrTag1 {\n" +
"    static Parse(d) {\n" +
"        return TagsEntityOrTag1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$2(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, false);\n" +
"        }\n" +
"        checkNumber$2(d.id, false, field + \".id\");\n" +
"        checkString$2(d.label, false, field + \".label\");\n" +
"        checkNumber$2(d.group_id, false, field + \".group_id\");\n" +
"        d.group = Group.Create(d.group, field + \".group\");\n" +
"        const knownProperties = [\"id\", \"label\", \"group_id\", \"group\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new TagsEntityOrTag1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.label = d.label;\n" +
"        this.group_id = d.group_id;\n" +
"        this.group = d.group;\n" +
"    }\n" +
"}\n" +
"class IbanLastUpdate {\n" +
"    static Parse(d) {\n" +
"        return IbanLastUpdate.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, true);\n" +
"        }\n" +
"        checkString$2(d.at, false, field + \".at\");\n" +
"        checkString$2(d.name, false, field + \".name\");\n" +
"        checkBoolean$1(d.from_pennylane, false, field + \".from_pennylane\");\n" +
"        const knownProperties = [\"at\", \"name\", \"from_pennylane\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new IbanLastUpdate(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.at = d.at;\n" +
"        this.name = d.name;\n" +
"        this.from_pennylane = d.from_pennylane;\n" +
"    }\n" +
"}\n" +
"class ThirdpartyVisibilityRulesEntity {\n" +
"    static Parse(d) {\n" +
"        return ThirdpartyVisibilityRulesEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$2(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, false);\n" +
"        }\n" +
"        checkNumber$2(d.id, false, field + \".id\");\n" +
"        checkString$2(d.visible_on, false, field + \".visible_on\");\n" +
"        const knownProperties = [\"id\", \"visible_on\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new ThirdpartyVisibilityRulesEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.visible_on = d.visible_on;\n" +
"    }\n" +
"}\n" +
"class Customer {\n" +
"    static Parse(d) {\n" +
"        return Customer.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            return null;\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, true);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, true);\n" +
"        }\n" +
"        checkNumber$2(d.id, false, field + \".id\");\n" +
"        checkNumber$2(d.company_id, false, field + \".company_id\");\n" +
"        checkString$2(d.address, false, field + \".address\");\n" +
"        checkString$2(d.address_additional_info, false, field + \".address_additional_info\");\n" +
"        checkNull$2(d.billing_bank, field + \".billing_bank\");\n" +
"        checkNull$2(d.billing_bic, field + \".billing_bic\");\n" +
"        checkNull$2(d.billing_footer_invoice_id, field + \".billing_footer_invoice_id\");\n" +
"        checkNull$2(d.billing_iban, field + \".billing_iban\");\n" +
"        checkString$2(d.billing_language, false, field + \".billing_language\");\n" +
"        checkString$2(d.city, false, field + \".city\");\n" +
"        checkString$2(d[\"country_alpha2\"], false, field + \".country_alpha2\");\n" +
"        checkString$2(d.customer_type, false, field + \".customer_type\");\n" +
"        checkString$2(d.delivery_address, false, field + \".delivery_address\");\n" +
"        checkString$2(d.delivery_address_additional_info, false, field + \".delivery_address_additional_info\");\n" +
"        checkString$2(d.delivery_city, false, field + \".delivery_city\");\n" +
"        checkString$2(d[\"delivery_country_alpha2\"], false, field + \".delivery_country_alpha2\");\n" +
"        checkString$2(d.delivery_postal_code, false, field + \".delivery_postal_code\");\n" +
"        checkBoolean$1(d.disable_pending_vat, false, field + \".disable_pending_vat\");\n" +
"        checkArray$1(d.emails, field + \".emails\");\n" +
"        if (d.emails) {\n" +
"            for (let i = 0; i < d.emails.length; i++) {\n" +
"                checkNull$2(d.emails[i], field + \".emails\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$2(d.first_name, false, field + \".first_name\");\n" +
"        checkBoolean$1(d.force_pending_vat, false, field + \".force_pending_vat\");\n" +
"        checkBoolean$1(d.invoices_auto_generated, false, field + \".invoices_auto_generated\");\n" +
"        checkBoolean$1(d.invoices_auto_validated, false, field + \".invoices_auto_validated\");\n" +
"        checkString$2(d.last_name, false, field + \".last_name\");\n" +
"        checkString$2(d.name, false, field + \".name\");\n" +
"        checkString$2(d.notes, false, field + \".notes\");\n" +
"        checkString$2(d.payment_conditions, false, field + \".payment_conditions\");\n" +
"        checkString$2(d.phone, false, field + \".phone\");\n" +
"        checkString$2(d.postal_code, false, field + \".postal_code\");\n" +
"        checkString$2(d.reference, false, field + \".reference\");\n" +
"        checkString$2(d.reg_no, false, field + \".reg_no\");\n" +
"        checkArray$1(d.search_terms, field + \".search_terms\");\n" +
"        if (d.search_terms) {\n" +
"            for (let i = 0; i < d.search_terms.length; i++) {\n" +
"                checkString$2(d.search_terms[i], false, field + \".search_terms\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkString$2(d.source_id, false, field + \".source_id\");\n" +
"        checkString$2(d.vat_number, false, field + \".vat_number\");\n" +
"        checkString$2(d.recipient, false, field + \".recipient\");\n" +
"        checkNull$2(d.notes_comment, field + \".notes_comment\");\n" +
"        d.plan_item = PlanItem.Create(d.plan_item, field + \".plan_item\");\n" +
"        checkArray$1(d.thirdparty_invoice_line_rules, field + \".thirdparty_invoice_line_rules\");\n" +
"        if (d.thirdparty_invoice_line_rules) {\n" +
"            for (let i = 0; i < d.thirdparty_invoice_line_rules.length; i++) {\n" +
"                d.thirdparty_invoice_line_rules[i] = ThirdpartyInvoiceLineRulesEntity1.Create(d.thirdparty_invoice_line_rules[i], field + \".thirdparty_invoice_line_rules\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$1(d.tags, field + \".tags\");\n" +
"        if (d.tags) {\n" +
"            for (let i = 0; i < d.tags.length; i++) {\n" +
"                checkNull$2(d.tags[i], field + \".tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkArray$1(d.thirdparties_tags, field + \".thirdparties_tags\");\n" +
"        if (d.thirdparties_tags) {\n" +
"            for (let i = 0; i < d.thirdparties_tags.length; i++) {\n" +
"                checkNull$2(d.thirdparties_tags[i], field + \".thirdparties_tags\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        checkNull$2(d.billing_footer_invoice, field + \".billing_footer_invoice\");\n" +
"        checkNull$2(d.sepa_mandate, field + \".sepa_mandate\");\n" +
"        checkNull$2(d.current_mandate, field + \".current_mandate\");\n" +
"        checkBoolean$1(d.received_a_mandate_request, false, field + \".received_a_mandate_request\");\n" +
"        checkArray$1(d.thirdparty_contacts, field + \".thirdparty_contacts\");\n" +
"        if (d.thirdparty_contacts) {\n" +
"            for (let i = 0; i < d.thirdparty_contacts.length; i++) {\n" +
"                checkNull$2(d.thirdparty_contacts[i], field + \".thirdparty_contacts\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        const knownProperties = [\"id\", \"company_id\", \"address\", \"address_additional_info\", \"billing_bank\", \"billing_bic\", \"billing_footer_invoice_id\", \"billing_iban\", \"billing_language\", \"city\", \"country_alpha2\", \"customer_type\", \"delivery_address\", \"delivery_address_additional_info\", \"delivery_city\", \"delivery_country_alpha2\", \"delivery_postal_code\", \"disable_pending_vat\", \"emails\", \"first_name\", \"force_pending_vat\", \"invoices_auto_generated\", \"invoices_auto_validated\", \"last_name\", \"name\", \"notes\", \"payment_conditions\", \"phone\", \"postal_code\", \"reference\", \"reg_no\", \"search_terms\", \"source_id\", \"vat_number\", \"recipient\", \"notes_comment\", \"plan_item\", \"thirdparty_invoice_line_rules\", \"tags\", \"thirdparties_tags\", \"billing_footer_invoice\", \"sepa_mandate\", \"current_mandate\", \"received_a_mandate_request\", \"thirdparty_contacts\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new Customer(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.company_id = d.company_id;\n" +
"        this.address = d.address;\n" +
"        this.address_additional_info = d.address_additional_info;\n" +
"        if (\"billing_bank\" in d)\n" +
"            this.billing_bank = d.billing_bank;\n" +
"        if (\"billing_bic\" in d)\n" +
"            this.billing_bic = d.billing_bic;\n" +
"        if (\"billing_footer_invoice_id\" in d)\n" +
"            this.billing_footer_invoice_id = d.billing_footer_invoice_id;\n" +
"        if (\"billing_iban\" in d)\n" +
"            this.billing_iban = d.billing_iban;\n" +
"        this.billing_language = d.billing_language;\n" +
"        this.city = d.city;\n" +
"        this[\"country_alpha2\"] = d[\"country_alpha2\"];\n" +
"        this.customer_type = d.customer_type;\n" +
"        this.delivery_address = d.delivery_address;\n" +
"        this.delivery_address_additional_info = d.delivery_address_additional_info;\n" +
"        this.delivery_city = d.delivery_city;\n" +
"        this[\"delivery_country_alpha2\"] = d[\"delivery_country_alpha2\"];\n" +
"        this.delivery_postal_code = d.delivery_postal_code;\n" +
"        this.disable_pending_vat = d.disable_pending_vat;\n" +
"        if (\"emails\" in d)\n" +
"            this.emails = d.emails;\n" +
"        this.first_name = d.first_name;\n" +
"        this.force_pending_vat = d.force_pending_vat;\n" +
"        this.invoices_auto_generated = d.invoices_auto_generated;\n" +
"        this.invoices_auto_validated = d.invoices_auto_validated;\n" +
"        this.last_name = d.last_name;\n" +
"        this.name = d.name;\n" +
"        this.notes = d.notes;\n" +
"        this.payment_conditions = d.payment_conditions;\n" +
"        this.phone = d.phone;\n" +
"        this.postal_code = d.postal_code;\n" +
"        this.reference = d.reference;\n" +
"        this.reg_no = d.reg_no;\n" +
"        if (\"search_terms\" in d)\n" +
"            this.search_terms = d.search_terms;\n" +
"        this.source_id = d.source_id;\n" +
"        this.vat_number = d.vat_number;\n" +
"        this.recipient = d.recipient;\n" +
"        if (\"notes_comment\" in d)\n" +
"            this.notes_comment = d.notes_comment;\n" +
"        this.plan_item = d.plan_item;\n" +
"        if (\"thirdparty_invoice_line_rules\" in d)\n" +
"            this.thirdparty_invoice_line_rules = d.thirdparty_invoice_line_rules;\n" +
"        if (\"tags\" in d)\n" +
"            this.tags = d.tags;\n" +
"        if (\"thirdparties_tags\" in d)\n" +
"            this.thirdparties_tags = d.thirdparties_tags;\n" +
"        if (\"billing_footer_invoice\" in d)\n" +
"            this.billing_footer_invoice = d.billing_footer_invoice;\n" +
"        if (\"sepa_mandate\" in d)\n" +
"            this.sepa_mandate = d.sepa_mandate;\n" +
"        if (\"current_mandate\" in d)\n" +
"            this.current_mandate = d.current_mandate;\n" +
"        this.received_a_mandate_request = d.received_a_mandate_request;\n" +
"        if (\"thirdparty_contacts\" in d)\n" +
"            this.thirdparty_contacts = d.thirdparty_contacts;\n" +
"    }\n" +
"}\n" +
"class ThirdpartyInvoiceLineRulesEntity1 {\n" +
"    static Parse(d) {\n" +
"        return ThirdpartyInvoiceLineRulesEntity1.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$3 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$2(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$2(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$2(field, d, false);\n" +
"        }\n" +
"        d.pnl_plan_item = PnlPlanItem.Create(d.pnl_plan_item, field + \".pnl_plan_item\");\n" +
"        checkString$2(d.vat_rate, false, field + \".vat_rate\");\n" +
"        const knownProperties = [\"pnl_plan_item\", \"vat_rate\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$3(unknownProperty, d, \"never\", false);\n" +
"        return new ThirdpartyInvoiceLineRulesEntity1(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.pnl_plan_item = d.pnl_plan_item;\n" +
"        this.vat_rate = d.vat_rate;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$2(field, d) {\n" +
"    return errorHelper$3(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$2(field, d, nullable) {\n" +
"    return errorHelper$3(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$2(field, d, nullable) {\n" +
"    return errorHelper$3(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkArray$1(d, field) {\n" +
"    if (!Array.isArray(d) && d !== null && d !== undefined) {\n" +
"        errorHelper$3(field, d, \"array\", true);\n" +
"    }\n" +
"}\n" +
"function checkNumber$2(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && (true)) {\n" +
"        errorHelper$3(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkBoolean$1(d, nullable, field) {\n" +
"    if (typeof (d) !== 'boolean' && (true)) {\n" +
"        errorHelper$3(field, d, \"boolean\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$2(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && (!nullable || (nullable && d !== null && d !== undefined))) {\n" +
"        errorHelper$3(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkNull$2(d, field) {\n" +
"    if (d !== null && d !== undefined) {\n" +
"        errorHelper$3(field, d, \"null or undefined\", false);\n" +
"    }\n" +
"}\n" +
"function errorHelper$3(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$3 + ':', JSON.stringify(obj$3));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$3));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$2 = 'APITransactionListParams';\n" +
"let obj$2 = null;\n" +
"class APITransactionListParams {\n" +
"    static Parse(d) {\n" +
"        return APITransactionListParams.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$2 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull$1(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject$1(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray$1(field, d, false);\n" +
"        }\n" +
"        checkString$1(d.filter, true, field + \".filter\");\n" +
"        checkString$1(d.sort, true, field + \".sort\");\n" +
"        checkNumber$1(d.page, true, field + \".page\");\n" +
"        const knownProperties = [\"filter\", \"sort\", \"page\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$2(unknownProperty, d, \"never\", false);\n" +
"        return new APITransactionListParams(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"filter\" in d)\n" +
"            this.filter = d.filter;\n" +
"        if (\"sort\" in d)\n" +
"            this.sort = d.sort;\n" +
"        if (\"page\" in d)\n" +
"            this.page = d.page;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull$1(field, d) {\n" +
"    return errorHelper$2(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject$1(field, d, nullable) {\n" +
"    return errorHelper$2(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray$1(field, d, nullable) {\n" +
"    return errorHelper$2(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkNumber$1(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && ((d !== null && d !== undefined))) {\n" +
"        errorHelper$2(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString$1(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && ((d !== null && d !== undefined))) {\n" +
"        errorHelper$2(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function errorHelper$2(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$2 + ':', JSON.stringify(obj$2));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$2));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName$1 = 'APITransactionList';\n" +
"let obj$1 = null;\n" +
"class APITransactionList {\n" +
"    static Parse(d) {\n" +
"        return APITransactionList.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$1 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray(field, d, false);\n" +
"        }\n" +
"        checkArray(d.transactions, field + \".transactions\");\n" +
"        if (d.transactions) {\n" +
"            for (let i = 0; i < d.transactions.length; i++) {\n" +
"                d.transactions[i] = TransactionsEntity.Create(d.transactions[i], field + \".transactions\" + \"[\" + i + \"]\");\n" +
"            }\n" +
"        }\n" +
"        d.pagination = Pagination.Create(d.pagination, field + \".pagination\");\n" +
"        const knownProperties = [\"transactions\", \"pagination\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(unknownProperty, d, \"never\", false);\n" +
"        return new APITransactionList(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        if (\"transactions\" in d)\n" +
"            this.transactions = d.transactions;\n" +
"        this.pagination = d.pagination;\n" +
"    }\n" +
"}\n" +
"class TransactionsEntity {\n" +
"    static Parse(d) {\n" +
"        return TransactionsEntity.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$1 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray(field, d, false);\n" +
"        }\n" +
"        checkNumber(d.id, false, field + \".id\");\n" +
"        checkString(d.type, false, field + \".type\");\n" +
"        checkNumber(d.account_id, false, field + \".account_id\");\n" +
"        checkNumber(d.company_id, false, field + \".company_id\");\n" +
"        checkNull$1(d.dump_id, field + \".dump_id\");\n" +
"        checkString(d.group_uuid, false, field + \".group_uuid\");\n" +
"        checkString(d.date, false, field + \".date\");\n" +
"        checkString(d.label, false, field + \".label\");\n" +
"        checkString(d.amount, false, field + \".amount\");\n" +
"        checkString(d.fee, false, field + \".fee\");\n" +
"        checkString(d.currency, false, field + \".currency\");\n" +
"        checkString(d.source, false, field + \".source\");\n" +
"        checkString(d.currency_amount, false, field + \".currency_amount\");\n" +
"        checkString(d.currency_fee, false, field + \".currency_fee\");\n" +
"        checkNull$1(d.archived_at, field + \".archived_at\");\n" +
"        checkString(d.updated_at, false, field + \".updated_at\");\n" +
"        checkBoolean(d.is_waiting_details, false, field + \".is_waiting_details\");\n" +
"        checkBoolean(d.validation_needed, false, field + \".validation_needed\");\n" +
"        checkBoolean(d.is_potential_duplicate, false, field + \".is_potential_duplicate\");\n" +
"        checkBoolean(d.attachment_lost, false, field + \".attachment_lost\");\n" +
"        checkBoolean(d.attachment_required, false, field + \".attachment_required\");\n" +
"        checkBoolean(d.pending, false, field + \".pending\");\n" +
"        checkString(d.status, false, field + \".status\");\n" +
"        checkString(d.gross_amount, false, field + \".gross_amount\");\n" +
"        checkNull$1(d.reconciliation_id, field + \".reconciliation_id\");\n" +
"        checkNumber(d.files_count, false, field + \".files_count\");\n" +
"        checkString(d.source_logo, false, field + \".source_logo\");\n" +
"        d.account_synchronization = AccountSynchronization.Create(d.account_synchronization, field + \".account_synchronization\");\n" +
"        checkNull$1(d.dump, field + \".dump\");\n" +
"        const knownProperties = [\"id\", \"type\", \"account_id\", \"company_id\", \"dump_id\", \"group_uuid\", \"date\", \"label\", \"amount\", \"fee\", \"currency\", \"source\", \"currency_amount\", \"currency_fee\", \"archived_at\", \"updated_at\", \"is_waiting_details\", \"validation_needed\", \"is_potential_duplicate\", \"attachment_lost\", \"attachment_required\", \"pending\", \"status\", \"gross_amount\", \"reconciliation_id\", \"files_count\", \"source_logo\", \"account_synchronization\", \"dump\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(unknownProperty, d, \"never\", false);\n" +
"        return new TransactionsEntity(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.id = d.id;\n" +
"        this.type = d.type;\n" +
"        this.account_id = d.account_id;\n" +
"        this.company_id = d.company_id;\n" +
"        if (\"dump_id\" in d)\n" +
"            this.dump_id = d.dump_id;\n" +
"        this.group_uuid = d.group_uuid;\n" +
"        this.date = d.date;\n" +
"        this.label = d.label;\n" +
"        this.amount = d.amount;\n" +
"        this.fee = d.fee;\n" +
"        this.currency = d.currency;\n" +
"        this.source = d.source;\n" +
"        this.currency_amount = d.currency_amount;\n" +
"        this.currency_fee = d.currency_fee;\n" +
"        if (\"archived_at\" in d)\n" +
"            this.archived_at = d.archived_at;\n" +
"        this.updated_at = d.updated_at;\n" +
"        this.is_waiting_details = d.is_waiting_details;\n" +
"        this.validation_needed = d.validation_needed;\n" +
"        this.is_potential_duplicate = d.is_potential_duplicate;\n" +
"        this.attachment_lost = d.attachment_lost;\n" +
"        this.attachment_required = d.attachment_required;\n" +
"        this.pending = d.pending;\n" +
"        this.status = d.status;\n" +
"        this.gross_amount = d.gross_amount;\n" +
"        if (\"reconciliation_id\" in d)\n" +
"            this.reconciliation_id = d.reconciliation_id;\n" +
"        this.files_count = d.files_count;\n" +
"        this.source_logo = d.source_logo;\n" +
"        this.account_synchronization = d.account_synchronization;\n" +
"        if (\"dump\" in d)\n" +
"            this.dump = d.dump;\n" +
"    }\n" +
"}\n" +
"class AccountSynchronization {\n" +
"    static Parse(d) {\n" +
"        return AccountSynchronization.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$1 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray(field, d, false);\n" +
"        }\n" +
"        checkString(d.created_at, false, field + \".created_at\");\n" +
"        checkBoolean(d.triggered_manually, false, field + \".triggered_manually\");\n" +
"        checkNull$1(d.error_message, field + \".error_message\");\n" +
"        const knownProperties = [\"created_at\", \"triggered_manually\", \"error_message\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(unknownProperty, d, \"never\", false);\n" +
"        return new AccountSynchronization(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.created_at = d.created_at;\n" +
"        this.triggered_manually = d.triggered_manually;\n" +
"        if (\"error_message\" in d)\n" +
"            this.error_message = d.error_message;\n" +
"    }\n" +
"}\n" +
"class Pagination {\n" +
"    static Parse(d) {\n" +
"        return Pagination.Create(JSON.parse(d));\n" +
"    }\n" +
"    static Create(d, field) {\n" +
"        if (!field) {\n" +
"            obj$1 = d;\n" +
"            field = \"root\";\n" +
"        }\n" +
"        if (d === null || d === undefined) {\n" +
"            throwNull2NonNull(field, d);\n" +
"        }\n" +
"        else if (typeof (d) !== 'object') {\n" +
"            throwNotObject(field, d, false);\n" +
"        }\n" +
"        else if (Array.isArray(d)) {\n" +
"            throwIsArray(field, d, false);\n" +
"        }\n" +
"        checkNumber(d.page, false, field + \".page\");\n" +
"        checkNumber(d.pageSize, false, field + \".pageSize\");\n" +
"        checkNumber(d.pages, false, field + \".pages\");\n" +
"        checkNumber(d.totalEntries, false, field + \".totalEntries\");\n" +
"        checkString(d.totalEntriesStr, false, field + \".totalEntriesStr\");\n" +
"        checkString(d.totalEntriesPrecision, false, field + \".totalEntriesPrecision\");\n" +
"        checkBoolean(d.hasNextPage, false, field + \".hasNextPage\");\n" +
"        const knownProperties = [\"page\", \"pageSize\", \"pages\", \"totalEntries\", \"totalEntriesStr\", \"totalEntriesPrecision\", \"hasNextPage\"];\n" +
"        const unknownProperty = Object.keys(d).find(key => !knownProperties.includes(key));\n" +
"        if (unknownProperty)\n" +
"            errorHelper$1(unknownProperty, d, \"never\", false);\n" +
"        return new Pagination(d);\n" +
"    }\n" +
"    constructor(d) {\n" +
"        this.page = d.page;\n" +
"        this.pageSize = d.pageSize;\n" +
"        this.pages = d.pages;\n" +
"        this.totalEntries = d.totalEntries;\n" +
"        this.totalEntriesStr = d.totalEntriesStr;\n" +
"        this.totalEntriesPrecision = d.totalEntriesPrecision;\n" +
"        this.hasNextPage = d.hasNextPage;\n" +
"    }\n" +
"}\n" +
"function throwNull2NonNull(field, d) {\n" +
"    return errorHelper$1(field, d, \"non-nullable object\", false);\n" +
"}\n" +
"function throwNotObject(field, d, nullable) {\n" +
"    return errorHelper$1(field, d, \"object\", nullable);\n" +
"}\n" +
"function throwIsArray(field, d, nullable) {\n" +
"    return errorHelper$1(field, d, \"object\", nullable);\n" +
"}\n" +
"function checkArray(d, field) {\n" +
"    if (!Array.isArray(d) && d !== null && d !== undefined) {\n" +
"        errorHelper$1(field, d, \"array\", true);\n" +
"    }\n" +
"}\n" +
"function checkNumber(d, nullable, field) {\n" +
"    if (typeof (d) !== 'number' && (true)) {\n" +
"        errorHelper$1(field, d, \"number\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkBoolean(d, nullable, field) {\n" +
"    if (typeof (d) !== 'boolean' && (true)) {\n" +
"        errorHelper$1(field, d, \"boolean\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkString(d, nullable, field) {\n" +
"    if (typeof (d) !== 'string' && (true)) {\n" +
"        errorHelper$1(field, d, \"string\", nullable);\n" +
"    }\n" +
"}\n" +
"function checkNull$1(d, field) {\n" +
"    if (d !== null && d !== undefined) {\n" +
"        errorHelper$1(field, d, \"null or undefined\", false);\n" +
"    }\n" +
"}\n" +
"function errorHelper$1(field, d, type, nullable) {\n" +
"    if (nullable) {\n" +
"        type += \", null, or undefined\";\n" +
"    }\n" +
"    prompt(proxyName$1 + ':', JSON.stringify(obj$1));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj$1));\n" +
"}\n" +
"\n" +
"// Stores the currently-being-typechecked object for error messages.\n" +
"const proxyName = 'APITransaction';\n" +
"let obj = null;\n" +
"class APITransaction {\n" +
"    static Parse(s) {\n" +
"        return APITransaction.Create(JSON.parse(s));\n" +
"    }\n" +
"    static Create(s, fieldName) {\n" +
"        if (!fieldName) {\n" +
"            obj = s;\n" +
"            fieldName = \"root\";\n" +
"        }\n" +
"        checkNull(s, fieldName);\n" +
"        return s;\n" +
"    }\n" +
"}\n" +
"function checkNull(d, field) {\n" +
"    if (d !== null && d !== undefined) {\n" +
"        errorHelper(field, d, \"null or undefined\");\n" +
"    }\n" +
"}\n" +
"function errorHelper(field, d, type, nullable) {\n" +
"    prompt(proxyName + ':', JSON.stringify(obj));\n" +
"    throw new TypeError('Expected ' + type + \" at \" + field + \" but found:\\n" +
"\" + JSON.stringify(d) + \"\\n" +
"\\n" +
"Full object:\\n" +
"\" + JSON.stringify(obj));\n" +
"}\n" +
"\n" +
"async function getLedgerEvents(id) {\n" +
"    const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, 'GET');\n" +
"    const data = await response.json();\n" +
"    return data.map(item => APILedgerEvent.Create(item));\n" +
"}\n" +
"async function getGroupedDocuments(id) {\n" +
"    if (!Number.isSafeInteger(id) || !id) {\n" +
"        console.log('getGroupedDocuments', { id });\n" +
"        throw new Error('`id` MUST be an integer');\n" +
"    }\n" +
"    const response = await apiRequest(`accountants/operations/${id}/grouped_documents?per_page=-1`, null, 'GET');\n" +
"    const result = await response.json();\n" +
"    return result.map(item => APIGroupedDocument.Create(item));\n" +
"}\n" +
"\n" +
"/**\n" +
" * @param id The ID of the supplier or customer\n" +
" */\n" +
"async function getThirdparty(id) {\n" +
"    const response = await apiRequest(`thirdparties/${id}`, null, 'GET');\n" +
"    const json = await response?.json();\n" +
"    const data = APIThirdparty.Create(json);\n" +
"    const [direction, thirdparty] = Object.entries(data)[0];\n" +
"    return { direction, thirdparty };\n" +
"}\n" +
"\n" +
"class Document extends Logger {\n" +
"    constructor({ id }) {\n" +
"        super();\n" +
"        if (!Number.isSafeInteger(id)) {\n" +
"            this.log('constructor', { id, args: arguments });\n" +
"            throw new Error('`id` MUST be an integer');\n" +
"        }\n" +
"        this.id = id;\n" +
"    }\n" +
"    async getDocument() {\n" +
"        if (!this.document) {\n" +
"            this.document = getDocument(this.id);\n" +
"            this.document = await this.document;\n" +
"        }\n" +
"        return await this.document;\n" +
"    }\n" +
"    async getLedgerEvents() {\n" +
"        if (!this.ledgerEvents) {\n" +
"            this.ledgerEvents = this._loadLedgerEvents();\n" +
"        }\n" +
"        return await this.ledgerEvents;\n" +
"    }\n" +
"    async _loadLedgerEvents() {\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        const events = await Promise.all(groupedDocuments.map(doc => getLedgerEvents(doc.id)));\n" +
"        this.ledgerEvents = [].concat(...events);\n" +
"        return this.ledgerEvents;\n" +
"    }\n" +
"    async reloadLedgerEvents() {\n" +
"        delete this.ledgerEvents;\n" +
"        this.document = reloadLedgerEvents(this.id);\n" +
"        this.document = await this.document;\n" +
"        return this.document;\n" +
"    }\n" +
"    async archive(unarchive = false) {\n" +
"        return await archiveDocument(this.id, unarchive);\n" +
"    }\n" +
"    async unarchive() {\n" +
"        return await this.archive(true);\n" +
"    }\n" +
"    async getGroupedDocuments() {\n" +
"        if (!this.groupedDocuments)\n" +
"            this.groupedDocuments = this._loadGroupedDocuments();\n" +
"        return await this.groupedDocuments;\n" +
"    }\n" +
"    async _loadGroupedDocuments() {\n" +
"        const otherDocuments = await getGroupedDocuments(this.id);\n" +
"        const mainDocument = await this.getDocument();\n" +
"        this.groupedDocuments = [\n" +
"            ...otherDocuments,\n" +
"            mainDocument.grouped_documents.find(doc => doc.id === this.id)\n" +
"        ];\n" +
"        return this.groupedDocuments;\n" +
"    }\n" +
"    async getThirdparty() {\n" +
"        if (!this.thirdparty)\n" +
"            this.thirdparty = this._getThirdparty();\n" +
"        return (await this.thirdparty).thirdparty;\n" +
"    }\n" +
"    async _getThirdparty() {\n" +
"        const doc = await this.getDocument();\n" +
"        return await getThirdparty(doc.thirdparty_id);\n" +
"    }\n" +
"}\n" +
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
"        this.valid = this.validMessage === 'OK';\n" +
"    }\n" +
"    async isValid() {\n" +
"        if (this.valid === null)\n" +
"            await this.loadValidation();\n" +
"        return this.valid;\n" +
"    }\n" +
"    async getStatus() {\n" +
"        const id = this.id;\n" +
"        const valid = await this.isValid();\n" +
"        const message = await this.getValidMessage();\n" +
"        const doc = await this.getDocument();\n" +
"        const createdAt = new Date(doc.created_at).getTime();\n" +
"        const date = new Date(doc.date).getTime();\n" +
"        return { id, valid, message, createdAt, date };\n" +
"    }\n" +
"    async reloadLedgerEvents() {\n" +
"        this.valid = null;\n" +
"        this.validMessage = null;\n" +
"        return super.reloadLedgerEvents();\n" +
"    }\n" +
"}\n" +
"\n" +
"/**\n" +
" * @return {Promise<RawTransactionMin>}    Type vérifié\n" +
" */\n" +
"async function getTransaction(id) {\n" +
"    const response = await apiRequest(`accountants/wip/transactions/${id}`, null, 'GET');\n" +
"    const data = await response?.json();\n" +
"    return APITransaction.Create(data);\n" +
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
"        const transactions = data.transactions;\n" +
"        if (!transactions?.length)\n" +
"            return;\n" +
"        for (const transaction of transactions)\n" +
"            yield transaction;\n" +
"        ++page;\n" +
"    } while (true);\n" +
"}\n" +
"\n" +
"class Transaction extends ValidableDocument {\n" +
"    constructor(raw) {\n" +
"        super(raw);\n" +
"        this._raw = raw;\n" +
"    }\n" +
"    async getTransaction() {\n" +
"        if (!this._transaction) {\n" +
"            this._transaction = getTransaction(this.id);\n" +
"            this.transaction = await this._transaction;\n" +
"        }\n" +
"        return await this._transaction;\n" +
"    }\n" +
"    async loadValidMessage() {\n" +
"        const isCurrent = this.id === Number(getParam(location.href, 'transaction_id'));\n" +
"        if (isCurrent)\n" +
"            this.log('loadValidMessage', this);\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        // Fait partie d'un exercice clos\n" +
"        if (ledgerEvents.some(event => event.closed))\n" +
"            return 'OK';\n" +
"        const doc = await this.getDocument();\n" +
"        // Transaction archivée\n" +
"        if (doc.archived)\n" +
"            return 'OK';\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        // Pas de rapprochement bancaire\n" +
"        const groupedDoc = groupedDocuments.find(gdoc => gdoc.id === doc.id);\n" +
"        const recent = (Date.now() - new Date(doc.date).getTime()) < 86400000 * 30;\n" +
"        if (!recent && !groupedDoc.reconciled)\n" +
"            return 'Cette transaction n\\'est pas rattachée à un rapprochement bancaire';\n" +
"        this.debug('loadValidMessage > rapprochement bancaire', {\n" +
"            recent,\n" +
"            reconciled: groupedDocuments.find(gdoc => gdoc.id === doc.id),\n" +
"        });\n" +
"        if (doc.label.startsWith('FRAIS VIR INTL ELEC ')) {\n" +
"            if (ledgerEvents.length !== 2\n" +
"                || groupedDocuments.length > 1\n" +
"                || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0\n" +
"                || !ledgerEvents.find(ev => ev.planItem.number === '6270005'))\n" +
"                return 'Frais bancaires SG mal attribué (=> 6270005)';\n" +
"            return 'OK';\n" +
"        }\n" +
"        if (doc.label.includes(' DE: STRIPE MOTIF: ALLODONS REF: ')) {\n" +
"            if (ledgerEvents.length !== 2\n" +
"                || groupedDocuments.length > 1\n" +
"                || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0\n" +
"                || !ledgerEvents.find(ev => ev.planItem.number === '754110001'))\n" +
"                return 'Virement Allodons mal attribué (=>754110001)';\n" +
"            return 'OK';\n" +
"        }\n" +
"        if (doc.label.startsWith('Fee: Billing - Usage Fee (')) {\n" +
"            if (ledgerEvents.length !== 2\n" +
"                || groupedDocuments.length > 1\n" +
"                || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0\n" +
"                || !ledgerEvents.find(ev => ev.planItem.number === '6270001'))\n" +
"                return 'Frais Stripe mal attribués (=>6270001)';\n" +
"            return 'OK';\n" +
"        }\n" +
"        if (doc.label.startsWith('Charge: ')) {\n" +
"            if (ledgerEvents.length !== 3\n" +
"                || groupedDocuments.length > 1\n" +
"                || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0\n" +
"                || !ledgerEvents.find(ev => ev.planItem.number === '6270001')\n" +
"                || !ledgerEvents.find(ev => ev.planItem.number === '754110002'))\n" +
"                return 'Renouvellement de don mal attribués';\n" +
"            return 'OK';\n" +
"        }\n" +
"        if (['VIR ', 'Payout: '].some(label => doc.label.startsWith(label))) {\n" +
"            if ([\n" +
"                ' DE: Stripe Technology Europe Ltd MOTIF: STRIPE ',\n" +
"                ' DE: STRIPE MOTIF: STRIPE REF: STRIPE-',\n" +
"                'Payout: STRIPE PAYOUT (',\n" +
"            ].some(label => doc.label.includes(label))) {\n" +
"                if (ledgerEvents.length !== 2\n" +
"                    || groupedDocuments.length > 1\n" +
"                    || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0\n" +
"                    || !ledgerEvents.find(ev => ev.planItem.number === '58000001'))\n" +
"                    return 'Virement interne Stripe mal attribué (=>58000001)';\n" +
"                return 'OK';\n" +
"            }\n" +
"            const assos = [\n" +
"                ' DE: ALEF.ASSOC ETUDE ENSEIGNEMENT FO',\n" +
"                ' DE: ASS UNE LUMIERE POUR MILLE',\n" +
"                ' DE: COLLEL EREV KINIAN AVRAM (C E K ',\n" +
"                ' DE: ESPACE CULTUREL ET UNIVERSITAIRE ',\n" +
"                ' DE: JEOM MOTIF: ',\n" +
"                ' DE: MIKDACH MEAT ',\n" +
"                ' DE: YECHIVA AZ YACHIR MOCHE MOTIF: ',\n" +
"                ' DE: ASSOCIATION BEER MOTIF: ',\n" +
"            ];\n" +
"            if (assos.some(label => doc.label.includes(label))) {\n" +
"                if (ledgerEvents.length !== 2\n" +
"                    || groupedDocuments.length > 1\n" +
"                    || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0\n" +
"                    || !ledgerEvents.find(ev => ev.planItem.number === '75411'))\n" +
"                    return 'Virement reçu d\\'une association mal attribué';\n" +
"                return 'OK';\n" +
"            }\n" +
"            const sansCerfa = [\n" +
"                ' DE: MONSIEUR FABRICE HARARI MOTIF: ',\n" +
"                ' DE: MR ET MADAME DENIS LEVY',\n" +
"                ' DE: Zacharie Mimoun ',\n" +
"                ' DE: M OU MME MIMOUN ZACHARIE MOTIF: ',\n" +
"            ];\n" +
"            if (sansCerfa.some(label => doc.label.includes(label))) {\n" +
"                if (ledgerEvents.length !== 2\n" +
"                    || groupedDocuments.length > 1\n" +
"                    || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0\n" +
"                    || !ledgerEvents.find(ev => ev.planItem.number === '75411'))\n" +
"                    return 'Virement reçu avec CERFA optionel mal attribué (=>75411)';\n" +
"                return 'OK';\n" +
"            }\n" +
"            if (groupedDocuments.length < 2)\n" +
"                return `<a\n" +
"          title=\"Ajouter le CERFA dans les pièces de réconciliation. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Virement%20re%C3%A7u%20sans%20justificatif\"\n" +
"        >Virement reçu sans justificatif ⓘ</a>`;\n" +
"            if (!groupedDocuments.find(gdoc => gdoc.label.includes('CERFA')))\n" +
"                return 'Les virements reçus doivent être justifiés par un CERFA';\n" +
"        }\n" +
"        // Aides octroyées\n" +
"        const aidLedgerEvent = ledgerEvents.find(line => line.planItem.number.startsWith('6571'));\n" +
"        if (aidLedgerEvent?.planItem.number === '6571002') { // a une autre asso\n" +
"            // Aides octroyées sans label\n" +
"            if (!aidLedgerEvent.label) {\n" +
"                return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20%C3%A0%20une%20autre%20association\"\n" +
"        >nom du bénéficiaire manquant dans l\\'écriture \"6571\" ⓘ</a>`;\n" +
"            }\n" +
"            const isCheck = doc.label.startsWith('CHEQUE ');\n" +
"            const withReceipt = groupedDocuments.filter(gdoc => gdoc.type !== 'Transaction'\n" +
"                && [' CERFA ', ' CB '].some(needle => gdoc.label.includes(needle))).length;\n" +
"            if (ledgerEvents.length !== 2\n" +
"                || groupedDocuments.length !== 1 + Number(isCheck) + Number(withReceipt)\n" +
"                || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0) {\n" +
"                if (isCurrent)\n" +
"                    this.log({\n" +
"                        'ledgerEvents.length': ledgerEvents.length,\n" +
"                        'groupedDocuments.length': groupedDocuments.length,\n" +
"                        isCheck,\n" +
"                        withReceipt,\n" +
"                        eventsSum: ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0)\n" +
"                    });\n" +
"                return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20%C3%A0%20une%20autre%20association\"\n" +
"        >Don versé à une autre association incorrectement traité ⓘ</a>`;\n" +
"            }\n" +
"            return 'OK';\n" +
"        }\n" +
"        if (aidLedgerEvent && !aidLedgerEvent.label) {\n" +
"            // Aides octroyées sans label\n" +
"            return `<a\n" +
"        title=\"Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#nom%20du%20bénéficiaire%20manquant%20dans%20l'écriture%20%226571%22\"\n" +
"      >nom du bénéficiaire manquant dans l\\'écriture \"6571\" ⓘ</a>`;\n" +
"        }\n" +
"        if (!aidLedgerEvent && parseFloat(doc.amount) < 0) {\n" +
"            for (const gdoc of groupedDocuments) {\n" +
"                if (gdoc.type !== 'Invoice')\n" +
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
"        // balance déséquilibrée - version exigeante\n" +
"        const balance = { transaction: 0 };\n" +
"        groupedDocuments.forEach(gdoc => {\n" +
"            const coeff = (gdoc.type === 'Invoice' && gdoc.journal.code === 'HA') ? -1 : 1;\n" +
"            const value = parseFloat(gdoc.amount) * coeff;\n" +
"            if (gdoc.type === 'Transaction')\n" +
"                balance.transaction += value;\n" +
"            else if (/ CERFA | AIDES - /u.test(gdoc.label))\n" +
"                balance.Reçu = (balance.Reçu ?? 0) + value;\n" +
"            else if (/ CHQ(?:\\d|\\s)/u.test(gdoc.label))\n" +
"                balance.CHQ = (balance.CHQ ?? 0) + value;\n" +
"            else\n" +
"                balance.autre = (balance.autre ?? 0) + value;\n" +
"        });\n" +
"        ledgerEvents.forEach(event => {\n" +
"            // pertes/gains de change\n" +
"            if (['47600001', '656', '75800002'].includes(event.planItem.number)) {\n" +
"                balance.autre = (balance.autre ?? 0) - parseFloat(event.amount);\n" +
"            }\n" +
"        });\n" +
"        let message = '';\n" +
"        if (doc.label.startsWith('REMISE CHEQUE ')\n" +
"            || doc.label.toUpperCase().startsWith('VIR ')\n" +
"            || aidLedgerEvent) {\n" +
"            // On a parfois des calculs qui ne tombent pas très juste en JS\n" +
"            if (Math.abs((balance.transaction ?? 0) - (balance.Reçu ?? 0)) > 0.001) {\n" +
"                // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa\n" +
"                message = 'La somme des Reçus doit valoir le montant de la transaction';\n" +
"                balance.Reçu = balance.Reçu ?? 0;\n" +
"            }\n" +
"        }\n" +
"        else {\n" +
"            if (Math.abs((balance.transaction ?? 0) - (balance.autre ?? 0)) > 0.001) {\n" +
"                message = 'La somme des autres justificatifs doit valoir le montant de la transaction';\n" +
"                balance.autre = balance.autre ?? 0;\n" +
"            }\n" +
"        }\n" +
"        if (isCurrent)\n" +
"            this.log('balance:', balance);\n" +
"        const toSkip = balance.transaction && Math.abs(balance.transaction) < 100 && Object.keys(balance).every(key => key === 'transaction' || key === 'autre');\n" +
"        if (message && !toSkip) {\n" +
"            return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Balance%20v2\"\n" +
"        >Balance v2 déséquilibrée: ${message} ⓘ</a><ul>${Object.entries(balance)\n" +
"                .sort(([keya], [keyb]) => {\n" +
"                const keys = ['transaction', 'CHQ', 'Reçu', 'autre'];\n" +
"                return keys.indexOf(keya) - keys.indexOf(keyb);\n" +
"            })\n" +
"                .map(([key, value]) => `<li><strong>${key} :</strong>${value}${(key !== 'transaction' && balance.transaction && value !== balance.transaction) ? ` (diff : ${balance.transaction - value})` : ''}</li>`)\n" +
"                .join('')}</ul>`;\n" +
"        }\n" +
"        // Les associations ne gèrent pas la TVA\n" +
"        if (ledgerEvents.some(line => line.planItem.number.startsWith('445')))\n" +
"            return 'Une écriture comporte un compte de TVA';\n" +
"        if (\n" +
"        // si justificatif demandé, sauter cette section\n" +
"        !doc.is_waiting_details\n" +
"            || isCurrent) {\n" +
"            if (ledgerEvents.find(line => line.planItem.number === '6288'))\n" +
"                return 'Une ligne d\\'écriture comporte le numéro de compte 6288';\n" +
"            if (ledgerEvents.find(line => line.planItem.number === '4716001')) {\n" +
"                return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations.\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20attribu%C3%A9e%20%C3%A0%20un%20compte%20d'attente\"\n" +
"          >Une ligne d'écriture utilise un compte d'attente: 4716001 ⓘ</a>`;\n" +
"            }\n" +
"            if (ledgerEvents.some(line => line.planItem.number.startsWith('47') && line.planItem.number !== '47600001')) {\n" +
"                return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations.\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20attribu%C3%A9e%20%C3%A0%20un%20compte%20d'attente\"\n" +
"          >Une écriture comporte un compte d\\'attente (commençant par 47) ⓘ</a>`;\n" +
"            }\n" +
"            // balance déséquilibrée\n" +
"            const third = ledgerEvents.find(line => line.planItem.number.startsWith('40'))?.planItem?.number;\n" +
"            if (third) {\n" +
"                const thirdEvents = ledgerEvents.filter(line => line.planItem.number === third);\n" +
"                const balance = thirdEvents.reduce((sum, line) => sum + parseFloat(line.amount), 0);\n" +
"                if (isCurrent)\n" +
"                    this.log('loadValidMessage: Balance', Math.abs(balance) > 0.001 ? 'déséquilibrée' : 'OK', this);\n" +
"                // On a parfois des calculs qui ne tombent pas très juste en JS\n" +
"                //if (Math.abs(balance) > 0.001) {\n" +
"                if (Math.abs(balance) > 100) {\n" +
"                    return `Balance déséquilibrée avec Tiers spécifié : ${balance}`;\n" +
"                }\n" +
"            }\n" +
"            // Pas plus d'exigence pour les petits montants\n" +
"            if (Math.abs(parseFloat(doc.currency_amount)) < 100)\n" +
"                return 'OK';\n" +
"            // Justificatif manquant\n" +
"            if (doc.date.startsWith('2023'))\n" +
"                return 'OK';\n" +
"            const attachmentOptional = Math.abs(parseFloat(doc.currency_amount)) < 100\n" +
"                || [\n" +
"                    ' DE: STRIPE MOTIF: ALLODONS REF: ',\n" +
"                ].some(label => doc.label.includes(label))\n" +
"                || [\n" +
"                    'REMISE CHEQUE ',\n" +
"                    'VIR RECU ',\n" +
"                    'VIR INST RE ',\n" +
"                    'VIR INSTANTANE RECU DE: ',\n" +
"                ].some(label => doc.label.startsWith(label));\n" +
"            const attachmentRequired = doc.attachment_required && !doc.attachment_lost\n" +
"                && (!attachmentOptional || isCurrent);\n" +
"            const hasAttachment = groupedDocuments.length > 1;\n" +
"            if (isCurrent)\n" +
"                this.log({ attachmentOptional, attachmentRequired, groupedDocuments, hasAttachment });\n" +
"            if (attachmentRequired && !hasAttachment)\n" +
"                return 'Justificatif manquant';\n" +
"        }\n" +
"        return 'OK';\n" +
"    }\n" +
"    /** Add item to this transaction's group */\n" +
"    async groupAdd(id) {\n" +
"        const doc = await this.getDocument();\n" +
"        const groups = doc.group_uuid;\n" +
"        await documentMatching({ id, groups });\n" +
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
"        this.debug('loadMessage', this);\n" +
"        this.message = '⟳';\n" +
"        const rawTransaction = getReactProps($('.paragraph-body-m+.heading-page.mt-1'), 9).transaction;\n" +
"        this.state.transaction = new Transaction(rawTransaction);\n" +
"        const message = await this.state.transaction.getValidMessage();\n" +
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
"        this.reload();\n" +
"    }\n" +
"}\n" +
"/** Open next invalid transaction */\n" +
"/**\n" +
" * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :\n" +
"getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);\n" +
" */\n" +
"\n" +
"/** Add 'add by ID' button on transaction reconciliation tab */\n" +
"class TransactionAddByIdButton extends Service {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.button = parseHTML('<div class=\"btn-sm w-100 btn-primary add-by-id-btn\" style=\"cursor: pointer;\">Ajouter par ID</div>').firstElementChild;\n" +
"    }\n" +
"    async init() {\n" +
"        await this.insertContainer();\n" +
"        this.attachEvent();\n" +
"    }\n" +
"    async insertContainer() {\n" +
"        const div = (await Promise.race([\n" +
"            waitElem('button', 'Voir plus de factures'),\n" +
"            waitElem('button', 'Chercher parmi les factures'),\n" +
"        ])).closest('.mt-2');\n" +
"        if (!div) {\n" +
"            this.log('TransactionAddByIdButton', { button: await Promise.race([\n" +
"                    waitElem('button', 'Voir plus de factures'),\n" +
"                    waitElem('button', 'Chercher parmi les factures'),\n" +
"                ]), div });\n" +
"            throw new Error('Impossible de trouver le bloc de boutons');\n" +
"        }\n" +
"        div.insertBefore(this.button, div.lastElementChild);\n" +
"        waitFunc(async () => {\n" +
"            const currentDiv = (await Promise.race([\n" +
"                waitElem('button', 'Voir plus de factures'),\n" +
"                waitElem('button', 'Chercher parmi les factures'),\n" +
"            ])).closest('.mt-2');\n" +
"            return currentDiv !== div;\n" +
"        }).then(() => this.insertContainer());\n" +
"    }\n" +
"    attachEvent() {\n" +
"        this.log({ button: this.button });\n" +
"        this.button.addEventListener('click', () => { this.addById(); });\n" +
"    }\n" +
"    async addById() {\n" +
"        /**\n" +
"         * Obligé de recharger la transaction à chaque appel : le numéro guid du\n" +
"         * groupe change à chaque attachement de nouvelle pièce\n" +
"         */\n" +
"        const transactionId = Number(getParam(location.href, 'transaction_id'));\n" +
"        const id = Number(prompt('ID du justificatif ?'));\n" +
"        const transaction = new Transaction({ id: transactionId });\n" +
"        await transaction.groupAdd(id);\n" +
"        ValidMessage.getInstance().reload();\n" +
"    }\n" +
"}\n" +
"\n" +
"async function getInvoice(id) {\n" +
"    if (!id)\n" +
"        throw new Error(`Error: getInvoice() invalid id: ${id}`);\n" +
"    const response = await apiRequest(`accountants/invoices/${id}`, null, 'GET');\n" +
"    if (!response)\n" +
"        return null;\n" +
"    const data = await response.json();\n" +
"    return APIInvoice.Create(data.invoice);\n" +
"}\n" +
"async function updateInvoice(id, data) {\n" +
"    const response = await apiRequest(`/accountants/invoices/${id}`, { invoice: data }, 'PUT');\n" +
"    const responseData = await response?.json();\n" +
"    return APIInvoiceUpdateResponse.Create(responseData);\n" +
"}\n" +
"/**\n" +
" * Get invoice list paginated\n" +
" */\n" +
"async function getInvoicesList(params = {}) {\n" +
"    params = APIInvoiceListParams.Create(params);\n" +
"    if (!params.direction)\n" +
"        throw new Error('params.direction is mandatory');\n" +
"    if ('page' in params && !Number.isSafeInteger(params.page)) {\n" +
"        console.log('getInvoicesList', { params });\n" +
"        throw new Error('params.page, if provided, MUST be a safe integer');\n" +
"    }\n" +
"    const searchParams = new URLSearchParams(params);\n" +
"    if (!searchParams.has('filter'))\n" +
"        searchParams.set('filter', '[]');\n" +
"    const url = `accountants/invoices/list?${searchParams.toString()}`;\n" +
"    const response = await apiRequest(url, null, 'GET');\n" +
"    const data = await response?.json();\n" +
"    return APIInvoiceList.Create(data);\n" +
"}\n" +
"/**\n" +
" * Generate all result one by one as generator\n" +
" */\n" +
"async function* getInvoiceGenerator(params = {}) {\n" +
"    let page = Number(params.page ?? 1);\n" +
"    if (!Number.isSafeInteger(page)) {\n" +
"        console.log('getInvoiceGenerator', { params, page });\n" +
"        throw new Error('params.page, if provided, MUST be a safe integer');\n" +
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
"            throw new Error('The given value does not parse as an Array.');\n" +
"        return value;\n" +
"    }\n" +
"    filter(matchOrPredicate) {\n" +
"        this.load();\n" +
"        if (typeof matchOrPredicate === 'function')\n" +
"            return this.data.filter(matchOrPredicate);\n" +
"        return this.data.filter(item => Object.entries(matchOrPredicate).every(([key, value]) => item[key] === value));\n" +
"    }\n" +
"    /**\n" +
"     * Returns the first cached element that match condition, and undefined\n" +
"     * otherwise.\n" +
"     */\n" +
"    find(match) {\n" +
"        this.load();\n" +
"        return this.data.find(item => Object.entries(match).every(([key, value]) => item[key] === value));\n" +
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
"        this.emit('delete', { old: found });\n" +
"        this.save();\n" +
"        this.emit('change', this);\n" +
"        return found;\n" +
"    }\n" +
"    /**\n" +
"     * clear all data\n" +
"     */\n" +
"    clear() {\n" +
"        this.data.length = 0;\n" +
"        this.emit('clear', this);\n" +
"        this.save();\n" +
"        this.emit('change', this);\n" +
"        return this;\n" +
"    }\n" +
"    /**\n" +
"     * Update one item\n" +
"     *\n" +
"     * @param create Create the item if no match found\n" +
"     * @return Old value\n" +
"     */\n" +
"    updateItem(match, value, create = true) {\n" +
"        this.load();\n" +
"        const item = this.find(match);\n" +
"        if (item) {\n" +
"            this.data.splice(this.data.indexOf(item), 1, value);\n" +
"            this.emit('update', { old: item, new: value });\n" +
"        }\n" +
"        else {\n" +
"            if (!create)\n" +
"                return;\n" +
"            this.data.push(value);\n" +
"            this.emit('add', { new: value });\n" +
"        }\n" +
"        this.save();\n" +
"        this.emit('change', this);\n" +
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
"class CacheListRecord extends CacheList {\n" +
"    /**\n" +
"     * Update one item\n" +
"     *\n" +
"     * @param create Create the item if no match found\n" +
"     * @return Old value\n" +
"     */\n" +
"    updateItem(match, newValue, create = true) {\n" +
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
"function openInTab(url) {\n" +
"    document.body.appendChild(parseHTML(`<div class=\"open_tab\" data-url=\"${escape(url)}\" style=\"display: none;\"></div>`));\n" +
"}\n" +
"\n" +
"function openDocument(documentId) {\n" +
"    const url = new URL(location.href.replace(/accountants.*$/, `documents/${documentId}.html`));\n" +
"    openInTab(url.toString());\n" +
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
"}\n" +
"\n" +
"/**\n" +
" * Autolaunch some service at the first user interaction\n" +
" */\n" +
"class Autostarter extends Logger {\n" +
"    constructor(parent) {\n" +
"        super(`${parent}_Autostart`);\n" +
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
"            const status = await this.updateStatus(cachedItem.id);\n" +
"            if (this.isSkipped(status)) {\n" +
"                if (!status?.valid)\n" +
"                    this.log('skip', status);\n" +
"                continue;\n" +
"            }\n" +
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
"        /**\n" +
"         * A ce stade toutes les entrées ont été traitées, mais rien ne garantit\n" +
"         * que les premières entrées chargées nèont pas subi de modification depuis\n" +
"         * il faudrait avoir un champ status.updatedAt et retester toutes les entrées\n" +
"         * pour lesquelles ce champ est vieux de plus de 3 jours, disons\n" +
"         */\n" +
"        this.error('TODO: vérifier les entrées qui ont été modifiée récemment');\n" +
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
"            value = id;\n" +
"            id = value.id;\n" +
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
"            openDocument(status.id);\n" +
"            this.running = false;\n" +
"            return;\n" +
"        }\n" +
"        if (interactionAllowed &&\n" +
"            confirm(this.constructor.name + ': tous les éléments sont valides selon les paramétres actuels. Revérifier tout depuis le début ?')) {\n" +
"            this.cache.clear();\n" +
"            localStorage.removeItem(`${this.storageKey}-state`);\n" +
"            this.invalidGenerator = this.loadInvalid();\n" +
"            return this.openNext(interactionAllowed);\n" +
"        }\n" +
"        this.running = false;\n" +
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
"        const button = $(`.wait-item`, this.container);\n" +
"        const tooltip = Tooltip.make({ target: button, text: '' });\n" +
"        const updateWaitDisplay = () => {\n" +
"            const status = this.cache.find({ id: this.current });\n" +
"            if (!status?.wait || (new Date(status.wait).getTime() < Date.now())) {\n" +
"                button.style.backgroundColor = '';\n" +
"                tooltip.setText('Ne plus afficher pendant 3 jours');\n" +
"                return;\n" +
"            }\n" +
"            button.style.backgroundColor = 'var(--blue)';\n" +
"            const date = new Date(status.wait).toISOString().replace('T', ' ').slice(0, 16)\n" +
"                .split(' ').map(block => block.split('-').reverse().join('/')).join(' ');\n" +
"            tooltip.setText(`Ignoré jusqu'à ${date}.`);\n" +
"        };\n" +
"        updateWaitDisplay();\n" +
"        setInterval(() => { updateWaitDisplay(); }, 60000);\n" +
"        button.addEventListener('click', () => {\n" +
"            this.log('waiting button clicked');\n" +
"            const status = this.cache.find({ id: this.current });\n" +
"            if (!status)\n" +
"                return;\n" +
"            const wait = (status.wait && (new Date(status.wait).getTime() > Date.now())) ? ''\n" +
"                : new Date(Date.now() + 3 * 86400000).toISOString();\n" +
"            this.cache.updateItem({ id: this.current }, Object.assign(status, { wait }));\n" +
"            updateWaitDisplay();\n" +
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
"}\n" +
"\n" +
"class Invoice extends ValidableDocument {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.type = 'invoice';\n" +
"    }\n" +
"    static from(invoice) {\n" +
"        if (invoice.direction === 'supplier')\n" +
"            return new SupplierInvoice(invoice);\n" +
"        return new CustomerInvoice(invoice);\n" +
"    }\n" +
"    static async load(id) {\n" +
"        const invoice = await getInvoice(id);\n" +
"        if (!invoice?.id) {\n" +
"            console.log('Invoice.load: cannot load this invoice', { id, invoice, _this: this });\n" +
"            return null;\n" +
"        }\n" +
"        return this.from(invoice);\n" +
"    }\n" +
"    async update(data) {\n" +
"        return await updateInvoice(this.id, data);\n" +
"    }\n" +
"    async getInvoice() {\n" +
"        if (!this.invoice) {\n" +
"            this.invoice = getInvoice(this.id).then(response => {\n" +
"                if (!response)\n" +
"                    throw new Error('Impossible de charger la facture');\n" +
"                return response;\n" +
"            });\n" +
"        }\n" +
"        return this.invoice;\n" +
"    }\n" +
"}\n" +
"Object.assign(window, { Invoice });\n" +
"class SupplierInvoice extends Invoice {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.direction = 'supplier';\n" +
"    }\n" +
"    async loadValidMessage() {\n" +
"        const current = Number(getParam(location.href, 'id'));\n" +
"        current === this.id;\n" +
"        const invoice = await this.getInvoice();\n" +
"        // Fait partie d'un exercis clôt\n" +
"        if (invoice.has_closed_ledger_events)\n" +
"            return 'OK';\n" +
"        const ledgerEvents = await this.getLedgerEvents();\n" +
"        if (ledgerEvents.some(levent => levent.closed))\n" +
"            return 'OK';\n" +
"        if (!invoice)\n" +
"            this.log('loadValidMessage', { Invoice: this, invoice });\n" +
"        const doc = await this.getDocument();\n" +
"        if (invoice.id === current)\n" +
"            this.log('loadValidMessage', this);\n" +
"        const groupedDocuments = await this.getGroupedDocuments();\n" +
"        // Archived\n" +
"        const archivedAllowed = ['§ #', '¤ PIECE ETRANGERE', '¤ TRANSACTION INTROUVABLE', 'CHQ DÉCHIRÉ'];\n" +
"        if (invoice.archived) {\n" +
"            if (\n" +
"            //legacy :\n" +
"            !invoice.invoice_number.startsWith('¤ CARTE ETRANGERE') &&\n" +
"                !archivedAllowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem)))\n" +
"                return `<a\n" +
"          title=\"Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"        >Facture archivée sans référence ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${archivedAllowed.map(it => `<li>${it}</li>`).join('')}</ul>`;\n" +
"            if (invoice.id == current)\n" +
"                this.log('loadValidMessage', 'archivé avec numéro de facture correct');\n" +
"            return 'OK';\n" +
"        }\n" +
"        // Pas de tiers\n" +
"        else if (!invoice.thirdparty_id && !invoice.thirdparty) {\n" +
"            if (invoice.invoice_number.startsWith('CHQ DÉCHIRÉ - CHQ')) {\n" +
"                return `<a\n" +
"          title=\"Archiver la facture : ⁝ > Archiver la facture.\\n" +
"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"        >Archiver le chèque déchiré ⓘ</a></ul>`;\n" +
"            }\n" +
"            return `<a\n" +
"        title=\"Cliquer ici pour plus d'informations\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"      >Ajouter un fournisseur ⓘ</a><ul style=\"margin:0;padding:0.8em;\"><li>CHQ DÉCHIRÉ - CHQ###</li></ul>`;\n" +
"        }\n" +
"        else if (archivedAllowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem))) {\n" +
"            return `<a\n" +
"        title=\"Archiver la facture : ⁝ > Archiver la facture.\\n" +
"Cliquer ici pour plus d'informations\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"      >Archiver la facture ⓘ</a></ul>`;\n" +
"        }\n" +
"        // Pas de compte de charge associé\n" +
"        const thirdparty = await this.getThirdparty();\n" +
"        if (!thirdparty.thirdparty_invoice_line_rules?.[0]?.pnl_plan_item) {\n" +
"            return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"        >Fournisseur inconnu ⓘ</a>`;\n" +
"        }\n" +
"        // exclude 6288\n" +
"        if (invoice.invoice_lines?.some(line => line.pnl_plan_item?.number == '6288'))\n" +
"            return 'compte tiers 6288';\n" +
"        // CHQ \"Taxi\"\n" +
"        if (invoice.thirdparty_id === 98348455\n" +
"            && !invoice.invoice_number.includes('|TAXI|')) {\n" +
"            return `<a\n" +
"        title=\"Le fournisseur 'TAXI' est trop souvent attribué aux chèques par Pennylane.\\n" +
"Si le fournisseur est réélement 'TAXI' ajouter |TAXI| à la fin du numéro de facture.\\n" +
"Cliquer ici pour plus d'informations\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20CHQ%20TAXI\"\n" +
"      >Ajouter le fournisseur ⓘ</a><ul style=\"margin:0;padding:0.8em;\"><li>|TAXI|</li><li>CHQ#</li></ul>`;\n" +
"        }\n" +
"        // Aides octroyées sans numéro de facture\n" +
"        if (106438171 === invoice.thirdparty_id\n" +
"            && !['AIDES - ', 'CHQ', 'CERFA - '].some(label => invoice.invoice_number.startsWith(label))) {\n" +
"            if (invoice.invoice_number.startsWith('§ #'))\n" +
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
"        // Aides octroyées ou piece d'indentité avec date\n" +
"        const emptyDateAllowed = ['CHQ', 'CHQ DÉCHIRÉ'];\n" +
"        if ([\n" +
"            106438171, // AIDES OCTROYÉES\n" +
"            114270419,\n" +
"            106519227,\n" +
"        ].includes(invoice.thirdparty?.id ?? 0)\n" +
"            || emptyDateAllowed.some(item => invoice.invoice_number?.startsWith(item))) {\n" +
"            if (invoice.date || invoice.deadline)\n" +
"                return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture\"\n" +
"        >Les dates doivent être vides ⓘ</a>`;\n" +
"        }\n" +
"        else if (!invoice.date) {\n" +
"            if (!emptyDateAllowed.some(item => invoice.invoice_number?.startsWith(item))) {\n" +
"                const archiveLabel = archivedAllowed.find(label => invoice.invoice_number.startsWith(label));\n" +
"                if (archiveLabel) {\n" +
"                    return `<a\n" +
"            title=\"Archiver la facture : ⁝ > Archiver la facture.\\n" +
"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"          >Archiver ${archiveLabel} ⓘ</a><ul style=\"margin:0;padding:0.8em;\">`;\n" +
"                }\n" +
"                return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture\"\n" +
"        >Date de facture vide ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${emptyDateAllowed.map(it => `<li>${it}</li>`).join('')}</ul>`;\n" +
"            }\n" +
"        }\n" +
"        // Aides octroyées avec mauvais ID\n" +
"        if (invoice.thirdparty?.name === \"AIDES OCTROYÉES\" && invoice.thirdparty.id !== 106438171)\n" +
"            return 'Il ne doit y avoir qu\\'un seul compte \"AIDES OCTROYÉES\", et ce n\\'est pas le bon...';\n" +
"        // Piece d'identité avec mauvais ID\n" +
"        if (invoice.thirdparty?.name === \"PIECE ID\" && invoice.thirdparty.id !== 106519227)\n" +
"            return 'Il ne doit y avoir qu\\'un seul compte \"PIECE ID\", et ce n\\'est pas le bon...';\n" +
"        // Ecarts de conversion de devise\n" +
"        if (invoice.currency !== 'EUR') {\n" +
"            const diffLine = ledgerEvents.find(line => line.planItem.number === '4716001');\n" +
"            if (diffLine) {\n" +
"                this.log('loadValidMessage > Ecarts de conversion de devise', { ledgerEvents, diffLine });\n" +
"                if (parseFloat(diffLine.amount) < 0) {\n" +
"                    return 'Les écarts de conversions de devises doivent utiliser le compte 756';\n" +
"                }\n" +
"                else {\n" +
"                    return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FLes%20%C3%A9carts%20de%20conversions%20de%20devises%20doivent%20utiliser%20le%20compte%20656\"\n" +
"          >Les écarts de conversions de devises doivent utiliser le compte 656 ⓘ</a>`;\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"        // Stripe fees invoice\n" +
"        if (invoice.thirdparty?.id === 115640202)\n" +
"            return 'OK';\n" +
"        // ID card\n" +
"        if (invoice.thirdparty?.id === 106519227) {\n" +
"            if (invoice.invoice_number?.startsWith('ID '))\n" +
"                return 'OK';\n" +
"            else\n" +
"                return 'Le \"Numéro de facture\" des pièces d\\'identité commence obligatoirement par \"ID \"';\n" +
"        }\n" +
"        // Has transaction attached\n" +
"        const transactions = groupedDocuments.filter(doc => doc.type === 'Transaction');\n" +
"        const documentDate = new Date(doc.date);\n" +
"        const day = 86400000;\n" +
"        const isRecent = (Date.now() - documentDate.getTime()) < (15 * day);\n" +
"        if (!isRecent && !transactions.length) {\n" +
"            const orphanAllowed = ['¤ TRANSACTION INTROUVABLE'];\n" +
"            if (!orphanAllowed.some(label => invoice.invoice_number.startsWith(label))) {\n" +
"                const archiveLabel = archivedAllowed.find(label => invoice.invoice_number.startsWith(label));\n" +
"                if (archiveLabel) {\n" +
"                    return `<a\n" +
"            title=\"Archiver la facture : ⁝ > Archiver la facture.\\n" +
"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"          >Archiver ${archiveLabel} ⓘ</a><ul style=\"margin:0;padding:0.8em;\">`;\n" +
"                }\n" +
"                return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e\"\n" +
"          >Pas de transaction attachée ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${orphanAllowed.concat(archivedAllowed).map(it => `<li>${it}</li>`).join('')}</ul>`;\n" +
"            }\n" +
"        }\n" +
"        return 'OK';\n" +
"    }\n" +
"}\n" +
"class CustomerInvoice extends Invoice {\n" +
"    constructor() {\n" +
"        super(...arguments);\n" +
"        this.direction = 'customer';\n" +
"    }\n" +
"    async loadValidMessage() {\n" +
"        const current = Number(getParam(location.href, 'id'));\n" +
"        const isCurrent = current === this.id;\n" +
"        const invoice = await this.getInvoice();\n" +
"        // Fait partie d'un exercis clôt\n" +
"        if (invoice.has_closed_ledger_events)\n" +
"            return 'OK';\n" +
"        if (isCurrent)\n" +
"            this.log('loadValidMessage', this);\n" +
"        // Archived\n" +
"        if (invoice.archived) {\n" +
"            const allowed = ['§ #', '¤ TRANSACTION INTROUVABLE'];\n" +
"            if (\n" +
"            //legacy\n" +
"            !invoice.invoice_number.startsWith('§ ESPECES') &&\n" +
"                !allowed.some(allowedItem => invoice.invoice_number.startsWith(allowedItem)))\n" +
"                return `<a\n" +
"          title=\"Le numéro de facture d'une facture archivée doit commencer par une de ces possibilités. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"        >Facture archivée sans référence ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${allowed.map(it => `<li>${it}</li>`).join('')}</ul>`;\n" +
"            return 'OK';\n" +
"        }\n" +
"        // Pas de client\n" +
"        if (!invoice.thirdparty)\n" +
"            return 'choisir un \"client\"';\n" +
"        // don manuel\n" +
"        if (![113420582, 103165930].includes(invoice.thirdparty.id))\n" +
"            return 'les seuls clients autorisés sont \"PIECE ID\" et \"DON MANUEL\"';\n" +
"        // piece id\n" +
"        if (invoice.thirdparty.id === 113420582) {\n" +
"            if (!invoice.invoice_number?.startsWith('ID '))\n" +
"                return 'le champ \"Numéro de facture\" doit commencer par \"ID NOM_DE_LA_PERSONNE\"';\n" +
"            return 'OK';\n" +
"        }\n" +
"        // Montant\n" +
"        if (invoice.amount === '0.0' && !invoice.invoice_number.includes('|ZERO|'))\n" +
"            return `<a\n" +
"      title=\"Cliquer ici pour plus d'informations.\"\n" +
"      href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client\"\n" +
"    >Ajouter le montant ⓘ</a><ul style=\"margin:0;padding:0.8em;\"><li>|ZERO|</li></ul>`;\n" +
"        // Don Manuel\n" +
"        if (invoice.thirdparty_id === 103165930\n" +
"            && !['CHQ', 'CERFA'].some(label => invoice.invoice_number.includes(label))) {\n" +
"            return `<a\n" +
"        title=\"Le numéro de facture doit être conforme à un des modèles proposés. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20Manuel%20-%20num%C3%A9ro%20de%20facture\"\n" +
"      >Informations manquantes dans le numéro de facture ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${[\n" +
"                'CERFA n°### - Prénom Nom - JJ/MM/AAAA',\n" +
"                'CHQ n°### - Prénom Nom - JJ/MM/AAAA',\n" +
"            ].map(it => `<li>${it}</li>`).join('')}</ul>`;\n" +
"        }\n" +
"        // Has transaction attached\n" +
"        const invoiceDocument = await this.getDocument();\n" +
"        const groupedOptional = ['¤ TRANSACTION INTROUVABLE'];\n" +
"        const groupedDocuments = invoiceDocument.grouped_documents;\n" +
"        if (!groupedDocuments?.some(doc => doc.type === 'Transaction')\n" +
"            && !groupedOptional.some(label => invoice.invoice_number.startsWith(label)))\n" +
"            return `<a\n" +
"          title=\"Si la transaction est introuvable, mettre un des textes proposés au début du numéro de facture. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e\"\n" +
"        >Pas de transaction attachée ⓘ</a><ul style=\"margin:0;padding:0.8em;\">${groupedOptional.map(it => `<li>${it}</li>`).join('')}</ul>`;\n" +
"        // Les dates doivent toujours être vides\n" +
"        if (invoice.date || invoice.deadline)\n" +
"            return `<a\n" +
"      title=\"Les dates des pièces orientées client doivent toujours être vides. Cliquer ici pour plus d'informations\"\n" +
"      href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client\"\n" +
"    >Les dates doivent être vides ⓘ</a>`;\n" +
"        return 'OK';\n" +
"    }\n" +
"}\n" +
"\n" +
"async function waitPage(pageName) {\n" +
"    return await waitFunc(() => isPage(pageName));\n" +
"}\n" +
"function isPage(pageName) {\n" +
"    switch (pageName) {\n" +
"        case 'invoiceDetail': return findElem('h4', 'Réconciliation') ?? false;\n" +
"        default: throw new Error(`unknown page required : \"${pageName}\"`);\n" +
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
"        if (!invoice)\n" +
"            return null; // probablement une facture supprimée\n" +
"        return await invoice.getStatus();\n" +
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
"class CacheStatus extends CacheListRecord {\n" +
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
"        this.cache = CacheStatus.getInstance(this.storageKey);\n" +
"        this.cache.on('change', () => this.handleCacheChange());\n" +
"        this.watchReloadHotkey();\n" +
"        this.watchEventSave();\n" +
"        await this.appendContainer();\n" +
"        setInterval(() => { this.watch(); }, 200);\n" +
"    }\n" +
"    set message(text) {\n" +
"        this.emit('message-change', text);\n" +
"    }\n" +
"    set id(text) {\n" +
"        this.emit('id-change', text);\n" +
"    }\n" +
"    watchReloadHotkey() {\n" +
"        document.addEventListener('keydown', event => {\n" +
"            if (isPage('invoiceDetail') && event.ctrlKey && event.code === 'KeyR') {\n" +
"                event.preventDefault();\n" +
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
"        const invoice = getReactProps(infos, 28).invoice;\n" +
"        let reload = false;\n" +
"        if (this.state.reactInvoice !== invoice) {\n" +
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
"        <div id=\"is-valid-tag\" class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">⟳</div>\n" +
"        <div id=\"invoice-id\" class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\"></div>\n" +
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
"        this.id = `#${this.state.invoice?.id}<a title=\"réouvrir cette pièce dans un nouvel onglet\" target=\"_blank\" href=\"${location.href.split('/').slice(0, 5).join('/')}/documents/${this.state.invoice?.id}.html\" ><svg class=\"MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0_5 css-q7mezt\" focusable=\"false\" aria-hidden=\"true\" viewBox=\"0 0 24 24\" data-testid=\"OpenInNewRoundedIcon\" style=\"font-size: 1rem;\"><path d=\"M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1M14 4c0 .55.45 1 1 1h2.59l-9.13 9.13c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1\"></path></svg></a>`;\n" +
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
"        await waitElem('h3', 'Transactions');\n" +
"        while (await waitFunc(() => $$('div>a+button>svg').some(svg => !svg.closest('div')?.querySelector('.archive-button'))))\n" +
"            this.addInvoiceInfos();\n" +
"    }\n" +
"    addInvoiceInfos() {\n" +
"        const buttonsBlock = $$('div>a+button>svg')\n" +
"            .find(svg => !svg.closest('div')?.querySelector('.archive-button'))\n" +
"            ?.closest('div');\n" +
"        if (!buttonsBlock) {\n" +
"            this.log('addInvoiceInfos : no invoice found');\n" +
"            return;\n" +
"        }\n" +
"        const buttonClass = buttonsBlock.querySelector('button')?.className ?? '';\n" +
"        const id = getReactProps(buttonsBlock, 4).invoiceId;\n" +
"        buttonsBlock.insertBefore(parseHTML(`<button class=\"archive-button ${buttonClass}\">&nbsp;x&nbsp;</button>`), buttonsBlock.firstElementChild);\n" +
"        const archiveButton = buttonsBlock.querySelector('.archive-button');\n" +
"        archiveButton.addEventListener('click', async () => {\n" +
"            archiveButton.disabled = true;\n" +
"            archiveButton.classList.add('disabled');\n" +
"            archiveButton.innerText = '⟳';\n" +
"            const invoice = await Invoice.load(id);\n" +
"            if (!invoice) {\n" +
"                alert('Impossible de trouver la facture #' + id);\n" +
"                archiveButton.innerText = '⚠';\n" +
"                return;\n" +
"            }\n" +
"            const invoiceDoc = await invoice?.getInvoice();\n" +
"            const docs = await invoice.getGroupedDocuments();\n" +
"            const transactions = docs.filter(doc => doc.type === 'Transaction').map(doc => `#${doc.id}`);\n" +
"            await invoice.update({\n" +
"                invoice_number: `§ ${transactions.join(' - ')} - ${invoiceDoc.invoice_number}`\n" +
"            });\n" +
"            await invoice.archive();\n" +
"            buttonsBlock.closest('.ui-card')?.remove();\n" +
"            this.log(`archive invoice #${id}`, { invoice });\n" +
"            ValidMessage.getInstance().reload();\n" +
"        });\n" +
"        upElement(buttonsBlock, 3).querySelector('.flex-grow-1 .d-block:last-child')?.appendChild(parseHTML(`&nbsp;<span class=\"invoice-id d-inline-block bg-secondary-100 dihsuQ px-0_5\">#${id}</span>`));\n" +
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
"            const rawInvoice = getReactProps(invoiceNumberField, 27).initialValues ?? // for supplier pieces\n" +
"                getReactProps(invoiceNumberField, 44).initialValues; // for customer pieces\n" +
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
"                case 'KeyE': return this.filterClick('Montant', event);\n" +
"                case 'KeyD': return this.filterClick('Date', event);\n" +
"            }\n" +
"        }\n" +
"        if (event.ctrlKey) {\n" +
"            switch (event.code) {\n" +
"                case 'KeyS': return this.saveLedgerEvents();\n" +
"            }\n" +
"        }\n" +
"        else\n" +
"            switch (event.code) {\n" +
"                case 'NumpadEnter':\n" +
"                case 'Enter':\n" +
"                    return this.manageEnter(event);\n" +
"            }\n" +
"    }\n" +
"    async filterClick(label, event) {\n" +
"        event.preventDefault();\n" +
"        const filterButton = $$('div.dropdown button')\n" +
"            .find(button => getReactProps(button, 1).label === label);\n" +
"        if (!filterButton)\n" +
"            this.log(`bouton \"${label}\" introuvable`);\n" +
"        if (event.shiftKey) {\n" +
"            $('div[aria-label=Effacer]', filterButton)?.click();\n" +
"            return;\n" +
"        }\n" +
"        filterButton?.click();\n" +
"        const inputField = await waitElem(`input[aria-label=${label}]`, '', 2000);\n" +
"        if (!inputField)\n" +
"            this.log(`champ \"input[aria-label=${label}]\" introuvable`);\n" +
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
"    saveLedgerEvents() {\n" +
"        this.log('saveLedgerEvents()');\n" +
"        findElem('button', 'Enregistrer')?.click();\n" +
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
"last7DaysFilter();\n" +
"ValidMessage.start();\n" +
"TransactionAddByIdButton.start();\n" +
"NextInvalidInvoice.start();\n" +
"NextInvalidTransaction.start();\n" +
"InvoiceDisplayInfos.start();\n" +
"ArchiveGroupedDocument.start();\n" +
"FixTab.start();\n" +
"AllowChangeArchivedInvoiceNumber.start();\n" +
"TransactionPanelHotkeys.start();\n" +
"EntryBlocInfos.start();\n" +
"AddInvoiceIdColumn.start();\n" +
"RotateImg.start();\n" +
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
"    GM_Pennylane_Version: /** version **/ '0.1.17',\n" +
"    GM: {\n" +
"        API: {\n" +
"            getDocument,\n" +
"            getGroupedDocuments,\n" +
"            getInvoice,\n" +
"            getInvoicesList,\n" +
"            getLedgerEvents,\n" +
"            getThirdparty,\n" +
"            getTransactionsList,\n" +
"        },\n" +
"        $$,\n" +
"        $,\n" +
"        findElem,\n" +
"        getReact,\n" +
"        getReactProps,\n" +
"        Invoice,\n" +
"        parseHTML,\n" +
"        Transaction,\n" +
"    },\n" +
"};\n" +
"Object.assign(window, augmentation);\n" +
"" + '})();';
try {
    unsafeWindow.eval(code);
    openTabService();
    console.log('GM SUCCESS');
}
catch (error) {
    console.log('GM ERROR');
    console.log({ error, line: code.split('\n')[error.lineNumber - 1] });
}
