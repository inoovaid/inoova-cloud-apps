import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST() {
  try {
    execSync('npx tsx prisma/seed.ts', {
      cwd: '/home/z/my-project',
      stdio: 'pipe',
    })
    return NextResponse.json({ success: true, message: 'Banco de dados re-seedado com sucesso!' })
  } catch (error) {
    console.error('Error seeding:', error)
    return NextResponse.json({ error: 'Erro ao re-seedar banco de dados' }, { status: 500 })
  }
}
