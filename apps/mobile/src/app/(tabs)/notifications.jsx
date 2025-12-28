import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../utils/storage";
import Animated, { FadeIn } from "react-native-reanimated";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const loadNotifications = useCallback(async () => {
    const loaded = await getNotifications();
    setNotifications(loaded);
    setUnreadCount(loaded.filter((n) => !n.read).length);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    await loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = useCallback(
    async (notificationId) => {
      await markNotificationRead(notificationId);
      await loadNotifications();
    },
    [loadNotifications],
  );

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
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart size={20} color="#FF3B30" fill="#FF3B30" />;
      case "comment":
        return (
          <MessageCircle size={20} color={isDark ? "#FFFFFF" : "#000000"} />
        );
      case "follow":
        return <UserPlus size={20} color="#0095F6" />;
      default:
        return <Bell size={20} color={isDark ? "#FFFFFF" : "#000000"} />;
    }
  };

  const getNotificationText = (notification) => {
    const { type, data } = notification;
    switch (type) {
      case "like":
        return `${data.username} liked your post`;
      case "comment":
        return `${data.username} commented: ${data.comment}`;
      case "follow":
        return `${data.username} started following you`;
      case "message":
        return `${data.username} sent you a message`;
      default:
        return "New notification";
    }
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#FFFFFF" : "#000000",
          }}
        >
          Notifications
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#0095F6",
              }}
            >
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 80,
              paddingHorizontal: 40,
            }}
          >
            <Bell size={48} color={isDark ? "#262626" : "#DBDBDB"} />
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#FFFFFF" : "#000000",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No Notifications
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#A8A8A8" : "#8E8E8E",
                textAlign: "center",
              }}
            >
              You're all caught up!
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <Animated.View key={notification.id} entering={FadeIn}>
              <TouchableOpacity
                onPress={() => handleNotificationPress(notification.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: !notification.read
                    ? isDark
                      ? "#0A1929"
                      : "#E7F3FF"
                    : isDark
                      ? "#000000"
                      : "#FFFFFF",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isDark ? "#262626" : "#EFEFEF",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: !notification.read
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                      color: isDark ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {getNotificationText(notification)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: isDark ? "#A8A8A8" : "#8E8E8E",
                      marginTop: 2,
                    }}
                  >
                    {formatTime(notification.timestamp)}
                  </Text>
                </View>

                {notification.data.postImage && (
                  <Image
                    source={{ uri: notification.data.postImage }}
                    style={{ width: 44, height: 44, borderRadius: 4 }}
                    contentFit="cover"
                  />
                )}

                {!notification.read && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#0095F6",
                      marginLeft: 12,
                    }}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
