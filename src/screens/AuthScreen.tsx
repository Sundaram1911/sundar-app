import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  loginWithEmail,
  loginWithMobile,
  loginWithGoogle,
  registerUser,
  skipLogin,
  fetchUserProfile,
} from "../store/slices/authSlice";
import { AppDispatch, RootState } from "../store";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("email");

  const [email, setEmail] = useState("sundaram@gmail.com");
  const [password, setPassword] = useState("Admin@123");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = () => {
    if (isLogin) {
      if (authMethod === "email") {
        dispatch(loginWithEmail({ email, password })).then((res: any) => {
          if (res.meta.requestStatus === "fulfilled") {
            dispatch(fetchUserProfile());
          }
        });
      } else {
        if (!otpSent) {
          setOtpSent(true); // Simulate sending OTP
        } else {
          dispatch(loginWithMobile({ mobile, otp }));
        }
      }
    } else {
      dispatch(registerUser({ email, name, password })).then((res: any) => {
        if (res.meta.requestStatus === "fulfilled") {
          dispatch(fetchUserProfile());
        }
      });
    }
  };

  const handleGoogleLogin = () => {
    dispatch(loginWithGoogle());
  };

  const handleSkip = () => {
    dispatch(skipLogin());
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.authLogo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to Apurva's App</Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Sign in to continue" : "Create a new account"}
          </Text>
        </View>

        {/* Tab Toggle for Login/Register */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text
              style={[
                styles.toggleText,
                isLogin && styles.toggleTextActive,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text
              style={[
                styles.toggleText,
                !isLogin && styles.toggleTextActive,
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth Method Toggle (Only for Login) */}
        {isLogin && (
          <View style={styles.methodToggle}>
            <TouchableOpacity
              onPress={() => setAuthMethod("email")}
              style={authMethod === "email" ? styles.methodActive : null}
            >
              <Text style={[styles.methodText, authMethod === "email" && styles.methodTextActive]}>Email</Text>
            </TouchableOpacity>
            <Text style={styles.methodDivider}>|</Text>
            <TouchableOpacity
              onPress={() => setAuthMethod("mobile")}
              style={authMethod === "mobile" ? styles.methodActive : null}
            >
              <Text style={[styles.methodText, authMethod === "mobile" && styles.methodTextActive]}>Mobile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
          )}

          {isLogin && authMethod === "mobile" ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                editable={!otpSent}
              />
              {otpSent && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP (Use 1234)"
                  placeholderTextColor="#888"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                />
              )}
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isLogin
                  ? authMethod === "mobile" && !otpSent
                    ? "Get OTP"
                    : "Sign In"
                  : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <Text style={styles.orText}>OR</Text>
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Skip */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipBtnText}>Skip / Continue as Guest</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  authLogo: {
    height: 90,
    width: 180,
    marginBottom: 16,
    borderRadius: 100
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#111827",
  },
  methodToggle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  methodText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  methodTextActive: {
    color: "#ED4C67",
    fontWeight: "700",
  },
  methodActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#ED4C67",
    paddingBottom: 2,
  },
  methodDivider: {
    marginHorizontal: 16,
    color: "#D1D5DB",
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: "#ED4C67",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#ED4C67",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 12,
    textAlign: "center",
  },
  socialContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  orText: {
    color: "#6B7280",
    marginVertical: 16,
    fontWeight: "600",
  },
  googleBtn: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  skipBtn: {
    alignItems: "center",
    marginTop: 8,
  },
  skipBtnText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
