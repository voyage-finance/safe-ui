import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import type { Contract } from 'ethers'

export enum PermissionStatus {
  GRANTED = 'granted',
  PROMPT = 'prompt',
  DENIED = 'denied',
}

const FEATURES = [
  'accelerometer',
  'ambient-light-sensor',
  'autoplay',
  'battery',
  'camera',
  'cross-origin-isolated',
  'display-capture',
  'document-domain',
  'encrypted-media',
  'execution-while-not-rendered',
  'execution-while-out-of-viewport',
  'fullscreen',
  'geolocation',
  'gyroscope',
  'keyboard-map',
  'magnetometer',
  'microphone',
  'midi',
  'navigation-override',
  'payment',
  'picture-in-picture',
  'publickey-credentials-get',
  'screen-wake-lock',
  'sync-xhr',
  'usb',
  'web-share',
  'xr-spatial-tracking',
  'clipboard-read',
  'clipboard-write',
  'gamepad',
  'speaker-selection',
]

export type AllowedFeatures = typeof FEATURES[number]

export const isBrowserFeature = (featureKey: string): featureKey is AllowedFeatures => {
  return FEATURES.includes(featureKey as AllowedFeatures)
}

export type AllowedFeatureSelection = { feature: AllowedFeatures; checked: boolean }

export type SafeAppDataWithPermissions = SafeAppData & { safeAppsPermissions: AllowedFeatures[] }

export interface IStream {
  llamaContractAddress: string
  llamaTokenContract: Contract
  amountPerSec: string
  createdTimestamp: string
  payerAddress: string
  payeeAddress: string
  streamId: string
  streamType: 'outgoingStream' | 'incomingStream'
  token: { address: string; name: string; decimals: number; symbol: string }
  tokenName: string
  tokenSymbol: string
  historicalEvents: { eventType: string; txHash: string; createdTimestamp: string }[]
  paused: boolean
  pausedAmount: string
  lastPaused: string
  reason: string | null | undefined
}

export interface ITokenList {
  [key: string]: {
    chainId: number
    name: string
    symbol: string
    decimals: number
    logoURI: string
  }
}

export interface ITokenLists extends IToken {
  logoURI: string
  isVerified: boolean
  balance?: string
}

export interface IToken {
  tokenAddress: string
  llamaContractAddress: string
  name: string
  symbol: string
  decimals: number
  balance?: string
}
