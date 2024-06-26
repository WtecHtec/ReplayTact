import { Dropdown, Space } from 'antd';
import React from 'react';
import { getBezierPath, getEdgeCenter } from 'react-flow-renderer';
import EventManager from '~eventmanager';


const foreignObjectSize = 32;

const onEdgeClick = (key, id) => {
    EventManager.publish('plus',  { key, id });
};

const items: any[] = [
    {
        label: 'DOM',
        key: 'dom',
    },
    // {
    //     label: '键盘事件',
    //     key: 'keydownevent',
    // },
]
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
                    <Dropdown menu={{ items, onClick: ({key}) => {onEdgeClick(key, id)}  }} trigger={['click']} >
                        <button style={{
                            "width": "32px",
                            "height": "32px",
                            "background": "#eee",
                            "border": "1px solid #fff",
                            "cursor": "pointer",
                            "borderRadius": "50%",
                            "fontSize": "12px",
                            "lineHeight": "1"
                        }}>
                            +
                        </button>
                    </Dropdown>


                </body>
            </foreignObject>
        </>
    );
}
