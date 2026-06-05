import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "@/styles/colors";

type MapMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  color: string;
};

type MapOverviewModalProps = {
  visible: boolean;
  onClose: () => void;
  markers: MapMarker[];
};

const DEFAULT_CENTER = {
  latitude: 31.2304,
  longitude: 121.4737,
};

function createMapHtml(markers: MapMarker[]) {
  const escapedMarkers = JSON.stringify(markers);
  const amapKey = process.env.EXPO_PUBLIC_AMAP_KEY ?? "";
  const amapSecurityKey = process.env.EXPO_PUBLIC_AMAP_SECRET ?? "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #f8f3ef;
          }
        </style>
        <script>
          window._AMapSecurityConfig = {
            securityJsCode: "${amapSecurityKey}",
          };
        </script>
        <script src="https://webapi.amap.com/maps?v=2.0&key=${amapKey}"></script>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const markers = ${escapedMarkers};
          const center = markers[0] || {
            latitude: ${DEFAULT_CENTER.latitude},
            longitude: ${DEFAULT_CENTER.longitude},
          };

          const map = new AMap.Map("map", {
            viewMode: "2D",
            zoom: 5,
            center: [center.longitude, center.latitude],
            mapStyle: "amap://styles/normal",
          });

          const points = [];

          markers.forEach((marker) => {
            const markerContent = document.createElement("div");
            markerContent.style.width = "48px";
            markerContent.style.height = "64px";
            markerContent.innerHTML = \`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="48" height="64">
                <defs>
                  <filter id="shadow-\${marker.id}" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.25" />
                  </filter>
                </defs>

                <g filter="url(#shadow-\${marker.id})">
                  <path
                    d="M24 2C12.95 2 4 10.95 4 22c0 13.5 18 36.5 19.15 37.95a1.12 1.12 0 0 0 1.7 0C26 58.5 44 35.5 44 22 44 10.95 35.05 2 24 2z"
                    fill="\${marker.color}"
                  />
                  <circle cx="24" cy="22" r="14" fill="#FFFFFF" />
                  <circle cx="24" cy="22" r="8" fill="\${marker.color}" />
                </g>
              </svg>
            \`;

            const point = [marker.longitude, marker.latitude];
            points.push(point);

            const mapMarker = new AMap.Marker({
              position: point,
              content: markerContent,
              offset: new AMap.Pixel(-24, -64),
              title: marker.name,
            });

            map.add(mapMarker);

            const label = new AMap.Text({
              text: marker.name,
              anchor: "top-center",
              position: point,
              offset: new AMap.Pixel(0, -85),
              style: {
                padding: "4px 8px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.94)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                color: "#3b2f2f",
                fontSize: "12px",
                fontWeight: "600",
              },
            });

            map.add(label);
          });

          if (points.length > 1) {
            map.setFitView();
          }
        </script>
      </body>
    </html>
  `;
}

export function MapOverviewModal({
  visible,
  onClose,
  markers,
}: MapOverviewModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.topMask}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>愿望地图</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>关闭</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapFrame}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: createMapHtml(markers) }}
              style={styles.webview}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export type { MapMarker };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    justifyContent: "flex-end",
  },
  topMask: {
    flex: 1,
    width: "100%",
  },
  sheet: {
    height: "78%",
    backgroundColor: "#fffaf7",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  closeText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.semantic.textPrimary,
  },
  mapFrame: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
