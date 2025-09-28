import { Box, Button, FormControl, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { TrasferFormProps } from "../../utils/Interfaces";

export default function TransferToForm({tokenId, handleSubmit}: TrasferFormProps) {
    const [formData, setFormData] = useState({
        address: ''
    });

    const handleChange = (event: any) => {
        console.log("Change setPrice form")
        const { name, value } = event.target;
        setFormData({...formData, [name]: value });
    };

    function submit() {
        console.log("Submit setPrice form")
        handleSubmit(tokenId, formData.address);
    };
    

    return (
        <>
        <Box component="form">
            <Typography variant="body2" sx={{ mb: 2 }}>
                Enter the recipient's Ethereum address to transfer the token. <br/>Make sure the address is correct and belongs to a valid wallet.
            </Typography>
            <FormControl fullWidth>
                <TextField
                fullWidth
                id="address"
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                />
            </FormControl>
            <Button onClick={submit} variant="contained" fullWidth sx={{mt: 2 , backgroundColor:'#f7a642ff'}}>
                CONFIRM
            </Button>
        </Box>    
            
        </>
    );
}