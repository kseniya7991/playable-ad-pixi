import { Container } from "pixi.js";
import { subscribeToResize, unsubscribeFromResize } from "./resizeManager";
import Background from "./Background";
import Logo from "./Logo";
import PlayBtn from "./PlayBtn";

export class Scene {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.background = new Background(this.app);
        this.logo = new Logo(this.app);
        this.playBtn = new PlayBtn(this.app);

        this.addZoomContainer();
        this.zoomContainer.addChild(this.background);

        this.addLogoContainer();
        this.logoContainer.addChild(this.logo,  this.playBtn);

        subscribeToResize(this);
    }

    addLogoContainer() {
        this.logoContainer = new Container();
        this.app.logoContainer = this.logoContainer;
        this.app.stage.addChild(this.logoContainer);
    }

    addZoomContainer() {
        this.zoomContainer = new Container();
        this.zoomContainer.pivot.set(this.zoomContainer.width / 2, this.zoomContainer.height / 2);
        this.zoomContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

        this.app.zoomContainer = this.zoomContainer;
        this.app.stage.addChild(this.zoomContainer);
    }

    onResize() {
        this.zoomContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    }

    destroy() {
        unsubscribeFromResize(this);
    }
}
