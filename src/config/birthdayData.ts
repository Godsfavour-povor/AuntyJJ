import type { BirthdayConfig } from '../types';

export const BIRTHDAY_DATA: BirthdayConfig = {
  // You can customize her name or nickname here (e.g. "Aunty JJ", "Jessica", "Grace")
  sisterName: "My Dearest Sister",
  brotherName: "Godsfavour",

  // Scene 1: The Birthday Portal
  portalGreeting: "Wait a second... is that who I think it is?! The Birthday VIP has arrived!",
  portalPrompt: "Step right up! Tap the giant party button to unlock your birthday world!",

  // Scene 2: The Wish-Making Party
  wishIntro: "Okay, birthday star! The candles are lit and the universe is listening.",
  wishSilentPrompt: "Close your eyes for three seconds. Make the biggest, boldest wish for your new year!",

  // Scene 3: The Playful Discovery Room
  scratchTitle: "A Top Secret Birthday Memo",
  scratchHint: "Rub your finger across the golden confetti to uncover your secret birthday decree!",
  scratchSecretMessage: "OFFICIAL PROCLAMATION: Today, you are crowned the coolest, smartest, and most extraordinary big sister on the planet. Your smile lights up every room!",

  // 3 Interactive Discovery Keepsakes
  memories: [
    {
      id: "mem-trophy",
      title: "The Ultimate Sister Trophy",
      badge: "World Record Holder",
      funnySubtitle: "Category: Surviving Godsfavour's Antics",
      description: "Awarded by unanimous family vote for displaying Olympic-level patience, endless wisdom, and unconditional brotherly support through every chapter of life.",
      pipComment: "Honestly, she deserves this trophy in solid gold!",
      accentColor: "yellow",
      iconType: "trophy"
    },
    {
      id: "mem-polaroid",
      title: "The Laughter Specialist",
      badge: "Pure Sunshine",
      funnySubtitle: "Contagious Chuckles Certified",
      description: "No matter how serious or busy life gets, your laugh has an undeniable superpower — it instantly makes everyone around you feel lighter, happier, and loved.",
      pipComment: "Her smile could power an entire city!",
      accentColor: "coral",
      iconType: "polaroid"
    },
    {
      id: "mem-origami",
      title: "The Sibling Compass",
      badge: "Endless Guidance",
      funnySubtitle: "Wisdom You Can Always Count On",
      description: "Thank you for being my big sister, my cheerleader, and a constant voice of reason. You've taught me how to walk with confidence, kindness, and grace.",
      pipComment: "Best big sister ever? 100% verified!",
      accentColor: "turquoise",
      iconType: "origami"
    }
  ],

  // Scene 4: The Big Birthday Finale
  letter: {
    heading: "Happy Birthday, My Love! ❤️",
    salutation: "My Dearest Sister, My Love ❤️",
    paragraphs: [
      "I don't even know how to start, but first of all, happy birthday to you. ❤️",
      "You've always been the best sister to me. Though it's only you, I've never felt like I was missing anything because you've always been there for me.",
      "Many times, I would think to myself, in what way can I actually pay you back? I thought about getting you something, maybe buying you gifts and all, but I couldn't really put my hands on anything that could actually repay you for everything you've done.",
      "Then something struck my heart, and I realized that it's not really about how much I can give you, but about the gratitude and appreciation I have for you.",
      "You've always been there for me, never asking for anything in return, but always giving everything you can.",
      "So, with the skills I've learned, I decided to make this little something for you.",
      "It's nothing compared to what you've done for me. It's nothing compared to the love you've shown me. It's nothing compared to the care you've had for me.",
      "But this is a little token from me to you, just to let you know how much I love and appreciate you.",
      "Happy birthday once again, my love. ❤️",
      "This is a new year for you, and I want you to enjoy it to the fullest. May God bless you, bless the work of your hands, and bless everything you're doing. May this new year bring you happiness, peace, and everything good that your heart desires.",
      "Thank you very much for everything. I love you. ❤️"
    ],
    closing: "With love,",
    signature: "Godsfavour ❤️"
  },

  audio: {
    enableProceduralAudio: true,
  }
};
