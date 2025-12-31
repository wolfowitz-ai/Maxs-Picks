import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  useEffect(() => {
    window.location.href = "/api/login";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
