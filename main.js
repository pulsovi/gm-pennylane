
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
