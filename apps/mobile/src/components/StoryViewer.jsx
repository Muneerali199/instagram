import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function StoryViewer({ story, onClose, onNext, onPrevious }) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const progress = useSharedValue(0);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 5000 }, (finished) => {
      if (finished) {
        runOnJS(onNext)();
      }
    });
  }, [story.id]);

  const tapGesture = Gesture.Tap().onEnd((event) => {
    const tapX = event.x;
    if (tapX < SCREEN_WIDTH / 2) {
      runOnJS(onPrevious)();
    } else {
      runOnJS(onNext)();
    }
  });

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <StatusBar style="light" />

        <Image
          source={{ uri: story.image }}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          contentFit="cover"
        />

        <View
          style={{
            position: "absolute",
            top: insets.top + 12,
            left: 0,
            right: 0,
            paddingHorizontal: 12,
          }}
        >
          <View
            style={{
              height: 2,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={[
                {
                  height: "100%",
                  backgroundColor: "#FFFFFF",
                },
                progressStyle,
              ]}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Image
                source={{ uri: story.avatar }}
                style={{ width: 32, height: 32, borderRadius: 16 }}
                contentFit="cover"
              />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                {story.username}
              </Text>
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  fontFamily: "Inter_600SemiBold",
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                {story.timestamp
                  ? new Date(story.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : ""}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <X size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}
