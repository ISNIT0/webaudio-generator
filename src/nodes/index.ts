import * as inputs from './inputs/index';
import * as outputs from './outputs/index';
import * as modifiers from './modifiers/index';

export default <{
    [kind: string]: {
        [type: string]: WAGenNode & any
    }
}>{
        input: inputs,
        output: outputs,
        modifier: modifiers
    }