"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MicrophoneInputNode = /** @class */ (function () {
    function MicrophoneInputNode() {
    }
    MicrophoneInputNode.prototype.getDefaultNode = function () {
        return {
            "kind": "input",
            "type": "microphone",
            "options": {}
        };
    };
    MicrophoneInputNode.prototype.initWANode = function (audioCtx, node) {
        return navigator.mediaDevices.getUserMedia({
            audio: true
        })
            .then(function (stream) {
            return audioCtx.createMediaStreamSource(stream);
        });
    };
    MicrophoneInputNode.prototype.updateWANode = function (waNode, node) { };
    MicrophoneInputNode.prototype.renderView = function (state, affect, node, nodeIndex) { return []; };
    MicrophoneInputNode.prototype.renderDetail = function (state, affect, node, nodeIndex) {
        return [];
    };
    MicrophoneInputNode.prototype.generateCode = function (nodeName, node) {
        return "\nconst " + nodeName + " = audioCtx.createMediaStreamSource(\n    await navigator.mediaDevices.getUserMedia({ audio: true })\n);\n";
    };
    return MicrophoneInputNode;
}());
exports.default = MicrophoneInputNode;
;
