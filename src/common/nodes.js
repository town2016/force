import { default as Element } from './element'
import { classAttribute } from '../decorator/classAttribute'
import { EventEmitter } from 'events'

const NODES = new Map(),
	  propChildrenName = Symbol("child"),
	  propParentName = Symbol("parent"),
	  propEventName = Symbol("event"),
	  propAllChildrenName = Symbol("children"),
	  propAllParentsName = Symbol("parents"),
	  propRoundName = Symbol("round")

const propEmun = {
	Children:"CHILDREN",
	Parents:"PARENTS"
}
//记录坐标 x
@classAttribute('x',v => !isNaN(v),0)
//记录坐标 y
@classAttribute('y',v => !isNaN(v),0)
export default class extends Element{
	static get Nodes(){ return NODES }
	static get NodesArray(){ return Array.from(new Set(NODES.values())) }

	[propChildrenName] = new nodeSet();
	[propParentName] = new nodeSet();
	[propEventName] = new EventEmitter();
	[propAllChildrenName] = new Set();
	[propAllParentsName] = new Set();
	[propRoundName] = new Set()

	constructor(options = {}){
		super(...arguments)
		Object.assign(this,options)
		let { name = "" } = this
		NODES.set(name,this)
		this[propEventName].setMaxListeners(500)
	}

	
	get Event(){
		return this[propEventName]
	}

	//获取子元素
	get Children(){
		return nodeSet.getSet.call(this,this[propChildrenName],propEmun.Children)
	}
	//存储子元素
	set Children(value){
		nodeSet.setSet.call(this,this[propChildrenName],value,propEmun.Children)
	}
	//获取所有父元素
	get Parents(){
		return nodeSet.getSet.call(this,this[propParentName],propEmun.Parents)
	}
	set Parents(value){
		nodeSet.setSet.call(this,this[propParentName],value,propEmun.Parents)
	}

	//获取周边的子节点
	//只与当前节点一对一的关系
	get roundNodes(){
		if(this[propRoundName] && this[propRoundName].size){ return this[propRoundName] }
		return this[propRoundName] = new Set([ ...Array.from(this.roundChildren),...Array.from(this.roundParents) ]) 
	}

	get roundChildren(){
		if(this[propAllChildrenName] && this[propAllChildrenName].size){ return this[propAllChildrenName] }
		this.Children.forEach(child => {
			let { Children,Parents } = child
			//多个子节点
			//获取单独子节点的时候 子节点不是this
			//多个父节点
			//获取单独父节点的时候 父节点不为this
			if(Children.size > 1  || Parents.size > 1){ return }
			this[propAllChildrenName].add(child)
		})
		return this[propAllChildrenName]
	}
	get roundParents(){
		if(this[propAllParentsName] && this[propAllParentsName].size){ return this[propAllParentsName] }
		this.Parents.forEach(parent => {
			let { Children,Parents } = parent
			//多个子节点
			//获取单独子节点的时候 子节点不是this
			//多个父节点
			//获取单独父节点的时候 父节点不为this
			if(Children.size > 1 || Parents.size > 1){ return }
			this[propAllParentsName].add(parent)
		})
		return this[propAllParentsName]
	}
	

	initialize(content,invokeName){
		//联动添加
		if(invokeName === propEmun.Children && !this.Parents.has(content)){
			this.Parents = content
			this[propAllParentsName] = new Set()
		}
		//联动添加
		if(invokeName === propEmun.Parents && !this.Children.has(content)){
			this.Children = content
			this[propAllChildrenName] = new Set()
		}

		this[propRoundName] = new Set()
	}

	destory(content,invokeName){
		//联动删除
		if(invokeName === propEmun.Children && this.Parents.has(content)){
			this.Parents.delete(content)
		}
		//联动删除
		if(invokeName === propEmun.Parents && this.Children.has(content)){
			this.Children.delete(content)
		}

		this[propAllParentsName] = new Set(),
		this[propAllChildrenName] = new Set(),
		this[propRoundName] = new Set()
	}
}


const nodeSet =  class extends Set{
	static getSet(set,invokeName){
		const fn = (...args) => new nodeSet(...args)
		Object.setPrototypeOf(fn,
			["add","delete","clear","has","keys","values","forEach","entries"].reduce( function(op,methodName){
				op[methodName] = (...args) => set[methodName](...args,this,invokeName)
				return op
			}.bind(this),
				{
					get size(){
						return set.size
					}
				} 
			)
		)
		return fn
	}
	static setSet(set,value,invokeName){
		if(value instanceof Set || String(value).toUpperCase() === "[OBJECT SET]" || Array.isArray(value)){
			return Array.from(value).map(node => { set.add(node,this,invokeName) })
		}
		return set.add(value,this,invokeName)
	}

	constructor(){
		super(...arguments)
	}

	add(node,content,invokeName){
		if(super.has(node)){ return }
		let result = super.add(node)
		typeof node.initialize === "function" && node.initialize(...Array.from(arguments).splice(1))
		return result
	}

	delete(node,content,invokeName){
		if(!super.has(node)){ return }
		let result = super.delete(node)
		typeof node.destory === "function" && node.destory(...Array.from(arguments).splice(1))
		return result
	}

	clear(content,invokeName){
		Array.from(this).map(node => typeof node.destory === "function" && node.destory(...arguments))
		return super.clear()
	}
}