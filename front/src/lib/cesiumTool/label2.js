/*
 * @Author: renfeng 
 * @Date: 2019-09-04 13:56:17 
 * @Last Modified by: renfeng
 * @Last Modified time: 2019-09-25 16:11:56
 */
//标注类
import { getCoordinate, getModelCoordinate, getDistance } from './common'
import Marker from './marker.js'
const _editingLabelId = Symbol('editingLabelId')
const _mode =  Symbol('mode')
const _firstPoint = Symbol('firstPoint') //第一个点位置[]
const _labels = Symbol('labels')
function colorLabel(){
    return Cesium.Color.fromCssColorString('rgba(18,28,227,0.3)')
}
const data = {
    circle: {},
    marker: {},
    rectangle:{}
}
export default class Label {
    [_mode] = null;
    [_editingLabelId] = 0 ;// 正在编辑的标注的id即索引
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
        if(mode === 'circle'){
            this.handler.setInputAction((clickment => {
                var coordinate = getModelCoordinate(this.viewer, clickment.position)
                addPoint.call(this,coordinate)
                createCircle.call(this,coordinate,0)
                onMouseMove.call(this)
                this.handler.setInputAction((clickment => {
                    const rightPoint = getModelCoordinate(this.viewer,clickment.position)
                    const distance = getDistance(coordinate, rightPoint)
                    entities.getById(this[_editingLabelId]).ellipse.semiMinorAxis = entities.getById(this[_editingLabelId]).ellipse.semiMajorAxis =distance
                    collectLabel.call(this,{id:this[_editingLabelId],type:'circle',center:this[_firstPoint],radius:distance})
                    this.close()
                    typeof callback === 'function' &&callback(this[_editingLabelId])
                    entities.getById('mouseTip').label.show = false
                }).bind(this), Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            }).bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK)
           
        }else if(mode === 'marker'){
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
        }else if(mode === 'rectangle'){
            this.handler.setInputAction((clickment => {
                var coordinate = getModelCoordinate(this.viewer, clickment.position);
                addPoint.call(this,coordinate)
                creatRectangle.call(this)
                onMouseMove.call(this)
                this.handler.setInputAction((clickment => {
                    const rightPoint = getModelCoordinate(this.viewer,clickment.position)
                    let westlong ,  eastlong , southlat , northlat
                    if(this[_firstPoint][0]<rightPoint[0]){
                        westlong = this[_firstPoint][0]
                        eastlong = rightPoint[0]
                    }else{
                        westlong = rightPoint[0]
                        eastlong = this[_firstPoint][0]
                    }
                    if(this[_firstPoint][1]<rightPoint[1]){
                        southlat = this[_firstPoint][1]
                        northlat = rightPoint[1]
                    }else{
                        southlat = rightPoint[1]
                        northlat = this[_firstPoint][1]
                    }
                    entities.getById(this[_editingLabelId]).rectangle.coordinates = Cesium.Rectangle.fromDegrees(westlong,southlat, eastlong,northlat)
                    collectLabel.call(this,{id:this[_editingLabelId],type:'rectangle',westlong ,  eastlong , southlat , northlat})
                    this.close()
                    typeof callback === 'function' &&callback(this[_editingLabelId])
                    entities.getById('mouseTip').label.show = false
                }).bind(this), Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            }).bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK)
        }else if(mode === 'arrow'){
            let arr = []
            this.handler.setInputAction((clickment => {
                var coordinate = getModelCoordinate(this.viewer, clickment.position)
               // console.log(coordinate);return
                createCorridor.call(this,coordinate[0],coordinate[1])
                
                this.handler.setInputAction((clickment => {
                    createArrow.call(this, arr) 
                }).bind(this), Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            }).bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK)
            
            //createArrow(this)
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
    removeAllLabels(){
        if(this.labels.length){
            console.log(this.labels)
            this.labels.forEach(item =>{
                this.removeById(item.entityId)
            })
        }    
    }
    close(){
        closeEvent.call(this)
    }
    draw(obj){
        console.log(obj)
        let temp = null;
        if(obj.type === 'circle'){
            temp = this.viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(...obj.center),
                ellipse : {
                    semiMinorAxis : obj.radius,
                    semiMajorAxis : obj.radius,
                    heightReference :Cesium.HeightReference.CLAMP_TO_GROUND,
                    //height: coordinate[2],
                    material : colorLabel(),
                   // outline : true, // height must be set for outline to display
                   // outlineColor:Cesium.Color.CHARTREUSE 
                }
            });
            temp.__type = 'label_circle';
            temp.__id = obj.id;
            data.circle[temp.id] = {...obj};
            collectLabel.call(this, {...obj,entityId:temp.id})
        }else if(obj.type === 'rectangle'){           
            temp = this.viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(obj.westlong, obj.southlat),
                rectangle : {
                    coordinates : Cesium.Rectangle.fromDegrees(obj.westlong , obj.southlat , obj.eastlong , obj.northlat),
                    material : colorLabel(),
                    heightReference :Cesium.HeightReference.CLAMP_TO_GROUND,
                }
            })
            temp.__type = 'label_rectangle';
            temp.__id = obj.id;
            data.rectangle[temp.id] = {...obj};
            collectLabel.call(this, {...obj,entityId:temp.id})
        }else if(obj.type === 'point'){
            temp = new Marker(this.viewer, obj)
            temp.entity.__type = 'label_marker';
            data.marker[temp.entityId] = {...obj};
            collectLabel.call(this, {...obj,entityId:temp.entityId})
        }
    }
}
function onMouseMove() {
    this.handler.setInputAction((movement => {
        const entities = this.viewer.entities
        const rightPoint = getModelCoordinate(this.viewer,movement.endPosition)
        entities.getById('mouseTip').label.show = true
        entities.getById('mouseTip').position = Cesium.Cartesian3.fromDegrees(rightPoint[0], rightPoint[1])
        if(this[_mode]==='circle'){
            //获取鼠标移动位置和圆心的距离
            const distance = getDistance(this[_firstPoint], rightPoint)
            entities.getById(this[_editingLabelId]).ellipse.semiMinorAxis = entities.getById(this[_editingLabelId]).ellipse.semiMajorAxis =distance
        }else if(this[_mode]==='rectangle'){
            let westlong ,  eastlong , southlat , northlat
            if(this[_firstPoint][0]<rightPoint[0]){
                westlong = this[_firstPoint][0]
                eastlong = rightPoint[0]
            }else{
                westlong = rightPoint[0]
                eastlong = this[_firstPoint][0]
            }
            if(this[_firstPoint][1]<rightPoint[1]){
                southlat = this[_firstPoint][1]
                northlat = rightPoint[1]
            }else{
                southlat = rightPoint[1]
                northlat = this[_firstPoint][1]
            }
            entities.getById(this[_editingLabelId]).rectangle.coordinates = Cesium.Rectangle.fromDegrees(westlong,southlat, eastlong,northlat)
        }
    }).bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
 }
function createCircle(coordinate,radius){ //coordinate-array   
    const circle = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(...coordinate),
        ellipse : {
            semiMinorAxis : radius,
            semiMajorAxis : radius,
            heightReference :Cesium.HeightReference.CLAMP_TO_GROUND,
            //height: coordinate[2],
            material : colorLabel(),
           // outline : true, // height must be set for outline to display
           // outlineColor:Cesium.Color.CHARTREUSE 
        }
    });
    this[_editingLabelId] = circle.id
    circle.__type = 'label_circle';
    circle.__labelId = this[_editingLabelId]
}
function creatRectangle(){
    const rectangle = this.viewer.entities.add({
        // id:this[_editingLabelId],
        position: Cesium.Cartesian3.fromDegrees(this[_firstPoint][0], this[_firstPoint][1]),
        rectangle : {
            coordinates : Cesium.Rectangle.fromDegrees(this[_firstPoint][0], this[_firstPoint][1], this[_firstPoint][0], this[_firstPoint][1]),
            material : colorLabel(),
            heightReference :Cesium.HeightReference.CLAMP_TO_GROUND,
        }
    })
    console.log(rectangle)
    this[_editingLabelId] = rectangle.id
    rectangle.__type = 'label_rectangle';
    rectangle.__labelId = this[_editingLabelId]
}
function createArrow(arr){
    console.log(2)
    var polygon3 = new Cesium.PolygonGeometry({
        polygonHierarchy : new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(arr)
        )
      });
      var geometry = Cesium.PolygonGeometry.createGeometry(polygon3);
    
}
function createCorridor(v1,v2){
    var greenCorridor = this.viewer.entities.add({
        corridor : {
            positions : Cesium.Cartesian3.fromDegreesArray([
                                                            v1, v2-0.002,
                                                            v1,v2,
                                                            v1+0.002, v2
                                                        ]),
            width : 10.0,
            cornerType: Cesium.CornerType.MITERED,
            material : Cesium.Color.GREEN,
            outline : true // height required for outlines to display
        }
    });
    
}
function addPoint(coordinate) {
    const point = this.viewer.entities.add({
      id:'point'+this[_editingLabelId],
      position: Cesium.Cartesian3.fromDegreesArrayHeights(coordinate)[0],
      point: {
        
        color: colorLabel(),
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
    this[_firstPoint] = coordinate
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    return point.id;
}
function collectLabel(obj){
    this.labels.push(obj) 
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