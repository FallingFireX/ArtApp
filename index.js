import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { PanResponder } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
// If you’re using keep-awake elsewhere, update to the async API:
// import { activateKeepAwakeAsync, deactivateKeepAwakeAsync } from 'expo-keep-awake';

export default function DrawingApp() {
  // state
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // If you need keep-awake, useEffect would look like this:
  // useEffect(() => {
  //   activateKeepAwakeAsync();
  //   return () => { deactivateKeepAwakeAsync(); };
  // }, []);

  // panResponder recreated on every render
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: ({ nativeEvent: { locationX, locationY } }) => {
      setCurrentPath(`M ${locationX} ${locationY}`);
    },
    onPanResponderMove: ({ nativeEvent: { locationX, locationY } }) => {
      setCurrentPath(prev => `${prev} L ${locationX} ${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath.trim()) {
        setPaths(prev => [
          ...prev,
          {
            path: currentPath,
            color: isEraser ? '#FFFFFF' : brushColor,
            strokeWidth: brushSize,
          },
        ]);
      }
      setCurrentPath('');
    },
  });

  // controls
  const colorOptions = [
    '#000000',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
  ];
  const sizeOptions = [2, 5, 10, 15, 20];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header bar with hamburger */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setMenuOpen(open => !open)}
            style={styles.menuButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="menu" size={32} color="#3498db" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>smArt</Text>
        </View>

        {/* Slide-down menu */}
        {menuOpen && (
          <View style={styles.menuContainer}>
            {/* Eraser / Clear toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity
                style={[styles.button, isEraser && styles.activeButton]}
                onPress={() => setIsEraser(e => !e)}
              >
                <Text style={styles.buttonText}>
                  {isEraser ? 'Brush' : 'Eraser'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setPaths([]);
                  setCurrentPath('');
                }}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Color picker */}
            <View style={styles.colorContainer}>
              {colorOptions.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.colorButton,
                    { backgroundColor: c },
                    brushColor === c && !isEraser && styles.selectedColor,
                  ]}
                  onPress={() => {
                    setBrushColor(c);
                    setIsEraser(false);
                  }}
                />
              ))}
            </View>

            {/* Size picker */}
            <View style={styles.sizeContainer}>
              {sizeOptions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.sizeButton,
                    brushSize === s && styles.selectedSize,
                  ]}
                  onPress={() => setBrushSize(s)}
                >
                  <View
                    style={[styles.sizeIndicator, { width: s, height: s }]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Drawing canvas */}
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg height="100%" width="100%">
            {paths.map((item, idx) => (
              <Path
                key={idx}
                d={item.path}
                stroke={item.color}
                strokeWidth={item.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuButton: { padding: 5 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuContainer: { backgroundColor: '#fff', paddingBottom: 10 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  button: { backgroundColor: '#3498db', padding: 8, borderRadius: 5 },
  activeButton: { backgroundColor: '#e74c3c' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: { borderWidth: 3, borderColor: '#333' },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
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
  selectedSize: { borderWidth: 2, borderColor: '#3498db' },
  sizeIndicator: { backgroundColor: '#000', borderRadius: 10 },
  canvas: {
    flex: 1,
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    margin: 10,
  },
});
