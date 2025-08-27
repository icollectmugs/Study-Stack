import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
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
                  <Button
                    title="Study"
                    onPress={() => router.push(`/(study)/${id}`)}
                  />
                  <Button
                    title="Quiz"
                    onPress={() => router.push(`/(quiz)/${id}`)}
                  />
                  <Button title="Rename" color="blue" onPress={() => {
                    setNewTitle(deck.title);
                    setRenameVisible(true);
                  }} />
                  <Button title={deleting ? "Deleting..." : "Delete"} color="red" onPress={deleteDeck} disabled={deleting} />
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
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                      <Button title="Edit" onPress={() => startEdit(item)} />
                      <Button title="Delete" color="red" onPress={() => deleteCard(item)} />
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
                      <Button
                      title={editingCard ? "Save Changes" : "Add Flashcard"}
                      onPress={addFlashcard}
                      />
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
    flexWrap: 'wrap',
  },
  deleteButton: {
    flexShrink: 0,
  },
  card: { backgroundColor: '#f3f3f3', padding: 12, borderRadius: 6, marginBottom: 8 },
  q: { fontWeight: 'bold' },
  a: { marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginVertical: 6 },
  empty: { textAlign: 'center', marginVertical: 16, color: '#777' },

  modalOverlay: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor:'#fff',
    padding: 20, 
    borderRadius: 8, 
    width: '80%'
  },
  modalTitle: {
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 10
  }
});
