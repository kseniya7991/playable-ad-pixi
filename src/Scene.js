import { Container } from "pixi.js";
import { subscribeToResize, unsubscribeFromResize } from "./resizeManager";
import Background from "./Background";
import Logo from "./Logo";

export class Scene {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.zoomContainer = new Container();
        this.zoomContainer.pivot.set(this.zoomContainer.width / 2, this.zoomContainer.height / 2);
        this.zoomContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

        this.app.zoomContainer = this.zoomContainer;
        this.app.stage.addChild(this.zoomContainer);

        subscribeToResize(this);

        this.background = new Background(this.app);
        this.logo = new Logo(this.app);
    }

    onResize() {
        this.zoomContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    }

    destroy() {
        unsubscribeFromResize(this);
    }
}
