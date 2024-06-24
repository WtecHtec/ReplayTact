import { Storage } from "@plasmohq/storage"
import { REPLAT_DATA } from "./config"
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
   console.log('bg---', datas)
   return Array.isArray(datas) ? datas.filter(item => item.domain === domain) : []
}