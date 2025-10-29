import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FactoryIcon from '@mui/icons-material/Factory';
import LogoutIcon from '@mui/icons-material/Logout';
import MuseumIcon from '@mui/icons-material/Museum';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { useAppKitProvider, useDisconnect } from '@reown/appkit/react';
import { useRef, useState } from 'react';
import { useAppContext } from '../../Context';
import { infuraProvider } from '../../utils/bridges/MooveCollectionsBridge';
import CollectionDTO from '../../utils/DTO/CollectionDTO';
import { Role } from '../../utils/enums/Role';
import { Sections } from '../../utils/enums/Sections';
import { formatAddress } from '../../utils/formatValue';

export default function NavbarActionsButton() {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const appContext = useAppContext();
    const { walletProvider }: any = useAppKitProvider('eip155');
    const { disconnect } = useDisconnect();

    //ACTIONS
    function changeSection() {
        setOpen(false);
        appContext.updateShownCollection(CollectionDTO.emptyInstance());
        appContext.updateShownNFT(0);
        appContext.section === Sections.FACTORY ? 
            appContext.updateSection(Sections.MARKETPLACE) : 
            appContext.updateSection(Sections.FACTORY);
    }

    // async function disconnect() {
    //     appContext.updateSigner("");
    //     appContext.updateBalance(0);
    // }
    
    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }
        setOpen(false);
    };

    const handleDisconnect = () => {
        if(walletProvider){
            disconnect();
        }

        appContext.updateProvider(infuraProvider);
        appContext.updateSigner("");
        appContext.updateBalance(0);
        appContext.updateChainId(0);
        appContext.updateRole(Role.NONE);
        appContext.updateSection(Sections.MARKETPLACE);
        
    }

  return (
    <>
        <ButtonGroup
            variant="outlined"
            ref={anchorRef}
            aria-label="Button group with a nested menu"
        >
            
            {/* <Button onClick={handleClick}>{options[selectedIndex]}</Button> */}
            <Button
            size="large"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            sx={{ borderColor:'#f7a642ff', color:"#f7a642ff"}}
            onClick={handleToggle}
            > Profile
            <AccountCircleIcon sx={{ml:1}}/>
            </Button>
        </ButtonGroup>
        <Popper
            sx={{ zIndex: 2}}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
            placement="bottom"
            modifiers={[
                 {name: "offset", options: { offset: [0, 8] }}
            ]}
            >
            {({ TransitionProps, placement }) => (
                <Grow
                {...TransitionProps} style={{ transformOrigin: "center" }}>
                    <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList>
                            <Box border={"1px solid #000"} ml={1} mr={1}>
                                <MenuItem sx={{ pb: 0, cursor: 'default'}}> Address {formatAddress(appContext.signer)} </MenuItem>
                                <MenuItem sx={{  cursor: 'default'}}> {appContext.balance.toFixed(4).toString()} ETH </MenuItem>
                             </Box>
                            {/* <hr style={{ marginLeft: "10px", marginRight: "10px"}}/> */}
                            { appContext.role === Role.ADMIN && 
                                <MenuItem>
                                    <Button onClick={changeSection} sx={{ pl:0, pb:0, color: '#f7a642ff'}} variant='text'>
                                        {appContext.section === Sections.MARKETPLACE ? <FactoryIcon sx={{mr: 1}} fontSize='small'/> : <MuseumIcon sx={{mr: 1}} fontSize='small'/>}
                                        {appContext.section === Sections.MARKETPLACE ? "Visit Factory" : "Visit Marketplace"} 
                                    </Button>
                                </MenuItem>
                            }

                            {/* Logout */}
                            <MenuItem>
                                <Button onClick={handleDisconnect} sx={{ pl:0, color: 'red'}} variant='text'><LogoutIcon sx={{mr: 1}} fontSize='small'/> Logout </Button>
                            </MenuItem>
                            
                            
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    </>
  );
}



