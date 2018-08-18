module.exports = {
    default () {
        return {
            kind: 'modifier',
            type: 'delay',
            options: {
                value: 1000
            }
        }
    },
    initWANode(audioCtx, node) {
        return Promise.resolve(audioCtx.createDelay());
    },
    updateWANode(delayNode, node) {
        delayNode.delayTime.value = node.options.value;
    },
    renderView(state, affect, node, nodeIndex) {
        return [
            h('h3', `Delay`),
            h('span', `${node.options.value}`),
            h('div', {
                style: {
                    width: '100%'
                }
            }, [
                h('input', {
                    style: {
                        width: '100%'
                    },
                    type: 'range',
                    min: 0,
                    max: 3000,
                    step: 50,
                    value: node.options.value,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.value`, ev.target.value);
                    }
                })
            ])
        ]
    },
    renderDetail(state, affect, node, nodeIndex) {

    },
    generateCode(nodeName, node) {
        return `
const ${nodeName} = audioCtx.createDelay();
${nodeName}.delayTime.value = ${node.options.value};
`;
    }
}