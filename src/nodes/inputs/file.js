module.exports = {
    default () {
        return {
            "kind": "input",
            "type": "file",
            "options": {
                "filePath": "./br-jam-loop.wav"
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
                        value: './br-jam-loop.wav'
                    }, 'Jam Loop'),
                    h('option', {
                        value: './techno.wav'
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