# SmartSpend

SmartSpend is an intelligent, user-friendly expense tracker designed to help you manage your finances, track spending habits, and achieve your saving goals.

## Features

### 📊 Interactive Dashboard
- **Financial Overview**: Get a real-time snapshot of your total balance, monthly income, expenses, and savings rate.
- **Visual Insights**: View your spending trends over time and see a breakdown of expenses by category using interactive charts.
- **Budget Alerts**: Instant notifications on the dashboard when you approach or exceed your category limits.

### 💳 Transaction Management
- **Smart Receipt Scanning**: Upload photos of your receipts to automatically extract merchant details, dates, and amounts using advanced AI processing.
- **Auto-Categorization**: The system intelligently suggests categories for your transactions based on merchant names.
- **Manual Entry**: Easily add income or expenses manually with a streamlined interface.
- **Search & Filter**: Quickly find specific transactions by merchant or category.

### 💰 Budget Planning
- **Category Limits**: Set monthly spending limits for specific categories (e.g., Food, Transport).
- **Progress Tracking**: Visual progress bars show exactly how much of your budget has been utilized.
- **Health Indicators**: Color-coded indicators (Green/Yellow/Red) let you know if you are on track or overspending.

### 🎯 Goal Tracking
- **Savings Goals**: Create custom goals for vacations, new cars, or emergency funds.
- **Visual Progress**: Watch your savings grow with dynamic progress bars.
- **Fund Management**: Easily allocate funds to or withdraw from specific goals.

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (for receipt parsing and categorization)

## Getting Started

### Prerequisites
- A modern web browser.
- A Google Cloud API Key for Gemini API features (Receipt Scanning & Categorization).

### Installation

1. Clone the repository.
2. Ensure you have the `index.html` and source files in the correct structure.
3. This project uses ES Modules via browser-native imports (no build step required for the demo version).
4. Serve the directory using a local web server (e.g., Live Server for VS Code, `python3 -m http.server`, or `npx serve`).

### Configuration

To enable the AI features:
1. Obtain an API Key from the Google AI developers platform.
2. The application expects the API key to be available in the environment as `process.env.API_KEY`.

## Usage

1. **Dashboard**: Start here to see your financial health at a glance.
2. **Transactions**: Go here to add your past and current expenses. Try the "Scan Receipt" button with an image of a receipt.
3. **Budgets**: Create budgets for your most frequent spending categories to keep yourself in check.
4. **Goals**: Set up a target amount for something you want to buy and track your contributions.

## License

MIT
