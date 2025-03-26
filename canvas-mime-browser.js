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


/**
 * 整个布局是这样的
 * 列 col
 *      类别 category
 *          元素 item
 */


class CanvasMine {
    /**
     * ## CanvasMine
     * @param name String标题名
     * @param categoryAll
     * @param colCount Number 展示为多少列
     * @param colWidth Number 列之间的间隔
     * @param isShowSerialNumber Boolean 是否显示序号
     * @param isShowCanvasInfo Boolean 是否显示 canvas 信息
     * @param isShowPrice Boolean
     */
    constructor(
        name,
        categoryAll,
        colCount,
        colWidth,
        isShowSerialNumber,
        isShowCanvasInfo,
        isShowPrice,
    )
    {
        this.isPlaying = true // 默认自动播放
        this.isShowCanvasInfo = isShowCanvasInfo
        this.isShowSerialNumber = isShowSerialNumber
        this.isShowPrice = isShowPrice

        this.colCount = colCount || 2       // 展示为多少列
        this.colWidth = colWidth || 700 // 列之间的间隔

        this.offsetBetweenFirstColumnCap = 200 // 第一列与标题文字之间的距离

        this.bgColor = 'white'
        this.option = {
            containerPadding: 80, // 距离边缘距离
            heightItem: 20, // 每个子元素的高度值
            gapCategoryY: 30, // 每个类别的上下间隔
            mainTopic: {
                strokeStyle: '#000',
                lineWidth: 4,
                radius: 120, // 中心元素的圆形 radius
                name: name, // 标题名
                font: 'bold 40px 微软雅黑'
            },
            category: {
                lineDistance: 400, // 横向宽度
                tailDistance: 100, // 弯折点 距离线段末端的距离
                textWidth: 150, // 文字宽度
                gapY: 200,  // 初始值，后面会重新赋值
                radius: 15, // 线段圆角
                strokeStyle: '#333',
                textColor: 'black',
                textColorImportant: 'red',
                lineWidth: 4,
                dotSize: 4,
                font: '28px 微软雅黑',
            },
            thing: {
                lineDistance: 250, // 横向宽度
                tailDistance: 50, // 弯折点 距离线段末端的距离
                gapY: 200,  // 初始值，后面会重新赋值
                radius: 5, // 线段圆角
                strokeStyle: '#333',
                textColor: '#333',
                textColorImportant: 'red',
                lineWidth: 2,
                dotSize: 0,
                font: '24px 微软雅黑',
                fontImportant: 'bold 24px 微软雅黑',
            },
            priceStyle: {
                height: 35,
                textColor: '#5e5e5e',
                font: '22px 微软雅黑',
            },
        }

        this.colArray = [] // {name: 'left', categories: [], countItems: 0},
        this.categoryAll = categoryAll || []  // 分支
        this.animationDuration = 300  // 动画多少帧内完成
        this.frame = {
            width : 1920 * 2,
            height: 1080 * 2,
        }
        this.originPoint =  {
            x: 150,
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


        this.option.category.gapY = (this.frame.height - this.option.containerPadding * 2) / this.categoryAll.length


        // 子元素总个数
        let countItems = 0
        this.categoryAll.forEach(branchLv1 =>{
            countItems = countItems + branchLv1.children.length
        })

        // 分组
        this.categoryAll = this.categoryAll.sort((a, b) => b.children.length - a.children.length)
        this.colArray = []
        for (let i = 0; i < this.colCount; i++) {
            this.colArray.push(
                {
                    name: `${i}`,
                    categories: [],
                    countItems: 0,
                    center: {
                        x: 0, y: 0
                    }
                },
            )
        }

        // 计算每列应该的宽度值
        //  = (宽度 - padding - 第一列与标题的距离) / colCount
        this.colWidth = (
            this.frame.width
            - this.option.containerPadding * 2  // padding
            - this.offsetBetweenFirstColumnCap  // 第一列与 mainTopic 的距离
            - this.option.mainTopic.radius * 2  // mainTopic 的圆圈宽度
        ) / this.colCount


        // 将内容均分到各组中
        this.categoryAll.forEach(item => {
            // 每遍历一个，都排序一下，找出最少元素的那一列，新的一个将添加到最少那一排中
            this.colArray.sort((a, b) => a.countItems - b.countItems)
            let min = this.colArray[0]
            min.categories.push(item)
            min.countItems = min.countItems + item.children.length
        })

        // 最大的元素数量
        this.colArray = this.colArray.sort((a, b) => b.countItems - a.countItems) // 最大的在前
        let maxCount = this.colArray[0].countItems

        // 最大分类的数量
        this.colArray = this.colArray.sort((a, b) => b.categories.length - a.categories.length) // 最大的在前
        let maxCategoryCountInCol = this.colArray[0].categories.length

        // 打乱数组顺序
        this.colArray.forEach(group => {
            shuffle(group.categories)
        })

        // 计算元素的高度
        //  = (除去 padding, 最多分类数量的那一列的 gaps ) / 一列中可能的最大元素数量
        this.option.heightItem = (
            this.frame.height - 
            this.option.containerPadding * 2  -
            (maxCategoryCountInCol - 1) * this.option.gapCategoryY // 每列
        ) / maxCount

        // 计算每个类别的高度、中心点
        this.colArray.forEach((col, index) => {
            let heightAmountOfCol = 0 // 总高度
            let lastYPos = this.option.containerPadding  // 纵向最后的坐标，初始值为 padding
            col.categories.forEach((category, index) => {
                // height category
                category.height = this.option.heightItem * category.children.length
                heightAmountOfCol = heightAmountOfCol + category.height
                lastYPos = lastYPos + category.height + this.option.gapCategoryY
                // category's middle line y pos
                category.midLineY = lastYPos - category.height / 2
            })

            // Center 的主要作用是标记每列的起点 x 值
            if (index === 0){
                col.center = {
                    x: this.originPoint.x + this.offsetBetweenFirstColumnCap,
                    y: this.originPoint.y
                }
            } else {
                col.center =  {
                    x: this.originPoint.x + this.offsetBetweenFirstColumnCap + this.colWidth * index,
                    // x: this.center.x + this.colWidth * index,
                    y: this.colArray[index - 1].categories[0].midLineY // 前一个类别的中心点
                        + this.colArray[index - 1].categories[0].height / 2 // 前一个类别的半个高
                        + this.option.heightItem / 2 // 加类别之间的间隔的一半
                }
            }
        })

        this.draw()
    }

    init(){
        this.frame.height = document.documentElement.clientHeight * 2
        this.frame.width = document.documentElement.clientWidth * 2

        this.originPoint = {
            x: 120 + this.option.mainTopic.radius,  // 标题 与 页面左边的距离
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
        ctx.fillStyle = this.bgColor
        ctx.fillRect(0,0,this.frame.width, this.frame.height)
        ctx.restore()

        /**
         * 绘制标题
         */
        // 标题背景
        ctx.save()
        ctx.moveTo(this.originPoint.x + this.option.mainTopic.radius, this.originPoint.y)  // 移动到圆的右侧点
        ctx.beginPath()
        ctx.arc(this.originPoint.x, this.originPoint.y, this.option.mainTopic.radius, 0, Math.PI * 2,)
        ctx.strokeStyle = this.option.mainTopic.strokeStyle
        // ctx.shadowColor = 'rgba(0,0,0,0.8)'
        // ctx.shadowBlur = 10
        // ctx.shadowOffsetX = 2
        // ctx.shadowOffsetY = 2
        ctx.fillStyle = 'white'
        ctx.lineWidth = this.option.mainTopic.lineWidth
        ctx.fill()
        ctx.stroke()

        // 标题名
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center'
        ctx.font = this.option.mainTopic.font
        ctx.textBaseline = 'middle'
        ctx.fillText(this.option.mainTopic.name, this.originPoint.x, this.originPoint.y)
        ctx.restore()

        // 1. 遍历分列
        this.colArray.forEach((col, indexCol) => {

            // 标题 与 第一列之间的连线
            if (indexCol === 0){
                let originPoint = {
                    x: this.originPoint.x
                        + this.option.mainTopic.radius  //  + radius
                        + this.option.mainTopic.lineWidth / 2, // 从圆的边缘开始绘制，也要算上这个边框的宽度
                    y: this.originPoint.y
                }
                let tempStartPoint1 = {
                    x: this.originPoint.x + this.offsetBetweenFirstColumnCap,
                    y: this.originPoint.y
                }
                ctx.save()
                ctx.lineWidth = this.option.category.lineWidth
                ctx.beginPath()
                ctx.moveTo(originPoint.x, originPoint.y)
                ctx.lineTo(tempStartPoint1.x, tempStartPoint1.y)
                ctx.stroke()
                ctx.restore()
            } else {
            }

            // 2. 遍历列中的类别
            col.categories.forEach((category, indexCategory) => {
                let pointStartCategory = {x: 0, y: 0}
                let pointEndCategory = {x: 0, y: 0}

                // 第一列的特殊样式
                if (indexCol === 0){
                    pointStartCategory = this.colArray[indexCol].center
                    pointEndCategory = {
                        x: pointStartCategory.x + this.offsetBetweenFirstColumnCap,  // 起点距离第一列的直线距离
                        y: category.midLineY
                    }
                } else {
                    pointStartCategory = {
                        x: this.colArray[indexCol - 1].center.x + this.offsetBetweenFirstColumnCap,
                        y: this.colArray[indexCol].center.y
                    }
                    pointEndCategory = {
                        x: pointStartCategory.x + this.colWidth,
                        y: category.midLineY
                    }
                }

                if (this.option.category.dotSize){
                    drawDot(
                        ctx,
                        pointEndCategory,
                        this.option.category.dotSize,
                        this.option.category.lineWidth,
                        this.option.category.strokeStyle,
                        this.option.category.strokeStyle
                    )
                }

                // 文字 - 类别
                ctx.fillStyle = this.option.category.textColor
                ctx.font = this.option.category.font
                ctx.textBaseline = 'middle'
                ctx.textAlign = 'center'
                let titleCategory = this.isShowSerialNumber ?
                    `${indexCategory + 1}. ${category.name}`:
                    category.name
                ctx.fillText(
                    titleCategory,
                    pointEndCategory.x + this.option.category.textWidth / 2,
                    pointEndCategory.y - (this.isShowPrice? 8: 0),
                    this.option.category.textWidth
                )

                if (this.isShowPrice){
                    // 价格 - 类别
                    ctx.fillStyle = this.option.priceStyle.textColor
                    ctx.font = this.option.priceStyle.font
                    ctx.textBaseline = 'middle'
                    ctx.textAlign = 'center'
                    ctx.fillText(
                        `￥${category.price}`,

                        // -10 是为了抵消 ￥ 这个符号所占的空间，好让其它居中显示
                        pointEndCategory.x + this.option.category.textWidth / 2 - 10,
                        pointEndCategory.y + this.option.priceStyle.height - (this.isShowPrice? 8: 0),
                        this.option.category.textWidth
                    )
                }

                // 动画
                let radiusCategory = 0
                if (this.timeLine > this.animationDuration){
                    radiusCategory = this.option.category.radius
                } else {
                    radiusCategory = this.option.category.radius / this.animationDuration * this.timeLine
                }

                // 绘制连接至 category 的线段
                this.colArray[indexCol].bendX = drawArcLine(
                    ctx,
                    pointStartCategory,
                    pointEndCategory,
                    radiusCategory,
                    this.option.category.tailDistance,
                    this.option.category.lineWidth,
                    this.option.category.strokeStyle
                )
                this.option.thing.gapY = this.option.category.gapY / category.children.length // 二级中元素的间隔

                // 3. 遍历类别中的子元素
                category.children.forEach((thing, indexThing) => {
                    let pointEndThing = {
                        x: pointEndCategory.x + this.option.thing.lineDistance,
                        y: getYPositionOf(pointEndCategory.y, category.children.length, this.option.heightItem, indexThing)
                    }
                    if (this.option.thing.dotSize){
                        drawDot(ctx, pointEndThing, this.option.thing.dotSize, this.option.thing.lineWidth, this.option.thing.strokeStyle, this.option.thing.strokeStyle)
                    }
                    // 物品名字
                    ctx.fillStyle = thing.important? this.option.thing.textColorImportant: this.option.thing.textColor
                    ctx.font = thing.important? this.option.thing.fontImportant : this.option.thing.font
                    ctx.textBaseline = 'middle'
                    ctx.textAlign = 'left'

                    // 物品价格
                    let priceText = ''
                    if (this.isShowPrice) {
                        if (thing.price === undefined) {
                            priceText = ''
                        } else {
                            priceText = ' - ￥' + thing.price
                        }
                    }

                    let titleThing = this.isShowSerialNumber ?
                        `${indexThing + 1}. ${thing.name}`:
                        `${thing.name}${priceText}`
                    if (indexThing * 10 < this.timeLine){
                        ctx.fillText(
                            titleThing,
                            pointEndThing.x + 13,
                            pointEndThing.y
                        )
                    }

                    let pointStartThing = {
                        x: pointEndCategory.x + this.option.category.textWidth,
                        y: pointEndCategory.y
                    }
                    let radiusThing = 0
                    if (this.timeLine > this.animationDuration){
                        radiusThing = this.option.thing.radius
                        this.animationStop()
                    } else {
                        radiusThing = this.option.thing.radius / this.animationDuration * this.timeLine
                    }
                    if (indexThing * 10 < this.timeLine) {
                        drawArcLine(
                            ctx,
                            pointStartThing ,
                            pointEndThing,
                            radiusThing,
                            this.option.thing.tailDistance,
                            this.option.thing.lineWidth,
                            this.option.thing.strokeStyle
                        )
                    }
                })
            })

            // 4. 最后将未连接的 2.3.4.. 列连接到上一级连线上
            if (indexCol === 0){

            } else {
                let categoryStartPoint = {
                    x: this.colArray[indexCol - 1].bendX,
                    y: col.center.y
                }
                ctx.save()
                ctx.beginPath()
                ctx.lineWidth = this.option.category.lineWidth // 复用 一级的树形样式
                ctx.strokeStyle = this.option.category.strokeStyle
                ctx.moveTo(categoryStartPoint.x, categoryStartPoint.y)
                ctx.lineTo(col.center.x, col.center.y)
                ctx.stroke()
                drawDot(ctx,categoryStartPoint, 6,this.option.category.lineWidth,this.option.category.strokeStyle,'white')
                ctx.restore()
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
function drawDot(
    ctx,
    center,
    radius,
    lineWidth,
    fillColor,
    strokeColor
){
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
 * @param pointStart {{x: Number, y: Number}} 起点坐标
 * @param pointEnd {{x: Number, y: Number}} 末端坐标
 * @param radius  { Number } 圆角半径
 * @param endLineLength  { Number } 末端线段长度
 * @param lineWidth { Number } 线段宽度
 * @param lineColor  { String } 线段颜色
 * @return bendX { Number }
 */
function drawArcLine(
    ctx,
    pointStart,
    pointEnd,
    radius,
    endLineLength,
    lineWidth,
    lineColor
){
    ctx.save()
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.lineJoin = 'round'
    ctx.moveTo(pointStart.x, pointStart.y)
    let bendX = pointStart.x + (pointEnd.x - pointStart.x - endLineLength)
    ctx.arcTo(
        bendX, pointStart.y,
        bendX, pointEnd.y,
        radius
    )
    ctx.arcTo(
        bendX,    pointEnd.y,
        pointEnd.x, pointEnd.y,
        radius
    )
    ctx.lineTo(pointEnd.x, pointEnd.y)
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.restore()
    return bendX
}


function getColor(timeLine){
    return `hsla(${timeLine%360 + 200},150%,50%,1)`
}

/**
 * ## 输出随机 1 或 -1
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
 * ## 数组乱序算法
 * @param arr
 * @return {*}
 */
function shuffle(arr) {
    let length = arr.length,
        r = length,
        rand = 0;

    while (r) {
        rand = Math.floor(Math.random() * r--);
        [arr[r], arr[rand]] = [arr[rand], arr[r]];
    }
    return arr;
}

/**
 * ## 生成随机整数
 * @param min
 * @param max
 * @returns {number}
 */
function randomInt(min, max){
    return Number((Math.random() * (max - min) + min).toFixed(0))
}

/**
 * ## 生成随机整数
 * @param min
 * @param max
 * @returns {number}
 */
function randomFloat(min, max){
    return Number(Math.random() * (max - min) + min)
}
