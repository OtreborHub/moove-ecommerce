import { Box, Button, Card, CardMedia, Typography } from "@mui/material"
import { CollectionProps } from "../../utils/Interfaces"
import getCoverImage from "../../utils/Cover"
import { useAppContext } from "../../Context";

export function CollectionPreview({collection, idx} : CollectionProps & { idx: number}) {

    const appContext = useAppContext();

    function showCollection() {
        appContext.updateShownCollection(collection);
    }

    return (
        <>
        <Card sx={{ position: 'relative', margin: 2}}>
            <CardMedia
                component="img"
                image={getCoverImage(idx)}
                alt={collection.name}
                sx={{
                height: '100%',
                width: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.3)', // Oscura leggermente per far risaltare il testo
                }}
            />
                <Box
                sx={{
                position: 'absolute',
                top: '45%',
                left: 0,
                height: '40%',
                width: '100%',
                color: 'white',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                }}
                >
                    <Typography gutterBottom sx={{fontSize: 14 }}>
                    NFT Collection
                    </Typography>
                    <Typography variant="h5" component="div">
                    {collection.name}
                    </Typography>
                    <Typography sx={{mb: 1.5 }}>{collection.symbol}</Typography>
                    <Typography variant="body2">
                    Max supply: {collection.totalSupply}
                    <br />
                    Owner: {collection.owner}
                    </Typography>
                    <Button sx={{ marginTop: 0.5, width: '30%' }}variant="contained" fullWidth size="small" onClick={() => showCollection()}>View collection</Button>
                </Box>    
        </Card>
        </>
    )
}