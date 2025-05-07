import { Assets, AnimatedSprite, Container } from "pixi.js";

export default class Fireworks {
    constructor(app) {
        this.app = app;
        this.animationsCount = 5;
        this.animationDelay = 500;
    }

    init() {
        this.container = new Container();
        this.spriteSheet = Assets.get("fireworksSprite");
        return this;
    }

    startAnimations() {
        for (let i = 0; i < this.animationsCount; i++) {
            setTimeout(() => {
                this.createFireworksAnimation();
            }, i * this.animationDelay);
        }
    }

    createFireworksAnimation() {
        const animation = new AnimatedSprite(this.spriteSheet.animations.fireworks);
        animation.position.set(
            (Math.random() * this.app.screen.width) / 4 - this.app.screen.width / 8,
            (Math.random() * this.app.screen.width) / 4 - this.app.screen.width / 8
        );
        animation.scale.set(1.5);
        animation.animationSpeed = 0.5;
        animation.loop = false;
        animation.onComplete = () => {
            this.container.removeChild(animation);
        };
        this.container.addChild(animation);
        animation.play();
        this.app.soundManager.play(this.app.soundNames.fireworks, { volume: 0.5 });
    }
}
