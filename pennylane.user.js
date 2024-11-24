// ==UserScript==
// @name     Pennylane
// @version  0.1.10
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
  });
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
"function jsonClone(obj) {\n" +
"  try {\n" +
"    return JSON.parse(JSON.stringify(obj));\n" +
"  } catch (error) {\n" +
"    console.log(\"unable to jsonClone this object\", obj);\n" +
"    console.log(error);\n" +
"    return obj;\n" +
"  }\n" +
"}\n" +
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
"let Service$1 = class Service {\n" +
"  static instance;\n" +
"  constructor() {\n" +
"    this.init();\n" +
"  }\n" +
"  static start() {\n" +
"    console.log(this.name, \"start\");\n" +
"    if (this.instance)\n" +
"      return;\n" +
"    this.instance = new this();\n" +
"  }\n" +
"  static getInstance() {\n" +
"    return this.instance;\n" +
"  }\n" +
"  init() {\n" +
"  }\n" +
"};\n" +
"\n" +
"let apiRequestWait = null;\n" +
"async function apiRequest(endpoint, data, method = \"POST\") {\n" +
"  if (apiRequestWait)\n" +
"    await apiRequestWait;\n" +
"  const response = await fetch(`https://app.pennylane.com/companies/21936866/${endpoint}`, {\n" +
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
"  return Object.entries(json)[0];\n" +
"}\n" +
"\n" +
"class Document {\n" +
"  type;\n" +
"  id;\n" +
"  document;\n" +
"  groupedDocuments;\n" +
"  ledgerEvents;\n" +
"  thirdparty;\n" +
"  constructor({ id }) {\n" +
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
"    return (await this.thirdparty)[1];\n" +
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
"class Transaction extends ValidableDocument {\n" +
"  transactionMin;\n" +
"  constructor(transactionOrId) {\n" +
"    const id = \"number\" === typeof transactionOrId ? transactionOrId : transactionOrId.id;\n" +
"    super({ id });\n" +
"    if (\"object\" === typeof transactionOrId)\n" +
"      this.transactionMin = transactionOrId;\n" +
"  }\n" +
"  async loadValidMessage() {\n" +
"    const isCurrent = this.id === Number(getParam(location.href, \"transaction_id\"));\n" +
"    if (isCurrent)\n" +
"      console.log(\"Transaction getValidMessage\", this);\n" +
"    const doc = await this.getDocument();\n" +
"    if (doc.label.toUpperCase().startsWith(\"VIR \") && !doc.label.includes(\" DE: STRIPE MOTIF: STRIPE REF: STRIPE-\")) {\n" +
"      return \"Virement re\\xE7u sans justificatif\";\n" +
"    }\n" +
"    if (doc.archived)\n" +
"      return \"OK\";\n" +
"    const ledgerEvents = await this.getLedgerEvents();\n" +
"    if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"6571\") && !line.label))\n" +
"      return `nom du b\\xE9n\\xE9ficiaire manquant dans l'\\xE9criture \"6571\"`;\n" +
"    if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"445\")))\n" +
"      return \"Une \\xE9criture comporte un compte de TVA\";\n" +
"    const recent = Date.now() - new Date(doc.date).getTime() < 864e5 * 30;\n" +
"    if (!recent && ledgerEvents.some((line) => line.planItem.number.startsWith(\"512\") && !line.reconciliation_id))\n" +
"      return \"Cette transaction n'est pas rattach\\xE9e \\xE0 un rapprochement bancaire\";\n" +
"    if (!doc.is_waiting_details || isCurrent) {\n" +
"      if (ledgerEvents.find((line) => line.planItem.number === \"6288\"))\n" +
"        return \"Une ligne d'\\xE9criture comporte le num\\xE9ro de compte 6288\";\n" +
"      if (ledgerEvents.find((line) => line.planItem.number === \"4716001\"))\n" +
"        return \"Une ligne d'\\xE9criture utilise un compte d'attente 4716001\";\n" +
"      if (ledgerEvents.some((line) => line.planItem.number.startsWith(\"41\")))\n" +
"        return \"Une \\xE9criture comporte un compte d'attente\";\n" +
"      const third = ledgerEvents.find((line) => line.planItem.number.startsWith(\"40\"))?.planItem?.number;\n" +
"      if (third) {\n" +
"        const thirdEvents = ledgerEvents.filter((line) => line.planItem.number === third);\n" +
"        const balance = thirdEvents.reduce((sum, line) => sum + parseFloat(line.amount), 0);\n" +
"        if (this.id === Number(getParam(location.href, \"transaction_id\")))\n" +
"          console.log(this.constructor.name, \"loadValidMessage: Balance\", Math.abs(balance) > 1e-3 ? \"d\\xE9s\\xE9quilibr\\xE9e\" : \"OK\", { third, thirdEvents, balance, ledgerEvents, [this.constructor.name]: this });\n" +
"        if (Math.abs(balance) > 1e-3) {\n" +
"          return `Balance d\\xE9s\\xE9quilibr\\xE9e: ${balance}`;\n" +
"        }\n" +
"      }\n" +
"      if (Math.abs(parseFloat(doc.currency_amount)) < 100)\n" +
"        return \"OK\";\n" +
"      const attachmentOptional = Math.abs(parseFloat(doc.currency_amount)) < 100 || [\n" +
"        \"REMISE CHEQUE \",\n" +
"        \"VIR RECU \",\n" +
"        \"VIR INST RE \",\n" +
"        \"VIR INSTANTANE RECU DE: \"\n" +
"      ].some((label) => doc.label.startsWith(label));\n" +
"      const attachmentRequired = doc.attachment_required && !doc.attachment_lost && (!attachmentOptional || isCurrent);\n" +
"      const groupedDocuments = await this.getGroupedDocuments();\n" +
"      const hasAttachment = groupedDocuments.length > 1;\n" +
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
"class ValidMessage extends Service$1 {\n" +
"  transaction;\n" +
"  events = [];\n" +
"  message = \"\\u27F3\";\n" +
"  async init() {\n" +
"    await waitElem(\"h3\", \"Transactions\");\n" +
"    await waitElem(\".paragraph-body-m+.heading-page.mt-1\");\n" +
"    while (await waitFunc(async () => !await this.isSync())) {\n" +
"      await this.loadMessage();\n" +
"    }\n" +
"  }\n" +
"  async loadMessage() {\n" +
"    console.log(this.constructor.name, \"loadMessage\", this);\n" +
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
"    if (ledgerEvents.some((event, id) => this.events[id] !== event)) {\n" +
"      const logData = { oldEvents: this.events };\n" +
"      this.events = ledgerEvents;\n" +
"      console.log(this.constructor.name, \"desynchronis\\xE9\", { ...logData, ...this });\n" +
"      return false;\n" +
"    }\n" +
"    const current = Number(getParam(location.href, \"transaction_id\"));\n" +
"    if (current && current !== this.transaction?.id) {\n" +
"      console.log(this.constructor.name, \"transaction desynchronis\\xE9e\", { current, ...this });\n" +
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
"\n" +
"class TransactionAddByIdButton extends Service$1 {\n" +
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
"      console.log(\"TransactionAddByIdButton\", { button, div });\n" +
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
"  const searchParams = new URLSearchParams(params);\n" +
"  if (!searchParams.has(\"filter\"))\n" +
"    searchParams.set(\"filter\", \"[]\");\n" +
"  const url = `accountants/invoices/list?${searchParams.toString()}`;\n" +
"  const response = await apiRequest(url, null, \"GET\");\n" +
"  return await response?.json();\n" +
"}\n" +
"\n" +
"let openInTabLaunched = false;\n" +
"function openInTab(url) {\n" +
"  if (openInTabLaunched)\n" +
"    console.error(\"openInTab already launched\");\n" +
"  openInTabLaunched = true;\n" +
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
"class Autostarter {\n" +
"  parent;\n" +
"  eventList = [\"click\", \"keyup\"];\n" +
"  stopped = false;\n" +
"  constructor(parent) {\n" +
"    this.parent = parent;\n" +
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
"      this.setConfig({ enabled: !this.getConfig().enabled });\n" +
"    });\n" +
"    let lastVal = null;\n" +
"    setInterval(() => {\n" +
"      const { enabled } = this.getConfig();\n" +
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
"    }, 200);\n" +
"    console.log(this.constructor.name, this, { button, tooltip });\n" +
"  }\n" +
"  /**\n" +
"   * Callback for autostart events\n" +
"   *\n" +
"   * `this` keyword is bounded at constructor\n" +
"   */\n" +
"  start() {\n" +
"    if (this.getConfig().enabled && !this.stopped)\n" +
"      this.parent.start();\n" +
"  }\n" +
"  /**\n" +
"   * Stop all watchers\n" +
"   */\n" +
"  stop() {\n" +
"    this.detachEvents();\n" +
"  }\n" +
"  /**\n" +
"   * Load config from localStorage\n" +
"   */\n" +
"  getConfig() {\n" +
"    const defaults = { enabled: true };\n" +
"    return Object.assign(\n" +
"      defaults,\n" +
"      JSON.parse(localStorage.getItem(`${this.parent.id}-autostart`) ?? \"{}\")\n" +
"    );\n" +
"  }\n" +
"  /**\n" +
"   * Set properties to this config and save it to localStorage\n" +
"   */\n" +
"  setConfig(settings = {}) {\n" +
"    localStorage.setItem(\n" +
"      `${this.parent.id}-autostart`,\n" +
"      JSON.stringify(Object.assign(this.getConfig(), settings))\n" +
"    );\n" +
"  }\n" +
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
"class Cache extends EventEmitter {\n" +
"  storageKey;\n" +
"  data;\n" +
"  constructor(key) {\n" +
"    super();\n" +
"    this.storageKey = key;\n" +
"    this.load();\n" +
"    console.log(\"new Cache\", this);\n" +
"  }\n" +
"  /**\n" +
"   * Load data from localStorage\n" +
"   */\n" +
"  load() {\n" +
"    this.data = JSON.parse(localStorage.getItem(this.storageKey) ?? \"[]\");\n" +
"    if (!Array.isArray(this.data))\n" +
"      this.data = [];\n" +
"    this.emit(\"loadend\", this.data);\n" +
"  }\n" +
"  /**\n" +
"   * Save data to localStorage\n" +
"   */\n" +
"  save() {\n" +
"    localStorage.setItem(this.storageKey, JSON.stringify(this.data));\n" +
"    this.emit(\"saved\", this.data);\n" +
"  }\n" +
"  /**\n" +
"   * Returns the cached elements that match the condition specified\n" +
"   */\n" +
"  filter(match) {\n" +
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
"    return this.data.find(\n" +
"      (item) => Object.entries(match).every(\n" +
"        ([key, value]) => item[key] === value\n" +
"      )\n" +
"    );\n" +
"  }\n" +
"  /**\n" +
"   * delete one item\n" +
"   */\n" +
"  delete(match) {\n" +
"    const found = this.find(match);\n" +
"    if (!found)\n" +
"      return;\n" +
"    this.data.splice(this.data.indexOf(found), 1);\n" +
"    this.emit(\"delete\", { old: found });\n" +
"    this.save();\n" +
"  }\n" +
"  /**\n" +
"   * clear all data\n" +
"   */\n" +
"  clear() {\n" +
"    this.data.length = 0;\n" +
"    this.save();\n" +
"    this.emit(\"clear\", this.data);\n" +
"  }\n" +
"  /**\n" +
"   * Update one item\n" +
"   */\n" +
"  updateItem(match, value) {\n" +
"    const item = this.find(match);\n" +
"    if (item) {\n" +
"      this.data.splice(this.data.indexOf(item), 1, value);\n" +
"      this.emit(\"update\", { old: item, new: value });\n" +
"    } else {\n" +
"      this.data.push(value);\n" +
"      this.emit(\"add\", { new: value });\n" +
"    }\n" +
"    this.save();\n" +
"    return value;\n" +
"  }\n" +
"  /**\n" +
"   * Calls the specified callback function for all the elements in an array.\n" +
"   * The return value of the callback function is the accumulated result,\n" +
"   * and is provided as an argument in the next call to the callback function.\n" +
"   */\n" +
"  reduce(cb, startingValue) {\n" +
"    return this.data.reduce(cb, startingValue);\n" +
"  }\n" +
"}\n" +
"\n" +
"class OpenNextInvalid extends Service$1 {\n" +
"  container = document.createElement(\"div\");\n" +
"  cache;\n" +
"  autostart;\n" +
"  current;\n" +
"  invalidGenerator;\n" +
"  async init() {\n" +
"    console.log(this.constructor.name, \"init\");\n" +
"    this.start = this.start.bind(this);\n" +
"    this.current = Number(getParam(location.href, this.idParamName));\n" +
"    this.cache = new Cache(this.storageKey);\n" +
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
"    const className = \"sc-jwIPbr kzNmya bxhmjB justify-content-center btn btn-primary btn-sm\";\n" +
"    this.container.appendChild(parseHTML(\n" +
"      `<button type=\"button\" class=\"${className} open-next-invalid-btn\">&nbsp;&gt;&nbsp;</button>`\n" +
"    ));\n" +
"    const button = $(`.open-next-invalid-btn`, this.container);\n" +
"    button.addEventListener(\"click\", this.start.bind(this, true));\n" +
"    Tooltip.make({ target: button, text: \"Ouvrir le prochain \\xE9l\\xE9ment invalide\" });\n" +
"    this.cache.on(\"saved\", () => {\n" +
"      const number = this.cache.filter({ valid: false }).length;\n" +
"      button.innerHTML = `&nbsp;&gt;&nbsp;${number}`;\n" +
"    });\n" +
"  }\n" +
"  /**\n" +
"   * Create next invalid generator\n" +
"   */\n" +
"  async *loadInvalid() {\n" +
"    let cached = this.cache.filter({ valid: false });\n" +
"    for (const cachedItem of cached) {\n" +
"      const status = await this.updateStatus(cachedItem.id);\n" +
"      if (status?.valid === false)\n" +
"        yield status;\n" +
"    }\n" +
"    const from = this.cache.reduce(\n" +
"      (acc, status) => Math.max(status.createdAt, acc),\n" +
"      0\n" +
"    );\n" +
"    const news = this.walk({\n" +
"      filter: JSON.stringify([{ field: \"created_at\", operator: \"gteq\", value: new Date(from).toISOString() }]),\n" +
"      sort: \"+created_at\"\n" +
"    });\n" +
"    let newItem = (await news.next()).value;\n" +
"    while (newItem) {\n" +
"      const status = await this.updateStatus(newItem);\n" +
"      if (status?.valid === false)\n" +
"        yield status;\n" +
"      newItem = (await news.next()).value;\n" +
"    }\n" +
"    const olds = this.walk({ sort: \"+created_at\" });\n" +
"    let oldItem = (await olds.next()).value;\n" +
"    while (oldItem) {\n" +
"      if (oldItem.createdAt >= from)\n" +
"        return;\n" +
"      const status = await this.updateStatus(oldItem);\n" +
"      if (status?.valid === false)\n" +
"        yield status;\n" +
"      oldItem = (await news.next()).value;\n" +
"    }\n" +
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
"    this.cache.updateItem({ id }, status);\n" +
"    return status;\n" +
"  }\n" +
"  async openNext(interactionAllowed = false) {\n" +
"    console.log(this.constructor.name, \"openNext\");\n" +
"    let status = (await this.invalidGenerator.next()).value;\n" +
"    while (status.id === this.current || status.ignored) {\n" +
"      console.log({ status, current: this.current, class: this });\n" +
"      status = (await this.invalidGenerator.next()).value;\n" +
"    }\n" +
"    if (!status && interactionAllowed) {\n" +
"      alert(this.constructor.name + \": tous les \\xE9l\\xE9ments sont valides selon les param\\xE9tres actuels\");\n" +
"      return;\n" +
"    }\n" +
"    console.log(this.constructor.name, \"next found :\", { current: this.current, status, class: this });\n" +
"    openDocument(status.id);\n" +
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
"    const from = this.cache.reduce((acc, status) => Math.max(status.createdAt, acc), 0);\n" +
"    const news = this.walk({\n" +
"      filter: JSON.stringify([{ field: \"created_at\", operator: \"gteq\", value: new Date(from).toISOString() }]),\n" +
"      sort: \"+created_at\"\n" +
"    });\n" +
"    let newItem = (await news.next()).value;\n" +
"    while (newItem) {\n" +
"      await this.updateStatus(newItem);\n" +
"      newItem = (await news.next()).value;\n" +
"    }\n" +
"    state.loaded = true;\n" +
"    localStorage.setItem(storageKey, JSON.stringify(state));\n" +
"  }\n" +
"  allowIgnoring() {\n" +
"    const className = \"sc-jwIPbr kzNmya bxhmjB justify-content-center btn btn-primary btn-sm\";\n" +
"    this.container.appendChild(parseHTML(\n" +
"      `<button type=\"button\" class=\"${className} ignore-item\">x</button>`\n" +
"    ));\n" +
"    const button = $(`.ignore-item`, this.container);\n" +
"    Tooltip.make({ target: button, text: \"Ignorer cet \\xE9l\\xE9ment, ne plus afficher\" });\n" +
"    button.addEventListener(\"click\", () => {\n" +
"      const status = this.cache.find({ id: this.current });\n" +
"      if (!status)\n" +
"        return;\n" +
"      this.cache.updateItem({ id: this.current }, Object.assign(status, { ignored: !status.ignored }));\n" +
"    });\n" +
"    setInterval(() => {\n" +
"      this.cache.load();\n" +
"      const ignored = Boolean(this.cache.find({ id: this.current })?.ignored);\n" +
"      const background = ignored ? \"var(--red)\" : \"\";\n" +
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
"      console.log(\"Invoice.load: cannot load this invoice\", { id, invoice });\n" +
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
"    const invoice = await this.getInvoice();\n" +
"    if (!invoice)\n" +
"      console.log(\"SupplierInvoice.loadValidMessage\", { invoice });\n" +
"    const invoiceDocument = await this.getDocument();\n" +
"    if (invoice.id === current)\n" +
"      console.log(\"SupplierInvoice.loadValidMessage\", { invoice, invoiceDocument });\n" +
"    const groupedDocuments = await this.getGroupedDocuments();\n" +
"    const transactions = groupedDocuments.filter((doc) => doc.type === \"Transaction\");\n" +
"    const currentYear = 2024;\n" +
"    if (transactions.length && transactions.every((transaction) => parseInt(transaction.date.slice(0, 4)) < currentYear)) {\n" +
"      if (invoice.id == current)\n" +
"        console.log(this.constructor.name, \"loadValidMessage\", \"ann\\xE9e pass\\xE9e\");\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (invoice.archived) {\n" +
"      const allowed = [\"\\xA7 #\", \"\\xA4 PIECE ETRANGERE\", \"\\xA4 TRANSACTION INTROUVABLE\"];\n" +
"      if (\n" +
"        //legacy :\n" +
"        !invoice.invoice_number.startsWith(\"\\xA4 CARTE ETRANGERE\") && !allowed.some((allowedItem) => invoice.invoice_number.startsWith(allowedItem))\n" +
"      )\n" +
"        return `<a\n" +
"          title=\"Le num\\xE9ro de facture d'une facture archiv\\xE9e doit commencer par une de ces possibilit\\xE9s. Cliquer ici pour plus d'informations.\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Facture%20archiv%C3%A9e\"\n" +
"        >Facture archiv\\xE9e sans r\\xE9f\\xE9rence \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">${allowed.map((it) => `<li>${it}</li>`).join(\"\")}</ul>`;\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (!invoice.thirdparty_id && !invoice.thirdparty)\n" +
"      return \"Ajouter un fournisseur\";\n" +
"    const thirdparty = await this.getThirdparty();\n" +
"    if (!thirdparty.thirdparty_invoice_line_rules?.[0]?.pnl_plan_item)\n" +
"      return \"Fournisseur inconnu : Chaque fournisseur doit \\xEAtre associ\\xE9 avec un compte de charge or celui-ci n'en a pas. Choisir un autre fournisseur ou envoyer cette page \\xE0 David ;).\";\n" +
"    if (invoice.invoice_lines?.some((line) => line.pnl_plan_item?.number == \"6288\"))\n" +
"      return \"compte tiers 6288\";\n" +
"    if (invoice.invoice_number?.startsWith(\"\\xA4\")) {\n" +
"      if (invoice.id == current)\n" +
"        console.log(\"\\xA4\");\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if ([106438171, 114270419, 106519227].includes(invoice.thirdparty?.id ?? 0)) {\n" +
"      if (invoice.date || invoice.deadline)\n" +
"        return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture\"\n" +
"        >Les dates doivent \\xEAtre vides \\u24D8</a>`;\n" +
"    } else if (!invoice.date) {\n" +
"      const emptyDateAllowed = [\"CHQ\"];\n" +
"      if (!emptyDateAllowed.some((item) => invoice.invoice_number?.startsWith(item)))\n" +
"        return `<a\n" +
"          title=\"Cliquer ici pour plus d'informations\"\n" +
"          href=\"obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Date%20de%20facture\"\n" +
"        >Date de facture vide \\u24D8</a><ul style=\"margin:0;padding:0.8em;\">${emptyDateAllowed.map((it) => `<li>${it}</li>`).join(\"\")}</ul>`;\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (invoice.thirdparty?.name === \"AIDES OCTROY\\xC9ES\" && invoice.thirdparty.id !== 106438171)\n" +
"      return `Il ne doit y avoir qu'un seul compte \"AIDES OCTROY\\xC9ES\", et ce n'est pas le bon...`;\n" +
"    if (invoice.thirdparty?.name === \"PIECE ID\" && invoice.thirdparty.id !== 106519227)\n" +
"      return `Il ne doit y avoir qu'un seul compte \"PIECE ID\", et ce n'est pas le bon...`;\n" +
"    const ledgerEvents = await this.getLedgerEvents();\n" +
"    if ([106438171, 114270419].includes(invoice.thirdparty?.id)) {\n" +
"      const lines = ledgerEvents.filter((event) => [\"6571\", \"6571002\"].includes(event.planItem.number));\n" +
"      if (!lines.length)\n" +
"        return '\\xE9criture \"6571\" manquante - envoyer la page \\xE0 David.';\n" +
"    }\n" +
"    if (invoice.currency !== \"EUR\") {\n" +
"      const diffLine = ledgerEvents.find((line) => line.planItem.number === \"4716001\");\n" +
"      console.log({ ledgerEvents, diffLine });\n" +
"      if (diffLine) {\n" +
"        if (parseFloat(diffLine.amount) < 0)\n" +
"          return \"Les \\xE9carts de conversions de devises doivent utiliser le compte 756\";\n" +
"        else\n" +
"          return \"Les \\xE9carts de conversions de devises doivent utiliser le compte 656\";\n" +
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
"    if (!transactions.length)\n" +
"      return 'pas de transaction attach\\xE9e - Si la transaction est introuvable, mettre le texte \"\\xA4 TRANSACTION INTROUVABLE\" au d\\xE9but du num\\xE9ro de facture';\n" +
"    return \"OK\";\n" +
"  }\n" +
"}\n" +
"class CustomerInvoice extends Invoice {\n" +
"  direction = \"customer\";\n" +
"  async loadValidMessage() {\n" +
"    const invoice = await this.getInvoice();\n" +
"    console.log(this.constructor.name, \"loadValidMessage\", { invoice });\n" +
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
"    if (invoice.date || invoice.deadline)\n" +
"      return \"les dates des pi\\xE8ces orient\\xE9es client doivent toujours \\xEAtre vides\";\n" +
"    if (invoice.thirdparty.id === 113420582) {\n" +
"      if (!invoice.invoice_number?.startsWith(\"ID \"))\n" +
"        return 'le champ \"Num\\xE9ro de facture\" doit commencer par \"ID NOM_DE_LA_PERSONNE\"';\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (![113420582, 103165930].includes(invoice.thirdparty.id))\n" +
"      return 'les seuls clients autoris\\xE9s sont \"PIECE ID\" et \"DON MANUEL\"';\n" +
"    const invoiceDocument = await this.getDocument();\n" +
"    const groupedDocuments = invoiceDocument.grouped_documents;\n" +
"    if (!groupedDocuments?.some((doc) => doc.type === \"Transaction\") && !invoice.invoice_number.startsWith(\"\\xA4 TRANSACTION INTROUVABLE\"))\n" +
"      return 'pas de transaction attach\\xE9e - Si la transaction est introuvable, mettre le texte \"\\xA4 TRANSACTION INTROUVABLE\" au d\\xE9but du num\\xE9ro de facture';\n" +
"    return \"OK\";\n" +
"  }\n" +
"}\n" +
"\n" +
"class NextInvalidInvoice extends OpenNextInvalid {\n" +
"  id = \"next-invalid-invoice\";\n" +
"  storageKey = \"InvoiceValidation\";\n" +
"  idParamName = \"id\";\n" +
"  async init() {\n" +
"    await this.appendContainer();\n" +
"    await super.init();\n" +
"  }\n" +
"  async *walk(params) {\n" +
"    if (\"page\" in params && !Number.isInteger(params.page)) {\n" +
"      console.log(this.constructor.name, \"walk\", { params });\n" +
"      throw new Error('The \"page\" parameter must be a valid integer number');\n" +
"    }\n" +
"    let parameters = jsonClone(params);\n" +
"    parameters.page = parameters.page ?? 1;\n" +
"    let data = null;\n" +
"    do {\n" +
"      data = await getInvoicesList(parameters);\n" +
"      const invoices = data.invoices;\n" +
"      if (!invoices?.length)\n" +
"        return;\n" +
"      for (const invoice of invoices)\n" +
"        yield Invoice.from(invoice).getStatus();\n" +
"      parameters = Object.assign(jsonClone(parameters), { page: Number(parameters.page ?? 0) + 1 });\n" +
"    } while (true);\n" +
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
"class InvoiceDisplayInfos extends Service$1 {\n" +
"  invoice;\n" +
"  state = {};\n" +
"  static instance;\n" +
"  static getInstance() {\n" +
"    return this.instance;\n" +
"  }\n" +
"  async init() {\n" +
"    await waitElem(\"h4\", \"Ventilation\");\n" +
"    console.log(\"GreaseMonkey - Pennylane\", \"Invoice panel\");\n" +
"    while (await waitFunc(async () => !await this.isSync())) {\n" +
"      await this.setMessage(\"\\u27F3\");\n" +
"      await this.loadMessage();\n" +
"    }\n" +
"  }\n" +
"  reload() {\n" +
"    this.state = {};\n" +
"  }\n" +
"  async isSync() {\n" +
"    const infos = await waitElem(\"h4.heading-section-3.mr-2\", \"Informations\");\n" +
"    const { invoice } = getReact(infos, 32).memoizedProps;\n" +
"    if (this.state.invoice !== invoice) {\n" +
"      this.state.lastInvoice = this.state.invoice;\n" +
"      this.state.invoice = invoice;\n" +
"      this.invoice = Invoice.from(invoice);\n" +
"      console.log(this.constructor.name, \"d\\xE9synchronis\\xE9\", { ...this.state });\n" +
"      return false;\n" +
"    }\n" +
"    const ledgerEvents = $$(\"form[name^=DocumentEntries-]\").reduce((events, form) => {\n" +
"      events.concat(getReactProps(form.parentElement, 3)?.initialValues.ledgerEvents);\n" +
"      return events;\n" +
"    }, []);\n" +
"    if (ledgerEvents.some((event, id) => this.state.events?.[id] !== event)) {\n" +
"      this.state.lastEvents = ledgerEvents;\n" +
"      this.state.events = ledgerEvents;\n" +
"      console.log(this.constructor.name, \"desynchronis\\xE9\", { ...this.state });\n" +
"      return false;\n" +
"    }\n" +
"    return true;\n" +
"  }\n" +
"  async createTagContainer() {\n" +
"    const infos = await waitElem(\"h4.heading-section-3.mr-2\", \"Informations\");\n" +
"    const tagsContainer = infos.nextSibling;\n" +
"    if (!tagsContainer)\n" +
"      throw new Error(\"InvoiceDisplayInfos: Impossible de trouver le bloc de tags\");\n" +
"    tagsContainer.insertBefore(\n" +
"      parseHTML(`<div class=\"sc-iGgVNO clwwQL d-flex align-items-center gap-1 gm-tag-container\">\n" +
"        <div id=\"is-valid-tag\" class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">\\u27F3</div>\n" +
"        <div id=\"invoice-id\" class=\"d-inline-block bg-secondary-100 dihsuQ px-0_5\">#${this.invoice.id}</div>\n" +
"      </div>`),\n" +
"      tagsContainer.firstChild\n" +
"    );\n" +
"  }\n" +
"  async loadMessage() {\n" +
"    console.log(\"load message\", this);\n" +
"    const { message, valid } = await this.invoice.getStatus();\n" +
"    this.setMessage(valid ? \"\\u2713\" : \"\\u2717 \" + message);\n" +
"  }\n" +
"  async setMessage(message) {\n" +
"    if (!$(\"#is-valid-tag\"))\n" +
"      await this.createTagContainer();\n" +
"    const tag = $(\"#is-valid-tag\");\n" +
"    if (!tag)\n" +
"      throw new Error('tag \"is-valid-tag\" introuvable');\n" +
"    tag.innerHTML = message;\n" +
"  }\n" +
"}\n" +
"\n" +
"class ArchiveGroupedDocument extends Service$1 {\n" +
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
"      console.log(this.constructor.name, \"addInvoiceInfos : no invoice found\");\n" +
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
"      const replacement = prompt(\"ID du justificatif ?\");\n" +
"      await invoice.update({\n" +
"        invoice_number: `\\xA7 ${replacement ? \"#\" + replacement + \" - \" : \"\"}${invoice.invoice.invoice_number}`\n" +
"      });\n" +
"      await invoice.archive();\n" +
"      console.log(`archive invoice #${id}`, { invoice });\n" +
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
"  async init() {\n" +
"    await this.appendContainer();\n" +
"    await super.init();\n" +
"  }\n" +
"  async *walk(params) {\n" +
"    if (\"page\" in params && !Number.isInteger(params.page)) {\n" +
"      console.log(this.constructor.name, \"walk\", { params });\n" +
"      throw new Error('The \"page\" parameter must be a valid integer number');\n" +
"    }\n" +
"    let parameters = jsonClone(params);\n" +
"    parameters.page = parameters.page ?? 1;\n" +
"    let data = null;\n" +
"    do {\n" +
"      data = await getTransactionsList(parameters);\n" +
"      const transactions = data.transactions;\n" +
"      if (!transactions?.length)\n" +
"        return;\n" +
"      for (const transaction of transactions)\n" +
"        yield new Transaction(transaction).getStatus();\n" +
"      parameters = Object.assign(jsonClone(parameters), { page: Number(parameters.page ?? 0) + 1 });\n" +
"    } while (true);\n" +
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
"class FixTab extends Service$1 {\n" +
"  async init() {\n" +
"    await waitElem(\"h4\", \"Ventilation\");\n" +
"    document.addEventListener(\"keydown\", (event) => {\n" +
"      if (event.code === \"Tab\" && event.shiftKey && event.srcElement === $(\"input[name=currency_amount]\")) {\n" +
"        event.preventDefault();\n" +
"        event.stopPropagation();\n" +
"        $(\"input[name=date]\")?.focus();\n" +
"      }\n" +
"    });\n" +
"  }\n" +
"}\n" +
"\n" +
"class Service {\n" +
"  static instance;\n" +
"  constructor() {\n" +
"    this.init();\n" +
"  }\n" +
"  static start() {\n" +
"    console.log(this.name, \"start\");\n" +
"    if (this.instance)\n" +
"      return;\n" +
"    this.instance = new this();\n" +
"  }\n" +
"  static getInstance() {\n" +
"    return this.instance;\n" +
"  }\n" +
"  init() {\n" +
"  }\n" +
"}\n" +
"\n" +
"class AllowChangeArchivedInvoiceNumber extends Service {\n" +
"  async init() {\n" +
"    await waitElem(\"h4\", \"Ventilation\");\n" +
"    document.addEventListener(\"keyup\", async (event) => {\n" +
"      if (event.code !== \"KeyS\" || !event.ctrlKey)\n" +
"        return;\n" +
"      const invoiceNumberField = $(\"input[name=invoice_number]\");\n" +
"      if (event.target !== invoiceNumberField || !invoiceNumberField)\n" +
"        return;\n" +
"      const rawInvoice = getReactProps(invoiceNumberField, 27).initialValues;\n" +
"      if (!rawInvoice.archived)\n" +
"        return;\n" +
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
"      console.log(`bouton \"${label}\" introuvable`);\n" +
"    if (event.shiftKey) {\n" +
"      $(\"div[aria-label=Effacer]\", filterButton)?.click();\n" +
"      return;\n" +
"    }\n" +
"    filterButton?.click();\n" +
"    const inputField = await waitElem(`input[aria-label=${label}]`, \"\", 2e3);\n" +
"    if (!inputField)\n" +
"      console.log(`champ \"input[aria-label=${label}]\" introuvable`);\n" +
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
"Object.assign(window, {\n" +
"  GM_Pennylane_Version: (\n" +
"    /** version **/\n" +
"    \"0.1.10\"\n" +
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
