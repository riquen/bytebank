import { NewTransaction } from './NewTransaction'

interface NewTransactionPageProps {
  readonly searchParams: Promise<{ readonly transaction_id?: string }>
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { transaction_id } = await searchParams

  return <NewTransaction transaction_id={transaction_id} />
}
