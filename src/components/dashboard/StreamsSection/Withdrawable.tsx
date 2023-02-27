import * as React from 'react'
import useWithdrawable from '@/hooks/queries/useWithdrawable'
import type { IStream } from '@/components/safe-apps/types'
import { Box, Tooltip, Typography } from '@mui/material'
import { Error, Warning } from '@mui/icons-material'
import { formatAmount } from '@/utils/formatNumber'

export const Withdrawable = ({ data }: { data: IStream }) => {
  const { data: callResult, isLoading } = useWithdrawable({
    contract: data.llamaTokenContract,
    payer: data.payerAddress,
    payee: data.payeeAddress,
    amountPerSec: data.amountPerSec,
    streamId: data.streamId,
  })

  const [balanceState, setBalanceState] = React.useState<number | null>(null)

  React.useEffect(() => {
    const id = setInterval(() => {
      setBalanceState(
        withdrawableAmtFormatter({
          amountPerSec: data.amountPerSec,
          decimals: data.token.decimals,
          withdrawableAmount: callResult?.withdrawableAmount,
          owed: callResult?.owed,
          lastUpdate: callResult?.lastUpdate,
        }),
      )
    }, 1)

    // clear interval when component unmounts
    return () => clearInterval(id)
  }, [callResult, data])

  if (callResult?.owed > 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle2">{balanceState && `${formatAmount(balanceState, 5)}`}</Typography>

        <Tooltip title={'out of funds'}>
          <Error sx={{ width: 16, height: 16, ml: 0.5 }} />
        </Tooltip>
      </Box>
    )
  }

  if (isLoading) {
    return <div className="animate-shimmer h-4 w-full bg-gray-400"></div>
  }

  if (data.paused) {
    return (
      <p className="flex space-x-1">
        {balanceState ? (
          <>
            <span className="slashed-zero tabular-nums">{`${formatAmount(balanceState, 5)}`}</span>
            <Tooltip title={'paused'}>
              <Warning sx={{ width: 16, height: 16, ml: 0.5 }} />
            </Tooltip>
          </>
        ) : (
          <>
            <span className="slashed-zero tabular-nums text-yellow-600">paused</span>
            <Warning sx={{ width: 16, height: 16, ml: 0.5 }} />
          </>
        )}
      </p>
    )
  }

  return (
    <p className="flex justify-start slashed-zero tabular-nums dark:text-white">
      {balanceState && formatAmount(balanceState, 5)}
    </p>
  )
}

interface IWithdrawableAmtFormatter {
  amountPerSec: string
  decimals: number
  withdrawableAmount?: number
  owed: number
  lastUpdate?: number
}

function withdrawableAmtFormatter({
  amountPerSec,
  decimals,
  withdrawableAmount,
  owed,
  lastUpdate,
}: IWithdrawableAmtFormatter) {
  if (withdrawableAmount === undefined || lastUpdate === undefined) {
    return null
  } else if (owed > 0) {
    return withdrawableAmount / 10 ** decimals
  } else {
    return withdrawableAmount / 10 ** decimals + ((Date.now() / 1e3 - lastUpdate) * Number(amountPerSec)) / 1e20
  }
}

// export function useWithdrawableAmtFormatter(data: IStream) {
//   const { data: callResult } = useWithdrawable({
//     contract: data.llamaTokenContract,
//     payer: data.payerAddress,
//     payee: data.payeeAddress,
//     amountPerSec: data.amountPerSec,
//     streamId: data.streamId,
//   });

//   return withdrawableAmtFormatter({
//     amountPerSec: data.amountPerSec,
//     decimals: data.token.decimals,
//     withdrawableAmount: callResult?.withdrawableAmount,
//     owed: callResult?.owed,
//     lastUpdate: callResult?.lastUpdate,
//   });
// }
