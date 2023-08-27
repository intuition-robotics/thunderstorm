
import {generateHex} from "../_main";


export const testSuit_newSecret = {
    key: 'New Secret',
    label: 'new secret',
    models: [{expected: undefined, input: ''},],
    processor: async (model: string) => {
        // Generate passwords
        // const salt = generateHex(32);
        // const password = 'newPass';ø
        // const pass = hashPasswordWithSalt(salt, password)
        // console.log(pass,salt);
        return console.log(generateHex(256));
    }
};

testSuit_newSecret.processor('').catch()
