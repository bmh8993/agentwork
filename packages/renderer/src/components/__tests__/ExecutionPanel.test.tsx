import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ExecutionPanel } from '../ExecutionPanel'

describe('ExecutionPanel', () => {
  it('renders node results and branch outputs from a run session', () => {
    render(
      <ExecutionPanel
        sessions={[
          {
            id: 'session-1',
            state: 'completed',
            errors: [],
            nodeResults: [
              {
                nodeId: 'agent-a',
                nodeName: 'Agent A',
                type: 'Agent',
                status: 'success',
                output: 'A result',
              },
              {
                nodeId: 'judge',
                nodeName: 'Judge',
                type: 'Agent',
                status: 'success',
                output: 'Merged output',
                branch_outputs: [
                  {
                    node_id: 'agent-a',
                    status: 'success',
                    output: 'A result',
                  },
                  {
                    node_id: 'agent-b',
                    status: 'failed',
                    error: 'B failed',
                  },
                ],
              },
            ],
          },
        ]}
        activeSessionId="session-1"
      />
    )

    expect(screen.getByText('Execution Results')).toBeTruthy()
    expect(screen.getByText(/Session: session-1/)).toBeTruthy()
    expect(screen.getByText('Agent A')).toBeTruthy()
    expect(screen.getByText(/Output: A result/)).toBeTruthy()
    expect(screen.getByText('Judge')).toBeTruthy()
    expect(screen.getByText('Branch Outputs')).toBeTruthy()
    expect(screen.getByText(/agent-a · success · A result/)).toBeTruthy()
    expect(screen.getByText(/agent-b · failed · B failed/)).toBeTruthy()
  })

  it('filters down to failed node results only', () => {
    render(
      <ExecutionPanel
        sessions={[
          {
            id: 'session-1',
            state: 'completed',
            errors: [],
            nodeResults: [
              {
                nodeId: 'agent-a',
                nodeName: 'Agent A',
                type: 'Agent',
                status: 'success',
                output: 'A result',
              },
              {
                nodeId: 'agent-b',
                nodeName: 'Agent B',
                type: 'Agent',
                status: 'failed',
                error: 'B failed',
              },
            ],
          },
        ]}
        activeSessionId="session-1"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Failures Only' }))

    expect(screen.queryByText('Agent A')).toBeNull()
    expect(screen.getByText('Agent B')).toBeTruthy()
  })

  it('switches between recent execution sessions', () => {
    render(
      <ExecutionPanel
        sessions={[
          {
            id: 'session-1',
            state: 'completed',
            errors: [],
            nodeResults: [
              {
                nodeId: 'agent-a',
                nodeName: 'Agent A',
                type: 'Agent',
                status: 'success',
                output: 'A result',
              },
            ],
          },
          {
            id: 'session-2',
            state: 'completed',
            errors: [],
            nodeResults: [
              {
                nodeId: 'agent-b',
                nodeName: 'Agent B',
                type: 'Agent',
                status: 'failed',
                error: 'B failed',
              },
            ],
          },
        ]}
        activeSessionId="session-2"
      />
    )

    expect(screen.getByText(/Session: session-2/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'session-1' }))
    expect(screen.getByText(/Session: session-1/)).toBeTruthy()
    expect(screen.getByText('Agent A')).toBeTruthy()
  })
})
