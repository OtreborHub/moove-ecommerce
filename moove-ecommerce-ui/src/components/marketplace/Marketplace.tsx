import { useEffect, useState } from "react";
import { CollectionsProps } from "../../utils/Interfaces";
import { useAppContext } from "../../Context";
import getMooveCollection_ContractInstance, { readCollectionData} from "../../utils/bridges/MooveCollectionsBridge";
import { Box } from "@mui/material";
import Slider from "react-slick";
import collections_logo from "../../assets/collections.png";
import Loader from "../commons/Loader";
import CollectionDTO from "../../utils/DTO/CollectionDTO";
import { CollectionPreview } from "./CollectionPreview";
import Auctions from "./Auctions";

export function Marketplace({collectionAddresses}: CollectionsProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const appContext = useAppContext();

    useEffect(() => {
        if(appContext.collections.length === 0){
            readCollectionsData();
        }
    }, [collectionAddresses]);

    async function readCollectionsData() {
        var collectionData = [];
        setIsLoading(true);
        for (const collectionAddress of collectionAddresses) {
            getMooveCollection_ContractInstance(collectionAddress, appContext.provider);
            var collectionInfoResponse = await readCollectionData();
            if(collectionInfoResponse){
                var collectionInfo = new CollectionDTO(
                    collectionAddress,
                    collectionInfoResponse.name, 
                    collectionInfoResponse.symbol,
                    collectionInfoResponse.totalSupply,
                    collectionInfoResponse.owner
                );
                collectionData.push(collectionInfo);
            }
        }
        setIsLoading(false);
        appContext.updateCollections(collectionData)
    }

    const settings = {
        dots: true,
        fade: true,
        infinite: true,
        speed: 350,
        slidesToShow: 1,
        slidesToScroll: 1,
        waitForAnimate: false,
    };

    return (
        <>
        {/* COLLECTIONS */}
        <Box display="flex" justifyContent="center" margin={"auto"}>
            <img src={collections_logo} alt="Logo" style={{ maxHeight: '100px', marginLeft: '0px' }} />
        </Box>

        <Box className="slider-container" sx={{ maxWidth: "55%", margin: "auto", marginTop: "0rem"}}> 
            <Slider {...settings}> 
            {appContext.collections.map((data, index) => (
                <CollectionPreview key={index} collection={data} idx={index} />
            ))}
            </Slider>
        </Box>

        {/* AUCTIONS */}
        <Auctions/>
        
        <Loader loading={isLoading} />    
        </>
    );
}