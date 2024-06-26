import React, { useRef, useState } from "react";
import { useEffect } from "react"
import { Drawer, Button, Form, Input, Select, Space, message } from 'antd';
import ReactFlow, { ReactFlowProvider, Controls,  useNodesState, useEdgesState, } from "react-flow-renderer";
import PlusEdge from "./plusedge";
import EventManager from "~eventmanager";
import useInspector from "~hooks/useInspector";
import { getDomain, uuid } from "~uitls";
import SaveDialog from './savedialog';
import { saveReplayAction } from "~api";

const MOVE_Y = 100
const { Option } = Select;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};



const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: '开始' },
        position: { x: 250, y: 50 },
    },
    {
        id: '2',
        type: 'output',
        data: { label: '结束' },
        position: { x: 250, y: 150 },
    },
];
const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, type: 'plusedge', },
];
const edgeTypes: any = {
    plusedge: PlusEdge,
};

export default function ActionEditor() {
    const [form] = Form.useForm();
    const [xPath, updateStatus] = useInspector()
    const reactFlowInstanceRef = useRef(null)
    const [open, setOpen] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [currentFrom, setCurrentFrom] = useState({});
    const flowContainerRef = useRef(null)
    const [isMoadalOpen, setIsMoadalOpen] = React.useState(false)
    const currentObj = useRef({
        id: '',
        edge: null
    })
    useEffect(() => {
        // 初始化 临时数据
        const flowData = localStorage.getItem('replayflow') || ''
        if (flowData) { 
            try {
                const { nodes, edges } = JSON.parse(flowData)
                if (Array.isArray(nodes) && Array.isArray(edges)) {
                    setNodes(nodes)
                    setEdges(edges)
                }
            } catch (error) {
                console.log('初始化异常', error)
            }
        }
        const handle = (message) => {
            const { action } = message
            if (action === 'ReplayAction') {
                setOpen(true)
            }
        }
        chrome.runtime.onMessage.addListener(handle)
        return () => {
            chrome.runtime.onMessage.removeListener(handle)
        }
    }, [])


    useEffect(() => {
        // 缓存临时数据 
        if (!open && reactFlowInstanceRef.current) {
            const flowData = reactFlowInstanceRef.current.toObject()
            try {
                const strFlowData = JSON.stringify(flowData)
                if (strFlowData) {
                    localStorage.setItem('replayflow', strFlowData)
                }
            } catch (error) {
                console.log('存储异常', error)
            }
        }
    }, [open])

    useEffect(() => {
        const handleEvent = (data) => {
            console.log('Event received:', data);
            const { id, key } = data
            currentObj.current.id = id
            currentObj.current.edge = edges.find(item => item.id === id)
            if (key === 'keydownevent') {
                addActions(currentObj.current.edge, '', 'keydownevent')
                return
            }
            typeof updateStatus === 'function' && updateStatus(true)
            setOpen(false)
        };

        EventManager.subscribe('plus', handleEvent);

        // 清理函数，组件卸载时取消订阅
        return () => {
            EventManager.unsubscribe('plus', handleEvent);
        };
    }, [edges]);

    useEffect(() => {
        const { edge } = currentObj.current || {}
        if (xPath && edge && reactFlowInstanceRef.current) {
            setOpen(true)
            addActions(edge, xPath)
            // requestAnimationFrame(() => {
            //     reactFlowInstanceRef.current.fitView()
            // })
        }
    }, [xPath])

    const addActions = (edge,  xPath, handleType = 'click') => {
        const id = uuid(8);
        const sourceNode = nodes.find(item => item.id === edge.source)
        const targetNode = nodes.find(item => item.id === edge.target) // 浅拷贝
        const node = [{
            id,
            data: { 
                label: uuid(8), 
                xPath,
                handleType,
                inputValue: '',
            },
            position: { x: sourceNode.position.x, y: sourceNode.position.y + MOVE_Y },
        }]
        targetNode.position = { x: targetNode.position.x, y: targetNode.position.y + MOVE_Y }
        const addEdges = [
            { id: uuid(8), source: edge.source, target: id, animated: true, type: 'plusedge', },
            { id: uuid(8), source: id, target: edge.target, animated: true, type: 'plusedge', }
        ]
        const nwEdges = [...edges, ...addEdges].filter((item) => item.id !== edge.id)
        const nwNodes = [...nodes, ...node] as any
        console.log('nwNodes---', nwNodes)
        setNodes(nwNodes)
        setEdges(nwEdges)
    }
    const onClose = () => {
        setOpen(false)
    }
    const onInit = (reactFlowInstance) => {
        reactFlowInstance.setViewport({ x: 200, y: 50, zoom: 0.6 });
        reactFlowInstanceRef.current = reactFlowInstance;
    }
    const onNodeClick = (_, node) => {
        console.log('onNodesChange', node)
        const { id, data }  = node
        if (['1', '2'].includes(id)) return
        // form.setFieldsValue(data)
        setCurrentFrom(data)
        setOpenSetting(true)
    }

    const onFinish = (values: any) => {
        console.log(values);
    };

    const handelReset = () => {
        setNodes(initialNodes)
        setEdges(initialEdges)
    }

    /**
     *  保存
     */
    const handleSaveAction = async (values) => {
        if (nodes && nodes.length <= 2) {
            message.warning('请编排action')
            return
        }
        const domain = getDomain()
        const id = uuid()
        const flowDatas = reactFlowInstanceRef.current.toObject()
        await saveReplayAction({ ...values, datas: flowDatas, domain, id, type: 'action'  })
        setIsMoadalOpen(false)
    }
    /**
     *  打开保存窗
     */
    const handleOpenSave = () => {
        setIsMoadalOpen(true)
    }
    return <>
        <Drawer
            title="Action Editor"
            onClose={onClose}
            placement='bottom'
            maskClosable={false}
            zIndex={99}
            open={open}>
            <div ref={flowContainerRef} className="reactflow-container" style={{ height: '100%' }}>
                <div className="reactflow-header">
                        <Button type="default" onClick={handleOpenSave}>
                            SAVE
                        </Button>
                        <Button type="default" onClick={handelReset}>
                            RESET
                        </Button>
                </div>
                <ReactFlowProvider>
                    <ReactFlow
                        snapToGrid={true}
                        attributionPosition="top-right"
                        onNodeClick={onNodeClick}
                        onInit={onInit}
                        nodes={nodes}
                        edges={edges}
                        edgeTypes={edgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                    >
                        <Controls />
                    </ReactFlow>
                </ReactFlowProvider>
                <Drawer title="Action Settings"
                    onClose={() => setOpenSetting(false)}
                    placement='right'
                    zIndex={999}
                    maskClosable={false}
                    open={openSetting}>
                    <Form
                        {...layout}
                        form={form}
                        name="control-hooks"
                        onFinish={onFinish}
                        style={{ maxWidth: 600 }}
                    >
                        <Form.Item name="label" label="描述" rules={[{ required: true, max: 6 }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="handleType" label="操作" rules={[{ required: true }]}>
                            <Select placeholder="请选择操作类型">
                                <Option value="click">点击</Option>
                                <Option value="input">输入</Option>
                                <Option value="keydownevent">键盘按下</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="inputValue" label="值">
                            <Input />
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Space>
                                <Button type="default" htmlType="submit">
                                    Submit
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Drawer>
            </div>
        </Drawer>
        <SaveDialog title="Save Replay Action" modalOpen={isMoadalOpen} onSave={handleSaveAction}></SaveDialog>
    </>
}