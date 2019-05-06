import { default as nodeElement } from '../common/nodes'
import { default as categoryMap } from '../common/category'
import * as THREE from 'three'


const CIRCLE = new Map()
const NODEMAP = new Map()
const propXName = Symbol("x")
const propYName = Symbol("y")
const propCircleName = Symbol("circle")

const createCircle = (size = 5,color = Math.floor("0x000000")) => new THREE.Mesh(new THREE.CircleBufferGeometry(size, 32), new THREE.MeshBasicMaterial({ color }))
export default class extends nodeElement{
	static createCircle(){ return createCircle(...arguments) }
	static get Circle(){ return CIRCLE }
	static get CircleMap(){ return NODEMAP }
	static get CircleArray(){ return Array.from(new Set(CIRCLE.values())) }

	constructor(){
		super(...arguments)
		CIRCLE.set(this.name,this[propCircleName] = createCircle())
		//非载体 可以避免因为相机问题而不展示
    	this[propCircleName].frustumCulled = false
		//反向映射
		NODEMAP.set(this[propCircleName],this)

		categoryMap.Categorys.has(this.category) && 
			this.force('category',categoryMap.Categorys.get(this.category))
	}

	update(){
		//不展示的时候 不消耗资源
		if(!this.visible){ return }
		let { x,y,z } = this[propCircleName].position
		this[propCircleName].position.set(this.x || x,this.y || y,z)
		this.Event.emit('update',this)
	}

	get Circle(){
		return this[propCircleName]
	}

	get x(){
		return this[propXName]
	}
	set x(value){
		if(isNaN(value)){ return }
		let prevNum = this[propXName]
		this[propXName] = Number(value)
		prevNum !== this[propXName] && this.update()
	}

	get y(){
		return this[propYName]
	}
	set y(value){
		if(isNaN(value)){ return }
		let prevNum = this[propYName]
		this[propYName] = Number(value)
		prevNum !== this[propYName] && this.update()
	}

	get visible(){
		return this.Circle.visible
	}
	set visible(value){
		this.Circle.visible = !!value
		//展示的时候 update 一次
		//因为隐藏的时候 坐标不跟新
		this.visible && this.update()
		this.Event.emit('visible',this)
	}
}