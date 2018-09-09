import BufferLoader from '../../BufferLoader';
import { h } from 'nimble';

export default class BiQuadFilterModifierNode implements WAGenNode {
    getDefaultNode() {
        return {
            kind: 'modifier',
            type: 'convreverb',
            options: {
                normalized: true
            }
        }
    }
    initWANode(audioCtx: AudioContext, node: NodeDef) {

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
    }
    updateWANode(convreverbNode: ConvolverNode, node: NodeDef) {
        convreverbNode.normalize = !!node.options.normalized;
    }
    renderView(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [
            h('h3', `Conv Reverb`),
            h('div', {
                style: {
                    width: '100%'
                }
            }, [])
        ]
    }
    renderDetail(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [];
    }
    generateCode(nodeName: string, node: NodeDef) {
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