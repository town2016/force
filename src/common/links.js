import { default as Element } from './element'
import { classAttribute } from '../decorator/classAttribute'

const LINKS = new Map()
export default class extends Element{
	static get Links(){ return LINKS }
	static get LinksArray(){ return Array.from(new Set(LINKS.values())) }

	constructor(options = {}){
		super(...arguments)
		Object.assign(this,options)
		let { source,target } = this
		LINKS.set(this.name = `${source}-${target}`,this)
	}
}