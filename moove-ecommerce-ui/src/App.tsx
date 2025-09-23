import { Box } from '@mui/material';
import { ethers } from 'ethers';
import { useEffect } from 'react';
import './App.css';
import bici from './assets/bici.png';
import motorino from './assets/motorino.png';
import Collection from './components/commons/Collection';
import { Factory } from './components/factory/Factory';
import { Marketplace } from './components/marketplace/Marketplace';
import Navbar from './components/commons/Navbar';
import { useAppContext } from './Context';
import getMooveFactory_ContractInstance, { readCollections, readIsAdmin } from './utils/bridges/MooveFactoryBridge';
import { Role } from './utils/enums/Role';
import { Sections } from './utils/enums/Sections';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const appContext = useAppContext();
  useEffect(() => {

    //Events
    window.ethereum.on('chainChanged', handleChanges);
    window.ethereum.on('accountsChanged', handleAccountChanges);

    //Gestire con gli eventi dal contratto
    if(appContext.collectionAddresses.length === 0){
      initCollections();
    }

  }, [appContext.provider, appContext.signer]);

  const handleChanges = () => {
    console.log(window.ethereum.chainId);
  };

  const handleAccountChanges = async (accounts:any) => {
    if (accounts.length === 0) {
      console.log('Please connect to Metamask.');
      disconnect();
    } else {
      await connectWallet();
    }
  };

  async function disconnect() {
    appContext.updateSigner("");
    appContext.updateBalance(0);
  }

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        appContext.updateProvider(provider);

        const signer = await provider.getSigner();
        appContext.updateSigner(signer.address);
        console.log(`address: ${signer.address}`);

        setAccountBalance();
        appContext.updateChainId(parseInt(window.ethereum.chainId));

        const isAdmin = await readIsAdmin();
        appContext.updateRole(isAdmin ? Role.ADMIN : Role.MEMBER);

        if(!isAdmin){
          appContext.updateSection(Sections.MARKETPLACE);
        }

      } catch (err) {
        alert('Connessione rifiutata');
      }
    } else {
      alert('MetaMask non installato');
    }
  }

  async function setAccountBalance(){
    if(!appContext.provider || !appContext.signer) return;

    await appContext.provider.getBalance(appContext.signer).then((balance: bigint) => {
      const bal = parseFloat(ethers.formatEther(balance));
      console.log(`balance available: ${bal.toFixed(18)} ETH`);
      appContext.updateBalance(bal);
    });
  }

  async function initCollections(){
    getMooveFactory_ContractInstance(appContext.provider);
    const collections = await readCollections();
    appContext.updateCollectionAddresses(collections ? collections : []);
  }

  return (
    <div className="App" id="app">

      <Navbar connect={connectWallet}/>

      {/* background images */}
      
      <Box
        sx={{
          position: 'absolute',
          top: 130,
          right: 0,
          zIndex: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
        >
        <img
          src={motorino}
          alt="Motorino"
          style={{
            height: '80vh',
            opacity: 0.15,
            marginRight: '0.5rem'
          }}
        />
      </Box>
      
      {/* rimuovere per schermi piccoli */}
      <Box
        sx={{
          position: 'absolute',
          left: -200,
          top: '80vh',
          height: 'auto',
          zIndex: 0,
          display: 'flex',
          alignItems: 'flex-start',
          pointerEvents: 'none'
        }}
      >
        <img
          src={bici}
          alt="bicycle"
          style={{
            height: '70vh',
            opacity: 0.15,
            marginLeft: '0.5rem'
          }}
        />
      </Box>
      {/* end background images */}

      <div className="main-div primary-bg-color">
        <Box>
            {appContext.section === Sections.MARKETPLACE && !appContext.shownCollection.name &&
              <Marketplace collectionAddresses={appContext.collectionAddresses} />
            }
            {appContext.signer && appContext.role === Role.ADMIN && appContext.section === Sections.FACTORY && !appContext.shownCollection.name &&
              <Factory/>
            }
            {appContext.shownCollection.address && (
              <Collection/>
            )}
        </Box>      
      </div>
    </div>
  );
}

export default App;
