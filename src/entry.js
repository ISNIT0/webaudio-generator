const {
    makeRenderLoop,
    h
} = window.nimble;
window.h = h;

const defaultGraph = require('./defaultGraph.json');
const nodeDefs = require('./nodes/index');

const target = document.getElementById('frame');

function makeArrow(state, affect, index, direction = 'down') {
    return h(`svg`, {
        width: 38,
        height: 135,
        viewBox: "0 0 38 135",
        fill: 'none',
        style: {
            width: '100%',
            height: '30px'
        },
        onclick: function () {
            addNode(state, affect, index + 1, nodeDefs.modifier.gain.default())
        }
    }, [
        h('path', {
            d: "M17.2322 133.768C18.2085 134.744 19.7915 134.744 20.7678 133.768L36.6777 117.858C37.654 116.882 37.654 115.299 36.6777 114.322C35.7014 113.346 34.1184 113.346 33.1421 114.322L19 128.464L4.85786 114.322C3.88155 113.346 2.29864 113.346 1.32233 114.322C0.34602 115.299 0.34602 116.882 1.32233 117.858L17.2322 133.768ZM16.5 0L16.5 132H21.5L21.5 0L16.5 0Z",
            fill: 'black'
        })
    ])
}

async function addNode(state, affect, newIndex, node) {
    if (!node.waNode) {
        const nodeDef = nodeDefs[node.kind][node.type];
        node.waNode = await nodeDef.initWANode(state.audioCtx, node);
        nodeDef.updateWANode(node.waNode, node, newIndex, state.graph);
    }


    const nodes = state.graph.nodes.slice();

    const prevNode = nodes[newIndex - 1];
    const nextNode = nodes[newIndex];

    prevNode.waNode.disconnect(nextNode.waNode);
    prevNode.waNode.connect(node.waNode);
    node.waNode.connect(nextNode.waNode);

    nodes.splice(newIndex, 0, node);
    affect.set('graph.nodes', nodes);
}

function deleteNode(state, affect, index) {
    const nodes = state.graph.nodes.slice();

    const thisNode = nodes[index];
    const prevNode = nodes[index - 1];
    const nextNode = nodes[index + 1];

    prevNode.waNode.disconnect(thisNode.waNode);
    thisNode.waNode.disconnect(nextNode.waNode);
    prevNode.waNode.connect(nextNode.waNode);

    nodes.splice(index, 1);
    affect.set('graph.nodes', nodes);
}

function replaceNode(state, affect, newNode, index) {
    const nodes = state.graph.nodes.slice();

    const thisNode = nodes[index];
    const prevNode = nodes[index - 1];
    const nextNode = nodes[index + 1];

    if (prevNode) {
        prevNode.waNode.connect(newNode.waNode);
        prevNode.waNode.disconnect(thisNode.waNode);
    }

    thisNode.waNode.disconnect(nextNode.waNode);
    newNode.waNode.connect(nextNode.waNode);

    nodes.splice(index, 1, newNode);
    affect.set('graph.nodes', nodes);
}

function renderNode(state, affect, node, index) {
    const nodeDef = nodeDefs[node.kind][node.type];
    return h('div.node-cont', [
        h('div.node-centraliser', [
            h(`div.node.${node.kind}`, {
                    onclick(ev) {
                        const isValidEv = ev.target.classList.contains('node') || ev.target.parentElement.classList.contains('node');
                        if (isValidEv) {
                            if (state.selectedNode === index) {
                                affect.set('selectedNode', -1)
                            } else {
                                affect.set('selectedNode', index);
                            }
                        }
                    }
                },
                nodeDef.renderView(state, affect, node, index) || [
                    h('h3', node.kind === 'modifier' ? node.type : node.kind),
                ]
            ),
            state.selectedNode === index ?
            h('div.node-detail', [
                node.kind === 'modifier' ? h('button.deleteNode', {
                    onclick() {
                        deleteNode(state, affect, index);
                        affect.set('selectedNode', -1);
                    }
                }, 'delete') : null,
                h('div', [
                    h('strong', 'Node Type:'),
                    h('select', {
                            value: node.type,
                            async onchange(ev) {
                                affect.set('selectedNode', -1);
                                const newType = ev.target.value;
                                const newNodeDef = nodeDefs[node.kind][newType];
                                const newNode = newNodeDef.default();

                                newNode.waNode = await newNodeDef.initWANode(state.audioCtx, newNode);
                                newNodeDef.updateWANode(newNode.waNode, newNode, index, state.graph);

                                replaceNode(state, affect, newNode, index);
                            }
                        },
                        Object.keys(nodeDefs[node.kind]).map(type => h('option', type)))
                ]),
                h('hr'),
                nodeDef.renderDetail(state, affect, node, index)
            ]) :
            null,
            index !== state.graph.nodes.length - 1 ? makeArrow(state, affect, index) : null,
        ])
    ]);
}

var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

window.injectAffect = makeRenderLoop(target, {
        graph: initGraph(audioCtx, defaultGraph),
        selectedNode: -1,
        audioCtx: audioCtx
    },
    function (state, affect, changes) {
        changes.filter(ch => !!~ch.indexOf('graph.nodes.'))
            .map(ch => Number(ch.split('.')[2]))
            .forEach(nodeIndex => {
                const node = state.graph.nodes[nodeIndex];
                const nodeDef = nodeDefs[node.kind][node.type];
                nodeDef.updateWANode(node.waNode, node, nodeIndex, state.graph);
            });
        return h('div.app', [
            h('div.code-preview', [
                h('h1', 'Code'),
                h('code', [h('pre', generateGraphCode(state.graph))])
            ]),
            h('div.graph-preview', state.graph.nodes.map((node, index) => renderNode(state, affect, node, index)))
        ]);
    }
);

function getNodeName(graph, nodeIndex) {
    const node = graph.nodes[nodeIndex];
    const nodeIndexesOfType = graph.nodes.reduce((acc, n, index) => {
        if (n.type === node.type) {
            acc.push(index);
        }
        return acc;
    }, []);
    const nodeName = nodeIndexesOfType.length > 1 ? `${node.type}Node${nodeIndexesOfType.indexOf(nodeIndex)+1}` : `${node.type}Node`;
    return nodeName;
}

function generateGraphCode(graph) {
    return `(async function(){ // Top Level async/await

` + (`const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    ` + graph.nodes.map((node, nodeIndex) => {
        const nodeDef = nodeDefs[node.kind][node.type];
        const nodeName = getNodeName(graph, nodeIndex);
        return nodeDef.generateCode ? nodeDef.generateCode(nodeName, node) : '';
    }).join('\n') + '\n\n' + graph.nodes.map((node, index, arr) => {
        if (index === 0) {} else {
            const prevNodeName = getNodeName(graph, index - 1);
            const nodeName = getNodeName(graph, index);
            return `${prevNodeName}.connect(${nodeName});`;
        }
    }).join('\n')).split('\n').map(l => '   ' + l).join('\n') + `

})();`;
}

function initGraph(audioCtx, graph) {
    Promise.all(
        graph.nodes.map(async (node, nodeIndex) => {
            const nodeDef = nodeDefs[node.kind][node.type];
            const waNode = await nodeDef.initWANode(audioCtx, node);
            nodeDef.updateWANode(waNode, node, nodeIndex, graph); //Mutation
            node.waNode = waNode;
        })
    ).then(() => {

        graph.nodes.forEach((node, index, arr) => {
            if (index === 0) {
                // Nothing to connect
            } else {
                const prevNode = arr[index - 1];
                prevNode.waNode.connect(node.waNode);
            }
        });
    });

    return graph;
}