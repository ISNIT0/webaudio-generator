module.exports = {
    default () {
        return {
            kind: 'modifier',
            type: 'convreverb',
            options: {
                normalized: true
            }
        }
    },
    initWANode(audioCtx, node) {

        return new Promise(function (resolve, reject) {

            (new BufferLoader(
                audioCtx, ['./res/conv-ir.wav'],
                async function ([buffer]) {

                    const convNode = audioCtx.createConvolver();
                    convNode.buffer = buffer;
                    resolve(convNode);

                }
            )).load();

        });
    },
    updateWANode(convreverbNode, node) {
        convreverbNode.normalize = !!node.options.normalized;
    },
    renderView(state, affect, node, nodeIndex) {
        return [
            h('h3', `Conv Reverb`),
            h('div', {
                style: {
                    width: '100%'
                }
            }, [])
        ]
    },
    renderDetail(state, affect, node, nodeIndex) {

    },
    generateCode(nodeName, node) {
        return `


const ${nodeName}FileRequest = new XMLHttpRequest();
${nodeName}FileRequest.open('GET', "https://webaudio.simmsreeve.com/res/conv-ir.wav", true);
${nodeName}FileRequest.responseType = 'arraybuffer';

const ${nodeName}FilePromise = new Promise((resolve, reject) => {
    ${nodeName}FileRequest.onload = function() {
        audioCtx.decodeAudioData(${nodeName}FileRequest.response, resolve, reject);
    }
    ${nodeName}FileRequest.onerror = reject;
})
${nodeName}FileRequest.send();

const ${nodeName} = audioCtx.createConvolver();
${nodeName}.buffer = await ${nodeName}FilePromise;
`;
    }
}