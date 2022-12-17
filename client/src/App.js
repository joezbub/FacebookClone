import { Route, Routes } from "react-router-dom"
import HomePageChakra from "./pages/HomePageChakra";
import PrivateRoutes from "./PrivateRoutes";
import Settings from "./pages/Settings";
import Wall from "./pages/Wall";
import LoginFormChakra from "./pages/LoginFormChakra"
import FriendVisualizer from "./pages/FriendVisualizer"
import RegisterFormChakra from "./pages/RegisterFormChakra"
import CategorySelection from "./pages/CategorySelection"
import WallChakra from "./pages/WallChakra";
import RegisterPageChakra from "./pages/RegisterPageChakra";
import ChatPage from "./pages/ChatPage";
import NewsFeed from "./pages/NewsFeed";
import NewsSearch from "./pages/NewsSearch";

function App() {

  return (
    <Routes>
      <Route path="/" element={
        <LoginFormChakra />
      }></Route>
      <Route path="/register" element={
        <RegisterPageChakra />
      }></Route>
      <Route path="/categories" element={
        <CategorySelection />
      }></Route>
      <Route element={<PrivateRoutes />}>
        <Route path="/homepage" element={
          <HomePageChakra />
        }></Route>
        <Route path="/settings" element={<Settings />}></Route>
        <Route path="/:user/wall" element={
          <WallChakra />}>
        </Route>
        <Route path="/chats" element={
          <ChatPage />
        }></Route>
        <Route path="/news" element={
          <NewsFeed />
        }></Route>
        <Route path="/newssearch/:input" element={
          <NewsSearch />
        }></Route>
        <Route path="/friendvisualizer" element={<FriendVisualizer />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
