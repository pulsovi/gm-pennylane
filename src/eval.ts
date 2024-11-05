import { last7DaysFilter } from './filters/last7DaysFilter.js';
import TransactionValidMessage from './transactionPanel/ValidMessage.js';
import TransactionAddByIdButton from './transactionPanel/AddByIdButton.js';
import NextInvalidInvoice from './invoicePanel/NextInvalidInvoice.js';
import InvoiceDisplayInfos from './invoicePanel/DisplayInfos.js';
import ArchiveGroupedDocument from './transactionPanel/ArchiveGroupedDocument.js';
import NextInvalidTransaction from './transactionPanel/NextInvalidTransaction.js';
import FixTab from './invoicePanel/fixTab.js';

last7DaysFilter();
TransactionValidMessage.start();
TransactionAddByIdButton.start();
NextInvalidInvoice.start();
NextInvalidTransaction.start();
InvoiceDisplayInfos.start();
ArchiveGroupedDocument.start();
FixTab.start();

/*
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
*/
