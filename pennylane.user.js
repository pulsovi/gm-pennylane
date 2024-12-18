// ==UserScript==
// @name     Pennylane
// @version  0.1.17
// @grant    unsafeWindow
// @grant    GM.openInTab
// @match    https://app.pennylane.com/companies/*
// @icon     https://app.pennylane.com/favicon.ico
// ==/UserScript=='use strict';

function openTabService() {
  setInterval(() => {
    const elem = document.querySelector("div.open_tab");
    if (!elem)
      return;
    const url = unescape(elem.dataset.url ?? "");
    if (!url)
      return;
    console.log("GM_openInTab", { elem, url });
    GM.openInTab(url, { active: false, insert: true });
    elem.remove();
  }, 200);
}

const code = ";(function IIFE() {" + "'use strict';\n" +
"\n" +
"function last7DaysFilter() {\n" +
"  const url = new URL(location.href);\n" +
"  if (url.searchParams.get(\"date\") !== \"LAST_7_DAYS\")\n" +
"    return;\n" +
"  const zone = (/* @__PURE__ */ new Date()).toString().replace(/^.*GMT(...)(..).*$/, \"$1:$2\");\n" +
"  const today = new Date(Math.floor(Date.now() / 864e5) * 864e5);\n" +
"  const start = new Date(today.getTime() - 864e5 * 7).toISOString().replace(\".000Z\", zone);\n" +
"  const end = today.toISOString().replace(\".000Z\", zone);\n" +
"  const filter = JSON.parse(url.searchParams.get(\"filter\") ?? \"[]\");\n" +
"  filter.splice(filter.findIndex((item) => item.field === \"date\"), 1);\n" +
"  filter.splice(filter.findIndex((item) => item.field === \"date\"), 1);\n" +
"  filter.push({ field: \"date\", operator: \"gteq\", value: start }, { field: \"date\", operator: \"lteq\", value: end });\n" +
"  url.searchParams.set(\"filter\", JSON.stringify(filter));\n" +
"  url.searchParams.delete(\"date\");\n" +
"  location.replace(url);\n" +
"}\n" +
"\n" +
"async function sleep(ms) {\n" +
"  await new Promise((rs) => setTimeout(rs, ms));\n" +
"}\n" +
"async function waitFunc(cb, timeout = 0) {\n" +
"  const out = timeout ? Date.now() + timeout : 0;\n" +
"  let result = cb();\n" +
"  if (result instanceof Promise)\n" +
"    result = await result;\n" +
"  while (result === false) {\n" +
"    if (out && Date.now() > out)\n" +
"      return false;\n" +
"    await sleep(200);\n" +
"    result = await cb();\n" +
"  }\n" +
"  return result;\n" +
"}\n" +
"\n" +
"function $(selector, root = document) {\n" +
"  if (root === null)\n" +
"    root = document;\n" +
"  return root.querySelector(selector);\n" +
"}\n" +
"function $$(selector, root = document) {\n" +
"  return Array.from(root.querySelectorAll(selector));\n" +
"}\n" +
"async function waitElem(selector, content, timeout = 0) {\n" +
"  const result = await waitFunc(() => findElem(selector, content) ?? false, timeout);\n" +
"  if (result === false)\n" +
"    return null;\n" +
"  return result;\n" +
"}\n" +
"function findElem(selector, content) {\n" +
"  return $$(selector).find((el) => !content || el.textContent === content) ?? null;\n" +
"}\n" +
"function parentElement(child, steps = 1) {\n" +
"  let parent = child;\n" +
"  for (let i = 0; i < steps; ++i)\n" +
"    parent = parent?.parentElement;\n" +
"  return parent;\n" +
"}\n" +
"function upElement(elem, upCount) {\n" +
"  let retval = elem;\n" +
"  for (let i = 0; i < upCount; ++i)\n" +
"    retval = retval?.parentElement;\n" +
"  return retval;\n" +
"}\n" +
"function parseHTML(html) {\n" +
"  const template = document.createElement(\"template\");\n" +
"  template.innerHTML = html;\n" +
"  return template.content;\n" +
"}\n" +
"Object.assign(window, { gm: {\n" +
"  $$,\n" +
"  $,\n" +
"  findElem,\n" +
"  parentElement,\n" +
"  parseHTML,\n" +
"  upElement,\n" +
"  waitElem\n" +
"} });\n" +
"\n" +
"function getReact(elem, up = 0) {\n" +
"  if (!elem)\n" +
"    return null;\n" +
"  const keys = Object.getOwnPropertyNames(elem);\n" +
"  const fiberKey = keys.find((key) => key.startsWith(\"__reactFiber\"));\n" +
"  if (!fiberKey)\n" +
"    return null;\n" +
"  const fiber = elem[fiberKey];\n" +
"  let component = fiber.return;\n" +
"  for (let i = 0; i < up; ++i)\n" +
"    component = component.return;\n" +
"  return component;\n" +
"}\n" +
"window.getReact = getReact;\n" +
"function getReactProps(elem, up = 0) {\n" +
"  return getReact(elem, up)?.memoizedProps;\n" +
"}\n" +
"window.getReactProps = getReactProps;\n" +
"\n" +
"function getParam(url, paramName) {\n" +
"  return new URL(url).searchParams.get(paramName);\n" +
"}\n" +
"\n" +
"function hashString(str, seed = 0) {\n" +
"  let h1 = 3735928559 ^ seed;\n" +
"  let h2 = 1103547991 ^ seed;\n" +
"  for (let i = 0; i < str.length; i++) {\n" +
"    const ch = str.charCodeAt(i);\n" +
"    h1 = Math.imul(h1 ^ ch, 2654435761);\n" +
"    h2 = Math.imul(h2 ^ ch, 1597334677);\n" +
"  }\n" +
"  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);\n" +
"  h1 ^= Math.imul(h2 ^ h2 >>> 13, 3266489909);\n" +
"  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);\n" +
"  h2 ^= Math.imul(h1 ^ h1 >>> 13, 3266489909);\n" +
"  return 4294967296 * (2097151 & h2) + (h1 >>> 0);\n" +
"}\n" +
"\n" +
"function contrastScore(hex1, hex2) {\n" +
"  const rgb1 = hexToRgb(hex1);\n" +
"  const rgb2 = hexToRgb(hex2);\n" +
"  const l1 = relativeLuminance(rgb1);\n" +
"  const l2 = relativeLuminance(rgb2);\n" +
"  const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);\n" +
"  return (ratio - 1) / 20;\n" +
"}\n" +
"function hexToRgb(hex) {\n" +
"  const r = parseInt(hex.slice(1, 3), 16);\n" +
"  const g = parseInt(hex.slice(3, 5), 16);\n" +
"  const b = parseInt(hex.slice(5, 7), 16);\n" +
"  return [r, g, b];\n" +
"}\n" +
"function relativeLuminance(rgb) {\n" +
"  const [r, g, b] = rgb.map((c) => {\n" +
"    c /= 255;\n" +
"    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);\n" +
"  });\n" +
"  return 0.2126 * r + 0.7152 * g + 0.0722 * b;\n" +
"}\n" +
"function rgbToHex([r, g, b]) {\n" +
"  const hexR = r.toString(16).padStart(2, \"0\");\n" +
"  const hexG = g.toString(16).padStart(2, \"0\");\n" +
"  const hexB = b.toString(16).padStart(2, \"0\");\n" +
"  return `#${hexR}${hexG}${hexB}`;\n" +
"}\n" +
"function hslToRgb([h, s, l]) {\n" +
"  h = h % 360;\n" +
"  s = Math.max(0, Math.min(100, s)) / 100;\n" +
"  l = Math.max(0, Math.min(100, l)) / 100;\n" +
"  const c = (1 - Math.abs(2 * l - 1)) * s;\n" +
"  const x = c * (1 - Math.abs(h / 60 % 2 - 1));\n" +
"  const m = l - c / 2;\n" +
"  let r = 0, g = 0, b = 0;\n" +
"  if (0 <= h && h < 60) {\n" +
"    [r, g, b] = [c, x, 0];\n" +
"  } else if (60 <= h && h < 120) {\n" +
"    [r, g, b] = [x, c, 0];\n" +
"  } else if (120 <= h && h < 180) {\n" +
"    [r, g, b] = [0, c, x];\n" +
"  } else if (180 <= h && h < 240) {\n" +
"    [r, g, b] = [0, x, c];\n" +
"  } else if (240 <= h && h < 300) {\n" +
"    [r, g, b] = [x, 0, c];\n" +
"  } else if (300 <= h && h < 360) {\n" +
"    [r, g, b] = [c, 0, x];\n" +
"  }\n" +
"  return [\n" +
"    Math.round((r + m) * 255),\n" +
"    Math.round((g + m) * 255),\n" +
"    Math.round((b + m) * 255)\n" +
"  ];\n" +
"}\n" +
"function textToColor(text) {\n" +
"  const hashValue = hashString(text);\n" +
"  const hue = Math.abs(hashValue % 360);\n" +
"  const saturation = 70;\n" +
"  const lightness = 50;\n" +
"  return hslToHex([hue, saturation, lightness]);\n" +
"}\n" +
"function hslToHex(hsl) {\n" +
"  return rgbToHex(hslToRgb(hsl));\n" +
"}\n" +
"\n" +
"class EventEmitter {\n" +
"  events = {};\n" +
"  // Abonner une fonction à un événement\n" +
"  on(event, listener) {\n" +
"    if (!this.events[event]) {\n" +
"      this.events[event] = [];\n" +
"    }\n" +
"    this.events[event].push(listener);\n" +
"  }\n" +
"  // Désabonner une fonction d'un événement\n" +
"  off(event, listener) {\n" +
"    if (!this.events[event])\n" +
"      return;\n" +
"    this.events[event] = this.events[event].filter((l) => l !== listener);\n" +
"  }\n" +
"  // Déclencher un événement avec des données\n" +
"  emit(event, data) {\n" +
"    if (!this.events[event])\n" +
"      return;\n" +
"    this.events[event].forEach((listener) => listener(data));\n" +
"  }\n" +
"}\n" +
"\n" +
"class Logger extends EventEmitter {\n" +
"  logColor;\n" +
"  constructor(name) {\n" +
"    super();\n" +
"    const background = textToColor(name ?? this.constructor.name);\n" +
"    const foreground = contrastScore(background, \"#ffffff\") > contrastScore(background, \"#000000\") ? \"#ffffff\" : \"#000000\";\n" +
"    this.logColor = { bg: background, fg: foreground };\n" +
"  }\n" +
"  log(...messages) {\n" +
"    const date = (/* @__PURE__ */ new Date()).toISOString().replace(/^[^T]*T([\\d:]*).*$/, \"[$1]\");\n" +
"    console.log(\n" +
"      `${date} %cGM_Pennylane%c${this.constructor.name}`,\n" +
"      \"background: #0b0b31; color: #fff; padding: 0.1em .3em; border-radius: 0.3em 0 0 0.3em;\",\n" +
"      `background: ${this.logColor.bg}; color: ${this.logColor.fg}; padding: 0.1em .3em; border-radius: 0 0.3em 0.3em 0;`,\n" +
"      ...messages\n" +
"    );\n" +
"  }\n" +
"}\n" +
"\n" +
"class Service extends Logger {\n" +
"  static instance;\n" +
"  constructor() {\n" +
"    super();\n" +
"    this.init();\n" +
"  }\n" +
"  static start() {\n" +
"    console.log(this.name, \"start\", this);\n" +
"    this.getInstance();\n" +
"  }\n" +
"  static getInstance() {\n" +
"    if (!this.instance)\n" +
"      this.instance = new this();\n" +
"    return this.instance;\n" +
"  }\n" +
"  init() {\n" +
"  }\n" +
"}\n" +
"\n" +
"let apiRequestWait = null;\n" +
"async function apiRequest(endpoint, data, method = \"POST\") {\n" +
"  if (apiRequestWait)\n" +
"    await apiRequestWait;\n" +
"  const response = await fetch(`${location.href.split(\"/\").slice(0, 5).join(\"/\")}/${endpoint}`, {\n" +
"    method,\n" +
"    headers: {\n" +
"      \"Content-Type\": \"application/json\",\n" +
"      \"X-COMPANY-CONTEXT-DATA-UPDATED-AT\": \"2024-03-25T20:22:38.289Z\",\n" +
"      \"X-PLAN-USED-BY-FRONT-END\": \"v1_saas_free\",\n" +
"      \"X-FRONTEND-LAST-APPLICATION-LOADED-AT\": \"2024-03-25T20:22:37.968Z\",\n" +
"      \"X-CSRF-TOKEN\": getCookies(\"my_csrf_token\"),\n" +
"      \"X-DEPLOYMENT\": \"2023-04-19\",\n" +
"      \"X-SOURCE-VERSION\": \"e0c18c0\",\n" +
"      \"X-SOURCE-VERSION-BUILT-AT\": \"2024-03-25T18:05:09.769Z\",\n" +
"      \"X-DOCUMENT-REFERRER\": location.origin + location.pathname,\n" +
"      Accept: \"application/json\"\n" +
"    },\n" +
"    body: data ? JSON.stringify(data) : data\n" +
"  });\n" +
"  if (response.status === 429 && await response.clone().text() === \"You made too many requests. Time to take a break?\") {\n" +
"    apiRequestWait = sleep(1e3).then(() => {\n" +
"      apiRequestWait = null;\n" +
"    });\n" +
"    return apiRequest(endpoint, data, method);\n" +
"  }\n" +
"  if (response.status === 404) {\n" +
"    console.log(\"API Request: page introuvable\", { endpoint, data, method });\n" +
"    return null;\n" +
"  }\n" +
"  if (response.status !== 200) {\n" +
"    console.log(\"apiRequest response status is not 200\", { response });\n" +
"    throw new Error(\"Todo : am\\xE9liorer le message ci-dessus\");\n" +
"  }\n" +
"  return response;\n" +
"}\n" +
"function getCookies(key) {\n" +
"  const allCookies = new URLSearchParams(document.cookie.split(\";\").map((c) => c.trim()).join(\"&\"));\n" +
"  return allCookies.get(key);\n" +
"}\n" +
"Object.assign(window, { apiRequest });\n" +
"\n" +
"async function getDocument(id) {\n" +
"  const response = await apiRequest(`documents/${id}`, null, \"GET\");\n" +
"  return await response?.json();\n" +
"}\n" +
"async function documentMatching(options) {\n" +
"  const group_uuids = Array.isArray(options.groups) ? options.groups : [options.groups];\n" +
"  await apiRequest(\n" +
"    `documents/${options.id}/matching`,\n" +
"    { matching: { unmatch_ids: [], group_uuids } },\n" +
"    \"PUT\"\n" +
"  );\n" +
"}\n" +
"async function reloadLedgerEvents(id) {\n" +
"  const response = await apiRequest(`documents/${id}/settle`, null, \"POST\");\n" +
"  const data = await response.json();\n" +
"  console.log(\"reloadLedgerEvents result\", { id, data });\n" +
"  return data;\n" +
"}\n" +
"async function archiveDocument(id, unarchive = false) {\n" +
"  const body = { documents: [{ id }], unarchive };\n" +
"  const response = await apiRequest(\"documents/batch_archive\", body, \"POST\");\n" +
"  const responseData = await response?.json();\n" +
"  return responseData;\n" +
"}\n" +
"\n" +
"async function getLedgerEvents(id) {\n" +
"  const response = await apiRequest(`accountants/operations/${id}/ledger_events?per_page=-1`, null, \"GET\");\n" +
"  return await response.json();\n" +
"}\n" +
"Object.assign(window, { getLedgerEvents });\n" +
"async function getGroupedDocuments(id) {\n" +
"  const response = await apiRequest(`accountants/operations/${id}/grouped_documents?per_page=-1`, null, \"GET\");\n" +
"  return await response.json();\n" +
"}\n" +
"\n" +
"async function getThirdparty(id) {\n" +
"  const response = await apiRequest(`thirdparties/${id}`, null, \"GET\");\n" +
"  const json = await response?.json();\n" +
"  const [direction, thirdparty] = Object.entries(json)[0];\n" +
"  return { direction, thirdparty };\n" +
"}\n" +
"\n" +
"class Document extends Logger {\n" +
"  type;\n" +
"  id;\n" +
"  document;\n" +
"  groupedDocuments;\n" +
"  ledgerEvents;\n" +
"  thirdparty;\n" +
"  constructor({ id }) {\n" +
"    super();\n" +
"    this.id = id;\n" +
"  }\n" +
"  async getDocument() {\n" +
"    if (!this.document) {\n" +
"      this.document = getDocument(this.id);\n" +
"      this.document = await this.document;\n" +
"    }\n" +
"    return await this.document;\n" +
"  }\n" +
"  async getLedgerEvents() {\n" +
"    if (!this.ledgerEvents) {\n" +
"      this.ledgerEvents = this._loadLedgerEvents();\n" +
"    }\n" +
"    return await this.ledgerEvents;\n" +
"  }\n" +
"  async _loadLedgerEvents() {\n" +
"    const groupedDocuments = await this.getGroupedDocuments();\n" +
"    const events = await Promise.all(groupedDocuments.map(\n" +
"      (doc) => getLedgerEvents(doc.id)\n" +
"    ));\n" +
"    this.ledgerEvents = [].concat(...events);\n" +
"    return this.ledgerEvents;\n" +
"  }\n" +
"  async reloadLedgerEvents() {\n" +
"    delete this.ledgerEvents;\n" +
"    this.document = reloadLedgerEvents(this.id);\n" +
"    this.document = await this.document;\n" +
"    return this.document;\n" +
"  }\n" +
"  async archive(unarchive = false) {\n" +
"    return await archiveDocument(this.id, unarchive);\n" +
"  }\n" +
"  async unarchive() {\n" +
"    return await this.archive(true);\n" +
"  }\n" +
"  async getGroupedDocuments() {\n" +
"    if (!this.groupedDocuments)\n" +
"      this.groupedDocuments = this._loadGroupedDocuments();\n" +
"    return await this.groupedDocuments;\n" +
"  }\n" +
"  async _loadGroupedDocuments() {\n" +
"    const otherDocuments = await getGroupedDocuments(this.id);\n" +
"    const mainDocument = await this.getDocument();\n" +
"    this.groupedDocuments = [\n" +
"      ...otherDocuments,\n" +
"      mainDocument.grouped_documents.find((doc) => doc.id === this.id)\n" +
"    ];\n" +
"    return this.groupedDocuments;\n" +
"  }\n" +
"  async getThirdparty() {\n" +
"    if (!this.thirdparty)\n" +
"      this.thirdparty = this._getThirdparty();\n" +
"    return (await this.thirdparty).thirdparty;\n" +
"  }\n" +
"  async _getThirdparty() {\n" +
"    const doc = await this.getDocument();\n" +
"    return await getThirdparty(doc.thirdparty_id);\n" +
"  }\n" +
"}\n" +
"\n" +
"class ValidableDocument extends Document {\n" +
"  valid = null;\n" +
"  validMessage = null;\n" +
"  async getValidMessage() {\n" +
"    if (this.validMessage === null)\n" +
"      await this.loadValidation();\n" +
"    return this.validMessage;\n" +
"  }\n" +
"  async loadValidation() {\n" +
"    if (this.validMessage === null)\n" +
"      this.validMessage = await this.loadValidMessage();\n" +
"    this.valid = this.validMessage === \"OK\";\n" +
"  }\n" +
"  async isValid() {\n" +
"    if (this.valid === null)\n" +
"      await this.loadValidation();\n" +
"    return this.valid;\n" +
"  }\n" +
"  async getStatus() {\n" +
"    const id = this.id;\n" +
"    const valid = await this.isValid();\n" +
"    const message = await this.getValidMessage();\n" +
"    const doc = await this.getDocument();\n" +
"    const createdAt = new Date(doc.created_at).getTime();\n" +
"    return { id, valid, message, createdAt };\n" +
"  }\n" +
"  async reloadLedgerEvents() {\n" +
"    this.valid = null;\n" +
"    this.validMessage = null;\n" +
"    return super.reloadLedgerEvents();\n" +
"  }\n" +
"}\n" +
"\n" +
"async function getTransaction(id) {\n" +
"  const response = await apiRequest(`accountants/wip/transactions/${id}`, null, \"GET\");\n" +
"  return await response?.json();\n" +
"}\n" +
"async function getTransactionsList(params = {}) {\n" +
"  const searchParams = new URLSearchParams(params);\n" +
"  const url = `accountants/wip/transactions?${searchParams.toString()}`;\n" +
"  const response = await apiRequest(url, null, \"GET\");\n" +
"  return await response.json();\n" +
"}\n" +
"async function* getTransactionGenerator(params = {}) {\n" +
"  let page = Number(params.page) ?? 1;\n" +
"  do {\n" +
"    const data = await getTransactionsList(Object.assign({}, params, { page }));\n" +
"    const transactions = data.transactions;\n" +
"    if (!transactions?.length)\n" +
"      return;\n" +
"    for (const transaction of transactions)\n" +
"      yield transaction;\n" +
"    ++page;\n" +
"  } while (true);\n" +
"}\n" +
"\n" +
"class Transaction extends ValidableDocument {\n" +
"  _raw;\n" +
"  _transaction;\n" +
"  transaction;\n" +
"  constructor(raw) {\n" +
"    super(raw);\n" +
"    this._raw = raw;\n" +
"  }\n" +
"  async getTransaction() {\n" +
"    if (!this._transaction) {\n" +
"      this._transaction = getTransaction(this.id);\n" +
"      this.transaction = await this._transaction;\n" +
"    }\n" +
"    return await this._transaction;\n" +
"  }\n" +
"  async loadValidMessage() {\n" +
"    const isCurrent = this.id === Number(getParam(location.href, \"transaction_id\"));\n" +
"    if (isCurrent)\n" +
"      this.log(\"loadValidMessage\", this);\n" +
"    const ledgerEvents = await this.getLedgerEvents();\n" +
"    if (ledgerEvents.some((event) => event.closed))\n" +
"      return \"OK\";\n" +
"    const doc = await this.getDocument();\n" +
"    if (doc.archived)\n" +
"      return \"OK\";\n" +
"    const groupedDocuments = await this.getGroupedDocuments();\n" +
"    if (doc.label.includes(\" DE: STRIPE MOTIF: ALLODONS REF: \")) {\n" +
"      if (ledgerEvents.length !== 2 || groupedDocuments.length > 1 || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 || !ledgerEvents.find((ev) => ev.planItem.number === \"754110001\"))\n" +
"        return \"Virement Allodons mal attribu\\xE9\";\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (!doc.date.startsWith(\"2023\") && doc.label.toUpperCase().startsWith(\"VIR \")) {\n" +
"      if (doc.label.includes(\" DE: Stripe Technology Europe Ltd MOTIF: STRIPE \")) {\n" +
"        if (ledgerEvents.length !== 2 || groupedDocuments.length > 1 || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 || !ledgerEvents.find((ev) => ev.planItem.number === \"58000001\"))\n" +
"          return \"Virement interne Stripe mal attribu\\xE9\";\n" +
"        return \"OK\";\n" +
"      }\n" +
"      if (doc.label.includes(\" DE: ASS UNE LUMIERE POUR MILLE\")) {\n" +
"        if (ledgerEvents.length !== 2 || groupedDocuments.length > 1 || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0 || !ledgerEvents.find((ev) => ev.planItem.number === \"75411\"))\n" +
"          return \"Virement re\\xE7u d'une association mal attribu\\xE9\";\n" +
"        return \"OK\";\n" +
"      }\n" +
"      if (groupedDocuments.length < 2)\n" +
"        return \"Virement re\\xE7u sans justificatif\";\n" +
"      if (!groupedDocuments.find((gdoc) => gdoc.label.includes(\"CERFA\")))\n" +
"        return \"Les virements re\\xE7us doivent \\xEAtre justifi\\xE9s par un CERFA\";\n" +
"    }\n" +
"    if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"6571\"))) {\n" +
"      if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"6571\") && !line.label)) {\n" +
"        return `nom du b\\xE9n\\xE9ficiaire manquant dans l'\\xE9criture \"6571\"`;\n" +
"      }\n" +
"    } else {\n" +
"      for (const doc2 of groupedDocuments) {\n" +
"        if (doc2.type !== \"Invoice\")\n" +
"          continue;\n" +
"        const thirdparty = await new Document(doc2).getThirdparty();\n" +
"        if ([106438171, 114270419].includes(thirdparty.id)) {\n" +
"          return 'contrepartie \"6571\" manquante<br/>-&gt; envoyer la page \\xE0 David.';\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"    if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"445\")))\n" +
"      return \"Une \\xE9criture comporte un compte de TVA\";\n" +
"    const recent = Date.now() - new Date(doc.date).getTime() < 864e5 * 30;\n" +
"    if (!recent && !groupedDocuments.find((gdoc) => gdoc.id === doc.id)?.reconciled)\n" +
"      return \"Cette transaction n'est pas rattach\\xE9e \\xE0 un rapprochement bancaire\";\n" +
"    if (\n" +
"      // si justificatif demandé, sauter cette section\n" +
"      !doc.is_waiting_details || isCurrent\n" +
"    ) {\n" +
"      if (ledgerEvents.find((line) => line.planItem.number === \"6288\"))\n" +
"        return \"Une ligne d'\\xE9criture comporte le num\\xE9ro de compte 6288\";\n" +
"      if (ledgerEvents.find((line) => line.planItem.number === \"4716001\"))\n" +
"        return \"Une ligne d'\\xE9criture utilise un compte d'attente 4716001\";\n" +
"      if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"47\")))\n" +
"        return \"Une \\xE9criture comporte un compte d'attente (commen\\xE7ant par 47)\";\n" +
"      const third = ledgerEvents.find((line) => line.planItem.number.startsWith(\"40\"))?.planItem?.number;\n" +
"      if (third) {\n" +
"        const thirdEvents = ledgerEvents.filter((line) => line.planItem.number === third);\n" +
"        const balance2 = thirdEvents.reduce((sum, line) => sum + parseFloat(line.amount), 0);\n" +
"        if (this.id === Number(getParam(location.href, \"transaction_id\")))\n" +
"          this.log(\"loadValidMessage: Balance\", Math.abs(balance2) > 1e-3 ? \"d\\xE9s\\xE9quilibr\\xE9e\" : \"OK\", this);\n" +
"        if (Math.abs(balance2) > 1e-3) {\n" +
"          return `Balance d\\xE9s\\xE9quilibr\\xE9e: ${balance2}`;\n" +
"        }\n" +
"      }\n" +
"      const balance = groupedDocuments.reduce((acc, gdoc) => {\n" +
"        const isTransaction = gdoc.type === \"Transaction\";\n" +
"        const isCheque = doc.label.startsWith(\"CHEQUE \") || doc.label.startsWith(\"REMISE CHEQUE \");\n" +
"        const isDonation = parseFloat(doc.amount) > 0;\n" +
"        const coeff = isTransaction ? (isDonation ? -1 : 1) * (isCheque ? 2 : 1) : 1;\n" +
"        const value = parseFloat(gdoc.currency_amount ?? gdoc.amount);\n" +
"        if (isCurrent)\n" +
"          this.log({ isTransaction, isCheque, isDonation, coeff, acc, value });\n" +
"        return acc + coeff * value;\n" +
"      }, 0);\n" +
"      if (Math.abs(balance) > 1e-3) {\n" +
"        return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Balance%20v2\"\n" +
"        >Balance v2 d\\xE9s\\xE9quilibr\\xE9e: ${balance} \\u24D8</a>`;\n" +
"      }\n" +
"      if (Math.abs(parseFloat(doc.currency_amount)) < 100)\n" +
"        return \"OK\";\n" +
"      if (doc.date.startsWith(\"2023\"))\n" +
"        return \"OK\";\n" +
"      const attachmentOptional = Math.abs(parseFloat(doc.currency_amount)) < 100 || [\n" +
"        \" DE: STRIPE MOTIF: ALLODONS REF: \"\n" +
"      ].some((label) => doc.label.includes(label)) || [\n" +
"        \"REMISE CHEQUE \",\n" +
"        \"VIR RECU \",\n" +
"        \"VIR INST RE \",\n" +
"        \"VIR INSTANTANE RECU DE: \"\n" +
"      ].some((label) => doc.label.startsWith(label));\n" +
"      const attachmentRequired = doc.attachment_required && !doc.attachment_lost && (!attachmentOptional || isCurrent);\n" +
"      const hasAttachment = groupedDocuments.length > 1;\n" +
"      if (isCurrent)\n" +
"        this.log({ attachmentOptional, attachmentRequired, groupedDocuments, hasAttachment });\n" +
"      if (attachmentRequired && !hasAttachment)\n" +
"        return \"Justificatif manquant\";\n" +
"    }\n" +
"    return \"OK\";\n" +
"  }\n" +
"  /** Add item to this transaction's group */\n" +
"  async groupAdd(id) {\n" +
"    const doc = await this.getDocument();\n" +
"    const groups = doc.group_uuid;\n" +
"    await documentMatching({ id, groups });\n" +
"  }\n" +
"}\n" +
"\n" +
"class ValidMessage extends Service {\n" +
"  transaction;\n" +
"  ledgerEvents = [];\n" +
"  message = \"\\u27F3\";\n" +
"  async init() {\n" +
"    await waitElem(\"h3\", \"Transactions\");\n" +
"    await waitElem(\".paragraph-body-m+.heading-page.mt-1\");\n" +
"    document.addEventListener(\"keydown\", (event) => {\n" +
"      if (findElem(\"h3\", \"Transactions\") && event.ctrlKey && event.key === \"s\") {\n" +
"        event.preventDefault();\n" +
"        delete this.transaction;\n" +
"      }\n" +
"    });\n" +
"    while (await waitFunc(async () => !await this.isSync())) {\n" +
"      await this.loadMessage();\n" +
"    }\n" +
"  }\n" +
"  async loadMessage() {\n" +
"    this.log(\"loadMessage\", this);\n" +
"    this.message = \"\\u27F3\";\n" +
"    this.displayHeadband();\n" +
"    const rawTransaction = getReactProps($(\".paragraph-body-m+.heading-page.mt-1\"), 9).transaction;\n" +
"    this.transaction = new Transaction(rawTransaction);\n" +
"    this.message = await this.transaction.getValidMessage();\n" +
"    this.message = `${await this.transaction.isValid() ? \"\\u2713\" : \"\\u2717\"} ${this.message}`;\n" +
"    this.displayHeadband();\n" +
"  }\n" +
"  async isSync() {\n" +
"    const ledgerEvents = $$(\"form[name^=DocumentEntries-]\").reduce((events, form) => {\n" +
"      const formEvents = getReactProps(form.parentElement, 3)?.initialValues.ledgerEvents;\n" +
"      return [...events, ...formEvents];\n" +
"    }, []);\n" +
"    if (ledgerEvents.some((event, id) => this.ledgerEvents[id] !== event)) {\n" +
"      const logData = { oldEvents: this.ledgerEvents };\n" +
"      this.ledgerEvents = ledgerEvents;\n" +
"      this.log(\"desynchronis\\xE9\", { ...logData, ...this });\n" +
"      return false;\n" +
"    }\n" +
"    const current = Number(getParam(location.href, \"transaction_id\"));\n" +
"    if (current && current !== this.transaction?.id) {\n" +
"      this.log(\"transaction desynchronis\\xE9e\", { current, ...this });\n" +
"      return false;\n" +
"    }\n" +
"    return true;\n" +
"  }\n" +
"  async displayHeadband() {\n" +
"    if (!$(\".headband-is-valid\")) {\n" +
"      const detailTab = $(\"aside div\");\n" +
"      detailTab?.insertBefore(parseHTML(`\n" +
"        <div><div class=\"headband-is-valid\"></div></div>\n" +
"      `), detailTab.firstChild);\n" +
"    }\n" +
"    const headband = $(\".headband-is-valid\");\n" +
"    if (!headband)\n" +
"      return;\n" +
"    headband.innerHTML = `${this.getTransactionId()}${this.message}`;\n" +
"  }\n" +
"  getTransactionId() {\n" +
"    if (!this.transaction?.id)\n" +
"      return \"\";\n" +
"    return `<span class=\"transaction-id d-inline-block bg-secondary-100 dihsuQ px-0_5\">#${this.transaction.id}</span> `;\n" +
"  }\n" +
"}\n" +
"\n" +
"class TransactionAddByIdButton extends Service {\n" +
"  transaction;\n" +
"  async init() {\n" +
"    if ($(\".add-by-id-btn\"))\n" +
"      return;\n" +
"    const button = await Promise.race([\n" +
"      waitElem(\"button\", \"Voir plus de factures\"),\n" +
"      waitElem(\"button\", \"Chercher parmi les factures\")\n" +
"    ]);\n" +
"    const div = button.closest(\".mt-2\");\n" +
"    if (!div) {\n" +
"      this.log(\"TransactionAddByIdButton\", { button, div });\n" +
"      throw new Error(\"Impossible de trouver le bloc de boutons\");\n" +
"    }\n" +
"    div.insertBefore(\n" +
"      parseHTML('<div class=\"btn-sm w-100 btn-primary add-by-id-btn\" style=\"cursor: pointer;\">Ajouter par ID</div>'),\n" +
"      div.lastElementChild\n" +
"    );\n" +
"    $(\".add-by-id-btn\").addEventListener(\"click\", () => {\n" +
"      this.addById();\n" +
"    });\n" +
"    await waitFunc(() => !$(\".add-by-id-btn\"));\n" +
"    setTimeout(() => this.init(), 0);\n" +
"  }\n" +
"  async addById() {\n" +
"    getParam(location.href, \"transaction_id\");\n" +
"    const id = Number(prompt(\"ID du justificatif ?\"));\n" +
"    const transaction = await this.getTransaction();\n" +
"    await transaction.groupAdd(id);\n" +
"  }\n" +
"  async getTransaction() {\n" +
"    const id = Number(getParam(location.href, \"transaction_id\"));\n" +
"    if (this.transaction?.id !== id) {\n" +
"      this.transaction = new Transaction(await getTransaction(id));\n" +
"    }\n" +
"    return this.transaction;\n" +
"  }\n" +
"}\n" +
"\n" +
"async function getInvoice(id) {\n" +
"  if (!id)\n" +
"    throw new Error(`Error: getInvoice() invalid id: ${id}`);\n" +
"  const response = await apiRequest(`accountants/invoices/${id}`, null, \"GET\");\n" +
"  if (!response)\n" +
"    return null;\n" +
"  const data = await response.json();\n" +
"  return data.invoice;\n" +
"}\n" +
"async function updateInvoice(id, data) {\n" +
"  const response = await apiRequest(`/accountants/invoices/${id}`, { invoice: data }, \"PUT\");\n" +
"  const responseData = await response?.json();\n" +
"  return responseData;\n" +
"}\n" +
"async function getInvoicesList(params = {}) {\n" +
"  if (!params.direction)\n" +
"    throw new Error(\"params.direction is mandatory\");\n" +
"  const searchParams = new URLSearchParams(params);\n" +
"  if (!searchParams.has(\"filter\"))\n" +
"    searchParams.set(\"filter\", \"[]\");\n" +
"  const url = `accountants/invoices/list?${searchParams.toString()}`;\n" +
"  const response = await apiRequest(url, null, \"GET\");\n" +
"  return await response?.json();\n" +
"}\n" +
"async function* getInvoiceGenerator(params = {}) {\n" +
"  let page = Number(params.page) ?? 1;\n" +
"  do {\n" +
"    const data = await getInvoicesList(Object.assign({}, params, { page }));\n" +
"    const invoices = data.invoices;\n" +
"    if (!invoices?.length)\n" +
"      return;\n" +
"    for (const invoice of invoices)\n" +
"      yield invoice;\n" +
"    ++page;\n" +
"  } while (true);\n" +
"}\n" +
"\n" +
"class Cache extends Logger {\n" +
"  storageKey;\n" +
"  data;\n" +
"  constructor(key, initialValue) {\n" +
"    super();\n" +
"    this.storageKey = key;\n" +
"    this.data = initialValue;\n" +
"    this.load();\n" +
"    this.log(\"new Cache\", this);\n" +
"    this.follow();\n" +
"  }\n" +
"  /**\n" +
"   * stringify data for storage\n" +
"   */\n" +
"  stringify(value) {\n" +
"    return JSON.stringify(value);\n" +
"  }\n" +
"  /**\n" +
"   * Load data from localStorage\n" +
"   */\n" +
"  load() {\n" +
"    try {\n" +
"      this.data = this.parse(localStorage.getItem(this.storageKey));\n" +
"      this.emit(\"loadend\", this);\n" +
"    } catch (_error) {\n" +
"    }\n" +
"  }\n" +
"  /**\n" +
"   * Save data to localStorage\n" +
"   */\n" +
"  save(data) {\n" +
"    if (data) {\n" +
"      this.parse(this.stringify(data));\n" +
"      this.data = data;\n" +
"    }\n" +
"    localStorage.setItem(this.storageKey, this.stringify(this.data));\n" +
"    this.emit(\"saved\", this);\n" +
"  }\n" +
"  /**\n" +
"   * Follow storage change from other Browser pages\n" +
"   */\n" +
"  follow() {\n" +
"    window.addEventListener(\"storage\", (event) => {\n" +
"      if (event.storageArea !== localStorage || event.key !== this.storageKey)\n" +
"        return;\n" +
"      try {\n" +
"        this.data = this.parse(event.newValue);\n" +
"        this.emit(\"change\", this);\n" +
"      } catch (error) {\n" +
"        this.log(\"storage event error\", { error, value: event.newValue });\n" +
"      }\n" +
"    });\n" +
"  }\n" +
"}\n" +
"\n" +
"class CacheList extends Cache {\n" +
"  static instances = {};\n" +
"  static getInstance(storageKey) {\n" +
"    if (!this.instances[storageKey]) {\n" +
"      this.instances[storageKey] = new this(storageKey);\n" +
"    }\n" +
"    return this.instances[storageKey];\n" +
"  }\n" +
"  constructor(key, initialValue = []) {\n" +
"    super(key, initialValue);\n" +
"  }\n" +
"  parse(data) {\n" +
"    const value = JSON.parse(data);\n" +
"    if (!Array.isArray(value))\n" +
"      throw new Error(\"The given value does not parse as an Array.\");\n" +
"    return value;\n" +
"  }\n" +
"  /**\n" +
"   * Returns the cached elements that match the condition specified\n" +
"   */\n" +
"  filter(match) {\n" +
"    this.load();\n" +
"    return this.data.filter(\n" +
"      (item) => Object.entries(match).every(\n" +
"        ([key, value]) => item[key] === value\n" +
"      )\n" +
"    );\n" +
"  }\n" +
"  /**\n" +
"   * Returns the first cached element that match condition, and undefined\n" +
"   * otherwise.\n" +
"   */\n" +
"  find(match) {\n" +
"    this.load();\n" +
"    return this.data.find(\n" +
"      (item) => Object.entries(match).every(\n" +
"        ([key, value]) => item[key] === value\n" +
"      )\n" +
"    );\n" +
"  }\n" +
"  /**\n" +
"   * delete one item\n" +
"   *\n" +
"   * @return Deleted item if found\n" +
"   */\n" +
"  delete(match) {\n" +
"    this.load();\n" +
"    const found = this.find(match);\n" +
"    if (!found)\n" +
"      return null;\n" +
"    this.data.splice(this.data.indexOf(found), 1);\n" +
"    this.emit(\"delete\", { old: found });\n" +
"    this.save();\n" +
"    this.emit(\"change\", this);\n" +
"    return found;\n" +
"  }\n" +
"  /**\n" +
"   * clear all data\n" +
"   */\n" +
"  clear() {\n" +
"    this.data.length = 0;\n" +
"    this.emit(\"clear\", this);\n" +
"    this.save();\n" +
"    this.emit(\"change\", this);\n" +
"    return this;\n" +
"  }\n" +
"  /**\n" +
"   * Update one item\n" +
"   *\n" +
"   * @return Old value\n" +
"   */\n" +
"  updateItem(match, value) {\n" +
"    this.load();\n" +
"    const item = this.find(match);\n" +
"    if (item) {\n" +
"      this.data.splice(this.data.indexOf(item), 1, value);\n" +
"      this.emit(\"update\", { old: item, new: value });\n" +
"    } else {\n" +
"      this.data.push(value);\n" +
"      this.emit(\"add\", { new: value });\n" +
"    }\n" +
"    this.save();\n" +
"    this.emit(\"change\", this);\n" +
"    return item;\n" +
"  }\n" +
"  /**\n" +
"   * Calls the specified callback function for all the elements in an array.\n" +
"   * The return value of the callback function is the accumulated result,\n" +
"   * and is provided as an argument in the next call to the callback function.\n" +
"   */\n" +
"  reduce(cb, startingValue) {\n" +
"    this.load();\n" +
"    return this.data.reduce(cb, startingValue);\n" +
"  }\n" +
"}\n" +
"\n" +
"class CacheListRecord extends CacheList {\n" +
"  /**\n" +
"   * Update one item\n" +
"   *\n" +
"   * @return Old value\n" +
"   */\n" +
"  updateItem(match, newValue) {\n" +
"    const oldValue = this.find(match);\n" +
"    if (oldValue) {\n" +
"      newValue = { ...oldValue, ...newValue };\n" +
"      this.data.splice(this.data.indexOf(oldValue), 1, newValue);\n" +
"      this.emit(\"update\", { oldValue, newValue });\n" +
"    } else {\n" +
"      this.data.push(newValue);\n" +
"      this.emit(\"add\", { newValue });\n" +
"    }\n" +
"    this.save();\n" +
"    this.emit(\"change\", this);\n" +
"    return oldValue;\n" +
"  }\n" +
"}\n" +
"\n" +
"function openInTab(url) {\n" +
"  document.body.appendChild(\n" +
"    parseHTML(`<div class=\"open_tab\" data-url=\"${escape(url)}\" style=\"display: none;\"></div>`)\n" +
"  );\n" +
"}\n" +
"\n" +
"function openDocument(documentId) {\n" +
"  const url = new URL(location.href.replace(/accountants.*$/, `documents/${documentId}.html`));\n" +
"  openInTab(url.toString());\n" +
"}\n" +
"\n" +
"function uniquid(length = 20) {\n" +
"  const chars = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789\";\n" +
"  let id = \"\";\n" +
"  for (let i = 0; i < length; i++) {\n" +
"    id += chars.charAt(Math.floor(Math.random() * chars.length));\n" +
"  }\n" +
"  return id;\n" +
"}\n" +
"\n" +
"class Tooltip {\n" +
"  id = `T${uniquid()}`;\n" +
"  target;\n" +
"  constructor({ target }) {\n" +
"    this.target = target;\n" +
"    this.createContainer();\n" +
"    setInterval(() => {\n" +
"      this.setPos();\n" +
"    }, 200);\n" +
"  }\n" +
"  static make({ target, text }) {\n" +
"    const tooltip = new Tooltip({ target });\n" +
"    if (text)\n" +
"      tooltip.setText(text);\n" +
"    return tooltip;\n" +
"  }\n" +
"  /**\n" +
"   * Create the tooltip DOM and append it to the page\n" +
"   */\n" +
"  createContainer() {\n" +
"    document.body.appendChild(parseHTML(`<div\n" +
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
"    this.target.setAttribute(\"aria-labelledby\", this.id);\n" +
"    this.target.addEventListener(\"mouseenter\", () => {\n" +
"      $(`#${this.id}`).style.display = \"unset\";\n" +
"    });\n" +
"    this.target.addEventListener(\"mouseleave\", () => {\n" +
"      $(`#${this.id}`).style.display = \"none\";\n" +
"    });\n" +
"  }\n" +
"  /**\n" +
"   * Set the text for the tooltip\n" +
"   */\n" +
"  setText(text, html = false) {\n" +
"    const inner = $(`#${this.id} .tooltip-inner`);\n" +
"    if (!inner)\n" +
"      throw new Error(\"Unable to find tooltip container\");\n" +
"    if (html) {\n" +
"      inner.innerHTML = text;\n" +
"    } else {\n" +
"      inner.innerText = text;\n" +
"    }\n" +
"  }\n" +
"  /**\n" +
"   * Move the tooltip at good position to point visually the target\n" +
"   */\n" +
"  setPos() {\n" +
"    const tooltip = $(`#${this.id}`);\n" +
"    const arrow = $(\".arrow\", tooltip);\n" +
"    if (tooltip.style.display === \"none\")\n" +
"      return;\n" +
"    const targetRect = this.target.getBoundingClientRect();\n" +
"    const tooltipRect = tooltip.getBoundingClientRect();\n" +
"    const arrowRect = arrow.getBoundingClientRect();\n" +
"    const targetWidth = targetRect.right - targetRect.left;\n" +
"    const tooltipWidth = tooltipRect.right - tooltipRect.left;\n" +
"    const arrowWidth = arrowRect.right - arrowRect.left;\n" +
"    const arrowTransform = `translate(${Math.round(10 * (tooltipWidth / 2 - arrowWidth / 2)) / 10}px)`;\n" +
"    if (arrow.style.transform !== arrowTransform) {\n" +
"      arrow.style.transform = arrowTransform;\n" +
"    }\n" +
"    const tooltipTransform = `translate(${Math.round(10 * (targetRect.left + targetWidth / 2 - tooltipWidth / 2)) / 10}px, ${Math.round(10 * targetRect.bottom) / 10}px)`;\n" +
"    if (tooltip.style.transform !== tooltipTransform) {\n" +
"      tooltip.style.transform = tooltipTransform;\n" +
"    }\n" +
"  }\n" +
"}\n" +
"\n" +
"class CacheRecord extends Cache {\n" +
"  parse(data) {\n" +
"    const value = JSON.parse(data);\n" +
"    if (!value || typeof value !== \"object\")\n" +
"      throw new Error(\"The given value does not parse as an Object.\");\n" +
"    return value;\n" +
"  }\n" +
"  /**\n" +
"   * Returns the value of the specified key\n" +
"   */\n" +
"  get(key) {\n" +
"    return this.data[key];\n" +
"  }\n" +
"  /**\n" +
"   * Update one item\n" +
"   *\n" +
"   * @return Old value\n" +
"   */\n" +
"  set(key, valueOrCb) {\n" +
"    const oldValue = this.get(key);\n" +
"    const newValue = valueOrCb instanceof Function ? valueOrCb(oldValue) : valueOrCb;\n" +
"    this.data[key] = newValue;\n" +
"    this.emit(\"update\", { oldValue, newValue });\n" +
"    this.save();\n" +
"    this.emit(\"change\", this);\n" +
"    return oldValue;\n" +
"  }\n" +
"}\n" +
"\n" +
"class Autostarter extends Logger {\n" +
"  parent;\n" +
"  config;\n" +
"  eventList = [\"click\", \"keyup\", \"keydown\", \"keypress\", \"mouseup\"];\n" +
"  /**\n" +
"   * @property stopped Flag moved to true by the stop() method\n" +
"   */\n" +
"  stopped = false;\n" +
"  constructor(parent) {\n" +
"    super(`${parent}_Autostart`);\n" +
"    this.parent = parent;\n" +
"    this.config = new CacheRecord(`${this.parent.id}-autostart`, { enabled: true });\n" +
"    this.start = this.start.bind(this);\n" +
"    this.init();\n" +
"  }\n" +
"  /**\n" +
"   * Async init routines\n" +
"   */\n" +
"  async init() {\n" +
"    this.attachEvents();\n" +
"    this.appendDisableButton();\n" +
"  }\n" +
"  /**\n" +
"   * Attach interaction events to the browser page\n" +
"   */\n" +
"  attachEvents() {\n" +
"    this.eventList.forEach((event) => {\n" +
"      document.addEventListener(event, this.start);\n" +
"    });\n" +
"  }\n" +
"  /**\n" +
"   * Detach interaction events from the browser\n" +
"   */\n" +
"  detachEvents() {\n" +
"    this.eventList.forEach((event) => {\n" +
"      document.removeEventListener(event, this.start);\n" +
"    });\n" +
"  }\n" +
"  /**\n" +
"   * Add button for enabling / disabling this autostart behavior\n" +
"   */\n" +
"  appendDisableButton() {\n" +
"    const buttonId = `${this.parent.id}-autostart-enable-disable`;\n" +
"    this.parent.container.appendChild(parseHTML(`<button\n" +
"      type=\"button\"\n" +
"      class=\"sc-jwIPbr bxhmjB kzNmya justify-content-center btn btn-primary btn-sm\"\n" +
"      id=\"${buttonId}\"\n" +
"      style=\"font-family: initial;\"\n" +
"    ></button>`));\n" +
"    const button = $(`#${buttonId}`, this.parent.container);\n" +
"    const tooltip = Tooltip.make({ target: button });\n" +
"    button.addEventListener(\"click\", () => {\n" +
"      this.config.set(\"enabled\", (oldValue) => !oldValue);\n" +
"    });\n" +
"    let lastVal = null;\n" +
"    const setText = () => {\n" +
"      const enabled = this.config.get(\"enabled\");\n" +
"      if (enabled === lastVal)\n" +
"        return;\n" +
"      lastVal = enabled;\n" +
"      if (enabled) {\n" +
"        button.innerText = \"\\u23F9\";\n" +
"        tooltip.setText(\"Stopper l'ouverture automatique\");\n" +
"      } else {\n" +
"        button.innerText = \"\\u23F5\";\n" +
"        tooltip.setText(\"Activer l'ouverture automatique\");\n" +
"      }\n" +
"    };\n" +
"    setText();\n" +
"    this.config.on(\"change\", setText);\n" +
"    this.log(this, { button, tooltip });\n" +
"  }\n" +
"  /**\n" +
"   * Callback for autostart events\n" +
"   *\n" +
"   * `this` keyword is bounded at constructor\n" +
"   */\n" +
"  start() {\n" +
"    if (this.config.get(\"enabled\") && !this.stopped)\n" +
"      this.parent.start();\n" +
"  }\n" +
"  /**\n" +
"   * Stop all watchers\n" +
"   */\n" +
"  stop() {\n" +
"    this.stopped = true;\n" +
"    this.detachEvents();\n" +
"  }\n" +
"}\n" +
"\n" +
"class OpenNextInvalid extends Service {\n" +
"  container = document.createElement(\"div\");\n" +
"  autostart;\n" +
"  current;\n" +
"  invalidGenerator;\n" +
"  async init() {\n" +
"    this.log(\"init\");\n" +
"    this.start = this.start.bind(this);\n" +
"    this.current = Number(getParam(location.href, this.idParamName));\n" +
"    this.appendOpenNextButton();\n" +
"    this.allowIgnoring();\n" +
"    this.autostart = new Autostarter(this);\n" +
"    this.invalidGenerator = this.loadInvalid();\n" +
"    this.firstLoading();\n" +
"  }\n" +
"  /**\n" +
"   * Start action\n" +
"   *\n" +
"   * `this` keyword is bounded at constructor\n" +
"   */\n" +
"  start(interactionAllowed) {\n" +
"    this.autostart.stop();\n" +
"    setTimeout(() => this.openNext(interactionAllowed === true), 0);\n" +
"  }\n" +
"  /**\n" +
"   * Append the button for open next to the DOM\n" +
"   */\n" +
"  appendOpenNextButton() {\n" +
"    const number = this.cache.filter({ valid: false }).length;\n" +
"    const className = \"sc-jwIPbr kzNmya bxhmjB justify-content-center btn btn-primary btn-sm\";\n" +
"    this.container.appendChild(parseHTML(\n" +
"      `<button type=\"button\" class=\"${className} open-next-invalid-btn\">&nbsp;&gt;&nbsp;${number}</button>`\n" +
"    ));\n" +
"    const button = $(`.open-next-invalid-btn`, this.container);\n" +
"    button.addEventListener(\"click\", this.start.bind(this, true));\n" +
"    Tooltip.make({ target: button, text: \"Ouvrir le prochain \\xE9l\\xE9ment invalide\" });\n" +
"    this.cache.on(\"change\", () => {\n" +
"      const number2 = this.cache.filter({ valid: false }).length;\n" +
"      button.innerHTML = `&nbsp;&gt;&nbsp;${number2}`;\n" +
"    });\n" +
"  }\n" +
"  /**\n" +
"   * Create next invalid generator\n" +
"   */\n" +
"  async *loadInvalid() {\n" +
"    let cached = this.cache.filter({ valid: false });\n" +
"    for (const cachedItem of cached) {\n" +
"      const status = await this.updateStatus(cachedItem.id);\n" +
"      if (status?.valid === false && !status.ignored)\n" +
"        yield status;\n" +
"    }\n" +
"    for await (const item of this.walk()) {\n" +
"      const status = await this.updateStatus(item);\n" +
"      if (status?.valid === false)\n" +
"        yield status;\n" +
"    }\n" +
"    this.log(\"TODO: v\\xE9rifier les entr\\xE9es qui ont \\xE9t\\xE9 modifi\\xE9e r\\xE9cemment\");\n" +
"  }\n" +
"  /**\n" +
"   * Update status of an item given by its ID\n" +
"   */\n" +
"  async updateStatus(id, value) {\n" +
"    if (\"number\" !== typeof id) {\n" +
"      value = id;\n" +
"      id = value.id;\n" +
"    }\n" +
"    if (!value)\n" +
"      value = await this.getStatus(id);\n" +
"    if (!value) {\n" +
"      this.cache.delete({ id });\n" +
"      return null;\n" +
"    }\n" +
"    const oldStatus = this.cache.find({ id }) ?? {};\n" +
"    const status = Object.assign({}, oldStatus, value, { fetchedAt: Date.now() });\n" +
"    if (isNaN(status.createdAt)) {\n" +
"      this.log({ value, id, oldStatus, status });\n" +
"      throw new Error(\"status.createdAt must be number\");\n" +
"    }\n" +
"    this.cache.updateItem({ id }, status);\n" +
"    return status;\n" +
"  }\n" +
"  async openNext(interactionAllowed = false) {\n" +
"    this.log(\"openNext\");\n" +
"    let status = (await this.invalidGenerator.next()).value;\n" +
"    while (status?.id === this.current || status?.ignored) {\n" +
"      this.log({ status, current: this.current, class: this });\n" +
"      status = (await this.invalidGenerator.next()).value;\n" +
"    }\n" +
"    if (status) {\n" +
"      this.log(\"next found :\", { current: this.current, status, class: this });\n" +
"      openDocument(status.id);\n" +
"      return;\n" +
"    }\n" +
"    if (interactionAllowed && confirm(this.constructor.name + \": tous les \\xE9l\\xE9ments sont valides selon les param\\xE9tres actuels. Rev\\xE9rifier tout depuis le d\\xE9but ?\")) {\n" +
"      this.cache.clear();\n" +
"      this.invalidGenerator = this.loadInvalid();\n" +
"      return this.openNext(interactionAllowed);\n" +
"    }\n" +
"  }\n" +
"  async firstLoading() {\n" +
"    const storageKey = `${this.storageKey}-state`;\n" +
"    const currentVersion = window.GM_Pennylane_Version;\n" +
"    const state = JSON.parse(localStorage.getItem(storageKey) ?? \"{}\");\n" +
"    if (state.version !== currentVersion) {\n" +
"      this.cache.clear();\n" +
"      state.version = currentVersion;\n" +
"      state.loaded = false;\n" +
"      localStorage.setItem(storageKey, JSON.stringify(state));\n" +
"    }\n" +
"    if (state.loaded)\n" +
"      return;\n" +
"    this.walk();\n" +
"    for await (const item of this.walk())\n" +
"      await this.updateStatus(item);\n" +
"    state.loaded = true;\n" +
"    localStorage.setItem(storageKey, JSON.stringify(state));\n" +
"  }\n" +
"  allowIgnoring() {\n" +
"    const ignored = Boolean(this.cache.find({ id: this.current })?.ignored);\n" +
"    const className = \"sc-jwIPbr kzNmya bxhmjB justify-content-center btn btn-primary btn-sm\";\n" +
"    this.container.appendChild(parseHTML(`<button\n" +
"      type=\"button\"\n" +
"      class=\"${className} ignore-item\"\n" +
"      ${ignored ? 'style=\"background-color: var(--red);\"' : \"\"}\n" +
"    >x</button>`));\n" +
"    const button = $(`.ignore-item`, this.container);\n" +
"    Tooltip.make({ target: button, text: \"Ignorer cet \\xE9l\\xE9ment, ne plus afficher\" });\n" +
"    button.addEventListener(\"click\", () => {\n" +
"      const status = this.cache.find({ id: this.current });\n" +
"      if (!status)\n" +
"        return;\n" +
"      this.cache.updateItem({ id: this.current }, Object.assign(status, { ignored: !status.ignored }));\n" +
"    });\n" +
"    this.cache.on(\"change\", () => {\n" +
"      const ignored2 = Boolean(this.cache.find({ id: this.current })?.ignored);\n" +
"      const background = ignored2 ? \"var(--red)\" : \"\";\n" +
"      if (button.style.backgroundColor !== background)\n" +
"        button.style.backgroundColor = background;\n" +
"    });\n" +
"  }\n" +
"}\n" +
"\n" +
"class Invoice extends ValidableDocument {\n" +
"  type = \"invoice\";\n" +
"  invoice;\n" +
"  static from(invoice) {\n" +
"    if (invoice.direction === \"supplier\")\n" +
"      return new SupplierInvoice(invoice);\n" +
"    return new CustomerInvoice(invoice);\n" +
"  }\n" +
"  static async load(id) {\n" +
"    const invoice = await getInvoice(id);\n" +
"    if (!invoice?.id) {\n" +
"      console.log(\"Invoice.load: cannot load this invoice\", { id, invoice, _this: this });\n" +
"      return null;\n" +
"    }\n" +
"    return this.from(invoice);\n" +
"  }\n" +
"  async update(data) {\n" +
"    return await updateInvoice(this.id, data);\n" +
"  }\n" +
"  async getInvoice() {\n" +
"    if (!this.invoice) {\n" +
"      this.invoice = getInvoice(this.id).then((response) => {\n" +
"        if (!response)\n" +
"          throw new Error(\"Impossible de charger la facture\");\n" +
"        return response;\n" +
"      });\n" +
"    }\n" +
"    return this.invoice;\n" +
"  }\n" +
"}\n" +
"Object.assign(window, { Invoice });\n" +
"class SupplierInvoice extends Invoice {\n" +
"  direction = \"supplier\";\n" +
"  async loadValidMessage() {\n" +
"    const current = Number(getParam(location.href, \"id\"));\n" +
"    current === this.id;\n" +
"    const invoice = await this.getInvoice();\n" +
"    if (invoice.has_closed_ledger_events)\n" +
"      return \"OK\";\n" +
"    if (!invoice)\n" +
"      this.log(\"loadValidMessage\", { Invoice: this, invoice });\n" +
"    const doc = await this.getDocument();\n" +
"    if (invoice.id === current)\n" +
"      this.log(\"loadValidMessage\", this);\n" +
"    const groupedDocuments = await this.getGroupedDocuments();\n" +
"    const archivedAllowed = [\"\\xA7 #\", \"\\xA4 PIECE ETRANGERE\", \"\\xA4 TRANSACTION INTROUVABLE\", \"CHQ D\\xC9CHIR\\xC9\"];\n" +
"    if (invoice.archived) {\n" +
"      if (\n" +
"        //legacy :\n" +
"        !invoice.invoice_number.startsWith(\"\\xA4 CARTE ETRANGERE\") && !archivedAllowed.some((allowedItem) => invoice.invoice_number.startsWith(allowedItem))\n" +
"      )\n" +
"        return `<a\n" +
"          title=\"Le num\\xE9ro de facture d'une facture archiv\\xE9e doit commencer par une de ces possibilit\\xE9s. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"        >Facture archiv\\xE9e sans r\\xE9f\\xE9rence \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">${archivedAllowed.map((it) => `<li>${it}</li>`).join(\"\")}</ul>`;\n" +
"      if (invoice.id == current)\n" +
"        this.log(\"loadValidMessage\", \"archiv\\xE9 avec num\\xE9ro de facture correct\");\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (!invoice.thirdparty_id && !invoice.thirdparty) {\n" +
"      if (invoice.invoice_number.startsWith(\"CHQ D\\xC9CHIR\\xC9 - CHQ\")) {\n" +
"        return `<a\n" +
"            title=\"Archiver la facture : \\u205D > Archiver la facture.\n" +
"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"          >Archiver le ch\\xE8que d\\xE9chir\\xE9 \\u24D8</a></ul>`;\n" +
"      }\n" +
"      return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"        >Ajouter un fournisseur \\u24D8</a><ul style=\"margin:0;padding:0.8em;\"><li>CHQ D\\xC9CHIR\\xC9 - CHQ###</li></ul>`;\n" +
"    }\n" +
"    const thirdparty = await this.getThirdparty();\n" +
"    if (!thirdparty.thirdparty_invoice_line_rules?.[0]?.pnl_plan_item) {\n" +
"      return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Fournisseur%20inconnu\"\n" +
"        >Fournisseur inconnu \\u24D8</a>`;\n" +
"    }\n" +
"    if (invoice.invoice_lines?.some((line) => line.pnl_plan_item?.number == \"6288\"))\n" +
"      return \"compte tiers 6288\";\n" +
"    if (invoice.thirdparty_id === 98348455 && !invoice.invoice_number.includes(\"|TAXI|\")) {\n" +
"      return `<a\n" +
"        title=\"Le fournisseur 'TAXI' est trop souvent attribu\\xE9 aux ch\\xE8ques par Pennylane.\n" +
"Si le fournisseur est r\\xE9\\xE9lement 'TAXI' ajouter |TAXI| \\xE0 la fin du num\\xE9ro de facture.\n" +
"Cliquer ici pour plus d'informations\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20CHQ%20TAXI\"\n" +
"      >Ajouter le fournisseur \\u24D8</a><ul style=\"margin:0;padding:0.8em;\"><li>|TAXI|</li><li>CHQ#</li></ul>`;\n" +
"    }\n" +
"    const emptyDateAllowed = [\"CHQ\", \"CHQ D\\xC9CHIR\\xC9\"];\n" +
"    if ([106438171, 114270419, 106519227].includes(invoice.thirdparty?.id ?? 0) || emptyDateAllowed.some((item) => invoice.invoice_number?.startsWith(item))) {\n" +
"      if (invoice.date || invoice.deadline)\n" +
"        return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture\"\n" +
"        >Les dates doivent \\xEAtre vides \\u24D8</a>`;\n" +
"    } else if (!invoice.date) {\n" +
"      if (!emptyDateAllowed.some((item) => invoice.invoice_number?.startsWith(item))) {\n" +
"        const archiveLabel = archivedAllowed.find((label) => invoice.invoice_number.startsWith(label));\n" +
"        if (archiveLabel) {\n" +
"          return `<a\n" +
"            title=\"Archiver la facture : \\u205D > Archiver la facture.\n" +
"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"          >Archiver ${archiveLabel} \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">`;\n" +
"        }\n" +
"        return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture\"\n" +
"        >Date de facture vide \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">${emptyDateAllowed.map((it) => `<li>${it}</li>`).join(\"\")}</ul>`;\n" +
"      }\n" +
"    }\n" +
"    if (invoice.thirdparty?.name === \"AIDES OCTROY\\xC9ES\" && invoice.thirdparty.id !== 106438171)\n" +
"      return `Il ne doit y avoir qu'un seul compte \"AIDES OCTROY\\xC9ES\", et ce n'est pas le bon...`;\n" +
"    if (invoice.thirdparty?.name === \"PIECE ID\" && invoice.thirdparty.id !== 106519227)\n" +
"      return `Il ne doit y avoir qu'un seul compte \"PIECE ID\", et ce n'est pas le bon...`;\n" +
"    const ledgerEvents = await this.getLedgerEvents();\n" +
"    if (invoice.currency !== \"EUR\") {\n" +
"      const diffLine = ledgerEvents.find((line) => line.planItem.number === \"4716001\");\n" +
"      this.log({ ledgerEvents, diffLine });\n" +
"      if (diffLine) {\n" +
"        if (parseFloat(diffLine.amount) < 0)\n" +
"          return \"Les \\xE9carts de conversions de devises doivent utiliser le compte 756\";\n" +
"        else {\n" +
"          return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FLes%20%C3%A9carts%20de%20conversions%20de%20devises%20doivent%20utiliser%20le%20compte%20656\"\n" +
"          >Les \\xE9carts de conversions de devises doivent utiliser le compte 656 \\u24D8</a>`;\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"    if (invoice.thirdparty?.id === 115640202)\n" +
"      return \"OK\";\n" +
"    if (invoice.thirdparty?.id === 106519227) {\n" +
"      if (invoice.invoice_number?.startsWith(\"ID \"))\n" +
"        return \"OK\";\n" +
"      else\n" +
"        return `Le \"Num\\xE9ro de facture\" des pi\\xE8ces d'identit\\xE9 commence obligatoirement par \"ID \"`;\n" +
"    }\n" +
"    const transactions = groupedDocuments.filter((doc2) => doc2.type === \"Transaction\");\n" +
"    const documentDate = new Date(doc.date);\n" +
"    const day = 864e5;\n" +
"    const isRecent = Date.now() - documentDate.getTime() < 15 * day;\n" +
"    if (!isRecent && !transactions.length) {\n" +
"      const orphanAllowed = [\"\\xA4 TRANSACTION INTROUVABLE\"];\n" +
"      if (!orphanAllowed.some((label) => invoice.invoice_number.startsWith(label))) {\n" +
"        const archiveLabel = archivedAllowed.find((label) => invoice.invoice_number.startsWith(label));\n" +
"        if (archiveLabel) {\n" +
"          return `<a\n" +
"            title=\"Archiver la facture : \\u205D > Archiver la facture.\n" +
"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"          >Archiver ${archiveLabel} \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">`;\n" +
"        }\n" +
"        return `<a\n" +
"            title=\"Cliquer ici pour plus d'informations\"\n" +
"            href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e\"\n" +
"          >Pas de transaction attach\\xE9e \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">${orphanAllowed.concat(archivedAllowed).map((it) => `<li>${it}</li>`).join(\"\")}</ul>`;\n" +
"      }\n" +
"    }\n" +
"    return \"OK\";\n" +
"  }\n" +
"}\n" +
"class CustomerInvoice extends Invoice {\n" +
"  direction = \"customer\";\n" +
"  async loadValidMessage() {\n" +
"    const invoice = await this.getInvoice();\n" +
"    if (invoice.has_closed_ledger_events)\n" +
"      return \"OK\";\n" +
"    this.log(\"loadValidMessage\", { invoice });\n" +
"    if (invoice.archived) {\n" +
"      const allowed = [\"\\xA7 #\", \"\\xA4 TRANSACTION INTROUVABLE\"];\n" +
"      if (\n" +
"        //legacy\n" +
"        !invoice.invoice_number.startsWith(\"\\xA7 ESPECES\") && !allowed.some((allowedItem) => invoice.invoice_number.startsWith(allowedItem))\n" +
"      )\n" +
"        return `<a\n" +
"          title=\"Le num\\xE9ro de facture d'une facture archiv\\xE9e doit commencer par une de ces possibilit\\xE9s. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"        >Facture archiv\\xE9e sans r\\xE9f\\xE9rence \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">${allowed.map((it) => `<li>${it}</li>`).join(\"\")}</ul>`;\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (!invoice.thirdparty)\n" +
"      return 'choisir un \"client\"';\n" +
"    if (![113420582, 103165930].includes(invoice.thirdparty.id))\n" +
"      return 'les seuls clients autoris\\xE9s sont \"PIECE ID\" et \"DON MANUEL\"';\n" +
"    if (invoice.thirdparty.id === 113420582) {\n" +
"      if (!invoice.invoice_number?.startsWith(\"ID \"))\n" +
"        return 'le champ \"Num\\xE9ro de facture\" doit commencer par \"ID NOM_DE_LA_PERSONNE\"';\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (invoice.amount === \"0.0\")\n" +
"      return `<a\n" +
"      title=\"Cliquer ici pour plus d'informations.\"\n" +
"      href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client\"\n" +
"    >Ajouter le montant \\u24D8</a>`;\n" +
"    if (invoice.thirdparty_id === 103165930 && ![\"CHQ\", \"CERFA\"].some((label) => invoice.invoice_number.includes(label))) {\n" +
"      return `<a\n" +
"        title=\"Le num\\xE9ro de facture doit \\xEAtre conforme \\xE0 un des mod\\xE8les propos\\xE9s. Cliquer ici pour plus d'informations.\"\n" +
"        href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20Manuel%20-%20num%C3%A9ro%20de%20facture\"\n" +
"      >Informations manquantes dans le num\\xE9ro de facture \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">${[\n" +
"        \"CERFA n\\xB0### - Pr\\xE9nom Nom - JJ/MM/AAAA\",\n" +
"        \"CHQ - Pr\\xE9nom Nom - JJ/MM/AAAA\"\n" +
"      ].map((it) => `<li>${it}</li>`).join(\"\")}</ul>`;\n" +
"    }\n" +
"    const invoiceDocument = await this.getDocument();\n" +
"    const groupedOptional = [\"\\xA4 TRANSACTION INTROUVABLE\"];\n" +
"    const groupedDocuments = invoiceDocument.grouped_documents;\n" +
"    if (!groupedDocuments?.some((doc) => doc.type === \"Transaction\") && !groupedOptional.some((label) => invoice.invoice_number.startsWith(label)))\n" +
"      return `<a\n" +
"          title=\"Si la transaction est introuvable, mettre un des textes propos\\xE9s au d\\xE9but du num\\xE9ro de facture. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Pas%20de%20transaction%20attach%C3%A9e\"\n" +
"        >Pas de transaction attach\\xE9e \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">${groupedOptional.map((it) => `<li>${it}</li>`).join(\"\")}</ul>`;\n" +
"    if (invoice.date || invoice.deadline)\n" +
"      return `<a\n" +
"      title=\"Les dates des pi\\xE8ces orient\\xE9es client doivent toujours \\xEAtre vides. Cliquer ici pour plus d'informations\"\n" +
"      href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20client\"\n" +
"    >Les dates doivent \\xEAtre vides \\u24D8</a>`;\n" +
"    return \"OK\";\n" +
"  }\n" +
"}\n" +
"\n" +
"class NextInvalidInvoice extends OpenNextInvalid {\n" +
"  id = \"next-invalid-invoice\";\n" +
"  storageKey = \"InvoiceValidation\";\n" +
"  idParamName = \"id\";\n" +
"  cache;\n" +
"  async init() {\n" +
"    await this.appendContainer();\n" +
"    this.cache = CacheListRecord.getInstance(this.storageKey);\n" +
"    await super.init();\n" +
"  }\n" +
"  async *walk() {\n" +
"    for await (const status of this.walkInvoices(\"supplier\"))\n" +
"      yield status;\n" +
"    for await (const status of this.walkInvoices(\"customer\"))\n" +
"      yield status;\n" +
"  }\n" +
"  async *walkInvoices(direction) {\n" +
"    const max = this.cache.filter({ direction }).reduce((acc, status) => Math.max(status.createdAt, acc), 0);\n" +
"    if (max) {\n" +
"      const params2 = {\n" +
"        direction,\n" +
"        filter: JSON.stringify([{ field: \"created_at\", operator: \"gteq\", value: new Date(max).toISOString() }]),\n" +
"        sort: \"+created_at\"\n" +
"      };\n" +
"      for await (const invoice of getInvoiceGenerator(params2)) {\n" +
"        const status = await Invoice.from(invoice).getStatus();\n" +
"        yield { ...status, direction };\n" +
"      }\n" +
"    }\n" +
"    const min = this.cache.filter({ direction }).reduce((acc, status) => Math.min(status.createdAt, acc), 0);\n" +
"    const params = {\n" +
"      direction,\n" +
"      filter: JSON.stringify(\n" +
"        min ? [{ field: \"created_at\", operator: \"lteq\", value: new Date(min).toISOString() }] : []\n" +
"      ),\n" +
"      sort: \"-created_at\"\n" +
"    };\n" +
"    for await (const invoice of getInvoiceGenerator(params)) {\n" +
"      const status = await Invoice.from(invoice).getStatus();\n" +
"      yield { ...status, direction };\n" +
"    }\n" +
"  }\n" +
"  async getStatus(id) {\n" +
"    const invoice = await Invoice.load(id);\n" +
"    if (!invoice)\n" +
"      return null;\n" +
"    return await invoice.getStatus();\n" +
"  }\n" +
"  /** Add \"next invalid invoice\" button on invoices list */\n" +
"  async appendContainer() {\n" +
"    const ref = await waitElem(\"h4\", \"Ventilation\");\n" +
"    const nextButton = await waitElem(\"div>span+button+button:last-child\");\n" +
"    nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);\n" +
"    waitFunc(() => findElem(\"h4\", \"Ventilation\") !== ref).then(() => this.appendContainer());\n" +
"  }\n" +
"}\n" +
"\n" +
"class CacheStatus extends CacheListRecord {\n" +
"}\n" +
"\n" +
"class InvoiceDisplayInfos extends Service {\n" +
"  static instance;\n" +
"  storageKey = \"InvoiceValidation\";\n" +
"  cache;\n" +
"  state = {};\n" +
"  container;\n" +
"  static getInstance() {\n" +
"    if (!this.instance)\n" +
"      this.instance = new this();\n" +
"    return this.instance;\n" +
"  }\n" +
"  async init() {\n" +
"    await waitElem(\"h4\", \"Ventilation\");\n" +
"    this.cache = CacheStatus.getInstance(this.storageKey);\n" +
"    this.watch();\n" +
"  }\n" +
"  async watch() {\n" +
"    this.watchEventSave();\n" +
"    this.cache.on(\"change\", () => this.handleCacheChange());\n" +
"    while (await waitFunc(async () => !await this.isSync())) {\n" +
"      await this.setId();\n" +
"      await this.setMessage(\"\\u27F3\");\n" +
"      await this.loadMessage();\n" +
"    }\n" +
"  }\n" +
"  reload() {\n" +
"    this.state = {};\n" +
"  }\n" +
"  async isSync() {\n" +
"    const infos = await waitElem(\"h4.heading-section-3.mr-2\", \"Informations\");\n" +
"    const invoice = getReact(infos, 32).memoizedProps.invoice;\n" +
"    if (this.state.reactInvoice !== invoice) {\n" +
"      this.state.reactInvoice = invoice;\n" +
"      this.state.invoice = await Invoice.load(invoice.id);\n" +
"      return false;\n" +
"    }\n" +
"    const ledgerEvents = $$(\"form[name^=DocumentEntries-]\").reduce((events, form) => {\n" +
"      events.concat(getReactProps(form.parentElement, 3)?.initialValues.ledgerEvents);\n" +
"      return events;\n" +
"    }, []);\n" +
"    if (this.state.events?.length !== ledgerEvents.length || ledgerEvents.some((event) => this.state.events?.find((ev) => ev.id === event.id) !== event)) {\n" +
"      this.state.events = ledgerEvents;\n" +
"      return false;\n" +
"    }\n" +
"    return true;\n" +
"  }\n" +
"  async appendContainer() {\n" +
"    if (!this.container) {\n" +
"      this.container = parseHTML(`<div class=\"sc-iGgVNO clwwQL d-flex align-items-center gap-1 gm-tag-container\">\n" +
"        <div id=\"is-valid-tag\" class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">\\u27F3</div>\n" +
"        <div id=\"invoice-id\" class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\"></div>\n" +
"      </div>`).firstElementChild;\n" +
"      this.setId();\n" +
"    }\n" +
"    const infos = await waitElem(\"h4.heading-section-3.mr-2\", \"Informations\");\n" +
"    const tagsContainer = infos.nextSibling;\n" +
"    if (!tagsContainer)\n" +
"      throw new Error(\"InvoiceDisplayInfos: Impossible de trouver le bloc de tags\");\n" +
"    tagsContainer.insertBefore(this.container, tagsContainer.firstChild);\n" +
"  }\n" +
"  async loadMessage() {\n" +
"    this.log(\"load message\", this);\n" +
"    if (!this.state.invoice)\n" +
"      return this.setMessage(\"\\u27F3\");\n" +
"    const status = { ...await this.state.invoice.getStatus(), fetchedAt: Date.now() };\n" +
"    this.state.cachedStatus = status;\n" +
"    this.cache.updateItem({ id: status.id }, status);\n" +
"    const { message, valid } = status;\n" +
"    return this.setMessage(valid ? \"\\u2713\" : \"\\u2717 \" + message);\n" +
"  }\n" +
"  async setId() {\n" +
"    if (!this.container)\n" +
"      await this.appendContainer();\n" +
"    const tag = $(\"#invoice-id\", this.container);\n" +
"    if (!tag)\n" +
"      throw new Error('tag \"invoice-id\" introuvable');\n" +
"    tag.innerHTML = `#${this.state.invoice?.id}<a title=\"r\\xE9ouvrir cette pi\\xE8ce dans un nouvel onglet\" target=\"_blank\" href=\"${location.href.split(\"/\").slice(0, 5).join(\"/\")}/documents/${this.state.invoice?.id}.html\" ><svg class=\"MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mr-0_5 css-q7mezt\" focusable=\"false\" aria-hidden=\"true\" viewBox=\"0 0 24 24\" data-testid=\"OpenInNewRoundedIcon\" style=\"font-size: 1rem;\"><path d=\"M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h5c.55 0 1-.45 1-1s-.45-1-1-1H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55-.45 1-1 1M14 4c0 .55.45 1 1 1h2.59l-9.13 9.13c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L19 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1\"></path></svg></a>`;\n" +
"  }\n" +
"  async setMessage(message) {\n" +
"    await this.appendContainer();\n" +
"    const tag = $(\"#is-valid-tag\", this.container);\n" +
"    if (!tag)\n" +
"      throw new Error('tag \"is-valid-tag\" introuvable');\n" +
"    tag.innerHTML = message;\n" +
"  }\n" +
"  async watchEventSave() {\n" +
"    const ref = await waitElem(\"button\", \"Enregistrer\");\n" +
"    ref.addEventListener(\"click\", () => this.reload());\n" +
"    await waitFunc(() => findElem(\"button\", \"Enregistrer\") !== ref);\n" +
"    this.watchEventSave();\n" +
"  }\n" +
"  async handleCacheChange() {\n" +
"    if (!this.state.invoice)\n" +
"      return;\n" +
"    const cachedStatus = this.cache.find({ id: this.state.invoice.id });\n" +
"    const diff = [\"message\", \"valid\"].reduce((acc, key) => {\n" +
"      if (this.state.cachedStatus?.[key] !== cachedStatus?.[key])\n" +
"        acc.push({ key, oldValue: this.state.cachedStatus?.[key], newValue: cachedStatus?.[key] });\n" +
"      return acc;\n" +
"    }, []);\n" +
"    if (diff.length) {\n" +
"      this.reload();\n" +
"      this.log(\"handleCacheChange\", diff);\n" +
"    }\n" +
"  }\n" +
"}\n" +
"\n" +
"class ArchiveGroupedDocument extends Service {\n" +
"  async init() {\n" +
"    await waitElem(\"h3\", \"Transactions\");\n" +
"    while (await waitFunc(\n" +
"      () => $$(\"div>a+button>svg\").some((svg) => !svg.closest(\"div\")?.querySelector(\".archive-button\"))\n" +
"    ))\n" +
"      this.addInvoiceInfos();\n" +
"  }\n" +
"  addInvoiceInfos() {\n" +
"    const buttonsBlock = $$(\"div>a+button>svg\").find((svg) => !svg.closest(\"div\")?.querySelector(\".archive-button\"))?.closest(\"div\");\n" +
"    if (!buttonsBlock) {\n" +
"      this.log(\"addInvoiceInfos : no invoice found\");\n" +
"      return;\n" +
"    }\n" +
"    const buttonClass = buttonsBlock.querySelector(\"button\")?.className ?? \"\";\n" +
"    const id = getReactProps(buttonsBlock, 4).invoiceId;\n" +
"    buttonsBlock.insertBefore(\n" +
"      parseHTML(`<button class=\"archive-button ${buttonClass}\">&nbsp;x&nbsp;</button>`),\n" +
"      buttonsBlock.firstElementChild\n" +
"    );\n" +
"    buttonsBlock.querySelector(\".archive-button\").addEventListener(\"click\", async () => {\n" +
"      const invoice = await Invoice.load(id);\n" +
"      if (!invoice) {\n" +
"        alert(\"Impossible de trouver la facture #\" + id);\n" +
"        return;\n" +
"      }\n" +
"      const invoiceDoc = await invoice?.getInvoice();\n" +
"      const docs = await invoice.getGroupedDocuments();\n" +
"      const transactions = docs.filter((doc) => doc.type === \"Transaction\").map((doc) => `#${doc.id}`);\n" +
"      await invoice.update({\n" +
"        invoice_number: `\\xA7 ${transactions.join(\" - \")} - ${invoiceDoc.invoice_number}`\n" +
"      });\n" +
"      await invoice.archive();\n" +
"      buttonsBlock.closest(\".card\")?.remove();\n" +
"      this.log(`archive invoice #${id}`, { invoice });\n" +
"    });\n" +
"    upElement(buttonsBlock, 3).querySelector(\".flex-grow-1 .d-block:last-child\")?.appendChild(\n" +
"      parseHTML(\n" +
"        `&nbsp;<span class=\"invoice-id d-inline-block bg-secondary-100 dihsuQ px-0_5\">#${id}</span>`\n" +
"      )\n" +
"    );\n" +
"  }\n" +
"}\n" +
"\n" +
"class NextInvalidTransaction extends OpenNextInvalid {\n" +
"  id = \"next-invalid-transaction\";\n" +
"  storageKey = \"transactionValidation\";\n" +
"  idParamName = \"transaction_id\";\n" +
"  cache;\n" +
"  async init() {\n" +
"    await this.appendContainer();\n" +
"    this.cache = CacheStatus.getInstance(this.storageKey);\n" +
"    await super.init();\n" +
"  }\n" +
"  async *walk() {\n" +
"    const max = this.cache.reduce((acc, status) => Math.max(status.createdAt, acc), 0);\n" +
"    if (max) {\n" +
"      const params2 = {\n" +
"        filter: JSON.stringify([{ field: \"created_at\", operator: \"gteq\", value: new Date(max).toISOString() }]),\n" +
"        sort: \"+created_at\"\n" +
"      };\n" +
"      for await (const transaction of getTransactionGenerator(params2)) {\n" +
"        yield new Transaction(transaction).getStatus();\n" +
"      }\n" +
"    }\n" +
"    const min = this.cache.reduce((acc, status) => Math.min(status.createdAt, acc), 0);\n" +
"    const params = {\n" +
"      filter: JSON.stringify(\n" +
"        min ? [{ field: \"created_at\", operator: \"lteq\", value: new Date(min).toISOString() }] : []\n" +
"      ),\n" +
"      sort: \"-created_at\"\n" +
"    };\n" +
"    for await (const transaction of getTransactionGenerator(params)) {\n" +
"      yield new Transaction(transaction).getStatus();\n" +
"    }\n" +
"  }\n" +
"  async getStatus(id) {\n" +
"    const transaction = new Transaction(id);\n" +
"    return await transaction.getStatus();\n" +
"  }\n" +
"  /** Add \"next invalid transaction\" button on transactions list */\n" +
"  async appendContainer() {\n" +
"    const nextButton = await waitFunc(\n" +
"      () => findElem(\"div\", \"D\\xE9tails\")?.querySelector(\"button+button:last-child\") ?? false\n" +
"    );\n" +
"    nextButton.parentElement?.insertBefore(this.container, nextButton.previousElementSibling);\n" +
"    waitFunc(() => findElem(\"div\", \"D\\xE9tails\")?.querySelector(\"button+button:last-child\") !== nextButton).then(() => this.appendContainer());\n" +
"  }\n" +
"}\n" +
"\n" +
"class FixTab extends Service {\n" +
"  async init() {\n" +
"    await waitElem(\"h4\", \"Ventilation\");\n" +
"    document.addEventListener(\"keydown\", (event) => this.handleKeyDown(event));\n" +
"    this.watch();\n" +
"  }\n" +
"  handleKeyDown(event) {\n" +
"    if (event.code !== \"Tab\")\n" +
"      return;\n" +
"    const order = this.getOrder(event.target);\n" +
"    const toSelect = event.shiftKey ? order?.previous : order?.next;\n" +
"    if (!toSelect || !order)\n" +
"      return;\n" +
"    event.preventDefault();\n" +
"    event.stopPropagation();\n" +
"    const currentContainer = order.current.closest(\".show.dropdown\");\n" +
"    if (currentContainer)\n" +
"      currentContainer.classList.remove(\"show\");\n" +
"    const toSelectContainer = toSelect.closest(\".dropdown\");\n" +
"    if (toSelectContainer)\n" +
"      toSelectContainer.classList.add(\"show\");\n" +
"    toSelect.focus();\n" +
"    toSelect.setSelectionRange(0, toSelect.value.length);\n" +
"  }\n" +
"  getOrder(target) {\n" +
"    const orderList = this.getOrderList();\n" +
"    const currentSelector = orderList.find((selector) => $(selector) === target);\n" +
"    if (!currentSelector)\n" +
"      return null;\n" +
"    const searchList = orderList.slice(orderList.indexOf(currentSelector) + 1).concat(orderList.slice(0, orderList.indexOf(currentSelector)));\n" +
"    const nextSelector = searchList.find((selector) => $(selector));\n" +
"    const previousSelector = searchList.reverse().find((selector) => $(selector));\n" +
"    return {\n" +
"      current: $(currentSelector),\n" +
"      previous: previousSelector ? $(previousSelector) : null,\n" +
"      next: nextSelector ? $(nextSelector) : null\n" +
"    };\n" +
"  }\n" +
"  getOrderList() {\n" +
"    if (findElem(\"button\", \"Client\"))\n" +
"      return [\n" +
"        \".input-group-prepend+.input-group-append input\",\n" +
"        'input[name=\"invoice_number\"]',\n" +
"        'input[name=\"currency_amount\"]',\n" +
"        'input[placeholder=\"Rechercher\"]',\n" +
"        'input[name=\"date\"]',\n" +
"        'input[name=\"deadline\"]'\n" +
"      ];\n" +
"    return [\n" +
"      'input[name=\"invoice_number\"]',\n" +
"      \".input-group-prepend+.input-group-append input\",\n" +
"      'input[name=\"date\"]',\n" +
"      'input[name=\"deadline\"]',\n" +
"      'input[name=\"currency_amount\"]',\n" +
"      'input[name=\"currency_amount\"]+.input-group-append input[placeholder=\"Rechercher\"]'\n" +
"    ];\n" +
"  }\n" +
"  async watch() {\n" +
"    const ref = await waitElem('input[name=\"invoice_number\"]');\n" +
"    ref.focus();\n" +
"    waitFunc(() => $('input[name=\"invoice_number\"]') !== ref).then(() => this.watch());\n" +
"  }\n" +
"}\n" +
"\n" +
"class AllowChangeArchivedInvoiceNumber extends Service {\n" +
"  async init() {\n" +
"    await waitElem(\"h4\", \"Ventilation\");\n" +
"    this.watch();\n" +
"  }\n" +
"  async watch() {\n" +
"    document.addEventListener(\"keyup\", async (event) => {\n" +
"      if (event.code !== \"KeyS\" || !event.ctrlKey)\n" +
"        return;\n" +
"      this.log(\"Ctrl + S pressed\");\n" +
"      const invoiceNumberField = $(\"input[name=invoice_number]\");\n" +
"      if (event.target !== invoiceNumberField || !invoiceNumberField) {\n" +
"        this.log({ invoiceNumberField, eventTarget: event.target });\n" +
"        return;\n" +
"      }\n" +
"      event.preventDefault();\n" +
"      event.stopImmediatePropagation();\n" +
"      const rawInvoice = getReactProps(invoiceNumberField, 27).initialValues ?? // for supplier pieces\n" +
"      getReactProps(invoiceNumberField, 44).initialValues;\n" +
"      if (!rawInvoice.archived) {\n" +
"        this.log(\"Invoice is not archived\");\n" +
"        return;\n" +
"      }\n" +
"      const invoice = Invoice.from(rawInvoice);\n" +
"      await invoice.unarchive();\n" +
"      await invoice.update({ invoice_number: invoiceNumberField.value });\n" +
"      await invoice.archive();\n" +
"      InvoiceDisplayInfos.getInstance().reload();\n" +
"    });\n" +
"  }\n" +
"}\n" +
"\n" +
"class TransactionPanelHotkeys extends Service {\n" +
"  async init() {\n" +
"    document.addEventListener(\"keydown\", (event) => this.handleKeydown(event));\n" +
"  }\n" +
"  async handleKeydown(event) {\n" +
"    if (!findElem(\"h3\", \"Transactions\"))\n" +
"      return;\n" +
"    if (event.altKey) {\n" +
"      switch (event.code) {\n" +
"        case \"KeyE\":\n" +
"          return this.filterClick(\"Montant\", event);\n" +
"        case \"KeyD\":\n" +
"          return this.filterClick(\"Date\", event);\n" +
"      }\n" +
"    } else\n" +
"      switch (event.code) {\n" +
"        case \"NumpadEnter\":\n" +
"        case \"Enter\":\n" +
"          return this.manageEnter(event);\n" +
"      }\n" +
"  }\n" +
"  async filterClick(label, event) {\n" +
"    event.preventDefault();\n" +
"    const filterButton = $$(\"div.dropdown button\").find((button) => getReactProps(button, 1).label === label);\n" +
"    if (!filterButton)\n" +
"      this.log(`bouton \"${label}\" introuvable`);\n" +
"    if (event.shiftKey) {\n" +
"      $(\"div[aria-label=Effacer]\", filterButton)?.click();\n" +
"      return;\n" +
"    }\n" +
"    filterButton?.click();\n" +
"    const inputField = await waitElem(`input[aria-label=${label}]`, \"\", 2e3);\n" +
"    if (!inputField)\n" +
"      this.log(`champ \"input[aria-label=${label}]\" introuvable`);\n" +
"    inputField?.focus();\n" +
"  }\n" +
"  async manageEnter(event) {\n" +
"    if (event.srcElement instanceof HTMLInputElement && event.srcElement.getAttribute(\"aria-label\") === \"Date\") {\n" +
"      if (/\\d\\d\\/\\d\\d\\/\\d\\d\\d\\d - __\\/__\\/____/u.test(event.srcElement.value)) {\n" +
"        const date = event.srcElement.value.slice(0, 10);\n" +
"        event.srcElement.value = `${date} - ${date}`;\n" +
"        getReactProps(event.srcElement).onChange({ target: event.srcElement });\n" +
"        const validButton = $('button[data-tracking-action=\"Transactions Page - Date Filter click\"]');\n" +
"        await waitFunc(() => !validButton?.disabled);\n" +
"      }\n" +
"      return $('button[data-tracking-action=\"Transactions Page - Date Filter click\"]')?.click();\n" +
"    }\n" +
"  }\n" +
"}\n" +
"\n" +
"class EntryBlocInfos extends Service {\n" +
"  async init() {\n" +
"    const className = `${this.constructor.name}-managed`;\n" +
"    const selector = `form[name^=\"DocumentEntries-\"]:not(.${className})`;\n" +
"    while (true) {\n" +
"      const doc = await waitElem(selector);\n" +
"      doc.classList.add(className);\n" +
"      this.fill(doc);\n" +
"    }\n" +
"  }\n" +
"  /**\n" +
"   * Add infos on an entry bloc\n" +
"   */\n" +
"  fill(form) {\n" +
"    const id = form.getAttribute(\"name\")?.split(\"-\").pop();\n" +
"    const header = $(\"header\", form);\n" +
"    if (!header)\n" +
"      return;\n" +
"    const className = header.firstElementChild?.className ?? \"\";\n" +
"    header.insertBefore(parseHTML(`<div class=\"${className}\">\n" +
"      <span class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">#${id}</span>\n" +
"    </div>`), $(\".border-bottom\", header));\n" +
"  }\n" +
"}\n" +
"\n" +
"class AddInvoiceIdColumn extends Service {\n" +
"  name = this.constructor.name;\n" +
"  async init() {\n" +
"    await Promise.race([\n" +
"      waitElem(\"h3\", \"Factures fournisseurs\")\n" +
"    ]);\n" +
"    const anchor = await waitElem(\".tiny-caption\", \"Statut\");\n" +
"    const to = setTimeout(() => this.fill(anchor), 1e3);\n" +
"    await waitFunc(() => findElem(\".tiny-caption\", \"Statut\") !== anchor);\n" +
"    clearTimeout(to);\n" +
"    this.init();\n" +
"  }\n" +
"  fill(anchor) {\n" +
"    const table = anchor.closest(\"table\");\n" +
"    this.log(\"fill\", table);\n" +
"    const headRow = $(\"thead tr\", table);\n" +
"    $(\"th.id-column\", headRow)?.remove();\n" +
"    headRow?.insertBefore(parseHTML(`<th class=\"id-column th-element border-top-0 border-bottom-0 box-shadow-bottom-secondary-200 align-middle p-1 text-secondary-700 font-size-075 text-nowrap is-pinned\">\n" +
"      <div class=\"sc-ivxoEo dLrrKG d-flex flex-row sc-eSclpK dSYLCv\">\n" +
"        <span class=\"tiny-caption font-weight-bold\">ID</span>\n" +
"      </div>\n" +
"    </th>`), $(\"th+th\", headRow));\n" +
"    const bodyRows = $$(\"tbody tr\", table);\n" +
"    this.log({ bodyRows });\n" +
"    bodyRows.forEach((row) => {\n" +
"      const id = getReactProps(row, 1).data.id;\n" +
"      $(\".id-column\", row)?.remove();\n" +
"      row.insertBefore(\n" +
"        parseHTML(`<td style=\"cursor: auto;\" class=\"id-column px-1 py-0_5 align-middle border-top-0 box-shadow-bottom-secondary-100\">\n" +
"          <span class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">#${id}</span>\n" +
"        </td>`),\n" +
"        $(\"td+td\", row)\n" +
"      );\n" +
"      $(\".id-column\", row)?.addEventListener(\"click\", (e) => {\n" +
"        e.preventDefault();\n" +
"        e.stopPropagation();\n" +
"      });\n" +
"    });\n" +
"  }\n" +
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
"Object.assign(window, {\n" +
"  GM_Pennylane_Version: (\n" +
"    /** version **/\n" +
"    \"0.1.17\"\n" +
"  )\n" +
"});\n" +
""
+"})();";
try {
  unsafeWindow.eval(code);
  openTabService();
  console.log("GM SUCCESS");
} catch (error) {
  console.log("GM ERROR");
  console.log({ error, line: code.split("\n")[error.lineNumber - 1] });
}
