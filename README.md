# APIBillingLedge-FullStack
APIBillingLedger is a full-stack SaaS-style dashboard designed for developers to manage their API keys, track usage in real-time, and handle billing through an automated invoicing system. Built with a modern tech stack, it features a sleek dark-themed UI and strict user data isolation.
# Features
-User Isolation: Data is strictly scoped to the logged-in user using unique storage prefixing.
-API Key Management: Securely generate, copy, and delete production-ready API keys.
-Usage Tracking: Real-time monitoring of "Copy Events" with a built-in rate limiter (Set to 10 copies).
-Automated Billing: Integrated payment modal that triggers once the usage limit is reached.
-Invoice System: Generate and download text-based invoices for all successful payments.
-Dynamic UI: Fully responsive dashboard with Dark/Light mode support.

#Tech Stack
-Frontend: React.js, Tailwind CSS, Lucide React (Icons)
-State Management: React Hooks (useState, useEffect)
-Persistence: Scoped LocalStorage for session-persistent data.
-Styling: Modern CSS-in-JS with a focus on Glassmorphism and dark aesthetics.
