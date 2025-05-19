import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export interface TransactionData {
  amount: string
  type: string
  date: string
}

const dataFilePath = join(process.cwd(), 'data', 'transactions.json')

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const limit = parseInt(url.searchParams.get('limit') ?? '5', 10)

    const fileContents = await readFile(dataFilePath, 'utf-8')
    const transactions = JSON.parse(fileContents)

    const sortedTransactions = [...transactions].reverse()

    const start = (page - 1) * limit
    const end = start + limit
    const paged = sortedTransactions.slice(start, end)

    const hasMore = end < sortedTransactions.length

    return NextResponse.json({ transactions: paged, hasMore })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, transactionType } = await request.json()

    if (!amount || !transactionType) {
      return NextResponse.json(
        { error: 'Verifique os campos e tente novamente' },
        { status: 400 },
      )
    }

    const newTransaction = {
      amount,
      type: transactionType,
      date: new Date().toLocaleDateString('pt-BR'),
    }

    const fileContents = await readFile(dataFilePath, 'utf-8')
    const transactions = JSON.parse(fileContents)

    transactions.push(newTransaction)

    await writeFile(
      dataFilePath,
      JSON.stringify(transactions, null, 2),
      'utf-8',
    )

    return NextResponse.json({ success: true, transaction: newTransaction })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 },
    )
  }
}
