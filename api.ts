import { SAVE_REPLAY_TEXT, SEARCH_REPLAY_DATAS, RUN_ACTIONS, SAVE_TEMPORARY_DATA, GET_TEMPORARY_DATA } from "~actions/config";
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

export async function searchReplayDatas(domain: string) {
    return await request({ action: SEARCH_REPLAY_DATAS, domain }, (res) => res.datas)
}

export async function saveReplayAction(fromData) {
    await request({ action: SAVE_REPLAY_TEXT, datas: { ...fromData } })
}

export async function runActions(taskId, nextId, status, flowData, time = 0) {
	await request({ action: RUN_ACTIONS, datas: { taskId, nextId, status, flowData, time },  })
}


export async function saveTemporaryData(data) {
    await request({ action: SAVE_TEMPORARY_DATA, datas: { ...data } })
}

export async function getTemporaryData() {
    return await request({ action: GET_TEMPORARY_DATA })
}
