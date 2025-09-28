import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useAppContext } from '../../Context';
import MintTokenForm from '../forms/MintTokenForm';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { FactoryActionsButtonProps} from '../../utils/Interfaces';
import DisableCollectionForm from '../forms/DisableCollectionForm';
import { useEffect, useRef, useState } from 'react';


const options = ['View', 'Mint', 'Disable'];

export default function FactoryActionsButton({ collection, handleMint, handleDisable}: FactoryActionsButtonProps) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const MySwal = withReactContent(Swal);
    const appContext = useAppContext();

    const [menuWidth, setMenuWidth] = useState(0);
    useEffect(() => {
    if (anchorRef.current) {
        setMenuWidth(anchorRef.current.offsetWidth);
    }
    }, [anchorRef.current, open]); 

    //ACTIONS
    function viewCollection() {
        appContext.updateShownCollection(collection);
    }
    
    function showMintTokenForm(){
        MySwal.fire({
            title: "Mint token",
            html: <MintTokenForm collectionAddress={collection.address} signer={appContext.signer} handleSubmit={handleMint}/>,
            showConfirmButton: false,
            showCloseButton: true,
        });
    }

    const disableCollection = () => {
        MySwal.fire({
            title: "Disable collection",
            html: <DisableCollectionForm collectionName={collection.name} handleSubmit={handleDisable}/>,
            showConfirmButton: false,
            showCloseButton: true,
        });   
    };

    //HANDLERS
    const handleClick = () => {
        // console.info(`You clicked ${options[selectedIndex]}`);
        if(selectedIndex === 0){
            viewCollection();
        } else if(selectedIndex === 1){
            showMintTokenForm();
        } else {
            disableCollection();
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
            sx={{borderColor: selectedIndex === 2 ? 'error': 'primary', minWidth: 150, width: 'fit-content'}}
            color={selectedIndex === 2 ? 'error': 'primary'} 
        >
            
            <Button onClick={handleClick} sx={{ flexGrow: 1 }}>{options[selectedIndex]}</Button>
            <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
            color={selectedIndex === 2 ? 'error': 'primary'}
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
                            <MenuItem onClick={(() => handleMenuItemClick(0))}> View </MenuItem>
                            <MenuItem onClick={(() => handleMenuItemClick(1))}> Mint </MenuItem>
                            <MenuItem onClick={(() => handleMenuItemClick(2))} sx={{ color: "red" }}> Disable </MenuItem>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    </>
  );
}