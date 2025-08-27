import { useRouter } from "expo-router";
import { collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../lib/firebase";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

type Deck = {
  id: string;
  title: string;
  cards: Flashcard[];
};

export default function HomeScreen() {
  const [ decks, setDecks] = useState<Deck[]>([]);
  const router = useRouter();

  // useEffect(() => {
  //   loadDecks();
  // }, []);

  useEffect(() => {
    const fetchDecks = async () => {
      const snap = await getDocs(collection(db, 'decks'));
      console.log('Decks:', snap.docs.map((doc) => doc.data()));
      // setDecks(snap.docs.map((doc) => doc.data()))
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
      }));
      setDecks(data);
    })
    return () => unsubscribe();

  },[])

  // const loadDecks = async () => {
  //   const data = await AsyncStorage.getItem('FLASHCARDS');
  //   if (data) {
  //     setDecks(JSON.parse(data));
  //   }

  // }

  // const addDeck = async () => {
  //   const newDeck = {
  //     id: Date.now().toString(), 
  //     title: `Deck ${decks.length + 1}`
  //   }
  //   const updated = [...decks, newDeck];
  //   setDecks(updated);
  //   await AsyncStorage.setItem('FLASHCARDS', JSON.stringify(updated));

  // }
  
  const renderItem = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/deck/${item.id}`)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.cards?.length || 0} flashcards</Text>
    </TouchableOpacity>
  )

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

      <Button 
        title="Add Deck"
        onPress={() => router.push('/new-deck')}
      />
      {/* <FlatList 
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push(`/deck/${item.id}`)}
            style={{ 
              padding: 20, 
              marginTop: 10,
              backgroundColor: '#eee',
              borderRadius: 8,
              
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10 }}>{item.title}</Text>
          </TouchableOpacity>
        )}
        
        />
      <Button
        title="Add Deck"
        onPress={addDeck}
      /> */}


    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    // marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  empty: {
    textAlign: 'center',
    marginVertical: 24,
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  }
})