import { createContext, useContext } from "react";

export const ChatInputKeyboardOffsetContext = createContext(0);

export function useChatInputKeyboardOffset() {
  return useContext(ChatInputKeyboardOffsetContext);
}
