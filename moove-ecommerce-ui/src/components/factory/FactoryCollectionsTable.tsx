import { useMediaQuery } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { CollectionTableProps } from '../../utils/Interfaces';
import FactoryActionsButton from '../actionsButton/CollectionActionsButton';
import { formatAddress } from '../../utils/formatValue';

export default function CollectionTable({ collections, handleMint, handleDisable, showCollection }: CollectionTableProps) {
  const isMobile = useMediaQuery('(max-width: 1400px)');
  const isPhone = useMediaQuery('(max-width: 650px)');

  return (
    <TableContainer component={Paper} sx={{ zIndex:1, border: '.2rem solid #000000', borderRadius: 2}}>
      <Table aria-label="simple table">
        <TableHead sx={{ backgroundColor: '#f7a642ff', borderBottom: '.15rem solid #000000'}}>
          <TableRow>
            {(isMobile) && <TableCell align="center"><b>Actions</b></TableCell>}
            <TableCell align="center"><b>Collection</b></TableCell>
            <TableCell align="center"><b>Symbol</b></TableCell>
            <TableCell align="center"><b>Max Supply</b></TableCell>
            <TableCell align="center"><b>Token Ids</b></TableCell>
            <TableCell align="center"><b>Address</b></TableCell>
            <TableCell align="center"><b>Enabled</b></TableCell>
            {(!isPhone && !isMobile) && <TableCell align="center"><b>Actions</b></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {collections && 
          collections
          .sort((a, b) => Number(b.active) - Number(a.active))
          .map((collection) => (
            <TableRow key={collection.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {isMobile && 
              <TableCell align="center"><FactoryActionsButton collection={collection} handleMint={handleMint} handleDisable={handleDisable} showCollection={showCollection}/></TableCell>}
              <TableCell align="center">{collection.name}</TableCell>
              <TableCell align="center">{collection.symbol}</TableCell>
              <TableCell align="center">{collection.totalSupply}</TableCell>
              <TableCell align="center">{collection.tokenIds}</TableCell>
              <TableCell align="center">{formatAddress(collection.address)}</TableCell>
              <TableCell align="center">{collection.active ? "Yes" : "No"}</TableCell>
              {(!isPhone && !isMobile) &&
              <TableCell align="center"><FactoryActionsButton collection={collection} handleMint={handleMint} handleDisable={handleDisable} showCollection={showCollection}/></TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}