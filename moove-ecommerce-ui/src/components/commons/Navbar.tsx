import { ButtonGroup, useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { useAppKit } from '@reown/appkit/react';
import { useAppContext } from '../../Context';
import logo2 from '../../assets/factory.png';
import logo3 from '../../assets/markeplace.png';
import metamask_logo from '../../assets/metamask.svg';
import logoCutted from '../../assets/mooveCutted.png';
import walletconnect_logo from '../../assets/wallet-connect.svg';
import { NavbarProps } from '../../utils/Interfaces';
import { Sections } from '../../utils/enums/Sections';
import NavbarActionsButton from '../actionsButton/NavbarActionsButton';

export default function Navbar({connect}: NavbarProps) {
  const isPhone = useMediaQuery('(max-width: 650px)');
  const appContext = useAppContext();

  const { open } = useAppKit();
  
  return (
    <Box sx={{ flexGrow: 1, borderBottom: "2px solid" }}>
      <AppBar position="static" style={{ backgroundColor: '#26547C'}}>
        <Toolbar>
          
          <img src={logoCutted} alt="Noove" style={{ maxHeight: '70px', marginRight: '0px', marginBottom: "1rem", marginTop: "1rem" }} />
          {!isPhone && appContext.section === Sections.FACTORY && 
          <img src={logo2} alt="Factory" style={{ maxHeight: '50px', marginRight: '10px', marginTop: '.2rem'}} />}
          {!isPhone && appContext.section === Sections.MARKETPLACE &&
          <img src={logo3} alt="Marketplace" style={{ maxHeight: '50px', marginRight: '10px', marginTop: '.2rem' }} />}
          
          {appContext.signer &&
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', marginRight: '1rem'}}>
                <NavbarActionsButton/>
              </Box>
          }
          {!appContext.signer && 
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', marginRight: '1rem'}}>
              <ButtonGroup>
                {!isPhone && <Button key="word" variant="contained" size="medium" sx={{ color:'#f7a642ff', backgroundColor: 'whitesmoke', borderRadius:'10px'}}>
                  <b>{"Connect"}</b>
                  {/* Connect <AccountBalanceWalletIcon sx={{ ml:1}}/> */}
                </Button> 
                }
                <Button key="wc" variant="contained" onClick={() => open()} size="medium" sx={{ color:'#f7a642ff', backgroundColor: 'whitesmoke', borderRadius:'10px'}}>
                  <img height="24" alt="wc" src={walletconnect_logo}></img>
                  {/* Connect <AccountBalanceWalletIcon sx={{ ml:1}}/> */}
                </Button> 
                <Button key="meta" variant="contained" onClick={connect} size="medium" sx={{ color:'#f7a642ff', backgroundColor: 'whitesmoke', borderRadius:'10px'}}>
                  <img height="24" alt="meta" src={metamask_logo}></img>
                  {/* Connect <AccountBalanceWalletIcon sx={{ ml:1}}/> */}
                </Button>  
              </ButtonGroup>
              {/* <Button variant="contained" onClick={() => open()} size="large" sx={{ color:'#f7a642ff', backgroundColor: 'whitesmoke', borderRadius:'10px'}}>
                <b>{"Connect"}</b> <img alt="meta" style={{ marginLeft: ".5rem"}} src={metamask_logo}></img>
              </Button> */}
            </Box>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}