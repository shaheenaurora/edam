import { Routes, Route } from "react-router";
import { CartProvider } from "@/context/CartContext";
import { Layout } from "@/components/Layout";
import Home from "./pages/Home";
import ShopPage from "./pages/ShopPage";
import RangePage from "./pages/RangePage";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import GiftingPage from "./pages/GiftingPage";
import BuildHamperPage from "./pages/BuildHamperPage";
import TreeLedgerPage from "./pages/TreeLedgerPage";
import MakersPage from "./pages/MakersPage";
import MakerDetailPage from "./pages/MakerDetailPage";
import StoryPage from "./pages/StoryPage";
import StayPage from "./pages/StayPage";
import JournalPage from "./pages/JournalPage";
import JournalPostPage from "./pages/JournalPostPage";
import AccountPage from "./pages/AccountPage";
import PoliciesPage from "./pages/PoliciesPage";
import CorporatePage from "./pages/CorporatePage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminTreesPage from "./pages/admin/AdminTreesPage";
import AdminStockPage from "./pages/admin/AdminStockPage";
import AdminSubscribersPage from "./pages/admin/AdminSubscribersPage";
import AdminDiscountsPage from "./pages/admin/AdminDiscountsPage";
import AdminIntegrationsPage from "./pages/admin/AdminIntegrationsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<RangePage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderNo" element={<OrderConfirmationPage />} />
          <Route path="/gifting" element={<GiftingPage />} />
          <Route path="/gifting/build" element={<BuildHamperPage />} />
          <Route path="/the-tree" element={<TreeLedgerPage />} />
          <Route path="/makers" element={<MakersPage />} />
          <Route path="/makers/:slug" element={<MakerDetailPage />} />
          <Route path="/our-story" element={<StoryPage />} />
          <Route path="/the-stay" element={<StayPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalPostPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/corporate-gifting" element={<CorporatePage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:orderNo" element={<AdminOrderDetailPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="trees" element={<AdminTreesPage />} />
            <Route path="stock" element={<AdminStockPage />} />
            <Route path="subscribers" element={<AdminSubscribersPage />} />
            <Route path="discounts" element={<AdminDiscountsPage />} />
            <Route path="integrations" element={<AdminIntegrationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </CartProvider>
  );
}
