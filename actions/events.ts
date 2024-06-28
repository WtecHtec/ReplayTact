import GlobalState from "~bgglobalstate";
import { getTemporaryData, saveReplayText, saveTemporaryData, searchReplayText } from "~storage";

export async function handleSaveReplayText(message) {
    const { request, sendResponse } = message
    const { datas  } = request
    await saveReplayText(datas)
    sendResponse({ statue: true });
}


export async function handleSearchReplay(message) {
    const { request, sendResponse } = message
    const { domain } = request
    const datas = await searchReplayText(domain)
    sendResponse({ datas });
}

export async function handleRunActions(message) {
	const { request, sendResponse } = message
	const { datas } = request
	const actionData = GlobalState.instance.get('action') || []
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true })

	if (Array.isArray(tabs) && tabs.length && Array.isArray(actionData)) {
		const actionIndex = actionData.findIndex(item => item.taskId === datas.taskId)
		if (datas.status !== 1 ) {
			actionIndex > -1 && actionData.splice(actionIndex, 1, )
			return
		}
		if (actionIndex > -1) {
			actionData.splice(actionIndex, 1, { ...datas, tabId: tabs[0].id, })
		} else {
			actionData.push({ ...datas, tabId: tabs[0].id })
		}
	}
	const result = GlobalState.instance.set('action', actionData)
	sendResponse({ result });
}



export async function handelSaveTemproaryData(message) {
	const { request, sendResponse } = message
	const { datas } = request
    await saveTemporaryData(datas)
	sendResponse({ result: true });
}

export async function handelGetTemproaryData(message) {
	const { sendResponse } = message
    const datas = await getTemporaryData()
	sendResponse({ datas });
}