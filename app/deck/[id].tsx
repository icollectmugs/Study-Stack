import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../lib/firebase';

export default function DeckDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [deck, setDeck] = useState(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [editingCard, setEditingCard] = useState(null);
    const [renameVisible, setRenameVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [deleting, setDeleting] = useState(false)
  

    const fetchDeck = async () => {
        const docRef = doc(db, 'decks', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            setDeck({ id: snap.id, ...snap.data() });
        }
    };

    useEffect(() => {
        if (id) fetchDeck();
    }, [id]);

    const addFlashcard = async () => {
        if (!question.trim() || !answer.trim()) {
            Alert.alert('Please fill in both question and answer');
            return;
        }

        const docRef = doc(db, 'decks', id);

        if (editingCard) {
            // Remove old card and add updated card
            await updateDoc(docRef, {
                cards: deck.cards.map(c => c.id === editingCard.id ? { ...c, question, answer } : c)
            });
            setEditingCard(null);
        } else {
            await updateDoc(docRef, {
                cards: [...(deck.cards || []), {
                    id: Date.now().toString(),
                    question: question.trim(),
                    answer: answer.trim(),
                }],
            });
        }

        setQuestion('');
        setAnswer('');
        fetchDeck();
    };

    const startEdit = (card) => {
        setEditingCard(card);
        setQuestion(card.question);
        setAnswer(card.answer);
    };

    const deleteCard = async (card) => {
        const docRef = doc(db, 'decks', id);
        await updateDoc(docRef, {
            cards: deck.cards.filter(c => c.id !== card.id)
        });
        fetchDeck();
    };

    const deleteDeck = async () => {
      Alert.alert(
        'Delete Deck',
        'Are you sure you want to delete this deck? This action cannot be undone.',
        [
          {text: "Cancel", style: "cancel"},
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try{
                setDeleting(true);
                if (typeof id === 'string') {
                    await deleteDoc(doc(db, 'decks', id)); // start loading
                } else {
                    console.error("Invalid deck ID");
                    Alert.alert("Error", "Invalid deck ID");
                }
                router.back()
              } catch(error){
                console.error("Error deleting deck", error)
                Alert.alert("Error", "Failed to delete deck")
              } finally {
                setDeleting(false)
              }
            },
          },
        ]
      );
    };

    const renameDeck = async () => {
      if(!newTitle.trim()) {
        Alert.alert('Error', "Deck title cannot be empty");
        return;
      }
      if(newTitle.trim().length > 50){
        Alert.alert("Error", "Deck title cannot be more than 50 characters.")
        return;
      }

      const docRef = doc(db, 'decks', id);
      await updateDoc(docRef, {
        title: newTitle.trim(),
      });
      setDeck((prev) => prev ? { ...prev, title: newTitle.trim() } : prev);
      // setNewTitle('');
      setRenameVisible(false);
      // fetchDeck()
    }

    
    return (
        <KeyboardAvoidingView
            style={{ flex: 1, paddingTop: 40 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            {deck ? (
              <>
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={0}>{deck.title}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#4CAF50" }]}
                    onPress={() => router.push(`/(study)/${id}`)}
                  >
                    <Ionicons name="book-outline" size={18} color="#fff" />
                    <Text style={styles.actionText}>Study</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#2196F3" }]}
                    onPress={() => router.push(`/(quiz)/${id}`)}
                  >
                    <MaterialIcons name="quiz" size={18} color="#fff" />
                    <Text style={styles.actionText}>Quiz</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#FF9800" }]}
                    onPress={() => {
                      setNewTitle(deck.title);
                      setRenameVisible(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={styles.actionText}>Rename</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#F44336" }]}
                    onPress={deleteDeck}
                    disabled={deleting}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.actionText}>
                      {deleting ? "Deleting..." : "Delete"}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
              <FlatList
                  contentContainerStyle={styles.container}
                  data={deck.cards || []}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Text style={styles.q}>Q: {item.question}</Text>
                    <Text style={styles.a}>A: {item.answer}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.cardBtn, { backgroundColor: "#2196F3" }]}
                        onPress={() => startEdit(item)}
                      >
                        <Feather name="edit-2" size={16} color="#fff" />
                        <Text style={styles.cardBtnText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.cardBtn, { backgroundColor: "#F44336" }]}
                        onPress={() => deleteCard(item)}
                      >
                        <Feather name="trash-2" size={16} color="#fff" />
                        <Text style={styles.cardBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  )}
                  ListEmptyComponent={<Text style={styles.empty}>No flashcards yet</Text>}
                  ListFooterComponent={
                  <>
                      <TextInput
                      style={styles.input}
                      placeholder="Question"
                      value={question}
                      onChangeText={setQuestion}
                      />
                      <TextInput
                      style={styles.input}
                      placeholder="Answer"
                      value={answer}
                      onChangeText={setAnswer}
                      />
                     <TouchableOpacity
                      style={[styles.addBtn, editingCard ? { backgroundColor: "#FF9800" } : null]}
                      onPress={addFlashcard}
                    >
                      <Ionicons
                        name={editingCard ? "save-outline" : "add-circle-outline"}
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.addBtnText}>
                        {editingCard ? "Save Changes" : "Add Flashcard"}
                      </Text>
                    </TouchableOpacity>

                  </>
                  }
              />
            </>
            ) : (
            <Text>Loading...</Text>
            )}

            <Modal
              visible={renameVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setRenameVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalTitle}>
                    <TextInput 
                      style={[
                        styles.input,
                        newTitle.length >= 50 && { borderColor: 'red'}
                      ]}
                      placeholder="New Deck Title"
                      value={newTitle}
                      onChangeText={(text) => {
                        if(text.length <= 50) setNewTitle(text);
                      }}
                      maxLength={50}
                    />
                    <Text style={{ color: newTitle.length >= 50 ? 'red' : '#000', fontSize: 12}}>
                      {newTitle.length}/50
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                      <Button title="Cancel" onPress={() => setRenameVisible(false)}/>
                      <Button title="Save" onPress={renameDeck}/>
                    </View>
                  </View>

                </View>

              </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
    marginLeft: 12,
  },

  card: {
    backgroundColor: "#6C63FF", // same base theme as Add Deck button
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  q: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
    marginBottom: 6,
  },
  a: {
    fontSize: 15,
    color: "#f0f0f0",
  },

  input: {
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    fontSize: 15,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  empty: {
    textAlign: "center",
    marginVertical: 24,
    fontSize: 15,
    color: "#999",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  cardBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardBtnText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },

});
