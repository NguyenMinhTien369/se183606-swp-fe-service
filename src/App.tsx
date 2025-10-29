import { AuthProvider } from "@/pages/Login/feature/AuthContext";
import Routers from "./routes";

function App() {
  return (
    <AuthProvider>
      <Routers />
    </AuthProvider>
  );
}

export default App;
