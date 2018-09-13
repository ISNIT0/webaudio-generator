import { h } from 'nimble';

export default <WAGenNode>{
    getDefaultNode() {
        return {
            kind: 'modifier',
            type: 'gain',
            options: {
                value: 1
            }
        }
    },
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        return Promise.resolve(audioCtx.createGain());
    },
    updateWANode(gainNode: GainNode, node: NodeDef) {
        gainNode.gain.value = node.options.value;
    },
    renderView(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [
            h('h3', `Gain`),
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
                        max: 3,
                        step: 0.1,
                        value: node.options.value,
                        oninput(ev: any) {
                            affect.set(`graph.nodes.${nodeIndex}.options.value`, ev.target.value);
                        }
                    })
                ])
        ]
    },
    generateCode(nodeName: string, node: NodeDef) {
        return `
const ${nodeName} = audioCtx.createGain();
${nodeName}.gain.value = ${node.options.value};
`;
    }
}