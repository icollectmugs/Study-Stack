import { randomColor } from '@/utils/colors';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../lib/firebase';

export default function NewDeck() {
  const [title, setTitle] = useState('');
  const router = useRouter();

  const createDeck = async () => {
    if (!title.trim()) {
      Alert.alert('Deck name is required');
      return;
    }

    if (title.length > 50) {
      Alert.alert("Error", "Deck title cannot be more than 50 characters.");
      return;
    }

    try {
      await addDoc(collection(db, 'decks'), {
        title: title.trim(),
        cards: [],
        color: randomColor(),
        createdAt: Date.now(),
        lastStudied: null,
      });

      setTitle('');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error creating deck:', error);
      Alert.alert('Failed to create deck');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>New Deck Title</Text>

      <TextInput
        style={[
          styles.input,
          title.length >= 50 && { borderColor: 'red', borderWidth: 2 },
        ]}
        placeholder="e.g. Biology - Cells"
        value={title}
        onChangeText={(text) => {
          if (text.length <= 50) setTitle(text);
        }}
        maxLength={50}
      />

      <Text
        style={[
          styles.counter,
          title.length >= 50 && { color: "red" },
        ]}
      >
        {title.length}/50
      </Text>

      {/* Create Deck button */}
      <TouchableOpacity style={styles.createBtn} onPress={createDeck}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.createBtnText}>Create Deck</Text>
      </TouchableOpacity>

      {/* Cancel button */}
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Ionicons name="close-circle-outline" size={20} color="#333" />
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  counter: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontSize: 13,
    color: "#888",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    backgroundColor: "#eee",
    paddingVertical: 14,
    borderRadius: 30,
  },
  cancelBtnText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
});
