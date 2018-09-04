Tone.setContext(audioCtx);
var synth = new Tone.Synth({
    "oscillator": {
        "type": "pwm",
        "modulationFrequency": 0.2
    },
    "envelope": {
        "attack": 0.02,
        "decay": 0.1,
        "sustain": 0.2,
        "release": 0.9,
    }
});

module.exports = {
    default() {
        return {
            "kind": "input",
            "type": "midi",
            "options": {}
        };
    },
    initWANode(audioCtx, node) {
        setTimeout(() => {
            synth.triggerRelease();
        }, 1000);

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
                    output.playNote(`${e.note.name}${e.note.octave}`, 'all', { velocity: 0 });
                    synth.triggerAttack(`${e.note.name}${e.note.octave}`);
                }
            );
            input.addListener('noteoff', "all",
                function (e) {
                    console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
                    output.playNote(`${e.note.name}${e.note.octave}`, 'all', { velocity: 0 });
                    synth.triggerRelease(`${e.note.name}${e.note.octave}`);
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