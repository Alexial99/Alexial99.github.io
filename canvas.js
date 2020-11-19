const css = `#myCanvas{ background:blue}
.coordinateHint{
    border-radius: 4px;
    padding: 3px;
    background: aliceblue;
    position: fixed;
}
.center{
    text-align: center;
}
.pointHints{
    position: fixed;
    height: 10px;
    width: 10px;
    border-radius:50% ;
    border-style:none ;
}
.scrollbar{

    height:20px;
    align-content:center;
}

/* Track */
.scrollbar-track {
position:absolute;
    display: flex;
    align-items: center;
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
}

/* Handle */
.scrollbar-thumb {
    height: 20px;
    background: grey;
    border-radius: 10px;
}

/* Handle on hover */
.scrollbar-thumb:hover {
    background: rgba(100,100,100,1);
}
`;
let self;

class Chart {
    constructor(axisNameX, axisNameY, coordinates, colorLine, id, size, showAxisValues) {
        this.axisNameX = axisNameX;
        this.axisNameY = axisNameY;
        this.coordinates = coordinates;
        this.colorLine = colorLine;
        this.id = id;
        this.width = size;
        this.height = size;
        this.showAxisValues = showAxisValues;
        self = this;
        this.createCanvas();
    }

    createCanvas() {
        let head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
        head.appendChild(style);
        style.appendChild(document.createTextNode(css));

        let element = document.getElementById(this.id);
        let canvasDiv = document.createElement("div");
        element.append(canvasDiv);
        canvasDiv.innerHTML = ` <canvas id="canvasOn${this.id[0].toUpperCase() + this.id.slice(1)}" height="${this.height} " width="${this.width}"> </canvas> `;
        let canvas = document.getElementById("canvasOn" + (this.id[0].toUpperCase() + this.id.slice(1)));
        let elementInitialCoordinates = this.rotateCanvas(canvas);
        this.createChart(canvas, elementInitialCoordinates);
        let scrollDiv = document.createElement('div');
        scrollDiv.id = 'scrollbar';
        scrollDiv.classList.add('scrollbar');
        element.append(scrollDiv);

        window.addEventListener('scroll', (e)=>{
            let canvasT = canvas.getBoundingClientRect().top;
            let canvasL = canvas.getBoundingClientRect().left;
            canvas.thisParam[1] = [canvasT, canvasL];
        })
    }

    scalingCanvas() {
        let sizeGapOgAxis = 50;
        let width = sizeGapOgAxis * Math.floor((this.width - 36) / sizeGapOgAxis);
        let height = sizeGapOgAxis * Math.floor((this.height - 36) / sizeGapOgAxis);
        let allArray = [];

        for (let key in this.coordinates) {
            allArray = allArray.concat(this.coordinates[key]);
        }

        let maxCoordinateY = maxNumberOfArr(1);

        function maxNumberOfArr(axis) {
            let number = 0;
            for (let i=0;i < allArray.length;i++){    //let subarray of arrTwo
                let subArr=allArray[i];            // for (let subArr of allArray) {
                if (number < Number(subArr[axis])) {
                    number = Number(subArr[axis]);
                }
            }
            return number;
        }

     /*   function minNumberOfArr(axis) {
            let number = 0;
            for (let i=0;i < allArray.length;i++){    //let subarray of arrTwo
                let subArr=allArray[i];
                if (number > Number(subArr[axis]) && (Number(subArr[axis]) !== 0)) {
                    number = Number(subArr[axis]);
                }
            }
            return number;
        }*/

        function sortAscending(left, right) {
            if (left[0] < right[0]) {
                return -1;
            }
            if (right[0] < left[0]) {
                return 1;
            }
            if (left[1] < right[1]) {
                return -1;
            }
            if (right[1] < left[1]) {
                return 1;
            }
            return 0;
        }


        function getArrayExtremum(array){
            let arrayThis=[];
            let elem= array[0][1];
            arrayThis.push(array[0]);
            let sign;

            for(let i =1;i < array.length;i++){
                let nextSign;
                if((allArray[i][1]-elem)>=0){
                    nextSign=1;
                }else{nextSign=0;}

                if(i==1){sign = nextSign;}

                if ((sign!=nextSign) ||(i == allArray.length - 1)) {
                    arrayThis.push(allArray[i]);
                }
                elem = allArray[i][1];
                sign = nextSign;
            }

            //extremumArray.push(arrayThis);
            return arrayThis;
        }


        let maxXArray=[];
        //let extremumArray=[];
        let arrCoordinates = Object.assign(this.coordinates);

        for (let key in arrCoordinates) {
            let thisData=arrCoordinates[key].sort(sortAscending);
            maxXArray.push(arrCoordinates[key][arrCoordinates[key].length-1]);
            let extremumArray= getArrayExtremum(arrCoordinates[key]);
            arrCoordinates[key]={data:thisData,arc:extremumArray };
          //  console.log(arrCoordinates[key]);
        }
        //console.log(extremumArray);
        maxXArray.sort(sortAscending);
        let maxCoordinateX =maxXArray[maxXArray.length-1][0];


        let scalingFactorX = scaleOfAxis(width, maxCoordinateX);
        let scalingFactorY = scaleOfAxis(height, maxCoordinateY);

        function scaleOfAxis(axis, maxCoordinate) {
            if (axis - 21 < maxCoordinate) {
                let x = maxCoordinate / (axis - 21);
                if ((String(x).slice(String(x).indexOf('.') + 1, String(x).indexOf('.') + 2)) < 5) {
                    x = Number(Math.trunc(x) + "." + 5);
                   // console.log(x);
                } else {
                    x = Math.ceil(x);


                }
                return 1 / x;
            } else if ((axis - 21 > maxCoordinate) && (((axis - 21) / maxCoordinate) > 1.5)) {
                let x = (axis - 21) / maxCoordinate;
                if ((String(x).slice(String(x).indexOf('.') + 1, String(x).indexOf('.') + 2)) < 5) {
                    x = Number(Math.trunc(x) + "." + 5);
                } else {
                    x = Number(x.toFixed(1));
                }
                return x;
            } else {
                return 1;
            }
        }
        console.log(maxCoordinateX);
//console.log( [scalingFactorX, scalingFactorY, sizeGapOgAxis, [maxCoordinateX, maxCoordinateY], width, [], arrCoordinates]);
        return [scalingFactorX, scalingFactorY, sizeGapOgAxis, [maxCoordinateX, maxCoordinateY], width, [], arrCoordinates];
    }


    createChart(canvas, elementInitialCoordinates) {
        let scalingWheel = 1;
        let ctx = canvas.getContext('2d');
        let scaling = this.scalingCanvas();
        let min = this.axisDrawing(ctx, canvas, scaling, scalingWheel, 0);
        ctx.beginPath();

        let scale = scaling[1];
        scaling[8] = min[2];
        scaling[7] = min[4];
        let coordinates = scaling[6];
        for (let key in coordinates) {
           // console.log([coordinates[key].data,coordinates[key].arc]);
            this.lineDrawing(coordinates[key].data, canvas, elementInitialCoordinates, ctx, this.colorLine[key], scaling, scalingWheel, scale,coordinates[key].arc);
        }
    }

    axisDrawing(ctx, canvas, scaling, scalingWheel, k = 0) {

        let sizeOfInterval = scaling[2];
        let numberDivisionsX = Math.floor((this.width - 36) / sizeOfInterval);
        let numberDivisionsY = Math.floor((this.height - 36) / sizeOfInterval);
        ctx.beginPath();

        ctx.font = "14px serif";
        ctx.fillText(this.axisNameY, -50 + this.width, 12, 50);

        ctx.rotate(90 * Math.PI / 180);
        ctx.fillText(this.axisNameX, -55 + this.width, -2, 50);
        ctx.strokeStyle = 'black';
        ctx.rotate(-90 * Math.PI / 180);
        ctx.lineWidth = 1;
        ctx.moveTo(36, 35);
        ctx.lineTo(36, sizeOfInterval * numberDivisionsX + 36);
        ctx.moveTo(35, 36);
        ctx.lineTo(sizeOfInterval * numberDivisionsY + 36, 36);
        ctx.stroke();
        let point = [];
        divisionsDrawing(numberDivisionsX, ctx, "x", this.showAxisValues, scaling);
        divisionsDrawing(numberDivisionsY, ctx, "y", this.showAxisValues, scaling);

        function divisionsDrawing(number, ctx, axis, showAxisValues, scaling) {
            ctx.beginPath();
            let i = 0;
            let axisCoordinate = 0;

            function ctxFillText(axisCoordinate,scaling,scalingWheel=1,k=0) {
                let nameY;
                let axis =Math.round((axisCoordinate +k)/ scaling/scalingWheel);
                //alert (axis);
                if ((axis>=10000)&&(axis<1000000)){
                    nameY= String(axis).slice(0,String(axis).length-3)+"K";
                }
                else if((axis>=1000000)&&(axis<1000000000)){
                    nameY= String(axis).slice(0,String(axis).length-6)+"M";
                }
                else if(axis>=1000000000){
                    nameY= String(axis).slice(0,String(axis).length-9)+"B";
                }
                else {
                    nameY=String(axis);
                }
                return nameY;
            }
            while (i < number) {
                ctx.beginPath();
                i++;
                axisCoordinate = axisCoordinate + sizeOfInterval;



                if (axis === "y") {
                    ctx.moveTo(axisCoordinate + 35, 32);
                    ctx.lineTo(axisCoordinate + 35, 40);
                    let nameY = ctxFillText(axisCoordinate,scaling[1]);

                    if ((showAxisValues)) {
                        ctx.fillText(nameY, 6 + axisCoordinate + 19, 28, 50);

                    }
                } else {
                    ctx.moveTo(32, axisCoordinate + 35);
                    ctx.lineTo(40, axisCoordinate + 35);
                    if(i==1){point=(Math.round((axisCoordinate+k) / scaling[0] / scalingWheel));}

                    if ((showAxisValues)) {

                        ctx.rotate(90 * Math.PI / 180);
                        let nameX = ctxFillText(axisCoordinate,scaling[0],scalingWheel,k);

                        ctx.fillText(nameX,6 + axisCoordinate + 19, -18, 50
                        );
                        ctx.rotate(-90 * Math.PI / 180);
                    }
                }

                ctx.stroke();

            }

        }

        return [scaling[2], [numberDivisionsX, numberDivisionsY], point, scalingWheel, k]
    }

    rotateCanvas(canvas) {
        let canvasT = canvas.getBoundingClientRect().top;
        let canvasL = canvas.getBoundingClientRect().left;
        canvas.style.transform = 'rotate(-90deg)';
        return [canvasT, canvasL];
    }

    scrollHandler(){

    }

    lineDrawing(arr, canvas, elementInitialCoordinates, ctx, color, scaling, scalingWheel, scale,arrayArc) {
        //console.log(arr);
        ctx.beginPath();
        //ctx.moveTo(Number(arr[0][1] * scaling[1] + 37), Number(arr[0][0] * scalingWheel * scaling[0] + 37));
        ctx.strokeStyle = color;
     // console.log(arr[0][0]);
        ctx.arc(Number(arr[0][1] * scaling[1] + 37), Number(arr[0][0] * scaling[0] * scalingWheel + 37), 2, 0, Math.PI * 2, true);

        let arrTwo = arr.slice(0, arr.length);
        let i;
        for (i=0;i < arrTwo.length-1;i++){    //let subarray of arrTwo
            let subarrayMoveTo=arrTwo[i];

            let subarray=arrTwo[i+1];
            ctx.beginPath();
            ctx.moveTo(Number(subarrayMoveTo[1] * scaling[1] + 37), Number(subarrayMoveTo[0] * scalingWheel * scaling[0] + 37));

            ctx.lineTo(Number(subarray[1] * scaling[1] + 37), Number(subarray[0] * scalingWheel * scaling[0] + 37));
           //  ctx.arc(Number(subarray[1] * scaling[1] + 37), Number(subarray[0] * scalingWheel * scaling[0] + 37), 2, 0, Math.PI * 2, true);
            for(let j=1;j< arrayArc.length;j++){
                if (subarray===arrayArc[j]){
                    ctx.beginPath();
                    ctx.arc(Number(subarray[1] * scaling[1] + 37), Number(subarray[0] * scalingWheel * scaling[0] + 37), 2, 0, Math.PI * 2, true);
                    ctx.stroke();
                }
            }
         //   if(i==arrTwo.length-1){alert([subarray,arrayArc[arrayArc.length-1]]);}
            /*ctx.beginPath();
            ctx.arc(Number(subarray[1] * scaling[1] + 37), Number(subarray[0] * scalingWheel * scaling[0] + 37), 2, 0, Math.PI * 2, true);
           */
            ctx.stroke();
        }

        ctx.stroke();
        canvas.thisParam = [canvas, elementInitialCoordinates, scaling, scalingWheel, scale];
        canvas.onmousemove = this.newHitHandler;
        canvas.onmousewheel = this.scalingPath;

    }

    createScrollbar(width, thumbWidth, left, thisData) {
        let element = document.getElementById("scrollbar");
        element.innerHTML = " <div id='track" + self.id[0].toUpperCase() + self.id.slice(1) + "' class='scrollbar-track' style='width:" + width + "px; left:" + (left + 36) + "px;'><button id='scrollButton' class='scrollbar-thumb' style='width:" + thumbWidth + "px;position: relative;left=1px'></button></div>";
        let scrollButton = document.getElementById("scrollButton");
        scrollButton.thisParam = [thisData];
        scrollButton.onmousedown = this.moveButton;
        window.addEventListener("resize", event => {
            let elem = document.getElementById(`canvasOn${self.id[0].toUpperCase() + self.id.slice(1)}`);
            let elemScroll = document.getElementById(`track${self.id[0].toUpperCase() + self.id.slice(1)}`);

            elemScroll.style.left = `${elem.getBoundingClientRect().left + 36}px`;
        })
    }

    moveButton(e) {
        window.onmouseup = close;
        e.target.onmousemove = getCoordinateX;

        let slider = document.getElementById(`track${self.id[0].toUpperCase() + self.id.slice(1)}`);
        let item = e.target;
        let sliderClientCoords = slider.getBoundingClientRect();
        let sliderCoords = {};
        sliderCoords.top = sliderClientCoords.top + pageYOffset;
        sliderCoords.left = sliderClientCoords.left + pageXOffset;

        let itemClientCoords = item.getBoundingClientRect();
        let itemCoords = {};
        itemCoords.top = itemClientCoords.top + pageYOffset;
        itemCoords.left = itemClientCoords.left + pageXOffset;
        let right = slider.offsetWidth - item.offsetWidth;
        let shiftX = e.pageX - itemCoords.left;

        function close() {
            e.target.onmousemove -= getCoordinateX;
            window.onmouseup -= this;
        }

        function getCoordinateX(e) {

            let newLeft = e.pageX - sliderCoords.left - shiftX;
            if (newLeft < 0) newLeft = 0;
            if (newLeft > right) newLeft = right;
            item.style.left = newLeft + 'px';
            e.target.thisParam[1] = Math.round(newLeft / right * 100); //процент прокрутки.

            let thisData = e.target.thisParam[0];
            let scaling = thisData[3], canvas = thisData[0], elementInitialCoordinates = thisData[2];
            let scale = thisData[4], ctx = thisData[1], maxNumberOfArr = scaling[3];
            let scalingWheel=canvas.thisParam[3];
            let k = maxNumberOfArr[0] * scaling[0]*scalingWheel / 100 * e.target.thisParam[1];
            scaling[7] = k;
           // ctx.clearRect(0, 0, maxNumberOfArr[1] * scaling[1] + 100, maxNumberOfArr[0] * scaling[0] * scale + 100);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let rectSize = self.axisDrawing(ctx, canvas, scaling, scale, k);
            ctx.save();
            ctx.rect(36, 36, rectSize[1][0] * rectSize[0], rectSize[1][1] * rectSize[0]);
            ctx.clip();
            ctx.fillStyle = 'black';
            ctx.translate(0, -k);

            let coordinates = scaling[6];
            for (let key in coordinates) {
                self.lineDrawing(coordinates[key].data, canvas, elementInitialCoordinates, ctx, self.colorLine[key], scaling, scale, scale,coordinates[key].arc);
            }

            ctx.translate(0, k);
            ctx.restore();
        }

    }

    scalingPath(e) {


        let canvas = e.target.thisParam[0];
        let ctx = canvas.getContext('2d');
        let elementInitialCoordinates = e.target.thisParam[1];
        let scaling = e.target.thisParam[2];
        let scale = e.target.thisParam[4];

        // wheelDelta не даёт возможность узнать количество пикселей
        let delta = e.deltaY || e.detail || e.wheelDelta;

        document.getElementById(this.id);

        if (delta > 0) {
            if (scale - 0.05 > 0.8) {
                scale -= 0.05;
            }
        } else scale += 0.05;

        if (scaling[8] > 1) {

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            self.axisDrawing(ctx, canvas, scaling, scale);
            ctx.fillStyle = 'black';

            let coordinates = scaling[6];
            for (let key in coordinates) {
                self.lineDrawing(coordinates[key].data, canvas, elementInitialCoordinates, ctx, self.colorLine[key], scaling, scale, scale,coordinates[key].arc);
            }
            let widthThumb;
            if (scale < 1.5) {
                widthThumb = scaling[4] / 1.5;
            } else if ((scale => 1.5) && (scale < 2)) {
                widthThumb = scaling[4] / 2;
            } else if ((scale => 2) && (scale < 2.5)) {
                widthThumb = scaling[4] / 3;
            } else if ((scale => 2.5) && (scale < 3)) {
                widthThumb = scaling[4] / 4;
            } else {
                widthThumb = scaling[4] / 5;
            }

            self.createScrollbar(scaling[4], widthThumb, elementInitialCoordinates[1], [canvas, ctx, elementInitialCoordinates, scaling, scale]);
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
        }

    }


    newHitHandler(event) {
        let canvas = event.target.thisParam[0];
        let ctx = canvas.getContext('2d');
        let elementInitialCoordinates = event.target.thisParam[1];
        let scaling = event.target.thisParam[2];

        let canvasT = canvas.getBoundingClientRect().top;
        let canvasL = canvas.getBoundingClientRect().left;

        let canvasX, canvasY;
        canvasX = event.clientX - elementInitialCoordinates[1];
        canvasY = event.clientY - elementInitialCoordinates[0];
        let canvasYElemPage = canvasX;
        canvasX = canvasY;
        let canvasXElemPage = this.height - canvasX;
        let coordinates = scaling[6];

        for (let key in coordinates) {
            for (let i=0;i < coordinates[key].data.length;i++){    //let subarray of arrTwo
                let subarray=coordinates[key].data[i];                    //for (let subarray of coordinates[key]) {

                if (((Number(subarray[1] * scaling[1] + 37) - 1.5) <= Number(canvasXElemPage))
                    && (Number(canvasXElemPage) <= (Number(subarray[1] * scaling[1] + 37) + 1.5))) {
                    if (((Number(subarray[0] * event.target.thisParam[3] * scaling[0] + 37) - 1.5) <= canvasYElemPage + scaling[7])
                        && (canvasYElemPage + scaling[7] <= (Number(subarray[0] * event.target.thisParam[3] * scaling[0] + 37 + 1.5)))) {

                        let point = document.createElement('div');
                        point.className = "pointHints";
                        point.style.left = (event.clientX - 6) + "px";
                        point.style.top = (event.clientY - 6) + "px";
                        canvas.after(point);

                        let span = document.createElement('span');
                        span.className = "coordinateHint";
                        span.style.left = (event.clientX + 5) + "px";
                        span.style.top = (event.clientY + 5) + "px";
                        span.innerHTML = " ( " + subarray[0] + "," + subarray[1] + " )  ";
                        canvas.after(span);

                        point.onmouseout = deleteFunc;

                        function deleteFunc() {
                            setTimeout(() => span.remove(), 500);
                            point.remove();
                        }
                    }
                }
            }
        }
    }

}
