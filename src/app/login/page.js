"use client";
import { useState,useEffect } from "react";
import { supabase } from "../clients/supabase";
import { useRouter } from "next/navigation";
export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
    const router = useRouter();
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    try {
      if (isSignUp) {
        // Sign up user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setInfoMsg("Sign-up successful! Please check your email to confirm.");
      } else {
        // Login user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setInfoMsg("Login successful!");
        router.push("/");
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
      // Supabase will redirect the user back to your site after successful Google OAuth
    } catch (error) {
      setErrorMsg(error.message);
    }
  };
  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        // Redirect to login if not logged in
        router.replace("/");
      }

    });
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-black">
      {/* Auth Card */}
      <div className="w-full max-w-md p-8 bg-white border border-gray-300 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isSignUp ? "Sign Up" : "Login"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

       

        {/* Error & Info Messages */}
        {errorMsg && <p className="mt-2 text-red-500">{errorMsg}</p>}
        {infoMsg && <p className="mt-2 text-green-500">{infoMsg}</p>}

        {/* Toggle between login and signup */}
        <p className="mt-4 text-center">
          {isSignUp
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 underline"
          >
            {isSignUp ? "Login" : "Sign Up"} here
          </button>
        </p>
      </div>
    </div>
  );
}
