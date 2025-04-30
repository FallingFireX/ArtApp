
## smART Components

### App.js (src/App.js)
- **DrawingApp**: The primary component managing:
  - **State**: Tracks `paths`, `currentPath`, `brushColor`, `brushSize`, `isEraser`, `bgImage`
  - **PanResponder**: Handles touch gestures for drawing and erasing
  - **SVG Canvas**: Renders strokes using `react-native-svg`
  - **ViewShot**: Wraps the canvas to capture the full view (drawing + background)
  - **ImagePicker**: Imports a background image from the device library
  - **MediaLibrary**: Saves captured images to the camera roll
  - **Share API**: Shares the captured image via the system share sheet

## Libraries & Dependencies
- **React & React Native**: Core framework
- **Expo Modules**:
  - `expo-image-picker` for importing photos
  - `expo-media-library` for saving images
- **SVG & Capture**:
  - `react-native-svg` for vector drawing
  - `react-native-view-shot` for snapshotting the canvas
- **Safe Areas**:
  - `react-native-safe-area-context` to handle device notches
- **Icons**:
  - `@expo/vector-icons` (Ionicons) for toolbar icons

## Feature Workflow

1. **Drawing**: 
   - User selects color/eraser and size.
   - Touch gestures build an SVG path.
   - On release, the path is added to `paths`.

2. **Erasing**:
   - In Eraser mode, gestures identify points within `brushSize` of existing strokes.
   - Matching strokes are removed (transparent erase).

3. **Background Import**:
   - Opens device media library.
   - Selected image URI is rendered behind strokes.

4. **Save & Share**:
   - Canvas (SVG + background) captured by ViewShot.
   - User can save to camera roll or share via native share dialog.

## Styling & Theming
- Clean, minimalist UI using `StyleSheet`
- Toolbar slides down with color swatches, size selector, and action buttons.
- Header contains menu toggle and clear action.

## Future Extensions
- Layer management (bring strokes forward/back)
- Export in different formats (JPEG, PDF)
- Network sync for collaborative drawing
