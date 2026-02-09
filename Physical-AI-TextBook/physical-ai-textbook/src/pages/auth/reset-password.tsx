import React, { useState, FormEvent } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Translate, { translate } from "@docusaurus/Translate";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../components/AuthForms/styles.module.css";

export default function ResetPasswordPage(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword, error, clearError } = useAuth();
  const loginUrl = useBaseUrl("/auth/login");

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>
          <Translate id="auth.reset.title">Reset Password</Translate>
        </h1>
        <p className={styles.authSubtitle}>
          <Translate id="auth.reset.subtitle">
            Enter your email and we'll send you a link to reset your password.
          </Translate>
        </p>

        {error && <div className={styles.error}>{error}</div>}

        {success && (
          <div className={styles.success}>
            <Translate id="auth.reset.success">
              Password reset email sent! Check your inbox.
            </Translate>
          </div>
        )}

        <form className={styles.form} onSubmit={handleResetPassword}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              <Translate id="auth.reset.emailLabel">Email</Translate>
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={translate({
                id: "auth.reset.emailPlaceholder",
                message: "Enter your email",
              })}
              required
              disabled={isLoading || success}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || success}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              <Translate id="auth.reset.submitButton">
                Send Reset Link
              </Translate>
            )}
          </button>
        </form>

        <div className={styles.links}>
          <a href={loginUrl} className={styles.link}>
            <Translate id="auth.reset.backToLogin">Back to Sign In</Translate>
          </a>
        </div>
      </div>
    </div>
  );
}
