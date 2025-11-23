import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { useAppKit } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import moove_logo from "../../assets/moove_logo.svg";
import { useAppContext } from "../../Context";
import { transferTo, writeCreateAuction, writeTokenPrice } from "../../utils/bridges/MooveCollectionsBridge";
import { formatPrice } from "../../utils/formatValue";
import { TokenPreviewProps } from "../../utils/Interfaces";
import CreateAuctionForm from "../forms/CreateAuctionForm";
import TransferToForm from "../forms/TransferToForm";
import UpdateTokenPriceForm from "../forms/UpdateTokenPriceForm";
import Token from "./Token";

export const IPFS_GATEWAY: string = import.meta.env.VITE_IPFS_GATEWAY as string;

export default function TokenPreview({collection, token, handleConnect, isLoading, handleBuy}: TokenPreviewProps) {
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
        if(auction.collection.address === collection.address && auction.tokenId === token?.id){
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
      const metadataURL = `${IPFS_GATEWAY}${token.URI}`;
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

      const url = `${IPFS_GATEWAY}${metadata.cid}`;
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

  function closeAndShowCreateAuctionForm(){
    MySwal.close();
    MySwal.fire({
        title: "Create Auction",
        html: <CreateAuctionForm tokenId={token.id} collectionSymbol={collection.symbol} handleSubmit={handleCreateAuction}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  function closeAndShowTransferForm(){
    MySwal.close();
        MySwal.fire({
        title: "Trasfer NFT",
        html: <TransferToForm tokenId={token.id} handleSubmit={handleTrasferFrom}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  function closeAndShowUpdateTokenPriceForm(){
    MySwal.close();
    MySwal.fire({
        title: "Update Price",
        html: <UpdateTokenPriceForm tokenId={token.id} tokenPrice={token.price} handleSubmit={handleUpdateTokenPrice} />,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleCreateAuction(tokenId: number, auctionType: number, startPrice: number, duration: number, minIncrement: number){
    isLoading(true);
    const success = await writeCreateAuction(collection.address, tokenId, auctionType, startPrice, duration, minIncrement, appContext.signer);
    isLoading(false);
    if(success){
      MySwal.fire({
        title: "Create Auction",
        text: "The auction creation request was successful!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  }

  async function handleTrasferFrom(tokenId: number, addressTo: string){
    isLoading(true);
    var success = await transferTo(collection.address, addressTo, tokenId, appContext.signer);
    isLoading(false);
    if(success){
      MySwal.fire({
        title: "Transfer NFT",
        text: "The transfer request was successful!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  }

  async function handleUpdateTokenPrice(tokenId: number, price: BigInt){
    isLoading(true);
    var success = await writeTokenPrice(collection.address, tokenId, price, appContext.signer);
    isLoading(false);
    if(success){
      MySwal.fire({
        title: "Update NFT Price",
        text: "The update request was successful!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  }

  function openTokenDetail(){
      MySwal.fire({
          html: <Token 
            isLoading={isLoading}
            collection={collection}
            token={token} 
            auction={token.auction}
            metadata={metadata}
            signer={appContext.signer}
            signerAddress={appContext.signerAddress}
            handleConnect={handleConnect}
            handleBuy={handleBuy}
            handleCreateAuction={closeAndShowCreateAuctionForm}
            handleUpdatePrice={closeAndShowUpdateTokenPriceForm}
            handleTransfer={closeAndShowTransferForm}
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
          {collection.symbol}#{token.id}
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
          variant="inherit"
          sx={{ color: "text.secondary", mb: 0.5 }}
        >
          Buy for {formatPrice(token.price, "wei")} wei
        </Typography>
        <Typography
          variant="inherit"
          sx={{ color: "text.secondary" }}
        >
          Click to show details
        </Typography>
      </CardContent>

      </CardActionArea>
    </Card>
  );
}