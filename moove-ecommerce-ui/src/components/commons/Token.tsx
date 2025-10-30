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

export default function Token({ collection, token, tokenId, auction, metadata, signerAddress, connectWC, connectMetamask, handleBuy, handleCreateAuction, handleTransfer, handleUpdatePrice}: TokenProps) {
    const [section, setSection] = useState<number>(auction.tokenId > 0 ? 1 : 0);
    const [tokenData, setTokenData] = useState<TokenDTO>(token);
    const [tokenMetadata, setTokenMetadata] = useState<Metadata>();
    const [tokenAuction, setTokenAuction] = useState<AuctionDTO>();
    const [imageUrl, setImageUrl] = useState(moove_logo);
    const isPhone = useMediaQuery('(max-width: 650px)');
    
    useEffect(() => {
        if(token.id === 0 && tokenId !== 0){
            getTokenData();
        } else {
            setTokenData(token);
            setTokenMetadata(token.metadata);
        }

        setTokenAuction(auction);
        getTokenImage();
    }, [])

    async function getTokenData() {
        const responseTokenData = await readTokenData(collection.address, tokenId);
        setTokenData(responseTokenData!);
        setTokenMetadata(metadata);
    }

    async function getTokenImage(){
        try {
            // se token.imageCID è già disponibile, salta la lettura del tokenURI (da TokenPreview)
            if (metadata.cid) {
                const imageUrl = `${IPFS_gateway}${metadata.cid}`;
                const success = await loadImageWithTimeout(imageUrl, 8000);
                if (!success) {
                    console.warn('⚠️ Using fallback logo (cid preload failed)');
                    setImageUrl(moove_logo);
                }
                return;
            } else {
                // fallback: leggi il tokenURI dal contratto e ricava il CID dai metadata (da AuctionPreview)
                const tokenURI = await readTokenURI(collection.address, tokenId);
                if (!tokenURI) {
                    console.log("Token URI is undefined");
                    setImageUrl(moove_logo);
                    return;
                }
                await fetchMetadata(tokenURI);
            }
        } catch (error) {
            console.error("Error getting token image:", error);
            setImageUrl(moove_logo);
        }
    }

    async function fetchMetadata(tokenURI: string){
        try {
            const metadataUrl = `${IPFS_gateway}${tokenURI}`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(metadataUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const metadata = await response.json();
            const imageCID = metadata.cid;
            setTokenMetadata(metadata);

            const imageUrl = `${IPFS_gateway}${imageCID}`;
            const success = await loadImageWithTimeout(imageUrl, 8000);
            if (!success) {
                console.warn('⚠️ Using fallback logo');
                setImageUrl(moove_logo);
            }
            
        } catch (error) {
            console.error("Error fetching metadata:", error);
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
                    sx={{ width: '100%', height: 'auto', objectFit: 'contain', mt:1.5}}
                    src={imageUrl}
                    alt={"NFT Preview not available..."}
                    />
                </Grid>
                <Grid size={6}>
                    <Grid textAlign="left" sx={{ fontSize: '1.5rem'}}><b>{collection?.symbol}#{tokenId}</b>
                     {/* • {collection?.name}  */}
                    </Grid>
                    <Grid textAlign="left">{collection?.name}</Grid>
                    <Grid textAlign="left">Owner: {formatAddress(tokenData.owner, signerAddress)}</Grid>
                    <Grid textAlign="left" sx={{ mb: .5}}>Current price: {formatPrice(tokenData.price)} wei</Grid>
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

                    {signerAddress !== "" && signerAddress !== tokenData.owner &&
                        <Button 
                            variant="contained" 
                            onClick={() => handleBuy(tokenData.id, tokenData.price)}
                            sx={{ mt: 1, width:"100%", backgroundColor:'#f7a642ff'}}>
                            Buy NFT
                        </Button>
                    }
                    
                    {signerAddress  !== "" && signerAddress === tokenData.owner &&
                    <Box display="flex" justifyContent="center" mt={2}>
                        <TokenActionsButton 
                            token={tokenData}
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
            
            {section === 0 && tokenMetadata && 
            <Box>
                {/* <Typography variant="h6">Name: {token.metadata.name}</Typography>
                <Typography variant="body1">Image CID: {token.metadata.cid}</Typography> */}

                {tokenMetadata.attributes && tokenMetadata.attributes.length > 0 &&
                    <Box mt={1} textAlign={"left"}>
                        <Typography><b>Type</b>: {tokenMetadata?.attributes[0].type}</Typography>
                        <Typography><b>Color</b>: {tokenMetadata?.attributes[0].color}</Typography>
                        <Typography><b>Background Color</b>: {tokenMetadata?.attributes[0].backgroundColor}</Typography>
                    </Box>
                }
            </Box>
        }

            {section === 1 && tokenAuction && tokenAuction.tokenId > 0 && 
                <Auction auction={tokenAuction} signer={signerAddress} />
            }

            {section === 1 && tokenAuction && tokenAuction.tokenId === 0 && 
                <Typography>No auction found for this token</Typography>
            }
            
        </Box>
    );
}