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
import GavelIcon from '@mui/icons-material/Gavel';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import AddRemoveAdminForm from '../forms/AddRemoveAdminForm';
import Loader from '../commons/Loader';
import { writeAddAdmin, writeRemoveAdmin } from '../../utils/bridges/MooveFactoryBridge';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const mooveOwner = import.meta.env.VITE_MOOVE_OWNER as string;

export default function NavbarActionsButton() {
    const isPhone = useMediaQuery('(max-width: 650px)');
    const { walletProvider } = useAppKitProvider('eip155');
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { disconnect } = useDisconnect();

    const appContext = useAppContext();
    const anchorRef = useRef<HTMLDivElement>(null);
    const MySwal = withReactContent(Swal);
    const isOwner = appContext.signerAddress === mooveOwner;

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
        if(walletProvider){ disconnect();}

        appContext.updateProvider(infuraProvider);
        appContext.updateSigner(emptySigner);
        appContext.updateSignerAddress("");
        appContext.updateBalance(0);
        appContext.updateChainId(0);
        appContext.updateRole(Role.NONE);
        appContext.updateSection(Sections.MARKETPLACE);
        
    }

    async function showAddRemoveAdminForm(){
      MySwal.fire({
        title: 'Manage admin',
        html: <AddRemoveAdminForm handleSubmit={addRemoveAdmin}/>,
        showConfirmButton: false,
        showCloseButton: true,
      });
    }

    async function addRemoveAdmin(removingAdmin: boolean, address: string){
      let success = false;
      setIsLoading(true);
      if(removingAdmin){
        success = await writeRemoveAdmin(address, appContext.signer);
      } else {
        success = await writeAddAdmin(address, appContext.signer);
      }
      setIsLoading(false);
      if(success){
        MySwal.fire({
          title: "Admin update sent",
          text: "The admin update request was successful! Reload the page after the transaction confirmation to see the changes.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
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

                                <MenuItem onClick={() => changeSection(Sections.MYNFTS)}>
                                    <Button  sx={{ pl:0, pb:0, color: '#f7a642ff'}} variant='text'>
                                        <BackpackIcon sx={{mr: 1}} fontSize='small'/>My NFTs
                                    </Button>
                                </MenuItem>

                                { appContext.role === Role.ADMIN && appContext.section !== Sections.FACTORY &&
                                    <MenuItem onClick={() => changeSection(Sections.FACTORY)}>
                                        <Button  sx={{ pl:0, pb:0, color: '#000'}} variant='text'>
                                            <FactoryIcon sx={{mr: 1}} fontSize='small'/> Factory
                                        </Button>
                                    </MenuItem>
                                }

                                { appContext.role === Role.ADMIN && appContext.section === Sections.FACTORY &&
                                    <MenuItem>
                                        <Button onClick={() => changeSection(Sections.MARKETPLACE)} sx={{ pl:0, pb:0, color: '#000'}} variant='text'>
                                            <MuseumIcon sx={{mr: 1}} fontSize='small'/> Marketplace
                                        </Button>
                                    </MenuItem>
                                }

                                { appContext.role === Role.ADMIN && isOwner &&
                                    <MenuItem>
                                        <Button onClick={showAddRemoveAdminForm} sx={{ pl:0, pb:0, color: '#000'}} variant='text'>
                                            <ManageAccountsIcon sx={{mr: 1}} fontSize='medium'/> Admins
                                        </Button>
                                    </MenuItem>
                                }

                                <MenuItem onClick={() => changeSection(Sections.AUCTIONS)}>
                                    <Button sx={{ pl:0, pb:0, color: '#000'}} variant='text'>
                                        <GavelIcon sx={{mr: 1}} fontSize='small'/>Auctions
                                    </Button>
                                </MenuItem>

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
        <Loader loading={isLoading} />
    </>
  );
}



