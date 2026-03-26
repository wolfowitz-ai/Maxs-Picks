import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth as usePasswordAuth } from "@/lib/auth";
import { useAuth as useReplitAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PawPrint, Loader2, Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = usePasswordAuth();
  const { isAuthenticated: replitAuthenticated, isLoading: replitLoading } = useReplitAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (replitAuthenticated) {
      setLocation("/admin");
    }
  }, [replitAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(password);
      setLocation("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  if (replitLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="admin-login-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <PawPrint className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-fredoka">Admin Login</CardTitle>
          <CardDescription>Enter the admin password to manage products</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                data-testid="input-admin-password"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" data-testid="text-login-error">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password}
              data-testid="button-admin-login"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Sign In with Password
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleReplitLogin}
            data-testid="button-replit-login"
          >
            Sign In with Replit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
