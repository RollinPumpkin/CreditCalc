# 🏦 CreditCalc - Modern Credit Calculator

A sophisticated, modern credit calculator web application built for BPR Adiarta's internship project. This application provides real-time loan calculations with a beautiful, user-friendly interface and powerful backend API.

## 🚀 Overview

CreditCalc is a full-stack web application that allows users to calculate loan payments using a custom formula designed specifically for banking operations. The application features a modern React frontend with shadcn/ui components and a robust Laravel backend API.

## ✨ Features

### 🎨 Frontend Features
- **Modern UI Design**: Built with Next.js, Tailwind CSS, and shadcn/ui components
- **Date-based Loan Terms**: Calendar picker for start and end dates with year selection dropdown
- **Real-time Calculations**: Instant calculation updates as users input data
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Professional Color Scheme**: Red-themed design matching banking industry standards
- **Input Validation**: Client-side validation with helpful error messages
- **Payment Schedule Table**: Detailed monthly payment breakdown

### ⚙️ Backend Features
- **Laravel 10 API**: RESTful API built with Laravel framework
- **Custom Loan Formula**: Specialized calculation formula: `(Interest Rate × Loan Amount) + (Loan Amount ÷ Loan Term)`
- **Smart Rounding**: Custom rounding system (1-500 → 500, 501-999 → next 1000)
- **Unlimited Loan Amounts**: No artificial limits on loan calculations
- **Data Persistence**: Store and retrieve calculation history
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Input Validation**: Server-side validation and error handling

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **date-fns** - Modern date utility library
- **Lucide React** - Beautiful icon library

### Backend
- **Laravel 10** - PHP web framework
- **PHP 8.2+** - Modern PHP features
- **MySQL** - Relational database
- **Eloquent ORM** - Database abstraction layer
- **Laravel Validation** - Input validation system

## 📦 Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18 or higher
- npm or yarn
- MySQL 8.0 or higher

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CreditCalc/backend
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database setup**
   ```bash
   # Configure database in .env file
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=creditcalc
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations**
   ```bash
   php artisan migrate
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

## 🧮 Loan Calculation Formula

The application uses a custom loan calculation formula designed for simplicity and transparency:

### Formula
```
Monthly Payment = (Interest Rate × Loan Amount) + (Loan Amount ÷ Loan Term)
```

### Example
For a loan of:
- **Amount**: Rp 10,000,000
- **Interest Rate**: 1.5% per month
- **Term**: 12 months

**Calculation:**
```
Interest Portion = 1.5% × 10,000,000 = 150,000
Principal Portion = 10,000,000 ÷ 12 = 833,333
Monthly Payment = 150,000 + 833,333 = 983,333
Rounded Result = 983,500 (using custom rounding)
```

### Custom Rounding Rules
- **1-500**: Round up to 500
- **501-999**: Round up to next 1000
- **Examples**: 983,333 → 983,500, 987,777 → 988,000

## 📊 API Documentation

### Calculate Loan
**POST** `/api/credit/calculate`

**Request Body:**
```json
{
  "loan_amount": 10000000,
  "interest_rate": 1.5,
  "loan_term_months": 12
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "loan_amount": 10000000,
    "interest_rate": 1.5,
    "loan_term_months": 12,
    "monthly_payment": 983500,
    "total_payment": 11802000,
    "total_interest": 1802000,
    "payment_schedule": [...]
  }
}
```

### Store Calculation
**POST** `/api/credit`

Saves the calculation to database with optional customer information.

## 🎯 Project Structure

```
CreditCalc/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/API/
│   │   │   └── CreditCalculatorController.php
│   │   └── Models/
│   │       └── CreditCalculation.php
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── CreditCalculator/
│   │   └── lib/
│   └── public/
└── README.md
```

## 🔧 Development

### Available Scripts (Frontend)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Available Commands (Backend)
- `php artisan serve` - Start development server
- `php artisan migrate` - Run database migrations
- `php artisan migrate:fresh` - Fresh migration
- `php artisan test` - Run tests

## 🌟 Key Features in Detail

### Date-based Loan Terms
Instead of traditional sliders, users can select:
- **Start Date**: When the loan begins
- **End Date**: When the loan ends
- **Year Dropdown**: Quick navigation to future years (2025-2075)
- **Auto-calculation**: Loan term automatically calculated from date range

### Smart User Interface
- **Professional Design**: Banking industry-appropriate color scheme
- **Responsive Layout**: Adapts to all screen sizes
- **Real-time Updates**: Calculations update as users type
- **Input Validation**: Prevents invalid data entry
- **Error Handling**: Clear error messages and recovery

### Advanced Calculation Engine
- **Custom Formula**: Tailored for specific banking needs
- **Smart Rounding**: User-friendly payment amounts
- **Payment Schedule**: Detailed month-by-month breakdown
- **Unlimited Amounts**: No artificial calculation limits

## 👨‍💻 Contributing

This project was developed as part of an internship program at BPR Adiarta. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is developed for BPR Adiarta's internship program. All rights reserved.

## 🏢 About BPR Adiarta

BPR Adiarta is a leading rural bank committed to providing innovative financial solutions. This credit calculator represents our commitment to digital transformation and improved customer service.

## 📞 Contact

For questions or support regarding this project:
- **Institution**: BPR Adiarta
- **Project Type**: Internship Project
- **Purpose**: Digital Banking Tools Development

---

**Built with ❤️ for BPR Adiarta's Digital Transformation Initiative**