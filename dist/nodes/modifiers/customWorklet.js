"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nimble_1 = require("nimble");
var prevTsSrc;
var latestParsedBin;
exports.default = {
    getDefaultNode: function () {
        return {
            kind: 'modifier',
            type: 'customWorklet',
            options: {
                tsSource: gainTsSource
            }
        };
    },
    initWANode: function (audioCtx, node) {
        prevTsSrc = node.options.tsSource;
        return makeWorkletPromise(audioCtx, node.options.tsSource);
    },
    updateWANode: function (customNode, node, nodeIndex, graph) {
        if (prevTsSrc !== node.options.tsSource) {
            return makeWorkletPromise(customNode.context, node.options.tsSource)
                .then(function (workletNode) {
                var prevNode = graph.nodes[nodeIndex - 1];
                var thisNode = graph.nodes[nodeIndex];
                var nextNode = graph.nodes[nodeIndex + 1];
                prevNode.waNode.connect(workletNode);
                workletNode.connect(nextNode.waNode);
                try {
                    prevNode.waNode.disconnect(thisNode.waNode);
                    thisNode.waNode.disconnect(nextNode.waNode);
                }
                catch (err) { }
                node.waNode = workletNode;
            });
        }
        else {
            return Promise.resolve();
        }
    },
    renderView: function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('h3', "Custom"),
        ];
    },
    renderDetail: function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('p', [
                "This node will compile the below strongly typed TypeScript into WebAssembly and create a WebAudio CustomWorkletNode that processes all audio. ",
                nimble_1.h('a', { href: 'https://github.com/AssemblyScript/assemblyscript', target: '_blank' }, 'See AssemblyScript')
            ]),
            nimble_1.h('div', {
                style: {
                    width: '380px',
                    'margin-left': '-20px',
                }
            }, [
                nimble_1.h('code', 'export function processor(input_ptr: i32, output_ptr: i32, length: i32): void {'),
                nimble_1.h('br'),
                nimble_1.h('textarea.ts-editor', {
                    style: {
                        'padding-left': '30px'
                    },
                    value: node.options.tsSource,
                    onblur: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.tsSource", ev.target.value);
                    }
                }),
                nimble_1.h('code', '}'),
                nimble_1.h('br'),
                nimble_1.h('button', 'Save'),
                nimble_1.h('a', {
                    target: '_blank',
                    href: 'https://github.com/AssemblyScript/assemblyscript/wiki/WebAssembly-to-TypeScript-Cheat-Sheet',
                    style: {
                        float: 'right'
                    }
                }, 'help')
            ])
        ];
    },
    generateCode: function (nodeName, node) {
        if (latestParsedBin) {
            var fileContent = makeProcessorsFile(nodeName, latestParsedBin);
            return "\nconst " + nodeName + " = await audioCtx.audioWorklet.addModule(`data:application/javascript;base64," + btoa(fileContent) + "`).then(() => {\n    return new AudioWorkletNode(audioCtx, '" + nodeName + "');\n});\n        ";
        }
        else {
            return '';
        }
    }
};
function intArrayFromBase64(s) {
    var decoded = atob(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0; i < decoded.length; ++i) {
        bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
}
//export function processor(input_ptr: i32, output_ptr: i32, length: i32): void {
var gainTsSource = "\nlet gain = <f32>0.5;\nfor (let byte = <i32>0; byte < length; ++byte) {\n  let inp = load<f32>(input_ptr + 4 * byte);\n  store<f32>(output_ptr + 4 * byte, inp * gain);\n}\n";
//}
//Yuk Yuk Yuk
function makeProcessorsFile(id, parsedBinary) {
    return "\nconst wasmBinary = new Uint8Array([" + parsedBinary + "]);\n\nconst memory = new WebAssembly.Memory({\n    initial: 10\n});\nconst module = new WebAssembly.Module(wasmBinary);\nconst instance = new WebAssembly.Instance(module, {\n    env: {\n        abort(msg, file, line, column) {\n            console.error(\"abort called at main.ts:\" + line + \":\" + column);\n        },\n        memory\n    }\n});\n\nconst result = {\n    instance\n};\n\nconst exp = result.instance.exports;\n\nclass MyWorkletProcessor extends AudioWorkletProcessor {\n    constructor() {\n        super();\n    }\n\n    process(inputs, outputs, parameters) {\n        let input = inputs[0];\n        let output = outputs[0];\n        let channelCount = input.length;\n        for (let channel = 0; channel < channelCount; ++channel) {\n            let arr = new Float32Array(memory.buffer);\n            for (let i = 0; i < input[channel].length; i++) {\n                arr[i] = input[channel][i];\n            }\n            // console.log(arr.slice(0,3));\n            exp.processor(0, input[channel].length * Float32Array.BYTES_PER_ELEMENT, input[channel].length);\n            \n            for (let i = 0; i < input[channel].length; i++) {\n                output[channel][i] = arr[128 + i];\n            }\n        }\n\n        return true;\n\n    }\n}\n\nregisterProcessor('" + id + "', MyWorkletProcessor);\n";
}
function makeWorkletPromise(audioCtx, ts) {
    var id = '' + Date.now(); //TODO: better ID
    return new Promise(function (resolve, reject) {
        $.ajax("/makeWorkletBinary/" + id, {
            data: JSON.stringify({
                ts: ts
            }),
            contentType: 'application/JSON',
            type: 'POST'
        }).then(function (binary) {
            var parsedBin = intArrayFromBase64(binary);
            var fileContent = makeProcessorsFile(id, parsedBin);
            latestParsedBin = parsedBin; //More bad things
            return audioCtx.audioWorklet.addModule("data:application/javascript;base64," + btoa(fileContent)).then(function () {
                return new AudioWorkletNode(audioCtx, id);
            });
        })
            .then(resolve)
            .catch(reject);
    });
}
