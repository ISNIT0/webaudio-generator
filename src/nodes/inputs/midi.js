module.exports = {
    default () {
        return {
            "kind": "input",
            "type": "midi",
            "options": {}
        };
    },
    initWANode(audioCtx, node) {
        navigator.requestMIDIAccess()
            .then(function (access) {

                // Get lists of available MIDI controllers
                const inputs = access.inputs.values();
                const outputs = access.outputs.values();

                const gain = audioCtx.createGain();
                
                access.onstatechange = function (e) {

                    // Print information about the (dis)connected MIDI controller
                    console.log(e.port.name, e.port.manufacturer, e.port.state);
                };


                return Promise.resolve(gain);
            });
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