import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import moove_logo from "../../assets/moove.png";
import { useAppContext } from "../../Context";
import { formatPrice } from "../../utils/formatValue";
import { TokenPreviewProps } from "../../utils/Interfaces";
import Token from "./Token";
import { useAppKit } from "@reown/appkit/react";

// ✅ Gateway IPFS multipli con fallback
// const IPFS_GATEWAYS = [
//   'https://nftstorage.link/ipfs',
//   'https://ipfs.io/ipfs',
//   'https://cloudflare-ipfs.com/ipfs',
//   'https://gateway.pinata.cloud/ipfs'
// ];
const IPFS_gateway = 'https://amber-adverse-llama-592.mypinata.cloud/ipfs/';

export default function TokenPreview({token, connectMetamask, isLoading, handleBuy, handleCreateAuction, handleTransfer, handleUpdatePrice}: TokenPreviewProps) {
  const [imageUrl, setImageUrl] = useState(moove_logo);
  const [metadata, setMetadata] = useState({name:"", cid:"", attributes: []});
  const [hovered, setHovered] = useState(false);
  const MySwal = withReactContent(Swal);
  const appContext = useAppContext();
  const { open } = useAppKit();

  useEffect(() => {
      init();
  }, []);

  async function init(){
    await fetchMetadata();
    fillTokenAuction();
  }  

  function fillTokenAuction(){
    if(appContext.auctions.length > 0){
      appContext.auctions.filter((auction) => {
        if(auction.collection.address === appContext.shownCollection.address && auction.tokenId === token?.id){
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

  async function fetchMetadata(){
    isLoading(true);
    
    try {
      const metadataURL = `${IPFS_gateway}${token.URI}`;
      console.log(`📥 Fetching metadata from: ${metadataURL}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(metadataURL, { 
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
      setMetadata(metadata);

      const url = `${IPFS_gateway}${metadata.cid}`;
      const success = await loadImageWithTimeout(url);
      
      if (!success) {
        console.warn('⚠️ Using fallback logo');
        setImageUrl(moove_logo);
      }

    } catch (error) {
      console.error("❌ Error fetching metadata:", error);
      setImageUrl(moove_logo);
    } finally {
      isLoading(false);
    }
  }

  function closeAndConnectMetamask(){
    MySwal.close();
    connectMetamask();
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
    handleUpdatePrice(token.id, token.price);
  }

  function openTokenDetail(){
      MySwal.fire({
          html: <Token 
            isLoading={isLoading}
            collection={appContext.shownCollection}
            token={token} 
            auction={token.auction}
            metadata={metadata}
            signer={appContext.signer}
            signerAddress={appContext.signerAddress}
            connectWC={closeAndConnectMetamask} 
            connectMetamask={close}
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