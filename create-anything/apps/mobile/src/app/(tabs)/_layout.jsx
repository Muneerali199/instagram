import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import {
  Home,
  PlusCircle,
  MessageCircle,
  User,
  Search,
  Bell,
} from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#000000" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#262626" : "#DBDBDB",
        },
        tabBarActiveTintColor: isDark ? "#FFFFFF" : "#000000",
        tabBarInactiveTintColor: isDark ? "#A8A8A8" : "#8E8E8E",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => <Home color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages/[chatId]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={26} />,
        }}
      />
      <Tabs.Screen
        name="profile/edit"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
