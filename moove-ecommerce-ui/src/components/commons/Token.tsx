import { Box, Button, CardMedia, Grid, Typography } from "@mui/material";
import moove_logo from "../../assets/moove.png";
import { TokenProps } from "../../utils/Interfaces";
import { formatAddress, formatPrice } from "../../utils/formatValue";

export default function Token({ signer, collection, token, connectWallet, handleBuy, handleCreateAuction, handleTransfer, handleTokenPrice}: TokenProps) {
    return (
        <Box width={"100%"} >
            <Grid container spacing={8}>
                <Grid size={6}>
                    <CardMedia
                    component="img"
                    height="140"
                    src={moove_logo}
                    alt={"NFT Image not available..."}
                    />
                </Grid>
                <Grid size={6}>
                    <Grid textAlign={"left"}><b>{collection?.symbol}#{token.id}</b></Grid>
                    <Grid textAlign={"left"}>{collection?.name} </Grid> {/*| Owner: {formatAddress(token.owner)}*/}
                    <Grid textAlign={"left"}>Owner: {formatAddress(token.owner)}</Grid>
                    <Grid textAlign={"left"}>Price: {formatPrice(token.price)} wei</Grid>
                    <Grid textAlign={"left"}>URI: {token.URI}</Grid>
                </Grid>
            </Grid>
            <Grid container columns={12} spacing={8}>
                <Grid size={6}>
                    {!signer && 
                        <Button 
                            variant="contained" 
                            onClick={connectWallet}
                            sx={{ mt: 1, width:"100%", backgroundColor:'#f7a642ff'}}>
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
                        <Button 
                            variant="contained" 
                            onClick={(handleCreateAuction)}
                            sx={{ mt: 1, width:"100%", backgroundColor: "#f7a642ff"}}>
                            Make an auction
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={() => handleTokenPrice(token.id, token.price)}
                            sx={{ mt: 1, width:"100%", color: '#f7a642ff', borderColor:'#f7a642ff'}}>
                            Update Token Price
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={() => handleTransfer(token.id)}
                            sx={{ mt: 1, width:"100%", color: '#f7a642ff', borderColor:'#f7a642ff'}}>
                            Transfer
                        </Button>
                    </>
                    }

                </Grid>

                {!signer && 
                <Grid size={6}>
                    <Box textAlign={"center"} border={"1px solid #3f3e3eff"} mt={1}>
                    <Typography variant="body1"> Connect your wallet to buy an asset</Typography>
                    </Box>
                </Grid>
                }
                {/* COMPLETARE */}
                {signer && 
                <Grid size={6} border={"1px solid #3f3e3eff"} mt={1}>
                    <Typography variant="body1"> Metadata here </Typography>
                </Grid>
                }

            </Grid>
        </Box>
    );
}