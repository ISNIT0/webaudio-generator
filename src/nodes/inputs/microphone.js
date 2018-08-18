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