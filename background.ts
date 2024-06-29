import { ACTICON_MAP } from "~actions";
import { BG_RUN_ACTION } from "~actions/config";
import GlobalState from "~bgglobalstate";
const MAX_WAIT_TIME = 4 * 1000
/**
 *  注册鼠标右击事件
 */
function bindContextMenu() {
    const parent = chrome.contextMenus.create({
        title: 'ReplayTact',
        id: 'ReplayTact',
        contexts: ['page', 'selection'],
    });

    // 创建子菜单【文案】
    chrome.contextMenus.create({
        id: 'ReplayText',
        title: 'Replay Text',
        parentId: 'ReplayTact', // 设置为顶级菜单项的ID来模拟父子关系  
        contexts: ['selection'],
    });
    // 创建子菜单【action】
    chrome.contextMenus.create({
        id: 'ReplayAction',
        title: 'Replay Action',
        parentId: 'ReplayTact', // 设置为顶级菜单项的ID来模拟父子关系  
        contexts: ['page', 'selection'],
    });

    chrome.contextMenus.onClicked.addListener(function (info, tab) {
        switch (info.menuItemId) {
            case 'ReplayText':
            case 'ReplayAction':
                const { selectionText } = info
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    // 向content.js发送消息
                    chrome.tabs.sendMessage(tabs[0].id, { action: info.menuItemId, data: selectionText }, function (response) {
                        console.log(response?.result);
                    });
                });
                break;
            default:
                console.log('---')
        }
    });
}
/**
 * bg 监听事件
 */
function bindOnMessage() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        // 获取插件列表
        const { action } = request;
        console.log('bg --- request', request)
        if (typeof ACTICON_MAP[action] === 'function') {
            ACTICON_MAP[action]({ request, sender, sendResponse });
        } else {
            console.log('No found ACTICON_MAP action---->', action);
        }
        return true; // 表示我们将异步发送响应
    });
}

/**
 * 绑定 快捷键事件
 */
function bindCommand() {
    chrome.commands.onCommand.addListener((command) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: command }, function (response) {
                console.log(response?.result);
            });
        });
    });
}

function delay(time) {
		return new  Promise((resolve) => {
				setTimeout(() => {
						resolve(1)
				}, time)
		})
}

function bindTabUpdate() {
    chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
        const actions = GlobalState.instance.get('action') || []
        // 刷新时间
        const actionIdx = actions.findIndex(item => (item.tabId === tabId || item.taskId === tab.openerTabId) && item.status === 1)
        if (actionIdx > -1) {
            const reashTimeAction = { ...actions[actionIdx], time: new Date().getTime() }
            actions.splice(actionIdx, 1, reashTimeAction)
        }
        if (changeInfo.status === 'complete') {
						// await delay(2000)
            let action = actions.find(item => {
                const modTime = new Date().getTime() - item.time 
                // console.log('item.taskId === tab.openerTabId', item.tabId , tabId, item.status , modTime,tab.openerTabId)
                if (item.tabId === tab.openerTabId) {
                    return item.status === 1  &&  modTime < 30 * 1000
                }
                return (item.tabId === tabId || item.tabId === tab.openerTabId) && item.status === 1 && modTime < MAX_WAIT_TIME
            } )
            // console.log('tabId', tabId, 'changeInfo', changeInfo, 'tab', tab, 'action', actions, 'action', action )
            console.log('item.taskId === tab.openerTabId', action)
				
            if (action) {
                chrome.tabs.sendMessage(tabId, { action: BG_RUN_ACTION, datas: action }, function (response) {
                    console.log(response?.result);
                });
                // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                //     console.log('tab', tabs, 'action', action)
                // 	chrome.tabs.sendMessage(tabs[0].id, { action: BG_RUN_ACTION, datas: action }, function (response) {
                // 			console.log(response?.result);
                // 	});
                // });
            } else {
							const openNewTabDatas = GlobalState.instance.get('openNewTab') || []
							console.log('openNewTabDatas---', openNewTabDatas)
							const tabActionIdx = openNewTabDatas.findIndex(item => item.tabId === tabId)
							if (tabActionIdx > -1) {
								chrome.tabs.sendMessage(tabId, { action: BG_RUN_ACTION, datas: openNewTabDatas[tabActionIdx].action }, function (response) {
									console.log(response?.result);
									openNewTabDatas.splice(tabActionIdx, 1)
									GlobalState.instance.set('openNewTab', openNewTabDatas)
								});
							
							}
						}
        }
    })
}
bindOnMessage()
bindContextMenu()
bindCommand()
bindTabUpdate()