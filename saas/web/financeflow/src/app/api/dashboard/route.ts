import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const accounts = await db.account.findMany({
      include: { client: true },
    })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const receitas = accounts.filter((a) => a.type === 'receber' && a.status === 'paga')
    const contasPagas = accounts.filter((a) => a.status === 'paga')
    const contasPendentes = accounts.filter(
      (a) => a.status === 'pendente' && a.dueDate >= today
    )
    const contasVencidas = accounts.filter(
      (a) => a.status === 'vencida'
    )

    const receitaTotal = receitas.reduce((sum, a) => sum + a.amount, 0)
    const totalPagas = contasPagas.reduce((sum, a) => sum + a.amount, 0)
    const totalPendentes = contasPendentes.reduce((sum, a) => sum + a.amount, 0)
    const totalVencidas = contasVencidas.reduce((sum, a) => sum + a.amount, 0)

    // Monthly data for last 6 months
    const monthlyData: { month: string; receitas: number; despesas: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)

      const monthAccounts = accounts.filter((a) => {
        const dueDate = new Date(a.dueDate)
        return dueDate >= monthStart && dueDate <= monthEnd && a.status === 'paga'
      })

      const receitas = monthAccounts
        .filter((a) => a.type === 'receber')
        .reduce((sum, a) => sum + a.amount, 0)
      const despesas = monthAccounts
        .filter((a) => a.type === 'pagar')
        .reduce((sum, a) => sum + a.amount, 0)

      monthlyData.push({
        month: monthName,
        receitas,
        despesas,
      })
    }

    // Fluxo de caixa - cumulative
    let fluxoCaixa = 0
    const fluxoData = monthlyData.map((m) => {
      fluxoCaixa += m.receitas - m.despesas
      return { ...m, saldo: fluxoCaixa }
    })

    const recentAccounts = await db.account.findMany({
      where: { parentAccountId: null },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      receitaTotal,
      totalPagas,
      totalPendentes,
      totalVencidas,
      contasPagasCount: contasPagas.length,
      contasPendentesCount: contasPendentes.length,
      contasVencidasCount: contasVencidas.length,
      monthlyData,
      fluxoData,
      recentAccounts,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Erro ao buscar dashboard' }, { status: 500 })
  }
}
