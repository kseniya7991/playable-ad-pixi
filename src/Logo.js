import { Sprite } from "pixi.js";

export default class Logo extends Sprite {
    constructor(app) {
        super();
        this.app = app;
        this.init();
    }

    async init() {
        const texture = this.app.resources["logo"];
        this.texture = texture;

        this.scale.set(250 / texture.width);
        this.position.set(20,20);
    }
}
