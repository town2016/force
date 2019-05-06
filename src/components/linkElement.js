import { default as linkElement } from '../common/links'
import { default as nodeElement } from '../common/nodes'
import * as THREE from 'three'


const LINES = new Map()
const propLineName = Symbol("line")
const propSourceName = Symbol('source')
const propTargetName = Symbol('target')

const createLine = (color = "0xAAAAAA", opacity = .8, point1 = new THREE.Vector3(0, 0, -1), point2 = new THREE.Vector3(0, 0, -1)) => {
	let line = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({ color: Math.floor(color), opacity }))
	point1 = point1.isVector3 ? point1 : new THREE.Vector3(point1.x || 0, point1.y || 0, -2)
	point2 = point2.isVector3 ? point2 : new THREE.Vector3(point2.x || 0, point2.y || 0, -2)
	line.geometry.vertices.push(point1, point2)
	return line
}
export default class extends linkElement{
	static createLine(){ return createLine(...arguments) }
	static get Line(){ return LINES }
	static get LineArray(){ return Array.from(new Set(LINES.values())) }


	constructor(){
		super(...arguments)
		this[propLineName] = createLine()
		//非载体 可以避免因为相机问题而不展示
    	this[propLineName].frustumCulled = false
		LINES.set(this.name,this[propLineName])
	}

	//点和点 已经准备完毕
	processReady(){
		this.source.Children = this.target
		this.target.Parents = this.source
	}


	//当sourceNode更新坐标
	sourceUpdate(node){
		let line = this[propLineName]
		line.geometry.verticesNeedUpdate = true
    	line.geometry.vertices[0] = new THREE.Vector3(node.x, node.y, line.geometry.vertices[0].z)
	}
	//当targetNode更新坐标
	targetUpdate(node){
		let line = this[propLineName]
		line.geometry.verticesNeedUpdate = true
    	line.geometry.vertices[1] = new THREE.Vector3(node.x, node.y, line.geometry.vertices[1].z)
	}

	//当sourceNode隐藏时候
	sourceVisible(node){
		//单边节点被隐藏 则线条隐藏
		this.visible = this.source.visible && this.target.visible
	}
	//当targetNode隐藏的时候
	targetVisible(node){
		//单边节点被隐藏 则线条隐藏
		this.visible = this.source.visible && this.target.visible
	}

	//sourceNode
	get source(){
		return this[propSourceName] || ''
	}
	set source(value){
		if(typeof value === "string"){ return this[propSourceName] = value }
		if(!(value instanceof nodeElement)){ return } 
		this[propSourceName] = value

		value.Event && value.Event
			.on('update',this.sourceUpdate.bind(this))
			.on('visible',this.sourceVisible.bind(this))

		if(this.target instanceof nodeElement && this.source instanceof nodeElement){
			this.processReady()
		}
	}

	//targetNode
	get target(){
		return this[propTargetName] || ''
	}
	set target(value){
		if(typeof value === "string"){ return this[propTargetName] = value }
		if(!(value instanceof nodeElement)){ return } 
		this[propTargetName] = value

		value.Event && value.Event
			.on('update',this.targetUpdate.bind(this))
			.on('visible',this.targetVisible.bind(this))

		if(this.target instanceof nodeElement && this.source instanceof nodeElement){
			this.processReady()
		}
	}

	//是否展示
	get visible(){
		return this[propLineName].visible
	}
	set visible(value){
		this[propLineName].visible = !!value
	}
}