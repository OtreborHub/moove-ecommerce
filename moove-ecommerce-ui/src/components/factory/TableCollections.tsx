import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableCollectionProps } from '../../utils/Interfaces';
import { Box, Button } from '@mui/material';
import DisableCollectionForm from '../forms/DisableCollectionForm';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAppContext } from '../../Context';
import CollectionDTO from '../../utils/DTO/CollectionDTO';
import MintTokenForm from '../forms/MintTokenForm';

export default function TableCollection({ collectionsInfo, handleMint, handleDisable }: TableCollectionProps) {

  const MySwal = withReactContent(Swal);
  const appContext = useAppContext();
  
  function showMintTokenForm(){
    MySwal.fire({
        title: "Mint token",
        html: <MintTokenForm handleSubmit={handleMint} signer={appContext.signer}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });
  }

  //VIEW COLLECTION ------------------------------------------
  function viewCollection(collection: CollectionDTO) {
      appContext.updateShownCollection(collection);
  }

  //DISABLE COLLECTION ------------------------------------------
  const disableCollection = (collectionName: string) => {
    MySwal.fire({
        title: "Disable collection",
        html: <DisableCollectionForm collectionName={collectionName} handleSubmit={handleDisable}/>,
        showConfirmButton: false,
        showCloseButton: true,
    });   
  };


  //END DISABLE COLLECTION ------------------------------------------

  return (
    <TableContainer component={Paper} sx={{ zIndex:1}}>
      <Table aria-label="simple table">
        <TableHead sx={{ backgroundColor: '#f7a642ff', border: '.15rem solid #000000' }}>
          <TableRow>
            <TableCell><b>Collection</b></TableCell>
            <TableCell align="center"><b>Symbol</b></TableCell>
            <TableCell align="center"><b>Max Supply</b></TableCell>
            <TableCell align="center"><b>Token Ids</b></TableCell>
            <TableCell align="center"><b>Owner</b></TableCell>
            <TableCell align="center"><b>Enabled</b></TableCell>
            <TableCell align="center"><b>Actions</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {collectionsInfo.map((collection) => (
            <TableRow
              key={collection.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {collection.name}
              </TableCell>
              <TableCell align="center">{collection.symbol}</TableCell>
              <TableCell align="center">{collection.totalSupply}</TableCell>
              <TableCell align="center">0</TableCell>
              <TableCell align="center">{collection.owner}</TableCell>
              <TableCell align="center">Yes</TableCell>
              <TableCell align="left">
                <Box display="flex" gap={1}>
                <Button variant="contained" size="small" onClick={() => viewCollection(collection)}>View</Button>
                <Button variant="outlined" size="small" onClick={() => showMintTokenForm()}>Mint</Button>
                <Button variant="text" color='error' size="small" onClick={() => disableCollection(collection.name)}>DISABLE</Button>
                </Box>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}