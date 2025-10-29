import { Box, useMediaQuery } from '@mui/material';
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
import { addFactoryContractListeners, readCollections, readIsAdmin } from './utils/bridges/MooveFactoryBridge';
import { Role } from './utils/enums/Role';
import { Sections } from './utils/enums/Sections';
import { useAppKitProvider, useAppKitAccount, useAppKit, useDisconnect } from "@reown/appkit/react";
import { infuraProvider } from './utils/bridges/MooveCollectionsBridge';
import { sepolia } from '@reown/appkit/networks';

function App() {
  const appContext = useAppContext();
  const isMobile = useMediaQuery('(max-width: 1400px)');
  const [appStarting, setAppStarting] = useState<boolean>(true);

  const { address, isConnected } = useAppKitAccount();
  const { walletProvider }: any = useAppKitProvider('eip155');
  const { close } = useAppKit();
  
  useEffect(() => {
    if(appStarting){
      handleDisconnect();
    } else if(isConnected && walletProvider && appContext.signer === ""){
      initSession();
    } else {
      handleDisconnect();
    }
    
    if(appContext.collectionAddresses.length === 0){
      initCollections();
    }
  }, [isConnected, walletProvider, address]);


  // async function initSession() {
  //   const chainId = await verifyChainId();
  //   initSigner(Number(chainId));
  // }

  async function initSession() {
    if (!walletProvider) return;
    
    try {
      const provider = new ethers.BrowserProvider(walletProvider as any);
      
      const network = await provider.getNetwork();
      console.log("chainId:", network.chainId);
      
      if (Number(network.chainId) !== sepolia.id) {
        console.warn(`⚠️ Wrong network (${Number(network.chainId)}). Expected Sepolia (${sepolia.id})`);
        
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${sepolia.id.toString(16)}` }]
        });
        return initSession();
      }
      
      const signer = address ?? (await provider.getSigner()).address;
      appContext.updateSigner(signer);
      appContext.updateChainId(Number(network.chainId));
      appContext.updateProvider(provider);
      

      const balanceWei = await provider.getBalance(signer);
      const balanceEth = Number(ethers.formatEther(balanceWei));
      console.log(`Balance di ${signer}: ${balanceEth} ETH`);
      appContext.updateBalance(balanceEth);

      const isAdmin = await readIsAdmin(provider);
      appContext.updateRole(isAdmin ? Role.ADMIN : Role.MEMBER);
      if (isAdmin) {
        addFactoryContractListeners(provider);
      }
      
    } catch (error) {
      console.error("Init session error:", error);
      await handleDisconnect();
    }
  };


  async function initCollections(){
    const collections = await readCollections();
    appContext.updateCollectionAddresses(collections ? collections : []);
    setAppStarting(false);
  }
  
  async function handleDisconnect() {
    try {
      
      // if (walletProvider) {
      //   walletProvider.removeAllListeners('chainChanged');
      // }
      
      appContext.updateProvider(infuraProvider);
      appContext.updateSigner("");
      appContext.updateBalance(0);
      appContext.updateChainId(0);
      appContext.updateRole(Role.NONE);
      appContext.updateSection(Sections.MARKETPLACE);
      //await disconnect();
      await close();
    } catch (err) {
      console.warn('useAppKit.close() failed', err);
    }
    
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

  async function connectWallet() {
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
  //       window.ethereum.on('chainChanged', handleChanges);
  //       window.ethereum.on('accountsChanged', handleAccountChanges);

  //     } catch (err) {
  //       disconnect();
  //     }
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
          display: isMobile ? 'none':'flex',
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
              <Marketplace connectWallet={connectWallet} collectionAddresses={appContext.collectionAddresses} />
            }
            {appContext.role === Role.ADMIN && appContext.section === Sections.FACTORY && !appContext.shownCollection.name &&
              <Factory/>
            }
            {appContext.shownCollection.address && 
              <Collection collection={appContext.shownCollection} connectWallet={connectWallet}/>
            }
        </Box>      
      </div>
    </div>
  );
}

export default App;
