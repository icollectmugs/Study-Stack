import { db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StudyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [deck, setDeck] = useState<any | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!id) return;
    const fetchDeck = async () => {
      const snap = await getDoc(doc(db, "decks", id));
      if (snap.exists()) setDeck({ id: snap.id, ...snap.data() });
    };
    fetchDeck();
  }, [id]);

  useEffect(() => {
    flipAnim.setValue(0);
    setFlipped(false);
  }, [currentIndex, flipAnim]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 180,
      duration: 350,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  if (!deck) return <Text style={styles.loading}>Loading...</Text>;
  if (!deck.cards || deck.cards.length === 0)
    return <Text style={styles.loading}>No Cards to Study</Text>;

  const currentCard = deck.cards[currentIndex];

  return (
    <View style={styles.container}>
      {/* Flashcard */}
      <Pressable onPress={flipCard} style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: deck.color || "#6C63FF" }]}>
          {/* Front */}
          <Animated.View
            style={[
              styles.cardFace,
              {
                transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }],
              },
            ]}
          >
            <Text style={styles.cardText}>{currentCard.question}</Text>
          </Animated.View>

          {/* Back */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              {
                transform: [{ perspective: 1000 }, { rotateY: backInterpolate }],
              },
            ]}
          >
            <Text style={styles.cardText}>{currentCard.answer}</Text>
          </Animated.View>
        </View>
      </Pressable>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlBtn,
            currentIndex === 0 && styles.controlBtnDisabled,
          ]}
          onPress={() => {
            setFlipped(false);
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
          }}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={currentIndex === 0 ? "#666" : "#fff"}
          />
          <Text
            style={[
              styles.controlText,
              currentIndex === 0 && { color: "#666" },
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlBtn,
            currentIndex === deck.cards.length - 1 && styles.controlBtnDisabled,
          ]}
          onPress={() => {
            setFlipped(false);
            setCurrentIndex((prev) =>
              Math.min(prev + 1, deck.cards.length - 1)
            );
          }}
          disabled={currentIndex === deck.cards.length - 1}
        >
          <Text
            style={[
              styles.controlText,
              currentIndex === deck.cards.length - 1 && { color: "#666" },
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={currentIndex === deck.cards.length - 1 ? "#666" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* Back to Deck Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-undo" size={20} color="#fff" />
        <Text style={styles.backBtnText}>Back to Deck</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loading: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 50,
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  card: {
    width: "90%",
    height: 320,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardFace: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    padding: 20,
  },
  cardBack: {
    backgroundColor: "transparent",
  },
  cardText: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#fff",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  controlBtnDisabled: {
    backgroundColor: "#eee",
  },
  controlText: {
    color: "#fff",
    fontWeight: "600",
    marginHorizontal: 6,
    fontSize: 15,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 15,
  },
});
