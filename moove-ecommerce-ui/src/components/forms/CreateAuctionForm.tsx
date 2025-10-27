import { useState } from "react";
import { Box, Button, TextField, Typography, Select, MenuItem, InputLabel, FormControl, Grid, Tooltip } from "@mui/material";
import { CreateAuctionFormProps } from "../../utils/Interfaces";
import { formatInSeconds } from "../../utils/formatValue";
import { AuctionType } from "../../utils/enums/Auction";

const AUCTION_LIMIT = import.meta.env.VITE_AUCTION_LIMIT as string;

const tooltipTextClassicAuction = (
  <>
    Place a bid at your chosen price.<br />
    The highest offer at the end of the auction wins the NFT.
  </>
);

const tooltipTextDutchAuction = (
  <>
    The auction starts at a high price that decreases over time.<br />
    Buy instantly when the price matches your expectations.
  </>
);

const tooltipTextEnglishAuction = (
  <>
    Each new bid must be higher than the previous one.<br />
    The highest valid bid when the auction ends wins the NFT.
  </>
);

export default function CreateAuctionForm({ tokenId, collectionSymbol: collectionName, handleSubmit }: CreateAuctionFormProps) {
  const [durationError, setDurationError] = useState<boolean>(false);
  const [auctionTypeError, setAuctionTypeError] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    auctionType: -1, // 0: Classic, 1: Dutch, 2: English
    startPrice: 0,
    unitStartPrice: 'Wei',
    duration: 0,
    durationUnit: 'days',
    durationInSeconds: 0,
    minIncrement: 0,
    unitIncrement: 'Wei'
  });

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    
    if(name==='auctionType') {setAuctionTypeError(false);}
    let seconds = 0;
    if(name==='duration'){ seconds = verifyDuration(value, undefined); }
    if(name==='durationUnit'){ seconds = verifyDuration(undefined, value); }
    if(seconds > 0){
      setFormData({ ...formData, [name]: value, durationInSeconds: seconds });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  function verifyDuration(value?: number, unit?: string){
    const seconds = formatInSeconds(value ? value: formData.duration, unit? unit: formData.durationUnit);
    if(seconds > Number(AUCTION_LIMIT)){ 
      setDurationError(true)
    } else { 
      setDurationError(false)
    }
    return seconds;
  }

  const submit = (event: any) => {
    event.preventDefault();
    if(verifyForm()){
      handleSubmit(
        Number(tokenId),
        Number(formData.auctionType),
        Number(formData.startPrice),
        Number(formData.durationInSeconds),
        Number(formData.minIncrement)
      );
    }
  };

  const verifyForm = () => {
    if(Number(formData.auctionType) === -1) {
      setAuctionTypeError(true);
    }
    return Number(formData.auctionType) >= 0 && 
    Number(formData.startPrice) > 0 &&
    Number(formData.duration) > 0 && Number(formData.duration) < Number(AUCTION_LIMIT)
  }

  const chooseTooltipText = (auctionType: number) => {
      switch(auctionType){
          case AuctionType.CLASSIC:
              return tooltipTextClassicAuction;
          case AuctionType.DUTCH:
              return tooltipTextDutchAuction;
          case AuctionType.ENGLISH:
              return tooltipTextEnglishAuction;
          default:
              return "";
      }
  }

  const auctionTypes = [
    { value: 0, label: "Classic" },
    { value: 1, label: "Dutch" },
    { value: 2, label: "English" },
  ];

  return (
    <Box component="form">
      <Typography variant="subtitle1" gutterBottom>
        You're almost there! Fill out the form to start your NFT auction.
      </Typography>
      <Typography alignSelf="left" variant="body2" gutterBottom>
        The auction duration cannot exceed 2 months.
      </Typography>
      <Grid container spacing={2}>
        <Grid size={8}>
            <TextField
            fullWidth
            margin="normal"
            id="tokenId"
            name="tokenId"
            label="Token"
            type="text"
            disabled
            value={`${collectionName}#${tokenId}`}
            />
        </Grid>
        <Grid size={4}>
            <FormControl fullWidth margin="normal">
                <InputLabel id="auction-type-label">Auction Type</InputLabel>
                <Select
                labelId="auction-type-label"
                id="auctionType"
                name="auctionType"
                error={auctionTypeError}
                value={formData.auctionType}
                label="Auction Type"
                onChange={handleChange}
                renderValue={(selected) => {
                  const selectedItem = auctionTypes.find((type) => type.value === selected);
                  return selectedItem?.label ?? '';
                }}
                >
                {auctionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                    >
                      {type.label}
                      <Tooltip title={chooseTooltipText(type.value)}>
                        <Box
                          component="span"
                          sx={{
                            backgroundColor: "#f7a64280",
                            color: "white",
                            borderRadius: "50%",
                            width: 15,
                            height: 15,
                            fontSize: 14,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "help",
                            ml: 1,
                          }}
                        >
                          ?
                        </Box>
                      </Tooltip>
                    </Box>
                  </MenuItem>
                ))}
                </Select>
            </FormControl>
        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid size={8}>
            <TextField
                fullWidth
                margin="normal"
                id="startPrice"
                name="startPrice"
                label="Start Price (ETH)"
                type="number"
                value={formData.startPrice}
                onChange={handleChange}
            />
        </Grid>
        <Grid size={4}>
            <FormControl fullWidth margin="normal">
                <InputLabel id="unit-startprice-label">Unit</InputLabel>
                <Select
                labelId="unit-startprice-label"
                id="unitStartPrice"
                name="unitStartPrice"
                value={formData.unitStartPrice}
                label="Unit"
                onChange={handleChange}
                >
                <MenuItem value="ETH">ETH</MenuItem>
                <MenuItem value="Finney">Finney</MenuItem>
                <MenuItem value="Gwei">Gwei</MenuItem>
                <MenuItem value="Wei">Wei</MenuItem>
                </Select>
            </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={8}>
           <TextField
            fullWidth
            margin="normal"
            id="duration"
            name="duration"
            error={durationError}
            label="Duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="duration-unit-label">Unit</InputLabel>
            <Select
              labelId="duration-unit-label"
              id="durationUnit"
              name="durationUnit"
              error={durationError}
              value={formData.durationUnit}
              label="Unit"
              onChange={handleChange}
            >
              <MenuItem value="days">Days</MenuItem>
              <MenuItem value="weeks">Weeks</MenuItem>
              <MenuItem value="months">Months</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={8}>
            <TextField
                fullWidth
                margin="normal"
                type="number"
                id="minIncrement"
                name="minIncrement"
                label="Min Increment (ETH, only for English)"
                disabled={formData.auctionType !== 2}
                value={formData.minIncrement}
                onChange={handleChange}
            />
        </Grid>
        <Grid size={4}>
            <FormControl fullWidth margin="normal">
                <InputLabel id="unit-increment-label">Unit</InputLabel>
                <Select
                labelId="unit-increment-label"
                id="unitIncrement"
                name="unitIncrement"
                label="Unit Increment"
                value={formData.unitIncrement}
                disabled={formData.auctionType !== 2}
                onChange={handleChange}
                >
                <MenuItem value="ETH">ETH</MenuItem>
                <MenuItem value="Finney">Finney</MenuItem>
                <MenuItem value="Gwei">Gwei</MenuItem>
                <MenuItem value="Wei">Wei</MenuItem>
                </Select>
            </FormControl>
        </Grid>
      </Grid>
      
      <Box mt={2}>
        <Button type="submit" variant="contained" fullWidth onClick={submit}>
          CONFIRM
        </Button>
      </Box>
    </Box>
  );
}