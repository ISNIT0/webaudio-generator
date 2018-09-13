"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nimble_1 = require("nimble");
exports.default = {
    getDefaultNode: function () {
        return {
            kind: 'modifier',
            type: 'gain',
            options: {
                value: 1
            }
        };
    },
    initWANode: function (audioCtx, node) {
        return Promise.resolve(audioCtx.createGain());
    },
    updateWANode: function (gainNode, node) {
        gainNode.gain.value = node.options.value;
    },
    renderView: function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('h3', "Gain"),
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
                    max: 3,
                    step: 0.1,
                    value: node.options.value,
                    oninput: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.value", ev.target.value);
                    }
                })
            ])
        ];
    },
    generateCode: function (nodeName, node) {
        return "\nconst " + nodeName + " = audioCtx.createGain();\n" + nodeName + ".gain.value = " + node.options.value + ";\n";
    }
};
