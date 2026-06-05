import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Locate, Search, X } from "lucide-react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { IconsWishListNoImgSvg } from "@/assets";
import { toast } from "@/components/common";
import { colors } from "@/styles/colors";

type SelectedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

type PlaceCategory = "all" | "food" | "scenic" | "shopping" | "other";

type PlaceItem = SelectedLocation & {
  id: string;
  address: string;
  distance: string;
  cover?: string;
  category: PlaceCategory;
};

type MapPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: SelectedLocation) => void;
};

type WebViewMapMessage =
  | {
      type: "mapReady";
    }
  | {
      type: "mapMoved";
      latitude: number;
      longitude: number;
    }
  | {
      type: "debug";
      message: string;
      extra?: unknown;
    }
  | {
      type: "locateResult";
      success: boolean;
      latitude?: number;
      longitude?: number;
      message?: string;
    };

type AmapPoi = {
  id?: string;
  name?: string;
  address?: string;
  location?: string;
  distance?: string | number;
  type?: string;
  photos?: {
    title?: string;
    url?: string;
  }[];
};

const CATEGORY_OPTIONS: { key: PlaceCategory; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "food", label: "美食" },
  { key: "scenic", label: "景点" },
  { key: "shopping", label: "购物" },
  { key: "other", label: "其他" },
];

const DEFAULT_CENTER = {
  latitude: 22.5398,
  longitude: 114.0548,
};

const DEFAULT_RADIUS = 2000;

const CATEGORY_KEYWORDS: Record<Exclude<PlaceCategory, "all">, string> = {
  food: "美食",
  scenic: "景点",
  shopping: "购物",
  other: "生活服务",
};

function formatUnknownError(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function getCurrentLocationWithTimeout(timeoutMs: number) {
  return new Promise<Location.LocationObject>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Location timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      mayShowUserSettingsDialog: true,
    })
      .then((location) => {
        clearTimeout(timeoutId);
        resolve(location);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function guessCategory(typeText: string | undefined): PlaceCategory {
  const text = typeText || "";

  if (text.includes("餐饮") || text.includes("美食")) {
    return "food";
  }

  if (text.includes("风景") || text.includes("景点") || text.includes("旅游")) {
    return "scenic";
  }

  if (text.includes("购物")) {
    return "shopping";
  }

  return "other";
}

function formatDistance(distance?: string | number) {
  const numericDistance =
    typeof distance === "number" ? distance : parseFloat(distance || "");

  if (!Number.isFinite(numericDistance)) {
    return "";
  }

  if (numericDistance >= 1000) {
    return `${(numericDistance / 1000).toFixed(1)}km`;
  }

  return `${Math.round(numericDistance)}m`;
}

function mapPoiToPlaceItem(poi: AmapPoi, index: number): PlaceItem | null {
  const rawLocation = poi.location || "";
  const parts = rawLocation.split(",");

  if (parts.length !== 2) {
    return null;
  }

  const longitude = parseFloat(parts[0]);
  const latitude = parseFloat(parts[1]);

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  const category = guessCategory(poi.type);
  const photoUrl = poi.photos?.find((photo) => Boolean(photo.url))?.url;

  return {
    id: poi.id || `${poi.name || "place"}-${index}`,
    name: poi.name || "未知地点",
    latitude,
    longitude,
    address: poi.address || "暂无地址信息",
    distance: formatDistance(poi.distance),
    cover: photoUrl,
    category,
  };
}

function createMapHtml(center: { latitude: number; longitude: number }) {
  const amapKey = process.env.EXPO_PUBLIC_AMAP_KEY || "";
  const amapSecurityKey = process.env.EXPO_PUBLIC_AMAP_SECRET || "";

  return [
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />',
    "<style>",
    "html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #fffaf7; }",
    ".center-pin { position: absolute; left: 50%; top: 50%; width: 48px; height: 64px; transform: translate(-50%, -100%); pointer-events: none; z-index: 9; }",
    ".center-shadow { filter: drop-shadow(0 6px 14px rgba(0,0,0,0.18)); }",
    "</style>",
    "<script>",
    `window._AMapSecurityConfig = { securityJsCode: "${amapSecurityKey}" };`,
    "</script>",
    `<script src="https://webapi.amap.com/maps?v=2.0&key=${amapKey}"></script>`,
    "</head>",
    "<body>",
    '<div id="map"></div>',
    '<div class="center-pin">',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="48" height="64" class="center-shadow">',
    '<path d="M24 2C12.95 2 4 10.95 4 22c0 13.5 18 36.5 19.15 37.95a1.12 1.12 0 0 0 1.7 0C26 58.5 44 35.5 44 22 44 10.95 35.05 2 24 2z" fill="#FF4F87" />',
    '<circle cx="24" cy="22" r="14" fill="#FFFFFF" />',
    '<circle cx="24" cy="22" r="8" fill="#FF4F87" />',
    "</svg>",
    "</div>",
    "<script>",
    "function postMessageToNative(data) {",
    "  window.ReactNativeWebView.postMessage(JSON.stringify(data));",
    "}",
    "function postDebug(message, extra) {",
    '  postMessageToNative({ type: "debug", message: message, extra: extra });',
    "}",
    "function locateWithAmap() {",
    "  try {",
    "    AMap.plugin('AMap.Geolocation', function() {",
    "      var geolocation = new AMap.Geolocation({",
    "        enableHighAccuracy: true,",
    "        timeout: 10000,",
    "        zoomToAccuracy: false,",
    "        showButton: false,",
    "        showMarker: false,",
    "        showCircle: false",
    "      });",
    "      geolocation.getCurrentPosition(function(status, result) {",
    "        if (status === 'complete' && result && result.position) {",
    "          postMessageToNative({",
    "            type: 'locateResult',",
    "            success: true,",
    "            latitude: result.position.lat,",
    "            longitude: result.position.lng,",
    "            message: result.location_type || 'amap-geolocation-success'",
    "          });",
    "          return;",
    "        }",
    "        postMessageToNative({",
    "          type: 'locateResult',",
    "          success: false,",
    "          message: JSON.stringify(result || {})",
    "        });",
    "      });",
    "    });",
    "  } catch (error) {",
    "    postMessageToNative({",
    "      type: 'locateResult',",
    "      success: false,",
    "      message: String(error)",
    "    });",
    "  }",
    "}",
    "var initialCenter = {",
    `  latitude: ${center.latitude},`,
    `  longitude: ${center.longitude}`,
    "};",
    "window.__LOVEU_MAP__ = new AMap.Map('map', {",
    "  viewMode: '2D',",
    "  zoom: 15,",
    "  center: [initialCenter.longitude, initialCenter.latitude],",
    "  mapStyle: 'amap://styles/normal'",
    "});",
    "function postCenter(type) {",
    "  var mapCenter = window.__LOVEU_MAP__.getCenter();",
    "  postMessageToNative({",
    "    type: type,",
    "    latitude: mapCenter.lat,",
    "    longitude: mapCenter.lng",
    "  });",
    "}",
    "window.__LOVEU_MAP__.on('complete', function() {",
    '  postDebug("map-complete", initialCenter);',
    '  postMessageToNative({ type: "mapReady" });',
    "  setTimeout(function() {",
    '    postCenter("mapMoved");',
    "  }, 200);",
    "});",
    "window.__LOVEU_MAP__.on('moveend', function() {",
    '  postDebug("map-moveend");',
    '  postCenter("mapMoved");',
    "});",
    "window.addEventListener('message', function(event) {",
    "  try {",
    "    var payload = JSON.parse(event.data);",
    "    if (payload && payload.type === 'locateUser') {",
    "      postDebug('webview-locateUser-received');",
    "      locateWithAmap();",
    "    }",
    "  } catch (error) {",
    "    postDebug('webview-message-error', String(error));",
    "  }",
    "});",
    "</script>",
    "</body>",
    "</html>",
  ].join("");
}

export function MapPickerModal({
  visible,
  onClose,
  onSelectLocation,
}: MapPickerModalProps) {
  const webViewRef = useRef<WebView>(null);
  const isMapReadyRef = useRef(false);
  const pendingMoveRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const suppressNextMapMovedRef = useRef(false);
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState<PlaceCategory>("all");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationDebugText, setLocationDebugText] = useState("");

  const mapHtml = useMemo(() => createMapHtml(DEFAULT_CENTER), []);
  const mapSource = useMemo(() => ({ html: mapHtml }), [mapHtml]);

  const moveMapTo = useCallback((latitude: number, longitude: number) => {
    console.log("[MapPickerModal] moveMapTo called", {
      latitude,
      longitude,
      hasWebViewRef: Boolean(webViewRef.current),
      isMapReady: isMapReadyRef.current,
    });

    if (!isMapReadyRef.current) {
      pendingMoveRef.current = { latitude, longitude };
      console.log("[MapPickerModal] moveMapTo queued until map ready");
      return;
    }

    const injectedScript = `
      (function() {
        try {
          if (!window.__LOVEU_MAP__) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "debug",
              message: "inject-moveTo-map-undefined"
            }));
            return;
          }

          window.__LOVEU_MAP__.setCenter([${longitude}, ${latitude}]);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "debug",
            message: "inject-moveTo-success",
            extra: { latitude: ${latitude}, longitude: ${longitude} }
          }));
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "debug",
            message: "inject-moveTo-error",
            extra: String(error)
          }));
        }
      })();
      true;
    `;

    webViewRef.current?.injectJavaScript(injectedScript);
  }, []);

  const requestWebViewLocate = useCallback(() => {
    console.log("[MapPickerModal] requestWebViewLocate called", {
      hasWebViewRef: Boolean(webViewRef.current),
      isMapReady: isMapReadyRef.current,
    });

    if (!isMapReadyRef.current) {
      setLocationDebugText("地图尚未就绪，暂时无法使用高德定位");
      return;
    }

    webViewRef.current?.injectJavaScript(`
      (function() {
        window.dispatchEvent(new MessageEvent('message', {
          data: JSON.stringify({ type: 'locateUser' })
        }));
      })();
      true;
    `);
  }, []);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      return activeCategory === "all" || place.category === activeCategory;
    });
  }, [activeCategory, places]);

  const selectedPlace =
    filteredPlaces.find((place) => place.id === selectedPlaceId) ||
    filteredPlaces[0] ||
    places[0] ||
    null;

  const fetchPlaces = useCallback(
    async (keyword?: string, mode?: "around" | "text") => {
      const amapKey = process.env.EXPO_PUBLIC_AMAP_SERVICE_KEY || "";

      if (!amapKey) {
        return;
      }

      setLoading(true);

      try {
        const trimmedKeyword = keyword?.trim() || "";
        const categoryKeyword =
          activeCategory === "all"
            ? ""
            : CATEGORY_KEYWORDS[
                activeCategory as Exclude<PlaceCategory, "all">
              ];

        const isGlobalSearch =
          mode === "text" ? Boolean(trimmedKeyword) : Boolean(trimmedKeyword);
        const realKeyword = trimmedKeyword || categoryKeyword;

        const url = new URL(
          isGlobalSearch
            ? "https://restapi.amap.com/v3/place/text"
            : "https://restapi.amap.com/v3/place/around",
        );
        url.searchParams.set("key", amapKey);
        url.searchParams.set("offset", "20");
        url.searchParams.set("page", "1");
        url.searchParams.set("extensions", "all");

        if (isGlobalSearch) {
          url.searchParams.set("keywords", realKeyword);
          url.searchParams.set(
            "location",
            `${mapCenter.longitude},${mapCenter.latitude}`,
          );
        } else {
          url.searchParams.set(
            "location",
            `${mapCenter.longitude},${mapCenter.latitude}`,
          );
          url.searchParams.set("radius", String(DEFAULT_RADIUS));
          url.searchParams.set("sortrule", "distance");

          if (realKeyword) {
            url.searchParams.set("keywords", realKeyword);
          }
        }

        const response = await fetch(url.toString());
        const data = (await response.json()) as { pois?: AmapPoi[] };
        const nextPlaces = (data.pois || [])
          .map(mapPoiToPlaceItem)
          .filter((item): item is PlaceItem => Boolean(item));

        setPlaces(nextPlaces);
        setSelectedPlaceId(nextPlaces[0]?.id || null);

        if (isGlobalSearch && nextPlaces[0]) {
          suppressNextMapMovedRef.current = true;
          setMapCenter({
            latitude: nextPlaces[0].latitude,
            longitude: nextPlaces[0].longitude,
          });
          moveMapTo(nextPlaces[0].latitude, nextPlaces[0].longitude);
        }
      } catch (error) {
        console.log("failed to fetch places", error);
        setPlaces([]);
        setSelectedPlaceId(null);
      } finally {
        setLoading(false);
      }
    },
    [activeCategory, mapCenter.latitude, mapCenter.longitude, moveMapTo],
  );

  const fetchPlacesRef = useRef(fetchPlaces);
  fetchPlacesRef.current = fetchPlaces;

  useEffect(() => {
    if (!visible) {
      isMapReadyRef.current = false;
      pendingMoveRef.current = null;
      setSearchText("");
      setActiveCategory("all");
      setPlaces([]);
      setSelectedPlaceId(null);
      setMapCenter(DEFAULT_CENTER);
      setLocationDebugText("");
    } else {
      suppressNextMapMovedRef.current = true;
      moveMapTo(DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude);
      void fetchPlacesRef.current(undefined, "around");
    }
  }, [visible, moveMapTo]);

  const handleSearch = useCallback(() => {
    const trimmed = searchText.trim();
    const mode: "around" | "text" = trimmed ? "text" : "around";
    void fetchPlaces(trimmed || undefined, mode);
  }, [fetchPlaces, searchText]);

  // TODO：这里死活获取不到用户位置
  const handleLocateUser = useCallback(async () => {
    if (locating) {
      console.log("[MapPickerModal] handleLocateUser skipped because locating");
      return;
    }

    try {
      console.log("[MapPickerModal] handleLocateUser start");
      setLocating(true);
      setLocationDebugText("开始定位...");

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      console.log(
        "[MapPickerModal] location services enabled",
        servicesEnabled,
      );

      if (!servicesEnabled) {
        const message = "系统定位服务未开启";
        setLocationDebugText(message);
        toast.error("定位失败，请开启系统定位", message);
        return;
      }

      const currentPermission = await Location.getForegroundPermissionsAsync();
      console.log(
        "[MapPickerModal] current foreground permission",
        currentPermission,
      );

      const permission = await Location.requestForegroundPermissionsAsync();
      console.log("[MapPickerModal] location permission result", permission);

      if (!permission.granted) {
        const message = `定位权限未授权: ${permission.status}`;
        setLocationDebugText(message);
        toast.info("请先允许定位权限", message);
        return;
      }

      if (Platform.OS === "android") {
        try {
          setLocationDebugText("正在请求高精度定位...");
          await Location.enableNetworkProviderAsync();
          console.log(
            "[MapPickerModal] enableNetworkProviderAsync resolved successfully",
          );
        } catch (error) {
          console.log(
            "[MapPickerModal] enableNetworkProviderAsync failed or canceled",
            error,
          );
        }
      }

      setLocationDebugText("正在获取当前位置...");

      let currentLocation: Location.LocationObject | null = null;
      let usedLastKnownLocation = false;

      try {
        currentLocation = await getCurrentLocationWithTimeout(12000);
      } catch (error) {
        console.log(
          "[MapPickerModal] getCurrentPositionAsync failed, trying last known position",
          error,
        );

        const lastKnownLocation = await Location.getLastKnownPositionAsync({
          maxAge: 1000 * 60 * 10,
          requiredAccuracy: 3000,
        });

        console.log(
          "[MapPickerModal] last known location result",
          lastKnownLocation,
        );

        if (!lastKnownLocation) {
          console.log(
            "[MapPickerModal] no last known location, fallback to AMap geolocation",
          );
          setLocationDebugText("系统定位超时，正在尝试高德定位...");
          requestWebViewLocate();
          return;
        }

        currentLocation = lastKnownLocation;
        usedLastKnownLocation = true;
      }

      console.log("[MapPickerModal] current location success", {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        usedLastKnownLocation,
      });

      setLocationDebugText(
        usedLastKnownLocation
          ? `实时定位超时，已使用最近位置: ${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`
          : `定位成功: ${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`,
      );

      if (usedLastKnownLocation) {
        toast.info(
          "实时定位较慢，已使用最近位置",
          `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`,
        );
      }

      moveMapTo(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
      );
    } catch (error) {
      const message = formatUnknownError(error);
      console.log("[MapPickerModal] failed to locate user", error);
      setLocationDebugText(`定位异常: ${message}`);
      toast.error("定位失败，请稍后重试", message);
    } finally {
      console.log("[MapPickerModal] handleLocateUser end");
      setLocating(false);
    }
  }, [locating, moveMapTo, requestWebViewLocate]);

  const handleMapMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        console.log(
          "[MapPickerModal] webview onMessage raw",
          event.nativeEvent.data,
        );

        const data = JSON.parse(event.nativeEvent.data) as WebViewMapMessage;

        if (data.type === "mapReady") {
          console.log("[MapPickerModal] map ready");
          isMapReadyRef.current = true;

          if (pendingMoveRef.current) {
            const pendingMove = pendingMoveRef.current;
            pendingMoveRef.current = null;
            suppressNextMapMovedRef.current = true;
            moveMapTo(pendingMove.latitude, pendingMove.longitude);
          }

          return;
        }

        if (data.type === "debug") {
          console.log(
            "[MapPickerModal] webview debug",
            data.message,
            data.extra,
          );
          return;
        }

        if (data.type === "locateResult") {
          console.log("[MapPickerModal] webview locate result", data);

          if (!data.success || !data.latitude || !data.longitude) {
            const message = data.message || "高德定位失败";
            setLocationDebugText(`高德定位失败: ${message}`);
            toast.error("定位失败，请稍后重试", message);
            return;
          }

          setLocationDebugText(
            `高德定位成功: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`,
          );
          suppressNextMapMovedRef.current = true;
          moveMapTo(data.latitude, data.longitude);
          return;
        }

        if (data.type === "mapMoved") {
          console.log("[MapPickerModal] map moved", {
            latitude: data.latitude,
            longitude: data.longitude,
            suppressed: suppressNextMapMovedRef.current,
          });

          if (suppressNextMapMovedRef.current) {
            suppressNextMapMovedRef.current = false;
            console.log("[MapPickerModal] map moved ignored once");
            return;
          }

          setMapCenter({
            latitude: data.latitude,
            longitude: data.longitude,
          });

          void fetchPlacesRef.current(undefined, "around");
        }
      } catch (error) {
        console.log("[MapPickerModal] failed to parse map message", error);
      }
    },
    [moveMapTo],
  );

  const moveMapToPlace = useCallback(
    (place: PlaceItem) => {
      setSelectedPlaceId(place.id);
      suppressNextMapMovedRef.current = true;
      moveMapTo(place.latitude, place.longitude);
    },
    [moveMapTo],
  );

  const handleConfirm = useCallback(() => {
    if (!selectedPlace) {
      return;
    }

    onSelectLocation({
      name: selectedPlace.name,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
    });
    onClose();
  }, [onClose, onSelectLocation, selectedPlace]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.topMask}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>选择地点</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={22} color={colors.semantic.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Search size={18} color={colors.semantic.textMuted} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="搜索美食、景点、购物等"
              placeholderTextColor={colors.semantic.textMuted}
              style={styles.searchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchText.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                style={styles.clearButton}
              >
                <X size={24} color={colors.semantic.textMuted} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.searchButton}
            >
              <Text style={styles.searchButtonText}>搜索</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapFrame}>
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={mapSource}
              onMessage={handleMapMessage}
              onLoadStart={() => {
                console.log("[MapPickerModal] WebView load start");
                setLocationDebugText("地图开始加载");
              }}
              onLoadEnd={() => {
                console.log("[MapPickerModal] WebView load end");
                setLocationDebugText((current) => current || "地图加载完成");
              }}
              onError={(event) => {
                console.log(
                  "[MapPickerModal] WebView error",
                  event.nativeEvent,
                );
                setLocationDebugText(
                  `地图加载失败: ${event.nativeEvent.description || "unknown"}`,
                );
              }}
              style={styles.webview}
            />

            <TouchableOpacity
              style={[
                styles.locateButton,
                locating && styles.locateButtonDisabled,
              ]}
              onPress={() => void handleLocateUser()}
              activeOpacity={0.9}
              disabled={locating}
            >
              <Locate
                size={20}
                color={
                  locating ? colors.semantic.textMuted : colors.theme.primary
                }
              />
            </TouchableOpacity>
          </View>

          {locationDebugText ? (
            <View style={styles.debugCard}>
              <Text style={styles.debugLabel}>定位调试</Text>
              <Text style={styles.debugText}>{locationDebugText}</Text>
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryList}
          >
            {CATEGORY_OPTIONS.map((option) => {
              const active = option.key === activeCategory;

              return (
                <TouchableOpacity
                  key={option.key}
                  style={styles.categoryButton}
                  onPress={() => setActiveCategory(option.key)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.categoryTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {active ? <View style={styles.categoryIndicator} /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>搜索中...</Text>
              </View>
            ) : filteredPlaces.length ? (
              filteredPlaces.map((place) => {
                const active = selectedPlace
                  ? place.id === selectedPlace.id
                  : false;

                return (
                  <TouchableOpacity
                    key={place.id}
                    style={[styles.placeCard, active && styles.placeCardActive]}
                    onPress={() => moveMapToPlace(place)}
                  >
                    {place.cover ? (
                      <Image
                        source={{ uri: place.cover }}
                        style={styles.placeCover}
                      />
                    ) : (
                      <View style={styles.placeCoverFallback}>
                        <IconsWishListNoImgSvg width={62} height={62} />
                      </View>
                    )}

                    <View style={styles.placeBody}>
                      <Text style={styles.placeName} numberOfLines={1}>
                        {place.name}
                      </Text>
                      <Text style={styles.placeAddress} numberOfLines={2}>
                        {place.address}
                      </Text>
                    </View>

                    <View style={styles.placeMeta}>
                      <Text style={styles.placeDistance}>{place.distance}</Text>
                      <View
                        style={[styles.radio, active && styles.radioActive]}
                      >
                        {active ? <View style={styles.radioDot} /> : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>没有找到相关地点</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedPlace && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!selectedPlace}
          >
            <Text style={styles.confirmButtonText}>确定选择</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

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
    height: "82%",
    backgroundColor: "#fffaf7",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  grabber: {
    alignSelf: "center",
    width: 56,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#ddd3d5",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  closeButton: {
    width: 40,
    alignItems: "flex-end",
  },
  searchBar: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#efe5e6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.semantic.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: colors.theme.primary,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  mapFrame: {
    height: 250,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  locateButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 139, 0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },
  locateButtonDisabled: {
    opacity: 0.72,
  },
  debugCard: {
    backgroundColor: "#fff4f6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 139, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.theme.primary,
    marginBottom: 4,
  },
  debugText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.semantic.textPrimary,
  },
  categoryTabs: {
    flexGrow: 0,
    marginBottom: 6,
  },
  categoryList: {
    gap: 24,
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  categoryButton: {
    alignItems: "center",
    gap: 10,
  },
  categoryText: {
    fontSize: 16,
    color: colors.semantic.textSecondary,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: colors.theme.primary,
    fontWeight: "700",
  },
  categoryIndicator: {
    width: 24,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.theme.primary,
  },
  list: {
    flex: 1,
    marginTop: 0,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 139, 0.04)",
  },
  placeCardActive: {
    borderColor: colors.theme.primaryBorder,
    backgroundColor: "rgba(255, 107, 139, 0.06)",
  },
  placeCover: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: "#f3edef",
  },
  placeCoverFallback: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: "#f3edef",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  placeBody: {
    flex: 1,
    gap: 6,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.semantic.textPrimary,
  },
  placeAddress: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.semantic.textSecondary,
  },
  placeMeta: {
    alignItems: "flex-end",
    gap: 10,
  },
  placeDistance: {
    fontSize: 14,
    color: colors.semantic.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#d6c5cb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioActive: {
    borderColor: colors.theme.primary,
    backgroundColor: colors.theme.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.semantic.textSecondary,
  },
  confirmButton: {
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.theme.primary,
    marginTop: 12,
    shadowColor: "#ff5c89",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.45,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
