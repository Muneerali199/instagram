import { Redirect } from "expo-router";
import { useEffect } from "react";
import { initializeDemoData } from "../utils/storage";

export default function Index() {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return <Redirect href="/(tabs)/feed" />;
}
