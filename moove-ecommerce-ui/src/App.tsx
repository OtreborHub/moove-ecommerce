import { Box } from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './App.css';
import bici from './assets/bici.png';
import motorino from './assets/motorino.png';
import Collection from './components/commons/Collection';
import { Factory } from './components/factory/Factory';
import { Marketplace } from './components/marketplace/Marketplace';
import Navbar from './components/commons/Navbar';
import { useAppContext } from './Context';
import getContractInstance, { addFactoryContractListeners, readCollections, readIsAdmin } from './utils/bridges/MooveFactoryBridge';
import { Role } from './utils/enums/Role';
import { Sections } from './utils/enums/Sections';
import { useAppKitProvider, useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { sepoliaTestnet } from './utils/UniversalConnector';

function App() {
  const appContext = useAppContext();
  //const [universalConnector, setUniversalConnector] = useState<UniversalConnector>()
  // const [session, setSession] = useState<any>();
  // const [walletProvider, setWalletProvider] = useState<any>();
  // const [address, setAddress] = useState<string>("");
  // const [isConnected, setIsConnected] = useState<boolean>(false);

  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider(sepoliaTestnet.chainNamespace);
  const { open, close } = useAppKit();
  
  useEffect(() => {
    close();
    initCollections();
  }, []);

  async function initSession() {
    if (!walletProvider) return;
    
    try {
      const provider = new ethers.BrowserProvider(walletProvider as any);
      appContext.updateProvider(provider);

      const signer = await provider.getSigner();
      appContext.updateSigner(signer.address);
      
      await setAccountBalance(signer.address);
      const network = await provider.getNetwork();
      appContext.updateChainId(Number(network.chainId));

      const isAdmin = await readIsAdmin(provider);
      appContext.updateRole(isAdmin ? Role.ADMIN : Role.MEMBER);
      appContext.updateSection(Sections.MARKETPLACE);
      
      if (isAdmin) {
        addFactoryContractListeners(provider);
      }
    } catch (error) {
      console.error("Init session error:", error);
      // try a clean disconnect + close modal
      await handleDisconnect();
    }
  };

  // open walletconnect modal only on user action
  function handleConnect() {
    open().then(() => {
      initSession();
    });
  }

  async function initCollections(){
    getContractInstance();
    const collections = await readCollections();
    appContext.updateCollectionAddresses(collections ? collections : []);
  }

  
  // disconnect the universal connector
  async function handleDisconnect() {
    try {
      // close AppKit modal / session UI
      useAppKit().close();
    } catch (err) {
      console.warn('useAppKit.close() failed', err);
    }
    // reset application context state
    appContext.updateProvider(undefined as any);
    appContext.updateSigner("");
    appContext.updateBalance(0);
    appContext.updateChainId(0);
    appContext.updateRole(Role.NONE);
    appContext.updateSection(Sections.MARKETPLACE);
  };

  // const handleChanges = () => {
  //   console.log(window.ethereum.chainId);
  // };

  // const handleAccountChanges = async (accounts:any) => {
  //   if (accounts.length === 0) {
  //     console.log('Please connect to Metamask.');
  //     disconnect();
  //   } else {
  //     await connectWallet();
  //   }
  // };

  // async function connectWallet() {
  //     try {
  //       const provider = new ethers.BrowserProvider(window.ethereum);

  //       appContext.updateProvider(provider);

  //       const signer = await provider.getSigner();
  //       appContext.updateSigner(signer.address);
  //       console.log(`address: ${signer.address}`);

  //       setAccountBalance(signer.address);
  //       appContext.updateChainId(parseInt(window.ethereum.chainId));

  //       const isAdmin = await readIsAdmin();
  //       appContext.updateRole(isAdmin ? Role.ADMIN : Role.MEMBER);
  //       appContext.updateSection(Sections.MARKETPLACE);
  //       if(isAdmin){
  //         addFactoryContractListeners();
  //       }

  //       //Events
  //       // window.ethereum.on('chainChanged', handleChanges);
  //       // window.ethereum.on('accountsChanged', handleAccountChanges);

  //     } catch (err) {
  //       disconnect();
  //     }
  // }

  async function setAccountBalance(address: string){
    if(!appContext.provider || !address) return;

    await appContext.provider.getBalance(address ? address : appContext.signer).then((balance: bigint) => {
      const bal = parseFloat(ethers.formatEther(balance));
      console.log(`balance available: ${bal.toFixed(18)} ETH`);
      appContext.updateBalance(bal);
    });
  }

  return (
    <div className="App" id="app">

      <Navbar connect={() => handleConnect()} disconnect={() => handleDisconnect()}/>

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
              <Marketplace connectWallet={handleConnect} collectionAddresses={appContext.collectionAddresses} />
            }
            {appContext.role === Role.ADMIN && appContext.section === Sections.FACTORY && !appContext.shownCollection.name &&
              <Factory/>
            }
            {appContext.shownCollection.address && 
              <Collection collection={appContext.shownCollection} connectWallet={handleConnect}/>
            }
        </Box>      
      </div>
    </div>
  );
}

export default App;
