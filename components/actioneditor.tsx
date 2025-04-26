import React, { useRef, useState } from "react";
import { useEffect } from "react"
import { Drawer, Button, Form, Input, Select, Space, message, Radio } from 'antd';
import ReactFlow, { ReactFlowProvider, Controls, useNodesState, useEdgesState, } from "react-flow-renderer";
import PlusEdge from "./plusedge";
import EventManager from "~eventmanager";
import useInspector from "~hooks/useInspector";
import { getDomain, uuid } from "~uitls";
import SaveDialog from './savedialog';
import { getTemporaryData, saveReplayAction, saveTemporaryData } from "~api";
import runAction from "~runactions";
import { fakerStrategies } from "~faker/config";

const MOVE_Y = 100
const { Option } = Select;

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 },
};

const tailLayout = {
	wrapperCol: { offset: 8, span: 16 },
};

const { TextArea } = Input;

const initialNodes = [
	{
		id: 'start',
		type: 'input',
		data: { label: '开始' },
		position: { x: 250, y: 50 },
	},
	{
		id: 'end',
		type: 'output',
		data: { label: '结束' },
		position: { x: 250, y: 150 },
	},
];
const initialEdges = [
	{ id: 'e1-2', source: 'start', target: 'end', animated: true, type: 'plusedge', },
];
const edgeTypes: any = {
	plusedge: PlusEdge,
};

export default function ActionEditor() {
	const [_, contextHolder] = message.useMessage();
	const [form] = Form.useForm();
	const [xPath, updateStatus, refresh] = useInspector()
	const reactFlowInstanceRef = useRef(null)
	const [open, setOpen] = useState(false);
	const [openSetting, setOpenSetting] = useState(false);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [currentFrom, setCurrentFrom] = useState<any>({});
	const flowContainerRef = useRef(null)
	const [isMoadalOpen, setIsMoadalOpen] = React.useState(false)
	const currentObj = useRef({
		id: '',
		edge: null
	})
	const [newTab, setNewTab] = useState(currentFrom.data?.newtab || '0')

	const [showUseFaker, setShowUseFaker] = useState(false)
	const [showFakerType, setShowFakerType] = useState(false)

	const [desc, setDesc] = useState('')
	useEffect(() => {

		const handle = async (message) => {
			const { action } = message
			if (action === 'ReplayAction' || action === 'create_action') {

				// 初始化 临时数据
				const { datas } = await getTemporaryData() as any
				if (datas) {
					try {
						const { nodes, edges } = datas
						if (Array.isArray(nodes) && Array.isArray(edges)) {
							setNodes(nodes)
							setEdges(edges)
						}
					} catch (error) {
						console.log('初始化异常', error)
					}
				}
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
			saveTemporaryData(flowData)
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
		if (refresh !== -1 && xPath && xPath !== '' && edge && reactFlowInstanceRef.current) {
			setOpen(true)
			addActions(edge, xPath)
			// requestAnimationFrame(() => {
			//     reactFlowInstanceRef.current.fitView()
			// })
		}
	}, [xPath, refresh])

	const addActions = (edge, xPath, handleType = 'click') => {
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
		const { id, data } = node
		if (['end'].includes(id)) {
			console.log('return')
			return
		}
		if (data.handleType) {
			setShowUseFaker(data.handleType === 'input')
		}
		if (data.handleType !== 'input') {
			setShowUseFaker(false)
			setShowFakerType(false)
			setDesc('')
		} else {
			if (data.useFaker !== undefined) {
				setShowFakerType(data.useFaker)
			}
			if (data.fakerType) {
				const { desc } = fakerStrategies[data.fakerType]
				setDesc(desc)
			}
		}
		setNewTab(data.newtab || '0')
		form.setFieldsValue(data)
		console.log('node', node)
		setCurrentFrom(node)
		setOpenSetting(true)
	}

	const onFinish = (values: any) => {
		setNodes((nds) =>
			nds.map((node) => {
				if (node.id === currentFrom.id) {
					// when you update a simple type you can just update the value
					node.data = { ...node.data, ...values }
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
		setEdges((edges) => {
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
		await saveReplayAction({ ...values, datas: flowDatas, domain, id, type: 'action' })
		setIsMoadalOpen(false)
	}
	/**
	 *  打开保存窗
	 */
	const handleOpenSave = () => {
		setIsMoadalOpen(true)
	}
	const handleCancel = () => {
		setIsMoadalOpen(false)
	}
	const handelRun = async () => {
		onClose()
		const flowDatas = reactFlowInstanceRef.current.toObject()
		const status = await runAction(flowDatas.nodes, flowDatas.edges)
		console.log('status---', status)
		if (status === -1) {
			message.warning('没有找到对应DOM')
		} else if (status === 0) {
			message.error('处理失败')
		}
	}

	return <>
		{contextHolder}
		<Drawer
			title="Action Editor"
			onClose={onClose}
			placement='bottom'
			maskClosable={false}
			zIndex={9999}
			open={open}>
			<div ref={flowContainerRef} className="reactflow-container" style={{ height: '100%' }}>
				<div className="reactflow-header">
					<Button type="default" onClick={handleOpenSave}>
						SAVE
					</Button>
					<Button type="default" onClick={handelReset}>
						RESET
					</Button>
					<Button type="default" onClick={handelRun}>
						RUN
					</Button>
				</div>
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
					zIndex={9999}
					maskClosable={false}
					open={openSetting}>
					<Form
						{...layout}
						form={form}
						name="control-hooks"
						onFinish={onFinish}
						onValuesChange={(changedValues) => {
							console.log("changedValues:::", changedValues)
							// 当 handleType 改变时，动态触发重新渲染
							if (changedValues.handleType) {
								setShowUseFaker(changedValues.handleType === 'input')
							}
							if (changedValues.useFaker !== undefined) {
								setShowFakerType(changedValues.useFaker)
							}
							if (changedValues.fakerType) {
								const { desc } = fakerStrategies[changedValues.fakerType]
								setDesc(desc)
							}

						}}
						style={{ maxWidth: 600 }}
					> {
							currentFrom.id === 'start'
								? <>
									<Form.Item name="newtab" label="打开新标签" rules={[{ required: true, }]}>
										<Radio.Group defaultValue={newTab} onChange={(e) => setNewTab(e.target.value)}>
											<Radio value="0">否</Radio>
											<Radio value="1">是</Radio>
										</Radio.Group>
									</Form.Item>
									{
										newTab === '1'
											? <Form.Item name="newtaburl" label="新标签URL" rules={[{ required: true, }]}>
												<Input />
											</Form.Item>
											: null
									}
								</>
								: <>
									{/* 隐藏的 argtype 字段 */}
									<Form.Item name="argtype" hidden>
										<Input />
									</Form.Item>
									<Form.Item name="label" label="描述" rules={[{ required: true, max: 8 }]}>
										<Input />
									</Form.Item>
									<Form.Item name="handleType" label="操作" rules={[{ required: true }]}>
										<Select placeholder="请选择操作类型" >
											<Option value="click">点击</Option>
											<Option value="input">输入</Option>
											<Option value="select">下拉选择操作</Option>
											<Option value="keydownevent">键盘按下[keyCode]</Option>
										</Select>
									</Form.Item>
									{
										showUseFaker && <Form.Item name="useFaker" label="使用 Faker 模式">
											<Radio.Group>
												<Radio value={false}>否</Radio>
												<Radio value={true}>是</Radio>
											</Radio.Group>
										</Form.Item>
									}

									{showFakerType && (
										<>
										<Form.Item name="fakerLocale" label="Faker">
												<Select placeholder="数据源">
													<Option  value="es">英文</Option>
													<Option  value="zh_CN">中文</Option>
												</Select>
											</Form.Item>
											<Form.Item name="fakerType" label="Faker">
												<Select placeholder="请选择 Faker" onChange={(value) => {
													console.log("请选择 Faker::", value)
													const { argtype } = fakerStrategies[value]
													form.setFieldsValue({ argtype: argtype })
												}}>
													{Object.entries(fakerStrategies).map(([key, { label }]) => (
														<Option key={key} value={key}>{label}</Option>
													))}
												</Select>
											</Form.Item>
										
											<p style={{ color: "#999", marginBottom: '24px' }}> {desc} </p>
										
										</>
									)}

									<Form.Item name="inputValue" label="值">
										<TextArea />
									</Form.Item>
								</>
						}


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
		<SaveDialog title="Save Replay Action" modalOpen={isMoadalOpen} onClose={handleCancel} onSave={handleSaveAction}></SaveDialog>
	</>
}