# SplitFare

> A cross-platform React Native expense-splitting application with trip-based fare allocation, item-level dinner splitting, receipt OCR and payment-request workflows.

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-57-000020?logo=expo)](https://expo.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![OCR](https://img.shields.io/badge/OCR-Tesseract.js-orange)](https://tesseract.projectnaptha.com/)
[![Platform](https://img.shields.io/badge/Platform-Mobile_%2B_Web-purple)](#cross-platform-design)

**Developer:** Reamogetswe Molefe  
**Status:** Active Prototype

---

## Overview

**SplitFare** is a React Native / Expo application designed to make shared expenses easier to calculate and understand.

Instead of supporting only a basic equal split, the app includes two different calculation engines:

- **Trip Mode** — divides a transport fare according to how many stops each passenger travels.
- **Dinner Mode** — assigns individual bill items to specific people and automatically divides shared items.

Dinner Mode also includes experimental **receipt OCR**, allowing users to select an image of a receipt, detect item names and prices and import them into the bill.

After calculation, SplitFare generates a settlement summary showing exactly what each participant owes.

---

# The Problem

Shared expenses are rarely as simple as:

```text
Total ÷ Number of People
```

Examples:

- one passenger travels farther than another
- one person orders more food
- several people share one item
- one person pays the full bill upfront
- a restaurant receipt contains many different items
- everyone needs to know exactly what they owe

SplitFare explores a more flexible approach.

```text
Shared Expense
      │
      ▼
Choose Scenario
      │
 ┌────┴─────┐
 │          │
 ▼          ▼
Trip       Dinner
Mode       Mode
 │          │
 ▼          ▼
Stops      Items
 │          │
 ▼          ▼
Weighted   Assigned
Split      Split
 │          │
 └────┬─────┘
      ▼
Settlement Summary
      │
      ▼
Payment Request
```

---

# Technology Stack

## Application

- React Native
- React 19
- Expo
- JavaScript

## Mobile / Device Features

- Expo Image Picker
- Expo Clipboard
- Expo Font
- Expo Status Bar
- Ionicons

## OCR

- Tesseract.js
- Receipt text recognition
- Regex-based item and price parsing

## Payment UX

- QR code generation
- Payment-request screens
- Session-level payment method state

## Cross-Platform

- Android
- iOS
- Web

---

# Application Architecture

```text
                       SplitFare
                           │
                           ▼
                     App.js State
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Landing Screen      Trip Mode        Dinner Mode
                           │                  │
                           ▼                  ▼
                    Fare Algorithm      Item Assignment
                           │                  │
                           │             Receipt OCR
                           │                  │
                           └─────────┬────────┘
                                     ▼
                              Results Screen
                                     │
                                     ▼
                              Select Payer
                                     │
                                     ▼
                             Payment Screen
```

The application currently uses a lightweight screen-state architecture controlled from `App.js`.

This keeps the prototype simple while preserving state such as:

- active mode
- calculated results
- payer
- selected participant
- payment method

---

# Core Features

## Trip Mode

Trip Mode is designed for shared transport expenses.

Instead of splitting the fare equally, each passenger pays according to how far they travelled.

Users can:

- enter the total fare
- add trip stops
- add passengers to their destination stop
- remove passengers
- add or remove stops
- preview live calculations
- generate the final split

---

## Trip Fare Algorithm

Passengers travelling farther contribute more toward the total fare.

Each destination stop represents a number of travelled segments.

For example:

```text
Stop 1 → 1 travel unit
Stop 2 → 2 travel units
Stop 3 → 3 travel units
```

SplitFare calculates:

```text
Total Travel Units
        =
Sum of all passenger travel units
```

Then:

```text
Rate per Travel Unit
        =
Total Fare / Total Travel Units
```

Finally:

```text
Passenger Cost
        =
Passenger Travel Units × Rate per Travel Unit
```

---

## Example

Imagine a trip costs:

```text
R300
```

Three passengers leave at different stops:

```text
Passenger A → Stop 1
Passenger B → Stop 2
Passenger C → Stop 3
```

Total travel units:

```text
1 + 2 + 3 = 6
```

Rate per unit:

```text
R300 / 6 = R50
```

Final split:

```text
Passenger A → 1 × R50 = R50
Passenger B → 2 × R50 = R100
Passenger C → 3 × R50 = R150
```

Total:

```text
R50 + R100 + R150 = R300
```

This creates a distance-aware split without requiring every passenger to pay the same amount.

---

# Dinner Mode

Dinner Mode handles item-level restaurant or group expenses.

Users can:

- add guests
- add bill items
- enter individual prices
- assign items to one or more people
- automatically split shared items
- view live totals
- import items from a scanned receipt

---

## Item-Level Splitting

Each item tracks:

```text
Item name
Price
Assigned people
```

If an item is assigned to one person:

```text
Person pays full item price
```

If assigned to multiple people:

```text
Individual Share
      =
Item Price / Number of Assigned People
```

---

## Example

```text
Pizza        R180 → Alice + Bob
Burger       R120 → Charlie
Drinks        R90 → Alice + Bob + Charlie
```

The engine calculates each participant's share independently.

This avoids forcing the entire table into an equal split.

---

# Receipt OCR

One of SplitFare's experimental features is **receipt scanning**.

Dinner Mode allows a user to select a receipt image from their device.

The app then uses:

```text
Expo Image Picker
        │
        ▼
Receipt Image
        │
        ▼
Tesseract.js OCR
        │
        ▼
Recognised Text
        │
        ▼
Regex Parsing
        │
        ▼
Candidate Items + Prices
        │
        ▼
User Review
        │
        ▼
Import Selected Items
```

---

## Receipt Parsing

OCR output is processed line by line.

SplitFare searches for price patterns such as:

```text
R 49.99
49.99
49,99
```

The parser then attempts to separate:

```text
Item Name
Price
```

It filters common receipt metadata such as:

```text
Total
Subtotal
VAT
Tax
Balance
Change
Cash
Card
Invoice
Phone
Date
Time
```

Potential items are shown to the user before being added to the bill.

---

## Human-in-the-Loop OCR

OCR results are **not automatically trusted**.

Users can:

- review detected items
- deselect incorrect items
- choose which participants shared each item
- import only approved results

This design keeps the user in control because receipt OCR can be imperfect.

---

# OCR Limitations

Receipt recognition quality depends on factors such as:

- image resolution
- lighting
- receipt layout
- font quality
- faded thermal printing
- OCR recognition accuracy

The current parser uses heuristic regular expressions rather than a specialised receipt-understanding model.

Receipt scanning should therefore be treated as a convenience feature rather than guaranteed accounting-grade extraction.

---

# Live Split Preview

Both modes provide calculations before the final result is submitted.

This allows users to see how changes affect:

```text
Total bill
Passenger / guest totals
Rate per stop
Shared-item cost
Individual amount
```

before moving to the settlement screen.

---

# Results Screen

Once the calculation is completed, SplitFare creates a participant-level summary.

The screen displays:

- grand total
- selected payer
- individual participant totals
- calculation details
- settlement actions

Users can also identify who originally paid the total expense.

---

# Settlement Model

The app distinguishes between:

```text
What each person should contribute
```

and:

```text
Who actually paid the bill
```

This allows the interface to determine who should reimburse the payer.

Example:

```text
Total: R600

Alice paid: R600

Calculated shares:
Alice   → R200
Bob     → R200
Charlie → R200
```

Settlement:

```text
Bob     owes Alice R200
Charlie owes Alice R200
```

---

# Payment Request Experience

SplitFare includes a payment-request screen after a participant is selected.

The prototype contains payment UX foundations including:

- payer context
- amount due
- reusable payment-method state
- QR-based payment sharing
- clipboard interactions

The application currently focuses on generating the **payment-request experience** rather than moving real money.

---

# Important Payment Status

SplitFare is **not a payment processor**.

The current repository does not:

- transfer real funds
- connect directly to a bank
- settle PayShap transactions
- store bank balances
- hold customer money
- provide regulated payment services

Payment-related interfaces are prototype workflows intended to demonstrate the user experience around settling calculated expenses.

---

# Cross-Platform Design

SplitFare uses React Native and Expo so that the same application architecture can target:

```text
Android
iOS
Web
```

The web experience includes a dedicated landing page while mobile launches directly into the application flow.

---

# Responsive Web Experience

When running on the web, SplitFare detects larger screens and presents the application inside a mobile-sized frame.

```text
Desktop Browser
┌───────────────────────────────┐
│                               │
│       ┌───────────────┐       │
│       │               │       │
│       │   SplitFare   │       │
│       │     App       │       │
│       │               │       │
│       └───────────────┘       │
│                               │
└───────────────────────────────┘
```

This preserves the mobile-first experience while still making the application usable as a web demo.

---

# Landing Page

The web version includes a dedicated product landing experience.

It contains sections such as:

- product introduction
- interactive split demo
- use cases
- workflow explanation
- mobile product preview

The interactive demo lets users experiment with example expense splitting directly from the landing experience.

---

# Session State

SplitFare currently stores application state in memory.

Examples include:

```text
Current split mode
Participants
Calculated results
Selected payer
Selected payment method
```

Closing or resetting the active session clears this information.

The prototype does not currently require an account or backend database.

---

# Privacy by Simplicity

Because the current application does not use a remote backend for split data, ordinary session calculations remain inside the active application session.

The receipt OCR implementation processes the selected image through the application's OCR workflow rather than uploading it to a custom SplitFare backend.

A production implementation would require a more complete privacy and data-retention design.

---

# Project Structure

```text
splitfare-app/
│
├── assets/
│   ├── fonts/
│   ├── icon.png
│   ├── favicon.png
│   └── splash-icon.png
│
├── public/
│   └── index.html
│
├── scripts/
│   └── postexport.js
│
├── src/
│   ├── screens/
│   │   ├── DinnerScreen.js
│   │   ├── HomeScreen.js
│   │   ├── LandingScreen.js
│   │   ├── PaymentScreen.js
│   │   ├── ResultsScreen.js
│   │   └── TripScreen.js
│   │
│   └── styles/
│       └── theme.js
│
├── App.js
├── index.js
├── app.json
├── package.json
└── README.md
```

---

# Application Flow

```text
Web
 │
 ▼
Landing Page
 │
 ▼
Create Group
 │
 ▼
Home
 │
 ├───────────────┐
 ▼               ▼
Trip Mode     Dinner Mode
 │               │
 │          ┌────┴─────┐
 │          │          │
 │          ▼          ▼
 │       Manual      Receipt
 │       Items        OCR
 │          │          │
 └──────────┴────┬─────┘
                 ▼
              Results
                 │
                 ▼
           Select Payer
                 │
                 ▼
          Payment Request
```

On native mobile platforms, the application starts directly from the app experience.

---

# Running Locally

## 1. Clone the Repository

```bash
git clone https://github.com/reamogetswemolefe0190-cmd/splitfare-app.git
cd splitfare-app
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start Expo

```bash
npm start
```

or:

```bash
npx expo start
```

---

## Run on Android

```bash
npm run android
```

---

## Run on iOS

```bash
npm run ios
```

---

## Run on Web

```bash
npm run web
```

---

# Web Export

Generate the web build using:

```bash
npm run predeploy
```

The project uses Expo's web exporter and then creates:

```text
.nojekyll
```

inside the output directory for GitHub Pages compatibility.

---

# GitHub Pages

The repository is configured with:

```text
https://reamogetswemolefe0190-cmd.github.io/splitfare-app/
```

as its web homepage target.

Deployment can be triggered with:

```bash
npm run deploy
```

---

# Dependencies

Key application dependencies include:

```text
expo
react
react-native
react-native-web

expo-image-picker
expo-clipboard
expo-font

tesseract.js

react-native-qrcode-svg
react-native-svg

@expo/vector-icons
```

---

# UI Design

SplitFare uses a dark mobile-first visual system.

Primary design characteristics include:

- dark backgrounds
- purple primary actions
- emerald financial accents
- compact cards
- clear hierarchy
- consistent spacing
- touch-friendly controls
- responsive layouts

Shared styles are centralised in:

```text
src/styles/theme.js
```

---

# Product Modes

| Feature | Trip Mode | Dinner Mode |
|---|---:|---:|
| Multiple participants | ✅ | ✅ |
| Weighted splitting | ✅ | ✅ |
| Live calculation preview | ✅ | ✅ |
| Individual contribution calculation | ✅ | ✅ |
| Multiple stops | ✅ | — |
| Item assignment | — | ✅ |
| Shared item division | — | ✅ |
| Receipt OCR | — | ✅ |
| Settlement summary | ✅ | ✅ |
| Payment request workflow | ✅ | ✅ |

---

# Engineering Concepts Demonstrated

SplitFare demonstrates practical work with:

```text
React Native
Expo
JavaScript
Cross-platform development
State management
Responsive UI
Business-rule modelling
Weighted calculations
Dynamic forms
OCR
Image input
Regex text parsing
Human-in-the-loop validation
QR generation
Payment UX
Component-based application design
Web export
GitHub Pages deployment
```

---

# Current Limitations

SplitFare is currently an application prototype.

Current limitations include:

- no user accounts
- no cloud database
- no cross-device synchronisation
- no real payment processing
- no transaction verification
- OCR accuracy varies between receipts
- session data is not permanently stored
- payment details are not connected to banking infrastructure

These boundaries are intentional while the product experience and underlying splitting logic are being explored.

---

# Future Development

Potential next stages include:

- persistent groups
- user accounts
- shared cloud sessions
- group invitations
- saved expenses
- transaction history
- stronger OCR parsing
- AI-assisted receipt understanding
- receipt image preprocessing
- real payment-provider sandbox integration
- settlement notifications
- automatic payment confirmation
- offline persistence
- automated testing
- backend API
- database integration

---

# What Makes SplitFare Different?

Many bill-splitting tools assume that everyone owes the same amount.

SplitFare instead experiments with different models depending on the situation.

### Transport

```text
Pay according to distance travelled.
```

### Restaurants

```text
Pay according to the items consumed.
```

### Shared Items

```text
Divide only between the people who shared them.
```

### Receipts

```text
Extract possible items automatically before user verification.
```

The calculation method adapts to the real-world expense instead of forcing every expense into one formula.

---

# About the Developer

## Reamogetswe Molefe

I am a Mechanical Engineering student at the **University of Johannesburg** who independently builds software across AI, fintech, SaaS and full-stack product development.

SplitFare was built as an exploration of cross-platform application development, financial UX and how simple algorithms can make everyday group expenses easier to understand.

Other projects include:

- **Kohort** — Python AI market-research engine with asynchronous multi-model orchestration
- **CreatorCashFlow** — Node.js / Express SaaS application for creator operations
- **Yieldly** — Next.js / TypeScript digital stokvel prototype
- **Zippy** — Flutter fintech prototype for merchant payments and social bill splitting

GitHub:

https://github.com/reamogetswemolefe0190-cmd

---

# Disclaimer

SplitFare is a software prototype.

It calculates expense allocations and provides payment-request UX, but it does not currently process or settle real financial transactions.

---

<p align="center">
  <strong>SplitFare</strong><br>
  Split the expense based on what actually happened.
</p>
