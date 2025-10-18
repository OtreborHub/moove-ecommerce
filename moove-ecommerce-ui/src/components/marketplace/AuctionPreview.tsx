import { Box, Button, Card, CardContent, CardMedia, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moove_logo from "../../assets/moove.png";
import { useAppContext } from "../../Context";
import { readTokenURI, retrieveBid, writeBuyDutch, writeEndClassicAuction, writeEndEnglishAuction, writePlaceBidClassic, writePlaceBidEnglish } from '../../utils/bridges/MooveCollectionsBridge';
import { AuctionStatus, AuctionType, getAuctionStatus } from '../../utils/enums/Auction';
import { formatToRomeTime, formatAuctionType } from "../../utils/formatValue";
import { AuctionProps } from '../../utils/Interfaces';
import Loader from '../commons/Loader';
import PlaceBidForm from '../forms/PlaceBidForm';

// ✅ Gateway IPFS multipli con fallback
const IPFS_GATEWAYS = [
  'https://ipfs.infura.io/ipfs/',
  'https://nftstorage.link/ipfs',
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://gateway.pinata.cloud/ipfs'
];

const tooltipTextClassicAuction = <>Place a bid.<br/>The highest offer wins when the auction ends.</>
const tooltipTextDutchAuction = <>The price drops over time.<br/>Buy now if the price suits you.</>
const tooltipTextEnglishAuction = <>Bids must increase.<br/>Highest bid wins when the auction ends.</>

export default function AuctionPreview({auction, connectWallet}: AuctionProps) {
    const isPhone = useMediaQuery('(max-width: 650px)');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [auctionStatus, setAuctionStatus] = useState<AuctionStatus>(AuctionStatus.NONE);
    const [imageURL, setImageUrl] = useState(moove_logo);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
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

    // ✅ Funzione helper per provare il caricamento con timeout
    async function loadImageWithTimeout(url: string, timeout: number = 5000): Promise<boolean> {
        return new Promise((resolve) => {
            const img = new window.Image();
            const timer = setTimeout(() => {
                console.log(`⏱️ Timeout for: ${url}`);
                resolve(false);
            }, timeout);

            img.onload = () => {
                clearTimeout(timer);
                setImageUrl(url);
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

    // ✅ Prova gateway multipli in sequenza (con timeout ridotto per home)
    async function tryMultipleGateways(cid: string): Promise<boolean> {
        for (const gateway of IPFS_GATEWAYS) {
            const url = `${gateway}/${cid}`;
            console.log(`🔄 [Auction ${auction.tokenId}] Trying: ${gateway}`);
            
            const success = await loadImageWithTimeout(url, 3000); // ✅ Timeout ridotto a 3s per home
            if (success) {
                console.log(`✅ [Auction ${auction.tokenId}] Success: ${gateway}`);
                return true;
            }
        }
        console.log(`❌ [Auction ${auction.tokenId}] All gateways failed`);
        return false;
    }

    async function getTokenImage(){
        // ✅ Non bloccare il render, usa flag locale
        setIsLoading(true);
        
        try {
            const tokenURI = await readTokenURI(auction.collection.address, auction.tokenId);
            if (!tokenURI) {
                console.log(`⚠️ [Auction ${auction.tokenId}] Token URI is undefined`);
                setImageLoadFailed(true);
                return;
            }
            await fetchMetadata(tokenURI);
        } catch (error) {
            console.error(`❌ [Auction ${auction.tokenId}] Error getting token image:`, error);
            setImageUrl(moove_logo);
            setImageLoadFailed(true);
        } finally {
            // ✅ SEMPRE rimuovi il loader
            setIsLoading(false);
        }
    }

    async function fetchMetadata(tokenURI: string){
        try {
            const metadataUrl = `https://nftstorage.link/ipfs/${tokenURI}`;
            console.log(`📥 [Auction ${auction.tokenId}] Fetching metadata from: ${metadataUrl}`);
            
            // ✅ Timeout ridotto per home (5s invece di 10s)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(metadataUrl, { 
                signal: controller.signal 
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const metadata = await response.json();
            console.log(`✅ [Auction ${auction.tokenId}] Metadata fetched:`, metadata.name);

            const imageCID = metadata.cid;
            
            // ✅ Prova gateway multipli
            const success = await tryMultipleGateways(imageCID);
            
            if (!success) {
                console.warn(`⚠️ [Auction ${auction.tokenId}] Using fallback logo`);
                setImageUrl(moove_logo);
                setImageLoadFailed(true);
            }

        } catch (error: any) {
            // ✅ Gestisci meglio gli errori di abort
            if (error.name === 'AbortError') {
                console.warn(`⏱️ [Auction ${auction.tokenId}] Fetch timeout`);
            } else {
                console.error(`❌ [Auction ${auction.tokenId}] Error fetching metadata:`, error);
            }
            setImageUrl(moove_logo);
            setImageLoadFailed(true);
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
                <Typography variant='body1'>Don't worry, it's just a quick connection.</Typography>
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
                alt={imageLoadFailed ? "NFT Image not available..." : "Loading NFT Image..."}
                sx={{ 
                    height: 120, 
                    width: 120, 
                    objectFit: 'contain',
                    // ✅ Indicatore visivo di caricamento
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'opacity 0.3s ease'
                }}
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
        {/* ✅ Loader solo per transazioni, non per caricamento immagini */}
        <Loader loading={isLoading} />
        </>
    );
}