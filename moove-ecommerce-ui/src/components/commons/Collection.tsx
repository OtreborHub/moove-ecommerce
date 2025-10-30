import { Box, Button, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppContext } from "../../Context";
import { payableBuyNFT, readTokenData, transferTo, writeCreateAuction, writeMintNFT, writeTokenPrice } from "../../utils/bridges/MooveCollectionsBridge";
import CollectionDTO from "../../utils/DTO/CollectionDTO";
import TokenDTO from "../../utils/DTO/TokenDTO";
import { Role } from "../../utils/enums/Role";
import { CollectionProps } from "../../utils/Interfaces";
import CreateAuctionForm from "../forms/CreateAuctionForm";
import MintTokenForm from "../forms/MintTokenForm";
import UpdateTokenPriceForm from "../forms/UpdateTokenPriceForm";
import Loader from "./Loader";
import TokenPreview from "./TokenPreview";
import TransferToForm from "../forms/TransferToForm";
import { Sections } from "../../utils/enums/Sections";

export default function Collection({collection, connectMetamask, goBack} : CollectionProps) {
  const [tokens, setTokens] = useState<TokenDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const MySwal = withReactContent(Swal);
  const appContext = useAppContext();

  useEffect(() => {
    init();
  }, []);

  async function init(){
    var tokensData = [];
    setIsLoading(true);
    for(let idx=1; idx<=collection.tokenIds; idx++){
      const tokenData = await readTokenData(collection.address, idx);
      
      if (tokenData) {
        tokensData.push(tokenData);
      } else {
        console.log(`Token data for tokenId ${idx} is undefined`);
        break;
      }

    }
    setTokens(tokensData);
    setIsLoading(false);

  }

  function loadingPropagation(value: boolean){
    setIsLoading(value);
  }

  async function handleBuy(tokenId: number, tokenPrice: number){
    setIsLoading(true)
    var success = await payableBuyNFT(collection.address, tokenId, tokenPrice, appContext.signer);
    setIsLoading(false);
    if(success){
      MySwal.fire({
        title: "Acquire NFT",
        text: "The buy request was successful!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  }

  function showCreateAuctionForm(tokenId: number){
    MySwal.fire({
        title: "Create Auction",
        html: <CreateAuctionForm tokenId={tokenId} collectionSymbol={collection.symbol} handleSubmit={handleCreateAuction}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleCreateAuction(tokenId: number, auctionType: number, startPrice: number, duration: number, minIncrement: number){
    setIsLoading(true);
    const success = await writeCreateAuction(collection.address, tokenId, auctionType, startPrice, duration, minIncrement, appContext.signer);
    setIsLoading(false);
    if(success){
      MySwal.fire({
        title: "Create Auction",
        text: "The auction creation request was successful!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  }

  function showTransferForm(tokenId: number){
    MySwal.fire({
        title: "Trasfer NFT",
        html: <TransferToForm tokenId={tokenId} handleSubmit={handleTrasferFrom}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleTrasferFrom(tokenId: number, addressTo: string){
    setIsLoading(true);
    var success = await transferTo(collection.address, addressTo, tokenId, appContext.signer);
    setIsLoading(false);
    if(success){
      MySwal.fire({
        title: "Transfer NFT",
        text: "The transfer request was successful!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  }

  function showSetTokenPriceForm(tokenId: number, tokenPrice: number){
    MySwal.fire({
        title: "Update Price",
        html: <UpdateTokenPriceForm tokenId={tokenId} tokenPrice={tokenPrice} handleSubmit={handleSetTokenPrice} />,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleSetTokenPrice(tokenId: number, price: number){
    setIsLoading(true);
    var success = await writeTokenPrice(collection.address, tokenId, price, appContext.signer);
    setIsLoading(false);
    if(success){
      MySwal.fire({
        title: "Update NFT Price",
        text: "The update request was successful!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  }

  function showMintTokenForm(){
    MySwal.fire({
        title: "Mint a new NFT",
        html: <MintTokenForm collectionAddress={collection.address} handleSubmit={handleMint} signer={appContext.signerAddress}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleMint(collectionAddress: string, tokenURI: string, price: number){
    setIsLoading(true);
    var success = await writeMintNFT(collectionAddress, tokenURI, price, appContext.signer);
    setIsLoading(false);
    if(success){
      MySwal.fire({
        title: "Mint NFT",
        text: "The minting request was successful!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  }

  function back(){
    if(goBack) goBack();
  }

  return (
    <>
      <Box alignContent={"left"} m={3.5}>
        <Button variant="outlined" sx={{borderColor: '#f7a642ff', color: '#f7a642ff', m:2}} onClick={back}> Back </Button>
        {appContext.role === Role.ADMIN &&
        <Button variant="contained" onClick={showMintTokenForm} sx={{ backgroundColor:'#f7a642ff'}}> Mint NFT </Button>
        }
      </Box>
      
      <Box display="flex" textAlign={"left"} justifyContent={"left"} justifySelf={"center"} flexDirection={"column"} p={3} minWidth={"90%"} sx={{ backgroundColor: "#43434345"}}>
        
        <Box textAlign={"left"} display={"flex"} flexDirection={"column"} ml={2}>
          <Typography variant="h5" color="#f7a642ff"> <b>{collection.name.toUpperCase()}</b> </Typography>
          <Typography variant="body2" color="#f7a642ff"> {collection.address} </Typography>
        </Box>

        {/* <Box display={"flex"} justifyContent={"left"} margin={2}> */}
          <Grid container spacing={1} zIndex={1} m={2}>
          {tokens.length > 0 && tokens.map((token, index) => (
            <Grid
              size={{xs:6, sm:6, md:4, lg:2.4 }} 
              key={index}
              sx={{
                transition: 'transform 0.3s ease-in-out',
                "&:hover": {
                  transform: 'scale(1.15)',
                  zIndex: 2, // opzionale, per farlo sopra le altre card
                }
              }}
            >
              <TokenPreview 
                token={token} 
                isLoading={loadingPropagation}
                connectMetamask={connectMetamask} 
                handleBuy={handleBuy} 
                handleCreateAuction={showCreateAuctionForm}
                handleTransfer={showTransferForm}
                handleUpdatePrice={showSetTokenPriceForm}/>
              </Grid>
          ))}
          </Grid>
        {/* </Box> */}

        {tokens.length === 0 && !isLoading &&
          <Typography variant="h6" component="div" alignSelf="center" sx={{ flexGrow: 1, marginTop: 5, marginBottom: 5 }}>
            No tokens found for this collection.
          </Typography>
        }

      </Box>
      <Loader loading={isLoading} /> 
    </>
  );
}
