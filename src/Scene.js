import { Container } from "pixi.js";
import { subscribeToResize, unsubscribeFromResize } from "./resizeManager";
import Background from "./Background";
import Logo from "./Logo";
import PlayBtn from "./PlayBtn";
import NextStageBtn from "./NextStageBtn";
import StageOne from "./StageOne";

import Resources from "./Resources";
import sources from "./sources";


export class Scene {
    constructor(app) {
        this.app = app;
        this.init();

        this.targetZoom = 2;
        this.cameraZoom = 1;
        this.initialCameraZoom = 1;

        this.initialAlpha = 0;
        this.targetAlpha = 1;
        this.currentStage = 0;

        this.zoomTicker = null;
    }

    async init() {
        this.app.resources = await new Resources(sources).startLoading();
       
        this.background = new Background(this.app);
        this.logo = new Logo(this.app);
        this.playBtn = new PlayBtn(this.app);
        this.nextStageBtn = new NextStageBtn(this.app).init();
        this.stageOne = new StageOne(this.app).init();

        this.addZoomContainer();
        this.zoomContainer.addChild(this.background, this.stageOne);

        this.addLogoContainer();
        this.logoContainer.addChild(this.logo, this.playBtn);

        this.nextStageBtn.on("pointerdown", (e) => {
            this.currentStage += 1;
            if (this.currentStage === 1) this.startStageOne();
            if (this.currentStage === 2) this.startStageTwo();
        });

        subscribeToResize(this);
    }

    startStageOne() {
        setTimeout(() => {
            this.zoomIn();
        }, 200);
    }

    startStageTwo() {
        this.zoomOut();
        this.stageOne.alpha = 0;
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
        this.zoomContainer.width = this.app.screen.width;
        this.zoomContainer.height = this.app.screen.height;

        this.app.zoomContainer = this.zoomContainer;
        this.app.stage.addChild(this.zoomContainer);
    }

    onResize() {
        this.zoomContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    }

    destroy() {
        unsubscribeFromResize(this);
    }

    zoomIn() {
        if (this.zoomTicker) this.app.ticker.remove(this.zoomTicker);

        this.zoomTicker = (delta) => {
            const deltaTime = delta.deltaTime;
            if (this.cameraZoom + 0.01 < this.targetZoom) {
                this.cameraZoom += (this.targetZoom - this.cameraZoom) * 0.1 * deltaTime;
                this.app.zoomContainer.scale.set(this.cameraZoom);
            }
            if (this.initialAlpha + 0.01 < this.targetAlpha) {
                this.initialAlpha += (this.targetAlpha - this.initialAlpha) * 0.1 * deltaTime;
                this.stageOne.alpha = this.initialAlpha;
            }
        };

        this.app.ticker.add(this.zoomTicker);
    }

    zoomOut() {
        if (this.zoomTicker) this.app.ticker.remove(this.zoomTicker);

        this.zoomTicker = (delta) => {
            const deltaTime = delta.deltaTime;
            if (this.cameraZoom > this.initialCameraZoom) {
                this.cameraZoom += (this.initialCameraZoom - this.cameraZoom) * 0.1 * deltaTime;
                this.app.zoomContainer.scale.set(this.cameraZoom);
            }
        };

        this.app.ticker.add(this.zoomTicker);
    }
}
