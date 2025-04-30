// Welcome to smART!
// a drawing/markup app with:
// Draw, Erase, Save, Share, & Background
// --------------------------------------------------------------------------------------
// This React Native component provides a simple drawing canvas with:
// - Brush and adjustable sizes
// - Importing a background image
// - Transparent eraser (with flashing user feedback so users can see it on light or dark   backgrounds)

import React, { useState, useRef, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Share, Alert, Image,} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PanResponder } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

// Colors used to flash the eraser indicator: white -> gray -> black -> gray
const eraserSequence = ['#FFFFFF', '#AAAAAA', '#000000', '#AAAAAA'];

export default function DrawingApp() {
  // ---------------------
  // Initialize Components
  // ---------------------
  const [paths, setPaths] = useState([]); // For storing and rendering previous lines
  const [currentPath, setCurrentPath] = useState(''); // For current line
  const [brushColor, setBrushColor] = useState('#000000'); // brush color (with '#[default]')
  const [brushSize, setBrushSize] = useState(5); // line thickness in pixels
  const [isEraser, setIsEraser] = useState(false); // Bool for Eraser mode  
  const [eraserIndex, setEraserIndex] = useState(0); // For flashing eraser indication
  const [menuOpen, setMenuOpen] = useState(false); // Bool for Hamburger menu
  const [bgImage, setBgImage] = useState(null); // Imported background photo URI

  // Ref to capture the canvas view for save/share
  const viewShotRef = useRef(null);

  // ------------------------------------------------
  // Flashing Eraser Feedback (cycles colors rapidly)
  // ------------------------------------------------
  useEffect(() => {
    let interval;
    if (isEraser) {
      // Cycle through eraserSequence every 150ms
      interval = setInterval(() => {
        setEraserIndex((i) => (i + 1) % eraserSequence.length);
      }, 150);
    } else {
      // Reset to first color when not erasing
      setEraserIndex(0);
    }
    return () => clearInterval(interval);
  }, [isEraser]);

  // -------------------------------------------------
  // Helper: Parse an SVG path string into point array
  // -------------------------------------------------
  function parsePoints(pathStr) {
    return pathStr
      .split(/[ML]/)
      .slice(1)
      .map((seg) => {
        const [x, y] = seg.trim().split(/\s+/).map(Number);
        return { x, y };
      });
  }

  // ----------------------------------
  // PanResponder for Drawing & Erasing
  // ----------------------------------
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    // Begin new path on touch
    onPanResponderGrant: ({ nativeEvent: { locationX, locationY } }) => {
      setCurrentPath(`M ${locationX} ${locationY}`);
    },

    // Append line segments as finger moves
    onPanResponderMove: ({ nativeEvent: { locationX, locationY } }) => {
      setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
    },

    // On release: commit path or erase intersecting strokes
    onPanResponderRelease: () => {
      if (!currentPath.trim()) return;

      if (isEraser) {
        // Remove strokes whose points come within brushSize of eraser path
        const erasePoints = parsePoints(currentPath);
        setPaths((prev) =>
          prev.filter((item) => {
            const strokePoints = parsePoints(item.path);
            return !strokePoints.some((sp) =>
              erasePoints.some(
                (ep) => Math.hypot(sp.x - ep.x, sp.y - ep.y) <= brushSize
              )
            );
          })
        );
      } else {
        // Save normal brush stroke
        setPaths((prev) => [
          ...prev,
          { path: currentPath, color: brushColor, strokeWidth: brushSize },
        ]);
      }
      setCurrentPath('');
    },
  });

  // ------------------------------------
  // Import Background Image from Library
  // ------------------------------------
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert(
        'Permission required',
        'Need photo library access to import images.'
      );
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setBgImage(result.assets[0].uri);
  };

  // ----------------------
  // Undo Last Stroke
  // ----------------------
  const undo = () => setPaths((prev) => prev.slice(0, -1));

  // ----------------------
  // Save Canvas to Camera Roll
  // ----------------------
  const saveImage = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') throw new Error();

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('smART', asset, false);
      Alert.alert('Saved!', 'Your artwork has been saved to the camera roll.');
    } catch {
      Alert.alert('Error', 'Could not save image.');
    }
    setMenuOpen(false);
  };

  // ----------------------
  // Share Canvas via OS Sheet
  // ----------------------
  const shareImage = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Share.share({ url: uri });
    } catch {
      Alert.alert('Error', 'Could not share image.');
    }
    setMenuOpen(false);
  };

  // ----------------------
  // Clear Entire Canvas
  // ----------------------
  const clearCanvas = () => {
    Alert.alert('Are you sure?', 'This will clear your entire drawing.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setPaths([]);
          setCurrentPath('');
        },
      },
    ]);
  };

  // Options for color and brush sizes
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
        {/* Header: Menu, Title, Clear */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setMenuOpen((o) => !o)}
            style={styles.menuButton}
            hitSlop={styles.hitSlop}>
            <Ionicons name="menu" size={32} color="#3498db" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>smART</Text>
          <TouchableOpacity
            onPress={clearCanvas}
            style={styles.menuButton}
            hitSlop={styles.hitSlop}>
            <Ionicons name="trash-outline" size={28} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        {/* Slide-down Menu */}
        {menuOpen && (
          <View style={styles.menuContainer}>
            {/* Color & Eraser Selector */}
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
              <TouchableOpacity
                style={[
                  styles.colorButton,
                  styles.eraserButton,
                  isEraser && styles.selectedColor,
                ]}
                onPress={() => setIsEraser(true)}>
                <Text style={styles.eraserText}>E</Text>
              </TouchableOpacity>
            </View>

            {/* Size Picker */}
            <View style={styles.sizeContainer}>
              {sizeOptions.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.sizeButton,
                    brushSize === s && styles.selectedSize,
                  ]}
                  onPress={() => setBrushSize(s)}>
                  <View
                    style={[styles.sizeIndicator, { width: s, height: s }]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions: Undo, Background, Save, Share */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={undo}>
                <Ionicons name="arrow-undo-outline" size={24} color="#3498db" />
                <Text style={styles.actionText}>Undo</Text>
              </TouchableOpacity>

              {/* Background button moved here */}
              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color="#3498db" />
                <Text style={styles.actionText}>Background</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={saveImage}>
                <Ionicons name="save-outline" size={24} color="#3498db" />
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={shareImage}>
                <Ionicons name="share-outline" size={24} color="#3498db" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Drawing Canvas */}
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1.0 }}
            style={styles.canvasContent}>
            {bgImage && (
              <Image source={{ uri: bgImage }} style={styles.backgroundImage} />
            )}
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
              {currentPath !== '' && (
                <Path
                  d={currentPath}
                  stroke={isEraser ? eraserSequence[eraserIndex] : brushColor}
                  strokeWidth={brushSize}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </ViewShot>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// -------------------------
// Stylesheet
// -------------------------
const styles = StyleSheet.create({
  hitSlop: { top: 20, bottom: 20, left: 20, right: 20 },
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
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eraserButton: { backgroundColor: '#fff' },
  eraserText: { color: 'red', fontWeight: 'bold', fontSize: 18 },
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  actionButton: { alignItems: 'center' },
  actionText: { color: '#3498db', fontWeight: 'bold', marginTop: 4 },
  canvas: {
    flex: 1,
    margin: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  canvasContent: { flex: 1 },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
  },
});
