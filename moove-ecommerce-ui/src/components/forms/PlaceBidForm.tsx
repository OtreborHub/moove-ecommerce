import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { PlaceBidFormProps } from "../../utils/Interfaces";
import { useState } from "react";
import Swal from "sweetalert2";
import { AuctionType } from "../../utils/enums/Auction";

export default function PlaceBidForm({auction, handleSubmit}: PlaceBidFormProps) {
const [formData, setFormData] = useState({
        bid: auction.currentPrice + auction.minIncrement,
        unit: 'Wei'
    });

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        setFormData({...formData, [name]: value < 0 ? 0 : value });
    };

    function submit() {
        let canSubmit = false;
        let text = "";
        switch(auction.auctionType){
            case AuctionType.CLASSIC:
                canSubmit = formData.bid > auction.currentPrice && formData.bid > auction.highestBid;
                text = canSubmit ? "" : "It should be at more than the current price or highest bid.";
                break;
            case AuctionType.ENGLISH:
                canSubmit = formData.bid > auction.currentPrice + auction.minIncrement;
                text = canSubmit ? "" : "It should be at least the current price added to minimun increment.";
                break;
        }

        if(canSubmit){
            handleSubmit(auction.tokenId, formData.bid);
        } else {
            Swal.fire({
                title: "Check you bid",
                text: text,
                icon: "warning",
                confirmButtonColor: "#3085d6",
            });
        }
    };
    

    return (
        <>
        <Box component="form">
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
                        <MenuItem value="Wei">Wei</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Button onClick={submit} variant="contained" fullWidth sx={{mt: 2}}>
                CONFIRM
            </Button>
        </Box>    
        </>
    );
}