import { SAVE_REPLAY_TEXT, SEARCH_REPLAY_DATAS } from "~actions/config";
const request = (sendData, fn = null) => {
    return new Promise((resolve) => {
        console.log('requst---', sendData)
        chrome.runtime
            .sendMessage(sendData)
            .then(async (response) => {
                let result = response
                if (typeof fn === 'function') {
                    result = await fn(response)
                }
                resolve(result);
            })
            .catch((err) => {
                resolve([err, null]);
            });
    })
}

export async function saveReplayText(fromData) {
    await request({ action: SAVE_REPLAY_TEXT, datas: { ...fromData } })
}

export async function searchReplayText(domain: string) {
    return await request({ action: SEARCH_REPLAY_DATAS, domain }, (res) => res.datas)
}