/**
 * 我的所有物品
 * Canvas Mine
 * @author: KyleBing(kylebing@163.com)
 * @github: https://github.com/KyleBing/canvas-mine
 * @date-init: 2023-07-10
 * @date-update: 2023-07-13
 * @version: v0.0.1
 * @platform: NPM
 */

class CanvasMine {
    /**
     * CanvasMine
     * @param name {String}主题名
     * @param attaches {[]} 内容
     * @param columnCount {Number} 展示为多少列
     * @param columnOffsetX {Number} 列之间的间隔
     * @param isShowSerialNumber {Boolean} 是否显示序号
     * @param isShowCanvasInfo {Boolean} 是否显示 canvas 信息
     */
    constructor(name, attaches, columnCount, columnOffsetX, isShowSerialNumber, isShowCanvasInfo) {
        this.isPlaying = true // 默认自动播放
        this.isShowCanvasInfo = isShowCanvasInfo
        this.isShowSerialNumber = isShowSerialNumber

        this.columnCount = columnCount || 2       // 展示为多少列
        this.columnOffsetX = columnOffsetX || 700 // 列之间的间隔

        this.columnOffsetXFirst = 400 // 第一列的开始，偏移量

        this.bgColor = 'white'
        this.option = {
            padding: 80, // 距离边缘距离
            gapItemY: 20, // 每个子元素的高度值
            gapBranchY: 30, // 每个类别分支的间隔
            mainTopic: {
                strokeStyle: '#000',
                lineWidth: 5,
                radius: 120, // 中心元素的圆形 radius
                name: name, // 主题名
                font: '40px 微软雅黑'
            },
            level1: {
                textWidth: 150, // 文字宽度
                gapX: 400, // 横向宽度
                tailDistance: 85, // 弯折位置位于末端多远处
                gapY: 200,
                radius: 20, // 线段圆角
                strokeStyle: '#333',
                textColor: 'black',
                textColorImportant: 'red',
                lineWidth: 4,
                dotSize: 4,
                font: '28px 微软雅黑',
            },
            level2: {
                gapX: 300, // 横向宽度
                tailDistance: 70, // 弯折位置位于末端多远处
                gapY: 200,
                radius: 5, // 线段圆角
                strokeStyle: '#333',
                textColor: '#333',
                textColorImportant: 'red',
                lineWidth: 2,
                dotSize: 0,
                font: '24px 微软雅黑',
            },
        }

        this.separateArrays = [] // {name: 'left', attaches: [], countItems: 0},
        this.attaches = attaches || []  // 分支
        this.animationDuration = 10  // 动画多少帧内完成
        this.frame = {
            width : 1920 * 2,
            height: 1080 * 2,
        }
        this.center=  {
            x: 600,
            y: 150
        }

        this.timeLine = 0
        this.mouseX = 0
        this.mouseY = 0
        this.lastTime = new Date().getTime() // 用于计算每帧用时

        this.init()
        window.onresize = () => {
            this.frame.height = innerHeight * 2
            this.frame.width = innerWidth * 2
            let canvasLayer = document.querySelector('canvas')
            this.updateFrameAttribute(canvasLayer)
            // this.init()
        }

        document.documentElement.addEventListener('mousemove', event => {
            this.mouseX = event.x
            this.mouseY = event.y
        })
    }

    updateFrameAttribute(canvasLayer){
        canvasLayer.setAttribute('id', 'canvasLayer')
        canvasLayer.setAttribute('width', this.frame.width)
        canvasLayer.setAttribute('height', this.frame.height)
        canvasLayer.style.width = `${this.frame.width / 2}px`
        canvasLayer.style.height = `${this.frame.height / 2}px`
        canvasLayer.style.zIndex = '-3'
        canvasLayer.style.userSelect = 'none'
        canvasLayer.style.position = 'fixed'
        canvasLayer.style.top = '0'
        canvasLayer.style.left = '0'
        canvasLayer.imageSmoothingEnabled = true


        this.option.level1.gapY = (this.frame.height - this.option.padding * 2) / this.attaches.length



        // 子元素总个数
        let countItems = 0
        this.attaches.forEach(branchLv1 =>{
            countItems = countItems + branchLv1.children.length
        })

        // 分组
        this.attaches = this.attaches.sort((a,b) => b.children.length - a.children.length)
        this.separateArrays = []
        for (let i=0; i<this.columnCount; i++){
            this.separateArrays.push(
                {
                    name: `${i}`,
                    attaches: [],
                    countItems: 0,
                    center: {
                        x: 0, y: 0
                    }
                },
            )
        }

        // 将内容均分到各组中
        this.attaches.forEach(item => {
            this.separateArrays.sort((a,b) => a.countItems - b.countItems)
            let min = this.separateArrays[0]
            min.attaches.push(item)
            min.countItems = min.countItems + item.children.length
        })

        // 最大的元素数量
        this.separateArrays = this.separateArrays.sort((a,b) => b.countItems - a.countItems) // 最大的在前
        let maxCount = this.separateArrays[0].countItems

        // 最大分类的数量
        this.separateArrays = this.separateArrays.sort((a,b) => b.attaches.length - a.attaches.length) // 最大的在前
        let maxCategory = this.separateArrays[0].attaches.length

        this.option.gapItemY = ( this.frame.height - this.option.padding * 2  - (maxCategory - 1) * this.option.gapBranchY) / maxCount

        // 计算每个区块的高度、中心点
        this.separateArrays.forEach((separateArray, index) => {
            let heightAmount = 0
            let lastYPos = this.option.padding
            separateArray.attaches.forEach((branchLv1, index) => {
                branchLv1.height = this.option.gapItemY * branchLv1.children.length
                heightAmount = heightAmount + branchLv1.height
                lastYPos = lastYPos + branchLv1.height + this.option.gapBranchY
                branchLv1.midLineY = lastYPos - branchLv1.height / 2
            })
            if (index === 0){
                separateArray.center = this.center
            } else {
                separateArray.center =  {
                    x: this.center.x + this.columnOffsetX * index,
                    y: this.separateArrays[index - 1].attaches[0].midLineY // 第一个数据的中心点
                        + this.separateArrays[index - 1].attaches[0].height / 2 // 第一个数据的半个高
                        + this.option.gapItemY / 2 // 加类别之间的间隔的一半
                }
            }
        })

        // fill background
        let ctx = canvasLayer.getContext('2d')
        ctx.fillStyle = this.bgColor
        ctx.fill()

        this.draw()
    }

    init(){
        this.frame.height = document.documentElement.clientHeight * 2
        this.frame.width = document.documentElement.clientWidth * 2

        this.center = {
            x: (this.frame.width - (this.columnOffsetX - 250) * 2 * this.columnCount) / 2, // 300 大约是两个列之间重叠的部分
            y: this.frame.height / 2
        }

        let canvasLayer = document.createElement("canvas")
        document.documentElement.append(canvasLayer)
        this.updateFrameAttribute(canvasLayer)

        this.draw()
    }

    draw() {
        this.timeLine = this.timeLine + 1
        let canvasLayer = document.getElementById('canvasLayer')
        let ctx = canvasLayer.getContext('2d')
        ctx.clearRect(0,0,this.frame.width, this.frame.height)

        // 背景
        ctx.save()
        ctx.fillStyle = 'white'
        ctx.fillRect(0,0,this.frame.width, this.frame.height)
        ctx.restore()

        // 主题 - 白色背景
        ctx.save()
        ctx.moveTo(this.center.x + this.option.mainTopic.radius, this.center.y)
        ctx.arc(this.center.x, this.center.y,this.option.mainTopic.radius,0,Math.PI * 2,)
        ctx.strokeStyle = this.option.mainTopic.strokeStyle
        // ctx.shadowColor = 'rgba(0,0,0,0.8)'
        // ctx.shadowBlur = 10
        // ctx.shadowOffsetX = 2
        // ctx.shadowOffsetY = 2
        ctx.fillStyle = 'white'
        ctx.lineWidth = this.option.mainTopic.lineWidth
        ctx.fill()
        ctx.stroke()

        // 主题 - 标题
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center'
        ctx.font =  this.option.mainTopic.font
        ctx.textBaseline = 'middle'
        ctx.fillText(this.option.mainTopic.name, this.center.x, this.center.y)
        ctx.restore()

        // 1. 遍历分列
        this.separateArrays.forEach((separateArray, index) => {
            if (index === 0){
                let originPoint = {
                    x: this.center.x + this.option.mainTopic.radius,
                    y: this.center.y
                }
                let tempStartPoint1 = {
                    x: this.center.x + this.columnOffsetXFirst,
                    y: this.center.y
                }
                ctx.save()
                ctx.lineWidth = this.option.level1.lineWidth
                ctx.moveTo(originPoint.x, originPoint.y)
                ctx.lineTo(tempStartPoint1.x, tempStartPoint1.y)
                ctx.stroke()
                ctx.restore()
            } else {
            }

            // 2. 遍历列中的类别
            separateArray.attaches.forEach((item1Level, index1) => {
                let startPoint1 = {x: 0, y: 0}
                let endPoint1 = {x: 0, y: 0}
                // 第一列的特殊样式
                if (index === 0){
                    startPoint1 = {
                        x: this.center.x + this.columnOffsetXFirst,
                        y: this.center.y
                    }
                    endPoint1 = {
                        x: startPoint1.x + 200,
                        y: item1Level.midLineY
                    }
                } else {
                    startPoint1 = this.separateArrays[index].center
                    endPoint1 = {
                        x: startPoint1.x + this.columnOffsetX,
                        y: item1Level.midLineY
                    }
                }


                if (this.option.level1.dotSize){
                    drawDot(ctx, endPoint1, this.option.level1.dotSize, this.option.level1.lineWidth, this.option.level1.strokeStyle, this.option.level1.strokeStyle)
                }
                // 一级文字
                ctx.fillStyle = this.option.level1.textColor
                ctx.font = this.option.level1.font
                ctx.textBaseline = 'middle'
                ctx.textAlign = 'center'
                let textLevel1 = this.isShowSerialNumber ?
                    `${index1 + 1}. ${item1Level.name}`:
                    item1Level.name
                ctx.fillText(
                    textLevel1,
                    endPoint1.x + this.option.level1.textWidth / 2,
                    endPoint1.y,
                    this.option.level1.textWidth
                )

                let cornerRadius1 = 0
                if (this.timeLine > this.animationDuration){
                    cornerRadius1 = this.option.level1.radius
                } else {
                    cornerRadius1 = this.option.level1.radius / this.animationDuration * this.timeLine
                }
                this.separateArrays[index].foldX = drawArcLine(ctx,
                    startPoint1, endPoint1, cornerRadius1,
                    this.option.level1.tailDistance,
                    this.option.level1.lineWidth,
                    this.option.level1.strokeStyle
                )
                this.option.level2.gapY = this.option.level1.gapY / item1Level.children.length // 二级中元素的间隔

                // 3. 遍历类别中的子元素
                item1Level.children.forEach((item2Level, index2) => {
                    let endPoint2 = {
                        x: endPoint1.x + this.option.level2.gapX,
                        y: getYPositionOf(endPoint1.y, item1Level.children.length, this.option.gapItemY, index2)
                    }
                    if (this.option.level2.dotSize){
                        drawDot(ctx, endPoint2, this.option.level2.dotSize, this.option.level2.lineWidth, this.option.level2.strokeStyle, this.option.level2.strokeStyle)
                    }
                    // 二级文字
                    ctx.fillStyle = item2Level.isImportant? this.option.level2.textColorImportant: this.option.level2.textColor
                    ctx.font = this.option.level2.font
                    ctx.textBaseline = 'middle'
                    ctx.textAlign = 'left'
                    let textLevel2 = this.isShowSerialNumber ?
                        `${index2 + 1}. ${item2Level.name}`:
                        item2Level.name
                    ctx.fillText(
                        textLevel2,
                        endPoint2.x + 10,
                        endPoint2.y
                    )

                    let startPoint2 = {
                        x: endPoint1.x + this.option.level1.textWidth,
                        y: endPoint1.y
                    }
                    let cornerRadius2 = 0
                    if (this.timeLine > this.animationDuration){
                        cornerRadius2 = this.option.level2.radius
                        this.animationStop()
                    } else {
                        cornerRadius2 = this.option.level2.radius / this.animationDuration * this.timeLine
                    }
                    drawArcLine(ctx, startPoint2 , endPoint2, cornerRadius2, this.option.level2.tailDistance, this.option.level2.lineWidth, this.option.level2.strokeStyle)
                })
            })

            // 4. 最后将未连接的 2.3.4.. 列连接到上一级连线上
            if (index === 0){

            } else {
                let categoryStartPoint = {
                    x: this.separateArrays[index - 1].foldX,
                    y: separateArray.center.y
                }
                ctx.save()
                ctx.beginPath()
                ctx.lineWidth = this.option.level1.lineWidth // 复用 一级的树形样式
                ctx.strokeStyle = this.option.level1.strokeStyle
                ctx.moveTo(categoryStartPoint.x, categoryStartPoint.y)
                ctx.lineTo(separateArray.center.x, separateArray.center.y)
                ctx.stroke()
                ctx.restore()
                drawDot(ctx,categoryStartPoint, 6,this.option.level1.lineWidth,this.option.level1.strokeStyle,'white')
            }
        })


        // 展示 canvas 数据
        if (this.isShowCanvasInfo) {
            showCanvasInfo(ctx, this.timeLine, this.frame)
        }

        if (this.isPlaying) {
            window.requestAnimationFrame(() => {
                this.draw()
            })
        }
    }


    animationStart(){
        if (this.isPlaying){

        } else {
            this.isPlaying = true
            this.draw()
        }
    }
    animationStop(){
        this.isPlaying = false
    }

    destroy(){
        this.isPlaying = false
        let canvasLayer = document.getElementById('canvasLayer')
        canvasLayer.remove()
        console.log('动画已停止')
    }

}

/**
 * ## 显示时间标线序号
 * @param ctx
 * @param timeline {''}
 * @param frame {{width, height}}
 */
function showCanvasInfo(ctx, timeline, frame){
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = 'white'
    ctx.font = '20px sans-serf'
    ctx.fillRect(10, frame.height - 53, 220, 30)
    let currentTime =  new Date().getTime()
    ctx.fillStyle = 'black'
    ctx.fillText(`${currentTime - this.lastTime} ms/frame  |  ${timeline} 帧`, 20, frame.height - 32)
    this.lastTime = currentTime
    ctx.restore()
}

/**
 *
 * @param ctx
 * @param center
 * @param radius {Number}
 * @param color {String}
 */

/**
 * ## 画点
 * @param ctx
 * @param center {{x: Number,y: Number}}
 * @param radius  {Number}
 * @param lineWidth {Number}
 * @param fillColor  {String}
 * @param strokeColor {String}
 */
function drawDot(ctx, center, radius, lineWidth, fillColor, strokeColor){
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(center.x + radius, center.y)
    ctx.lineWidth = lineWidth || 0
    ctx.strokeStyle = fillColor || 'black'
    ctx.fillStyle =  strokeColor || 'white'
    ctx.arc(center.x, center.y, radius,0, Math.PI * 2 )
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
}

/**
 * ## 获取第 index 个元素的 y 位置
 * @param middleLineY {{x: Number, y: Number}} 中心线的 y 位置
 * @param itemSize {Number}元素数量
 * @param gap {Number} 每个元素之间的间隔
 * @param index {Number} 第几个元素的位置
 */
function getYPositionOf(middleLineY, itemSize, gap, index){
    let gapCount = itemSize - 1 // gap 总数量
    let middleIndex = gapCount / 2
    if (index >= middleIndex){
        return middleLineY + (index - middleIndex) * gap
    } else {
        return middleLineY - (middleIndex - index) * gap
    }
}

/**
 * ## 在 a 与 d 点之间线一条带圆角的拆线
 * @param ctx canvas.context
 * @param pointA {{x: Number, y: Number}} 起点坐标
 * @param pointD {{x: Number, y: Number}} 末端坐标
 * @param radius  { Number } 圆角半径
 * @param endLineLength  { Number } 末端线段长度
 * @param lineWidth { Number } 线段宽度
 * @param lineColor  { String } 线段颜色
 */
function drawArcLine(ctx, pointA, pointD, radius,  endLineLength, lineWidth, lineColor){
    ctx.save()
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.lineJoin = 'round'
    ctx.moveTo(pointA.x, pointA.y)
    let foldX = pointA.x + (pointD.x - pointA.x - endLineLength)
    ctx.arcTo(
        foldX,
        pointA.y,
        foldX,
        pointD.y,
        radius
    )
    ctx.arcTo(
        foldX,
        pointD.y,
        pointD.x,
        pointD.y,
        radius
    )
    ctx.lineTo(pointD.x, pointD.y)
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.restore()
    return foldX
}


function getColor(timeLine){
    return `hsla(${timeLine%360 + 200},150%,50%,1)`
}

/**
 * 输出随机 1 或 -1
 * @returns {number}
 */
function randomDirection(){
    let random = Math.random()
    if (random > 0.5){
        return 1
    } else {
        return -1
    }
}

function randomPosition(width, height){
    return [
        Number((width * Math.random()).toFixed(0)),
        Number((height * Math.random()).toFixed(0))
    ]
}

/**
 * 生成随机整数
 * @param min
 * @param max
 * @returns {number}
 */
function randomInt(min, max){
    return Number((Math.random() * (max - min) + min).toFixed(0))
}

/**
 * 生成随机整数
 * @param min
 * @param max
 * @returns {number}
 */
function randomFloat(min, max){
    return Number(Math.random() * (max - min) + min)
}
