// import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
// import ToastViewport from "./ToastViewport.jsx";

// const ToastCtx = createContext(null);

// let idSeq = 1;

// export function ToastProvider({ children }) {
//   const [toasts, setToasts] = useState([]);

//   const remove = useCallback((id) => {
//     setToasts((t) => t.filter((x) => x.id !== id));
//   }, []);

//   const push = useCallback((toast) => {
//     const id = idSeq++;
//     const item = { id, variant: "info", title: "", message: "", ...toast };
//     setToasts((t) => [...t, item]);
//     const ttl = toast.ttlMs ?? 3500;
//     window.setTimeout(() => remove(id), ttl);
//   }, [remove]);

//   const value = useMemo(() => ({ push }), [push]);

//   return (
//     <ToastCtx.Provider value={value}>
//       {children}
//       <ToastViewport toasts={toasts} onClose={remove} />
//     </ToastCtx.Provider>
//   );
// }

// export function useToast() {
//   const ctx = useContext(ToastCtx);
//   if (!ctx) throw new Error("useToast must be used within ToastProvider");
//   return ctx;
// }

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import ToastViewport from "./ToastViewport.jsx";

const ToastCtx = createContext(null);

let idSeq = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const remove = useCallback((id) => {
    const timer = timersRef.current.get(id);

    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = idSeq++;

      const item = {
        id,
        variant: "info",
        title: "",
        message: "",
        ttlMs: 3500,
        ...toast,
      };

      setToasts((prev) => [...prev, item]);

      const ttl = item.ttlMs ?? 3500;

      if (ttl > 0) {
        const timer = window.setTimeout(() => {
          remove(id);
        }, ttl);

        timersRef.current.set(id, timer);
      }

      return id;
    },
    [remove]
  );

  const clearAll = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({
      push,
      remove,
      clearAll,
    }),
    [push, remove, clearAll]
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);

  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return ctx;
}