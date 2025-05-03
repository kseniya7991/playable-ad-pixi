import { Assets, Sprite } from "pixi.js";
import { subscribeToResize, unsubscribeFromResize } from "./resizeManager";

export default class Background extends Sprite {
    constructor(app) {
        super();
        this.app = app;
        this.init();
    }

    async init() {
        const texture = Assets.get('background');
        this.texture = texture;

        this.anchor.set(0.5);
        this.position.set(0, 0);

        subscribeToResize(this);
    }

    onResize() {
        const bgAspect = this.texture.width / this.texture.height;
        const screenAspect = this.app.screen.width / this.app.screen.height;

        if (bgAspect > screenAspect) {
            this.width = this.app.screen.height * bgAspect;
            this.height = this.app.screen.height;
        } else {
            this.height = this.app.screen.width / bgAspect;
            this.width = this.app.screen.width;
        }
    }

    destroy() {
        unsubscribeFromResize(this);
    }
}