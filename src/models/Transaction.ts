import type { RawTransaction } from '../api/types.d.ts';
import { getParam } from '../_';

import { documentMatching } from '../api/document.ts';
import ValidableDocument from './ValidableDocument.ts';

export default class Transaction extends ValidableDocument {
  protected transaction: RawTransaction;

  constructor(transactionOrId: RawTransaction | number) {
    const id = 'number' === typeof transactionOrId ? transactionOrId : transactionOrId.id;
    super({id});
    if ('object' === typeof transactionOrId) this.transaction = transactionOrId;
  }

  protected async loadValidMessage () {
    if (this.id === Number(getParam(location.href, 'transaction_id')))
      console.log('Transaction getValidMessage', this);

    const doc = await this.getDocument();

    // justificatif demandé
    if (doc.is_waiting_details) return 'OK';

    // N'afficher que les transaction avant 2024
    if (doc.date.startsWith('2024')) return 'OK';

    const ledgerEvents = await this.getLedgerEvents();

    //if (doc.grouped_documents.length < 2) return 'justificatif manquant';

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

    if (ledgerEvents.find(line => line.planItem.number === '4716001'))
      return "Une ligne d'écriture utilise un compte d'attente 4716001";

    if (ledgerEvents.some(line => line.planItem.number.startsWith('41')))
      return 'Une écriture comporte un compte d\'attente';

    return 'OK';
  }

  /** Add item to this transaction's group */
  async groupAdd (id: number) {
    const doc = await this.getDocument();
    const groups = doc.group_uuid;
    await documentMatching({ id, groups });
  }
}
