import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { SetTokenPriceFormProps } from "../../utils/Interfaces";
import { ethers } from "ethers";
import { toWei } from "../../utils/formatValue";
import { ErrorMessage, swalError } from "../../utils/enums/Errors";

export default function UpdateTokenPriceForm({tokenId, tokenPrice, handleSubmit}: SetTokenPriceFormProps) {
    const [formData, setFormData] = useState({
        price: tokenPrice,
        unit: "Wei"
    });
    
    //Passare unit - per ora fixed con wei
    const weiTokenPrice = toWei(tokenPrice, 'wei');

    const [error, setError]=useState<string>("");

    const handleChange = (event: any) => {
        const { name, value } = event.target;
        setFormData({...formData, [name]: value < 0 ? 0 : value });

        try {
            var newWeiValue: string = "";    
            if (name === "price") {
                newWeiValue = toWei(value, formData.unit.toLowerCase());
            } else if (name === "unit"){
                newWeiValue = toWei(formData.price, value.toLowerCase());
            }

            if (BigInt(newWeiValue) <= BigInt(weiTokenPrice)) {
                setError("The new price must be higher than the current one.");
            } else {
                setError("");
            }
        } catch (err){
            swalError(ErrorMessage.IO);
        }
        

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
        if(formData.price < tokenPrice) { setError("New price has to be greater then the current price")}
        else { handleSubmit(tokenId, priceInWei) }
        
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
                        error={toWei(formData.price, formData.unit.toLowerCase()) <= weiTokenPrice}
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
                            <MenuItem value="Wei">Wei</MenuItem>
                        </Select>
                </FormControl>

                </Grid>
            </Grid>
        </Box>
            <Typography align="left" variant="subtitle2" color="error"> {error} </Typography>    
            <Button onClick={submit} variant="contained" fullWidth sx={{mt: 2, backgroundColor:'#f7a642ff'}}>
                CONFIRM
            </Button>
        </>
    );
}