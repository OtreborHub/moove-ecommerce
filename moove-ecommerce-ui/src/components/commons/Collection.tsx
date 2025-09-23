import { useEffect, useState } from "react";
import { CollectionProps } from "../../utils/Interfaces";
import CollectionDTO from "../../utils/DTO/CollectionDTO";
import { Box, Button, Typography } from "@mui/material";
import { useAppContext } from "../../Context";
import { payBuyNFT, readTokenData, transferTo, writeMintNFT, writeTokenPrice } from "../../utils/bridges/MooveCollectionsBridge";
import TokenDTO from "../../utils/DTO/TokenDTO";
import Loader from "./Loader";
import { Role } from "../../utils/enums/Role";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import MintTokenForm from "../forms/MintTokenForm";
import { readIsAdmin } from "../../utils/bridges/MooveFactoryBridge";
import { ethers } from "ethers";
import CreateAuctionForm from "../forms/CreateAuctionForm";
import TokenPreview from "./TokenPreview";
import TransferTo from "../forms/TransferToForm";
import SetTokenPriceForm from "../forms/SetTokenPriceForm";

export default function Collection() {
  const [tokens, setTokens] = useState<TokenDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const MySwal = withReactContent(Swal);
  const appContext = useAppContext();

  useEffect(() => {
    initCollectionDetail();
  }, []);

  async function initCollectionDetail(){
    var tokensData = [];
    console.log("Init collection detail for collection: ", appContext.shownCollection.address);
    setIsLoading(true);
    //Sostituire con chiamata ad tokenIds e ciclare da 1 a tokenIds
    for(let idx=1; idx<=appContext.shownCollection.totalSupply; idx++){
      const tokenData = await readTokenData(idx, appContext.shownCollection.address);
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

  async function connectWallet() {
    if (window.ethereum) {
      try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          appContext.updateProvider(provider);

          const signer = await provider.getSigner();
          appContext.updateSigner(signer.address);
          console.log(`address: ${signer.address}`);

          setAccountBalance();
          appContext.updateChainId(parseInt(window.ethereum.chainId));

          const isAdmin = await readIsAdmin();
          appContext.updateRole(isAdmin ? Role.ADMIN : Role.MEMBER);
          return true;

      } catch (err) {
          alert('Connessione rifiutata');
          return false;
      }
    } else {
      alert('MetaMask non installato');
      return false;
    }
  }

  async function setAccountBalance(){
    if(!appContext.provider || !appContext.signer) return;

    await appContext.provider.getBalance(appContext.signer).then((balance: bigint) => {
        const bal = parseFloat(ethers.formatEther(balance));
        console.log(`balance available: ${bal.toFixed(18)} ETH`);
        appContext.updateBalance(bal);
    });
  }

  async function handleBuy(tokenId: number, tokenPrice: number){
    setIsLoading(true)
    var success = await payBuyNFT(appContext.shownCollection.address, tokenId, tokenPrice);
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

  function showCreateAuctionForm(){
    MySwal.fire({
        title: "Create Auction",
        html: <CreateAuctionForm />,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  function showTransferForm(tokenId: number){
    MySwal.fire({
        title: "Trasfer NFT",
        html: <TransferTo tokenId={tokenId} handleSubmit={handleTrasferFrom}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleTrasferFrom(tokenId: number, addressTo: string){
    setIsLoading(true);
    var success = await transferTo(appContext.shownCollection.address, tokenId, addressTo);
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
        html: <SetTokenPriceForm tokenId={tokenId} tokenPrice={tokenPrice} handleSubmit={handleSetTokenPrice} />,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleSetTokenPrice(tokenId: number, price: number){
    setIsLoading(true);
    var success = await writeTokenPrice(appContext.shownCollection.address, tokenId, price);
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
        html: <MintTokenForm handleSubmit={handleMint} signer={appContext.signer}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleMint(tokenURI: string, price: number){
    setIsLoading(true);
    var success = await writeMintNFT(appContext.shownCollection.address, tokenURI, price)
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

  function goBack(){
    appContext.updateShownCollection(CollectionDTO.emptyInstance());
  }

  return (
    <>
      <Box alignContent={"left"} m={3.5}>
        <Button variant="outlined" sx={{borderColor: '#f7a642ff', color: '#f7a642ff', m:2}} onClick={goBack}> Back </Button>
        {appContext.role === Role.ADMIN &&
        <Button variant="contained" onClick={showMintTokenForm} sx={{ backgroundColor:'#f7a642ff'}}> Mint NFT </Button>
        }
      </Box>
      
      <Box display="flex" textAlign={"center"} justifyContent={"center"} justifySelf={"center"} flexDirection={"column"} p={3} minWidth={"75%"} sx={{ backgroundColor: "#43434345"}}>
        
        <Box textAlign={"center"} display={"flex"} flexDirection={"column"}>
          <Typography variant="h5" color="#f7a642ff"> <b>{appContext.shownCollection.name.toUpperCase()}</b> </Typography>
          <Typography variant="body2" color="#f7a642ff"> {appContext.shownCollection.address} </Typography>
        </Box>

        <Box display={"flex"} justifyContent={"center"} flexDirection={"row"} margin={2} gap={2}>
        {tokens.length > 0 && tokens.map((token, index) => (
            <TokenPreview 
              key={index} 
              token={token} 
              connectWallet={connectWallet} 
              handleBuy={handleBuy} 
              handleCreateAuction={showCreateAuctionForm}
              handleTransfer={showTransferForm}
              handleTokenPrice={showSetTokenPriceForm}/>
        ))}
        </Box>

        {tokens.length === 0 && !isLoading &&
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, marginTop: 5 }}>
            No tokens found for this collection.
          </Typography>
        }

      </Box>
      <Loader loading={isLoading} /> 
    </>
  );
}
