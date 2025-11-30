import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { PlaceBidFormProps } from "../../utils/Interfaces";
import { useState } from "react";
import Swal from "sweetalert2";
import { AuctionType } from "../../utils/enums/Auction";
import { convertUnit, Unit } from "../../utils/unitManager";

export default function PlaceBidForm({auction, handleSubmit}: PlaceBidFormProps) {
const [formData, setFormData] = useState({
        bid: auction.currentPrice + auction.minIncrement,
        unit: Unit.DEFAULT
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
                canSubmit = formData.bid >= auction.currentPrice + auction.minIncrement;
                text = canSubmit ? "" : "It should be at least the current price added to minimum increment.";
                break;
        }

        if(canSubmit){
            let bidInWei = convertUnit(formData.bid, formData.unit);
            handleSubmit(auction.tokenId, bidInWei);
        } else {
            Swal.fire({
                title: "Check your bid",
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
                        <MenuItem value={Unit.ETH}>ETH</MenuItem>
                        <MenuItem value={Unit.WEI}>Wei</MenuItem>
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