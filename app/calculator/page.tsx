import { ErrorBoundary } from "@/components/error-boundary"
import GradeCalculator from "@/components/grade-calculator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-blue-950">
      <div className="absolute inset-0 bg-grid-slate-200-50 dark:bg-grid-slate-800-20 bg-[size:var(--grid-size)_var(--grid-size)] [--grid-size:30px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
      
      <header className="relative z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">
            Final Exam Grade Calculator
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Calculate exactly what you need on your finals to achieve your target grades
          </p>
        </div>
        
        <ErrorBoundary>
          <GradeCalculator />
        </ErrorBoundary>
      </div>
      
      <footer className="border-t bg-background/80 backdrop-blur-md py-6 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GradeCalc Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Calculator
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
