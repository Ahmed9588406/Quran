"use client";
import { useState } from 'react';
import NavBar from '../../user/navbar';
import LeftSide from '../../user/leftside';
import Link from 'next/link';

interface Name {
  number: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  description?: string;
  benefits?: string;
}

const names99: Name[] = [
  { 
    number: 1, 
    arabic: "الرَّحْمَنُ", 
    transliteration: "Ar-Rahman", 
    meaning: "The Most Merciful",
    description: "The One who has plenty of mercy for the believers and the blasphemers in this world and especially for the believers in the hereafter.",
    benefits: "Reciting this name brings mercy and compassion into one's life."
  },
  { 
    number: 2, 
    arabic: "الرَّحِيمُ", 
    transliteration: "Ar-Raheem", 
    meaning: "The Bestower of Mercy",
    description: "The One who has plenty of mercy for the believers.",
    benefits: "Helps develop compassion and kindness towards all creation."
  },
  { 
    number: 3, 
    arabic: "الْمَلِكُ", 
    transliteration: "Al-Malik", 
    meaning: "The King",
    description: "The Sovereign Lord, The One with the complete Dominion, the One Whose Dominion is clear from imperfection.",
    benefits: "Reciting this name brings dignity and honor."
  },
  { 
    number: 4, 
    arabic: "الْقُدُّوسُ", 
    transliteration: "Al-Quddus", 
    meaning: "The Most Sacred",
    description: "The One who is pure from any imperfection and clear from children and adversaries.",
    benefits: "Purifies the heart and soul from sins."
  },
  { 
    number: 5, 
    arabic: "السَّلاَمُ", 
    transliteration: "As-Salam", 
    meaning: "The Embodiment of Peace",
    description: "The One who is free from every imperfection.",
    benefits: "Brings peace and tranquility to the heart."
  },
  { 
    number: 6, 
    arabic: "الْمُؤْمِنُ", 
    transliteration: "Al-Mu'min", 
    meaning: "The Infuser of Faith",
    description: "The One who witnessed for Himself that no one is God but Him. And He witnessed for His believers that they are truthful in their belief that no one is God but Him.",
    benefits: "Strengthens faith and removes fear."
  },
  { 
    number: 7, 
    arabic: "الْمُهَيْمِنُ", 
    transliteration: "Al-Muhaymin", 
    meaning: "The Preserver of Safety",
    description: "The One who witnesses the saying and deeds of His creatures.",
    benefits: "Provides protection and security."
  },
  { 
    number: 8, 
    arabic: "الْعَزِيزُ", 
    transliteration: "Al-Aziz", 
    meaning: "The Mighty One",
    description: "The Defeater who is not defeated.",
    benefits: "Grants strength and honor."
  },
  { 
    number: 9, 
    arabic: "الْجَبَّارُ", 
    transliteration: "Al-Jabbar", 
    meaning: "The Compeller",
    description: "The One that nothing happens in His Dominion except that which He willed.",
    benefits: "Helps overcome difficulties and hardships."
  },
  { 
    number: 10, 
    arabic: "الْمُتَكَبِّرُ", 
    transliteration: "Al-Mutakabbir", 
    meaning: "The Supreme",
    description: "The One who is clear from the attributes of the creatures and from resembling them.",
    benefits: "Removes arrogance and instills humility."
  },
  { number: 3, arabic: "الْمَلِكُ", transliteration: "Al-Malik", meaning: "The King" },
  { number: 4, arabic: "الْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Most Sacred" },
  { number: 5, arabic: "السَّلاَمُ", transliteration: "As-Salam", meaning: "The Embodiment of Peace" },
  { number: 6, arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning: "The Infuser of Faith" },
  { number: 7, arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaning: "The Preserver of Safety" },
  { number: 8, arabic: "الْعَزِيزُ", transliteration: "Al-Aziz", meaning: "The Mighty One" },
  { number: 9, arabic: "الْجَبَّارُ", transliteration: "Al-Jabbar", meaning: "The Compeller" },
  { number: 10, arabic: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaning: "The Supreme" },
  { 
    number: 11, 
    arabic: "الْخَالِقُ", 
    transliteration: "Al-Khaliq", 
    meaning: "The Creator",
    description: "The One who brings everything from non-existence to existence.",
    benefits: "Enhances creativity and understanding of creation."
  },
  { 
    number: 12, 
    arabic: "الْبَارِئُ", 
    transliteration: "Al-Bari", 
    meaning: "The Originator",
    description: "The Maker, The Creator who has the Power to turn the entities.",
    benefits: "Helps in new beginnings and fresh starts."
  },
  { 
    number: 13, 
    arabic: "الْمُصَوِّرُ", 
    transliteration: "Al-Musawwir", 
    meaning: "The Fashioner",
    description: "The One who forms His creatures in different pictures.",
    benefits: "Brings beauty and harmony into life."
  },
  { 
    number: 14, 
    arabic: "الْغَفَّارُ", 
    transliteration: "Al-Ghaffar", 
    meaning: "The Repeatedly Forgiving",
    description: "The One who forgives the sins of His slaves time and time again.",
    benefits: "Seeking forgiveness and repentance."
  },
  { 
    number: 15, 
    arabic: "الْقَهَّارُ", 
    transliteration: "Al-Qahhar", 
    meaning: "The Subduer",
    description: "The Dominant One, The One who has the perfect Power and is not unable over anything.",
    benefits: "Overcomes enemies and obstacles."
  },
  { 
    number: 16, 
    arabic: "الْوَهَّابُ", 
    transliteration: "Al-Wahhab", 
    meaning: "The Bestower",
    description: "The One who is Generous in giving plenty without any return.",
    benefits: "Increases blessings and provisions."
  },
  { 
    number: 17, 
    arabic: "الرَّزَّاقُ", 
    transliteration: "Ar-Razzaq", 
    meaning: "The Provider",
    description: "The One who provides everything that is needed.",
    benefits: "Brings sustenance and removes poverty."
  },
  { 
    number: 18, 
    arabic: "الْفَتَّاحُ", 
    transliteration: "Al-Fattah", 
    meaning: "The Opener",
    description: "The One who opens for His slaves the closed worldly and religious matters.",
    benefits: "Opens doors of opportunity and success."
  },
  { 
    number: 19, 
    arabic: "اَلْعَلِيْمُ", 
    transliteration: "Al-Alim", 
    meaning: "The All-Knowing",
    description: "The Knowledgeable One, The One nothing is absent from His knowledge.",
    benefits: "Increases knowledge and wisdom."
  },
  { 
    number: 20, 
    arabic: "الْقَابِضُ", 
    transliteration: "Al-Qabid", 
    meaning: "The Withholder",
    description: "The One who constricts the sustenance by His wisdom.",
    benefits: "Helps in self-control and patience."
  },
  { 
    number: 21, 
    arabic: "الْبَاسِطُ", 
    transliteration: "Al-Basit", 
    meaning: "The Extender",
    description: "The One who expands the sustenance by His Generosity.",
    benefits: "Expands provisions and blessings."
  },
  { 
    number: 22, 
    arabic: "الْخَافِضُ", 
    transliteration: "Al-Khafid", 
    meaning: "The Reducer",
    description: "The One who lowers whoever He willed by His Destruction.",
    benefits: "Brings humility and removes pride."
  },
  { 
    number: 23, 
    arabic: "الرَّافِعُ", 
    transliteration: "Ar-Rafi", 
    meaning: "The Exalter",
    description: "The One who raises whoever He willed by His Endowment.",
    benefits: "Elevates status and rank."
  },
  { 
    number: 24, 
    arabic: "الْمُعِزُّ", 
    transliteration: "Al-Mu'izz", 
    meaning: "The Honourer",
    description: "The One who gives esteem to whoever He willed.",
    benefits: "Grants honor and respect."
  },
  { 
    number: 25, 
    arabic: "المُذِلُّ", 
    transliteration: "Al-Mudhill", 
    meaning: "The Dishonourer",
    description: "The One who humiliates whoever He willed.",
    benefits: "Protection from humiliation."
  },
  { 
    number: 26, 
    arabic: "السَّمِيعُ", 
    transliteration: "As-Sami", 
    meaning: "The All-Hearing",
    description: "The One who Hears all things that are heard by His Eternal Hearing without an ear or instrument.",
    benefits: "Prayers are answered and heard."
  },
  { 
    number: 27, 
    arabic: "الْبَصِيرُ", 
    transliteration: "Al-Basir", 
    meaning: "The All-Seeing",
    description: "The One who Sees all things that are seen by His Eternal Seeing without an eye or instrument.",
    benefits: "Increases insight and understanding."
  },
  { 
    number: 28, 
    arabic: "الْحَكَمُ", 
    transliteration: "Al-Hakam", 
    meaning: "The Judge",
    description: "The One who judges between His creatures with His Justice.",
    benefits: "Helps in making right decisions."
  },
  { 
    number: 29, 
    arabic: "الْعَدْلُ", 
    transliteration: "Al-Adl", 
    meaning: "The Utterly Just",
    description: "The One who is entitled to do what He does.",
    benefits: "Brings justice and fairness."
  },
  { 
    number: 30, 
    arabic: "اللَّطِيفُ", 
    transliteration: "Al-Latif", 
    meaning: "The Subtle One",
    description: "The One who is kind to His slaves and endows upon them.",
    benefits: "Brings gentleness and ease in difficulties."
  },
  { 
    number: 31, 
    arabic: "الْخَبِيرُ", 
    transliteration: "Al-Khabir", 
    meaning: "The All-Aware",
    description: "The One who knows the truth of things.",
    benefits: "Increases awareness and consciousness."
  },
  { 
    number: 32, 
    arabic: "الْحَلِيمُ", 
    transliteration: "Al-Halim", 
    meaning: "The Forbearing",
    description: "The One who delays the punishment for those who deserve it.",
    benefits: "Develops patience and tolerance."
  },
  { 
    number: 33, 
    arabic: "الْعَظِيمُ", 
    transliteration: "Al-Azim", 
    meaning: "The Magnificent",
    description: "The One deserving the attributes of Exaltment, Glory, Extolement, and Purity from all imperfection.",
    benefits: "Brings greatness and magnificence."
  },
  { 
    number: 34, 
    arabic: "الْغَفُورُ", 
    transliteration: "Al-Ghafur", 
    meaning: "The Forgiving",
    description: "The One who forgives the sins of His slaves.",
    benefits: "Forgiveness of sins and mistakes."
  },
  { 
    number: 35, 
    arabic: "الشَّكُورُ", 
    transliteration: "Ash-Shakur", 
    meaning: "The Appreciative",
    description: "The One who gives a lot of reward for a little obedience.",
    benefits: "Increases gratitude and thankfulness."
  },
  { 
    number: 36, 
    arabic: "الْعَلِيُّ", 
    transliteration: "Al-Ali", 
    meaning: "The Most High",
    description: "The One who is clear from the attributes of the creatures.",
    benefits: "Elevates spiritual status."
  },
  { 
    number: 37, 
    arabic: "الْكَبِيرُ", 
    transliteration: "Al-Kabir", 
    meaning: "The Most Great",
    description: "The One who is greater than everything in status.",
    benefits: "Brings respect and reverence."
  },
  { 
    number: 38, 
    arabic: "الْحَفِيظُ", 
    transliteration: "Al-Hafiz", 
    meaning: "The Preserver",
    description: "The One who protects whatever and whoever He willed to protect.",
    benefits: "Protection and preservation from harm."
  },
  { 
    number: 39, 
    arabic: "المُقيِت", 
    transliteration: "Al-Muqit", 
    meaning: "The Sustainer",
    description: "The One who has the Power.",
    benefits: "Provides sustenance and nourishment."
  },
  { 
    number: 40, 
    arabic: "الْحسِيبُ", 
    transliteration: "Al-Hasib", 
    meaning: "The Reckoner",
    description: "The One who gives the satisfaction.",
    benefits: "Brings sufficiency and contentment."
  },
  { 
    number: 41, 
    arabic: "الْجَلِيلُ", 
    transliteration: "Al-Jalil", 
    meaning: "The Majestic",
    description: "The One who is attributed with greatness of Power and Glory of status.",
    benefits: "Brings majesty and dignity."
  },
  { 
    number: 42, 
    arabic: "الْكَرِيمُ", 
    transliteration: "Al-Karim", 
    meaning: "The Generous",
    description: "The One who is clear from the abjectness.",
    benefits: "Increases generosity and nobility."
  },
  { 
    number: 43, 
    arabic: "الرَّقِيبُ", 
    transliteration: "Ar-Raqib", 
    meaning: "The Watchful",
    description: "The One that nothing is absent from Him.",
    benefits: "Develops mindfulness and awareness."
  },
  { 
    number: 44, 
    arabic: "الْمُجِيبُ", 
    transliteration: "Al-Mujib", 
    meaning: "The Responsive",
    description: "The One who answers the one in need if he asks Him.",
    benefits: "Prayers and supplications are answered."
  },
  { 
    number: 45, 
    arabic: "الْوَاسِعُ", 
    transliteration: "Al-Wasi", 
    meaning: "The All-Encompassing",
    description: "The Knowledgeable, The One whose Capacity and Knowledge are Boundless.",
    benefits: "Expands knowledge and understanding."
  },
  { 
    number: 46, 
    arabic: "الْحَكِيمُ", 
    transliteration: "Al-Hakim", 
    meaning: "The All-Wise",
    description: "The One who is correct in His doings.",
    benefits: "Increases wisdom and sound judgment."
  },
  { 
    number: 47, 
    arabic: "الْوَدُودُ", 
    transliteration: "Al-Wadud", 
    meaning: "The Loving One",
    description: "The One who loves His believing slaves and His believing slaves love Him.",
    benefits: "Brings love and affection."
  },
  { 
    number: 48, 
    arabic: "الْمَجِيدُ", 
    transliteration: "Al-Majid", 
    meaning: "The Glorious",
    description: "The One who is with perfect Power, High Status, Compassion, Generosity and Kindness.",
    benefits: "Brings glory and honor."
  },
  { 
    number: 49, 
    arabic: "الْبَاعِثُ", 
    transliteration: "Al-Ba'ith", 
    meaning: "The Resurrector",
    description: "The One who resurrects His slaves after death for reward and/or punishment.",
    benefits: "Brings new life and renewal."
  },
  { 
    number: 50, 
    arabic: "الشَّهِيدُ", 
    transliteration: "Ash-Shahid", 
    meaning: "The Witness",
    description: "The One from whom nothing is absent.",
    benefits: "Increases truthfulness and honesty."
  },
  { 
    number: 51, 
    arabic: "الْحَقُّ", 
    transliteration: "Al-Haqq", 
    meaning: "The Truth",
    description: "The One who truly exists.",
    benefits: "Brings truth and clarity."
  },
  { 
    number: 52, 
    arabic: "الْوَكِيلُ", 
    transliteration: "Al-Wakil", 
    meaning: "The Trustee",
    description: "The One who gives the satisfaction and is relied upon.",
    benefits: "Develops trust and reliance on Allah."
  },
  { 
    number: 53, 
    arabic: "الْقَوِيُّ", 
    transliteration: "Al-Qawiyy", 
    meaning: "The Strong",
    description: "The One with the complete Power.",
    benefits: "Grants strength and power."
  },
  { 
    number: 54, 
    arabic: "الْمَتِينُ", 
    transliteration: "Al-Matin", 
    meaning: "The Firm",
    description: "The One with extreme Power which is un-interrupted and He does not get tired.",
    benefits: "Brings firmness and steadfastness."
  },
  { 
    number: 55, 
    arabic: "الْوَلِيُّ", 
    transliteration: "Al-Waliyy", 
    meaning: "The Protecting Friend",
    description: "The One who supports and protects.",
    benefits: "Provides protection and friendship."
  },
  { 
    number: 56, 
    arabic: "الْحَمِيدُ", 
    transliteration: "Al-Hamid", 
    meaning: "The Praiseworthy",
    description: "The praised One who deserves to be praised.",
    benefits: "Increases praise and gratitude."
  },
  { 
    number: 57, 
    arabic: "الْمُحْصِي", 
    transliteration: "Al-Muhsi", 
    meaning: "The Accounter",
    description: "The One who the count of things are known to Him.",
    benefits: "Brings precision and accuracy."
  },
  { 
    number: 58, 
    arabic: "الْمُبْدِئُ", 
    transliteration: "Al-Mubdi", 
    meaning: "The Originator",
    description: "The One who started the human being.",
    benefits: "Helps in new beginnings."
  },
  { 
    number: 59, 
    arabic: "الْمُعِيدُ", 
    transliteration: "Al-Mu'id", 
    meaning: "The Restorer",
    description: "The One who brings back the creatures after death.",
    benefits: "Brings restoration and renewal."
  },
  { 
    number: 60, 
    arabic: "الْمُحْيِي", 
    transliteration: "Al-Muhyi", 
    meaning: "The Giver of Life",
    description: "The One who took out a living human from semen that does not have a soul.",
    benefits: "Brings life and vitality."
  },
  { 
    number: 61, 
    arabic: "اَلْمُمِيتُ", 
    transliteration: "Al-Mumit", 
    meaning: "The Bringer of Death",
    description: "The One who renders the living dead.",
    benefits: "Reminds of mortality and the hereafter."
  },
  { 
    number: 62, 
    arabic: "الْحَيُّ", 
    transliteration: "Al-Hayy", 
    meaning: "The Ever-Living",
    description: "The One attributed with a life that is unlike our life and is not that of a combination of soul, flesh or blood.",
    benefits: "Brings spiritual life and energy."
  },
  { 
    number: 63, 
    arabic: "الْقَيُّومُ", 
    transliteration: "Al-Qayyum", 
    meaning: "The Self-Sustaining",
    description: "The One who remains and does not end.",
    benefits: "Brings stability and permanence."
  },
  { 
    number: 64, 
    arabic: "الْوَاجِدُ", 
    transliteration: "Al-Wajid", 
    meaning: "The Finder",
    description: "The Rich who is never poor.",
    benefits: "Helps in finding what is lost."
  },
  { 
    number: 65, 
    arabic: "الْمَاجِدُ", 
    transliteration: "Al-Majid", 
    meaning: "The Noble",
    description: "The One who is Majid.",
    benefits: "Brings nobility and excellence."
  },
  { 
    number: 66, 
    arabic: "الْواحِدُ", 
    transliteration: "Al-Wahid", 
    meaning: "The Unique",
    description: "The One without a partner.",
    benefits: "Strengthens belief in Tawheed (Oneness)."
  },
  { 
    number: 67, 
    arabic: "اَلاَحَدُ", 
    transliteration: "Al-Ahad", 
    meaning: "The One",
    description: "The One.",
    benefits: "Deepens understanding of Allah's Oneness."
  },
  { 
    number: 68, 
    arabic: "الصَّمَدُ", 
    transliteration: "As-Samad", 
    meaning: "The Eternal",
    description: "The Master who is relied upon in matters and reverted to in ones needs.",
    benefits: "Brings self-sufficiency and independence."
  },
  { 
    number: 69, 
    arabic: "الْقَادِرُ", 
    transliteration: "Al-Qadir", 
    meaning: "The Capable",
    description: "The One attributed with Power.",
    benefits: "Increases capability and ability."
  },
  { 
    number: 70, 
    arabic: "الْمُقْتَدِرُ", 
    transliteration: "Al-Muqtadir", 
    meaning: "The Powerful",
    description: "The One with the perfect Power that nothing is withheld from Him.",
    benefits: "Grants power and authority."
  },
  { 
    number: 71, 
    arabic: "الْمُقَدِّمُ", 
    transliteration: "Al-Muqaddim", 
    meaning: "The Expediter",
    description: "The One who puts things in their right places.",
    benefits: "Brings advancement and progress."
  },
  { 
    number: 72, 
    arabic: "الْمُؤَخِّرُ", 
    transliteration: "Al-Mu'akhkhir", 
    meaning: "The Delayer",
    description: "The One who delays things to their right times.",
    benefits: "Teaches patience and perfect timing."
  },
  { 
    number: 73, 
    arabic: "الأوَّلُ", 
    transliteration: "Al-Awwal", 
    meaning: "The First",
    description: "The One whose Existence is without a beginning.",
    benefits: "Understanding of eternity and beginnings."
  },
  { 
    number: 74, 
    arabic: "الآخِرُ", 
    transliteration: "Al-Akhir", 
    meaning: "The Last",
    description: "The One whose Existence is without an end.",
    benefits: "Understanding of eternity and endings."
  },
  { 
    number: 75, 
    arabic: "الظَّاهِرُ", 
    transliteration: "Az-Zahir", 
    meaning: "The Manifest",
    description: "The One that nothing is above Him and nothing is underneath Him.",
    benefits: "Brings clarity and manifestation."
  },
  { 
    number: 76, 
    arabic: "الْبَاطِنُ", 
    transliteration: "Al-Batin", 
    meaning: "The Hidden",
    description: "The One that nothing is closer than Him.",
    benefits: "Reveals hidden knowledge and secrets."
  },
  { 
    number: 77, 
    arabic: "الْوَالِي", 
    transliteration: "Al-Wali", 
    meaning: "The Governor",
    description: "The One who owns things and manages them.",
    benefits: "Brings good governance and management."
  },
  { 
    number: 78, 
    arabic: "الْمُتَعَالِي", 
    transliteration: "Al-Muta'ali", 
    meaning: "The Most Exalted",
    description: "The One who is clear from the attributes of the creation.",
    benefits: "Elevates spiritual rank."
  },
  { 
    number: 79, 
    arabic: "الْبَرُّ", 
    transliteration: "Al-Barr", 
    meaning: "The Source of Goodness",
    description: "The One who is kind to His creatures, who covered them with His sustenance and specified whoever He willed among them by His support, protection, and special mercy.",
    benefits: "Brings kindness and righteousness."
  },
  { 
    number: 80, 
    arabic: "التَّوَابُ", 
    transliteration: "At-Tawwab", 
    meaning: "The Acceptor of Repentance",
    description: "The One who grants repentance to whoever He willed among His creatures and accepts his repentance.",
    benefits: "Facilitates repentance and forgiveness."
  },
  { 
    number: 81, 
    arabic: "الْمُنْتَقِمُ", 
    transliteration: "Al-Muntaqim", 
    meaning: "The Avenger",
    description: "The One who victoriously prevails over His enemies and punishes them for their sins.",
    benefits: "Protection from oppression and injustice."
  },
  { 
    number: 82, 
    arabic: "العَفُوُّ", 
    transliteration: "Al-Afuww", 
    meaning: "The Pardoner",
    description: "The One with wide forgiveness.",
    benefits: "Brings pardon and erasure of sins."
  },
  { 
    number: 83, 
    arabic: "الرَّؤُوفُ", 
    transliteration: "Ar-Ra'uf", 
    meaning: "The Most Kind",
    description: "The One with extreme Mercy.",
    benefits: "Brings kindness and gentleness."
  },
  { 
    number: 84, 
    arabic: "مَالِكُ الْمُلْكِ", 
    transliteration: "Malik-ul-Mulk", 
    meaning: "Master of the Kingdom",
    description: "The One who controls the Dominion and gives dominion to whoever He willed.",
    benefits: "Grants authority and sovereignty."
  },
  { 
    number: 85, 
    arabic: "ذُوالْجَلاَلِ وَالإكْرَامِ", 
    transliteration: "Dhul-Jalali wal-Ikram", 
    meaning: "Lord of Majesty and Bounty",
    description: "The One who deserves to be Exalted and not denied.",
    benefits: "Brings honor and blessings."
  },
  { 
    number: 86, 
    arabic: "الْمُقْسِطُ", 
    transliteration: "Al-Muqsit", 
    meaning: "The Equitable",
    description: "The One who is Just in His judgment.",
    benefits: "Brings justice and fairness."
  },
  { 
    number: 87, 
    arabic: "الْجَامِعُ", 
    transliteration: "Al-Jami", 
    meaning: "The Gatherer",
    description: "The One who gathers the creatures on a day that there is no doubt about, that is the Day of Judgment.",
    benefits: "Brings unity and gathering of good."
  },
  { 
    number: 88, 
    arabic: "الْغَنِيُّ", 
    transliteration: "Al-Ghani", 
    meaning: "The Self-Sufficient",
    description: "The One who does not need the creation.",
    benefits: "Brings wealth and self-sufficiency."
  },
  { 
    number: 89, 
    arabic: "الْمُغْنِي", 
    transliteration: "Al-Mughni", 
    meaning: "The Enricher",
    description: "The One who satisfies the necessities of the creatures.",
    benefits: "Removes poverty and brings richness."
  },
  { 
    number: 90, 
    arabic: "اَلْمَانِعُ", 
    transliteration: "Al-Mani'", 
    meaning: "The Preventer",
    description: "The One who prevents harm and difficulty.",
    benefits: "Protection from harm and evil."
  },
  { 
    number: 91, 
    arabic: "الضَّارَّ", 
    transliteration: "Ad-Darr", 
    meaning: "The Distresser",
    description: "The One who makes harm reach to whoever He willed.",
    benefits: "Understanding of trials and tests."
  },
  { 
    number: 92, 
    arabic: "النَّافِعُ", 
    transliteration: "An-Nafi", 
    meaning: "The Benefactor",
    description: "The One who gives benefits to whoever He wills.",
    benefits: "Brings benefit and advantage."
  },
  { 
    number: 93, 
    arabic: "النُّورُ", 
    transliteration: "An-Nur", 
    meaning: "The Light",
    description: "The One who guides.",
    benefits: "Brings light and guidance."
  },
  { 
    number: 94, 
    arabic: "الْهَادِي", 
    transliteration: "Al-Hadi", 
    meaning: "The Guide",
    description: "The One whom with His Guidance His believers were guided, and with His Guidance the living beings have been guided to what is beneficial for them.",
    benefits: "Provides guidance and direction."
  },
  { 
    number: 95, 
    arabic: "الْبَدِيعُ", 
    transliteration: "Al-Badi", 
    meaning: "The Incomparable",
    description: "The One who created the creation and formed it without any preceding example.",
    benefits: "Brings innovation and uniqueness."
  },
  { 
    number: 96, 
    arabic: "اَلْبَاقِي", 
    transliteration: "Al-Baqi", 
    meaning: "The Everlasting",
    description: "The One that the state of non-existence is impossible for Him.",
    benefits: "Brings permanence and lasting success."
  },
  { 
    number: 97, 
    arabic: "الْوَارِثُ", 
    transliteration: "Al-Warith", 
    meaning: "The Inheritor",
    description: "The One whose Existence remains.",
    benefits: "Understanding of inheritance and legacy."
  },
  { 
    number: 98, 
    arabic: "الرَّشِيدُ", 
    transliteration: "Ar-Rashid", 
    meaning: "The Guide to the Right Path",
    description: "The One who guides.",
    benefits: "Brings right guidance and wisdom."
  },
  { 
    number: 99, 
    arabic: "الصَّبُورُ", 
    transliteration: "As-Sabur", 
    meaning: "The Patient One",
    description: "The One who does not quickly punish the sinners.",
    benefits: "Develops patience and perseverance."
  },
];

export default function AsmaAllahPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<Name | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'read'>('grid');

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  const filteredNames = names99.filter(
    (name) =>
      name.arabic.includes(searchTerm) ||
      name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-h-screen pt-15 pl-14 p-8"
      style={{
        backgroundImage: "url('/icons/settings/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <NavBar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <LeftSide isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} activeView="pray" />

      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          href="/pray"
          className="inline-flex items-center mb-6 text-[#8A1538] hover:text-[#6d1029] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Pray</span>
        </Link>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#8A1538] to-[#6d1029] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">أسماء الله الحسنى</h1>
              <p className="text-white/80">The 99 Beautiful Names of Allah</p>
            </div>
            
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-[#8A1538] text-white shadow-lg'
                : 'bg-white text-[#8A1538] border border-gray-200 hover:shadow-md'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('read')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              viewMode === 'read'
                ? 'bg-[#8A1538] text-white shadow-lg'
                : 'bg-white text-[#8A1538] border border-gray-200 hover:shadow-md'
            }`}
          >
            Read Mode
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Arabic, English, or meaning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8A1538] bg-white shadow-sm"
          />
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredNames.map((name) => (
            <button
              key={name.number}
              onClick={() => setSelectedName(name)}
              className="bg-white border border-gray-200 hover:shadow-lg transition-all cursor-pointer rounded-xl p-5 text-left transform hover:scale-105 duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Number Badge */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#CFAE70', transform: 'rotate(45deg)' }}
                >
                  <span className="text-sm font-bold text-[#8A1538]" style={{ transform: 'rotate(-45deg)' }}>
                    {name.number}
                  </span>
                </div>

                {/* Name Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-arabic text-[#8A1538] mb-1 text-right" dir="rtl">
                    {name.arabic}
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 mb-1">{name.transliteration}</p>
                  <p className="text-xs text-gray-600">{name.meaning}</p>
                </div>
              </div>
            </button>
          ))}
          </div>
        )}

        {/* Read Mode */}
        {viewMode === 'read' && (
          <div className="space-y-6 mb-6">
            {filteredNames.map((name) => (
              <div
                key={name.number}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Header with Number and Arabic Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#CFAE70', transform: 'rotate(45deg)' }}
                  >
                    <span className="text-lg font-bold text-[#8A1538]" style={{ transform: 'rotate(-45deg)' }}>
                      {name.number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-arabic text-[#8A1538] mb-2 text-right" dir="rtl">
                      {name.arabic}
                    </h2>
                    <p className="text-xl font-semibold text-gray-700 mb-1">{name.transliteration}</p>
                    <p className="text-lg text-gray-600 italic">{name.meaning}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Description */}
                {name.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#8A1538] uppercase tracking-wide mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{name.description}</p>
                  </div>
                )}

                {/* Benefits */}
                {name.benefits && (
                  <div className="bg-[#fdfaf5] rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-[#8A1538] uppercase tracking-wide mb-2">
                      Benefits of Recitation
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{name.benefits}</p>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedName(name)}
                  className="mt-4 w-full bg-[#8A1538] text-white py-2 rounded-lg hover:bg-[#6d1029] transition-colors font-medium text-sm"
                >
                  View in Detail Modal
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredNames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No names found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedName && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedName(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedName(null)}
              className="float-right text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Number Badge */}
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#CFAE70', transform: 'rotate(45deg)' }}
              >
                <span className="text-2xl font-bold text-[#8A1538]" style={{ transform: 'rotate(-45deg)' }}>
                  {selectedName.number}
                </span>
              </div>
            </div>

            {/* Arabic Name */}
            <div className="text-center mb-6">
              <h2 className="text-5xl font-arabic text-[#8A1538] mb-4" dir="rtl">
                {selectedName.arabic}
              </h2>
              <p className="text-2xl font-semibold text-gray-700 mb-2">{selectedName.transliteration}</p>
              <p className="text-lg text-gray-600">{selectedName.meaning}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Description */}
            {selectedName.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#8A1538] uppercase tracking-wide mb-2">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedName.description}</p>
              </div>
            )}

            {/* Benefits */}
            {selectedName.benefits && (
              <div className="bg-[#fdfaf5] rounded-xl p-4 mb-4">
                <h3 className="text-sm font-semibold text-[#8A1538] uppercase tracking-wide mb-2">
                  Benefits of Recitation
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedName.benefits}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-[#fdfaf5] rounded-xl p-6">
              <p className="text-center text-gray-700 leading-relaxed">
                This is one of the 99 Beautiful Names of Allah (Asma ul Husna). 
                Reciting and understanding these names helps us know Allah better and draw closer to Him.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedName(null)}
              className="mt-6 w-full bg-[#8A1538] text-white py-3 rounded-xl hover:bg-[#6d1029] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
