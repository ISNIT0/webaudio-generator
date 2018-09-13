"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nimble_1 = require("nimble");
exports.default = {
    getDefaultNode: function () {
        return {
            "kind": "input",
            "type": "oscillator",
            "options": {
                "waveType": "sine",
                "frequency": 1000
            }
        };
    },
    initWANode: function (audioCtx, node) {
        var oscillator = audioCtx.createOscillator();
        oscillator.start();
        return Promise.resolve(oscillator);
    },
    updateWANode: function (oscillator, node) {
        oscillator.type = node.options.waveType;
        oscillator.frequency.setValueAtTime(node.options.frequency, oscillator.context.currentTime);
    },
    renderDetail: function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('div', [
                nimble_1.h('strong', 'WaveType:'),
                nimble_1.h('select', {
                    value: node.options.waveType,
                    onchange: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.waveType", ev.target.value);
                    }
                }, [
                    nimble_1.h('option', 'sine'),
                    nimble_1.h('option', 'square'),
                    nimble_1.h('option', 'sawtooth')
                ])
            ])
        ];
    },
    generateCode: function (nodeName, node) {
        return "\nconst " + nodeName + " = audioCtx.createOscillator();\n" + nodeName + ".type = \"" + node.options.waveType + "\";\n" + nodeName + ".frequency = " + node.options.frequency + ";\n" + nodeName + ".start();\n";
    }
};
