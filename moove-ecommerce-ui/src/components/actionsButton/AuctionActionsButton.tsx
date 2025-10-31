import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { useEffect, useRef, useState } from 'react';
import { AuctionActionsButtonProps, TokenActionsButtonProps } from '../../utils/Interfaces';
import { emptySigner, useAppContext } from '../../Context';
import { AuctionType } from '../../utils/enums/Auction';
import { retrieveBid, writeBuyDutch, writeEndClassicAuction, writeEndEnglishAuction, writePlaceBidClassic, writePlaceBidEnglish } from '../../utils/bridges/MooveCollectionsBridge';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';


const options = ['Place a Bid', 'Buy now', 'Withdraw', 'Finalize', 'Connect to access'];

export default function AuctionActionsButton({ auction }: AuctionActionsButtonProps) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const appContext = useAppContext();
    const MySwal = withReactContent(Swal);
    const [menuWidth, setMenuWidth] = useState(0);
    const [formData, setFormData] = useState({
      bid: auction.auctionType === AuctionType.ENGLISH ? auction.currentPrice + auction.minIncrement: 0,
      unit: 'Wei'
    });

    useEffect(() => {
      if (anchorRef.current) {
          setMenuWidth(anchorRef.current.offsetWidth);
      }
    }, [anchorRef.current, open]); 
    
    async function buyPlaceBid(){
        if(appContext.signer !== emptySigner){
            let success = false;
            if(auction.auctionType === AuctionType.DUTCH){
                success = await writeBuyDutch(auction.collection.address, auction.tokenId, auction.currentPrice, appContext.signer);
            } if(auction.auctionType === AuctionType.CLASSIC){
                success = await writePlaceBidClassic(auction.collection.address, auction.tokenId, formData.bid, appContext.signer);
            } else if (auction.auctionType === AuctionType.ENGLISH){

                if(formData.bid > auction.currentPrice + auction.minIncrement){
                    success = await writePlaceBidEnglish(auction.collection.address, auction.tokenId, formData.bid, appContext.signer);    
                } else {
                    MySwal.fire({
                        title: "Check you bid",
                        text: "It should be at least the current price added to minimun increment.",
                        icon: "warning",
                        confirmButtonColor: "#3085d6",
                    });
                }
            }
            
            if(success){
            MySwal.fire({
                title: auction.auctionType === AuctionType.DUTCH ? "Buy Dutch" : "Bid Place",
                text: auction.auctionType === AuctionType.DUTCH ? "The buy request was successful!": "The bid place request was successfull!",
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
            }
        }
    }

    async function withdraw(){
        const success = await retrieveBid(auction.collection.address, auction.tokenId, appContext.signer);
        if(success){
            MySwal.fire({
                title: "Withdraw",
                text: "The withdraw request was successful!",
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
        }
    }

    async function endAuction(){
        let success = false;
        if(auction.auctionType === AuctionType.CLASSIC){
            success = await writeEndClassicAuction(auction.collection.address, auction.tokenId, appContext.signer);
        } else if (auction.auctionType === AuctionType.ENGLISH){
            success = await writeEndEnglishAuction(auction.collection.address, auction.tokenId, appContext.signer);
        }
        if(success){
            MySwal.fire({
                title: "Finalize Auction",
                text: "The close auction request was successful!",
                icon: "success",
                confirmButtonColor: "#3085d6",
            });
        }
    }
    
    //HANDLERS
    const handleClick = () => {
        if(selectedIndex === 0){
            buyPlaceBid();
        } else if(selectedIndex === 1){
            withdraw();
        } else {
            endAuction();
        }
    };

    const handleMenuItemClick = (index: number,) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }

        setOpen(false);
    };

  return (
    <>
        <ButtonGroup 
            variant="contained"
            ref={anchorRef}
            aria-label="Button group"
            sx={{ width: 'fit-content', borderColor: selectedIndex === 3 ? 'error': 'primary'}}
            color={selectedIndex === 3 ? 'error': 'primary'}
        >
            
            <Button 
              onClick={handleClick} 
              disabled={appContext.signer === emptySigner}
              sx={{ flexGrow: 1 }}>
                {appContext.signer !== emptySigner ? options[selectedIndex]: options[4]}
            </Button>
            
            {appContext.signer !== emptySigner && <Button
              size="small"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              disabled={appContext.signer === emptySigner}
              onClick={handleToggle}>
              <ArrowDropDownIcon/>
            </Button>
            }
        </ButtonGroup>
        <Popper
            sx={{ zIndex: 1 }}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            placement="bottom"
            disablePortal
            modifiers={[
                { name: "flip", enabled: false }
            ]}
        >
            {({ TransitionProps, placement }) => (
                <Grow
                {...TransitionProps}>
                    <Paper sx={{ width: menuWidth }}>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList>
                            <MenuItem onClick={(() => handleMenuItemClick(auction.auctionType === AuctionType.DUTCH ? 1 : 0))}> {auction.auctionType === AuctionType.DUTCH ? options[1]:options[0]} </MenuItem>
                            <MenuItem disabled={auction.ended} onClick={(() => handleMenuItemClick(2))}> {options[2]} </MenuItem>
                            <MenuItem sx={{ color: "red" }} onClick={(() => handleMenuItemClick(3))}> {options[3]} </MenuItem>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    </>
  );
}