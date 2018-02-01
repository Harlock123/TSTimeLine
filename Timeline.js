var TimeLine = /** @class */ (function () {
    function TimeLine(element) {
        var _this = this;
        this.numrows = 5;
        this.daysize = 15;
        this.margin = 30;
        this.marginscale = 1.5; // the top margin scalefactor
        this.linecolor = "#000000";
        this.linecolorlight = "#7f7f7f";
        this.TestRender = false;
        this.startdate = new Date();
        this.hoverdate = null;
        this.hoverline = 0;
        // for touch handleing
        this.xDown = null;
        this.yDown = null;
        this.MINDate = new Date();
        this.MAXDate = new Date();
        this.LINEOVER = 0;
        this.DATECLICKEDINFO = null;
        this.DATEHOVEREDINFO = null;
        this.LineLabels = ['LINE 1', 'LINE 2', 'LINE 3', 'LINE 4', 'LINE 5'];
        this.TheLineData = [];
        this.DateClickedEvent = document.createEvent("Event");
        this.DateHoveredEvent = document.createEvent("Event");
        this.Line1 = [];
        this.Line2 = [];
        this.Line3 = [];
        this.Line4 = [];
        this.Line5 = [];
        this.Line6 = [];
        this.Line7 = [];
        this.Line8 = [];
        this.Line9 = [];
        this.Line10 = [];
        this.totwidth = 0;
        this.totheight = 0;
        this.daysacross = 0;
        // Event Handlers
        this.mouseWheelEvent = function (e) {
            var delta = e.wheelDelta ? e.wheelDelta : -e.detail;
            if (delta > 0)
                delta = 7;
            else
                delta = -7;
            _this.startdate = _this.addDays(_this.startdate, delta);
            //console.log("Mouse Wheel");
            _this.FillCanvas();
            return false; // eat the mousewheel
        };
        this.HandleMouseMove = function (ev) {
            if (ev.offsetX >= _this.margin) {
                if ((ev.offsetX - _this.margin) / _this.daysize <= _this.daysacross) {
                    _this.FillCanvas();
                    var ctx = _this.TheCanvas.getContext("2d");
                    ctx.beginPath();
                    ctx.strokeStyle = "#FF0000";
                    ctx.moveTo(ev.offsetX, 0);
                    ctx.lineTo(ev.offsetX, _this.TheCanvas.height);
                    ctx.stroke();
                    ctx.moveTo(0, ev.offsetY);
                    ctx.lineTo(_this.TheCanvas.width, ev.offsetY);
                    ctx.stroke();
                    // figure out what day we are hovering over
                    var doff = Math.floor((ev.offsetX - _this.margin) / _this.daysize);
                    _this.hoverdate = _this.addDays(_this.startdate, doff);
                    var hov = (_this.hoverdate.getMonth() + 1) + "/" + _this.hoverdate.getDate() + "/" + _this.hoverdate.getFullYear();
                    ctx.font = "12px Courier";
                    ctx.fillStyle = "#000000";
                    ctx.fillText(hov, _this.TheCanvas.width - ctx.measureText(hov).width, _this.TheCanvas.height - 2);
                    var innerregionheight = Math.floor(_this.totheight - (_this.margin * 2));
                    var lineover = -1;
                    _this.LINEOVER = -1;
                    for (var cline = 0; cline < _this.numrows; cline++) {
                        var y = (_this.margin * _this.marginscale) + ((innerregionheight / _this.numrows) * cline);
                        if (ev.offsetY >= y && ev.offsetY <= y + _this.daysize) {
                            lineover = cline;
                            _this.LINEOVER = cline;
                            _this.DATECLICKEDINFO = new DATECLICKEDMETADATA(_this.hoverdate, lineover, _this.GetMetaDataAt(lineover + 1, _this.hoverdate));
                            _this.DATEHOVEREDINFO = new DATEHOVEREDMETADATA(_this.hoverdate, lineover, _this.GetMetaDataAt(lineover + 1, _this.hoverdate));
                            _this.TheCanvas.dispatchEvent(_this.DateHoveredEvent);
                            break;
                        }
                    }
                    if (lineover != -1) {
                        _this.TheCanvas.title = _this.GetMetaDataAt(lineover + 1, _this.hoverdate);
                    }
                    else {
                        _this.TheCanvas.title = "";
                    }
                }
                else {
                    _this.DATECLICKEDINFO = null;
                    _this.hoverdate = null;
                    _this.FillCanvas();
                }
            }
            else {
                _this.DATECLICKEDINFO = null;
                _this.FillCanvas();
            }
        };
        this.HandleMouseLeave = function (ev) {
            var ctx = _this.TheCanvas.getContext("2d");
            _this.hoverdate = null;
            _this.FillCanvas();
        };
        this.HandleTouchStart = function (ev) {
            _this.xDown = ev.touches[0].clientX;
            _this.yDown = ev.touches[0].clientY;
        };
        this.HandleTouchMove = function (ev) {
            if (!_this.xDown || !_this.yDown) {
                return;
            }
            var xUp = ev.touches[0].clientX;
            var yUp = ev.touches[0].clientY;
            var xDiff = _this.xDown - xUp;
            var yDiff = _this.yDown - yUp;
            var delta = 0;
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff > 0) {
                    /* left swipe */
                    delta = 1;
                }
                else {
                    /* right swipe */
                    delta = -1;
                }
            }
            else {
                if (yDiff > 0) {
                    /* up swipe */
                }
                else {
                    /* down swipe */
                }
            }
            // handle our delta
            _this.startdate = _this.addDays(_this.startdate, delta);
            //console.log("Mouse Wheel");
            _this.FillCanvas();
            /* reset values */
            _this.xDown = xUp;
            _this.yDown = yUp;
        };
        this.HandleMouseDown = function (ev) {
            if (ev.offsetX >= _this.margin) {
                if ((ev.offsetX - _this.margin) / _this.daysize <= _this.daysacross) {
                    // figure out what day we are hovering over
                    var doff = Math.floor((ev.offsetX - _this.margin) / _this.daysize);
                    //this.hoverdate = this.addDays(this.startdate, doff);
                    var hov = (_this.hoverdate.getMonth() + 1) + "/" + _this.hoverdate.getDate() + "/" + _this.hoverdate.getFullYear();
                    var innerregionheight = Math.floor(_this.totheight - (_this.margin * 2));
                    var lineover = -1;
                    //this.LINEOVER = -1;
                    for (var cline = 0; cline < _this.numrows; cline++) {
                        var y = (_this.margin * _this.marginscale) + ((innerregionheight / _this.numrows) * cline);
                        if (ev.offsetY >= y && ev.offsetY <= y + _this.daysize) {
                            lineover = cline;
                            //this.LINEOVER = cline;
                            _this.DATECLICKEDINFO = new DATECLICKEDMETADATA(_this.hoverdate, lineover, _this.GetMetaDataAt(lineover + 1, _this.hoverdate));
                            _this.TheCanvas.dispatchEvent(_this.DateClickedEvent);
                            break;
                        }
                    }
                }
            }
        };
        this.resizeCanvas = function (ev) {
            _this.resize;
            _this.FillCanvas();
        };
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
    // Support Functions
    TimeLine.prototype.addDays = function (theDate, days) {
        return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
    };
    TimeLine.prototype.resize = function () {
        // Lookup the size the browser is displaying the canvas.
        // Make it visually fill the positioned parent
        this.TheCanvas.style.width = '100%';
        // canvas.style.height = '100%';
        // ...then set the internal size to match
        this.TheCanvas.width = this.TheCanvas.offsetWidth;
        this.TheCanvas.height = this.TheCanvas.offsetHeight;
    };
    TimeLine.prototype.FillCanvas = function () {
        this.resize();
        this.ClearCanvas();
        this.RedrawCanvas();
    };
    TimeLine.prototype.ClearCanvas = function () {
        var ctx = this.TheCanvas.getContext("2d");
        ctx.fillStyle = "#DEF3C9";
        ctx.fillRect(0, 0, this.TheCanvas.width, this.TheCanvas.height);
    };
    TimeLine.prototype.RedrawCanvas = function () {
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
                if (cday == 0 && cline == 0) {
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
    };
    TimeLine.prototype.GetMinimumDate = function () {
        var mindate = this.startdate;
        var index = 0;
        for (index = 0; index < this.TheLineData.length; index++) {
            if (this.TheLineData[index].BeginDate < mindate) {
                mindate = this.TheLineData[index].BeginDate;
            }
        }
        return mindate;
    };
    TimeLine.prototype.GetMaximumDate = function () {
        var maxdate = this.addDays(this.startdate, this.daysacross);
        var index = 0;
        for (index = 0; index < this.TheLineData.length; index++) {
            if (this.TheLineData[index].EndDate < maxdate) {
                maxdate = this.TheLineData[index].EndDate;
            }
        }
        return maxdate;
    };
    TimeLine.prototype.daydiff = function (first, second) {
        return Math.floor((second.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
    };
    // External accessors 
    TimeLine.prototype.GetMetaDataAt = function (TheLineID, TheDate) {
        var result = "";
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
    };
    TimeLine.prototype.SetLineLabel = function (TheLineID, TheLineLabel) {
        this.LineLabels[TheLineID] = TheLineLabel;
        this.ClearCanvas();
        this.RedrawCanvas();
    };
    TimeLine.prototype.GetLineLabel = function (TheLineID) {
        return this.LineLabels[TheLineID];
    };
    TimeLine.prototype.AddDataItem = function (TheData2Add) {
        // lets make sure the enddate is set to 12 pm Midnight startdate 1 second after midnight date before
        TheData2Add.BeginDate.setHours(0, 0, 1, 0);
        TheData2Add.EndDate.setHours(23, 59, 59, 999);
        this.TheLineData.push(TheData2Add);
        this.MINDate = this.GetMinimumDate();
        this.MAXDate = this.GetMaximumDate();
        this.RecreateLineBitmaps();
    };
    TimeLine.prototype.ClearAllDataItems = function () {
        this.TheLineData.length = 0;
        this.MINDate = this.GetMinimumDate();
        this.MAXDate = this.GetMaximumDate();
        this.RecreateLineBitmaps();
    };
    TimeLine.prototype.ClearSpecificLine = function (LINEID) {
        var index = 0;
        for (index = this.TheLineData.length - 1; index > -1; index--) {
            if (this.TheLineData[index].LineID === LINEID) {
                this.TheLineData.splice(index, 1);
            }
        }
        this.MINDate = this.GetMinimumDate();
        this.MAXDate = this.GetMaximumDate();
        this.RecreateLineBitmaps();
    };
    TimeLine.prototype.ClearLineBitmaps = function () {
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
    };
    TimeLine.prototype.RecreateLineBitmaps = function () {
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
    };
    TimeLine.prototype.ClearAllButSpecificLine = function (LINEID) {
        var index = 0;
        for (index = this.TheLineData.length - 1; index > -1; index--) {
            if (this.TheLineData[index].LineID != LINEID) {
                this.TheLineData.splice(index, 1);
            }
        }
        this.MINDate = this.GetMinimumDate();
        this.MAXDate = this.GetMaximumDate();
        this.RecreateLineBitmaps();
    };
    TimeLine.prototype.GetImage = function () {
        var img = this.TheCanvas.toDataURL("image/png");
        img = '<img src="' + img + '"/>';
        return img;
    };
    // Rendering Functions
    TimeLine.prototype.Chicklet_Blank = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_RedBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_RedCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_RedTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_GreenBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_GreenCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#00FF00";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_GreenTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_BlueBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#0000FF";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_BlueCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#0000FF";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_BlueTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_YellowBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_YellowCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FFFF00";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_YellowTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_PurpleBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#B000B0";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_PurpleCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#B000B0";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_PurpleTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_OrangeBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#FFA500";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_OrangeCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FFA500";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_OrangeTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_GoldBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_GoldCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_GoldTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_BlackBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#101010";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolorlight;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_BlackCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#101010";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_BlackTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_WhiteBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#F0F0F0";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_WhiteCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#F0F0F0";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_WhiteTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_GreyBox = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#808080";
        ctx.fillRect(x, y, xs, ys);
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_GreyCircle = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.arc(x + (xs / 2), y + (ys / 2), xs / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#808080";
        ctx.fill();
        ctx.strokeStyle = this.linecolor;
        ctx.strokeRect(x, y, xs, ys);
        ctx.stroke();
    };
    TimeLine.prototype.Chicklet_GreyTriangle = function (ctx, x, y, xs, ys) {
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
    };
    TimeLine.prototype.Chicklet_DogEar = function (ctx, x, y, xs, ys) {
        ctx.beginPath();
        ctx.fillStyle = "#ff99ff";
        ctx.moveTo(x + (xs / 2), y);
        ctx.lineTo(x + xs, y);
        ctx.lineTo(x + xs, y + (ys / 2));
        ctx.lineTo(x + (xs / 2), y);
        ctx.fill();
        //ctx.strokeStyle = this.linecolor;
        //ctx.strokeRect(x, y, xs, ys);
        //ctx.stroke();
    };
    return TimeLine;
}());
var Chicklet_Styles;
(function (Chicklet_Styles) {
    Chicklet_Styles[Chicklet_Styles["Chicklet_RedBox"] = 0] = "Chicklet_RedBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GreenBox"] = 1] = "Chicklet_GreenBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_BlueBox"] = 2] = "Chicklet_BlueBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_YellowBox"] = 3] = "Chicklet_YellowBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_PurpleBox"] = 4] = "Chicklet_PurpleBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_OrangeBox"] = 5] = "Chicklet_OrangeBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GoldBox"] = 6] = "Chicklet_GoldBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_BlackBox"] = 7] = "Chicklet_BlackBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_WhiteBox"] = 8] = "Chicklet_WhiteBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GreyBox"] = 9] = "Chicklet_GreyBox";
    Chicklet_Styles[Chicklet_Styles["Chicklet_RedCircle"] = 10] = "Chicklet_RedCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GreenCircle"] = 11] = "Chicklet_GreenCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_BlueCircle"] = 12] = "Chicklet_BlueCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_YellowCircle"] = 13] = "Chicklet_YellowCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_PurpleCircle"] = 14] = "Chicklet_PurpleCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_OrangeCircle"] = 15] = "Chicklet_OrangeCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GoldCircle"] = 16] = "Chicklet_GoldCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_BlackCircle"] = 17] = "Chicklet_BlackCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_WhiteCircle"] = 18] = "Chicklet_WhiteCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GreyCircle"] = 19] = "Chicklet_GreyCircle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_RedTriangle"] = 20] = "Chicklet_RedTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GreenTriangle"] = 21] = "Chicklet_GreenTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_BlueTriangle"] = 22] = "Chicklet_BlueTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_YellowTriangle"] = 23] = "Chicklet_YellowTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_PurpleTriangle"] = 24] = "Chicklet_PurpleTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_OrangeTriangle"] = 25] = "Chicklet_OrangeTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GoldTriangle"] = 26] = "Chicklet_GoldTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_BlackTriangle"] = 27] = "Chicklet_BlackTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_WhiteTriangle"] = 28] = "Chicklet_WhiteTriangle";
    Chicklet_Styles[Chicklet_Styles["Chicklet_GreyTriangle"] = 29] = "Chicklet_GreyTriangle";
})(Chicklet_Styles || (Chicklet_Styles = {}));
var DATECLICKEDMETADATA = /** @class */ (function () {
    function DATECLICKEDMETADATA(DC, LC, MD) {
        this.DATECLICKED = DC;
        this.LINECLICKED = LC;
        this.METADATA = MD;
    }
    return DATECLICKEDMETADATA;
}());
var DATEHOVEREDMETADATA = /** @class */ (function () {
    function DATEHOVEREDMETADATA(DC, LC, MD) {
        this.DATECLICKED = DC;
        this.LINECLICKED = LC;
        this.METADATA = MD;
    }
    return DATEHOVEREDMETADATA;
}());
var TimeLineDataItem = /** @class */ (function () {
    function TimeLineDataItem(LID, CHICKLET, SD, ED, META) {
        this.LineID = LID;
        this.RenderStyle = CHICKLET;
        this.BeginDate = SD;
        this.EndDate = ED;
        this.MetaData = META;
    }
    return TimeLineDataItem;
}());
var InterpretedLineDataItem = /** @class */ (function () {
    function InterpretedLineDataItem(CHICKLET, mult, META) {
        this.RenderStyle = CHICKLET;
        this.MetaData = META;
        this.Multiple = mult;
    }
    return InterpretedLineDataItem;
}());
//# sourceMappingURL=Timeline.js.map