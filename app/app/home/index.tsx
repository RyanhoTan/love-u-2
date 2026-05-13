import {  Text } from "react-native";
import { useState } from "react";
import { Redirect } from 'expo-router';

export default function HomeScreen() {
 const [isLoggedIn, setIsLoggedIn] = useState(true);
  return (  
    <>
    { isLoggedIn ? (
      <Text>Home</Text> 
    ) :
       (
        <Redirect href="/auth" />
  )}
  </>
  );
}
