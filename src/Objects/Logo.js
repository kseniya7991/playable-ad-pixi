import { Assets, Sprite } from "pixi.js";

export default class Logo extends Sprite {
    constructor(app) {
        super();
        this.app = app;
        this.init();
    }

    async init() {
        const texture = Assets.get('logo');
        this.texture = texture;

        this.scale.set(160 / texture.width);
        this.position.set(10,10);
    }
}
