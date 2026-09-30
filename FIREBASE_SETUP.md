# Firebase project for SkillMatch AI (provisioned 2026-09-30)

Project ID: skillmatch-ai-abdan
Display name: SkillMatch AI
Plan: Spark ($0/month)
Console: https://console.firebase.google.com/project/skillmatch-ai-abdan/overview

## Web app ("SkillMatch AI Web")
Firebase Hosting: NOT set up (frontend deploys to Vercel)
Google Analytics: OFF

const firebaseConfig = {
  apiKey: "AIzaSyAaRIAqrVDbVY9TRzR9RpmN9H-iUwWezBI",
  authDomain: "skillmatch-ai-abdan.firebaseapp.com",
  projectId: "skillmatch-ai-abdan",
  storageBucket: "skillmatch-ai-abdan.firebasestorage.app",
  messagingSenderId: "305032069495",
  appId: "1:305032069495:web:42dd22040b0e84c9382172"
};

## Services enabled
- Authentication: Email/Password sign-in ENABLED
- Cloud Firestore: created, Standard edition, database "(default)",
  location "asia-south1 (Mumbai)", production mode (private-by-default rules)

## Storage: NOT enabled
Firebase Storage now requires a billing account (Blaze plan) before the
default bucket can be created. Billing was NOT added (needs user approval).
Pending decision: upgrade to Blaze (pay-as-you-go, has free tier) OR have the
frontend upload resumes another way (e.g. store parsed resume data in
Firestore instead of raw files in Storage).
