javascript:/* Réconcilier de force */
(async function IIFE() {
  async function apiRequest (endpoint, data, method = 'POST') {
    return await fetch(`${location.href.split('/').slice(0, 5).join('/')}/${endpoint}`, {
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
        "X-DOCUMENT-REFERRER": "https://app.pennylane.com/companies/21936866/accountants/transactions",
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

  async function getGUUID (documentId) {
    const response = await apiRequest(`documents/${documentId}`, null, 'GET');
    const data = await response.json();
    console.log('getGUUID', {data});
    return data.group_uuid;
  }

  async function match (transactionId, invoiceGUUID) {
    console.log('match', { transactionId, invoiceGUUID });
    await apiRequest(
      `documents/${transactionId}/matching`,
      { matching:{unmatch_ids:[], group_uuids:[invoiceGUUID] } },
      'PUT'
    );
  }

  const transactionId = prompt('ID de la transaction ?');
  const invoiceId = prompt('ID de la facture ?');
  const invoiceGUUID = await getGUUID(invoiceId);
  console.log({transactionId, invoiceId, invoiceGUUID});
  match(transactionId, invoiceGUUID).then(() => alert('fait !'));
})();
