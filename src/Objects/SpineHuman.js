import { Assets, Container, Loader } from "pixi.js";
import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { subscribeToResize, unsubscribeFromResize } from "../utils/resizeManager";
// import { Spine } from "pixi-spine";

export default class SpineHuman {
    constructor(app) {
        this.app = app;
        this.init();
    }

    async init() {
        this.container = new Container();

        this.spine = Spine.from({
            skeleton: "spineSkeleton",
            atlas: "spineAtlas",
        });
        // this.spine = Spine.from({
        //     skeleton: "spineGoblinsJson",
        //     atlas: "spineGoblinsAtlas",
        // });

        this.container.addChild(this.spine);

        this.spine.position.set(0, this.spine.height / 2);

        this.spine.state.data.defaultMix = 0.2;
        this.spine.state.setAnimation(0, "idle", true);
        // this.spine.state.setAnimation(0, "walk", true);

        this.spine.visible = false;
        // this.spine.visible = true;
        subscribeToResize(this);
    }

    onResize() {
        this.container.scale.set(this.app.scale * 0.3);
    }

    start() {
        this.spine.visible = true;
    }

    destroy() {
        unsubscribeFromResize(this);
    }
}
