"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var intro_js_1 = __importDefault(require("intro.js"));
var nimble_1 = require("nimble");
window.h = nimble_1.h;
var defaultGraph_1 = __importDefault(require("./defaultGraph"));
var index_1 = __importDefault(require("./nodes/index"));
var target = document.getElementById('frame');
function makeArrow(state, affect, index, direction) {
    if (direction === void 0) { direction = 'down'; }
    return nimble_1.h("svg", {
        width: 38,
        height: 135,
        viewBox: "0 0 38 135",
        fill: 'none',
        'data-intro': 'Hello step one!',
        style: {
            width: '100%',
            height: '30px',
            cursor: 'pointer'
        },
        onclick: function () {
            addNode(state, affect, index + 1, index_1.default.modifier.gain.default());
        }
    }, [
        nimble_1.h('path', {
            d: "M17.2322 133.768C18.2085 134.744 19.7915 134.744 20.7678 133.768L36.6777 117.858C37.654 116.882 37.654 115.299 36.6777 114.322C35.7014 113.346 34.1184 113.346 33.1421 114.322L19 128.464L4.85786 114.322C3.88155 113.346 2.29864 113.346 1.32233 114.322C0.34602 115.299 0.34602 116.882 1.32233 117.858L17.2322 133.768ZM16.5 0L16.5 132H21.5L21.5 0L16.5 0Z",
            fill: 'black'
        })
    ]);
}
function addNode(state, affect, newIndex, node) {
    return __awaiter(this, void 0, void 0, function () {
        var nodeDef, _a, nodes, prevNode, nextNode;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!node.waNode) return [3 /*break*/, 2];
                    nodeDef = index_1.default[node.kind][node.type];
                    _a = node;
                    return [4 /*yield*/, nodeDef.initWANode(state.audioCtx, node)];
                case 1:
                    _a.waNode = _b.sent();
                    nodeDef.updateWANode(node.waNode, node, newIndex, state.graph);
                    _b.label = 2;
                case 2:
                    nodes = state.graph.nodes.slice();
                    prevNode = nodes[newIndex - 1];
                    nextNode = nodes[newIndex];
                    prevNode.waNode.disconnect(nextNode.waNode);
                    prevNode.waNode.connect(node.waNode);
                    node.waNode.connect(nextNode.waNode);
                    nodes.splice(newIndex, 0, node);
                    affect.set('graph.nodes', nodes);
                    return [2 /*return*/];
            }
        });
    });
}
function deleteNode(state, affect, index) {
    var nodes = state.graph.nodes.slice();
    var thisNode = nodes[index];
    var prevNode = nodes[index - 1];
    var nextNode = nodes[index + 1];
    prevNode.waNode.disconnect(thisNode.waNode);
    thisNode.waNode.disconnect(nextNode.waNode);
    prevNode.waNode.connect(nextNode.waNode);
    nodes.splice(index, 1);
    affect.set('graph.nodes', nodes);
}
function replaceNode(state, affect, newNode, index) {
    var nodes = state.graph.nodes.slice();
    var thisNode = nodes[index];
    var prevNode = nodes[index - 1];
    var nextNode = nodes[index + 1];
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
    var nodeDef = index_1.default[node.kind][node.type];
    return nimble_1.h('div.node-cont', [
        nimble_1.h('div.node-centraliser', [
            nimble_1.h("div.node." + node.kind, {
                'data-intro': 'Hello step two!',
                onclick: function (ev) {
                    var isValidEv = ev.target.classList.contains('node') || ev.target.parentElement.classList.contains('node');
                    if (isValidEv) {
                        if (state.selectedNode === index) {
                            affect.set('selectedNode', -1);
                        }
                        else {
                            affect.set('selectedNode', index);
                        }
                    }
                }
            }, nodeDef.renderView ? nodeDef.renderView(state, affect, node, index) : [
                nimble_1.h('h3', node.kind === 'modifier' ? node.type : node.kind),
            ]),
            state.selectedNode === index ?
                nimble_1.h('div.node-detail', [
                    node.kind === 'modifier' ? nimble_1.h('button.deleteNode', {
                        onclick: function () {
                            deleteNode(state, affect, index);
                            affect.set('selectedNode', -1);
                        }
                    }, 'delete') : null,
                    nimble_1.h('div', [
                        nimble_1.h('strong', 'Node Type:'),
                        nimble_1.h('select', {
                            value: node.type,
                            onchange: function (ev) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var newType, newNodeDef, newNode, _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                affect.set('selectedNode', -1);
                                                newType = ev.target.value;
                                                newNodeDef = index_1.default[node.kind][newType];
                                                newNode = newNodeDef.default();
                                                _a = newNode;
                                                return [4 /*yield*/, newNodeDef.initWANode(state.audioCtx, newNode)];
                                            case 1:
                                                _a.waNode = _b.sent();
                                                newNodeDef.updateWANode(newNode.waNode, newNode, index, state.graph);
                                                replaceNode(state, affect, newNode, index);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            }
                        }, Object.keys(index_1.default[node.kind]).map(function (type) { return nimble_1.h('option', type); }))
                    ]),
                    nimble_1.h('hr'),
                    nodeDef.renderDetail ? nodeDef.renderDetail(state, affect, node, index) : null
                ]) :
                null,
            index !== state.graph.nodes.length - 1 ? makeArrow(state, affect, index) : null,
        ])
    ]);
}
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var initState = {
    graph: initGraph(audioCtx, defaultGraph_1.default),
    selectedNode: -1,
    audioCtx: audioCtx
};
var injectAffect = nimble_1.makeRenderLoop(target, initState, function (state, affect, changes) {
    changes.filter(function (ch) { return !!~ch.indexOf('graph.nodes.'); })
        .map(function (ch) { return Number(ch.split('.')[2]); })
        .forEach(function (nodeIndex) {
        var node = state.graph.nodes[nodeIndex];
        var nodeDef = index_1.default[node.kind][node.type];
        nodeDef.updateWANode(node.waNode, node, nodeIndex, state.graph);
    });
    return nimble_1.h('div.app', [
        nimble_1.h('div.code-preview', [
            nimble_1.h('h1', 'Code'),
            nimble_1.h('code', [nimble_1.h('pre', generateGraphCode(state.graph))])
        ]),
        nimble_1.h('div.graph-preview', state.graph.nodes.map(function (node, index) { return renderNode(state, affect, node, index); }))
    ]);
});
function getNodeName(graph, nodeIndex) {
    var node = graph.nodes[nodeIndex];
    var nodeIndexesOfType = graph.nodes.reduce(function (acc, n, index) {
        if (n.type === node.type) {
            acc.push(index);
        }
        return acc;
    }, []);
    var nodeName = nodeIndexesOfType.length > 1 ? node.type + "Node" + (nodeIndexesOfType.indexOf(nodeIndex) + 1) : node.type + "Node";
    return nodeName;
}
function generateGraphCode(graph) {
    return "(async function(){ // Top Level async/await\n\n" + ("const audioCtx = new(window.AudioContext || window.webkitAudioContext)();\n    " + graph.nodes.map(function (node, nodeIndex) {
        var nodeDef = index_1.default[node.kind][node.type];
        var nodeName = getNodeName(graph, nodeIndex);
        return nodeDef.generateCode ? nodeDef.generateCode(nodeName, node) : '';
    }).join('\n') + '\n\n' + graph.nodes.map(function (node, index, arr) {
        if (index === 0) { }
        else {
            var prevNodeName = getNodeName(graph, index - 1);
            var nodeName = getNodeName(graph, index);
            return prevNodeName + ".connect(" + nodeName + ");";
        }
    }).join('\n')).split('\n').map(function (l) { return '   ' + l; }).join('\n') + "\n\n})();";
}
function initGraph(audioCtx, graph) {
    var _this = this;
    Promise.all(graph.nodes.map(function (node, nodeIndex) { return __awaiter(_this, void 0, void 0, function () {
        var nodeDef, waNode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nodeDef = index_1.default[node.kind][node.type];
                    return [4 /*yield*/, nodeDef.initWANode(audioCtx, node)];
                case 1:
                    waNode = _a.sent();
                    nodeDef.updateWANode(waNode, node, nodeIndex, graph); //Mutation
                    node.waNode = waNode;
                    return [2 /*return*/];
            }
        });
    }); })).then(function () {
        graph.nodes.forEach(function (node, index, arr) {
            if (index === 0) {
                // Nothing to connect
            }
            else {
                var prevNode = arr[index - 1];
                prevNode.waNode.connect(node.waNode);
            }
        });
    });
    return graph;
}
if (!localStorage.getItem('completedIntro')) {
    intro_js_1.default()
        .onexit(function () { return localStorage.setItem('completedIntro', 'true'); })
        .start();
}
