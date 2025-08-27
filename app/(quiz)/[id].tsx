import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { db } from "../../lib/firebase";

export default function() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [deck, setDeck] = useState(null);
    const [ currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const fetchDeck = async () => {
            const snap = await getDoc(doc(db, "decks", id));
            if (snap.exists()) {
                const data = snap.data();
                // shuffle cards randomly
                const shuffled = [...(data.cards ||  [])].sort(() => Math.random() - 0.5);
                setDeck({ id: snap.id, ...data, cards: shuffled});
            }
        };
        if  (id) fetchDeck();
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
                <Button
                    title="Restart Quiz"
                    onPress={() => {
                        setCurrentIndex(0);
                        setCorrectCount(0);
                        setShowAnswer(false);
                        setFinished(false);
                    }}
                />
                <Button title="Back to Deck" onPress={() => router.back()} />
            </View>
        );
    }

    const card = deck.cards[currentIndex];

    return (
        <View style={styles.container}>
            <Text style={styles.progress}>
                Card {currentIndex + 1} /  {deck.cards.length}
            </Text>

            <View style={styles.card}>
                <Text style={styles.question}>
                    {showAnswer ? `A: ${card.answer}` : `Q: ${card.question}`}
                </Text>
            </View>

            {!showAnswer ? (
                <Button title="Show Answer" onPress={() => setShowAnswer(true)} />
            ) : (
                <View style={styles.answerButtons}>
                    <Button title="✅ Correct" onPress={() => handleAnswer(true)} />
                    <Button title="❌ Incorrect" onPress={() => handleAnswer(false)}/>
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
    },
    score: {
        fontSize: 20,
        textAlign: "center",
        marginBottom: 16,
    },
    progress: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: "center",
    },
    card: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 20,
        marginVertical: 20,
        minHeight: 120,
        justifyContent: "center",
    },
    question: {
        fontSize: 20,
        textAlign: "center",
    },
    answerButtons: {
        flexDirection:  "row",
        justifyContent: "space-around",
        marginTop: 20,
    },
});