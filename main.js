const $ = document.querySelector.bind(document);
const $$ = (...args) => Array.from(document.querySelectorAll(...args));

// get out of DOMCOntentLoaded : https://github.com/greasemonkey/greasemonkey/issues/1584#issuecomment-7513483
setTimeout(init, 0);

function init () {
  last_7_days_filter();
}

/**
 * Parse and enable LAST_7_DAYS filter on transactions page
 *
 * :Adding `date=LAST_7DAYS` in param url will auto filter transaction
 */
function last_7_days_filter () {
  const url = new URL(location.href);
  //if (!new RegExp('^/companies/\\d+/clients/transactions$').test(url.pathname)) return;
  if (url.searchParams.get('date') !== 'LAST_7_DAYS') return;
  const zone = new Date().toString().replace(/^.*GMT(...)(..).*$/, '$1:$2');
  const today = new Date(Math.floor(Date.now() / 86_400_000) * 86_400_000);
  const start = new Date(today - (86_400_000 * 7)).toISOString().replace('.000Z', zone);
  const end = today.toISOString().replace('.000Z', zone);
  const filter = url.searchParams.has('filter') ? JSON.parse(url.searchParams.get('filter')) : [];
  filter.splice(filter.findIndex(item => item.field === 'date'), 1);
  filter.splice(filter.findIndex(item => item.field === 'date'), 1);
  filter.push({field: 'date', operator: 'gteq', value: start},{field: 'date', operator: 'lteq', value: end});
  url.searchParams.set('filter', JSON.stringify(filter));
  url.searchParams.delete('date');
  location.replace(url);
}

async function apiRequest (endpoint, data, method = 'POST') {
  return await fetch(`https://app.pennylane.com/companies/21936866/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-COMPANY-CONTEXT-DATA-UPDATED-AT": "2024-03-25T20:22:38.289Z",
      "X-PLAN-USED-BY-FRONT-END": "v1_saas_free",
      "X-FRONTEND-LAST-APPLICATION-LOADED-AT": "2024-03-25T20:22:37.968Z",
      "X-CSRF-TOKEN": getCookies().my_csrf_token,
      "X-DEPLOYMENT": "2023-04-19",
      "X-SOURCE-VERSION": "e0c18c0",
      "X-SOURCE-VERSION-BUILT-AT": "2024-03-25T18:05:09.769Z",
      "X-DOCUMENT-REFERRER": location.origin + location.pathname,
      Accept: 'application/json'
    },
    body: data ? JSON.stringify(data) : data,
  });
}

function getCookies () {
  return document.cookie.split(';')
      .map(elem => elem.split('='))
      .reduce((cookies, [key, value]) => Object.assign(cookies, { [key.trim()]: value }), {});
}
window.apiRequest = apiRequest;

setInterval(function initMergeInvoices () {
  const button = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent.includes('Chercher parmi les factures') || b.textContent === 'Voir plus de factures');
  if (!button) return //console.log('initMergeInvoices', 'Bouton "Chercher parmi les factures" introuvable');
  const div = button.closest('.mt-2');
  if (div.childElementCount > 2) return //console.log('initMergeInvoices plus de 2 boutons en ligne', {div});
  const mergeButton = div.insertBefore(document.createElement('div'), div.lastElementChild);
  mergeButton.innerText = 'Fusionner les factures';
  mergeButton.classList.add('btn-sm', 'w-100', 'btn-primary');
  mergeButton.addEventListener('click', () => { mergeInvoices(); });

  const addButton = div.insertBefore(document.createElement('div'), div.lastElementChild);
  addButton.innerText = 'Ajouter par ID';
  addButton.classList.add('btn-sm', 'w-100', 'btn-primary');
  addButton.addEventListener('click', () => { addById(); });
}, 200);

async function addById () {
  const id = prompt('ID du justificatif ?');
  const guuid = await getGUUID(id);
  const localId = (new URL(location.href)).searchParams.get('transaction_id');
  await apiRequest(
    `documents/${localId}/matching`,
    { matching:{unmatch_ids:[], group_uuids:[guuid] } },
    'PUT'
  );
}

async function mergeInvoices () {
  const button = Array.from(document.getElementsByTagName('button'))
    .find(b => b.textContent.includes('Chercher parmi les factures'));
  const component = button.closest('.px-2.py-3');
  const items = getReactProps(component).panelTransaction.grouped_documents;
  const invoices = items.filter(item => item.type === 'Invoice').map(invoice => invoice.id);
  const response = await apiRequest(
    'accountants/invoices/merge_files',
    {invoice_ids: invoices}
  );
  console.log('mergeInvoices', {response});
}

async function getGUUID (documentId) {
  const response = await apiRequest(`documents/${documentId}`, null, 'GET');
  const data = await response.json();
  console.log('getGUUID', {data});
  return data.group_uuid;
}

function getReact (elem, up = 0) {
  if (!elem) return null;
  const keys = Object.getOwnPropertyNames(elem);
  const fiberKey = keys.find(key => key.startsWith('__reactFiber'));

  const fiber = elem[fiberKey];
  let component = fiber.return;
  for (let i = 0; i < up; ++i) component = component.return;
  return component;
}
window.getReact = getReact;

function getReactProps (elem, up = 0) {
  return getReact(elem, up)?.memoizedProps;
}
window.getReactProps = getReactProps;


/** Add infos on Invoice full page display */
setInterval(async () => {
  const infos = Array.from(document.querySelectorAll('h4.heading-section-3.mr-2'))
    .find(title => title.textContent === 'Informations');
  if (!infos) return;
  if (document.querySelector('#invoice-id')) return;
  const {invoice} = getReact(infos, 32).memoizedProps;
  const tagsContainer = infos.nextSibling;
  tagsContainer.insertBefore(
    parseHTML(`<div class="sc-iGgVNO clwwQL d-flex align-items-center gap-1"></div>`),
    tagsContainer.firstChild
  );
  const idTag = tagsContainer.firstChild.appendChild(
    parseHTML(
      `<div id="invoice-id" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">
        #${invoice.id}
      </div>`
    )
  );
  const isValid =
    (invoice.archived && invoice.invoice_number.startsWith('§'))
    || (invoice.thirdparty?.id === 106519227 && invoice.invoice_number.startsWith('ID '))
    || (await getDocument(invoice.id)).grouped_documents?.some(doc => doc.type === 'Transaction');
  tagsContainer.firstChild.insertBefore(
    parseHTML(
      `<div id="is-valid-tag" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">
        ${isValid ? '✓' : 'x'}
      </div>`
    ),
    tagsContainer.firstChild.firstChild
  );
}, 50);

function findElem (selector, text) {
  return Array.from(document.querySelectorAll(selector) ?? []).find(elem => elem.textContent === text);
}

async function getDocument (id) {
  const response = await apiRequest(`documents/${id}`, null, 'GET');
  return await response.json();
}
window.getDocument = getDocument;

/**
 * Parse an HTML string and return a DocumentFragment which can be inserted in the DOM as is
 *
 * @param {string} html The HTML string to parse
 *
 * @return {DocumentFragment} The parsed HTML fragment
 */
function parseHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
}

setInterval(() => {
  const itemsStatuses = Array.from(document.querySelectorAll('div[data-intercom="invoices-list-status"]'));
  itemsStatuses.forEach(async cell => {
    if (cell.querySelector('.has-transaction-status')) return;
    const id = getReactProps(cell, 2).original.id;
    cell.firstElementChild.firstElementChild.insertBefore(
      parseHTML('<span class="has-transaction-status"></span>'),
      cell.firstElementChild.firstElementChild.firstChild
    );
    const statusElem = cell.querySelector('.has-transaction-status');
    const data = await getDocument(id);
    const hasTransaction = data.grouped_documents.some(elem => elem.type === 'Transaction');
    console.log({data, hasTransaction, statusElem});
    statusElem.textContent = hasTransaction ? '+ ' : '- ';
  });
}, 200);
