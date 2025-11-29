import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage.tsx";
import KitchenPage from "./pages/KitchenPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/" element={<Navigate to="/kitchen" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

