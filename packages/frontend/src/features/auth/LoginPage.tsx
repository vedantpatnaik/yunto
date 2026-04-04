import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./components/LoginForm";
import { OtpForm } from "./components/OtpForm";

export default function LoginPage() {
  const [method, setMethod] = useState<"email" | "otp">("email");

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Yunto</CardTitle>
          <CardDescription>
            {method === "email"
              ? "Sign in with your email and password"
              : "Sign in with your phone number"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {method === "email" ? (
            <LoginForm onSwitchToOtp={() => setMethod("otp")} />
          ) : (
            <OtpForm onSwitchToEmail={() => setMethod("email")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
