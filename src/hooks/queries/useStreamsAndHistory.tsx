import type { IStream } from '@/components/safe-apps/types'
import { llamaContractABI } from '@/lamapay/lib/llamaContract'
import { networkDetails } from '@/utils/networkDetails'
import type { ethers } from 'ethers'
import { Contract } from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import * as React from 'react'
import type { StreamAndHistoryQuery } from 'services/generated/graphql'
import { useStreamAndHistoryQuery } from 'services/generated/graphql'
import useChainId from '../useChainId'
import { useCurrentChain } from '../useChains'
import { useWeb3ReadOnly } from '../wallets/web3'

export const defaultSubgraphEndpoint = 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-avax-mainnet'

const useStreamsAndHistory = (address: string) => {
  const chainId = useChainId()
  const chain = useCurrentChain()
  const provider = useWeb3ReadOnly()
  const endpoint = chainId ? networkDetails[Number(chainId)]?.subgraphEndpoint : defaultSubgraphEndpoint
  const { data, isLoading, error } = useStreamAndHistoryQuery(
    {
      endpoint,
    },
    {
      id: address.toLowerCase(),
      network: chain?.chainName || '',
    },
    {
      refetchInterval: 30000,
    },
  )

  const formattedData = useFormatStreamAndHistory({ data, address, provider })

  return React.useMemo(() => ({ data: formattedData, isLoading, error }), [formattedData, isLoading, error])
}

function useFormatStreamAndHistory({
  data,
  address,
  provider,
}: {
  data?: StreamAndHistoryQuery
  address: string
  provider?: ethers.providers.JsonRpcProvider
}): IStream[] {
  return React.useMemo(() => {
    if (provider) {
      const streams = data?.user?.streams ?? []

      const formattedStreams = streams.map((s) => formatStream({ stream: s, address, provider }))

      return formattedStreams
    } else return []
  }, [data, address, provider])
}

export const formatStream = ({
  stream,
  address,
  provider,
}: {
  stream: any
  address: string
  provider: ethers.providers.JsonRpcProvider
}): IStream => {
  const streamType: 'outgoingStream' | 'incomingStream' =
    stream.payer.id?.toLowerCase() === address.toLowerCase() ? 'outgoingStream' : 'incomingStream'

  return {
    llamaContractAddress: stream.contract.address,
    llamaTokenContract: new Contract(getAddress(stream.contract.address), llamaContractABI, provider),
    amountPerSec: stream.amountPerSec,
    createdTimestamp: stream.createdTimestamp,
    payerAddress: stream.payer.id,
    payeeAddress: stream.payee.id,
    streamId: stream.streamId,
    streamType,
    token: stream.token,
    tokenName: stream.token.name,
    tokenSymbol: stream.token.symbol,
    historicalEvents: stream.historicalEvents,
    paused: stream.paused,
    pausedAmount: stream.pausedAmount,
    lastPaused: stream.lastPaused,
    reason: stream.reason || null,
  }
}

export default useStreamsAndHistory
