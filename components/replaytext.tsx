
import { Modal, Button, Form, Input } from 'antd';
import React from 'react';
import { useEffect, useState } from 'react';
import { saveReplayText } from '~api';
import { getDomain, uuid } from '~uitls';
import SaveDialog from './savedialog';
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
        const domain = getDomain()
        const id = uuid()
        await  saveReplayText({ ...values, domain, id, datas: cacheData, type: 'text' })
        handleCancel()
    }
    const handleCancel = () => {
        setIsModalOpen(false)
    }
    return <>
        <SaveDialog title="Save Replay Text" modalOpen={isModalOpen} onSave={onFinish}></SaveDialog>
    </>
}