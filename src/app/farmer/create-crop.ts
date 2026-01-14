import { createBatch } from '@/lib/firebase'

export async function createCropBatch(batchId: string, cropData: any) {
  const result = await createBatch({
    batch_id: batchId,
    ...cropData
  })

  if (!result.success) {
    console.error('Error creating crop batch:', result.error)
    return { success: false, error: result.error }
  }

  return { success: true, data: { id: result.id, batch_id: batchId, ...cropData } }
}