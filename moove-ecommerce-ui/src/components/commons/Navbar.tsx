import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../../Context';
import logo from '../../assets/moove.png';
import logo2 from '../../assets/factory.png';
import logo3 from '../../assets/markeplace.png';
import { NavbarProps } from '../../utils/Interfaces';
import { Sections } from '../../utils/enums/Sections';
import { Role } from '../../utils/enums/Role';
import Button from '@mui/material/Button';
import CollectionDTO from '../../utils/DTO/CollectionDTO';
import { formatAddress } from '../../utils/formatValue';

export default function Navbar({ connect: connectWallet }: NavbarProps) {
  const appContext = useAppContext();

  const changeSection = () => {
    appContext.updateShownCollection(CollectionDTO.emptyInstance());
    appContext.section === Sections.FACTORY ? 
      appContext.updateSection(Sections.MARKETPLACE) : 
      appContext.updateSection(Sections.FACTORY);
  }

  return (
    <Box sx={{ flexGrow: 1, borderBottom: "2px solid" }}>
      <AppBar position="static" style={{ backgroundColor: '#26547C'}}>
        <Toolbar>
          
          <img src={logo} alt="Noove" style={{ maxHeight: '100px', marginRight: '0px' }} />
          {appContext.section === Sections.FACTORY && 
          <img src={logo2} alt="Factory" style={{ maxHeight: '40px', marginRight: '10px' }} />}
          {appContext.section === Sections.MARKETPLACE &&
          <img src={logo3} alt="Marketplace" style={{ maxHeight: '40px', marginRight: '10px' }} />}
          
          {appContext.signer &&
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto' }}>
                <Typography variant="body1" mr="0.2rem" component="div" sx={{ flexGrow: 1 }}>
                  Address {formatAddress(appContext.signer)}
                </Typography>
                
                { appContext.role === Role.ADMIN &&
                  <Button variant="contained" onClick={changeSection} sx={{ mt: 1, borderRadius:'10px', backgroundColor:'#f7a642ff'}}>
                    {appContext.section === Sections.FACTORY ? "Go to Marketplace" : "Go to Factory"}
                  </Button>
                }
              </Box>
          }
          {!appContext.signer && 
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'auto' }}>
              <Button variant="contained" onClick={connectWallet} sx={{ width: '100%', backgroundColor:'#f7a642ff', borderRadius:'10px', margin: '1rem'}}>
                Connetti a MetaMask
              </Button>
            </Box>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}