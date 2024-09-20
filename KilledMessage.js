function Message(context) {
    this.ctx = context;
    this.netImage = new Image();
    this.netImage.src = 'message.png';
    this.x = 30;
    this.y = 200;
    this.loaded = false;
    this.scale = 0.2;

    this.netImage.onload = () => {
        this.loaded = true;
        this.filterWhite();
        console.log('Image loaded and filtered');
    };

    this.netImage.onerror = () => {
        console.error('Failed to load image');
    };
}

Message.prototype.draw = function() {
    if (this.loaded) {
        this.ctx.drawImage(
            this.netImage, 
            this.x, 
            this.y, 
            this.netImage.width * this.scale, 
            this.netImage.height * this.scale
        );
    }
    console.log("draw Message successful")
};

Message.prototype.update = function() {
    //
};

Message.prototype.filterWhite = function() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = this.netImage.width;
    tempCanvas.height = this.netImage.height;

    tempCtx.drawImage(this.netImage, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        if (red > 230 && green > 230 && blue > 230) {
            data[i + 3] = 0; 
        }
    }

    tempCtx.putImageData(imageData, 0, 0);
    this.netImage = new Image();
    this.netImage.src = tempCanvas.toDataURL();
};