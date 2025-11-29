import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import { Box } from '@mui/material';
import { useState } from 'react';

export default function CopyToClipboard({text}: {text: string}) {
  const [copied, setCopied] = useState<boolean>(false); 

    function handleCopy() {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 4000);
    }   
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.3s ease-in-out',
            }}
        >
            <ContentCopyIcon 
                sx={{ 
                    cursor: 'pointer', 
                    ml: 1,
                    fontSize: 'small',
                    opacity: copied ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                    position: copied ? 'absolute' : 'relative',
                    pointerEvents: copied ? 'none' : 'auto'
                }}
                onClick={handleCopy} 
            />
            <DoneIcon 
                sx={{ 
                    color: 'orange', 
                    ml: 1,
                    fontSize: 'small',
                    opacity: copied ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    position: copied ? 'relative' : 'absolute',
                    pointerEvents: copied ? 'auto' : 'none'
                }}
            />
        </Box>
    );
}