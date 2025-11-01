import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { TokenAuctionProps } from "../../utils/Interfaces";
import { readCurrentPriceDutch, retrieveBid, writeBuyDutch, writeEndClassicAuction, writeEndEnglishAuction, writePlaceBidClassic, writePlaceBidEnglish } from "../../utils/bridges/MooveCollectionsBridge";
import { AuctionType, getAuctionStatus, getAuctionTypeDescription } from "../../utils/enums/Auction";
import { formatAddress, formatPrice, formatToRomeTime } from "../../utils/formatValue";
import AuctionActionsButton from "../actionsButton/AuctionActionsButton";
import PlaceBidForm from "../forms/PlaceBidForm";
import Loader from "./Loader";

const tooltipTextClassicAuction = <>Place a bid.<br/>The highest offer wins when the auction ends.</>
const tooltipTextDutchAuction = <>The price drops over time.<br/>Buy now if the price suits you.</>
const tooltipTextEnglishAuction = <>Bids must increase.<br/>Highest bid wins when the auction ends.</>

export default function TokenAuction({ auction, signer, signerAddress }: TokenAuctionProps){
    const [isLoadingUpdateDutch, setIsLoading] = useState<boolean>(false);
    const MySwal = withReactContent(Swal);

    useEffect(() => {
        if(auction.auctionType === AuctionType.DUTCH){
            readDutchPrice();
        }
    }, []);

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

    function buyPlaceBid(){
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
    }
  
    async function buyDutch(tokenId: number, price: number){
        setIsLoading(true);
        const success = await writeBuyDutch(auction.collection.address, tokenId, price, signer);
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
            success = await writePlaceBidClassic(auction.collection.address, tokenId, bid, signer);
        } else if (auction.auctionType === AuctionType.ENGLISH){
            success = await writePlaceBidEnglish(auction.collection.address, tokenId, bid, signer);
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
            success = await writeEndClassicAuction(auction.collection.address, tokenId, signer);
        } else if (auction.auctionType === AuctionType.ENGLISH){
            success = await writeEndEnglishAuction(auction.collection.address, tokenId, signer);
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
        const success = await retrieveBid(auction.collection.address, auction.tokenId, signer);
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

    async function readDutchPrice(){
        setIsLoading(true);
        var currentPrice = await readCurrentPriceDutch(auction.collection.address, auction.tokenId);
        auction.currentPrice = currentPrice;
        setIsLoading(false);
    }

    return (
        <Grid container spacing={3} mt={2} ml={2} >
            <>
            <Grid size={9}>
                <Typography textAlign="left"><b>{getAuctionTypeDescription(auction.auctionType)} </b> Auction 
                    <Tooltip title={chooseTooltipText()}>
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
                <Typography textAlign="left"><b>Status:</b> {getAuctionStatus(auction)}</Typography>
                <Typography textAlign="left"><b>Seller:</b> {formatAddress(auction.seller)}</Typography>
                <Typography textAlign="left"><b>Start Price:</b> {formatPrice(auction.startPrice, 'wei')} wei</Typography>
                { (auction.auctionType === AuctionType.CLASSIC || auction.auctionType === AuctionType.ENGLISH) &&
                <>
                    <Typography textAlign="left"><b>Highest bid:</b> {formatPrice(auction.highestBid, 'wei')} wei</Typography>
                    <Typography textAlign="left"><b>Highest bidder:</b> {formatAddress(auction.highestBidder, signerAddress)}</Typography>
                </>
                }
                { auction.auctionType === AuctionType.DUTCH &&
                    <Typography textAlign="left"><b>Current Price: </b> {formatPrice(auction.currentPrice, 'wei')} wei
                        <Button size="small" variant="text" sx={{ml:.5, p:0}} onClick={() => readDutchPrice()}>Update</Button>
                        <Loader loading={isLoadingUpdateDutch}/>
                    </Typography>
                }
                { auction.auctionType === AuctionType.ENGLISH &&
                    <>
                    <Typography textAlign="left"><b>Min increment:</b> {formatPrice(auction.minIncrement,'wei')} wei</Typography>
                    <Typography textAlign="left"><b>Time extension:</b> 5 minutes</Typography>
                    </>
                }
                <Typography textAlign="left"><b>Ends at</b> {formatToRomeTime(auction.endTime)}</Typography>
            </Grid>
            <Grid size={12} alignSelf="center">
                <AuctionActionsButton auction={auction} signer={signer} signerAddress={signerAddress} handleBuyPlaceBid={buyPlaceBid} handleFinalizeAuction={endAuction} handleWithdrawFunds={withdraw}/>
                {/* {choseButtonsToShow()} */}
            </Grid>
            </>
        </Grid>
    );
}