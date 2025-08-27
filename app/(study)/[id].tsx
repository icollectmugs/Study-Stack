import { db } from "@/lib/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Animated, Button, Pressable, StyleSheet, Text, View } from 'react-native';

export default function StudyScreen(){
  const {id} = useLocalSearchParams();
  const router = useRouter()
  const [deck, setDeck] = useState(null)
  const [currentIndex, setCurrenIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [flipAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if(!id) return;
    const fetchDeck = async () => {
      const snap = await getDoc(doc(db, "decks", id));
      if (snap.exists()) setDeck({ id: snap.id, ...snap.data() })
    };
  fetchDeck();
  }, [id])


  // Flip Animation
  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 10,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped))
  };

  if(!deck) return <Text>Loading...</Text>;
  if(!deck.cards || deck.cards.length === 0) return <Text>No Cards to Study</Text>

  const currentCard = deck.cards[currentIndex];

  return(
    <View style={styles.container}>
      <Pressable onPress={flipCard} style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                {
                  rotateY: flipAnim.interpolate({
                    inputRange: [0, 180],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cardText}>
            {flipped ? currentCard.answer : currentCard.question}
          </Text>
        </Animated.View>
      </Pressable>

      <View style={styles.controls}>
        <Button 
          title="Previous"
          onPress={() => {
            setFlipped(false);
            setCurrenIndex((prev) => Math.max(prev - 1, 0))
          }}
          disabled={currentIndex === 0}
        />
        <Button 
          title="Next"
          onPress={() => {
            setFlipped(false);
            setCurrenIndex((prev) => Math.min(prev + 1, deck.cards.length -1))
          }}
          disabled={currentIndex === deck.cards.length - 1}
        />
      </View>

    </View>
  )

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  card: {
    width: '90%',
    height: 300,
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  }
})