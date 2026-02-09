import React, { useState, FormEvent } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Translate, { translate } from "@docusaurus/Translate";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../components/AuthForms/styles.module.css";

export default function LoginPage(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, error, clearError } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const resetPasswordUrl = useBaseUrl("/auth/reset-password");
  const signupUrl = useBaseUrl("/auth/signup");
  const homeUrl = useBaseUrl("/");

  // Get return URL from query params
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get("returnUrl") || homeUrl;

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await signInWithEmail(email, password);
      history.push(returnUrl);
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
          <Translate id="auth.login.title">Sign In</Translate>
        </h1>
        <p className={styles.authSubtitle}>
          <Translate id="auth.login.subtitle">
            Welcome back! Please sign in to continue.
          </Translate>
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleEmailSignIn}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              <Translate id="auth.login.emailLabel">Email</Translate>
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={translate({
                id: "auth.login.emailPlaceholder",
                message: "Enter your email",
              })}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              <Translate id="auth.login.passwordLabel">Password</Translate>
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={translate({
                id: "auth.login.passwordPlaceholder",
                message: "Enter your password",
              })}
              required
              disabled={isLoading}
            />
            <a
              href={resetPasswordUrl}
              className={`${styles.link} ${styles.forgotPassword}`}
            >
              <Translate id="auth.login.forgotPassword">
                Forgot password?
              </Translate>
            </a>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              <Translate id="auth.login.submitButton">Sign In</Translate>
            )}
          </button>
        </form>

        <div className={styles.links}>
          <span>
            <Translate id="auth.login.noAccount">
              Don't have an account?
            </Translate>{" "}
            <a href={signupUrl} className={styles.link}>
              <Translate id="auth.login.signUpLink">Sign up</Translate>
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
