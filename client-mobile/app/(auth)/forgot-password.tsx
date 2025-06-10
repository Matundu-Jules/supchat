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
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().required("Email requis").email("Email invalide"),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const handleSubmit = async (values: { email: string }) => {
    try {
      await axios.post("http://localhost:3000/api/auth/forgot-password", {
        email: values.email,
      });
      Alert.alert(
        "Lien envoyé",
        "Un lien de réinitialisation a été envoyé à votre adresse email."
      );
      router.push("/(auth)/login");
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer le lien.");
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
              initialValues={{ email: "" }}
              validationSchema={forgotPasswordSchema}
              onSubmit={handleSubmit}
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
                  <Text style={styles.title}>Mot de passe oublié</Text>

                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#888"
                    style={[styles.input, { color: "#000" }]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonText}>Envoyer le lien</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/login")}
                  >
                    <Text style={styles.link}>← Retour à la connexion</Text>
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
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    color: "#000",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "80%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  link: {
    color: "#2563eb",
    marginTop: 16,
    textAlign: "center",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
