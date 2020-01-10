var spin;
var frame;
var speed;
var reels;
// var reel1;
// var reel2;
// var reel3;

class mainScene extends Phaser.Scene {

    constructor() {
        super("gameScene");
    }

    init() {
    }

    preload() {
        this.load.image("background", "images/frame.png");
        this.load.image("spin", "images/btn_spin.png");
        this.load.image("line1", "images/line_1.png");
        this.load.image("line4", "images/line_4.png");
        this.load.image("line5", "images/line_5.png");
        this.load.image("logo", "images/logo_mobile.png");
        this.load.image("prize", "images/prize_window.png");
        this.load.image("syma", "images/symbols/sym_a.png");
        this.load.image("symb", "images/symbols/sym_b.png");
        this.load.image("symc", "images/symbols/sym_c.png");
        this.load.image("symd", "images/symbols/sym_d.png");
        this.load.image("syme", "images/symbols/sym_e.png");
    }

    create() {
        this.background = this.add.image(0, 0, "background");
        this.background.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);

        mainScene.speed = 35;
        mainScene.frame = 0;
        mainScene.reels = new Array();

        for (let i = 0; i < 3; i++) {
            mainScene.reels[i] = this.createReel(i);
        }

        mainScene.spinBtn = this.add.image(0, 0, "spin").setInteractive();
        mainScene.spinBtn.setPosition(this.cameras.main.width * 0.66, this.cameras.main.height / 2 + this.background.height / 2 + 30);
        mainScene.spinBtn.on('pointerdown', () => {
            this.resetReels();
            mainScene.spin = Wrapper.prototype.spin();
            for (let i = 0; i < mainScene.reels.length; i++) {
                mainScene.reels[i].spinning = true;
            }
            mainScene.frame = 0;
            console.log(mainScene.spin);
          });
    }
 
    update() {
        mainScene.frame += 1;
        for (let i = 0; i < 3; i++) {
            this.moveReel(i);
        }
    }

    moveReel(reelId) {
        var reel = mainScene.reels[reelId];
        for (let i = 0; i < reel.length; i++) {
            if (reel.spinning) {
                if (mainScene.frame > 180 + (reelId * 90) && reel[mainScene.spin.stopPoints[reelId]].positionY == this.cameras.main.height / 2 - reel[0].height) {
                    reel.spinning = false;
                    reel[mainScene.spin.stopPoints[reelId]].positionY = this.cameras.main.height / 2 - reel[0].height;
                    
                    var r1 = mainScene.spin.stopPoints[reelId] + 1;
                    if(r1 >= reel.length)
                        reel[0].positionY = this.cameras.main.height / 2;
                    else
                        reel[mainScene.spin.stopPoints[reelId] + 1].positionY = this.cameras.main.height / 2;
                    
                    var r2 = mainScene.spin.stopPoints[reelId] + 2;
                    if(r2 >= reel.length)
                        reel[1].positionY = this.cameras.main.height / 2 + reel[0].height;
                    else
                        reel[mainScene.spin.stopPoints[reelId] + 2].positionY = this.cameras.main.height / 2 + reel[0].height;
                }
                else {
                    reel[i].positionY += mainScene.speed;
                    if (reel[i].positionY >= this.cameras.main.height / 2 + reel[i].height * 4) {
                        reel[i].positionY = this.cameras.main.height / 2 - reel[i].height * 16;
                    }
                }
            }

            if (reel[i].positionY > this.cameras.main.height / 2 + reel[i].height * 1.1 || reel[i].positionY < this.cameras.main.height / 2 - reel[i].height * 1.2) {
                reel[i].positionX = this.cameras.main.width * 5;
            }
            else {
                reel[i].positionX = this.cameras.main.width / 2 - reel[i].width + reel.index * reel[i].width;
            }

            reel[i].setPosition(reel[i].positionX, reel[i].positionY);
        }

    }

    createReel(index) {
        var reel = new Array(20);
        reel.index = index;
        reel.spinning = false;
        for (let i = 0; i < Wrapper.prototype.getReels()[index].length; i++) {
            const sym = Wrapper.prototype.getReels()[index][i];
            reel[i] = this.add.image(0, 0, "sym" + sym);
            reel[i].index = i;
            reel[i].positionX = this.cameras.main.width / 2 - reel[i].width + index * reel[i].width;
            reel[i].positionY = this.cameras.main.height / 2 - reel[i].height + i * reel[i].height - reel[i].height * 15;
            reel[i].setPosition(reel[i].positionX, reel[i].positionY);
        }
        return reel;
    }

    resetReels(){
        console.log("RESET");
        for (let i = 0; i < mainScene.reels.length; i++) {
            const reel = mainScene.reels[i];
            reel.spinning = false;

            for (let j = 0; j < Wrapper.prototype.getReels()[i].length; j++) {
                const sym = Wrapper.prototype.getReels()[i][j];
                reel[j].positionX = this.cameras.main.width / 2 - reel[j].width + i * reel[j].width;
                reel[j].positionY = this.cameras.main.height / 2 - reel[j].height + j * reel[j].height - reel[j].height * 15;
                reel[j].setPosition(reel[i].positionX, reel[i].positionY);
            }
        }
    }
}