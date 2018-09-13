"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getDefaultNode: function () {
        return {};
    },
    initWANode: function (audioCtx, node) {
        return Promise.resolve(audioCtx.destination);
    },
    updateWANode: function () { },
    generateCode: function (nodeName, node) {
        return "\nconst speakerNode = audioCtx.destination;\n";
    }
};
