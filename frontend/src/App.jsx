import { BrowserRouter } from "react-router-dom";
import AppRouter from "./pages/AppRouter";
import Header from "./components/Header";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRouter />
    </BrowserRouter>
  );
}
