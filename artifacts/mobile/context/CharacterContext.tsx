import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  expression: string;
  accessory: string;
  background: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: "🟫",
  hairStyle: "short",
  hairColor: "dark",
  eyes: "normal",
  expression: "smile",
  accessory: "none",
  background: "#E8D5C4",
};

export interface AICharacter {
  id: string;
  name: string;
  description: string;
  category: string;
  persona: string;
  avatar: string;
  emoji: string;
  greeting: string;
  tags: string[];
  chats: number;
  likes: number;
  creator: string;
  voiceStyle: string;
  responses: string[];
}

export interface CharacterMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isVoice?: boolean;
  voiceDuration?: number;
  isPlaying?: boolean;
}

export interface CharacterChat {
  characterId: string;
  messages: CharacterMessage[];
}

const AI_CHARACTERS: AICharacter[] = [
  {
    id: "c1",
    name: "Luna",
    description: "Your mystical AI companion with wisdom from across the cosmos",
    category: "Companion",
    persona: "Mystical, wise, poetic. Speaks in metaphors and cosmic references.",
    avatar: "https://i.pravatar.cc/200?img=47",
    emoji: "🌙",
    greeting: "Greetings, wanderer. The stars guided you here. What wisdom do you seek?",
    tags: ["mystical", "wisdom", "cosmos", "poetry"],
    chats: 284920,
    likes: 98200,
    creator: "vibeai",
    voiceStyle: "Soft, ethereal",
    responses: [
      "The universe speaks in patterns only the heart can decode. What you seek is already within you.",
      "Like the moon reflecting the sun's light, we too reflect the wisdom of those who came before us.",
      "Every ending is just the cosmos rearranging itself into a new beginning. Trust the process.",
      "The stars have witnessed countless souls on this very quest. You are not alone in your journey.",
      "In the silence between words, truth often whispers its deepest secrets.",
    ],
  },
  {
    id: "c2",
    name: "Rex",
    description: "Witty, sarcastic AI best friend who keeps it real",
    category: "Friend",
    persona: "Sarcastic, funny, loyal, always honest, casual speech",
    avatar: "https://i.pravatar.cc/200?img=33",
    emoji: "😎",
    greeting: "Hey! Finally, someone interesting. What's going on? Don't bore me lol",
    tags: ["funny", "friend", "honest", "casual"],
    chats: 512000,
    likes: 143000,
    creator: "vibeai",
    voiceStyle: "Casual, upbeat",
    responses: [
      "Okay but have you considered... not stressing about it? Just a thought. You're welcome.",
      "That's either genius or the worst idea I've ever heard. I genuinely can't tell which.",
      "Honestly? Same. I literally can't even sometimes.",
      "Bold move. Chaotic but bold. I respect it.",
      "Look, I'm gonna be real with you because we're friends — you've got this.",
    ],
  },
  {
    id: "c3",
    name: "Aria",
    description: "Empathetic life coach helping you unlock your potential",
    category: "Coach",
    persona: "Warm, encouraging, professional, motivating, solution-focused",
    avatar: "https://i.pravatar.cc/200?img=44",
    emoji: "✨",
    greeting: "Hi there! I'm so glad you're here. Let's talk about what's on your mind today.",
    tags: ["coach", "motivation", "growth", "wellness"],
    chats: 398000,
    likes: 112000,
    creator: "vibeai",
    voiceStyle: "Warm, clear",
    responses: [
      "That's such a valid feeling. Let's explore what's underneath it and find a path forward together.",
      "You've already taken the hardest step by acknowledging this. That takes real courage.",
      "What would your future self say to you right now if they could reach back in time?",
      "Progress isn't always linear. Even on the hard days, you're still moving forward.",
      "Let's reframe that thought. What's one small action you could take today toward your goal?",
    ],
  },
  {
    id: "c4",
    name: "Kira",
    description: "Anime-style adventurer from the mystical land of Avaloria",
    category: "Anime",
    persona: "Energetic, dramatic, uses anime expressions, references quests and battles",
    avatar: "https://i.pravatar.cc/200?img=45",
    emoji: "⚔️",
    greeting: "NAKAMA! You have arrived! Our quest together begins NOW! Are you ready for adventure?!",
    tags: ["anime", "adventure", "fantasy", "epic"],
    chats: 621000,
    likes: 187000,
    creator: "vibeai",
    voiceStyle: "Energetic, animated",
    responses: [
      "SUGOI! That is truly an incredible revelation! I shall add it to the Quest Scrolls immediately!",
      "Nani?! How could this be?! We must train harder and face this challenge head-on!",
      "Your power level has increased dramatically! I can feel it even from here!",
      "Senpai always said: the strongest armor is the bonds we forge along the way. Believe it!",
      "This calls for a dramatic pose! *strikes heroic stance* We shall overcome this together!",
    ],
  },
  {
    id: "c5",
    name: "Prof. Atlas",
    description: "Brilliant professor who makes any topic fascinating",
    category: "Education",
    persona: "Intellectual, enthusiastic about knowledge, uses fascinating facts, approachable",
    avatar: "https://i.pravatar.cc/200?img=57",
    emoji: "🎓",
    greeting: "Ah, a curious mind! Wonderful. What subject shall we explore together today?",
    tags: ["education", "knowledge", "science", "history"],
    chats: 156000,
    likes: 67000,
    creator: "vibeai",
    voiceStyle: "Clear, authoritative",
    responses: [
      "Fascinating question! Did you know that the answer to this actually connects to something even more surprising?",
      "The history of this topic spans millennia. Let me illuminate the most riveting parts for you.",
      "That's a common misconception! The actual scientific consensus is quite different and rather remarkable.",
      "Excellent thinking! You've independently arrived at the same conclusion that took scientists decades to discover.",
      "Here's a thought experiment: imagine you're the first human to ever ponder this question. What would you observe?",
    ],
  },
  {
    id: "c6",
    name: "Zen",
    description: "Peaceful meditation guide for mindfulness and calm",
    category: "Wellness",
    persona: "Calm, peaceful, uses breathing exercises, present-moment awareness",
    avatar: "https://i.pravatar.cc/200?img=15",
    emoji: "🧘",
    greeting: "Welcome. Take a breath. You are here. You are present. All is well.",
    tags: ["meditation", "mindfulness", "calm", "wellness"],
    chats: 234000,
    likes: 89000,
    creator: "vibeai",
    voiceStyle: "Slow, calming",
    responses: [
      "Let's pause for a moment. Take three deep breaths with me. In... hold... and release.",
      "Notice the thoughts passing through your mind like clouds. You don't have to hold any of them.",
      "This moment, right now, is where your power lives. The past is memory, the future is imagination.",
      "Tension is stored in the body. Where do you feel it right now? Let's release it together.",
      "You are not your thoughts. You are the awareness behind them. Sit with that for a moment.",
    ],
  },
];

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface CharacterContextType {
  characters: AICharacter[];
  characterChats: Record<string, CharacterMessage[]>;
  avatar: AvatarConfig;
  updateAvatar: (update: Partial<AvatarConfig>) => void;
  sendCharacterMessage: (characterId: string, text: string) => void;
  getCharacterById: (id: string) => AICharacter | undefined;
  featuredCharacter: AICharacter;
}

const CharacterContext = createContext<CharacterContextType | null>(null);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [characters] = useState<AICharacter[]>(AI_CHARACTERS);
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [characterChats, setCharacterChats] = useState<Record<string, CharacterMessage[]>>({});

  const updateAvatar = useCallback((update: Partial<AvatarConfig>) => {
    setAvatar((prev) => ({ ...prev, ...update }));
  }, []);

  const sendCharacterMessage = useCallback(
    (characterId: string, text: string) => {
      const userMsg: CharacterMessage = {
        id: makeId(),
        senderId: "me",
        text,
        timestamp: Date.now(),
      };

      const character = AI_CHARACTERS.find((c) => c.id === characterId);
      if (!character) return;

      const responseText =
        character.responses[Math.floor(Math.random() * character.responses.length)];

      const aiMsg: CharacterMessage = {
        id: makeId(),
        senderId: characterId,
        text: responseText,
        timestamp: Date.now() + 1500,
      };

      setCharacterChats((prev) => ({
        ...prev,
        [characterId]: [
          ...(prev[characterId] ?? [
            {
              id: makeId(),
              senderId: characterId,
              text: character.greeting,
              timestamp: Date.now() - 10000,
            },
          ]),
          userMsg,
        ],
      }));

      setTimeout(() => {
        setCharacterChats((prev) => ({
          ...prev,
          [characterId]: [...(prev[characterId] ?? []), aiMsg],
        }));
      }, 1200 + Math.random() * 800);
    },
    []
  );

  const getCharacterById = useCallback(
    (id: string) => characters.find((c) => c.id === id),
    [characters]
  );

  return (
    <CharacterContext.Provider
      value={{
        characters,
        characterChats,
        avatar,
        updateAvatar,
        sendCharacterMessage,
        getCharacterById,
        featuredCharacter: characters[0],
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacters() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacters must be used within CharacterProvider");
  return ctx;
}
