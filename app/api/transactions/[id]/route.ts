import { type NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { PostRequestBody, TransactionData } from '../types'

const dataFilePath = join(process.cwd(), 'data', 'transactions.json')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const fileContents = await readFile(dataFilePath, 'utf-8')
    const transactions: TransactionData[] = JSON.parse(fileContents)

    const transaction = transactions.find(
      (transaction) => transaction.id === id,
    )

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 },
      )
    }

    return NextResponse.json({ transaction })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao buscar transação' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { amount, transactionType }: PostRequestBody = await request.json()

    const fileContents = await readFile(dataFilePath, 'utf-8')
    const transactions: TransactionData[] = JSON.parse(fileContents)

    const index = transactions.findIndex((transaction) => transaction.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 },
      )
    }

    if (amount != null) transactions[index].amount = amount
    if (transactionType != null) transactions[index].type = transactionType

    await writeFile(
      dataFilePath,
      JSON.stringify(transactions, null, 2),
      'utf-8',
    )

    return NextResponse.json({
      success: true,
      transaction: transactions[index],
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Erro ao atualizar transação' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

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
