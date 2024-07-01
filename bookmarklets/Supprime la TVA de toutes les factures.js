localStorage.setItem('invoicesPage', 1);
;(async function next () {
  let wait = false;
  async function _apiRequest (...args) {
    if (wait) await wait;
    const response = await apiRequest(...args);
    if (response.status !== 200) {
      console.log({response});
      wait = new Promise(rs => setTimeout(rs, 1000));
      return _apiRequest(...args);
    }
    return response;
  }
  const page = parseFloat(localStorage.getItem('invoicesPage') ?? 1);
  console.log({page});
  const response = await (await _apiRequest(`accountants/invoices/list?page=${page}&period_end=2030-12-31&period_start=2020-01-01&filter=[{"field":"status","operator":"in_scopes","value":"entry,validation_needed,complete,archived_filter"}]`, null, 'GET')).json();
  const {invoices} = response;
  if (!invoices?.length) {console.log('END'); return; }
  await Promise.all(invoices.map(async invoice => {
    console.log(invoice.id);
    if (invoice.invoice_lines.every(line => parseFloat(line.tax) === 0 || line.vat_rate === 'exempt')) return;
    delete invoice.invoice_lines;
    invoice.vat_rate = 'exempt';
    invoice.currency_tax = 0;
    invoice.currency_amount = parseFloat(invoice.amount);
    invoice.invoice_lines_attributes = [{
      currency_amount: parseFloat(invoice.amount),
      currency_tax: 0,
      vat_rate: "exempt"
    }];
    console.log({invoice});
    await _apiRequest(`/accountants/invoices/${invoice.id}`, {invoice}, 'PUT');
  }));
  localStorage.setItem('invoicesPage', page + 1);
  if (response?.pagination?.hasNextPage === false) return;
  next();
})();
