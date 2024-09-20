function Octopus(context, x, y, scale, legSegments) {
    this.ctx = context;
    this.x = x || 320;
    this.y = y || 240;
    this.scale = scale || 1;
    this.bodyRadius = -50 * this.scale;
    this.eyeRadius = 10 * this.scale;
    this.legLength = 80 * this.scale;
    this.legWidth = 5 * this.scale;
    this.legSegments = legSegments || 10;
    this.legs = 8;
    this.colors = {
        body: "#FFC0CB",
        legs: "#FFC0CB",
        eyes: "white",
        mouth: "#FF6347"
    };
    this.dx = (Math.random() - 0.5) * 2 * this.scale;
    this.dy = (Math.random() - 0.5) * 2 * this.scale;
    this.isKilled = false;
    this.inkSplats = [];
    this.legMovements = Array.from({ length: this.legs }, (_, i) => {
        const half = this.legs / 2;
        const isLeft = i < half;
        const index = isLeft ? half - i - 1 : i - half;
        const maxAngle = 1;
        const angleOffset = maxAngle / (half - 0.2);
        const baseAngle = 2.5 * Math.PI + (isLeft ? -1 : 1) * angleOffset * index;

        return {
            segments: Array.from({ length: this.legSegments }, (_, j) => ({
                angle: 0,
                baseAngle,
                amplitude: 0.2 + Math.random() * 0.3,
                speed: 0.02 + Math.random() * 0.03,
                phase: (j / this.legSegments) * Math.PI * 2
            }))
        };
    });
}

Octopus.prototype.draw = function () {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);

    this.updateLegAngles();

    this.legMovements.forEach((leg, index) => {
        this.drawLegMeatOnly(leg, index);
    });

    this.legMovements.forEach((leg, index) => {
        this.drawLegBoneOnly(leg, index);
    });

    this.drawBody();
    this.drawEyes();
    this.drawMouth();

    if (this.inkSplats.length > 0) {
        this.drawInk();
    }

    this.ctx.restore();
};

Octopus.prototype.updateLegAngles = function() {
    this.legMovements.forEach(leg => {
        leg.segments.forEach(segment => {
            segment.angle += segment.speed;
        });
    });
};

Octopus.prototype.drawLegMeatOnly = function (leg, legIndex) {
    let currentX = 0;
    let currentY = this.bodyRadius * 0.4;
    const totalSegments = leg.segments.length;
    const lengthFactor = this.getLegLengthFactor(legIndex);

    leg.segments.forEach((segment, index) => {
        const angle = segment.baseAngle + Math.sin(segment.angle + segment.phase) * segment.amplitude;
        const segmentLength = (this.legLength * lengthFactor) / totalSegments;
        const endX = currentX + Math.cos(angle) * segmentLength;
        const endY = currentY + Math.sin(angle) * segmentLength;

        this.drawLegMeat(currentX, currentY, endX, endY, angle, index, totalSegments);

        currentX = endX;
        currentY = endY;
    });
};

Octopus.prototype.drawLegBoneOnly = function (leg, legIndex) {
    let currentX = 0;
    let currentY = this.bodyRadius * 0.4;
    const totalSegments = leg.segments.length;
    const lengthFactor = this.getLegLengthFactor(legIndex);

    leg.segments.forEach((segment, index) => {
        const angle = segment.baseAngle + Math.sin(segment.angle + segment.phase) * segment.amplitude;
        const segmentLength = (this.legLength * lengthFactor) / totalSegments;
        const endX = currentX + Math.cos(angle) * segmentLength;
        const endY = currentY + Math.sin(angle) * segmentLength;

        this.drawLegBone(currentX, currentY, endX, endY, 0.8);

        currentX = endX;
        currentY = endY;
    });
};

Octopus.prototype.drawLegMeat = function (currentX, currentY, endX, endY, angle, index, totalSegments) {
    const positionFactor = Math.abs(totalSegments / 2 - index) / (totalSegments / 2);
    const dynamicWidth = this.legWidth * (4 - positionFactor);
    this.ctx.fillStyle = this.colors.legs;
    this.ctx.beginPath();
    this.ctx.ellipse((currentX + endX) / 2, (currentY + endY) / 2, dynamicWidth * 1.2, dynamicWidth * 0.8, angle, 0, Math.PI * 2);
    this.ctx.fill();
};

Octopus.prototype.drawLegBone = function (currentX, currentY, endX, endY, lengthRatio) {
    var deltaX = endX - currentX;
    var deltaY = endY - currentY;

    var shortenedEndX = currentX + deltaX * lengthRatio;
    var shortenedEndY = currentY + deltaY * lengthRatio;

    var midX = (currentX + shortenedEndX) / 2;
    var midY = (currentY + shortenedEndY) / 2;

    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 6; 
    this.ctx.beginPath();
    this.ctx.moveTo(currentX, currentY);
    this.ctx.lineTo(midX, midY);
    this.ctx.stroke();

    this.ctx.lineWidth = 2; 
    this.ctx.beginPath();
    this.ctx.moveTo(midX, midY);
    this.ctx.lineTo(shortenedEndX, shortenedEndY);
    this.ctx.stroke();

};

Octopus.prototype.getLegLengthFactor = function (index) {
    const maxFactor = 1.0;
    const minFactor = 1.4;
    const midPoint = (this.legs - 1) / 2;
    const distanceFromCenter = Math.abs(midPoint - index);
    const range = maxFactor - minFactor;
    const factor = maxFactor - range * Math.pow(distanceFromCenter / midPoint, 2);
    return factor;
};

Octopus.prototype.startInking = function() {
    for (let i = 0; i < 5; i++) {
        const minSize = this.scale;
        const maxSize = this.scale + 3;
        const randomSize = minSize + Math.random() * (maxSize - minSize);

        this.inkSplats.push({
            x: 0, 
            y: 0, 
            radius: (8 + Math.random() * 2) * randomSize, 
            opacity: 1, 
            vx: (Math.random() - 0.5) * 2, 
            vy: (Math.random() - 0.5) * 2  
        });
    }
};

Octopus.prototype.drawInk = function() {
    this.inkSplats = this.inkSplats.filter(splat => splat.opacity > 0);

    this.inkSplats.forEach(splat => {
        splat.x += splat.vx;
        splat.y += splat.vy;
        splat.vx *= 0.99;
        splat.vy *= 0.99;

        splat.opacity -= 0.01;

        this.ctx.fillStyle = `rgba(0, 0, 0, ${splat.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(splat.x, splat.y, splat.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    });
};

Octopus.prototype.update = function (delta) {
    this.x += 0.1 * this.dx * delta;
    this.y += 0.1 * this.dy * delta;


    if (this.x < this.bodyRadius || this.x > this.ctx.canvas.width - this.bodyRadius) {
        this.dx = -this.dx;
    }
    if (this.y < this.bodyRadius || this.y > this.ctx.canvas.height - this.bodyRadius) {
        this.dy = -this.dy;
    }
};

Octopus.prototype.drawBody = function () {
    this.ctx.fillStyle = this.colors.body;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.bodyRadius);
    this.ctx.bezierCurveTo(
        this.bodyRadius * 1.6, -this.bodyRadius * 1.2,
        this.bodyRadius * 1.6, this.bodyRadius * 1.2,
        0, this.bodyRadius * 1.3
    );
    this.ctx.bezierCurveTo(
        -this.bodyRadius * 1.6, this.bodyRadius * 1.2,
        -this.bodyRadius * 1.6, -this.bodyRadius * 1.2,
        0, -this.bodyRadius
    );
    this.ctx.fill();
};

Octopus.prototype.drawEyes = function () {
    const eyeOffset = 15 * this.scale;
    const eyeOuterRadius = 8 * this.scale;
    const pupilRadius = 4 * this.scale;
    const highlightRadius = 1.5 * this.scale;

    this.ctx.fillStyle = "black";
    this.ctx.beginPath();
    this.ctx.ellipse(-eyeOffset, -15 * this.scale, eyeOuterRadius, eyeOuterRadius, 0, 0, Math.PI * 2);
    this.ctx.ellipse(eyeOffset, -15 * this.scale, eyeOuterRadius, eyeOuterRadius, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(-eyeOffset - 1.2, -18 * this.scale, pupilRadius, 0, Math.PI * 2);
    this.ctx.arc(eyeOffset - 1.2, -18 * this.scale, pupilRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(-eyeOffset + 5, -18 * this.scale, highlightRadius, 0, Math.PI * 2);
    this.ctx.arc(eyeOffset + 5, -18 * this.scale, highlightRadius, 0, Math.PI * 2);
    this.ctx.fill();
};


Octopus.prototype.drawMouth = function () {
    this.ctx.fillStyle = this.colors.mouth;
    this.ctx.beginPath();
    this.ctx.moveTo(-10 * this.scale, 0);
    this.ctx.quadraticCurveTo(0, 10 * this.scale, 10 * this.scale, 0);
    this.ctx.stroke();
};