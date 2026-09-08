import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPermissionRequest, updateRequestStatus } from '@/app/actions/requests'
import { prisma } from '@/lib/prisma'

// Mock prisma and revalidatePath
vi.mock('@/lib/prisma', () => ({
  prisma: {
    request: {
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    }
  }
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Server Actions - requests.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPermissionRequest', () => {
    it('should validate request type', async () => {
      const formData = new FormData()
      formData.append('type', 'INVALID')
      formData.append('reason', 'Alasan valid lebih dari 5 huruf')
      
      const result = await createPermissionRequest(formData)
      expect(result.error).toBe('Tipe pengajuan tidak valid. Harus salah satu dari: SAKIT, PULANG, LAINNYA')
    })

    it('should validate reason length', async () => {
      const formData = new FormData()
      formData.append('type', 'SAKIT')
      formData.append('reason', 'abc')
      
      const result = await createPermissionRequest(formData)
      expect(result.error).toBe('Alasan harus diisi minimal 5 karakter')
    })

    it('should pass with valid data', async () => {
      const formData = new FormData()
      formData.append('type', 'SAKIT')
      formData.append('reason', 'Saya sedang sakit demam')
      
      // Mock user lookup
      vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'user-1', role: 'STUDENT' } as any)
      vi.mocked(prisma.request.create).mockResolvedValue({ id: 'req-1' } as any)

      const result = await createPermissionRequest(formData)
      
      expect(result.error).toBeUndefined()
      expect(prisma.request.create).toHaveBeenCalled()
    })
  })

  describe('updateRequestStatus', () => {
    it('should require valid status', async () => {
      const result = await updateRequestStatus('req-1', 'INVALID_STATUS' as any)
      expect(result.error).toBe('Status tidak valid')
    })

    it('should update request successfully', async () => {
      vi.mocked(prisma.request.update).mockResolvedValue({ id: 'req-1' } as any)
      
      const result = await updateRequestStatus('req-1', 'APPROVED')
      expect(result.error).toBeUndefined()
      expect(prisma.request.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'APPROVED' }
      })
    })
  })
})
