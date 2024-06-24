
import { Modal, Button, Form, Input } from 'antd';
import React from 'react';
import { useEffect, useState } from 'react';
import { saveReplayText } from '~api';
import { getDomain, uuid } from '~uitls';
let cacheData = ''
export default function RelpayText() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        const handle = (message) => {
            console.log(message)
            const { action, data } = message
            cacheData  = data
            if (action === 'ReplayText') {
                setIsModalOpen(true)
            }
        }
        chrome.runtime.onMessage.addListener(handle)
        return () => {
            chrome.runtime.onMessage.removeListener(handle)
        }
    }, [])
    const onFinish = async (values) => {
        console.log(values, cacheData)
        const domain = getDomain()
        const id = uuid()
        await  saveReplayText({ ...values, domain, id, datas: cacheData, type: 'text' })
        handleCancel()
    }
    const handleCancel = () => {
        setIsModalOpen(false)
    }
    return <>
        <Modal title="Replay Text" maskClosable={false} onCancel={handleCancel} open={isModalOpen} footer={null}>
            <Form
                name="basic"
                wrapperCol={{ span: 16 }}
                initialValues={{ name: '', description: ''}}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="名称"
                    name="name"
                    rules={[{ required: true, message: 'Please input repaly name!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="描述"
                    name="description"
                    rules={[{ required: true, message: 'Please input repaly description!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    </>
}