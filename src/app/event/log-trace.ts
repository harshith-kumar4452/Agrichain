import { createTraceEvent } from '@/lib/firebase'

export async function logTraceEvent(batchId: string, eventData: any) {
  const result = await createTraceEvent({
    batch_id: batchId,
    ...eventData
  })

  if (!result.success) {
    console.error('Error logging trace event:', result.error)
    return { success: false, error: result.error }
  }

  return { success: true, data: { id: result.id, batch_id: batchId, ...eventData } }
}