import { Box, Button, CardMedia, Grid, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import moove_logo from "../../assets/moove.png";
import { TokenProps } from "../../utils/Interfaces";
import { formatAddress, formatPrice } from "../../utils/formatValue";
import Auction from "./Auction";
import TokenActionsButton from "../actionsButton/TokenActionsButton";
import { readTokenURI } from "../../utils/bridges/MooveCollectionsBridge";

export default function Token({ signer, collection, token, connectWallet, handleBuy, handleCreateAuction, handleTransfer, handleUpdatePrice: handleTokenPrice}: TokenProps) {
    const [section, setSection] = useState<number>(token.auction.tokenId > 0 ? 1 : 0);
    const [imageUrl, setImageUrl] = useState(moove_logo);
    const isPhone = useMediaQuery('(max-width: 650px)');
    
    useEffect(() => {
        getTokenImage();
    }, [])

    async function getTokenImage(){
        const tokenURI = await readTokenURI(collection.address, token.id);
        if(tokenURI){
            fetchMetadata(tokenURI);
        } else {
            console.log("Token URI is undefined");
        }
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
        // console.log("Cid:", metadata.cid);
        // console.log("Attrbitues:", metadata.attributes[0]);

        const imageCID = metadata.cid;
        const imageUrlFetched = `https://ipfs.infura.io/ipfs/${imageCID}`;
        
        const img = new window.Image();
        img.src = imageUrlFetched;
        // const timeout = setTimeout(() => {
        //     img.onerror?.(new Event('error'));
        // }, 5000); // 5 second timeout

        img.onload = () => {
            // clearTimeout(timeout);
            setImageUrl(imageUrlFetched);
        };
        img.onerror = () => {
            // clearTimeout(timeout);
            setImageUrl(moove_logo);
        };

        } catch (error) {
            console.error("Errore nel recupero dei metadati:", error);
        }
    }


    return (
        <Box padding={1}>
            <Grid container spacing={4} mb={4}>
                <Grid size={6}>
                    <CardMedia
                    component="img"
                    sx={{ width: '100%', height: 'auto', objectFit: 'contain', mt:1.5}}
                    src={imageUrl}
                    alt={"NFT Preview not available..."}
                    />
                </Grid>
                <Grid size={6}>
                    <Grid textAlign="left" sx={{ fontSize: '1.5rem'}}><b>{collection?.symbol}#{token.id}</b>
                     {/* • {collection?.name}  */}
                    </Grid>
                    <Grid textAlign="left">{collection?.name}</Grid>
                    <Grid textAlign="left">Owner: {formatAddress(token.owner, signer)}</Grid>
                    <Grid textAlign="left" sx={{ mb: .5}}>Current price: {formatPrice(token.price)} wei</Grid>
                    {/* <Grid textAlign="left">URI: {token.URI}</Grid> */}

                    {!signer && 
                        <Button 
                            variant="contained" 
                            onClick={connectWallet}
                            sx={{ mt: 1.5, width:"100%", backgroundColor:'#f7a642ff'}}>
                            Connect Wallet
                        </Button>
                    }
                    {signer && token.owner !== signer &&
                        <Button 
                            variant="contained" 
                            onClick={() => handleBuy(token.id, token.price)}
                            sx={{ mt: 1, width:"100%", backgroundColor:'#f7a642ff'}}>
                            Buy NFT
                        </Button>
                    }
                    
                    {signer && token.owner === signer &&
                    <>
                    <Box display="flex" justifyContent="center" mt={2}>
                        <TokenActionsButton 
                            token={token}
                            handleCreateAuction={handleCreateAuction}
                            handleUpdatePrice={handleTokenPrice}
                            handleTransfer={handleTransfer}/>
                    </Box>
                        {/* <Button 
                            size="small"
                            variant="contained" 
                            onClick={() => handleCreateAuction(token.id)}
                            sx={{ mt: 1, width:"100%"}}>
                            Make an auction
                        </Button>
                        <Button 
                            size="small"
                            variant="contained" 
                            onClick={() => handleTokenPrice(token.id, token.price)}
                            sx={{ mt: 1, width:"100%", backgroundColor:'#f7a642ff'}}>
                            Update Price
                        </Button>
                        <Button
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleTransfer(token.id)}
                            sx={{ mt: 1, width:"100%", color: '#f7a642ff', borderColor:'#f7a642ff'}}>
                            Transfer
                        </Button> */}
                    </>
                    }
                </Grid>
            </Grid>
            
            <hr/>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Button size="small" variant="text" sx={{ backgroundColor: section === 0  ? '#303b5d1e' : '', borderRadius: 10}} onClick={() => setSection(0)}>Metadata</Button>
                {!isPhone && <Box ml={2} mr={2}>•</Box>}
                <Button size="small" variant="text" sx={{ backgroundColor: section === 1  ? '#303b5d1e' : '', borderRadius: 10}} onClick={() => setSection(1)}>Auctions</Button>
                {!isPhone && <Box ml={2} mr={2}>•</Box>}
                <Button size="small" variant="text" disabled>Activity (Coming next..)</Button>
            </Box>
            <hr/>
            
            {section === 0 && token.metadata && 
            <Box>
                {/* <Typography variant="h6">Name: {token.metadata.name}</Typography>
                <Typography variant="body1">Image CID: {token.metadata.cid}</Typography> */}

                {token.metadata.attributes && token.metadata.attributes.length > 0 &&
                    <Box mt={1} textAlign={"left"}>
                        <Typography><b>Type</b>: {token.metadata.attributes[0].type}</Typography>
                        <Typography><b>Color</b>: {token.metadata.attributes[0].color}</Typography>
                        <Typography><b>Background Color</b>: {token.metadata.attributes[0].backgroundColor}</Typography>
                    </Box>
                }
            </Box>
        }

            {section === 1 && token.auction.tokenId > 0 && 
                <Auction auction={token.auction} signer={signer} section={section} connectWallet={connectWallet}/>
            }

            {section === 1 && token.auction.tokenId === 0 && 
                <Typography>No auction found for this token</Typography>
            }
            
        </Box>
    );
}