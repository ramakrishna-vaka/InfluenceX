/* global google */
import { useEffect } from "react";
import { useAuth } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleButton() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


  const { login, setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleResponse = async (response: any) => {
    try {
      const result = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: response.credential }),
      });

      if (result.ok) {
        const userResponse = await fetch(`${API_BASE_URL}/whoAmI`, {
          method: "GET",
          credentials: "include",
        });

        const data = await userResponse.json();

        setAuthUser({ id: data.id, name: data.name, email: data.email, imageData: data.imageData, rating: data.rating, walletMoney: data.walletMoney });
        login();
        navigate("/");
      } else {
        alert("Google Sign-In failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
  if (!clientId) {
    console.error("Google Client ID is missing!");
    return;
  }

  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "filled_blue", size: "large", width: "100%" }
    );
  }
  }, [clientId]);


  return <div id="google-btn" style={{ marginTop: "20px" }}></div>;
}
