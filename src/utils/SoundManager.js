import { sound } from "@pixi/sound";
export default class SoundManager {
    constructor() {
    }

    play(name, options = {}) {
        if(sound.exists(name)) sound.play(name, options);
    }

    stop(name) {
        if(sound.exists(name)) sound.stop(name);
    }

    pause(name) {
        if(sound.exists(name)) sound.pause(name);
    }

    resume(name) {
        if(sound.exists(name)) sound.resume(name);
    }

    delete(name) {
        if(sound.exists(name)) sound.remove(name);
    }
}
