import { Box, Button, Grid, Typography } from "@mui/material";
import { useAppContext } from "../../Context";
import { Sections } from "../../utils/enums/Sections";
import Loader from "./Loader";
import { useEffect, useState } from "react";
import TokenDTO from "../../utils/DTO/TokenDTO";
import { readTokenData, transferTo, writeCreateAuction, writeTokenPrice } from "../../utils/bridges/MooveCollectionsBridge";
import CollectionDTO from "../../utils/DTO/CollectionDTO";
import TokenPreview from "./TokenPreview";
import UpdateTokenPriceForm from "../forms/UpdateTokenPriceForm";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import CreateAuctionForm from "../forms/CreateAuctionForm";
import TransferToForm from "../forms/TransferToForm";

type MyNFT = {token: TokenDTO} & {collection: CollectionDTO};

export default function MyNFTs({}){
    const appContext = useAppContext();
    const [myNFTs, setMyNFTs] = useState<MyNFT[]>([]);
    const MySwal = withReactContent(Swal);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        getMyNFTs();
    }, [appContext.collections])

    async function getMyNFTs(){
        setIsLoading(true);
        var myNFTsData: MyNFT[] = [];
        var onlyActiveCollections = appContext.collections.filter((collection) => (collection.active === true));
        for(const collection of onlyActiveCollections){
            for(let idx=1; idx<=collection.tokenIds; idx++){
                const tokenData = await readTokenData(collection.address, idx);
                if (tokenData) {

                    if(tokenData.owner === appContext.signerAddress){
                        myNFTsData.push({token: tokenData, collection: collection});
                    }

                } else {
                    console.log(`Token data for tokenId ${idx} is undefined`);
                    setIsLoading(false);
                    break;
                }
        
            }
        }
        setMyNFTs(myNFTsData);
        setIsLoading(false);
    }

    /*function showCreateAuctionForm(tokenId: number, collection?: CollectionDTO){
        if(collection){
            MySwal.fire({
                title: "Create Auction",
                html: <CreateAuctionForm tokenId={tokenId} collectionSymbol={collection.symbol} collectionAddress={collection.address} handleSubmit={handleCreateAuction}/>,
                showConfirmButton: false,
                showCloseButton: true,
            });
        }
      }
    
      async function handleCreateAuction(tokenId: number, auctionType: number, startPrice: number, duration: number, minIncrement: number, collection?: CollectionDTO){
        setIsLoading(true);
        if(collection){
            const success = await writeCreateAuction(collection.address, tokenId, auctionType, startPrice, duration, minIncrement, appContext.signer);
            setIsLoading(false);
            if(success){
              MySwal.fire({
                title: "Create Auction",
                text: "The auction creation request was successful!",
                icon: "success",
                confirmButtonColor: "#3085d6",
              });
            }
        }
      }
    
      function showTransferForm(tokenId: number, collection?: CollectionDTO){
        if(collection){
            MySwal.fire({
                title: "Trasfer NFT",
                html: <TransferToForm tokenId={tokenId} collectionAddress={collection.address} handleSubmit={handleTrasferFrom}/>,
                showConfirmButton: false,
                showCloseButton: true,
            });
        }
      }
    
      async function handleTrasferFrom(tokenId: number, addressTo: string, collectionAddress?: string){
        setIsLoading(true);
        if(collectionAddress){
            var success = await transferTo(collectionAddress, addressTo, tokenId, appContext.signer);
            setIsLoading(false);
            if(success){
              MySwal.fire({
                title: "Transfer NFT",
                text: "The transfer request was successful!",
                icon: "success",
                confirmButtonColor: "#3085d6",
              });
            }
        }
      }
    
      function showUpdateTokenPriceForm(tokenId: number, tokenPrice: number, collection?: CollectionDTO){
        if(collection){
            MySwal.fire({
                title: "Update Price",
                html: <UpdateTokenPriceForm tokenId={tokenId} tokenPrice={tokenPrice} collectionAddress={collection.address} handleSubmit={handleSetTokenPrice} />,
                showConfirmButton: false,
                showCloseButton: true,
            });
        }
      }
    
      async function handleSetTokenPrice(tokenId: number, price: number, collectionAddress?: string){
        setIsLoading(true);
        if(collectionAddress){
            var success = await writeTokenPrice(collectionAddress, tokenId, price, appContext.signer);
            setIsLoading(false);
            if(success){
              MySwal.fire({
                title: "Update NFT Price",
                text: "The update request was successful!",
                icon: "success",
                confirmButtonColor: "#3085d6",
              });
            }
        }
      }*/

    function loadingPropagation(value: boolean){
        setIsLoading(value);
    }

    return (
    <>
      <Box alignContent={"left"} m={3.5}>
        <Button variant="outlined" sx={{borderColor: '#f7a642ff', color: '#f7a642ff', m:2}} onClick={() => appContext.updateSection(Sections.MARKETPLACE)}> To Marketplace </Button>
      </Box>

      <Box display="flex" textAlign={"left"} justifyContent={"left"} justifySelf={"center"} flexDirection={"column"} p={3} minWidth={"90%"} sx={{ backgroundColor: "#43434345"}}>

        {/* <Box display={"flex"} justifyContent={"left"} margin={2}> */}
          <Grid container spacing={1} zIndex={1} m={2}>
          {myNFTs.length > 0 && myNFTs.map((myNFT, index) => (
            <Grid
              size={{xs:6, sm:6, md:4, lg:2.4 }} 
              key={index}
              sx={{
                transition: 'transform 0.3s ease-in-out',
                "&:hover": {
                  transform: 'scale(1.15)',
                  zIndex: 2, // opzionale, per farlo sopra le altre card
                }
              }}
            >
              <TokenPreview 
                collection={myNFT.collection}
                token={myNFT.token} 
                isLoading={loadingPropagation}
                handleBuy={() => {}}
                connectMetamask={() => {}}
                handleCreateAuction={() => {}}
                handleTransfer={() => {}}
                handleUpdatePrice={() => {}}/>
              </Grid>
          ))}
          </Grid>
        {/* </Box> */}

        {myNFTs.length === 0 && !isLoading &&
          <Typography variant="h6" component="div" alignSelf="center" sx={{ flexGrow: 1, marginTop: 5, marginBottom: 5 }}>
            No tokens found for this collection.
          </Typography>
        }

      </Box>
      <Loader loading={isLoading}/>
    </>
    )
}