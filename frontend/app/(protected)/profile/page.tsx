"use client";

import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { PowerIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { /* ignore */ }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Clear the auth cookie the middleware uses
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }

  if (!user) {
    return <p className="p-6 text-center text-gray-500">Loading user info...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile & Settings</h1>

      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">User Information</h2>
        <p className="text-gray-700"><span className="font-medium">Name:</span> {user.name}</p>
        <p className="text-gray-700 mt-1"><span className="font-medium">Email:</span> {user.email}</p>
      </div>

      <div className="bg-white shadow rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h2>
        <div className="flex items-center justify-between py-3">
          <span className="text-gray-700">Enable Notifications</span>
          <Switch
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
            className={`${notificationsEnabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition`}
          >
            <span className={`${notificationsEnabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
          </Switch>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-gray-700">Dark Mode</span>
          <Switch
            checked={darkModeEnabled}
            onChange={setDarkModeEnabled}
            className={`${darkModeEnabled ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition`}
          >
            <span className={`${darkModeEnabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
          </Switch>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
      >
        <PowerIcon className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}