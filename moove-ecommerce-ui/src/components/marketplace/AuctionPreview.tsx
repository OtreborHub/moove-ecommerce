import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moove_logo from "../../assets/moove_logo.svg";
import { emptySigner, useAppContext } from "../../Context";
import { payableBuyNFT, readTokenData, readTokenURI, retrieveBid, transferTo, writeBuyDutch, writeCreateAuction, writeEndClassicAuction, writeEndEnglishAuction, writePlaceBidClassic, writePlaceBidEnglish, writeTokenPrice } from '../../utils/bridges/MooveCollectionsBridge';
import { AuctionStatus, AuctionType, getAuctionStatus } from '../../utils/enums/Auction';
import { formatToRomeTime, formatAuctionType } from "../../utils/formatValue";
import { AuctionPreviewProps } from '../../utils/Interfaces';
import Loader from '../commons/Loader';
import PlaceBidForm from '../forms/PlaceBidForm';
import Token from '../commons/Token';
import TokenDTO, { Metadata } from '../../utils/DTO/TokenDTO';
import { useAppKit } from '@reown/appkit/react';
import CreateAuctionForm from '../forms/CreateAuctionForm';
import TransferToForm from '../forms/TransferToForm';
import UpdateTokenPriceForm from '../forms/UpdateTokenPriceForm';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const IPFS_gateway = 'https://amber-adverse-llama-592.mypinata.cloud/ipfs/';
const tooltipTextClassicAuction = <>Place a bid.<br/>The highest offer wins when the auction ends.</>
const tooltipTextDutchAuction = <>The price drops over time.<br/>Buy now if the price suits you.</>
const tooltipTextEnglishAuction = <>Bids must increase.<br/>Highest bid wins when the auction ends.</>

export default function AuctionPreview({auction, connectMetamask}: AuctionPreviewProps) {
  const isPhone = useMediaQuery('(max-width: 650px)');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageURL, setImageURL] = useState(moove_logo);
  const [tokenMetadata, setTokenMetadata] = useState<Metadata>({name:"", cid:"", attributes: []});
  const appContext = useAppContext();
  const MySwal = withReactContent(Swal);
  const { open } = useAppKit();
  
  useEffect(() => {
      getTokenImage();
  }, [auction, appContext.signerAddress]);

  const chooseTooltipText = () => {
      switch(auction.auctionType){
          case AuctionType.CLASSIC:
              return tooltipTextClassicAuction;
          case AuctionType.DUTCH:
              return tooltipTextDutchAuction;
          case AuctionType.ENGLISH:
              return tooltipTextEnglishAuction;
          default:
              return "";
      }
  }

  async function loadImageWithTimeout(url: string, timeout: number = 5000): Promise<boolean> {
      return new Promise((resolve) => {
          const img = new window.Image();
          const timer = setTimeout(() => {
              console.log(`⏱️ Timeout for: ${url}`);
              resolve(false);
          }, timeout);

          img.onload = () => {
              clearTimeout(timer);
              setImageURL(url);
              resolve(true);
          };

          img.onerror = () => {
              clearTimeout(timer);
              console.log(`❌ Failed to load: ${url}`);
              resolve(false);
          };

          img.src = url;
      });
  }

  async function getTokenImage(){
      setIsLoading(true);
      try {
          const tokenURI = await readTokenURI(auction.collection.address, auction.tokenId);
          if (!tokenURI) {
              console.log(`⚠️ [Auction ${auction.tokenId}] Token URI is undefined`);
              return;
          }
          await fetchMetadata(tokenURI);
      } catch (error) {
          console.error(`❌ [Auction ${auction.tokenId}] Error getting token image:`, error);
          setImageURL(moove_logo);
      } finally {
          setIsLoading(false);
      }
  }

  async function fetchMetadata(tokenURI: string){
      try {
          const metadataUrl = `${IPFS_gateway}${tokenURI}`;
          console.log(`📥 [Auction ${auction.tokenId}] Fetching metadata from: ${metadataUrl}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(metadataUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (response.ok) {
              const metadata = await response.json();
              console.log(`✅ [Auction ${auction.tokenId}] Metadata fetched:`, metadata.name);
  
              const imageCID = metadata.cid;
              setTokenMetadata(metadata);
              
              const url = `${IPFS_gateway}${imageCID}`;
              console.log(`🔄 [Auction ${auction.tokenId}] Trying: ${url}`);
          
              const success = await loadImageWithTimeout(url, 3000);
              
              if (!success) {
                  console.warn(`⚠️ [Auction ${auction.tokenId}] Using fallback logo`);
                  setImageURL(moove_logo);
              }
          } else {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

      } catch (error: any) {
          console.error(`❌ [Auction ${auction.tokenId}] Error fetching metadata:`, error);
          setImageURL(moove_logo);
      }
  }

  async function showNFTAuction(){
    setIsLoading(true);
    const responseTokenData = await readTokenData(auction.collection.address, auction.tokenId);
    setIsLoading(false);
    if(responseTokenData){
        MySwal.fire({
            html: <Token 
            isLoading={setIsLoading}
            collection={auction.collection}
            token={responseTokenData} 
            auction={auction}
            metadata={tokenMetadata}
            signerAddress={appContext.signerAddress}
            signer={appContext.signer}
            connectWC={closeAndConnectWC} 
            connectMetamask={closeAndConnectMetamask}
            handleBuy={closeAndHandleBuy}
            handleCreateAuction={showCreateAuctionForm}
            handleUpdatePrice={showUpdateTokenPriceForm}
            handleTransfer={showTransferForm}
            />,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
            popup: 'my-fullscreen-swal'
            }
        }); 
    }
  }

  function closeAndConnectMetamask(){
      MySwal.close();
      connectMetamask();
  }

  function closeAndConnectWC(){
      MySwal.close();
      open();
  }

  async function closeAndHandleBuy(tokenId: number, tokenPrice: number){
    // MySwal.close();
    setIsLoading(true)
    var success = await payableBuyNFT(auction.collection.address, tokenId, tokenPrice, appContext.signer);
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
        html: <CreateAuctionForm tokenId={tokenId} collectionSymbol={auction.collection.symbol} handleSubmit={handleCreateAuction}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleCreateAuction(tokenId: number, auctionType: number, startPrice: number, duration: number, minIncrement: number){
    setIsLoading(true);
    const success = await writeCreateAuction(auction.collection.address, tokenId, auctionType, startPrice, duration, minIncrement, appContext.signer);
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

  function showUpdateTokenPriceForm(tokenId: number, tokenPrice: number){
    MySwal.fire({
        title: "Update Price",
        html: <UpdateTokenPriceForm tokenId={tokenId} tokenPrice={tokenPrice} handleSubmit={handleUpdateTokenPrice} />,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  async function handleUpdateTokenPrice(tokenId: number, price: BigInt){
    setIsLoading(true);
    var success = await writeTokenPrice(auction.collection.address, tokenId, price, appContext.signer);
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
    var success = await transferTo(auction.collection.address, addressTo, tokenId, appContext.signer);
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

  function connectWalletSwal() {
      return (
          <Box>
              {/* TODO: SISTEMARE */}
              <Typography variant='body1'>Don't worry, it's just a quick connection.</Typography>
              <Button variant="contained" onClick={closeAndConnectMetamask} sx={{backgroundColor:'#f7a642ff', borderRadius:'10px', margin: '1rem'}}>
                  Connect Wallet
              </Button>
          </Box>
      )
  }

  function buyPlaceBid(){
      if(appContext.signer){
          if(auction.auctionType === AuctionType.DUTCH){
              buyDutch(auction.tokenId, auction.currentPrice);
          } else {
              MySwal.fire({
                  title: "Place BID",
                  html: <PlaceBidForm auction={auction} handleSubmit={closeAndHandlePlaceBid}/>,
                  showConfirmButton: false,
                  showCloseButton: true,
              });
          }

      } else {
          MySwal.fire({
              title: "Ready to buy your first NFT?",
              html: connectWalletSwal(),
              showConfirmButton: false,
              showCloseButton: true,
          });
      }
  }

  async function buyDutch(tokenId: number, price: number){
      setIsLoading(true);
      const success = await writeBuyDutch(auction.collection.address, tokenId, price, appContext.signer);
      setIsLoading(false);
      if(success){
          MySwal.fire({
              title: "Place Bid",
              text: "The buy request was successful!",
              icon: "success",
              confirmButtonColor: "#3085d6",
          });
      }
  }

  async function closeAndHandlePlaceBid(tokenId: number, bid: number){
      MySwal.close();
      let success = false;
      setIsLoading(true);
      if(auction.auctionType === AuctionType.CLASSIC){
          success = await writePlaceBidClassic(auction.collection.address, tokenId, bid, appContext.signer);
      } else if (auction.auctionType === AuctionType.ENGLISH){
          success = await writePlaceBidEnglish(auction.collection.address, tokenId, bid, appContext.signer);
      }
      setIsLoading(false);
      if(success){
          MySwal.fire({
              title: "Place Bid",
              text: "The place bid request was successful!",
              icon: "success",
              confirmButtonColor: "#3085d6",
          });
      }
  }

  async function endAuction(tokenId: number){
      setIsLoading(true);
      let success = false;
      if(auction.auctionType === AuctionType.CLASSIC){
          success = await writeEndClassicAuction(auction.collection.address, tokenId, appContext.signer);
      } else if (auction.auctionType === AuctionType.ENGLISH){
          success = await writeEndEnglishAuction(auction.collection.address, tokenId, appContext.signer);
      }
      setIsLoading(false);
      if(success){
          MySwal.fire({
              title: "Finalize Auction",
              text: "The close auction request was successful!",
              icon: "success",
              confirmButtonColor: "#3085d6",
          });
      }
  }

  const choseButtonsToShow = () => {
      if(!auction.ended && appContext.signerAddress !== auction.seller && Math.floor(Date.now() / 1000) < auction.endTime){
          if(isPhone){
              return (
                  <Button size="small" variant="contained" onClick={buyPlaceBid} sx={{mr: 1}}>
                      {(auction.auctionType === AuctionType.CLASSIC || auction.auctionType === AuctionType.ENGLISH)? "Bid" : "Buy"}
                  </Button>
              );
          } else {
              return (
                  <Button size="small" variant="contained" onClick={buyPlaceBid} sx={{mr: 1}}>
                      {(auction.auctionType === AuctionType.CLASSIC || auction.auctionType === AuctionType.ENGLISH)? "Place Bid" : "Buy now"}
                  </Button>
              );
          }
          
      } else if (appContext.signer === emptySigner && auction.ended && appContext.signerAddress !== auction.seller && appContext.signerAddress !== auction.highestBidder && auction.auctionType === AuctionType.CLASSIC){
          return (
              <Button size="small" variant="outlined" sx={{mr: 1}} onClick={withdraw}>Withdraw</Button>
          );
      } else if (appContext.signer !== emptySigner && !auction.ended && appContext.signerAddress === auction.seller && Math.floor(Date.now() / 1000) >= auction.endTime){
          return ( 
              <Button size="small" variant="contained" color="error" sx={{mr: 1}} onClick={() => endAuction(auction.tokenId)}>Finalize</Button>
          )
      }
  }

  async function withdraw(){
      setIsLoading(true);
      const success = await retrieveBid(auction.collection.address, auction.tokenId, appContext.signer);
      setIsLoading(false);
      if(success){
          MySwal.fire({
              title: "Withdraw",
              text: "The withdraw request was successful!",
              icon: "success",
              confirmButtonColor: "#3085d6",
          });
      }
  }
  
  return (
      <>
      <Card sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent:'space-between', 
          padding: .3, 
          border: "2px solid", 
          maxHeight: "140px",
          borderColor: auction.ended === true ? "#6f1a1aff": "#000",
          overflow: "visible"}}>
          {/* Image */}
          <CardMedia
              component="img"
              image={imageURL}
              width={"30%"}
              alt={"NFT Image not available..."}
              sx={{ 
                  height: 120, 
                  width: 120, 
                  objectFit: 'contain',
                  // ✅ Indicatore visivo di caricamento
                  opacity: isLoading ? 0.5 : 1,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 6,
                  }, 
                  zIndex: 2
              }}
          />

          {/* Text */}
          <CardActionArea onClick={showNFTAuction} sx={{ display: 'flex', padding: 0, justifyContent: 'space-around'}}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems:'flex-start', gap: 0, padding: 0, width: '60%' }}>
              <Typography variant="subtitle2"> {auction.collection?.symbol}#{auction.tokenId} • {auction.collection?.name}</Typography>
              <Typography variant="body2">{formatAuctionType(auction.auctionType)} Auction{' '}
              {!isPhone && <Tooltip title={chooseTooltipText()}>
                  
                  <Box
                      component="span"
                      sx={{
                      backgroundColor: '#f7a64280',
                      color: 'white',
                      borderRadius: '50%',
                      width: 15,
                      height: 15,
                      fontSize: 14,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'help',
                      ml: 0.3,
                      }}
                  >?</Box>

              </Tooltip>}  
                  
              </Typography>
              <Typography variant="body2">
                  {!isPhone && auction.auctionType === AuctionType.CLASSIC && <>Highest Bid: {auction.highestBid} Wei<br/></>}
                  {!isPhone && <>Current Price: {auction.currentPrice} Wei</>}
              </Typography>
              {!isPhone && auction.minIncrement > 0 && <Typography variant="body2">Min. increment: {auction.minIncrement} Wei</Typography>}
              <Typography variant="body2">Ends at: {isPhone ? formatToRomeTime(auction.endTime).substring(0,10) : formatToRomeTime(auction.endTime)}</Typography>
          </CardContent>

          {/* Captions and Buttons */}
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, height: 120, justifyContent:'flex-start', width: '30%', '& button': {width: "75%"}}}>
              
              <Box sx={{ alignSelf: 'flex-end', alignItems: 'flex-end', alignContent:'flex-end', textAlign: 'right', width: '100%', mr: 1, mt:1 }}>
                  <Typography variant="caption" color={auction.ended === true ? "#6f1a1aff": "#000"}>
                  {getAuctionStatus(auction)}
                  </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center',  justifyContent: 'flex-end', textAlign: 'right', height: '50%'  }}>
                  {/* <Button size="small" variant="outlined" sx={{mb: 1, mr: 1}} onClick={showNFTAuction}>View</Button> */}
                  {/* {choseButtonsToShow()} */}
                  <ArrowForwardIosIcon fontSize='medium' />
              </Box>
          </Box>
          </CardActionArea>
              
      </Card>
      {/* ✅ Loader solo per transazioni, non per caricamento immagini */}
      <Loader loading={isLoading} />
      </>
  );
}