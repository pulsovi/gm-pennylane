localStorage.setItem('invoicesPage', 1);
;(async function next () {
  async function _getDocument (id) {
    try {
      return await getDocument(id);
    } catch (error) {
      await new Promise(rs => setTimeout(rs, 1000));
      return _getDocument(id);
    }
  }
  const page = parseFloat(localStorage.getItem('invoicesPage') ?? 1);
  console.log({page});
  const response = await (await apiRequest(`accountants/invoices/list?page=${page}`, null, 'GET')).json();
  const {invoices} = response;
  if (!invoices?.length) return;
  let running = true;
  await Promise.all(invoices.map(async invoice => {
    const isValid =
      invoice.invoice_number.startsWith('¤')
      || (invoice.archived && invoice.invoice_number.startsWith('§'))
      || (invoice.thirdparty?.id === 106519227 && invoice.invoice_number.startsWith('ID '))
      || (await _getDocument(invoice.id)).grouped_documents?.some(doc => doc.type === 'Transaction');
    console.log(invoice.id);
    if (isValid || !running) return;
    running = false;
    const url = new URL(location.href);
    url.searchParams.set('id', invoice.id);
    console.log({invoice}, invoice.id);
    location.assign(url.toString());
  }));
  if (!running) return;
  localStorage.setItem('invoicesPage', page + 1);
  next();
})();
