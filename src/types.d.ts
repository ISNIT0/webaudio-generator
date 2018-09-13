type VNode = any;

type NodeGraph = {
    nodes: NodeDef[]
}

type NodeDef = {
    kind: string,
    type: string,
    options: any,
    waNode?: AudioNode & any
}

interface WAGenNode {
    getDefaultNode: () => NodeDef,
    initWANode: (audioCtx: AudioContext, node: NodeDef) => Promise<AudioNode & any>
    updateWANode: (audioNode: AudioNode & any, node: NodeDef, nodeIndex: number, graph: NodeGraph) => void,
    renderView?: (state: any, affect: Affect, node: NodeDef, nodeIndex: number) => VNode[],
    renderDetail?: (state: any, affect: Affect, node: NodeDef, nodeIndex: number) => VNode[],
    generateCode: (nodeName: string, node: NodeDef) => string
}

type State = {
    graph: NodeGraph,
    selectedNode: number,
    audioCtx: AudioContext
};

declare module 'tone';
declare module 'webmidi';
declare module 'intro.js';