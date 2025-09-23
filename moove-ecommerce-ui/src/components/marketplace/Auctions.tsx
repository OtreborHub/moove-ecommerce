import React from 'react';
import auction_logo from "../../assets/auctions.png";
import { Box } from '@mui/material';

export default function Auctions() {
    return (
        <>
        <Box display="flex" justifyContent="center" alignItems="center" marginTop="5rem">
            <img src={auction_logo} alt="Collections" style={{ maxHeight: '110px', marginLeft: '0px' }} />
        </Box>
        </>
    );
}