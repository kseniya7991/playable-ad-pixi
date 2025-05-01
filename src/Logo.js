import { Assets, Sprite } from "pixi.js";

export default class Logo extends Sprite {
    constructor(app) {
        super();
        this.app = app;
        this.init();
    }

    async init() {
        const texture = await Assets.load("/assets/logo.png");
        this.texture = texture;

        this.scale.set(250 / texture.width);
        this.position.set(20,20);

        this.app.stage.addChild(this);
    }
}
