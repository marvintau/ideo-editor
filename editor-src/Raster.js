export default class Raster {
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width * height);
    }

    /**
     * set the pixel in data
     * @param {number} x x coord
     * @param {number} y y coord
     */
    setPixel(x, y){
        this.data[this.width * (y-1) + x] = 1;
    }

    /**
     * Count the pixels in the selected area.
     * @param {number} x x coord
     * @param {number} y y coord
     * @param {number} w width of slice
     * @param {number} h height of slice
     */
    countSlice(x, y, w, h){
        var count = 0;
        for(let i = x; i < w; i++)
            for (let j = y; j < h; j++)
                count += this.data[y*width + x];
        return count;
    }
}