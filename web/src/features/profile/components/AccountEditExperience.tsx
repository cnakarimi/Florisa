"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { AccountPageShell } from "./AccountPageShell";
import { AccountRouteGuard } from "./AccountRouteGuard";
import { mapProfileUpdatePayload, type ProfileFieldErrors, validateProfileForm } from "../logic";

export function AccountEditExperience() {
  return <AccountRouteGuard nextPath="/profile/edit"><AccountEditContent /></AccountRouteGuard>;
}

function AccountEditContent() {
  const auth = useAuth();
  const user = auth.user!;
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email ?? "");
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const values = { fullName, email };
    const localErrors = validateProfileForm(values);
    setFieldErrors(localErrors);
    setError("");
    setSuccess("");
    if (Object.keys(localErrors).length) return;

    setPending(true);
    try {
      const updated = await auth.updateProfile(mapProfileUpdatePayload(values));
      setFullName(updated.full_name);
      setEmail(updated.email ?? "");
      setSuccess("اطلاعات حساب شما با موفقیت ذخیره شد.");
    } catch (reason) {
      if (reason instanceof ApiError) {
        const nextErrors = {
          full_name: reason.fieldErrors.full_name?.[0],
          email: reason.fieldErrors.email?.[0],
        };
        setFieldErrors(nextErrors);
        if (reason.status === 401 || reason.status === 403) {
          auth.refreshCurrentUser().catch(() => undefined);
        }
        if (!nextErrors.full_name && !nextErrors.email) setError(getApiErrorMessage(reason));
      } else {
        setError(getApiErrorMessage(reason));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <AccountPageShell title="ویرایش اطلاعات حساب" description="نام و ایمیل خود را به‌روز نگه دارید.">
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#15171e] p-4 shadow-xl shadow-black/10 sm:p-6">
        <form onSubmit={submit} noValidate className="space-y-5">
          <Field label="نام و نام خانوادگی" htmlFor="account-full-name" error={fieldErrors.full_name} icon={<UserRound className="size-5" aria-hidden="true" />}>
            <input id="account-full-name" type="text" autoComplete="name" maxLength={150} value={fullName} disabled={pending} onChange={(event) => { setFullName(event.target.value); setFieldErrors((current) => ({ ...current, full_name: undefined })); setSuccess(""); }} aria-invalid={Boolean(fieldErrors.full_name)} aria-describedby={fieldErrors.full_name ? "account-full-name-error" : undefined} className="account-input pr-12" />
          </Field>
          <Field label="ایمیل (اختیاری)" htmlFor="account-email" error={fieldErrors.email} icon={<Mail className="size-5" aria-hidden="true" />}>
            <input id="account-email" type="email" inputMode="email" autoComplete="email" dir="ltr" maxLength={254} value={email} disabled={pending} onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); setSuccess(""); }} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "account-email-error" : undefined} placeholder="name@example.com" className="account-input px-12 text-left" />
          </Field>
          <Field label="شماره موبایل" htmlFor="account-phone" description="شماره موبایل از این بخش قابل تغییر نیست." icon={<LockKeyhole className="size-5" aria-hidden="true" />}>
            <input id="account-phone" type="tel" inputMode="numeric" autoComplete="tel" dir="ltr" value={user.phone} readOnly aria-readonly="true" className="account-input numeric-ltr cursor-not-allowed pr-12 text-left text-zinc-500" />
          </Field>
          {error ? <p role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs leading-6 text-rose-300">{error}</p> : null}
          {success ? <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs leading-6 text-emerald-300"><CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />{success}</p> : null}
          <PrimaryButton type="submit" isLoading={pending} className="h-14 rounded-2xl bg-amber-400 font-black text-black hover:bg-amber-300">{pending ? "در حال ذخیره..." : "ذخیره تغییرات"}</PrimaryButton>
        </form>
      </section>
    </AccountPageShell>
  );
}

function Field({ label, htmlFor, error, description, icon, children }: { label: string; htmlFor: string; error?: string; description?: string; icon: ReactNode; children: ReactNode }) {
  return <div className="space-y-2"><label htmlFor={htmlFor} className="block text-xs font-bold text-zinc-300">{label}</label><div className="relative"><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</span>{children}</div>{description ? <p className="text-[11px] leading-5 text-zinc-500">{description}</p> : null}{error ? <p id={`${htmlFor}-error`} role="alert" className="text-[11px] text-rose-300">{error}</p> : null}</div>;
}
