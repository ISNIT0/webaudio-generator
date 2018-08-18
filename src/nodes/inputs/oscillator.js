module.exports = {
    default () {
        return {
            "kind": "input",
            "type": "oscillator",
            "options": {
                "waveType": "sine",
                "frequency": 1000
            }
        };
    },
    initWANode(audioCtx, node) {
        const oscillator = audioCtx.createOscillator();
        oscillator.start();
        return Promise.resolve(oscillator);
    },
    updateWANode(oscillator, node) {
        oscillator.type = node.options.waveType;
        oscillator.frequency = node.options.frequency;
    },
    renderView(state, affect, node, nodeIndex) {},
    renderDetail(state, affect, node, nodeIndex) {
        return [
            h('div', [
                h('strong', 'WaveType:'),
                h('select', {
                    value: node.options.waveType,
                    onchange(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.waveType`, ev.target.value);
                    }
                }, [
                    h('option', 'sine'),
                    h('option', 'square'),
                    h('option', 'sawtooth')
                ])
            ])
        ];
    },
    generateCode(nodeName, node) {
        return `
const ${nodeName} = audioCtx.createOscillator();
${nodeName}.type = "${node.options.waveType}";
${nodeName}.frequency = ${node.options.frequency};
${nodeName}.start();
`;
    }
}