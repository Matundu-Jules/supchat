// src/utils/validation.ts

import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .trim() // <-- SUPPRIME les espaces avant/après
    .required('Identifiant requis')
    .min(3, 'Identifiant trop court (3 caractères min.)')
    .max(24, 'Identifiant trop long (24 max.)')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "L'identifiant ne doit contenir que des lettres, chiffres, tirets ou underscores"
    ),
  email: yup
    .string()
    .trim()
    .required('Email requis')
    .email('Email invalide')
    .max(100, 'Email trop long (100 caractères max.)'),
  password: yup
    .string()
    .required('Mot de passe requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long (128 max.)')
    .matches(/[a-z]/, 'Au moins une minuscule')
    .matches(/[A-Z]/, 'Au moins une majuscule')
    .matches(/[0-9]/, 'Au moins un chiffre')
    .matches(/[@$!%*?&#]/, 'Au moins un caractère spécial (@$!%*?&#)')
    .matches(/^\S*$/, "Le mot de passe ne doit pas contenir d'espaces"),
});

export const loginSchema = yup.object().shape({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().required('Mot de passe requis'),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup.string().trim().required('Email requis').email('Email invalide'),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Mot de passe requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long (128 max.)')
    .matches(/[a-z]/, 'Au moins une minuscule')
    .matches(/[A-Z]/, 'Au moins une majuscule')
    .matches(/[0-9]/, 'Au moins un chiffre')
    .matches(/[@$!%*?&#]/, 'Au moins un caractère spécial (@$!%*?&#)')
    .matches(/^\S*$/, "Le mot de passe ne doit pas contenir d'espaces"),
  confirm: yup
    .string()
    .required('Confirmation requise')
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
});
