import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppContextProvider } from './Context';
import { createAppKit } from '@reown/appkit/react'
import { networks, projectId } from './utils/UniversalConnector'

  createAppKit({
    projectId,
    networks,
    metadata: {
      name: 'Moove NFT Marketplace',
      description: 'NFT Marketplace on Sepolia',
      url: window.location.origin,
      icons: ['https://appkit.reown.com/icon.png']
    },
    
  });

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);
root.render(
  <AppContextProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </AppContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
