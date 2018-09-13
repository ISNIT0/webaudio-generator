"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nimble_1 = require("nimble");
exports.default = {
    getDefaultNode: function () {
        return {
            kind: 'modifier',
            type: 'analyser',
            options: {
                fftSize: 13
            }
        };
    },
    initWANode: function (audioCtx, node) {
        return Promise.resolve(audioCtx.createAnalyser());
    },
    updateWANode: function (analyserNode, node) {
        analyserNode.fftSize = Math.pow(2, node.options.fftSize);
    },
    renderView: function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('h3', "Analyser")
        ];
    },
    renderDetail: function (state, affect, node, nodeIndex) {
        var analyser = node.waNode;
        return [
            nimble_1.h('div', [
                nimble_1.h('strong', 'Frame Size:'),
                nimble_1.h('input', {
                    style: {
                        width: '100%'
                    },
                    type: 'range',
                    min: 4,
                    max: 15,
                    step: 1,
                    value: node.options.fftSize,
                    oninput: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.fftSize", ev.target.value);
                    }
                })
            ]),
            nimble_1.h('h5', 'Oscilloscope:'),
            nimble_1.h('canvas', {
                style: {
                    width: '100%',
                    height: '100px'
                },
                oncreate: function (element, lastProps) {
                    drawOscilloscope(element, analyser);
                },
                ondestroy: function (element) {
                    element.isDestroyed = true;
                }
            }),
            nimble_1.h('h5', 'Frequency Distribution:'),
            nimble_1.h('canvas', {
                style: {
                    width: '100%',
                    height: '100px'
                },
                oncreate: function (element, lastProps) {
                    drawFrequency(element, analyser);
                },
                ondestroy: function (element) {
                    element.isDestroyed = true;
                }
            })
        ];
    },
    generateCode: function (nodeName, node) {
        return "\nconst " + nodeName + " = audioCtx.createAnalyser();\nconst " + nodeName + "RenderFrame = document.createElement('div');\nconst " + nodeName + "Oscilloscope = document.createElement('canvas');\nconst " + nodeName + "Frequency = document.createElement('canvas');\n\n" + nodeName + "RenderFrame.appendChild(" + nodeName + "Oscilloscope);\n" + nodeName + "RenderFrame.appendChild(" + nodeName + "Frequency);\n\n//Requires https://......../...js\ndrawOscilloscope(" + nodeName + "Oscilloscope, " + nodeName + ");\ndrawFrequency(" + nodeName + "Frequency, " + nodeName + ");\n        ";
    }
};
function drawOscilloscope(canvas, analyser) {
    if (!canvas.isDestroyed) {
        requestAnimationFrame(function () {
            drawOscilloscope(canvas, analyser);
        });
    }
    var canvasCtx = canvas.getContext('2d');
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
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
        }
        else {
            canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}
function drawFrequency(canvas, analyser) {
    if (!canvas.isDestroyed) {
        requestAnimationFrame(function () {
            drawFrequency(canvas, analyser);
        });
    }
    var canvasCtx = canvas.getContext('2d');
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
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
