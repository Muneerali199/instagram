import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Plus,
} from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useState, useEffect, useCallback } from "react";
import {
  getPosts,
  likePost,
  addComment,
  getUser,
  getStories,
  markStoryViewed,
  addStory,
} from "../../../utils/storage";
import * as ImagePicker from "expo-image-picker";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import StoryViewer from "../../../components/StoryViewer";

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [user, setUser] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const loadData = useCallback(async () => {
    const loadedPosts = await getPosts();
    const loadedUser = await getUser();
    const loadedStories = await getStories();
    setPosts(loadedPosts);
    setUser(loadedUser);
    setStories(loadedStories);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleLike = async (postId) => {
    await likePost(postId);
    await loadData();
  };

  const handleComment = async (postId) => {
    const comment = commentInputs[postId];
    if (comment && comment.trim()) {
      await addComment(postId, comment.trim());
      setCommentInputs({ ...commentInputs, [postId]: "" });
      await loadData();
    }
  };

  const handleAddStory = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await addStory(result.assets[0].uri);
      await loadData();
    }
  };

  const handleViewStory = async (index) => {
    setCurrentStoryIndex(index);
    setShowStoryViewer(true);
    if (index < stories.length) {
      await markStoryViewed(stories[index].id);
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setShowStoryViewer(false);
      setCurrentStoryIndex(null);
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handleCloseStory = () => {
    setShowStoryViewer(false);
    setCurrentStoryIndex(null);
  };

  if (!fontsLoaded) {
    return null;
  }

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

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
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        >
          Feed
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stories Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            flexGrow: 0,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#262626" : "#EFEFEF",
          }}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {/* Add Story */}
          <TouchableOpacity
            onPress={handleAddStory}
            style={{ alignItems: "center", marginRight: 12 }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: isDark ? "#262626" : "#EFEFEF",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: isDark ? "#000000" : "#FFFFFF",
              }}
            >
              <Image
                source={{ uri: user?.avatar }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
                contentFit="cover"
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#0095F6",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: isDark ? "#000000" : "#FFFFFF",
                }}
              >
                <Plus size={12} color="#FFFFFF" />
              </View>
            </View>
            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#FFFFFF" : "#000000",
              }}
            >
              Your story
            </Text>
          </TouchableOpacity>

          {/* Story Items */}
          {stories.map((story, index) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => handleViewStory(index)}
              style={{ alignItems: "center", marginRight: 12 }}
            >
              <View
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  padding: 2,
                  background: story.viewed
                    ? isDark
                      ? "#262626"
                      : "#DBDBDB"
                    : "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
                  borderWidth: 2,
                  borderColor: story.viewed
                    ? isDark
                      ? "#262626"
                      : "#DBDBDB"
                    : "#E1306C",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    borderWidth: 2,
                    borderColor: isDark ? "#000000" : "#FFFFFF",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: story.avatar }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </View>
              </View>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#FFFFFF" : "#000000",
                }}
                numberOfLines={1}
              >
                {story.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Posts */}
        {posts.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 80,
              paddingHorizontal: 40,
            }}
          >
            <Heart size={48} color={isDark ? "#262626" : "#DBDBDB"} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No Posts Yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#A8A8A8" : "#8E8E8E",
                textAlign: "center",
              }}
            >
              Create your first post to get started!
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              user={user}
              isDark={isDark}
              onLike={() => handleLike(post.id)}
              commentInput={commentInputs[post.id] || ""}
              onCommentChange={(text) =>
                setCommentInputs({ ...commentInputs, [post.id]: text })
              }
              onCommentSubmit={() => handleComment(post.id)}
              formatTime={formatTime}
            />
          ))
        )}
      </ScrollView>

      {/* Story Viewer Modal */}
      <Modal
        visible={showStoryViewer && currentStoryIndex !== null}
        animationType="fade"
        onRequestClose={handleCloseStory}
      >
        {showStoryViewer &&
          currentStoryIndex !== null &&
          currentStoryIndex < stories.length && (
            <StoryViewer
              story={stories[currentStoryIndex]}
              onClose={handleCloseStory}
              onNext={handleNextStory}
              onPrevious={handlePreviousStory}
            />
          )}
      </Modal>
    </View>
  );
}

function PostItem({
  post,
  user,
  isDark,
  onLike,
  commentInput,
  onCommentChange,
  onCommentSubmit,
  formatTime,
}) {
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(0);

  const handleDoubleTap = () => {
    if (!post.liked) {
      onLike();
    }
    heartScale.value = withSequence(
      withSpring(1.2),
      withTiming(0, { duration: 600 }),
    );
  };

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(handleDoubleTap)();
    });

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Image
          source={{ uri: post.avatar }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
          contentFit="cover"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            {post.username}
          </Text>
        </View>
        {!post.synced && (
          <View
            style={{
              backgroundColor: isDark ? "#262626" : "#F2F2F2",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Inter_500Medium",
                color: isDark ? "#A8A8A8" : "#8E8E8E",
              }}
            >
              Syncing...
            </Text>
          </View>
        )}
      </View>

      {/* Image with Double Tap */}
      <GestureDetector gesture={doubleTapGesture}>
        <View>
          <Image
            source={{ uri: post.image }}
            style={{ width: "100%", aspectRatio: 1 }}
            contentFit="cover"
          />
          <Animated.View
            style={[
              {
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: -60,
                marginLeft: -60,
              },
              heartAnimatedStyle,
            ]}
            pointerEvents="none"
          >
            <Heart size={120} color="#FFFFFF" fill="#FFFFFF" />
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Actions */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 12,
        }}
      >
        <TouchableOpacity onPress={onLike}>
          <Heart
            size={24}
            color={post.liked ? "#FF3B30" : isDark ? "#FFFFFF" : "#000000"}
            fill={post.liked ? "#FF3B30" : "none"}
          />
        </TouchableOpacity>
        <MessageCircle
          size={24}
          color={isDark ? "#FFFFFF" : "#000000"}
          style={{ marginLeft: 16 }}
        />
        <Send
          size={24}
          color={isDark ? "#FFFFFF" : "#000000"}
          style={{ marginLeft: 16 }}
        />
        <View style={{ flex: 1 }} />
        <Bookmark size={24} color={isDark ? "#FFFFFF" : "#000000"} />
      </View>

      {/* Likes */}
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Inter_600SemiBold",
          color: isDark ? "#FFFFFF" : "#000000",
          paddingHorizontal: 16,
          marginTop: 8,
        }}
      >
        {post.likes} {post.likes === 1 ? "like" : "likes"}
      </Text>

      {/* Caption */}
      {post.caption && (
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>
              {post.username}
            </Text>{" "}
            {post.caption}
          </Text>
        </View>
      )}

      {/* Comments */}
      {post.comments && post.comments.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#A8A8A8" : "#8E8E8E",
              marginBottom: 4,
            }}
          >
            View all {post.comments.length} comments
          </Text>
          {post.comments.slice(-2).map((comment) => (
            <Text
              key={comment.id}
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#FFFFFF" : "#000000",
                marginTop: 2,
              }}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold" }}>
                {user?.username}
              </Text>{" "}
              {comment.text}
            </Text>
          ))}
        </View>
      )}

      {/* Timestamp */}
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_400Regular",
          color: isDark ? "#A8A8A8" : "#8E8E8E",
          paddingHorizontal: 16,
          marginTop: 4,
        }}
      >
        {formatTime(post.timestamp)}
      </Text>

      {/* Add Comment */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#262626" : "#EFEFEF",
        }}
      >
        <Image
          source={{ uri: user?.avatar }}
          style={{ width: 24, height: 24, borderRadius: 12 }}
          contentFit="cover"
        />
        <TextInput
          value={commentInput}
          onChangeText={onCommentChange}
          placeholder="Add a comment..."
          placeholderTextColor={isDark ? "#A8A8A8" : "#8E8E8E"}
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#FFFFFF" : "#000000",
            paddingVertical: 8,
          }}
        />
        {commentInput && (
          <TouchableOpacity onPress={onCommentSubmit}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#0095F6",
              }}
            >
              Post
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
