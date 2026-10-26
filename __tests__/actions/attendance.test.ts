import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitAttendanceForTimeRange, getAttendanceForTimeRange } from '@/app/actions/attendance'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
    attendance: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    schedule: {
      findFirst: vi.fn(),
    },
    request: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}))

describe('Server Actions - attendance.ts', () => {
  const mockTeacherSession = {
    userId: 'teacher-1',
    role: 'TEACHER',
    username: 'guru_sunda'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getSession).mockResolvedValue(mockTeacherSession as any)
  })

  describe('submitAttendanceForTimeRange', () => {
    const classId = 'class-12'
    const testDate = new Date('2026-10-23T00:00:00Z') // Friday
    const startTime = '09:30'
    const endTime = '11:30'
    const subjectIdMath = 'subj-matematika'
    const subjectIdSunda = 'subj-sunda'

    it('should reject non-teacher access', async () => {
      vi.mocked(getSession).mockResolvedValueOnce({ userId: 'student-1', role: 'STUDENT', username: 'budi' } as any)

      const result = await submitAttendanceForTimeRange(classId, testDate, startTime, endTime, subjectIdMath, {})
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('should reject when time overlaps with existing journal session', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
        { id: 'student-1' },
        { id: 'student-2' }
      ] as any)

      // Mock overlap found
      vi.mocked(prisma.attendance.findFirst).mockResolvedValueOnce({
        id: 'att-existing',
        startTime: '10:00',
        endTime: '12:00'
      } as any)

      const result = await submitAttendanceForTimeRange(
        classId,
        testDate,
        startTime,
        endTime,
        subjectIdMath,
        { 'student-1': 'HADIR' }
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Waktu tumpang tindih dengan jurnal absensi yang sudah ada!')
    })

    it('should reject when subject does not match official schedule', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
        { id: 'student-1' }
      ] as any)

      // No overlap
      vi.mocked(prisma.attendance.findFirst).mockResolvedValueOnce(null)

      // Official schedule on that time slot is Bahasa Sunda
      vi.mocked(prisma.schedule.findFirst).mockResolvedValueOnce({
        id: 'sched-1',
        classId,
        teacherId: 'teacher-1',
        subjectId: subjectIdSunda,
        subject: { name: 'Bahasa Sunda' }
      } as any)

      // Teacher tries to submit Matematika
      const result = await submitAttendanceForTimeRange(
        classId,
        testDate,
        startTime,
        endTime,
        subjectIdMath,
        { 'student-1': 'HADIR' }
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Mata pelajaran tidak sesuai dengan jadwal mengajar (Bahasa Sunda)')
      expect(prisma.attendance.upsert).not.toHaveBeenCalled()
    })

    it('should successfully save attendance when subject matches schedule', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
        { id: 'student-1' },
        { id: 'student-2' }
      ] as any)

      // No overlap
      vi.mocked(prisma.attendance.findFirst).mockResolvedValueOnce(null)

      // Official schedule is Matematika
      vi.mocked(prisma.schedule.findFirst).mockResolvedValueOnce({
        id: 'sched-2',
        classId,
        teacherId: 'teacher-1',
        subjectId: subjectIdMath,
        subject: { name: 'Matematika' }
      } as any)

      vi.mocked(prisma.attendance.upsert).mockResolvedValue({ id: 'att-new' } as any)

      const result = await submitAttendanceForTimeRange(
        classId,
        testDate,
        startTime,
        endTime,
        subjectIdMath,
        {
          'student-1': 'HADIR',
          'student-2': 'ALPHA'
        }
      )

      expect(result.success).toBe(true)
      expect(prisma.attendance.upsert).toHaveBeenCalledTimes(2)
      expect(prisma.attendance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            studentId_date_startTime_endTime: {
              studentId: 'student-1',
              date: testDate,
              startTime: startTime,
              endTime: endTime
            }
          }),
          update: expect.objectContaining({
            status: 'HADIR',
            subjectId: subjectIdMath,
            teacherId: 'teacher-1'
          })
        })
      )
    })
  })

  describe('getAttendanceForTimeRange', () => {
    const classId = 'class-12'
    const testDate = new Date('2026-10-23T00:00:00Z')
    const startTime = '09:30'
    const endTime = '11:30'

    it('should lock students who have approved requests overlapping time range', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
        { id: 'student-1' },
        { id: 'student-2' }
      ] as any)

      // Student 1 has approved SAKIT from 08:00 - Pulang
      vi.mocked(prisma.request.findMany).mockResolvedValueOnce([
        {
          id: 'req-1',
          studentId: 'student-1',
          status: 'APPROVED',
          type: 'SAKIT',
          startTime: '08:00',
          endTime: 'Pulang'
        }
      ] as any)

      // Student 2 has existing attendance HADIR
      vi.mocked(prisma.attendance.findMany).mockResolvedValueOnce([
        {
          id: 'att-2',
          studentId: 'student-2',
          status: 'HADIR',
          subjectId: 'subj-matematika'
        }
      ] as any)

      const result = await getAttendanceForTimeRange(classId, testDate, startTime, endTime)

      expect(result.success).toBe(true)
      if (result.success && result.attendanceMap) {
        expect(result.lockedStudents).toContain('student-1')
        expect(result.attendanceMap['student-1']).toBe('SAKIT')
        expect(result.attendanceMap['student-2']).toBe('HADIR')
        expect(result.subjectId).toBe('subj-matematika')
        expect(result.isSaved).toBe(true)
      }
    })
  })
})
