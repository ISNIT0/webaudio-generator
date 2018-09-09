"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var inputs = __importStar(require("./inputs/index"));
var outputs = __importStar(require("./outputs/index"));
var modifiers = __importStar(require("./modifiers/index"));
exports.default = {
    input: inputs,
    output: outputs,
    modifier: modifiers
};
