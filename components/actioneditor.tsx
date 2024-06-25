import React, { useState } from "react";
import { useEffect } from "react"
import { Button, Drawer, Radio, Space } from 'antd';
import ReactFlow from "react-flow-renderer";
import PlusEdge from "./plusedge";
import EventManager from "~EventManager";
const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: '开始' },
        position: { x: 250, y: 25 },
    },
    {
        id: '2',
        type: 'output',
        data: { label: '结束' },
        position: { x: 250, y: 250 },
    },
];
const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, type: 'plusedge', },
];
const edgeTypes = {
    plusedge: PlusEdge,
};
export default function ActionEditor() {
    const [open, setOpen] = useState(false);
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    useEffect(() => {
        const handle = (message) => {
            const { action } = message
            if (action === 'ReplayAction') {
                console.log(message)
                setOpen(true)
            }
        }
        chrome.runtime.onMessage.addListener(handle)
        return () => {
            chrome.runtime.onMessage.removeListener(handle)
        }
    }, [])
    useEffect(() => {
        const handleEvent = (data) => {
            console.log('Event received:', data);
        };

        EventManager.subscribe('plus', handleEvent);

        // 清理函数，组件卸载时取消订阅
        return () => {
            EventManager.unsubscribe('plus', handleEvent);
        };
    }, []);
    const onClose = () => {
        setOpen(false)
    }
    return <>
        <Drawer
            title="Action Editor"
            onClose={onClose}
            placement='bottom'
            mask={false}
            open={open}>
            <div style={{ height: '100%' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    edgeTypes={edgeTypes}
                    fitView />
            </div>
        </Drawer>
    </>
}