import { Container, Assets, Sprite } from "pixi.js";
import Match3Board from "./Math3Board";
import { subscribeToResize, unsubscribeFromResize } from "../utils/resizeManager";

export default class StageOne {
    constructor(app) {
        this.app = app;
        this.gridSize = 5;
        this.cellSize = 48;
    }

    init() {
        this.container = new Container();
        this.container.alpha = 0;
        this.container.visible = false;
    
        this.addField();
        this.match3Board = new Match3Board(this.app);

        this.container.addChild(this.match3Board.container);

        subscribeToResize(this);
        return this.container;
    }

    async addField() {
        const textureField = Assets.get("field");
        this.field = new Sprite(textureField);
        this.field.anchor.set(0.5, 0.5);
        this.container.addChild(this.field);
    }

    onResize() {
        this.container.scale.set(this.app.scale * 0.8);
    }

    destroy() {
        unsubscribeFromResize(this)
    }
  
}
