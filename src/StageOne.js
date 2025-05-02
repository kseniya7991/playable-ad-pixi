import { Container, Assets, Sprite } from "pixi.js";
import gsap from "gsap";

export default class StageOne {
    constructor(app) {
        this.app = app;
        this.gridSize = 5;
        this.cellSize = 48;
    }

    init() {
        this.container = new Container();
        this.container.alpha = 0;
        this.container.zIndex = 10000;

        this.addField();
        this.crateChips();

        return this.container;
    }

    async addField() {
        const textureField = await Assets.load("/assets/field_1_vertical.png");
        this.field = new Sprite(textureField);
        this.field.anchor.set(0.5, 0.5);
        this.container.addChild(this.field);
    }

    async crateChips() {
        this.chipsContainer = new Container();
        this.chipsContainer.zIndex = 1000;

        this.chipsContainer.position.set(
            -(this.cellSize * this.gridSize) / 2,
            -(this.cellSize * this.gridSize) / 2
        );

        this.container.addChild(this.chipsContainer);
        this.chipTextures = await Assets.load([
            "/assets/ch_blue.png",
            "/assets/ch_green.png",
            "/assets/ch_red.png",
            "/assets/ch_yellow.png",
            "/assets/ch_pink.png",
        ]);

        this.chips = [];

        for (let row = 0; row < this.gridSize; row++) {
            this.chips[row] = [];

            for (let col = 0; col < this.gridSize; col++) {
                this.createChip(row, col);
            }
        }
    }

    createChip(row, col) {
        const type = this.createRandomType(row, col);

        const texture = Object.values(this.chipTextures)[type];
        const chip = new Sprite(texture);
        chip.type = type;

        chip.setSize(this.cellSize);
        chip.anchor.set(0);

        chip.x = col * this.cellSize;
        chip.y = row * this.cellSize;

        chip.row = row;
        chip.col = col;

        chip.interactive = true;
        chip.on("pointerdown", (e) => this.onChipPointerDown(e));
        chip.on("pointerup", (e) => this.onChipPointerUp(e));

        this.chipsContainer.addChild(chip);
        this.chips[row][col] = chip;

        return chip;
    }

    createRandomType(row, col) {
        let type = Math.floor(Math.random() * Object.values(this.chipTextures).length);
        const prevRowChip1 = this.chips[row][col - 1]?.type;
        const prevRowChip2 = this.chips[row][col - 2]?.type;
        const prevColChip1 = this.chips[row - 1]?.[col].type;
        const prevColChip2 = this.chips[row - 2]?.[col].type;

        do {
            type = Math.floor(Math.random() * Object.values(this.chipTextures).length);
        } while (
            (type == prevRowChip1 && prevRowChip1 == prevRowChip2) ||
            (type == prevColChip1 && prevColChip1 == prevColChip2)
        );

        return type;
    }

    onChipPointerDown(event) {
        this.swipeStart = {
            chip: event.currentTarget,
            row: event.currentTarget.row,
            col: event.currentTarget.col,
            pos: event.getLocalPosition(this.chipsContainer),
        };
    }

    onChipPointerUp(event) {
        if (!this.swipeStart) return;

        const endPos = event.getLocalPosition(this.chipsContainer);
        const dx = endPos.x - this.swipeStart.pos.x;
        const dy = endPos.y - this.swipeStart.pos.y;

        let direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) direction = "right";
            if (dx < -0) direction = "left";
        } else {
            if (dy > 0) direction = "down";
            if (dy < -0) direction = "up";
        }

        if (direction) {
            let { row, col } = this.swipeStart;
            let nextRow = row,
                nextCol = col;
            switch (direction) {
                case "left":
                    nextCol -= 1;
                    break;
                case "right":
                    nextCol += 1;
                    break;
                case "up":
                    nextRow -= 1;
                    break;
                case "down":
                    nextRow += 1;
                    break;
            }
            // Проверяем, что сосед существует
            if (this.chips[nextRow] && this.chips[nextRow][nextCol]) {
                this.swapChips(row, col, nextRow, nextCol);
            }
        }
        this.swipeStart = null;
    }

    swapChips(row1, col1, row2, col2) {
        // Get interacting chips
        let chip1 = this.chips[row1][col1];
        let chip2 = this.chips[row2][col2];

        const copyChips = this.chips.map((row) => row.slice());
        copyChips[row1][col1] = this.chips[row2][col2];
        copyChips[row2][col2] = this.chips[row1][col1];
        const canSwap = this.canSwap(copyChips);

        gsap.to(chip1, {
            x: chip2.col * this.cellSize,
            y: chip2.row * this.cellSize,
            duration: 0.25,
            onComplete: () => {
                if (canSwap) return;
                gsap.to(chip1, {
                    x: chip1.col * this.cellSize,
                    y: chip1.row * this.cellSize,
                    duration: 0.25,
                });
            },
        });
        gsap.to(chip2, {
            x: chip1.col * this.cellSize,
            y: chip1.row * this.cellSize,
            duration: 0.25,
            onComplete: () => {
                if (canSwap) return;
                gsap.to(chip2, {
                    x: chip2.col * this.cellSize,
                    y: chip2.row * this.cellSize,
                    duration: 0.25,
                });
            },
        });

        // Update array
        if (canSwap) {
            this.chips[row1][col1] = chip2;
            this.chips[row2][col2] = chip1;

            [chip1.row, chip1.col] = [row2, col2];
            [chip2.row, chip2.col] = [row1, col1];

            this.findMatches();
        }
    }

    canSwap(copyChips) {
        for (let row = 0; row < this.gridSize; row++) {
            let count = 1;
            for (let col = 1; col < this.gridSize; col++) {
                if (copyChips[row][col].type === copyChips[row][col - 1].type) {
                    count++;
                    if (count > 2) return true;
                } else {
                    count = 1;
                }
            }
        }

        for (let col = 0; col < this.gridSize; col++) {
            let count = 1;
            for (let row = 1; row < this.gridSize; row++) {
                if (copyChips[row][col].type === copyChips[row - 1][col].type) {
                    count++;
                    if (count > 2) return true;
                } else {
                    count = 1;
                }
            }
        }

        return false;
    }

    findMatches() {
        const matches = [];
        // Горизонтальные совпадения
        for (let row = 0; row < this.gridSize; row++) {
            let count = 1;
            for (let col = 1; col < this.gridSize; col++) {
                if (this.chips[row][col].type === this.chips[row][col - 1].type) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let k = 0; k < count; k++) {
                            matches.push(this.chips[row][col - 1 - k]);
                        }
                    }
                    count = 1;
                }
            }
            if (count >= 3) {
                for (let k = 0; k < count; k++) {
                    matches.push(this.chips[row][this.gridSize - 1 - k]);
                }
            }
        }
        // Вертикальные совпадения
        for (let col = 0; col < this.gridSize; col++) {
            let count = 1;
            for (let row = 1; row < this.gridSize; row++) {
                if (this.chips[row][col].type === this.chips[row - 1][col].type) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let k = 0; k < count; k++) {
                            matches.push(this.chips[row - 1 - k][col]);
                        }
                    }
                    count = 1;
                }
            }
            if (count >= 3) {
                for (let k = 0; k < count; k++) {
                    matches.push(this.chips[this.gridSize - 1 - k][col]);
                }
            }
        }
        // Убираем дубли
        matches.forEach((chip) => {
            gsap.to(chip, {
                alpha: 0,
                duration: 0.2,
            });
        });

        
        return Array.from(new Set(matches));
    }
}
