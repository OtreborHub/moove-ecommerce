import { Button, TextField, Typography, Box } from "@mui/material";
import { AddRemoveAdminFormProps } from "../../utils/Interfaces";
import { useState } from "react";

export default function AddRemoveAdminForm({handleSubmit} : AddRemoveAdminFormProps) {
    const [showDeleteVerification, setShowDeleteVerification] =  useState<boolean>(false);

    function addRemoveAdmin(addAdmin: boolean) {
        const input = document.getElementById('swal-admin-address') as HTMLInputElement | null;
        const deleteVerificationInput = document.getElementById('swal-admin-delete-verification') as HTMLInputElement | null;
        const errEl = document.getElementById('swal-admin-error') as HTMLElement | null;
        const address = input?.value.trim() ?? '';
        const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
        if (!isValid) {
            if (errEl) errEl.textContent = 'Please enter a valid Ethereum address (0x... ).';
            return;
        } else {
            if (errEl) errEl.textContent = '';
        }

        if(addAdmin){
            handleSubmit(true, address);
        } else if (!showDeleteVerification){
            setShowDeleteVerification(true);
        } else if (deleteVerificationInput?.value === "Delete"){
            handleSubmit(false, address);
        }
    }
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <Typography variant="body2">Enter the Ethereum address to manage</Typography>
            <TextField
              id="swal-admin-address"
              label="Admin address"
              placeholder="0x..."
              variant="outlined"
              fullWidth
              disabled={showDeleteVerification}
              autoFocus
            />
            {showDeleteVerification &&
            <TextField
              id="swal-admin-delete-verification"
              label="Type 'Delete' to confirm"
              error
              variant="outlined"
              fullWidth
              autoFocus
            />
        }
            <Typography id="swal-admin-error" variant="caption" color="error" sx={{ minHeight: 18 }} />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
              
              {!showDeleteVerification && <Button onClick={() => addRemoveAdmin(true)} variant="contained" fullWidth>Add</Button>}
              {showDeleteVerification && <Button onClick={() => setShowDeleteVerification(false)} variant="contained" fullWidth>Back</Button>}
              <Button onClick={() => addRemoveAdmin(false)} variant="contained" color="error" fullWidth>Remove</Button>
            </Box>
        </Box>
    );
}