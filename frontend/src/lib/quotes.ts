// উক্তি/বাণী - Static Array
export interface Quote {
  id: number;
  quote: string;
  authorName: string;
  authorImage?: string;
  authorDesignation?: string;
}

export const quotes: Quote[] = [
  {
    id: 1,
    quote: "শিক্ষা হলো সবচেয়ে শক্তিশালী অস্ত্র যা আপনি বিশ্বকে পরিবর্তন করতে ব্যবহার করতে পারেন।",
    authorName: "নেলসন ম্যান্ডেলা",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/220px-Nelson_Mandela_1994.jpg",
    authorDesignation: "দক্ষিণ আফ্রিকার প্রাক্তন রাষ্ট্রপতি"
  },
  {
    id: 2,
    quote: "জ্ঞান অর্জনের জন্য যদি চীন দেশেও যেতে হয়, তবুও যাও।",
    authorName: "হযরত মুহাম্মদ (সা.)",
    authorImage: "",
    authorDesignation: "ইসলাম ধর্মের নবী"
  },
  {
    id: 3,
    quote: "সফলতা চূড়ান্ত নয়, ব্যর্থতা মারাত্মক নয়: এটি চালিয়ে যাওয়ার সাহস যা গণনা করে।",
    authorName: "উইনস্টন চার্চিল",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/220px-Sir_Winston_Churchill_-_19086236948.jpg",
    authorDesignation: "ব্রিটিশ প্রধানমন্ত্রী"
  },
  {
    id: 4,
    quote: "তুমি যদি সূর্যের মতো উজ্জ্বল হতে চাও, প্রথমে সূর্যের মতো পুড়তে শেখো।",
    authorName: "এ. পি. জে. আব্দুল কালাম",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/220px-A._P._J._Abdul_Kalam.jpg",
    authorDesignation: "ভারতের প্রাক্তন রাষ্ট্রপতি ও বিজ্ঞানী"
  },
  {
    id: 5,
    quote: "যে ব্যক্তি প্রশ্ন করে সে এক মিনিটের জন্য বোকা, যে প্রশ্ন করে না সে সারাজীবন বোকা থাকে।",
    authorName: "কনফুসিয়াস",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Confucius_Tang_Dynasty.jpg/220px-Confucius_Tang_Dynasty.jpg",
    authorDesignation: "চীনা দার্শনিক"
  },
  {
    id: 6,
    quote: "স্বপ্ন সেটা নয় যা তুমি ঘুমিয়ে দেখো, স্বপ্ন সেটাই যা তোমাকে ঘুমাতে দেয় না।",
    authorName: "এ. পি. জে. আব্দুল কালাম",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/220px-A._P._J._Abdul_Kalam.jpg",
    authorDesignation: "ভারতের প্রাক্তন রাষ্ট্রপতি ও বিজ্ঞানী"
  },
  {
    id: 7,
    quote: "শিক্ষার শেকড় তেতো হলেও এর ফল মিষ্টি।",
    authorName: "এরিস্টটল",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/220px-Aristotle_Altemps_Inv8575.jpg",
    authorDesignation: "গ্রিক দার্শনিক"
  },
  {
    id: 8,
    quote: "কাল করব বলে যা ফেলে রাখা হয়, তা কখনোই করা হয় না।",
    authorName: "বেঞ্জামিন ফ্রাঙ্কলিন",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/BenFranklinDupworking.png/220px-BenFranklinDupworking.png",
    authorDesignation: "আমেরিকান বিজ্ঞানী ও রাজনীতিবিদ"
  },
  {
    id: 9,
    quote: "তোমার কাজকে ভালোবাসো, তাহলে তোমাকে জীবনে একদিনও কাজ করতে হবে না।",
    authorName: "কনফুসিয়াস",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Confucius_Tang_Dynasty.jpg/220px-Confucius_Tang_Dynasty.jpg",
    authorDesignation: "চীনা দার্শনিক"
  },
  {
    id: 10,
    quote: "জীবন হলো একটি সাইকেল চালানোর মতো। ভারসাম্য বজায় রাখতে হলে তোমাকে চলতে থাকতে হবে।",
    authorName: "আলবার্ট আইনস্টাইন",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "পদার্থবিদ"
  },
  {
    id: 11,
    quote: "হাজার মাইলের যাত্রা শুরু হয় একটি পদক্ষেপ দিয়ে।",
    authorName: "লাও জু",
    authorImage: "",
    authorDesignation: "চীনা দার্শনিক"
  },
  {
    id: 12,
    quote: "ভুল করা লজ্জার নয়, ভুল থেকে শিক্ষা না নেওয়াটাই লজ্জার।",
    authorName: "রবীন্দ্রনাথ ঠাকুর",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rabindranath_Tagore_in_1909.jpg/220px-Rabindranath_Tagore_in_1909.jpg",
    authorDesignation: "বাংলা সাহিত্যের নোবেল বিজয়ী কবি"
  },
  {
    id: 13,
    quote: "যে জাতি তার ইতিহাস জানে না, সে জাতির ভবিষ্যৎ নেই।",
    authorName: "শেখ মুজিবুর রহমান",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Sheikh_Mujibur_Rahman_in_1950.jpg/220px-Sheikh_Mujibur_Rahman_in_1950.jpg",
    authorDesignation: "বাংলাদেশের জাতির পিতা"
  },
  {
    id: 14,
    quote: "আমি ব্যর্থতাকে মেনে নিতে পারি, কিন্তু চেষ্টা না করাকে মেনে নিতে পারি না।",
    authorName: "মাইকেল জর্ডান",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Michael_Jordan_in_2014.jpg/220px-Michael_Jordan_in_2014.jpg",
    authorDesignation: "আমেরিকান বাস্কেটবল খেলোয়াড়"
  },
  {
    id: 15,
    quote: "সাফল্য হলো উৎসাহ না হারিয়ে ব্যর্থতা থেকে ব্যর্থতায় হেঁটে যাওয়া।",
    authorName: "উইনস্টন চার্চিল",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/220px-Sir_Winston_Churchill_-_19086236948.jpg",
    authorDesignation: "ব্রিটিশ প্রধানমন্ত্রী"
  },
  {
    id: 16,
    quote: "মানুষের প্রতি সদয় হও, কিন্তু তাদের আচরণ ও মতামতের প্রতি উদাসীন থাকো।",
    authorName: "আলবার্ট আইনস্টাইন",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "পদার্থবিদ ও নোবেল বিজয়ী"
  },
  {
    id: 17,
    quote: "সত্য অনুসন্ধান যদি বিজ্ঞানীর লক্ষ্য হয়, তাহলে তাকে অবশ্যই যা পড়ে তার সবকিছুর শত্রু হতে হবে।",
    authorName: "ইবনুল হাইসাম (আলহাজেন)",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Hazan.png/220px-Hazan.png",
    authorDesignation: "আরব পদার্থবিদ ও গণিতবিদ - আধুনিক আলোকবিজ্ঞানের জনক"
  },
  {
    id: 18,
    quote: "Be benevolent towards people but indifferent to their conduct and opinions.",
    authorName: "Albert Einstein",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "Theoretical Physicist & Nobel Laureate"
  },
  {
    id: 19,
    quote: "If learning the truth is the scientist's goal, then he must make himself the enemy of all that he reads.",
    authorName: "Ibn al-Haytham (Alhazen)",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Hazan.png/220px-Hazan.png",
    authorDesignation: "Arab Physicist & Mathematician - Father of Modern Optics"
  },
  // Education & Knowledge
  {
    id: 20,
    quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    authorName: "Dr. Seuss",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ted_Geisel_NYWTS_2_crop.jpg/220px-Ted_Geisel_NYWTS_2_crop.jpg",
    authorDesignation: "American Author & Illustrator"
  },
  {
    id: 21,
    quote: "Education is not preparation for life; education is life itself.",
    authorName: "John Dewey",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/John_Dewey_in_1902.jpg/220px-John_Dewey_in_1902.jpg",
    authorDesignation: "American Philosopher & Educator"
  },
  {
    id: 22,
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    authorName: "Mahatma Gandhi",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/220px-Mahatma-Gandhi%2C_studio%2C_1931.jpg",
    authorDesignation: "Indian Independence Leader"
  },
  // Success & Hard Work
  {
    id: 23,
    quote: "The only way to do great work is to love what you do.",
    authorName: "Steve Jobs",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/220px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg",
    authorDesignation: "Co-founder of Apple Inc."
  },
  {
    id: 24,
    quote: "It does not matter how slowly you go as long as you do not stop.",
    authorName: "Confucius",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Confucius_Tang_Dynasty.jpg/220px-Confucius_Tang_Dynasty.jpg",
    authorDesignation: "Chinese Philosopher"
  },
  {
    id: 25,
    quote: "Hard work beats talent when talent doesn't work hard.",
    authorName: "Tim Notke",
    authorImage: "",
    authorDesignation: "Basketball Coach"
  },
  {
    id: 26,
    quote: "Your limitation—it's only your imagination.",
    authorName: "Unknown",
    authorImage: "",
    authorDesignation: "Motivational Quote"
  },
  // Dreams & Courage
  {
    id: 27,
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    authorName: "Eleanor Roosevelt",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Eleanor_Roosevelt_portrait_1933.jpg/220px-Eleanor_Roosevelt_portrait_1933.jpg",
    authorDesignation: "Former First Lady of USA"
  },
  {
    id: 28,
    quote: "Don't watch the clock; do what it does. Keep going.",
    authorName: "Sam Levenson",
    authorImage: "",
    authorDesignation: "American Humorist & Writer"
  },
  {
    id: 29,
    quote: "Believe you can and you're halfway there.",
    authorName: "Theodore Roosevelt",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Theodore_Roosevelt_by_the_Pach_Bros.jpg/220px-Theodore_Roosevelt_by_the_Pach_Bros.jpg",
    authorDesignation: "26th President of USA"
  },
  // Bengali Legends
  {
    id: 30,
    quote: "তুমি অধম, তাই বলে আমি উত্তম হইব না কেন?",
    authorName: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Bankim_Chandra_Chattopadhyay.jpg/220px-Bankim_Chandra_Chattopadhyay.jpg",
    authorDesignation: "বাংলা সাহিত্যের জনক"
  },
  {
    id: 31,
    quote: "যে নদী হারায় স্রোত, সে নদী মরে যায়।",
    authorName: "কাজী নজরুল ইসলাম",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kazi_Nazrul_Islam_%28Agartala%29.jpg/220px-Kazi_Nazrul_Islam_%28Agartala%29.jpg",
    authorDesignation: "বাংলাদেশের জাতীয় কবি"
  },
  {
    id: 32,
    quote: "চরিত্র মানুষের অমূল্য সম্পদ।",
    authorName: "ঈশ্বরচন্দ্র বিদ্যাসাগর",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Ishwar_Chandra_Vidyasagar.jpg/220px-Ishwar_Chandra_Vidyasagar.jpg",
    authorDesignation: "বাংলার নবজাগরণের অগ্রদূত"
  },
  // Research & Science
  {
    id: 33,
    quote: "Research is to see what everybody else has seen, and to think what nobody else has thought.",
    authorName: "Albert Szent-Györgyi",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Albert_Szent-Gyorgyi.jpg/220px-Albert_Szent-Gyorgyi.jpg",
    authorDesignation: "Nobel Prize Winner in Physiology"
  },
  {
    id: 34,
    quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
    authorName: "Albert Einstein",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "Theoretical Physicist"
  },
  {
    id: 35,
    quote: "Science is a way of thinking much more than it is a body of knowledge.",
    authorName: "Carl Sagan",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Carl_Sagan_Planetary_Society.JPG/220px-Carl_Sagan_Planetary_Society.JPG",
    authorDesignation: "American Astronomer & Science Communicator"
  },
  // Extra Motivational
  {
    id: 36,
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    authorName: "Chinese Proverb",
    authorImage: "",
    authorDesignation: "Ancient Wisdom"
  },
  {
    id: 37,
    quote: "In the middle of difficulty lies opportunity.",
    authorName: "Albert Einstein",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "Theoretical Physicist"
  },
  {
    id: 38,
    quote: "পরিশ্রম সৌভাগ্যের প্রসূতি।",
    authorName: "প্রবাদ",
    authorImage: "",
    authorDesignation: "বাংলা প্রবাদ"
  },
  {
    id: 39,
    quote: "Knowledge speaks, but wisdom listens.",
    authorName: "Jimi Hendrix",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Jimi_Hendrix_1967.png/220px-Jimi_Hendrix_1967.png",
    authorDesignation: "American Musician"
  },
  {
    id: 40,
    quote: "The only person you are destined to become is the person you decide to be.",
    authorName: "Ralph Waldo Emerson",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ralph_Waldo_Emerson_ca1857_retouched.jpg/220px-Ralph_Waldo_Emerson_ca1857_retouched.jpg",
    authorDesignation: "American Philosopher & Poet"
  }
];

// Random quote পেতে
export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};
