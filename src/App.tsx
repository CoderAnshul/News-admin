import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../store/slices/store";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AllShorts from "./pages/Shorts/AllShorts";
import AddShorts from "./pages/Shorts/AddShorts";
import EditShort from "./pages/Shorts/EditShort";
import Categories from "./pages/Categories";
import Locations from "./pages/Locations";
import AddAds from "./pages/Ads/AddAds";
import AllNews from "./pages/News/AllNews";
import Epaper from "./pages/Epaper";
import PushNotifications from "./pages/PushNotifications";
import FAQ from "./pages/FAQ"; // Import the FAQ component
import UserPage from "./pages/User";
import SubscriptionPlan from "./pages/SubscriptionPlan";
import ViewAd from "./pages/Ads/ViewAd";
 // <-- Correct path for main articles page
import AddArticles from "./pages/Article/AddArticles"; // <-- Correct path for add article page
import Articles from "./pages/Article/Articles";
import EditArticles from "./pages/Article/EditArticles";
import AddEpaper from "./pages/epaper/AddEpaper";
import Advertisement from "./pages/Ads/Advertisement";
import EditAdvertisement from "./pages/Ads/EditAdvertisement";
import Subject from "./pages/Subject/Subject";

// RequireAuth component
function RequireAuth() {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Protected Dashboard Layout */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />

              {/* Shorts */}
              <Route path="/shorts/all-shorts" element={<AllShorts />} />
              <Route path="/shorts/add-shorts" element={<AddShorts />} />
              <Route path="/shorts/edit/:id" element={<EditShort />} />

              {/* Manage Categories and Locations */}
              <Route path="/categories" element={<Categories />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/add" element={<AddArticles />} />
              <Route path="/articles/edit/:id" element={<EditArticles />} />
              <Route path="/advertisement" element={<Advertisement />} />
              <Route path="/advertisement/:id" element={<EditAdvertisement />} />
              <Route path="/subject" element={<Subject />} />


              {/* Advertisements */}
              <Route path="/ads/add" element={<AddAds />} />
              <Route path="/ads/manage" element={<AddAds />} />
              <Route path="/ads/view/:id" element={<ViewAd />} />
              <Route path="/ads/edit/:id" element={<AddAds />} />

              {/* News Management */}
              <Route path="/news/all" element={<AllNews />} />

              {/* Epaper */}
              <Route path="/epaper" element={<Epaper />} />

              {/* Push Notifications */}
              <Route path="/notifications" element={<PushNotifications />} />

              {/* FAQ Page */}
              <Route path="/faq" element={<FAQ />} />

              {/* User Page */}
              <Route path="/users" element={<UserPage />} />

              {/* Subscription Plans */}
              <Route path="/subscription-plans" element={<SubscriptionPlan />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  );
}
