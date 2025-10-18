const React = require("react");
const { navigate } = require("gatsby");

const { NotificationProvider } = require("./src/context/AddItemNotificationProvider");
const { AuthProvider, useAuth } = require("./src/context/AuthContext");
const { ToastProvider } = require("./src/context/ToastContext");

exports.wrapRootElement = ({ element }) => (
  React.createElement(AuthProvider, null,
    React.createElement(NotificationProvider, null,
      React.createElement(ToastProvider, null, element)
    )
  )
);

exports.wrapPageElement = ({ element, props }) => {

  const protectedPrefixes = ["/account/", "/admin/", "/dashboard/"];
  const publicRoutes = ["/login", "/register", "/forgot-password"];


  const isProtectedRoute = (pathname) =>
    protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  const isPublicRoute = (pathname) =>
    publicRoutes.some((pub) => pathname.startsWith(pub));

  const ProtectedWrapper = ({ children }) => {
    const { user, loading } = useAuth();
    const path = props.location.pathname;

    React.useEffect(() => {
      if (!loading) {
        if (isProtectedRoute(path) && !user) {
          navigate(`/login?redirect=${encodeURIComponent(path)}`);
        }

        if (isPublicRoute(path) && user) {
          navigate("/account/settings");
        }
      }
    }, [user, loading, path]);

    if (loading) return null;

    if (user && isPublicRoute(path)) return null;

    if (!user && isProtectedRoute(path)) return null;

    return children;
  };

  return React.createElement(ProtectedWrapper, null, element);
};
