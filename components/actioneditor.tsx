import React, { useRef, useState } from "react";
import { useEffect } from "react"
import { Drawer, Button, Form, Input, Select, Space } from 'antd';
import ReactFlow, { ReactFlowProvider, Controls,  useNodesState, useEdgesState, } from "react-flow-renderer";
import PlusEdge from "./plusedge";
import EventManager from "~eventmanager";
import useInspector from "~hooks/useInspector";
import { uuid } from "~uitls";

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
    const [xPath, updateStatus, refresh] = useInspector()
    const reactFlowInstanceRef = useRef(null)
    const [open, setOpen] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [currentFrom, setCurrentFrom] = useState<any>({});
    const flowContainerRef = useRef(null)
    const currentObj = useRef({
        id: '',
        edge: null
    })
    useEffect(() => {
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
        console.log('xPath----', xPath, nodes, edges, currentObj.current)
        const { edge } = currentObj.current || {}
        if (refresh !== -1 && xPath && edge && reactFlowInstanceRef.current) {
            setOpen(true)
            addActions(edge, xPath)
            // requestAnimationFrame(() => {
            //     reactFlowInstanceRef.current.fitView()
            // })
        }
    }, [xPath, refresh])

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
        reactFlowInstance.setViewport({ x: 200, y: 50, zoom: 0.5 });
        reactFlowInstanceRef.current = reactFlowInstance;
    }
    const onNodeClick = (_, node) => {
        const { id, data }  = node
        if (['1', '2'].includes(id)) {
					console.log('return')
					return
				} 
        form.setFieldsValue(data)
        setCurrentFrom(node)
        setOpenSetting(true)
    }

    const onFinish = (values: any) => {
				setNodes((nds) =>
					nds.map((node) => {
						if (node.id === currentFrom.id) {
							// when you update a simple type you can just update the value
							node.data =  {...node.data, ...values}
						}
						return node;
					})
				);
				setOpenSetting(false)
    };

		const handleDelNode = () => {
			setNodes((nds) =>
				nds.filter((node) => {
					return node.id !== currentFrom.id;
				})
			);
			setEdges((edges) =>
				{
					let orsource = ''
					let ortarget = ''
					const filterEgs = edges.filter((edge) => {
						if (edge.source === currentFrom.id) {
							ortarget = edge.target
						}
						if (edge.target === currentFrom.id) {
							orsource = edge.source
						}
						return edge.source !== currentFrom.id && edge.target !== currentFrom.id;
					})
					if (orsource && ortarget) {
						filterEgs.push({
							id: uuid(),
							source: orsource,
							target: ortarget,
							animated: true,
							type: 'plusedge',
						})
					}
					return filterEgs;
				}
			);
			setOpenSetting(false)
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
                <ReactFlowProvider>
                    <ReactFlow
                        onNodeClick={onNodeClick}
                        onInit={onInit}
                        nodes={nodes}
                        edges={edges}
                        edgeTypes={edgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                    >
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
                        <Form.Item name="label" label="描述" rules={[{ required: true, max: 8 }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="handleType" label="操作" rules={[{ required: true }]}>
                            <Select  placeholder="请选择操作类型">
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
																<Button type="text" onClick={handleDelNode} >
                                    Delete
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Drawer>
            </div>
        </Drawer>
    </>
}