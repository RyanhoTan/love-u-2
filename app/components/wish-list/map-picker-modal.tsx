import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  typecode?: string;
  photos?: {
    title?: string;
    url?: string;
  }[];
};

type AmapPlaceSearchResponse = {
  pois?: AmapPoi[];
};

type AmapRegeoResponse = {
  regeocode?: {
    pois?: AmapPoi[];
  };
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

const CATEGORY_TYPE_CODES: Record<Exclude<PlaceCategory, "all">, string[]> = {
  food: ["050000"],
  scenic: ["110000"],
  shopping: ["060000"],
  other: ["070000", "080000", "100000", "120000", "150000"],
};

const CATEGORY_KEYS = Object.keys(CATEGORY_TYPE_CODES) as Exclude<
  PlaceCategory,
  "all"
>[];

function createAmapTypesParam(category: PlaceCategory) {
  if (category === "all") {
    return "";
  }

  return CATEGORY_TYPE_CODES[category].join("|");
}

function isTypeCodeInCategory(
  typeCode: string,
  category: Exclude<PlaceCategory, "all">,
) {
  return CATEGORY_TYPE_CODES[category].some((categoryTypeCode) =>
    typeCode.startsWith(categoryTypeCode.slice(0, 2)),
  );
}

function guessCategory(poi: AmapPoi): PlaceCategory {
  const typeCode = poi.typecode || "";

  for (const category of CATEGORY_KEYS) {
    if (isTypeCodeInCategory(typeCode, category)) {
      return category;
    }
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

  const category = guessCategory(poi);
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

function getAmapPoiMergeKeys(poi: AmapPoi) {
  const keys: string[] = [];

  if (poi.id) {
    keys.push(`id:${poi.id}`);
  }

  if (poi.name && poi.location) {
    keys.push(`name-location:${poi.name}-${poi.location}`);
  }

  return keys;
}

function hasPoiPhoto(poi: AmapPoi) {
  return Boolean(poi.photos?.some((photo) => Boolean(photo.url)));
}

function mergeAmapPoi(existing: AmapPoi, incoming: AmapPoi): AmapPoi {
  return {
    id: incoming.id || existing.id,
    name: incoming.name || existing.name,
    address: incoming.address || existing.address,
    location: incoming.location || existing.location,
    distance: incoming.distance || existing.distance,
    type: incoming.type || existing.type,
    typecode: incoming.typecode || existing.typecode,
    photos: hasPoiPhoto(existing)
      ? existing.photos
      : hasPoiPhoto(incoming)
        ? incoming.photos
        : existing.photos || incoming.photos,
  };
}

function mergeAmapPoiGroups(groups: AmapPoi[][]) {
  const poiIndexByKey = new Map<string, number>();
  const mergedPois: AmapPoi[] = [];

  for (const group of groups) {
    for (const poi of group) {
      const keys = getAmapPoiMergeKeys(poi);
      const existingIndex = keys
        .map((key) => poiIndexByKey.get(key))
        .find((index): index is number => index !== undefined);

      if (existingIndex !== undefined) {
        mergedPois[existingIndex] = mergeAmapPoi(
          mergedPois[existingIndex],
          poi,
        );
        continue;
      }

      mergedPois.push(poi);
      const nextIndex = mergedPois.length - 1;
      keys.forEach((key) => {
        poiIndexByKey.set(key, nextIndex);
      });
    }
  }

  return mergedPois;
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
    '  postMessageToNative({ type: "mapReady" });',
    "  setTimeout(function() {",
    '    postCenter("mapMoved");',
    "  }, 200);",
    "});",
    "window.__LOVEU_MAP__.on('moveend', function() {",
    '  postCenter("mapMoved");',
    "});",
    "window.addEventListener('message', function(event) {",
    "  try {",
    "    var payload = JSON.parse(event.data);",
    "    if (payload && payload.type === 'locateUser') {",
    "      locateWithAmap();",
    "    }",
    "  } catch (error) {",
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
  const fetchPlacesRequestIdRef = useRef(0);

  const mapHtml = useMemo(() => createMapHtml(DEFAULT_CENTER), []);
  const mapSource = useMemo(
    () => ({ html: mapHtml, baseUrl: "https://webapi.amap.com/" }),
    [mapHtml],
  );

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
            return;
          }

          window.__LOVEU_MAP__.setCenter([${longitude}, ${latitude}]);
        } catch (error) {
          console.log(error);
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

    if (!isMapReadyRef.current || !webViewRef.current) {
      toast.info("地图尚未就绪，暂时无法使用高德定位");
      return false;
    }

    webViewRef.current?.injectJavaScript(`
      (function() {
        window.dispatchEvent(new MessageEvent('message', {
          data: JSON.stringify({ type: 'locateUser' })
        }));
      })();
      true;
    `);

    return true;
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
    async (
      keyword?: string,
      mode?: "around" | "text",
      centerOverride?: typeof DEFAULT_CENTER,
    ) => {
      const amapKey = process.env.EXPO_PUBLIC_AMAP_SERVICE_KEY || "";

      if (!amapKey) {
        return;
      }

      const requestId = ++fetchPlacesRequestIdRef.current;
      setLoading(true);

      try {
        const trimmedKeyword = keyword?.trim() || "";
        const typesParam = createAmapTypesParam(activeCategory);
        const searchCenter = centerOverride || mapCenter;

        const isGlobalSearch = mode === "text" && Boolean(trimmedKeyword);

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
          url.searchParams.set("keywords", trimmedKeyword);
          url.searchParams.set(
            "location",
            `${searchCenter.longitude},${searchCenter.latitude}`,
          );

          if (typesParam) {
            url.searchParams.set("types", typesParam);
          }
        } else {
          url.searchParams.set(
            "location",
            `${searchCenter.longitude},${searchCenter.latitude}`,
          );
          url.searchParams.set("radius", String(DEFAULT_RADIUS));
          url.searchParams.set("sortrule", "distance");

          if (typesParam) {
            url.searchParams.set("types", typesParam);
          }
        }

        const placeResponse = await fetch(url.toString());
        const placeData =
          (await placeResponse.json()) as AmapPlaceSearchResponse;
        let pois = placeData.pois || [];

        if (!isGlobalSearch) {
          const regeoUrl = new URL("https://restapi.amap.com/v3/geocode/regeo");
          regeoUrl.searchParams.set("key", amapKey);
          regeoUrl.searchParams.set(
            "location",
            `${searchCenter.longitude},${searchCenter.latitude}`,
          );
          regeoUrl.searchParams.set("radius", String(DEFAULT_RADIUS));
          regeoUrl.searchParams.set("extensions", "all");

          if (typesParam) {
            regeoUrl.searchParams.set("poitype", typesParam);
          }

          const regeoResponse = await fetch(regeoUrl.toString());
          const regeoData = (await regeoResponse.json()) as AmapRegeoResponse;
          pois = mergeAmapPoiGroups([regeoData.regeocode?.pois || [], pois]);
        }

        if (requestId !== fetchPlacesRequestIdRef.current) {
          return;
        }

        const nextPlaces = pois
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
        if (requestId !== fetchPlacesRequestIdRef.current) {
          return;
        }

        console.log("failed to fetch places", error);
        setPlaces([]);
        setSelectedPlaceId(null);
      } finally {
        if (requestId === fetchPlacesRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [activeCategory, moveMapTo, mapCenter],
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
    } else {
      suppressNextMapMovedRef.current = true;
      moveMapTo(DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude);
      void fetchPlacesRef.current(undefined, "around", DEFAULT_CENTER);
    }
  }, [visible, moveMapTo]);

  const handleSearch = useCallback(() => {
    const trimmed = searchText.trim();
    const mode: "around" | "text" = trimmed ? "text" : "around";
    void fetchPlaces(trimmed || undefined, mode);
  }, [fetchPlaces, searchText]);

  const handleLocateUser = useCallback(() => {
    if (locating) {
      console.log("[MapPickerModal] handleLocateUser skipped because locating");
      return;
    }

    console.log("[MapPickerModal] handleLocateUser start");
    setLocating(true);
    const locatingRequested = requestWebViewLocate();

    if (!locatingRequested) {
      setLocating(false);
    }
  }, [locating, requestWebViewLocate]);

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

        if (data.type === "locateResult") {
          console.log("[MapPickerModal] webview locate result", data);
          setLocating(false);

          if (!data.success || !data.latitude || !data.longitude) {
            const message = data.message || "高德定位失败";
            toast.error("定位失败，请稍后重试", message);
            return;
          }

          const nextCenter = {
            latitude: data.latitude,
            longitude: data.longitude,
          };
          setMapCenter(nextCenter);
          suppressNextMapMovedRef.current = true;
          moveMapTo(nextCenter.latitude, nextCenter.longitude);
          void fetchPlacesRef.current(undefined, "around", nextCenter);
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

          const nextCenter = {
            latitude: data.latitude,
            longitude: data.longitude,
          };
          setMapCenter(nextCenter);

          void fetchPlacesRef.current(undefined, "around", nextCenter);
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
              geolocationEnabled
              onMessage={handleMapMessage}
              onError={(event) => {
                console.log(
                  "[MapPickerModal] WebView error",
                  event.nativeEvent,
                );
                toast.error(
                  "地图加载失败",
                  event.nativeEvent.description || "unknown",
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
    height: "85%",
    backgroundColor: "#fffaf7",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
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
