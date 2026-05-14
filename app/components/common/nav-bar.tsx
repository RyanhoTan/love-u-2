import { Text, TouchableOpacity } from "react-native";
import { Row } from "../layout";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";

export function NavBar({ title }: { title: string }) {
  const navigation = useNavigation();

  return (
    <Row
      items="center"
      content="center"
      style={{ padding: 16, position: "relative", minHeight: 60 }}
    >
      <TouchableOpacity
        style={{ padding: 8, position: "absolute", left: 0 }}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft width={32} height={32} />
      </TouchableOpacity>

      <Text style={{ textAlign: "center", fontSize: 20 }}>{title}</Text>
    </Row>
  );
}
