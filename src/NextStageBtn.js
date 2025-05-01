import { Assets, Container, Graphics, Text, AnimatedSprite } from "pixi.js";
import { DropShadowFilter } from "pixi-filters";
import { subscribeToResize, unsubscribeFromResize } from "./resizeManager";

export default class NextStageBtn {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.container = new Container();
        this.container.zIndex = 100;
        this.app.stage.addChild(this.container);

        this.addBtn();
        subscribeToResize(this);
    }

    addBtn() {
        this.button = new Graphics().roundRect(0, 0, 400, 150, 20).fill({ color: "#1B82E0" });
        const btnText = new Text({
            text: "NEXT STAGE",
            style: {
                fontFamily: "Arial",
                fill: 0xffffff,
                fontSize: 40,
            },
        });

        btnText.position.set(
            this.button.width / 2 - btnText.width / 2,
            this.button.height / 2 - btnText.height / 2
        );

        this.shadowFilter = new DropShadowFilter({
            distance: -5,
            blur: 5,
            alpha: 0.3,
            color: 0x000000,
            offsetX: 0,
        });

        this.button.filters = [this.shadowFilter];

        this.container.position.set(
            this.app.screen.width - 80 - this.button.width,
            this.app.screen.height - 100 - this.button.height
        );

        this.container.addChild(this.button, btnText);
        this.addListeners();
        this.addWhiteHandAnimation();
    }

    addListeners() {
        this.button.eventMode = "static";
        this.button.cursor = "pointer";

        this.button.on("pointerdown", (e) => console.log("clicked"));
        this.button.on("pointerover", (e) => {
            this.shadowFilter.alpha = 0.6;
            this.button.fill({ color: "red" });
        });
        this.button.on("pointerout", (e) => (this.shadowFilter.alpha = 0.3));
    }

    async addWhiteHandAnimation() {
        const spriteSheet = await Assets.load("/assets/white-hand-sprite.json");
        this.animWhiteHand = new AnimatedSprite(spriteSheet.animations.WhiteHand);

        this.animWhiteHand.position.set(130, 90);
        this.animWhiteHand.rotation = -Math.PI / 6;
        this.animWhiteHand.scale.set(0.65);
        this.animWhiteHand.animationSpeed = 0.5;
        this.animWhiteHand.loop = false;
        this.animWhiteHand.visible = false;

        this.animWhiteHand.play();
        this.container.addChild(this.animWhiteHand);

        setInterval(() => this.playAnimation(), 3000);
    }

    playAnimation() {
        this.animWhiteHand.visible = true;
        this.animWhiteHand.gotoAndPlay(0);

        this.animWhiteHand.onComplete = () => {
            this.animWhiteHand.visible = false;
        };
    }

    onResize() {
        this.container.position.set(
            this.app.screen.width - 80 - this.button.width,
            this.app.screen.height - 100 - this.button.height
        );
    }

    destroy() {
        unsubscribeFromResize(this);
    }
}
