const volume = document.getElementById('volume')
const bass = document.getElementById('bass')
const mid = document.getElementById('mid')
const treble = document.getElementById('treble')
const visualizer = document.getElementById('visualizer')

const context = new AudioContext()
const analyserNode = new AnalyserNode(context, { fftSize: 2048 })

setupContext()
resize()
drawVisualiser()

async function setupContext(){
    const guitar = await getGuitar()
    if(context.state === 'suspended'){
        await context.resume()
    }
    const source = context.createMediaStreamSource(guitar)
    source
        .connect(analyserNode)
}

function getGuitar(){
    return navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 0
        }
    })
}

function drawVisualiser(){
    requestAnimationFrame(drawVisualiser)

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserNode.getByteFrequencyData(dataArray)
    const width = visualizer.width*3.1
    const height = visualizer.height
    const barWidth = width / bufferLength

    const canvasContext = visualizer.getContext('2d')
    canvasContext.clearRect( 0, 0, width, height)

    dataArray.forEach((item, index) => {
        const y = item / 255 * height / 3
        const x = barWidth * index

        canvasContext.fillStyle = `hsl(${y / height * 800}, 100%, 50%)`
        canvasContext.fillRect(x, height - y, barWidth, y)
    })
}

function resize(){
    visualizer.width = visualizer.clientWidth * window.devicePixelRatio
    visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}

