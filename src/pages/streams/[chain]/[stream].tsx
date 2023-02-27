import { WidgetBody, Card, WidgetContainer } from '@/components/dashboard/styled'
import { secondsByDuration } from '@/config/constants'
import { defaultSubgraphEndpoint, formatStream } from '@/hooks/queries/useStreamsAndHistory'
import { useTokenList } from '@/hooks/queries/useTokenList'
import { chainDetails } from '@/lamapay/utils/network'
import { Box, SvgIcon, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import type { GetServerSideProps } from 'next'
import type { StaticImageData } from 'next/image'
import Image from 'next/image'
import * as React from 'react'
import { useStreamByIdQuery } from 'services/generated/graphql'
import defaultImage from '@/public/images/balances/empty-token.webp'
import { formatAmount } from '@/utils/formatNumber'
import { TotalStreamed } from '@/components/dashboard/StreamsSection/TotalStreamed'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { Withdrawable } from '@/components/dashboard/StreamsSection/Withdrawable'
import CopyButton from '@/components/common/CopyButton'
import ShareIcon from '@/public/images/common/share.svg'

interface IStreamPageProps {
  streamId: string
  network: string | null
  subgraphEndpoint: string
  logoURI: StaticImageData
  chainExplorer: string | null
  chainId: number | null
}

const StreamPage: React.FunctionComponent<IStreamPageProps> = ({
  subgraphEndpoint,
  streamId,
  network,
  logoURI,
  chainId,
}) => {
  const endpoint = chainId ? subgraphEndpoint : defaultSubgraphEndpoint
  const { data: tokenList } = useTokenList()
  const { data, isLoading, isError } = useStreamByIdQuery(
    {
      endpoint,
    },
    {
      id: streamId,
      network: network || 'noNetwork',
    },
    {
      refetchInterval: network ? 30000 : false,
    },
  )
  const stream = data && (data.streams[0] || null)

  const amountPerMonth = stream ? (Number(stream.amountPerSec) * secondsByDuration['month']) / 1e20 : null
  const tokenLogo = tokenList?.find(
    (t) => t.tokenAddress.toLowerCase() === stream?.token?.address?.toLowerCase(),
  )?.logoURI

  const provider = useWeb3ReadOnly()

  const salaryData = stream && provider && formatStream({ stream, address: stream.payee.id, provider: provider })

  return (
    <div>
      <WidgetContainer>
        <WidgetBody>
          <Box p={3} display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
            <Box gridColumn={2}>
              <Card>
                <Stack>
                  <Box sx={{ display: 'flex', alignItems: 'center' }} mb={2}>
                    <Typography variant="h2" fontWeight={700}>
                      Stream
                    </Typography>
                    <Box>
                      <CopyButton text={`https://llamapay.io/salaries/withdraw/${chainId}/${streamId}`}>
                        <SvgIcon component={ShareIcon} inheritViewBox color="primary" fontSize="medium" />
                      </CopyButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex' }} mb={2}>
                    <Typography variant="subtitle2">From</Typography>
                    <Typography variant="subtitle2" ml={2}>
                      {stream?.payer?.id}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex' }} mb={2}>
                    <Typography variant="subtitle2">To</Typography>
                    <Typography variant="subtitle2" ml={2}>
                      {stream?.payee?.id}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center ' }} mb={2}>
                    <Box style={{ width: 16, height: 16 }}>
                      <Image
                        src={logoURI || defaultImage}
                        alt={'Chain'}
                        className="object-contain"
                        width={16}
                        height={16}
                      />
                    </Box>
                    <Typography variant="subtitle2" ml={2}>
                      {network}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center ' }} mb={2}>
                    <Box style={{ width: 16, height: 16 }}>
                      <Image
                        src={tokenLogo || defaultImage}
                        alt={stream?.token.name || 'Token'}
                        className="object-contain"
                        width={16}
                        height={16}
                      />
                    </Box>
                    <Typography variant="subtitle2" ml={2}>
                      {`${amountPerMonth && formatAmount(amountPerMonth, 5)} ${stream?.token.symbol} / month`}
                    </Typography>
                  </Box>

                  {salaryData && (
                    <>
                      <Stack>
                        <Typography variant="subtitle2">Streamed</Typography>
                        <Typography variant="subtitle2">
                          <TotalStreamed data={salaryData} />
                        </Typography>
                      </Stack>
                      <Stack>
                        <Typography variant="subtitle2">Withdrawable</Typography>
                        <Typography variant="subtitle2">
                          <Withdrawable data={salaryData} />
                        </Typography>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Card>
            </Box>
          </Box>
        </WidgetBody>
      </WidgetContainer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const { chain, stream } = query

  const id = typeof stream === 'string' ? stream : null

  if (!chain || !stream || !id) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const { network, chain: c } = chainDetails(chain)

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(
    ['StreamById'],
    useStreamByIdQuery.fetcher(
      {
        endpoint: network?.subgraphEndpoint ?? '',
      },
      {
        id: id ?? '',
        network: c?.name ?? '',
      },
    ),
  )

  console.log('blockExplorers', c?.blockExplorers ? c.blockExplorers[0].url : null)

  // Pass data to the page via props
  return {
    props: {
      streamId: id,
      network: c?.name ?? null,
      chainId: c?.id ?? null,
      chainExplorer: c?.blockExplorers ? c.blockExplorers[0].url : null,
      subgraphEndpoint: network?.subgraphEndpoint ?? '',
      logoURI: network?.logoURI ?? defaultImage,
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default StreamPage
