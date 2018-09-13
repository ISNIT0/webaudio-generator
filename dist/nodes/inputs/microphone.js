"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getDefaultNode: function () {
        return {
            "kind": "input",
            "type": "microphone",
            "options": {}
        };
    },
    initWANode: function (audioCtx, node) {
        return navigator.mediaDevices.getUserMedia({
            audio: true
        })
            .then(function (stream) {
            return audioCtx.createMediaStreamSource(stream);
        });
    },
    updateWANode: function (waNode, node) { },
    generateCode: function (nodeName, node) {
        return "\nconst " + nodeName + " = audioCtx.createMediaStreamSource(\n    await navigator.mediaDevices.getUserMedia({ audio: true })\n);\n";
    }
};
