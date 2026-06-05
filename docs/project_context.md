# CampusGenie Project Context

## Project Overview

CampusGenie is a phone-first AI-powered student operating system.

The platform helps students manage:

* assignments
* notes
* notices
* study plans
* AI chat
* voice assistant
* realtime sync

The app focuses on:

* mobile-first workflows
* AI-assisted productivity
* OCR-based extraction
* Office Kit laptop continuity

---

# Core Workflow

PHONE CAPTURES
↓
AI UNDERSTANDS
↓
TASKS GENERATED
↓
STUDY PLAN CREATED
↓
CONTINUE ON LAPTOP
↓
SYNC BACK TO PHONE

---

# Frontend Stack

* React
* Vite
* Tailwind CSS
* Shadcn UI
* Framer Motion
* Axios
* React Router

---

# Backend Stack

* Node.js
* Express
* MongoDB
* JWT Authentication
* Socket.io
* Multer
* Ollama Local AI

---

# Ollama Models

* qwen2.5:7b
* qwen2.5-coder:7b
* nomic-embed-text

---

# Important Rules

* Keep architecture modular
* Do not generate fake dashboard data
* Do not use placeholder analytics
* Build API-ready frontend
* Use scalable backend structure
* Keep mobile-first design
* Use async architecture
* Use reusable services/controllers/routes

---

# Main Features

## 1. Assignment Agent

Workflow:

* upload WhatsApp screenshot
* OCR extracts text
* AI extracts assignment info
* generate study plan
* save assignment

---

## 2. Notice Scanner

Workflow:

* capture notice image
* OCR extraction
* AI event detection
* calendar reminder generation

---

## 3. AI Chat

Features:

* study help
* assignment help
* productivity assistant
* markdown responses

---

## 4. Study Planner

AI-generated study roadmap.

---

## 5. Office Kit Sync

Phone
↓
Laptop Continuity
↓
Realtime Sync

---

# Backend Goals

Need:

* JWT auth
* REST APIs
* MongoDB models
* AI service layer
* OCR pipeline
* realtime sync
* scalable architecture

---

# Preferred Backend Structure

src/
├── controllers/
├── routes/
├── models/
├── services/
├── middleware/
├── sockets/
├── uploads/
├── config/
└── utils/
