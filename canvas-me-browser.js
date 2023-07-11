/**
 * 我的所有物品
 * Canvas Me
 * @author: KyleBing(kylebing@163.com)
 * @github: https://github.com/KyleBing/animate-canvas-lost
 * @date-init: 2023-07-10
 * @date-update: 2023-07-10
 * @version: v0.0.1
 * @platform: NPM
 */

class CanvasMe {
    /**
     *
     */
    constructor(name, attaches) {
        this.isPlaying = true // 默认自动播放

        this.mouseX = 0
        this.mouseY = 0

        this.center=  {
            x: 600,
            y: 150
        }

        this.option = {
            lineRatio: 2/3,   // 拆线在什么部位弯折
            gapItemY: 20, // 每个元素的高度值
            gapBranchY: 30, // 每个分支的间隔
            mainTopic: {
                strokeStyle: '#000',
                lineWidth: 5,
                radius: 120, // 中心元素的圆形 radius
                name: name, // 主题名
                font: '40px 微软雅黑'
            },
            level1: {
                gapX: 400,
                gapY: 200,
                radius: 40,
                strokeStyle: '#333',
                lineWidth: 5,
                dotSize: 0,
                font: '28px 微软雅黑'
            },
            level2: {
                gapX: 300,
                gapY: 200,
                radius: 5,
                strokeStyle: '#666',
                lineWidth: 2,
                dotSize: 0,
                font: '20px 微软雅黑',
            },
        }

        this.separateArrays = [
            {name: 'left', attaches: [], countItems: 0},
            {name: 'right', attaches: [], countItems: 0}
        ]

        this.animationDuration = 10  // 动画多少帧内完成
        this.textWidth = 150 // 文字宽度
        this.bgColor = 'white'
        this.attaches = attaches || []  // 分支

        this.frame = {
            width : 1200,
            height: 300,
        }

        this.timeLine = 0

        this.init()

        window.onresize = () => {
            this.frame.height = innerHeight * 2
            this.frame.width = innerWidth * 2
            let canvasLayer = document.getElementById('canvasLayer')
            this.updateFrameAttribute(canvasLayer)
        }
        this.lastTime = new Date().getTime()
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


        this.option.level1.gapY = (this.frame.height - 100 * 2) / this.attaches.length

        // fill background
        let ctx = canvasLayer.getContext('2d')
        ctx.fillStyle = this.bgColor
        ctx.fill()
    }

    init(){
        this.frame.height = document.documentElement.clientHeight * 2
        this.frame.width = document.documentElement.clientWidth * 2

        this.center = {
            x: 200,
            y: this.frame.height / 2
        }

        let canvasLayer = document.createElement("canvas")
        this.updateFrameAttribute(canvasLayer)
        document.documentElement.append(canvasLayer)


        // 子元素总个数
        let countItems = 0
        this.attaches.forEach(branchLv1 =>{
            countItems = countItems + branchLv1.children.length
        })

        // 分组
        this.attaches = this.attaches.sort((a,b) => b.children.length - a.children.length)
        let countLeft = 0
        let countRight = 0
        // 大约均分两部分
        this.attaches.forEach(item => {
            if (this.separateArrays[0].countItems > this.separateArrays[1].countItems){
                this.separateArrays[1].attaches.push(item)
                this.separateArrays[1].countItems = this.separateArrays[1].countItems + item.children.length
            } else {
                this.separateArrays[0].attaches.push(item)
                this.separateArrays[0].countItems = this.separateArrays[0].countItems + item.children.length
            }
        })

        console.log(this.separateArrays)
        let maxCount = this.separateArrays[0].countItems > this.separateArrays[1].countItems ? this.separateArrays[0].countItems : this.separateArrays[1].countItems
        this.option.gapItemY = ( this.frame.height - 100 * 2  - (this.attaches.length - 1) * this.option.gapBranchY) / maxCount

        // 计算每个区块的高度数据
        this.separateArrays.forEach(separateArray => {
            let heightAmount = 0
            let lastYPos = 100
            separateArray.attaches.forEach((branchLv1, index) => {
                branchLv1.height = this.option.gapItemY * branchLv1.children.length
                heightAmount = heightAmount + branchLv1.height
                lastYPos = lastYPos + branchLv1.height + this.option.gapBranchY
                branchLv1.midLineY = lastYPos - branchLv1.height / 2
            })
        })


        this.draw()

        document.documentElement.addEventListener('mousemove', event => {
            this.mouseX = event.x
            this.mouseY = event.y
        })
    }

    draw() {
        this.timeLine = this.timeLine + 1
        let canvasLayer = document.getElementById('canvasLayer')
        let ctx = canvasLayer.getContext('2d')
        ctx.clearRect(0,0,this.frame.width, this.frame.height)

        ctx.save()
        // main topic
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
        ctx.restore()


        ctx.strokeStyle = 'black'
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center'
        ctx.font =  this.option.mainTopic.font
        ctx.textBaseline = 'middle'
        ctx.fillText(this.option.mainTopic.name, this.center.x, this.center.y)

        this.separateArrays.forEach((separateArray, index) => {
            let baseOffsetX = index * 1200
            separateArray.attaches.forEach((item1Level, index1) => {
                let center = {
                    x: this.center.x + baseOffsetX,
                    y: this.center.y
                }
                 // todo 解决偏移量被算在线段长度中的问题
                if (baseOffsetX){
                    // ctx.save()
                    // ctx.beginPath()
                    // ctx.moveTo(center)
                    // ctx.stroke()
                    // ctx.restore()
                }
                let branchHeight = this.option.gapItemY * item1Level.children.length
                let endPoint1 = {
                    x: this.center.x + this.option.level1.gapX + baseOffsetX,
                    y: item1Level.midLineY
                }
                if (this.option.level1.dotSize){
                    drawDot(ctx, endPoint1,this.option.level1.dotSize, this.option.level1.strokeStyle)
                }
                // text style 1
                ctx.font = this.option.level1.font
                ctx.textBaseline = 'middle'
                ctx.textAlign = 'left'
                ctx.fillText(item1Level.name,endPoint1.x + 30, endPoint1.y, this.textWidth)

                let startPoint1 = {
                    x: this.center.x + this.option.mainTopic.radius,
                    y: this.center.y
                }
                let cornerRadius1 = 0
                if (this.timeLine > this.animationDuration){
                    cornerRadius1 = this.option.level1.radius
                } else {
                    cornerRadius1 = this.option.level1.radius / this.animationDuration * this.timeLine
                }
                drawArcLine(ctx, startPoint1, endPoint1, cornerRadius1, this.option.level1.lineWidth, this.option.level1.strokeStyle, this.option.lineRatio)

                this.option.level2.gapY = this.option.level1.gapY / item1Level.children.length
                item1Level.children.forEach((item2Level, index2) => {
                    let endPoint2 = {
                        x: endPoint1.x + this.option.level2.gapX,
                        y: getYPositionOf(endPoint1.y, item1Level.children.length, this.option.gapItemY, index2)
                    }
                    if (this.option.level2.dotSize){
                        drawDot(ctx, endPoint2,this.option.level2.dotSize,this.option.level2.strokeStyle)
                    }
                    // text style 2
                    ctx.font = this.option.level2.font
                    ctx.textBaseline = 'middle'
                    ctx.textAlign = 'left'
                    ctx.fillText(item2Level.name,endPoint2.x + 10, endPoint2.y)

                    let startPoint2 = {
                        x: endPoint1.x + this.textWidth,
                        y: endPoint1.y
                    }
                    let cornerRadius2 = 0
                    if (this.timeLine > this.animationDuration){
                        cornerRadius2 = this.option.level2.radius
                        this.animationStop()
                    } else {
                        cornerRadius2 = this.option.level2.radius / this.animationDuration * this.timeLine
                    }

                    drawArcLine(ctx, startPoint2 , endPoint2, cornerRadius2, this.option.level2.lineWidth, this.option.level2.strokeStyle, this.option.lineRatio)
                })
            })
        })
        // 展示 canvas 动画数据
        showAnimationInfo(ctx, this.timeLine, this.frame)

        if (this.isPlaying) {
            window.requestAnimationFrame(() => {
                this.draw()
            })
        }
    }
}

/**
 * ## 显示时间标线序号
 * @param ctx
 * @param timeline {''}
 * @param frame {{width, height}}
 */
function showAnimationInfo(ctx, timeline, frame){
    ctx.beginPath()
    ctx.fillStyle = 'black'
    ctx.font = '20px sans-serf'
    ctx.clearRect(10, frame.height - 53, 220, 30)
    // ctx.fillRect(10, frame.height - 53, 220, 30)
    let currentTime =  new Date().getTime()
    ctx.fillText(`${currentTime - this.lastTime} ms/frame  |  ${timeline} 帧`, 20, frame.height - 32)
    this.lastTime = currentTime
}

/**
 * ## 画点
 * @param ctx
 * @param center {{x: Number,y: Number}}
 * @param radius {Number}
 * @param color {String}
 */

function drawDot(ctx, center, radius, color){
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(center.x + radius, center.y)
    ctx.lineWidth = 0
    ctx.strokeStyle = color || 'black'
    ctx.fillStyle = color || 'black'
    ctx.arc(center.x, center.y, radius,0, Math.PI * 2 )
    ctx.closePath()
    ctx.fill()
    // ctx.stroke()
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
 * @param lineWidth { Number } 线段宽度
 * @param lineColor  { String } 线段颜色
 * @param lineRatio  { Number } 拆线的部位
 */
function drawArcLine(ctx, pointA, pointD, radius, lineWidth, lineColor, lineRatio){
    ctx.save()
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.lineJoin = 'round'
    ctx.moveTo(pointA.x, pointA.y)
    ctx.arcTo(
        pointA.x + (pointD.x - pointA.x) * lineRatio,
        pointA.y,
        pointA.x + (pointD.x - pointA.x) * lineRatio,
        pointD.y,
        radius
    )
    ctx.arcTo(
        pointA.x + (pointD.x - pointA.x) * lineRatio,
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
