"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nimble_1 = require("nimble");
var DelayModifierNode = /** @class */ (function () {
    function DelayModifierNode() {
    }
    DelayModifierNode.prototype.getDefaultNode = function () {
        return {
            kind: 'modifier',
            type: 'delay',
            options: {
                value: 1000
            }
        };
    };
    DelayModifierNode.prototype.initWANode = function (audioCtx, node) {
        return Promise.resolve(audioCtx.createDelay());
    };
    DelayModifierNode.prototype.updateWANode = function (delayNode, node) {
        delayNode.delayTime.value = node.options.value;
    };
    DelayModifierNode.prototype.renderView = function (state, affect, node, nodeIndex) {
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
    };
    DelayModifierNode.prototype.renderDetail = function (state, affect, node, nodeIndex) {
        return [];
    };
    DelayModifierNode.prototype.generateCode = function (nodeName, node) {
        return "\nconst " + nodeName + " = audioCtx.createDelay();\n" + nodeName + ".delayTime.value = " + node.options.value + ";\n";
    };
    return DelayModifierNode;
}());
exports.default = DelayModifierNode;
