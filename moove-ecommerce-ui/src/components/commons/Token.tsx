import { Box, Button, ButtonGroup, CardMedia, Grid, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import moove_logo from "../../assets/moove.png";
import { TokenProps } from "../../utils/Interfaces";
import { formatAddress, formatPrice } from "../../utils/formatValue";
import Auction from "./Auction";
import TokenActionsButton from "../actionsButton/TokenActionsButton";
import { readTokenData, readTokenURI } from "../../utils/bridges/MooveCollectionsBridge";
import TokenDTO, { Metadata } from "../../utils/DTO/TokenDTO";
import AuctionDTO from "../../utils/DTO/AuctionDTO";
import metamask_logo from '../../assets/metamask.svg';
import walletconnect_logo from '../../assets/wallet-connect.svg';

const IPFS_gateway = 'https://amber-adverse-llama-592.mypinata.cloud/ipfs/';

export default function Token({ collection, token, auction, metadata, signerAddress, signer, connectWC, connectMetamask, handleBuy, handleCreateAuction, handleTransfer, handleUpdatePrice}: TokenProps) {
    const [section, setSection] = useState<number>(auction.tokenId > 0 ? 1 : 0);
    const [imageUrl, setImageUrl] = useState(moove_logo);
    const isPhone = useMediaQuery('(max-width: 650px)');
    
    useEffect(() => {
        getTokenImage();
    }, []);

    async function getTokenImage(){
        try {
            if (metadata.cid) {
                const imageUrl = `${IPFS_gateway}${metadata.cid}`;
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
                    <Grid textAlign="left" sx={{ fontSize: '1.5rem'}}><b>{collection?.symbol}#{token.id}</b>
                     {/* • {collection?.name}  */}
                    </Grid>
                    <Grid textAlign="left">{collection?.name}</Grid>
                    <Grid textAlign="left">Owner: {formatAddress(token.owner, signerAddress)}</Grid>
                    <Grid textAlign="left" sx={{ mb: .5}}>Current price: {formatPrice(token.price)} wei</Grid>
                    {/* <Grid textAlign="left">URI: {token.URI}</Grid> */}

                    {signerAddress === "" && 
                     <ButtonGroup
                        orientation="vertical"
                        fullWidth
                        variant="outlined"
                        sx={{
                            mt: 1,
                            ml: .5,
                            overflow: "hidden",
                        }}
                        >
                        {/* PULSANTE PRINCIPALE */}
                        <Button
                            sx={{
                            flexDirection: "column",
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                            color: "white",
                            backgroundColor: "#f7a642ff",
                            py: 1,
                            borderRadius: 2,
                            lineHeight: 1.2,
                            textTransform: "uppercase",
                            marginBottom: ".2rem"
                            // "&:not(:last-child)": { borderBottom: "1px solid rgba(255,255,255,0.3)" },
                            }}
                            variant="text"
                        >
                            CONNECT
                            <br />
                            WALLET
                        </Button>

                        {/* GRUPPO ORIZZONTALE PER LE ICONE */}
                        <ButtonGroup
                            orientation="horizontal"
                            fullWidth
                            variant="outlined"
                            sx={{
                            "& .MuiButton-root": {
                                backgroundColor: "#fff",
                            },
                            }}
                        >
                            <Button onClick={connectWC} sx={{ 
                                border: 0,
                                "& img": {
                                    width: "36px",
                                    height: "36px",
                                    objectFit: "contain",
                                    border: 0,
                                    transition: "transform 0.2s ease-in-out",
                                    },
                                "&:hover img": {
                                    transform: "scale(1.3)",
                                    },
                            }}>
                            <img
                                src={walletconnect_logo}
                                alt="WalletConnect"
                            />
                            </Button>

                            <Button onClick={connectMetamask} sx={{ 
                                border: 0,
                                "& img": {
                                    width: "30px",
                                    height: "30px",
                                    objectFit: "contain",
                                    border: 0,
                                    transition: "transform 0.2s ease-in-out",
                                },
                                "&:hover img": {
                                transform: "scale(1.3)",
                                },
                            }}>
                            <img
                                src={metamask_logo}
                                alt="MetaMask"
                            />
                            </Button>
                        </ButtonGroup>
                        </ButtonGroup>
                    }

                    {signerAddress && signerAddress !== token.owner &&
                        <Button 
                            variant="contained" 
                            onClick={() => handleBuy(token.id, token.price)}
                            sx={{ mt: 1, width:"100%", backgroundColor:'#f7a642ff'}}>
                            Buy NFT
                        </Button>
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
                        <Typography><b>Type</b>: {metadata?.attributes[0].type}</Typography>
                        <Typography><b>Color</b>: {metadata?.attributes[0].color}</Typography>
                        <Typography><b>Background Color</b>: {metadata?.attributes[0].backgroundColor}</Typography>
                    </Box>
                }
            </Box>
        }

            {section === 1 && auction && auction.tokenId > 0 && 
                <Auction auction={auction} signer={signer} signerAddress={signerAddress}/>
            }

            {section === 1 && auction && auction.tokenId === 0 && 
                <Typography>No auction found for this token</Typography>
            }
            
        </Box>
    );
}