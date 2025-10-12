import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import moove_logo from "../../assets/moove.png";
import { useAppContext } from "../../Context";
import { formatPrice } from "../../utils/formatValue";
import { TokenProps } from "../../utils/Interfaces";
import Token from "./Token";

export default function TokenPreview({token, isLoading, connectWallet, handleBuy, handleCreateAuction, handleTransfer, handleUpdatePrice: handleTokenPrice}: TokenProps) {
  const [imageUrl, setImageUrl] = useState(moove_logo);
  const [hovered, setHovered] = useState(false);
  const MySwal = withReactContent(Swal);
  const appContext = useAppContext();

  // const [metadata,setMetadata] = useState("");

  useEffect(() => {

      init();
      
      if(appContext.shownNFT > 0 && appContext.shownNFT === token.id) {
        openTokenDetail();
        appContext.updateShownNFT(0);
      }

    }, []);


  async function init(){
    fetchMetadata();
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

  async function fetchMetadata(){
    const metadataUrl = `https://${token.URI}.ipfs.nftstorage.link`;
    try {
      isLoading(true)
      
      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error(`Errore nel fetch: ${response.status}`);
      }

      const metadata = await response.json();
      console.log("Name:", metadata.name);
      console.log("Cid:", metadata.cid);
      console.log("Attrbitues:", metadata.attributes[0]);

      const imageCID = metadata.cid;
      const imageUrlFetched = `https://ipfs.infura.io/ipfs/${imageCID}`;
      //const imageUrlFetched = `https://${imageCIDFetched}.ipfs.nftstorage.link`;

      // setImageUrl(imageUrlFetched);
      token.imageCID = imageCID;
      token.metadata = metadata;

      const img = new window.Image();
      img.src = imageUrlFetched;
      img.onload = () => {
        setImageUrl(imageUrlFetched);
        isLoading(false);
      };
      img.onerror = () => {
        setImageUrl(moove_logo);
        isLoading(false);
      };

    } catch (error) {
      console.error("Errore nel recupero dei metadati:", error);
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
            //Comandare sulla base della grandezza dello schermo per avere un popup adeguato
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
            backgroundColor: '#f0f0f0'   // Optional: per sfondo neutro se l'immagine è piccola
          }}
          src={imageUrl}
          alt={"NFT Image not available..."}
        />
        {/* <CardContent sx={{ textAlign: "left"}}>
          <Typography gutterBottom variant="body2" component="div">
            {appContext.shownCollection.symbol}#{token.id}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Price: {formatPrice(token.price, "wei")} wei
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Owner: {formatAddress(token.owner)}
          </Typography>
        </CardContent> */}

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

      {/* Hover: Info in basso */}
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