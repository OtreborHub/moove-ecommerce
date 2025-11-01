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
import { AuctionActionsButtonProps } from '../../utils/Interfaces';
import { emptySigner, useAppContext } from '../../Context';
import { AuctionStatus, AuctionType, getAuctionStatus } from '../../utils/enums/Auction';


const options = ['Place a Bid', 'Buy now', 'Withdraw', 'Finalize', 'Connect to access', 'No actions available'];

export default function AuctionActionsButton({ auction, handleBuyPlaceBid, handleFinalizeAuction, handleWithdrawFunds }: AuctionActionsButtonProps) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const appContext = useAppContext();
    const [menuWidth, setMenuWidth] = useState(0);

    useEffect(() => {
      if (anchorRef.current) {
          setMenuWidth(anchorRef.current.offsetWidth);
      }
      setSelectedIndex(defaultSelectedIndex());
    }, [anchorRef.current, open, appContext.signer]); 
    
    function defaultSelectedIndex() {
      const isSeller = auction.seller === appContext.signerAddress;
      const isDutch = auction.auctionType === AuctionType.DUTCH;

      if(appContext.signer === emptySigner){
          return 4; // Connect to access
      }

      switch (getAuctionStatus(auction)) {

        // 🟢 OPEN
        case AuctionStatus.OPEN:
          if (isSeller) {
            if (isDutch) {
              return 5; // No actions
            } else {
              return 3; // Finalize
            }
          } else {
            // Cliente
            if (isDutch) {
              return 1 ; // Buy now
            } else {
              return 0 ; // Place a bid
            }
          }

        // 🟡 WAITING_FOR_SELLER
        case AuctionStatus.WAITING_FOR_SELLER:
          if (isSeller) {
            if (isDutch) {
              return 5; // No actions
            } else {
              return 3; // Finalize
            }
          } else {
            // Cliente
            return 2; // Withdraw - Disabilitato
          }

        // 🔴 CLOSED
        case AuctionStatus.CLOSED:
          if (isSeller) {
            return 5; // No actions
          } else {
            return 2; // Withdraw
          }

        // Stato non riconosciuto
        default:
          return 5;
      }
    }

    const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex());
    
    //HANDLERS
    const handleClick = () => {
      if(selectedIndex === 0 || selectedIndex === 1){
          // se English o Classic, si apre il form, non serve settare il prezzo a cui stiamo comprando
          handleBuyPlaceBid(auction.tokenId, auction.auctionType === AuctionType.DUTCH ? auction.currentPrice : 0);
      } else if(selectedIndex === 2){
          handleWithdrawFunds(auction.tokenId);
      } else {
          handleFinalizeAuction(auction.tokenId);
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
          disabled={appContext.signer === emptySigner || selectedIndex === 5 }
      >
          
          <Button 
            onClick={handleClick} 
            sx={{ flexGrow: 1 }}>
              {appContext.signer !== emptySigner ? options[selectedIndex]: options[4]}
          </Button>

          {(appContext.signer !== emptySigner && selectedIndex < 4) && 
           <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}>
            <ArrowDropDownIcon/>
          </Button>}

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
        ]}>
          {({ TransitionProps, placement }) => (
            <Grow
            {...TransitionProps}>
                <Paper sx={{ width: menuWidth }}>
                    <ClickAwayListener onClickAway={handleClose}>
                        <MenuList>

                        <MenuItem 
                            disabled={auction.seller === appContext.signerAddress || auction.ended} 
                            onClick={(() => handleMenuItemClick(auction.auctionType === AuctionType.DUTCH ? 1 : 0))}> 
                                {auction.auctionType === AuctionType.DUTCH ? options[1]:options[0]}
                        </MenuItem>
                        
                        <MenuItem disabled={auction.seller === appContext.signerAddress || !auction.ended} onClick={(() => handleMenuItemClick(2))}> {options[2]} </MenuItem>
                        
                        {auction.seller === appContext.signerAddress && auction.auctionType !== AuctionType.DUTCH &&
                            <MenuItem 
                                disabled={auction.ended} 
                                sx={{ color: "red" }} 
                                onClick={(() => handleMenuItemClick(3))}>
                                    {options[3]}
                            </MenuItem>
                        }

                        </MenuList>
                    </ClickAwayListener>
                </Paper>
            </Grow>
        )}
      </Popper>
    </>
  );
}