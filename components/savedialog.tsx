

import { Button, Form, Input, Modal } from "antd"
import React, { useEffect, useState } from "react"

export default function SaveDialog({title = 'Replay Text', modalOpen = false, onClose=() => {},  onSave = (values) => {}}) {

    const [isModalOpen, setIsModalOpen] = useState(modalOpen);

    useEffect(() => {
        setIsModalOpen(modalOpen)
    }, [modalOpen])

    const onFinish = async (values) => {
        if (typeof onSave === 'function') { 
            await onSave(values)
        }
        handleCancel()
    }
    const handleCancel = () => {
        setIsModalOpen(false)
        typeof onClose === 'function' && onClose()
    }
    return <>
        <Modal title={title} maskClosable={false} onCancel={handleCancel} open={isModalOpen} footer={null}>
            <Form
                name="basic"
                wrapperCol={{ span: 16 }}
                initialValues={{ name: '', description: '' }}
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