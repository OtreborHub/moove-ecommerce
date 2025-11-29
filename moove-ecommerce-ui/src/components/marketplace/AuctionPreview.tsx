import { Box, Card, CardActionArea, CardContent, CardMedia, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moove_logo from "../../assets/moove_logo.svg";
import { useAppContext } from "../../Context";
import { payableBuyNFT, readTokenData, readTokenURI, transferTo, writeCreateAuction, writeTokenPrice } from '../../utils/bridges/MooveCollectionsBridge';
import { AuctionType, getAuctionStatus } from '../../utils/enums/Auction';
import { formatToRomeTime, formatAuctionType, formatPrice } from "../../utils/formatValue";
import { AuctionPreviewProps } from '../../utils/Interfaces';
import Loader from '../commons/Loader';
import Token from '../commons/Token';
import { Metadata } from '../../utils/DTO/TokenDTO';
import { useAppKit } from '@reown/appkit/react';
import CreateAuctionForm from '../forms/CreateAuctionForm';
import TransferToForm from '../forms/TransferToForm';
import UpdateTokenPriceForm from '../forms/UpdateTokenPriceForm';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export const IPFS_GATEWAY: string = import.meta.env.VITE_IPFS_GATEWAY as string;

const tooltipTextClassicAuction = <>Place a bid.<br/>The highest offer wins when the auction ends.</>
const tooltipTextDutchAuction = <>The price drops over time.<br/>Buy now if the price suits you.</>
const tooltipTextEnglishAuction = <>Bids must increase.<br/>Highest bid wins when the auction ends.</>

export default function AuctionPreview({auction, handleConnect}: AuctionPreviewProps) {
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
          const metadataUrl = `${IPFS_GATEWAY}${tokenURI}`;
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
              
              const url = `${IPFS_GATEWAY}${imageCID}`;
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
            handleConnect={handleConnect}
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
                  {!isPhone && auction.auctionType === AuctionType.CLASSIC && <>Highest Bid: {formatPrice(auction.highestBid, 'wei')}<br/></>}
                  {!isPhone && <>Current Price: {formatPrice(auction.currentPrice, 'wei')}</>}
              </Typography>
              {!isPhone && auction.minIncrement > 0 && <Typography variant="body2">Min. increment: {formatPrice(auction.minIncrement, 'wei')}</Typography>}
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