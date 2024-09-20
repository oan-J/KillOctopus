function Net(context, octopusArray,showMessage) {
    this.ctx = context;
    this.octopusArray = octopusArray;
    this.showMessage = showMessage;
    this.netImage = new Image();
    this.netImage.src = 'net.png'; 
    this.x = 0; 
    this.y = 300; 
    this.lastX = this.x; 
    this.lastY = this.y; 
    this.loaded = false;
    this.keysPressed = {};
    this.isNetFree = true;
    this.capturedOctopus = null;

    this.netImage.onload = () => {
        this.loaded = true;
        this.filterBlack();
    };
}


Net.prototype.checkCollision = function() {
    this.octopusArray.forEach((oct) => {
        if (Math.abs(oct.x - 50 - this.x) < 10 && Math.abs(this.y + 50 - oct.y) < 10) {
            this.isNetFree = false;
            this.capturedOctopus = oct;
            oct.startInking();  
            setTimeout(() => {
                this.isNetFree = true;
                this.capturedOctopus = null;
            }, 3000); 
        }
    });
};

Net.prototype.draw = function() {
    if (this.loaded) {
        this.ctx.drawImage(this.netImage, this.x, this.y);
    }
};


Net.prototype.update = function(delta) {
    const speed = 1;  // 每秒移动200像素
    const prevX = this.x;
    const prevY = this.y;

    if (this.keysPressed['ArrowLeft']) this.x -= speed * delta;
    if (this.keysPressed['ArrowRight']) this.x += speed * delta;
    if (this.keysPressed['ArrowUp']) this.y -= speed * delta;
    if (this.keysPressed['ArrowDown']) this.y += speed * delta;

    if (this.capturedOctopus) {
        
        this.capturedOctopus.x += this.x - prevX;
        this.capturedOctopus.y += this.y - prevY;
        
        
        if (this.capturedOctopus.y <= -10) {
            this.capturedOctopus.isKilled = true;  
            this.showMessage = true;
            this.capturedOctopus = null;
            this.isNetFree = true;
        }
    }

    
    if (this.y >= 0)
        this.showMessage = false;

    
    this.checkCollision();
};

Net.prototype.filterBlack = function() {
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
        if (red > 20 || green > 20 || blue > 20) {
            data[i + 3] = 0;
        }
    }

    tempCtx.putImageData(imageData, 0, 0);
    this.netImage = new Image();
    this.netImage.src = tempCanvas.toDataURL();
};