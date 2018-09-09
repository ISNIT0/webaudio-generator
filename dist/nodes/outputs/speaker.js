"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SpeakerOutputNode = /** @class */ (function () {
    function SpeakerOutputNode() {
    }
    SpeakerOutputNode.prototype.getDefaultNode = function () {
        return {};
    };
    SpeakerOutputNode.prototype.initWANode = function (audioCtx, node) {
        return Promise.resolve(audioCtx.destination);
    };
    SpeakerOutputNode.prototype.updateWANode = function () { };
    SpeakerOutputNode.prototype.renderView = function (node) { return []; };
    SpeakerOutputNode.prototype.renderDetail = function (state, affect, node, nodeIndex) {
        return [];
    };
    SpeakerOutputNode.prototype.generateCode = function (nodeName, node) {
        return "\nconst speakerNode = audioCtx.destination;\n";
    };
    return SpeakerOutputNode;
}());
exports.default = SpeakerOutputNode;
