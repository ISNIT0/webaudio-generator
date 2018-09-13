export default <WAGenNode>{
    getDefaultNode() {
        return {
            "kind": "input",
            "type": "microphone",
            "options": {}
        };
    },
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        return navigator.mediaDevices.getUserMedia({
            audio: true
        })
            .then(function (stream) {
                return audioCtx.createMediaStreamSource(stream);
            });
    },
    updateWANode(waNode: AudioNode, node: NodeDef) { },
    generateCode(nodeName: string, node: NodeDef) {
        return `
const ${nodeName} = audioCtx.createMediaStreamSource(
    await navigator.mediaDevices.getUserMedia({ audio: true })
);
`;
    }
};