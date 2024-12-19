import type { APITransaction } from '../api/types.d.ts';
import { getParam } from '../_';

import { documentMatching } from '../api/document.ts';
import ValidableDocument from './ValidableDocument.ts';
import Document from './Document.ts';
import { getTransaction } from '../api/transaction.ts';

export default class Transaction extends ValidableDocument {
  protected _raw;
  protected _transaction: Promise<APITransaction>;
  protected transaction: APITransaction;

  constructor(raw: {id: number}) {
    super(raw);
    this._raw = raw
  }

  public async getTransaction (): Promise<APITransaction> {
    if (!this._transaction) {
      this._transaction = getTransaction(this.id);
      this.transaction = await this._transaction;
    }
    return await this._transaction;
  }

  protected async loadValidMessage () {
    const isCurrent = this.id === Number(getParam(location.href, 'transaction_id'));
    if (isCurrent) this.log('loadValidMessage', this);

    const ledgerEvents = await this.getLedgerEvents();

    // Fait partie d'un exercice clos
    if (ledgerEvents.some(event => event.closed)) return 'OK';

    const doc = await this.getDocument();

    // Transaction archivée
    if (doc.archived) return 'OK';

    const groupedDocuments = await this.getGroupedDocuments();

    // Pas de rapprochement bancaire
    const recent = (Date.now() - new Date(doc.date).getTime()) < 86_400_000 * 30;
    if (!recent && !groupedDocuments.find(gdoc => gdoc.id === doc.id)?.reconciled)
      return 'Cette transaction n\'est pas rattachée à un rapprochement bancaire';
    this.debug('loadValidMessage > rapprochement bancaire', {
      recent,
      reconciled: groupedDocuments.find(gdoc => gdoc.id === doc.id),
    });

    if (doc.label.includes(' DE: STRIPE MOTIF: ALLODONS REF: ')) {
      if (
        ledgerEvents.length !== 2
        || groupedDocuments.length > 1
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
        || !ledgerEvents.find(ev => ev.planItem.number === '754110001')
      ) return 'Virement Allodons mal attribué';
      return 'OK';
    }

    if (doc.label.toUpperCase().startsWith('VIR ')
      /*&& !doc.label.includes(' DE: STRIPE MOTIF: STRIPE REF: STRIPE-')*/
    ) {
      if (doc.label.includes(' DE: Stripe Technology Europe Ltd MOTIF: STRIPE ')) {
        if (
          ledgerEvents.length !== 2
          || groupedDocuments.length > 1
          || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
          || !ledgerEvents.find(ev => ev.planItem.number === '58000001')
        ) return 'Virement interne Stripe mal attribué';
        return 'OK';
      }
      const assos = [
        ' DE: JEOM MOTIF: ',
        ' DE: ASS UNE LUMIERE POUR MILLE',
        ' DE: MIKDACH MEAT ',
      ];
      if (assos.some(label => doc.label.includes(label))) {
        if (
          ledgerEvents.length !== 2
          || groupedDocuments.length > 1
          || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
          || !ledgerEvents.find(ev => ev.planItem.number === '75411')
        ) return 'Virement reçu d\'une association mal attribué';
        return 'OK';
      }
      const sansCerfa = [
        ' DE: MONSIEUR FABRICE HARARI MOTIF: ',
      ]
      if (sansCerfa.some(label => doc.label.includes(label))) {
        if (
          ledgerEvents.length !== 2
          || groupedDocuments.length > 1
          || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
          || !ledgerEvents.find(ev => ev.planItem.number === '75411')
        ) return 'Virement reçu avec CERFA optionel mal attribué';
        return 'OK';
      }
      if (groupedDocuments.length < 2) return `<a
          title="Ajouter le CERFA dans les pièces de réconciliation. Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Virement%20re%C3%A7u%20sans%20justificatif"
        >Virement reçu sans justificatif ⓘ</a>`;
      if (!groupedDocuments.find(gdoc => gdoc.label.includes('CERFA')))
        return 'Les virements reçus doivent être justifiés par un CERFA';
    }


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
        return 'Une écriture comporte un compte d\'attente (commençant par 47)';

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
      const balance = groupedDocuments
        .reduce<Partial<Record<'transaction'|'CHQ'|'CERFA'|'autre', number>>>((acc, gdoc) => {
          const value = parseFloat(gdoc.currency_amount ?? gdoc.amount);
          if (gdoc.type === 'Transaction') acc.transaction = (acc.transaction ?? 0) + value;
          else if (gdoc.label.includes('CHQ')) acc.CHQ = (acc.CHQ ?? 0) + value;
          else if (gdoc.label.includes('CERFA')) acc.CERFA = (acc.CERFA ?? 0) + value;
          else acc.autre = (acc.autre ?? 0) + value;
          return acc;
        }, {});
      let message = '';
      if (
        doc.label.startsWith('REMISE CHEQUE ')
        || doc.label.toUpperCase().startsWith('VIR ')
      ) {
        // On a parfois des calculs qui ne tombent pas très juste en JS
        if (Math.abs((balance.transaction ?? 0) - (balance.CERFA ?? 0)) > 0.001) {
          // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa
          message = 'La somme des CERFAs doit valoir le montant de la transaction';
          balance.CERFA = balance.CERFA ?? 0;
        }
      } else {
        if (Math.abs((balance.transaction ?? 0) - (balance.autre ?? 0)) > 0.001) {
          message = 'La somme des autres justificatifs doit valoir le montant de la transaction';
          balance.autre = balance.autre ?? 0;
        }
      }
      if (isCurrent) this.log('balance:', balance);
      if (message) {
        return `<a
          title="Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Balance%20v2"
        >Balance v2 déséquilibrée: ${message} ⓘ</a><ul>${Object.entries(balance)
          .sort(([keya], [keyb]) => {
            const keys = ['transaction', 'CHQ', 'CERFA', 'autre'];
            return keys.indexOf(keya) - keys.indexOf(keyb);
          })
          .map(([key, value]) => `<li><strong>${key} :</strong>${value}</li>`)
        .join('')}</ul>`;
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
