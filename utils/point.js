export class Point {
    x; 
    y;

    constructor(x, y) {
        if(typeof x == 'string') {
            this.x = new Number(x);
        } else {
            this.x = x;
        }

        if(typeof y == 'string') {
            this.y = new Number(y);
        } else {
            this.y = y;
        }
    }
}