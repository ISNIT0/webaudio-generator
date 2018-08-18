module.exports = {
    default () {
        return {
            kind: 'modifier',
            type: 'biquadFilter',
            options: {
                type: 'lowpass',
                Q: 1,
                frequency: 350,
                gain: 0,
                detune: 0,
            }
        }
    },
    initWANode(audioCtx, node) {
        return Promise.resolve(audioCtx.createBiquadFilter());
    },
    updateWANode(filterNode, node) {
        filterNode.gain.value = node.options.gain;
        filterNode.Q.value = node.options.Q;
        filterNode.detune.value = node.options.detune;
        filterNode.frequency.value = node.options.frequency;
        filterNode.type.value = node.options.type;
    },
    renderView(state, affect, node, nodeIndex) {
        return [
            h('h3', `Biquad Filter`),
            h('span', `${node.options.frequency}`)
        ]
    },
    renderDetail(state, affect, node, nodeIndex) {
        return [
            h('div', [
                h('strong', 'Type:'),
                h('select', {
                    value: node.options.type,
                    onchange(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.type`, ev.target.value);
                    }
                }, [
                    h('option', 'lowpass'),
                    h('option', 'highpass'),
                    h('option', 'bandpass'),
                    h('option', 'lowshelf'),
                    h('option', 'highshelf'),
                    h('option', 'peaking'),
                    h('option', 'notch'),
                    h('option', 'allpass')
                ])
            ]),
            h('div', [
                h('strong', 'Q:'),
                h('input', {
                    type: 'range',
                    min: -10,
                    max: 10,
                    step: 0.5,
                    value: node.options.Q,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.Q`, ev.target.value);
                    }
                })
            ]),
            h('div', [
                h('strong', 'Frequency:'),
                h('input', {
                    type: 'range',
                    min: 0,
                    max: 10000,
                    step: 1,
                    value: node.options.frequency,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.frequency`, ev.target.value);
                    }
                })
            ]),
            h('div', [
                h('strong', 'Gain:'),
                h('input', {
                    type: 'range',
                    min: 0,
                    max: 3,
                    step: 0.1,
                    value: node.options.gain,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.gain`, ev.target.value);
                    }
                })
            ]),
            h('div', [
                h('strong', 'Detune:'),
                h('input', {
                    type: 'range',
                    min: -10,
                    max: 10,
                    step: 0.5,
                    value: node.options.detune,
                    oninput(ev) {
                        affect.set(`graph.nodes.${nodeIndex}.options.detune`, ev.target.value);
                    }
                })
            ])
        ];
    },
    generateCode(nodeName, node) {
        return `
const ${nodeName} = audioCtx.createBiquadFilter();
${nodeName}.gain.value = ${node.options.gain};
${nodeName}.Q.value = ${node.options.Q};
${nodeName}.detune.value = ${node.options.detune};
${nodeName}.frequency.value = ${node.options.frequency};
${nodeName}.type.value = "${node.options.type}";
`;
    }
}