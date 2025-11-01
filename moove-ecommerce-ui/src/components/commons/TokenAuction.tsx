import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { AuctionProps } from "../../utils/Interfaces";
import { readCurrentPriceDutch, retrieveBid, writeBuyDutch, writeEndClassicAuction, writeEndEnglishAuction, writePlaceBidClassic, writePlaceBidEnglish } from "../../utils/bridges/MooveCollectionsBridge";
import { AuctionStatus, AuctionType, getAuctionStatus, getAuctionTypeDescription } from "../../utils/enums/Auction";
import { formatAddress, formatToRomeTime } from "../../utils/formatValue";
import Loader from "./Loader";

const tooltipTextClassicAuction = <>Place a bid.<br/>The highest offer wins when the auction ends.</>
const tooltipTextDutchAuction = <>The price drops over time.<br/>Buy now if the price suits you.</>
const tooltipTextEnglishAuction = <>Bids must increase.<br/>Highest bid wins when the auction ends.</>

export default function TokenAuction({ auction, signer, signerAddress }: AuctionProps){
    const [isLoadingUpdateDutch, setIsLoading] = useState<boolean>(false);
    const [auctionStatus, setAuctionStatus] = useState<AuctionStatus>(AuctionStatus.NONE); //Usare per comandare visualizzazione dei pulsanti?
    const MySwal = withReactContent(Swal);
    const [formData, setFormData] = useState({
    bid: auction.auctionType === AuctionType.ENGLISH ? auction.currentPrice + auction.minIncrement: 0,
    unit: 'Wei'
    });

    useEffect(() => {
        setAuctionStatus(getAuctionStatus(auction));
        if(auction.auctionType === AuctionType.DUTCH){
            readDutchPrice();
        }
        console.log("highest bidder:" +  auction.highestBidder)
        console.log("highest seller:" +  auction.seller)
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

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        let valueForced = 0;
        setFormData({...formData, [name]: valueForced > 0 ? valueForced : value });
    };

    async function buyPlaceBid(){
        if(signer){
            let success = false;
            if(auction.auctionType === AuctionType.DUTCH){
                success = await writeBuyDutch(auction.collection.address, auction.tokenId, auction.currentPrice, signer);
            } if(auction.auctionType === AuctionType.CLASSIC){
                success = await writePlaceBidClassic(auction.collection.address, auction.tokenId, formData.bid, signer);
            } else if (auction.auctionType === AuctionType.ENGLISH){

                if(formData.bid > auction.currentPrice + auction.minIncrement){
                    success = await writePlaceBidEnglish(auction.collection.address, auction.tokenId, formData.bid, signer);    
                } else {
                    MySwal.fire({
                        title: "Check you bid",
                        text: "It should be at least the current price added to minimun increment.",
                        icon: "warning",
                        confirmButtonColor: "#3085d6",
                    });
                }
            }
            
            if(success){
            MySwal.fire({
                title: auction.auctionType === AuctionType.DUTCH ? "Buy Dutch" : "Bid Place",
                text: auction.auctionType === AuctionType.DUTCH ? "The buy request was successful!": "The bid place request was successfull!",
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
            }
        }
    }

    function verifyBid(){
        return formData.bid > auction.currentPrice + auction.minIncrement;
    }

    async function withdraw(){
        const success = await retrieveBid(auction.collection.address, auction.tokenId, signer);
        if(success){
            MySwal.fire({
                title: "Withdraw",
                text: "The withdraw request was successful!",
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
        }
    }

    async function endAuction(){
        let success = false;
        if(auction.auctionType === AuctionType.CLASSIC){
            success = await writeEndClassicAuction(auction.collection.address, auction.tokenId, signer);
        } else if (auction.auctionType === AuctionType.ENGLISH){
            success = await writeEndEnglishAuction(auction.collection.address, auction.tokenId, signer);
        }
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
        if(!auction.ended && signerAddress !== auction.seller && Math.floor(Date.now() / 1000) < auction.endTime){
            return (
                <>
                {auction.auctionType !== AuctionType.DUTCH &&
                <Grid container spacing={2}>
                    <Grid size={8}>
                        <TextField
                            fullWidth
                            margin="normal"
                            type="number"
                            id="bid"
                            name="bid"
                            label="Your bid"
                            value={formData.bid}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid size={4}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="unit-label">Unit</InputLabel>
                            <Select
                            labelId="unit-label"
                            id="unit"
                            name="unit"
                            label="Unit"
                            value={formData.unit}
                            onChange={handleChange}
                            >
                            <MenuItem value="ETH">ETH</MenuItem>
                            <MenuItem value="Finney">Finney</MenuItem>
                            <MenuItem value="Wei">Wei</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                }
                <Button size="large" variant="contained" onClick={buyPlaceBid} sx={{mr: 1}} fullWidth disabled={!signer}>
                    {auction.auctionType === AuctionType.CLASSIC || auction.auctionType === AuctionType.ENGLISH? "Place Bid" : "Buy now"}
                </Button>
                </>
            );
        } else if (signer && auction.auctionType === AuctionType.CLASSIC && auction.ended && signerAddress !== auction.seller && signerAddress !== auction.highestBidder ){//&& se presente nell'elenco dei bidders
            return (
                <Button size="small" variant="outlined" sx={{mr: 1}} onClick={withdraw} fullWidth>Withdraw Bid</Button>
            );
        } else if (signer && !auction.ended && signerAddress === auction.seller && Math.floor(Date.now() / 1000) >= auction.endTime){
            return ( 
                <Button size="small" variant="contained" color="error" sx={{mr: 1}} onClick={endAuction} fullWidth>Finalize Auction</Button>
            )
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
            <Grid size={5}>
                <Grid textAlign="left"><b>Type</b></Grid>
                <Grid textAlign="left"><b>Status</b></Grid>
                <Grid textAlign="left"><b>Seller</b> </Grid>
                <Grid textAlign="left"><b>Start Price</b></Grid>
                { (auction.auctionType === AuctionType.CLASSIC || auction.auctionType === AuctionType.ENGLISH) &&
                <>
                    <Grid textAlign="left"><b>Highest bid</b></Grid>
                    <Grid textAlign="left"><b>Highest bidder</b></Grid>
                </>
                }
                { auction.auctionType === AuctionType.DUTCH &&
                    <Grid textAlign="left"><b>Current Price</b></Grid>
                }
                { auction.auctionType === AuctionType.ENGLISH &&
                    <>
                    <Grid textAlign="left"><b>Min increment</b></Grid>
                    <Grid textAlign="left"><b>Time extension</b></Grid>
                    </>
                }
                <Grid textAlign="left"><b>Ends at</b></Grid>
            </Grid>
            <Grid size={7}>
                <Grid textAlign="left">{getAuctionTypeDescription(auction.auctionType)} 
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

                </Grid>
                <Grid textAlign="left">{getAuctionStatus(auction)}</Grid>
                <Grid textAlign="left">{formatAddress(auction.seller)}</Grid>
                <Grid textAlign="left">{auction.startPrice} wei</Grid>
                { (auction.auctionType === AuctionType.CLASSIC || auction.auctionType === AuctionType.ENGLISH) &&
                <>
                    <Grid textAlign="left">{auction.highestBid} wei</Grid>
                    <Grid textAlign="left">{formatAddress(auction.highestBidder, signerAddress)}</Grid>
                </>
                }
                { auction.auctionType === AuctionType.DUTCH &&
                    <Grid textAlign="left">{auction.currentPrice} wei
                        <Button size="small" variant="text" sx={{ml:.5, p:0}} onClick={() => readDutchPrice()}>Update</Button>
                        <Loader loading={isLoadingUpdateDutch}/>
                    </Grid>
                }
                { auction.auctionType === AuctionType.ENGLISH &&
                    <>
                    <Grid textAlign="left">{auction.minIncrement} wei</Grid>
                    <Grid textAlign="left">5 minutes</Grid>
                    </>

                }
                <Grid textAlign="left">{formatToRomeTime(auction.endTime)}</Grid>
            </Grid>
            <Grid size={12} alignSelf="center">
                {choseButtonsToShow()}
            </Grid>
            </>
        </Grid>
    );
}