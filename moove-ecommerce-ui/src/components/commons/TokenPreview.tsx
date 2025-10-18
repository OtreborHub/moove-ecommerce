import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import moove_logo from "../../assets/moove.png";
import { useAppContext } from "../../Context";
import { formatPrice } from "../../utils/formatValue";
import { TokenProps } from "../../utils/Interfaces";
import Token from "./Token";

// ✅ Gateway IPFS multipli con fallback
const IPFS_GATEWAYS = [
  'https://nftstorage.link/ipfs',
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://gateway.pinata.cloud/ipfs'
];

export default function TokenPreview({token, isLoading, connectWallet, handleBuy, handleCreateAuction, handleTransfer, handleUpdatePrice: handleTokenPrice}: TokenProps) {
  const [imageUrl, setImageUrl] = useState(moove_logo);
  const [hovered, setHovered] = useState(false);
  const MySwal = withReactContent(Swal);
  const appContext = useAppContext();

  useEffect(() => {
      init();
      
      if(appContext.shownNFT > 0 && appContext.shownNFT === token.id) {
        openTokenDetail();
        appContext.updateShownNFT(0);
      }
  }, []);

  async function init(){
    await fetchMetadata();
    fillTokenAuction();
  }  

  function fillTokenAuction(){
    if(appContext.auctions.length > 0){
      appContext.auctions.filter((auction) => {
        if(auction.collection.address === appContext.shownCollection.address && auction.tokenId === token.id){
          token.auction = auction;
        }
      });
    }
  }

  // ✅ Funzione helper per provare il caricamento con timeout
  async function loadImageWithTimeout(url: string, timeout: number = 8000): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new window.Image();
      const timer = setTimeout(() => {
        resolve(false);
      }, timeout);

      img.onload = () => {
        clearTimeout(timer);
        setImageUrl(url);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };

      img.src = url;
    });
  }

  // ✅ Prova gateway multipli in sequenza
  async function tryMultipleGateways(cid: string): Promise<boolean> {
    for (const gateway of IPFS_GATEWAYS) {
      const url = `${gateway}/${cid}`;
      console.log(`🔄 Trying gateway: ${url}`);
      
      const success = await loadImageWithTimeout(url);
      if (success) {
        console.log(`✅ Success with gateway: ${gateway}`);
        return true;
      }
    }
    console.log('❌ All gateways failed');
    return false;
  }

  async function fetchMetadata(){
    isLoading(true);
    
    try {
      // ✅ Usa nftstorage.link che è più affidabile
      const metadataUrl = `https://nftstorage.link/ipfs/${token.URI}`;
      console.log(`📥 Fetching metadata from: ${metadataUrl}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(metadataUrl, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const metadata = await response.json();
      console.log("✅ Metadata fetched:", metadata.name);

      token.imageCID = metadata.cid;
      token.metadata = metadata;

      // ✅ Prova gateway multipli
      const success = await tryMultipleGateways(metadata.cid);
      
      if (!success) {
        console.warn('⚠️ Using fallback logo');
        setImageUrl(moove_logo);
      }

    } catch (error) {
      console.error("❌ Error fetching metadata:", error);
      setImageUrl(moove_logo);
    } finally {
      // ✅ SEMPRE rimuovi il loader
      isLoading(false);
    }
  }

  function closeAndHandleConnectWallet(){
    MySwal.close();
    connectWallet();
  }

  function closeAndHandleCreateAuction(){
    MySwal.close();
    handleCreateAuction(token.id);
  }

  function closeAndHandleTransfer(){
    MySwal.close();
    handleTransfer(token.id);
  }

  function closeAndHandleTokenPrice(){
    MySwal.close();
    handleTokenPrice(token.id, token.price);
  }

  function openTokenDetail(){
      MySwal.fire({
          html: <Token 
            isLoading={isLoading}
            signer={appContext.signer}
            collection={appContext.shownCollection}
            token={token} 
            connectWallet={closeAndHandleConnectWallet} 
            handleBuy={handleBuy}
            handleCreateAuction={closeAndHandleCreateAuction}
            handleUpdatePrice={closeAndHandleTokenPrice}
            handleTransfer={closeAndHandleTransfer}
            />,
          showConfirmButton: false,
          showCloseButton: true,
          customClass: {
            popup: 'my-fullscreen-swal'
          }
      }); 
  }

  return (
    <Card sx={{ 
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      borderRadius: 2,
      boxShadow: 3,
      cursor: "pointer"  
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}  
        >
      <CardActionArea onClick={openTokenDetail}>
        <CardMedia
          component="img"
          sx={{
            width: '100%',
            maxHeight: 500,              
            objectFit: 'contain',        
            borderRadius: 2,
            backgroundColor: '#f0f0f0'
          }}
          src={imageUrl}
          alt={"NFT Image not available..."}
        />

        <CardContent
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          bgcolor: hovered ? "rgba(255, 255, 255, 0.4)" : "transparent",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease, background-color 0.3s ease",
          pointerEvents: "none",
          px: 2,
          py: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          {appContext.shownCollection.symbol}#{token.id}
        </Typography>
      </CardContent>

      <CardContent
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          bgcolor: hovered ? "rgba(255, 255, 255, 0.41)" : "transparent",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease, background-color 0.3s ease",
          pointerEvents: "none",
          px: 2,
          py: 1.5,
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: 0.5 }}
        >
          Buy for {formatPrice(token.price, "wei")} wei
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary" }}
        >
          Click to show details
        </Typography>
      </CardContent>

      </CardActionArea>
    </Card>
  );
}