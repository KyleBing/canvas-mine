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
        this.centerRrcRadius = 150 // 中心元素的圆形 radius
        this.cornorRadius = 80  // 线段的圆角大小


        this.textWidth = 150 // 文字宽度
        this.frame = {
            width : 1200,
            height: 300,
        }

        this.timeLine = 0

        this.bgColor = 'white'
        this.name = name  // 主题名
        this.attaches = attaches || []  // 分支

        this.init()

        window.onresize = () => {
            this.frame.height = innerHeight * 2
            this.frame.width = innerWidth * 2
            let canvasLayer = document.getElementById('canvasLayer')
            this.updateFrameAttribute(canvasLayer)
        }
        this.lastTime = new Date().getTime()
    }

    play(){
        if (this.isPlaying){

        } else {
            this.isPlaying = true
            this.draw()
        }
    }
    stop(){
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

        // fill background
        let ctx = canvasLayer.getContext('2d')
        ctx.fillStyle = this.bgColor
        // ctx.rect(0,0,this.frame.width, this.frame.height)
        ctx.fill()
    }

    init(){
        this.frame.height = document.documentElement.clientHeight * 2
        this.frame.width = document.documentElement.clientWidth * 2

        this.center = {
            x: this.frame.width / 3,
            y: this.frame.height / 2
        }

        let canvasLayer = document.createElement("canvas")
        this.updateFrameAttribute(canvasLayer)
        document.documentElement.append(canvasLayer)

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

        ctx.strokeStyle = 'black'
        ctx.fillStyle = 'black'
        ctx.textAlign = 'center'
        ctx.font = '35px 微软雅黑'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.name, this.center.x, this.center.y)

        ctx.moveTo(this.center.x + this.centerRrcRadius, this.center.y)
        ctx.arc(this.center.x, this.center.y,this.centerRrcRadius,0,Math.PI * 2,)
        ctx.lineWidth = 4
        ctx.stroke()

        // draw ItemName
        let offsetY = 200
        let offsetX = 600

        let gapHole = offsetY * this.attaches.length
        let middleLineY = this.center.y

        this.attaches.forEach((item, index) => {
            let itemCenter = {
                x: this.center.x + offsetX,
                y: getYPositionOf(middleLineY,this.attaches.length, offsetY, index)
            }
            // drawDot(ctx,itemCenter,10,'orange')
            ctx.font = '35px 微软雅黑'
            ctx.textBaseline = 'middle'
            ctx.textAlign = 'left'
            ctx.fillText(item.name,itemCenter.x + 30, itemCenter.y, this.textWidth)

            let startPoint = {
                x: this.center.x + this.centerRrcRadius,
                y: this.center.y
            }
            drawArcLine(ctx, startPoint, itemCenter, this.cornorRadius, 5, 'black')

            item.children.forEach((subItem, subIndex) => {
                let subItemCenter = {
                    x: this.center.x + offsetX + offsetX / 2,
                    y: getYPositionOf(itemCenter.y, item.children.length, offsetY / item.children.length, subIndex)
                }
                ctx.font = '30px 微软雅黑'
                ctx.textBaseline = 'middle'
                ctx.textAlign = 'left'
                ctx.fillText(subItem.name,subItemCenter.x + 10, subItemCenter.y)
                drawArcLine(ctx, {x:itemCenter.x + this.textWidth, y: itemCenter.y} , subItemCenter, 20, 3, '#666')
            })
        })

        // 显示时间标线序号
        ctx.fillStyle = 'black'
        ctx.font = '20px sans-serf'
        ctx.clearRect(10, this.frame.height - 53, 220, 30)
        // ctx.fillRect(10, this.frame.height - 53, 220, 30)
        let currentTime =  new Date().getTime()
        ctx.fillText(`${currentTime - this.lastTime} ms/frame  |  ${this.timeLine} 帧`, 20, this.frame.height - 32)
        this.lastTime = currentTime

        if (this.isPlaying) {
            window.requestAnimationFrame(() => {
                ctx.clearRect(0,0,this.frame.width, this.frame.height)
                this.draw()
            })
        }
    }
}

/**
 * 画点
 * @param ctx
 * @param center
 * @param radius
 * @param color
 */

function drawDot(ctx, center, radius, color){
    ctx.moveTo(center.x - radius, center.y)
    ctx.fillStyle = color || 'black'
    ctx.arc(center.x, center.y, radius,0, Math.PI * 2)
    // ctx.fill()
    ctx.stroke()
}

/**
 * 获取第 index 个元素的 y 位置
 * @param middleLineY 中心线的 y 位置
 * @param itemSize 元素数量
 * @param gap 每个元素之间的间隔
 * @param index 第几个元素的位置
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
 *  在 a 与 d 点之间线一条带圆角的拆线
 * @param ctx canvas.context
 * @param pointA 起点坐标 {x,y}
 * @param pointD 末端坐标 {x,y}
 * @param radius  圆角半径 Number
 * @param lineWidth  线段宽度 Number
 * @param lineColor  线段颜色 String
 */
function drawArcLine(ctx, pointA, pointD, radius, lineWidth, lineColor){
    ctx.beginPath()
    ctx.moveTo(pointA.x, pointA.y)
    ctx.arcTo(
        pointA.x + (pointD.x - pointA.x) / 3 * 2,
        pointA.y,
        pointA.x + (pointD.x - pointA.x) / 3 * 2,
        pointD.y,
        radius
    )
    ctx.arcTo(
        pointA.x + (pointD.x - pointA.x) / 3 * 2,
        pointD.y,
        pointD.x,
        pointD.y,
        radius
    )
    ctx.lineTo(pointD.x, pointD.y)
    // ctx.closePath()
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
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
