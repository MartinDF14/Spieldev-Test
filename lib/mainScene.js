var spin;

class MainScene extends Phaser.Scene {

    constructor() {
        super("gameScene");

        //seteo variables
        this.speed = 35;
        this.frame = 0;
        this.reelCount = 3;
        this.reels = new Array(this.reelCount);
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
        //creo el background
        this.background = this.add.image(0, 0, "background");
        this.background.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);

        //creo el reel
        for (let i = 0; i < this.reelCount; i++) {
            this.reels[i] = new Reel(i);
        }
        this.CreateReelObjects();
        this.ResetReels();

        //creo el boton de spin
        this.spinBtn = this.add.image(0, 0, "spin").setInteractive();
        this.spinBtn.setPosition(this.cameras.main.width * 0.66, this.cameras.main.height / 2 + this.background.height / 2 + 30);
        this.spinBtn.on('pointerdown', () => {
            this.ResetReels();
            MainScene.spin = Wrapper.prototype.spin();
            for (let i = 0; i < this.reels.length; i++) {
                this.reels[i].spinning = true;
            }
            this.frame = 0;
            console.log(MainScene.spin);
          });
    }
 
    update() {
        this.frame += 1;
        for (let i = 0; i < this.reels.length; i++) {
            this.moveReel(i);
        }
    }

    moveReel(reelId) {
        var reel = this.reels[reelId];
        for (let i = 0; i < reel.objects.length; i++) {
            var reelObj = reel.objects[i];
            if (reel.spinning) {
                //chequeo tiempos y posicion para frenar el spin
                if (this.frame > 180 + (reelId * 90) && reel.objects[MainScene.spin.stopPoints[reelId]].positionY == this.cameras.main.height / 2 - reelObj.image.height) {
                    reel.spinning = false;
                    reel.objects[MainScene.spin.stopPoints[reelId]].positionY = this.cameras.main.height / 2 - reelObj.image.height;
                    
                    //esto lo hago porque habia un bug en el que los objetos no se alineaban bien a la grilla
                    //despues le encontrare alguna solucion mejor

                    //alineo la linea 2 a la grilla
                    var r1 = MainScene.spin.stopPoints[reelId] + 1;
                    if(r1 >= reel.objects.length)
                        reel.objects[0].positionY = this.cameras.main.height / 2;
                    else
                        reel.objects[r1].positionY = this.cameras.main.height / 2;
                    
                    //alineo la linea 3 a la grilla
                    var r2 = MainScene.spin.stopPoints[reelId] + 2;
                    if(r2 >= reel.objects.length)
                        reel.objects[1].positionY = this.cameras.main.height / 2 + reel.objects[0].image.height;
                    else
                        reel.objects[r2].positionY = this.cameras.main.height / 2 + reel.objects[0].image.height;
                }
                else {
                    //continua spineando
                    reelObj.positionY += this.speed;
                    if (reelObj.positionY >= this.cameras.main.height / 2 + reelObj.image.height * 4) {
                        reelObj.positionY = this.cameras.main.height / 2 - reelObj.image.height * 16;
                    }
                }
            }

            //si el objeto no esta en la grilla visible, lo quito de la pantalla y no lo muevo
            //para ahorrar renderizado y movimiento de objetos
            if ((reelObj.positionY > this.cameras.main.height / 2 + reelObj.image.height * 1.1 || reelObj.positionY < this.cameras.main.height / 2 - reelObj.image.height * 1.2)) {
                reelObj.positionX = this.cameras.main.width * 5;
                if(!reelObj.isAway)
                    reelObj.image.setPosition(reelObj.positionX, reelObj.positionY);
                reelObj.isAway = true;
            }
            else{
                reelObj.isAway = false;
                reelObj.positionX = this.cameras.main.width / 2 - reelObj.image.width + reel.index * reelObj.image.width;
            }

            //solo muevo los objetos visibles en la grilla
            if(!reelObj.isAway)
                reelObj.image.setPosition(reelObj.positionX, reelObj.positionY);
        }

    }

    ResetReels(){
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            reel.spinning = false;

            for (let j = 0; j < Wrapper.prototype.getReels()[i].length; j++) {
                const sym = Wrapper.prototype.getReels()[i][j];
                reel.objects[j].isAway = false;
                reel.objects[j].SetPosition(this.cameras.main.width / 2 - reel.objects[j].image.width + i * reel.objects[j].image.width, 
                                            this.cameras.main.height / 2 - reel.objects[j].image.height + j * reel.objects[j].image.height - reel.objects[j].image.height * 15);
                reel.objects[j].image.setPosition(reel.objects[j].positionX, reel.objects[j].positionY);
            }
        }
    }

    CreateReelObjects() {
        for (let i = 0; i < this.reels.length; i++) {
            const element = this.reels[i];
            for (let j = 0; j < Wrapper.prototype.getReels()[i].length; j++) {
                const sym = Wrapper.prototype.getReels()[i][j];
                element.objects[j] = new ReelObject(this.add.image(0, 0, "sym" + sym), i); 
            }
        }
    }

}