import { Image, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Redirect } from 'expo-router';
import { Column, Row } from "@/components/layout";
import { AvatarMale, AvatarFemale } from "@/assets/images";
import { Music } from "@/assets/images/status";

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  return (
    <>
      {isLoggedIn ? (
        <Column gap={6} flex={1}>
          <Row gap={20} items="center" content="center" style={{ marginTop: 60 }}>
            <Image source={AvatarMale} style={{ width: 80, height: 80, borderRadius: 50 }} />
            <Image source={AvatarFemale} style={{ width: 80, height: 80, borderRadius: 50 }} />
          </Row>
          <Text style={{ fontSize: 16, marginHorizontal: 'auto' }}>我们在一起</Text>
          <Row content="center" items="baseline" gap={8}>
            <Text style={{ fontSize: 64, fontWeight: 'bold', color: '#ff5b7e' }}>520</Text>
            <Text style={{ fontSize: 16, color: '#ff5b7e', fontWeight: 'bold' }}>天</Text>
          </Row>
          <Text style={{ fontSize: 16, marginHorizontal: 'auto', color: '#929091' }}>2023年1月1日</Text>
          <Row center gap={12} style={{ overflow: 'hidden' }} >

            <TouchableOpacity>
            <Column gap={8} bg='#fff' rounded={8} style={{ padding: 8, marginTop: 42 }} >
              <Image source={Music} style={{ width: 100, height: 100, borderRadius: 8 }} resizeMode="contain" />
              <Text style={{ fontSize: 16, textAlign: 'center' }}>音乐</Text>
            </Column>
            </TouchableOpacity>

          </Row>
          <TouchableOpacity style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, marginTop: 42 }}>
            <Column gap={12}>
            <Text style={{ fontSize: 14 }}>下一个纪念日</Text>
            <Row>
              <Text style={{ fontSize: 18 }}>恋爱纪念日还有 </Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ff5b7e' }}>1</Text>
            <Text style={{ fontSize: 18 }}> 天</Text>
            </Row>
            <Text style={{ backgroundColor: '#f0f0f0', padding: 4, borderRadius: 6, alignSelf: 'flex-start' }}>2024.01.01</Text>
            </Column>
            </TouchableOpacity>
        </Column>
      ) :
        (
          <Redirect href="/auth" />
        )}
    </>
  );
}
