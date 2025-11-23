import { Box, Button, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAppContext } from "../../Context";
import { readTokenData } from "../../utils/bridges/MooveCollectionsBridge";
import CollectionDTO from "../../utils/DTO/CollectionDTO";
import TokenDTO from "../../utils/DTO/TokenDTO";
import { Sections } from "../../utils/enums/Sections";
import { MyNFTsProps } from "../../utils/Interfaces";
import Loader from "./Loader";
import TokenPreview from "./TokenPreview";

type MyNFT = {token: TokenDTO} & {collection: CollectionDTO};

export default function MyNFTs({connectMetamask}: MyNFTsProps) {
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
    
    function loadingPropagation(value: boolean){
        setIsLoading(value);
    }

    return (
    <>
      <Box alignContent={"left"} m={3.5}>
        <Button variant="outlined" sx={{borderColor: '#f7a642ff', color: '#f7a642ff', m:2}} onClick={() => appContext.updateSection(Sections.MARKETPLACE)}> To Marketplace </Button>
      </Box>

      <Box display="flex" textAlign={"left"} justifyContent={"left"} justifySelf={"center"} flexDirection={"column"} p={3} minWidth={"90%"} sx={{ backgroundColor: "#43434345"}}>

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
                handleConnect={connectMetamask}/>
              </Grid>
          ))}
          </Grid>

        {myNFTs.length === 0 && !isLoading &&
          <Typography variant="h6" component="div" alignSelf="center" sx={{ flexGrow: 1, marginTop: 5, marginBottom: 5, color: '#f7a642ff' }}>
            No tokens found.
          </Typography>
        }

      </Box>
      <Loader loading={isLoading}/>
    </>
    )
}