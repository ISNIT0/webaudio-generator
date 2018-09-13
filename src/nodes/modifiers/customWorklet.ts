import { h } from 'nimble';

let prevTsSrc: string;
let latestParsedBin: Uint8Array;

export default <WAGenNode>{
    getDefaultNode() {
        return {
            kind: 'modifier',
            type: 'customWorklet',
            options: {
                tsSource: gainTsSource
            }
        }
    },
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        prevTsSrc = node.options.tsSource;
        return <Promise<any>>makeWorkletPromise(audioCtx, node.options.tsSource);
    },
    updateWANode(customNode: AudioWorkletNode, node: NodeDef, nodeIndex: number, graph: NodeGraph) {
        if (prevTsSrc !== node.options.tsSource) {
            return makeWorkletPromise(customNode.context, node.options.tsSource)
                .then((workletNode: AudioWorkletNode) => {
                    const prevNode = graph.nodes[nodeIndex - 1];
                    const thisNode = graph.nodes[nodeIndex];
                    const nextNode = graph.nodes[nodeIndex + 1];

                    prevNode.waNode.connect(workletNode);
                    workletNode.connect(nextNode.waNode);

                    try {
                        prevNode.waNode.disconnect(thisNode.waNode);
                        thisNode.waNode.disconnect(nextNode.waNode);
                    } catch (err) { }

                    node.waNode = workletNode;
                });
        } else {
            return Promise.resolve();
        }
    },
    renderView(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [
            h('h3', `Custom`),
        ]
    },
    renderDetail(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [
            h('p', [
                `This node will compile the below strongly typed TypeScript into WebAssembly and create a WebAudio CustomWorkletNode that processes all audio. `,
                h('a', { href: 'https://github.com/AssemblyScript/assemblyscript', target: '_blank' }, 'See AssemblyScript')
            ]),
            h('div', {
                style: {
                    width: '380px',
                    'margin-left': '-20px',
                }
            }, [
                    h('code', 'export function processor(input_ptr: i32, output_ptr: i32, length: i32): void {'),
                    h('br'),
                    h('textarea.ts-editor', {
                        style: {
                            'padding-left': '30px'
                        },
                        value: node.options.tsSource,
                        onblur(ev: any) {
                            affect.set(`graph.nodes.${nodeIndex}.options.tsSource`, ev.target.value);
                        }
                    }),
                    h('code', '}'),
                    h('br'),
                    h('button', 'Save'),
                    h('a', {
                        target: '_blank',
                        href: 'https://github.com/AssemblyScript/assemblyscript/wiki/WebAssembly-to-TypeScript-Cheat-Sheet',
                        style: {
                            float: 'right'
                        }
                    }, 'help')
                ])
        ];
    },
    generateCode(nodeName: string, node: NodeDef) {
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

function intArrayFromBase64(s: string) {
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
function makeProcessorsFile(id: string, parsedBinary: Uint8Array) {
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



function makeWorkletPromise(audioCtx: BaseAudioContext, ts: string): Promise<AudioWorkletNode> {
    const id = '' + Date.now(); //TODO: better ID

    return new Promise((resolve, reject) => {
        $.ajax(`/makeWorkletBinary/${id}`, {
            data: JSON.stringify({
                ts
            }),
            contentType: 'application/JSON',
            type: 'POST'
        }).then((binary: string) => {
            const parsedBin = intArrayFromBase64(binary);
            const fileContent = makeProcessorsFile(id, parsedBin);
            latestParsedBin = parsedBin; //More bad things
            return audioCtx.audioWorklet.addModule(`data:application/javascript;base64,${btoa(fileContent)}`).then(() => {
                return new AudioWorkletNode(audioCtx, id);
            });
        })
            .then(resolve)
            .catch(reject);
    });
}
