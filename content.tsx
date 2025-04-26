import cssText from 'data-text:~content.css';
import cssCmdkText from 'data-text:~cmdk.css';
import cssInspectorText from 'data-text:~inspector.css';
import antdResetCssText from "data-text:antd/dist/reset.css"
import { StyleProvider } from "@ant-design/cssinjs"

import React, { useEffect, useState, useRef } from "react";
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from 'plasmo';

import { Faker, } from '@faker-js/faker';

import RelpayText from '~components/replaytext';
import CmdkLauncher from '~components/cmdklauncher';
import ActionEditor from '~components/actioneditor';
import FakerConfigDialog from '~components/fakerconfigdialog';
import FakerPopupSelector from '~components/fakerpopupselector';
import { Storage } from '@plasmohq/storage';
import runAction, { LocaleMap } from '~runactions';
import { BG_RUN_ACTION } from '~actions/config';
import { detachDebugger } from '~api';

const faker = new Faker({ locale: [LocaleMap['zh_CN']] });
const storage = new Storage();

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    all_frames: true,
    css: ["./inspector.css", "./inject.css"],
}
export const getStyle = () => {
    const style = window.document.createElement('style');
    style.textContent = antdResetCssText + cssText + cssCmdkText + cssInspectorText;
    return style;
};

const HOST_ID = "replay-engage-csui"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID


export default function InitContent() {
    const [fakerConfigVisible, setFakerConfigVisible] = useState(false);
    const [fakerPopupVisible, setFakerPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [slashTriggerEnabled, setSlashTriggerEnabled] = useState(true);
    const [slashTriggerDomains, setSlashTriggerDomains] = useState([]);
    // 添加一个引用来存储触发弹窗时的输入框元素
    const activeInputRef = useRef(null);
    // 添加鼠标位置状态
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    // 检查当前域名是否在允许列表中
    const isDomainAllowed = () => {
        // 如果域名列表为空，则允许所有域名
        if (slashTriggerDomains.length === 0) {
            return true;
        }
        
        const currentHostname = window.location.hostname;
        return slashTriggerDomains.some(domain => {
            // 检查当前域名是否匹配或是子域名
            return currentHostname === domain || 
                   currentHostname.endsWith('.' + domain);
        });
    };
    
    useEffect(() => {
        console.log('InitContent')
        // 从存储中加载设置
        const loadSettings = async () => {
            try {
                const enabled = await storage.get('slashTriggerEnabled');
                if (enabled !== undefined) {
                    setSlashTriggerEnabled(enabled === 'true');
                }
                
                const domains = await storage.get('slashTriggerDomains');
                if (domains) {
                    setSlashTriggerDomains(JSON.parse(domains));
                }
            } catch (error) {
                console.error('加载设置失败:', error);
            }
        };
        
        loadSettings();
        
        const handleMessage = async (message, sender, sendResponse) => {
            if (message.action === 'FakerConfig') {
                setFakerConfigVisible(true);
                sendResponse({ result: 'success' });
            } else if (['FakerName', 'FakerEmail', 'FakerPhone'].includes(message.action)) {
                applyFakerToActiveElement(message.action);
                sendResponse({ result: 'success' });
            } else if (message.action === 'FakerUserConfig') {
                // 处理用户自定义配置
                await applyUserFakerConfig(message.configId);
                sendResponse({ result: 'success' });
            } else if (message.action === 'refreshContextMenu') {
                // 静默刷新上下文菜单
                sendResponse({ result: 'success' });
            } else if (message.action === 'updateSlashTriggerSettings') {
                // 更新斜杠触发器设置
                setSlashTriggerEnabled(message.enabled);
                if (message.domains) {
                    setSlashTriggerDomains(message.domains);
                }
                sendResponse({ result: 'success' });
            } else if (message.action === BG_RUN_ACTION) {
                const { datas } = message;
				console.log('status---', datas)
				const status = await runAction(datas.flowData.nodes, datas.flowData.edges, datas.nextId, datas.taskId, datas.tabId)
				console.log('status---', status)
				if (status === -1) {
					message.warning('没有找到对应DOM')
				} else if (status === 0) {
					message.error('处理失败')
				}
				await detachDebugger(datas.tabId)
			}
            return true;
        };
        
        // 监听鼠标移动事件，记录鼠标位置
        const handleMouseMove = (event) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };
        
        // 监听输入事件，检测斜杠输入
        const handleKeyDown = (event) => {
            // 检查是否启用了斜杠触发器，以及当前域名是否允许
            if (!slashTriggerEnabled || !isDomainAllowed()) return;
            
            if (event.key === '/' && 
                (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) {
                // 阻止默认行为，不输入斜杠
                event.preventDefault();

                if (event.target.hasAttribute('autocomplete')) {
                    event.target.setAttribute('data-original-autocomplete', event.target.getAttribute('autocomplete'));
                }
                event.target.setAttribute('autocomplete', 'off');
                
                // 保存当前活动的输入框元素
                activeInputRef.current = event.target;
                
                // 使用鼠标位置计算弹窗位置
                setPopupPosition({
                    top: mousePosition.y + window.scrollY,
                    left: mousePosition.x + window.scrollX
                });
                
                // 显示弹出选择器
                setFakerPopupVisible(true);
            }
        };

        // 添加点击输入框事件处理
        const handleInputClick = (event) => {
            // 检查是否启用了斜杠触发器，以及当前域名是否允许
            if (!slashTriggerEnabled || !isDomainAllowed()) return;
            
            // 检查点击的是否为输入框或文本区域
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                // 检查输入框是否为空，只有在输入框为空时才显示弹窗
                if (!event.target.value) {
                    if (event.target.hasAttribute('autocomplete')) {
                        event.target.setAttribute('data-original-autocomplete', event.target.getAttribute('autocomplete'));
                    }
                    event.target.setAttribute('autocomplete', 'off');
                    
                    // 保存当前活动的输入框元素
                    activeInputRef.current = event.target;
                    
                    // 使用鼠标点击位置计算弹窗位置
                    setPopupPosition({
                        top: event.clientY + window.scrollY,
                        left: event.clientX + window.scrollX
                    });
                    
                    // 显示弹出选择器
                    setFakerPopupVisible(true);
                }
            }
        };
        
        // 添加滚动事件处理，更新弹窗位置
        const handleScroll = () => {
            if (fakerPopupVisible && activeInputRef.current) {
                // 在滚动时，使用最后记录的鼠标位置更新弹窗位置
                setPopupPosition({
                    top: mousePosition.y + window.scrollY,
                    left: mousePosition.x + window.scrollX
                });
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        chrome.runtime.onMessage.addListener(handleMessage);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleInputClick);
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            chrome.runtime.onMessage.removeListener(handleMessage);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleInputClick);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [slashTriggerEnabled, fakerPopupVisible]);
    // mousePosition, slashTriggerDomains
    
    const applyFakerToActiveElement = (fakerType) => {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            let value = '';
            
            switch (fakerType) {
                case 'FakerName':
                    value = faker.person.fullName();
                    break;
                case 'FakerEmail':
                    value = faker.internet.email();
                    break;
                case 'FakerPhone':
                    value = faker.phone.number({ style: 'international' })
                    break;
            }
            
            activeElement.value = value;
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
    
    // 在 handleFakerSelect 函数中添加对默认配置的处理
    const handleFakerSelect = async (config) => {
        console.log('handleFakerSelect', config);
        if (!config) return;
        
        // 使用保存的输入框元素
        const targetElement = activeInputRef.current;
        if (!targetElement) {
            console.error('没有找到目标输入框');
            return;
        }
        
        try {
            // 处理默认配置项
            if (config.isDefault && config.value) {
                // 直接使用预生成的值
                targetElement.value = config.value;
                targetElement.dispatchEvent(new Event('input', { bubbles: true }));
                targetElement.focus();
                return;
            }
            
            // 处理用户自定义配置
            const userConfigsStr = await storage.get('fakerUserConfigs');
            if (!userConfigsStr) return;
            
            const userConfigs = JSON.parse(userConfigsStr);
            const selectedConfig = userConfigs.find(c => c.id === config.id);
            if (!selectedConfig) return;
            
            const { fakerType, fakerLocale, args } = selectedConfig;
            const { Faker } = await import('@faker-js/faker');
            const { fakerStrategies } = await import('~faker/config');
            const { LocaleMap } = await import('~runactions');
            
            const strategy = fakerStrategies[fakerType];
            if (!strategy) return;
            
            const customFaker = new Faker({ locale: [LocaleMap[fakerLocale || 'zh_CN']] });
            let parsedArgs = args;
            
            if (strategy.argtype === 'array' && args) {
                parsedArgs = args.split(',').map(item => item.trim());
            }
            
            const value = strategy.generate(customFaker, parsedArgs || []);
            
            // 将值设置到保存的输入框元素
            targetElement.value = value;
            targetElement.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 可选：将焦点重新设置到输入框
            targetElement.focus();
        } catch (error) {
            console.error('应用 Faker 配置失败:', error);
        }
    };
    
    // 保留原来的函数以兼容其他调用
    const applyUserFakerConfig = async (configId) => {
        const activeElement = document.activeElement;
        console.log('applyUserFakerConfig', activeElement);
        if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')) {
            return;
        }
        
        try {
            const userConfigsStr = await storage.get('fakerUserConfigs');
            console.log('userConfigsStr', userConfigsStr, configId);
            if (!userConfigsStr) return;
            
            const userConfigs = JSON.parse(userConfigsStr);
            const config = userConfigs.find(c => c.id === configId);
            if (!config) return;
            
            const { fakerType, fakerLocale, args } = config;
            const { Faker } = await import('@faker-js/faker');
            const { fakerStrategies } = await import('~faker/config');
            const { LocaleMap } = await import('~runactions');
            
            const strategy = fakerStrategies[fakerType];
            if (!strategy) return;
            
            const customFaker = new Faker({ locale: [LocaleMap[fakerLocale || 'zh_CN']] });
            let parsedArgs = args;
            
            if (strategy.argtype === 'array' && args) {
                parsedArgs = args.split(',').map(item => item.trim());
            }
            
            const value = strategy.generate(customFaker, parsedArgs || []);
            
            activeElement.value = value;
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (error) {
            console.error('应用用户 Faker 配置失败:', error);
        }
    };

    const handleClosePopup = () => {
        setFakerPopupVisible(false);
        
        // 恢复输入框的原始属性
        if (activeInputRef.current) {
            if (activeInputRef.current.hasAttribute('data-original-autocomplete')) {
                const originalValue = activeInputRef.current.getAttribute('data-original-autocomplete');
                activeInputRef.current.setAttribute('autocomplete', originalValue);
                activeInputRef.current.removeAttribute('data-original-autocomplete');
            } else {
                activeInputRef.current.removeAttribute('autocomplete');
            }
        }
    };

    return (
        <> 
      
            <ActionEditor></ActionEditor>
            <StyleProvider container={document.getElementById(HOST_ID).shadowRoot}>
             <CmdkLauncher></CmdkLauncher>
            </StyleProvider>
            <RelpayText></RelpayText>
            <FakerConfigDialog 
                visible={fakerConfigVisible} 
                onClose={() => setFakerConfigVisible(false)} 
            />
            <FakerPopupSelector
                visible={fakerPopupVisible}
                position={popupPosition}
                onSelect={handleFakerSelect}
                onClose={handleClosePopup} // 使用新的关闭处理函数
            />
       
        </>
    )
}