import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSendSchema, otpVerifySchema } from "@yunto/shared";
import { useOtpSend, useOtpVerify } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

type SendValues = z.infer<typeof otpSendSchema>;
type VerifyValues = z.infer<typeof otpVerifySchema>;

export function OtpForm({ onSwitchToEmail }: { onSwitchToEmail: () => void }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const otpSend = useOtpSend();
  const otpVerify = useOtpVerify();

  const sendForm = useForm<SendValues>({
    resolver: zodResolver(otpSendSchema),
  });
  const verifyForm = useForm<VerifyValues>({
    resolver: zodResolver(otpVerifySchema),
  });

  const onSendSubmit = (data: SendValues) => {
    otpSend.mutate(data, {
      onSuccess: () => {
        setPhone(data.phone);
        setStep("code");
      },
    });
  };

  const onVerifySubmit = (data: VerifyValues) => {
    otpVerify.mutate({ phone, code: data.code });
  };

  if (step === "phone") {
    return (
      <form onSubmit={sendForm.handleSubmit(onSendSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="+91 9876543210"
            {...sendForm.register("phone")}
          />
          {sendForm.formState.errors.phone && (
            <p className="text-sm text-destructive">
              {sendForm.formState.errors.phone.message}
            </p>
          )}
        </div>

        {otpSend.error && (
          <p className="text-sm text-destructive">
            {(otpSend.error as any)?.response?.data?.message || "Failed to send OTP"}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={otpSend.isPending}>
          {otpSend.isPending ? "Sending..." : "Send OTP"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onSwitchToEmail}
        >
          Sign in with Email
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">OTP sent to {phone}</p>
      <div className="space-y-2">
        <Label htmlFor="code">Enter OTP</Label>
        <Input
          id="code"
          placeholder="123456"
          maxLength={6}
          {...verifyForm.register("code")}
        />
        {verifyForm.formState.errors.code && (
          <p className="text-sm text-destructive">
            {verifyForm.formState.errors.code.message}
          </p>
        )}
      </div>

      {otpVerify.error && (
        <p className="text-sm text-destructive">
          {(otpVerify.error as any)?.response?.data?.message || "Invalid OTP"}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={otpVerify.isPending}>
        {otpVerify.isPending ? "Verifying..." : "Verify OTP"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setStep("phone")}
      >
        Change phone number
      </Button>
    </form>
  );
}
