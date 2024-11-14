// ==UserScript==
// @name     Pennylane
// @version  0.1.6
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
"function getRandomArrayItem(array) {\n" +
"  if (!array.length)\n" +
"    return null;\n" +
"  const index = Math.floor(Math.random() * array.length);\n" +
"  return array[index];\n" +
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
"class Document {\n" +
"  type;\n" +
"  id;\n" +
"  document;\n" +
"  groupedDocuments;\n" +
"  ledgerEvents;\n" +
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
"    return { id, valid, message };\n" +
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
"    findElem(\"span\", \"Attention\\xA0!\")?.nextElementSibling?.classList.add(\"headband-is-valid\");\n" +
"    if (!$(\".headband-is-valid\"))\n" +
"      $(\".paragraph-body-m.text-primary-900.text-truncate\")?.classList.add(\"headband-is-valid\");\n" +
"    if (!$(\".headband-is-valid\")) {\n" +
"      const detailTab = $(\"aside div\");\n" +
"      detailTab?.insertBefore(parseHTML(`\n" +
"        <div><div class=\"headband-is-valid\"></div></div>\n" +
"      `), detailTab.firstChild);\n" +
"    }\n" +
"    const headband = $(\".headband-is-valid\");\n" +
"    if (!headband)\n" +
"      return;\n" +
"    headband.textContent = this.message;\n" +
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
"async function findTransaction(cb, params = {}) {\n" +
"  if (\"page\" in params && !Number.isInteger(params.page)) {\n" +
"    console.log(\"findTransaction\", { params });\n" +
"    throw new Error('The \"page\" parameter must be a valid integer number');\n" +
"  }\n" +
"  let parameters = jsonClone(params);\n" +
"  parameters.page = parameters.page ?? 1;\n" +
"  let data = null;\n" +
"  do {\n" +
"    data = await getTransactionsList(parameters);\n" +
"    const transactions = data.transactions;\n" +
"    if (!transactions?.length)\n" +
"      return null;\n" +
"    console.log(\"findTransaction page\", { parameters, data, transactions });\n" +
"    for (const transaction of transactions)\n" +
"      if (await cb(transaction, parameters))\n" +
"        return transaction;\n" +
"    parameters = Object.assign(jsonClone(parameters), { page: parameters.page + 1 });\n" +
"  } while (parameters.page <= data.pagination.pages);\n" +
"  return null;\n" +
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
"async function findInvoice(cb, params = {}) {\n" +
"  if (\"page\" in params && !Number.isInteger(params.page)) {\n" +
"    console.log(\"findInvoice\", { cb, params });\n" +
"    throw new Error('The \"page\" parameter must be a valid integer number');\n" +
"  }\n" +
"  let parameters = jsonClone(params);\n" +
"  parameters.page = parameters.page ?? 1;\n" +
"  let data = null;\n" +
"  do {\n" +
"    data = await getInvoicesList(parameters);\n" +
"    const invoices = data.invoices;\n" +
"    if (!invoices?.length)\n" +
"      return null;\n" +
"    console.log(\"findInvoice page\", { parameters, data, invoices });\n" +
"    for (const invoice of invoices)\n" +
"      if (await cb(invoice, parameters))\n" +
"        return invoice;\n" +
"    parameters = Object.assign(jsonClone(parameters), { page: (parameters.page ?? 0) + 1 });\n" +
"  } while (true);\n" +
"}\n" +
"\n" +
"class OpenNextInvalid extends Service$1 {\n" +
"  current;\n" +
"  loading = null;\n" +
"  next;\n" +
"  events = [\"click\", \"keyup\"];\n" +
"  cache;\n" +
"  invalid;\n" +
"  launched = false;\n" +
"  idParamName;\n" +
"  storageKey;\n" +
"  async init() {\n" +
"    console.log(this.constructor.name, \"init\");\n" +
"    this.loading = this.loadValidations().then(() => {\n" +
"      this.loading = null;\n" +
"    });\n" +
"    this.next = (interactionAllowed) => setTimeout(\n" +
"      () => this.openNext(interactionAllowed === true),\n" +
"      0\n" +
"    );\n" +
"    if (!this.launched)\n" +
"      this.attachEvents();\n" +
"  }\n" +
"  loadCache() {\n" +
"    this.cache = JSON.parse(localStorage.getItem(this.storageKey) ?? \"{}\");\n" +
"  }\n" +
"  saveCache() {\n" +
"    localStorage.setItem(this.storageKey, JSON.stringify(this.cache));\n" +
"  }\n" +
"  attachEvents() {\n" +
"    this.events.forEach((event) => {\n" +
"      document.addEventListener(event, this.next);\n" +
"    });\n" +
"  }\n" +
"  detachEvents() {\n" +
"    this.events.forEach((event) => {\n" +
"      document.removeEventListener(event, this.next);\n" +
"    });\n" +
"  }\n" +
"  getCurrent() {\n" +
"    return this.current = Number(getParam(location.href, this.idParamName));\n" +
"  }\n" +
"  async openNext(interactionAllowed = false) {\n" +
"    this.launched = true;\n" +
"    this.detachEvents();\n" +
"    console.log(this.constructor.name, \"openNext\");\n" +
"    this.current = this.getCurrent();\n" +
"    let status = getRandomArrayItem(Object.values(this.cache).filter(\n" +
"      (status2) => \"number\" !== typeof status2 && status2.id !== this.current && status2.valid === false\n" +
"    ));\n" +
"    if (!status)\n" +
"      status = this.invalid;\n" +
"    if (!status && this.loading) {\n" +
"      if (interactionAllowed) {\n" +
"        alert(this.constructor.name + \": impossible de trouver un \\xE9l\\xE9ment invalide dans le cache, attente de la fin du scan\");\n" +
"      } else {\n" +
"        console.log(this.constructor.name + \": impossible de trouver un \\xE9l\\xE9ment invalide dans le cache, attente de la fin du scan\", this);\n" +
"      }\n" +
"      await new Promise(async (rs) => {\n" +
"        while (this.loading && !this.invalid)\n" +
"          await sleep(300);\n" +
"        rs();\n" +
"      });\n" +
"      status = this.invalid;\n" +
"    }\n" +
"    if (!status) {\n" +
"      if (!interactionAllowed) {\n" +
"        console.log(this.constructor.name + \": tous les \\xE9l\\xE9ments semblent valides.\");\n" +
"        return;\n" +
"      }\n" +
"      if (!confirm(this.constructor.name + \": tous les \\xE9l\\xE9ments semblent valides. Rev\\xE9rifier depuis le d\\xE9but ?\"))\n" +
"        return;\n" +
"      this.cache = {};\n" +
"      this.saveCache();\n" +
"      this.loading = this.loadValidations().then(() => {\n" +
"        this.loading = null;\n" +
"      });\n" +
"      await new Promise(async (rs) => {\n" +
"        while (this.loading instanceof Promise && !this.invalid)\n" +
"          await sleep(300);\n" +
"        rs();\n" +
"      });\n" +
"      status = this.invalid;\n" +
"    }\n" +
"    if (!status) {\n" +
"      alert(this.constructor.name + \": tous les \\xE9l\\xE9ments sont valides selon les param\\xE9tres actuels\");\n" +
"      return;\n" +
"    }\n" +
"    console.log(this.constructor.name, \"next found :\", { current: this.current, status });\n" +
"    const success = await this.openInvalid(status);\n" +
"    if (!success) {\n" +
"      delete this.invalid;\n" +
"      this.next(interactionAllowed);\n" +
"    }\n" +
"  }\n" +
"  setItemStatus(status) {\n" +
"    if (!status.valid && status.id !== this.getCurrent())\n" +
"      this.invalid = status;\n" +
"    this.cache[status.id] = status;\n" +
"    this.saveCache();\n" +
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
"      const allowed = [\"\\xA7 #\", \"\\xA4 CARTE ETRANGERE\", \"\\xA4 TRANSACTION INTROUVABLE\"];\n" +
"      if (!allowed.some((allowedItem) => invoice.invoice_number.startsWith(allowedItem)))\n" +
"        return `Le num\\xE9ro de facture d'une facture archiv\\xE9e doit commencer par une de ces possibilit\\xE9s : ${allowed.map((it) => `\"${it}\"`).join(\", \")}`;\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (invoice.thirdparty && !invoice.thirdparty.country)\n" +
"      return \"Fournisseur inconnu : Choisir un autre fournisseur ou ajouter le pays de celui-ci\";\n" +
"    if (!invoice.thirdparty_id && !invoice.thirdparty)\n" +
"      return \"Ajouter un fournisseur\";\n" +
"    if (invoice.invoice_lines?.some((line) => line.pnl_plan_item?.number == \"6288\"))\n" +
"      return \"compte tiers 6288\";\n" +
"    if (invoice.invoice_number?.startsWith(\"\\xA4\")) {\n" +
"      if (invoice.id == current)\n" +
"        console.log(\"\\xA4\");\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if ([106438171, 114270419, 106519227].includes(invoice.thirdparty?.id ?? 0)) {\n" +
"      if (invoice.date || invoice.deadline)\n" +
"        return \"Les dates doivent \\xEAtre vides\";\n" +
"    }\n" +
"    if (invoice.thirdparty?.name === \"AIDES OCTROY\\xC9ES\" && invoice.thirdparty.id !== 106438171)\n" +
"      return `Il ne doit y avoir qu'un seul compte \"AIDES OCTROY\\xC9ES\", et ce n'est pas le bon...`;\n" +
"    if (invoice.thirdparty?.name === \"PIECE ID\" && invoice.thirdparty.id !== 106519227)\n" +
"      return `Il ne doit y avoir qu'un seul compte \"PIECE ID\", et ce n'est pas le bon...`;\n" +
"    if (invoice.currency !== \"EUR\") {\n" +
"      const ledgerEvents = await this.getLedgerEvents();\n" +
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
"      return \"pas de transaction attach\\xE9e\";\n" +
"    if (!invoice.date)\n" +
"      return \"la date de facture est vide\";\n" +
"    return \"OK\";\n" +
"  }\n" +
"}\n" +
"class CustomerInvoice extends Invoice {\n" +
"  direction = \"customer\";\n" +
"  async loadValidMessage() {\n" +
"    const invoice = await this.getInvoice();\n" +
"    console.log(this.constructor.name, \"loadValidMessage\", { invoice });\n" +
"    if (invoice.archived) {\n" +
"      const allowed = [\"\\xA7 #\", \"\\xA7 ESPECES\", \"\\xA4 TRANSACTION INTROUVABLE\"];\n" +
"      if (!allowed.some((allowedItem) => invoice.invoice_number.startsWith(allowedItem)))\n" +
"        return `Le num\\xE9ro de facture d'une facture archiv\\xE9e doit commencer par une de ces possibilit\\xE9s : ${allowed.map((it) => `\"${it}\"`).join(\", \")}`;\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (!invoice.thirdparty)\n" +
"      return 'choisir un \"client\"';\n" +
"    if (invoice.date || invoice.deadline)\n" +
"      return \"les dates doivent \\xEAtre vides\";\n" +
"    if (invoice.thirdparty.id === 113420582) {\n" +
"      if (!invoice.invoice_number?.startsWith(\"ID \"))\n" +
"        return 'le champ \"Num\\xE9ro de facture\" doit commencer par \"ID NOM_DE_LA_PERSONNE\"';\n" +
"      return \"OK\";\n" +
"    }\n" +
"    if (![113420582, 103165930].includes(invoice.thirdparty.id))\n" +
"      return 'les seuls clients autoris\\xE9s sont \"PIECE ID\" et \"DON MANUEL\"';\n" +
"    const invoiceDocument = await this.getDocument();\n" +
"    const groupedDocuments = invoiceDocument.grouped_documents;\n" +
"    if (!groupedDocuments?.some((doc) => doc.type === \"Transaction\") && !invoice.invoice_number.startsWith(\"\\xA4 \"))\n" +
"      return \"pas de transaction attach\\xE9e\";\n" +
"    return \"OK\";\n" +
"  }\n" +
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
"class NextInvalidInvoice extends OpenNextInvalid {\n" +
"  storageKey;\n" +
"  idParamName = \"id\";\n" +
"  parameters = { direction: \"customer\", page: 1 };\n" +
"  async init() {\n" +
"    await this.start();\n" +
"    this.keepActive();\n" +
"    await super.init();\n" +
"  }\n" +
"  async start() {\n" +
"    await waitElem(\"h4\", \"Ventilation\");\n" +
"    const directionButton = await Promise.race([\n" +
"      waitElem(\"button\", \"Client\"),\n" +
"      waitElem(\"button\", \"Fournisseur\")\n" +
"    ]);\n" +
"    if (directionButton.textContent?.includes(\"Client\")) {\n" +
"      this.storageKey = \"customerInvoiceValidation\";\n" +
"      this.parameters.direction = \"customer\";\n" +
"    } else {\n" +
"      this.storageKey = \"supplierInvoiceValidation\";\n" +
"      this.parameters.direction = \"supplier\";\n" +
"    }\n" +
"    this.addButton();\n" +
"  }\n" +
"  async keepActive() {\n" +
"    await this.start();\n" +
"    await waitFunc(() => !$(\".open-next-invalid-btn\"));\n" +
"    setTimeout(() => this.keepActive(), 0);\n" +
"  }\n" +
"  async loadValidations() {\n" +
"    this.loadCache();\n" +
"    this.parameters.page = Math.max(1, ...Object.values(this.cache).map((status) => status.page));\n" +
"    if (isNaN(this.parameters.page)) {\n" +
"      console.log(this.constructor.name, this);\n" +
"    }\n" +
"    await findInvoice(async (rawInvoice, params) => {\n" +
"      const page = params.page;\n" +
"      const invoice = Invoice.from(rawInvoice);\n" +
"      const status = await invoice.getStatus();\n" +
"      this.setItemStatus({ ...status, page, updatedAt: Date.now() });\n" +
"      return false;\n" +
"      //!status.valid;\n" +
"    }, this.parameters);\n" +
"  }\n" +
"  async openInvalid(status) {\n" +
"    let invoice = await Invoice.load(status.id);\n" +
"    if (!invoice) {\n" +
"      console.log(\"NextInvalidInvoice\", { status, invoice });\n" +
"      delete this.cache[status.id];\n" +
"      this.saveCache();\n" +
"      console.log(this.constructor.name, `openInvalid: invoice ${status.id} is deleted`);\n" +
"      return false;\n" +
"    }\n" +
"    if (status.message.includes(\"6288\")) {\n" +
"      const rawInvoice = await invoice.getInvoice();\n" +
"      await invoice.update({ invoice_lines_attributes: [{\n" +
"        ...rawInvoice.invoice_lines[0],\n" +
"        pnl_plan_item_id: null,\n" +
"        pnl_plan_item: null\n" +
"      }] });\n" +
"      invoice = await Invoice.load(status.id);\n" +
"      if (!invoice)\n" +
"        throw new Error(this.constructor.name + \": La facture a disparu ?!\");\n" +
"    }\n" +
"    if (await invoice.isValid()) {\n" +
"      console.log(this.constructor.name, \"openInvalid: invoice is valid\", { invoice, status });\n" +
"      this.cache[invoice.id] = Object.assign(\n" +
"        jsonClone(this.cache[invoice.id]),\n" +
"        await invoice.getStatus()\n" +
"      );\n" +
"      this.saveCache();\n" +
"      return false;\n" +
"    }\n" +
"    openDocument(status.id);\n" +
"    return true;\n" +
"  }\n" +
"  /** Add \"next invalid invoice\" button on invoices list */\n" +
"  addButton() {\n" +
"    this.loadCache();\n" +
"    const number = Object.values(this.cache).filter((status) => !status.valid).length;\n" +
"    const nextButton = $(\"div>span+button+button:last-child\");\n" +
"    if (!nextButton)\n" +
"      return;\n" +
"    const className = nextButton.className;\n" +
"    nextButton.parentElement?.insertBefore(parseHTML(\n" +
"      `<button type=\"button\" class=\"${className} open-next-invalid-btn\">&nbsp;&gt;&nbsp;${number}</button>`\n" +
"    ), nextButton.previousElementSibling);\n" +
"    $(\".open-next-invalid-btn\").addEventListener(\"click\", (event) => {\n" +
"      event.stopPropagation();\n" +
"      this.launched = true;\n" +
"      this.detachEvents();\n" +
"      this.openNext(true);\n" +
"    });\n" +
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
"    tag.textContent = message;\n" +
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
"  storageKey = \"transactionValidation\";\n" +
"  idParamName = \"transaction_id\";\n" +
"  parameters = { page: 1 };\n" +
"  async init() {\n" +
"    await waitElem(\"h3\", \"Transactions\");\n" +
"    super.init();\n" +
"    while (await waitFunc(() => findElem(\"div\", \"D\\xE9tails\") && !$(\".open-next-invalid-btn\")))\n" +
"      this.addButton();\n" +
"  }\n" +
"  async loadValidations() {\n" +
"    this.loadCache();\n" +
"    this.parameters.page = Math.max(1, ...Object.values(this.cache).map((status) => status.page));\n" +
"    await findTransaction(async (rawTransaction, params) => {\n" +
"      const page = params.page;\n" +
"      const transaction = new Transaction(rawTransaction);\n" +
"      const transactionStatus = await transaction.getStatus();\n" +
"      this.setItemStatus({ ...transactionStatus, page, updatedAt: Date.now() });\n" +
"      return !transactionStatus.valid;\n" +
"    }, this.parameters);\n" +
"    if (!Object.keys(this.cache).length)\n" +
"      return;\n" +
"    const oldest = Object.values(this.cache).reduce((a, b) => a.updatedAt < b.updatedAt ? a : b);\n" +
"    this.parameters.page = oldest.page;\n" +
"    await findTransaction(async (rawTransaction, params) => {\n" +
"      const page = params.page;\n" +
"      const transaction = new Transaction(rawTransaction);\n" +
"      const transactionStatus = await transaction.getStatus();\n" +
"      this.setItemStatus({ ...transactionStatus, page, updatedAt: Date.now() });\n" +
"      return !transactionStatus.valid;\n" +
"    }, this.parameters);\n" +
"  }\n" +
"  async openInvalid(status) {\n" +
"    const transaction = new Transaction(status.id);\n" +
"    const message = await transaction.getValidMessage();\n" +
"    if (message?.includes(\"\\xE9criture\")) {\n" +
"      const data = { oldMessage: message };\n" +
"      await transaction.reloadLedgerEvents();\n" +
"      console.log(\"reload ledger events\", { ...data, message });\n" +
"    }\n" +
"    if (await transaction.isValid()) {\n" +
"      console.log(\"transaction is valid\", { status, transaction, message });\n" +
"      this.cache[status.id] = Object.assign(jsonClone(status), { valid: true });\n" +
"      this.saveCache();\n" +
"      return false;\n" +
"    }\n" +
"    console.log(\"nextInvalidTransaction\", message, { status });\n" +
"    openDocument(status.id);\n" +
"    return true;\n" +
"  }\n" +
"  /** Add \"next invalid transaction\" button on invoices list */\n" +
"  addButton() {\n" +
"    const nextButton = findElem(\"div\", \"D\\xE9tails\")?.querySelector(\"button+button:last-child\");\n" +
"    if (!nextButton)\n" +
"      return;\n" +
"    this.loadCache();\n" +
"    const number = Object.values(this.cache).filter((status) => !status.valid).length;\n" +
"    const className = nextButton.className;\n" +
"    nextButton.parentElement?.insertBefore(parseHTML(\n" +
"      `<button type=\"button\" class=\"${className} open-next-invalid-btn\">&nbsp;&gt;&nbsp;${number}</button>`\n" +
"    ), nextButton.previousElementSibling);\n" +
"    $(\".open-next-invalid-btn\").addEventListener(\"click\", (event) => {\n" +
"      event.stopPropagation();\n" +
"      this.launched = true;\n" +
"      this.detachEvents();\n" +
"      this.openNext(true);\n" +
"    });\n" +
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
