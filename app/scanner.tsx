import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan barcodes.
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarcodeScanned = ({
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;
    setScanned(true);
    router.replace({
      pathname: "/add-item",
      params: { barcode: data },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
            "qr",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.topBtn} onPress={() => router.back()}>
            <Text style={styles.topBtnText}>Cancel</Text>
          </Pressable>
        </View>

        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.hint}>
            Point your camera at a barcode
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
  topBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    width: 260,
    height: 160,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#007AFF",
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  hint: {
    color: "#fff",
    fontSize: 16,
    marginTop: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  cancelBtn: {
    padding: 12,
  },
  cancelBtnText: {
    color: "#888",
    fontSize: 16,
  },
});
