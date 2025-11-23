import { Box, Button, Grid, TextField, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppContext } from "../../Context";
import collections_title from "../../assets/collections_title.svg";
import { writeDisableCollection, writeMintNFT } from "../../utils/bridges/MooveCollectionsBridge";
import { readAdmins, writeAddAdmin, writeCreateCollection, writeRemoveAdmin } from "../../utils/bridges/MooveFactoryBridge";
import Loader from "../commons/Loader";
import CreateCollectionForm from "../forms/CreateCollectionForm";
import CollectionTable from "./FactoryCollectionsTable";
import CollectionDTO from "../../utils/DTO/CollectionDTO";
import FactoryAdminsTable from "./FactoryAdminsTable";
import AddRemoveAdminForm from "../forms/AddRemoveAdminForm";

const mooveOwner = import.meta.env.VITE_MOOVE_OWNER as string;
export function Factory({showCollection}: {showCollection: (collection: CollectionDTO) => void}) {
    const isMobile = useMediaQuery('(max-width: 1400px)');
    const isPhone = useMediaQuery('(max-width: 650px)');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [admins, setAdmins] = useState<string[]>([]);
    const MySwal = withReactContent(Swal);
    const appContext = useAppContext();
    const isOwner = appContext.signerAddress === mooveOwner

    useEffect(() => {
      initAdmins();
    }, [])

    async function initAdmins() {
      const admins = await readAdmins();
      setAdmins(admins);
    }

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
        //Catturare l'evento dal listener
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

    async function showAddRemoveAdminForm(addressToRemove: string){
      MySwal.fire({
        title: 'Add admin',
        html: <AddRemoveAdminForm addressToRemove={addressToRemove} handleSubmit={addRemoveAdmin}/>,
        showConfirmButton: false,
        showCloseButton: true,
      });
    }

    async function addRemoveAdmin(removingAdmin: boolean, address: string){
      if(removingAdmin){
        removeAdmin(address);
      } else {
        addAdmin(address);
      }
    }

    async function removeAdmin(address: string){
      setIsLoading(true);
      const success = await writeRemoveAdmin(address, appContext.signer);
      setIsLoading(false);
      if(success){
        MySwal.fire({
          title: "Admin Operations",
          text: "The admin operation request was successful! Reload the page after the transaction confirmation to see the changes.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    }

    async function addAdmin(address: string){
      setIsLoading(true);
      const success = await writeAddAdmin(address, appContext.signer);
      setIsLoading(false);
      if(success){
        MySwal.fire({
          title: "Admin Operations",
          text: "The admin operation request was successful! Reload the page after the transaction confirmation to see the changes.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    }

    return (
        <>
        <Grid container justifyContent="center" alignItems="center" marginTop={2}>
          <Grid size={ isMobile ? 12 : 8}>
            <Box display="flex" justifyContent="center" margin={"auto"} flexDirection={"column"} alignItems="center" maxWidth={isMobile ? "90%":  isPhone ? "100%": "85%"} gap={2} mt={2}>
              
            </Box>
          </Grid>
          <Grid size={ isMobile ? 12 : 4}>

          </Grid>  
        </Grid>
        
        <Box display="flex" flexDirection={ isMobile ? "column": "row" } justifyContent="space-between">
            
            {/* COLLECTIONS */}
            <Box className="slider-container" sx={{ 
                flexGrow: 1, 
                maxWidth: isMobile ? "100%": "65%",
                marginLeft: isMobile ? "1rem" : "3rem", 
                marginRight: isMobile ? "1rem" : "2rem",
                borderRadius: 4
                }}
            > 
              <Box display="flex" justifyContent={ isMobile ? "center": "space-between" } alignItems="center" mb={2} mt={2} flexDirection={ isMobile ? "column": "row" } gap={ isMobile ? 2 : 0 }>
                <img src={collections_title} alt="Collections" style={{ maxHeight: '85px' }} />
                <Button variant="contained" size="large"  onClick={showCreateCollectionForm} sx={{ borderRadius:'10px', backgroundColor:'#f7a642ff'}}> Create new collection </Button>
              </Box>

              <CollectionTable collections={appContext.collections} handleMint={mintNFT} handleDisable={disableCollection} showCollection={showCollection}/>
            </Box>

            {/* ADMINS */}
            <Box
                display={"flex"} 
                flexDirection={"column"}
                sx={{
                    flexBasis: isMobile? "100%": "35%", 
                    maxWidth: isMobile ? "100%":"35%", 
                    marginRight: isMobile ? "2rem" : "2rem", 
                    marginLeft: isMobile ? "2rem" : "1rem",
                    maxHeight: isMobile ? '' : '700px', 
                    borderRadius: 4
                  }}
                >
                  <Box display="flex" justifyContent={ isMobile ? "center": "space-between" } alignItems="right" mb={2} mt={isMobile ? 4 : 2} flexDirection={ isMobile ? "column": "row" } gap={ isMobile ? 2 : 0 }>
                    {!isMobile && isOwner && <Button variant="text" size="large"  onClick={() =>showAddRemoveAdminForm("")} sx={{color:'#f7a642ff', '&:hover': { backgroundColor: 'transparent'}}}> Add admin </Button>}
                    <img src={collections_title} alt="Collections" style={{ maxHeight: '85px' }} />
                    {isMobile && isOwner && <Button variant="text" size="large"  onClick={() => showAddRemoveAdminForm("")} sx={{color:'#f7a642ff', '&:hover': { backgroundColor: 'transparent'}}}> Add admin </Button>}
                  </Box>
                  <FactoryAdminsTable removeAdmin={showAddRemoveAdminForm} admins={admins} isOwner={isOwner} />
            </Box>
        </Box>
        <Loader loading={isLoading} />    
        </>
    );
}