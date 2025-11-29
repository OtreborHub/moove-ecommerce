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
import { TokenActionsButtonProps } from '../../utils/Interfaces';


const options = ['Update Price', 'Start Auction', 'Transfer'];

export default function TokenActionsButton({ token, auctionTokenId, handleCreateAuction, handleUpdatePrice, handleTransfer}: TokenActionsButtonProps) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    // const MySwal = withReactContent(Swa

    const [menuWidth, setMenuWidth] = useState(0);
    useEffect(() => {
    if (anchorRef.current) {
        setMenuWidth(anchorRef.current.offsetWidth);
    }
    }, [anchorRef.current, open]); 

    //HANDLERS
    const handleClick = () => {
        if(selectedIndex === 0){
            handleUpdatePrice(token.id, token.price);
        } else if(selectedIndex === 1){
            handleCreateAuction(token.id);
        } else {
            handleTransfer(token.id);
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
            sx={{ width: 'fit-content'}}
        >
            
            <Button onClick={handleClick} sx={{ flexGrow: 1 }}>{options[selectedIndex]}</Button>
            <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
            >
            <ArrowDropDownIcon/>
            </Button>
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
                            <MenuItem onClick={(() => handleMenuItemClick(0))}> {options[0]} </MenuItem>
                            <MenuItem disabled={auctionTokenId>0} onClick={(() => handleMenuItemClick(1))}> {options[1]} </MenuItem>
                            <MenuItem disabled={auctionTokenId>0} onClick={(() => handleMenuItemClick(2))}> {options[2]} </MenuItem>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    </>
  );
}