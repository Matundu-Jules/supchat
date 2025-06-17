import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Formik } from "formik";
import { registerSchema } from "../../utils/validation";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthService } from "../../services/authService";

export default function RegisterScreen() {
  const router = useRouter();

  const handleRegister = async (values: any) => {
    try {
      await AuthService.register({
        username: values.name,
        email: values.email,
        password: values.password,
      });
      router.replace("../workspace.tsx");
    } catch (err) {
      Alert.alert("Erreur", "Inscription échouée");
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
              source={require("../../assets/images/logo-supchat-primary.png")}
              style={{ width: 120, height: 120, resizeMode: "contain" }}
            />

            <Formik
              initialValues={{ name: "", email: "", password: "" }}
              validationSchema={registerSchema}
              onSubmit={handleRegister}
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
                  <Text style={styles.title}>Inscription</Text>

                  <TextInput
                    placeholder="Identifiant"
                    placeholderTextColor="#888"
                    style={[styles.input, { color: "#000" }]}
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.error}>{errors.name}</Text>
                  )}

                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#888"
                    style={[styles.input, { color: "#000" }]}
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}

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
                    onPress={() => router.push("/(auth)/login")}
                  >
                    <Text
                      style={{
                        marginTop: 20,
                        textAlign: "center",
                        color: "#60a5fa",
                      }}
                    >
                      Déjà un compte ?{" "}
                      <Text style={{ fontWeight: "bold" }}>Se connecter</Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonText}>S'inscrire</Text>
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
