
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) {
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }

      try {
        const userSnapshot = await getDoc(
          doc(db, "users", user.uid)
        );

        const authorized =
          userSnapshot.exists() &&
          userSnapshot.data().role === "admin";

        if (active) {
          setIsAdmin(authorized);
          setChecking(false);
        }
      } catch (error) {
        console.error("Admin verification error:", error);

        if (active) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (checking) {
    return <div style={{ padding: "40px", textAlign: "center" }}>
      Verifying administrator access...
    </div>;
  }

  return isAdmin
    ? children
    : <Navigate to="/admin/login" replace />;
}

export default AdminRoute;
