import { ErrorBoundary } from "@/components/error-boundary"
import GradeCalculator from "@/components/grade-calculator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
          Grade Calculator
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-300 mb-8">
          Calculate what you need on your finals to achieve your target grades
        </p>
        <ErrorBoundary>
          <GradeCalculator />
        </ErrorBoundary>
      </div>
    </main>
  )
}
