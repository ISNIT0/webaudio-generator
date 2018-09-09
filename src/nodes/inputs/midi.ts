import Tone from 'tone';
import WebMidi from 'webmidi';

import { h } from 'nimble';

export default class MidiInputNode implements WAGenNode {
    getDefaultNode() {
        return {
            "kind": "input",
            "type": "midi",
            "options": {}
        };
    }
    initWANode(audioCtx: AudioContext, node: NodeDef) {
        Tone.setContext(audioCtx);
        const synth = new Tone.Synth();

        WebMidi.enable(function (err: any) {
            if (err) {
                alert("WebMidi could not be enabled.");
            }

            const output = WebMidi.outputs[0];
            const input = WebMidi.inputs[0];

            input.addListener('noteon', "all",
                function (e: any) {
                    console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
                    output.playNote(`${e.note.name}${e.note.octave}`, 'all', { velocity: 1 });
                    synth.triggerAttack(`${e.note.name}${e.note.octave}`);
                }
            );
            input.addListener('noteoff', "all",
                function (e: any) {
                    console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + ").");
                    output.playNote(`${e.note.name}${e.note.octave}`, 'all', { velocity: 0 });
                    synth.triggerRelease();
                }
            );
        });

        return synth.output;
    }
    updateWANode(waNode: AudioNode, node: NodeDef) {

    }
    renderView(state: any, affect: Affect, node: NodeDef, nodeIndex: number) { return [] }
    renderDetail(state: any, affect: Affect, node: NodeDef, nodeIndex: number) {
        return [
            h('div', [
                h('p', [
                    'Please connect MIDI controller before creating this MIDI node'
                ])
            ])
        ];
    }
    generateCode(nodeName: string, node: NodeDef) {
        return `
// Requires <script src="https://cdn.jsdelivr.net/npm/webmidi"></script>
// Requires <script src="https://tonejs.github.io/build/Tone.js"></script>

Tone.setContext(audioCtx);
const ${nodeName} = new Tone.Synth();

WebMidi.enable(function (err) {
    if (err) {
        alert("WebMidi could not be enabled.");
    }

    output = WebMidi.outputs[0];
    input = WebMidi.inputs[0];

    input.addListener('noteon', "all", e => {
        output.playNote(e.note.name + e.note.octave, 'all', { velocity: 1 });
        ${nodeName}.triggerAttack(e.note.name + e.note.octave);
    });
    input.addListener('noteoff', "all", e => {
        output.playNote(e.note.name + e.note.octave, 'all', { velocity: 0 });
        ${nodeName}.triggerRelease();
    });
});
`;
    }
}