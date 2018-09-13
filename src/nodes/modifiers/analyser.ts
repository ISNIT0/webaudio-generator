import { h } from 'nimble';

export default <WAGenNode>{
    getDefaultNode() {
        return {
            kind: 'modifier',
            type: 'analyser',
            options: {
                fftSize: 13
            }
        }
    },
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        return Promise.resolve(audioCtx.createAnalyser());
    },
    updateWANode(analyserNode: AnalyserNode & AudioNode, node: NodeDef) {
        analyserNode.fftSize = Math.pow(2, node.options.fftSize);
    },
    renderView(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [
            h('h3', `Analyser`)
        ]
    },
    renderDetail(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        const analyser = node.waNode;
        return [
            h('div', [
                h('strong', 'Frame Size:'),
                h('input', {
                    style: {
                        width: '100%'
                    },
                    type: 'range',
                    min: 4,
                    max: 15,
                    step: 1,
                    value: node.options.fftSize,
                    oninput(ev: any) {
                        affect.set(`graph.nodes.${nodeIndex}.options.fftSize`, ev.target.value);
                    }
                })
            ]),
            h('h5', 'Oscilloscope:'),
            h('canvas', {
                style: {
                    width: '100%',
                    height: '100px'
                },
                oncreate(element: HTMLCanvasElement, lastProps: {}) {
                    drawOscilloscope(element, analyser);
                },
                ondestroy(element: HTMLCanvasElement) {
                    (<any>element).isDestroyed = true;
                }
            }),
            h('h5', 'Frequency Distribution:'),
            h('canvas', {
                style: {
                    width: '100%',
                    height: '100px'
                },
                oncreate(element: HTMLCanvasElement, lastProps: {}) {
                    drawFrequency(element, analyser);
                },
                ondestroy(element: HTMLCanvasElement) {
                    (<any>element).isDestroyed = true;
                }
            })
        ];
    },
    generateCode(nodeName: string, node: NodeDef) {
        return `
const ${nodeName} = audioCtx.createAnalyser();
const ${nodeName}RenderFrame = document.createElement('div');
const ${nodeName}Oscilloscope = document.createElement('canvas');
const ${nodeName}Frequency = document.createElement('canvas');

${nodeName}RenderFrame.appendChild(${nodeName}Oscilloscope);
${nodeName}RenderFrame.appendChild(${nodeName}Frequency);

//Requires https://......../...js
drawOscilloscope(${nodeName}Oscilloscope, ${nodeName});
drawFrequency(${nodeName}Frequency, ${nodeName});
        `;
    }
}


function drawOscilloscope(canvas: HTMLCanvasElement, analyser: AnalyserNode) {

    if (!(<any>canvas).isDestroyed) {
        requestAnimationFrame(() => {
            drawOscilloscope(canvas, analyser);
        });
    }

    const canvasCtx = <CanvasRenderingContext2D>(<HTMLCanvasElement>canvas).getContext('2d');

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(242, 242, 242)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(187, 107, 217)";

    canvasCtx.beginPath();

    var sliceWidth = canvas.width * 1.0 / bufferLength;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / 128.0;
        var y = v * canvas.height / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

function drawFrequency(canvas: HTMLCanvasElement, analyser: AnalyserNode) {

    if (!(<any>canvas).isDestroyed) {
        requestAnimationFrame(() => {
            drawFrequency(canvas, analyser);
        });
    }

    const canvasCtx = <CanvasRenderingContext2D>canvas.getContext('2d');

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "rgb(242, 242, 242)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    var barWidth = (canvas.width / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);

        x += barWidth + 1;
    }
}