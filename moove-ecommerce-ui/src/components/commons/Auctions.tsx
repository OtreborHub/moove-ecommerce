import { Box, Button, Collapse, IconButton, Tooltip, Typography, useMediaQuery } from '@mui/material';
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
import { AuctionType, getAuctionStatus, getAuctionTypeDescription } from '../../utils/enums/Auction';
import auctions_title from "../../assets/auctions_title.svg";
import moove_logo from "../../assets/moove_logo.svg";
import { readTokenURI } from '../../utils/bridges/MooveCollectionsBridge';
import { useAppContext } from '../../Context';
import Loader from './Loader';
import Auction from './Auction';


const IPFS_gateway = 'https://amber-adverse-llama-592.mypinata.cloud/ipfs/';
type AuctionWithImage = {auction: AuctionDTO} & { imageUrl: string };

export default function Auctions({ auctions, connectMetamask, goBack} : AuctionsProps) {
  const appContext = useAppContext();
  const isMobile = useMediaQuery('(max-width: 1400px)');
  const isPhone = useMediaQuery('(max-width: 650px)');
  const [auctionsData, setAuctionsData] = useState<AuctionWithImage[]>(
    auctions.map(auction => ({ auction: auction, imageUrl: moove_logo }))
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
      const auctionDataWithUrl: AuctionWithImage[] = await Promise.all(
        auctions.map(async (auction) => {
          const imageUrl = await getTokenImage(auction);
          return { auction, imageUrl };
        })
      );
      setAuctionsData(auctionDataWithUrl);
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

  const sortedAuctions = auctionsData
    .slice()
    .sort((a, b) => {
      const now = Date.now();
      const aEnd = new Date(a.auction.endTime).getTime();
      const bEnd = new Date(b.auction.endTime).getTime();

      const aIsClosed = a.auction.ended;
      const bIsClosed = b.auction.ended;

      const aIsExpired = aEnd < now;
      const bIsExpired = bEnd < now;

      if (aIsClosed && !bIsClosed) return 1;
      if (!aIsClosed && bIsClosed) return -1;

      if (aIsExpired && !bIsExpired) return -1;
      if (!aIsExpired && bIsExpired) return 1;

      return aEnd - bEnd;
    });

  return (
    <>
    <Box alignContent={"left"} mt={3.5} ml={3.5}>
      <Button variant="outlined" sx={{borderColor: '#f7a642ff', color: '#f7a642ff', m:2}} onClick={back}> Back </Button>
    </Box>
    <Box display="flex" justifyContent="center" margin={"auto"} flexDirection={"column"} alignItems="center" maxWidth={isMobile ? "90%":  isPhone ? "100%": "55%"} gap={2}>
      <img src={auctions_title} alt="Logo" style={{ maxHeight: '75px' }} />
    
      <TableContainer component={Paper} sx={{ zIndex:1, border: '.15rem solid #000000', borderRadius: 2 }}>
        <Table aria-label="simple table">
          <TableHead sx={{ backgroundColor: '#f7a642ff', borderBottom: '.15rem solid #000000'}}>
            <TableRow>
              <TableCell align="center" size='small'><b>Details</b></TableCell>
              <TableCell align="center" size='small'><b>NFT</b></TableCell>
              {!isPhone && <TableCell align="left"><b>Auction</b></TableCell>}
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAuctions
            .map((auctionData: AuctionWithImage) => (
              <Auction key={auctionData.auction.tokenId + auctionData.auction.collection.address}
                auctionWithImage={auctionData}/>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
    </Box>
    <Loader loading={isLoading} /> 
    </>
  );
}