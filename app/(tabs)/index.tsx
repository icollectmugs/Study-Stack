// index.tsx ← First tab screen (usually Home)

import { useRouter } from 'expo-router';
import { collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../lib/firebase';

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
  const [decks, setDecks] = useState<Deck[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'decks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDecks(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDecks = async () => {
      const snap = await getDocs(collection(db, 'decks'));
      console.log('Decks:', snap.docs.map((doc) => doc.data()));
    };

    fetchDecks();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/deck/${item.id}`)}
      >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.cards?.length || 0}     flashcards</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Study Decks
      </Text>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No decks yet. Add one below!</Text>
        }
      />
      <Button title=" + Add Deck" onPress={() => router.push('/new-deck')} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
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
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    marginVertical: 24,
    color: '#999',
  },
});
