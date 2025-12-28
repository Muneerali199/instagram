import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Camera, Grid3x3, Settings } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useState, useEffect, useCallback } from "react";
import { getUser, getPosts } from "../../../utils/storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { saveUser } from "../../../utils/storage";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const loadProfile = useCallback(async () => {
    const loadedUser = await getUser();
    const loadedPosts = await getPosts();
    setUser(loadedUser);
    setPosts(loadedPosts);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const updatedUser = { ...user, avatar: result.assets[0].uri };
      await saveUser(updatedUser);
      setUser(updatedUser);
    }
  };

  if (!fontsLoaded || !user) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000000" : "#FFFFFF" }}>
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
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        >
          {user.username}
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile/edit")}>
          <Settings size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View
          style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                contentFit="cover"
              />
              <TouchableOpacity
                onPress={handleImagePicker}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#0095F6",
                  borderWidth: 2,
                  borderColor: isDark ? "#000000" : "#FFFFFF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Camera size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-around",
                marginLeft: 24,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  {posts.length}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#A8A8A8" : "#8E8E8E",
                  }}
                >
                  Posts
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  0
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#A8A8A8" : "#8E8E8E",
                  }}
                >
                  Followers
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  0
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#A8A8A8" : "#8E8E8E",
                  }}
                >
                  Following
                </Text>
              </View>
            </View>
          </View>

          {user.bio && (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#FFFFFF" : "#000000",
                marginBottom: 12,
              }}
            >
              {user.bio}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile/edit")}
            style={{
              backgroundColor: isDark ? "#262626" : "#EFEFEF",
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: isDark ? "#262626" : "#DBDBDB",
            paddingTop: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: 12,
            }}
          >
            <Grid3x3 size={20} color={isDark ? "#FFFFFF" : "#000000"} />
          </View>

          {posts.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 60,
              }}
            >
              <Camera size={48} color={isDark ? "#262626" : "#DBDBDB"} />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                  marginTop: 16,
                }}
              >
                No Posts Yet
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {posts.map((post, index) => (
                <View
                  key={post.id}
                  style={{
                    width: "33.33%",
                    aspectRatio: 1,
                    padding: 1,
                  }}
                >
                  <Image
                    source={{ uri: post.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
