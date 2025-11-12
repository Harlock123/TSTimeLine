# Timeline.ts - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Class Structure](#class-structure)
4. [Data Structures](#data-structures)
5. [Rendering Pipeline](#rendering-pipeline)
6. [Event System](#event-system)
7. [Internal Algorithms](#internal-algorithms)
8. [Public API](#public-api)
9. [Performance Considerations](#performance-considerations)
10. [Code Quality & Technical Debt](#code-quality--technical-debt)

---

## Overview

### Purpose
Timeline.ts implements a multi-row, date-based visualization control using HTML5 Canvas. It displays temporal data across parallel timelines with interactive features including scrolling, hovering, and clicking.

### Core Responsibilities
- **Rendering**: Draw timeline grid, date labels, and data items ("chicklets")
- **Event Handling**: Process mouse/touch input for navigation and interaction
- **Data Management**: Store and organize timeline data items
- **State Management**: Track viewport position, hover state, and user interactions

### Technology Stack
- TypeScript (ES6+ features including arrow functions)
- HTML5 Canvas 2D Context
- Native DOM Events
- No external dependencies (aside from optional jQuery reference in demo)

---

## Architecture

### Design Pattern: Component-Based
The `TimeLine` class follows a component-based architecture where it:
1. **Owns** the canvas element
2. **Manages** its own state
3. **Responds** to external events (window resize, user input)
4. **Exposes** a public API for data manipulation

### Architectural Layers

```
┌─────────────────────────────────────┐
│     Public API Layer                │
│  (AddDataItem, SetLineLabel, etc.)  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│    Event Handling Layer             │
│  (Mouse, Touch, Wheel handlers)     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│    Data Processing Layer            │
│  (RecreateLineBitmaps, GetMetadata) │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│    Rendering Layer                  │
│  (Canvas 2D drawing operations)     │
└─────────────────────────────────────┘
```

### Data Flow

```
User Input → Event Handler → State Update → FillCanvas()
                                              ↓
                                         ClearCanvas()
                                              ↓
                                         RedrawCanvas()
                                              ↓
                                      Chicklet Rendering
```

---

## Class Structure

### Main Class: `TimeLine`

#### Configuration Properties
```typescript
// Display Configuration
numrows: number = 5              // Number of visible timeline rows (1-10)
daysize: number = 15             // Pixel width of each day cell
margin: number = 30              // Border margin in pixels
marginscale: number = 1.5        // Top margin multiplier
linecolor: string = "#000000"    // Primary border color
linecolorlight: string = "#7f7f7f" // Light border color (for dark chicklets)

// Mode Flags
TestRender: boolean = false      // Enable test pattern rendering
```

#### State Properties
```typescript
// Viewport State
startdate: Date = new Date()     // Leftmost visible date
totwidth: number = 0             // Canvas width (calculated)
totheight: number = 0            // Canvas height (calculated)
daysacross: number = 0           // Number of visible days (calculated)

// Interaction State
hoverdate: Date = null           // Currently hovered date
hoverline: number = 0            // Currently hovered line number
LINEOVER: number = 0             // Active line during interaction
DATECLICKEDINFO: DATECLICKEDMETADATA = null   // Last clicked metadata
DATEHOVEREDINFO: DATEHOVEREDMETADATA = null   // Current hover metadata

// Touch State
xDown: number = null             // Touch start X coordinate
yDown: number = null             // Touch start Y coordinate
```

#### Data Storage
```typescript
// Labels
LineLabels: string[] = ['LINE 1', 'LINE 2', ...]  // Row labels

// Input Data
TheLineData: TimeLineDataItem[] = []  // All timeline items

// Processed Data (Performance Optimization)
Line1: number[] = []   // Rendered style indices for line 1
Line2: number[] = []   // Rendered style indices for line 2
// ... through Line10
```

#### Canvas Reference
```typescript
TheCanvas: HTMLCanvasElement     // Bound canvas element
```

#### Event Objects
```typescript
DateClickedEvent: Event          // Custom DOM event for clicks
DateHoveredEvent: Event          // Custom DOM event for hovers
```

---

## Data Structures

### Supporting Classes

#### `TimeLineDataItem`
Represents a single data item to display on the timeline.

```typescript
class TimeLineDataItem {
    LineID: number              // Which row (1-10)
    RenderStyle: Chicklet_Styles // Visual style (0-29)
    BeginDate: Date             // Start date (inclusive)
    EndDate: Date               // End date (inclusive)
    MetaData: String            // Descriptive text for tooltips/events
}
```

**Key Characteristics:**
- Dates are normalized in `AddDataItem()`: start time = 00:00:01, end time = 23:59:59
- Multiple items can overlap on the same date
- Stored in chronological order in `TheLineData[]`

#### `DATECLICKEDMETADATA`
Contains information when user clicks on timeline.

```typescript
class DATECLICKEDMETADATA {
    DATECLICKED: Date           // The clicked date
    LINECLICKED: Number         // The clicked line (0-indexed)
    METADATA: string            // Aggregated metadata for that date/line
}
```

#### `DATEHOVEREDMETADATA`
Contains information when user hovers over timeline (identical structure to DATECLICKEDMETADATA).

```typescript
class DATEHOVEREDMETADATA {
    DATECLICKED: Date           // The hovered date
    LINECLICKED: Number         // The hovered line (0-indexed)
    METADATA: string            // Aggregated metadata for that date/line
}
```

### Enumeration: `Chicklet_Styles`

Defines 30 visual styles indexed 0-29:

```typescript
enum Chicklet_Styles {
    // Boxes: 0-9
    Chicklet_RedBox,      Chicklet_GreenBox,    Chicklet_BlueBox,
    Chicklet_YellowBox,   Chicklet_PurpleBox,   Chicklet_OrangeBox,
    Chicklet_GoldBox,     Chicklet_BlackBox,    Chicklet_WhiteBox,
    Chicklet_GreyBox,

    // Circles: 10-19
    Chicklet_RedCircle,   Chicklet_GreenCircle, Chicklet_BlueCircle,
    Chicklet_YellowCircle, Chicklet_PurpleCircle, Chicklet_OrangeCircle,
    Chicklet_GoldCircle,  Chicklet_BlackCircle, Chicklet_WhiteCircle,
    Chicklet_GreyCircle,

    // Triangles: 20-29
    Chicklet_RedTriangle, Chicklet_GreenTriangle, Chicklet_BlueTriangle,
    Chicklet_YellowTriangle, Chicklet_PurpleTriangle, Chicklet_OrangeTriangle,
    Chicklet_GoldTriangle, Chicklet_BlackTriangle, Chicklet_WhiteTriangle,
    Chicklet_GreyTriangle
}
```

---

## Rendering Pipeline

### Rendering Hierarchy

```
FillCanvas()              ← Public entry point
  ├─ resize()            ← Adjust canvas to container size
  ├─ ClearCanvas()       ← Fill background color
  └─ RedrawCanvas()      ← Main rendering logic
      ├─ Draw chicklets (nested loops: days × lines)
      │   ├─ Label start date (day 0, line 0)
      │   ├─ Label month transitions
      │   ├─ Highlight weekends
      │   └─ Render chicklet at position
      │       ├─ TestRender mode: cycle through all styles
      │       └─ Normal mode: lookup from LineN[] arrays
      │           ├─ Call Chicklet_XXX() method
      │           └─ Add dog-ear if multiple (value > 99)
      └─ Draw line labels
```

### Coordinate System

#### Canvas Layout
```
(0,0) ┌──────────────────────────────────┐
      │  margin * marginscale            │ Top margin (with scale)
      ├──────┬─────┬─────┬─────┬─────────┤
      │Label │ Day │ Day │ Day │ ...     │ Line 1
      ├──────┼─────┼─────┼─────┼─────────┤
margin│Label │ Day │ Day │ Day │ ...     │ Line 2
      │      │     │     │     │         │
      ├──────┴─────┴─────┴─────┴─────────┤
      │  margin                           │ Bottom margin
      └───────────────────────────────────┘
      ↑
      margin
```

#### Position Calculations

**X Position (Day Column):**
```typescript
x = margin + (dayIndex * daysize)
```

**Y Position (Line Row):**
```typescript
innerRegionHeight = totalHeight - (margin * 2)
y = (margin * marginscale) + ((innerRegionHeight / numrows) * lineIndex)
```

**Days Visible:**
```typescript
daysacross = floor((totalWidth - (margin * 2)) / daysize)
```

### Chicklet Rendering

Each chicklet is rendered by a specialized method following the pattern:
- `Chicklet_<Color><Shape>(ctx, x, y, xs, ys)`

**Example: `Chicklet_BlueBox`**
```typescript
Chicklet_BlueBox(ctx: CanvasRenderingContext2D, x: number, y: number, xs: number, ys: number) {
    ctx.beginPath();
    ctx.fillStyle = "#0000FF";           // Fill with blue
    ctx.fillRect(x, y, xs, ys);          // Draw filled rectangle
    ctx.strokeStyle = this.linecolor;    // Border color
    ctx.strokeRect(x, y, xs, ys);        // Draw border
    ctx.stroke();
}
```

**Chicklet Types:**
1. **Box**: `fillRect()` - solid square
2. **Circle**: `arc()` - centered circle within cell
3. **Triangle**: `moveTo()/lineTo()` - upward-pointing triangle
4. **Dog-Ear**: Small pink triangle in top-right corner indicating overlaps

### Weekend Highlighting
```typescript
if (currentdate.getDay() == 0 || currentdate.getDay() == 6) {
    ctx.fillStyle = "#BFBFBF";
    ctx.fillRect(x, y + daysize, daysize, daysize / 3);  // Gray bar below cell
}
```

### Date Labeling

**Start Date Label** (always shown):
- Position: Above first cell of top line
- Format: "M/D/YYYY"
- Includes tick mark

**Month Transition Labels** (when day-of-month == 1):
- Condition: `currentdate.getMonth() + 1 > cmonth && cday > 10`
- Position: Above first day of new month on top line
- Format: "M/D/YYYY"
- Includes tick mark

---

## Event System

### Event Registration (Constructor)

```typescript
constructor(element: HTMLCanvasElement) {
    this.TheCanvas = element;

    // Canvas resizing
    window.addEventListener('resize', this.resizeCanvas, false);

    // Mouse events
    this.TheCanvas.addEventListener('mousewheel', this.mouseWheelEvent);
    this.TheCanvas.addEventListener('DOMMouseScroll', this.mouseWheelEvent);  // Firefox
    this.TheCanvas.addEventListener('mousemove', this.HandleMouseMove);
    this.TheCanvas.addEventListener('mouseleave', this.HandleMouseLeave);
    this.TheCanvas.addEventListener('mousedown', this.HandleMouseDown);

    // Touch events
    this.TheCanvas.addEventListener('touchstart', this.HandleTouchStart);
    this.TheCanvas.addEventListener('touchmove', this.HandleTouchMove);

    // Initialize custom events
    this.DateClickedEvent.initEvent('DATECLICKED', true, true);
    this.DateHoveredEvent.initEvent('DATEHOVERED', true, true);

    this.FillCanvas();
}
```

### Mouse Wheel Scrolling

```typescript
mouseWheelEvent = (e) => {
    var delta = e.wheelDelta ? e.wheelDelta : -e.detail;  // Cross-browser

    // Normalize to ±7 days
    if (delta > 0)
        delta = 7;
    else
        delta = -7;

    this.startdate = this.addDays(this.startdate, delta);
    this.FillCanvas();

    return false;  // Prevent page scroll
}
```

### Mouse Move (Hover)

**Algorithm:**
1. Check if mouse is within timeline area (`offsetX >= margin`)
2. Check if within visible days range
3. Calculate hovered date from X position
4. Draw crosshair (red vertical and horizontal lines)
5. Display date in bottom-right corner
6. Determine which line is hovered based on Y position
7. Populate `DATEHOVEREDINFO` object
8. Dispatch `DATEHOVERED` event
9. Update canvas tooltip with metadata

**Hit Detection:**
```typescript
// Calculate day offset
var doff = Math.floor((ev.offsetX - this.margin) / this.daysize);
this.hoverdate = this.addDays(this.startdate, doff);

// Check each line's Y bounds
for (var cline = 0; cline < this.numrows; cline++) {
    var y = (this.margin * this.marginscale) + ((innerregionheight / this.numrows) * cline);

    if (ev.offsetY >= y && ev.offsetY <= y + this.daysize) {
        lineover = cline;
        // Found the line!
    }
}
```

### Mouse Down (Click)

Similar to mouse move, but:
- No crosshair drawn
- Dispatches `DATECLICKED` event instead
- Uses already-calculated `hoverdate` from mouse move

### Touch Events

**Touch Start:**
```typescript
HandleTouchStart = (ev: TouchEvent) => {
    this.xDown = ev.touches[0].clientX;
    this.yDown = ev.touches[0].clientY;
}
```

**Touch Move (Swipe Detection):**
```typescript
HandleTouchMove = (ev: TouchEvent) => {
    var xUp = ev.touches[0].clientX;
    var yUp = ev.touches[0].clientY;

    var xDiff = this.xDown - xUp;
    var yDiff = this.yDown - yUp;

    // Horizontal swipe detection
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            delta = 1;   // Swipe left = move forward 1 day
        } else {
            delta = -1;  // Swipe right = move back 1 day
        }
    }

    this.startdate = this.addDays(this.startdate, delta);
    this.FillCanvas();

    // Update touch position for continuous swiping
    this.xDown = xUp;
    this.yDown = yUp;
}
```

### Custom Event Dispatch

External code can listen for timeline events:

```typescript
// In Timeline.ts
this.DATECLICKEDINFO = new DATECLICKEDMETADATA(date, line, metadata);
this.TheCanvas.dispatchEvent(this.DateClickedEvent);

// In consumer code
canvas.addEventListener('DATECLICKED', function(e) {
    var info = timeline.DATECLICKEDINFO;
    // Access: info.DATECLICKED, info.LINECLICKED, info.METADATA
}, true);
```

---

## Internal Algorithms

### 1. Line Bitmap Optimization

**Problem:** Checking every data item for every visible day would be O(n×m) where n=data items, m=visible days.

**Solution:** Pre-compute a sparse array for each line mapping day-offset → style-index.

#### Process: `RecreateLineBitmaps()`

```typescript
RecreateLineBitmaps() {
    // 1. Calculate total date span
    var SPAN = this.daydiff(this.MINDate, this.MAXDate);

    // 2. Allocate arrays for each line
    this.Line1 = new Array(SPAN);
    this.Line2 = new Array(SPAN);
    // ... through Line10

    // 3. For each data item...
    for (index = 0; index < this.TheLineData.length; index++) {
        var offset1 = this.daydiff(this.MINDate, item.BeginDate) + 1;
        var offset2 = this.daydiff(this.MINDate, item.EndDate);
        var Renderstyle = item.RenderStyle;

        // 4. Fill the range [offset1..offset2] with style index
        for (i = offset1; i <= offset2; i++) {
            switch (item.LineID) {
                case 1:
                    if (this.Line1[i] === undefined)
                        this.Line1[i] = Renderstyle;
                    else
                        this.Line1[i] = Renderstyle + 100;  // Mark overlap!
                    break;
                // ... cases 2-10
            }
        }
    }
}
```

**Overlap Detection:**
- If cell already has a value, add 100 to the style index
- During rendering: if value > 99, subtract 100 and draw dog-ear

**Performance:**
- Rendering: O(visible_days × lines) - constant time array lookup
- Preprocessing: O(data_items × date_span) - called only when data changes

### 2. Date Range Calculation

```typescript
GetMinimumDate() {
    var mindate: Date = this.startdate;
    for (index = 0; index < this.TheLineData.length; index++) {
        if (this.TheLineData[index].BeginDate < mindate) {
            mindate = this.TheLineData[index].BeginDate;
        }
    }
    return mindate;
}

GetMaximumDate() {
    var maxdate: Date = this.addDays(this.startdate, this.daysacross);
    for (index = 0; index < this.TheLineData.length; index++) {
        if (this.TheLineData[index].EndDate < maxdate) {
            maxdate = this.TheLineData[index].EndDate;
        }
    }
    return maxdate;
}
```

**Note:** The `GetMaximumDate()` implementation appears to have a bug - it should use `>` instead of `<` for the comparison.

### 3. Metadata Aggregation

```typescript
GetMetaDataAt(TheLineID: number, TheDate: Date) {
    var result: string = "";

    for (index = 0; index < this.TheLineData.length; index++) {
        // Check if date falls within this item's range AND line matches
        if (this.TheLineData[index].BeginDate <= TheDate &&
            this.TheLineData[index].EndDate >= TheDate &&
            this.TheLineData[index].LineID == TheLineID) {

            // Concatenate with newlines
            if (result != "")
                result += "\n" + this.TheLineData[index].MetaData;
            else
                result += this.TheLineData[index].MetaData;
        }
    }
    return result;
}
```

**Complexity:** O(n) where n = total data items (linear scan)

### 4. Day Difference Calculation

```typescript
daydiff(first: Date, second: Date) {
    return Math.floor((second.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
}
```

**Key Points:**
- Returns integer days only (fractional days truncated)
- Uses millisecond timestamps (`getTime()`)
- Susceptible to DST issues (23-hour or 25-hour days)

### 5. Add Days Utility

```typescript
addDays(theDate: Date, days: number) {
    return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}
```

**Returns:** New Date object (immutable pattern)

---

## Public API

### Constructor

```typescript
new TimeLine(element: HTMLCanvasElement)
```

**Responsibilities:**
- Registers all event listeners
- Initializes custom events
- Performs initial render

### Data Management Methods

#### `AddDataItem(item: TimeLineDataItem)`
```typescript
AddDataItem(TheData2Add: TimeLineDataItem) {
    // Normalize times
    TheData2Add.BeginDate.setHours(0, 0, 1, 0);      // Just after midnight
    TheData2Add.EndDate.setHours(23, 59, 59, 999);   // Just before midnight

    // Add to collection
    this.TheLineData.push(TheData2Add);

    // Recalculate bounds
    this.MINDate = this.GetMinimumDate();
    this.MAXDate = this.GetMaximumDate();

    // Rebuild lookup arrays
    this.RecreateLineBitmaps();
}
```

**Side Effects:**
- Mutates the passed Date objects
- Triggers expensive bitmap recalculation
- Does NOT automatically re-render (caller must call `FillCanvas()`)

#### `ClearAllDataItems()`
Empties `TheLineData` array and rebuilds bitmaps.

#### `ClearSpecificLine(lineId: number)`
Removes all items where `LineID === lineId` (iterates backwards to avoid index issues).

#### `ClearAllButSpecificLine(lineId: number)`
Inverse of above - keeps only specified line.

### Display Methods

#### `FillCanvas()`
**Primary rendering entry point** - call after any configuration or data change.

#### `SetLineLabel(lineId: number, label: string)`
Updates label and triggers re-render.

#### `GetLineLabel(lineId: number): string`
Returns label for specified line.

### Utility Methods

#### `GetMetaDataAt(lineId: number, date: Date): string`
Returns concatenated metadata for all items matching the line and date.

#### `GetImage(): string`
```typescript
GetImage() {
    var img = this.TheCanvas.toDataURL("image/png");
    img = '<img src="' + img + '"/>';
    return img;
}
```
Returns HTML `<img>` tag with embedded base64 PNG data URL.

---

## Performance Considerations

### Strengths

1. **Bitmap Optimization**: Pre-computed Line arrays avoid repeated date range checks
2. **On-Demand Rendering**: Only redraws when explicitly requested (no animation loop)
3. **Event Delegation**: Uses arrow functions to avoid bind() overhead
4. **Direct Canvas API**: No intermediate abstractions

### Bottlenecks

1. **Full Canvas Redraws**: Every interaction (hover, scroll) clears and redraws entire canvas
2. **String Concatenation**: Metadata aggregation uses `+=` instead of array join
3. **Large Date Ranges**: Bitmap arrays scale with total date span, not visible dates
4. **Switch Statements**: 10-case switch for line lookups (could use array indexing)
5. **Linear Metadata Scan**: O(n) lookup for tooltips on every hover

### Optimization Opportunities

```typescript
// Current: Full redraw on hover
HandleMouseMove = (ev) => {
    this.FillCanvas();  // ← Expensive!
    // Draw crosshair
}

// Potential: Layer-based rendering
// Layer 1: Static background (grid, labels)
// Layer 2: Data chicklets
// Layer 3: Interactive overlay (crosshair)
```

### Memory Footprint

For a timeline with:
- 10 lines
- 1 year date span (365 days)
- 100 data items

**Memory:**
- Line arrays: 10 × 365 × 4 bytes (number) = ~14 KB
- Data items: 100 × (48 + 16 + 16 + string) ≈ 10-20 KB
- **Total: ~30-50 KB** (negligible for modern browsers)

---

## Code Quality & Technical Debt

### Strengths

✅ **Type Safety**: Full TypeScript with type annotations
✅ **Separation of Concerns**: Clear distinction between data, rendering, and events
✅ **Immutable Dates**: `addDays()` returns new Date objects
✅ **Event-Driven**: Clean event dispatch for external integration
✅ **Arrow Functions**: Proper `this` binding without manual `.bind()`

### Issues & Technical Debt

#### 1. Repetitive Code
**Problem:** 30 nearly-identical chicklet rendering methods

```typescript
Chicklet_RedBox() { /* ... */ }
Chicklet_GreenBox() { /* ... */ }
Chicklet_BlueBox() { /* ... */ }
// ... 27 more
```

**Solution:** Parameterized rendering:
```typescript
renderChicklet(style: number, ctx, x, y, xs, ys) {
    const config = STYLE_CONFIG[style];
    ctx.fillStyle = config.color;

    switch (config.shape) {
        case 'box': ctx.fillRect(x, y, xs, ys); break;
        case 'circle': ctx.arc(...); break;
        case 'triangle': /* path */ break;
    }
}
```

#### 2. Magic Numbers
```typescript
if (dogear) {
    rd = rd - 100;  // Why 100? (marks overlaps)
}

delta = 7;  // Why 7? (scroll speed in days)
```

**Solution:** Named constants:
```typescript
const OVERLAP_OFFSET = 100;
const SCROLL_DAYS = 7;
```

#### 3. Inconsistent Naming
- `TheCanvas`, `TheLineData` (PascalCase with "The" prefix)
- `numrows`, `daysize` (lowercase)
- `LINEOVER`, `MINDate` (UPPERCASE)
- `cline`, `cday` (abbreviated)

#### 4. Switch Statement Anti-Pattern
```typescript
switch (cline) {
    case 0: rd = this.Line1[doff]; break;
    case 1: rd = this.Line2[doff]; break;
    // ... 8 more cases
}
```

**Solution:** Array of arrays:
```typescript
this.lines = [this.Line1, this.Line2, ...];
rd = this.lines[cline][doff];
```

#### 5. Bug in `GetMaximumDate()`
```typescript
// Current (incorrect):
if (this.TheLineData[index].EndDate < maxdate) {
    maxdate = this.TheLineData[index].EndDate;  // Finds MINIMUM!
}

// Should be:
if (this.TheLineData[index].EndDate > maxdate) {
    maxdate = this.TheLineData[index].EndDate;
}
```

#### 6. Missing Error Handling
- No validation for `lineId` out of range (1-10)
- No null checks for canvas context
- No date validation (NaN dates)

#### 7. Unused Code
```typescript
InterpretedLineDataItem  // Defined but never instantiated
hoverline: number = 0    // Set but never read
```

#### 8. resize() Method Not Invoked
```typescript
resizeCanvas = (ev: UIEvent) => {
    this.resize;  // ← Missing parentheses! Should be: this.resize()
    this.FillCanvas();
}
```

#### 9. Date Mutation
```typescript
AddDataItem(TheData2Add: TimeLineDataItem) {
    TheData2Add.BeginDate.setHours(0, 0, 1, 0);  // Mutates caller's object!
}
```

**Solution:** Clone dates:
```typescript
const normalizedBegin = new Date(TheData2Add.BeginDate);
normalizedBegin.setHours(0, 0, 1, 0);
```

#### 10. Accessibility Concerns
- No ARIA labels
- No keyboard navigation
- Canvas content not exposed to screen readers

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        TimeLine Class                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Configuration  │  │     State      │  │  Data Store  │  │
│  ├────────────────┤  ├────────────────┤  ├──────────────┤  │
│  │ • numrows      │  │ • startdate    │  │ • TheLineData│  │
│  │ • daysize      │  │ • hoverdate    │  │ • Line1-10   │  │
│  │ • margin       │  │ • hoverline    │  │ • LineLabels │  │
│  │ • linecolor    │  │ • LINEOVER     │  │ • MINDate    │  │
│  │ • TestRender   │  │ • totwidth     │  │ • MAXDate    │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Event Handlers (Input Layer)             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • mouseWheelEvent()      → Scroll timeline           │  │
│  │ • HandleMouseMove()      → Hover detection           │  │
│  │ • HandleMouseDown()      → Click detection           │  │
│  │ • HandleMouseLeave()     → Clear hover               │  │
│  │ • HandleTouchStart()     → Begin swipe               │  │
│  │ • HandleTouchMove()      → Swipe navigation          │  │
│  │ • resizeCanvas()         → Window resize             │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Data Processing (Business Logic)             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • RecreateLineBitmaps()  → Preprocess for render     │  │
│  │ • GetMetaDataAt()        → Aggregate tooltips        │  │
│  │ • GetMinimumDate()       → Calculate bounds          │  │
│  │ • GetMaximumDate()       → Calculate bounds          │  │
│  │ • daydiff()              → Date arithmetic           │  │
│  │ • addDays()              → Date arithmetic           │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Rendering Layer (Output Layer)               │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • FillCanvas()           → Main render entry         │  │
│  │ • ClearCanvas()          → Fill background           │  │
│  │ • RedrawCanvas()         → Draw everything           │  │
│  │ • Chicklet_*Box()        → Draw filled rectangles    │  │
│  │ • Chicklet_*Circle()     → Draw circles              │  │
│  │ • Chicklet_*Triangle()   → Draw triangles            │  │
│  │ • Chicklet_DogEar()      → Draw overlap indicator    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 HTML5 Canvas Element                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Custom Event Dispatch                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ • DATECLICKED   → External listeners                 │  │
│  │ • DATEHOVERED   → External listeners                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Interaction Flow Examples

### Example 1: User Scrolls Timeline

```
1. User scrolls mouse wheel
   ↓
2. mouseWheelEvent() handler fires
   ↓
3. delta = ±7 days calculated
   ↓
4. startdate updated: addDays(startdate, delta)
   ↓
5. FillCanvas() called
   ├─ resize() updates canvas dimensions
   ├─ ClearCanvas() fills background
   └─ RedrawCanvas()
       ├─ Calculate daysacross (visible days)
       └─ For each day × line:
           ├─ Lookup LineN[dayOffset]
           └─ Call Chicklet_XXX(style)
   ↓
6. User sees timeline shifted 7 days
```

### Example 2: User Clicks Date

```
1. User moves mouse over canvas
   ↓
2. HandleMouseMove() updates hoverdate
   ↓
3. User clicks mouse button
   ↓
4. HandleMouseDown() fires
   ↓
5. Calculate day offset from click X position
   ↓
6. Loop through lines to find Y position match
   ↓
7. Populate DATECLICKEDINFO:
   - DATECLICKED = hoverdate
   - LINECLICKED = matched line index
   - METADATA = GetMetaDataAt(line, date)
   ↓
8. Dispatch 'DATECLICKED' event
   ↓
9. External listener receives event
   ↓
10. Consumer reads timeline.DATECLICKEDINFO
```

### Example 3: Add Data and Render

```
1. Consumer: timeline.AddDataItem(new TimeLineDataItem(...))
   ↓
2. AddDataItem() normalizes dates
   ↓
3. Item pushed to TheLineData[]
   ↓
4. MINDate/MAXDate recalculated
   ↓
5. RecreateLineBitmaps()
   ├─ Calculate total day span
   ├─ Allocate Line1-10 arrays
   └─ For each data item:
       ├─ Calculate begin/end offsets
       └─ Fill LineN[offset] = RenderStyle
           (add 100 if overlap detected)
   ↓
6. Consumer: timeline.FillCanvas()
   ↓
7. Render pipeline executes
   ↓
8. New chicklets visible on canvas
```

---

## Summary

### Key Architectural Decisions

1. **Canvas-Based Rendering**: Chosen for performance and custom drawing control
2. **Bitmap Optimization**: Pre-computed arrays trade memory for render speed
3. **Event-Driven API**: Clean separation between component and consumers
4. **Immutable Viewport**: Dates are calculated, not stored for each cell

### Design Tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| Full canvas redraws | Simplicity | Hover lag on large timelines |
| Line1-10 separate arrays | Easy access | Repetitive code, max 10 rows |
| 30 chicklet methods | Clarity | 600+ lines of repetitive code |
| Date mutation in AddDataItem | None | Surprising side effect |
| No frameworks | Zero dependencies | Manual DOM manipulation |

### Extensibility Points

To extend this component:

1. **Add new shapes**: Create `Chicklet_<Color><NewShape>()` methods
2. **Custom themes**: Modify color hex codes in chicklet methods
3. **More than 10 lines**: Add Line11-20 arrays + switch cases
4. **Animations**: Add requestAnimationFrame loop + easing
5. **Zoom**: Modify `daysize` with smooth transitions
6. **Data export**: Extend `GetImage()` to support SVG, PDF

---

## Conclusion

Timeline.ts is a **functional, self-contained timeline visualization component** with:
- ✅ Clear separation of concerns
- ✅ Efficient rendering via bitmap optimization
- ✅ Rich interaction support (mouse, touch, keyboard-capable with additions)
- ⚠️ Some technical debt (repetition, magic numbers, minor bugs)
- ⚠️ Performance issues at scale (full redraws)

The architecture is **suitable for small-to-medium datasets** (hundreds of items, months-to-years span) and could be refactored for enterprise use with the optimizations noted above.
