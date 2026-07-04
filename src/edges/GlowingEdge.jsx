import { BaseEdge, getBezierPath } from 'reactflow';

export default function GlowingEdge({
  sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data
}) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const isFlowing = data?.value === 1;

  return (
    <BaseEdge 
      path={edgePath} 
      className={isFlowing ? 'edge-glow' : 'edge-off'} 
    />
  );
}