import { Button, TextField, Typography, Box } from "@mui/material";
import { AddRemoveAdminFormProps } from "../../utils/Interfaces";

export default function AddRemoveAdminForm({addressToRemove, handleSubmit} : AddRemoveAdminFormProps) {
    
    function addRemoveAdmin(){
        const input = document.getElementById('swal-admin-address') as HTMLInputElement | null;
        const errEl = document.getElementById('swal-admin-error') as HTMLElement | null;
        const address = input?.value.trim() ?? '';
        const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
        if (!isValid) {
            if (errEl) errEl.textContent = 'Please enter a valid Ethereum address (0x... ).';
            return;
        }

        if(addressToRemove && address === addressToRemove){
            handleSubmit(false, address);
        } else {
            handleSubmit(true, address);
        }
    }
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <Typography variant="body2">Enter the Ethereum address of the new admin:</Typography>
            <TextField
              id="swal-admin-address"
              label="Admin address"
              placeholder="0x..."
              variant="outlined"
              fullWidth
              defaultValue={addressToRemove}
              disabled={addressToRemove !== ""}
              autoFocus
            />
            <Typography id="swal-admin-error" variant="caption" color="error" sx={{ minHeight: 18 }} />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
              
              {!addressToRemove && 
              <Button onClick={addRemoveAdmin} variant="contained" fullWidth>Add</Button>
              }
              {addressToRemove && 
              <Button onClick={addRemoveAdmin} variant="contained" color="error" fullWidth>Remove</Button>
              }
            </Box>
        </Box>
    );
}