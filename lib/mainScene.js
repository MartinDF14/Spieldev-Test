var spin;

class MainScene extends Phaser.Scene {

    constructor() {
        super("gameScene");

        //velocidad de giro
        this.speed = 35;

        //frame para conteo en update
        this.frame = 0;

        //reels en uso
        this.reels = new Array(3);

        //paylines
        this.payLines = new Array(5);

        //ancho y alto de objetos
        this.objectsWidth = 0;
        this.objectsHeight = 0;

        //solo tiros ganadores
        this.allwaysWin = false;
    }

    init() {
    }

    preload() {

        //preloader de assets
        var style = { font: "50px Arial", fill: "#ffffff", style: 'bold', wordWrap: true, wordWrapWidth: this.cameras.main.width, align: "center" };
        this.loadingText = this.add.text(0, 0, "LOADING ASSETS...", style);
        this.loadingText.setPosition(0, this.cameras.main.height / 2);

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

        //1. Se lanza el juego en un browser.

        //color normal de juego
        this.cameras.main.setBackgroundColor(0xffffff);

        //saco el texto del loader de assets
        this.loadingText.text = "";

        //espacio entre objetos
        var objectsSpacing = 30;

        //creo el background
        this.background = this.add.image(0, 0, "background");
        this.background.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);

        //creo el cuadro de premios
        this.prizeBox = this.add.image(0, 0, "prize");
        this.prizeBox.setPosition(this.cameras.main.width * 0.33, this.cameras.main.height / 2 + this.background.height / 2 + objectsSpacing);

        //creo el background
        this.logo = this.add.image(0, 0, "logo");
        this.logo.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2 - this.background.height / 2 - objectsSpacing);

        //creo el texto de premios
        this.textStyle = { font: "20px Arial", fill: "#000055", style: 'bold', wordWrap: true, wordWrapWidth: this.prizeBox.width, align: "center" };
        this.text = this.add.text(0, 0, "WIN: 0", this.textStyle);
        this.text.setPosition(this.prizeBox.x - this.prizeBox.width / 2 + objectsSpacing * 1.5, this.prizeBox.y - this.prizeBox.height / 2 + objectsSpacing / 2);

        //2. Se piden los reels a la api.
        //creo los reels
        for (let i = 0; i < 3; i++) {
            this.reels[i] = new Reel(i);
        }
        this.CreateReelObjects();
        this.ResetReels();

        //3. Se piden las paylines a la api.
        this.CreatePayLines();

        //4. Se pide el paytable a la api.
        this.payTable = Wrapper.prototype.getPaytable();

        //5. Se realiza un spin (giro de reels) presionando el botón ​spin
        this.spinBtn = this.add.image(0, 0, "spin").setInteractive();
        this.spinBtn.setPosition(this.cameras.main.width * 0.66, this.cameras.main.height / 2 + this.background.height / 2 + objectsSpacing);
        this.spinBtn.on('pointerdown', () => this.Spin());
    }

    Spin() {
        // 9.Se deben poder repetir los pasos desde el punto 5.
        this.ResetReels();
        this.ResetPayLines();
        this.reelsSpinning = 3;
        MainScene.spin = Wrapper.prototype.spin();
        for (let i = 0; i < this.reels.length; i++) {
            this.reels[i].spinning = true;
        }
        this.frame = 0;
        console.log("SPIN");
        console.log(MainScene.spin);

        if(MainScene.spin.winnings == 0 && this.allwaysWin)
            this.Spin();
    }

    CreatePayLines() {
        var images = new Array("line1", "line1", "line1", "line4", "line5");

        //creo los objetos de linea
        for (let i = 0; i < Wrapper.prototype.getPaylines().length; i++) {
            const pl = Wrapper.prototype.getPaylines()[i];
            this.payLines[i] = new PayObject(new Array(pl[0], pl[1], pl[2]));
            this.payLines[i].SetPayLine(this.add.image(0, 0, images[i]), this.cameras.main.width / 2, this.cameras.main.height / 2);
            this.payLines[i].image.setPosition(this.cameras.main.width * 3, this.cameras.main.height * 3);
        }

        this.payLines[1].positionY -= this.objectsHeight;
        this.payLines[2].positionY += this.objectsHeight;
    }

    ResetPayLines() {
        // 8.Si hubieran líneas ganadoras, quedan resaltadas hasta el siguiente spin. Al volver aclickear el botón spin, deben desmarcarse.
        for (let i = 0; i < this.payLines.length; i++) {
            const payLine = this.payLines[i];

            if (payLine.active) {
                payLine.image.setPosition(this.cameras.main.width * 3, this.cameras.main.height * 3);
                payLine.active = false;
            }
        }
    }

    update() {
        this.frame += 1;
        for (let i = 0; i < this.reels.length; i++) {
            this.moveReel(i);
        }
    }

    CheckPrizes() {
        this.reelsSpinning--;
        if (this.reelsSpinning == 0) {
            // console.log("PAYLINE");
            // console.log(this.payLines);
            // console.log("LAYOUT");
            // console.log(MainScene.spin.layout);
            var money = 0;


            for (let i = 0; i < this.payLines.length; i++) {
                const payLine = this.payLines[i];

                var symb1 = MainScene.spin.layout[payLine.line[0]];
                var symb2 = MainScene.spin.layout[payLine.line[1]];
                var symb3 = MainScene.spin.layout[payLine.line[2]];

                //7. En el caso de haber premios, se muestran las líneas ganadoras sobre los reels y el totalganado en la ventana correspondiente
                if (symb1 == symb2 && symb2 == symb3) {
                    payLine.image.setPosition(payLine.positionX, payLine.positionY);
                    payLine.active = true;

                    var earnings = this.payTable.filter(function (item) {
                        return item.symbol == symb1;
                    });

                    money += earnings[0].prize;

                    console.log("PayLine " + i + " won " + money + " with symbol " + symb1);
                }
            }

            this.text.text = "WIN: " + money;
        }

    }

    moveReel(reelId) {
        var reel = this.reels[reelId];
        for (let i = 0; i < reel.objects.length; i++) {
            var reelObj = reel.objects[i];
            if (reel.spinning) {
                //El spin debe durar en promedio 3 segundos desde que comenzaron a girar los reels hasta que se detienen.
                //Aprox 60 frames = 1 seg.
                //Tiempos base: Reel 1 = 1s, Reel 2 = 1.5s, Reel 3 = 2s
                //Tiempo extra hasta llegar a la posicion del stop point, para darle mas vida al movimiento.
                if (this.frame > 60 + reelId * 30 && reel.objects[MainScene.spin.stopPoints[reelId]].positionY == this.cameras.main.height / 2 - this.objectsHeight) {

                    //6. Se detienen los reels mostrando el layout sorteado.
                    reel.spinning = false;
                    reel.objects[MainScene.spin.stopPoints[reelId]].positionY = this.cameras.main.height / 2 - this.objectsHeight;

                    //alineo la grilla
                    var moved = 0;
                    for (let j = 0; j < 2; j++) {
                        var r = MainScene.spin.stopPoints[reelId] + j + 1;
                        var alignR;
                        if (r >= reel.objects.length) {
                            alignR = reel.objects[moved];
                            moved++;
                        }
                        else
                            alignR = reel.objects[r];
                        alignR.positionY = this.cameras.main.height / 2 + j * this.objectsHeight;
                    }
                    this.CheckPrizes();
                }
                else {
                    //continua spineando
                    reelObj.positionY += this.speed;
                    if (reelObj.positionY >= this.cameras.main.height / 2 + this.objectsHeight * 4) {
                        reelObj.positionY = this.cameras.main.height / 2 - this.objectsHeight * 16;
                    }
                }
            }

            //si el objeto no esta en la grilla visible, lo quito de la pantalla y no lo muevo
            //para ahorrar renderizado y movimiento de objetos
            if ((reelObj.positionY > this.cameras.main.height / 2 + this.objectsHeight * 1.1 || reelObj.positionY < this.cameras.main.height / 2 - this.objectsHeight * 1.2)) {
                reelObj.positionX = this.cameras.main.width * 5;
                if (!reelObj.isAway)
                    reelObj.image.setPosition(reelObj.positionX, reelObj.positionY);
                reelObj.isAway = true;
            }
            else {
                reelObj.isAway = false;
                reelObj.positionX = this.cameras.main.width / 2 - this.objectsWidth + reel.index * this.objectsWidth;
            }

            //solo muevo los objetos visibles en la grilla
            if (!reelObj.isAway)
                reelObj.image.setPosition(reelObj.positionX, reelObj.positionY);
        }

    }

    ResetReels() {
        for (let i = 0; i < this.reels.length; i++) {
            const reel = this.reels[i];
            reel.spinning = false;

            for (let j = 0; j < Wrapper.prototype.getReels()[i].length; j++) {
                const sym = Wrapper.prototype.getReels()[i][j];
                reel.objects[j].isAway = false;
                reel.objects[j].SetPosition(this.cameras.main.width / 2 - this.objectsWidth + i * this.objectsWidth,
                    this.cameras.main.height / 2 - this.objectsHeight + j * this.objectsHeight - this.objectsHeight * 15);
                reel.objects[j].image.setPosition(reel.objects[j].positionX, reel.objects[j].positionY);
            }
        }
    }

    CreateReelObjects() {
        for (let i = 0; i < this.reels.length; i++) {
            const element = this.reels[i];
            for (let j = 0; j < Wrapper.prototype.getReels()[i].length; j++) {
                const sym = Wrapper.prototype.getReels()[i][j];
                element.objects[j] = new ReelObject(this.add.image(0, 0, "sym" + sym), i, sym);
            }
        }
        this.objectsWidth = this.reels[0].objects[0].image.width;
        this.objectsHeight = this.reels[0].objects[0].image.height;
    }

}