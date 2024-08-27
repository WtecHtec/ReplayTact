import { Storage } from "@plasmohq/storage"
import { REPLAT_DATA, TEMPORARY_DATA } from "./config"
const storage = new Storage({
    area: "local"
})

export async function saveReplayText(data) {
    let datas = await storage.get(REPLAT_DATA) as any || []
    datas = [...datas, data]
    return storage.set(REPLAT_DATA, datas)
}

export function getReplayText() {
    return storage.get(REPLAT_DATA)
}
export async function searchReplayText(domain) {
   let datas = await storage.get(REPLAT_DATA)
	 let filterDatas = Array.isArray(datas) ?  datas.filter(item => item.domain === domain) : []
	 const setDatas = new Set([...filterDatas, ...( Array.isArray(datas) ? datas : [])])
   return [...setDatas]
}

export function saveTemporaryData(data) {
    return storage.set(TEMPORARY_DATA, data)
}

export function getTemporaryData() {
    return storage.get(TEMPORARY_DATA)
}