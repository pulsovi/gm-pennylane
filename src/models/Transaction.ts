import { documentMatching } from '../api/document.js';
import ValidableDocument from './ValidableDocument.js';
import Document from './Document.js';
import { getTransaction } from '../api/transaction.js';
import { GroupedDocumentsEntity } from '../api/Document/index.js';
import { getParam } from '../_/url.js';
import { APIDMSLink } from '../api/DMS/Link.js';
import DMSItem from './DMSItem.js';
import { createDMSLink } from '../api/dms.js';
import { jsonClone } from '../_/json.js';
import Balance from './Balance.js';
import { APITransactionLite } from '../api/Transaction/Lite.js';

const user = localStorage.getItem('user') ?? 'assistant';

export default class Transaction extends ValidableDocument {
  protected _raw: { id: number; };
  protected _transaction: Promise<APITransactionLite> | APITransactionLite;
  protected _balance: SyncOrPromise<Balance>;

  constructor(raw: { id: number }) {
    super(raw);
    this._raw = raw
  }

  public async getTransaction(): Promise<APITransactionLite> {
    if (!this._transaction) {
      this._transaction = getTransaction(this.id);
      this._transaction = await this._transaction;
    }
    if (this._transaction instanceof Promise) return await this._transaction;
    return this._transaction;
  }

  public async getDMSLinks(): Promise<APIDMSLink[]> {
    return await super.getDMSLinks('Transaction');
  }

  private isCurrent() {
    return String(this.id) === getParam(location.href, 'transaction_id');
  }

  public async getBalance(): Promise<Balance> {
    if (!this._balance) {
      this._balance = new Promise(async rs => {
        const ledgerEvents = await this.getLedgerEvents();
        const groupedDocuments = await this.getGroupedDocuments();
        const dmsLinks = await this.getDMSLinks();

        // balance déséquilibrée - version exigeante
        const balance: Balance = new Balance();

        groupedDocuments
          .sort((a, b) => Number(b.type === 'Transaction') - Number(a.type === 'Transaction'))
          .forEach(gdoc => {
            if (this.isCurrent()) this.debug('balance counting', jsonClone({ gdoc, balance }));
            const coeff = (gdoc.type === 'Invoice' && gdoc.journal.code === 'HA') ? -1 : 1;
            const value = parseFloat(gdoc.amount) * coeff;
            if (gdoc.type === 'Transaction') balance.addTransaction(value);
            else if (/ CERFA | AIDES - /u.test(gdoc.label)) balance.addReçu(value);
            else if (/ CHQ(?:\d|\s)/u.test(gdoc.label)) balance.addCHQ(value);
            else balance.addAutre(value);
          });

        dmsLinks.forEach(dmsLink => {
          if (this.isCurrent()) this.debug('balance counting', jsonClone({ dmsLink, balance }));
          if (dmsLink.name.startsWith('CHQ')) {
            const amount = dmsLink.name.match(/- (?<amount>[\d \.]*) ?€$/u)?.groups.amount;
            balance.addCHQ(parseFloat(amount ?? '0') * Math.sign(balance.transaction));
          }
          if (/^(?:CERFA|AIDES) /u.test(dmsLink.name)) {
            if (this.isCurrent()) this.log('aide trouvée', { dmsLink });
            const amount = dmsLink.name.match(/- (?<amount>[\d \.]*) ?€$/u)?.groups.amount;
            balance.addReçu(parseFloat(amount ?? '0') * Math.sign(balance.transaction));
          }
        });

        ledgerEvents.forEach(event => {
          // pertes/gains de change
          if (['47600001', '656', '75800002'].includes(event.planItem.number)) {
            balance.addAutre(parseFloat(event.amount) * -1);
          }
        });

        rs(balance);
      });
      this._balance = await this._balance;
    }
    if (this._balance instanceof Promise) return await this._balance;
    return this._balance;
  }

  protected async loadValidMessage(): Promise<string> {
    if (this.isCurrent()) this.log('loadValidMessage', this);

    const status = (
      await this.isClosed()
      ?? await this.isArchived()
      ?? await this.hasMalnammedDMSLink()
      ?? await this.is2025()
      ?? await this.hasVAT()
      ?? await this.isMissingBanking()
      ?? await this.hasToSendToInvoice()
      ?? await this.isUnbalanced()
      ?? await this.isMissingCounterpart()
      ?? await this.isWrongDonationCounterpart()
      ?? await this.isTrashCounterpart()
      ?? await this.hasUnbalancedThirdparty()

      //?? await this.isMissingAttachment() // déjà inclus dans isUnbalanced()
      ?? await this.isOldUnbalanced()
      ?? await this.isBankFees()
      ?? await this.isAllodons()
      ?? await this.isDonationRenewal()
      ?? await this.isTransfer()
      ?? await this.isAid()
      ?? await this.hasToSendToDMS()
      ?? 'OK'
    ) as string;

    if (user !== 'assistant') return status;

    const assistant = [
      'orange',
    ];
    if (
      assistant.some(needle => status.includes(needle)) === (user === 'assistant')
      || this.isCurrent()
    ) return status;
    return 'OK';
  }

  private async is2025() {
    if (this.isCurrent()) this.log('is2025');
    const doc = await this.getDocument();

    if (doc.date.startsWith('2025')) {
      return (
        await this.isUnbalanced()
        ?? await this.isMissingAttachment()
        ?? await this.hasToSendToDMS()
        ?? 'OK'
      );
    }
  }

  private async isClosed() {
    const ledgerEvents = await this.getLedgerEvents();

    // Fait partie d'un exercice clos
    if (ledgerEvents.some(event => event.closed)) {
      if (this.isCurrent()) this.log('fait partie d\'un exercice clos');
      return 'OK';
    }
  }

  private async isArchived() {
    // Transaction archivée
    const doc = await this.getDocument();
    if (doc.archived) {
      if (this.isCurrent()) this.log('transaction archivée');
      return 'OK';
    }
  }

  private async hasMalnammedDMSLink() {
    // Fichiers DMS mal nommés
    const dmsLinks = await this.getDMSLinks();
    for (const dmsLink of dmsLinks) {
      const dmsItem = new DMSItem({ id: dmsLink.item_id });
      const dmsStatus = await dmsItem.getValidMessage();
      if (dmsStatus !== 'OK') return `Corriger les noms des fichiers attachés dans l'onglet "Réconciliation" (surlignés en orange)`;
    }
  }

  private async isMissingBanking() {
    // Pas de rapprochement bancaire
    const doc = await this.getDocument();
    const groupedDocuments = await this.getGroupedDocuments();
    const groupedDoc = groupedDocuments.find(gdoc => gdoc.id === doc.id) as GroupedDocumentsEntity;

    const recent = (Date.now() - new Date(doc.date).getTime()) < 86_400_000 * 30;
    if (!recent && !groupedDoc.reconciled) {
      return `<a
        title="Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FRapprochements%20bancaires"
      >Cette transaction n\'est pas rattachée à un rapprochement bancaire ⓘ</a>`
    }
    this.debug('loadValidMessage > rapprochement bancaire', {
      recent,
      reconciled: groupedDocuments.find(gdoc => gdoc.id === doc.id),
    });
  }

  private async hasUnbalancedThirdparty (){
    const ledgerEvents = await this.getLedgerEvents();

    const thirdparties: Record<string, number> = ledgerEvents.reduce((tp, event) => {
      const nb = event.planItem.number;
      if (nb.startsWith('4')) {
        tp[nb] = (tp[nb] ?? 0) + parseFloat(event.amount);
      }
      return tp;
    }, {});
    const [unbalanced] = Object.entries(thirdparties).find(([key, val]) => val !== 0) ?? [];
    if (unbalanced) {
      this.log('hasUnbalancedThirdparty', { ledgerEvents, thirdparties, unbalanced });
      return `Le compte tiers "${unbalanced}" n'est pas équilibré.`;
    }
  }

  private async isUnbalanced() {
    if (this.isCurrent()) this.log('isUnbalanced');
    const balance = await this.getBalance();
    if (this.isCurrent()) this.log({ balance });

    let message = (
      await this.isCheckRemittance(balance)
      ?? await this.hasUnbalancedCHQ(balance)
      ?? await this.hasUnbalancedReceipt(balance)
      ?? await this.isOtherUnbalanced(balance)
    );
    if (this.isCurrent()) this.log('balance:', { balance, message, balanceJSON: balance.toJSON() });

    if (message) {
      return `<a
        title="Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Balance%20v2#${escape(message)}"
      >Balance déséquilibrée: ${message} ⓘ</a><ul>${Object.entries(balance.toJSON())
          .sort(([keya], [keyb]) => {
            const keys = ['transaction', 'CHQ', 'reçu', 'autre'];
            return keys.indexOf(keya) - keys.indexOf(keyb);
          })
          .map(([key, value]) => `<li><strong>${key} :</strong>${value}${(key !== 'transaction' && balance.transaction && value !== balance.transaction) ? ` (diff : ${balance.transaction - value})` : ''}</li>`)
          .join('')}</ul>`;
    }
    if (this.isCurrent()) this.log('fin contrôle balance', { message });
  }

  private async isCheckRemittance(balance: Balance) {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const aidLedgerEvent = ledgerEvents.find(line => line.planItem.number.startsWith('6571'));

    // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa
    if (
      doc.label.startsWith('REMISE CHEQUE ')
      || aidLedgerEvent && doc.label.startsWith('CHEQUE ')
    ) {
      // Pour les remises de chèques, on a deux pièces justificatives necessaires : le chèque et le cerfa
      // On a parfois des calculs qui ne tombent pas très juste en JS
      if (Math.abs(balance.transaction - balance.reçu) > 0.001) {
        balance.addReçu(null);
        if (this.isCurrent()) this.log('isCheckRemittance(): somme des reçus incorrecte');
        return 'La somme des reçus doit valoir le montant de la transaction';
      }
      // On a parfois des calculs qui ne tombent pas très juste en JS
      if (Math.abs(balance.transaction - balance.CHQ) > 0.001) {
        const lost = doc.grouped_documents.find(gdoc=>gdoc.id === this.id)?.client_comments?.find(
          comment => comment.content === 'PHOTO CHEQUE PERDUE'
        );
        if (!lost) {
          balance.addCHQ(null);
          if (this.isCurrent()) this.log('isCheckRemittance(): somme des chèques incorrecte');
          return 'La somme des chèques doit valoir le montant de la transaction';
        } else {
          if (this.isCurrent()) this.log('isCheckRemittance(): photo chèque perdue');
        }
      }
    }
  }

  private async hasUnbalancedCHQ(balance: Balance) {
    if (balance.hasCHQ()) {
      if (Math.abs(balance.CHQ - balance.transaction) > 0.001) {
        if (this.isCurrent()) this.log('hasUnbalancedCHQ(): somme des chèques incorrecte');
        return 'La somme des chèques doit valoir le montant de la transaction';
      }
      if (this.isCurrent()) this.log('balance avec chèques équilibrée', balance);
      return '';
    }
  }

  private async hasUnbalancedReceipt(balance: Balance) {
    if (balance.hasReçu()) {
      if (Math.abs(balance.reçu - balance.transaction) > 0.001) {
        if (this.isCurrent()) this.log('hasUnbalancedReceipt(): somme des reçus incorrecte');
        return 'La somme des reçus doit valoir le montant de la transaction';
      }
      if (this.isCurrent()) this.log('balance avec reçus équilibrée', balance);
      return '';
    }
  }

  private async isOtherUnbalanced(balance: Balance) {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();

    const optionalProof = [
      '58000004',  // Virements internes société générale
      '58000001',  // Virements internes Stripe
      '754110002', // Dons Manuels - Stripe
      '754110001', // Dons Manuels - Allodons
      '6270005',   // Frais Bancaires Société Générale
      '6270001',   // Frais Stripe
    ]
    if (ledgerEvents.some(line => optionalProof.some(number => line.planItem.number === number))) {
      if (this.isCurrent()) this.debug('isOtherUnbalanced: justificatif facultatif');
      return;
    }

    // perte de reçu acceptable pour les petits montants, mais pas récurrents
    const requiredProof = [
      'DE: GOCARDLESS',
    ];
    if (
      Math.abs(balance.transaction) < 100
      && !balance.hasAutre()
      && !requiredProof.some(label => doc.label.includes(label))
    ) {
      if (this.isCurrent()) this.debug('isOtherUnbalanced: petit montant non récurrent');
      return;
    }

    if (Math.abs(balance.transaction - balance.autre) > 0.001) {
      balance.addAutre(null);
      return 'La somme des autres justificatifs doit valoir le montant de la transaction';
    }
    if (this.isCurrent()) this.debug('isOtherUnbalanced: balance équilibrée');
  }

  private async hasVAT() {
    const ledgerEvents = await this.getLedgerEvents();

    // Les associations ne gèrent pas la TVA
    if (ledgerEvents.some(line => line.planItem.number.startsWith('445'))) {
      return 'Une écriture comporte un compte de TVA';
    }
  }

  private async isTrashCounterpart() {
    const ledgerEvents = await this.getLedgerEvents();

    if (ledgerEvents.find(line => line.planItem.number === '6288')) {
      return 'Une ligne d\'écriture comporte le numéro de compte 6288';
    }
  }

  private async isMissingCounterpart() {
    const ledgerEvents = await this.getLedgerEvents();

    if (ledgerEvents.find(line => line.planItem.number === '4716001')) {
      return `<a
            title="Cliquer ici pour plus d'informations."
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20attribu%C3%A9e%20%C3%A0%20un%20compte%20d'attente"
          >Une ligne d'écriture utilise un compte d'attente: 4716001 ⓘ</a>`;
    }

    if (ledgerEvents.some(
      line => line.planItem.number.startsWith('47')
        && line.planItem.number !== '47600001')
    ) {
      return `<a
            title="Cliquer ici pour plus d'informations."
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20attribu%C3%A9e%20%C3%A0%20un%20compte%20d'attente"
          >Une écriture comporte un compte d\'attente (commençant par 47) ⓘ</a>`;
    }
  }

  private async isWrongDonationCounterpart() {
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();
    const dmsLinks = await this.getDMSLinks();

    const isDonation = groupedDocuments.some(gdoc => / CERFA | AIDES - /u.test(gdoc.label))
      || dmsLinks.some(dmsLink => /^(?:CERFA|AIDES) /u.test(dmsLink.name));
    const donationCounterparts = [
      '75411',   // Dons manuels
      '6571',    // Aides financières accordées à un particulier
      '6571002', // Don versé à une autre association
    ]
    if (isDonation && !ledgerEvents.some(
      line => donationCounterparts.includes(line.planItem.number)
    )) {
      if (this.isCurrent()) this.log('La contrepartie devrait faire partie de cette liste', { ledgerEvents, donationCounterparts });
      return `La contrepartie devrait faire partie de cette liste (onglet "Écritures")<ul><li>${donationCounterparts.join('</li><li>')
        }</li></ul>`;
    }
  }

  private async isOldUnbalanced() {
    const ledgerEvents = await this.getLedgerEvents();

    // balance déséquilibrée
    const third = ledgerEvents.find(line => line.planItem.number.startsWith('40'))?.planItem?.number;
    if (third) {
      const thirdEvents = ledgerEvents.filter(line => line.planItem.number === third);
      const balance = thirdEvents.reduce((sum, line) => sum + parseFloat(line.amount), 0);
      if (this.isCurrent())
        this.log('loadValidMessage: Balance', Math.abs(balance) > 0.001 ? 'déséquilibrée' : 'OK', this);

      // On a parfois des calculs qui ne tombent pas très juste en JS
      //if (Math.abs(balance) > 0.001) {
      if (Math.abs(balance) > 100) {
        return `Balance déséquilibrée avec Tiers spécifié : ${balance}`;
      }
    }
  }

  private async isMissingAttachment() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();
    const dmsLinks = await this.getDMSLinks();

    // Justificatif manquant
    if (
      !ledgerEvents.some(levent => levent.closed) // Exercice clos
      && Math.abs(parseFloat(doc.currency_amount)) >= 100
    ) {

    }
    const attachmentOptional =
      // Justificatif pas exigé pour les petits montants
      (!this.isCurrent() && Math.abs(parseFloat(doc.currency_amount)) < 100)
      || [
        ' DE: STRIPE MOTIF: ALLODONS REF: ',
        'Payout: STRIPE PAYOUT ',
      ].some(label => doc.label.includes(label))
      || [
        'REMISE CHEQUE ',
        'VIR RECU ',
        'VIR INST RE ',
        'VIR INSTANTANE RECU DE: ',
      ].some(label => doc.label.startsWith(label));
    const attachmentRequired = doc.attachment_required && !doc.attachment_lost
      && (!attachmentOptional || this.isCurrent());
    const hasAttachment = (groupedDocuments.length + dmsLinks.length) > 1;
    if (this.isCurrent()) this.log({ attachmentOptional, attachmentRequired, groupedDocuments, hasAttachment });
    if (attachmentRequired && !hasAttachment) return 'Justificatif manquant';
  }

  private async isBankFees() {
    return (
      await this.isIntlTransferFees()
      ?? await this.isStripeFees()
    );
  }

  private async isIntlTransferFees() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.label.startsWith('FRAIS VIR INTL ELEC ')) {
      if (
        ledgerEvents.length !== 2
        || groupedDocuments.length > 1
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
        || !ledgerEvents.find(ev => ev.planItem.number === '6270005')
      ) return 'Frais bancaires SG mal attribué (=> 6270005)';
      if (this.isCurrent()) this.log('frais bancaires OK');
      return 'OK';
    }
  }

  private async isStripeFees() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.label.startsWith('Fee: Billing - Usage Fee (')) {
      if (
        ledgerEvents.length !== 2
        || groupedDocuments.length > 1
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
        || !ledgerEvents.find(ev => ev.planItem.number === '6270001')
      ) return 'Frais Stripe mal attribués (=>6270001)';
      if (this.isCurrent()) this.log('frais bancaires Stripe OK');
      return 'OK';
    }
  }

  private async isAllodons() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.label.includes(' DE: STRIPE MOTIF: ALLODONS REF: ')) {
      if (
        ledgerEvents.length !== 2
        || groupedDocuments.length > 1
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
        || !ledgerEvents.find(ev => ev.planItem.number === '754110001')
      ) return 'Virement Allodons mal attribué (=>754110001)';
      if (this.isCurrent()) this.log('virement allodon OK');
      return 'OK';
    }
  }

  private async isDonationRenewal() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if (doc.label.startsWith('Charge: ')) {
      if (
        ledgerEvents.length !== 3
        || groupedDocuments.length > 1
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
        || !ledgerEvents.find(ev => ev.planItem.number === '6270001')
        || !ledgerEvents.find(ev => ev.planItem.number === '754110002')
      ) return 'Renouvellement de don mal attribués';
      if (this.isCurrent()) this.log('Renouvellement de don OK');
      return 'OK';
    }
  }

  private async isTransfer() {
    const doc = await this.getDocument();
    if (['VIR ', 'Payout: '].some(label => doc.label.startsWith(label))) {
      return (
        await this.isStripeInternalTransfer()
        // ?? await this.isAssociationDonation()
        // ?? await this.isOptionalReceiptDonation() // Les CERFAs ne sont pas optionel, seul leur envoi au donateur peut l'être
        // ?? await this.isNormalDonation()          // inclus dans la balance
      );
    }
  }

  private async isStripeInternalTransfer() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    if ([
      ' DE: Stripe Technology Europe Ltd MOTIF: STRIPE ',
      ' DE: STRIPE MOTIF: STRIPE REF: STRIPE-',
      'Payout: STRIPE PAYOUT (',
    ].some(label => doc.label.includes(label))) {
      if (
        ledgerEvents.length !== 2
        || groupedDocuments.length > 1
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
        || !ledgerEvents.find(ev => ev.planItem.number === '58000001')
      ) return 'Virement interne Stripe mal attribué (=>58000001)';
      if (this.isCurrent()) this.log('virement interne Stripe OK');
      return 'OK';
    }
  }

  private async isAssociationDonation() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    const assos = [
      ' DE: ALEF.ASSOC ETUDE ENSEIGNEMENT FO',
      ' DE: ASS UNE LUMIERE POUR MILLE',
      ' DE: COLLEL EREV KINIAN AVRAM (C E K ',
      ' DE: ESPACE CULTUREL ET UNIVERSITAIRE ',
      ' DE: JEOM MOTIF: ',
      ' DE: MIKDACH MEAT ',
      ' DE: YECHIVA AZ YACHIR MOCHE MOTIF: ',
      ' DE: ASSOCIATION BEER MOTIF: ',
    ];
    if (assos.some(label => doc.label.includes(label))) {
      if (
        ledgerEvents.length !== 2
        || groupedDocuments.length > 1
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
        || !ledgerEvents.find(ev => ev.planItem.number === '75411')
      ) return 'Virement reçu d\'une association mal attribué';
      if (this.isCurrent()) this.log('virement reçu d\'une association OK');
      return 'OK';
    }
  }

  private async isOptionalReceiptDonation() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();

    const sansCerfa = [
      ' DE: MONSIEUR FABRICE HARARI MOTIF: ',
      ' DE: MR ET MADAME DENIS LEVY',
      ' DE: Zacharie Mimoun ',
      ' DE: M OU MME MIMOUN ZACHARIE MOTIF: ',
    ]
    if (sansCerfa.some(label => doc.label.includes(label))) {
      if (
        ledgerEvents.length !== 2
        || groupedDocuments.length > 1
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
        || !ledgerEvents.find(ev => ev.planItem.number === '75411')
      ) return 'Virement reçu avec CERFA optionel mal attribué (=>75411)';
      if (this.isCurrent()) this.log('Virement reçu avec CERFA optionel OK');
      return 'OK';
    }
  }

  private async isNormalDonation() {
    const groupedDocuments = await this.getGroupedDocuments();

    if (groupedDocuments.length < 2) {
      return `<a
        title="Ajouter le CERFA dans les pièces de réconciliation. Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Transaction%20-%20Virement%20re%C3%A7u%20sans%20justificatif"
      >Virement reçu sans justificatif ⓘ</a>`;
    }

    if (!groupedDocuments.find(gdoc => gdoc.label.includes('CERFA'))) {
      return 'Les virements reçus doivent être justifiés par un CERFA';
    }
  }

  private async isAid() {
    // Aides octroyées
    return (
      await this.isAssociationAid()
      ?? await this.isMissingBeneficiaryName()
      ?? await this.isMissingCounterpartLabel()
    );
  }

  private async isAssociationAid() {
    const ledgerEvents = await this.getLedgerEvents();
    const aidLedgerEvent = ledgerEvents.find(line => line.planItem.number.startsWith('6571'));

    if (aidLedgerEvent?.planItem.number === '6571002') { // a une autre asso
      /**
      // Aides octroyées sans label
      if (!aidLedgerEvent.label) {
        return `<a
          title="Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20%C3%A0%20une%20autre%20association"
        >nom du bénéficiaire manquant dans l\'écriture "6571" ⓘ</a>`;
      }

      const isCheck = doc.label.startsWith('CHEQUE ');
      const receiptsNb = groupedDocuments.filter(gdoc => gdoc.type !== 'Transaction'
        && [' CERFA ', ' CB '].some(needle => gdoc.label.includes(needle))
      ).length + dmsLinks.filter(dms => dms.name.includes('CERFA ')).length;
      if (
        ledgerEvents.length !== 2
        || (groupedDocuments.length + dmsLinks.length) !== 1 + Number(isCheck) + Number(receiptsNb)
        || ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0) !== 0
      ) {
        if (this.isCurrent()) this.log('Don versé à une autre association incorrectement traité', {
          'ledgerEvents.length': ledgerEvents.length,
          'groupedDocuments.length': groupedDocuments.length,
          isCheck,
          receiptsNb,
          dmsLinks,
          eventsSum: ledgerEvents.reduce((acc, ev) => acc + parseFloat(ev.amount), 0)
        });
        return `<a
          title="Cliquer ici pour plus d'informations."
          href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FPennylane%20-%20Don%20%C3%A0%20une%20autre%20association"
        >Don versé à une autre association incorrectement traité ⓘ</a>`;
      }
      if (this.isCurrent()) this.log('Don versé à une autre association OK');
      return 'OK';
      /**/
    }
  }

  private async isMissingBeneficiaryName() {
    const ledgerEvents = await this.getLedgerEvents();
    const aidLedgerEvent = ledgerEvents.find(line => line.planItem.number.startsWith('6571'));

    if (aidLedgerEvent && !aidLedgerEvent.label) {
      // Aides octroyées sans label
      return `<a
        title="Cliquer ici pour plus d'informations."
        href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#nom%20du%20bénéficiaire%20manquant%20dans%20l'écriture%20%226571%22"
      >nom du bénéficiaire manquant dans l\'écriture "6571" ⓘ</a>`;
    }
  }

  private async isMissingCounterpartLabel() {
    const doc = await this.getDocument();
    const ledgerEvents = await this.getLedgerEvents();
    const groupedDocuments = await this.getGroupedDocuments();
    const aidLedgerEvent = ledgerEvents.find(line => line.planItem.number.startsWith('6571'));

    if (!aidLedgerEvent && parseFloat(doc.amount) < 0) {
      for (const gdoc of groupedDocuments) {
        if (gdoc.type !== 'Invoice') continue;
        const { thirdparty_id } = await new Document(gdoc).getDocument();
        // Aides octroyées à une asso ou un particulier
        if ([106438171, 114270419].includes(thirdparty_id)) {
          // Aides octroyées sans compte d'aide
          return `<a
            title="Cliquer ici pour plus d'informations."
            href="obsidian://open?vault=MichkanAvraham%20Compta&file=doc%2FProcessus%20-%20Traitement%20des%20re%C3%A7us%20d'aides%20octroy%C3%A9es#contrepartie%20%226571%22%20manquante"
          >contrepartie "6571" manquante ⓘ</a>`;
        }
      }
    }
  }

  private async hasToSendToDMS() {
    const balance = await this.getBalance();
    if (
      balance.CHQ && balance.CHQ === balance.transaction
      && (
        balance.autre === balance.transaction
        || balance.reçu === balance.transaction
      )
    ) {
      const groupedDocuments = await this.getGroupedDocuments();
      const chqs = groupedDocuments.filter(gdoc => gdoc.label.includes(' - CHQ'));
      this.log('hasToSendToDMS', {groupedDocuments, chqs, balance});
      if (!chqs.length) {
        if (this.isCurrent()) this.log('hasToSendToDMS', 'tous les chq sont en GED', {groupedDocuments, balance});
        return;
      }
      return 'envoyer les CHQs en GED';
    }
  }

  private async hasToSendToInvoice () {
    const balance = await this.getBalance();
    if (balance.reçu) {
      const dmsLinks = await this.getDMSLinks();
      const receipts = dmsLinks.filter(link => ['CERFA', 'AIDES'].some(
        key => link.name.startsWith(key)
        ));
      this.log('hasToSendToInvoice', {dmsLinks, receipts, balance});
      if (!receipts.length) {
        if (this.isCurrent()) this.log('hasToSendToInvoice', 'tous les reçus sont en facturation', {
          groupedDocuments: dmsLinks, balance
        });
        return;
      }
      return 'envoyer les reçus en facturation';
    }

  }

  /** Add item to this transaction's group */
  async groupAdd(id: number) {
    const doc = await this.getDocument();
    const groups = doc.group_uuid;
    const docMatchResp = await documentMatching({ id, groups });
    this.debug('groupAdd', { docMatchResp });
    if (docMatchResp?.id !== id) await createDMSLink(id, this.id, 'Transaction');
  }
}
