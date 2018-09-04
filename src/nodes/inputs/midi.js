module.exports = {
    default() {
        return {
            "kind": "input",
            "type": "midi",
            "options": {}
        };
    },
    initWANode(audioCtx, node) {
        Tone.setContext(audioCtx);
        const synth = new Tone.Synth();

        WebMidi.enable(function (err) {
            // https://github.com/djipco/webmidi
            if (err) {
                alert("WebMidi could not be enabled.");
            }

            output = WebMidi.outputs[0];
            input = WebMidi.inputs[0];

            input.addListener('noteon', "all",
                function (e) {
                    console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
                    output.playNote(`${e.note.name}${e.note.octave}`, 'all', { velocity: 1 });
                    synth.triggerAttack(`${e.note.name}${e.note.octave}`);
                }
            );
            input.addListener('noteoff', "all",
                function (e) {
                    console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + ").");
                    output.playNote(`${e.note.name}${e.note.octave}`, 'all', { velocity: 0 });
                    synth.triggerRelease();
                }
            );
        });

        return synth.output;
    },
    updateWANode(waNode, node) {

    },
    renderView(state, affect, node, nodeIndex) { },
    renderDetail(state, affect, node, nodeIndex) {
        return [
            h('div', [
                h('p', [
                    'Please connect MIDI controller before creating this MIDI node'
                ])
            ])
        ];
    },
    generateCode(nodeName, node) {
        return `
// Requires <script src="https://cdn.jsdelivr.net/npm/webmidi"></script>
// Requires <script src="https://tonejs.github.io/build/Tone.js"></script>
`;
    }
}