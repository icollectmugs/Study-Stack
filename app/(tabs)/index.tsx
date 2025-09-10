import { useRouter } from "expo-router";
import { collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../lib/firebase";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

type Deck = {
  lastStudied: any;
  id: string;
  title: string;
  cards: Flashcard[];
  color: string;
  createdAt: any;
};

export default function HomeScreen() {
  const [ decks, setDecks] = useState<Deck[]>([]);
  const [ loading, setLoading] = useState(true);
  const router = useRouter();

  const timeAgo = (timestamp) =>  {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 *  60 * 60 * 24));
    return days === 0 ? "Today" : `${days} day(s) ago`;
  };

  useEffect(() => {
    const fetchDecks = async () => {
      const snap = await getDocs(collection(db, 'decks'));
      console.log('Decks:', snap.docs.map((doc) => doc.data()));
    }
    fetchDecks();
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'decks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "Untitled Deck",
        cards: doc.data().cards || [],
        color: doc.data().color,         // ✅ include color
        createdAt: doc.data().createdAt, // optional, since you show it
        lastStudied: doc.data().lastStudied || null,
      }));

      setDecks(data);
    })
    return () => unsubscribe();

  },[])

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderItem = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      style={[styles.deckCard, { backgroundColor: item.color || "#6C63FF" }]}
      onPress={() => router.push(`/deck/${item.id}`)}
    >

      <Text style={styles.deckTitle}>{item.title}</Text>
      <Text style={{color: "#fff"}}>Created: {formatDate(item.createdAt)}</Text>
      <Text style={styles.deckInfo}>{item.cards?.length || 0} flashcards</Text>
      {item.lastStudied && (
        <Text style={styles.deckInfo}>Last studied: {timeAgo(item.lastStudied)}</Text>
      )}
    </TouchableOpacity>
  );

  return(
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold'}}>
        Study Decks
      </Text>
      <FlatList 
        data={decks}
        style={{ marginTop: 20}}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No decks yet. Add a new deck to get started.</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/new-deck')}
      >
        <Text style={styles.addButtonText}>+ Add Deck</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  deckCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deckTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  deckInfo: {
    marginTop: 6,
    fontSize: 14,
    color: "#f0f0f0",
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },

  addButton: {
  backgroundColor: "#6C63FF", // purple accent (you can change)
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 20,
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
},

})