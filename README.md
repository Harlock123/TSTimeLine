# TSTimeLine

A lightweight, interactive HTML5 Canvas-based timeline visualization control for displaying correlated events across multiple parallel timelines. Perfect for visualizing time-based data such as claim activity, eligibility periods, authorizations, project milestones, or any temporal data that needs to be displayed across multiple categories.

## Features

- **Multi-row Timeline Display**: Support for up to 10 parallel timelines to show correlated events
- **30 Visual Styles**: 10 colors (Red, Green, Blue, Yellow, Purple, Orange, Gold, Black, White, Grey) × 3 shapes (Box, Circle, Triangle)
- **Interactive Navigation**:
  - Mouse wheel scrolling to navigate through time
  - Touch support for mobile devices (swipe left/right)
  - Crosshair hover to inspect specific dates
- **Smart Event Overlays**: Dog-ear indicators for overlapping events on the same date
- **Weekend Highlighting**: Visual differentiation of weekends
- **Month Transitions**: Automatic date labels at month boundaries
- **Custom Events**: Click and hover events with metadata support
- **Responsive Design**: Canvas automatically resizes to fit container
- **Configurable Display**: Adjustable day size, margins, number of rows, and colors
- **TypeScript**: Written in TypeScript with full type definitions

## Demo

Open `index.html` in a web browser to see the interactive demo with sample data and controls.

## Installation

### Option 1: Direct Download
1. Copy `Timeline.js` (or compile `Timeline.ts`) to your project
2. Include it in your HTML:

```html
<script src="Timeline.js"></script>
```

### Option 2: TypeScript
1. Copy `Timeline.ts` to your project
2. Compile with your TypeScript build process
3. Import as needed

## Quick Start

### HTML Setup
```html
<!DOCTYPE html>
<html>
<head>
    <title>Timeline Example</title>
</head>
<body>
    <canvas id="timeline" height="300"></canvas>
    <script src="Timeline.js"></script>
    <script>
        // Initialize timeline
        var canvas = document.getElementById('timeline');
        var timeline = new TimeLine(canvas);

        // Configure
        timeline.numrows = 5;
        timeline.LineLabels = ['Claims', 'Eligibility', 'Authorizations', 'Payments', 'Appeals'];

        // Add data
        timeline.AddDataItem(new TimeLineDataItem(
            1,                                      // Line ID (1-10)
            Chicklet_Styles.Chicklet_BlueBox,      // Style
            new Date('2025-01-01'),                // Start date
            new Date('2025-01-31'),                // End date
            'January Claims'                        // Metadata
        ));

        // Render
        timeline.FillCanvas();
    </script>
</body>
</html>
```

## API Documentation

### Constructor

```typescript
new TimeLine(element: HTMLCanvasElement)
```

Creates a new timeline instance bound to the specified canvas element.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `numrows` | number | 5 | Number of timeline rows to display (1-10) |
| `daysize` | number | 15 | Width of each day in pixels |
| `margin` | number | 30 | Canvas margin in pixels |
| `marginscale` | number | 1.5 | Top margin scale factor |
| `linecolor` | string | "#000000" | Primary line color |
| `linecolorlight` | string | "#7f7f7f" | Light line color (for dark chicklets) |
| `TestRender` | boolean | false | Enable test rendering mode (cycles through all styles) |
| `startdate` | Date | new Date() | Currently displayed start date |
| `LineLabels` | string[] | ['LINE 1', ...] | Labels for each timeline row |

### Methods

#### Data Management

```typescript
AddDataItem(item: TimeLineDataItem): void
```
Adds a data item to the timeline. Automatically recalculates date ranges and rebuilds display.

```typescript
ClearAllDataItems(): void
```
Removes all data items from the timeline.

```typescript
ClearSpecificLine(lineId: number): void
```
Removes all data items from a specific timeline row.

```typescript
ClearAllButSpecificLine(lineId: number): void
```
Removes all data items except those on the specified timeline row.

#### Display Methods

```typescript
FillCanvas(): void
```
Redraws the entire canvas. Call after data changes or configuration updates.

```typescript
SetLineLabel(lineId: number, label: string): void
```
Sets the label for a specific timeline row and redraws.

```typescript
GetLineLabel(lineId: number): string
```
Returns the label for the specified timeline row.

#### Utility Methods

```typescript
GetMetaDataAt(lineId: number, date: Date): string
```
Returns metadata for all items at the specified line and date.

```typescript
addDays(date: Date, days: number): Date
```
Returns a new date with the specified number of days added.

```typescript
GetImage(): string
```
Returns the canvas as a base64-encoded PNG image tag.

### Data Classes

#### TimeLineDataItem

```typescript
class TimeLineDataItem {
    constructor(
        lineId: number,              // Timeline row (1-10)
        renderStyle: Chicklet_Styles, // Visual style
        beginDate: Date,             // Start date
        endDate: Date,               // End date
        metadata: string             // Descriptive text
    )
}
```

#### Chicklet_Styles Enum

Available visual styles (0-29):

**Boxes (0-9):**
- `Chicklet_RedBox`, `Chicklet_GreenBox`, `Chicklet_BlueBox`, `Chicklet_YellowBox`, `Chicklet_PurpleBox`, `Chicklet_OrangeBox`, `Chicklet_GoldBox`, `Chicklet_BlackBox`, `Chicklet_WhiteBox`, `Chicklet_GreyBox`

**Circles (10-19):**
- `Chicklet_RedCircle`, `Chicklet_GreenCircle`, `Chicklet_BlueCircle`, `Chicklet_YellowCircle`, `Chicklet_PurpleCircle`, `Chicklet_OrangeCircle`, `Chicklet_GoldCircle`, `Chicklet_BlackCircle`, `Chicklet_WhiteCircle`, `Chicklet_GreyCircle`

**Triangles (20-29):**
- `Chicklet_RedTriangle`, `Chicklet_GreenTriangle`, `Chicklet_BlueTriangle`, `Chicklet_YellowTriangle`, `Chicklet_PurpleTriangle`, `Chicklet_OrangeTriangle`, `Chicklet_GoldTriangle`, `Chicklet_BlackTriangle`, `Chicklet_WhiteTriangle`, `Chicklet_GreyTriangle`

### Events

The timeline dispatches custom DOM events:

#### DATECLICKED

Fired when the user clicks on a date/line intersection.

```javascript
canvas.addEventListener('DATECLICKED', function(e) {
    var info = timeline.DATECLICKEDINFO;
    console.log('Clicked:', info.DATECLICKED);
    console.log('Line:', info.LINECLICKED);
    console.log('Metadata:', info.METADATA);
}, true);
```

#### DATEHOVERED

Fired when the user hovers over a date/line intersection.

```javascript
canvas.addEventListener('DATEHOVERED', function(e) {
    var info = timeline.DATEHOVEREDINFO;
    console.log('Hovered:', info.DATECLICKED);
    console.log('Line:', info.LINECLICKED);
    console.log('Metadata:', info.METADATA);
}, true);
```

## Advanced Examples

### Healthcare Claims Timeline

```javascript
var timeline = new TimeLine(document.getElementById('canvas'));
timeline.numrows = 4;
timeline.LineLabels = ['Claims', 'Eligibility', 'Prior Auth', 'Appeals'];

// Eligibility period
timeline.AddDataItem(new TimeLineDataItem(
    2,
    Chicklet_Styles.Chicklet_GreenBox,
    new Date('2025-01-01'),
    new Date('2025-12-31'),
    'Active Coverage - Plan A'
));

// Claim submitted
timeline.AddDataItem(new TimeLineDataItem(
    1,
    Chicklet_Styles.Chicklet_BlueCircle,
    new Date('2025-03-15'),
    new Date('2025-03-15'),
    'Claim #12345 - Office Visit'
));

// Prior authorization
timeline.AddDataItem(new TimeLineDataItem(
    3,
    Chicklet_Styles.Chicklet_OrangeTriangle,
    new Date('2025-03-10'),
    new Date('2025-06-10'),
    'PA #9876 - Approved'
));

timeline.FillCanvas();
```

### Project Management Timeline

```javascript
var timeline = new TimeLine(document.getElementById('canvas'));
timeline.numrows = 3;
timeline.daysize = 20; // Larger day boxes
timeline.LineLabels = ['Design', 'Development', 'Testing'];

// Design phase
timeline.AddDataItem(new TimeLineDataItem(
    1,
    Chicklet_Styles.Chicklet_PurpleBox,
    new Date('2025-01-01'),
    new Date('2025-02-15'),
    'UI/UX Design Phase'
));

// Development phase
timeline.AddDataItem(new TimeLineDataItem(
    2,
    Chicklet_Styles.Chicklet_BlueBox,
    new Date('2025-02-01'),
    new Date('2025-04-30'),
    'Development Sprint 1-6'
));

// Testing phase
timeline.AddDataItem(new TimeLineDataItem(
    3,
    Chicklet_Styles.Chicklet_GreenBox,
    new Date('2025-03-15'),
    new Date('2025-05-15'),
    'QA Testing & Bug Fixes'
));

timeline.FillCanvas();
```

### Dynamic Date Navigation

```javascript
// Jump to today
timeline.startdate = new Date();
timeline.FillCanvas();

// Navigate forward 7 days
function goForward() {
    timeline.startdate = timeline.addDays(timeline.startdate, 7);
    timeline.FillCanvas();
}

// Navigate backward 7 days
function goBack() {
    timeline.startdate = timeline.addDays(timeline.startdate, -7);
    timeline.FillCanvas();
}
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Touch events supported

Requires HTML5 Canvas support.

## Configuration Tips

### Performance Optimization
- For large datasets, consider limiting the number of visible days
- Use `daysize` between 10-20 for optimal performance
- Limit to 5-7 rows for best readability

### Visual Design
- Use contrasting colors for different event types
- Reserve shapes for status: Box = active, Circle = pending, Triangle = completed
- Dog-ears automatically indicate overlapping events on the same date

### Touch Devices
- Touch scrolling is automatically enabled
- Swipe left/right to navigate through time
- Tap to trigger DATECLICKED events

## Development

### Compiling TypeScript

```bash
tsc Timeline.ts
```

This generates `Timeline.js` and `Timeline.js.map`.

### Project Structure

```
TSTimeLine/
├── Timeline.ts       # TypeScript source
├── Timeline.js       # Compiled JavaScript
├── Timeline.js.map   # Source map
├── index.html        # Demo page
├── README.md         # This file
└── LICENSE           # MIT License
```

## Known Limitations

- Maximum 10 timeline rows
- Date range limited by JavaScript Date object (approximately 285,616 years)
- Canvas performance may degrade with extremely large date ranges
- No built-in zoom functionality (use `daysize` property)

## Future Enhancements

- Zoom controls
- Export to image/PDF
- Drag-and-drop date range editing
- Filtering and search
- JSON data import/export
- NPM package distribution
- React/Angular/Vue components

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License - Copyright (c) 2018 Lonnie Watson

See [LICENSE](LICENSE) file for full details.

## Author

Lonnie Watson

## Acknowledgments

Built with HTML5 Canvas API and TypeScript.
