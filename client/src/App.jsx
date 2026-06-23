import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EventDiscovery from './pages/EventDiscovery';
import EventDetail from './pages/EventDetail';
import Organizers from './pages/Organizers';
import OrganizerProfile from './pages/OrganizerProfile';
import CategoryPage from './pages/CategoryPage';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import Dashboard from './pages/dashboard/Dashboard';
import MyTickets from './pages/dashboard/MyTickets';
import Wishlist from './pages/dashboard/Wishlist';
import Following from './pages/dashboard/Following';
import Notifications from './pages/dashboard/Notifications';
import Profile from './pages/dashboard/Profile';
import Orders from './pages/dashboard/Orders';

import OrgDashboard from './pages/organizer/Dashboard';
import OrgAnalytics from './pages/organizer/Analytics';
import OrgEvents from './pages/organizer/Events';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import OrgAttendees from './pages/organizer/Attendees';
import OrgCheckin from './pages/organizer/Checkin';
import OrgAnnouncements from './pages/organizer/Announcements';
import OrgCoupons from './pages/organizer/Coupons';
import OrgSurveys from './pages/organizer/Surveys';
import OrgCertificates from './pages/organizer/Certificates';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminEvents from './pages/admin/Events';
import AdminCategories from './pages/admin/Categories';
import AdminOrganizers from './pages/admin/Organizers';
import AdminRevenue from './pages/admin/Revenue';
import AdminReports from './pages/admin/Reports';

import OrderConfirmation from './pages/OrderConfirmation';
import TicketView from './pages/TicketView';
import CertificateView from './pages/CertificateView';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<EventDiscovery />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="organizers" element={<Organizers />} />
        <Route path="organizers/:id" element={<OrganizerProfile />} />
        <Route path="categories/:slug" element={<CategoryPage />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />

        <Route path="order-confirmation/:orderId" element={
          <ProtectedRoute><OrderConfirmation /></ProtectedRoute>
        } />
        <Route path="ticket/:id" element={
          <ProtectedRoute><TicketView /></ProtectedRoute>
        } />
        <Route path="certificate/:id" element={
          <ProtectedRoute><CertificateView /></ProtectedRoute>
        } />

        <Route path="dashboard" element={<ProtectedRoute><DashboardLayout type="user" /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<MyTickets />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="following" element={<Following />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        <Route path="organizer" element={
          <ProtectedRoute roles={['organizer', 'admin']}><DashboardLayout type="organizer" /></ProtectedRoute>
        }>
          <Route index element={<OrgDashboard />} />
          <Route path="analytics" element={<OrgAnalytics />} />
          <Route path="events" element={<OrgEvents />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="events/:id/edit" element={<EditEvent />} />
          <Route path="events/:id/attendees" element={<OrgAttendees />} />
          <Route path="events/:id/checkin" element={<OrgCheckin />} />
          <Route path="announcements" element={<OrgAnnouncements />} />
          <Route path="coupons" element={<OrgCoupons />} />
          <Route path="surveys" element={<OrgSurveys />} />
          <Route path="certificates" element={<OrgCertificates />} />
        </Route>

        <Route path="admin" element={
          <ProtectedRoute roles={['admin']}><DashboardLayout type="admin" /></ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="organizers" element={<AdminOrganizers />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
