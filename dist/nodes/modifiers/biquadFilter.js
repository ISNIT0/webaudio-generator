"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nimble_1 = require("nimble");
var BiQuadFilterModifierNode = /** @class */ (function () {
    function BiQuadFilterModifierNode() {
    }
    BiQuadFilterModifierNode.prototype.getDefaultNode = function () {
        return {
            kind: 'modifier',
            type: 'biquadFilter',
            options: {
                type: 'lowpass',
                Q: 1,
                frequency: 350,
                gain: 0,
                detune: 0,
            }
        };
    };
    BiQuadFilterModifierNode.prototype.initWANode = function (audioCtx, node) {
        return Promise.resolve(audioCtx.createBiquadFilter());
    };
    BiQuadFilterModifierNode.prototype.updateWANode = function (filterNode, node) {
        filterNode.gain.value = node.options.gain;
        filterNode.Q.value = node.options.Q;
        filterNode.detune.value = node.options.detune;
        filterNode.frequency.value = node.options.frequency;
        filterNode.type.value = node.options.type;
    };
    BiQuadFilterModifierNode.prototype.renderView = function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('h3', "Biquad Filter"),
            nimble_1.h('span', "" + node.options.frequency)
        ];
    };
    BiQuadFilterModifierNode.prototype.renderDetail = function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('div', [
                nimble_1.h('strong', 'Type:'),
                nimble_1.h('select', {
                    value: node.options.type,
                    onchange: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.type", ev.target.value);
                    }
                }, [
                    nimble_1.h('option', 'lowpass'),
                    nimble_1.h('option', 'highpass'),
                    nimble_1.h('option', 'bandpass'),
                    nimble_1.h('option', 'lowshelf'),
                    nimble_1.h('option', 'highshelf'),
                    nimble_1.h('option', 'peaking'),
                    nimble_1.h('option', 'notch'),
                    nimble_1.h('option', 'allpass')
                ])
            ]),
            nimble_1.h('div', [
                nimble_1.h('strong', 'Q:'),
                nimble_1.h('input', {
                    type: 'range',
                    min: -10,
                    max: 10,
                    step: 0.5,
                    value: node.options.Q,
                    oninput: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.Q", ev.target.value);
                    }
                })
            ]),
            nimble_1.h('div', [
                nimble_1.h('strong', 'Frequency:'),
                nimble_1.h('input', {
                    type: 'range',
                    min: 0,
                    max: 10000,
                    step: 1,
                    value: node.options.frequency,
                    oninput: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.frequency", ev.target.value);
                    }
                })
            ]),
            nimble_1.h('div', [
                nimble_1.h('strong', 'Gain:'),
                nimble_1.h('input', {
                    type: 'range',
                    min: 0,
                    max: 3,
                    step: 0.1,
                    value: node.options.gain,
                    oninput: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.gain", ev.target.value);
                    }
                })
            ]),
            nimble_1.h('div', [
                nimble_1.h('strong', 'Detune:'),
                nimble_1.h('input', {
                    type: 'range',
                    min: -10,
                    max: 10,
                    step: 0.5,
                    value: node.options.detune,
                    oninput: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.detune", ev.target.value);
                    }
                })
            ])
        ];
    };
    BiQuadFilterModifierNode.prototype.generateCode = function (nodeName, node) {
        return "\nconst " + nodeName + " = audioCtx.createBiquadFilter();\n" + nodeName + ".gain.value = " + node.options.gain + ";\n" + nodeName + ".Q.value = " + node.options.Q + ";\n" + nodeName + ".detune.value = " + node.options.detune + ";\n" + nodeName + ".frequency.value = " + node.options.frequency + ";\n" + nodeName + ".type.value = \"" + node.options.type + "\";\n";
    };
    return BiQuadFilterModifierNode;
}());
exports.default = BiQuadFilterModifierNode;
