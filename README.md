# Final Exam Grade Calculator

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Styled with Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare)](https://pages.cloudflare.com/)

A powerful and intuitive web application that helps students calculate what they need on their final exams to achieve their target grades. This tool provides comprehensive grade analysis, visualizations, and what-if scenarios to help students plan their study strategies effectively.

![Grade Calculator Screenshot](public/placeholder.jpg)

## 🌟 Features

- **Grade Calculation**: Calculate the minimum score needed on final exams to achieve target grades
- **Multiple Classes**: Track and manage grades for multiple courses simultaneously
- **Visual Analytics**: Interactive charts and graphs to visualize grade distributions and scenarios
- **What-If Scenarios**: See how different final exam scores would affect your overall grade
- **GPA Calculation**: Automatic GPA calculation based on current grades and credits
- **Data Import/Export**: Save and load your grade data with JSON export/import functionality
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing
- **Local Storage**: Your data is saved locally in your browser for privacy and convenience

## 🚀 Technologies Used

- **Frontend Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/) package manager

## 🛠️ Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/JSB2010/final-exam-grade-calculator.git
cd final-exam-grade-calculator
```

2. **Install dependencies**

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

3. **Run the development server**

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## 🔧 Usage

1. **Add your classes** by clicking the "Add Class" card
2. **Enter your current grades** and final exam weights for each class
3. **Set target grades** to see what you need to score on finals
4. **Explore the insights tab** for detailed grade analysis and visualizations
5. **Use the tables tab** to view comprehensive grade tables and what-if scenarios
6. **Customize settings** in the settings tab to adjust display preferences
7. **Export your data** to save your progress or share with others

## 📊 Grade Calculation Logic

The application uses the following formula to calculate the required score on a final exam:

```
Required Score = (Target Grade - (Current Grade × (1 - Final Weight/100))) / (Final Weight/100)
```

Where:
- **Target Grade**: The minimum grade you want to achieve in the class
- **Current Grade**: Your current grade before the final exam
- **Final Weight**: The percentage weight of the final exam in your overall grade

## 🚢 Deployment

### Deploying to Cloudflare Pages

1. **Fork or clone this repository** to your GitHub account

2. **Sign in to Cloudflare Pages** at [https://pages.cloudflare.com/](https://pages.cloudflare.com/)

3. **Create a new project** and connect your GitHub repository

4. **Configure your build settings**:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Environment variables**: Add any necessary environment variables

5. **Deploy your site** by clicking "Save and Deploy"

6. **Your site will be live** at the provided Cloudflare Pages URL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Next.js](https://nextjs.org/) for the React framework
- [Recharts](https://recharts.org/) for the charting library
- [Framer Motion](https://www.framer.com/motion/) for the animations
- [Lucide React](https://lucide.dev/) for the icons