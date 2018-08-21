const asc = require("assemblyscript/cli/asc");
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

express.static.mime.define({
    'application/wasm': ['wasm']
});

app.use(express.static('./'));

app.post(`/makeWorkletBinary/:id`, function (req, res) {
    const id = req.params.id;
    const {
        ts
    } = req.body;

    const tsSource = `export function processor(input_ptr: i32, output_ptr: i32, length: i32): void {
        ${ts}
    }`;

    fs.writeFileSync(`./files/${id}.ts`, tsSource, 'utf8');

    asc.main([
        `./files/${id}.ts`,
        "--binaryFile", `./files/${id}.wasm`,
        "--importMemory"
    ], function (err) {
        if (err) {
            res.status(500).send({
                error: err
            });
        } else {
            const b64 = fs.readFileSync(`./files/${id}.wasm`).toString('base64');
            res.send(b64);
            fs.unlinkSync(`./files/${id}.wasm`);
            fs.unlinkSync(`./files/${id}.ts`);
        }
    });

});

app.listen(8092, (err) => {
    if (err) console.error(err);
    else console.info(`Started server on port [8092]`);
});