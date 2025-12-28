import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const KEYS = {
  USER: "@user",
  POSTS: "@posts",
  MESSAGES: "@messages",
  CONVERSATIONS: "@conversations",
  SYNC_QUEUE: "@sync_queue",
  STORIES: "@stories",
  NOTIFICATIONS: "@notifications",
  SEARCH_HISTORY: "@search_history",
};

// User operations
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

export const saveUser = async (userData) => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Error saving user:", error);
    return false;
  }
};

// Posts operations
export const getPosts = async () => {
  try {
    const posts = await AsyncStorage.getItem(KEYS.POSTS);
    return posts ? JSON.parse(posts) : [];
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
};

export const savePosts = async (posts) => {
  try {
    await AsyncStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    return true;
  } catch (error) {
    console.error("Error saving posts:", error);
    return false;
  }
};

export const addPost = async (post) => {
  try {
    const posts = await getPosts();
    const newPost = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      synced: false,
      ...post,
    };
    posts.unshift(newPost);
    await savePosts(posts);
    await addToSyncQueue("create_post", newPost);
    return newPost;
  } catch (error) {
    console.error("Error adding post:", error);
    return null;
  }
};

export const likePost = async (postId) => {
  try {
    const posts = await getPosts();
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex !== -1) {
      posts[postIndex].liked = !posts[postIndex].liked;
      posts[postIndex].likes =
        (posts[postIndex].likes || 0) + (posts[postIndex].liked ? 1 : -1);
      await savePosts(posts);
      await addToSyncQueue("like_post", {
        postId,
        liked: posts[postIndex].liked,
      });
    }
    return true;
  } catch (error) {
    console.error("Error liking post:", error);
    return false;
  }
};

export const addComment = async (postId, comment) => {
  try {
    const posts = await getPosts();
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex !== -1) {
      if (!posts[postIndex].comments) {
        posts[postIndex].comments = [];
      }
      const newComment = {
        id: Date.now().toString(),
        text: comment,
        timestamp: new Date().toISOString(),
        synced: false,
      };
      posts[postIndex].comments.push(newComment);
      await savePosts(posts);
      await addToSyncQueue("add_comment", { postId, comment: newComment });
    }
    return true;
  } catch (error) {
    console.error("Error adding comment:", error);
    return false;
  }
};

// Stories operations
export const getStories = async () => {
  try {
    const stories = await AsyncStorage.getItem(KEYS.STORIES);
    const parsed = stories ? JSON.parse(stories) : [];
    // Filter out expired stories (older than 24 hours)
    const now = Date.now();
    const active = parsed.filter((story) => {
      const storyTime = new Date(story.timestamp).getTime();
      return now - storyTime < 24 * 60 * 60 * 1000;
    });
    if (active.length !== parsed.length) {
      await saveStories(active);
    }
    return active;
  } catch (error) {
    console.error("Error getting stories:", error);
    return [];
  }
};

export const saveStories = async (stories) => {
  try {
    await AsyncStorage.setItem(KEYS.STORIES, JSON.stringify(stories));
    return true;
  } catch (error) {
    console.error("Error saving stories:", error);
    return false;
  }
};

export const addStory = async (imageUri) => {
  try {
    const user = await getUser();
    const stories = await getStories();
    const newStory = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      image: imageUri,
      timestamp: new Date().toISOString(),
      viewed: false,
      synced: false,
    };
    stories.unshift(newStory);
    await saveStories(stories);
    await addToSyncQueue("add_story", newStory);
    return newStory;
  } catch (error) {
    console.error("Error adding story:", error);
    return null;
  }
};

export const markStoryViewed = async (storyId) => {
  try {
    const stories = await getStories();
    const storyIndex = stories.findIndex((s) => s.id === storyId);
    if (storyIndex !== -1) {
      stories[storyIndex].viewed = true;
      await saveStories(stories);
    }
    return true;
  } catch (error) {
    console.error("Error marking story viewed:", error);
    return false;
  }
};

// Notifications operations
export const getNotifications = async () => {
  try {
    const notifications = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
};

export const saveNotifications = async (notifications) => {
  try {
    await AsyncStorage.setItem(
      KEYS.NOTIFICATIONS,
      JSON.stringify(notifications),
    );
    return true;
  } catch (error) {
    console.error("Error saving notifications:", error);
    return false;
  }
};

export const addNotification = async (type, data) => {
  try {
    const notifications = await getNotifications();
    const newNotification = {
      id: Date.now().toString(),
      type, // 'like', 'comment', 'follow', 'message'
      data,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotification);
    await saveNotifications(notifications);
    return newNotification;
  } catch (error) {
    console.error("Error adding notification:", error);
    return null;
  }
};

export const markNotificationRead = async (notificationId) => {
  try {
    const notifications = await getNotifications();
    const notifIndex = notifications.findIndex((n) => n.id === notificationId);
    if (notifIndex !== -1) {
      notifications[notifIndex].read = true;
      await saveNotifications(notifications);
    }
    return true;
  } catch (error) {
    console.error("Error marking notification read:", error);
    return false;
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const notifications = await getNotifications();
    notifications.forEach((n) => (n.read = true));
    await saveNotifications(notifications);
    return true;
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    return false;
  }
};

// Search history operations
export const getSearchHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(KEYS.SEARCH_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error getting search history:", error);
    return [];
  }
};

export const addSearchHistory = async (query) => {
  try {
    const history = await getSearchHistory();
    const filtered = history.filter((h) => h.query !== query);
    filtered.unshift({
      query,
      timestamp: new Date().toISOString(),
    });
    const trimmed = filtered.slice(0, 20); // Keep last 20 searches
    await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(trimmed));
    return true;
  } catch (error) {
    console.error("Error adding search history:", error);
    return false;
  }
};

export const clearSearchHistory = async () => {
  try {
    await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error("Error clearing search history:", error);
    return false;
  }
};

// Messages operations
export const getConversations = async () => {
  try {
    const conversations = await AsyncStorage.getItem(KEYS.CONVERSATIONS);
    return conversations ? JSON.parse(conversations) : [];
  } catch (error) {
    console.error("Error getting conversations:", error);
    return [];
  }
};

export const saveConversations = async (conversations) => {
  try {
    await AsyncStorage.setItem(
      KEYS.CONVERSATIONS,
      JSON.stringify(conversations),
    );
    return true;
  } catch (error) {
    console.error("Error saving conversations:", error);
    return false;
  }
};

export const getMessages = async (conversationId) => {
  try {
    const messages = await AsyncStorage.getItem(
      `${KEYS.MESSAGES}_${conversationId}`,
    );
    return messages ? JSON.parse(messages) : [];
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
};

export const saveMessages = async (conversationId, messages) => {
  try {
    await AsyncStorage.setItem(
      `${KEYS.MESSAGES}_${conversationId}`,
      JSON.stringify(messages),
    );
    return true;
  } catch (error) {
    console.error("Error saving messages:", error);
    return false;
  }
};

export const sendMessage = async (conversationId, messageText) => {
  try {
    const messages = await getMessages(conversationId);
    const newMessage = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date().toISOString(),
      isMine: true,
      status: "sent",
      synced: false,
    };
    messages.push(newMessage);
    await saveMessages(conversationId, messages);

    // Update conversation last message
    const conversations = await getConversations();
    const convIndex = conversations.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      conversations[convIndex].lastMessage = messageText;
      conversations[convIndex].lastMessageTime = new Date().toISOString();
      await saveConversations(conversations);
    }

    await addToSyncQueue("send_message", {
      conversationId,
      message: newMessage,
    });
    return newMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};

// Sync queue operations
export const getSyncQueue = async () => {
  try {
    const queue = await AsyncStorage.getItem(KEYS.SYNC_QUEUE);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error("Error getting sync queue:", error);
    return [];
  }
};

export const addToSyncQueue = async (action, data) => {
  try {
    const queue = await getSyncQueue();
    queue.push({
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
    });
    await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error("Error adding to sync queue:", error);
    return false;
  }
};

export const clearSyncQueue = async () => {
  try {
    await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error("Error clearing sync queue:", error);
    return false;
  }
};

// Initialize with demo data
export const initializeDemoData = async () => {
  try {
    const existingUser = await getUser();
    if (!existingUser) {
      await saveUser({
        id: "1",
        username: "you",
        bio: "Welcome to your offline social app! 📱",
        avatar:
          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
      });
    }

    const existingPosts = await getPosts();
    if (existingPosts.length === 0) {
      await savePosts([
        {
          id: "1",
          username: "you",
          avatar:
            "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
          image:
            "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
          caption: "Beautiful sunset 🌅",
          likes: 42,
          liked: false,
          comments: [],
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          synced: true,
        },
        {
          id: "2",
          username: "you",
          avatar:
            "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
          image:
            "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800",
          caption: "Mountain vibes ⛰️",
          likes: 28,
          liked: false,
          comments: [],
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          synced: true,
        },
      ]);
    }

    const existingConversations = await getConversations();
    if (existingConversations.length === 0) {
      await saveConversations([
        {
          id: "1",
          name: "Sarah Johnson",
          avatar:
            "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
          lastMessage: "Hey! How are you?",
          lastMessageTime: new Date(Date.now() - 1800000).toISOString(),
          unread: 2,
        },
      ]);

      await saveMessages("1", [
        {
          id: "1",
          text: "Hey! How are you?",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isMine: false,
          status: "read",
          synced: true,
        },
      ]);
    }

    // Initialize demo stories
    const existingStories = await getStories();
    if (existingStories.length === 0) {
      const user = await getUser();
      await saveStories([
        {
          id: "story1",
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          image:
            "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          viewed: false,
          synced: true,
        },
      ]);
    }

    // Initialize demo notifications
    const existingNotifications = await getNotifications();
    if (existingNotifications.length === 0) {
      await saveNotifications([
        {
          id: "notif1",
          type: "like",
          data: {
            username: "demo_user",
            postImage:
              "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=200",
          },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
        {
          id: "notif2",
          type: "comment",
          data: {
            username: "jane_doe",
            comment: "Amazing shot!",
            postImage:
              "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=200",
          },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false,
        },
      ]);
    }

    return true;
  } catch (error) {
    console.error("Error initializing demo data:", error);
    return false;
  }
};
