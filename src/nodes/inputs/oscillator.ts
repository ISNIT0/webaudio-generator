import { h } from 'nimble';

export default <WAGenNode>{
    getDefaultNode() {
        return {
            "kind": "input",
            "type": "oscillator",
            "options": {
                "waveType": "sine",
                "frequency": 1000
            }
        };
    },
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        const oscillator = audioCtx.createOscillator();
        oscillator.start();
        return Promise.resolve(oscillator);
    },
    updateWANode(oscillator: AudioNode & OscillatorNode, node: NodeDef) {
        oscillator.type = node.options.waveType;
        oscillator.frequency.setValueAtTime(node.options.frequency, oscillator.context.currentTime);
    },
    renderDetail(state: any, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [
            h('div', [
                h('strong', 'WaveType:'),
                h('select', {
                    value: node.options.waveType,
                    onchange(ev: any) {
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
    generateCode(nodeName: string, node: NodeDef) {
        return `
const ${nodeName} = audioCtx.createOscillator();
${nodeName}.type = "${node.options.waveType}";
${nodeName}.frequency = ${node.options.frequency};
${nodeName}.start();
`;
    }
}