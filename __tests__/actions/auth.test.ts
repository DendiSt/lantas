import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Mock prisma and auth session
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  createSession: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}))

describe('Server Actions - auth.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('harus menolak jika username atau password kosong', async () => {
    const formData = new FormData()
    formData.append('username', '')
    formData.append('password', '')

    const result = await login(null, formData)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Username dan password harus diisi.')
  })

  it('harus menolak jika panjang username melebihi 50 karakter', async () => {
    const formData = new FormData()
    formData.append('username', 'a'.repeat(51))
    formData.append('password', 'secret123')

    const result = await login(null, formData)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Username tidak valid.')
  })

  it('harus menolak jika username mengandung karakter berbahaya/spesial', async () => {
    const formData = new FormData()
    formData.append('username', '<script>alert(1)</script>')
    formData.append('password', 'secret123')

    const result = await login(null, formData)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Username mengandung karakter yang tidak diizinkan.')
  })

  it('harus menolak jika pengguna tidak ditemukan di database', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const formData = new FormData()
    formData.append('username', 'nonexistent_user')
    formData.append('password', 'secret123')

    const result = await login(null, formData)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Username atau password salah.')
  })

  it('harus menolak jika akun sedang terkunci (rate limiting)', async () => {
    const futureDate = new Date(Date.now() + 10 * 60 * 1000) // 10 menit ke depan
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      username: 'student1',
      password: 'hashed_password',
      lockoutUntil: futureDate,
      loginAttempts: 5,
    } as any)

    const formData = new FormData()
    formData.append('username', 'student1')
    formData.append('password', 'secret123')

    const result = await login(null, formData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Akun sementara dikunci')
  })

  it('harus berhasil login dan mengarahkan ke halaman dashboard saat kredensial valid', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      username: 'student1',
      name: 'Budi Santoso',
      role: 'STUDENT',
      password: 'hashed_password',
      lockoutUntil: null,
      loginAttempts: 0,
    } as any)

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const formData = new FormData()
    formData.append('username', 'student1')
    formData.append('password', 'password123')

    const result = await login(null, formData)
    expect(result.success).toBe(true)
    expect(result.redirectTo).toBe('/dashboard')
    expect(result.userName).toBe('Budi Santoso')
  })
})

