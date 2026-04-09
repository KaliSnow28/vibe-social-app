import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  postsCount: number;
  isVerified: boolean;
  isOnline?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  seen: boolean;
  isLive?: boolean;
  imageUrl?: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  imageUrl: string;
  caption: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  commentsCount: number;
  comments: Comment[];
  location?: string;
  timestamp: number;
  isReel?: boolean;
  reelDuration?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
  type?: "text" | "image" | "emoji";
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  isGroup?: boolean;
  groupName?: string;
  messages: Message[];
  isOnline?: boolean;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "tag";
  userId: string;
  username: string;
  avatar: string;
  text: string;
  postImage?: string;
  timestamp: number;
  read: boolean;
}

const ME: User = {
  id: "me",
  username: "yourhandle",
  displayName: "Your Name",
  bio: "Living life one post at a time ✌ | Creator | Explorer",
  avatar:
    "https://i.pravatar.cc/150?img=1",
  followers: 1204,
  following: 847,
  postsCount: 42,
  isVerified: false,
};

const AVATARS = [
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=6",
  "https://i.pravatar.cc/150?img=7",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=10",
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=12",
];

const POST_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600",
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
  "https://images.unsplash.com/photo-1490750967868-88df5691cc23?w=600",
  "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600",
  "https://images.unsplash.com/photo-1525498128493-380d1990a112?w=600",
];

const USERNAMES = [
  "alex_creates",
  "sarah.vibes",
  "marco_photo",
  "julia.world",
  "tomtravel",
  "mia.art",
  "liamshots",
  "emma_life",
  "noah.lens",
  "ava.daily",
];

const NAMES = [
  "Alex Creates",
  "Sarah Vibes",
  "Marco Photo",
  "Julia World",
  "Tom Travel",
  "Mia Art",
  "Liam Shots",
  "Emma Life",
  "Noah Lens",
  "Ava Daily",
];

const CAPTIONS = [
  "Golden hour never disappoints 🌅 #photography #nature",
  "City life, city lights ✨ #urban #explore",
  "Sometimes you just need to stop and breathe 🌿 #mindful",
  "Adventures await! Where should I go next? 🗺️",
  "Good vibes only this weekend ☀️ #weekendmood",
  "Found this hidden gem in the mountains ⛰️ #hiking",
  "Coffee and creativity, the perfect combo ☕ #morning",
  "Every sunset is an opportunity to reset 🌇",
  "Living for moments like these 💫 #blessed",
  "New places, new faces, new stories 🌍 #travel",
];

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function makeUser(index: number): User {
  return {
    id: makeId(),
    username: USERNAMES[index % USERNAMES.length],
    displayName: NAMES[index % NAMES.length],
    bio: "Living the dream | Creator",
    avatar: AVATARS[index % AVATARS.length],
    followers: Math.floor(Math.random() * 50000) + 500,
    following: Math.floor(Math.random() * 2000) + 100,
    postsCount: Math.floor(Math.random() * 200) + 10,
    isVerified: index % 3 === 0,
    isOnline: index % 2 === 0,
  };
}

const MOCK_USERS: User[] = Array.from({ length: 10 }, (_, i) => makeUser(i));

function makeStories(): Story[] {
  const stories: Story[] = [
    {
      id: "my-story",
      userId: "me",
      username: "Your Story",
      avatar: ME.avatar,
      seen: false,
      timestamp: Date.now() - 1000 * 60 * 30,
    },
    ...MOCK_USERS.map((u, i) => ({
      id: `story-${i}`,
      userId: u.id,
      username: u.username,
      avatar: u.avatar,
      seen: i > 5,
      isLive: i === 2,
      timestamp: Date.now() - 1000 * 60 * (i + 1) * 20,
    })),
  ];
  return stories;
}

function makePosts(): Post[] {
  return MOCK_USERS.map((u, i) => ({
    id: `post-${i}`,
    userId: u.id,
    username: u.username,
    avatar: u.avatar,
    isVerified: u.isVerified,
    imageUrl: POST_IMAGES[i % POST_IMAGES.length],
    caption: CAPTIONS[i % CAPTIONS.length],
    likes: Math.floor(Math.random() * 5000) + 100,
    liked: false,
    saved: false,
    commentsCount: Math.floor(Math.random() * 200) + 5,
    comments: [
      {
        id: makeId(),
        userId: MOCK_USERS[(i + 1) % MOCK_USERS.length].id,
        username: MOCK_USERS[(i + 1) % MOCK_USERS.length].username,
        avatar: MOCK_USERS[(i + 1) % MOCK_USERS.length].avatar,
        text: "This is absolutely stunning! 😍",
        likes: Math.floor(Math.random() * 50),
        timestamp: Date.now() - 1000 * 60 * 30,
      },
      {
        id: makeId(),
        userId: MOCK_USERS[(i + 2) % MOCK_USERS.length].id,
        username: MOCK_USERS[(i + 2) % MOCK_USERS.length].username,
        avatar: MOCK_USERS[(i + 2) % MOCK_USERS.length].avatar,
        text: "Goals 🔥 Love this so much!",
        likes: Math.floor(Math.random() * 30),
        timestamp: Date.now() - 1000 * 60 * 20,
      },
    ],
    location: i % 3 === 0 ? "New York, NY" : undefined,
    timestamp: Date.now() - 1000 * 60 * 60 * (i + 1),
  }));
}

function makeReels(): Post[] {
  return MOCK_USERS.map((u, i) => ({
    id: makeId(),
    userId: u.id,
    username: u.username,
    avatar: u.avatar,
    isVerified: u.isVerified,
    imageUrl: POST_IMAGES[(i + 3) % POST_IMAGES.length],
    caption: CAPTIONS[(i + 2) % CAPTIONS.length] + " #reels #viral",
    likes: Math.floor(Math.random() * 100000) + 10000,
    liked: false,
    saved: false,
    commentsCount: Math.floor(Math.random() * 5000) + 100,
    comments: [],
    timestamp: Date.now() - 1000 * 60 * 60 * (i + 1),
    isReel: true,
    reelDuration: `0:${String(Math.floor(Math.random() * 59) + 1).padStart(2, "0")}`,
  }));
}

function makeConversations(): Conversation[] {
  return MOCK_USERS.slice(0, 8).map((u, i) => ({
    id: makeId(),
    participants: [u],
    lastMessage: [
      "Haha that's so funny 😂",
      "Yeah, let's catch up soon!",
      "That photo is insane 🔥",
      "Are you going to the event?",
      "Love the new post!",
      "Same time next week? 🙌",
      "Just saw your story!",
      "Miss you bestie 💕",
    ][i % 8],
    lastMessageTime: Date.now() - 1000 * 60 * (i + 1) * 15,
    unreadCount: i < 3 ? Math.floor(Math.random() * 5) + 1 : 0,
    isGroup: i === 4,
    groupName: i === 4 ? "Weekend Squad 🎉" : undefined,
    isOnline: u.isOnline,
    messages: [
      {
        id: makeId(),
        senderId: u.id,
        text: "Hey! How are you?",
        timestamp: Date.now() - 1000 * 60 * 60,
        read: true,
      },
      {
        id: makeId(),
        senderId: "me",
        text: "I'm great! Just saw your story 😊",
        timestamp: Date.now() - 1000 * 60 * 50,
        read: true,
      },
      {
        id: makeId(),
        senderId: u.id,
        text: [
          "Haha that's so funny 😂",
          "Yeah, let's catch up soon!",
          "That photo is insane 🔥",
          "Are you going to the event?",
          "Love the new post!",
          "Same time next week? 🙌",
          "Just saw your story!",
          "Miss you bestie 💕",
        ][i % 8],
        timestamp: Date.now() - 1000 * 60 * (i + 1) * 15,
        read: i >= 3,
      },
    ],
  }));
}

function makeNotifications(): Notification[] {
  return [
    {
      id: makeId(),
      type: "like",
      userId: MOCK_USERS[0].id,
      username: MOCK_USERS[0].username,
      avatar: MOCK_USERS[0].avatar,
      text: "liked your photo.",
      postImage: POST_IMAGES[0],
      timestamp: Date.now() - 1000 * 60 * 5,
      read: false,
    },
    {
      id: makeId(),
      type: "follow",
      userId: MOCK_USERS[1].id,
      username: MOCK_USERS[1].username,
      avatar: MOCK_USERS[1].avatar,
      text: "started following you.",
      timestamp: Date.now() - 1000 * 60 * 15,
      read: false,
    },
    {
      id: makeId(),
      type: "comment",
      userId: MOCK_USERS[2].id,
      username: MOCK_USERS[2].username,
      avatar: MOCK_USERS[2].avatar,
      text: 'commented: "This is stunning! 😍"',
      postImage: POST_IMAGES[1],
      timestamp: Date.now() - 1000 * 60 * 30,
      read: false,
    },
    {
      id: makeId(),
      type: "like",
      userId: MOCK_USERS[3].id,
      username: MOCK_USERS[3].username,
      avatar: MOCK_USERS[3].avatar,
      text: "and 24 others liked your photo.",
      postImage: POST_IMAGES[2],
      timestamp: Date.now() - 1000 * 60 * 60,
      read: true,
    },
    {
      id: makeId(),
      type: "mention",
      userId: MOCK_USERS[4].id,
      username: MOCK_USERS[4].username,
      avatar: MOCK_USERS[4].avatar,
      text: "mentioned you in a comment.",
      postImage: POST_IMAGES[3],
      timestamp: Date.now() - 1000 * 60 * 120,
      read: true,
    },
    {
      id: makeId(),
      type: "follow",
      userId: MOCK_USERS[5].id,
      username: MOCK_USERS[5].username,
      avatar: MOCK_USERS[5].avatar,
      text: "started following you.",
      timestamp: Date.now() - 1000 * 60 * 180,
      read: true,
    },
    {
      id: makeId(),
      type: "tag",
      userId: MOCK_USERS[6].id,
      username: MOCK_USERS[6].username,
      avatar: MOCK_USERS[6].avatar,
      text: "tagged you in a photo.",
      postImage: POST_IMAGES[4],
      timestamp: Date.now() - 1000 * 60 * 240,
      read: true,
    },
  ];
}

interface AppContextType {
  me: User;
  stories: Story[];
  posts: Post[];
  reels: Post[];
  conversations: Conversation[];
  notifications: Notification[];
  unreadMessages: number;
  unreadNotifications: number;
  likePost: (postId: string) => void;
  savePost: (postId: string) => void;
  markStoryAsSeen: (storyId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  likedPosts: "vibe:liked_posts",
  savedPosts: "vibe:saved_posts",
  seenStories: "vibe:seen_stories",
} as const;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [me] = useState<User>(ME);
  const [stories, setStories] = useState<Story[]>(makeStories());
  const [posts, setPosts] = useState<Post[]>(makePosts());
  const [reels] = useState<Post[]>(makeReels());
  const [conversations, setConversations] = useState<Conversation[]>(
    makeConversations()
  );
  const [notifications, setNotifications] = useState<Notification[]>(
    makeNotifications()
  );

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [likedRaw, savedRaw, seenRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.likedPosts),
          AsyncStorage.getItem(STORAGE_KEYS.savedPosts),
          AsyncStorage.getItem(STORAGE_KEYS.seenStories),
        ]);
        const likedIds = new Set<string>(likedRaw ? (JSON.parse(likedRaw) as string[]) : []);
        const savedIds = new Set<string>(savedRaw ? (JSON.parse(savedRaw) as string[]) : []);
        const seenIds = new Set<string>(seenRaw ? (JSON.parse(seenRaw) as string[]) : []);
        if (likedIds.size > 0 || savedIds.size > 0) {
          setPosts((prev) =>
            prev.map((p) => ({
              ...p,
              liked: likedIds.has(p.id) ? true : p.liked,
              saved: savedIds.has(p.id) ? true : p.saved,
            }))
          );
        }
        if (seenIds.size > 0) {
          setStories((prev) =>
            prev.map((s) => ({ ...s, seen: seenIds.has(s.id) ? true : s.seen }))
          );
        }
      } catch {
      }
    };
    hydrate();
  }, []);

  useEffect(() => {
    const likedIds = posts.filter((p) => p.liked).map((p) => p.id);
    const savedIds = posts.filter((p) => p.saved).map((p) => p.id);
    AsyncStorage.setItem(STORAGE_KEYS.likedPosts, JSON.stringify(likedIds)).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.savedPosts, JSON.stringify(savedIds)).catch(() => {});
  }, [posts]);

  useEffect(() => {
    const seenIds = stories.filter((s) => s.seen).map((s) => s.id);
    AsyncStorage.setItem(STORAGE_KEYS.seenStories, JSON.stringify(seenIds)).catch(() => {});
  }, [stories]);

  const unreadMessages = conversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const likePost = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, []);

  const savePost = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p))
    );
  }, []);

  const markStoryAsSeen = useCallback((storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, seen: true } : s))
    );
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const newMsg: Message = {
      id: makeId(),
      senderId: "me",
      text,
      timestamp: Date.now(),
      read: false,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: text,
              lastMessageTime: Date.now(),
              unreadCount: 0,
            }
          : c
      )
    );
  }, []);

  const markNotificationRead = useCallback((notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <AppContext.Provider
      value={{
        me,
        stories,
        posts,
        reels,
        conversations,
        notifications,
        unreadMessages,
        unreadNotifications,
        likePost,
        savePost,
        markStoryAsSeen,
        sendMessage,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
