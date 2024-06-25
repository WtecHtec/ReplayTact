import { ACTICON_MAP } from "~actions";

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
        contexts: ['page','selection'],
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

bindOnMessage()
bindContextMenu()
bindCommand()