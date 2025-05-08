import { Container, Assets, Sprite } from "pixi.js";

import gsap from "gsap";
export default class Match3Board {
    constructor(app) {
        this.name = "match3board";

        this.app = app;

        this.gridSize = 5;
        this.cellSize = 48;

        this.chipAliases = ["chipBlue", "chipGreen", "chipRed", "chipYellow", "chipPink"];

        this.isSwapDisabled = false;

        this.init();
    }

    init() {
        this.container = new Container();
        this.container.position.set(
            -(this.cellSize * this.gridSize) / 2,
            -(this.cellSize * this.gridSize) / 2
        );
        this.container.zIndex = this.app.zIndexObj[this.name];

        this.createChips();
    }

    createChips() {
        this.chipTextures = this.chipAliases.map((alias) => Assets.get(alias));

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

        this.container.addChild(chip);
        this.chips[row][col] = chip;

        chip.cursor = "pointer";

        return chip;
    }

    createRandomType(row, col) {
        let type = Math.floor(Math.random() * Object.values(this.chipTextures).length);
        const prevRowChip1 = this.chips[row]?.[col - 1]?.type;
        const prevRowChip2 = this.chips[row]?.[col - 2]?.type;
        const prevColChip1 = this.chips[row - 1]?.[col]?.type;
        const prevColChip2 = this.chips[row - 2]?.[col]?.type;

        // Проверяет, чтобы 3 одинаковые фишки не были рядом
        do {
            type = Math.floor(Math.random() * Object.values(this.chipTextures).length);
        } while (
            (type == prevRowChip1 && prevRowChip1 == prevRowChip2) ||
            (type == prevColChip1 && prevColChip1 == prevColChip2)
        );

        return type;
    }

    onChipPointerDown(event) {
        this.swapStart = {
            chip: event.currentTarget,
            row: event.currentTarget.row,
            col: event.currentTarget.col,
            pos: event.getLocalPosition(this.container),
        };
    }

    onChipPointerUp(event) {
        if (!this.swapStart) return;

        const endPos = event.getLocalPosition(this.container);
        const dirX = endPos.x - this.swapStart.pos.x;
        const dirY = endPos.y - this.swapStart.pos.y;

        // Определяет направление свапа
        let direction = null;
        if (Math.abs(dirX) > Math.abs(dirY)) {
            if (dirX > 0) direction = "right";
            if (dirX < -0) direction = "left";
        } else {
            if (dirY > 0) direction = "down";
            if (dirY < -0) direction = "up";
        }

        // Определяет фишку для свапа
        if (direction) {
            let { row, col } = this.swapStart;
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

            if (this.chips[nextRow] && this.chips[nextRow][nextCol] && !this.isSwapDisabled) {
                this.swapChips(row, col, nextRow, nextCol);
            }
        }
        this.swapStart = null;
    }

    swapChips(row1, col1, row2, col2) {
        this.isSwapDisabled = true;
        
        // Get interacting chips
        let chip1 = this.chips[row1][col1];
        let chip2 = this.chips[row2][col2];

        const copyChips = this.chips.map((row) => row.slice());
        copyChips[row1][col1] = this.chips[row2][col2];
        copyChips[row2][col2] = this.chips[row1][col1];
        const canSwap = this.canSwap(copyChips);

        // Анимация свапа
        if (!canSwap) {
            this.app.soundManager.play(this.app.soundNames.mistake, { volume: 0.8 });
        }

        const anim1 = new Promise((resolve) => {
            gsap.to(chip1, {
                x: chip2.col * this.cellSize,
                y: chip2.row * this.cellSize,
                duration: 0.25,
                onComplete: () => {
                    if (!canSwap) {
                        // Если свап недоступен, возвращает фишку на место
                        gsap.to(chip1, {
                            x: chip1.col * this.cellSize,
                            y: chip1.row * this.cellSize,
                            duration: 0.25,
                            onComplete: resolve,
                        });
                    } else {
                        resolve();
                    }
                },
            });
        });

        const anim2 = new Promise((resolve) => {
            gsap.to(chip2, {
                x: chip1.col * this.cellSize,
                y: chip1.row * this.cellSize,
                duration: 0.25,
                onComplete: () => {
                    if (!canSwap) {
                        gsap.to(chip2, {
                            x: chip2.col * this.cellSize,
                            y: chip2.row * this.cellSize,
                            duration: 0.25,
                            onComplete: resolve,
                        });
                    } else {
                        resolve();
                    }
                },
            });
        });


        Promise.all([anim1, anim2]).then(() => {
           this.isSwapDisabled = false;
        });

        // Если свап доступен, меняет местами фишки в массивах
        if (canSwap) {
            this.chips[row1][col1] = chip2;
            this.chips[row2][col2] = chip1;

            [chip1.row, chip1.col] = [row2, col2];
            [chip2.row, chip2.col] = [row1, col1];

            this.findMatches();
        }
    }

    canSwap(copyChips) {
        // Проверяет, есть ли совпадения в строке
        for (let row = 0; row < this.gridSize; row++) {
            let count = 1;
            for (let col = 1; col < this.gridSize; col++) {
                const firstChipType = copyChips[row]?.[col]?.type;
                const secondChipType = copyChips[row]?.[col - 1]?.type;
                if (
                    firstChipType !== undefined &&
                    secondChipType !== undefined &&
                    firstChipType === secondChipType
                ) {
                    count++;
                    if (count > 2) return true;
                } else {
                    count = 1;
                }
            }
        }

        // Проверяет, есть ли совпадения в столбце
        for (let col = 0; col < this.gridSize; col++) {
            let count = 1;
            for (let row = 1; row < this.gridSize; row++) {
                const firstChipType = copyChips[row]?.[col]?.type;
                const secondChipType = copyChips[row - 1]?.[col]?.type;

                if (
                    firstChipType !== undefined &&
                    secondChipType !== undefined &&
                    firstChipType === secondChipType
                ) {
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
        this.isSwapDisabled = true;
        let animations = [];
        const matches = [];
        // Горизонтальные совпадения
        for (let row = 0; row < this.gridSize; row++) {
            let count = 1;
            for (let col = 1; col < this.gridSize; col++) {
                if (this.chips[row]?.[col]?.type === this.chips[row]?.[col - 1]?.type) {
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
                if (this.chips[row]?.[col]?.type === this.chips[row - 1]?.[col]?.type) {
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

        matches.forEach((chip) => {
            if (!chip) return;
            this.chips[chip.row][chip.col] = null;

            animations.push(
                new Promise((resolve) => {
                    gsap.to(chip, {
                        alpha: 0,
                        duration: 0.2,
                        onComplete: resolve,
                    });
                })
            );
        });

        if (matches.length > 0) {
            this.app.soundManager.play(this.app.soundNames.match, { volume: 0.8 });
            Promise.all(animations).then(() => {
                setTimeout(() => {
                    this.dropChips();
                }, 50);
            });
        } else {
            this.isSwapDisabled = false;
        }

        return Array.from(new Set(matches));
    }

    dropChips() {
        const animations = [];
        for (let col = 0; col < this.gridSize; col++) {
            let emptyRow = null;

            for (let row = this.gridSize - 1; row >= 0; row--) {
                const chip = this.chips[row][col];

                if (!chip) {
                    if (emptyRow === null) emptyRow = row;
                } else if (emptyRow !== null) {
                    this.chips[emptyRow][col] = chip;
                    this.chips[row][col] = null;

                    chip.row = emptyRow;
                    chip.col = col;

                    animations.push(
                        new Promise((resolve) => {
                            gsap.to(chip, {
                                y: emptyRow * this.cellSize,
                                duration: 0.25,
                                onComplete: resolve,
                            });
                        })
                    );

                    emptyRow--;
                }
            }
        }

        Promise.all(animations).then(() => {
            setTimeout(() => {
                this.addNewChips();
            }, 50);
        });
    }

    addNewChips() {
        const animations = [];

        for (let col = 0; col < this.gridSize; col++) {
            let count = 0;
            for (let row = this.gridSize - 1; row >= 0; row--) {
                const chip = this.chips[row][col];

                if (!chip) {
                    const newChip = this.createChip(row, col);
                    newChip.y = -this.cellSize * (row + 1);
                    gsap.set(newChip, { alpha: 0 });

                    animations.push(
                        new Promise((resolve) => {
                            gsap.to(newChip, {
                                y: row * this.cellSize,
                                duration: 0.3,
                                delay: count * 0.1,
                                alpha: 1,
                                onComplete: resolve,
                            });
                        })
                    );
                    count++;
                }
            }
        }

        Promise.all(animations).then(() => {
            setTimeout(() => {
                this.findMatches();
            }, 50);
        });
    }
}
