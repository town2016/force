
const all = Object.freeze(new Map)
const propName = Symbol('name')
export default class extends Map{
	static get Categorys(){
		return all
	}

	get name(){
		return this[propName]
	}
	constructor(name){
		super()
		if(all.has(name)){ return name.get(name) }
		this[propName] = name
		all.set(name,this)
	}

	initialize(node){
		super.set(node.id,node)
	}
}