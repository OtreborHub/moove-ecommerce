import type { AppKitNetwork } from '@reown/appkit/networks'
import type { CustomCaipNetwork } from '@reown/appkit-common'
import { UniversalConnector } from '@reown/appkit-universal-connector'

// Get projectId from https://dashboard.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID as string;

const SEPOLIA_CHAIN_ID = 11155111;

export const sepoliaTestnet: CustomCaipNetwork<'sui'> = {
  id: SEPOLIA_CHAIN_ID,
  chainNamespace: 'eip155' as const,
  caipNetworkId: `eip155:${SEPOLIA_CHAIN_ID}`,
  name: 'Sepolia Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`
      ]
    }
  }
}

export const networks = [sepoliaTestnet] as [AppKitNetwork, ...AppKitNetwork[]]

export async function getUniversalConnector() {
  const universalConnector = await UniversalConnector.init({
    projectId,
    metadata: {
      name: 'Universal Connector',
      description: 'Universal Connector',
      url: window.location.origin,
      icons: ['https://appkit.reown.com/icon.png']
    },
    networks: [
      {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData'
        ],
        chains: [sepoliaTestnet as CustomCaipNetwork<'eip155'>],
        events: ['chainChanged', 'accountsChanged'],
        namespace: 'eip155'
      }
    ]
  })

  return universalConnector
}