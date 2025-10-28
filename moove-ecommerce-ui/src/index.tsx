import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppContextProvider } from './Context';
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia, mainnet} from '@reown/appkit/networks';
import moove_logo from './assets/moove.png';

export const projectId = import.meta.env.VITE_PROJECT_ID as string;

  createAppKit({
    // adapters: [new EthersAdapter()],
    projectId,
    networks: [sepolia],
    metadata: {
      name: 'Moove NFT Marketplace',
      description: 'NFT Marketplace on Sepolia',
      url: window.location.origin,
      icons: ["https://raw.githubusercontent.com/MetaMask/metamask-mobile/main/logo.png"]
    },
    
  });
  

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);
root.render(
  <AppContextProvider>
  <React.StrictMode>
    <App/>
  </React.StrictMode>
  </AppContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
