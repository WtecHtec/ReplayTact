import React, { useEffect } from 'react'
import { Command } from 'cmdk'
import { message } from 'antd';
import { searchReplayDatas } from '~api'
import { getDomain } from '~uitls'
import runAction from '~runactions';
import TextSvg from 'data-base64:~assets/text.svg'
import ActionSvg from 'data-base64:~assets/action.svg'
import TestAction from './test'
const domain = getDomain()
let cacheEl = null
export default function CmdkLauncher() {
    const [_, contextHolder] = message.useMessage();
    const [open, setOpen] = React.useState(false)
    const [replayDatas, setReplayDatas] = React.useState([])
    const getReplayDatas = async () => {
        const datas = await searchReplayDatas(domain) as any
        datas.push(TestAction)
        console.log('getReplayDatas', datas)
        setReplayDatas(datas)
    }
    useEffect(() => {
        const handle = (message) => {
            const { action } = message
            if (action === 'active_extention_launcher') {
                setOpen(!open)
                if (!open) {
                    cacheEl = document.activeElement as any
                    getReplayDatas()
                }
            }
        }
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                setOpen(false)
            }
        }
        window.addEventListener('keydown', handleEscape)
        chrome.runtime.onMessage.addListener(handle)
        return () => {
            chrome.runtime.onMessage.removeListener(handle)
            window.removeEventListener('keydown', handleEscape)
        }
    }, [open])

    const handleEventText = (data) => {
        if (cacheEl.tagName  && cacheEl.tagName.toLowerCase() === 'input' || cacheEl.tagName.toLowerCase === 'textarea') {
            cacheEl.value = data
            message.info('处理完成！')
        } else {
            navigator.clipboard.writeText(data)
            message.info('复制完成！')
        }
    }

    const handleEventAction = async (data) => {
        const { nodes, edges } = data
        const status = await runAction(nodes, edges)
        if (status === -1) {
            message.warning('没有找到对应DOM')
        } else if (status === 0) {
            message.error('处理失败')
        }
    }
    const handelCommandItem = (value) => {
        console.log('handelCommandItem', value)
        setOpen(false)
        const { type, datas } = replayDatas.find(item => item.id === value)
        if (type === 'action') {
            console.log(type, datas)
            handleEventAction(datas)
        }
        else if (type === 'text') {
            handleEventText(datas)
        }
    }
    return <>
        {contextHolder}
        <div className="cmdk-wrapper-container">
            {
                open ? <Command>
                    <div className="cmdk-header-wrapper">
                        <div className="totips">{domain}</div>
                        <Command.Input />
                    </div>
                    <Command.List>
                        <Command.Empty>No results found.</Command.Empty>
                        {
                            replayDatas.map((item) => <Command.Item  key={item.id} value={item.id}
                                onSelect={handelCommandItem}
                                keywords={[item.name, item.description, typeof item.datas === 'string' ? item.datas : JSON.stringify(item.datas) ]}>
                                {
                                    item.type === 'action'
                                        ? <img className="cmdk-item-icon" src={ActionSvg} ></img>
                                        : <img className="cmdk-item-icon" src={TextSvg}></img>
                                }
                                <div className="cmdk-item-content">
                                    <div className="cmdk-item-title">{item.name}</div>
                                    <div className="cmdk-item-description">{item.description}</div>
                                </div>
                            </Command.Item>)
                        }
                    </Command.List>
                </Command>
                    : null
            }
        </div>

    </>
}