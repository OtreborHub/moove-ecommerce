import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { SetTokenPriceFormProps } from "../../utils/Interfaces";
import { ethers } from "ethers";

export default function UpdateTokenPriceForm({tokenId, tokenPrice, handleSubmit}: SetTokenPriceFormProps) {
    const [formData, setFormData] = useState({
        price: tokenPrice,
        unit: "Wei"
    });

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        setFormData({...formData, [name]: value });
    };

    function submit() {
        let priceInWei = formData.price;
        if (formData.unit === "ETH") {
            priceInWei = Number(ethers.parseEther(formData.price.toString()));
        } else if (formData.unit === "Gwei") {
            priceInWei = Number(ethers.parseUnits(formData.price.toString(), "gwei"));
        }  else if (formData.unit === "Finney") {
            priceInWei = Number(ethers.parseUnits(formData.price.toString(), "finney"));
        }
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
                            <MenuItem value="ETH">ETH</MenuItem>
                            <MenuItem value="Finney">Finney</MenuItem>
                            <MenuItem value="Gwei">Gwei</MenuItem>
                            <MenuItem value="Wei">Wei</MenuItem>
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