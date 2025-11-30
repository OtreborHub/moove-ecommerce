# Moove Marketplace (Smart Contracts)
<h3>Moove Marketplace per Start2Impact University</h3>

>
> Si immagina lo scenario in cui una compagnia di trasporti Moove, richieda un applicativo web3 come ecommerce dei propri NFT.
>
>Il progetto **moove-contracts** contiene i contratti che orchestrano le collezioni NFT di Moove. <br>
>
>Il contratto MooveFactory ha il compito di gestire le collezioni e gli amministratori della piattaforma. Per la creazione delle collezioni è sufficente essere admin (l'owner del contratto lo diventa al deploy). Per la gestione degli admin invece è necessario essere l'owner del contratto.<br><br>
>Gli admin quindi possono creare nuove collezioni, mintare nuovi NFT, e disabilitare delle collezioni in disuso o esaurite.<br>
L'owner può effettuare le medesime operazioni sulle collezioni degli admin, tuttavia può anche aggiungere e rimuovere admin dalla lista degli amministratori della piattaforma<br>
<br>
>
>Il contratto **MooveCollection** è sempre un'istanza creata da **MooveFactory**. <br>
Il contratto ha il compito di gestire tutte le funzionalità base dell'interfaccia ERC721 (più il tokenURI per l'estensione verso ERC721URIStorage).<br> Le funzionalità base vengono estese con le aste.
Ogni utilizzatore potrà creare un'asta (struct Auction) sul proprio NFT impostando il tipo, il prezzo iniziale e la durata. <br> E' consigliabile utlizzare l'applicativo deployato per comprendere meglio l'utilizzo delle aste.
>
>https://moove-ecommerce.vercel.app/
><br><br>
>

I contratti sono stati testati e deployati per mezzo di Remix IDE:
><br>

> 
> - **/contracts** (folder): cartella contenente i contratti Moove 
> - **/ignition** (folder): cartella contenente le istruzioni di deploy per l'ambiente hardhat. <br>
> - **hardhat.config.ts** (file): file di configurazione di hardhat, compilatore e network sono modificabili da questo file <br>
> - **package.json** (file): dipendenze del progetto <br>
><br>

<h3> Compilazione </h3>

>*npx hardhat compile*

<h3> Test </h3>

>*npx hardhat test test\tst_\<nomeContratto>.ts*

<h3> Deploy </h3>

La rete di testnet configurata è Sepolia, è possibile configurare un'altra rete nel file hardhat.config.ts. Per il deploy su Sepolia Testnet eseguire

>npx hardhat ignition deploy ./ignition/modules/\<NomeContratto>.ts --network sepolia --reset

<h3> Contratto </h3>
Factory: https://sepolia.etherscan.io/address/0x02702614dE7248D33A22FC9a5e5c1dFbbbB885ba
