import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/views/HomeScreen';
// These screens will be added in later steps:
import { AddBookScreen } from './src/views/AddBookScreen';
import { BookDetailScreen } from './src/views/BookDetailScreen';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <View backgroundColor="#13131f" style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,   // each screen draws its own header
          contentStyle: { backgroundColor: '#13131f' },
          cardStyle: { backgroundColor: '#13131f' }, 
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* Uncomment as you build each screen: */}
        <Stack.Screen name="AddBook"    component={AddBookScreen} />
        <Stack.Screen name="BookDetail" component={BookDetailScreen} />
       
      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
}
