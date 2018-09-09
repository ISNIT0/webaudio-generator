import { h } from 'nimble';

export default class SpeakerOutputNode implements WAGenNode {
    getDefaultNode() {
        return <any>{};
    }
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        return Promise.resolve(audioCtx.destination);
    }
    updateWANode() { }
    renderView(node: NodeDef) { return []; }
    renderDetail(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [];
    }
    generateCode(nodeName: string, node: NodeDef) {
        return `
const speakerNode = audioCtx.destination;
`;
    }
}