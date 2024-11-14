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
  const doc = await getDocument(documentId);
  console.log('getGUUID', {doc});
  return doc.group_uuid;
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

  const {invoice} = getReact(infos, 32).memoizedProps;
  if ($('#invoice-id')) {
    const isValidTag = $('#is-valid-tag');
    if (isValidTag && isValidTag.invoice !== invoice) {
      console.log('isValidTag desynchonized');
      isValidTag.parentElement.remove();
    }
    return;
  }
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
  $('#is-valid-tag').invoice = invoice;
}, 50);

function findElem (selector, text) {
  return Array.from(document.querySelectorAll(selector) ?? []).find(elem => elem.textContent === text);
}
window.findElem = findElem;

async function getDocument (id) {
  if (!id) {
    console.log('getDocument', {id});
    throw new Error('Cannot get document without ID');
  }
  if ('object' === typeof id) {
    if ('grouped_documents' in id) return id;
    id = id.id;
  }
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
  if (!invoice) console.log('supplierInvoiceInvalidReason', {invoice});

  const invoiceDocument = await getDocument(invoice);
  if (invoice.id == getParam(location.href, 'id'))
    console.log('supplierInvoiceInvalidReason', { invoice, invoiceDocument });

  const transactions = invoiceDocument.grouped_documents.filter(doc => doc.type === 'Transaction');
  if (transactions.length && transactions.every(transaction => transaction.date.startsWith('2024')))
    return null;

  // Archived and replaced
  if (invoice.archived && invoice.invoice_number?.startsWith('§ #')) return null;

  // exclude 6288
  if (invoice.invoice_lines?.some(line => line.pnl_plan_item?.number == '6288')) return 'compte tiers 6288';

  // Known orphan invoice
  if (invoice.invoice_number?.startsWith('¤')) return null;

  // Aides octroyées sans label
  let ledgerEvents = null;
  if ([106438171, 114270419].includes(invoice.thirdparty?.id)) {
    ledgerEvents = ledgerEvents ?? await getLedgerEvents(invoice.id);
    const lines = ledgerEvents.filter(event => ['6571', '6571002'].includes(event.planItem.number));
    if (!lines.length) return 'écriture "6571" manquante';
  }

  // Ecarts de conversion de devise
  if (invoice.currency !== 'EUR') {
    ledgerEvents = ledgerEvents ?? await getLedgerEvents(invoice.id);
    const diffLine = ledgerEvents.find(line => line.planItem.number === '4716001');
    console.log({diffLine});
    if (diffLine) {
      if (parseFloat(diffLine.amount) < 0)
        return 'Les écarts de conversions de devises doivent utiliser le compte 477';
      else
        return 'Les écarts de conversions de devises doivent utiliser le compte 476';
    }

    console.log({ledgerEvents});
  }

  // Stripe fees invoice
  if (invoice.thirdparty?.id === 115640202) return null;

  // ID card
  if (invoice.thirdparty?.id === 106519227 && invoice.invoice_number?.startsWith('ID ')) return null;

  // Has transaction attached
  const groupedDocuments = (await getDocument(invoice.id)).grouped_documents;
  if (!groupedDocuments?.some(doc => doc.type === 'Transaction'))
    return 'pas de transaction attachée';

  ledgerEvents = ledgerEvents ?? await getLedgerEvents(invoice.id);

  if (ledgerEvents.find(line => line.planItem.number === '4716001'))
    return "Une ligne d'écriture utilise un compte d'attente 4716001";

  return null;
}

/** Add "has transaction" symbol on status column whith the invoices list *
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

/** Test whether the given invoice is valid */
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
  const direction = getParam(location.href, 'direction') ?? 'supplier';
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
    alert('unable to find invalid invoice in the cache, await end invoices scanning');
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
  const [id] = invalid;
  const direction = (await getDocument(invalid)).direction;
  const isValid = direction === 'customer' ? customerInvoiceIsValid : supplierInvoiceIsValid;
  const invoice = await getInvoice(id);
  if (!invoice) {
    // document passé en GED
    delete cache[id];
    localStorage.setItem('invoicesValidation', JSON.stringify(cache));
    return nextInvalidInvoice();
  }
  if (await isValid(invoice)) {
    cache[id].valid = true;
    localStorage.setItem('invoicesValidation', JSON.stringify(cache));
    setTimeout(nextInvalidInvoice, 0);
    return;
  }
  if (direction === 'customer')
    console.log({ invoice, isValid, message: await supplierInvoiceInvalidReason(invoice) });
  const url = location.href.replace(/accountants.*$/, `documents/${invalid[0]}.html`);
  document.body.appendChild(parseHTML(`<div class="open_tab" data-url="${escape(url)}" style="display: none;"></div>`));
}

function getRandomArrayItem (array) {
  if (!array.length) return null;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function getParam (url, paramName) {
  return new URL(url).searchParams.get(paramName);
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

async function getLedgerEvents (itemOrId) {
  const item = typeof itemOrId === 'number' ? await getDocument(itemOrId) : itemOrId;
  const documents = (item)?.grouped_documents ?? [];
  const documentsIds = documents.map(doc => doc.id);
  const events = await Promise.all(documentsIds.map(async id => {
    const response = await apiRequest(`accountants/operations/${id}/ledger_events`, null, 'GET');
    return await response.json();
  }));
  return [].concat(...events);
}

window.getLedgerEvents = getLedgerEvents;

/** Open next invalid transaction */
/**
 * Dans la page des transactions, utiliser le code suivant pour afficher une transaction :
getReactProps($('tbody tr'),5).extra.openSidePanel(transactionId);
 */

/** Add validation state on transaction panel */
setInterval(async () => {
  if (!findElem('h3', 'Transactions')) return;                     // Not in transactions panel
  if (!$('.paragraph-body-m+.heading-page.mt-1')) return;          // Has no transaction open
  const tagsContainer = parentElement(findElem('button', 'Chercher parmi les factures'), 4)
    ?.children[1]?.firstElementChild;

  if ($('.tag-is-valid')) return;
  if (!tagsContainer && $('.headband-is-valid')) return;

  const transaction = getReactProps($('.paragraph-body-m+.heading-page.mt-1'), 9).transaction;

  tagsContainer?.appendChild(parseHTML(`
    <div class="tag-is-valid sc-aYaIB kSlEke d-inline-block overflow-visible px-0_5 sc-iMTngq haHjuB" role="status">
      <div class="sc-iGgVNO clwwQL d-flex justify-content-evenly align-items-center">
        <span class="text-truncate text-nowrap">⟳</span>
      </div>
    </div>
  `));
  findElem('span', 'Attention !')?.nextElementSibling.classList.add('headband-is-valid');
  if (!$('.headband-is-valid'))
    $('.paragraph-body-m.text-primary-900.text-truncate')?.classList.add('headband-is-valid');

  if (!$('.headband-is-valid') && !$('.tag-is-valid')) return;
  console.log({transaction});

  const invalidMessage = await getTransactionInvalidMessage(transaction);

  if (invalidMessage && $('.headband-is-valid')) {
    $('.headband-is-valid').textContent = invalidMessage;
  }

  const tag = $('.tag-is-valid span');
  if (tag) {
    if (invalidMessage) {
      tag.textContent = '✗ ' + invalidMessage;
      $('.tag-is-valid').classList.add('bg-warning-300', 'text-warning-800');
    } else {
      tag.textContent = '✓';
    }
  }
}, 200);

async function getTransactionInvalidMessage (transaction) {
  const transactionDocument = ('grouped_documents' in transaction) ? transaction
    : await getDocument(transaction.id);
  const groupedDocuments = transactionDocument.grouped_documents;

  // justificatif demandé
  if (transactionDocument.is_waiting_details) return null;

  // N'afficher que les transaction avant 2024
  if (transactionDocument.date.startsWith('2024')) return null;

  const ledgerEvents = await getLedgerEvents(transactionDocument);

  if (transaction.id == getParam(location.href, 'transaction_id'))
    console.log('getTransactionInvalidMessage', {transaction, transactionDocument, groupedDocuments, ledgerEvents});

  //if (groupedDocuments.length < 2) return 'justificatif manquant';

  if (ledgerEvents.find(line => line.planItem.number === '6288'))
    return 'Une ligne d\'écriture comporte le numéro de compte 6288';

  // balance déséquilibrée
  const third = ledgerEvents.find(line => line.planItem.number.startsWith('40'))?.planItem?.number;
  if (third) {
    const balance = ledgerEvents.reduce((sum, line) => {
      return sum + (line.planItem.number == third ? parseFloat(line.amount) : 0);
    }, 0);
    if (balance !== 0) return 'Balance déséquilibrée.';
  }

  // Aides octroyées sans label
  if(ledgerEvents.some(line => line.planItem.number.startsWith('6571') && !line.label))
    return 'nom du bénéficiaire manquant dans l\'écriture "6571"';

  if (ledgerEvents.some(line => line.planItem.number.startsWith('445')))
    return 'Une écriture comporte un compte de TVA';

  if (ledgerEvents.some(line => line.planItem.number.startsWith('41')))
    return 'Une écriture comporte un compte d\'attente';

  return null;
}

function parentElement (child, steps = 1) {
  let parent = child;
  for (let i = 0; i < steps; ++i) parent = parent?.parentElement;
  return parent;
}
window.parentElement = parentElement;

(() => {
  const to = setInterval(loadInvalidTransactions, 200);
  const cache = JSON.parse(localStorage.getItem('transactionValidation') ?? '{}');
  let loading = null;

  function loadInvalidTransactions () {
    if (!findElem('h3', 'Transactions')) return;
    clearInterval(to);
    cache.page = cache.page ?? 1;
    loading = loadTransactionsValidation();
    document.addEventListener('click', nextInvalidTransaction);
  }

  async function loadTransactionsValidation () {
    await findTransaction({page:cache.page}, async (transaction, page) => {
      const message = await getTransactionInvalidMessage(transaction);
      const valid = !message;
      cache[transaction.id] = { valid, page, id: transaction.id, message };
      cache.page = page;
      localStorage.setItem('transactionValidation', JSON.stringify(cache));
    });
  }

  async function nextInvalidTransaction () {
    document.removeEventListener('click', nextInvalidTransaction);
    console.log('nextInvalidTransaction');
    const current = getParam(location.href, 'transaction_id');
    let transaction = Object.values(cache)
      .filter(status => status.id != current)
      .find(status => status.valid === false);
    console.log(transaction && jsonClone(transaction));
    if (!transaction) {
      alert('impossible de trouver une transaction invalide dans le cache, attente de la fin du scan');
      await loading;
      transaction = Object.values(cache)
        .filter(status => status.id != current)
        .find(status => status.valid === false);
      console.log(transaction && jsonClone(transaction));
    }
    if (!transaction) {
      if (!confirm('toutes les transactions semblent valides. Revérifier depuis le début ?')) return;
      cache.page = 1;
      await Promise.race([
        loadTransactionsValidation(),
        new Promise(async rs => {
          while (!transaction) {
            await new Promise(end => setTimeout(end, 2000));
            transaction = Object.values(cache)
              .filter(status => status.id != current)
              .find(status => status.valid === false);
          }
          rs();
        }),
      ]);
      console.log(transaction && jsonClone(transaction));
    }
    if (!transaction) {
      alert('toutes les transactions sont valides selon les paramètres actuels');
      return;
    }
    let transactionDocument = await getDocument(transaction.id);
    let invalidMessage = await getTransactionInvalidMessage(transactionDocument);
    if (invalidMessage?.includes('écriture')) {
      const data = {oldMessage: invalidMessage};
      transactionDocument = await reloadLedgerEvents(transaction.id);
      invalidMessage = await getTransactionInvalidMessage(transactionDocument);
      console.log('reload ledger events', {...data, invalidMessage});
    }
    if (!invalidMessage) {
      console.log('transaction is valid', {transaction:jsonClone(transaction), transactionDocument, invalidMessage});
      cache[transaction.id].valid = true;
      localStorage.setItem('transactionValidation', JSON.stringify(cache));
      setTimeout(nextInvalidTransaction, 0);
      return;
    }
    console.log('nextInvalidTransaction', invalidMessage, { transaction });
    openDocument(transaction.id, {
      period_start: getParam(location.href, 'period_start'),
      period_end: getParam(location.href, 'period_end'),
    });
  }
})();

function jsonClone (obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.log('unable to jsonClone this object', obj);
    console.log(e);
    return obj;
  }
}

async function findTransaction (params, cb) {
  const url = new URL(`http://a.a/accountants/wip/transactions`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  let page = parseInt(url.searchParams.get('page'));
  if (isNaN(page)) {
    console.error('findTransaction page is NaN', {params, url, page});
    page = 1;
  }
  let response, data, transactions;
  do {
    response = await apiRequest(url.toString().replace('http://a.a/', ''), null, 'GET');
    data = await response.json();
    transactions = data.transactions;
    if (!transactions?.length) return null;
    console.log('findTransaction page', {page, response, data, transactions});
    for (const transaction of transactions) if (await cb(transaction, page)) return transaction;
    page += 1;
    url.searchParams.set('page', page);
  } while (page <= data.pagination.pages);
}

function openDocument (documentId, params = {}) {
  const url = new URL(location.href.replace(/accountants.*$/, `documents/${documentId}.html`));
  Object.entries(params).forEach(([key, value]) => { url.searchParams.set(key, value); });
  openTab(url.toString());
}

function openTab (url) {
  document.body.appendChild(
    parseHTML(`<div class="open_tab" data-url="${escape(url)}" style="display: none;"></div>`)
  );
}

async function getTransaction (id) {
  const response = await apiRequest(`accountants/wip/transactions/${id}`, null, 'GET');
  return await response.json();

}

async function reloadLedgerEvents (id) {
  const response = await apiRequest(`documents/${id}/settle`);
  return await response.json();
}
