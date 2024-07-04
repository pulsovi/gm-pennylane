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

let apiRequestWait = false;
async function apiRequest (endpoint, data, method = 'POST') {
  if (apiRequestWait) await apiRequestWait;
  const response = await fetch(`https://app.pennylane.com/companies/21936866/${endpoint}`, {
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
  if (response.status === 429) {
    console.log('apiRequest response status is not 200', {response});
    apiRequestWait = new Promise(rs => setTimeout(rs, 1000));
    return apiRequest(endpoint, data, method);
  }
  return response;
}

function getCookies () {
  return document.cookie.split(';')
      .map(elem => elem.split('='))
      .reduce((cookies, [key, value]) => Object.assign(cookies, { [key.trim()]: value }), {});
}
window.apiRequest = apiRequest;

/** Add 'add by ID' button on transaction reconciliation tab */
setInterval(function () {
  const button = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent.includes('Chercher parmi les factures') || b.textContent === 'Voir plus de factures');
  if (!button) return;
  const div = button.closest('.mt-2');
  if (div.childElementCount > 2) return;

  div.insertBefore(
    parseHTML('<div class="btn-sm w-100 btn-primary" style="cursor: pointer;">Ajouter par ID</div>'),
    div.lastElementChild
  );
  const addButton = div.lastElementChild.previousElementSibling;
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
  const isCustomer = Boolean(findElem('button', 'Voir / Modifier le client'));
  const infos = Array.from(document.querySelectorAll('h4.heading-section-3.mr-2'))
    .find(title => title.textContent === 'Informations');
  if (!infos) return;
  if (document.querySelector('#invoice-id')) return;
  const {invoice} = getReact(infos, 32).memoizedProps;
  console.log({invoice});
  const tagsContainer = infos.nextSibling;
  tagsContainer.insertBefore(
    parseHTML(`<div class="sc-iGgVNO clwwQL d-flex align-items-center gap-1"></div>`),
    tagsContainer.firstChild
  );
  tagsContainer.firstChild.appendChild(
    parseHTML(
      `<div id="invoice-id" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">
        #${invoice.id}
      </div>`
    )
  );
  const isValid = await (isCustomer ? customerInvoiceIsValid : supplierInvoiceIsValid)(invoice);
  const reason = (isValid || isCustomer) ? '' : await supplierInvoiceInvalidReason(invoice);
  tagsContainer.firstChild.insertBefore(
    parseHTML(
      `<div id="is-valid-tag" class="d-inline-block bg-secondary-100 dihsuQ px-0_5">
        ${isValid ? '✓' : 'x&nbsp;'+reason}
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

async function supplierInvoiceIsValid (invoice) {
  return !(await supplierInvoiceInvalidReason(invoice));
}

async function supplierInvoiceInvalidReason (invoice) {
  // Archived and replaced
  if (invoice.archived && invoice.invoice_number?.startsWith('§')) return null;

  // exclude 6288
  if (invoice.invoice_lines?.some(line => line.pnl_plan_item?.number == '6288')) return 'compte tiers 6288';

  // Known orphan invoice
  if (invoice.invoice_number?.startsWith('¤')) return null;

  // Stripe fees invoice
  if (invoice.thirdparty?.id === 115640202) return null;

  // ID card
  if (invoice.thirdparty?.id === 106519227 && invoice.invoice_number?.startsWith('ID ')) return null;

  // Has transaction attached
  if ((await getDocument(invoice.id)).grouped_documents?.some(doc => doc.type === 'Transaction'))
    return null;

  return 'pas de transaction attachée';
}

/** Add "has transaction" symbol on status column whith the invoices list */
setInterval(() => {
  const isSupplierInvoices = Boolean(findElem('h3', 'Factures fournisseurs'));
  const isCustomerInvoices = Boolean(findElem('h3', 'Factures clients'));
  if (!isCustomerInvoices && !isSupplierInvoices) return;
  const itemsStatuses = Array.from(document.querySelectorAll('div[data-intercom="invoices-list-status"]'));
  itemsStatuses.forEach(async cell => {
    if (cell.querySelector('.has-transaction-status')) return;
    const invoice = getReactProps(cell, 2).original;
    const isValid = await (isSupplierInvoices ? supplierInvoiceIsValid(invoice) : customerInvoiceIsValid(invoice));
    if (cell.querySelector('.has-transaction-status')) return;
    cell.firstElementChild.firstElementChild.insertBefore(
      parseHTML(`<span class="has-transaction-status">${isValid ? '✓&nbsp;' : 'x&nbsp;'}</span>`),
      cell.firstElementChild.firstElementChild.firstChild
    );
  });
}, 200);

async function customerInvoiceIsValid (invoice) {
  // don manuel
  if (invoice.thirdparty?.id === 103165930 && !invoice.date && !invoice.deadline) return true;

  // piece id
  if (invoice.thirdparty?.id === 113420582 && !invoice.date && !invoice.deadline && invoice.invoice_number?.startsWith('ID ')) return true;
  return false;
}

let loadingInvoiceValidation = null;
/** Add "next invalid invoice" button on invoices list */
setInterval(async () => {
  if (!findElem('h4', 'Informations')) return;
  const nextButton = $('div>span+button+button:last-child');
  if (!nextButton) return;
  nextButton.parentElement.insertBefore(parseHTML(
    `<button type="button" class="sc-jlZhRR izKsrp justify-content-center btn btn-primary btn-sm">&nbsp;&gt;&nbsp;</button>`
  ), nextButton.previousElementSibling);
  const nextInvalidButton = nextButton.previousElementSibling.previousElementSibling;
  nextInvalidButton.addEventListener('click', nextInvalidInvoice);
  loadingInvoiceValidation = loadInvoiceValidation();
  document.addEventListener('click', function cb () {
    nextInvalidInvoice();
    document.removeEventListener('click', cb);
  });
}, 200);

async function loadInvoiceValidation () {
  const direction = getParam(location.href, 'direction');
  const isValid = direction === 'customer' ? customerInvoiceIsValid : supplierInvoiceIsValid;
  const cache = JSON.parse(localStorage.getItem('invoicesValidation') ?? '{}');
  const startPage = Math.max.apply(Math, Object.entries(cache)
    .filter(([id, status]) => status.direction === direction)
    .map(([id, status]) => status.page)
  );
  await findInvoice({direction, page: isNaN(startPage) ? 1 : startPage}, async (invoice, page) => {
    if (invoice.id == getParam(location.href, 'id')) return false;
    if (!(invoice.id in cache) || !cache[invoice.id]) {
      cache[invoice.id] = { page, direction, valid: await isValid(invoice) };
      localStorage.setItem('invoicesValidation', JSON.stringify(cache));
    }
    return false;
  });
}

async function nextInvalidInvoice () {
  console.log('nextInvalidInvoice');
  let cache = JSON.parse(localStorage.getItem('invoicesValidation') ?? '{}');
  let invalid = getRandomArrayItem(Object.entries(cache).filter(([id, status]) => !status.valid));
  if (!invalid) {
    await loadingInvoiceValidation;
    cache = JSON.parse(localStorage.getItem('invoicesValidation') ?? '{}');
    invalid = getRandomArrayItem(Object.entries(cache).filter(([id, status]) => !status.valid));
  }
  if (!invalid) {
    if (!confirm('Toutes les factures semblent être valides. Revérifier tout ?')) return;
    localStorage.setItem('invoicesValidation', '{}');
    await Promise.race([
      loadInvoiceValidation(),
      new Promise(async rs => {
        while (!invalid) {
          await new Promise(to => setTimeout(to, 2000));
          cache = JSON.parse(localStorage.getItem('invoicesValidation') ?? '{}');
          invalid = getRandomArrayItem(Object.entries(cache).filter(([id, status]) => !status.valid));
        }
        rs();
      }),
    ]);
  }
  if (!invalid) {
    alert('Toutes les factures sont valides selon les critères actuels.');
    return;
  }
  const direction = getParam(location.href, 'direction');
  const isValid = direction === 'customer' ? customerInvoiceIsValid : supplierInvoiceIsValid;
  if (await isValid(await getInvoice(invalid[0]))) {
    cache[invalid[0]].valid = true;
    localStorage.setItem('invoicesValidation', JSON.stringify(cache));
    return nextInvalidInvoice();
  }
  const url = new URL(location.href);
  url.searchParams.set('id', invalid[0]);
  //location.replace(url.toString());
  //open(url.toString(), '_blank');
  document.body.appendChild(parseHTML(`<div class="open_tab" data-url="${escape(url.toString())}" style="display: none;"></div>`));
}

function getRandomArrayItem (array) {
  if (!array.length) return null;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function getParam (url, paramName) {
  return new URL(url).searchParams.get(paramName);
}

async function findInvoice (params, cb) {
  const url = new URL(`http://a.a/accountants/invoices/list?page=1`);
  url.searchParams.set('page', '1');
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  let page = parseInt(url.searchParams.get('page')), response, data, invoices;
  do {
    response = await apiRequest(url.toString().replace('http://a.a/', ''), null, 'GET');
    data = await response.json();
    invoices = data.invoices;
    if (!invoices?.length) return null;
    console.log('page', page, {response, data, invoices});
    for (const invoice of invoices) if (await cb(invoice, page)) return invoice;
    page += 1;
    url.searchParams.set('page', page);
  } while (page <= data.pagination.pages);
}

/** Add "Archive" button on bonded invoice in transaction pannel */
setInterval(() => {
  if (!findElem('h3', 'Transactions')) return;
  $$('div>a+button>svg').map(svg => svg.closest('div')).forEach((buttonsBlock, id) => {
    if (!buttonsBlock || buttonsBlock.children.length > 2) return;
    buttonsBlock.insertBefore(
      parseHTML(`<button id="archive-button-${id}">&nbsp;x&nbsp;</button>`),
      buttonsBlock.firstElementChild
    );
    buttonsBlock.querySelector(`#archive-button-${id}`).addEventListener('click', async () => {
      const invoice = await getInvoice(getReactProps(buttonsBlock, 4).invoiceId);
      const replacement = prompt('ID du justificatif ?');
      await updateInvoice(invoice.id, {
        invoice_number: `§ ${replacement ? '#'+replacement+' - ' : ''}${invoice.invoice_number}`
      });
      await archiveDocument(invoice.id);
      console.log('archive invoice', getReactProps(buttonsBlock, 4).invoiceId, {invoice});
    });

    detailsBlock = upElement(buttonsBlock, 3).children[1];
    const invoice = getReactProps(detailsBlock, 11)?.invoice;
    detailsBlock.firstChild.lastElementChild.appendChild(parseHTML(
      `&nbsp;<span class="invoice-id d-inline-block bg-secondary-100 dihsuQ px-0_5">
        #${invoice.id}
      </span>`
    ));
  });
}, 200);

function upElement (elem, upCount) {
  let retval = elem;
  for (i = 0; i < upCount; ++i) retval = retval?.parentElement;
  return retval;
}

async function getInvoice (id) {
  if (!id) {
    console.error('Error: getInvoice() invalid id', {id});
    return null;
  }
  const response = await apiRequest(`/accountants/invoices/${id}`, null, 'GET');
  const data = await response.json();
  return data.invoice;
}

async function updateInvoice (id, data) {
  await apiRequest(`/accountants/invoices/${id}`, data, 'PUT');
}

async function archiveDocument (id, unarchive = false) {
  await apiRequest('documents/batch_archive', { documents: [{id}], unarchive }, 'POST');
}
