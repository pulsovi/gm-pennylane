import { last7DaysFilter } from './filters/last7DaysFilter.js';
import TransactionValidMessage from './pages/transactionPanel/ValidMessage.js';
import TransactionAddByIdButton from './pages/transactionPanel/AddByIdButton.js';
import NextInvalidInvoice from './pages/invoicePanel/NextInvalidInvoice.js';
import InvoiceDisplayInfos from './pages/invoicePanel/DisplayInfos.js';
import ArchiveGroupedDocument from './pages/transactionPanel/ArchiveGroupedDocument.js';
import NextInvalidTransaction from './pages/transactionPanel/NextInvalidTransaction.js';
import FixTab from './pages/invoicePanel/fixTab.js';
import AllowChangeArchivedInvoiceNumber from './pages/invoicePanel/AllowChangeArchivedInvoiceNumber.js';
import TransactionPanelHotkeys from './pages/transactionPanel/Hotkeys.js';
import EntryBlocInfos from './pages/EntryBlocInfos.js';
import AddInvoiceIdColumn from './pages/invoiceList/AddInvoiceIdColumn.js';

last7DaysFilter();
TransactionValidMessage.start();
TransactionAddByIdButton.start();
NextInvalidInvoice.start();
NextInvalidTransaction.start();
InvoiceDisplayInfos.start();
ArchiveGroupedDocument.start();
FixTab.start();
AllowChangeArchivedInvoiceNumber.start();
TransactionPanelHotkeys.start();
EntryBlocInfos.start();
AddInvoiceIdColumn.start();

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

declare global {
  interface Window {
    GM_Pennylane_Version: string;
  }
}

Object.assign(window, { GM_Pennylane_Version:
/** version **/'0.1.16'
});
