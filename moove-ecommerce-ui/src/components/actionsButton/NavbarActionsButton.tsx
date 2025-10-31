import FactoryIcon from '@mui/icons-material/Factory';
import LogoutIcon from '@mui/icons-material/Logout';
import MuseumIcon from '@mui/icons-material/Museum';
import BackpackIcon from '@mui/icons-material/Backpack';
import { Box, useMediaQuery } from '@mui/material';
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
import { emptySigner, useAppContext } from '../../Context';
import { infuraProvider } from '../../utils/bridges/MooveCollectionsBridge';
import { Role } from '../../utils/enums/Role';
import { Sections } from '../../utils/enums/Sections';
import { formatAddress } from '../../utils/formatValue';
import metamask_logo from '../../assets/metamask.svg';
import walletconnect_logo from '../../assets/wallet-connect.svg';

export default function NavbarActionsButton() {
    const isPhone = useMediaQuery('(max-width: 650px)');
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const appContext = useAppContext();
    const { walletProvider } = useAppKitProvider('eip155');
    const { disconnect } = useDisconnect();

    //ACTIONS
    function changeSection(section: Sections) {
        setOpen(false);
        appContext.updateSection(section);
    }
    
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
        appContext.updateSigner(emptySigner);
        appContext.updateSignerAddress("");
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
            
            <Button
                size="large"
                aria-controls={open ? 'split-button-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="select merge strategy"
                aria-haspopup="menu"
                sx={{ borderColor: walletProvider ? 'whitesmoke' : '#f7a642ff', color: walletProvider ? 'whitesmoke':'#f7a642ff'}}
                onClick={handleToggle}
            >{isPhone? "" : "Profile"}
            <img height="24" style={{ marginLeft: isPhone?  "":"1rem"}} src={walletProvider ? walletconnect_logo : metamask_logo}></img>
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
                                    <MenuItem sx={{ pb: 0, cursor: 'default'}}> Address {formatAddress(appContext.signerAddress)} </MenuItem>
                                    <MenuItem sx={{  cursor: 'default'}}> {appContext.balance.toFixed(4).toString()} ETH </MenuItem>
                                </Box>
                                {/* <hr style={{ marginLeft: "10px", marginRight: "10px"}}/> */}

                                <MenuItem>
                                    <Button onClick={() => changeSection(Sections.MYNFTS)} sx={{ pl:0, pb:0 }} variant='text'>
                                        <BackpackIcon sx={{mr: 1}} fontSize='small'/>My NFTs
                                    </Button>
                                </MenuItem>

                                { appContext.role === Role.ADMIN && appContext.section !== Sections.FACTORY &&
                                    <MenuItem>
                                        <Button onClick={() => changeSection(Sections.FACTORY)} sx={{ pl:0, pb:0, color: '#f7a642ff'}} variant='text'>
                                            <FactoryIcon sx={{mr: 1}} fontSize='small'/> Visit Factory
                                        </Button>
                                    </MenuItem>
                                }

                                { appContext.role === Role.ADMIN && appContext.section === Sections.FACTORY &&
                                    <MenuItem>
                                        <Button onClick={() => changeSection(Sections.MARKETPLACE)} sx={{ pl:0, pb:0, color: '#f7a642ff'}} variant='text'>
                                            <MuseumIcon sx={{mr: 1}} fontSize='small'/> Visit Marketplace
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



