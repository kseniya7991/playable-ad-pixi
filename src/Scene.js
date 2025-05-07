import { Container } from "pixi.js";
import { subscribeToResize, unsubscribeFromResize } from "./utils/resizeManager";
import Background from "./Objects/Background";
import Logo from "./Objects/Logo";
import PlayBtn from "./Objects/PlayBtn";
import NextStageBtn from "./Objects/NextStageBtn";
import StageOne from "./Objects/StageOne";
import SpineHuman from "./Objects/SpineHuman";
import Fireworks from "./Objects/Fireworks";
import Match3Board from "./Objects/Math3Board";

import Resources from "./resources/Resources";
import sources from "./resources/sources";
import SoundManager from "./utils/SoundManager";

import TESTapi from "../test";

export class Scene {
    constructor(app) {
        this.app = app;

        this.nextStageDisabled = false;

        this.targetZoom = 2;
        this.cameraZoom = 1;
        this.initialCameraZoom = 1;

        this.initialAlpha = 0;
        this.targetAlpha = 1;
        this.currentStage = 0;

        this.zoomTicker = null;
        this.app.scale = 1;

        this.playableStarted = false;

        this.app.zIndexObj = {
            match3board: 10,
        };

        this.app.soundManager = new SoundManager();
        this.api = new TESTapi();

        this.app.soundNames = {
            click: "clickSound",
            bg: "backgroundSound",
            mistake: "mistakeSound",
            camera: "cameraSound",
            match: "matchSound",
            fireworks: "fireworksSound",
        };

        this.init();
    }

    async init() {
        this.app.resources = await new Resources(sources).startLoading();
        window.playableLoaded();
        this.calcAppScale();

        this.sceneContainer = new Container();
        this.app.stage.addChild(this.sceneContainer);

        this.addObjectsToScene();

        this.sceneContainer.addChild(this.nextStageBtn.container);

        this.addNextStageListener();
        this.addUserInteractionListener();

        subscribeToResize(this);
    }

    addNextStageListener() {
        this.nextStageBtn.button.on("pointerdown", (e) => {
            this.app.soundManager.play(this.app.soundNames.click, { volume: 0.8 });
            if (this.nextStageDisabled) return;
            this.currentStage += 1;
            if (this.currentStage === 1) this.startStageOne();
            if (this.currentStage === 2) this.startStageTwo();
            if (this.currentStage === 3) this.startStageThree();
            if (this.currentStage >= 3) {
                this.fireworks.startAnimations();
                this.nextStageDisabled = true;
                this.nextStageBtn.container.visible = false;

                setTimeout(
                    () => {
                        this.nextStageDisabled = false;
                        this.nextStageBtn.container.visible = true;
                    },
                    this.fireworks.animationsCount * this.fireworks.animationDelay + 400
                );
            }
        });
    }

    addObjectsToScene() {
        this.background = new Background(this.app);
        this.logo = new Logo(this.app);
        this.playBtn = new PlayBtn(this.app);
        this.nextStageBtn = new NextStageBtn(this.app).init();
        this.stageOne = new StageOne(this.app).init();
        this.spineHuman = new SpineHuman(this.app);
        this.fireworks = new Fireworks(this.app).init();
        this.match3Board = new Match3Board(this.app);

        this.addZoomContainer();
        this.zoomContainer.addChild(
            this.background,
            this.stageOne,
            this.spineHuman.container,
            this.fireworks.container
        );

        this.addLogoContainer();
        this.logoContainer.addChild(this.logo, this.playBtn);
    }

    startStageOne() {
        setTimeout(() => {
            this.zoomIn();
        }, 200);
    }

    startStageTwo() {
        this.stageOne.alpha = 0;
        this.spineHuman.start();
    }

    startStageThree() {
        this.zoomOut();
    }

    addLogoContainer() {
        this.logoContainer = new Container();
        this.app.logoContainer = this.logoContainer;
        this.sceneContainer.addChild(this.logoContainer);
    }

    addZoomContainer() {
        this.zoomContainer = new Container();
        this.zoomContainer.pivot.set(this.zoomContainer.width / 2, this.zoomContainer.height / 2);
        this.zoomContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        this.zoomContainer.width = this.app.screen.width;
        this.zoomContainer.height = this.app.screen.height;

        this.previousScale = this.zoomContainer.scale._x;

        this.app.zoomContainer = this.zoomContainer;
        this.sceneContainer.addChild(this.zoomContainer);
    }

    onResize() {
        this.zoomContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

        this.calcAppScale();
        this.updateScale();
    }

    updateScale() {
        this.logoContainer.scale.set(this.app.scale);
        this.nextStageBtn.container.scale.set(this.app.scale);
    }

    calcAppScale() {
        const bgWidth = this.app.resources.background.width;
        const bgHeight = this.app.resources.background.height;
        const bgAspect = bgWidth / bgHeight;

        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;
        const screenAspect = screenWidth / screenHeight;

        if (bgAspect > screenAspect) {
            this.app.scale = screenHeight / bgHeight;
        } else {
            this.app.scale = screenWidth / bgWidth;
        }
    }

    zoomIn() {
        if (this.zoomTicker) this.app.ticker.remove(this.zoomTicker);

        this.app.soundManager.play(this.app.soundNames.camera, { volume: 0.8 });

        this.zoomTicker = (delta) => {
            const deltaTime = delta.deltaTime;
            this.nextStageDisabled = true;
            this.nextStageBtn.container.visible = false;

            if (this.cameraZoom + 0.01 < this.targetZoom) {
                this.cameraZoom += (this.targetZoom - this.cameraZoom) * 0.1 * deltaTime;
                this.app.zoomContainer.scale.set(this.cameraZoom);
            }
            if (this.initialAlpha + 0.01 < this.targetAlpha) {
                this.initialAlpha += (this.targetAlpha - this.initialAlpha) * 0.1 * deltaTime;
                this.stageOne.alpha = this.initialAlpha;
            } else {
                this.nextStageDisabled = false;
                this.nextStageBtn.container.visible = true;
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

    addUserInteractionListener() {
        let promptAnimationTimer = setTimeout(() => {
            this.nextStageBtn.startPrompt();
        }, this.nextStageBtn.promptDelay);

        ["pointerdown", "keydown"].forEach((event) => {
            window.addEventListener(event, () => {
                if (!this.playableStarted) {
                    window.playableStarted();
                    this.app.soundManager.play(this.app.soundNames.bg, { loop: true, volume: 0.3 });
                }
                this.playableStarted = true;

                this.nextStageBtn.stopPrompt();
                clearTimeout(promptAnimationTimer);
                promptAnimationTimer = setTimeout(() => {
                    this.nextStageBtn.startPrompt();
                }, this.nextStageBtn.promptDelay);
            });
        });
    }

    destroy() {
        unsubscribeFromResize(this);
    }
}
