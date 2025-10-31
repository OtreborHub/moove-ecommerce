import { Box, useMediaQuery } from '@mui/material';
import { sepolia } from '@reown/appkit/networks';
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './App.css';
import bici from './assets/bici.png';
import motorino from './assets/motorino.png';
import Collection from './components/commons/Collection';
import Navbar from './components/commons/Navbar';
import { Factory } from './components/factory/Factory';
import { Marketplace } from './components/marketplace/Marketplace';
import { emptySigner, useAppContext } from './Context';
import { infuraProvider } from './utils/bridges/MooveCollectionsBridge';
import { addFactoryContractListeners, readCollections, readIsAdmin } from './utils/bridges/MooveFactoryBridge';
import { Role } from './utils/enums/Role';
import { Sections } from './utils/enums/Sections';
import CollectionDTO from './utils/DTO/CollectionDTO';
import Auctions from './components/commons/Auctions';
import MyNFTs from './components/commons/MyNFTs';

function App() {
  const appContext = useAppContext();
  const isMobile = useMediaQuery('(max-width: 1400px)');
  const [appStarting, setAppStarting] = useState<boolean>(true);
  const [shownCollection, setShownCollection] = useState<CollectionDTO>(CollectionDTO.emptyInstance());

  const { isConnected } = useAppKitAccount();
  const { walletProvider }: any = useAppKitProvider('eip155');
  const { close } = useAppKit();
  
  useEffect(() => {
    if(appStarting){
      handleDisconnect();
    } else if(walletProvider && isConnected && appContext.signer === emptySigner){
      activateWCHooks();
    } else {
      handleDisconnect();
    }
    
    if(appContext.collectionAddresses.length === 0){
      initCollections();
    }
  }, [isConnected, walletProvider]);

  
  

 //------------------ Wallet Connect KitApp
  async function connectWCKitApp() {
    if (!walletProvider) return;
    
    try {
      
      const provider = new ethers.BrowserProvider(walletProvider as any);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      appContext.updateSigner(signer);
      appContext.updateSignerAddress(signer.address);
      appContext.updateChainId(Number(network.chainId));
      appContext.updateProvider(provider);

      const balanceWei = await provider.getBalance(signer);
      const balanceEth = Number(ethers.formatEther(balanceWei));
      console.log(`Balance di ${signer}: ${balanceEth} ETH`);
      appContext.updateBalance(balanceEth);

      const isAdmin = await readIsAdmin(signer);
      appContext.updateRole(isAdmin ? Role.ADMIN : Role.MEMBER);
      if (isAdmin) {
        addFactoryContractListeners(signer);
      }
      
    } catch (error) {
      console.error("Init session error:", error);
      await handleDisconnect();
    }
  };

  function activateWCHooks(){
    walletProvider.on?.("chainChanged", handleChainChanged);
    walletProvider.on?.("default_chain_changed", handleChainChanged);
  }

  // WalletConnect listeners
  const handleChainChanged = async (chainId: string) => {
    console.log(`🔗 Chain changed: ${chainId}`);
    if (Number(chainId) === sepolia.id) {
      console.log("✅ Sei ora su Sepolia, inizializzo la sessione...");
      await connectWCKitApp();
    } else {
      console.warn(`⚠️ Sei su una rete diversa (${Number(chainId)}). Attendi switch manuale a Sepolia.`);
    }
  };

  //--------------------- METAMASK BROWSER EXTENSION
  async function connectMetamask() {
      try {
        if(window.ethereum && !walletProvider){
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          appContext.updateProvider(provider);
          const signer = await provider.getSigner();
          appContext.updateSigner(signer);
          appContext.updateSignerAddress(signer.address);  
          console.log(`Metamask browser address: ${signer.address}`);
  
          const network = await provider.getNetwork();
          if(Number(network.chainId) === sepolia.id){
            appContext.updateChainId(Number(network.chainId));
            const balanceWei = await provider.getBalance(signer);
            const balanceEth = Number(ethers.formatEther(balanceWei));
            console.log(`Balance di ${signer}: ${balanceEth} ETH`);
            appContext.updateBalance(balanceEth);
            
    
            const isAdmin = await readIsAdmin(signer);
            appContext.updateRole(isAdmin ? Role.ADMIN : Role.MEMBER);
            appContext.updateSection(Sections.MARKETPLACE);
            if(isAdmin){
              addFactoryContractListeners(signer);
            }
          }
          // else {
          // Swal.error()  
          //}

  
          //Events
          (window.ethereum as any)?.on('chainChanged', handleChainChanges);
          (window.ethereum as any)?.on('accountsChanged', handleAccountChanges);
        }
      } catch (err) {
        handleDisconnect();
      }
  }

  //Metamask browser extensions listeners
  const handleChainChanges = () => {
    console.log((window.ethereum as any).chainId);
  };

  const handleAccountChanges = async (accounts:any) => {
    if (accounts.length > 0) {
      await connectMetamask();
    } else {
      console.log('Please connect to Metamask.');
      handleDisconnect();
    }
  };

  async function handleDisconnect() {
      appContext.updateProvider(infuraProvider);
      appContext.updateSigner(emptySigner);
      appContext.updateSignerAddress("");
      appContext.updateBalance(0);
      appContext.updateChainId(0);
      appContext.updateRole(Role.NONE);
      appContext.updateSection(Sections.MARKETPLACE);
      //await disconnect();
      await close();
  };

  async function initCollections(){
    const collections = await readCollections();
    appContext.updateCollectionAddresses(collections ? collections : []);
    setAppStarting(false);
  }

  function showCollection(collection: CollectionDTO){
    appContext.updateSection(Sections.COLLECTION);
    setShownCollection(collection)
  }

  function back(){
    appContext.updateSection(Sections.MARKETPLACE);
    setShownCollection(CollectionDTO.emptyInstance());
  }

  return (
    <div className="App" id="app">

      <Navbar connectMetamask={connectMetamask}/>

      {/* background images */}
      
      {/* <Box
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
      </Box> */}
      
      {/* rimuovere per schermi piccoli */}
      {/* <Box
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
      </Box> */}
      {/* end background images */}

      <div className="main-div primary-bg-color">
        <Box>
            {appContext.section === Sections.MARKETPLACE &&
              <Marketplace connectMetamask={connectMetamask} collectionAddresses={appContext.collectionAddresses} showCollection={showCollection}/>
            }
            {appContext.role === Role.ADMIN && appContext.section === Sections.FACTORY &&
              <Factory showCollection={showCollection}/>
            }
            {appContext.section === Sections.COLLECTION && shownCollection.address !== CollectionDTO.emptyInstance().address && 
              <Collection collection={shownCollection} connectMetamask={connectMetamask} goBack={back}/>
            }
            {appContext.section === Sections.AUCTIONS && appContext.auctions.length > 0 &&
              <Auctions auctions={appContext.auctions} connectMetamask={connectMetamask} goBack={back}></Auctions>
            }
            {appContext.section === Sections.MYNFTS &&
              <MyNFTs />
            }
        </Box>      
      </div>
    </div>
  );
}

export default App;
