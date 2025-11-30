# Moove Marketplace
<h3>Moove Marketplace per Start2Impact University</h3>

> Si immagina lo scenario in cui una compagnia di trasporti Moove, richieda un applicativo web3 come ecommerce dei propri NFT. Si immagina che vengano utilizzate un massimo di 5 colleciton attive alla volta (è possibile disabilitare ma non riattivare le collection). 

>Si opera in una rete di test (Sepolia Testnet) pertanto tutti gli importi saranno inizialmente in wei per evitare sprechi. 
E' possibile configurare l'applicativo utilizzando gli ETH come unità base invece dei wei.
Per farlo modificare unitManager.ts l'enumerato DEFAULT settandolo ad ETH. Tutto l'applicativo mostrerà la conversione dei valori in ETH.

>Il progetto **moove-ecommerce-ui** è l'interfaccia grafica dei contratti sotto **moove-contracts** nella cartella precedente. <br>
L'applicativo prevede la creazione e la vendita di collezioni NFT, sui quali singoli NFT sarà possibile operare con delle aste, effettuando puntate o comprando direttamente il token (o NFT).

Di seguito la struttura del progetto a partire da **/src**:
><br>

> - **/abi**: (folder): cartella contenente gli abi dei contratti <br>
> - **/asset** (folder): cartella contenente le immagini statiche ddell'applicazione <br>
> - **/utils** (folder): cartella contenente file di utility dell'applicazione tra cui: unitManager, bridges verso il contratti, DTOs e Interfacce <br>
> - **/components** (folder): cartella contenente i componenti front-end dell'applicazione suddivisi per: Forms, ActionButtons, componenti del Marketplace, componenti della Factory, e componenti comuni <br>
> - **package.json** (file): dipendenze del progetto <br>
><br>

<br>

Nota: per evitare di sovraccaricare i contratti alle collection viene associata una copertina presentata nello slider della prima pagina dell'applicativo. Per comodità si suppone che ad ogni nuova collezione uscita, si contatti lo sviluppatore per modificare leggermente il file Cover.ts (/src/utils/Cover.ts) aggiungendo l'import all'immagine creata per la collezione e definendo nello switch la visualizzazione dell'immagine.

<h3> Compilazione </h3>

```shell
npm run build
```

<h3> Avvio locale </h3>

```shell
>*npm run start*
```

Per l'avvio locale è previsto che si aggiunga un file .env con le seguenti proprietà:

><br>

> - VITE_FACTORY_ADDRESS= [recuperabile dal deploy del contratto]
> - VITE_MOOVE_OWNER= [il wallet che ha deployato il contratto]
> - VITE_IPFS_GATEWAY= [URL gateway di Pinata]
> - VITE_INFURA_API_KEY= [apikey di Metamask (ex Infura) per letture RPC]
> - VITE_PROJECT_ID= [Wallet Connect projectID]
> - VITE_AUCTION_LIMIT= [massimo numero di secondi disponibili per la creazione di un'asta]
><br>
><br>



