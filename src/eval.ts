import { last7DaysFilter } from './filters/last7DaysFilter.js';
import TransactionValidMessage from './pages/transactionPanel/ValidMessage.js';
import TransactionAddByIdButton from './pages/transactionPanel/AddByIdButton.js';
import NextInvalidInvoice from './pages/invoicePanel/NextInvalidInvoice.js';
import InvoiceDisplayInfos from './pages/invoicePanel/DisplayInfos.js';
import ArchiveGroupedDocument from './pages/transactionPanel/ArchiveGroupedDocument.js';
import NextInvalidTransaction from './pages/transactionPanel/NextInvalidTransaction.js';
import FixTab from './pages/invoicePanel/FixTab.js';
import AllowChangeArchivedInvoiceNumber from './pages/invoicePanel/AllowChangeArchivedInvoiceNumber.js';
import TransactionPanelHotkeys from './pages/transactionPanel/Hotkeys.js';
import EntryBlocInfos from './pages/EntryBlocInfos.js';
import AddInvoiceIdColumn from './pages/invoiceList/AddInvoiceIdColumn.js';
import { $, $$, findElem, parseHTML, waitElem } from './_/dom.js';
import Transaction from './models/Transaction.js';
import Invoice from './models/Invoice.js';
import RotateImg from './pages/transactionPanel/RotateImg.js';
import { getInvoice, getInvoicesList } from './api/invoice.js';
import { getDocument } from './api/document.js';
import { getGroupedDocuments, getLedgerEvents } from './api/operation.js';
import { getThirdparty } from './api/thirdparties.js';
import { getTransactionsList } from './api/transaction.js';
import { findReactProp, getReact, getReactProps } from './_/react.js';
import TransactionPannelStyle from './pages/transactionPanel/Style.js';
import AutoSearchTransaction from './pages/invoicePanel/AutoSearchTransaction.js';
import { getButtonClassName } from './_/getButtonClassName.js';
import DMSRotateImg from './pages/DMS/RotateImg.js';
import { GMXmlHttpRequest } from './_/gmXhr.js';
import DMSDisplayStatus from './pages/DMS/DisplayStatus.js';
import { getDMSItem, getDMSItemLinks, getDMSItemList, getDMSLinks } from './api/dms.js';
import OpenRefTransaction from './pages/invoicePanel/OpenRefTransaction.js';
import ImproveMatchSuggestions from './pages/transactionPanel/ImproveMatchSuggestions.js';
import { waitPage } from './navigation/waitPage.js';
import HighlightWrongDMSFilenames from './pages/transactionPanel/HighlightWrongDMSFilenames.js';
import DMSItem from './models/DMSItem.js';
import Document from './models/Document.js';
import Item from './models/Item.js';

last7DaysFilter();
AddInvoiceIdColumn.start();
AllowChangeArchivedInvoiceNumber.start();
ArchiveGroupedDocument.start();
AutoSearchTransaction.start();
DMSDisplayStatus.start();
DMSRotateImg.start();
EntryBlocInfos.start();
FixTab.start();
HighlightWrongDMSFilenames.start();
ImproveMatchSuggestions.start();
InvoiceDisplayInfos.start();
NextInvalidInvoice.start();
NextInvalidTransaction.start();
OpenRefTransaction.start();
RotateImg.start();
TransactionAddByIdButton.start();
TransactionPanelHotkeys.start();
TransactionPannelStyle.start();
TransactionValidMessage.start();

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

const augmentation = {
  GM_Pennylane_Version: /** version **/'0.1.31',
  GM: {
    API: {
      getDocument,
      getGroupedDocuments,
      getInvoice,
      getInvoicesList,
      getLedgerEvents,
      getThirdparty,
      getTransactionsList,
    },
    $$,
    $,
    findElem,
    findReactProp,
    getReact,
    getReactProps,
    parseHTML,
    waitElem: findElem,
    getButtonClassName,
    GMXmlHttpRequest,
    getDMSItem,
    getDMSLinks,
    getDMSItemLinks,
    getDMSItemList,
    getInvoicesList,
    getInvoice,
    waitPage,
    models: {
      Invoice,
      Transaction,
      DMSItem,
    },
  },
};
Object.assign(window, augmentation);
declare global {
  interface Window {
    GM_Pennylane_Version: string;
    GM: typeof augmentation['GM'];
  }
}

