"use strict";
module.exports = {
    default: function () {
        return {
            "kind": "input",
            "type": "remote",
            "options": {}
        };
    },
    initWANode: function (audioCtx, node) {
        return new Promise(function (resolve, reject) {
            window.peerInstance.on('call', function (call) {
                console.info("Received Call", call);
                call.answer();
                call.on('stream', function (stream) {
                    console.info("Got Stream:", stream);
                    debugger;
                    var source = audioCtx.createMediaStreamSource(stream);
                    source.connect(audioCtx.destination);
                    console.log(source);
                    resolve(source);
                });
            });
        });
    },
    updateWANode: function (mediaStreamSource, node) {
    },
    renderView: function (state, affect, node, nodeIndex) { },
    renderDetail: function (state, affect, node, nodeIndex) {
        return [
            h('div', [
                h('strong', 'WaveType:'),
                h('select', {
                    value: node.options.waveType,
                    onchange: function (ev) {
                        affect.set("graph.nodes." + nodeIndex + ".options.waveType", ev.target.value);
                    }
                }, [
                    h('option', 'sine'),
                    h('option', 'square'),
                    h('option', 'sawtooth')
                ])
            ])
        ];
    },
    generateCode: function (nodeName, node) {
        return '';
    }
};
