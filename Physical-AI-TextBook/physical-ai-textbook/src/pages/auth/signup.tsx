import React, { useState, FormEvent } from "react";
import { useHistory } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Translate, { translate } from "@docusaurus/Translate";
import { useAuth } from "../../contexts/AuthContext";
import styles from "../../components/AuthForms/styles.module.css";

export default function SignupPage(): React.ReactElement {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { signUpWithEmail, error, clearError } = useAuth();
  const history = useHistory();
  const loginUrl = useBaseUrl("/auth/login");
  const homeUrl = useBaseUrl("/");

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    // Validation
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signUpWithEmail(email, password, displayName);
      history.push(homeUrl);
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = validationError || error;

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>
          <Translate id="auth.signup.title">Create Account</Translate>
        </h1>
        <p className={styles.authSubtitle}>
          <Translate id="auth.signup.subtitle">
            Join us to access the complete Physical AI Textbook.
          </Translate>
        </p>

        {displayError && <div className={styles.error}>{displayError}</div>}

        <form className={styles.form} onSubmit={handleSignUp}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="displayName">
              <Translate id="auth.signup.nameLabel">Full Name</Translate>
            </label>
            <input
              id="displayName"
              type="text"
              className={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={translate({
                id: "auth.signup.namePlaceholder",
                message: "Enter your name",
              })}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              <Translate id="auth.signup.emailLabel">Email</Translate>
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={translate({
                id: "auth.signup.emailPlaceholder",
                message: "Enter your email",
              })}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              <Translate id="auth.signup.passwordLabel">Password</Translate>
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={translate({
                id: "auth.signup.passwordPlaceholder",
                message: "Create a password (min 6 characters)",
              })}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              <Translate id="auth.signup.confirmPasswordLabel">
                Confirm Password
              </Translate>
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={translate({
                id: "auth.signup.confirmPasswordPlaceholder",
                message: "Confirm your password",
              })}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              <Translate id="auth.signup.submitButton">
                Create Account
              </Translate>
            )}
          </button>
        </form>

        <div className={styles.links}>
          <span>
            <Translate id="auth.signup.hasAccount">
              Already have an account?
            </Translate>{" "}
            <a href={loginUrl} className={styles.link}>
              <Translate id="auth.signup.signInLink">Sign in</Translate>
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
