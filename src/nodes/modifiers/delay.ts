import { h } from 'nimble';

export default class DelayModifierNode implements WAGenNode {
    getDefaultNode() {
        return {
            kind: 'modifier',
            type: 'delay',
            options: {
                value: 1000
            }
        }
    }
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        return Promise.resolve(audioCtx.createDelay());
    }
    updateWANode(delayNode: DelayNode, node: NodeDef) {
        delayNode.delayTime.value = node.options.value;
    }
    renderView(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
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
                        oninput(ev: any) {
                            affect.set(`graph.nodes.${nodeIndex}.options.value`, ev.target.value);
                        }
                    })
                ])
        ]
    }
    renderDetail(state: State, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [];
    }
    generateCode(nodeName: string, node: NodeDef) {
        return `
const ${nodeName} = audioCtx.createDelay();
${nodeName}.delayTime.value = ${node.options.value};
`;
    }
}