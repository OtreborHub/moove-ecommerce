import { Box, Button, ButtonGroup, CardMedia, Grid, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import moove_logo from "../../assets/moove_logo.svg";
import { TokenProps } from "../../utils/Interfaces";
import { formatAddress, formatPrice } from "../../utils/formatValue";
import TokenAuction from "./TokenAuction";
import TokenActionsButton from "../actionsButton/TokenActionsButton";

export const IPFS_GATEWAY: string = import.meta.env.VITE_IPFS_GATEWAY as string;
export default function Token({ collection, token, auction, metadata, signerAddress, signer, handleConnect, handleBuy, handleCreateAuction, handleTransfer, handleUpdatePrice}: TokenProps) {
    const [section, setSection] = useState<number>(auction.tokenId > 0 ? 1 : 0);
    const [imageUrl, setImageUrl] = useState(moove_logo);
    const isPhone = useMediaQuery('(max-width: 650px)');
    
    useEffect(() => {
        getTokenImage();
    }, []);

    async function getTokenImage(){
        try {
            if (metadata.cid) {
                const imageUrl = `${IPFS_GATEWAY}${metadata.cid}`;
                const success = await loadImageWithTimeout(imageUrl, 8000);
                if (!success) {
                    console.warn('⚠️ Using fallback logo (cid preload failed)');
                    setImageUrl(moove_logo);
                }
                return;
            }
        } catch (error) {
            console.error("Error getting token image:", error);
            setImageUrl(moove_logo);
        }
    }

    // Helper per timeout
    async function loadImageWithTimeout(url: string, timeout: number): Promise<boolean> {
        return new Promise((resolve) => {
            const img = new window.Image();
            const timer = setTimeout(() => resolve(false), timeout);

            img.onload = () => {
                clearTimeout(timer);
                setImageUrl(url);
                resolve(true);
            };

            img.onerror = () => {
                clearTimeout(timer);
                resolve(false);
            };

            img.src = url;
        });
    }

    return (
        <Box padding={1}>
            <Grid container spacing={4} mb={4}>
                <Grid size={6}>
                    <CardMedia
                    component="img"
                    sx={{ width: '100%', height: 'auto', objectFit: 'contain', mt:1.5,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                        transform: "scale(1.25)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                        }
                    }}
                    src={imageUrl}
                    alt={"NFT Preview not available..."}
                    />
                </Grid>
                <Grid size={6}>
                    <Typography textAlign="left" sx={{ fontSize: '1.5rem'}}><b>{collection.symbol}#{token.id}</b>
                     {/* • {collection?.name}  */}
                    </Typography>
                    <Typography textAlign="left">{collection.name}</Typography>
                    <Typography textAlign="left">Owner: {formatAddress(token.owner, signerAddress)}</Typography>
                    <Typography textAlign="left">Current Price: {formatPrice(token.price, 'wei')} wei</Typography>
                    
                    {/* <Grid textAlign="left">URI: {token.URI}</Grid> */}

                    {signerAddress === "" && 
                        <Box sx={{ mt: 1, ml: 0.5 }}>
                            <Button
                                fullWidth
                                onClick={handleConnect}
                                variant="contained"
                                sx={{
                                    py: 1.25,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    fontSize: 16,
                                    textTransform: 'uppercase',
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none', filter: 'brightness(0.95)' }
                                }}
                            >
                                Connect Wallet
                            </Button>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                                Click to open the wallet chooser (MetaMask or WalletConnect)
                            </Typography>
                        </Box>
                    }
                    {signerAddress && signerAddress !== token.owner &&
                        <>
                        <Button 
                            variant="contained" 
                            onClick={() => handleBuy(token.id, token.price)}
                            disabled={auction.tokenId > 0}
                            sx={{ mt: 1, width:"100%", backgroundColor:'#f7a642ff', textTransform: 'none', fontSize: 16}}>
                            {/* Buy now for {formatPrice(token.price)} wei */}
                            BUY NOW
                        </Button>
                        {auction.tokenId > 0 && 
                        <Typography color="grey" variant="subtitle2" align="left">Buy disabled with active auction</Typography>
                        }  
                        </>
                    }
                    
                    {signerAddress && signerAddress === token.owner &&
                    <Box display="flex" justifyContent="center" mt={2}>
                        <TokenActionsButton 
                            token={token}
                            auctionTokenId={auction.tokenId}
                            handleCreateAuction={handleCreateAuction}
                            handleUpdatePrice={handleUpdatePrice}
                            handleTransfer={handleTransfer}/>
                    </Box>
                    }
                </Grid>
            </Grid>
            
            <hr/>
            <Box display="flex" flexDirection="row" justifyContent="space-around">
                <Button size="small" variant="text" sx={{ backgroundColor: section === 0  ? '#303b5d1e' : '', borderRadius: 10}} onClick={() => setSection(0)}>Metadata</Button>
                {!isPhone && <Box ml={2} mr={2}>•</Box>}
                <Button size="small" variant="text" sx={{ backgroundColor: section === 1  ? '#303b5d1e' : '', borderRadius: 10}} onClick={() => setSection(1)}>Auctions</Button>
                {!isPhone && <Box ml={2} mr={2}>•</Box>}
                {!isPhone && <Button size="small" variant="text" disabled>Activity (Coming..)</Button>}
            </Box>
            <hr/>
            
            {section === 0 && metadata && 
            <Box>
                {/* <Typography variant="h6">Name: {token.metadata.name}</Typography>
                <Typography variant="body1">Image CID: {token.metadata.cid}</Typography> */}

                {metadata.attributes && metadata.attributes.length > 0 &&
                    <Box mt={1} textAlign={"left"}>
                        <Typography><b>Type:</b> {metadata?.attributes[0].type}</Typography>
                        <Typography><b>Color:</b> {metadata?.attributes[0].color}</Typography>
                        <Typography><b>Background Color:</b> {metadata?.attributes[0].backgroundColor}</Typography>
                    </Box>
                }
            </Box>
        }

            {section === 1 && auction && auction.tokenId > 0 && 
                <TokenAuction auction={auction} signer={signer} signerAddress={signerAddress}/>
            }

            {section === 1 && auction && auction.tokenId === 0 && 
                <Typography variant="body2">No auction found for this token</Typography>
            }
            
        </Box>
    );
}