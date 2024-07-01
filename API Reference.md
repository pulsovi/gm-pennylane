## API Reference

### Document

C'est un élément de donnée. Il existe plusieurs types de Document :

- Invoice : une facture avec son fichier joint
- Transaction : Une transaction bancaire

Le détail d'un #Document est affiché en retour de 
`GET https://app.pennylane.com/companies/${company_id}/documents/${document_id}`

### GUUID group_uuid

C'est un groupe de #Document. Les écritures relatives à tous les #Document d'un même GUUID sont affichées ensembles à côté de chacun de ces #Document.

Le numéro de #GUUID d'un #Document est rapporté par sa propriété `group_uuid`.

## API endpoints connus

### Archiver un ou plusieurs documents

```js
apiRequest('documents/batch_archive', {
  documents: [
    document1.id,
    ...
  ],
  unarchive: false,
})
```

### Réconcilier des documents

En fait, il s'agit de fusionner des group_uuids (donc tous les #Document de chaque #GUUID listé) en excluant éventuellement certains #Document par leur ID

Fait appel à :
- #Document
- #GUUID

```js
apiRequest('documents/601421986/matching', {
  "matching":{
    "unmatch_ids":[],
    "group_uuids":[
      "8897ec20-601e-4fb4-a130-ca10137994ee", 
      "0bb9dbd8-3f00-44ef-b46e-b073f7c9562d",
      "4c7a9191-92d0-4e75-a63e-cc876d6d489d",
      "5f32e233-48f0-4178-988e-313d4ac7e7eb",
      "505f4765-900d-4742-8832-9c1621f5feb5"
    ]
  }
}, 'PUT');
```

### Récupérer des informations sur un élément

```js
apiRequest(`documents/${document_id}`, null, 'GET');
```

Type de retour : consulter https://app.pennylane.com/companies/21936866/documents/601421986


### Fusionner des factures

```js
apiRequest('accountants/invoices/merge_files', {invoice_ids: [invoice1_id, invoice2_id, ...]}, 'POST');
```

### Modifier une facture

`PUT https://app.pennylane.com/companies/21936866/accountants/invoices/582458394`

pour les données, il suffit de renvoyer une version modifiée de la réponse de la version GET

`GET https://app.pennylane.com/companies/21936866/accountants/invoices/582458394`

On peut se contenter de n'envoyer que les propriétés à modifier. Les propriétés manquantes resteront inchangées

### Lister des éléments

```js
apiRequest('accountants/invoices/list?page=3', null, 'GET');
```
