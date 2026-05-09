import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type HealthResponse = {
  status: string;
  timestamp: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const healthEndpoint = useMemo(() => `${API_URL}/health`, []);

  useEffect(() => {
    let isActive = true;

    const loadHealth = async () => {
      try {
        const response = await fetch(healthEndpoint);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;
        if (isActive) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
          setHealth(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadHealth();

    return () => {
      isActive = false;
    };
  }, [healthEndpoint]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Health</Text>
      <Text style={styles.url}>{healthEndpoint}</Text>

      {loading ? <ActivityIndicator size="small" /> : null}

      {health ? (
        <View style={styles.resultBox}>
          <Text style={styles.ok}>Status: {health.status}</Text>
          <Text style={styles.meta}>Time: {new Date(health.timestamp).toLocaleString()}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.resultBox}>
          <Text style={styles.error}>Request failed: {error}</Text>
          <Text style={styles.meta}>Check EXPO_PUBLIC_API_URL for your current network.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 30
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  url: {
    fontSize: 13,
    color: "#555"
  },
  resultBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    gap: 4
  },
  ok: {
    color: "#0b7a0b",
    fontWeight: "600"
  },
  error: {
    color: "#c23131",
    fontWeight: "600"
  },
  meta: {
    color: "#555",
    fontSize: 13
  }
});
