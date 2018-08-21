(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
    "nodes": [{
        "kind": "input",
        "type": "oscillator",
        "options": {
            "waveType": "sine",
            "frequency": 1000
        }
    }, {
        "kind": "modifier",
        "type": "gain",
        "options": {
            "value": "0.1"
        }
    }, {
        "kind": "output",
        "type": "speaker"
    }]
}
},{}],2:[function(require,module,exports){
const {
    makeRenderLoop,
    h
} = window.nimble;
window.h = h;

const defaultGraph = require('./defaultGraph.json');
const nodeDefs = require('./nodes/index');

const target = document.getElementById('frame');

function makeArrow(state, affect, index, direction = 'down') {
    return h(`svg`, {
        width: 38,
        height: 135,
        viewBox: "0 0 38 135",
        fill: 'none',
        style: {
            width: '100%',
            height: '30px',
            cursor: 'pointer'
        },
        onclick: function () {
            addNode(state, affect, index + 1, nodeDefs.modifier.gain.default())
        }
    }, [
        h('path', {
            d: "M17.2322 133.768C18.2085 134.744 19.7915 134.744 20.7678 133.768L36.6777 117.858C37.654 116.882 37.654 115.299 36.6777 114.322C35.7014 113.346 34.1184 113.346 33.1421 114.322L19 128.464L4.85786 114.322C3.88155 113.346 2.29864 113.346 1.32233 114.322C0.34602 115.299 0.34602 116.882 1.32233 117.858L17.2322 133.768ZM16.5 0L16.5 132H21.5L21.5 0L16.5 0Z",
            fill: 'black'
        })
    ])
}

async function addNode(state, affect, newIndex, node) {
    if (!node.waNode) {
        const nodeDef = nodeDefs[node.kind][node.type];
        node.waNode = await nodeDef.initWANode(state.audioCtx, node);
        nodeDef.updateWANode(node.waNode, node, newIndex, state.graph);
    }


    const nodes = state.graph.nodes.slice();

    const prevNode = nodes[newIndex - 1];
    const nextNode = nodes[newIndex];

    prevNode.waNode.disconnect(nextNode.waNode);
    prevNode.waNode.connect(node.waNode);
    node.waNode.connect(nextNode.waNode);

    nodes.splice(newIndex, 0, node);
    affect.set('graph.nodes', nodes);
}

function deleteNode(state, affect, index) {
    const nodes = state.graph.nodes.slice();

    const thisNode = nodes[index];
    const prevNode = nodes[index - 1];
    const nextNode = nodes[index + 1];

    prevNode.waNode.disconnect(thisNode.waNode);
    thisNode.waNode.disconnect(nextNode.waNode);
    prevNode.waNode.connect(nextNode.waNode);

    nodes.splice(index, 1);
    affect.set('graph.nodes', nodes);
}

function replaceNode(state, affect, newNode, index) {
    const nodes = state.graph.nodes.slice();

    const thisNode = nodes[index];
    const prevNode = nodes[index - 1];
    const nextNode = nodes[index + 1];

    if (prevNode) {
        prevNode.waNode.connect(newNode.waNode);
        prevNode.waNode.disconnect(thisNode.waNode);
    }

    thisNode.waNode.disconnect(nextNode.waNode);
    newNode.waNode.connect(nextNode.waNode);

    nodes.splice(index, 1, newNode);
    affect.set('graph.nodes', nodes);
}

function renderNode(state, affect, node, index) {
    const nodeDef = nodeDefs[node.kind][node.type];
    return h('div.node-cont', [
        h('div.node-centraliser', [
            h(`div.node.${node.kind}`, {
                    onclick(ev) {
                        const isValidEv = ev.target.classList.contains('node') || ev.target.parentElement.classList.contains('node');
                        if (isValidEv) {
                            if (state.selectedNode === index) {
                                affect.set('selectedNode', -1)
                            } else {
                                affect.set('selectedNode', index);
                            }
                        }
                    }
                },
                nodeDef.renderView(state, affect, node, index) || [
                    h('h3', node.kind === 'modifier' ? node.type : node.kind),
                ]
            ),
            state.selectedNode === index ?
            h('div.node-detail', [
                node.kind === 'modifier' ? h('button.deleteNode', {
                    onclick() {
                        deleteNode(state, affect, index);
                        affect.set('selectedNode', -1);
                    }
                }, 'delete') : null,
                h('div', [
                    h('strong', 'Node Type:'),
                    h('select', {
                            value: node.type,
                            async onchange(ev) {
                                affect.set('selectedNode', -1);
                                const newType = ev.target.value;
                                const newNodeDef = nodeDefs[node.kind][newType];
                                const newNode = newNodeDef.default();

                                newNode.waNode = await newNodeDef.initWANode(state.audioCtx, newNode);
                                newNodeDef.updateWANode(newNode.waNode, newNode, index, state.graph);

                                replaceNode(state, affect, newNode, index);
                            }
                        },
                        Object.keys(nodeDefs[node.kind]).map(type => h('option', type)))
                ]),
                h('hr'),
                nodeDef.renderDetail(state, affect, node, index)
            ]) :
            null,
            index !== state.graph.nodes.length - 1 ? makeArrow(state, affect, index) : null,
        ])
    ]);
}

var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

window.injectAffect = makeRenderLoop(target, {
        graph: initGraph(audioCtx, defaultGraph),
        selectedNode: -1,
        audioCtx: audioCtx
    },
    function (state, affect, changes) {
        changes.filter(ch => !!~ch.indexOf('graph.nodes.'))
            .map(ch => Number(ch.split('.')[2]))
            .forEach(nodeIndex => {
                const node = state.graph.nodes[nodeIndex];
                const nodeDef = nodeDefs[node.kind][node.type];
                nodeDef.updateWANode(node.waNode, node, nodeIndex, state.graph);
            });
        return h('div.app', [
            h('div.code-preview', [
                h('h1', 'Code'),
                h('code', [h('pre', generateGraphCode(state.graph))])
            ]),
            h('div.graph-preview', state.graph.nodes.map((node, index) => renderNode(state, affect, node, index)))
        ]);
    }
);

function getNodeName(graph, nodeIndex) {
    const node = graph.nodes[nodeIndex];
    const nodeIndexesOfType = graph.nodes.reduce((acc, n, index) => {
        if (n.type === node.type) {
            acc.push(index);
        }
        return acc;
    }, []);
    const nodeName = nodeIndexesOfType.length > 1 ? `${node.type}Node${nodeIndexesOfType.indexOf(nodeIndex)+1}` : `${node.type}Node`;
    return nodeName;
}

function generateGraphCode(graph) {
    return `(async function(){ // Top Level async/await

` + (`const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    ` + graph.nodes.map((node, nodeIndex) => {
        const nodeDef = nodeDefs[node.kind][node.type];
        const nodeName = getNodeName(graph, nodeIndex);
        return nodeDef.generateCode ? nodeDef.generateCode(nodeName, node) : '';
    }).join('\n') + '\n\n' + graph.nodes.map((node, index, arr) => {
        if (index === 0) {} else {
            const prevNodeName = getNodeName(graph, index - 1);
            const nodeName = getNodeName(graph, index);
            return `${prevNodeName}.connect(${nodeName});`;
        }
    }).join('\n')).split('\n').map(l => '   ' + l).join('\n') + `

})();`;
}

function initGraph(audioCtx, graph) {
    Promise.all(
        graph.nodes.map(async (node, nodeIndex) => {
            const nodeDef = nodeDefs[node.kind][node.type];
            const waNode = await nodeDef.initWANode(audioCtx, node);
            nodeDef.updateWANode(waNode, node, nodeIndex, graph); //Mutation
            node.waNode = waNode;
        })
    ).then(() => {

        graph.nodes.forEach((node, index, arr) => {
            if (index === 0) {
                // Nothing to connect
            } else {
                const prevNode = arr[index - 1];
                prevNode.waNode.connect(node.waNode);
            }
        });
    });

    return graph;
}
},{"./defaultGraph.json":1,"./nodes/index":3}],3:[function(require,module,exports){
module.exports = {
    input:require('./inputs/index'),
    output:require('./outputs/index'),
    modifier:require('./modifiers/index')
}
},{"./inputs/index":5,"./modifiers/index":13,"./outputs/index":14}],4:[function(require,module,exports){
module.exports = {
    default () {
        return {
            "kind": "input",
            "type": "file",
            "options": {
                "filePath": "./res/br-jam-loop.wav"
            }
        };
    },
    initWANode(audioCtx, node) {
        const bufferSource = audioCtx.createBufferSource();
        bufferSource.loop = true;
        return Promise.resolve(bufferSource);
    },
    updateWANode(bufferSource, node, nodeIndex, graph) {
        (new BufferLoader(
            bufferSource.context, [node.options.filePath],
            async function ([buffer]) {
                if ((bufferSource.buffer || []).length != buffer.length) {
                    const newSource = bufferSource.context.createBufferSource();
                    newSource.loop = true;
                    newSource.buffer = buffer;

                    const nextNode = graph.nodes[nodeIndex + 1];

                    newSource.connect(nextNode.waNode);
                    newSource.start(0);
                    try {
                        bufferSource.stop();
                    } catch (e) {}
                    bufferSource.disconnect(nextNode.waNode);
                    node.waNode = newSource;
                }
            }
        )).load();
    },
    renderView(state, affect, node, nodeIndex) {},
    renderDetail(state, affect, node, nodeIndex) {
        return [
            h('div', [
                h('strong', 'Audio File:'),
                h('select', {
                    value: node.options.filePath,
                    onchange(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.filePath`, ev.target.value);
                    }
                }, [
                    h('option', {
                        value: './res/br-jam-loop.wav'
                    }, 'Jam Loop'),
                    h('option', {
                        value: './res/techno.wav'
                    }, 'Techno')
                ])
            ])
        ];
    },
    generateCode(nodeName, node) {
        return `
const audioFileRequest = new XMLHttpRequest();
audioFileRequest.open('GET', "${node.options.filePath}", true);
audioFileRequest.responseType = 'arraybuffer';

const audioFilePromise = new Promise((resolve, reject) => {
    audioFileRequest.onload = function() {
        audioCtx.decodeAudioData(audioFileRequest.response, resolve, reject);
    }
    audioFileRequest.onerror = reject;
})
audioFileRequest.send();

const ${nodeName} = audioCtx.createBufferSource();
${nodeName}.buffer = await audioFilePromise;
${nodeName}.start(0);
`;
    }
}
},{}],5:[function(require,module,exports){
module.exports = {
    microphone: require('./microphone'),
    oscillator: require('./oscillator'),
    file: require('./file')
};
},{"./file":4,"./microphone":6,"./oscillator":7}],6:[function(require,module,exports){
module.exports = {
    default () {
        return {
            "kind": "input",
            "type": "microphone"
        };
    },
    initWANode(audioCtx, node) {
        return navigator.mediaDevices.getUserMedia({
                audio: true
            })
            .then(function (stream) {
                return audioCtx.createMediaStreamSource(stream);
            });
    },
    updateWANode(oscillator, node) {},
    renderView(state, affect, node, nodeIndex) {},
    renderDetail(state, affect, node, nodeIndex) {
        return [
            
        ];
    },
    generateCode(nodeName, node){
        return `
const ${nodeName} = audioCtx.createMediaStreamSource(
    await navigator.mediaDevices.getUserMedia({ audio: true })
);
`;
    }
};
},{}],7:[function(require,module,exports){
module.exports = {
    default () {
        return {
            "kind": "input",
            "type": "oscillator",
            "options": {
                "waveType": "sine",
                "frequency": 1000
            }
        };
    },
    initWANode(audioCtx, node) {
        const oscillator = audioCtx.createOscillator();
        oscillator.start();
        return Promise.resolve(oscillator);
    },
    updateWANode(oscillator, node) {
        oscillator.type = node.options.waveType;
        oscillator.frequency = node.options.frequency;
    },
    renderView(state, affect, node, nodeIndex) {},
    renderDetail(state, affect, node, nodeIndex) {
        return [
            h('div', [
                h('strong', 'WaveType:'),
                h('select', {
                    value: node.options.waveType,
                    onchange(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.waveType`, ev.target.value);
                    }
                }, [
                    h('option', 'sine'),
                    h('option', 'square'),
                    h('option', 'sawtooth')
                ])
            ])
        ];
    },
    generateCode(nodeName, node) {
        return `
const ${nodeName} = audioCtx.createOscillator();
${nodeName}.type = "${node.options.waveType}";
${nodeName}.frequency = ${node.options.frequency};
${nodeName}.start();
`;
    }
}
},{}],8:[function(require,module,exports){
module.exports = {
    default () {
        return {
            kind: 'modifier',
            type: 'analyser',
            options: {
                fftSize: 13
            }
        }
    },
    initWANode(audioCtx, node) {
        return Promise.resolve(audioCtx.createAnalyser());
    },
    updateWANode(analyserNode, node) {
        analyserNode.fftSize = Math.pow(2, node.options.fftSize);
    },
    renderView(state, affect, node, nodeIndex) {
        return [
            h('h3', `Analyser`)
        ]
    },
    renderDetail(state, affect, node, nodeIndex) {
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
                    oninput(ev) {
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
                oncreate(element, lastProps) {
                    drawOscilloscope(element, analyser);
                },
                ondestroy(element) {
                    element.isDestroyed = true;
                }
            }),
            h('h5', 'Frequency Distribution:'),
            h('canvas', {
                style: {
                    width: '100%',
                    height: '100px'
                },
                oncreate(element, lastProps) {
                    drawFrequency(element, analyser);
                },
                ondestroy(element) {
                    element.isDestroyed = true;
                }
            })
        ];
    },
    generateCode(nodeName, node) {
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


function drawOscilloscope(canvas, analyser) {

    if (!canvas.isDestroyed) {
        requestAnimationFrame(() => {
            drawOscilloscope(canvas, analyser);
        });
    }

    const canvasCtx = canvas.getContext('2d');

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

function drawFrequency(canvas, analyser) {

    if (!canvas.isDestroyed) {
        requestAnimationFrame(() => {
            drawFrequency(canvas, analyser);
        });
    }

    const canvasCtx = canvas.getContext('2d');

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
},{}],9:[function(require,module,exports){
module.exports = {
    default () {
        return {
            kind: 'modifier',
            type: 'biquadFilter',
            options: {
                type: 'lowpass',
                Q: 1,
                frequency: 350,
                gain: 0,
                detune: 0,
            }
        }
    },
    initWANode(audioCtx, node) {
        return Promise.resolve(audioCtx.createBiquadFilter());
    },
    updateWANode(filterNode, node) {
        filterNode.gain.value = node.options.gain;
        filterNode.Q.value = node.options.Q;
        filterNode.detune.value = node.options.detune;
        filterNode.frequency.value = node.options.frequency;
        filterNode.type.value = node.options.type;
    },
    renderView(state, affect, node, nodeIndex) {
        return [
            h('h3', `Biquad Filter`),
            h('span', `${node.options.frequency}`)
        ]
    },
    renderDetail(state, affect, node, nodeIndex) {
        return [
            h('div', [
                h('strong', 'Type:'),
                h('select', {
                    value: node.options.type,
                    onchange(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.type`, ev.target.value);
                    }
                }, [
                    h('option', 'lowpass'),
                    h('option', 'highpass'),
                    h('option', 'bandpass'),
                    h('option', 'lowshelf'),
                    h('option', 'highshelf'),
                    h('option', 'peaking'),
                    h('option', 'notch'),
                    h('option', 'allpass')
                ])
            ]),
            h('div', [
                h('strong', 'Q:'),
                h('input', {
                    type: 'range',
                    min: -10,
                    max: 10,
                    step: 0.5,
                    value: node.options.Q,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.Q`, ev.target.value);
                    }
                })
            ]),
            h('div', [
                h('strong', 'Frequency:'),
                h('input', {
                    type: 'range',
                    min: 0,
                    max: 10000,
                    step: 1,
                    value: node.options.frequency,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.frequency`, ev.target.value);
                    }
                })
            ]),
            h('div', [
                h('strong', 'Gain:'),
                h('input', {
                    type: 'range',
                    min: 0,
                    max: 3,
                    step: 0.1,
                    value: node.options.gain,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.gain`, ev.target.value);
                    }
                })
            ]),
            h('div', [
                h('strong', 'Detune:'),
                h('input', {
                    type: 'range',
                    min: -10,
                    max: 10,
                    step: 0.5,
                    value: node.options.detune,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.detune`, ev.target.value);
                    }
                })
            ])
        ];
    },
    generateCode(nodeName, node) {
        return `
const ${nodeName} = audioCtx.createBiquadFilter();
${nodeName}.gain.value = ${node.options.gain};
${nodeName}.Q.value = ${node.options.Q};
${nodeName}.detune.value = ${node.options.detune};
${nodeName}.frequency.value = ${node.options.frequency};
${nodeName}.type.value = "${node.options.type}";
`;
    }
}
},{}],10:[function(require,module,exports){
function intArrayFromBase64(s) {
    var decoded = atob(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0; i < decoded.length; ++i) {
        bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
}

//export function processor(input_ptr: i32, output_ptr: i32, length: i32): void {
const gainTsSource = `
let gain = <f32>0.5;
for (let byte = <i32>0; byte < length; ++byte) {
  let inp = load<f32>(input_ptr + 4 * byte);
  store<f32>(output_ptr + 4 * byte, inp * gain);
}
`;
//}



//Yuk Yuk Yuk
function makeProcessorsFile(id, parsedBinary) {
    return `
const wasmBinary = new Uint8Array([${parsedBinary}]);

const memory = new WebAssembly.Memory({
    initial: 10
});
const module = new WebAssembly.Module(wasmBinary);
const instance = new WebAssembly.Instance(module, {
    env: {
        abort(msg, file, line, column) {
            console.error("abort called at main.ts:" + line + ":" + column);
        },
        memory
    }
});

const result = {
    instance
};

const exp = result.instance.exports;

class MyWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputs, outputs, parameters) {
        let input = inputs[0];
        let output = outputs[0];
        let channelCount = input.length;
        for (let channel = 0; channel < channelCount; ++channel) {
            let arr = new Float32Array(memory.buffer);
            for (let i = 0; i < input[channel].length; i++) {
                arr[i] = input[channel][i];
            }
            // console.log(arr.slice(0,3));
            exp.processor(0, input[channel].length * Float32Array.BYTES_PER_ELEMENT, input[channel].length);
            
            for (let i = 0; i < input[channel].length; i++) {
                output[channel][i] = arr[128 + i];
            }
        }

        return true;

    }
}

registerProcessor('${id}', MyWorkletProcessor);
`;
}


let latestParsedBin = null;


function makeWorkletPromise(audioCtx, ts) {
    const id = '' + Date.now(); //TODO: better ID
    return $.ajax(`/makeWorkletBinary/${id}`, {
        data: JSON.stringify({
            ts
        }),
        contentType: 'application/JSON',
        type: 'POST'
    }).then(binary => {
        const parsedBin = intArrayFromBase64(binary);
        const fileContent = makeProcessorsFile(id, parsedBin);
        latestParsedBin = parsedBin; //More bad things
        return audioCtx.audioWorklet.addModule(`data:application/javascript;base64,${btoa(fileContent)}`).then(() => {
            return new AudioWorkletNode(audioCtx, id);
        });
    });
}

let prevTsSrc = null;

module.exports = {
    default () {
        return {
            kind: 'modifier',
            type: 'customWorklet',
            options: {
                tsSource: gainTsSource
            }
        }
    },
    initWANode(audioCtx, node) {
        prevTsSrc = node.options.tsSource;
        return makeWorkletPromise(audioCtx, node.options.tsSource);
    },
    updateWANode(customNode, node, nodeIndex, graph) {
        if (prevTsSrc !== node.options.tsSource) {
            return makeWorkletPromise(customNode.context, node.options.tsSource)
                .then(workletNode => {
                    const prevNode = graph.nodes[nodeIndex - 1];
                    const thisNode = graph.nodes[nodeIndex];
                    const nextNode = graph.nodes[nodeIndex + 1];

                    prevNode.waNode.connect(workletNode);
                    workletNode.connect(nextNode.waNode);

                    try {
                        prevNode.waNode.disconnect(thisNode.waNode);
                        thisNode.waNode.disconnect(nexNode.waNode);
                    } catch (err) {}

                    node.waNode = workletNode;
                });
        } else {
            return Promise.resolve();
        }
    },
    renderView(state, affect, node, nodeIndex) {
        return [
            h('h3', `Custom`),
        ]
    },
    renderDetail(state, affect, node, nodeIndex) {
        return [
            h('textarea.ts-editor', {
                value: node.options.tsSource,
                onblur(ev) {
                    affect.set(`graph.nodes.${nodeIndex}.options.tsSource`, ev.target.value);
                }
            }),
            h('button', 'Save')
        ];
    },
    generateCode(nodeName, node) {
        if (latestParsedBin) {
            const fileContent = makeProcessorsFile(nodeName, latestParsedBin);
            return `
const ${nodeName} = await audioCtx.audioWorklet.addModule(\`data:application/javascript;base64,${btoa(fileContent)}\`).then(() => {
    return new AudioWorkletNode(audioCtx, '${nodeName}');
});
        `;
        } else {
            return '';
        }
    }
}
},{}],11:[function(require,module,exports){
module.exports = {
    default () {
        return {
            kind: 'modifier',
            type: 'delay',
            options: {
                value: 1000
            }
        }
    },
    initWANode(audioCtx, node) {
        return Promise.resolve(audioCtx.createDelay());
    },
    updateWANode(delayNode, node) {
        delayNode.delayTime.value = node.options.value;
    },
    renderView(state, affect, node, nodeIndex) {
        return [
            h('h3', `Delay`),
            h('span', `${node.options.value}`),
            h('div', {
                style: {
                    width: '100%'
                }
            }, [
                h('input', {
                    style: {
                        width: '100%'
                    },
                    type: 'range',
                    min: 0,
                    max: 3000,
                    step: 50,
                    value: node.options.value,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.value`, ev.target.value);
                    }
                })
            ])
        ]
    },
    renderDetail(state, affect, node, nodeIndex) {

    },
    generateCode(nodeName, node) {
        return `
const ${nodeName} = audioCtx.createDelay();
${nodeName}.delayTime.value = ${node.options.value};
`;
    }
}
},{}],12:[function(require,module,exports){
module.exports = {
    default () {
        return {
            kind: 'modifier',
            type: 'gain',
            options: {
                value: 1
            }
        }
    },
    initWANode(audioCtx, node) {
        return Promise.resolve(audioCtx.createGain());
    },
    updateWANode(gainNode, node) {
        gainNode.gain.value = node.options.value;
    },
    renderView(state, affect, node, nodeIndex) {
        return [
            h('h3', `Gain`),
            h('span', `${node.options.value}`),
            h('div', {
                style: {
                    width: '100%'
                }
            }, [
                h('input', {
                    style: {
                        width: '100%'
                    },
                    type: 'range',
                    min: 0,
                    max: 3,
                    step: 0.1,
                    value: node.options.value,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.value`, ev.target.value);
                    }
                })
            ])
        ]
    },
    renderDetail(state, affect, node, nodeIndex) {

    },
    generateCode(nodeName, node) {
        return `
const ${nodeName} = audioCtx.createGain();
${nodeName}.gain.value = ${node.options.value};
`;
    }
}
},{}],13:[function(require,module,exports){
module.exports = {
    delay: require('./delay'),
    gain: require('./gain'),
    biquadFilter: require('./biquadFilter'),
    analyser: require('./analyser'),
    customWorklet: require('./customWorklet'),
};
},{"./analyser":8,"./biquadFilter":9,"./customWorklet":10,"./delay":11,"./gain":12}],14:[function(require,module,exports){
module.exports = {
    speaker: require('./speaker')
};
},{"./speaker":15}],15:[function(require,module,exports){
module.exports = {
    initWANode(audioCtx, node) {
        return Promise.resolve(audioCtx.destination);
    },
    updateWANode() {},
    renderView(node) {},
    renderDetail(state, affect, node) {

    },
    generateCode(node) {
        return `
const speakerNode = audioCtx.destination;
`;
    }
}
},{}]},{},[2]);
