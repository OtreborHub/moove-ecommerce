import { useState } from "react";
import { MintTokenFormProps } from "../../utils/Interfaces";
import { Box, Button, TextField } from "@mui/material";

export default function MintTokenForm({handleSubmit: handleMint, signer} : MintTokenFormProps) {
    const [formData, setFormData] = useState({
        to: signer,
        tokenURI: '',
        price: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const submit = (event: any) => {
        event.preventDefault();
        handleMint(formData.tokenURI, Number(formData.price));
    };


    return (
        <Box component="form"  onSubmit={submit} sx={{ mt: 2 }} >
            <TextField
                fullWidth
                margin="normal"
                id="to"
                name="to"
                label="To address"
                disabled
                value={formData.to}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                id="tokenURI"
                name="tokenURI"
                label="Token URI"
                value={formData.tokenURI}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                id="price"
                name="price"
                label="Token Price (wei)"
                value={formData.price}
                onChange={handleChange}
            />
            
            <Button type="submit" variant="contained" fullWidth sx={{mt: 2}}>
                CONFIRM
            </Button>
        </Box>
    );
}