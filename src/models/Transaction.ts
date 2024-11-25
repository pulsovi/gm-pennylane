import type { RawTransactionMin } from '../api/types.d.ts';
import { getParam } from '../_';

import { documentMatching } from '../api/document.ts';
import ValidableDocument from './ValidableDocument.ts';
import { getTransaction } from '../api/transaction.ts';
import Document from './Document.ts';

export default class Transaction extends ValidableDocument {
  protected transactionMin: RawTransactionMin;

  constructor(transactionOrId: RawTransactionMin | number) {
    const id = 'number' === typeof transactionOrId ? transactionOrId : transactionOrId.id;
    super({id});
    if ('object' === typeof transactionOrId) this.transactionMin = transactionOrId;
  }

  protected async loadValidMessage () {
    const isCurrent = this.id === Number(getParam(location.href, 'transaction_id'));
    if (isCurrent) console.log('Transaction getValidMessage', this);

    const doc = await this.getDocument();

    if (
      doc.label.toUpperCase().startsWith('VIR ')
      && !doc.label.includes(' DE: STRIPE MOTIF: STRIPE REF: STRIPE-')
    ) {
      return 'Virement reçu sans justificatif';
    }

    // N'afficher que les transaction avant 2024
    //if (doc.date.startsWith('2024')) return 'OK';

    // Transaction archivée
    if (doc.archived) return 'OK';


    const ledgerEvents = await this.getLedgerEvents();

    if(ledgerEvents.some(line => line.planItem.number.startsWith('6571'))) {
      if (ledgerEvents.some(line => line.planItem.number.startsWith('6571') && !line.label)) {
        // Aides octroyées sans label
        return 'nom du bénéficiaire manquant dans l\'écriture "6571"';
      }
    } else {
      const groupedDocuments = await this.getGroupedDocuments();
      for (const doc of groupedDocuments) {
        if (doc.type !== 'Invoice') continue;
        const thirdparty = await new Document(doc).getThirdparty();
        if ([106438171, 114270419].includes(thirdparty.id)) {
          // Aides octroyées sans compte d'aide
          return 'contrepartie "6571" manquante<br/>-&gt; envoyer la page à David.';
        }
      }
    }

    // Les associations ne gèrent pas la TVA
    if (ledgerEvents.some(line => line.planItem.number.startsWith('445')))
      return 'Une écriture comporte un compte de TVA';

    // Pas de rapprochement bancaire
    const recent = (Date.now() - new Date(doc.date).getTime()) < 86_400_000 * 30;
    if (!recent && ledgerEvents.some(line => line.planItem.number.startsWith('512') && !line.reconciliation_id))
      return 'Cette transaction n\'est pas rattachée à un rapprochement bancaire';

    // justificatif demandé
    if (!doc.is_waiting_details || isCurrent) {
      if (ledgerEvents.find(line => line.planItem.number === '6288'))
        return 'Une ligne d\'écriture comporte le numéro de compte 6288';

      if (ledgerEvents.find(line => line.planItem.number === '4716001'))
        return "Une ligne d'écriture utilise un compte d'attente 4716001";

      if (ledgerEvents.some(line => line.planItem.number.startsWith('41')))
        return 'Une écriture comporte un compte d\'attente';

      // balance déséquilibrée
      const third = ledgerEvents.find(line => line.planItem.number.startsWith('40'))?.planItem?.number;
      if (third) {
        const thirdEvents = ledgerEvents.filter(line => line.planItem.number === third);
        const balance = thirdEvents.reduce((sum, line) => sum + parseFloat(line.amount), 0);
        if (this.id === Number(getParam(location.href, 'transaction_id')))
          console.log(this.constructor.name, 'loadValidMessage: Balance', Math.abs(balance) > 0.001 ? 'déséquilibrée' : 'OK', { third, thirdEvents, balance, ledgerEvents, [this.constructor.name]: this });
        if (Math.abs(balance) > 0.001) {
          // On a parfois des calculs qui ne tombent pas très juste en JS
          return `Balance déséquilibrée: ${balance}`;
        }
      }

      // Pas plus d'exigence pour les petits montants
      if (Math.abs(parseFloat(doc.currency_amount)) < 100) return 'OK';

      // Justificatif manquant
      const attachmentOptional = Math.abs(parseFloat(doc.currency_amount)) < 100 || [
        'REMISE CHEQUE ',
        'VIR RECU ',
        'VIR INST RE ',
        'VIR INSTANTANE RECU DE: ',
      ].some(label => doc.label.startsWith(label));
      const attachmentRequired = doc.attachment_required && !doc.attachment_lost
        && (!attachmentOptional || isCurrent);
      const groupedDocuments = await this.getGroupedDocuments();
      const hasAttachment = groupedDocuments.length > 1;
      if (attachmentRequired && !hasAttachment) return 'Justificatif manquant';
    }

    return 'OK';
  }

  /** Add item to this transaction's group */
  async groupAdd (id: number) {
    const doc = await this.getDocument();
    const groups = doc.group_uuid;
    await documentMatching({ id, groups });
  }
}
