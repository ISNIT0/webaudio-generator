"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tone_1 = __importDefault(require("tone"));
var webmidi_1 = __importDefault(require("webmidi"));
var nimble_1 = require("nimble");
var MidiInputNode = /** @class */ (function () {
    function MidiInputNode() {
    }
    MidiInputNode.prototype.getDefaultNode = function () {
        return {
            "kind": "input",
            "type": "midi",
            "options": {}
        };
    };
    MidiInputNode.prototype.initWANode = function (audioCtx, node) {
        tone_1.default.setContext(audioCtx);
        var synth = new tone_1.default.Synth();
        webmidi_1.default.enable(function (err) {
            if (err) {
                alert("WebMidi could not be enabled.");
            }
            var output = webmidi_1.default.outputs[0];
            var input = webmidi_1.default.inputs[0];
            input.addListener('noteon', "all", function (e) {
                console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
                output.playNote("" + e.note.name + e.note.octave, 'all', { velocity: 1 });
                synth.triggerAttack("" + e.note.name + e.note.octave);
            });
            input.addListener('noteoff', "all", function (e) {
                console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + ").");
                output.playNote("" + e.note.name + e.note.octave, 'all', { velocity: 0 });
                synth.triggerRelease();
            });
        });
        return synth.output;
    };
    MidiInputNode.prototype.updateWANode = function (waNode, node) {
    };
    MidiInputNode.prototype.renderView = function (state, affect, node, nodeIndex) { return []; };
    MidiInputNode.prototype.renderDetail = function (state, affect, node, nodeIndex) {
        return [
            nimble_1.h('div', [
                nimble_1.h('p', [
                    'Please connect MIDI controller before creating this MIDI node'
                ])
            ])
        ];
    };
    MidiInputNode.prototype.generateCode = function (nodeName, node) {
        return "\n// Requires <script src=\"https://cdn.jsdelivr.net/npm/webmidi\"></script>\n// Requires <script src=\"https://tonejs.github.io/build/Tone.js\"></script>\n\nTone.setContext(audioCtx);\nconst " + nodeName + " = new Tone.Synth();\n\nWebMidi.enable(function (err) {\n    if (err) {\n        alert(\"WebMidi could not be enabled.\");\n    }\n\n    output = WebMidi.outputs[0];\n    input = WebMidi.inputs[0];\n\n    input.addListener('noteon', \"all\", e => {\n        output.playNote(e.note.name + e.note.octave, 'all', { velocity: 1 });\n        " + nodeName + ".triggerAttack(e.note.name + e.note.octave);\n    });\n    input.addListener('noteoff', \"all\", e => {\n        output.playNote(e.note.name + e.note.octave, 'all', { velocity: 0 });\n        " + nodeName + ".triggerRelease();\n    });\n});\n";
    };
    return MidiInputNode;
}());
exports.default = MidiInputNode;
