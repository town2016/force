export class attributeClassModel{
	/* ------ 属性默认值 ------ */
	//可以为function
	get defaultValue(){
		return this._defaultValue
	}
	set defaultValue(value){
		this._defaultValue = value
	}
	/* ------ 属性默认值 ------ */
	/* ------ 属性可以设置的type ------ */
	get valueType(){
		return this._valueType
	}
	set valueType(value){
		this._valueType = value
	}
	/* ------ 属性可以设置的type ------ */
	/* ------ 属性key ------ */
	//可以为！值或者function
	//当为function时候 返回true或false
	//当为！值时候 默认不校验
	get valueKey(){
		return this._valueKey
	}
	set valueKey(value){
		this._valueKey = value
	}


	/* ------ 属性ket ------ */
	constructor(key,type,defaultValue){
		this.valueKey = key,
		this.valueType = type,
		this.defaultValue = defaultValue
	}
}


const getModel = function (model){
	let args = Array.prototype.slice.call(arguments,1)
	if(!(model instanceof attributeClassModel) && typeof model === "string" && args.length >= 2){
		model = new attributeClassModel(model,...args)
	}
	return model
}
//为target设置属性值
const setAttribute = function (model,target){
	let selfKey = Symbol('ATTRIBUTE')
	Object.defineProperty(target,model.valueKey,{
		enumerable: true,  
    	configurable: true,
    	get:function(){
    		if(!this[selfKey]){ 
    			this[selfKey] = typeof model.defaultValue === "function"? 
    				model.defaultValue.call(this) : model.defaultValue 
    		}
    		return this[selfKey]
    	},
    	set:function(v){
    		let valueType = true
    		if(typeof model.valueType === "string"){
    			valueType = typeof v === model.valueType
    		}
    		if(typeof model.valueType === "function"){
    			valueType = model.valueType.call(this,v)
    			valueType = typeof valueType !== "boolean"? true : valueType
    		}
    		//let valueType = typeof model.valueType === "string"? typeof v === model.valueType : typeof model.valueType === "function"? (model.valueType(v) || true) : true; 
    		if(!valueType){ 
    			return console.log(`class:${target.displayName || target.name || ''},
    				属性${model.valueKey}插入值非${model.valueType}类型，插入值为：${v}`,target) 
    		}
			this[selfKey] = v
    	}
	})
}


//为class的prototype设置属性
export function classAttribute(model){
	return (target,key,decorator) => {
		model = getModel(...Array.from(arguments))
		setAttribute(model,target.prototype)
	}
}