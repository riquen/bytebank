import { NewTransaction } from './NewTransaction'

interface NewTransactionPageProps {
  readonly searchParams: Promise<Readonly<{ id?: string }>>
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { id } = await searchParams
  return <NewTransaction initialId={id ?? null} />
}
