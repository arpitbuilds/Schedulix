// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import App from "./App.jsx";
// import "./index.css";
// import { AuthProvider } from "./shared/auth/AuthContext.jsx";
// import { ToastProvider } from "./shared/ui/toast/ToastContext.jsx";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnWindowFocus: false
//     }
//   }
// });

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <QueryClientProvider client={queryClient}>
//       <ToastProvider>
//         <AuthProvider>
//           <BrowserRouter>
//             <App />
//           </BrowserRouter>
//         </AuthProvider>
//       </ToastProvider>
//       <ReactQueryDevtools initialIsOpen={false} />
//     </QueryClientProvider>
//   </React.StrictMode>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./shared/auth/AuthContext.jsx";
import { ToastProvider } from "./shared/ui/toast/ToastContext.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>


      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);