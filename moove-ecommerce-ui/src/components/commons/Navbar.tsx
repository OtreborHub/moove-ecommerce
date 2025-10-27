import { useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { useAppContext } from '../../Context';
import logo2 from '../../assets/factory.png';
import logo3 from '../../assets/markeplace.png';
import metamask_logo from '../../assets/metamask.svg';
import logoCutted from '../../assets/mooveCutted.png';
import { NavbarProps } from '../../utils/Interfaces';
import { Sections } from '../../utils/enums/Sections';
import NavbarActionsButton from '../actionsButton/NavbarActionsButton';
import { useAppKitAccount } from '@reown/appkit/react'

export default function Navbar({ connect: connect, disconnect: disconnect }: NavbarProps) {
  const isPhone = useMediaQuery('(max-width: 650px)');
  // const isMobile = useMediaQuery('(max-width: 1400px)');
  const appContext = useAppContext();
  const { isConnected } = useAppKitAccount();

  return (
    <Box sx={{ flexGrow: 1, borderBottom: "2px solid" }}>
      <AppBar position="static" style={{ backgroundColor: '#26547C'}}>
        <Toolbar>
          
          <img src={logoCutted} alt="Noove" style={{ maxHeight: '70px', marginRight: '0px', marginBottom: "1rem", marginTop: "1rem" }} />
          {!isPhone && appContext.section === Sections.FACTORY && 
          <img src={logo2} alt="Factory" style={{ maxHeight: '50px', marginRight: '10px', marginTop: '.2rem'}} />}
          {!isPhone && appContext.section === Sections.MARKETPLACE &&
          <img src={logo3} alt="Marketplace" style={{ maxHeight: '50px', marginRight: '10px', marginTop: '.2rem' }} />}
          
          {/* {appContext.signer &&
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', marginRight: '2rem'}}>
                <NavbarActionsButton disconnect={disconnect}/>
              </Box>
          } */}
          {/* {!appContext.signer &&  */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', marginRight: '2rem'}}>
              <Button variant="contained" onClick={() => connect()} size="large" sx={{ color:'#f7a642ff', backgroundColor: 'whitesmoke', borderRadius:'10px'}}>
                <b>{appContext.signer ? "Profile" : "Connect"}</b> <img alt="meta" style={{ marginLeft: ".5rem"}} src={metamask_logo}></img>
                {/* Connect <AccountBalanceWalletIcon sx={{ ml:1}}/> */}
              </Button>
            </Box>
          {/* } */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}