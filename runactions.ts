
function getDom(selector, timeout = 500, frequency = 20) {
    let current = 0
    return new  Promise((resolve) => {
        const findEl = () => {
            current = current + 1
            console.log('current --- selector', selector, current)
            const elDom = document.querySelector(selector)
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
                // el.click()
            })
        } catch (error) {
            return 0
        }
        return 1
    }
    return -1
}

async function handleInput(data) {
    const { xPath, inputValue } = data
    const el = await getDom(xPath) as any;
    if (el) {
        try {
            el.focus()
            await requestAnimationFrameFn(() => {
                console.log('inputValue', inputValue)
                el.value = inputValue
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
    return new  Promise((resolve) => {
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
                    keyCode: Number(inputValue) ,
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

const HANDEL_TYPE_EVENT = {
    'click': handleClick,
    'input': handleInput,
    'keydownevent': handleKeyDownEvent,
}

async function runAction(nodes, edges) {
    if (!Array.isArray(nodes) || !Array.isArray(edges)) return
    const startSource = 'start'
    const endId = 'end'
    return new  Promise(async (resolve) => {
        // 单个链表
        let currentEdge = edges.find(item => item.source === startSource)
        console.log('currentEdge', currentEdge)
        if (!currentEdge) return
        let currentNode = nodes.find(item => item.id === currentEdge.target)
        console.log('currentNode', currentNode)
        let status = 1
        while(currentEdge && currentNode) {
            console.log('currentEdge loop', currentEdge)
            console.log('currentNode loop', currentNode)
            const { data, id } = currentNode
            if (id === endId) {
                resolve(1)
                return
            }
            const { handleType } = data
            if (typeof HANDEL_TYPE_EVENT[handleType] === 'function') {
                // 1: 正常  -1: 未找到DOM 0: 处理失败
                status = await  HANDEL_TYPE_EVENT[handleType](data)
                if ([0, -1].includes(status)) {
                    resolve(status)
                    break
                } 
            }
            await delay(1000)
            currentEdge = edges.find(item => item.source === currentEdge.target)
            if (currentEdge) {
                currentNode = nodes.find(item => item.id === currentEdge.target)
            }
        }
        resolve(1)
    })
}

export default runAction