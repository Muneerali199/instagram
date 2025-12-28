import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Search as SearchIcon, X, Clock } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useState, useEffect, useCallback } from "react";
import {
  getPosts,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
} from "../../utils/storage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const loadData = useCallback(async () => {
    const loadedPosts = await getPosts();
    const history = await getSearchHistory();
    setPosts(loadedPosts);
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const query = searchQuery.toLowerCase();
      const filtered = posts.filter(
        (post) =>
          post.username.toLowerCase().includes(query) ||
          post.caption?.toLowerCase().includes(query),
      );
      setFilteredPosts(filtered);
    } else {
      setIsSearching(false);
      setFilteredPosts([]);
    }
  }, [searchQuery, posts]);

  const handleSearch = useCallback(
    async (query) => {
      if (query.trim()) {
        await addSearchHistory(query.trim());
        await loadData();
      }
    },
    [loadData],
  );

  const handleClearHistory = useCallback(async () => {
    await clearSearchHistory();
    await loadData();
  }, [loadData]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000000" : "#FFFFFF" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
          backgroundColor: isDark ? "#000000" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#262626" : "#DBDBDB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#262626" : "#EFEFEF",
            borderRadius: 10,
            paddingHorizontal: 12,
          }}
        >
          <SearchIcon size={20} color={isDark ? "#A8A8A8" : "#8E8E8E"} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            placeholder="Search"
            placeholderTextColor={isDark ? "#A8A8A8" : "#8E8E8E"}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              fontSize: 16,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color={isDark ? "#A8A8A8" : "#8E8E8E"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {!isSearching && searchHistory.length > 0 && (
          <View style={{ paddingTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
              >
                Recent
              </Text>
              <TouchableOpacity onPress={handleClearHistory}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    color: "#0095F6",
                  }}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
            {searchHistory.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSearchQuery(item.query)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Clock size={20} color={isDark ? "#A8A8A8" : "#8E8E8E"} />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#FFFFFF" : "#000000",
                  }}
                >
                  {item.query}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isSearching && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            {filteredPosts.length === 0 ? (
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 80,
                  paddingHorizontal: 40,
                }}
              >
                <SearchIcon size={48} color={isDark ? "#262626" : "#DBDBDB"} />
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#FFFFFF" : "#000000",
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                  No Results
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#A8A8A8" : "#8E8E8E",
                    textAlign: "center",
                  }}
                >
                  Try searching for something else
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {filteredPosts.map((post) => (
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
          </Animated.View>
        )}

        {!isSearching && searchHistory.length === 0 && (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 80,
              paddingHorizontal: 40,
            }}
          >
            <SearchIcon size={48} color={isDark ? "#262626" : "#DBDBDB"} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Search
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#A8A8A8" : "#8E8E8E",
                textAlign: "center",
              }}
            >
              Search for posts and users
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
