/**
 * OpenCode Workflow Node Types
 *
 * Custom node components for Start, Agent, and End nodes.
 */

import { NodeTypes } from '@xyflow/react';
import { StartNode } from './StartNode';
import { AgentNode } from './AgentNode';
import { EndNode } from './EndNode';

export const nodeTypes: NodeTypes = {
  start: StartNode,
  agent: AgentNode,
  end: EndNode,
};
