import { Suspense } from 'react'
import { NewTransaction } from './NewTransaction'
import { Loader } from '@/components/Loader'

export const dynamic = 'force-dynamic'

interface NewTransactionPageProps {
  readonly searchParams: Promise<{ readonly id?: string }>
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { id } = await searchParams

  return (
    <Suspense fallback={<Loader />}>
      <NewTransaction id={id} />
    </Suspense>
  )
}
