import { Box, Button, useMediaQuery } from "@mui/material";
import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppContext } from "../../Context";
import collections_title from "../../assets/collections_title.svg";
import { writeDisableCollection, writeMintNFT } from "../../utils/bridges/MooveCollectionsBridge";
import { writeCreateCollection } from "../../utils/bridges/MooveFactoryBridge";
import Loader from "../commons/Loader";
import CreateCollectionForm from "../forms/CreateCollectionForm";
import CollectionTable from "./FactoryCollectionsTable";
import CollectionDTO from "../../utils/DTO/CollectionDTO";

export function Factory({showCollection}: {showCollection: (collection: CollectionDTO) => void}) {
    const isMobile = useMediaQuery('(max-width: 1400px)');
    const isPhone = useMediaQuery('(max-width: 650px)');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const MySwal = withReactContent(Swal);
    const appContext = useAppContext();

    function showCreateCollectionForm() {
        MySwal.fire({
            title: "New collection",
            html: <CreateCollectionForm handleSubmit={createCollection}/>,
            showConfirmButton: false,
            showCloseButton: true,
        });   
    }

    async function createCollection(name: string, symbol: string, maxSupply:number){
      try {
        setIsLoading(true);
        const success = await writeCreateCollection(name, symbol, maxSupply, appContext.signer);
        setIsLoading(false);
        if(success){
          Swal.fire({
            title: "Create collection",
            text: "Request in progress...\n Please wait for the new collection to be processed.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
        }
      } catch (error) {
        console.log("error during creating collection: ", error);
      }
    }

    async function mintNFT(collectionAddress: string, tokenURI: string, price: number){
      setIsLoading(true);
      var success = await writeMintNFT(collectionAddress, tokenURI, price, appContext.signer);
      setIsLoading(false);
      if(success){
        MySwal.fire({
          title: "New Mint NFT Request",
          text: "The minting request was successful!",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    }

    async function disableCollection(collectionAddress: string){
      setIsLoading(true);
      var success = await writeDisableCollection(collectionAddress, appContext.signer);
      setIsLoading(false);
      if(success){
        MySwal.fire({
          title: "Disable collection",
          text: "The disable request was successful!",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    };

    return (
      <>
        <Box display="flex" justifyContent="center" margin={"auto"} flexDirection={"column"} alignItems="center" maxWidth={isMobile ? "90%":  isPhone ? "100%": "85%"} gap={2} mt={2}>
            <img src={collections_title} alt="Collections" style={{ maxHeight: '85px' }} />
            <Button variant="contained" size="large"  onClick={showCreateCollectionForm} sx={{ borderRadius:'10px', backgroundColor:'#f7a642ff'}}> Create new collection </Button>
            <CollectionTable collections={appContext.collections} handleMint={mintNFT} handleDisable={disableCollection} showCollection={showCollection}/>
        </Box>
        
        
        <Loader loading={isLoading} />    
      </>
    );
}