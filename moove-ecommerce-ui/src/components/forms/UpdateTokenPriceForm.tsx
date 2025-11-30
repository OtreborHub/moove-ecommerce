import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { UpdateTokenPriceFormProps } from "../../utils/Interfaces";
import { convertUnit, Unit } from "../../utils/unitManager";

export default function UpdateTokenPriceForm({tokenId, tokenPrice, handleSubmit}: UpdateTokenPriceFormProps) {
    const [formData, setFormData] = useState({
        price: tokenPrice,
        unit: Unit.DEFAULT
    });
    

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        setFormData({...formData, [name]: value < 0 ? 0 : value });
    };

    function submit() {
        let priceInWei = convertUnit(formData.price, formData.unit);
        handleSubmit(tokenId, priceInWei);
    };


    return (
        <>
        <Box component="form">
            <Typography variant="body2" sx={{ mb: 2 }}>
                Set the new price for the token and choose the desired unit. <br/>The value will be automatically converted to <b>wei</b> before being sent to the smart contract.
            </Typography>
            <Grid container spacing={2}>
                <Grid size={9}>
                    <FormControl fullWidth>
                        <TextField
                        fullWidth
                        type="number"
                        id="price"
                        name="price"
                        label="New Price"
                        value={formData.price}
                        onChange={handleChange}
                        />
                    </FormControl>
                </Grid>
                <Grid size={3}>
                    <FormControl fullWidth >
                        <InputLabel id="unit-label">Unit</InputLabel>
                        <Select
                            labelId="unit-label"
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            label="Unit"
                            onChange={handleChange}
                        >
                            <MenuItem value={Unit.ETH}>ETH</MenuItem>
                            <MenuItem value={Unit.WEI}>Wei</MenuItem>
                        </Select>
                </FormControl>

                </Grid>
            </Grid>
        </Box>
            <Button onClick={submit} variant="contained" fullWidth sx={{mt: 2, backgroundColor:'#f7a642ff'}}>
                CONFIRM
            </Button>
        </>
    );
}