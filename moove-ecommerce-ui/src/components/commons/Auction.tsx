import { useEffect, useState } from "react";
import AuctionDTO from "../../utils/DTO/AuctionDTO";
import { Box, Button, Collapse, Grid, IconButton, TableCell, TableRow, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { formatAddress, formatPrice, formatToRomeTime } from '../../utils/formatValue';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { AuctionStatus, AuctionType, getAuctionStatus, getAuctionTypeDescription } from "../../utils/enums/Auction";
import AuctionActionsButton from "../actionsButton/AuctionActionsButton";
import { readCurrentPriceDutch, retrieveBid, writeBuyDutch, writeEndClassicAuction, writeEndEnglishAuction, writePlaceBidClassic, writePlaceBidEnglish } from "../../utils/bridges/MooveCollectionsBridge";
import Loader from "./Loader";
import PlaceBidForm from "../forms/PlaceBidForm";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useAppContext } from "../../Context";
import moove_logo from "../../assets/moove_logo.svg";

type AuctionWithImage = {auction: AuctionDTO} & { imageUrl: string };
const tooltipTextClassicAuction = <>Place a bid.<br/>The highest offer wins when the auction ends.</>
const tooltipTextDutchAuction = <>The price drops over time.<br/>Buy now if the price suits you.</>
const tooltipTextEnglishAuction = <>Bids must increase.<br/>Highest bid wins when the auction ends.</>

export default function Auction({ auctionWithImage }: { auctionWithImage: AuctionWithImage }){
  const isPhone = useMediaQuery('(max-width: 650px)');
  const isMobile = useMediaQuery('(max-width: 1400px)');
  const [isLoadingUpdateDutch, setIsLoading] = useState<boolean>(false);
  const [auctionStatus] = useState<AuctionStatus>(getAuctionStatus(auctionWithImage.auction));
  const [open, setOpen] = useState(false);
  const appContext = useAppContext();
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if(auctionWithImage.auction.auctionType === AuctionType.DUTCH){
        readDutchPrice();
    }
  }, [auctionWithImage.auction, auctionWithImage.imageUrl]);

  async function readDutchPrice(){
      setIsLoading(true);
      var currentPrice = await readCurrentPriceDutch(auctionWithImage.auction.collection.address, auctionWithImage.auction.tokenId);
      auctionWithImage.auction.currentPrice = currentPrice;
      setIsLoading(false);
  }

  const chooseTooltipText = (auction: AuctionDTO) => {
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

  function buyPlaceBid(){
    if(auctionWithImage.auction.auctionType === AuctionType.DUTCH){
        buyDutch(auctionWithImage.auction.tokenId, auctionWithImage.auction.currentPrice);
    } else {
        MySwal.fire({
            title: "Place a bid",
            html: <PlaceBidForm auction={auctionWithImage.auction} handleSubmit={closeAndHandlePlaceBid}/>,
            showConfirmButton: false,
            showCloseButton: true,
        });
    }
  }

  async function buyDutch(tokenId: number, price: number){
      setIsLoading(true);
      const success = await writeBuyDutch(auctionWithImage.auction.collection.address, tokenId, price, appContext.signer);
      setIsLoading(false);
      if(success){
          MySwal.fire({
              title: "Buy Dutch",
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
      if(auctionWithImage.auction.auctionType === AuctionType.CLASSIC){
          success = await writePlaceBidClassic(auctionWithImage.auction.collection.address, tokenId, bid, appContext.signer);
      } else if (auctionWithImage.auction.auctionType === AuctionType.ENGLISH){
          success = await writePlaceBidEnglish(auctionWithImage.auction.collection.address, tokenId, bid, appContext.signer);
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
      if(auctionWithImage.auction.auctionType === AuctionType.CLASSIC){
          success = await writeEndClassicAuction(auctionWithImage.auction.collection.address, tokenId, appContext.signer);
      } else if (auctionWithImage.auction.auctionType === AuctionType.ENGLISH){
          success = await writeEndEnglishAuction(auctionWithImage.auction.collection.address, tokenId, appContext.signer);
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

  async function withdraw(){
      setIsLoading(true);
      const success = await retrieveBid(auctionWithImage.auction.collection.address, auctionWithImage.auction.tokenId, appContext.signer);
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
    <TableRow key={auctionWithImage.auction.tokenId + "_" + auctionWithImage.auction.collection.address} sx={{borderBottom: open? '': '2px solid #444343ff'}}>
      <TableCell align='center' size='small'>
          <IconButton
          aria-label="expand row"
          size="small"
          onClick={() => (setOpen(!open))}
        >
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton> 

      </TableCell>
      <TableCell align="center" size='small' padding='none' sx={{
        transition: 'transform 0.3s ease-in-out',
        "&:hover": {
          transform: 'scale(1.05)',
          zIndex: 2
        }
      }}>
        <img
            src={auctionWithImage.imageUrl}
            alt={`NFT ${auctionWithImage.auction.tokenId}`}
            style={{ width: 120, height: 120, objectFit: "contain"}}
          />
      </TableCell>
      {!isPhone && <TableCell align="left">
        <Box display={"flex"} flexDirection={"column"}>
          <Typography variant='body2'><b> {auctionWithImage.auction.collection.symbol}#{auctionWithImage.auction.tokenId}</b></Typography>
          <Typography variant='body2' sx={{ color: auctionStatus === AuctionStatus.OPEN ? "green" : auctionStatus === AuctionStatus.CLOSED ? "#6f1a1aff" : "grey"}}>{auctionStatus}</Typography>
          <Typography variant='body2'>{getAuctionTypeDescription(auctionWithImage.auction.auctionType)} Auction </Typography>
          {auctionStatus === AuctionStatus.OPEN && <Typography variant='body2'>{auctionWithImage.auction.auctionType === AuctionType.DUTCH ? "Buy now": "Place a bid"} for {formatPrice(auctionWithImage.auction.currentPrice, 'wei')} wei</Typography>}
          <Typography variant='body2'>Ends at {isPhone ? formatToRomeTime(auctionWithImage.auction.endTime).substring(0,10) : formatToRomeTime(auctionWithImage.auction.endTime)}</Typography>
        </Box>
      </TableCell>}

      {/* ACTIONS BUTTON */}
      <TableCell align="center">
        <AuctionActionsButton auction={auctionWithImage.auction} signer={appContext.signer} signerAddress={appContext.signerAddress} handleBuyPlaceBid={buyPlaceBid} handleFinalizeAuction={endAuction} handleWithdrawFunds={withdraw} />
      </TableCell>

    </TableRow>
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} sx={{borderBottom: open? '2px solid #444343ff': '', paddingBottom: "2rem" }}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1 }}>
            <Typography variant="h6" gutterBottom>
              <Grid container>
                <Grid size={isMobile ? 12 : 8} textAlign={"center"}>
                  <Typography variant='body1'><b>Auction Data</b></Typography>
                  <hr/>
                  <Grid container>
                    <Grid size={6} textAlign={"left"}>
                      {/* <Typography variant='body2'><b>Token: {auctionWithImage.auction.collection.symbol}#{auctionWithImage.auction.tokenId}</b></Typography> */}
                      <Typography variant='body2'><b>{getAuctionTypeDescription(auctionWithImage.auction.auctionType)}</b> Auction 
                        <Tooltip title={chooseTooltipText(auctionWithImage.auction)}>
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
                        </Tooltip>    
                      </Typography>
                      <Typography variant='body2'><b>Seller:</b> {formatAddress(auctionWithImage.auction.seller)}</Typography>
                      <Typography variant='body2'><b>Start Price:</b> {formatPrice(auctionWithImage.auction.startPrice, 'wei')} wei</Typography>
                      <Typography variant='body2'><b>Current Price:</b> {formatPrice(auctionWithImage.auction.currentPrice, 'wei')} wei
                              {auctionWithImage.auction.auctionType === AuctionType.DUTCH && 
                              <Box display={"inline-flex"}>
                                <Button size="small" variant="text" sx={{ml:.5, p:0}} onClick={() => readDutchPrice()}>Update</Button>
                                <Loader loading={isLoadingUpdateDutch}/>
                              </Box>
                              }
                      </Typography>
                    </Grid>
                    <Grid size={6} textAlign={"left"} marginTop={isMobile? '1rem': ''}>
                      <Typography variant='body2'><b>Highest Bidder:</b> {formatAddress(auctionWithImage.auction.highestBidder)}</Typography>
                      {auctionWithImage.auction.auctionType === AuctionType.ENGLISH && 
                        <Typography variant='body2'><b>Min increment:</b> {formatPrice(auctionWithImage.auction.minIncrement, 'wei')} wei</Typography>
                      }
                      <Typography variant='body2'><b>Start Time:</b> {formatToRomeTime(auctionWithImage.auction.startTime)}</Typography>
                      <Typography variant='body2'><b>End Time:</b> {formatToRomeTime(auctionWithImage.auction.endTime)}</Typography>
                      <Typography variant='body2'><b>Status:</b> {auctionStatus}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={isMobile ? 12 : 4}>
                  <Typography variant='body1'><b>Collection Data</b></Typography>
                  <hr/>
                  <Typography variant='body2'><b>{auctionWithImage.auction.collection.name} | {auctionWithImage.auction.collection.symbol}</b></Typography>
                  <Typography variant='body2'><b>Address:</b> {formatAddress(auctionWithImage.auction.collection.address)}</Typography>
                  <Typography variant='body2'><b>Owner:</b> {formatAddress(auctionWithImage.auction.collection.owner)}</Typography>
                  <Typography variant='body2'><b>#Total NFTs:</b> {auctionWithImage.auction.collection.totalSupply}</Typography>
                  {/* <Typography variant='body2'><b>#Active NFTs:</b> {auctionWithImage.auction.collection.tokenIds}</Typography> */}
                </Grid>
              </Grid>
            </Typography>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
    </>
  );
}
