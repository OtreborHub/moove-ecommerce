import { ButtonGroup, useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { useAppKit } from '@reown/appkit/react';
import { emptySigner, useAppContext } from '../../Context';
import factory_subtitle from '../../assets/factory_subtitle.svg';
import marketplace_subtitle from '../../assets/marketplace_subtitle.svg';
import metamask_logo from '../../assets/metamask.svg';
import walletconnect_logo from '../../assets/wallet-connect.svg';
import moove_logo from '../../assets/moove_logo.svg';
import { NavbarProps } from '../../utils/Interfaces';
import { Sections } from '../../utils/enums/Sections';
import NavbarActionsButton from '../actionsButton/NavbarActionsButton';

export default function Navbar({connectMetamask}: NavbarProps) {
  const isPhone = useMediaQuery('(max-width: 650px)');
  const appContext = useAppContext();
  const { open } = useAppKit();
  
  return (
    <Box sx={{ flexGrow: 1, borderBottom: "2px solid" }}>
      <AppBar position="static" style={{ backgroundColor: '#26547C'}}>
        <Toolbar>
          
          <img src={moove_logo} alt="Noove" style={{ maxHeight: '65px', marginTop: "1rem", marginLeft: "1.5rem", marginBottom:"1rem", marginRight: '0rem'}} />
          {!isPhone && appContext.section === Sections.FACTORY && 
          <img src={factory_subtitle} alt="Factory" style={{ maxHeight: '26px', marginRight: '10px', marginTop: '2.2rem'}} />}
          {!isPhone && appContext.section !== Sections.FACTORY &&
          <img src={marketplace_subtitle} alt="Marketplace" style={{ maxHeight: '35px', marginRight: '10px', marginTop: '2.5rem' }} />}
          
          {appContext.signer !== emptySigner &&
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', marginRight: '1rem'}}>
                <NavbarActionsButton/>
              </Box>
          }
          {appContext.signer === emptySigner && 
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto', marginRight: '1rem'}}>
              {!isPhone && <ButtonGroup>
                  <Button key="word" variant="contained" size="large" sx={{ fontSize: "1  rem", color:'#f7a642ff', backgroundColor: 'whitesmoke', borderRadius: '10px',  paddingRight:'.5rem'}}>
                    <b>Connect</b>
                  </Button> 
                   
                  <Button key="meta" variant="contained" onClick={connectMetamask} size="medium" sx={{ color:'#f7a642ff', backgroundColor: 'whitesmoke'}}>
                    <img height="24" alt="meta" src={metamask_logo}></img>
                  </Button> 
                
                <Button key="wc" variant="contained" onClick={() => open()} size="medium" sx={{ color:'#f7a642ff', backgroundColor: 'whitesmoke', borderRadius:'10px'}}>
                  <img height="24" alt="wc" src={walletconnect_logo}></img>
                </Button> 
              </ButtonGroup>
              }
              {isPhone &&
                <Button key="wc" variant="contained" onClick={() => open()} size="medium" sx={{ color:'#f7a642ff', backgroundColor: 'whitesmoke', borderRadius:'10px'}}>
                  <img height="24" alt="wc" src={walletconnect_logo}></img>
                </Button>
              }
            </Box>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}