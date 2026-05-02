"use client";

import { ConvexReactClient } from "convex/react";
import { readConvexDeploymentUrl } from "./convex-urls";

let _client: ConvexReactClient | null = null;

export function getConvexClient(): ConvexReactClient {
  if (!_client) {
    _client = new ConvexReactClient(readConvexDeploymentUrl(), {
      unsavedChangesWarning: false,
    });
  }
  return _client;
}
