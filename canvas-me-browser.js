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
        this.isPlaying = false // 默认自动播放

        this.mouseX = 0
        this.mouseY = 0

        this.center=  {
            x: 600,
            y: 150
        }

        this.frame = {
            width : 1200,
            height: 300,
        }

        this.timeLine = 0

        this.bgColor = 'white'
        this.name = name
        this.attaches = attaches || []

        this.init()

        window.onresize = () => {
            this.frame.height = innerHeight * 2
            this.frame.width = innerWidth * 2
            let canvasLayer = document.getElementById('canvasLayer')
            this.updateFrameAttribute(canvasLayer)
        }
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
            x: this.frame.width / 2,
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

        ctx.clearRect(0, 0, this.frame.width, this.frame.height)

        ctx.imageSmoothingEnabled = true

        ctx.strokeStyle = 'black'
        ctx.fillStyle = 'black'
        ctx.font = '30px 微软雅黑'
        ctx.fillText(this.name, this.center.x, this.center.y - 10)


        let radius = 200
        ctx.moveTo(this.center.x + radius, this.center.y)
        ctx.arc(this.center.x, this.center.y,radius,0,Math.PI * 2,)
        ctx.lineWidth = 4
        ctx.stroke()

        // draw ItemName
        let offsetY = 200
        let offsetX = 800
        let cornerRadius = 100 - this.timeLine * 2
        if (cornerRadius < 60){
            cornerRadius = 60
        }
        this.attaches.forEach((item, index) => {
            let itemCenter = {
                x: this.center.x + offsetX,
                y: this.center.y - (offsetY * index)
            }
            ctx.fillText(item.name,itemCenter.x + 10, itemCenter.y)
            drawArcLine(ctx, this.center, itemCenter, cornerRadius, 4)
        })

        // 显示时间标线序号
        ctx.fillStyle = 'black'
        ctx.font = '20px sans-serf'
        ctx.clearRect(10, this.frame.height - 53, 100, 30)
        ctx.fillText(`${this.timeLine}`, 20, this.frame.height - 30)


        if (this.isPlaying) {
            window.requestAnimationFrame(() => {
                ctx.clearRect(0,0,this.frame.width, this.frame.height)
                this.draw()
            })
        }
    }
}

/**
 *  在 a 与 d 点之间线一条带圆角的拆线
 * @param ctx canvas.context
 * @param pointA 起点坐标 {x,y}
 * @param pointD 末端坐标 {x,y}
 * @param radius  圆角半径 Number
 * @param lineWidth  线段宽度 Number
 */
function drawArcLine(ctx, pointA, pointD, radius, lineWidth){
    ctx.moveTo(pointA.x, pointA.y)
    ctx.arcTo(
        pointA.x + (pointD.x - pointA.x) / 2,
        pointA.y,
        pointA.x + (pointD.x - pointA.x) / 2,
        pointD.y,
        radius
    )
    ctx.arcTo(
        pointA.x + (pointD.x - pointA.x) / 2,
        pointD.y,
        pointD.x,
        pointD.y,
        radius
    )
    ctx.lineTo(pointD.x, pointD.y)
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
