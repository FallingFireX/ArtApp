import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PanResponder, Animated } from 'react-native';
import { Svg, Path } from 'react-native-svg';

function DrawingApp() {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [brushColor, setBrushColor] = useState('#000000'); // Default black - Brush color
  const [brushSize, setBrushSize] = useState(5);           // Default 5px - Brush size
  const [isEraser, setIsEraser] = useState(false);         // Default false - Eraser toggle

  // Create a pan responder to handle touch events
const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      // Set currentPath only if it's not already initialized
      if (!currentPath) {  // This ensures we only start a new line if currentPath is empty
        setCurrentPath(`M ${locationX} ${locationY}`);
      }
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      setCurrentPath(prevPath => `${prevPath} L ${locationX} ${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath.trim() !== '') {  // Only save non-empty paths
        setPaths(prevPaths => [
          ...prevPaths,
          {
            path: currentPath,
            color: isEraser ? '#FFFFFF' : brushColor,
            strokeWidth: brushSize,
          },
        ]);
      }
    },
  })
).current;


  // Toggle eraser function
  const toggleEraser = () => {
    setIsEraser(prev => !prev);
  };

  // Color selection buttons
  const colorOptions = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

  const handleColorChange = (color) => {
    setBrushColor(color);
    setIsEraser(false); // Turn off eraser if color is changed
  };

  // Brush size buttons
  const sizeOptions = [2, 5, 10, 15, 20];

  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
  };

  // Clear canvas function
  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.button, isEraser && styles.activeButton]}
          onPress={toggleEraser}
        >
          <Text style={styles.buttonText}>
            {isEraser ? 'Brush' : 'Eraser'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={clearCanvas}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colorContainer}>
        {colorOptions.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              brushColor === color && styles.selectedColor,
            ]}
            onPress={() => handleColorChange(color)}
          />
        ))}
      </View>

      <View style={styles.sizeContainer}>
        {sizeOptions.map((size, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sizeButton,
              brushSize === size && styles.selectedSize,
            ]}
            onPress={() => handleBrushSizeChange(size)}
          >
            <View style={[styles.sizeIndicator, { width: size, height: size }]} />
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={styles.canvas}
        {...panResponder.panHandlers}
      >
        <Svg height="100%" width="100%">
          {/* Render saved paths */}
          {paths.map((item, index) => (
            <Path
              key={index}
              d={item.path}
              stroke={item.color}
              strokeWidth={item.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Render current path */}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={isEraser ? '#FFFFFF' : brushColor}
              strokeWidth={brushSize}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  activeButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#333',
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  sizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSize: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  sizeIndicator: {
    backgroundColor: '#000',
    borderRadius: 10,
  },
  canvas: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
});

export default DrawingApp;