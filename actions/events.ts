import { saveReplayText, searchReplayText } from "~storage";

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