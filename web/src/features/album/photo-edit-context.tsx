import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PhotoEditController = {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  toggleAll: () => void;
  requestDelete: () => void;
};

type PhotoEditContextValue = {
  controller: PhotoEditController | null;
  register: (controller: PhotoEditController | null) => void;
};

const PhotoEditContext = createContext<PhotoEditContextValue | null>(null);

export function PhotoEditProvider({ children }: { children: ReactNode }) {
  const [controller, setController] = useState<PhotoEditController | null>(
    null,
  );
  const register = useCallback((nextController: PhotoEditController | null) => {
    setController(nextController);
  }, []);
  const value = useMemo(
    () => ({ controller, register }),
    [controller, register],
  );

  return (
    <PhotoEditContext.Provider value={value}>
      {children}
    </PhotoEditContext.Provider>
  );
}

export function usePhotoEditContext() {
  const context = useContext(PhotoEditContext);

  if (!context) {
    throw new Error("PhotoEditProvider is missing");
  }

  return context;
}
