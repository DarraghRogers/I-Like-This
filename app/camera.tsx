import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [capturing, setCapturing] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need camera access so you can take photos of items you like.
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

  const takePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });
      if (photo?.uri) {
        router.replace({
          pathname: "/add-item",
          params: { photoUri: photo.uri },
        });
      }
    } catch {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.topBar}>
          <Pressable style={styles.topBtn} onPress={() => router.back()}>
            <Text style={styles.topBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={styles.topBtn}
            onPress={() =>
              setFacing((f) => (f === "back" ? "front" : "back"))
            }
          >
            <Text style={styles.topBtnText}>Flip</Text>
          </Pressable>
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.hint}>Take a photo of the item</Text>
          <Pressable
            style={[styles.shutter, capturing && styles.shutterDisabled]}
            onPress={takePhoto}
          >
            <View style={styles.shutterInner} />
          </Pressable>
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
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  bottomBar: {
    alignItems: "center",
    paddingBottom: 50,
  },
  hint: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
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
