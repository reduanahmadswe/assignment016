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
    quote: "সফলতা চূড়ান্ত নয়, ব্যর্থতা মারাত্মক নয়: এটি চালিয়ে যাওয়ার সাহস যা গণনা করে।",
    authorName: "উইনস্টন চার্চিল",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/220px-Sir_Winston_Churchill_-_19086236948.jpg",
    authorDesignation: "ব্রিটিশ প্রধানমন্ত্রী"
  },
  {
    id: 3,
    quote: "তুমি যদি সূর্যের মতো উজ্জ্বল হতে চাও, প্রথমে সূর্যের মতো পুড়তে শেখো।",
    authorName: "এ. পি. জে. আব্দুল কালাম",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/220px-A._P._J._Abdul_Kalam.jpg",
    authorDesignation: "ভারতের প্রাক্তন রাষ্ট্রপতি ও বিজ্ঞানী"
  },
  {
    id: 4,
    quote: "যে ব্যক্তি প্রশ্ন করে সে এক মিনিটের জন্য বোকা, যে প্রশ্ন করে না সে সারাজীবন বোকা থাকে।",
    authorName: "কনফুসিয়াস",
    authorImage: "https://itibritto.com/wp-content/uploads/2018/07/Alamy.jpg",
    authorDesignation: "চীনা দার্শনিক"
  },
  {
    id: 5,
    quote: "স্বপ্ন সেটা নয় যা তুমি ঘুমিয়ে দেখো, স্বপ্ন সেটাই যা তোমাকে ঘুমাতে দেয় না।",
    authorName: "এ. পি. জে. আব্দুল কালাম",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/220px-A._P._J._Abdul_Kalam.jpg",
    authorDesignation: "ভারতের প্রাক্তন রাষ্ট্রপতি ও বিজ্ঞানী"
  },
  {
    id: 6,
    quote: "শিক্ষার শেকড় তেতো হলেও এর ফল মিষ্টি।",
    authorName: "এরিস্টটল",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/220px-Aristotle_Altemps_Inv8575.jpg",
    authorDesignation: "গ্রিক দার্শনিক"
  },
  {
    id: 7,
    quote: "কাল করব বলে যা ফেলে রাখা হয়, তা কখনোই করা হয় না।",
    authorName: "বেঞ্জামিন ফ্রাঙ্কলিন",
    authorImage: "https://d25swln94uq8y4.cloudfront.net/media/author_th/A0452.jpg",
    authorDesignation: "আমেরিকান বিজ্ঞানী ও রাজনীতিবিদ"
  },
  {
    id: 8,
    quote: "তোমার কাজকে ভালোবাসো, তাহলে তোমাকে জীবনে একদিনও কাজ করতে হবে না।",
    authorName: "কনফুসিয়াস",
    authorImage: "https://itibritto.com/wp-content/uploads/2018/07/Alamy.jpg",
    authorDesignation: "চীনা দার্শনিক"
  },
  {
    id: 9,
    quote: "জীবন হলো একটি সাইকেল চালানোর মতো। ভারসাম্য বজায় রাখতে হলে তোমাকে চলতে থাকতে হবে।",
    authorName: "আলবার্ট আইনস্টাইন",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "পদার্থবিদ"
  },
  {
    id: 10,
    quote: "হাজার মাইলের যাত্রা শুরু হয় একটি পদক্ষেপ দিয়ে।",
    authorName: "লাও জু",
    authorImage: "https://fs.pbs.com.bd/DIR/Com/PBS/Author/Image/7932.jpg",
    authorDesignation: "চীনা দার্শনিক"
  },
  {
    id: 11,
    quote: "ভুল করা লজ্জার নয়, ভুল থেকে শিক্ষা না নেওয়াটাই লজ্জার।",
    authorName: "রবীন্দ্রনাথ ঠাকুর",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rabindranath_Tagore_in_1909.jpg/220px-Rabindranath_Tagore_in_1909.jpg",
    authorDesignation: "বাংলা সাহিত্যের নোবেল বিজয়ী কবি"
  },
  {
    id: 12,
    quote: "আমি ব্যর্থতাকে মেনে নিতে পারি, কিন্তু চেষ্টা না করাকে মেনে নিতে পারি না।",
    authorName: "মাইকেল জর্ডান",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Michael_Jordan_in_2014.jpg/220px-Michael_Jordan_in_2014.jpg",
    authorDesignation: "আমেরিকান বাস্কেটবল খেলোয়াড়"
  },
  {
    id: 13,
    quote: "সাফল্য হলো উৎসাহ না হারিয়ে ব্যর্থতা থেকে ব্যর্থতায় হেঁটে যাওয়া।",
    authorName: "উইনস্টন চার্চিল",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/220px-Sir_Winston_Churchill_-_19086236948.jpg",
    authorDesignation: "ব্রিটিশ প্রধানমন্ত্রী"
  },
  {
    id: 14,
    quote: "মানুষের প্রতি সদয় হও, কিন্তু তাদের আচরণ ও মতামতের প্রতি উদাসীন থাকো।",
    authorName: "আলবার্ট আইনস্টাইন",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "পদার্থবিদ ও নোবেল বিজয়ী"
  },
  {
    id: 15,
    quote: "সত্য অনুসন্ধান যদি বিজ্ঞানীর লক্ষ্য হয়, তাহলে তাকে অবশ্যই যা পড়ে তার সবকিছুর শত্রু হতে হবে।",
    authorName: "ইবনুল হাইসাম (আলহাজেন)",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/3/36/Ibn_al-Haytham.png",
    authorDesignation: "আরব পদার্থবিদ ও গণিতবিদ - আধুনিক আলোকবিজ্ঞানের জনক"
  },
  {
    id: 16,
    quote: "Be benevolent towards people but indifferent to their conduct and opinions.",
    authorName: "Albert Einstein",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "Theoretical Physicist & Nobel Laureate"
  },
  {
    id: 17,
    quote: "If learning the truth is the scientist's goal, then he must make himself the enemy of all that he reads.",
    authorName: "Ibn al-Haytham (Alhazen)",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/3/36/Ibn_al-Haytham.png",
    authorDesignation: "Arab Physicist & Mathematician - Father of Modern Optics"
  },
  // Education & Knowledge
  {
    id: 18,
    quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    authorName: "Dr. Seuss",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Theodor_Seuss_Geisel_%2801037v%29.jpg/960px-Theodor_Seuss_Geisel_%2801037v%29.jpg",
    authorDesignation: "American Author & Illustrator"
  },
  {
    id: 19,
    quote: "Education is not preparation for life; education is life itself.",
    authorName: "John Dewey",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/John_Dewey_in_1902.jpg/220px-John_Dewey_in_1902.jpg",
    authorDesignation: "American Philosopher & Educator"
  },
  {
    id: 20,
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    authorName: "Mahatma Gandhi",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/220px-Mahatma-Gandhi%2C_studio%2C_1931.jpg",
    authorDesignation: "Indian Independence Leader"
  },
  // Success & Hard Work
  {
    id: 21,
    quote: "The only way to do great work is to love what you do.",
    authorName: "Steve Jobs",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/220px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg",
    authorDesignation: "Co-founder of Apple Inc."
  },
  {
    id: 22,
    quote: "It does not matter how slowly you go as long as you do not stop.",
    authorName: "Confucius",
    authorImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHr3jNiaTeb0Fx-bmH32OU2LNkoBAl01U0IA&s",
    authorDesignation: "Chinese Philosopher"
  },
  {
    id: 23,
    quote: "Hard work beats talent when talent doesn't work hard.",
    authorName: "Tim Notke",
    authorImage: "https://i0.wp.com/i.imgur.com/DaegIXG.jpg",
    authorDesignation: "Basketball Coach"
  },
  {
    id: 24,
    quote: "Your limitation—it's only your imagination.",
    authorName: "Unknown",
    authorImage: "",
    authorDesignation: "Motivational Quote"
  },
  // Dreams & Courage
  {
    id: 25,
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    authorName: "Eleanor Roosevelt",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Eleanor_Roosevelt_portrait_1933.jpg/220px-Eleanor_Roosevelt_portrait_1933.jpg",
    authorDesignation: "Former First Lady of USA"
  },
  {
    id: 26,
    quote: "Don't watch the clock; do what it does. Keep going.",
    authorName: "Sam Levenson",
    authorImage: "",
    authorDesignation: "American Humorist & Writer"
  },
  // Bengali Legends
  {
    id: 27,
    quote: "তুমি অধম, তাই বলে আমি উত্তম হইব না কেন?",
    authorName: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Bankim_Chatttapadhyay.jpg",
    authorDesignation: "বাংলা সাহিত্যের জনক"
  },
  // Research & Science
  {
    id: 28,
    quote: "Research is to see what everybody else has seen, and to think what nobody else has thought.",
    authorName: "Albert Szent-Györgyi",
    authorImage: "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcT8aPE2iv8SaFcRKCGNoC9GLYvqMvS21guGBbF71rP4QZeDvJsTVxDA3q3Tj1HsGSWoIvs7FYBiaFSTWlM",
    authorDesignation: "Nobel Prize Winner in Physiology"
  },
  {
    id: 29,
    quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
    authorName: "Albert Einstein",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "Theoretical Physicist"
  },
  {
    id: 30,
    quote: "Science is a way of thinking much more than it is a body of knowledge.",
    authorName: "Carl Sagan",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Carl_Sagan_Planetary_Society.JPG/220px-Carl_Sagan_Planetary_Society.JPG",
    authorDesignation: "American Astronomer & Science Communicator"
  },
  // Extra Motivational
  {
    id: 31,
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    authorName: "Chinese Proverb",
    authorImage: "",
    authorDesignation: "Ancient Wisdom"
  },
  {
    id: 32,
    quote: "In the middle of difficulty lies opportunity.",
    authorName: "Albert Einstein",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg",
    authorDesignation: "Theoretical Physicist"
  },
  {
    id: 33,
    quote: "পরিশ্রম সৌভাগ্যের প্রসূতি।",
    authorName: "প্রবাদ",
    authorImage: "",
    authorDesignation: "বাংলা প্রবাদ"
  },
  {
    id: 34,
    quote: "Knowledge speaks, but wisdom listens.",
    authorName: "Jimi Hendrix",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Jimi_Hendrix_1967.png/220px-Jimi_Hendrix_1967.png",
    authorDesignation: "American Musician"
  },
  {
    id: 35,
    quote: "The only person you are destined to become is the person you decide to be.",
    authorName: "Ralph Waldo Emerson",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ralph_Waldo_Emerson_ca1857_retouched.jpg/220px-Ralph_Waldo_Emerson_ca1857_retouched.jpg",
    authorDesignation: "American Philosopher & Poet"
  }
];

// Random quote 
export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};
