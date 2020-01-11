class ReelObject{
    
    constructor (image, index){

        this.image = image;
        this.index = index;
        this.isAway = false;
    }

    SetPosition(x,y){
        this.positionX = x;
        this.positionY = y;
    }
}