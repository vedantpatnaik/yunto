import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@yunto/shared";
import { useLogin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSwitchToOtp }: { onSwitchToOtp: () => void }) {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginValues) => {
    login.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="agencyCode">Agency Code</Label>
        <Input
          id="agencyCode"
          placeholder="e.g. DEMO01"
          {...register("agencyCode")}
        />
        {errors.agencyCode && (
          <p className="text-sm text-destructive">{errors.agencyCode.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@agency.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {login.error && (
        <p className="text-sm text-destructive">
          {(login.error as any)?.response?.data?.message || "Login failed"}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? "Signing in..." : "Sign In"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onSwitchToOtp}
      >
        Sign in with Phone OTP
      </Button>
    </form>
  );
}
