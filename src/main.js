import { Screen } from './components/screen'
import { Raycaster } from './components/raycaster'
import { default as domEvent } from './components/domEvents'
import { default as nodeElement } from './components/nodeElement'
import { default as linkeElement } from './components/linkElement'
import { default as categoryElement } from './components/categoryElement'
import * as d3 from 'd3-force'
import json from './assets/data3.json'

console.log(window.performance.now(),"开始运行时间")

console.time("category创建完毕")
json.legend.map(category => {
	new categoryElement(name = category)
})
console.timeEnd("category创建完毕")

console.time("node创建完毕")
json.nodes.map(node => {
	let { category,name } = node
	new nodeElement(node)
})
console.timeEnd("node创建完毕")
console.log("node数量",json.nodes.length)

// json.links.map(link => {
//     new linkeElement(link)
// })


console.time("line创建完毕")
const deviceMap = new Map()
//合并数据
json.links.map(link => {
    let { source,target,name } = link,
        lineElment = new linkeElement(link)
    //设备与手机号一一对应时候 合并
    if(name === "USE"){
        //deviceMap.has(target)? "dup" : source
        deviceMap.set(target,{ sourceName:source,lineElment,state:deviceMap.has(target)? "dump" : "inner" })
    }
})
console.timeEnd("line创建完毕")
console.log("line数量",json.links.length)


console.time("数据合并完毕")
//合并节点
for(let [target,{ sourceName:source,lineElment,state }] of deviceMap.entries()){
    if(state === "dump" || !nodeElement.Nodes.has(source) || !nodeElement.Nodes.has(target)){ continue }
    let sourceNode = nodeElement.Nodes.get(source),
        targetNode = nodeElement.Nodes.get(target),
        devices = sourceNode.force("devices")
    if(!devices){ sourceNode.force("devices",devices = new Map) }
    devices.set(target,targetNode)
    //nodeElement.Nodes.delete(targetNode.name)
    nodeElement.Nodes.visible = false
}
//重置点对点
linkeElement.Line.forEach((link,name) => {
    let { source,target } = link,
        sourceDevice = deviceMap.get(source),
        targetDevice = deviceMap.get(target)
    if(sourceDevice && sourceDevice.state !== "dump"){
        link.source = sourceDevice.sourceName
    }
    if(targetDevice && targetDevice.state !== "dump"){
        link.target = targetDevice.sourceName
    }
})
console.timeEnd("数据合并完毕")


const nodes = nodeElement.NodesArray,
      fix = ((nodes.length / 1000) >> 0) + 1,
      distanceMax = fix * 120, distanceMin = 0, distance = 50,
      width = window.innerWidth,height = window.innerHeight,
      screen = new Screen(width,height),
      screenEvent = new domEvent()

//设置相机焦距
screen.setCamera({ zoom: 2 / fix  })


const simulation = d3.forceSimulation(nodes),
    simulationLink = d3.forceLink(linkeElement.LinksArray),
    simulationCollide = d3.forceCollide(1),
    simulationCenter = d3.forceCenter(width / 2, height / 2),
    simulationManyBody = d3.forceManyBody()

  simulation.force('link', simulationLink.id(d => d.name).distance(distance))
    .force('charge', simulationManyBody.distanceMax(distanceMax).distanceMin(distanceMin))
    .force("collision", simulationCollide.radius(8))
    .force('center', simulationCenter)



nodeElement.CircleArray.map(circle => {
    let node = nodeElement.CircleMap.get(circle)
    screen.scene.add(circle)
    node.visible = node.level <= 2
})
linkeElement.LineArray.map(line => screen.scene.add(line))
screen.force('domEvent',screenEvent)
//单击选中元素
screenEvent.on('tap',({ object,position }) => {
    console.log("tap",object,position,nodeElement.CircleMap.get(object))
})
//移动元素
.on('move',({ object,newPosition,oldPosition }) => {
    //选中的不属于节点的时候 不移动
    if(!Object.hasOwnProperty.call(object,"geometry") || object.geometry.type !== "CircleBufferGeometry"){ return }
    let node = nodeElement.CircleMap.get(object),
        vx = newPosition.x - node.x,
        vy = newPosition.y - node.y
    node.x = newPosition.x,node.y = newPosition.y
    node.roundNodes.forEach(roundNode => {
        roundNode.x += vx,
        roundNode.y += vy
    })
})







