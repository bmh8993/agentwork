import type { NodeChange } from '@xyflow/react'

export interface PositionPatch {
  id: string
  position: [number, number]
}

export function extractPositionPatches(changes: NodeChange[]): PositionPatch[] {
  return changes.flatMap((change) => {
    if (change.type !== 'position' || !change.position) {
      return []
    }

    return [
      {
        id: change.id,
        position: [change.position.x, change.position.y],
      },
    ]
  })
}
