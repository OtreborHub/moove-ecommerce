import { Box, Button, Card, CardMedia, Typography, useMediaQuery } from "@mui/material"
import { CollectionProps } from "../../utils/Interfaces"
import getCoverImage from "../../utils/Cover"
import { useAppContext } from "../../Context";
import { formatAddress } from "../../utils/formatValue";
import { Sections } from "../../utils/enums/Sections";

export default function CollectionPreview({collection, idx, showCollection} : CollectionProps & { idx: number}) {
    const isMobile = useMediaQuery('(max-width: 1400px)');
    const isPhone = useMediaQuery('(max-width: 650px)');
    const appContext = useAppContext();

    function handleShowCollection(){
        if(showCollection) showCollection(collection);
    }

    return (
        <>
        <Card sx={{ position: 'relative', marginRight:'1rem', overflow:'hidden', borderRadius: 8}}>
            <CardMedia
                component="img"
                image={getCoverImage(idx)}
                alt={collection.name}
                sx={{
                height: '100%',
                width: '100%',
                objectFit: 'contain',
                filter: 'brightness(0.3)', // Oscura leggermente per far risaltare il testo
                }}
            />
                <Box
                sx={{
                position: 'absolute',
                top: isPhone ? '0%' : isMobile ? '35%' :'45%',
                left: 0,
                height: '100%',
                width: '100%',
                color: 'white',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                }}
                >
                    <Typography gutterBottom sx={{fontSize: 14 }}>
                    NFT Collection
                    </Typography>
                    <Typography variant="h5" component="div">
                    {collection.name}
                    </Typography>
                    <Typography variant="body2">
                    {isPhone? formatAddress(collection.address): collection.address}
                    </Typography>
                    <Typography sx={{mb: 1.5 }}>{collection.tokenIds} {collection.symbol}</Typography>
                    <Button sx={{ marginTop: 0.5, width: isPhone ? '70%': '30%' }}variant="contained" fullWidth size="small" onClick={handleShowCollection}>View collection</Button>
                </Box>    
        </Card>
        </>
    )
}