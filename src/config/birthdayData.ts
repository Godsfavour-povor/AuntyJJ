import type { BirthdayConfig } from '../types';

export const BIRTHDAY_DATA: BirthdayConfig = {
  // You can customize her name here (e.g. "Jessica", "Grace", "Adaeze")
  sisterName: "My Dearest Sister",
  brotherName: "Godsfavour",

  // Scene 1: The First Spark
  subtitle: "Someone very special has a little universe waiting for her.",
  openingPrompt: "Make a wish... then tap the flame",

  // Scene 2: The Hidden Message
  scratchHint: "There is something waiting here just for you. Use your touch to uncover it.",
  hiddenMessage: "Today is about celebrating you — your gentle strength, your boundless kindness, and the countless ways you bring light into our lives.",

  // Scene 3: The Memory Universe
  memoriesPrompt: "Each glowing light holds a chapter of our story. Touch each one to explore.",
  memories: [
    {
      id: "mem-1",
      title: "Where It All Began",
      subtitle: "The Foundation",
      date: "Cherished Milestone",
      description: "From our earliest days growing up, you set the benchmark for what it means to be patient, wise, and fiercely supportive. Your presence has always made every space feel safe and warm.",
      quote: "A big sister is both a guiding compass and a constant refuge.",
      accentIcon: "star"
    },
    {
      id: "mem-2",
      title: "Your Infectious Joy",
      subtitle: "The Light You Bring",
      date: "Everyday Magic",
      description: "Whenever you laugh, the entire room immediately softens. You carry an effortless grace and a heart that naturally lifts the spirits of everyone fortunate enough to be in your orbit.",
      quote: "Joy isn't just something you feel — it's something you give so freely.",
      accentIcon: "sparkles"
    },
    {
      id: "mem-3",
      title: "A Sister's Wisdom",
      subtitle: "The Advice That Stayed",
      date: "Through Every Season",
      description: "Thank you for the countless times you offered advice without judgment, stepped in when things felt heavy, and believed in me even before I fully believed in myself.",
      quote: "The quiet strength you show in difficult moments taught me resilience.",
      accentIcon: "feather"
    },
    {
      id: "mem-4",
      title: "The Sister I Adore",
      subtitle: "A Golden Year Ahead",
      date: "Today & Always",
      description: "Today, we pause to celebrate another incredible year of your journey. Watching you grow, achieve, and inspire is one of my greatest privileges. I am so deeply proud to be your brother.",
      quote: "Here's to celebrating the extraordinary person you are, every single day.",
      accentIcon: "heart"
    }
  ],

  // Scene 4: The Birthday Finale
  letter: {
    heading: "Happy Birthday, Big Sis",
    salutation: "Dearest Sister,",
    paragraphs: [
      "As you step into another chapter of your life today, I wanted to create something that pauses time — even just for a few moments — to remind you how deeply loved and appreciated you are.",
      "Having you as my elder sister has been one of life's greatest blessings. Your quiet courage inspires me, your patience steadies me, and the generosity of your spirit sets an example I strive to follow every day.",
      "May this new year surround you with genuine peace, open unexpected doors of favor, fulfill the silent prayers of your heart, and bring you health, laughter, and immense satisfaction in everything you touch."
    ],
    closing: "With all my love and endless respect,",
    signature: "Godsfavour"
  },

  audio: {
    enableProceduralAudio: true,
  }
};
