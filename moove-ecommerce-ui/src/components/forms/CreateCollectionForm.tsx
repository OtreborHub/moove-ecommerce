import { useState } from "react";
import { CreateCollectionFormProps } from "../../utils/Interfaces";
import { Box, Button, TextField, Typography } from "@mui/material";
import { ErrorMessage, swalError } from "../../utils/enums/Errors";
import { Action } from "../../utils/enums/Actions";

export default function CreateCollectionForm({handleSubmit} : CreateCollectionFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        // maxSupply: 0,   
    });
    
const handleChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({...formData, [name]: value });
  };

  const submit = (event : any) => {
    event.preventDefault();
    if(formData.name === '' || formData.symbol === ''){
      swalError(ErrorMessage.CREATE_COLL_CONFIRM_ERROR, Action.ADD_COLL);
    }else{
      handleSubmit(formData.name, formData.symbol);
    }
  };


    return (
      <Box component="form"  >
        <Typography variant="subtitle1" gutterBottom>
            Fill with the name and the symbol of the new collection.
        </Typography>
        <TextField
            fullWidth
            margin="normal"
            id="name"
            name="name"
            label="Collection Name"
            value={formData.name}
            onChange={handleChange}
        />
        <TextField
            fullWidth
            margin="normal"
            id="symbol"
            name="symbol"
            label="Collection Symbol"
            value={formData.symbol}
            onChange={handleChange}
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" sx={{ backgroundColor:'#f7a642ff'}} fullWidth onClick={submit}>
            Create collection
          </Button>
        </Box>
      </Box>
    );
}