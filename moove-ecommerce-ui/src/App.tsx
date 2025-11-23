import { BottomNavigation, Box, Button, Paper, Typography, useMediaQuery } from '@mui/material';
import { sepolia } from '@reown/appkit/networks';
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './App.css';
import Collection from './components/commons/Collection';
import Navbar from './components/commons/Navbar';
import { Factory } from './components/factory/Factory';
import { Marketplace } from './components/marketplace/Marketplace';
import { emptySigner, useAppContext } from './Context';
import { addCollectionsContractListeners, infuraProvider } from './utils/bridges/MooveCollectionsBridge';
import { addFactoryContractListeners, readCollections, readIsAdmin } from './utils/bridges/MooveFactoryBridge';
import { Role } from './utils/enums/Role';
import { Sections } from './utils/enums/Sections';
import CollectionDTO from './utils/DTO/CollectionDTO';
import Auctions from './components/commons/Auctions';
import MyNFTs from './components/commons/MyNFTs';
import CopyrightIcon from '@mui/icons-material/Copyright';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import metamask_logo from './assets/metamask.svg';
import walletconnect_logo from './assets/wallet-connect.svg';

function App() {
  const appContext = useAppContext();
  // const isMobile = useMediaQuery('(max-width: 1400px)');
  const [appStarting, setAppStarting] = useState<boolean>(true);
  const [shownCollection, setShownCollection] = useState<CollectionDTO>(CollectionDTO.emptyInstance());
  const MySwal = withReactContent(Swal);
  const { isConnected } = useAppKitAccount();
  const { walletProvider }: any = useAppKitProvider('eip155');
  const { open, close } = useAppKit();
  
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
      addCollectionsContractListeners(appContext.collectionAddresses, signer);
      
    } catch (error) {
      console.error("Init session error:", error);
      handleDisconnect();
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
            if(appContext.section === Sections.MYNFTS || appContext.section === Sections.FACTORY){
              appContext.updateSection(Sections.MARKETPLACE);
            }
            if(isAdmin){
              addFactoryContractListeners(signer);
            } 
            addCollectionsContractListeners(appContext.collectionAddresses, signer);
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
    appContext.updateSection(Sections.MARKETPLACE);
  };

  async function handleDisconnect() {
      appContext.updateProvider(infuraProvider);
      appContext.updateSigner(emptySigner);
      appContext.updateSignerAddress("");
      appContext.updateBalance(0);
      appContext.updateChainId(0);
      appContext.updateRole(Role.NONE);
      if(appContext.section === Sections.MYNFTS || appContext.section === Sections.FACTORY){
        appContext.updateSection(Sections.MARKETPLACE);
      }
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

  function showConnect() {
    
    MySwal.fire({
      title: "Connect your wallet",
      html: swalConnect(), 
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        // wire buttons to actions (user gesture)
        document.getElementById('swal-metamask')?.addEventListener('click', async () => {
          connectMetamask();
          MySwal.close();
        });
        document.getElementById('swal-wc')?.addEventListener('click', async () => {
          open();
          MySwal.close();
        });
      }

    })
  }

  function back(){
    appContext.updateSection(Sections.MARKETPLACE);
    setShownCollection(CollectionDTO.emptyInstance());
  }


  const swalConnect = () => {
    return (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'stretch' }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Choose a method to sign in</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Make sure your wallet is set to the <strong>Sepolia</strong> network (chainId 11155111) before proceeding.
            </Typography>
          </Box>

          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              id="swal-metamask"
              variant="contained"
              startIcon={<img src={metamask_logo} alt="MetaMask" style={{ width: 20, height: 20 }} />}
              sx={{ justifyContent: 'flex-start', py: 1.5 }}
            >
              MetaMask (Browser)
            </Button>

            <Button
              id="swal-wc"
              variant="outlined"
              startIcon={<img src={walletconnect_logo} alt="WalletConnect" style={{ width: 20, height: 20 }} />}
              sx={{ justifyContent: 'flex-start', py: 1.5 }}
            >
              WalletConnect (QR / Mobile)
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            We never collect your private keys. All transactions must be confirmed in your wallet.
          </Typography>
        </Box>
      );
  }

  return (
    <div className="App" id="app">

      <Navbar handleConnect={showConnect} connectMetamask={connectMetamask}/>

      <div className="main-div primary-bg-color">
        <Box>
            {appContext.section === Sections.MARKETPLACE &&
              <Marketplace handleConnect={showConnect} collectionAddresses={appContext.collectionAddresses} showCollection={showCollection}/>
            }
            {appContext.role === Role.ADMIN && appContext.section === Sections.FACTORY &&
              <Factory showCollection={showCollection}/>
            }
            {appContext.section === Sections.COLLECTION && shownCollection.address !== CollectionDTO.emptyInstance().address && 
              <Collection collection={shownCollection} handleConnect={showConnect} goBack={back}/>
            }
            {appContext.section === Sections.AUCTIONS && appContext.auctions.length > 0 &&
              <Auctions auctions={appContext.auctions} connectMetamask={showConnect} goBack={back}></Auctions>
            }
            {appContext.section === Sections.MYNFTS &&
              <MyNFTs connectMetamask={connectMetamask} />
            }
        </Box>      
      </div>

      <Paper sx={{ position: 'static', mt: 'auto' }} elevation={24}>
        <BottomNavigation sx={{ backgroundColor: '#26547C', display:"flex", justifyContent:"center", alignItems:"center"}}  >
          <Typography display={"inline-flex"}><CopyrightIcon sx={{mr: .5}}/>2025 Moove Marketplace. All rights reserved. </Typography>
        </BottomNavigation>
      </Paper>
    </div>
  );
}

export default App;
