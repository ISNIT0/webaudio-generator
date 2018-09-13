"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nimble_1 = require("nimble");
exports.default = {
    getDefaultNode: function () {
        return {
            kind: 'modifier',
            type: 'delay',
            options: {
                value: 1000
            }
        };
    },
    initWANode: function (audioCtx, node) {
        return Promise.resolve(audioCtx.createDelay());
    },
    updateWANode: function (delayNode, node) {
        delayNode.delayTime.value = node.options.value;
    },
    renderView: function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('h3', "Delay"),
            nimble_1.h('span', "" + node.options.value),
            nimble_1.h('div', {
                style: {
                    width: '100%'
                }
            }, [
                nimble_1.h('input', {
                    style: {
                        width: '100%'
                    },
                    type: 'range',
                    min: 0,
                    max: 3000,
                    step: 50,
                    value: node.options.value,
                    oninput: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.value", ev.target.value);
                    }
                })
            ])
        ];
    },
    generateCode: function (nodeName, node) {
        return "\nconst " + nodeName + " = audioCtx.createDelay();\n" + nodeName + ".delayTime.value = " + node.options.value + ";\n";
    }
};
