import { Suspense } from 'react'
import { NewTransaction } from './NewTransaction'
import { Loader } from '@/components/Loader'

export const dynamic = 'force-dynamic'

interface NewTransactionPageProps {
  readonly searchParams: Promise<{ readonly transaction_id?: string }>
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { transaction_id } = await searchParams

  return (
    <Suspense fallback={<Loader />}>
      <NewTransaction transaction_id={transaction_id} />
    </Suspense>
  )
}
