import { Box, Button, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import auction_logo from "../../assets/auctions_title.svg";
import collections_logo from "../../assets/collections_title.svg";
import { useAppContext } from "../../Context";
import { readAuction, readCollectionData } from "../../utils/bridges/MooveCollectionsBridge";
import AuctionDTO from "../../utils/DTO/AuctionDTO";
import CollectionDTO from "../../utils/DTO/CollectionDTO";
import { MarketplaceProps } from "../../utils/Interfaces";
import Loader from "../commons/Loader";
import AuctionPreview from "./AuctionPreview";
import CollectionPreview from "./CollectionsPreview";
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { Sections } from "../../utils/enums/Sections";

export function Marketplace({collectionAddresses, handleConnect, showCollection }: MarketplaceProps) {
    const isMobile = useMediaQuery('(max-width: 1400px)');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const appContext = useAppContext();


    useEffect(() => {
        if(appContext.collections.length === 0 && collectionAddresses.length > 0){ 
            init();
        }
    }, [collectionAddresses]);

    async function init(){
        const collectionsData = await readCollectionsData();
        await readAuctionsData(collectionsData);
    }

    async function readCollectionsData() {
        setIsLoading(true);

        var collectionDTOs: CollectionDTO[] = [];

        for (const collectionAddress of collectionAddresses) {
            var collectionDataResponse = await readCollectionData(collectionAddress);
            if(collectionDataResponse){
                collectionDTOs.push(collectionDataResponse);
            }
        }

        console.log(`✅ Loaded ${collectionDTOs.length} collections successfully`);
        appContext.updateCollections(collectionDTOs);
        setIsLoading(false);
        return collectionDTOs;
    }

    async function readAuctionsData(collectionData: CollectionDTO[]){
        setIsLoading(true);
        
        try {
            const auctionPromises: Promise<AuctionDTO | null>[] = [];
            
            for (const collection of collectionData) {
                if(collection.active === false) continue;
                for(let idx = 1; idx < collection.tokenIds; idx++){
                    const promise = readAuction(collection.address, idx)
                        .then(auctionResponse => {
                            if(auctionResponse && auctionResponse.tokenId !== 0){
                                auctionResponse.collection = collection;
                                return auctionResponse;
                            }
                            return null;
                        })
                        .catch(error => {
                            console.error(`Error reading auction ${idx} from ${collection.name}:`, error);
                            return null; 
                        });
                    
                    auctionPromises.push(promise);
                }
            }

            console.log(`🚀 Loading ${auctionPromises.length} auctions in parallel...`);
            const results = await Promise.all(auctionPromises);
            
            const auctionDTOs = results.filter(auction => auction !== null) as AuctionDTO[];
            
            console.log(`✅ Loaded ${auctionDTOs.length} auctions successfully`);
            appContext.updateAuctions(auctionDTOs);
            
        } catch (error) {
            console.error("Error loading auctions:", error);
        } finally {
            setIsLoading(false);
        }
    }


    // Custom Arrows for the Slider
    const PrevArrow = () => { return ( <div style={{display: "none"}} /> );};
    const NextArrow = (props: any) => {
        const { onClick } = props;
        return (
        <Box
            onClick={onClick}
            sx={{
                position: 'absolute',
                right: isMobile ? '2rem' : '3rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                cursor: 'pointer'
            }}
            >
            <DoubleArrowIcon sx={{ fontSize: '2rem', color: 'whitesmoke' }} />
            </Box>
        );
    };

    function handleShowCollection(collection: CollectionDTO){
        showCollection(collection);
    }

    const settings = {
        fade: true,
        infinite: true,
        speed: 350,
        slidesToShow: 1,
        slidesToScroll: 1,
        waitForAnimate: false,
        prevArrow: <PrevArrow/>,
        nextArrow: <NextArrow/>
    };

    const sortedAuctions = appContext.auctions
    .slice()
    .sort((a, b) => {
      const now = Date.now();
      const aEnd = new Date(a.endTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      const aIsClosed = a.ended;
      const bIsClosed = b.ended;

      const aIsExpired = aEnd < now;
      const bIsExpired = bEnd < now;

      if (aIsClosed && !bIsClosed) return 1;
      if (!aIsClosed && bIsClosed) return -1;

      if (aIsExpired && !bIsExpired) return -1;
      if (!aIsExpired && bIsExpired) return 1;

      return aEnd - bEnd;
    });

    const displayedAuctions = sortedAuctions.slice(0, 4);


    return (
        <>
        <Box display= {isMobile? "block": "flex"} 
            justifyContent= {isMobile ? "":"space-between" }
            marginLeft={isMobile ? "": "3rem" }
            marginRight={isMobile ? "": "3rem" }
            textAlign={isMobile ? "center": "left"}
            marginTop="1rem">
            <img src={collections_logo} alt="Logo" style={{ maxHeight: '75px' }} />
            { !isMobile && <img src={auction_logo} alt="Collections" style={{ maxHeight: '63px', marginRight: "-.7rem" }} />}
        </Box>

        <Box display="flex" flexDirection={ isMobile ? "column": "row" } justifyContent="space-between">
            
            {/* COLLECTIONS */}
            <Box className="slider-container" sx={{ 
                flexGrow: 1, 
                maxWidth: isMobile ? "100%": "62%",
                // flexBasis: isMobile? "100%": "62%",  
                marginLeft: isMobile ? "1rem" : "3rem", 
                marginTop: "0rem", 
                overflow: "hidden", 
                borderRadius: 10
                }}
            > 
                {appContext.collections.length > 0 &&
                    <Slider {...settings}> 
                    {appContext.collections
                    .filter((collection) => collection.active === true)
                    .map((collection, index) => (
                        <CollectionPreview key={index} idx={index} collection={collection} handleConnect={handleConnect} showCollection={handleShowCollection}/>
                    ))}
                    </Slider>
                }
            </Box>

            {/* AUCTIONS */}
            
            <Box
                display={"flex"} 
                flexDirection={"column"}
                sx={{
                    flexBasis: isMobile? "100%": "35%", 
                    maxWidth: isMobile ? "100%":"35%", 
                    marginRight: isMobile ? "" : "3rem", 
                    margin: isMobile ? "1rem": "",
                    gap: 1, 
                    maxHeight: isMobile ? '' : '700px',
                    zIndex: 1}}
                >
                
                { isMobile && 
                    <Box textAlign="center">
                        <img src={auction_logo} alt="Auctions" style={{ maxWidth: '217px' }} />
                    </Box>
                }
                
                {displayedAuctions.map((auction, index) => (
                    <AuctionPreview key={index} auction={auction} handleConnect={handleConnect}/>
                ))}
                {appContext.auctions.length > 0 &&
                <Box textAlign={"right"}>
                    <Button sx={{color: "#f7a642ff"}} variant="text" onClick={() => appContext.updateSection(Sections.AUCTIONS)}> View All </Button>
                </Box>
                }
            </Box>

        </Box>
        <Loader loading={isLoading} />    
        </>
    );
}