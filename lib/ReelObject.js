class ReelObject{
    
    constructor (image, index, sym){
        this.symbol = sym;
        this.image = image;
        this.index = index;
        this.isAway = false;
    }

    SetPosition(x,y){
        this.positionX = x;
        this.positionY = y;
    }
}