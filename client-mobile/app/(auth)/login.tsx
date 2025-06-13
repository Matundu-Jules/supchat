import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Formik } from "formik";
import { loginSchema } from "../../utils/validation";
import { useRouter } from "expo-router";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async (values: any) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: values.email,
          password: values.password,
        }
      );

      const token = (response.data as { token: string }).token; // selon la structure exacte de ta réponse
      await AsyncStorage.setItem("authToken", token);
      // Redirection après succès
      router.replace("../workspace.tsx");
    } catch (err) {
      Alert.alert("Erreur", "Email ou mot de passe invalide");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ alignItems: "center", marginTop: 30 }}>
            <Image
              source={require("../../assets/images/logo-couleur.png")}
              style={{ width: 120, height: 120, resizeMode: "contain" }}
            />
            <Image
              source={require("../../assets/images/logo-supchat-primary.png")}
              style={{ width: 120, height: 120, resizeMode: "contain" }}
            />

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.container}>
                  <Text style={styles.title}>Connexion</Text>

                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#888"
                    style={[styles.input, { color: "#000" }]}
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}

                  <View style={{ alignItems: "flex-end", marginBottom: 4 }}>
                    <TouchableOpacity
                      onPress={() => router.push("/(auth)/forgot-password")}
                    >
                      <Text style={{ color: "#60a5fa", fontSize: 12 }}>
                        Mot de passe oublié ?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    placeholder="Mot de passe"
                    placeholderTextColor="#888"
                    secureTextEntry
                    style={[styles.input, { color: "#000" }]}
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.error}>{errors.password}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonText}>Connexion</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/register")}
                  >
                    <Text
                      style={{
                        marginTop: 20,
                        textAlign: "center",
                        color: "#60a5fa",
                      }}
                    >
                      Pas encore de compte ?{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        Créer un compte
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", marginBottom: 8 },
});
