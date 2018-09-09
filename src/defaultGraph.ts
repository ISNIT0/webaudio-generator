export default <NodeGraph>{
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
}