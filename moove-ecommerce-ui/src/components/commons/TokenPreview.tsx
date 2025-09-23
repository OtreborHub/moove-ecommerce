import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import moove_logo from "../../assets/moove.png";
import { useAppContext } from "../../Context";
import { TokenProps } from "../../utils/Interfaces";
import Token from "./Token";
import { Role } from "../../utils/enums/Role";
import { formatAddress, formatPrice } from "../../utils/formatValue";

export default function TokenPreview({token, connectWallet, handleBuy, handleCreateAuction, handleTransfer, handleTokenPrice}: TokenProps) {
  const MySwal = withReactContent(Swal);
  const appContext = useAppContext();

  // const [metadata,setMetadata] = useState("");

  useEffect(() => {
        //fetchMetadata();
        //Aggiungere chiamata al recupero del tokenURI e metadati
        //readTokenMetadata
    }, []);

  //TOKEN IMAGE - Recuperare da metadati nel TokenURI
  //const cid = "bafybeidqrqzgkmrx2bda7ozag2d7bhavfbs7yrtjza5xdoppcf4tepdpji";
  //const imageUrl = `https://ipfs.infura.io/ipfs/${cid}`;

  //TOKEN METADATA
  //const cid = "bafybeigq3ahv6jwzql75rlqxh7wewj6km4me5hw65qbtj2uei3dqa2zl7i";
  //const metadataUrl = `https://ipfs.infura.io/ipfs/${cid}`;

  //  const fetchMetadata = async () => {
  //     try {
  //       const res = await fetch(metadataUrl);
  //       const json = await res.json();
  //       setMetadata(json);
  //     } catch (err) {
  //       console.error("Errore nel fetch del metadata IPFS:", err);
  //     }
  //   };

  function closeAndHandleConnectWallet(){
    MySwal.close();
    connectWallet();
  }

  function closeAndHandleCreateAuction(){
    MySwal.close();
    handleCreateAuction();
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
            signer={appContext.signer}
            role={appContext.role}
            collection={appContext.shownCollection}
            token={token} 
            connectWallet={closeAndHandleConnectWallet} 
            handleBuy={handleBuy}
            handleCreateAuction={closeAndHandleCreateAuction}
            handleTransfer={closeAndHandleTransfer}
            handleTokenPrice={closeAndHandleTokenPrice}
            />,
          showConfirmButton: false,
          showCloseButton: true,
          customClass: {
            //Comandare sulla base della grandezza dello schermo per avere un popup adeguatoNM
            popup: 'mui-swal-popup-large'
          }
      }); 
  }

  
  return (
    <Card sx={{ 
        maxWidth: 345, 
        zIndex: 1, 
        border: appContext.signer === token.owner && appContext.role === Role.MEMBER ? "2px solid #31e43dff": "" }}>
      <CardActionArea onClick={openTokenDetail}>
        { appContext.signer === token.owner && appContext.role === Role.MEMBER &&
          <Typography sx={{ textAlign: "right", color: "green", marginTop: "0.2rem", marginRight: "0.5rem" }}>
            owned
          </Typography>
        }
        
        <CardMedia
          component="img"
          height="140"
          src={moove_logo}
          alt={"NFT Image not available..."}
        />
        <CardContent sx={{ textAlign: "left"}}>
          <Typography gutterBottom variant="body2" component="div">
            {appContext.shownCollection.symbol}#{token.id}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Price: {formatPrice(token.price, "wei")} wei
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Owner: {formatAddress(token.owner)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}