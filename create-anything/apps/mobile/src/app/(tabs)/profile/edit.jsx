import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useState, useEffect, useCallback } from "react";
import { getUser, saveUser } from "../../../utils/storage";
import { useRouter } from "expo-router";
import KeyboardAvoidingAnimatedView from "../../../components/KeyboardAvoidingAnimatedView";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    const loadUser = async () => {
      const user = await getUser();
      if (user) {
        setUsername(user.username || "");
        setBio(user.bio || "");
      }
    };
    loadUser();
  }, []);

  const handleSave = useCallback(async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    Keyboard.dismiss();
    setSaving(true);

    try {
      const user = await getUser();
      await saveUser({
        ...user,
        username: username.trim(),
        bio: bio.trim(),
      });

      Alert.alert("Success", "Profile updated!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }, [username, bio, router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View
        style={{ flex: 1, backgroundColor: isDark ? "#000000" : "#FFFFFF" }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 8,
            backgroundColor: isDark ? "#000000" : "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#262626" : "#DBDBDB",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Edit Profile
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: saving ? (isDark ? "#1A3A5C" : "#B3D9FF") : "#0095F6",
              }}
            >
              {saving ? "Saving..." : "Done"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: isDark ? "#A8A8A8" : "#8E8E8E",
              marginBottom: 8,
            }}
          >
            Username
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor={isDark ? "#A8A8A8" : "#8E8E8E"}
            style={{
              backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#FFFFFF" : "#000000",
              marginBottom: 24,
            }}
          />

          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: isDark ? "#A8A8A8" : "#8E8E8E",
              marginBottom: 8,
            }}
          >
            Bio
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Write a bio..."
            placeholderTextColor={isDark ? "#A8A8A8" : "#8E8E8E"}
            multiline
            style={{
              backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#FFFFFF" : "#000000",
              minHeight: 100,
              textAlignVertical: "top",
            }}
          />
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
