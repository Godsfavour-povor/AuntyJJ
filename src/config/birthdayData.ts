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
    heading: "Happy Birthday, Big Sis! 🎉",
    salutation: "Dearest Sister,",
    paragraphs: [
      "On your special day, I wanted to step outside the ordinary and create an experience as vibrant, joyful, and full of life as you are.",
      "Having you as my elder sister is one of the greatest blessings I carry. Your quiet strength inspires me, your warmth grounds me, and the generous way you love our family sets a benchmark I always look up to.",
      "As you blow out your candles and celebrate another incredible year, my prayer for you is simple: may this year bring you boundless happiness, open miraculous new doors of favor, grant you good health, and fulfill every single silent desire of your heart."
    ],
    closing: "With all my love and greatest admiration,",
    signature: "Godsfavour"
  },

  audio: {
    enableProceduralAudio: true,
  }
};
