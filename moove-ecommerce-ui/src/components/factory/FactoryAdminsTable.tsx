import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, Paper, Button } from "@mui/material";
import { AdminsTableProps } from "../../utils/Interfaces";
import { useAppContext } from "../../Context";
import { formatAddress } from "../../utils/formatValue";



export default function AdminsTable ({admins, isOwner, removeAdmin}: AdminsTableProps) {

    const isMobile = useMediaQuery('(max-width: 1400px)');
    const isPhone = useMediaQuery('(max-width: 650px)');
    const appContext = useAppContext();
    
    return (
    <TableContainer component={Paper} sx={{ border: '.2rem solid #000000'}}>
      <Table aria-label="simple table">
        <TableHead sx={{ backgroundColor: '#f7a642ff'}}>
          <TableRow>
            <TableCell align="center"><b>Address</b></TableCell>
            {isOwner && 
                <TableCell align="center"><b>Actions</b></TableCell>
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {admins &&
          admins.map((admin) => (
            <TableRow key={admin} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="center">{formatAddress(admin)}</TableCell>
              {isOwner && 
                <TableCell align="center"><Button variant="contained" color="error" onClick={() => removeAdmin(admin)}>Remove</Button></TableCell>
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    );
}