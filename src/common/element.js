import { classAttribute } from '../decorator/classAttribute'

const ELEMENTS = Object.freeze(new Map()) 
//生成随机长度的字符串
export const randomString = (len = 0,str = "abcdefghijklmnopqrstuvwxyz1234567890".toUpperCase()) => {
	const strBuild = []
	//保证len数字整数
	//随机拿取字符串
	for(len = len >> 0,str = typeof str !== "string"? String(str) : str;len > 0;len --){
		strBuild.push(str.charAt( (Math.random() * str.length) >> 0 ))
	}
	return strBuild.join('')
}
//生成 xxxx-xxxx-xxxx... 模式
export const randomUUID = num => {
	const strBuild = []
	for(num = num >> 0;num >= 1;num --){ strBuild.push(randomString(4)) }
	return strBuild.join('-')
}



//链式 禁止修改
@classAttribute('force','unknow',function(){
	//this 指向 
	//不使用箭头函数
	return function(name = "",_){
		return arguments.length > 1? 
		(_ == null? this.props.delete(name) : this.props.set(name,this.initializeChain(_)) ,
			this) : this.props.get(name)
	}
})
//初始化
@classAttribute('initializeChain','unknow',function(){
	//this 指向 
	//不使用箭头函数
	return function (_ = {}){
		return typeof _.initialize === "function" && _.initialize(this),_
	}
})
//保存的属性
@classAttribute('props',v => v && (v instanceof Map || String(v).toUpperCase() === "[OBJECT MAP]"),() => new Map)
//id
@classAttribute('id','unknow',() => randomUUID(4))
export default class Element{
	//存放所有资源
	static get Elements(){ return ELEMENTS }
	static createID(){ return randomUUID(...arguments) }

	//帮助初始化
	initialize(){ }

	constructor(){ 
		let constructorName = this.__proto__.constructor.name
		if(constructorName !== "_default" && constructorName !== "default"){
			console.log(`Element constructor,i'ts ${constructorName}`)
		}
		;['force','initializeChain'].map(prop => Object.freeze(this[prop]))
		ELEMENTS.set(this.id,this)
	}
}