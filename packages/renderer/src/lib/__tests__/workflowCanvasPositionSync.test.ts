import { describe, expect, it } from 'vitest'
import type { NodeChange } from '@xyflow/react'
import { extractPositionPatches } from '../workflowCanvasPositionSync'

describe('extractPositionPatches', () => {
  it('extracts position changes into store-friendly tuples', () => {
    const changes: NodeChange[] = [
      {
        id: 'agent-1',
        type: 'position',
        position: { x: 420, y: 260 },
        dragging: false,
      },
    ]

    expect(extractPositionPatches(changes)).toEqual([
      {
        id: 'agent-1',
        position: [420, 260],
      },
    ])
  })

  it('ignores non-position node changes', () => {
    const changes: NodeChange[] = [
      {
        id: 'agent-1',
        type: 'select',
        selected: true,
      },
      {
        id: 'agent-2',
        type: 'remove',
      },
    ]

    expect(extractPositionPatches(changes)).toEqual([])
  })
})
