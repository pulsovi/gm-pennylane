import type { RawTransactionMin } from '../api/types.d.ts';
import { getParam } from '../_';

import { documentMatching } from '../api/document.ts';
import ValidableDocument from './ValidableDocument.ts';
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
    if (isCurrent) this.log('loadValidMessage', this);

    const doc = await this.getDocument();
    const groupedDocuments = await this.getGroupedDocuments();

    // Transaction archivée
    if (doc.archived) return 'OK';

    if (
      !doc.date.startsWith('2023')
      && doc.label.toUpperCase().startsWith('VIR ')
      && ![
        ' DE: STRIPE MOTIF: STRIPE REF: STRIPE-',
        ' DE: STRIPE MOTIF: ALLODONS REF: ',
        ' DE: Stripe Technology Europe Ltd MOTIF: STRIPE ',
      ].some(label => doc.label.includes(label))
      && groupedDocuments.length < 2
    ) {
      return 'Virement reçu sans justificatif';
    }

    const ledgerEvents = await this.getLedgerEvents();

    if(ledgerEvents.some(line => line.planItem.number.startsWith('6571'))) {
      if (ledgerEvents.some(line => line.planItem.number.startsWith('6571') && !line.label)) {
        // Aides octroyées sans label
        return 'nom du bénéficiaire manquant dans l\'écriture "6571"';
      }
    } else {
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
    if (!recent && !groupedDocuments.find(gdoc => gdoc.id === doc.id)?.reconciled)
      return 'Cette transaction n\'est pas rattachée à un rapprochement bancaire';

    if (
      // si justificatif demandé, sauter cette section
      !doc.is_waiting_details
      || isCurrent
    ) {
      if (ledgerEvents.find(line => line.planItem.number === '6288'))
        return 'Une ligne d\'écriture comporte le numéro de compte 6288';

      if (ledgerEvents.find(line => line.planItem.number === '4716001'))
        return "Une ligne d'écriture utilise un compte d'attente 4716001";

      if (ledgerEvents.some(line => line.planItem.number.startsWith('47')))
        return 'Une écriture comporte un compte d\'attente';

      // balance déséquilibrée
      const third = ledgerEvents.find(line => line.planItem.number.startsWith('40'))?.planItem?.number;
      if (third) {
        const thirdEvents = ledgerEvents.filter(line => line.planItem.number === third);
        const balance = thirdEvents.reduce((sum, line) => sum + parseFloat(line.amount), 0);
        if (this.id === Number(getParam(location.href, 'transaction_id')))
          this.log('loadValidMessage: Balance', Math.abs(balance) > 0.001 ? 'déséquilibrée' : 'OK', this);
        if (Math.abs(balance) > 0.001) {
          // On a parfois des calculs qui ne tombent pas très juste en JS
          return `Balance déséquilibrée: ${balance}`;
        }
      }

      // balance déséquilibrée - version exigeante
      const balance = groupedDocuments.reduce((acc, gdoc) => {
        const isTransaction = gdoc.type === 'Transaction';
        // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa
        const isRemise = doc.label.startsWith('REMISE CHEQUE ');
        const coeff = isTransaction ? (isRemise ? -2 : -1) : 1;
        const value = parseFloat(gdoc.currency_amount ?? gdoc.amount);
        if (isCurrent) this.log({ isTransaction, isRemise, coeff, acc, value });
        return acc + (coeff * value);
      }, 0);
      if (Math.abs(balance) > 0.001) {
        // On a parfois des calculs qui ne tombent pas très juste en JS
        return `<a
          title="Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Balance%20v2"
        >Balance v2 déséquilibrée: ${balance} ⓘ</a>`;
      }

      // Pas plus d'exigence pour les petits montants
      if (Math.abs(parseFloat(doc.currency_amount)) < 100) return 'OK';

      // Justificatif manquant
      if(doc.date.startsWith('2023')) return 'OK';
      const attachmentOptional =
        Math.abs(parseFloat(doc.currency_amount)) < 100
        || [
          ' DE: STRIPE MOTIF: ALLODONS REF: ',
        ].some(label => doc.label.includes(label))
        || [
          'REMISE CHEQUE ',
          'VIR RECU ',
          'VIR INST RE ',
          'VIR INSTANTANE RECU DE: ',
        ].some(label => doc.label.startsWith(label));
      const attachmentRequired = doc.attachment_required && !doc.attachment_lost
        && (!attachmentOptional || isCurrent);
      const hasAttachment = groupedDocuments.length > 1;
      if (isCurrent) this.log({ attachmentOptional, attachmentRequired, groupedDocuments, hasAttachment });
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
