import React, { useEffect } from 'react'
import { Command } from 'cmdk'
import { searchReplayText } from '~api'
import { getDomain } from '~uitls'

const domain = getDomain()

export default function CmdkLauncher() {

    const [open, setOpen] = React.useState(false)
    const getReplayDatas = async () => {
        const datas = await searchReplayText(domain)
        console.log('getReplayDatas---', datas)
    }
    useEffect(() => {
        const handle = (message) => {
            const { action } = message
            if (action === 'active_extention_launcher') {
                setOpen(!open)
                if (!open) {
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
    return <>
        <div className="cmdk-wrapper-container">
            {
                open ? <Command>
                    <div className="cmdk-header-wrapper">
                        <div className="totips">{domain}</div>
                        <Command.Input />
                    </div>
                    <Command.List>
                        <Command.Empty>No results found.</Command.Empty>
                        <Command.Item>a</Command.Item>
                        <Command.Item>b</Command.Item>
                        <Command.Item>c</Command.Item>
                        <Command.Item>Apple</Command.Item>
                    </Command.List>
                </Command>
                    : null
            }
        </div>

    </>
}