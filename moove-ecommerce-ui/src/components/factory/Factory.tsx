import { Box, Button, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppContext } from "../../Context";
import collections_logo from "../../assets/collections.png";
import { writeDisableCollection, writeMintNFT } from "../../utils/bridges/MooveCollectionsBridge";
import { writeCreateCollection } from "../../utils/bridges/MooveFactoryBridge";
import Loader from "../commons/Loader";
import CreateCollectionForm from "../forms/CreateCollectionForm";
import TableCollection from "./FactoryTableCollections";

export function Factory() {
    const isMobile = useMediaQuery('(max-width: 1400px)');
    const isPhone = useMediaQuery('(max-width: 650px)');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const MySwal = withReactContent(Swal);
    const appContext = useAppContext();

    useEffect(() => {
    }, [])

    function createCollection() {
        MySwal.fire({
            title: "New collection",
            html: <CreateCollectionForm handleSubmit={handleSubmit}/>,
            showConfirmButton: false,
            showCloseButton: true,
        });   
    }

    async function handleSubmit(name: string, symbol: string, maxSupply:number){
      try {
        setIsLoading(true);
        const success = await writeCreateCollection(name, symbol, maxSupply);
        setIsLoading(false);
        if(success){
          Swal.fire({
            title: "Create collection",
            text: "Request in progress...\n Please wait for the new collection to be processed.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
        }
        //Catturare l'evento dal listener
      } catch (error) {
        console.log("error during creating collection: ", error);
      }
    }

    async function handleMint(collectionAddress: string, tokenURI: string, price: number){
      setIsLoading(true);
      var success = await writeMintNFT(collectionAddress, tokenURI, price)
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

    async function handleDisable(collectionAddress: string){
      setIsLoading(true);
      var success = await writeDisableCollection(collectionAddress);
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
        {/* COLLECTIONS */}
        <Box display="flex" justifyContent="center" margin={"auto"} flexDirection={"column"} alignItems="center" maxWidth={isMobile ? "90%":  isPhone ? "100%": "75%"} gap={2}>
            <img src={collections_logo} alt="Logo" style={{ maxHeight: '100px' }} />
            <Button variant="contained" size="large"  onClick={createCollection} sx={{ borderRadius:'10px', backgroundColor:'#f7a642ff'}}> Create new collection </Button>
            <TableCollection collections={appContext.collections} handleMint={handleMint} handleDisable={handleDisable}/>
        </Box>
        <Loader loading={isLoading} />    
        </>
    );
}