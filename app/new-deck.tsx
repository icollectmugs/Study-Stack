import { useRouter } from 'expo-router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../lib/firebase';
import { randomColor } from '@/utils/colors';

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
            router.replace('/(tabs)')
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
                    title.length >= 50 && { borderColor: 'red', borderWidth: 2}
                ]}
                placeholder="e.g. Biology - cells"
                value={title}
                onChangeText={(text) => {
                    if (text.length <= 50)
                        setTitle(text);
                }}
                maxLength={50}
            />
            <Text style={{
                color: "#888",
                fontSize: 12,
            }}>
                {title.length}/50
            </Text>
            <Button title="Create Deck" onPress={createDeck}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginVertical: 6,
    },
});