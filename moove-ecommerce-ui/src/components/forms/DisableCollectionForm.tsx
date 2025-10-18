import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { DeleteCollectionFormProps } from "../../utils/Interfaces";
import { ErrorMessage, swalError } from "../../utils/enums/Errors";
import { Action } from "../../utils/enums/Actions";

export default function DeleteCollectionForm({ collectionAddress, collectionName, handleSubmit }: DeleteCollectionFormProps) {
    const [formData, setFormData] = useState("");

    const handleChange = (event: any) => {
    const { value } = event.target;
    setFormData(value);
  };

  const submit = (event : any) => {
    event.preventDefault();
    if(formData === collectionName){
        handleSubmit(collectionAddress);
    } else {
        swalError(ErrorMessage.DELETE_CONFIRM_ERROR, Action.DELETE_COLL);
    }
  };

    return (
        <Box component="form" sx={{ mt: 2 }} >
            <Typography variant="body1" gutterBottom>
                Do you really want to disable this collection? <br />
                Type <strong>{collectionName}</strong> to confirm. This action is irreversible.
            </Typography>
            <TextField
                fullWidth
                margin="normal"
                id="name"
                name="name"
                label="Collection Name"
                value={formData}
                onChange={handleChange}
            />
            
            <Box mt={2}>
            <Button type="submit" variant="contained" color="error" fullWidth onClick={submit}>
                Disable
            </Button>
            </Box>
      </Box>
    );
}