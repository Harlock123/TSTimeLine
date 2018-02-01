class TimeLine {
    TheCanvas: HTMLCanvasElement;
        
    numrows: number = 5;
    daysize: number = 15;
    margin: number = 30;
    marginscale: number = 1.5; // the top margin scalefactor
    linecolor: string = "#000000";
    linecolorlight: string = "#7f7f7f";
    TestRender: boolean = false;
    startdate: Date = new Date();
    hoverdate: Date = null;
    hoverline: number = 0;

    // for touch handleing
    xDown: number = null;
    yDown: number = null;  


    MINDate: Date = new Date();
    MAXDate: Date = new Date();
    LINEOVER: number = 0;
    DATECLICKEDINFO: DATECLICKEDMETADATA = null;
    DATEHOVEREDINFO: DATEHOVEREDMETADATA = null;

    LineLabels: string[] = ['LINE 1', 'LINE 2', 'LINE 3', 'LINE 4', 'LINE 5'];

    TheLineData: TimeLineDataItem[] = [];

    DateClickedEvent = document.createEvent("Event");
    DateHoveredEvent = document.createEvent("Event");
    
    Line1: number[] = [];
    Line2: number[] = [];
    Line3: number[] = [];
    Line4: number[] = [];
    Line5: number[] = [];
    Line6: number[] = [];
    Line7: number[] = [];
    Line8: number[] = [];
    Line9: number[] = [];
    Line10: number[] = [];
    
    totwidth: number = 0;
    totheight: number = 0;
    daysacross: number = 0;
    
    constructor(element: HTMLCanvasElement) {
        this.TheCanvas = element;
        //this.TheDiv = container;

        // Register an event listener to
        // call the resizeCanvas() function each time 
        // the window is resized.
        window.addEventListener('resize', this.resizeCanvas, false);

        // for everybody else
        this.TheCanvas.addEventListener('mousewheel', this.mouseWheelEvent);

        // For Firefox
        this.TheCanvas.addEventListener('DOMMouseScroll', this.mouseWheelEvent);
        
        // other events

        this.TheCanvas.addEventListener('mousemove', this.HandleMouseMove);

        this.TheCanvas.addEventListener('mouseleave', this.HandleMouseLeave);

        this.TheCanvas.addEventListener('mousedown', this.HandleMouseDown);

        this.TheCanvas.addEventListener('touchstart', this.HandleTouchStart);

        this.TheCanvas.addEventListener('touchmove', this.HandleTouchMove);
        
        this.DateClickedEvent.initEvent('DATECLICKED', true, true);

        this.DateHoveredEvent.initEvent('DATEHOVERED', true, true);

        this.FillCanvas();
        
    }

    // Event Handlers

    mouseWheelEvent = (e) => {
        var delta = e.wheelDelta ? e.wheelDelta : -e.detail;

        if (delta > 0)
            delta = 7;
        else
            delta = -7;

        this.startdate = this.addDays(this.startdate, delta);
        //console.log("Mouse Wheel");
        this.FillCanvas();

        return false; // eat the mousewheel

    }

    HandleMouseMove = (ev: MouseEvent) => {
        
        if (ev.offsetX >= this.margin) {
            if ((ev.offsetX - this.margin) / this.daysize <= this.daysacross) {
                this.FillCanvas();

                var ctx = this.TheCanvas.getContext("2d");

                ctx.beginPath();

                ctx.strokeStyle = "#FF0000";
                ctx.moveTo(ev.offsetX, 0);
                ctx.lineTo(ev.offsetX, this.TheCanvas.height);
                ctx.stroke();
                ctx.moveTo(0, ev.offsetY);
                ctx.lineTo(this.TheCanvas.width, ev.offsetY);
                ctx.stroke();

                // figure out what day we are hovering over

                var doff = Math.floor((ev.offsetX - this.margin) / this.daysize);

                this.hoverdate = this.addDays(this.startdate, doff);

                var hov = (this.hoverdate.getMonth() + 1) + "/" + this.hoverdate.getDate() + "/" + this.hoverdate.getFullYear();

                ctx.font = "12px Courier";
                ctx.fillStyle = "#000000";
                ctx.fillText(hov, this.TheCanvas.width - ctx.measureText(hov).width, this.TheCanvas.height - 2);

                var innerregionheight = Math.floor(this.totheight - (this.margin * 2));

                var lineover = -1;
                this.LINEOVER = -1;

                for (var cline = 0; cline < this.numrows; cline++) {

                    var y = (this.margin * this.marginscale) + ((innerregionheight / this.numrows) * cline);

                    if (ev.offsetY >= y && ev.offsetY <= y + this.daysize) {
                        lineover = cline;
                        this.LINEOVER = cline;

                        this.DATECLICKEDINFO = new DATECLICKEDMETADATA(this.hoverdate, lineover, this.GetMetaDataAt(lineover+1, this.hoverdate));
                        this.DATEHOVEREDINFO = new DATEHOVEREDMETADATA(this.hoverdate, lineover, this.GetMetaDataAt(lineover + 1, this.hoverdate));

                        this.TheCanvas.dispatchEvent(this.DateHoveredEvent);

                        break;
                    }
                   
                }

                if (lineover != -1) {
                    this.TheCanvas.title = this.GetMetaDataAt(lineover + 1, this.hoverdate);
                    
                }
                else {
                    this.TheCanvas.title = "";
                }
            }
            else {
                this.DATECLICKEDINFO = null;
                this.hoverdate = null;
                this.FillCanvas();
            }
        }
        else {
            this.DATECLICKEDINFO = null;
            this.FillCanvas();
            
        }

    }

    HandleMouseLeave = (ev: MouseEvent) => {
        var ctx = this.TheCanvas.getContext("2d");

        this.hoverdate = null;

        this.FillCanvas();
    }

    HandleTouchStart = (ev: TouchEvent) => {
        this.xDown = ev.touches[0].clientX;
        this.yDown = ev.touches[0].clientY;   
    }

    HandleTouchMove = (ev: TouchEvent) => {
        if (!this.xDown || !this.yDown) {
            return;
        }

        var xUp = ev.touches[0].clientX;
        var yUp = ev.touches[0].clientY;

        var xDiff = this.xDown - xUp;
        var yDiff = this.yDown - yUp;

        var delta = 0;
        
        if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
            if (xDiff > 0) {
                /* left swipe */

                delta = 1;


            } else {
                /* right swipe */

                delta = -1;
            }
        } else {
            if (yDiff > 0) {
                /* up swipe */
            } else {
                /* down swipe */
            }
        }

        // handle our delta

        this.startdate = this.addDays(this.startdate, delta);
        //console.log("Mouse Wheel");
        this.FillCanvas();
        
        /* reset values */
        this.xDown = xUp;
        this.yDown = yUp;        

    }

    HandleMouseDown = (ev: MouseEvent) => {
        if (ev.offsetX >= this.margin) {
            if ((ev.offsetX - this.margin) / this.daysize <= this.daysacross) {
                
                // figure out what day we are hovering over

                var doff = Math.floor((ev.offsetX - this.margin) / this.daysize);

                //this.hoverdate = this.addDays(this.startdate, doff);

                var hov = (this.hoverdate.getMonth() + 1) + "/" + this.hoverdate.getDate() + "/" + this.hoverdate.getFullYear();

                var innerregionheight = Math.floor(this.totheight - (this.margin * 2));

                var lineover = -1;
                //this.LINEOVER = -1;

                for (var cline = 0; cline < this.numrows; cline++) {

                    var y = (this.margin * this.marginscale) + ((innerregionheight / this.numrows) * cline);

                    if (ev.offsetY >= y && ev.offsetY <= y + this.daysize) {
                        lineover = cline;
                        //this.LINEOVER = cline;

                        this.DATECLICKEDINFO = new DATECLICKEDMETADATA(this.hoverdate, lineover, this.GetMetaDataAt(lineover + 1, this.hoverdate));
                        
                        this.TheCanvas.dispatchEvent(this.DateClickedEvent);
                                                
                        break;
                    }

                }

            }
            
        }
    
    }

    // Support Functions

    addDays(theDate: Date, days: number) {
    return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
    }

    resize() {
        // Lookup the size the browser is displaying the canvas.
        // Make it visually fill the positioned parent
        
        this.TheCanvas.style.width = '100%';
        // canvas.style.height = '100%';
        // ...then set the internal size to match
        this.TheCanvas.width = this.TheCanvas.offsetWidth;
        this.TheCanvas.height = this.TheCanvas.offsetHeight;

        
    }

    resizeCanvas = (ev: UIEvent) => {
        this.resize;
        this.FillCanvas();
    }

    FillCanvas() {
        
        this.resize();
        this.ClearCanvas();
        this.RedrawCanvas();

    }

    ClearCanvas() {
        var ctx = this.TheCanvas.getContext("2d");
        ctx.fillStyle = "#DEF3C9";
        ctx.fillRect(0, 0, this.TheCanvas.width, this.TheCanvas.height);
    }

    RedrawCanvas() {

        var ctx = this.TheCanvas.getContext("2d");

        this.totwidth = this.TheCanvas.width;
        this.totheight = this.TheCanvas.height;

        this.daysacross = Math.floor((this.totwidth - (this.margin * 2)) / this.daysize);

        var innerregionheight = Math.floor(this.totheight - (this.margin * 2));

        var rday = 0;

        var cmonth = this.startdate.getMonth() + 1;

        for (var cday = 0; cday < this.daysacross; cday++) {
            var x = this.margin + (cday * this.daysize);

            for (var cline = 0; cline < this.numrows; cline++) {

                var y = (this.margin * this.marginscale) + ((innerregionheight / this.numrows) * cline);


                // Lable The StartDate
                if (cday == 0 && cline == 0) {   // we need to display the startdate here

                    var hov = (this.startdate.getMonth() + 1) + "/" + this.startdate.getDate() + "/" + this.startdate.getFullYear();
                    ctx.font = "10px Courier";
                    var wid = (ctx.measureText(hov).width - this.daysize) / 2;

                    ctx.fillStyle = "#000000";
                    ctx.fillText(hov, x - wid, y - 8);

                    ctx.beginPath();
                    ctx.strokeStyle = this.linecolor;
                    ctx.moveTo(x + (this.daysize / 2), y);
                    ctx.lineTo(x + (this.daysize / 2), y - 7);
                    ctx.stroke();
                }

                // Figure out the Day of the MONTH for the current Chicklet...
                // Used in the test rendering piece
                var currentdate = this.addDays(this.startdate, cday);
                rday = currentdate.getDate() - 1;


                // Lable Month Transitions
                if (currentdate.getMonth() + 1 > cmonth && cday > 10 && cline == 0 && currentdate.getDate() == 1) {

                    cmonth = currentdate.getMonth() + 1;

                    var hov = (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + "/" + currentdate.getFullYear();
                    ctx.font = "10px Courier";
                    var wid = (ctx.measureText(hov).width - this.daysize) / 2;

                    ctx.fillStyle = "#000000";
                    ctx.fillText(hov, x - wid, y - 8);

                    ctx.beginPath();
                    ctx.strokeStyle = this.linecolor;
                    ctx.moveTo(x + (this.daysize / 2), y);
                    ctx.lineTo(x + (this.daysize / 2), y - 7);
                    ctx.stroke();

                }

                // Lable Weekends
                if (currentdate.getDay() == 0 || currentdate.getDay() == 6) {

                    ctx.fillStyle = "#BFBFBF";
                    ctx.beginPath();
                    ctx.fillRect(x, y + this.daysize, this.daysize, this.daysize / 3);
                    ctx.stroke();

                }

                if (this.TestRender) {

                    switch (rday) {
                        case 0:
                            this.Chicklet_RedBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 1:
                            this.Chicklet_GreenBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 2:
                            this.Chicklet_BlueBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 3:
                            this.Chicklet_YellowBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 4:
                            this.Chicklet_PurpleBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 5:
                            this.Chicklet_OrangeBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 6:
                            this.Chicklet_GoldBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 7:
                            this.Chicklet_BlackBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 8:
                            this.Chicklet_WhiteBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 9:
                            this.Chicklet_GreyBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 10:
                            this.Chicklet_RedCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 11:
                            this.Chicklet_GreenCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 12:
                            this.Chicklet_BlueCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 13:
                            this.Chicklet_YellowCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 14:
                            this.Chicklet_PurpleCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 15:
                            this.Chicklet_OrangeCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 16:
                            this.Chicklet_GoldCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 17:
                            this.Chicklet_BlackCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 18:
                            this.Chicklet_WhiteCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 19:
                            this.Chicklet_GreyCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 20:
                            this.Chicklet_RedTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 21:
                            this.Chicklet_GreenTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 22:
                            this.Chicklet_BlueTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 23:
                            this.Chicklet_YellowTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 24:
                            this.Chicklet_PurpleTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 25:
                            this.Chicklet_OrangeTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 26:
                            this.Chicklet_GoldTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 27:
                            this.Chicklet_BlackTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 28:
                            this.Chicklet_WhiteTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 29:
                            this.Chicklet_GreyTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        default:
                            this.Chicklet_Blank(ctx, x, y, this.daysize, this.daysize);
                            break;
                    }
                }
                else {

                    var doff = this.daydiff(this.MINDate, currentdate);

                    var rd = undefined;

                    switch (cline) {
                        case 0:
                            rd = this.Line1[doff];
                            break;
                        case 1:
                            rd = this.Line2[doff];
                            break;
                        case 2:
                            rd = this.Line3[doff];
                            break;
                        case 3:
                            rd = this.Line4[doff];
                            break;
                        case 4:
                            rd = this.Line5[doff];
                            break;
                        case 5:
                            rd = this.Line6[doff];
                            break;
                        case 6:
                            rd = this.Line7[doff];
                            break;
                        case 7:
                            rd = this.Line8[doff];
                            break;
                        case 8:
                            rd = this.Line9[doff];
                            break;
                        case 9:
                            rd = this.Line10[doff];
                            break;
                        default:
                            rd = undefined;
                            break;
                    }

                    var dogear = false;

                    if (rd > 99) {
                        dogear = true;
                        rd = rd - 100;
                    }

                    switch (rd) {
                        case 0:
                            this.Chicklet_RedBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 1:
                            this.Chicklet_GreenBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 2:
                            this.Chicklet_BlueBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 3:
                            this.Chicklet_YellowBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 4:
                            this.Chicklet_PurpleBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 5:
                            this.Chicklet_OrangeBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 6:
                            this.Chicklet_GoldBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 7:
                            this.Chicklet_BlackBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 8:
                            this.Chicklet_WhiteBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 9:
                            this.Chicklet_GreyBox(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 10:
                            this.Chicklet_RedCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 11:
                            this.Chicklet_GreenCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 12:
                            this.Chicklet_BlueCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 13:
                            this.Chicklet_YellowCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 14:
                            this.Chicklet_PurpleCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 15:
                            this.Chicklet_OrangeCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 16:
                            this.Chicklet_GoldCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 17:
                            this.Chicklet_BlackCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 18:
                            this.Chicklet_WhiteCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 19:
                            this.Chicklet_GreyCircle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 20:
                            this.Chicklet_RedTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 21:
                            this.Chicklet_GreenTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 22:
                            this.Chicklet_BlueTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 23:
                            this.Chicklet_YellowTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 24:
                            this.Chicklet_PurpleTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 25:
                            this.Chicklet_OrangeTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 26:
                            this.Chicklet_GoldTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 27:
                            this.Chicklet_BlackTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 28:
                            this.Chicklet_WhiteTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        case 29:
                            this.Chicklet_GreyTriangle(ctx, x, y, this.daysize, this.daysize);
                            break;
                        default:
                            this.Chicklet_Blank(ctx, x, y, this.daysize, this.daysize);
                            break;
                    }

                    if (dogear) {
                        this.Chicklet_DogEar(ctx, x, y, this.daysize, this.daysize);
                    }

                    //ctx.beginPath();
                    //ctx.strokeStyle = this.linecolor;
                    //ctx.strokeRect(x, y, this.daysize, this.daysize);
                    //ctx.stroke();
                }
            }

        }

        // Now Label each line


        var x = this.margin;

        for (var cline = 0; cline < this.numrows; cline++) {

            var y = (this.margin * this.marginscale) + ((innerregionheight / this.numrows) * cline);

            ctx.beginPath();

            ctx.font = "11px Courier";

            var s = this.LineLabels[cline] + "";

            ctx.fillStyle = "#000000";

            ctx.fillText(s, x, y + this.daysize + 10);

            ctx.stroke();

        }

    }

    GetMinimumDate() {
        var mindate: Date = this.startdate;
        var index = 0;


        for (index = 0; index < this.TheLineData.length; index++) {
            if (this.TheLineData[index].BeginDate < mindate) {
                mindate = this.TheLineData[index].BeginDate;
            }
        }

        return mindate;

    }

    GetMaximumDate() {
        var maxdate: Date = this.addDays(this.startdate, this.daysacross);
        var index = 0;


        for (index = 0; index < this.TheLineData.length; index++) {
            if (this.TheLineData[index].EndDate < maxdate) {
                maxdate = this.TheLineData[index].EndDate;
            }
        }

        return maxdate;

    }

    daydiff(first : Date, second : Date) {
    return Math.floor((second.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
}

    // External accessors 

    GetMetaDataAt(TheLineID: number, TheDate: Date) {
        var result: string = "";

        var index = 0;

        for (index = 0; index < this.TheLineData.length; index++) {
            if (this.TheLineData[index].BeginDate <= TheDate &&
                this.TheLineData[index].EndDate >= TheDate &&
                this.TheLineData[index].LineID == TheLineID) {

                if (result != "")
                    result += "\n" + this.TheLineData[index].MetaData;
                else
                    result += this.TheLineData[index].MetaData;

            }
        }
        return result;
    }

    SetLineLabel(TheLineID: number, TheLineLabel: string) {
        this.LineLabels[TheLineID] = TheLineLabel;

        this.ClearCanvas();

        this.RedrawCanvas();
    }

    GetLineLabel(TheLineID: number) {
        return this.LineLabels[TheLineID];
    }

    AddDataItem(TheData2Add: TimeLineDataItem) {

        // lets make sure the enddate is set to 12 pm Midnight startdate 1 second after midnight date before

        TheData2Add.BeginDate.setHours(0, 0, 1, 0);

        TheData2Add.EndDate.setHours(23, 59, 59, 999);
        
        this.TheLineData.push(TheData2Add);

        this.MINDate = this.GetMinimumDate();
        this.MAXDate = this.GetMaximumDate();

        this.RecreateLineBitmaps();
        
    }

    ClearAllDataItems() {
        this.TheLineData.length = 0;

        this.MINDate = this.GetMinimumDate();
        this.MAXDate = this.GetMaximumDate();

        this.RecreateLineBitmaps();
        
    }

    ClearSpecificLine(LINEID: number) {
        var index = 0;
        
        for (index = this.TheLineData.length - 1; index > -1; index--) {
            if (this.TheLineData[index].LineID === LINEID) {
                this.TheLineData.splice(index, 1);
            }
        }

        this.MINDate = this.GetMinimumDate();
        this.MAXDate = this.GetMaximumDate();

        this.RecreateLineBitmaps();
    }

    ClearLineBitmaps() {
        this.Line1.length = 0;
        this.Line1.length = 0;
        this.Line3.length = 0;
        this.Line4.length = 0;
        this.Line5.length = 0;
        this.Line6.length = 0;
        this.Line7.length = 0;
        this.Line8.length = 0;
        this.Line9.length = 0;
        this.Line10.length = 0;

        var SPAN = this.daydiff(this.MINDate, this.MAXDate);

        this.Line1 = new Array(SPAN);
        this.Line2 = new Array(SPAN);
        this.Line3 = new Array(SPAN);
        this.Line4 = new Array(SPAN);
        this.Line5 = new Array(SPAN);
        this.Line6 = new Array(SPAN);
        this.Line7 = new Array(SPAN);
        this.Line8 = new Array(SPAN);
        this.Line9 = new Array(SPAN);
        this.Line10 = new Array(SPAN);

    }

    RecreateLineBitmaps() {

        this.ClearLineBitmaps();

        var index = 0;

        for (index = 0; index < this.TheLineData.length; index++) {
            var offset1 = this.daydiff(this.MINDate, this.TheLineData[index].BeginDate) + 1;
            var offset2 = this.daydiff(this.MINDate, this.TheLineData[index].EndDate);

            var i = offset1;

            var Renderstyle = this.TheLineData[index].RenderStyle;

            for (i = offset1; i <= offset2; i++) {
                switch (this.TheLineData[index].LineID) {
                    case 1:
                        if (this.Line1[i] === undefined)
                            this.Line1[i] = Renderstyle;
                        else
                            this.Line1[i] = Renderstyle + 100;
                        break;
                    case 2:
                        if (this.Line2[i] === undefined)
                            this.Line2[i] = Renderstyle;
                        else
                            this.Line2[i] = Renderstyle + 100;
                        break;
                    case 3:
                        if (this.Line3[i] === undefined)
                            this.Line3[i] = Renderstyle;
                        else
                            this.Line3[i] = Renderstyle + 100;
                        break;
                    case 4:
                        if (this.Line4[i] === undefined)
                            this.Line4[i] = Renderstyle;
                        else
                            this.Line4[i] = Renderstyle + 100;
                        break;
                    case 5:
                        if (this.Line5[i] === undefined)
                            this.Line5[i] = Renderstyle;
                        else
                            this.Line5[i] = Renderstyle + 100;
                        break;
                    case 6:
                        if (this.Line6[i] === undefined)
                            this.Line6[i] = Renderstyle;
                        else
                            this.Line6[i] = Renderstyle + 100;
                        break;
                    case 7:
                        if (this.Line7[i] === undefined)
                            this.Line7[i] = Renderstyle;
                        else
                            this.Line7[i] = Renderstyle + 100;
                        break;
                    case 8:
                        if (this.Line8[i] === undefined)
                            this.Line8[i] = Renderstyle;
                        else
                            this.Line8[i] = Renderstyle + 100;
                        break;
                    case 9:
                        if (this.Line9[i] === undefined)
                            this.Line9[i] = Renderstyle;
                        else
                            this.Line9[i] = Renderstyle + 100;
                        break;
                    case 10:
                        if (this.Line10[i] === undefined)
                            this.Line10[i] = Renderstyle;
                        else
                            this.Line10[i] = Renderstyle + 100;
                        break;
                    default:
                        break;
                }
            }
        }
    }

    ClearAllButSpecificLine(LINEID: number) {
        var index = 0;

        for (index = this.TheLineData.length - 1; index > -1; index--) {
            if (this.TheLineData[index].LineID != LINEID) {
                this.TheLineData.splice(index, 1);
            }
        }

        this.MINDate = this.GetMinimumDate();
        this.MAXDate = this.GetMaximumDate();

        this.RecreateLineBitmaps();
    }

    GetImage() {
        var img = this.TheCanvas.toDataURL("image/png");

        img = '<img src="' + img + '"/>';
        return img;
    }

    // Rendering Functions

    Chicklet_Blank(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_RedBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_RedCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_RedTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#FF0000";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_GreenBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_GreenCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#00FF00";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_GreenTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#00FF00";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_BlueBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#0000FF";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_BlueCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#0000FF";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_BlueTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#0000FF";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_YellowBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_YellowCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FFFF00";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_YellowTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#FFFF00";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_PurpleBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#B000B0";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_PurpleCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#B000B0";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_PurpleTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#B000B0";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_OrangeBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#FFA500";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_OrangeCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FFA500";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_OrangeTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#FFA500";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_GoldBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_GoldCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_GoldTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#FFD700";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_BlackBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#101010";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolorlight;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_BlackCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#101010";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_BlackTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#101010";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_WhiteBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#F0F0F0";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_WhiteCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#F0F0F0";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_WhiteTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#F0F0F0";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_GreyBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#808080";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_GreyCircle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#808080";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();

    }

    Chicklet_GreyTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#808080";
        ctx.moveTo(x, y + ys);
        ctx.lineTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y + ys);
        ctx.lineTo(x, y + ys);
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    }

    Chicklet_DogEar(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
        ctx.beginPath();
        ctx.fillStyle = "#ff99ff";
        ctx.moveTo(x + (xs/2), y);
        ctx.lineTo(x + xs, y);
        ctx.lineTo(x + xs, y + (ys/2));
        ctx.lineTo(x + (xs/2), y);
        ctx.fill();
        //ctx.strokeStyle = this.linecolor;
        //ctx.strokeRect(x, y, xs, ys);
        //ctx.stroke();
    }
 
}


enum Chicklet_Styles {
    Chicklet_RedBox,
    Chicklet_GreenBox,
    Chicklet_BlueBox,
    Chicklet_YellowBox,
    Chicklet_PurpleBox,
    Chicklet_OrangeBox,
    Chicklet_GoldBox,
    Chicklet_BlackBox,
    Chicklet_WhiteBox,
    Chicklet_GreyBox,
    Chicklet_RedCircle,
    Chicklet_GreenCircle,
    Chicklet_BlueCircle,
    Chicklet_YellowCircle,
    Chicklet_PurpleCircle,
    Chicklet_OrangeCircle,
    Chicklet_GoldCircle,
    Chicklet_BlackCircle,
    Chicklet_WhiteCircle,
    Chicklet_GreyCircle,
    Chicklet_RedTriangle,
    Chicklet_GreenTriangle,
    Chicklet_BlueTriangle,
    Chicklet_YellowTriangle,
    Chicklet_PurpleTriangle,
    Chicklet_OrangeTriangle,
    Chicklet_GoldTriangle,
    Chicklet_BlackTriangle,
    Chicklet_WhiteTriangle,
    Chicklet_GreyTriangle
}

class DATECLICKEDMETADATA {
    DATECLICKED: Date;
    LINECLICKED: Number;
    METADATA: string;

    constructor(DC: Date, LC: number, MD: string) {
        this.DATECLICKED = DC;
        this.LINECLICKED = LC;
        this.METADATA = MD;

    }
}

class DATEHOVEREDMETADATA {
    DATECLICKED: Date;
    LINECLICKED: Number;
    METADATA: string;

    constructor(DC: Date, LC: number, MD: string) {
        this.DATECLICKED = DC;
        this.LINECLICKED = LC;
        this.METADATA = MD;

    }
}

class TimeLineDataItem {
    LineID: number;
    RenderStyle: Chicklet_Styles;
    BeginDate: Date;
    EndDate: Date;
    MetaData: String;

    constructor(LID: number, CHICKLET: Chicklet_Styles, SD: Date, ED: Date, META: string) {
        this.LineID = LID;
        this.RenderStyle = CHICKLET;
        this.BeginDate = SD;
        this.EndDate = ED;
        this.MetaData = META;
        
    }
}

class InterpretedLineDataItem {
    RenderStyle: Chicklet_Styles;
    Multiple: boolean;
    MetaData: string;

    constructor(CHICKLET: Chicklet_Styles, mult: boolean, META: string) {
        this.RenderStyle = CHICKLET;        
        this.MetaData = META;
        this.Multiple = mult;
    }
}