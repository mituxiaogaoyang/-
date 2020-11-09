/*
 * @Author: renfeng 
 * @Date: 2019-09-04 13:56:17 
 * @Last Modified by: renfeng
 * @Last Modified time: 2019-09-29 13:58:15
 */
//标注类
import { getCoordinate, getModelCoordinate, getDistance } from './common'
import Marker from './marker.js'
const _editingLabelId = Symbol('editingLabelId')
const _mode =  Symbol('mode')
const _firstPoint = Symbol('firstPoint') //第一个点位置[]
const _labels = Symbol('labels')
const _arrowTempId = Symbol('arrowTempId')
function colorLabel(){
    return Cesium.Color.fromCssColorString('rgba(243, 152, 0, 0.5)')
}
const data = {
    circle: {},
    marker: {},
    rectangle:{}
}
export default class Label {
    [_mode] = null;
    [_editingLabelId] = 0 ;// 正在编辑的标注的id即索引
    [_arrowTempId] = 0 ; //临时箭头entityId
    [_firstPoint] = [] ;
    [_labels] = {}
    constructor(viewer, options){
        this.viewer = viewer
        this.options = options
        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        initTipLabel.call(this)
    }
    get mode(){
        return this[_mode]
    }
    get labels(){
        return this[_labels]
    }
    open(mode, callback){
        this[_mode] = mode
        this.close()
        const entities = this.viewer.entities
        if(mode === 'marker'){
            this.handler.setInputAction((clickment => {
                const coordinate = getModelCoordinate(this.viewer, clickment.position);
                const marker = new Marker(this.viewer, {coordinate:coordinate})
                this.labels[marker.id]= {
                    type:'marker',
                    isSubmit:false,
                    coordinate:coordinate,
                    entityId: marker.entityId
                }
                this.close()
                marker.entity.__type = 'label_marker'
                marker.entity.__labelId = marker.id
                typeof callback === 'function' &&callback(marker.entityId)
            }).bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK)
        }else if(mode === 'arrow'){
            this.handler.setInputAction((clickment => {
                const objLabel = this.labels
                var coordinateClick = getModelCoordinate(this.viewer, clickment.position)
                if(this[_arrowTempId]){
                    this.viewer.entities.removeById(this[_arrowTempId])
                    this[_arrowTempId] = 0
                }
                if(this[_editingLabelId] in objLabel){ //已有的箭头标注上添加箭头
                    
                    const objArrow =  objLabel[this[_editingLabelId]]
                    const objArrowCoord =  objArrow.coordinates
                    objArrowCoord.push(coordinateClick)
                    const arrowId = addArrowLine.call(this, objArrowCoord[objArrowCoord.length-2],objArrowCoord[objArrowCoord.length-1],false)
                    objArrow.entitiesId.push(arrowId)
                }else{ //新建箭头标注
                    addPoint.call(this,coordinateClick)
                    objLabel[this[_editingLabelId]]= {
                        type:'arrow',
                        isSubmit:false,
                        coordinates:[coordinateClick],
                        entitiesId:[],
                        arrowId:this[_editingLabelId]
                    }
                    
                }
                onMouseMove.call(this)
                this.handler.setInputAction((clickment2 => {
                    if(this[_arrowTempId]){
                        this.viewer.entities.removeById(this[_arrowTempId])
                        this[_arrowTempId] = 0
                    }
                    const rightPoint = getModelCoordinate(this.viewer,clickment2.position)
                    const objArrow2 =  this.labels[this[_editingLabelId]]
                    const objArrowCoord2 =  objArrow2.coordinates
                    objArrowCoord2.push(rightPoint)
                    const arrowId2 = addArrowLine.call(this, objArrowCoord2[objArrowCoord2.length-2],objArrowCoord2[objArrowCoord2.length-1],false)
                    objArrow2.entitiesId.push(arrowId2)
                    this.close()
                    typeof callback === 'function' &&callback(arrowId2)
                    entities.getById('mouseTip').label.show = false
                    
                }).bind(this), Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            }).bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK)
        }
        
    }
    removeById(id){
        const label = this.labels[id]
        if(label){
            this.viewer.entities.removeById(id);
            //this.viewer.entities.removeById('point'+id);
            delete this.labels[id]
        }
    }
    addArrow(data){
        const arrCoor = data.coordinates
        let arrId = []
        for(let i =0,len =arrCoor.length; i<len-1;i++){
            let arrowId3 = addArrowLine.call(this, arrCoor[i],arrCoor[i+1],true, data.id)
            arrId.push(arrowId3)
        }
        this.labels[data.id] = {...data,entitiesId:arrId, isSubmit:true}
    }
    removeArrowById(id){
        if(this[_arrowTempId]){
            this.viewer.entities.removeById(this[_arrowTempId])
            this[_arrowTempId] = 0
            this.viewer.entities.getById('mouseTip').label.show = false
        }
        if(this.labels[id]){
            const arrArrow = this.labels[id].entitiesId
            this.viewer.entities.removeById('point'+(id-1))
            arrArrow.forEach(item =>{
                this.viewer.entities.removeById(item)
            })
            delete this.labels[id]
        }
        
    }
    removeAllLabels(){
        Object.entries(this.labels).forEach(([id, item]) => {
            const arrArrow = item.entitiesId;
            this.viewer.entities.removeById('point'+(id-1));
            arrArrow.forEach(item =>{
                this.viewer.entities.removeById(item);
            });
            delete this.labels[id];
        }); 
    }
    showAllLabels() {
        showOrHideArrow.call(this, true);
    }
    hideAllLabels() {
        showOrHideArrow.call(this, false);
    }
    close(){
        closeEvent.call(this)
    }
}
function showOrHideArrow(flag) {
    Object.entries(this.labels).forEach(([id, item]) => {
        const arrArrow = item.entitiesId;
        this.viewer.entities.removeById('point'+(id-1));
        arrArrow.forEach(item =>{
            const entity = this.viewer.entities.getById(item);
            entity && (entity.show = flag);
        });
    });
}
function onMouseMove() {
    this.handler.setInputAction((movement => {
        const entities = this.viewer.entities
        const rightPoint = getModelCoordinate(this.viewer,movement.endPosition)
        entities.getById('mouseTip').label.show = true
        entities.getById('mouseTip').position = Cesium.Cartesian3.fromDegrees(rightPoint[0], rightPoint[1])
        if(this[_mode]==='arrow'){
            if(this[_arrowTempId]){
                this.viewer.entities.removeById(this[_arrowTempId])
                this[_arrowTempId] = 0
            }
            const objArrow =  this.labels[this[_editingLabelId]]
            const objArrowCoord3 =  objArrow.coordinates
            this[_arrowTempId] = addArrowLine.call(this,objArrowCoord3[objArrowCoord3.length-1],rightPoint,false) 
        }
    }).bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
 }

function addArrowLine(point1,point2,bool, labelId){ //bool true-serve来的数据 false-- 本地保存的数据
    let arrPoint = point1.concat(point2)
    arrPoint = arrPoint.map((item,i) =>{
        if(i==2||i==5){
            item = item+50
        }
        return item
    })
    var polylineArrow = this.viewer.entities.add({
        position:Cesium.Cartesian3.fromDegrees(...point2),
        polyline : {
            positions : Cesium.Cartesian3.fromDegreesArrayHeights(arrPoint),
            width : 20,
            material : new Cesium.PolylineArrowMaterialProperty(colorLabel())
        }
    })
    polylineArrow.__labelId = labelId;
    polylineArrow.__type = bool?'label_arrow':'label_arrow_local';
    return polylineArrow.id
}
function addPoint(coordinate) {
    const point = this.viewer.entities.add({
      id:'point'+this[_editingLabelId],
      position: Cesium.Cartesian3.fromDegreesArrayHeights([coordinate[0],coordinate[1],coordinate[2]+50])[0],
      point: {
        color: colorLabel(),
        pixelSize: 3,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
    this[_editingLabelId]++
    this[_firstPoint] = coordinate
    //this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    return point.id;
}
function closeEvent() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}
function initTipLabel() {
    const tipLabel = this.viewer.entities.add({
      id:'mouseTip',
      position: null,
      label: {
        show: false,
        font: '400 13px sans-serif',
        style: Cesium.LabelStyle.FILL,
        showBackground: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        backgroundColor: Cesium.Color.WHITE,
        backgroundPadding: new Cesium.Cartesian2(6, 5),
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        pixelOffset: new Cesium.Cartesian2(12, -22),
        fillColor: Cesium.Color.fromCssColorString('#2a3045'),
        text: '右击完成绘制'
      }
    })
}