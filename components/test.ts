// const actions =  {
//     "nodes":[
//         {"width":150,"height":39,"id":"start","type":"input","data":{"label":"开始"},"position":{"x":250,"y":50},"positionAbsolute":{"x":250,"y":50}},
//         {"width":150,"height":39,"id":"end","type":"output","data":{"label":"结束"},"position":{"x":250,"y":450},"positionAbsolute":{"x":250,"y":450}},
//         {"width":150,"height":36,"id":"945A8DF0","data":{"label":"88695A48","xPath":".login-button","handleType":"click","inputValue":""},"position":{"x":250,"y":150},"positionAbsolute":{"x":250,"y":150}},
//         {"width":150,"height":36,"id":"8CAF6818","data":{"label":"AB19184E","xPath":".number-input","handleType":"input","inputValue":"15277328748"},"position":{"x":250,"y":250},"positionAbsolute":{"x":250,"y":250}},
//         {"width":150,"height":36,"id":"728D5F01","data":{"label":"75010AFE","xPath":".send-vcode-btn","handleType":"click","inputValue":""},"position":{"x":250,"y":350},"positionAbsolute":{"x":250,"y":350}}
//     ],
//         "edges":[
//             {"id":"F592C334","source":"start","target":"945A8DF0","animated":true,"type":"plusedge"},
//             {"id":"66447B8B","source":"945A8DF0","target":"8CAF6818","animated":true,"type":"plusedge"},
//             {"id":"EBC86B87","source":"8CAF6818","target":"728D5F01","animated":true,"type":"plusedge"},
//             {"id":"17FDFCBD","source":"728D5F01","target":"end","animated":true,"type":"plusedge"}
//         ],
//         "viewport":{"x":200,"y":50,"zoom":0.6}
//     }


const actions = {
    "nodes":[
        {"width":150,"height":39,"id":"start","type":"input","data":{"label":"开始"},"position":{"x":250,"y":50},"positionAbsolute":{"x":250,"y":50}},
        {"width":150,"height":39,"id":"end","type":"output","data":{"label":"结束"},"position":{"x":250,"y":350},"positionAbsolute":{"x":250,"y":350}},
        {"width":150,"height":36,"id":"01978E81","data":{"label":"55AD3B45","xPath":".search-input","handleType":"input","inputValue":"react workflow"},"position":{"x":250,"y":150},"positionAbsolute":{"x":250,"y":150}},
        {"width":150,"height":36,"id":"C37A9A8D","data":{"label":"DF377BF7","xPath":".seach-icon-container","handleType":"click","inputValue":"13"},"position":{"x":250,"y":250},"positionAbsolute":{"x":250,"y":250}}],
        "edges":[{"id":"A16ED5C6","source":"start","target":"01978E81","animated":true,"type":"plusedge"},{"id":"6FCCA849","source":"01978E81","target":"C37A9A8D","animated":true,"type":"plusedge"},{"id":"988139AD","source":"C37A9A8D","target":"end","animated":true,"type":"plusedge"}],"viewport":{"x":256.2663077241665,"y":-15.85763097949885,"zoom":0.5653344377717954}}

export default {
    id: 'ooooiiooooo',
    type: 'action',
    name: '测试',
    description: '测试',
    datas: actions
}