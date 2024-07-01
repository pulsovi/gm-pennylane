//localStorage.setItem('customerInvoicesPage', 1);
;(async function next () {
  async function _getDocument (id) {
    try {
      return await getDocument(id);
    } catch (error) {
      await new Promise(rs => setTimeout(rs, 1000));
      return _getDocument(id);
    }
  }
  const page = parseFloat(localStorage.getItem('customerInvoicesPage') ?? 1);
  console.log({page});
  const response = await (await apiRequest(`accountants/invoices/list?page=${page}&direction=customer`, null, 'GET')).json();
  const {invoices} = response;
  if (!invoices?.length) return;
  let running = true;
  await Promise.all(invoices.map(async invoice => {
    const isValid = 
      (invoice.thirdparty?.id === 103165930 && !invoice.date && !invoice.deadline)
      || (invoice.thirdparty?.id === 113420582 && !invoice.date && !invoice.deadline && invoice.invoice_number?.startsWith('ID '))
    ;
    console.log(invoice.id);
    if (isValid || !running) return;
    running = false;
    const url = new URL(location.href);
    url.searchParams.set('id', invoice.id);
    console.log({invoice}, invoice.id);
    location.assign(url.toString());
  }));
  if (!running) return;
  localStorage.setItem('customerInvoicesPage', page + 1);
  next();
})();
