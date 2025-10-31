import { Box, Button, Collapse, IconButton, Typography, useMediaQuery } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { AuctionsProps, TableCollectionProps } from '../../utils/Interfaces';
import { useEffect, useState } from 'react';
import AuctionDTO from '../../utils/DTO/AuctionDTO';
import { getAuctionStatus, getAuctionTypeDescription } from '../../utils/enums/Auction';
import auctions_title from "../../assets/auctions_title.svg";
import moove_logo from "../../assets/moove_logo.svg";
import { readTokenURI } from '../../utils/bridges/MooveCollectionsBridge';
import { useAppContext } from '../../Context';
import Loader from './Loader';
import { formatAddress, formatPrice, formatToRomeTime } from '../../utils/formatValue';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const IPFS_gateway = 'https://amber-adverse-llama-592.mypinata.cloud/ipfs/';
type AuctionWithImage = AuctionDTO & { imageUrl: string };

export default function Auctions({ auctions, connectMetamask, goBack} : AuctionsProps) {
  const appContext = useAppContext();
  const isMobile = useMediaQuery('(max-width: 1400px)');
  const isPhone = useMediaQuery('(max-width: 650px)');
  const [auctionsData, setAuctionsData] = useState<AuctionWithImage[]>(
    auctions.map(a => ({ ...a, imageUrl: "" }))
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

useEffect(() => {
    if (auctions.length > 0) {
      initAuctionImages();
    }
  }, [auctions]);

  async function initAuctionImages() {
    setIsLoading(true);
    try {
      const enriched: AuctionWithImage[] = await Promise.all(
        auctions.map(async (auction) => {
          const imageUrl = await getTokenImage(auction);
          return { ...auction, imageUrl };
        })
      );
      setAuctionsData(enriched);
    } catch (error) {
      console.error("Error initializing auction images:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function getTokenImage(auction: AuctionDTO): Promise<string> {
    try {
      const tokenURI = await readTokenURI(auction.collection.address, auction.tokenId);
      if (!tokenURI) return moove_logo;
      return await fetchMetadata(tokenURI, auction);
    } catch (error) {
      console.error(`Error getting token image for auction ${auction.tokenId}:`, error);
      return moove_logo;
    }
  }

  async function fetchMetadata(tokenURI: string, auction: AuctionDTO): Promise<string> {
    try {
      const metadataUrl = `${IPFS_gateway}${tokenURI}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(metadataUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const metadata = await response.json();
      const imageCID = metadata.cid;
      return imageCID ? `${IPFS_gateway}${imageCID}` : moove_logo;
    } catch (error) {
      console.error(`Error fetching metadata for auction ${auction.tokenId}:`, error);
      return moove_logo;
    }
  }

  function back(){
    if(goBack) goBack();
  }


  function AuctionRow({ auction }: { auction: AuctionWithImage }){
    const [open, setOpen] = useState(false);
    return (
      <>
      <TableRow key={auction.tokenId + "_" + auction.collection.address} sx={{'&:last-child td, &:last-child th': { border: 0 } }}>
        {isMobile && 
        <TableCell align="center"><Button>Azioni Auctions</Button></TableCell>}
        <TableCell align='center' size='small'>
            <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => (setOpen(!open))}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton> 

        </TableCell>
        <TableCell align="center" size='small' padding='none' sx={{
          transition: 'transform 0.3s ease-in-out',
          "&:hover": {
            transform: 'scale(1.05)',
            zIndex: 2, // opzionale, per farlo sopra le altre card
          }
        }}>
          <img
              src={auction.imageUrl}
              alt={`NFT ${auction.tokenId}`}
              style={{ width: 120, height: 120, objectFit: "contain"}}
            />
        </TableCell>
        <TableCell align="left">
          <Box display={"flex"} flexDirection={"column"}>
            <Typography variant='body2'>Type: {getAuctionTypeDescription(auction.auctionType)}</Typography>
            <Typography variant='body2'>Status: {getAuctionStatus(auction)}</Typography>
            <Typography variant='body2'>Current Price: {formatPrice(auction.currentPrice, 'wei')} wei</Typography>
            <Typography variant='body2'>Start Price: {formatPrice(auction.startPrice, 'wei')} wei </Typography>
            <Typography variant='body2'>End Time: {isPhone ? formatToRomeTime(auction.endTime).substring(0,10) : formatToRomeTime(auction.endTime)}</Typography>
          </Box>
        </TableCell>
        
        <TableCell align="left">
          <Box display={"flex"} flexDirection={"column"}>
            <Typography variant='body2'>{auction.collection.name}</Typography>
            <Typography variant='body2'>{formatAddress(auction.collection.address) }</Typography>
            <Typography variant='body2'># of Tokens: {auction.collection.tokenIds}</Typography>
            <Typography variant='body2'>Max # of Tokens: {auction.collection.totalSupply}</Typography>
          </Box>
        </TableCell>
        {(!isPhone && !isMobile) &&
        <TableCell align="center"><Button>Azioni Auctions</Button></TableCell>}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      </>
    );
  }

  return (
    <>
    <Box alignContent={"left"} mt={3.5} ml={3.5}>
      <Button variant="outlined" sx={{borderColor: '#f7a642ff', color: '#f7a642ff', m:2}} onClick={back}> Back </Button>
    </Box>
    <Box display="flex" justifyContent="center" margin={"auto"} flexDirection={"column"} alignItems="center" maxWidth={isMobile ? "90%":  isPhone ? "100%": "75%"} gap={2}>
    <img src={auctions_title} alt="Logo" style={{ maxHeight: '75px' }} />
    <TableContainer component={Paper} sx={{ zIndex:1, border: '.15rem solid #000000' }}>
      <Table aria-label="simple table">
        <TableHead sx={{ backgroundColor: '#f7a642ff', borderBottom: '.15rem solid #000000'}}>
          <TableRow>
            {(isMobile) && <TableCell align="center"><b>Actions</b></TableCell>}
            <TableCell align="center" size='small'></TableCell>
            <TableCell align="center" size='small'><b>NFT</b></TableCell>
            <TableCell align="left"><b>Auction Data</b></TableCell>
            <TableCell align="left"><b>Collection Data</b></TableCell>
            {(!isPhone && !isMobile) && <TableCell align="center"><b>Actions</b></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {auctionsData
          .map((auctionData: AuctionWithImage) => (
            <AuctionRow auction={auctionData} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
    <Loader loading={isLoading} /> 
    </>
  );
}