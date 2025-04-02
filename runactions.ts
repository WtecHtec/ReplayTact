import { openNewTab, runActions } from "~api"
import { fakerStrategies } from "~faker/config"
import { uuid } from "~uitls"
import { Faker, es, zh_CN } from '@faker-js/faker';

const LocaleMap = {
    'es': es,
    'zh_CN': zh_CN,
}
function getDom(selector, timeout = 1000, frequency = 60) {
    let current = 0
    return new Promise((resolve) => {
        const findEl = () => {
            current = current + 1
            console.log('current --- selector', selector, current)
            // const elDom = document.querySelector(selector)
            const elDom = document.evaluate(selector, document).iterateNext()
            if (elDom) {
                resolve(elDom)
                return
            }
            if (current > frequency) {
                console.log(`重复${frequency}次,没有找到`)
                resolve('')
                return
            }
            setTimeout(() => {
                findEl()
            }, timeout)
        }
        findEl()
    })
}

function requestAnimationFrameFn(fn) {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            fn()
            resolve(1)
        })
    })
}
async function handleClick(data) {
    const { xPath } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn(() => {
                var event = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
                el.dispatchEvent(event);
                el.click()
            })
        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}

async function handleInput(data) {
    const { xPath, inputValue, useFaker, fakerType, fakerLocale } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn(() => {
                console.log('inputValue', inputValue)
                const generateFakerData = fakerStrategies[fakerType].generate
                const argtype = fakerStrategies[fakerType].argtype

                let value = inputValue

                if (useFaker && typeof generateFakerData === 'function') {
                    let arg = inputValue
                    if (argtype === 'array') {
                        arg = inputValue.split(',').map(item => item.trim())
                        console.log('handleInput arg ====', arg)
                    }
                    const customFaker = new Faker({ locale: [LocaleMap[fakerLocale || 'es']] });
                    value = useFaker && typeof generateFakerData === 'function'
                        ? generateFakerData(customFaker, arg)
                        : inputValue; // 根据配置生成数据或使用默认值
                }

                console.log('handleInput value====', value)
                el.value = value
                var event = new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    data: inputValue
                });
                el.dispatchEvent(event);
            })
        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}

async function delay(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(1)
        }, time)
    })
}

async function handleKeyDownEvent(data) {
    const { xPath, inputValue } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn(() => {
                el.dispatchEvent(new KeyboardEvent('keydown', {
                    keyCode: Number(inputValue),
                    bubbles: true,
                    cancelable: true
                }))
            })
        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}


const waitTime  = (delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(1)
        }, delay || 1000)
    })
}
const handleSelect = async (data) => {
    const { xPath, inputValue } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn( async () => {
                el.dispatchEvent(new KeyboardEvent('keydown', {
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                }))
                await waitTime(1000)
                el.dispatchEvent(new KeyboardEvent('keydown', {
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                }))
                console.log('inputValue 回车2')
               
            })
          
        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}


const HANDEL_TYPE_EVENT = {
    'click': handleClick,
    'input': handleInput,
    'keydownevent': handleKeyDownEvent,
    'select': handleSelect
}

async function runAction(nodes, edges, startSource = 'start', taskId = '') {
    if (!Array.isArray(nodes) || !Array.isArray(edges)) return
    const cpNode = JSON.parse(JSON.stringify(nodes))
    const endId = 'end'
    return new Promise(async (resolve) => {
        // 单个链表
        let currentEdge = edges.find(item => item.source === startSource)

        if (!currentEdge) return
        if (startSource === 'start') {
            taskId = uuid()
            // 新开页面
            let currentNode = cpNode.find(item => item.id === startSource)
            if (currentNode.data.newtab === '1') {
                currentNode.data.newtab = '0'
                await openNewTab(taskId, { nodes: cpNode, edges }, currentNode.data.newtaburl, 'start', 1, new Date().getTime())
                return
            } else {
                await runActions(taskId, currentEdge.target, 1, { nodes, edges }, new Date().getTime())
            }
        }
        let currentNode = nodes.find(item => item.id === currentEdge.target)
        let status = 1
        while (currentEdge && currentNode) {
            const { data, id } = currentNode
            if (id === endId) {
                await runActions(taskId, currentEdge.target, 0, { nodes, edges })
                resolve(1)
                return
            }
            const { handleType } = data
            if (typeof HANDEL_TYPE_EVENT[handleType] === 'function') {
                //   await runActions(taskId,  currentEdge.target, 1, { nodes, edges }, new Date().getTime())
                // 1: 正常  -1: 未找到DOM 0: 处理失败
                status = await HANDEL_TYPE_EVENT[handleType](data)
                if ([0, -1].includes(status)) {
                    await runActions(taskId, currentEdge.target, -1, { nodes, edges })
                    resolve(status)
                    break
                }
            }
            await delay(1000)
            await runActions(taskId, currentEdge.target, 1, { nodes, edges }, new Date().getTime())
            currentEdge = edges.find(item => item.source === currentEdge.target)
            if (currentEdge) {
                currentNode = nodes.find(item => item.id === currentEdge.target)
            }
        }
        resolve(1)
    })
}

export default runAction
