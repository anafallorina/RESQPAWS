
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

function RescuerRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isRescuer, setIsRescuer] = useState(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      setChecking(true);
      setIsRescuer(false);

      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        const userRole = userSnapshot.exists()
          ? userSnapshot.data().role?.toLowerCase().trim()
          : "";

        console.log("Rescuer route - User UID:", user.uid);
        console.log("Rescuer route - User role:", userRole);

        if (active) {
          setIsRescuer(userRole === "rescuer");
          setChecking(false);
        }
      } catch (error) {
        console.error("Rescuer verification error:", error);

        if (active) {
          setIsRescuer(false);
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
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        Verifying rescuer access...
      </div>
    );
  }

  if (!isRescuer) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RescuerRoute;
