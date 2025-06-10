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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .required("Mot de passe requis")
    .min(8, "8 caractères minimum")
    .matches(/[A-Z]/, "1 majuscule requise")
    .matches(/[a-z]/, "1 minuscule requise")
    .matches(/[0-9]/, "1 chiffre requis")
    .matches(/[!@#$%^&*]/, "1 caractère spécial requis"),
  confirm: Yup.string()
    .required("Confirmation requise")
    .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas"),
});

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();

  const handleSubmit = async (values: { password: string }) => {
    if (!token) return Alert.alert("Lien invalide", "Aucun token fourni.");
    try {
      await axios.post("http://localhost:3000/api/auth/reset-password", {
        token,
        password: values.password,
      });
      Alert.alert("Succès", "Mot de passe réinitialisé.");
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Erreur", "Échec de la réinitialisation.");
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
              initialValues={{ password: "", confirm: "" }}
              validationSchema={resetPasswordSchema}
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
                  <Text style={styles.title}>
                    Réinitialiser le mot de passe
                  </Text>

                  <TextInput
                    placeholder="Nouveau mot de passe"
                    placeholderTextColor="#888"
                    secureTextEntry
                    style={[styles.input, { color: "#000" }]}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.error}>{errors.password}</Text>
                  )}

                  <TextInput
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor="#888"
                    secureTextEntry
                    style={[styles.input, { color: "#000" }]}
                    onChangeText={handleChange("confirm")}
                    onBlur={handleBlur("confirm")}
                    value={values.confirm}
                  />
                  {touched.confirm && errors.confirm && (
                    <Text style={styles.error}>{errors.confirm}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleSubmit()}
                  >
                    <Text style={styles.buttonText}>Réinitialiser</Text>
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
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "80%",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", marginBottom: 8 },
  link: {
    color: "#2563eb",
    marginTop: 16,
    textAlign: "center",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
