import { type NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { type TransactionData } from '../types'

const dataFilePath = join(process.cwd(), 'data', 'transactions.json')

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params

    const fileContents = await readFile(dataFilePath, 'utf-8')
    const transactions: TransactionData[] = JSON.parse(fileContents)

    const filtered = transactions.filter((transaction) => transaction.id !== id)

    if (filtered.length === transactions.length) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 },
      )
    }

    await writeFile(dataFilePath, JSON.stringify(filtered, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao deletar transação' },
      { status: 500 },
    )
  }
}
