import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../lib/firebase";

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [deck, setDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      const snap = await getDoc(doc(db, "decks", id));
      if (snap.exists()) {
        const data = snap.data();
        const shuffled = [...(data.cards || [])].sort(
          () => Math.random() - 0.5
        );
        setDeck({ id: snap.id, ...data, cards: shuffled });
      }
    };
    if (id) fetchDeck();
  }, [id]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    if (currentIndex + 1 < deck.cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      setFinished(true);
    }
  };

  if (!deck) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  if (finished) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quiz Finished 🎉</Text>
        <Text style={styles.score}>
          You got {correctCount} / {deck.cards.length} correct
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            setCurrentIndex(0);
            setCorrectCount(0);
            setShowAnswer(false);
            setFinished(false);
          }}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.btnText}>Restart Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: "#555" }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.btnText}>Back to Deck</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = deck.cards[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Card {currentIndex + 1} / {deck.cards.length}
      </Text>

      <View style={styles.card}>
        <Text style={styles.question}>
          {showAnswer ? `A: ${card.answer}` : `Q: ${card.question}`}
        </Text>
      </View>

      {!showAnswer ? (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setShowAnswer(true)}
        >
          <Ionicons name="eye" size={18} color="#fff" />
          <Text style={styles.btnText}>Show Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.answerButtons}>
          <TouchableOpacity
            style={[styles.answerBtn, { backgroundColor: "#4CAF50" }]}
            onPress={() => handleAnswer(true)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.btnText}>Correct</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.answerBtn, { backgroundColor: "#F44336" }]}
            onPress={() => handleAnswer(false)}
          >
            <Ionicons name="close-circle" size={18} color="#fff" />
            <Text style={styles.btnText}>Incorrect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#111",
  },
  score: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "#444",
  },
  progress: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    color: "#666",
  },
  card: {
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    width: "100%",
  },
  question: {
    fontSize: 20,
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 6,
  },
  answerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  answerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
