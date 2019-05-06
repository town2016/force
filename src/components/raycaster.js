import * as THREE from 'three'
import { classAttribute } from '../decorator/classAttribute'
import { default as base } from '../common/element'


//声明式
@classAttribute('camera','object',null)
//声明式
@classAttribute('renderer','object',null)
//记录坐标
@classAttribute('mouse','object',new THREE.Vector2())
//射线
@classAttribute('raycaster','object',new THREE.Raycaster())
//辅助获取坐标
@classAttribute('plane','object',new THREE.Plane())
//辅助获取坐标
@classAttribute('intersection','object',new THREE.Vector3())
export class Raycaster extends base{
  	isRaycaster = true
  	constructor(){
      super(...arguments)
  	}

    /**
    * 初始化插槽
    * @param {any} param0
    */
    initialize(slot = {}){
      let { camera = null,renderer = null } = slot
      this.camera = camera
      this.renderer = renderer
      super.initialize(...arguments)
    }
  	/**
    * 根据鼠标 更新射线
    * @param {any} param0
    */
    setRaycaster({ clientX = 0, clientY = 0 } = {}) {
      let rect = this.renderer.domElement.getBoundingClientRect()
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = - ((clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera)
    }

    /**
     * 根据坐标 获取当前坐标之下的所有元素
     * @param {any} param0
     */
    raycasterObjects({ clientX = 0, clientY = 0 } = {},objects = []) {
      this.setRaycaster({ clientX, clientY })
      //从已经展示的节点中查找
      let intersects = this.raycaster.intersectObjects(objects)
      //有碰撞
      return intersects.length? intersects : null
    }
    /**
     * 根据坐标 获取当前坐标之下的第一个元素
     * @param {any} param0
     */
    raycasterObject({ clientX = 0, clientY = 0 } = {},objects = []){
    	let results = this.raycasterObjects({ clientX,clientY },objects)
    	return Array.isArray(results) && results.length? results[0] : null
    }

    /**
     * 根据鼠标坐标 获取屏幕位置元素坐标
     * @param {any} object
     * @param {any} param1
     */
    getPosition({ clientX = 0, clientY = 0 } = {},{ position = null } = {}) {
      let plane = this.plane,
      	  intersection = this.intersection
      this.setRaycaster({ clientX, clientY })
      //设置元素坐标 替换成相机世界坐标
      plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(plane.normal), position);
      //转换坐标
      if (this.raycaster.ray.intersectPlane(plane, intersection)) {
      	return intersection.clone()
        //return { x: intersection.x, y: intersection.y,z: intersection.z }
      }
    }
}