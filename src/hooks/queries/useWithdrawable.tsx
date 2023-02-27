import { useQuery } from '@tanstack/react-query'
import type { Contract } from 'ethers'

interface IUseWithdrawableProps {
  contract: Contract
  payer: string
  payee: string
  amountPerSec: string
  streamId: string
}

interface IGetWithdrawable {
  contract: Contract
  payer: string
  payee: string
  amountPerSec: string
}

async function getWithdrawableData({ contract, payer, payee, amountPerSec }: IGetWithdrawable) {
  try {
    console.log('[getWithdrawableData] payer, payee, amountPerSec', payer, payee, amountPerSec, contract)
    const call = await contract.withdrawable(payer, payee, amountPerSec)
    console.log('[getWithdrawableData] res', call)

    return {
      withdrawableAmount: call.withdrawableAmount,
      lastUpdate: call.lastUpdate,
      owed: call.owed,
    }
  } catch (error) {
    console.error('[getWithdrawableData] error', error)
    return null
  }
}

function useWithdrawable({ contract, payer, payee, amountPerSec, streamId }: IUseWithdrawableProps) {
  return useQuery(['withdrawable', streamId], () => getWithdrawableData({ contract, payer, payee, amountPerSec }), {
    refetchInterval: 30000,
  })
}

export default useWithdrawable
