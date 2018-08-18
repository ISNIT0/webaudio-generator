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