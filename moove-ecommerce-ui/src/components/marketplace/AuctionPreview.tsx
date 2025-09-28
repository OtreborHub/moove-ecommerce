import { Box, Button, Card, CardContent, CardMedia, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moove_logo from "../../assets/moove.png";
import { useAppContext } from "../../Context";
import { readTokenData, retrieveBid, writeBuyDutch, writeEndClassicAuction, writeEndEnglishAuction, writePlaceBidClassic, writePlaceBidEnglish } from '../../utils/bridges/MooveCollectionsBridge';
import { AuctionStatus, AuctionType, getAuctionStatus } from '../../utils/enums/Auction';
import { formatToRomeTime, formatAuctionType } from "../../utils/formatValue";
import { AuctionProps } from '../../utils/Interfaces';
import Loader from '../commons/Loader';
import PlaceBidForm from '../forms/PlaceBidForm';

const tooltipTextClassicAuction = <>Place a bid.<br/>The highest offer wins when the auction ends.</>
const tooltipTextDutchAuction = <>The price drops over time.<br/>Buy now if the price suits you.</>
const tooltipTextEnglishAuction = <>Bids must increase.<br/>Highest bid wins when the auction ends.</>

export default function AuctionPreview({auction, connectWallet}: AuctionProps) {
    //const isMobile = useMediaQuery('(max-width: 1400px)');
    const isPhone = useMediaQuery('(max-width: 650px)');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [auctionStatus, setAuctionStatus] = useState<AuctionStatus>(AuctionStatus.NONE);
    const [imageURL, setImageUrl] = useState(moove_logo);
    const appContext = useAppContext();
    const MySwal = withReactContent(Swal);
    
    useEffect(() => {
        setAuctionStatus(getAuctionStatus(auction));
        getTokenImage();
    }, [auction]);

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

    async function getTokenImage(){
        setIsLoading(true);
        //Sostituire con getTokenURI;
        const tokenData = await readTokenData(auction.collection.address, auction.tokenId);
        if(tokenData){
            fetchMetadata(tokenData.URI);
        }
        setIsLoading(false);

    }



    async function fetchMetadata(tokenURI: string){
        const metadataUrl = `https://${tokenURI}.ipfs.nftstorage.link`;
        try {
        const response = await fetch(metadataUrl);
        if (!response.ok) {
            throw new Error(`Errore nel fetch: ${response.status}`);
        }

        const metadata = await response.json();
        console.log("Name:", metadata.name);
        console.log("Cid:", metadata.cid);
        console.log("Attrbitues:", metadata.attributes[0]);

        const imageCIDFetched = metadata.cid;
        const imageUrlFetched = `https://ipfs.infura.io/ipfs/${imageCIDFetched}`;

        setImageUrl(imageUrlFetched);

        } catch (error) {
        console.error("Errore nel recupero dei metadati:", error);
        }
    }

    function showNFTAuction(){
        appContext.updateShownCollection(auction.collection);
        appContext.updateShownNFT(auction.tokenId);
    }

    function closeAndConnectWallet(){
        MySwal.close();
        connectWallet();
    }

    function connectWalletSwal() {
        return (
            <Box>
                <Typography variant='body1'>Don’t worry, it’s just a quick connection.</Typography>
                <Button variant="contained" onClick={closeAndConnectWallet} sx={{backgroundColor:'#f7a642ff', borderRadius:'10px', margin: '1rem'}}>
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
        const success = await writeBuyDutch(auction.collection.address, tokenId, price);
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
            success = await writePlaceBidClassic(auction.collection.address, tokenId, bid);
        } else if (auction.auctionType === AuctionType.ENGLISH){
            success = await writePlaceBidEnglish(auction.collection.address, tokenId, bid);
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
            success = await writeEndClassicAuction(auction.collection.address, tokenId);
        } else if (auction.auctionType === AuctionType.ENGLISH){
            success = await writeEndEnglishAuction(auction.collection.address, tokenId);
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
        if(!auction.ended && appContext.signer !== auction.seller && Math.floor(Date.now() / 1000) < auction.endTime){
            return (
                <Button size="small" variant="contained" onClick={buyPlaceBid} sx={{mr: 1}}>
                    {!isPhone && (auction.auctionType === AuctionType.CLASSIC || auction.auctionType === AuctionType.ENGLISH)? "Place Bid" : "Buy now"}
                    {isPhone && (auction.auctionType === AuctionType.CLASSIC || auction.auctionType === AuctionType.ENGLISH)? "Bid" : "Buy"}
                </Button>
            );
        } else if (appContext.signer && auction.ended && appContext.signer !== auction.seller && appContext.signer !== auction.highestBidder && auction.auctionType === AuctionType.CLASSIC){
            return (
                <Button size="small" variant="outlined" sx={{mr: 1}} onClick={withdraw}>Withdraw</Button>
            );
        } else if (appContext.signer && !auction.ended && appContext.signer === auction.seller && Math.floor(Date.now() / 1000) >= auction.endTime){
            return ( 
                <Button size="small" variant="contained" color="error" sx={{mr: 1}} onClick={() => endAuction(auction.tokenId)}>Finalize</Button>
            )
        }
    }

    async function withdraw(){
        setIsLoading(true);
        const success = await retrieveBid(auction.collection.address, auction.tokenId);
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
            borderColor: auction.ended === true ? "#6f1a1aff": "#000" }}>
            {/* Image */}
            <CardMedia
                component="img"
                image={imageURL}
                width={"30%"}
                alt="NFT Image not available..."
                sx={{ height: 120, width: 120, objectFit: 'contain'}}
            />

            {/* Text */}
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems:'flex-start', gap: 0, padding: 0, width: '40%' }}>
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

                </Tooltip>  }  
                    
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
                
                <Box sx={{ alignSelf: 'flex-end', alignItems: 'flex-end', alignContent:'flex-end', textAlign: 'right', width: '100%', mr: 1 }}>
                    <Typography variant="caption" color={auction.ended === true ? "#6f1a1aff": "#000"}>
                    {auctionStatus}
                    </Typography>
                </Box>

                <Box sx={{ alignSelf: 'flex-end', alignItems: 'flex-end', alignContent:'flex-end', textAlign: 'right', width: '100%' }}>
                    <Button size="small" variant="outlined" sx={{mb: 1, mr: 1}} onClick={showNFTAuction}>View</Button>
                    {choseButtonsToShow()}
                </Box>
            </Box>
                
        </Card>
        <Loader loading={isLoading} />
        </>
    );
}