import { Box, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import auction_logo from "../../assets/auctions.png";
import collections_logo from "../../assets/collections.png";
import { useAppContext } from "../../Context";
import getMooveCollection_ContractInstance, { readAuction, readCollectionData } from "../../utils/bridges/MooveCollectionsBridge";
import AuctionDTO from "../../utils/DTO/AuctionDTO";
import CollectionDTO from "../../utils/DTO/CollectionDTO";
import { MarketplaceProps } from "../../utils/Interfaces";
import Loader from "../commons/Loader";
import AuctionPreview from "./AuctionPreview";
import CollectionPreview from "./CollectionsPreview";

export function Marketplace({collectionAddresses, connectWallet}: MarketplaceProps) {
    const isMobile = useMediaQuery('(max-width: 1400px)');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const appContext = useAppContext();


    useEffect(() => {
        if(appContext.collections.length === 0){
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
            getMooveCollection_ContractInstance(collectionAddress, appContext.provider);
            var collectionDataResponse = await readCollectionData();
            if(collectionDataResponse){
                var collectionInfo = new CollectionDTO(
                    collectionAddress,
                    collectionDataResponse.name, 
                    collectionDataResponse.symbol,
                    collectionDataResponse.tokenIds,
                    collectionDataResponse.totalSupply,
                    collectionDataResponse.active,
                    collectionDataResponse.owner
                );
                collectionDTOs.push(collectionInfo);
            }
        }
        
        appContext.updateCollections(collectionDTOs);
        setIsLoading(false);
        return collectionDTOs;
    }

    async function readAuctionsData(collectionData: CollectionDTO[]){
        setIsLoading(true);
        var auctionDTOs: AuctionDTO[] = [];
        for (const collection of collectionData) {
            for(let idx = 1; idx <= collection.tokenIds; idx++){
                var auctionResponse = await readAuction(collection.address, idx);
                if(auctionResponse && auctionResponse.tokenId !== 0){
                    auctionResponse.collection = collection;
                    auctionDTOs.push(auctionResponse);
                }

            }
        }

        appContext.updateAuctions(auctionDTOs);
        setIsLoading(false);
        return auctionDTOs;
    }

    const PrevArrow = () => {
        return (
            <div
                style={{display: "none"}}
            />
        );
    };

    const NextArrow = (props: any) => {
        const { className, style, onClick } = props;
        return (
            <Box
                className={className}
                style={{
                    ...style,
                    right: '3rem', 
                    zIndex: 1,
                    fontSize: '5rem',
                    cursor: 'pointer'
                }}
                onClick={onClick}
            ></Box>
        );
    };

    const settings = {
        // dots: true,
        fade: true,
        infinite: true,
        speed: 350,
        slidesToShow: 1,
        slidesToScroll: 1,
        waitForAnimate: false,
        prevArrow: <PrevArrow/>,
        nextArrow: <NextArrow/>
    };

    return (
        <>
        <Box display= {isMobile? "block": "flex"} 
            justifyContent= {isMobile ? "":"space-between" }
            marginLeft={isMobile ? "": "2rem" }
            marginRight={isMobile ? "": "3rem" }
            textAlign={isMobile ? "center": "left"}
            marginTop="1rem">
            <img src={collections_logo} alt="Logo" style={{ maxHeight: '90px' }} />
            { !isMobile && <img src={auction_logo} alt="Collections" style={{ maxHeight: '100px' }} />}
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
                        <CollectionPreview key={index} collection={collection} idx={index} connectWallet={connectWallet}/>
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
                    maxHeight: isMobile ? '' : '700px', // <-- Limita l’altezza visibile (es. 3 card da 120px)
                    overflowY: 'auto',   // <-- Attiva lo scroll verticale
                    zIndex: 1}}
                >
                
                { isMobile && 
                    <Box textAlign="center">
                        <img src={auction_logo} alt="Collections" style={{ maxWidth: '217px' }} />
                    </Box>
                }
                
                {appContext.auctions
                //.filter((auction) => auction.ended === false)
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
                })
                .map((auction, index) => (
                    <AuctionPreview key={index} auction={auction} connectWallet={connectWallet}/>
                ))}
            </Box>

        </Box>
        <Loader loading={isLoading} />    
        </>
    );
}