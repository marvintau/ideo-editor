export default class Color {
    constructor (r_obj, g, b, a){

        this.type = "Color";

        // TO BE ADDED MORE
        const colorfuncs = {
            plum : [
                [ -0.0399966,    0.0271153,   -0.000484974,     3.08273*10e-6],
                [ -0.00588486,   0.00511731,  -0.0000405736,    7.75887*10e-7],
                [  0.00402332,   0.0015165,    0.000220422,    -1.92692*10e-6]
            ]
        }
        
        if (g !== undefined && b !== undefined){
            this.r = r_obj;
            this.g = g;
            this.b = b;
            this.a = a;
        } else {

            const s = r_obj !== undefined ? colorfuncs[r_obj.scheme] : colorfuncs["plum"],
                  t = r_obj !== undefined ? r_obj.t : Math.random() * 50;
                console.log(t);
            this.r = (s[0][0] + s[0][1]*t + s[0][2]*t*t + s[0][3]*t*t*t) * 255;
            this.g = (s[1][0] + s[1][1]*t + s[1][2]*t*t + s[1][3]*t*t*t) * 255;
            this.b = (s[2][0] + s[2][1]*t + s[2][2]*t*t + s[2][3]*t*t*t) * 255;
            this.a = 0.7;
        }
    }

    toString(){
        return 'rgba(' + this.r.toFixed(4) + ", " + this.g.toFixed(4) + ", "
                       + this.b.toFixed(4) + ", " + this.a.toFixed(4) + ")";
    }

    darken(ratio){
        this.r *= ratio;
        this.g *= ratio;
        this.b *= ratio;
    }

    lighten(ratio){
        this.r = 1- (1 - this.r) * ratio;
        this.g = 1- (1 - this.g) * ratio;
        this.b = 1- (1 - this.b) * ratio;
    }
}
