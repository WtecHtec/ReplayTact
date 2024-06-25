import React from 'react';
import { getBezierPath, getEdgeCenter } from 'react-flow-renderer';
import EventManager from '~EventManager';


const foreignObjectSize = 32;

const onEdgeClick = (evt, id) => {
  evt.stopPropagation();
  EventManager.publish('plus', { data: id});
};

export default function PlusEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <body>
          <button style={{
            "width": "32px",
            "height": "32px",
            "background": "#eee",
            "border": "1px solid #fff",
            "cursor": "pointer",
            "borderRadius": "50%",
            "fontSize": "12px",
            "lineHeight": "1"
          }} onClick={(event) => onEdgeClick(event, id)}>
            +
          </button>
        </body>
      </foreignObject>
    </>
  );
}
