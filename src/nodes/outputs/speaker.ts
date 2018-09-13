export default <WAGenNode>{
    getDefaultNode() {
        return <any>{};
    },
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        return Promise.resolve(audioCtx.destination);
    },
    updateWANode() { },
    generateCode(nodeName: string, node: NodeDef) {
        return `
const speakerNode = audioCtx.destination;
`;
    }
}