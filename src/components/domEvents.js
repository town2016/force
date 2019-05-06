import * as THREE from 'three'
import { EventEmitter } from 'events'
import { classAttribute } from '../decorator/classAttribute'
import { Raycaster } from './raycaster.js'
import { default as base } from '../common/element'

//renderer
@classAttribute('renderer','object',new THREE.WebGLRenderer({ antialias: true,precision: 'highp',alpha: true }))
//声明式
@classAttribute('camera','object',null)
//声明式
@classAttribute('controls','object',null)
//屏幕
@classAttribute('scene','object',() => new THREE.Scene)
//查询坐标辅助
@classAttribute('raycaster',v => v instanceof Raycaster,function (){
	return new Raycaster(/*{ camera:this.camera,renderer:this.renderer }*/)
})
//事件
@classAttribute('emitter',null,new EventEmitter)
//设置判断可以移动的毫秒
@classAttribute('sleep','number',50)
export class domEvents extends base{
	constructor(){
		super(...arguments)
	}

	//初始化
	initialize(slot = {}){
		let { camera = null,renderer = null,scene = null,controls = null } = slot
		this.camera = camera
		this.renderer = renderer
		this.scene = scene
		this.controls = controls
		this.force('raycaster',this.raycaster)
		//this.raycaster = new Raycaster({ camera,renderer })
		this.initEvent()
		super.initialize(...arguments)
	}

	/*
	 * 初始化事件
	 */
	initEvent(){
		let dom = this.renderer.domElement,
			eventTime,object,vec3
		dom.addEventListener('mousedown',event => {
			event.preventDefault()
			eventTime = Date.now()
			object = this.raycaster.raycasterObject(event,this.scene.children)
			if(!object){ return }
			vec3 = this.getPosition(event,object)
			//this.emitter.emit('')
		},false)
		dom.addEventListener('mousemove',event => {
			if(object && Date.now() - eventTime >= this.sleep){
				//禁止控制器平移
				this.controls.enablePan = false
				this.emitter.emit('move',{ object:object.object,newPosition:this.getPosition(event,object),oldPosition:vec3 })
			}
		},false)
		dom.addEventListener('mouseup',event => {
			let now = Date.now()
			if(object && now - eventTime <= this.sleep /*|| object && this.getPosition(event,object).equals(vec3)*/){
				//click
				this.emitter.emit('tap',{ object:object.object,position:vec3 })
			}
			//恢复平移
			this.controls.enablePan = true
			object = null,vec3 = null
		},false)
		dom.addEventListener('keydown',event => {
			let key = event.keyCode || event.which || event.charCode
			this.emitter.emit('key',key)
		},false)
	}
	/*
	 * 转换坐标
	 * return Vector3
	 */
	getPosition(event,object){
		let { position } = object
		if(!position){ position = object.object.position }
		return this.raycaster.getPosition(event,{ position })
	}

	on(){
		return this.emitter.on.apply(this.emitter,arguments),this.emitter
	}

	off(eventName,fn){
		return this.emitter[typeof fn === "function"? "removeListener" : "removeAllListeners"].apply(this.emitter,arguments),this.emitter
	}
}

export default function createDomEvents(initOptions){ 
	const fn = options => createDomEvents({ ...fn.__proto__,...options }),
		  dom = new domEvents({ ...initOptions }) 
	//Object.setPrototypeOf? Object.setPrototypeOf(fn,dom) : (fn.__proto__ = dom)
	Object.setPrototypeOf(fn,dom)
	return fn
}

