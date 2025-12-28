import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Keyboard,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { X, ImageIcon } from "lucide-react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { addPost, getUser } from "../../../utils/storage";
import { useRouter } from "expo-router";
import KeyboardAvoidingAnimatedView from "../../../components/KeyboardAvoidingAnimatedView";
