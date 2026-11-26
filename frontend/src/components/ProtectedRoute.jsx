// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function ProtectedRoute({ allowedRoles }) {
//   const { user, isAuthenticated, isInitializing } = useAuth();
//   const location = useLocation();

//   // Wait until session restoration finishes
//   if (isInitializing) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <p className="font-medium text-gray-600">
//           Checking authentication...
//         </p>
//       </div>
//     );
//   }

//   // Redirect unauthenticated users
//   if (!isAuthenticated) {
//     return (
//       <Navigate
//         to="/login"
//         replace
//         state={{ from: location }}
//       />
//     );
//   }

//   // Check whether the user's role is permitted
//   if (
//     allowedRoles &&
//     !allowedRoles.includes(user?.role)
//   ) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   // Allow authorized users
//   return <Outlet />;
// }

// export default ProtectedRoute;



import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ requiredPermission }) {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // Wait until session restoration finishes
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-medium text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Check dynamic permission
  if (
    requiredPermission &&
    !user?.permissions?.includes(requiredPermission)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Access Denied
          </h2>
          <p className="mt-2 text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
