"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    "nodes": [{
            "kind": "input",
            "type": "oscillator",
            "options": {
                "waveType": "sine",
                "frequency": 1000
            }
        }, {
            "kind": "modifier",
            "type": "gain",
            "options": {
                "value": "0.1"
            }
        }, {
            "kind": "output",
            "type": "speaker"
        }]
};